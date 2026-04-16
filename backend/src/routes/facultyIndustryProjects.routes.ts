import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import facultyIndustryProjectService from '../services/facultyIndustryProjects.service';
import { sendEmail } from '../utils/mailer';
import { logger } from '../utils/logger';

const router = Router();

const uploadDir = path.join(process.cwd(), 'uploads', 'faculty-industry-projects');
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

// POST: Create Faculty Industry Project
router.post('/', upload.any(), async (req: Request, res: Response) => {
  try {
    const {
      submissionId,
      sigNumber,
      specialLabsInvolved,
      specialLabId,
      studentsInvolved,
      industryName,
      industryTypeId,
      ifTypeOthers,
      projectTypeId,
      projectTitle,
      durationMonths,
      startDate,
      endDate,
      outcome,
    } = req.body;

    if (!submissionId || !projectTitle) {
      return res.status(400).json({ message: 'Missing required fields: submissionId, projectTitle' });
    }

    // Validate dates
    if (startDate && isNaN(new Date(startDate).getTime())) {
      return res.status(400).json({ message: 'Invalid startDate format' });
    }
    if (endDate && isNaN(new Date(endDate).getTime())) {
      return res.status(400).json({ message: 'Invalid endDate format' });
    }
    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ message: 'endDate must be after startDate' });
    }

    const projectData = {
      submissionId: parseInt(submissionId, 10),
      sigNumber: sigNumber || null,
      specialLabsInvolved: specialLabsInvolved === 'true' || specialLabsInvolved === true,
      specialLabId: specialLabId ? parseInt(specialLabId, 10) : null,
      studentsInvolved: studentsInvolved === 'true' || studentsInvolved === true,
      industryName: industryName || null,
      industryTypeId: industryTypeId ? parseInt(industryTypeId, 10) : null,
      ifTypeOthers: ifTypeOthers || null,
      projectTypeId: projectTypeId ? parseInt(projectTypeId, 10) : null,
      projectTitle,
      durationMonths: durationMonths ? parseInt(durationMonths, 10) : null,
      startDate: startDate || null,
      endDate: endDate || null,
      outcome: outcome || null,
    };

    const id = await facultyIndustryProjectService.create(projectData);
    res.status(201).json({ message: 'Faculty Industry Project created successfully', id });
  } catch (error) {
    logger.error('Error creating Faculty Industry Project:', error);
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to create Faculty Industry Project' });
  }
});

// GET: List all projects
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

    const { records, total } = await facultyIndustryProjectService.list(filters, page, pageSize);

    res.json({
      data: records,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    logger.error('Error listing Faculty Industry Projects:', error);
    res.status(500).json({ message: 'Failed to list projects', data: [] });
  }
});

// GET: Fetch single project
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const record = await facultyIndustryProjectService.getById(parseInt(id, 10));

    if (!record) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(record);
  } catch (error) {
    logger.error('Error fetching project:', error);
    res.status(500).json({ message: 'Failed to fetch project' });
  }
});

// PUT: Update project
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { projectTitle } = req.body;

    if (!projectTitle) {
      return res.status(400).json({ message: 'At least one field is required for update' });
    }

    const success = await facultyIndustryProjectService.update(parseInt(id, 10), { projectTitle });

    if (!success) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ message: 'Project updated successfully' });
  } catch (error) {
    logger.error('Error updating project:', error);
    res.status(500).json({ message: 'Failed to update project' });
  }
});

// DELETE: Delete project
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const success = await facultyIndustryProjectService.delete(parseInt(id, 10));

    if (!success) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    logger.error('Error deleting project:', error);
    res.status(500).json({ message: 'Failed to delete project' });
  }
});

// PUT: Update IQAC status
router.put('/:id/iqac-status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { iqacVerification, iqacRemarks } = req.body;

    if (!iqacVerification || !['initiated', 'approved', 'rejected'].includes(iqacVerification)) {
      return res.status(400).json({ message: 'Invalid IQAC verification status' });
    }

    const record = await facultyIndustryProjectService.getByIdWithSubmission(parseInt(id, 10));
    if (!record) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const updateData: any = { iqacVerification };
    if (iqacRemarks && iqacVerification === 'rejected') {
      updateData.iqacRemarks = iqacRemarks;
    }

    const success = await facultyIndustryProjectService.update(parseInt(id, 10), updateData);

    if (!success) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Send email
    if (record.facultyEmail) {
      const statusText = iqacVerification === 'approved' ? 'APPROVED' : iqacVerification === 'rejected' ? 'REJECTED' : 'UNDER REVIEW';
      const subject = `Faculty Industry Project Submission ${statusText} - BannariAmman College`;
      const bodyText = `Hello ${record.facultyName || 'Faculty'},\n\nYour Faculty Industry Project submission (ID: ${record.id}, Project: "${record.projectTitle}") has been ${statusText} by the IQAC team at BannariAmman College.${iqacRemarks ? `\n\nReason: ${iqacRemarks}\n` : '\n'}\nIf you have any questions, please reply to this email.\n\nIQAC Team\nBannariAmman College`;
      const bodyHtml = `<p>Hello ${record.facultyName || 'Faculty'},</p><p>Your Faculty Industry Project submission <strong>(ID: ${record.id})</strong> with project title <strong>"${record.projectTitle}"</strong> has been <strong>${statusText}</strong> by the IQAC team at <strong>BannariAmman College</strong>.</p>${iqacRemarks ? `<p><strong>Reason:</strong> ${iqacRemarks}</p>` : ''}<p>If you have any questions, please reply to this email.</p><p>IQAC Team<br/>BannariAmman College</p>`;

      try {
        await sendEmail({
          to: record.facultyEmail,
          subject,
          text: bodyText,
          html: bodyHtml,
        });
        logger.info(`Email sent to ${record.facultyEmail} for project ${id}`);
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

// Faculty Management Endpoints
// POST: Add faculty to project
router.post('/:projectId/faculty', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { facultyId, orderNo } = req.body;

    if (!facultyId || !orderNo) {
      return res.status(400).json({ message: 'Missing required fields: facultyId, orderNo' });
    }

    if (orderNo < 2 || orderNo > 5) {
      return res.status(400).json({ message: 'orderNo must be between 2 and 5' });
    }

    const id = await facultyIndustryProjectService.addFaculty(parseInt(projectId, 10), facultyId, parseInt(orderNo, 10));
    res.status(201).json({ message: 'Faculty added successfully', id });
  } catch (error) {
    logger.error('Error adding faculty:', error);
    res.status(500).json({ message: 'Failed to add faculty' });
  }
});

// GET: List faculty for project
router.get('/:projectId/faculty', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const faculty = await facultyIndustryProjectService.listFaculty(parseInt(projectId, 10));
    res.json({ data: faculty });
  } catch (error) {
    logger.error('Error listing faculty:', error);
    res.status(500).json({ message: 'Failed to list faculty' });
  }
});

// DELETE: Remove faculty from project
router.delete('/:projectId/faculty/:facultyId', async (req: Request, res: Response) => {
  try {
    const { projectId, facultyId } = req.params;

    const success = await facultyIndustryProjectService.removeFaculty(parseInt(projectId, 10), facultyId);

    if (!success) {
      return res.status(404).json({ message: 'Faculty not found in project' });
    }

    res.json({ message: 'Faculty removed successfully' });
  } catch (error) {
    logger.error('Error removing faculty:', error);
    res.status(500).json({ message: 'Failed to remove faculty' });
  }
});

// Student Management Endpoints
// POST: Add student to project
router.post('/:projectId/students', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { studentName, orderNo } = req.body;

    if (!studentName || !orderNo) {
      return res.status(400).json({ message: 'Missing required fields: studentName, orderNo' });
    }

    if (orderNo < 1 || orderNo > 5) {
      return res.status(400).json({ message: 'orderNo must be between 1 and 5' });
    }

    const id = await facultyIndustryProjectService.addStudent(parseInt(projectId, 10), studentName, parseInt(orderNo, 10));
    res.status(201).json({ message: 'Student added successfully', id });
  } catch (error) {
    logger.error('Error adding student:', error);
    res.status(500).json({ message: 'Failed to add student' });
  }
});

// GET: List students for project
router.get('/:projectId/students', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const students = await facultyIndustryProjectService.listStudents(parseInt(projectId, 10));
    res.json({ data: students });
  } catch (error) {
    logger.error('Error listing students:', error);
    res.status(500).json({ message: 'Failed to list students' });
  }
});

// DELETE: Remove student from project
router.delete('/:projectId/students/:studentId', async (req: Request, res: Response) => {
  try {
    const { projectId, studentId } = req.params;

    const success = await facultyIndustryProjectService.removeStudent(parseInt(projectId, 10), parseInt(studentId, 10));

    if (!success) {
      return res.status(404).json({ message: 'Student not found in project' });
    }

    res.json({ message: 'Student removed successfully' });
  } catch (error) {
    logger.error('Error removing student:', error);
    res.status(500).json({ message: 'Failed to remove student' });
  }
});

export default router;
