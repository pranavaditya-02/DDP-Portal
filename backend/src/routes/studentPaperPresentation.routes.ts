import { Router, Request, Response } from 'express';
import { authenticateToken, optionalAuthenticate, AuthRequest } from '../middleware/auth';

// Augment Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: { id: string | number; [key: string]: any };
    }
  }
}
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import studentPaperPresentationService from '../services/studentPaperPresentation.service';
import { logger } from '../utils/logger';
import { sendEmail } from '../utils/mailer';

const router = Router();

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), 'uploads', 'paper-presentations');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (
    req: any,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, uploadsDir);
  },
  filename: (
    req: any,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile?: boolean) => void
) => {
  const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const allowedExts = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
  
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExts.includes(ext) && allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

/**
 * POST /api/student-paper-presentations
 * Create a new paper presentation record with file uploads
 */
router.post(
  '/',
  authenticateToken,
  upload.fields([
    { name: 'imageProof', maxCount: 1 },
    { name: 'abstractProof', maxCount: 1 },
    { name: 'certificateProof', maxCount: 1 },
    { name: 'attestedCertificate', maxCount: 1 },
    { name: 'winnerCertificateProof', maxCount: 1 },
  ]),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: 'User authentication required',
        });
      }
      const files = req.files as { [key: string]: Express.Multer.File[] };

      const data = {
        studentId: req.body.studentId,
        studentName: req.body.studentName,
        paperTitle: req.body.paperTitle,
        eventStartDate: req.body.eventStartDate,
        eventEndDate: req.body.eventEndDate,
        isAcademicProjectOutcome: req.body.isAcademicProjectOutcome,
        academicProjectId: req.body.academicProjectId,
        sdgGoal: req.body.sdgGoal,
        status: req.body.status,
        winnerPlace: req.body.winnerPlace,
        prizeType: req.body.prizeType,
        iqacVerification: req.body.iqacVerification,
        iqacRejectionRemarks: req.body.iqacRejectionRemarks,
        parentalDepartmentId: req.body.parentalDepartmentId,
        createdBy: String(req.user.id),
        // Map uploaded files to paths
        imageProofPath: files?.imageProof?.[0] ? `/uploads/paper-presentations/${files.imageProof[0].filename}` : undefined,
        abstractProofPath: files?.abstractProof?.[0] ? `/uploads/paper-presentations/${files.abstractProof[0].filename}` : undefined,
        certificateProofPath: files?.certificateProof?.[0] ? `/uploads/paper-presentations/${files.certificateProof[0].filename}` : undefined,
        attestedCertificatePath: files?.attestedCertificate?.[0] ? `/uploads/paper-presentations/${files.attestedCertificate[0].filename}` : undefined,
        winnerCertificateProof: files?.winnerCertificateProof?.[0] ? `/uploads/paper-presentations/${files.winnerCertificateProof[0].filename}` : undefined,
      };

      // Validate required fields
      if (!data.studentId || !data.studentName || !data.paperTitle || !data.eventStartDate || !data.eventEndDate) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields',
        });
      }

      // Validate required files
      if (!data.imageProofPath || !data.abstractProofPath || !data.certificateProofPath || !data.attestedCertificatePath) {
        return res.status(400).json({
          success: false,
          message: 'All four proof documents are required',
        });
      }

      const result = await studentPaperPresentationService.createPresentation(data as any);

      logger.info(`Paper presentation created: ${result.id}`);
      res.status(201).json({
        success: true,
        message: 'Paper presentation record created successfully',
        id: result.id,
        data: result,
      });
    } catch (error: any) {
      logger.error('Error creating paper presentation:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create paper presentation',
      });
    }
  }
);

/**
 * GET /api/student-paper-presentations
 * Get all paper presentation records for the current user with optional filters and pagination
 */
router.get('/', optionalAuthenticate, async (req: AuthRequest, res: Response) => {
  try {
    const filters = {
      createdBy: req.user?.id ? String(req.user.id) : undefined, // Only filter by user if authenticated
      studentId: req.query.studentId,
      status: req.query.status,
      iqacVerification: req.query.iqacVerification,
    };

    // Get pagination parameters from query
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(10, parseInt(req.query.limit as string) || 20));

    const response = await studentPaperPresentationService.getAllPresentations(filters, page, limit);

    res.status(200).json({
      success: true,
      ...response,
    });
  } catch (error: any) {
    logger.error('Error fetching paper presentations:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch records',
    });
  }
});

/**
 * GET /api/student-paper-presentations/:id
 * Get a single paper presentation record
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const idParam = typeof req.params.id === 'string' ? req.params.id : (req.params.id as any as string);
    const record = await studentPaperPresentationService.getPresentationById(parseInt(idParam));

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Paper presentation record not found',
      });
    }

    res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error: any) {
    logger.error('Error fetching paper presentation:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch record',
    });
  }
});

/**
 * PUT /api/student-paper-presentations/:id
 * Update a paper presentation record
 */
router.put(
  '/:id',
  upload.fields([
    { name: 'imageProof', maxCount: 1 },
    { name: 'abstractProof', maxCount: 1 },
    { name: 'certificateProof', maxCount: 1 },
    { name: 'attestedCertificate', maxCount: 1 },
  ]),
  async (req: Request, res: Response) => {
    try {
      const idParam = typeof req.params.id === 'string' ? req.params.id : (req.params.id as any as string);
      const files = req.files as { [key: string]: Express.Multer.File[] };

      // Build update data
      const updateData: any = {};
      if (req.body.paperTitle) updateData.paperTitle = req.body.paperTitle;
      if (req.body.eventStartDate) updateData.eventStartDate = req.body.eventStartDate;
      if (req.body.eventEndDate) updateData.eventEndDate = req.body.eventEndDate;
      if (req.body.isAcademicProjectOutcome) updateData.isAcademicProjectOutcome = req.body.isAcademicProjectOutcome;
      if (req.body.status) updateData.status = req.body.status;
      if (req.body.iqacVerification) updateData.iqacVerification = req.body.iqacVerification;
      if (req.body.parentalDepartmentId) updateData.parentalDepartmentId = req.body.parentalDepartmentId;

      // Handle file uploads
      if (files?.imageProof?.[0]) {
        updateData.imageProofPath = `/uploads/paper-presentations/${files.imageProof[0].filename}`;
      }
      if (files?.abstractProof?.[0]) {
        updateData.abstractProofPath = `/uploads/paper-presentations/${files.abstractProof[0].filename}`;
      }
      if (files?.certificateProof?.[0]) {
        updateData.certificateProofPath = `/uploads/paper-presentations/${files.certificateProof[0].filename}`;
      }
      if (files?.attestedCertificate?.[0]) {
        updateData.attestedCertificatePath = `/uploads/paper-presentations/${files.attestedCertificate[0].filename}`;
      }

      await studentPaperPresentationService.updatePresentation(parseInt(idParam), updateData);

      res.status(200).json({
        success: true,
        message: 'Paper presentation record updated successfully',
      });
    } catch (error: any) {
      logger.error('Error updating paper presentation:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update record',
      });
    }
  }
);

/**
 * PUT /api/student-paper-presentations/:id/iqac-status
 * Update IQAC verification status
 */
router.put('/:id/iqac-status', async (req: Request, res: Response) => {
  try {
    const idParam = typeof req.params.id === 'string' ? req.params.id : (req.params.id as any as string);
    const { iqacVerification, iqacRejectionRemarks } = req.body;

    logger.debug(`PPR iqac-status endpoint - Request body:`, { iqacVerification, iqacRejectionRemarks, fullBody: req.body });

    if (!iqacVerification || typeof iqacVerification !== 'string' || !['initiated', 'approved', 'rejected'].includes(iqacVerification)) {
      logger.error(`PPR validation failed - iqacVerification: ${iqacVerification}, type: ${typeof iqacVerification}, validValues: ['initiated', 'approved', 'rejected']`);
      return res.status(400).json({
        success: false,
        message: 'Invalid IQAC verification status. Must be one of: initiated, approved, rejected',
        received: iqacVerification,
      });
    }

    const id = parseInt(idParam);

    // Get the record
    const record = await studentPaperPresentationService.getPresentationByIdWithEmail(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Paper presentation record not found',
      });
    }

    // Prepare update data
    const updateData: any = {
      iqacVerification,
    };
    
    if (iqacRejectionRemarks && iqacVerification === 'rejected') {
      updateData.iqacRejectionRemarks = iqacRejectionRemarks;
    }

    // Update the record
    await studentPaperPresentationService.updatePresentation(id, updateData);

    // Send email notification if student email is available
    const studentEmail = record.studentEmail;
    if (studentEmail) {
      const statusText = iqacVerification === 'approved' ? 'APPROVED' : iqacVerification === 'rejected' ? 'REJECTED' : 'UNDER REVIEW';
      const subject = `Paper Presentation Submission ${statusText} - BannariAmman College`;
      const bodyText = `Hello ${record.studentName ?? 'Student'},\n\nYour paper presentation submission (ID: ${record.id}, Title: "${record.paperTitle}") has been ${statusText} by the IQAC team at BannariAmman College.\n${iqacRejectionRemarks ? `\nReason: ${iqacRejectionRemarks}\n` : ''}\nIf you have any questions, please reply to this email.\n\nIQAC Team\nBannariAmman College`;
      const bodyHtml = `<p>Hello ${record.studentName ?? 'Student'},</p><p>Your paper presentation submission <strong>(ID: ${record.id})</strong> with title <strong>"${record.paperTitle}"</strong> has been <strong>${statusText}</strong> by the IQAC team at <strong>BannariAmman College</strong>.</p>${iqacRejectionRemarks ? `<p><strong>Reason:</strong> ${iqacRejectionRemarks}</p>` : ''}<p>If you have any questions, please reply to this email.</p><p>IQAC Team<br/>BannariAmman College</p>`;

      try {
        await sendEmail({
          to: studentEmail,
          subject,
          text: bodyText,
          html: bodyHtml,
        });
        logger.info(`Email notification sent to ${studentEmail} for paper presentation ${id}`);
      } catch (emailError) {
        logger.error('Failed to send paper presentation status email:', emailError);
      }
    }

    logger.info(`IQAC status updated for paper presentation ${id}: ${iqacVerification}${iqacRejectionRemarks ? ' with remarks: ' + iqacRejectionRemarks : ''}`);

    res.status(200).json({
      success: true,
      message: 'IQAC status updated successfully',
      iqacVerification,
    });
  } catch (error: any) {
    logger.error('Error updating IQAC status:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update IQAC status',
    });
  }
});

/**
 * DELETE /api/student-paper-presentations/:id
 * Delete a paper presentation record
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const idParam = typeof req.params.id === 'string' ? req.params.id : (req.params.id as any as string);

    // Get record to delete associated files
    const record = await studentPaperPresentationService.getPresentationById(parseInt(idParam));
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Paper presentation record not found',
      });
    }

    // Delete associated files
    [record.imageProofPath, record.abstractProofPath, record.certificateProofPath, record.attestedCertificatePath]
      .filter(Boolean)
      .forEach((filePath: string) => {
        const fullPath = path.join(process.cwd(), filePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });

    await studentPaperPresentationService.deletePresentation(parseInt(idParam));

    res.status(200).json({
      success: true,
      message: 'Paper presentation record deleted successfully',
    });
  } catch (error: any) {
    logger.error('Error deleting paper presentation:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete record',
    });
  }
});

export default router;
