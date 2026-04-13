import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import internshipTrackerService from '../services/internshipTracker.service';
import { logger } from '../utils/logger';
import { sendEmail } from '../utils/mailer';

const router = express.Router();

// Helper to build full URL for stored relative upload paths using request origin
const makeFullUrl = (req: express.Request, p?: string | null) => {
  if (!p) return null;
  if (!p.startsWith('/')) return p;
  const origin = `${req.protocol}://${req.get('host')}`;
  return `${origin}${p}`;
};

const transformTrackerForResponse = (req: express.Request, tracker: any) => ({
  ...tracker,
  aim_objectives_link: makeFullUrl(req, tracker?.aim_objectives_link ?? null),
  offer_letter_link: makeFullUrl(req, tracker?.offer_letter_link ?? null),
});

const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || './uploads/students/internships/tracker');
const allowedFileTypes = new Set(
  (process.env.ALLOWED_FILE_TYPES || 'pdf,jpg,jpeg,png,docx,xlsx')
    .split(',')
    .map((type) => type.trim().toLowerCase())
    .filter(Boolean)
);
const INTERNSHIP_FILENAME_REGEX = /^[0-9]{7}[A-Z]{2}[0-9]{3}-(?:internship-[0-9]{8}|ITI-[0-9]{2}\.[0-9]{2}\.[0-9]{4})\.[a-zA-Z0-9]+$/i;
const INTERNSHIP_FILENAME_ERROR =
  'File name must be in the expected format, for example 7376251CS492-internship-04072026.pdf or 201CS111-ITI-08.06.2025.pdf.';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    // Ensure generated filenames are unique within this request (avoid collisions across fields)
    const reqAny = _req as any;
    if (!reqAny._generatedFilenames) reqAny._generatedFilenames = new Set<string>();
    const makeCandidate = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}-${safeName}`;
    let candidate = makeCandidate();
    while (reqAny._generatedFilenames.has(candidate)) {
      candidate = makeCandidate();
    }
    reqAny._generatedFilenames.add(candidate);
    cb(null, candidate);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: Number(process.env.MAX_FILE_SIZE || 5 * 1024 * 1024),
  },
  fileFilter: (_req, file, cb) => {
    const originalName = file.originalname.trim();
    const extension = path.extname(originalName).slice(1).toLowerCase();
    if (!allowedFileTypes.has(extension)) {
      return cb(new Error(`File type not allowed: .${extension}`));
    }
    if (!INTERNSHIP_FILENAME_REGEX.test(originalName)) {
      return cb(new Error(INTERNSHIP_FILENAME_ERROR));
    }
    return cb(null, true);
  },
});

const uploadHandler = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  upload.fields([
    { name: 'aimObjectiveFile', maxCount: 1 },
    { name: 'offerLetterFile', maxCount: 1 },
  ])(req, res, (err) => {
    if (err) {
      logger.warn('File upload validation failed:', err);
      const message = err instanceof Error ? err.message : 'Invalid file upload';
      return res.status(400).json({ error: message });
    }
    next();
  });
};

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
    }, z.enum(['initiated', 'approved', 'declined']))
    .optional()
    .default('initiated'),
});

router.post('/', uploadHandler, async (req, res) => {
    try {
      const parsed = internshipTrackerSchema.parse(req.body);

      const files = req.files as Record<string, Express.Multer.File[]> | undefined;
      const aimFile = files?.aimObjectiveFile?.[0] ?? null;
      const offerFile = files?.offerLetterFile?.[0] ?? null;

      const aimObjectivesLink = aimFile ? `/uploads/students/internships/tracker/${aimFile.filename}` : null;
      const offerLetterLink = offerFile ? `/uploads/students/internships/tracker/${offerFile.filename}` : null;

      const tracker = await internshipTrackerService.createTracker({
        student_id: parsed.student_id,
        industry_id: parsed.industry_id,
        start_date: parsed.start_date,
        end_date: parsed.end_date,
        iqac_verification: parsed.iqac_verification,
        aim_objectives_link: aimObjectivesLink,
        offer_letter_link: offerLetterLink,
      });

      return res.status(201).json({ message: 'Internship tracker created successfully', tracker: transformTrackerForResponse(req, tracker) });
    } catch (error) {
      logger.error('Error creating internship tracker:', error);
      if (error instanceof z.ZodError) {
        const message = error.errors
          .map((err) => typeof err.message === 'string' ? err.message : JSON.stringify(err.message))
          .join('; ');
        return res.status(400).json({ error: message || 'Invalid internship tracker data' });
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
      const { iqac_verification, reject_reason } = req.body;

      const parsed = z.object({
        iqac_verification: z.enum(['initiated', 'approved', 'declined']),
        reject_reason: z.string().trim().min(1).optional(),
      }).parse({ iqac_verification, reject_reason });

      if (parsed.iqac_verification === 'declined' && !parsed.reject_reason) {
        return res.status(400).json({ error: 'Reject reason is required when declining a tracker.' });
      }

      const searchId = Number(trackerId);
      const existingTracker = await internshipTrackerService.getTrackerByIdOrNumber(searchId);
      if (!existingTracker) {
        return res.status(404).json({ error: 'Internship tracker not found' });
      }

      const tracker = await internshipTrackerService.updateIqacVerification(
        existingTracker.id,
        parsed.iqac_verification,
        parsed.reject_reason,
      );

      if (!tracker) {
        return res.status(404).json({ error: 'Internship tracker not found' });
      }

      if (tracker.student_email && parsed.iqac_verification !== 'initiated') {
        const statusText = parsed.iqac_verification === 'approved' ? 'approved' : 'declined';
        const subject = `Internship Tracker ${statusText.toUpperCase()} | BannariAmman College IQAC`;
        const bodyText = `Hello ${tracker.student_name ?? 'Student'},\n\nYour internship tracker submission (ID: ${tracker.id}) has been ${statusText} by the IQAC team at BannariAmman College.\n\n${parsed.reject_reason ? `Reason: ${parsed.reject_reason}\n\n` : ''}If you have any questions, please reply to this email.\n\nIQAC Team\nSanthosh\n BannariAmman College`;
        const bodyHtml = `<p>Hello ${tracker.student_name ?? 'Student'},</p><p>Your internship tracker submission <strong>(ID: ${tracker.id})</strong> has been <strong>${statusText}</strong> by the IQAC team at <strong>BannariAmman College</strong>.</p>${parsed.reject_reason ? `<p><strong>Reason:</strong> ${parsed.reject_reason}</p>` : ''}<p>If you have any questions, please reply to this email.</p><p>IQAC Team<br/>BannariAmman College</p>`;

        try {
          await sendEmail({
            to: tracker.student_email,
            subject,
            text: bodyText,
            html: bodyHtml,
          });
        } catch (emailError) {
          logger.error('Failed to send internship tracker status email:', emailError);
        }
      }

      return res.json({ message: 'IQAC verification updated successfully', tracker: transformTrackerForResponse(req, tracker) });
    } catch (error) {
      logger.error('Error updating IQAC verification:', error);
      if (error instanceof z.ZodError) {
        const message = error.errors
          .map((err) => typeof err.message === 'string' ? err.message : JSON.stringify(err.message))
          .join('; ');
        return res.status(400).json({ error: message || 'Invalid IQAC verification data' });
      }
      return res.status(500).json({ error: 'Failed to update IQAC verification', message: error instanceof Error ? error.message : undefined });
    }
  }
);

router.get('/', async (_req, res) => {
  try {
    const trackers = await internshipTrackerService.listTrackers();
    return res.json({ trackers: trackers.map((t) => transformTrackerForResponse(_req, t)) });
  } catch (error) {
    logger.error('Error listing internship trackers:', error);
    return res.status(500).json({ error: 'Failed to list internship trackers' });
  }
});

router.get('/student/:studentId/approved', async (req, res) => {
  try {
    const studentId = Number(req.params.studentId);
    if (!Number.isInteger(studentId) || studentId <= 0) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    const trackers = await internshipTrackerService.listApprovedTrackersByStudent(studentId);
      return res.json({ trackers: trackers.map((t) => transformTrackerForResponse(req, t)) });
  } catch (error) {
    logger.error('Error listing approved student trackers:', error);
    return res.status(500).json({ error: 'Failed to list approved trackers' });
  }
});

router.get('/:trackerId(\\d+)', async (req, res) => {
  try {
    const trackerId = Number(req.params.trackerId);
    const tracker = await internshipTrackerService.getTrackerByIdOrNumber(trackerId);
    if (!tracker) {
      return res.status(404).json({ error: 'Internship tracker not found' });
    }
    return res.json({ tracker: transformTrackerForResponse(req, tracker) });
  } catch (error) {
    logger.error('Error fetching internship tracker by ID:', error);
    return res.status(500).json({ error: 'Failed to fetch internship tracker' });
  }
});

export default router;
