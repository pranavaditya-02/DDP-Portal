import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { OkPacket, RowDataPacket } from 'mysql2';
import { getMysqlPool } from '../database/mysql';
import { logger } from '../utils/logger';

const router = express.Router();
const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || './uploads', 'online-courses');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const generateFileUrl = (filename: string) => {
  const baseUrl = (process.env.SERVER_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000')
    .replace(/\/$/, '')
    .replace(/\/api$/, '');
  return `${baseUrl}/uploads/online-courses/${filename}`;
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (_req: express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and image files (JPG, PNG) are allowed'));
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

router.post(
  '/student-online-courses',
  upload.fields([
    { name: 'originalProof', maxCount: 1 },
    { name: 'attendedProof', maxCount: 1 },
  ]),
  async (req, res) => {
    const connection = await getMysqlPool().getConnection();

    try {
      await connection.beginTransaction();

      const {
        student,
        yearOfStudy,
        specialLab,
        onlineCourse,
        courseType,
        marksAvailable,
        marksObtained,
        startDate,
        endDate,
        examDate,
        durationWeeks,
        partOfAcademic,
        semester,
        sponsorshipType,
        interdisciplinary,
        department,
        certificateUrl,
        iqacVerification,
      } = req.body as Record<string, any>;

      const requiredFields = [
        'student',
        'yearOfStudy',
        'specialLab',
        'onlineCourse',
        'courseType',
        'marksAvailable',
        'startDate',
        'endDate',
        'examDate',
        'durationWeeks',
        'partOfAcademic',
        'sponsorshipType',
        'interdisciplinary',
        'certificateUrl',
        'iqacVerification',
      ];

      for (const field of requiredFields) {
        if (!req.body[field]) {
          return res.status(400).json({ error: `Missing required field: ${field}` });
        }
      }

      if (marksAvailable === 'Yes' && !marksObtained) {
        return res.status(400).json({ error: "Marks Obtained is required when Marks Available is 'Yes'" });
      }

      if (partOfAcademic === 'Yes' && !semester) {
        return res.status(400).json({ error: "Semester is required when Part of Academic is 'Yes'" });
      }

      if (interdisciplinary === 'Yes' && !department) {
        return res.status(400).json({ error: "Department is required when Interdisciplinary is 'Yes'" });
      }

      if (!req.files || !('originalProof' in req.files) || !('attendedProof' in req.files)) {
        return res.status(400).json({ error: 'Both Original Certificate Proof and Attended Certificate are required' });
      }

      const originalProofFilename = (req.files.originalProof as Express.Multer.File[])[0].filename;
      const attendedProofFilename = (req.files.attendedProof as Express.Multer.File[])[0].filename;

      const start = new Date(startDate);
      const end = new Date(endDate);
      const exam = new Date(examDate);

      if (start >= end) {
        return res.status(400).json({ error: 'Start Date must be before End Date' });
      }

      if (exam < end) {
        return res.status(400).json({ error: 'Exam Date must be on or after End Date' });
      }

      const hasMarks = marksAvailable === 'Yes' ? 1 : 0;
      const isPartOfAcademic = partOfAcademic === 'Yes' ? 1 : 0;
      const isInterdisciplinary = interdisciplinary === 'Yes' ? 1 : 0;

      const [result] = await connection.query<OkPacket>(
        `INSERT INTO student_online_courses (
          student_id,
          year_of_study,
          special_lab_id,
          online_course_id,
          course_type,
          marks_available,
          percentage_obtained,
          start_date,
          end_date,
          exam_date,
          duration_weeks,
          is_part_of_academic,
          semester,
          sponsorship_type,
          interdisciplinary,
          department,
          original_certificate_file,
          attested_certificate_file,
          certificate_url,
          iqac_status,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          student,
          yearOfStudy,
          specialLab || null,
          onlineCourse,
          courseType,
          hasMarks,
          marksObtained || null,
          startDate,
          endDate,
          examDate,
          durationWeeks,
          isPartOfAcademic,
          partOfAcademic === 'Yes' ? semester : null,
          sponsorshipType,
          isInterdisciplinary,
          interdisciplinary === 'Yes' ? department : null,
          originalProofFilename,
          attendedProofFilename,
          certificateUrl,
          iqacVerification,
        ]
      );

      await connection.commit();

      res.status(201).json({
        message: 'Online course record created successfully',
        id: result.insertId,
        data: {
          id: result.insertId,
          studentId: student,
          courseId: onlineCourse,
          courseType,
          startDate,
          endDate,
          iqacStatus: iqacVerification,
          originalProofUrl: generateFileUrl(originalProofFilename),
          attendedProofUrl: generateFileUrl(attendedProofFilename),
        },
      });
    } catch (err: any) {
      await connection.rollback();
      logger.error('Error creating online course record:', err);
      res.status(500).json({ error: 'Failed to create online course record', details: err.message });
    } finally {
      connection.release();
    }
  }
);

router.get('/student-online-courses', async (req, res) => {
  try {
    const pool = getMysqlPool();
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        soc.*, 
        s.student_name AS student_name, 
        oc.course_name, 
        sl.name AS lab_name, 
        d.dept_name 
       FROM student_online_courses soc 
       LEFT JOIN students s ON soc.student_id = s.id 
       LEFT JOIN online_courses oc ON soc.online_course_id = oc.id 
       LEFT JOIN special_labs sl ON soc.special_lab_id = sl.id 
       LEFT JOIN departments d ON soc.department = d.id 
       ORDER BY soc.created_at DESC`
    );

    const rowsWithUrls = rows.map((row) => ({
      ...row,
      originalProofUrl: row.original_certificate_file ? generateFileUrl(row.original_certificate_file) : null,
      attendedProofUrl: row.attested_certificate_file ? generateFileUrl(row.attested_certificate_file) : null,
    }));

    res.json(rowsWithUrls);
  } catch (err: any) {
    logger.error('Error fetching online course records:', err);
    res.status(500).json({ error: 'Failed to fetch online course records', details: err.message });
  }
});

export default router;
