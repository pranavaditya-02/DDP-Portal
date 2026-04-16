import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import patentGrantedService from '../services/patentGranted.service';

const router = Router();

const uploadDir = path.join(process.cwd(), 'uploads', 'patent-granted');
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

router.post('/', upload.any(), async (req: Request, res: Response) => {
  try {
    const {
      applyFrom,
      claimedByFacultyId,
      claimedByFacultyName,
      taskId,
      dateOfGrant,
      grantedApplicationNumber,
      iqacVerification,
    } = req.body;

    // Validate required fields
    if (!applyFrom || !claimedByFacultyId || !taskId || !dateOfGrant || !grantedApplicationNumber) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get file paths (if files were uploaded)
    const files = req.files as Express.Multer.File[];
    const filePaths: Record<string, string> = {};

    if (files && files.length > 0) {
      files.forEach((file) => {
        if (!filePaths[file.fieldname]) {
          filePaths[file.fieldname] = file.path;
        }
      });
    }

    const patentData = {
      applyFrom,
      claimedByFacultyId,
      claimedByFacultyName,
      taskId,
      dateOfGrant,
      grantedApplicationNumber,
      iqacVerification: iqacVerification || 'initiated',
      yuktiPortalRegistrationProofPath: filePaths['yuktiPortalRegistrationProof'],
      grantReceiptProofPath: filePaths['grantReceiptProof'],
      grantDocumentsPath: filePaths['grantDocuments'],
    };

    const id = await patentGrantedService.create(patentData);
    res.status(201).json({ message: 'Patent granted created successfully', id });
  } catch (error) {
    console.error('Error creating patent granted:', error);
    if (error instanceof Error) {
      if (error.message.includes('Table')) {
        return res.status(500).json({ message: 'Database table not found. Please run database migration: mysql < database/patent_complete_schema.sql' });
      }
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to create patent granted' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const record = await patentGrantedService.getById(parseInt(id, 10));

    if (!record) {
      return res.status(404).json({ message: 'Patent granted not found' });
    }

    res.json(record);
  } catch (error) {
    console.error('Error fetching patent granted:', error);
    res.status(500).json({ message: 'Failed to fetch patent granted' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const claimedByFacultyId = req.query.claimedByFacultyId as string | undefined;
    const iqacVerification = req.query.iqacVerification as string | undefined;
    const applyFrom = req.query.applyFrom as string | undefined;
    const page = parseInt((req.query.page as string) || '1', 10);
    const pageSize = parseInt((req.query.pageSize as string) || '10', 10);

    const filters = {
      ...(claimedByFacultyId && { claimedByFacultyId }),
      ...(iqacVerification && { iqacVerification }),
      ...(applyFrom && { applyFrom }),
    };

    const { records, total } = await patentGrantedService.list(filters, page, pageSize);

    res.json({
      data: records,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error: any) {
    console.error('Error fetching patents granted:', error);
    
    // Check if it's a table not found error
    if (error.message && error.message.includes('Table')) {
      return res.status(503).json({ 
        message: 'Database table not found. Please run: mysql < database/patent_complete_schema.sql',
        data: []
      });
    }
    
    res.status(500).json({ message: 'Failed to fetch patents granted', data: [] });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { iqacVerification, iqacVerificationRemarks } = req.body;

    const success = await patentGrantedService.update(parseInt(id, 10), {
      iqacVerification,
      iqacVerificationRemarks,
    });

    if (!success) {
      return res.status(404).json({ message: 'Patent granted not found' });
    }

    res.json({ message: 'Patent granted updated successfully' });
  } catch (error) {
    console.error('Error updating patent granted:', error);
    res.status(500).json({ message: 'Failed to update patent granted' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const record = await patentGrantedService.getById(parseInt(id, 10));

    if (!record) {
      return res.status(404).json({ message: 'Patent granted not found' });
    }

    // In a real application, you'd want to delete files here and then delete the record
    // For now, we'll just log it

    res.json({ message: 'Patent granted deleted (feature to be implemented)' });
  } catch (error) {
    console.error('Error deleting patent granted:', error);
    res.status(500).json({ message: 'Failed to delete patent granted' });
  }
});

export default router;
