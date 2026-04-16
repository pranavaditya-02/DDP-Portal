import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import patentService from '../services/patent.service';
import { logger } from '../utils/logger';

const router = Router();

// ==================== File Upload Configuration ====================

const uploadsDir = path.join(process.cwd(), 'uploads', 'patents');
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

// ==================== PATENT PRELIMINARY DATA ROUTES ====================

/**
 * POST /api/patents/preliminary-data
 * Create a new patent preliminary data record with file uploads
 */
router.post(
  '/preliminary-data',
  authenticateToken,
  upload.fields([
    { name: 'experimentationProof', maxCount: 1 },
    { name: 'drawingsProof', maxCount: 1 },
    { name: 'formProof', maxCount: 1 },
  ]),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          message: 'User authentication required',
        });
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

      const data = {
        facultyId: parseInt(req.body.facultyId),
        facultyName: req.body.facultyName,
        patentTitle: req.body.patentTitle,
        applicantType: req.body.applicantType,
        patentType: req.body.patentType,
        supportedByExperimentation: req.body.supportedByExperimentation,
        experimentationProofPath: files?.experimentationProof?.[0]?.path || undefined,
        priorArt: req.body.priorArt,
        novelty: req.body.novelty,
        involveDrawings: req.body.involveDrawings,
        drawingsProofPath: files?.drawingsProof?.[0]?.path || undefined,
        formPrepared: req.body.formPrepared,
        formProofPath: files?.formProof?.[0]?.path || undefined,
        iqacVerification: 'initiated',
        createdBy: req.user.id,
      };

      const record = await patentService.createPreliminaryData(data);

      res.status(201).json({
        success: true,
        message: 'Patent preliminary data submitted successfully',
        record,
      });
    } catch (error) {
      logger.error('Error creating patent preliminary data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit patent preliminary data',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }
);

/**
 * GET /api/patents/preliminary-data
 * Get all patent preliminary data records
 */
router.get('/preliminary-data', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const filters: any = {};

    if (req.query.facultyId) {
      filters.facultyId = parseInt(req.query.facultyId as string);
    }
    if (req.query.iqacVerification) {
      filters.iqacVerification = req.query.iqacVerification;
    }

    const result = await patentService.getAllPreliminaryData(filters, page, limit);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error('Error fetching patent preliminary data:', error);
    const errorMessage = (error as any).message || 'Failed to fetch preliminary data';
    const isDatabaseError = errorMessage.includes('Table') || errorMessage.includes('table');
    
    res.status(500).json({
      success: false,
      message: isDatabaseError
        ? 'Preliminary data table not found. Please ensure database is initialized with patent_complete_schema.sql'
        : 'Failed to fetch patent preliminary data',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
    });
  }
});

/**
 * GET /api/patents/preliminary-data/:id
 * Get a specific patent preliminary data record
 */
router.get(
  '/preliminary-data/:id',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const record = await patentService.getPreliminaryDataById(id);

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Patent preliminary data record not found',
        });
      }

      res.json({
        success: true,
        record,
      });
    } catch (error) {
      logger.error('Error fetching patent preliminary data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch patent preliminary data',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }
);

/**
 * PUT /api/patents/preliminary-data/:id
 * Update a patent preliminary data record
 */
router.put(
  '/preliminary-data/:id',
  authenticateToken,
  upload.fields([
    { name: 'experimentationProof', maxCount: 1 },
    { name: 'drawingsProof', maxCount: 1 },
    { name: 'formProof', maxCount: 1 },
  ]),
  async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

      const updates: any = {};
      if (req.body.patentTitle) updates.patentTitle = req.body.patentTitle;
      if (req.body.applicantType) updates.applicantType = req.body.applicantType;
      if (req.body.patentType) updates.patentType = req.body.patentType;
      if (req.body.supportedByExperimentation !== undefined)
        updates.supportedByExperimentation = req.body.supportedByExperimentation;
      if (files?.experimentationProof?.[0]) updates.experimentationProofPath = files.experimentationProof[0].path;
      if (req.body.priorArt) updates.priorArt = req.body.priorArt;
      if (req.body.novelty) updates.novelty = req.body.novelty;
      if (req.body.involveDrawings !== undefined) updates.involveDrawings = req.body.involveDrawings;
      if (files?.drawingsProof?.[0]) updates.drawingsProofPath = files.drawingsProof[0].path;
      if (req.body.formPrepared !== undefined) updates.formPrepared = req.body.formPrepared;
      if (files?.formProof?.[0]) updates.formProofPath = files.formProof[0].path;

      const record = await patentService.updatePreliminaryData(id, updates);

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Patent preliminary data record not found',
        });
      }

      res.json({
        success: true,
        message: 'Patent preliminary data updated successfully',
        record,
      });
    } catch (error) {
      logger.error('Error updating patent preliminary data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update patent preliminary data',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }
);

/**
 * DELETE /api/patents/preliminary-data/:id
 * Delete a patent preliminary data record
 */
router.delete('/preliminary-data/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await patentService.deletePreliminaryData(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Patent preliminary data record not found',
      });
    }

    res.json({
      success: true,
      message: 'Patent preliminary data deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting patent preliminary data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete patent preliminary data',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
});

// ==================== PATENT FILED ROUTES ====================

/**
 * POST /api/patents/filed
 */
router.post(
  '/filed',
  authenticateToken,
  upload.single('documentProof'),
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
        facultyId: parseInt(req.body.facultyId),
        facultyName: req.body.facultyName,
        patentTitle: req.body.patentTitle,
        inventors: req.body.inventors,
        patentType: req.body.patentType,
        applicationNo: req.body.applicationNo,
        filedDate: req.body.filedDate,
        collaboration: req.body.collaboration,
        collaborationDetails: req.body.collaborationDetails,
        institutionNameIncluded: req.body.institutionNameIncluded,
        specialLabsInvolved: req.body.specialLabsInvolved,
        specialLab: req.body.specialLab,
        remarks: req.body.remarks,
        documentProofPath: file?.path,
        iqacVerification: 'initiated',
        createdBy: req.user.id,
      };

      const record = await patentService.createFiled(data);

      res.status(201).json({
        success: true,
        message: 'Patent filed record submitted successfully',
        record,
      });
    } catch (error) {
      logger.error('Error creating patent filed record:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit patent filed record',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }
);

/**
 * GET /api/patents/filed
 */
router.get('/filed', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const filters: any = {};

    if (req.query.facultyId) {
      filters.facultyId = parseInt(req.query.facultyId as string);
    }
    if (req.query.iqacVerification) {
      filters.iqacVerification = req.query.iqacVerification;
    }

    const result = await patentService.getAllFiled(filters, page, limit);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error('Error fetching patent filed records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patent filed records',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
});

/**
 * GET /api/patents/filed/:id
 */
router.get('/filed/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const record = await patentService.getFiledById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Patent filed record not found',
      });
    }

    res.json({
      success: true,
      record,
    });
  } catch (error) {
    logger.error('Error fetching patent filed record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patent filed record',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
});

/**
 * PUT /api/patents/filed/:id
 */
router.put(
  '/filed/:id',
  authenticateToken,
  upload.single('documentProof'),
  async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const file = req.file as Express.Multer.File | undefined;

      const updates: any = {};
      if (req.body.patentTitle) updates.patentTitle = req.body.patentTitle;
      if (req.body.inventors) updates.inventors = req.body.inventors;
      if (req.body.patentType) updates.patentType = req.body.patentType;
      if (req.body.applicationNo) updates.applicationNo = req.body.applicationNo;
      if (req.body.filedDate) updates.filedDate = req.body.filedDate;
      if (req.body.collaboration) updates.collaboration = req.body.collaboration;
      if (req.body.collaborationDetails) updates.collaborationDetails = req.body.collaborationDetails;
      if (req.body.remarks) updates.remarks = req.body.remarks;
      if (file) updates.documentProofPath = file.path;

      const record = await patentService.updateFiled(id, updates);

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Patent filed record not found',
        });
      }

      res.json({
        success: true,
        message: 'Patent filed record updated successfully',
        record,
      });
    } catch (error) {
      logger.error('Error updating patent filed record:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update patent filed record',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }
);

/**
 * DELETE /api/patents/filed/:id
 */
router.delete('/filed/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await patentService.deleteFiled(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Patent filed record not found',
      });
    }

    res.json({
      success: true,
      message: 'Patent filed record deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting patent filed record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete patent filed record',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
});

// ==================== PATENT PUBLISHED ROUTES ====================

/**
 * POST /api/patents/published
 */
router.post(
  '/published',
  authenticateToken,
  upload.single('documentProof'),
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
        facultyId: parseInt(req.body.facultyId),
        facultyName: req.body.facultyName,
        patentTitle: req.body.patentTitle,
        inventors: req.body.inventors,
        patentType: req.body.patentType,
        publicationNo: req.body.publicationNo,
        publishedDate: req.body.publishedDate,
        collaboration: req.body.collaboration,
        collaborationDetails: req.body.collaborationDetails,
        institutionNameIncluded: req.body.institutionNameIncluded,
        specialLabsInvolved: req.body.specialLabsInvolved,
        specialLab: req.body.specialLab,
        remarks: req.body.remarks,
        documentProofPath: file?.path,
        iqacVerification: 'initiated',
        createdBy: req.user.id,
      };

      const record = await patentService.createPublished(data);

      res.status(201).json({
        success: true,
        message: 'Patent published record submitted successfully',
        record,
      });
    } catch (error) {
      logger.error('Error creating patent published record:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit patent published record',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }
);

/**
 * GET /api/patents/published
 */
router.get('/published', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const filters: any = {};

    if (req.query.facultyId) {
      filters.facultyId = parseInt(req.query.facultyId as string);
    }
    if (req.query.iqacVerification) {
      filters.iqacVerification = req.query.iqacVerification;
    }

    const result = await patentService.getAllPublished(filters, page, limit);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error('Error fetching patent published records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patent published records',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
});

/**
 * GET /api/patents/published/:id
 */
router.get('/published/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const record = await patentService.getPublishedById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Patent published record not found',
      });
    }

    res.json({
      success: true,
      record,
    });
  } catch (error) {
    logger.error('Error fetching patent published record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patent published record',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
});

/**
 * PUT /api/patents/published/:id
 */
router.put(
  '/published/:id',
  authenticateToken,
  upload.single('documentProof'),
  async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const file = req.file as Express.Multer.File | undefined;

      const updates: any = {};
      if (req.body.patentTitle) updates.patentTitle = req.body.patentTitle;
      if (req.body.inventors) updates.inventors = req.body.inventors;
      if (req.body.patentType) updates.patentType = req.body.patentType;
      if (req.body.publicationNo) updates.publicationNo = req.body.publicationNo;
      if (req.body.publishedDate) updates.publishedDate = req.body.publishedDate;
      if (req.body.collaboration) updates.collaboration = req.body.collaboration;
      if (req.body.collaborationDetails) updates.collaborationDetails = req.body.collaborationDetails;
      if (req.body.remarks) updates.remarks = req.body.remarks;
      if (file) updates.documentProofPath = file.path;

      const record = await patentService.updatePublished(id, updates);

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Patent published record not found',
        });
      }

      res.json({
        success: true,
        message: 'Patent published record updated successfully',
        record,
      });
    } catch (error) {
      logger.error('Error updating patent published record:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update patent published record',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }
);

/**
 * DELETE /api/patents/published/:id
 */
router.delete('/published/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await patentService.deletePublished(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Patent published record not found',
      });
    }

    res.json({
      success: true,
      message: 'Patent published record deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting patent published record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete patent published record',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
});

// ==================== PATENT GRANTED ROUTES ====================

/**
 * POST /api/patents/granted
 */
router.post(
  '/granted',
  authenticateToken,
  upload.single('documentProof'),
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
        facultyId: parseInt(req.body.facultyId),
        facultyName: req.body.facultyName,
        patentTitle: req.body.patentTitle,
        inventors: req.body.inventors,
        patentType: req.body.patentType,
        grantedApplicationNo: req.body.grantedApplicationNo,
        grantedDate: req.body.grantedDate,
        collaboration: req.body.collaboration,
        collaborationDetails: req.body.collaborationDetails,
        institutionNameIncluded: req.body.institutionNameIncluded,
        specialLabsInvolved: req.body.specialLabsInvolved,
        specialLab: req.body.specialLab,
        remarks: req.body.remarks,
        documentProofPath: file?.path,
        iqacVerification: 'initiated',
        createdBy: req.user.id,
      };

      const record = await patentService.createGranted(data);

      res.status(201).json({
        success: true,
        message: 'Patent granted record submitted successfully',
        record,
      });
    } catch (error) {
      logger.error('Error creating patent granted record:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit patent granted record',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }
);

/**
 * GET /api/patents/granted
 */
router.get('/granted', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const filters: any = {};

    if (req.query.facultyId) {
      filters.facultyId = parseInt(req.query.facultyId as string);
    }
    if (req.query.iqacVerification) {
      filters.iqacVerification = req.query.iqacVerification;
    }

    const result = await patentService.getAllGranted(filters, page, limit);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error('Error fetching patent granted records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patent granted records',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
});

/**
 * GET /api/patents/granted/:id
 */
router.get('/granted/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const record = await patentService.getGrantedById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Patent granted record not found',
      });
    }

    res.json({
      success: true,
      record,
    });
  } catch (error) {
    logger.error('Error fetching patent granted record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patent granted record',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
});

/**
 * PUT /api/patents/granted/:id
 */
router.put(
  '/granted/:id',
  authenticateToken,
  upload.single('documentProof'),
  async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const file = req.file as Express.Multer.File | undefined;

      const updates: any = {};
      if (req.body.patentTitle) updates.patentTitle = req.body.patentTitle;
      if (req.body.inventors) updates.inventors = req.body.inventors;
      if (req.body.patentType) updates.patentType = req.body.patentType;
      if (req.body.grantedApplicationNo) updates.grantedApplicationNo = req.body.grantedApplicationNo;
      if (req.body.grantedDate) updates.grantedDate = req.body.grantedDate;
      if (req.body.collaboration) updates.collaboration = req.body.collaboration;
      if (req.body.collaborationDetails) updates.collaborationDetails = req.body.collaborationDetails;
      if (req.body.remarks) updates.remarks = req.body.remarks;
      if (file) updates.documentProofPath = file.path;

      const record = await patentService.updateGranted(id, updates);

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Patent granted record not found',
        });
      }

      res.json({
        success: true,
        message: 'Patent granted record updated successfully',
        record,
      });
    } catch (error) {
      logger.error('Error updating patent granted record:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update patent granted record',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }
);

/**
 * DELETE /api/patents/granted/:id
 */
router.delete('/granted/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await patentService.deleteGranted(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Patent granted record not found',
      });
    }

    res.json({
      success: true,
      message: 'Patent granted record deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting patent granted record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete patent granted record',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
});

// ==================== IQAC VERIFICATION ROUTES ====================

/**
 * PUT /api/patents/preliminary-data/:id/iqac-verification
 */
router.put(
  '/preliminary-data/:id/iqac-verification',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { status, remarks } = req.body;

      if (!['approved', 'rejected', 'initiated'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid verification status',
        });
      }

      const record = await patentService.updateIqacStatusPreliminary(id, status, remarks);

      res.json({
        success: true,
        message: 'IQAC verification status updated successfully',
        record,
      });
    } catch (error) {
      logger.error('Error updating IQAC status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update IQAC verification status',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }
);

/**
 * PUT /api/patents/filed/:id/iqac-verification
 */
router.put(
  '/filed/:id/iqac-verification',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { status, remarks } = req.body;

      if (!['approved', 'rejected', 'initiated'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid verification status',
        });
      }

      const record = await patentService.updateIqacStatusFiled(id, status, remarks);

      res.json({
        success: true,
        message: 'IQAC verification status updated successfully',
        record,
      });
    } catch (error) {
      logger.error('Error updating IQAC status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update IQAC verification status',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }
);

/**
 * PUT /api/patents/published/:id/iqac-verification
 */
router.put(
  '/published/:id/iqac-verification',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { status, remarks } = req.body;

      if (!['approved', 'rejected', 'initiated'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid verification status',
        });
      }

      const record = await patentService.updateIqacStatusPublished(id, status, remarks);

      res.json({
        success: true,
        message: 'IQAC verification status updated successfully',
        record,
      });
    } catch (error) {
      logger.error('Error updating IQAC status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update IQAC verification status',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }
);

/**
 * PUT /api/patents/granted/:id/iqac-verification
 */
router.put(
  '/granted/:id/iqac-verification',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { status, remarks } = req.body;

      if (!['approved', 'rejected', 'initiated'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid verification status',
        });
      }

      const record = await patentService.updateIqacStatusGranted(id, status, remarks);

      res.json({
        success: true,
        message: 'IQAC verification status updated successfully',
        record,
      });
    } catch (error) {
      logger.error('Error updating IQAC status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update IQAC verification status',
        error: process.env.NODE_ENV === 'development' ? error : undefined,
      });
    }
  }
);

export default router;
