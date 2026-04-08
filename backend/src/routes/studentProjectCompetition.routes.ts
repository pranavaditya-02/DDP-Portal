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
import studentProjectCompetitionService from '../services/studentProjectCompetition.service';
import { logger } from '../utils/logger';

const router = Router();

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), 'uploads', 'project-competitions');
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
  limits: { fileSize: 10 * 1024 * 1024 },
});

/**
 * POST /api/student-project-competitions
 * Create a new project competition record with file uploads
 */
router.post(
  '/',
  authenticateToken,
  upload.fields([
    { name: 'imageProof', maxCount: 1 },
    { name: 'abstractProof', maxCount: 1 },
    { name: 'winnerCertificateProof', maxCount: 1 },
    { name: 'runnerCertificateProof', maxCount: 1 },
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
        competitionType: req.body.competitionType,
        projectTitle: req.body.projectTitle,
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
        imageProofPath: files?.imageProof?.[0] ? `/uploads/project-competitions/${files.imageProof[0].filename}` : undefined,
        abstractProofPath: files?.abstractProof?.[0] ? `/uploads/project-competitions/${files.abstractProof[0].filename}` : undefined,
        winnerCertificateProofPath: files?.winnerCertificateProof?.[0] ? `/uploads/project-competitions/${files.winnerCertificateProof[0].filename}` : undefined,
        runnerCertificateProofPath: files?.runnerCertificateProof?.[0] ? `/uploads/project-competitions/${files.runnerCertificateProof[0].filename}` : undefined,
      };

      // Validate required fields
      if (!data.studentId || !data.studentName || !data.projectTitle || !data.eventStartDate || !data.eventEndDate || !data.competitionType) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields',
        });
      }

      // Validate required files
      if (!data.imageProofPath || !data.abstractProofPath) {
        return res.status(400).json({
          success: false,
          message: 'Image and Abstract proofs are required',
        });
      }

      // Validate winner/runner proofs
      if (data.status === 'winner' && !data.winnerCertificateProofPath) {
        return res.status(400).json({
          success: false,
          message: 'Winner certificate proof is required for winner status',
        });
      }

      if (data.status === 'runner' && !data.runnerCertificateProofPath) {
        return res.status(400).json({
          success: false,
          message: 'Runner certificate proof is required for runner status',
        });
      }

      const result = await studentProjectCompetitionService.createCompetition(data as any);

      logger.info(`Project competition created: ${result.id}`);
      res.status(201).json({
        success: true,
        message: 'Project competition record created successfully',
        id: result.id,
        data: result,
      });
    } catch (error: any) {
      logger.error('Error creating project competition:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create project competition',
      });
    }
  }
);

/**
 * GET /api/student-project-competitions
 * Get all project competition records with optional filters and pagination
 */
router.get(
  '/',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const filters = req.query.filters ? JSON.parse(req.query.filters as string) : {};

      const result = await studentProjectCompetitionService.getAllCompetitions(filters, page, limit);

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
      logger.error('Error fetching project competitions:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch project competitions',
      });
    }
  }
);

/**
 * GET /api/student-project-competitions/:id
 * Get a specific project competition record
 */
router.get(
  '/:id',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const record = await studentProjectCompetitionService.getCompetitionById(parseInt(id));

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Project competition record not found',
        });
      }

      res.status(200).json({
        success: true,
        data: record,
      });
    } catch (error: any) {
      logger.error('Error fetching project competition:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch project competition',
      });
    }
  }
);

/**
 * PUT /api/student-project-competitions/:id
 * Update a project competition record
 */
router.put(
  '/:id',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const record = await studentProjectCompetitionService.updateCompetition(parseInt(id), updates);

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Project competition record not found',
        });
      }

      logger.info(`Project competition updated: ${id}`);
      res.status(200).json({
        success: true,
        message: 'Project competition record updated successfully',
        data: record,
      });
    } catch (error: any) {
      logger.error('Error updating project competition:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update project competition',
      });
    }
  }
);

/**
 * PUT /api/student-project-competitions/:id/iqac-status
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

      const record = await studentProjectCompetitionService.updateCompetition(
        parseInt(id),
        { iqacVerification }
      );

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Project competition record not found',
        });
      }

      logger.info(`IQAC status updated for project competition: ${id}`);
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
 * DELETE /api/student-project-competitions/:id
 * Delete a project competition record
 */
router.delete(
  '/:id',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await studentProjectCompetitionService.deleteCompetition(parseInt(id));

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Project competition record not found',
        });
      }

      logger.info(`Project competition deleted: ${id}`);
      res.status(200).json({
        success: true,
        message: 'Project competition record deleted successfully',
      });
    } catch (error: any) {
      logger.error('Error deleting project competition:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete project competition',
      });
    }
  }
);

export default router;
