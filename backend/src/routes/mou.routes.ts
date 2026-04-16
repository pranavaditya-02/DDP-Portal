import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import mouService from '../services/mou.service';
import { sendEmail } from '../utils/mailer';
import { logger } from '../utils/logger';

const router = Router();

const uploadDir = path.join(process.cwd(), 'uploads', 'mou');
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
      submissionId, sigNumber, specialLabsInvolved, specialLabId, claimingDepartmentId,
      mouTypeId, industryOrgTypeId, ifOrgTypeOthers, mouBasedOnId, domainArea,
      dateOfAgreement, legalNameCollaborator, industryLocation, industryAddress, industryWebsite,
      industryContactMobile, industryEmail, durationUnitId, numYears, numMonths,
      mouEffectFrom, mouEffectTill, scopeOfAgreement, objectivesAndGoals, boundariesAndLimitations,
      bitRolesResponsibilities, collaboratorRoles, spocName, spocDesignation, spocEmail, spocPhone,
      mouSigningInitiatedBy, numFaculty,
    } = req.body;

    if (!submissionId || !legalNameCollaborator) {
      return res.status(400).json({ message: 'Missing required fields: submissionId, legalNameCollaborator' });
    }

    // Validate dates
    if (dateOfAgreement && isNaN(new Date(dateOfAgreement).getTime())) {
      return res.status(400).json({ message: 'Invalid dateOfAgreement format' });
    }

    const data = {
      submissionId: parseInt(submissionId, 10),
      sigNumber: sigNumber || null,
      specialLabsInvolved: specialLabsInvolved === 'true' || specialLabsInvolved === true,
      specialLabId: specialLabId ? parseInt(specialLabId, 10) : null,
      claimingDepartmentId: claimingDepartmentId ? parseInt(claimingDepartmentId, 10) : null,
      mouTypeId: mouTypeId ? parseInt(mouTypeId, 10) : null,
      industryOrgTypeId: industryOrgTypeId ? parseInt(industryOrgTypeId, 10) : null,
      ifOrgTypeOthers: ifOrgTypeOthers || null,
      mouBasedOnId: mouBasedOnId ? parseInt(mouBasedOnId, 10) : null,
      domainArea: domainArea || null,
      dateOfAgreement: dateOfAgreement || null,
      legalNameCollaborator,
      industryLocation: industryLocation || null,
      industryAddress: industryAddress || null,
      industryWebsite: industryWebsite || null,
      industryContactMobile: industryContactMobile || null,
      industryEmail: industryEmail || null,
      durationUnitId: durationUnitId ? parseInt(durationUnitId, 10) : null,
      numYears: numYears ? parseInt(numYears, 10) : null,
      numMonths: numMonths ? parseInt(numMonths, 10) : null,
      mouEffectFrom: mouEffectFrom || null,
      mouEffectTill: mouEffectTill || null,
      scopeOfAgreement: scopeOfAgreement || null,
      objectivesAndGoals: objectivesAndGoals || null,
      boundariesAndLimitations: boundariesAndLimitations || null,
      bitRolesResponsibilities: bitRolesResponsibilities || null,
      collaboratorRoles: collaboratorRoles || null,
      spocName: spocName || null,
      spocDesignation: spocDesignation || null,
      spocEmail: spocEmail || null,
      spocPhone: spocPhone || null,
      mouSigningInitiatedBy: mouSigningInitiatedBy || null,
      numFaculty: numFaculty ? parseInt(numFaculty, 10) : null,
    };

    const id = await mouService.create(data);
    res.status(201).json({ message: 'MoU created successfully', id });
  } catch (error) {
    logger.error('Error creating MoU:', error);
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to create MoU' });
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

    const { records, total } = await mouService.list(filters, page, pageSize);
    res.json({ data: records, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (error) {
    logger.error('Error listing MOUs:', error);
    res.status(500).json({ message: 'Failed to list records', data: [] });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const record = await mouService.getById(parseInt(req.params.id, 10));
    if (!record) {
      return res.status(404).json({ message: 'MoU not found' });
    }
    res.json(record);
  } catch (error) {
    logger.error('Error fetching MoU:', error);
    res.status(500).json({ message: 'Failed to fetch record' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const success = await mouService.update(parseInt(req.params.id, 10), req.body);
    if (!success) {
      return res.status(404).json({ message: 'MoU not found' });
    }
    res.json({ message: 'MoU updated successfully' });
  } catch (error) {
    logger.error('Error updating MoU:', error);
    res.status(500).json({ message: 'Failed to update' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const success = await mouService.delete(parseInt(req.params.id, 10));
    if (!success) {
      return res.status(404).json({ message: 'MoU not found' });
    }
    res.json({ message: 'MoU deleted successfully' });
  } catch (error) {
    logger.error('Error deleting MoU:', error);
    res.status(500).json({ message: 'Failed to delete' });
  }
});

router.put('/:id/iqac-status', async (req: Request, res: Response) => {
  try {
    const { iqacVerification, iqacRemarks } = req.body;

    if (!iqacVerification || !['initiated', 'approved', 'rejected'].includes(iqacVerification)) {
      return res.status(400).json({ message: 'Invalid IQAC verification status' });
    }

    const record = await mouService.getByIdWithSubmission(parseInt(req.params.id, 10));
    if (!record) {
      return res.status(404).json({ message: 'MoU not found' });
    }

    const updateData: any = { iqacVerification };
    if (iqacRemarks && iqacVerification === 'rejected') {
      updateData.iqacRemarks = iqacRemarks;
    }

    const success = await mouService.update(parseInt(req.params.id, 10), updateData);
    if (!success) {
      return res.status(404).json({ message: 'MoU not found' });
    }

    // Send email
    if (record.facultyEmail) {
      const statusText = iqacVerification === 'approved' ? 'APPROVED' : iqacVerification === 'rejected' ? 'REJECTED' : 'UNDER REVIEW';
      const subject = `MoU Submission ${statusText} - BannariAmman College`;
      const bodyText = `Hello ${record.facultyName || 'Faculty'},\n\nYour MoU submission (ID: ${record.id}, Collaborator: "${record.legalNameCollaborator}") has been ${statusText} by the IQAC team.${iqacRemarks ? `\n\nReason: ${iqacRemarks}\n` : '\n'}\nIf you have any questions, please reply to this email.\n\nIQAC Team\nBannariAmman College`;
      const bodyHtml = `<p>Hello ${record.facultyName || 'Faculty'},</p><p>Your MoU submission <strong>(ID: ${record.id})</strong> with collaborator <strong>"${record.legalNameCollaborator}"</strong> has been <strong>${statusText}</strong> by the IQAC team at <strong>BannariAmman College</strong>.</p>${iqacRemarks ? `<p><strong>Reason:</strong> ${iqacRemarks}</p>` : ''}<p>If you have any questions, please reply to this email.</p><p>IQAC Team<br/>BannariAmman College</p>`;

      try {
        await sendEmail({ to: record.facultyEmail, subject, text: bodyText, html: bodyHtml });
        logger.info(`Email sent to ${record.facultyEmail} for MoU ${req.params.id}`);
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

// FACULTY MANAGEMENT
router.post('/:mouId/faculty', async (req: Request, res: Response) => {
  try {
    const { facultyId, orderNo } = req.body;
    if (!facultyId || !orderNo || orderNo < 1 || orderNo > 3) {
      return res.status(400).json({ message: 'Invalid facultyId or orderNo (1-3)' });
    }
    const id = await mouService.addFaculty(parseInt(req.params.mouId, 10), facultyId, parseInt(orderNo, 10));
    res.status(201).json({ message: 'Faculty added', id });
  } catch (error) {
    logger.error('Error adding faculty:', error);
    res.status(500).json({ message: 'Failed to add faculty' });
  }
});

router.get('/:mouId/faculty', async (req: Request, res: Response) => {
  try {
    const faculty = await mouService.listFaculty(parseInt(req.params.mouId, 10));
    res.json({ data: faculty });
  } catch (error) {
    logger.error('Error listing faculty:', error);
    res.status(500).json({ message: 'Failed to list faculty' });
  }
});

router.delete('/:mouId/faculty/:facultyId', async (req: Request, res: Response) => {
  try {
    const success = await mouService.removeFaculty(parseInt(req.params.mouId, 10), req.params.facultyId);
    if (!success) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    res.json({ message: 'Faculty removed' });
  } catch (error) {
    logger.error('Error removing faculty:', error);
    res.status(500).json({ message: 'Failed to remove faculty' });
  }
});

// PURPOSE MANAGEMENT
router.post('/:mouId/purposes', async (req: Request, res: Response) => {
  try {
    const { purposeId } = req.body;
    if (!purposeId) {
      return res.status(400).json({ message: 'purposeId is required' });
    }
    const id = await mouService.addPurpose(parseInt(req.params.mouId, 10), parseInt(purposeId, 10));
    res.status(201).json({ message: 'Purpose added', id });
  } catch (error) {
    logger.error('Error adding purpose:', error);
    res.status(500).json({ message: 'Failed to add purpose' });
  }
});

router.get('/:mouId/purposes', async (req: Request, res: Response) => {
  try {
    const purposes = await mouService.listPurposes(parseInt(req.params.mouId, 10));
    res.json({ data: purposes });
  } catch (error) {
    logger.error('Error listing purposes:', error);
    res.status(500).json({ message: 'Failed to list purposes' });
  }
});

router.delete('/:mouId/purposes/:purposeId', async (req: Request, res: Response) => {
  try {
    const success = await mouService.removePurpose(parseInt(req.params.mouId, 10), parseInt(req.params.purposeId, 10));
    if (!success) {
      return res.status(404).json({ message: 'Purpose not found' });
    }
    res.json({ message: 'Purpose removed' });
  } catch (error) {
    logger.error('Error removing purpose:', error);
    res.status(500).json({ message: 'Failed to remove purpose' });
  }
});

export default router;
