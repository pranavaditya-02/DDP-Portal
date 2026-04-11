import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import studentNonTechnicalService from '../services/studentNonTechnical.service';
import { logger } from '../utils/logger';
import { sendEmail } from '../utils/mailer';

const router = Router();

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), 'uploads', 'non-technical');
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
  const allowedMimes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
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
  limits: { fileSize: 10 * 1024 * 1024 },
});

/**
 * POST /api/student-non-technical
 * Create a new non-technical event record with file uploads
 */
router.post(
  '/',
  authenticateToken,
  upload.single('certificateProof'),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: 'User authentication required',
        });
      }

      const file = req.file as Express.Multer.File | undefined;

      const data = {
        studentId: req.body.studentId,
        studentName: req.body.studentName,
        yearOfStudy: req.body.yearOfStudy,
        eventAttended: req.body.eventAttended,
        clubId: req.body.clubId ? parseInt(req.body.clubId) : undefined,
        clubEvents: req.body.clubEvents,
        otherEventSpecify: req.body.otherEventSpecify,
        eventStartDate: req.body.eventStartDate,
        eventEndDate: req.body.eventEndDate,
        eventDuration: parseInt(req.body.eventDuration),
        eventMode: req.body.eventMode,
        eventLocation: req.body.eventLocation,
        eventOrganiser: req.body.eventOrganiser,
        organisationName: req.body.organisationName,
        organisationLocation: req.body.organisationLocation,
        eventLevel: req.body.eventLevel,
        country: req.body.country,
        state: req.body.state,
        withinBIT: req.body.withinBIT,
        homeDepartment: req.body.homeDepartment,
        roleInEvent: req.body.roleInEvent,
        roleSpecifyOrganised: req.body.roleSpecifyOrganised,
        roleSpecifyParticipated: req.body.roleSpecifyParticipated,
        status: req.body.status,
        prizeType: req.body.prizeType,
        prizeAmount: req.body.prizeAmount ? parseInt(req.body.prizeAmount) : undefined,
        socialActivityInvolved: req.body.socialActivityInvolved,
        socialActivityName: req.body.socialActivityName,
        timeSpentHours: parseInt(req.body.timeSpentHours),
        interdisciplinary: req.body.interdisciplinary,
        interdisciplinaryDept: req.body.interdisciplinaryDept ? parseInt(req.body.interdisciplinaryDept) : undefined,
        otherDeptStudentCount: req.body.otherDeptStudentCount ? parseInt(req.body.otherDeptStudentCount) : undefined,
        iqacVerification: req.body.iqacVerification,
        createdBy: String(req.user.id),
        certificateProofPath: file ? `/uploads/non-technical/${file.filename}` : undefined,
      };

      // Validate required fields
      if (!data.studentId || !data.studentName || !data.yearOfStudy) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: studentId, studentName, yearOfStudy',
        });
      }

      if (!data.certificateProofPath) {
        return res.status(400).json({
          success: false,
          message: 'Certificate proof document is required',
        });
      }

      const result = await studentNonTechnicalService.createRecord(data as any);

      logger.info(`Non-technical event record created: ${result.id}`);
      res.status(201).json({
        success: true,
        message: 'Non-technical event record created successfully',
        id: result.id,
        data: result,
      });
    } catch (error: any) {
      logger.error('Error creating non-technical event record:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create non-technical event record',
      });
    }
  }
);

/**
 * GET /api/student-non-technical
 * Get all non-technical event records with optional filters and pagination
 */
router.get(
  '/',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const filters = req.query.filters ? JSON.parse(req.query.filters as string) : {};

      const result = await studentNonTechnicalService.getAllRecords(filters, page, limit);

      res.status(200).json({
        success: true,
        records: result.records,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          pages: result.pages,
        },
      });
    } catch (error: any) {
      logger.error('Error fetching non-technical event records:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch non-technical event records',
      });
    }
  }
);

/**
 * GET /api/student-non-technical/:id
 * Get a specific non-technical event record
 */
router.get(
  '/:id',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const record = await studentNonTechnicalService.getRecordById(parseInt(id));

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Non-technical event record not found',
        });
      }

      res.status(200).json({
        success: true,
        data: record,
      });
    } catch (error: any) {
      logger.error('Error fetching non-technical event record:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch non-technical event record',
      });
    }
  }
);

/**
 * PUT /api/student-non-technical/:id
 * Update a non-technical event record
 */
router.put(
  '/:id',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const record = await studentNonTechnicalService.updateRecord(parseInt(id), updates);

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Non-technical event record not found',
        });
      }

      logger.info(`Non-technical event record ${id} updated`);
      res.status(200).json({
        success: true,
        message: 'Non-technical event record updated successfully',
        data: record,
      });
    } catch (error: any) {
      logger.error('Error updating non-technical event record:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update non-technical event record',
      });
    }
  }
);

/**
 * PUT /api/student-non-technical/:id/iqac-status
 * Update IQAC verification status
 */
router.put(
  '/:id/iqac-status',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { iqacVerification, iqacRejectionRemarks } = req.body;

      logger.debug(`NT iqac-status endpoint - Request body:`, { iqacVerification, iqacRejectionRemarks, fullBody: req.body });

      if (!iqacVerification || typeof iqacVerification !== 'string' || !['initiated', 'approved', 'rejected'].includes(iqacVerification)) {
        logger.error(`NT validation failed - iqacVerification: ${iqacVerification}, type: ${typeof iqacVerification}, validValues: ['initiated', 'approved', 'rejected']`);
        return res.status(400).json({
          success: false,
          message: 'Invalid IQAC verification status. Must be one of: initiated, approved, rejected',
          received: iqacVerification,
        });
      }

      const record = await studentNonTechnicalService.updateIqacStatus(parseInt(id), iqacVerification, iqacRejectionRemarks);

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Non-technical event record not found',
        });
      }

      // Send email notification if student email is available
      const studentEmail = record.student_email;
      if (studentEmail) {
        const statusText = iqacVerification === 'approved' ? 'APPROVED' : iqacVerification === 'rejected' ? 'REJECTED' : 'UNDER REVIEW';
        const subject = `Non-Technical Activity Submission ${statusText} - BannariAmman College`;
        const bodyText = `Hello ${record.student_name ?? 'Student'},\n\nYour non-technical activity submission (ID: ${record.id}, Event: "${record.event_attended ?? 'Activity'}") has been ${statusText} by the IQAC team at BannariAmman College.\n${iqacRejectionRemarks ? `\nReason: ${iqacRejectionRemarks}\n` : ''}\nIf you have any questions, please reply to this email.\n\nIQAC Team\nBannariAmman College`;
        const bodyHtml = `<p>Hello ${record.student_name ?? 'Student'},</p><p>Your non-technical activity submission <strong>(ID: ${record.id})</strong> for <strong>"${record.event_attended ?? 'Activity'}"</strong> has been <strong>${statusText}</strong> by the IQAC team at <strong>BannariAmman College</strong>.</p>${iqacRejectionRemarks ? `<p><strong>Reason:</strong> ${iqacRejectionRemarks}</p>` : ''}<p>If you have any questions, please reply to this email.</p><p>IQAC Team<br/>BannariAmman College</p>`;

        try {
          await sendEmail({
            to: studentEmail,
            subject,
            text: bodyText,
            html: bodyHtml,
          });
          logger.info(`Email notification sent to ${studentEmail} for non-technical event ${id}`);
        } catch (emailError) {
          logger.error('Failed to send non-technical activity status email:', emailError);
        }
      }

      logger.info(`IQAC status for non-technical event record ${id} updated to ${iqacVerification}${iqacRejectionRemarks ? ' with remarks: ' + iqacRejectionRemarks : ''}`);
      res.status(200).json({
        success: true,
        message: 'IQAC verification status updated successfully',
        data: record,
      });
    } catch (error: any) {
      logger.error('Error updating IQAC status:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update IQAC status',
      });
    }
  }
);

/**
 * DELETE /api/student-non-technical/:id
 * Delete a non-technical event record
 */
router.delete(
  '/:id',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await studentNonTechnicalService.deleteRecord(parseInt(id));

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Non-technical event record not found',
        });
      }

      logger.info(`Non-technical event record ${id} deleted`);
      res.status(200).json({
        success: true,
        message: 'Non-technical event record deleted successfully',
      });
    } catch (error: any) {
      logger.error('Error deleting non-technical event record:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete non-technical event record',
      });
    }
  }
);

export default router;
