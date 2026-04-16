import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import irpVisitService from '../services/irpVisit.service';
import { sendEmail } from '../utils/mailer';
import { logger } from '../utils/logger';

const router = Router();

const uploadDir = path.join(process.cwd(), 'uploads', 'irp-visit');
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

// POST: Create IRP Visit
router.post('/', upload.any(), async (req: Request, res: Response) => {
  try {
    const {
      submissionId,
      sigNumber,
      specialLabsInvolved,
      specialLabId,
      numFaculty,
      claimedForFacultyId,
      claimedForDepartmentId,
      approvalTypeId,
      apexNo,
      isMouRelated,
      mouId,
      mouRelationPoints,
      fromDate,
      toDate,
      interactionModeId,
      ifModeOthers,
      purposeId,
      amountIncurredInrs,
      numIndustry,
    } = req.body;

    if (!submissionId) {
      return res.status(400).json({ message: 'Missing required field: submissionId' });
    }

    // Validate dates
    if (fromDate && isNaN(new Date(fromDate).getTime())) {
      return res.status(400).json({ message: 'Invalid fromDate format' });
    }
    if (toDate && isNaN(new Date(toDate).getTime())) {
      return res.status(400).json({ message: 'Invalid toDate format' });
    }
    if (fromDate && toDate && new Date(toDate) <= new Date(fromDate)) {
      return res.status(400).json({ message: 'toDate must be after fromDate' });
    }

    // Validate faculty count
    if (numFaculty && (numFaculty < 1 || numFaculty > 6)) {
      return res.status(400).json({ message: 'numFaculty must be between 1 and 6' });
    }

    // Validate industry count
    if (numIndustry && (numIndustry < 1 || numIndustry > 6)) {
      return res.status(400).json({ message: 'numIndustry must be between 1 and 6' });
    }

    const data = {
      submissionId: parseInt(submissionId, 10),
      sigNumber: sigNumber || null,
      specialLabsInvolved: specialLabsInvolved === 'true' || specialLabsInvolved === true,
      specialLabId: specialLabId ? parseInt(specialLabId, 10) : null,
      numFaculty: numFaculty ? parseInt(numFaculty, 10) : null,
      claimedForFacultyId: claimedForFacultyId || null,
      claimedForDepartmentId: claimedForDepartmentId ? parseInt(claimedForDepartmentId, 10) : null,
      approvalTypeId: approvalTypeId ? parseInt(approvalTypeId, 10) : null,
      apexNo: apexNo || null,
      isMouRelated: isMouRelated === 'true' || isMouRelated === true,
      mouId: mouId ? parseInt(mouId, 10) : null,
      mouRelationPoints: mouRelationPoints || null,
      fromDate: fromDate || null,
      toDate: toDate || null,
      interactionModeId: interactionModeId ? parseInt(interactionModeId, 10) : null,
      ifModeOthers: ifModeOthers || null,
      purposeId: purposeId ? parseInt(purposeId, 10) : null,
      amountIncurredInrs: amountIncurredInrs ? parseFloat(amountIncurredInrs) : null,
      numIndustry: numIndustry ? parseInt(numIndustry, 10) : null,
    };

    const id = await irpVisitService.create(data);
    res.status(201).json({ message: 'IRP Visit created successfully', id });
  } catch (error) {
    logger.error('Error creating IRP Visit:', error);
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to create IRP Visit' });
  }
});

// GET: List all
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

    const { records, total } = await irpVisitService.list(filters, page, pageSize);

    res.json({ data: records, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (error) {
    logger.error('Error listing IRP Visits:', error);
    res.status(500).json({ message: 'Failed to list records', data: [] });
  }
});

// GET: Fetch single record
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const record = await irpVisitService.getById(parseInt(req.params.id, 10));
    if (!record) {
      return res.status(404).json({ message: 'IRP Visit not found' });
    }
    res.json(record);
  } catch (error) {
    logger.error('Error fetching IRP Visit:', error);
    res.status(500).json({ message: 'Failed to fetch record' });
  }
});

// PUT: Update
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const success = await irpVisitService.update(parseInt(req.params.id, 10), req.body);
    if (!success) {
      return res.status(404).json({ message: 'IRP Visit not found' });
    }
    res.json({ message: 'IRP Visit updated successfully' });
  } catch (error) {
    logger.error('Error updating IRP Visit:', error);
    res.status(500).json({ message: 'Failed to update' });
  }
});

// DELETE: Delete
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const success = await irpVisitService.delete(parseInt(req.params.id, 10));
    if (!success) {
      return res.status(404).json({ message: 'IRP Visit not found' });
    }
    res.json({ message: 'IRP Visit deleted successfully' });
  } catch (error) {
    logger.error('Error deleting IRP Visit:', error);
    res.status(500).json({ message: 'Failed to delete' });
  }
});

// PUT: Update IQAC status
router.put('/:id/iqac-status', async (req: Request, res: Response) => {
  try {
    const { iqacVerification, iqacRemarks } = req.body;

    if (!iqacVerification || !['initiated', 'approved', 'rejected'].includes(iqacVerification)) {
      return res.status(400).json({ message: 'Invalid IQAC verification status' });
    }

    const record = await irpVisitService.getByIdWithSubmission(parseInt(req.params.id, 10));
    if (!record) {
      return res.status(404).json({ message: 'IRP Visit not found' });
    }

    const updateData: any = { iqacVerification };
    if (iqacRemarks && iqacVerification === 'rejected') {
      updateData.iqacRemarks = iqacRemarks;
    }

    const success = await irpVisitService.update(parseInt(req.params.id, 10), updateData);
    if (!success) {
      return res.status(404).json({ message: 'IRP Visit not found' });
    }

    // Send email
    if (record.facultyEmail) {
      const statusText = iqacVerification === 'approved' ? 'APPROVED' : iqacVerification === 'rejected' ? 'REJECTED' : 'UNDER REVIEW';
      const subject = `IRP Visit Submission ${statusText} - BannariAmman College`;
      const bodyText = `Hello ${record.facultyName || 'Faculty'},\n\nYour IRP Visit submission (ID: ${record.id}) has been ${statusText} by the IQAC team at BannariAmman College.${iqacRemarks ? `\n\nReason: ${iqacRemarks}\n` : '\n'}\nIf you have any questions, please reply to this email.\n\nIQAC Team\nBannariAmman College`;
      const bodyHtml = `<p>Hello ${record.facultyName || 'Faculty'},</p><p>Your IRP Visit submission <strong>(ID: ${record.id})</strong> has been <strong>${statusText}</strong> by the IQAC team at <strong>BannariAmman College</strong>.</p>${iqacRemarks ? `<p><strong>Reason:</strong> ${iqacRemarks}</p>` : ''}<p>If you have any questions, please reply to this email.</p><p>IQAC Team<br/>BannariAmman College</p>`;

      try {
        await sendEmail({ to: record.facultyEmail, subject, text: bodyText, html: bodyHtml });
        logger.info(`Email sent to ${record.facultyEmail} for IRP Visit ${req.params.id}`);
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
router.post('/:irpVisitId/faculty', async (req: Request, res: Response) => {
  try {
    const { facultyId, orderNo } = req.body;
    if (!facultyId || !orderNo || orderNo < 1 || orderNo > 6) {
      return res.status(400).json({ message: 'Invalid facultyId or orderNo (1-6)' });
    }
    const id = await irpVisitService.addFaculty(parseInt(req.params.irpVisitId, 10), facultyId, parseInt(orderNo, 10));
    res.status(201).json({ message: 'Faculty added', id });
  } catch (error) {
    logger.error('Error adding faculty:', error);
    res.status(500).json({ message: 'Failed to add faculty' });
  }
});

router.get('/:irpVisitId/faculty', async (req: Request, res: Response) => {
  try {
    const faculty = await irpVisitService.listFaculty(parseInt(req.params.irpVisitId, 10));
    res.json({ data: faculty });
  } catch (error) {
    logger.error('Error listing faculty:', error);
    res.status(500).json({ message: 'Failed to list faculty' });
  }
});

router.delete('/:irpVisitId/faculty/:facultyId', async (req: Request, res: Response) => {
  try {
    const success = await irpVisitService.removeFaculty(parseInt(req.params.irpVisitId, 10), req.params.facultyId);
    if (!success) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    res.json({ message: 'Faculty removed' });
  } catch (error) {
    logger.error('Error removing faculty:', error);
    res.status(500).json({ message: 'Failed to remove faculty' });
  }
});

// INDUSTRY CONTACT MANAGEMENT
router.post('/:irpVisitId/industry-contacts', async (req: Request, res: Response) => {
  try {
    const { industryOrder, industryName, designation, phone, email } = req.body;
    if (!industryOrder || !industryName || industryOrder < 1 || industryOrder > 6) {
      return res.status(400).json({ message: 'Invalid fields or industryOrder (1-6)' });
    }
    const id = await irpVisitService.addIndustryContact(
      parseInt(req.params.irpVisitId, 10),
      parseInt(industryOrder, 10),
      industryName,
      designation || null,
      phone || null,
      email || null
    );
    res.status(201).json({ message: 'Industry contact added', id });
  } catch (error) {
    logger.error('Error adding industry contact:', error);
    res.status(500).json({ message: 'Failed to add contact' });
  }
});

router.get('/:irpVisitId/industry-contacts', async (req: Request, res: Response) => {
  try {
    const contacts = await irpVisitService.listIndustryContacts(parseInt(req.params.irpVisitId, 10));
    res.json({ data: contacts });
  } catch (error) {
    logger.error('Error listing industry contacts:', error);
    res.status(500).json({ message: 'Failed to list contacts' });
  }
});

router.delete('/:irpVisitId/industry-contacts/:contactId', async (req: Request, res: Response) => {
  try {
    const success = await irpVisitService.removeIndustryContact(parseInt(req.params.irpVisitId, 10), parseInt(req.params.contactId, 10));
    if (!success) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.json({ message: 'Industry contact removed' });
  } catch (error) {
    logger.error('Error removing industry contact:', error);
    res.status(500).json({ message: 'Failed to remove contact' });
  }
});

export default router;
