import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';

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
import studentTechnicalBodyMembershipService from '../services/studentTechnicalBodyMembership.service';
import { logger } from '../utils/logger';

const router = Router();

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), 'uploads', 'technical-body-memberships');
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
 * POST /api/student-technical-body-memberships
 * Create a new technical body membership record with file uploads
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
        membership: req.body.membership,
        levelOfMembership: req.body.levelOfMembership,
        stateOfMembership: req.body.stateOfMembership,
        membershipNumber: req.body.membershipNumber,
        membershipSociety: req.body.membershipSociety,
        validity: req.body.validity,
        chargesInRupees: req.body.chargesInRupees ? parseInt(req.body.chargesInRupees) : null,
        activitiesConducted: req.body.activitiesConducted,
        specifyActivity: req.body.specifyActivity,
        activityStatus: req.body.activityStatus,
        iqacVerification: req.body.iqacVerification,
        iqacRejectionRemarks: req.body.iqacRejectionRemarks,
        createdBy: String(req.user.id),
        certificateProofPath: file ? `/uploads/technical-body-memberships/${file.filename}` : undefined,
      };

      // Validate required fields
      if (!data.studentId || !data.studentName || !data.yearOfStudy) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields',
        });
      }

      // Validate certificate proof is required
      if (!data.certificateProofPath) {
        return res.status(400).json({
          success: false,
          message: 'Certificate proof document is required',
        });
      }

      // Validate membership-specific fields if membership is yes
      if (data.membership === 'yes') {
        if (!data.levelOfMembership || !data.stateOfMembership || !data.membershipNumber || !data.membershipSociety || !data.validity) {
          return res.status(400).json({
            success: false,
            message: 'All membership details are required when membership is selected',
          });
        }

        // Validate activity fields if activities conducted is yes
        if (data.activitiesConducted === 'yes') {
          if (!data.specifyActivity || !data.activityStatus) {
            return res.status(400).json({
              success: false,
              message: 'Activity details are required when activities conducted is selected',
            });
          }
        }
      }

      const result = await studentTechnicalBodyMembershipService.createMembership(data as any);

      logger.info(`Technical body membership created: ${result.id}`);
      res.status(201).json({
        success: true,
        message: 'Technical body membership record created successfully',
        id: result.id,
        data: result,
      });
    } catch (error: any) {
      logger.error('Error creating technical body membership:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create technical body membership',
      });
    }
  }
);

/**
 * GET /api/student-technical-body-memberships
 * Get all technical body membership records with optional filters and pagination
 */
router.get(
  '/',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const filters = req.query.filters ? JSON.parse(req.query.filters as string) : {};

      const result = await studentTechnicalBodyMembershipService.getAllMemberships(filters, page, limit);

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
      logger.error('Error fetching technical body memberships:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch technical body memberships',
      });
    }
  }
);

/**
 * GET /api/student-technical-body-memberships/:id
 * Get a specific technical body membership record
 */
router.get(
  '/:id',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const record = await studentTechnicalBodyMembershipService.getMembershipById(parseInt(id));

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Technical body membership record not found',
        });
      }

      res.status(200).json({
        success: true,
        data: record,
      });
    } catch (error: any) {
      logger.error('Error fetching technical body membership:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch technical body membership',
      });
    }
  }
);

/**
 * PUT /api/student-technical-body-memberships/:id
 * Update a technical body membership record
 */
router.put(
  '/:id',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const record = await studentTechnicalBodyMembershipService.updateMembership(parseInt(id), updates);

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Technical body membership record not found',
        });
      }

      logger.info(`Technical body membership updated: ${id}`);
      res.status(200).json({
        success: true,
        message: 'Technical body membership record updated successfully',
        data: record,
      });
    } catch (error: any) {
      logger.error('Error updating technical body membership:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update technical body membership',
      });
    }
  }
);

/**
 * PUT /api/student-technical-body-memberships/:id/iqac-status
 * Update IQAC verification status
 */
router.put(
  '/:id/iqac-status',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { iqacVerification } = req.body;

      if (!['initiated', 'processing', 'completed'].includes(iqacVerification)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid IQAC verification status',
        });
      }

      const record = await studentTechnicalBodyMembershipService.updateMembership(parseInt(id), {
        iqacVerification,
      });

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Technical body membership record not found',
        });
      }

      logger.info(`IQAC status updated for technical body membership: ${id}`);
      res.status(200).json({
        success: true,
        message: 'IQAC status updated successfully',
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
 * DELETE /api/student-technical-body-memberships/:id
 * Delete a technical body membership record
 */
router.delete(
  '/:id',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await studentTechnicalBodyMembershipService.deleteMembership(parseInt(id));

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Technical body membership record not found',
        });
      }

      logger.info(`Technical body membership deleted: ${id}`);
      res.status(200).json({
        success: true,
        message: 'Technical body membership record deleted successfully',
      });
    } catch (error: any) {
      logger.error('Error deleting technical body membership:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete technical body membership',
      });
    }
  }
);

export default router;
