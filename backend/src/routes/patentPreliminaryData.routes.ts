import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import patentPreliminaryDataService from '../services/patentPreliminaryData.service';
import { logger } from '../utils/logger';
import { sendEmail } from '../utils/mailer';

const router = Router();

const uploadDir = path.join(process.cwd(), 'uploads', 'patent-preliminary-data');
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
      facultyId,
      facultyName,
      patentTitle,
      applicantType,
      patentType,
      supportedByExperimentation,
      priorArt,
      novelty,
      involveDrawings,
      formPrepared,
      iqacVerification,
    } = req.body;

    // Validate required fields - convert empty strings to null for better error messages
    if (!facultyId?.trim() || !patentTitle?.trim() || !applicantType?.trim() || !patentType?.trim()) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        received: { facultyId, patentTitle, applicantType, patentType }
      });
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

    // Normalize enum values to lowercase for yes/no fields
    const normalizeYesNo = (value: string): string => {
      if (!value) return 'no';
      return value.toLowerCase();
    };

    logger.info(`Received form submission for patent preliminary data`, { facultyId, applicantType, patentType });

    const patentData = {
      facultyId: String(facultyId || ''),
      facultyName: String(facultyName || ''),
      patentTitle: String(patentTitle || ''),
      applicantType: String(applicantType || ''),
      patentType: String(patentType || ''),
      supportedByExperimentation: normalizeYesNo(String(supportedByExperimentation || '')),
      priorArt: String(priorArt || ''),
      novelty: String(novelty || ''),
      involveDrawings: normalizeYesNo(String(involveDrawings || '')),
      formPrepared: normalizeYesNo(String(formPrepared || '')),
      iqacVerification: iqacVerification || 'initiated',
      experimentationProofPath: filePaths['experimentationProof'],
      drawingsProofPath: filePaths['drawingsProof'],
      formProofPath: filePaths['formProof'],
    };

    const id = await patentPreliminaryDataService.create(patentData);
    res.status(201).json({ message: 'Patent preliminary data created successfully', id });
  } catch (error) {
    logger.error('Error creating patent preliminary data:', error);
    console.error('Error creating patent preliminary data:', error);
    if (error instanceof Error) {
      if (error.message.includes('Table')) {
        return res.status(500).json({ message: 'Database table not found. Please run database migration.' });
      }
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to create patent preliminary data' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const record = await patentPreliminaryDataService.getById(parseInt(id, 10));

    if (!record) {
      return res.status(404).json({ message: 'Patent preliminary data not found' });
    }

    res.json(record);
  } catch (error) {
    logger.error('Error fetching patent preliminary data:', error);
    res.status(500).json({ message: 'Failed to fetch patent preliminary data' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    logger.info('GET /api/patents/preliminary-data');
    
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const filters = {
      faculty_id: req.query.faculty_id as string,
      iqac_verification: req.query.iqac_verification as string,
    };

    const result = await patentPreliminaryDataService.list(filters, page, pageSize);

    res.json({
      message: 'Patent preliminary data retrieved successfully',
      data: result.records,
      total: result.total,
      page,
      pageSize,
    });
  } catch (error) {
    logger.error('Error listing patent preliminary data records:', error);
    console.error('Error listing patent preliminary data records:', error);
    if (error instanceof Error && error.message.includes('Table')) {
      return res.status(500).json({ message: 'Database table not found. Please run database migration.' });
    }
    res.status(500).json({ message: 'Failed to list patent preliminary data records' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { iqacVerification, iqacVerificationRemarks } = req.body;

    if (!iqacVerification || !['initiated', 'approved', 'rejected'].includes(iqacVerification)) {
      return res.status(400).json({ message: 'Invalid IQAC verification status' });
    }

    // Get record with faculty email
    const record = await patentPreliminaryDataService.getByIdWithFacultyEmail(parseInt(id, 10));
    if (!record) {
      return res.status(404).json({ message: 'Patent preliminary data not found' });
    }

    const updateData: any = {
      iqacVerification,
    };

    if (iqacVerificationRemarks && iqacVerification === 'rejected') {
      updateData.iqacVerificationRemarks = iqacVerificationRemarks;
    }

    const success = await patentPreliminaryDataService.update(parseInt(id, 10), updateData);

    if (!success) {
      return res.status(404).json({ message: 'Patent preliminary data not found' });
    }

    // Send email notification to faculty
    if (record.facultyEmail) {
      const statusText = iqacVerification === 'approved' ? 'APPROVED' : iqacVerification === 'rejected' ? 'REJECTED' : 'UNDER REVIEW';
      const subject = `Patent Preliminary Data Submission ${statusText} - BannariAmman College`;
      const bodyText = `Hello ${record.facultyName || 'Faculty'},\n\nYour patent preliminary data submission (ID: ${record.id}, Patent: "${record.patentTitle}") has been ${statusText} by the IQAC team at BannariAmman College.${iqacVerificationRemarks ? `\n\nReason: ${iqacVerificationRemarks}\n` : '\n'}\nIf you have any questions, please reply to this email.\n\nIQAC Team\nBannariAmman College`;
      const bodyHtml = `<p>Hello ${record.facultyName || 'Faculty'},</p><p>Your patent preliminary data submission <strong>(ID: ${record.id})</strong> with patent title <strong>"${record.patentTitle}"</strong> has been <strong>${statusText}</strong> by the IQAC team at <strong>BannariAmman College</strong>.</p>${iqacVerificationRemarks ? `<p><strong>Reason:</strong> ${iqacVerificationRemarks}</p>` : ''}<p>If you have any questions, please reply to this email.</p><p>IQAC Team<br/>BannariAmman College</p>`;

      try {
        await sendEmail({
          to: record.facultyEmail,
          subject,
          text: bodyText,
          html: bodyHtml,
        });
        logger.info(`Email notification sent to ${record.facultyEmail} for patent preliminary data ${id}`);
      } catch (emailError) {
        const errorMessage = emailError instanceof Error ? emailError.message : String(emailError);
        logger.error('Failed to send patent preliminary data status email:', {
          error: errorMessage,
          to: record.facultyEmail,
          subject,
          fullError: emailError,
        });
        console.error('SMTP Error Details:', {
          message: errorMessage,
          recipient: record.facultyEmail,
          timestamp: new Date().toISOString(),
        });
        // Don't fail the request if email fails
      }
    }

    res.json({ message: 'Patent preliminary data updated successfully' });
  } catch (error) {
    logger.error('Error updating patent preliminary data:', error);
    res.status(500).json({ message: 'Failed to update patent preliminary data' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const success = await patentPreliminaryDataService.delete(parseInt(id, 10));

    if (!success) {
      return res.status(404).json({ message: 'Patent preliminary data not found' });
    }

    res.json({ message: 'Patent preliminary data deleted successfully' });
  } catch (error) {
    logger.error('Error deleting patent preliminary data:', error);
    res.status(500).json({ message: 'Failed to delete patent preliminary data' });
  }
});

export default router;
