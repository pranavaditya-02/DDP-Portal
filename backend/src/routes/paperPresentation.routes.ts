import express, { Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import paperPresentationService from '../services/paperPresentation.service';
import { logger } from '../utils/logger';

const router = express.Router();

const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || './uploads/paper-presentations');
const allowedFileTypes = new Set(
  (process.env.ALLOWED_FILE_TYPES || 'pdf,jpg,jpeg,png,docx,xlsx')
    .split(',')
    .map((type) => type.trim().toLowerCase())
    .filter(Boolean)
);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (
    _req: any,
    _file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => cb(null, uploadDir),
  filename: (
    _req: any,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: Number(process.env.MAX_FILE_SIZE || 10 * 1024 * 1024), // 10MB default
  },
  fileFilter: (
    _req: any,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile?: boolean) => void
  ) => {
    const extension = path.extname(file.originalname).slice(1).toLowerCase();
    if (!allowedFileTypes.has(extension)) {
      return cb(new Error(`File type not allowed: .${extension}`));
    }
    return cb(null, true);
  },
});

// Validation schema
const paperPresentationSchema = z.object({
  student_id: z.preprocess((value) => Number(value), z.number().int().positive()),
  student_name: z.string().min(1, 'Student name is required').max(255),
  paper_title: z.string().min(1, 'Paper title is required').max(512),
  event_start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD format'),
  event_end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD format'),
  academic_project_type: z.enum(['yes', 'no']),
  status: z.enum(['participated', 'winner']),
  iqac_verification: z.enum(['initiated', 'processing', 'completed']).default('initiated'),
  parental_department: z.string().optional(),
  image_proof_name: z.string().optional().nullable(),
  abstract_proof_name: z.string().optional().nullable(),
  certificate_proof_name: z.string().optional().nullable(),
  attested_cert_name: z.string().optional().nullable(),
});

type PaperPresentationInput = z.infer<typeof paperPresentationSchema>;

/**
 * POST /api/paper-presentations
 * Create a new paper presentation record
 */
router.post(
  '/',
  upload.fields([
    { name: 'image_proof', maxCount: 1 },
    { name: 'abstract_proof', maxCount: 1 },
    { name: 'certificate_proof', maxCount: 1 },
    { name: 'attested_cert', maxCount: 1 },
  ]),
  async (req: Request, res: Response) => {
    try {
      const parsed = paperPresentationSchema.parse(req.body);

      const files = req.files as Record<string, Express.Multer.File[]> | undefined;

      const imageFile = files?.image_proof?.[0];
      const abstractFile = files?.abstract_proof?.[0];
      const certificateFile = files?.certificate_proof?.[0];
      const attestedFile = files?.attested_cert?.[0];

      const imagePath = imageFile ? `/uploads/paper-presentations/${imageFile.filename}` : undefined;
      const abstractPath = abstractFile ? `/uploads/paper-presentations/${abstractFile.filename}` : undefined;
      const certificatePath = certificateFile
        ? `/uploads/paper-presentations/${certificateFile.filename}`
        : undefined;
      const attestedPath = attestedFile ? `/uploads/paper-presentations/${attestedFile.filename}` : undefined;

      const presentation = await paperPresentationService.createPresentation(
        {
          student_id: parsed.student_id,
          student_name: parsed.student_name,
          paper_title: parsed.paper_title,
          event_start_date: parsed.event_start_date,
          event_end_date: parsed.event_end_date,
          academic_project_type: parsed.academic_project_type,
          image_proof_path: imagePath,
          image_proof_name: parsed.image_proof_name || undefined,
          abstract_proof_path: abstractPath,
          abstract_proof_name: parsed.abstract_proof_name || undefined,
          certificate_proof_path: certificatePath,
          certificate_proof_name: parsed.certificate_proof_name || undefined,
          attested_cert_path: attestedPath,
          attested_cert_name: parsed.attested_cert_name || undefined,
          status: parsed.status,
          iqac_verification: parsed.iqac_verification,
          parental_department: parsed.parental_department,
        },
        req.body.created_by ? Number(req.body.created_by) : undefined
      );

      res.status(201).json({
        success: true,
        message: 'Paper presentation created successfully',
        data: presentation,
      });
    } catch (error) {
      logger.error('Error in POST /paper-presentations:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
      } else {
        res.status(500).json({
          success: false,
          message: error instanceof Error ? error.message : 'Internal server error',
        });
      }
    }
  }
);

/**
 * GET /api/paper-presentations
 * Get all paper presentations with optional filters
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const filters = {
      student_id: req.query.student_id ? Number(req.query.student_id) : undefined,
      status: (req.query.status as string) || undefined,
      iqac_verification: (req.query.iqac_verification as string) || undefined,
    };

    const presentations = await paperPresentationService.getAllPresentations(filters);

    res.json({
      success: true,
      data: presentations,
      count: presentations.length,
    });
  } catch (error) {
    logger.error('Error in GET /paper-presentations:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * GET /api/paper-presentations/:id
 * Get paper presentation by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const presentation = await paperPresentationService.getPresentationById(id);

    if (!presentation) {
      return res.status(404).json({ success: false, message: 'Paper presentation not found' });
    }

    res.json({
      success: true,
      data: presentation,
    });
  } catch (error) {
    logger.error('Error in GET /paper-presentations/:id:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * GET /api/paper-presentations/student/:studentId
 * Get all presentations by student ID
 */
router.get('/student/:studentId', async (req: Request, res: Response) => {
  try {
    const studentId = Number(req.params.studentId);
    if (isNaN(studentId)) {
      return res.status(400).json({ success: false, message: 'Invalid student ID' });
    }

    const presentations = await paperPresentationService.getPresentationsByStudent(studentId);

    res.json({
      success: true,
      data: presentations,
      count: presentations.length,
    });
  } catch (error) {
    logger.error('Error in GET /paper-presentations/student/:studentId:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * PUT /api/paper-presentations/:id
 * Update paper presentation record
 */
router.put(
  '/:id',
  upload.fields([
    { name: 'image_proof', maxCount: 1 },
    { name: 'abstract_proof', maxCount: 1 },
    { name: 'certificate_proof', maxCount: 1 },
    { name: 'attested_cert', maxCount: 1 },
  ]),
  async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Invalid ID' });
      }

      const parsed = paperPresentationSchema.partial().parse(req.body);

      const files = req.files as Record<string, Express.Multer.File[]> | undefined;

      const updateData: any = { ...parsed };

      if (files?.image_proof?.[0]) {
        updateData.image_proof_path = `/uploads/paper-presentations/${files.image_proof[0].filename}`;
      }
      if (files?.abstract_proof?.[0]) {
        updateData.abstract_proof_path = `/uploads/paper-presentations/${files.abstract_proof[0].filename}`;
      }
      if (files?.certificate_proof?.[0]) {
        updateData.certificate_proof_path = `/uploads/paper-presentations/${files.certificate_proof[0].filename}`;
      }
      if (files?.attested_cert?.[0]) {
        updateData.attested_cert_path = `/uploads/paper-presentations/${files.attested_cert[0].filename}`;
      }

      await paperPresentationService.updatePresentation(
        id,
        updateData,
        req.body.updated_by ? Number(req.body.updated_by) : undefined
      );

      const updatedPresentation = await paperPresentationService.getPresentationById(id);

      res.json({
        success: true,
        message: 'Paper presentation updated successfully',
        data: updatedPresentation,
      });
    } catch (error) {
      logger.error('Error in PUT /paper-presentations/:id:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
      } else {
        res.status(500).json({
          success: false,
          message: error instanceof Error ? error.message : 'Internal server error',
        });
      }
    }
  }
);

/**
 * PATCH /api/paper-presentations/:id/iqac-verification
 * Update IQAC verification status
 */
router.patch('/:id/iqac-verification', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    const { status } = req.body;
    if (!['initiated', 'processing', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Allowed: initiated, processing, completed',
      });
    }

    await paperPresentationService.updateIQACVerification(
      id,
      status,
      req.body.updated_by ? Number(req.body.updated_by) : undefined
    );

    const updatedPresentation = await paperPresentationService.getPresentationById(id);

    res.json({
      success: true,
      message: 'IQAC verification status updated successfully',
      data: updatedPresentation,
    });
  } catch (error) {
    logger.error('Error in PATCH /paper-presentations/:id/iqac-verification:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

/**
 * DELETE /api/paper-presentations/:id
 * Delete paper presentation record
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'Invalid ID' });
    }

    await paperPresentationService.deletePresentation(id);

    res.json({
      success: true,
      message: 'Paper presentation deleted successfully',
    });
  } catch (error) {
    logger.error('Error in DELETE /paper-presentations/:id:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

export default router;
