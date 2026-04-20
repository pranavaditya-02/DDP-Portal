import express from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { z } from 'zod';
import onlineCourseService from '../services/onlineCourse.service';
import { logger } from '../utils/logger';

const router = express.Router();

const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || './uploads/students/online-courses');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const allowedFileTypes = new Set(
  (process.env.ALLOWED_FILE_TYPES || 'pdf,jpg,jpeg,png,doc,docx')
    .split(',')
    .map((type) => type.trim().toLowerCase())
    .filter(Boolean),
);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`);
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

const uploadHandler = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  upload.fields([
    { name: 'markSheetProof', maxCount: 1 },
    { name: 'fdpProof', maxCount: 1 },
    { name: 'apexProof', maxCount: 1 },
    { name: 'certificateProof', maxCount: 1 },
  ])(req, res, (err) => {
    if (err) {
      logger.warn('Online course upload validation failed:', err);
      const message = err instanceof Error ? err.message : 'Invalid file upload';
      return res.status(400).json({ error: message });
    }
    next();
  });
};

const onlineCourseSchema = z.object({
  taskID: z.string().trim().min(1),
  specialLabsInvolved: z.enum(['yes', 'no']).default('no'),
  specialLab: z.string().trim().optional(),
  modeOfCourse: z.enum(['Online', 'Offline', 'Hybrid']),
  courseType: z.string().trim().min(1),
  otherCourseType: z.string().trim().optional(),
  typeOfOrganizer: z.enum(['Private', 'Government']),
  courseName: z.string().trim().min(1),
  organizationName: z.string().trim().min(1),
  organizationAddress: z.string().trim().min(1),
  levelOfEvent: z.enum(['State', 'National', 'International']),
  duration: z.enum(['Hours', 'Weeks', 'Days']),
  numberOfHours: z.coerce.number().int().positive().optional(),
  numberOfWeeks: z.coerce.number().int().positive().optional(),
  numberOfDays: z.coerce.number().int().positive().optional(),
  startDate: z.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/),
  endDate: z.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/),
  courseCategory: z.enum([
    'Proctored-Exam',
    'Self-paced with final assessment',
    'Self-paced without final assessment',
  ]),
  dateOfExamination: z.string().regex(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/).optional(),
  gradeObtained: z.string().trim().optional(),
  isApprovedFDP: z.enum(['yes', 'no']).default('no'),
  typeOfSponsorship: z.enum(['Self', 'BIT', 'Funding Agency']),
  fundingAgencyName: z.string().trim().optional(),
  claimedFor: z.enum(['FAP', 'Competency', 'Not-Applicable']),
  iqacVerification: z.enum(['Initiated', 'Approved', 'Declined']).optional(),
});

const makeFullUrl = (req: express.Request, p?: string | null) => {
  if (!p) return null;
  if (!p.startsWith('/')) return p;
  const origin = `${req.protocol}://${req.get('host')}`;
  return `${origin}${p}`;
};

const transform = (req: express.Request, rec: any) => ({
  ...rec,
  marksheet_proof_url: makeFullUrl(req, rec?.marksheet_proof_url ?? null),
  fdp_proof_url: makeFullUrl(req, rec?.fdp_proof_url ?? null),
  apex_proof_url: makeFullUrl(req, rec?.apex_proof_url ?? null),
  certificate_proof_url: makeFullUrl(req, rec?.certificate_proof_url ?? null),
});

router.post('/', uploadHandler, async (req, res) => {
  try {
    const parsed = onlineCourseSchema.parse(req.body);
    const files = req.files as Record<string, Express.Multer.File[]> | undefined;

    const showExamFields =
      parsed.courseCategory === 'Proctored-Exam' ||
      parsed.courseCategory === 'Self-paced with final assessment';

    if (parsed.specialLabsInvolved === 'yes' && !parsed.specialLab) {
      return res.status(400).json({ error: 'specialLab is required when specialLabsInvolved is yes' });
    }

    if (parsed.duration === 'Hours' && !parsed.numberOfHours) {
      return res.status(400).json({ error: 'numberOfHours is required when duration is Hours' });
    }

    if (parsed.duration === 'Weeks' && !parsed.numberOfWeeks) {
      return res.status(400).json({ error: 'numberOfWeeks is required when duration is Weeks' });
    }

    if (parsed.duration === 'Days' && !parsed.numberOfDays) {
      return res.status(400).json({ error: 'numberOfDays is required when duration is Days' });
    }

    if (showExamFields) {
      if (!parsed.dateOfExamination) {
        return res.status(400).json({ error: 'dateOfExamination is required for selected courseCategory' });
      }
      if (!parsed.gradeObtained) {
        return res.status(400).json({ error: 'gradeObtained is required for selected courseCategory' });
      }
      if (!files?.markSheetProof?.[0]) {
        return res.status(400).json({ error: 'markSheetProof file is required for selected courseCategory' });
      }
    }

    if (parsed.isApprovedFDP === 'yes' && !files?.fdpProof?.[0]) {
      return res.status(400).json({ error: 'fdpProof file is required when isApprovedFDP is yes' });
    }

    if (parsed.typeOfSponsorship === 'BIT' && !files?.apexProof?.[0]) {
      return res.status(400).json({ error: 'apexProof file is required when typeOfSponsorship is BIT' });
    }

    if (parsed.typeOfSponsorship === 'Funding Agency' && !parsed.fundingAgencyName) {
      return res.status(400).json({ error: 'fundingAgencyName is required when typeOfSponsorship is Funding Agency' });
    }

    if (!files?.certificateProof?.[0]) {
      return res.status(400).json({ error: 'certificateProof file is required' });
    }

    if (new Date(parsed.startDate) > new Date(parsed.endDate)) {
      return res.status(400).json({ error: 'startDate cannot be after endDate' });
    }

    const markSheetProofUrl = files?.markSheetProof?.[0]
      ? `/uploads/students/online-courses/${files.markSheetProof[0].filename}`
      : null;
    const fdpProofUrl = files?.fdpProof?.[0]
      ? `/uploads/students/online-courses/${files.fdpProof[0].filename}`
      : null;
    const apexProofUrl = files?.apexProof?.[0]
      ? `/uploads/students/online-courses/${files.apexProof[0].filename}`
      : null;
    const certificateProofUrl = `/uploads/students/online-courses/${files.certificateProof[0].filename}`;

    const submission = await onlineCourseService.createSubmission({
      task_id: parsed.taskID,
      special_labs_involved: parsed.specialLabsInvolved,
      special_lab: parsed.specialLabsInvolved === 'yes' ? parsed.specialLab ?? null : null,
      mode_of_course: parsed.modeOfCourse,
      course_type: parsed.courseType,
      other_course_type: parsed.courseType === 'Other' ? parsed.otherCourseType ?? null : null,
      type_of_organizer: parsed.typeOfOrganizer,
      course_name: parsed.courseName,
      organization_name: parsed.organizationName,
      organization_address: parsed.organizationAddress,
      level_of_event: parsed.levelOfEvent,
      duration_unit: parsed.duration,
      number_of_hours: parsed.duration === 'Hours' ? parsed.numberOfHours ?? null : null,
      number_of_weeks: parsed.duration === 'Weeks' ? parsed.numberOfWeeks ?? null : null,
      number_of_days: parsed.duration === 'Days' ? parsed.numberOfDays ?? null : null,
      start_date: parsed.startDate,
      end_date: parsed.endDate,
      course_category: parsed.courseCategory,
      date_of_examination: showExamFields ? parsed.dateOfExamination ?? null : null,
      grade_obtained: showExamFields ? parsed.gradeObtained ?? null : null,
      is_approved_fdp: parsed.isApprovedFDP,
      type_of_sponsorship: parsed.typeOfSponsorship,
      funding_agency_name: parsed.typeOfSponsorship === 'Funding Agency' ? parsed.fundingAgencyName ?? null : null,
      claimed_for: parsed.claimedFor,
      marksheet_proof_url: markSheetProofUrl,
      fdp_proof_url: parsed.isApprovedFDP === 'yes' ? fdpProofUrl : null,
      apex_proof_url: parsed.typeOfSponsorship === 'BIT' ? apexProofUrl : null,
      certificate_proof_url: certificateProofUrl,
      iqac_verification: parsed.iqacVerification ?? 'Initiated',
    });

    return res.status(201).json({ message: 'Online course submission created successfully', submission: transform(req, submission) });
  } catch (error) {
    logger.error('Error creating online course submission:', error);
    if (error instanceof z.ZodError) {
      const message = error.errors.map((err) => err.message).join('; ');
      return res.status(400).json({ error: message || 'Invalid online course data' });
    }
    return res.status(500).json({ error: 'Failed to create online course submission' });
  }
});

router.get('/', async (req, res) => {
  try {
    const submissions = await onlineCourseService.listSubmissions();
    return res.json({ submissions: submissions.map((record) => transform(req, record)) });
  } catch (error) {
    logger.error('Error listing online course submissions:', error);
    return res.status(500).json({ error: 'Failed to list online course submissions' });
  }
});

router.get('/:id(\\d+)', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const submission = await onlineCourseService.getSubmissionById(id);
    if (!submission) {
      return res.status(404).json({ error: 'Online course submission not found' });
    }
    return res.json({ submission: transform(req, submission) });
  } catch (error) {
    logger.error('Error fetching online course submission:', error);
    return res.status(500).json({ error: 'Failed to fetch online course submission' });
  }
});

router.patch('/:id(\\d+)/iqac', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const parsed = z.object({ iqac_verification: z.enum(['Initiated', 'Approved', 'Declined']) }).parse(req.body);
    const submission = await onlineCourseService.updateIqacVerification(id, parsed.iqac_verification);
    if (!submission) {
      return res.status(404).json({ error: 'Online course submission not found' });
    }
    return res.json({ message: 'IQAC verification updated successfully', submission: transform(req, submission) });
  } catch (error) {
    logger.error('Error updating online course IQAC status:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors.map((err) => err.message).join('; ') });
    }
    return res.status(500).json({ error: 'Failed to update IQAC verification' });
  }
});

router.delete('/:id(\\d+)', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const deleted = await onlineCourseService.deleteSubmission(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Online course submission not found' });
    }
    return res.json({ message: 'Online course submission deleted successfully', id });
  } catch (error) {
    logger.error('Error deleting online course submission:', error);
    return res.status(500).json({ error: 'Failed to delete online course submission' });
  }
});

export default router;