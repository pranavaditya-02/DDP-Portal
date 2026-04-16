import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import studentsIndustrialVisitService from '../services/studentsIndustrialVisit.service';
import submissionService from '../services/submission.service';
import { sendEmail } from '../utils/emailService';
import { logger } from '../utils/logger';

const router = Router();

// Multer configuration for file uploads
const uploadDir = path.join(process.cwd(), 'uploads', 'students-industrial-visit');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, PNG are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// POST - Create new StudentIndustrialVisit
router.post('/', upload.single('proofDocument'), async (req: Request, res: Response) => {
  try {
    const { submissionId, ...data } = req.body;

    if (!submissionId) {
      return res.status(400).json({ error: 'submissionId is required' });
    }

    // Validate dates if provided
    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
      }

      if (endDate <= startDate) {
        return res.status(400).json({ error: 'endDate must be after startDate' });
      }
    }

    const visitData = {
      submissionId: parseInt(submissionId),
      industryName: data.industryName || null,
      programmeLevel: data.programmeLevel || null,
      domainArea: data.domainArea || null,
      industryTypeId: data.industryTypeId || null,
      ifTypeOthers: data.ifTypeOthers || null,
      industryLocation: data.industryLocation || null,
      industryWebsite: data.industryWebsite || null,
      contactPersonName: data.contactPersonName || null,
      contactDesignation: data.contactDesignation || null,
      contactEmail: data.contactEmail || null,
      contactPhone: data.contactPhone || null,
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      purposeOfVisit: data.purposeOfVisit || null,
      numStudentsVisited: data.numStudentsVisited || null,
      numMaleStudents: data.numMaleStudents || null,
      numFemaleStudents: data.numFemaleStudents || null,
      yearOfStudyId: data.yearOfStudyId || null,
      sourceOfArrangementId: data.sourceOfArrangementId || null,
      curriculumMapping: data.curriculumMapping || null,
      outcome: data.outcome || null,
      proofId: req.file ? 1 : null,
    };

    const visitId = await studentsIndustrialVisitService.create(visitData);
    res.status(201).json({ id: visitId, ...visitData });
  } catch (error) {
    logger.error('Error creating StudentIndustrialVisit:', error);
    res.status(500).json({ error: 'Failed to create StudentIndustrialVisit' });
  }
});

// GET - List all StudentIndustrialVisits with pagination
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 10;

    const filters = {
      submissionId: req.query.submissionId ? parseInt(req.query.submissionId as string) : undefined,
      iqacVerification: req.query.iqacVerification as string | undefined,
    };

    const { records, total } = await studentsIndustrialVisitService.list(filters, page, pageSize);
    res.json({ data: records, total, page, pageSize });
  } catch (error) {
    logger.error('Error fetching StudentIndustrialVisits:', error);
    res.status(500).json({ error: 'Failed to fetch StudentIndustrialVisits' });
  }
});

// GET - Fetch single StudentIndustrialVisit by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const visit = await studentsIndustrialVisitService.getById(id);

    if (!visit) {
      return res.status(404).json({ error: 'StudentIndustrialVisit not found' });
    }

    res.json(visit);
  } catch (error) {
    logger.error('Error fetching StudentIndustrialVisit:', error);
    res.status(500).json({ error: 'Failed to fetch StudentIndustrialVisit' });
  }
});

// PUT - Update StudentIndustrialVisit
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { industryName, ...otherData } = req.body;

    const updated = await studentsIndustrialVisitService.update(id, {
      industryName: industryName || undefined,
      ...otherData,
    });

    if (!updated) {
      return res.status(404).json({ error: 'StudentIndustrialVisit not found' });
    }

    const updatedRecord = await studentsIndustrialVisitService.getById(id);
    res.json(updatedRecord);
  } catch (error) {
    logger.error('Error updating StudentIndustrialVisit:', error);
    res.status(500).json({ error: 'Failed to update StudentIndustrialVisit' });
  }
});

// DELETE - Delete StudentIndustrialVisit
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await studentsIndustrialVisitService.delete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'StudentIndustrialVisit not found' });
    }

    res.json({ message: 'StudentIndustrialVisit deleted successfully' });
  } catch (error) {
    logger.error('Error deleting StudentIndustrialVisit:', error);
    res.status(500).json({ error: 'Failed to delete StudentIndustrialVisit' });
  }
});

// PUT - Update IQAC status and send email
router.put('/:id/iqac-status', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { iqacVerification, iqacRemarks } = req.body;

    if (!iqacVerification || !['approved', 'rejected', 'initiated'].includes(iqacVerification)) {
      return res.status(400).json({ error: 'Valid iqacVerification status is required' });
    }

    // Get visit data with faculty email
    const visit = await studentsIndustrialVisitService.getByIdWithSubmission(id);
    if (!visit) {
      return res.status(404).json({ error: 'StudentIndustrialVisit not found' });
    }

    // Update IQAC status
    const updated = await studentsIndustrialVisitService.update(id, {
      iqacVerification,
      iqacRemarks: iqacRemarks || null,
    });

    if (!updated) {
      return res.status(500).json({ error: 'Failed to update IQAC status' });
    }

    // Send email asynchronously if faculty email exists
    if (visit.facultyEmail) {
      const mailPromise = (async () => {
        try {
          const emailSubject = `IQAC Status Update - Students Industrial Visit - ${iqacVerification.toUpperCase()}`;
          const emailBody = `
Dear ${visit.facultyName || 'Faculty'},

Your StudentIndustrialVisit submission has been ${iqacVerification}.

Details:
- Industry: ${visit.industryName || 'N/A'}
- Start Date: ${visit.startDate || 'N/A'}
- End Date: ${visit.endDate || 'N/A'}
- Purpose: ${visit.purposeOfVisit || 'N/A'}
- Number of Students: ${visit.numStudentsVisited || 'N/A'}

${iqacRemarks ? `Remarks: ${iqacRemarks}` : ''}

Best Regards,
IQAC Team
`;

          await sendEmail(visit.facultyEmail, emailSubject, emailBody);
        } catch (emailError) {
          logger.error('Error sending IQAC status email:', emailError);
        }
      })();
    }

    const updatedRecord = await studentsIndustrialVisitService.getById(id);
    res.json(updatedRecord);
  } catch (error) {
    logger.error('Error updating IQAC status:', error);
    res.status(500).json({ error: 'Failed to update IQAC status' });
  }
});

// POST - Add faculty coordinator to StudentIndustrialVisit
router.post('/:visitId/faculty', async (req: Request, res: Response) => {
  try {
    const visitId = parseInt(req.params.visitId);
    const { facultyId, orderNo } = req.body;

    if (!facultyId || !orderNo) {
      return res.status(400).json({ error: 'facultyId and orderNo are required' });
    }

    if (orderNo < 1 || orderNo > 3) {
      return res.status(400).json({ error: 'orderNo must be between 1 and 3' });
    }

    const id = await studentsIndustrialVisitService.addFacultyCoordinator(visitId, facultyId, orderNo);
    res.status(201).json({ id, visitId, facultyId, orderNo });
  } catch (error) {
    logger.error('Error adding faculty coordinator:', error);
    res.status(500).json({ error: 'Failed to add faculty coordinator' });
  }
});

// GET - List faculty coordinators for StudentIndustrialVisit
router.get('/:visitId/faculty', async (req: Request, res: Response) => {
  try {
    const visitId = parseInt(req.params.visitId);
    const coordinators = await studentsIndustrialVisitService.listFacultyCoordinators(visitId);
    res.json({ data: coordinators });
  } catch (error) {
    logger.error('Error fetching faculty coordinators:', error);
    res.status(500).json({ error: 'Failed to fetch faculty coordinators' });
  }
});

// DELETE - Remove faculty coordinator from StudentIndustrialVisit
router.delete('/:visitId/faculty/:facultyId', async (req: Request, res: Response) => {
  try {
    const visitId = parseInt(req.params.visitId);
    const facultyId = req.params.facultyId;

    const removed = await studentsIndustrialVisitService.removeFacultyCoordinator(visitId, facultyId);

    if (!removed) {
      return res.status(404).json({ error: 'Faculty coordinator relation not found' });
    }

    res.json({ message: 'Faculty coordinator removed successfully' });
  } catch (error) {
    logger.error('Error removing faculty coordinator:', error);
    res.status(500).json({ error: 'Failed to remove faculty coordinator' });
  }
});

export default router;
