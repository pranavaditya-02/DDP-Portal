import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import labDevelopedByIndustryService from '../services/labDevelopedByIndustry.service';
import { sendEmail } from '../utils/mailer';
import { logger } from '../utils/logger';

const router = Router();

const uploadDir = path.join(process.cwd(), 'uploads', 'lab-developed-by-industry');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
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
      submissionId,
      sigNumber,
      labName,
      collaborativeIndustry,
      domainArea,
      labAreaSqM,
      totalAmountInrs,
      bitContributionInrs,
      industryFinancialSupportInrs,
      anyEquipmentSponsored,
      sponsoredEquipmentNames,
      anyEquipmentEnhancement,
      enhancedEquipmentNames,
      layoutDesignTypeId,
      curriculumMapping,
      expectedOutcomes,
    } = req.body;

    if (!submissionId || !labName) {
      return res.status(400).json({ message: 'Missing required fields: submissionId, labName' });
    }

    const data = {
      submissionId: parseInt(submissionId, 10),
      sigNumber: sigNumber || null,
      labName,
      collaborativeIndustry: collaborativeIndustry || null,
      domainArea: domainArea || null,
      labAreaSqM: labAreaSqM ? parseFloat(labAreaSqM) : null,
      totalAmountInrs: totalAmountInrs ? parseFloat(totalAmountInrs) : null,
      bitContributionInrs: bitContributionInrs ? parseFloat(bitContributionInrs) : null,
      industryFinancialSupportInrs: industryFinancialSupportInrs ? parseFloat(industryFinancialSupportInrs) : null,
      anyEquipmentSponsored: anyEquipmentSponsored === 'true' || anyEquipmentSponsored === true,
      sponsoredEquipmentNames: sponsoredEquipmentNames || null,
      anyEquipmentEnhancement: anyEquipmentEnhancement === 'true' || anyEquipmentEnhancement === true,
      enhancedEquipmentNames: enhancedEquipmentNames || null,
      layoutDesignTypeId: layoutDesignTypeId ? parseInt(layoutDesignTypeId, 10) : null,
      curriculumMapping: curriculumMapping || null,
      expectedOutcomes: expectedOutcomes || null,
    };

    const id = await labDevelopedByIndustryService.create(data);
    res.status(201).json({ message: 'Lab created successfully', id });
  } catch (error) {
    logger.error('Error creating lab:', error);
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to create lab' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const submissionId = req.query.submissionId as string | undefined;
    const iqacVerification = req.query.iqacVerification as string | undefined;
    const page = parseInt((req.query.page as string) || '1', 10);
    const pageSize = parseInt((req.query.pageSize as string) || '10', 10);

    const filters = {
      ...(submissionId && { submissionId: parseInt(submissionId, 10) }),
      ...(iqacVerification && { iqacVerification }),
    };

    const { records, total } = await labDevelopedByIndustryService.list(filters, page, pageSize);
    res.json({ data: records, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (error) {
    logger.error('Error listing labs:', error);
    res.status(500).json({ message: 'Failed to list labs', data: [] });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const record = await labDevelopedByIndustryService.getById(parseInt(req.params.id, 10));
    if (!record) {
      return res.status(404).json({ message: 'Lab not found' });
    }
    res.json(record);
  } catch (error) {
    logger.error('Error fetching lab:', error);
    res.status(500).json({ message: 'Failed to fetch lab' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { labName } = req.body;
    if (!labName) {
      return res.status(400).json({ message: 'At least one field required' });
    }

    const success = await labDevelopedByIndustryService.update(parseInt(req.params.id, 10), { labName });
    if (!success) {
      return res.status(404).json({ message: 'Lab not found' });
    }
    res.json({ message: 'Lab updated successfully' });
  } catch (error) {
    logger.error('Error updating lab:', error);
    res.status(500).json({ message: 'Failed to update lab' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const success = await labDevelopedByIndustryService.delete(parseInt(req.params.id, 10));
    if (!success) {
      return res.status(404).json({ message: 'Lab not found' });
    }
    res.json({ message: 'Lab deleted successfully' });
  } catch (error) {
    logger.error('Error deleting lab:', error);
    res.status(500).json({ message: 'Failed to delete lab' });
  }
});

router.put('/:id/iqac-status', async (req: Request, res: Response) => {
  try {
    const { iqacVerification, iqacRemarks } = req.body;

    if (!iqacVerification || !['initiated', 'approved', 'rejected'].includes(iqacVerification)) {
      return res.status(400).json({ message: 'Invalid IQAC verification status' });
    }

    const record = await labDevelopedByIndustryService.getByIdWithSubmission(parseInt(req.params.id, 10));
    if (!record) {
      return res.status(404).json({ message: 'Lab not found' });
    }

    const updateData: any = { iqacVerification };
    if (iqacRemarks && iqacVerification === 'rejected') {
      updateData.iqacRemarks = iqacRemarks;
    }

    const success = await labDevelopedByIndustryService.update(parseInt(req.params.id, 10), updateData);
    if (!success) {
      return res.status(404).json({ message: 'Lab not found' });
    }

    // Send email
    if (record.facultyEmail) {
      const statusText = iqacVerification === 'approved' ? 'APPROVED' : iqacVerification === 'rejected' ? 'REJECTED' : 'UNDER REVIEW';
      const subject = `Lab Submission ${statusText} - BannariAmman College`;
      const bodyText = `Hello ${record.facultyName || 'Faculty'},\n\nYour Lab submission (ID: ${record.id}, Lab: "${record.labName}") has been ${statusText} by the IQAC team.${iqacRemarks ? `\n\nReason: ${iqacRemarks}\n` : '\n'}\nIf you have any questions, please reply to this email.\n\nIQAC Team\nBannariAmman College`;
      const bodyHtml = `<p>Hello ${record.facultyName || 'Faculty'},</p><p>Your Lab submission <strong>(ID: ${record.id})</strong> with lab name <strong>"${record.labName}"</strong> has been <strong>${statusText}</strong> by the IQAC team at <strong>BannariAmman College</strong>.</p>${iqacRemarks ? `<p><strong>Reason:</strong> ${iqacRemarks}</p>` : ''}<p>If you have any questions, please reply to this email.</p><p>IQAC Team<br/>BannariAmman College</p>`;

      try {
        await sendEmail({ to: record.facultyEmail, subject, text: bodyText, html: bodyHtml });
        logger.info(`Email sent to ${record.facultyEmail} for lab ${req.params.id}`);
      } catch (emailError) {
        logger.error('Failed to send email:', emailError);
      }
    }

    res.json({ message: 'IQAC status updated successfully' });
  } catch (error) {
    logger.error('Error updating IQAC status:', error);
    res.status(500).json({ message: 'Failed to update IQAC status' });
  }
});

export default router;
