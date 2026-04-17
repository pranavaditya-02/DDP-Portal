import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import patentReportService from '../services/patentReport.service';
import { logger } from '../utils/logger';
const router = express.Router();
const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || './uploads/students/patents/reports');
if (!fs.existsSync(uploadDir))
    fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`),
});
const upload = multer({ storage, limits: { fileSize: Number(process.env.MAX_FILE_SIZE || 10 * 1024 * 1024) } });
const makeFullUrl = (req, p) => {
    if (!p)
        return null;
    if (!p.startsWith('/'))
        return p;
    const origin = `${req.protocol}://${req.get('host')}`;
    return `${origin}${p}`;
};
const schema = z.object({
    student_id: z.preprocess((v) => Number(v), z.number().int().positive()),
    patent_status: z.enum(['filed', 'published', 'granted']),
    position_of_student: z.preprocess((v) => v === '' || v === undefined ? null : Number(v), z.union([z.number().int().positive(), z.null()])).optional(),
    is_academic_project: z.preprocess((v) => {
        if (v === 'yes' || v === 'true' || v === true)
            return true;
        if (v === 'no' || v === 'false' || v === false)
            return false;
        return undefined;
    }, z.boolean().optional()),
    patent_tracker_id: z.preprocess((v) => v === '' || v === undefined ? null : Number(v), z.union([z.number().int().positive(), z.null()])).optional(),
    level: z.preprocess((v) => v === '' || v === undefined ? null : String(v), z.union([z.literal('national'), z.literal('international'), z.null()])).optional(),
    is_early_publication_filed: z.preprocess((v) => (v === 'yes' || v === 'true') ? true : (v === 'no' || v === 'false') ? false : undefined, z.boolean().optional()),
    is_examination_filed: z.preprocess((v) => (v === 'yes' || v === 'true') ? true : (v === 'no' || v === 'false') ? false : undefined, z.boolean().optional()),
    patent_license_details: z.string().trim().optional().nullable(),
    funding_agency: z.string().trim().optional().nullable(),
    funds_received: z.preprocess((v) => (v === 'yes' || v === 'true') ? true : (v === 'no' || v === 'false') ? false : undefined, z.boolean().optional()),
    fund_amount: z.preprocess((v) => v === '' || v === undefined ? null : Number(v), z.number().optional().nullable()),
    is_interdisciplinary: z.preprocess((v) => (v === 'yes' || v === 'true') ? true : (v === 'no' || v === 'false') ? false : undefined, z.boolean().optional()),
    other_dept_name: z.string().trim().optional().nullable(),
    other_dept_student_count: z.preprocess((v) => v === '' || v === undefined ? null : Number(v), z.number().int().optional().nullable()),
    registration_date: z.string().optional().nullable(),
    application_number: z.string().trim().optional().nullable(),
    sdg_goals_id: z.preprocess((v) => v === '' || v === undefined ? null : Number(v), z.union([z.number().int().positive(), z.null()])).optional(),
    faculty_1: z.string().trim().optional().nullable(),
    faculty_2: z.string().trim().optional().nullable(),
    faculty_3: z.string().trim().optional().nullable(),
    faculty_4: z.string().trim().optional().nullable(),
});
router.post('/', upload.fields([
    { name: 'yuktiProof', maxCount: 1 },
    { name: 'fullDocumentProof', maxCount: 1 },
    { name: 'cbrReceipt', maxCount: 1 },
    { name: 'publicationProof', maxCount: 1 },
    { name: 'grantedProof', maxCount: 1 },
]), async (req, res) => {
    try {
        const parsed = schema.parse(req.body);
        const files = req.files;
        const yukti = files?.yuktiProof?.[0] ?? null;
        const fullDoc = files?.fullDocumentProof?.[0] ?? null;
        const cbr = files?.cbrReceipt?.[0] ?? null;
        const publication = files?.publicationProof?.[0] ?? null;
        const granted = files?.grantedProof?.[0] ?? null;
        // Basic required checks similar to frontend expectations
        if (!yukti)
            return res.status(400).json({ error: 'Yukti proof is required.' });
        if (parsed.patent_status === 'filed' && !fullDoc)
            return res.status(400).json({ error: 'Full document proof required for filed status.' });
        if (parsed.patent_status === 'filed' && !cbr)
            return res.status(400).json({ error: 'CBR receipt required for filed status.' });
        if (parsed.patent_status === 'published' && !publication)
            return res.status(400).json({ error: 'Publication proof required for published status.' });
        if (parsed.patent_status === 'granted' && !granted)
            return res.status(400).json({ error: 'Granted proof required for granted status.' });
        const yuktiUrl = yukti ? `/uploads/students/patents/reports/${yukti.filename}` : null;
        const fullDocUrl = fullDoc ? `/uploads/students/patents/reports/${fullDoc.filename}` : null;
        const cbrUrl = cbr ? `/uploads/students/patents/reports/${cbr.filename}` : null;
        const publicationUrl = publication ? `/uploads/students/patents/reports/${publication.filename}` : null;
        const grantedUrl = granted ? `/uploads/students/patents/reports/${granted.filename}` : null;
        const report = await patentReportService.createReport({
            student_id: parsed.student_id,
            patent_status: parsed.patent_status,
            position_of_student: parsed.position_of_student ?? null,
            is_academic_project: parsed.is_academic_project ?? false,
            faculty_id_1: parsed.faculty_1 ?? null,
            faculty_id_2: parsed.faculty_2 ?? null,
            faculty_id_3: parsed.faculty_3 ?? null,
            faculty_id_4: parsed.faculty_4 ?? null,
            registration_date: parsed.registration_date ?? null,
            application_number: parsed.application_number ?? null,
            sdg_goals_id: parsed.sdg_goals_id ?? null,
            patent_tracker_id: parsed.patent_tracker_id ?? null,
            level: parsed.level ?? null,
            is_early_publication_filed: parsed.is_early_publication_filed ?? null,
            is_examination_filed: parsed.is_examination_filed ?? null,
            patent_license_details: parsed.patent_license_details ?? null,
            funding_agency: parsed.funding_agency ?? null,
            funds_received: parsed.funds_received ?? null,
            fund_amount: parsed.fund_amount ?? null,
            is_interdisciplinary: parsed.is_interdisciplinary ?? null,
            other_dept_name: parsed.other_dept_name ?? null,
            other_dept_student_count: parsed.other_dept_student_count ?? null,
            yukti_proof_url: yuktiUrl,
            full_document_proof_url: fullDocUrl,
            cbr_receipt_url: cbrUrl,
            publication_proof_url: publicationUrl,
            granted_proof_url: grantedUrl,
        });
        // transform URLs to full
        const transformed = {
            ...report,
            yukti_proof_url: makeFullUrl(req, report.yukti_proof_url ?? null),
            full_document_proof_url: makeFullUrl(req, report.full_document_proof_url ?? null),
            cbr_receipt_url: makeFullUrl(req, report.cbr_receipt_url ?? null),
            publication_proof_url: makeFullUrl(req, report.publication_proof_url ?? null),
            granted_proof_url: makeFullUrl(req, report.granted_proof_url ?? null),
        };
        return res.status(201).json({ message: 'Patent report created', report: transformed });
    }
    catch (err) {
        logger.error('Error creating patent report', err);
        if (err instanceof z.ZodError)
            return res.status(400).json({ error: err.errors.map(e => e.message).join('; ') });
        return res.status(500).json({ error: 'Failed to create patent report' });
    }
});
router.get('/', async (_req, res) => {
    try {
        const list = await patentReportService.listReports();
        return res.json({ reports: list });
    }
    catch (err) {
        logger.error('Error listing patent reports', err);
        return res.status(500).json({ error: 'Failed to list patent reports' });
    }
});
router.get('/:id(\\d+)', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const rec = await patentReportService.getReportById(id);
        if (!rec)
            return res.status(404).json({ error: 'Patent report not found' });
        const transformed = {
            ...rec,
            yukti_proof_url: makeFullUrl(req, rec.yukti_proof_url ?? null),
            full_document_proof_url: makeFullUrl(req, rec.full_document_proof_url ?? null),
            cbr_receipt_url: makeFullUrl(req, rec.cbr_receipt_url ?? null),
            publication_proof_url: makeFullUrl(req, rec.publication_proof_url ?? null),
            granted_proof_url: makeFullUrl(req, rec.granted_proof_url ?? null),
        };
        return res.json({ report: transformed });
    }
    catch (err) {
        logger.error('Error fetching patent report', err);
        return res.status(500).json({ error: 'Failed to fetch patent report' });
    }
});
export default router;
