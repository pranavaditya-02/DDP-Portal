import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import journalPublicationsAppliedService from '../services/journalPublicationsApplied.service';
import { logger } from '../utils/logger';
const router = express.Router();
const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || './uploads/journal-publications-applied');
if (!fs.existsSync(uploadDir))
    fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`),
});
const fileFilter = (_req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
        return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
};
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: Number(process.env.MAX_FILE_SIZE || 10 * 1024 * 1024) },
});
const makeFullUrl = (req, p) => {
    if (!p)
        return null;
    if (!p.startsWith('/'))
        return p;
    const origin = `${req.protocol}://${req.get('host')}`;
    return `${origin}${p}`;
};
const schema = z.object({
    faculty_id: z.string().trim().min(1).max(50),
    indexing_type: z.enum(['SCOPUS', 'SCI/SCIE/WOS', 'UGC CARE', 'OTHERS']),
    indexing_others_specify: z.preprocess((value) => {
        if (value === '' || value === undefined)
            return null;
        return String(value);
    }, z.string().trim().max(255).nullable()).optional(),
    journal_name: z.string().trim().min(1).max(255),
    submitted_journal_title: z.string().trim().min(1),
    submitted_date: z.string().refine((value) => /^\\d{4}-\\d{2}-\\d{2}$/.test(String(value)), { message: 'Invalid date format, expected YYYY-MM-DD' }),
    publication_status: z.enum(['Submitted', 'Under Review', 'Accepted for Publication', 'Rejected for Publication']).optional(),
});
router.post('/', upload.single('proofFile'), async (req, res) => {
    try {
        const parsed = schema.parse(req.body);
        if (parsed.indexing_type === 'OTHERS' && !parsed.indexing_others_specify) {
            return res.status(400).json({ error: 'Please specify the other indexing when indexing type is OTHERS.' });
        }
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'Proof document is required and must be a PDF file.' });
        }
        const proof_document_path = `/uploads/journal-publications-applied/${file.filename}`;
        const publication = await journalPublicationsAppliedService.createPublication({
            faculty_id: parsed.faculty_id,
            indexing_type: parsed.indexing_type,
            indexing_others_specify: parsed.indexing_type === 'OTHERS' ? parsed.indexing_others_specify : null,
            journal_name: parsed.journal_name,
            submitted_journal_title: parsed.submitted_journal_title,
            submitted_date: parsed.submitted_date,
            proof_document_path,
            publication_status: parsed.publication_status ?? 'Submitted',
        });
        return res.status(201).json({
            message: 'Journal publication created',
            publication: {
                ...publication,
                proof_document_path: makeFullUrl(req, publication.proof_document_path),
            },
        });
    }
    catch (err) {
        logger.error('Error creating journal publication', err);
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: err.errors.map((error) => error.message).join('; ') });
        }
        return res.status(500).json({ error: 'Failed to create journal publication' });
    }
});
router.get('/', async (_req, res) => {
    try {
        const publications = await journalPublicationsAppliedService.listPublications();
        const transformed = publications.map((publication) => ({
            ...publication,
            proof_document_path: makeFullUrl(_req, publication.proof_document_path),
        }));
        return res.json({ publications: transformed });
    }
    catch (err) {
        logger.error('Error listing journal publications', err);
        return res.status(500).json({ error: 'Failed to list journal publications' });
    }
});
router.get('/:id(\\d+)', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const publication = await journalPublicationsAppliedService.getPublicationById(id);
        if (!publication) {
            return res.status(404).json({ error: 'Journal publication not found' });
        }
        return res.json({ publication: {
                ...publication,
                proof_document_path: makeFullUrl(req, publication.proof_document_path),
            } });
    }
    catch (err) {
        logger.error('Error fetching journal publication', err);
        return res.status(500).json({ error: 'Failed to fetch journal publication' });
    }
});
export default router;
