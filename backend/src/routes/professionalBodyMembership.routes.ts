import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import professionalBodyMembershipService from '../services/professionalBodyMembership.service';
import { sendEmail } from '../utils/mailer';
import { logger } from '../utils/logger';

const router = Router();

const uploadDir = path.join(process.cwd(), 'uploads', 'professional-body-membership');
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
      membershipCategoryId,
      specialLabsInvolved,
      specialLabId,
      professionalBodyName,
      membershipTypeId,
      membershipId,
      gradeLevelPosition,
      levelId,
      validityTypeId,
      amountSelfBitInrs,
      ifValidityOthers,
      amountOthersInrs,
    } = req.body;

    if (!submissionId || !membershipCategoryId) {
      return res.status(400).json({ message: 'Missing required fields: submissionId, membershipCategoryId' });
    }

    const data = {
      submissionId: parseInt(submissionId, 10),
      membershipCategoryId: parseInt(membershipCategoryId, 10),
      specialLabsInvolved: specialLabsInvolved === 'true' || specialLabsInvolved === true,
      specialLabId: specialLabId ? parseInt(specialLabId, 10) : null,
      professionalBodyName: professionalBodyName || null,
      membershipTypeId: membershipTypeId ? parseInt(membershipTypeId, 10) : null,
      membershipId: membershipId || null,
      gradeLevelPosition: gradeLevelPosition || null,
      levelId: levelId ? parseInt(levelId, 10) : null,
      validityTypeId: validityTypeId ? parseInt(validityTypeId, 10) : null,
      amountSelfBitInrs: amountSelfBitInrs ? parseFloat(amountSelfBitInrs) : null,
      ifValidityOthers: ifValidityOthers || null,
      amountOthersInrs: amountOthersInrs ? parseFloat(amountOthersInrs) : null,
    };

    const id = await professionalBodyMembershipService.create(data);
    res.status(201).json({ message: 'Professional Body Membership created successfully', id });
  } catch (error) {
    logger.error('Error creating membership:', error);
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to create membership' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const filters = {
      ...(req.query.submissionId && { submissionId: parseInt(req.query.submissionId as string, 10) }),
      ...(req.query.iqacVerification && { iqacVerification: req.query.iqacVerification as string }),
    };

    const page = parseInt((req.query.page as string) || '1', 10);
    const pageSize = parseInt((req.query.pageSize as string) || '10', 10);

    const { records, total } = await professionalBodyMembershipService.list(filters, page, pageSize);
    res.json({ data: records, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (error) {
    logger.error('Error listing memberships:', error);
    res.status(500).json({ message: 'Failed to list records', data: [] });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const record = await professionalBodyMembershipService.getById(parseInt(req.params.id, 10));
    if (!record) {
      return res.status(404).json({ message: 'Membership not found' });
    }
    res.json(record);
  } catch (error) {
    logger.error('Error fetching membership:', error);
    res.status(500).json({ message: 'Failed to fetch record' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const success = await professionalBodyMembershipService.update(parseInt(req.params.id, 10), req.body);
    if (!success) {
      return res.status(404).json({ message: 'Membership not found' });
    }
    res.json({ message: 'Membership updated successfully' });
  } catch (error) {
    logger.error('Error updating membership:', error);
    res.status(500).json({ message: 'Failed to update' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const success = await professionalBodyMembershipService.delete(parseInt(req.params.id, 10));
    if (!success) {
      return res.status(404).json({ message: 'Membership not found' });
    }
    res.json({ message: 'Membership deleted successfully' });
  } catch (error) {
    logger.error('Error deleting membership:', error);
    res.status(500).json({ message: 'Failed to delete' });
  }
});

router.put('/:id/iqac-status', async (req: Request, res: Response) => {
  try {
    const { iqacVerification, iqacRemarks } = req.body;

    if (!iqacVerification || !['initiated', 'approved', 'rejected'].includes(iqacVerification)) {
      return res.status(400).json({ message: 'Invalid IQAC verification status' });
    }

    const record = await professionalBodyMembershipService.getByIdWithSubmission(parseInt(req.params.id, 10));
    if (!record) {
      return res.status(404).json({ message: 'Membership not found' });
    }

    const updateData: any = { iqacVerification };
    if (iqacRemarks && iqacVerification === 'rejected') {
      updateData.iqacRemarks = iqacRemarks;
    }

    const success = await professionalBodyMembershipService.update(parseInt(req.params.id, 10), updateData);
    if (!success) {
      return res.status(404).json({ message: 'Membership not found' });
    }

    // Send email
    if (record.facultyEmail) {
      const statusText = iqacVerification === 'approved' ? 'APPROVED' : iqacVerification === 'rejected' ? 'REJECTED' : 'UNDER REVIEW';
      const subject = `Professional Body Membership Submission ${statusText} - BannariAmman College`;
      const bodyText = `Hello ${record.facultyName || 'Faculty'},\n\nYour Professional Body Membership submission (ID: ${record.id}, Body: "${record.professionalBodyName}") has been ${statusText} by the IQAC team.${iqacRemarks ? `\n\nReason: ${iqacRemarks}\n` : '\n'}\nIf you have any questions, please reply to this email.\n\nIQAC Team\nBannariAmman College`;
      const bodyHtml = `<p>Hello ${record.facultyName || 'Faculty'},</p><p>Your Professional Body Membership submission <strong>(ID: ${record.id})</strong> with body name <strong>"${record.professionalBodyName}"</strong> has been <strong>${statusText}</strong> by the IQAC team at <strong>BannariAmman College</strong>.</p>${iqacRemarks ? `<p><strong>Reason:</strong> ${iqacRemarks}</p>` : ''}<p>If you have any questions, please reply to this email.</p><p>IQAC Team<br/>BannariAmman College</p>`;

      try {
        await sendEmail({ to: record.facultyEmail, subject, text: bodyText, html: bodyHtml });
        logger.info(`Email sent to ${record.facultyEmail} for membership ${req.params.id}`);
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
