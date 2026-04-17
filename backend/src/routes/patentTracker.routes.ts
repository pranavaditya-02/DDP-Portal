import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import patentTrackerService from '../services/patentTracker.service';
import { logger } from '../utils/logger';

const router = express.Router();

const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || './uploads/students/patents/tracker');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`),
});

const upload = multer({ storage, limits: { fileSize: Number(process.env.MAX_FILE_SIZE || 5 * 1024 * 1024) } });

const makeFullUrl = (req: express.Request, p?: string | null) => {
  if (!p) return null;
  if (!p.startsWith('/')) return p;
  const origin = `${req.protocol}://${req.get('host')}`;
  return `${origin}${p}`;
};

const transform = (req: express.Request, rec: any) => ({
  ...rec,
  experimentation_file_path: makeFullUrl(req, rec?.experimentation_file_path ?? null),
  drawings_file_path: makeFullUrl(req, rec?.drawings_file_path ?? null),
  forms_file_path: makeFullUrl(req, rec?.forms_file_path ?? null),
});

const schema = z.object({
  student_id: z.preprocess((v) => Number(v), z.number().int().positive()),
  second_student_id: z.preprocess((v) => v === undefined || v === '' ? null : Number(v), z.union([z.number().int().positive(), z.null()])).optional(),
  third_student_id: z.preprocess((v) => v === undefined || v === '' ? null : Number(v), z.union([z.number().int().positive(), z.null()])).optional(),
  fourth_student_id: z.preprocess((v) => v === undefined || v === '' ? null : Number(v), z.union([z.number().int().positive(), z.null()])).optional(),
  fifth_student_id: z.preprocess((v) => v === undefined || v === '' ? null : Number(v), z.union([z.number().int().positive(), z.null()])).optional(),
  sixth_student_id: z.preprocess((v) => v === undefined || v === '' ? null : Number(v), z.union([z.number().int().positive(), z.null()])).optional(),
  seventh_student_id: z.preprocess((v) => v === undefined || v === '' ? null : Number(v), z.union([z.number().int().positive(), z.null()])).optional(),
  eighth_student_id: z.preprocess((v) => v === undefined || v === '' ? null : Number(v), z.union([z.number().int().positive(), z.null()])).optional(),
  ninth_student_id: z.preprocess((v) => v === undefined || v === '' ? null : Number(v), z.union([z.number().int().positive(), z.null()])).optional(),
  tenth_student_id: z.preprocess((v) => v === undefined || v === '' ? null : Number(v), z.union([z.number().int().positive(), z.null()])).optional(),
  patent_contribution: z.enum(['Applicant', 'Inventor']),
  patent_title: z.string().min(1),
  applicants_involved: z.enum(['BIT students only','BIT student along with faculty','BIT student along with external institutions']),
  faculty_id: z.string().optional(),
  patent_type: z.enum(['Product/Process','Design']),
  has_image_layout_support: z.enum(['Yes','No']).optional(),
  has_formatted_drawings: z.enum(['Yes','No']).optional(),
  forms_1_and_2_prepared: z.enum(['Yes','No']).optional(),
  iqac_verification: z.enum(['Initiated','Approved','Declined']).optional(),
});

router.post('/', upload.fields([
  { name: 'experimentationFile', maxCount: 1 },
  { name: 'drawingsFile', maxCount: 1 },
  { name: 'formsFile', maxCount: 1 },
]), async (req, res) => {
  try {
    const parsed = schema.parse(req.body);
    const files = req.files as Record<string, Express.Multer.File[]> | undefined;
    const expFile = files?.experimentationFile?.[0] ?? null;
    const drawingsFile = files?.drawingsFile?.[0] ?? null;
    const formsFile = files?.formsFile?.[0] ?? null;

    const experimentation_file_path = expFile ? `/uploads/students/patents/tracker/${expFile.filename}` : null;
    const drawings_file_path = drawingsFile ? `/uploads/students/patents/tracker/${drawingsFile.filename}` : null;
    const forms_file_path = formsFile ? `/uploads/students/patents/tracker/${formsFile.filename}` : null;

    const tracker = await patentTrackerService.createTracker({
      student_id: parsed.student_id,
      second_student_id: parsed.second_student_id ?? null,
      third_student_id: parsed.third_student_id ?? null,
      fourth_student_id: parsed.fourth_student_id ?? null,
      fifth_student_id: parsed.fifth_student_id ?? null,
      sixth_student_id: parsed.sixth_student_id ?? null,
      seventh_student_id: parsed.seventh_student_id ?? null,
      eighth_student_id: parsed.eighth_student_id ?? null,
      ninth_student_id: parsed.ninth_student_id ?? null,
      tenth_student_id: parsed.tenth_student_id ?? null,
      patent_contribution: parsed.patent_contribution,
      patent_title: parsed.patent_title,
      applicants_involved: parsed.applicants_involved,
      faculty_id: parsed.faculty_id && String(parsed.faculty_id).trim().length > 0 ? String(parsed.faculty_id).trim() : null,
      patent_type: parsed.patent_type,
      has_image_layout_support: parsed.has_image_layout_support ?? 'No',
      experimentation_file_path,
      has_formatted_drawings: parsed.has_formatted_drawings ?? 'No',
      drawings_file_path,
      forms_1_and_2_prepared: parsed.forms_1_and_2_prepared ?? 'No',
      forms_file_path,
      iqac_verification: parsed.iqac_verification ?? 'Initiated',
    });

    return res.status(201).json({ message: 'Patent tracker created', tracker: transform(req, tracker) });
  } catch (err) {
    logger.error('Error creating patent tracker', err);
    if (err instanceof z.ZodError) {
      const message = err.errors.map(e => e.message).join('; ');
      return res.status(400).json({ error: message });
    }
    return res.status(500).json({ error: 'Failed to create patent tracker' });
  }
});

router.get('/', async (req, res) => {
  try {
    const list = await patentTrackerService.listTrackers();
    return res.json({ trackers: list.map((t) => transform(req, t)) });
  } catch (err) {
    logger.error('Error listing patent trackers', err);
    return res.status(500).json({ error: 'Failed to list patent trackers' });
  }
});

router.get('/:id(\\d+)', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const t = await patentTrackerService.getTrackerByIdOrNumber(id);
    if (!t) return res.status(404).json({ error: 'Patent tracker not found' });
    return res.json({ tracker: transform(req, t) });
  } catch (err) {
    logger.error('Error fetching patent tracker', err);
    return res.status(500).json({ error: 'Failed to fetch patent tracker' });
  }
});

router.patch('/:id(\\d+)/iqac', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const body = z.object({
      iqac_verification: z.preprocess((v) => typeof v === 'string' ? v.toLowerCase() : v, z.enum(['initiated','approved','declined'])),
      reject_reason: z.string().trim().min(1).optional(),
    }).parse(req.body);

    const iqacValue = body.iqac_verification === 'initiated' ? 'Initiated' : body.iqac_verification === 'approved' ? 'Approved' : 'Declined';

    if (iqacValue === 'Declined' && !body.reject_reason) {
      return res.status(400).json({ error: 'Reject reason is required when declining a tracker.' });
    }

    const existing = await patentTrackerService.getTrackerByIdOrNumber(id);
    if (!existing) return res.status(404).json({ error: 'Patent tracker not found' });

    // update verification; if declined, store reject reason
    const updated = await patentTrackerService.updateIqacVerification(existing.id, iqacValue as any, body.reject_reason ?? null);
    if (!updated) return res.status(404).json({ error: 'Patent tracker not found' });

    // send email to student if email available and not initiated
    const studentEmail = (updated as any).student_email;
    if (studentEmail && body.iqac_verification !== 'initiated') {
      const statusText = body.iqac_verification === 'approved' ? 'approved' : 'declined';
      const subject = `Patent Tracker ${statusText.toUpperCase()} | BannariAmman College IQAC`;
      const bodyText = `Hello ${(updated as any).student_name ?? 'Student'},\n\nYour patent tracker submission (ID: ${updated.id}) has been ${statusText} by the IQAC team at BannariAmman College.\n\n${body.reject_reason ? `Reason: ${body.reject_reason}\n\n` : ''}If you have any questions, please reply to this email.\n\nIQAC Team\nBannariAmman College`;
      const bodyHtml = `<p>Hello ${(updated as any).student_name ?? 'Student'},</p><p>Your patent tracker submission <strong>(ID: ${updated.id})</strong> has been <strong>${statusText}</strong> by the IQAC team at <strong>BannariAmman College</strong>.</p>${body.reject_reason ? `<p><strong>Reason:</strong> ${body.reject_reason}</p>` : ''}<p>If you have any questions, please reply to this email.</p><p>IQAC Team<br/>BannariAmman College</p>`;

      try {
        const { sendEmail } = await import('../utils/mailer');
        await sendEmail({ to: studentEmail, subject, text: bodyText, html: bodyHtml });
      } catch (emailErr) {
        logger.error('Failed to send patent tracker status email:', emailErr);
      }
    }

    return res.json({ message: 'IQAC verification updated', tracker: transform(req, updated) });
  } catch (err) {
    logger.error('Error updating IQAC for patent tracker', err);
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors.map(e => e.message).join('; ') });
    return res.status(500).json({ error: 'Failed to update IQAC' });
  }
});

export default router;
