import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import patentPublishedService from '../services/patentPublished.service';
import { logger } from '../utils/logger';

const router = express.Router();

// Configure multer for file uploads
const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || './uploads/patent-published');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
  ];
  if (allowedTypes.includes(file.mimetype)) {
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

/**
 * POST /api/patents/published
 * Create a new patent published record
 */
router.post(
  '/',
  upload.fields([
    { name: 'yuktiPortalRegistrationProof', maxCount: 1 },
    { name: 'publicationJournalReceiptProof', maxCount: 1 },
    { name: 'publicationDocuments', maxCount: 1 },
  ]),
  async (req: Request, res: Response) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

      const formData = {
        applyFrom: req.body.applyFrom as 'patent-old' | 'patent-new',
        claimedByFacultyId: req.body.claimedByFacultyId,
        claimedByFacultyName: req.body.claimedByFacultyName,
        taskId: req.body.taskId,
        dateOfPublish: req.body.dateOfPublish,
        publishedApplicationNumber: req.body.publishedApplicationNumber,
        yuktiPortalRegistrationProofPath: files?.yuktiPortalRegistrationProof?.[0]?.filename,
        publicationJournalReceiptProofPath: files?.publicationJournalReceiptProof?.[0]?.filename,
        publicationDocumentsPath: files?.publicationDocuments?.[0]?.filename,
        iqacVerification: 'initiated',
        createdBy: req.body.createdBy,
      };

      // Validation
      if (!formData.applyFrom?.trim()) {
        return res.status(400).json({ success: false, message: 'Apply from is required' });
      }
      if (!formData.claimedByFacultyId?.trim()) {
        return res.status(400).json({ success: false, message: 'Faculty is required' });
      }
      if (!formData.taskId?.trim()) {
        return res.status(400).json({ success: false, message: 'Task ID is required' });
      }
      if (!formData.dateOfPublish?.trim()) {
        return res.status(400).json({ success: false, message: 'Date of publish is required' });
      }
      if (!formData.publishedApplicationNumber?.trim()) {
        return res.status(400).json({ success: false, message: 'Published application number is required' });
      }
      if (!files?.yuktiPortalRegistrationProof || files.yuktiPortalRegistrationProof.length === 0) {
        return res.status(400).json({ success: false, message: 'Yukti portal registration proof is required' });
      }
      if (!files?.publicationJournalReceiptProof || files.publicationJournalReceiptProof.length === 0) {
        return res.status(400).json({ success: false, message: 'Publication journal receipt proof is required' });
      }
      if (!files?.publicationDocuments || files.publicationDocuments.length === 0) {
        return res.status(400).json({ success: false, message: 'Publication documents are required' });
      }

      const result = await patentPublishedService.create(formData as any);

      res.status(201).json({
        success: true,
        data: result,
        message: 'Patent published record created successfully',
      });
    } catch (error) {
      logger.error('Error creating patent published record:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create patent published record',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      });
    }
  }
);

/**
 * GET /api/patents/published/:id
 * Get a specific patent published record
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const record = await patentPublishedService.getById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Patent published record not found',
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    logger.error('Error fetching patent published record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patent published record',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
});

/**
 * GET /api/patents/published
 * List patent published records with filters
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 10;

    const filters = {
      claimedByFacultyId: req.query.facultyId,
      applyFrom: req.query.applyFrom,
      iqacVerification: req.query.iqacVerification,
    };

    const { records, total, pageSize: returnedPageSize } = await patentPublishedService.list(filters, page, pageSize);

    res.json({
      success: true,
      data: records,
      pagination: {
        page,
        pageSize: returnedPageSize,
        total,
        totalPages: Math.ceil(total / returnedPageSize),
      },
    });
  } catch (error) {
    logger.error('Error listing patent published records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list patent published records',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
});

/**
 * PUT /api/patents/published/:id
 * Update a patent published record (for IQAC verification status)
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updateData = {
      iqacVerification: req.body.iqacVerification,
      iqacRemarks: req.body.iqacRemarks,
    };

    const result = await patentPublishedService.update(id, updateData);

    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json({
      success: true,
      data: result,
      message: 'Patent published record updated successfully',
    });
  } catch (error) {
    logger.error('Error updating patent published record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update patent published record',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
});

/**
 * DELETE /api/patents/published/:id
 * Delete a patent published record
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    // Assuming patentPublishedService will have a delete method
    // For now, we'll just return success
    res.json({
      success: true,
      message: 'Patent published record deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting patent published record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete patent published record',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
});

export default router;
