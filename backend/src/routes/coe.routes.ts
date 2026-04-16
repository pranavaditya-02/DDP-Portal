import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import coeService from '../services/coe.service';
import { sendEmail } from '../utils/mailer';
import { logger } from '../utils/logger';

const router = Router();

const uploadDir = path.join(process.cwd(), 'uploads', 'coe');
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

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}`));
    }
  },
});

// POST: Create COE
router.post('/', upload.any(), async (req: Request, res: Response) => {
  try {
    const {
      submissionId,
      sigNumber,
      coeName,
      claimingDepartmentId,
      facultyInchargeId,
      coeTypeId,
      collaborativeIndustryName,
      dateOfEstablishment,
      areaSqM,
      domainOfCentre,
      isMouRelated,
      mouId,
      isIrpRelated,
      irpVisitId,
      stockRegisterMaintained,
      totalAmountInrs,
      bitContributionInrs,
      industryContributionWithGst,
      industryContributionNoGst,
      studentsPerBatch,
      academicCourse,
    } = req.body;

    if (!submissionId || !coeName) {
      return res.status(400).json({ message: 'Missing required fields: submissionId, coeName' });
    }

    // Validate dates if provided
    if (dateOfEstablishment && isNaN(new Date(dateOfEstablishment).getTime())) {
      return res.status(400).json({ message: 'Invalid dateOfEstablishment format' });
    }

    const files = (req.files as Express.Multer.File[]) || [];
    const fileMap: Record<string, number> = {};

    // Map files to their field names (in real scenario, documents would be inserted to documents table)
    // For now, storing file paths - in production, you'd create document records

    const coeData = {
      submissionId: parseInt(submissionId, 10),
      sigNumber: sigNumber || null,
      coeName,
      claimingDepartmentId: claimingDepartmentId ? parseInt(claimingDepartmentId, 10) : null,
      facultyInchargeId: facultyInchargeId || null,
      coeTypeId: coeTypeId ? parseInt(coeTypeId, 10) : null,
      collaborativeIndustryName: collaborativeIndustryName || null,
      dateOfEstablishment: dateOfEstablishment || null,
      areaSqM: areaSqM ? parseFloat(areaSqM) : null,
      domainOfCentre: domainOfCentre || null,
      isMouRelated: isMouRelated === 'true' || isMouRelated === true,
      mouId: mouId ? parseInt(mouId, 10) : null,
      isIrpRelated: isIrpRelated === 'true' || isIrpRelated === true,
      irpVisitId: irpVisitId ? parseInt(irpVisitId, 10) : null,
      stockRegisterMaintained: stockRegisterMaintained === 'true' || stockRegisterMaintained === true,
      totalAmountInrs: totalAmountInrs ? parseFloat(totalAmountInrs) : null,
      bitContributionInrs: bitContributionInrs ? parseFloat(bitContributionInrs) : null,
      industryContributionWithGst: industryContributionWithGst ? parseFloat(industryContributionWithGst) : null,
      industryContributionNoGst: industryContributionNoGst ? parseFloat(industryContributionNoGst) : null,
      studentsPerBatch: studentsPerBatch ? parseInt(studentsPerBatch, 10) : null,
      academicCourse: academicCourse || null,
    };

    const id = await coeService.create(coeData);
    res.status(201).json({ message: 'COE created successfully', id });
  } catch (error) {
    logger.error('Error creating COE:', error);
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to create COE' });
  }
});

// GET: List COE with pagination and filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const facultyInchargeId = req.query.facultyInchargeId as string | undefined;
    const iqacVerification = req.query.iqacVerification as string | undefined;
    const page = parseInt((req.query.page as string) || '1', 10);
    const pageSize = parseInt((req.query.pageSize as string) || '10', 10);

    const filters = {
      ...(facultyInchargeId && { facultyInchargeId }),
      ...(iqacVerification && { iqacVerification }),
    };

    const { records, total } = await coeService.list(filters, page, pageSize);

    res.json({
      data: records,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    logger.error('Error listing COE records:', error);
    res.status(500).json({ message: 'Failed to list COE records', data: [] });
  }
});

// GET: Fetch single COE record
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const record = await coeService.getById(parseInt(id, 10));

    if (!record) {
      return res.status(404).json({ message: 'COE record not found' });
    }

    res.json(record);
  } catch (error) {
    logger.error('Error fetching COE:', error);
    res.status(500).json({ message: 'Failed to fetch COE' });
  }
});

// PUT: Update COE (general updates)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { coeName } = req.body;

    if (!coeName) {
      return res.status(400).json({ message: 'At least one field is required for update' });
    }

    const success = await coeService.update(parseInt(id, 10), { coeName });

    if (!success) {
      return res.status(404).json({ message: 'COE record not found' });
    }

    res.json({ message: 'COE updated successfully' });
  } catch (error) {
    logger.error('Error updating COE:', error);
    res.status(500).json({ message: 'Failed to update COE' });
  }
});

// DELETE: Delete COE
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const success = await coeService.delete(parseInt(id, 10));

    if (!success) {
      return res.status(404).json({ message: 'COE record not found' });
    }

    res.json({ message: 'COE deleted successfully' });
  } catch (error) {
    logger.error('Error deleting COE:', error);
    res.status(500).json({ message: 'Failed to delete COE' });
  }
});

// PUT: Update IQAC verification status with email notification
router.put('/:id/iqac-status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { iqacVerification, iqacRemarks } = req.body;

    if (!iqacVerification || !['initiated', 'approved', 'rejected'].includes(iqacVerification)) {
      return res.status(400).json({ message: 'Invalid IQAC verification status. Must be: initiated, approved, or rejected' });
    }

    // Get record with faculty email
    const record = await coeService.getByIdWithFacultyEmail(parseInt(id, 10));
    if (!record) {
      return res.status(404).json({ message: 'COE record not found' });
    }

    const updateData: any = {
      iqacVerification,
    };

    if (iqacRemarks && iqacVerification === 'rejected') {
      updateData.iqacRemarks = iqacRemarks;
    }

    const success = await coeService.update(parseInt(id, 10), updateData);

    if (!success) {
      return res.status(404).json({ message: 'COE record not found' });
    }

    // Send email notification to faculty
    if (record.facultyEmail) {
      const statusText = iqacVerification === 'approved' ? 'APPROVED' : iqacVerification === 'rejected' ? 'REJECTED' : 'UNDER REVIEW';
      const subject = `Centre of Excellence Submission ${statusText} - BannariAmman College`;
      const bodyText = `Hello ${record.facultyName || 'Faculty'},\n\nYour Centre of Excellence submission (ID: ${record.id}, COE: "${record.coeName}") has been ${statusText} by the IQAC team at BannariAmman College.${iqacRemarks ? `\n\nReason: ${iqacRemarks}\n` : '\n'}\nIf you have any questions, please reply to this email.\n\nIQAC Team\nBannariAmman College`;
      const bodyHtml = `<p>Hello ${record.facultyName || 'Faculty'},</p><p>Your Centre of Excellence submission <strong>(ID: ${record.id})</strong> with COE name <strong>"${record.coeName}"</strong> has been <strong>${statusText}</strong> by the IQAC team at <strong>BannariAmman College</strong>.</p>${iqacRemarks ? `<p><strong>Reason:</strong> ${iqacRemarks}</p>` : ''}<p>If you have any questions, please reply to this email.</p><p>IQAC Team<br/>BannariAmman College</p>`;

      try {
        await sendEmail({
          to: record.facultyEmail,
          subject,
          text: bodyText,
          html: bodyHtml,
        });
        logger.info(`Email notification sent to ${record.facultyEmail} for COE ${id}`);
      } catch (emailError) {
        const errorMessage = emailError instanceof Error ? errorError.message : String(emailError);
        logger.error('Failed to send COE status email:', {
          error: errorMessage,
          to: record.facultyEmail,
          subject,
        });
        // Don't fail the request if email fails
      }
    }

    res.json({ message: 'COE IQAC status updated successfully' });
  } catch (error) {
    logger.error('Error updating COE IQAC status:', error);
    res.status(500).json({ message: 'Failed to update IQAC status' });
  }
});

export default router;
