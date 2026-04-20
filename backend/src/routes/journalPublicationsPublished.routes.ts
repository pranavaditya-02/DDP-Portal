import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import journalPublicationsPublishedService from '../services/journalPublicationsPublished.service';
import { logger } from '../utils/logger';

const router = express.Router();
const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || './uploads', 'journal-publications-published');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`),
});

const fileFilter = (_req: express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
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

const makeFullUrl = (req: express.Request, p?: string | null) => {
  if (!p) return null;
  if (!p.startsWith('/')) return p;
  const origin = `${req.protocol}://${req.get('host')}`;
  return `${origin}${p}`;
};

const normalizeInputDate = (value: unknown): string | unknown => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    const [day, month, year] = trimmed.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return trimmed;
};

const parseArrayOfNumbers = (value: unknown): number[] => {
  if (Array.isArray(value)) return value.map((item) => Number(item)).filter((num) => Number.isFinite(num));
  if (typeof value === 'string' && value.trim() !== '') {
    return value.split(',').map((item) => Number(item)).filter((num) => Number.isFinite(num));
  }
  return [];
};

const normalizeNullable = (value: unknown): unknown => {
  if (typeof value !== 'string') return value;
  return value.trim() === '' ? undefined : value;
};

const schema = z.object({
  faculty_name: z.string().trim().min(1).max(255),
  task_id: z.preprocess((value) => Number(value), z.number().int().positive()),
  nature_of_publication: z.enum(['Journal', 'Through Conference/Proceedings']),
  conference_name: z.string().trim().max(255).nullable().optional(),
  article_title: z.string().trim().min(1),
  journal_name: z.string().trim().min(1).max(255),
  publisher_name: z.string().trim().max(255).nullable().optional(),
  publication_type: z.union([z.literal('International'), z.literal('National')]).nullable().optional(),
  impact_factor: z.preprocess((value) => {
    if (typeof value === 'string' && value.trim() !== '') return Number(value);
    if (typeof value === 'number') return value;
    return null;
  }, z.number().finite().positive().nullable()).optional(),
  journal_h_index: z.preprocess((value) => {
    if (typeof value === 'string' && value.trim() !== '') return Number(value);
    if (typeof value === 'number') return value;
    return null;
  }, z.number().int().nonnegative().nullable()).optional(),
  scientific_journal_rankings: z.union([z.literal('Q1'), z.literal('Q2'), z.literal('Q3'), z.literal('Q4'), z.literal('NA')]).nullable().optional(),
  indexing: z.enum(['SCOPUS', 'SCI/SCIE/WOS', 'UGC CARE', 'OTHERS']).nullable().optional(),
  indexing_others_specify: z.string().trim().max(255).nullable().optional(),
  author_1: z.enum(['BIT Faculty', 'BIT Student', 'Institute -National', 'Institute - International', 'Industry', 'NA']).nullable().optional(),
  author_1_faculty_id: z.string().trim().max(50).nullable().optional(),
  author_1_student_id: z.string().trim().max(50).nullable().optional(),
  author_1_name: z.string().trim().max(255).nullable().optional(),
  author_1_designation_dept_address: z.string().trim().nullable().optional(),
  author_2: z.enum(['BIT Faculty', 'BIT Student', 'Institute -National', 'Institute - International', 'Industry', 'NA']).nullable().optional(),
  author_2_faculty_id: z.string().trim().max(50).nullable().optional(),
  author_2_student_id: z.string().trim().max(50).nullable().optional(),
  author_2_name: z.string().trim().max(255).nullable().optional(),
  author_2_designation_dept_address: z.string().trim().nullable().optional(),
  author_3: z.enum(['BIT Faculty', 'BIT Student', 'Institute -National', 'Institute - International', 'Industry', 'NA']).nullable().optional(),
  author_3_faculty_id: z.string().trim().max(50).nullable().optional(),
  author_3_student_id: z.string().trim().max(50).nullable().optional(),
  author_3_name: z.string().trim().max(255).nullable().optional(),
  author_3_designation_dept_address: z.string().trim().nullable().optional(),
  author_4: z.enum(['BIT Faculty', 'BIT Student', 'Institute -National', 'Institute - International', 'Industry', 'NA']).nullable().optional(),
  author_4_faculty_id: z.string().trim().max(50).nullable().optional(),
  author_4_student_id: z.string().trim().max(50).nullable().optional(),
  author_4_name: z.string().trim().max(255).nullable().optional(),
  author_4_designation_dept_address: z.string().trim().nullable().optional(),
  author_5: z.enum(['BIT Faculty', 'BIT Student', 'Institute -National', 'Institute - International', 'Industry', 'NA']).nullable().optional(),
  author_5_faculty_id: z.string().trim().max(50).nullable().optional(),
  author_5_student_id: z.string().trim().max(50).nullable().optional(),
  author_5_name: z.string().trim().max(255).nullable().optional(),
  author_5_designation_dept_address: z.string().trim().nullable().optional(),
  author_6: z.enum(['BIT Faculty', 'BIT Student', 'Institute -National', 'Institute - International', 'Industry', 'NA']).nullable().optional(),
  author_6_faculty_id: z.string().trim().max(50).nullable().optional(),
  author_6_student_id: z.string().trim().max(50).nullable().optional(),
  author_6_name: z.string().trim().max(255).nullable().optional(),
  author_6_designation_dept_address: z.string().trim().nullable().optional(),
  anna_university_annexure: z.union([z.literal('Yes'), z.literal('No')]).nullable().optional(),
  article_web_link: z.string().trim().max(512).nullable().optional(),
  doi: z.string().trim().max(255).nullable().optional(),
  volume_art_no: z.string().trim().max(50).nullable().optional(),
  issue_no: z.string().trim().max(50).nullable().optional(),
  page_number_from_to: z.string().trim().max(50).nullable().optional(),
  issn: z.string().trim().max(20).nullable().optional(),
  claimed_by: z.string().trim().max(255).nullable().optional(),
  author_position: z.union([z.literal('First'), z.literal('Second'), z.literal('Third'), z.literal('Fourth'), z.literal('Corresponding'), z.literal('NA')]).nullable().optional(),
  rd_verification: z.union([z.literal('Initiated'), z.literal('Approved'), z.literal('Rejected')]).nullable().optional(),
  sdg_goal_ids: z.preprocess(parseArrayOfNumbers, z.array(z.number().int().positive()).optional()),
});

router.post('/', upload.single('documentProof'), async (req, res) => {
  try {
    const rawBody = {
      ...req.body,
      faculty_name: req.body.faculty_name ?? req.body.facultyName ?? req.body.faculty,
      task_id: req.body.task_id ?? req.body.taskId,
      nature_of_publication: req.body.nature_of_publication ?? req.body.natureOfPublication,
      conference_name: normalizeNullable(req.body.conference_name ?? req.body.conferenceName),
      article_title: req.body.article_title ?? req.body.articleTitle,
      journal_name: req.body.journal_name ?? req.body.journalName,
      publisher_name: normalizeNullable(req.body.publisher_name ?? req.body.publisherName),
      publication_type: normalizeNullable(req.body.publication_type ?? req.body.publicationType),
      impact_factor: req.body.impact_factor ?? req.body.impactFactor,
      journal_h_index: req.body.journal_h_index ?? req.body.journalHIndex,
      scientific_journal_rankings: normalizeNullable(req.body.scientific_journal_rankings ?? req.body.scientificJournalRankings),
      indexing: normalizeNullable(req.body.indexing),
      indexing_others_specify: normalizeNullable(req.body.indexing_others_specify ?? req.body.otherIndexing),
      author_1: normalizeNullable(req.body.author_1 ?? req.body.author1),
      author_1_faculty_id: normalizeNullable(req.body.author_1_faculty_id ?? req.body.author1FacultyId),
      author_1_student_id: normalizeNullable(req.body.author_1_student_id ?? req.body.author1StudentId),
      author_1_name: normalizeNullable(req.body.author_1_name ?? req.body.author1Name),
      author_1_designation_dept_address: normalizeNullable(req.body.author_1_designation_dept_address ?? req.body.author1Designation),
      author_2: normalizeNullable(req.body.author_2 ?? req.body.author2),
      author_2_faculty_id: normalizeNullable(req.body.author_2_faculty_id ?? req.body.author2FacultyId),
      author_2_student_id: normalizeNullable(req.body.author_2_student_id ?? req.body.author2StudentId),
      author_2_name: normalizeNullable(req.body.author_2_name ?? req.body.author2Name),
      author_2_designation_dept_address: normalizeNullable(req.body.author_2_designation_dept_address ?? req.body.author2Designation),
      author_3: normalizeNullable(req.body.author_3 ?? req.body.author3),
      author_3_faculty_id: normalizeNullable(req.body.author_3_faculty_id ?? req.body.author3FacultyId),
      author_3_student_id: normalizeNullable(req.body.author_3_student_id ?? req.body.author3StudentId),
      author_3_name: normalizeNullable(req.body.author_3_name ?? req.body.author3Name),
      author_3_designation_dept_address: normalizeNullable(req.body.author_3_designation_dept_address ?? req.body.author3Designation),
      author_4: normalizeNullable(req.body.author_4 ?? req.body.author4),
      author_4_faculty_id: normalizeNullable(req.body.author_4_faculty_id ?? req.body.author4FacultyId),
      author_4_student_id: normalizeNullable(req.body.author_4_student_id ?? req.body.author4StudentId),
      author_4_name: normalizeNullable(req.body.author_4_name ?? req.body.author4Name),
      author_4_designation_dept_address: normalizeNullable(req.body.author_4_designation_dept_address ?? req.body.author4Designation),
      author_5: normalizeNullable(req.body.author_5 ?? req.body.author5),
      author_5_faculty_id: normalizeNullable(req.body.author_5_faculty_id ?? req.body.author5FacultyId),
      author_5_student_id: normalizeNullable(req.body.author_5_student_id ?? req.body.author5StudentId),
      author_5_name: normalizeNullable(req.body.author_5_name ?? req.body.author5Name),
      author_5_designation_dept_address: normalizeNullable(req.body.author_5_designation_dept_address ?? req.body.author5Designation),
      author_6: normalizeNullable(req.body.author_6 ?? req.body.author6),
      author_6_faculty_id: normalizeNullable(req.body.author_6_faculty_id ?? req.body.author6FacultyId),
      author_6_student_id: normalizeNullable(req.body.author_6_student_id ?? req.body.author6StudentId),
      author_6_name: normalizeNullable(req.body.author_6_name ?? req.body.author6Name),
      author_6_designation_dept_address: normalizeNullable(req.body.author_6_designation_dept_address ?? req.body.author6Designation),
      anna_university_annexure: normalizeNullable(req.body.anna_university_annexure ?? req.body.annaUniversityAnnexure),
      article_web_link: normalizeNullable(req.body.article_web_link ?? req.body.articleWebLink),
      doi: normalizeNullable(req.body.doi),
      volume_art_no: normalizeNullable(req.body.volume_art_no ?? req.body.volumeArtNo),
      issue_no: normalizeNullable(req.body.issue_no ?? req.body.issueNo),
      page_number_from_to: normalizeNullable(req.body.page_number_from_to ?? req.body.pageNumberFromTo),
      issn: normalizeNullable(req.body.issn),
      claimed_by: normalizeNullable(req.body.claimed_by ?? req.body.claimedBy),
      author_position: normalizeNullable(req.body.author_position ?? req.body.authorPosition),
      rd_verification: normalizeNullable(req.body.rd_verification ?? req.body.rdVerification),
      sdg_goal_ids: req.body['sdg_goal_ids[]'] ?? req.body.sdg_goal_ids ?? req.body.sdgGoalIds,
    };

    const parsed = schema.parse(rawBody);
    if (parsed.nature_of_publication === 'Through Conference/Proceedings' && !parsed.conference_name) {
      return res.status(400).json({ error: 'Conference name is required for Through Conference/Proceedings.' });
    }
    if (parsed.indexing === 'OTHERS' && !parsed.indexing_others_specify) {
      return res.status(400).json({ error: 'Please specify other indexing when Indexing is OTHERS.' });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'Document proof is required and must be a PDF file.' });
    }

    const document_proof_path = `/uploads/journal-publications-published/${file.filename}`;
    const publication = await journalPublicationsPublishedService.createPublication({
      ...parsed,
      document_proof_path,
    });

    return res.status(201).json({
      message: 'Journal publication published record created',
      publication: {
        ...publication,
        document_proof_path: makeFullUrl(req, publication.document_proof_path),
      },
    });
  } catch (err) {
    logger.error('Error creating published journal publication', err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors.map((error) => error.message).join('; ') });
    }
    return res.status(500).json({ error: 'Failed to create published journal publication' });
  }
});

router.get('/', async (_req, res) => {
  try {
    const publications = await journalPublicationsPublishedService.listPublications();
    const transformed = publications.map((publication) => ({
      ...publication,
      document_proof_path: makeFullUrl(_req, publication.document_proof_path),
    }));
    return res.json({ publications: transformed });
  } catch (err) {
    logger.error('Error listing published journal publications', err);
    return res.status(500).json({ error: 'Failed to list published journal publications' });
  }
});

router.get('/:id(\\d+)', async (req, res) => {
  try {
    const publicationId = Number(req.params.id);
    const publication = await journalPublicationsPublishedService.getPublicationById(publicationId);
    if (!publication) {
      return res.status(404).json({ error: 'Published journal publication not found' });
    }
    return res.json({ publication: {
      ...publication,
      document_proof_path: makeFullUrl(req, publication.document_proof_path),
    } });
  } catch (err) {
    logger.error('Error fetching published journal publication', err);
    return res.status(500).json({ error: 'Failed to fetch published journal publication' });
  }
});

export default router;
