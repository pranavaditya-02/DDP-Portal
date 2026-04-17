import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { getMysqlPool } from '../database/mysql';
import { logger } from '../utils/logger';
import { OkPacket, RowDataPacket } from 'mysql2';

const router = express.Router();
const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || './uploads', 'certificates');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const generateFileUrl = (filename: string) => {
  const baseUrl = (process.env.SERVER_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');
  return `${baseUrl}/uploads/certificates/${filename}`;
};

const safeParseJson = (value: any) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [value];
  }
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
    cb(new Error('Only PDF and image files are allowed'));
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

router.post(
  '/',
  upload.fields([
    { name: 'abstractProof', maxCount: 1 },
    { name: 'fullDocumentProof', maxCount: 1 },
    { name: 'originalCertProof', maxCount: 1 },
    { name: 'attestedCertProof', maxCount: 1 },
  ]),
  async (req, res) => {
    const connection = await getMysqlPool().getConnection();

    try {
      await connection.beginTransaction();

      const {
        student,
        yearOfStudy,
        specialLab,
        paperTitle,
        authorsNames,
        totalAuthors,
        studentAuthorCount,
        facultyAuthorCount,
        studentAuthorNames,
        facultyAuthorNames,
        dateOfPublication,
        volumeNumber,
        issueNumber,
        issnNumber,
        doiNumber,
        pageFrom,
        pageTo,
        journalName,
        publisherName,
        webUrl,
        studentAuthorPosition,
        labsInvolved,
        paperIndexed,
        indexedDetails,
        indexedOtherDetails,
        impactFactor,
        impactFactorValue,
        projectOutcome,
        sdgGoals,
        sponsorshipType,
        sponsorshipAmount,
        sponsorshipOtherSpecify,
        interdisciplinary,
        interdisciplinaryDepartment,
        otherDeptStudentCount,
        iqacVerification,
      } = req.body as Record<string, any>;

      const required = [
        'student',
        'yearOfStudy',
        'specialLab',
        'paperTitle',
        'authorsNames',
        'totalAuthors',
        'studentAuthorCount',
        'facultyAuthorCount',
        'dateOfPublication',
        'volumeNumber',
        'issueNumber',
        'issnNumber',
        'doiNumber',
        'pageFrom',
        'pageTo',
        'journalName',
        'publisherName',
        'webUrl',
        'studentAuthorPosition',
        'labsInvolved',
        'paperIndexed',
        'impactFactor',
        'projectOutcome',
        'sdgGoals',
        'sponsorshipType',
        'interdisciplinary',
        'iqacVerification',
      ];

      for (const field of required) {
        if (!req.body[field]) {
          return res.status(400).json({ error: `Missing required field: ${field}` });
        }
      }

      if (paperIndexed === 'Yes' && !indexedDetails) {
        return res.status(400).json({ error: 'Indexed Details is required when Paper is Indexed' });
      }
      if (indexedDetails === 'Others' && !indexedOtherDetails) {
        return res.status(400).json({ error: 'Please specify the index name' });
      }
      if (impactFactor === 'Yes' && !impactFactorValue) {
        return res.status(400).json({ error: 'Impact Factor Value is required when Impact Factor is Yes' });
      }
      if ((sponsorshipType === 'Institute' || sponsorshipType === 'Others') && !sponsorshipAmount) {
        return res.status(400).json({ error: 'Sponsorship Amount is required for Institute / Others' });
      }
      if (sponsorshipType === 'Others' && !sponsorshipOtherSpecify) {
        return res.status(400).json({ error: 'Please specify the sponsorship source' });
      }
      if (interdisciplinary === 'Yes' && !interdisciplinaryDepartment) {
        return res.status(400).json({ error: 'Department is required when Interdisciplinary is Yes' });
      }
      if (interdisciplinary === 'Yes' && !otherDeptStudentCount) {
        return res.status(400).json({ error: 'Other Department Student Count is required when Interdisciplinary is Yes' });
      }

      const files = req.files as Record<string, Express.Multer.File[]> | undefined;
      if (!files?.abstractProof || !files?.fullDocumentProof) {
        return res.status(400).json({ error: 'Abstract and Full Document proofs are required' });
      }

      const parsedStudentAuthorNames = safeParseJson(studentAuthorNames);
      const parsedFacultyAuthorNames = safeParseJson(facultyAuthorNames);

      const abstractProofFilename = files.abstractProof[0].filename;
      const fullDocumentProofFilename = files.fullDocumentProof[0].filename;
      const originalCertFilename = files.originalCertProof?.[0]?.filename ?? null;
      const attestedCertFilename = files.attestedCertProof?.[0]?.filename ?? null;

      const isInterdisciplinary = interdisciplinary === 'Yes';
      const hasAmount = sponsorshipType === 'Institute' || sponsorshipType === 'Others';

      const [result] = await connection.query<OkPacket>(
        `INSERT INTO journal_publications (
          student_id, year_of_study, special_lab_id,
          paper_title, authors_names,
          total_authors, student_author_count, faculty_author_count,
          student_author_names, faculty_author_names,
          date_of_publication, volume_number, issue_number, issn_number,
          doi_number, page_from, page_to,
          journal_name, publisher_name, web_url,
          student_author_position, labs_involved,
          paper_indexed, indexed_details, indexed_other_details,
          impact_factor, impact_factor_value,
          project_outcome, sdg_goals,
          sponsorship_type, sponsorship_amount, sponsorship_other_specify,
          interdisciplinary, interdisciplinary_dept_id, other_dept_student_count,
          abstract_proof_url, full_document_proof_url,
          original_cert_proof_url, attested_cert_proof_url,
          iqac_status, created_at, updated_at
        ) VALUES (
          ?,?,?,?,?,?,?,?,?,?,
          ?,?,?,?,?,?,?,?,?,?,
          ?,?,?,?,?,?,?,?,?,?,
          ?,?,?,?,?,?,?,?,?,?,
          NOW(), NOW()
        )`,
        [
          student,
          yearOfStudy,
          specialLab,
          paperTitle,
          authorsNames,
          parseInt(totalAuthors, 10),
          parseInt(studentAuthorCount, 10),
          parseInt(facultyAuthorCount, 10),
          JSON.stringify(parsedStudentAuthorNames),
          JSON.stringify(parsedFacultyAuthorNames),
          dateOfPublication,
          volumeNumber,
          issueNumber,
          issnNumber,
          doiNumber,
          parseInt(pageFrom, 10),
          parseInt(pageTo, 10),
          journalName,
          publisherName,
          webUrl,
          studentAuthorPosition,
          labsInvolved,
          paperIndexed,
          paperIndexed === 'Yes' ? (indexedDetails || null) : null,
          indexedDetails === 'Others' ? (indexedOtherDetails || null) : null,
          impactFactor,
          impactFactor === 'Yes' ? (impactFactorValue || null) : null,
          projectOutcome,
          parseInt(sdgGoals, 10),
          sponsorshipType,
          hasAmount ? (parseFloat(sponsorshipAmount) || null) : null,
          sponsorshipType === 'Others' ? (sponsorshipOtherSpecify || null) : null,
          isInterdisciplinary ? 1 : 0,
          isInterdisciplinary ? (interdisciplinaryDepartment || null) : null,
          isInterdisciplinary ? (parseInt(otherDeptStudentCount, 10) || null) : null,
          abstractProofFilename,
          fullDocumentProofFilename,
          originalCertFilename,
          attestedCertFilename,
          iqacVerification,
        ],
      );

      await connection.commit();

      return res.status(201).json({
        message: 'Journal publication record created successfully',
        id: result.insertId,
        data: {
          id: result.insertId,
          studentId: student,
          paperTitle,
          journalName,
          iqacStatus: iqacVerification,
          abstractProofUrl: generateFileUrl(abstractProofFilename),
          fullDocumentProofUrl: generateFileUrl(fullDocumentProofFilename),
          originalCertProofUrl: originalCertFilename ? generateFileUrl(originalCertFilename) : null,
          attestedCertProofUrl: attestedCertFilename ? generateFileUrl(attestedCertFilename) : null,
        },
      });
    } catch (err: any) {
      await connection.rollback();
      logger.error('Error creating journal publication:', err);
      return res.status(500).json({ error: 'Failed to create journal publication record', details: err.message });
    } finally {
      connection.release();
    }
  },
);

router.get('/', async (req, res) => {
  try {
    const pool = getMysqlPool();
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT jp.*, s.student_name, sl.name AS lab_name,
              d.dept_name AS interdisciplinary_dept_name
       FROM journal_publications jp
       LEFT JOIN students s ON jp.student_id = s.id
       LEFT JOIN special_labs sl ON jp.special_lab_id = sl.id
       LEFT JOIN departments d ON jp.interdisciplinary_dept_id = d.id
       ORDER BY jp.created_at DESC`,
    );

    const rowsWithUrls = (rows as any[]).map((row) => ({
      ...row,
      abstract_proof_url: row.abstract_proof_url ? generateFileUrl(row.abstract_proof_url) : null,
      full_document_proof_url: row.full_document_proof_url ? generateFileUrl(row.full_document_proof_url) : null,
      original_cert_proof_url: row.original_cert_proof_url ? generateFileUrl(row.original_cert_proof_url) : null,
      attested_cert_proof_url: row.attested_cert_proof_url ? generateFileUrl(row.attested_cert_proof_url) : null,
      student_author_names: safeParseJson(row.student_author_names),
      faculty_author_names: safeParseJson(row.faculty_author_names),
    }));

    return res.json(rowsWithUrls);
  } catch (err: any) {
    logger.error('Error fetching journal publications:', err);
    return res.status(500).json({ error: 'Failed to fetch journal publication records', details: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getMysqlPool();
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT jp.*, s.student_name, sl.name AS lab_name,
              d.dept_name AS interdisciplinary_dept_name
       FROM journal_publications jp
       LEFT JOIN students s ON jp.student_id = s.id
       LEFT JOIN special_labs sl ON jp.special_lab_id = sl.id
       LEFT JOIN departments d ON jp.interdisciplinary_dept_id = d.id
       WHERE jp.id = ?`,
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Journal publication not found' });
    }

    const row = rows[0] as any;
    return res.json({
      id: row.id,
      iqac_status: row.iqac_status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      student_id: row.student_id,
      student_name: row.student_name,
      year_of_study: row.year_of_study,
      special_lab_id: row.special_lab_id,
      lab_name: row.lab_name,
      paper_title: row.paper_title,
      authors_names: row.authors_names,
      total_authors: row.total_authors,
      student_author_count: row.student_author_count,
      faculty_author_count: row.faculty_author_count,
      student_author_names: safeParseJson(row.student_author_names),
      faculty_author_names: safeParseJson(row.faculty_author_names),
      date_of_publication: row.date_of_publication,
      volume_number: row.volume_number,
      issue_number: row.issue_number,
      issn_number: row.issn_number,
      doi_number: row.doi_number,
      page_from: row.page_from,
      page_to: row.page_to,
      journal_name: row.journal_name,
      publisher_name: row.publisher_name,
      web_url: row.web_url,
      student_author_position: row.student_author_position,
      labs_involved: row.labs_involved,
      paper_indexed: row.paper_indexed,
      indexed_details: row.indexed_details,
      indexed_other_details: row.indexed_other_details,
      impact_factor: row.impact_factor,
      impact_factor_value: row.impact_factor_value,
      project_outcome: row.project_outcome,
      sdg_goals: row.sdg_goals,
      sponsorship_type: row.sponsorship_type,
      sponsorship_amount: row.sponsorship_amount,
      sponsorship_other_specify: row.sponsorship_other_specify,
      interdisciplinary: row.interdisciplinary,
      interdisciplinary_dept_id: row.interdisciplinary_dept_id,
      interdisciplinary_dept_name: row.interdisciplinary_dept_name,
      other_dept_student_count: row.other_dept_student_count,
      abstract_proof_url: row.abstract_proof_url ? generateFileUrl(row.abstract_proof_url) : null,
      full_document_proof_url: row.full_document_proof_url ? generateFileUrl(row.full_document_proof_url) : null,
      original_cert_proof_url: row.original_cert_proof_url ? generateFileUrl(row.original_cert_proof_url) : null,
      attested_cert_proof_url: row.attested_cert_proof_url ? generateFileUrl(row.attested_cert_proof_url) : null,
    });
  } catch (err: any) {
    logger.error('Error fetching journal publication:', err);
    return res.status(500).json({ error: 'Failed to fetch journal publication record', details: err.message });
  }
});

export default router;
