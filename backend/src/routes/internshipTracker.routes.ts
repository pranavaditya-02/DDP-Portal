import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import internshipTrackerService from '../services/internshipTracker.service';
import { logger } from '../utils/logger';

const router = express.Router();

const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || './uploads');
const allowedFileTypes = new Set(
  (process.env.ALLOWED_FILE_TYPES || 'pdf,jpg,jpeg,png,docx,xlsx')
    .split(',')
    .map((type) => type.trim().toLowerCase())
    .filter(Boolean)
);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: Number(process.env.MAX_FILE_SIZE || 5 * 1024 * 1024),
  },
  fileFilter: (_req, file, cb) => {
    const extension = path.extname(file.originalname).slice(1).toLowerCase();
    if (!allowedFileTypes.has(extension)) {
      return cb(new Error(`File type not allowed: .${extension}`));
    }
    return cb(null, true);
  },
});

const internshipTrackerSchema = z.object({
  student_id: z.preprocess((value) => Number(value), z.number().int().positive()),
  industry_id: z.preprocess((value) => Number(value), z.number().int().positive()),
  start_date: z.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/, 'Expected YYYY-MM-DD'),
  end_date: z.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/, 'Expected YYYY-MM-DD'),
  iqac_verification: z
    .preprocess((value) => {
      if (typeof value === 'string') {
        return value.toLowerCase();
      }
      return value;
    }, z.enum(['initiated', 'inprogress', 'completed']))
    .optional()
    .default('initiated'),
});

router.post(
  '/',
  upload.fields([
    { name: 'aimObjectiveFile', maxCount: 1 },
    { name: 'offerLetterFile', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const parsed = internshipTrackerSchema.parse(req.body);

      const files = req.files as Record<string, Express.Multer.File[]> | undefined;
      const aimFile = files?.aimObjectiveFile?.[0] ?? null;
      const offerFile = files?.offerLetterFile?.[0] ?? null;

      const aimObjectivesLink = aimFile ? `/uploads/${aimFile.filename}` : null;
      const offerLetterLink = offerFile ? `/uploads/${offerFile.filename}` : null;

      const tracker = await internshipTrackerService.createTracker({
        student_id: parsed.student_id,
        industry_id: parsed.industry_id,
        start_date: parsed.start_date,
        end_date: parsed.end_date,
        iqac_verification: parsed.iqac_verification,
        aim_objectives_link: aimObjectivesLink,
        offer_letter_link: offerLetterLink,
      });

      return res.status(201).json({ message: 'Internship tracker created successfully', tracker });
    } catch (error) {
      logger.error('Error creating internship tracker:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      return res.status(500).json({ error: 'Failed to create internship tracker', message: error instanceof Error ? error.message : undefined });
    }
  }
);

router.patch(
  '/:trackerId/iqac',
  async (req, res) => {
    try {
      const { trackerId } = req.params;
      const { iqac_verification } = req.body;

      const parsed = z.object({
        iqac_verification: z.enum(['initiated', 'inprogress', 'completed']),
      }).parse({ iqac_verification });

      const tracker = await internshipTrackerService.updateIqacVerification(
        Number(trackerId),
        parsed.iqac_verification
      );

      if (!tracker) {
        return res.status(404).json({ error: 'Internship tracker not found' });
      }

      return res.json({ message: 'IQAC verification updated successfully', tracker });
    } catch (error) {
      logger.error('Error updating IQAC verification:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      return res.status(500).json({ error: 'Failed to update IQAC verification', message: error instanceof Error ? error.message : undefined });
    }
  }
);

router.get('/', async (_req, res) => {
  try {
    const trackers = await internshipTrackerService.listTrackers();
    return res.json({ trackers });
  } catch (error) {
    logger.error('Error listing internship trackers:', error);
    return res.status(500).json({ error: 'Failed to list internship trackers' });
  }
});

export default router;
