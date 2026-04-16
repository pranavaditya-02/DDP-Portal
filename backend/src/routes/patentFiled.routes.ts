import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import patentFiledService from '../services/patentFiled.service';
import { logger } from '../utils/logger';

const router = express.Router();

// Configure multer for file uploads
const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || './uploads/patent-filed');
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
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
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
 * POST /api/patents/filed
 * Create a new patent filed record
 */
router.post(
  '/',
  upload.fields([
    { name: 'yuktiRegistrationProof', maxCount: 1 },
    { name: 'apexProof', maxCount: 1 },
    { name: 'patentCBRReceipt', maxCount: 1 },
    { name: 'documentProof', maxCount: 1 },
  ]),
  async (req: Request, res: Response) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

      const formData = {
        preliminaryDataId: req.body.preliminaryDataId ? parseInt(req.body.preliminaryDataId) : null,
        claimedByFacultyId: req.body.claimedByFacultyId,
        claimedByFacultyName: req.body.claimedByFacultyName,
        patentContributionType: req.body.patentContributionType,
        taskId: req.body.taskId,
        yuktiRegistrationProofPath: files?.yuktiRegistrationProof?.[0]?.filename,

        specialLabsInvolved: req.body.specialLabsInvolved,
        specialLabId: req.body.specialLabId ? parseInt(req.body.specialLabId) : null,
        specialLabName: req.body.specialLabName,

        registrationDate: req.body.registrationDate,
        claimedByDepartmentId: parseInt(req.body.claimedByDepartmentId),
        claimedByDepartmentName: req.body.claimedByDepartmentName,
        filedApplicationNumber: req.body.filedApplicationNumber,

        earlyPublicationForm9Filed: req.body.earlyPublicationForm9Filed,
        examinationForm18Filed: req.body.examinationForm18Filed,

        collaborationType: req.body.collaborationType,
        collaboratingOrganizationName: req.body.collaboratingOrganizationName,

        bitNameIncludedInApplicant: req.body.bitNameIncludedInApplicant,
        patentLevel: req.body.patentLevel,

        patentLicensed: req.body.patentLicensed,
        patentLicenseDetails: req.body.patentLicenseDetails,

        fundFromManagement: req.body.fundFromManagement,
        fundAmount: req.body.fundAmount ? parseFloat(req.body.fundAmount) : null,
        apexProofPath: files?.apexProof?.[0]?.filename,

        sponsorshipFromAgency: req.body.sponsorshipFromAgency,
        fundingAgencyName: req.body.fundingAgencyName,

        patentCBRReceiptPath: files?.patentCBRReceipt?.[0]?.filename,
        documentProofPath: files?.documentProof?.[0]?.filename,

        facultyMembers: parseFacultyMembers(req.body),
        studentMembers: parseStudentMembers(req.body),

        createdBy: req.body.createdBy,
      };

      // Validation
      if (!formData.claimedByFacultyId?.trim()) {
        return res.status(400).json({ success: false, message: 'Faculty is required' });
      }
      if (!formData.taskId?.trim()) {
        return res.status(400).json({ success: false, message: 'Task ID is required' });
      }
      if (!formData.filedApplicationNumber?.trim()) {
        return res.status(400).json({ success: false, message: 'Filed application number is required' });
      }

      const result = await patentFiledService.create(formData as any);

      res.status(201).json({
        success: true,
        data: result,
        message: 'Patent filed record created successfully',
      });
    } catch (error) {
      logger.error('Error creating patent filed record:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create patent filed record',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      });
    }
  }
);

/**
 * GET /api/patents/filed/:id
 * Get a specific patent filed record
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const record = await patentFiledService.getById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Patent filed record not found',
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    logger.error('Error fetching patent filed record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patent filed record',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
});

/**
 * GET /api/patents/filed
 * List patent filed records with filters
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : 10;

    const filters = {
      claimedByFacultyId: req.query.facultyId,
      claimedByDepartmentId: req.query.departmentId ? parseInt(req.query.departmentId as string) : undefined,
      iqacVerification: req.query.iqacVerification,
    };

    const { records, total } = await patentFiledService.list(filters, page, pageSize);

    res.json({
      success: true,
      data: records,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    logger.error('Error listing patent filed records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list patent filed records',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
});

/**
 * PUT /api/patents/filed/:id
 * Update a patent filed record
 */
router.put(
  '/:id',
  upload.fields([
    { name: 'yuktiRegistrationProof', maxCount: 1 },
    { name: 'apexProof', maxCount: 1 },
    { name: 'patentCBRReceipt', maxCount: 1 },
    { name: 'documentProof', maxCount: 1 },
  ]),
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

      const updateData: any = {
        claimedByFacultyId: req.body.claimedByFacultyId,
        claimedByFacultyName: req.body.claimedByFacultyName,
        patentContributionType: req.body.patentContributionType,
        taskId: req.body.taskId,
        registrationDate: req.body.registrationDate,
        filedApplicationNumber: req.body.filedApplicationNumber,
        patentLevel: req.body.patentLevel,
        collaborationType: req.body.collaborationType,

        facultyMembers: parseFacultyMembers(req.body),
        studentMembers: parseStudentMembers(req.body),
      };

      if (files?.yuktiRegistrationProof?.[0]) {
        updateData.yuktiRegistrationProofPath = files.yuktiRegistrationProof[0].filename;
      }
      if (files?.apexProof?.[0]) {
        updateData.apexProofPath = files.apexProof[0].filename;
      }
      if (files?.patentCBRReceipt?.[0]) {
        updateData.patentCBRReceiptPath = files.patentCBRReceipt[0].filename;
      }
      if (files?.documentProof?.[0]) {
        updateData.documentProofPath = files.documentProof[0].filename;
      }

      await patentFiledService.update(id, updateData);

      res.json({
        success: true,
        message: 'Patent filed record updated successfully',
      });
    } catch (error) {
      logger.error('Error updating patent filed record:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update patent filed record',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      });
    }
  }
);

/**
 * DELETE /api/patents/filed/:id
 * Delete a patent filed record
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await patentFiledService.delete(id);

    res.json({
      success: true,
      message: 'Patent filed record deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting patent filed record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete patent filed record',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    });
  }
});

/**
 * Helper function to parse faculty members from request body
 */
function parseFacultyMembers(body: any) {
  const facultyMembers = [];
  for (let i = 1; i <= 6; i++) {
    const facultyIdKey = `faculty${i}Id`;
    const facultyNameKey = `faculty${i}Name`;
    const contributionKey = `faculty${i}Contribution`;

    if (body[facultyIdKey] && body[facultyNameKey]) {
      facultyMembers.push({
        number: i,
        facultyId: body[facultyIdKey],
        facultyName: body[facultyNameKey],
        patentContribution: body[contributionKey] || 'applicant',
      });
    }
  }
  return facultyMembers;
}

/**
 * Helper function to parse student members from request body
 */
function parseStudentMembers(body: any) {
  const studentMembers = [];
  for (let i = 1; i <= 5; i++) {
    const studentNameKey = `student${i}Name`;
    const contributionKey = `student${i}Contribution`;

    if (body[studentNameKey]) {
      studentMembers.push({
        number: i,
        studentName: body[studentNameKey],
        patentContribution: body[contributionKey] || 'applicant',
      });
    }
  }
  return studentMembers;
}

export default router;
