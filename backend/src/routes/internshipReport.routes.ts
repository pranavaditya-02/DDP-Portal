import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import internshipReportService from '../services/internshipReport.service';
import { logger } from '../utils/logger';   
import { sendEmail } from '../utils/mailer';

const router = express.Router();

const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || './uploads/students/internships/reports');
const allowedFileTypes = new Set(
  (process.env.ALLOWED_FILE_TYPES || 'pdf,jpg,jpeg,png,docx,xlsx')
    .split(',')
    .map((type) => type.trim().toLowerCase())
    .filter(Boolean)
);
const INTERNSHIP_FILENAME_REGEX = /^[0-9]{7}[A-Z]{2}[0-9]{3}-internship-[0-9]{8}\.[a-zA-Z0-9]+$/i;

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
    while (reqAny._generated_filenames && reqAny._generated_filenames.has && false) {
      // noop (kept for safety in case of older deployments) - never used
      break;
    }
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
    fileSize: Number(process.env.MAX_FILE_SIZE || 10 * 1024 * 1024),
  },
  fileFilter: (_req, file, cb) => {
    const originalName = file.originalname.trim();
    const extension = path.extname(originalName).slice(1).toLowerCase();
    if (!allowedFileTypes.has(extension)) {
      return cb(new Error(`File type not allowed: .${extension}`));
    }
    if (!INTERNSHIP_FILENAME_REGEX.test(originalName)) {
      return cb(new Error('File name must be in the format RegNo-internship-YYYYMMDD, for example 7376251CS492-internship-04072026.pdf'));
    }
    return cb(null, true);
  },
});

const internshipReportSchema = z.object({
  student_id: z.preprocess((value) => Number(value), z.number().int().positive()),
  tracker_id: z.preprocess((value) => Number(value), z.number().int().positive()),
  special_lab_id: z.preprocess((value) => Number(value), z.number().int().positive()),
  year_of_study: z.preprocess((value) => Number(value), z.number().int().min(1).max(10)),
  sector: z.enum(['Government', 'Private']),
  industry_address_line_1: z.string().trim().min(1),
  industry_address_line_2: z.string().trim().optional().nullable(),
  city: z.string().trim().min(1),
  state: z.string().trim().min(1),
  postal_code: z.string().trim().min(1),
  country: z.string().trim().min(1),
  industry_website: z.string().url(),
  industry_contact_details: z.string().trim().min(1),
  referred_by: z.enum(['Alumni', 'Faculty', 'Others']),
  referee_name: z.string().trim().optional().nullable(),
  referee_mobile_number: z.string().trim().optional().nullable(),
  stipend_received: z.enum(['Yes', 'No']),
  stipend_amount: z.preprocess((value) => Number(value), z.number().nonnegative()).optional().default(0),
  is_through_aicte: z.enum(['Yes', 'No']),
  claim_type: z.enum(['Course Exemption', 'Reward Points']),
  sdg_goal_id: z.preprocess((value) => Number(value), z.number().int().positive()),
});

router.post(
  '/',
  upload.fields([
    { name: 'fullDocumentProof', maxCount: 1 },
    { name: 'originalCertificateProof', maxCount: 1 },
    { name: 'attestedCertificate', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const parsed = internshipReportSchema.parse(req.body);

      const files = req.files as Record<string, Express.Multer.File[]> | undefined;
      // Log received files for debugging duplicate/missing uploads
      logger.info('Received report upload files:', { keys: Object.keys(files || {}), filesSummary: Object.entries(files || {}).map(([k, arr]) => ({ field: k, count: arr.length, filenames: arr.map(f => f.filename) })) });

      const fullDocument = files?.fullDocumentProof?.[0] ?? null;
      const originalCertificate = files?.originalCertificateProof?.[0] ?? null;
      const attestedCertificate = files?.attestedCertificate?.[0] ?? null;

      if (!fullDocument || !originalCertificate || !attestedCertificate) {
        return res.status(400).json({ error: 'All required documents must be uploaded.' });
      }

      const fullDocumentProofUrl = `/uploads/students/internships/reports/${fullDocument.filename}`;
      const originalCertificateUrl = `/uploads/students/internships/reports/${originalCertificate.filename}`;
      const attestedCertificateUrl = `/uploads/students/internships/reports/${attestedCertificate.filename}`;

      const report = await internshipReportService.createReport({
        tracker_id: parsed.tracker_id,
        student_id: parsed.student_id,
        special_lab_id: parsed.special_lab_id,
        year_of_study: parsed.year_of_study,
        sector: parsed.sector,
        industry_address_line_1: parsed.industry_address_line_1,
        industry_address_line_2: parsed.industry_address_line_2 ?? null,
        city: parsed.city,
        state: parsed.state,
        postal_code: parsed.postal_code,
        country: parsed.country,
        industry_website: parsed.industry_website,
        industry_contact_details: parsed.industry_contact_details,
        referred_by: parsed.referred_by,
        referee_name: parsed.referred_by === 'Others' ? parsed.referee_name : null,
        referee_mobile_number: parsed.referred_by === 'Others' ? parsed.referee_mobile_number : null,
        stipend_received: parsed.stipend_received,
        stipend_amount: parsed.stipend_amount,
        is_through_aicte: parsed.is_through_aicte,
        claim_type: parsed.claim_type,
        sdg_goal_id: parsed.sdg_goal_id,
        full_document_proof_url: fullDocumentProofUrl,
        original_certificate_url: originalCertificateUrl,
        attested_certificate_url: attestedCertificateUrl,
      });

      return res.status(201).json({ message: 'Internship report created successfully', report });
    } catch (error) {
      logger.error('Error creating internship report:', error);
      if (error instanceof z.ZodError) {
        const message = error.errors
          .map((err) => (typeof err.message === 'string' ? err.message : JSON.stringify(err.message)))
          .join('; ');
        return res.status(400).json({ error: message || 'Invalid internship report data' });
      }
      return res.status(500).json({ error: 'Failed to create internship report', message: error instanceof Error ? error.message : undefined });
    }
  }
);

router.get('/', async (_req, res) => {
  try {
    const reports = await internshipReportService.listReports();
    return res.json({ reports });
  } catch (error) {
    logger.error('Error listing internship reports:', error);
    return res.status(500).json({ error: 'Failed to list internship reports' });
  }
});

router.patch(
  '/:reportId/iqac',
  async (req, res) => {
    try {
      const { reportId } = req.params;
      const { iqac_verification, reject_reason } = req.body;

      const parsed = z.object({
        iqac_verification: z.enum(['initiated', 'approved', 'declined']),
        reject_reason: z.string().trim().min(1).optional(),
      }).parse({ iqac_verification, reject_reason });

      if (parsed.iqac_verification === 'declined' && !parsed.reject_reason) {
        return res.status(400).json({ error: 'Reject reason is required when declining a report.' });
      }

      const searchId = Number(reportId);
      const existingReport = await internshipReportService.getReportByIdOrNumber(searchId);
      if (!existingReport) {
        return res.status(404).json({ error: 'Internship report not found' });
      }

      const report = await internshipReportService.updateIqacVerification(
        existingReport.id,
        parsed.iqac_verification,
        parsed.reject_reason,
      );

      if (!report) {
        return res.status(404).json({ error: 'Internship report not found' });
      }

      if (report.student_email && parsed.iqac_verification !== 'initiated') {
        const statusText = parsed.iqac_verification === 'approved' ? 'approved' : 'declined';
        const subject = `Internship Report ${statusText.toUpperCase()} | BannariAmman College IQAC`;
        const bodyText = `Hello ${report.student_name ?? 'Student'},\n\nYour internship report submission (ID: ${report.id}) has been ${statusText} by the IQAC team at BannariAmman College.\n\n${parsed.reject_reason ? `Reason: ${parsed.reject_reason}\n\n` : ''}If you have any questions, please reply to this email.\n\nIQAC Team\nSanthosh\n BannariAmman College`;
        const bodyHtml = `<p>Hello ${report.student_name ?? 'Student'},</p><p>Your internship report submission <strong>(ID: ${report.id})</strong> has been <strong>${statusText}</strong> by the IQAC team at <strong>BannariAmman College</strong>.</p>${parsed.reject_reason ? `<p><strong>Reason:</strong> ${parsed.reject_reason}</p>` : ''}<p>If you have any questions, please reply to this email.</p><p>IQAC Team<br/>BannariAmman College</p>`;

        try {
          await sendEmail({
            to: report.student_email,
            subject,
            text: bodyText,
            html: bodyHtml,
          });
        } catch (emailError) {
          logger.error('Failed to send internship report status email:', emailError);
        }
      }

      return res.json({ message: 'IQAC verification updated successfully', report });
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

router.get('/special-labs', async (_req, res) => {
  try {
    const labs = await internshipReportService.listSpecialLabs();
    return res.json({ specialLabs: labs });
  } catch (error) {
    logger.error('Error listing special labs:', error);
    return res.status(500).json({ error: 'Failed to list special labs' });
  }
});

router.get('/sdg-goals', async (_req, res) => {
  try {
    const goals = await internshipReportService.listSdgGoals();
    return res.json({ sdgGoals: goals });
  } catch (error) {
    logger.error('Error listing SDG goals:', error);
    return res.status(500).json({ error: 'Failed to list SDG goals' });
  }
});

router.get('/:reportId(\\d+)', async (req, res) => {
  try {
    const reportId = Number(req.params.reportId);
    const report = await internshipReportService.getReportByIdOrNumber(reportId);
    if (!report) {
      return res.status(404).json({ error: 'Internship report not found' });
    }
    return res.json({ report });
  } catch (error) {
    logger.error('Error fetching internship report by ID:', error);
    return res.status(500).json({ error: 'Failed to fetch internship report' });
  }
});

export default router;
