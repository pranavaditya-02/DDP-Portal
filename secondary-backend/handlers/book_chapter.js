import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../config/db.js";
import { generateFileUrl } from "../upload.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, "../uploads/certificates");

const router = express.Router();

// ─── Safe JSON parse helper ───────────────────────────────────────────────────
// Handles plain strings, already-parsed arrays, null, and malformed values
const safeParseJson = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    // Plain string like "jaison" — wrap it in an array
    return [value];
  }
};

// ─── Multer config ────────────────────────────────────────────────────────────

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ["application/pdf", "image/jpeg", "image/png"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and image files (JPG, PNG) are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// ─── POST - Create book chapter publication ───────────────────────────────────

router.post(
  "/",
  upload.fields([
    { name: "abstractProof", maxCount: 1 },
    { name: "fullDocumentProof", maxCount: 1 },
    { name: "originalCertProof", maxCount: 1 },
    { name: "attestedCertProof", maxCount: 1 },
  ]),
  async (req, res) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const {
        student,
        yearOfStudy,
        specialLab,
        chapterTitle,
        authorsNames,
        authorOrCoauthorName,
        totalAuthors,
        studentAuthorCount,
        facultyAuthorCount,
        studentAuthorNames,
        facultyAuthorNames,
        dateOfPublication,
        volumeNumber,
        edition,
        isbnNumber,
        bookTitle,
        publisherName,
        doiNumber,
        pageFrom,
        pageTo,
        webUrl,
        studentAuthorPosition,
        labsInvolved,
        chapterIndexed,
        indexedDetails,
        indexedOtherDetails,
        impactFactor,
        impactFactorValue,
        projectOutcome,
        sponsorshipType,
        sdgGoals,
        interdisciplinary,
        interdisciplinaryDepartment,
        otherDeptStudentCount,
        iqacVerification,
      } = req.body;

      // ── Required field validation ──────────────────────────────────────────
      const requiredFields = [
        "student", "yearOfStudy", "specialLab", "chapterTitle",
        "authorsNames", "authorOrCoauthorName", "totalAuthors", "studentAuthorCount",
        "facultyAuthorCount", "dateOfPublication", "volumeNumber", "edition",
        "isbnNumber", "bookTitle", "publisherName", "doiNumber",
        "pageFrom", "pageTo", "webUrl", "studentAuthorPosition",
        "labsInvolved", "chapterIndexed", "impactFactor", "projectOutcome",
        "sponsorshipType", "sdgGoals", "interdisciplinary", "iqacVerification",
      ];

      for (const field of requiredFields) {
        if (!req.body[field]) {
          return res.status(400).json({ error: `Missing required field: ${field}` });
        }
      }

      // ── Conditional validation ─────────────────────────────────────────────
      if (impactFactor === "Yes" && !impactFactorValue) {
        return res.status(400).json({ error: "Impact Factor Value is required when Impact Factor is Yes" });
      }

      if (chapterIndexed === "Yes" && !indexedDetails) {
        return res.status(400).json({ error: "Indexed Details is required when Chapter is Indexed" });
      }

      if (indexedDetails === "Others" && !indexedOtherDetails) {
        return res.status(400).json({ error: "Please specify the index name" });
      }

      if (interdisciplinary === "Yes" && !interdisciplinaryDepartment) {
        return res.status(400).json({ error: "Department is required when Interdisciplinary is Yes" });
      }

      if (interdisciplinary === "Yes" && !otherDeptStudentCount) {
        return res.status(400).json({ error: "Other Department Student Count is required when Interdisciplinary is Yes" });
      }

      // ── File validation ────────────────────────────────────────────────────
      if (!req.files?.abstractProof || !req.files?.fullDocumentProof) {
        return res.status(400).json({ error: "Abstract and Full Document proofs are required" });
      }

      // ── Parse JSON author name arrays ──────────────────────────────────────
      const parsedStudentAuthorNames = safeParseJson(studentAuthorNames);
      const parsedFacultyAuthorNames = safeParseJson(facultyAuthorNames);

      // ── File names ─────────────────────────────────────────────────────────
      const abstractProofFilename     = req.files.abstractProof[0].filename;
      const fullDocumentProofFilename = req.files.fullDocumentProof[0].filename;
      const originalCertFilename      = req.files.originalCertProof?.[0]?.filename || null;
      const attestedCertFilename      = req.files.attestedCertProof?.[0]?.filename || null;

      // ── Insert ─────────────────────────────────────────────────────────────
      const [result] = await connection.query(
        `INSERT INTO book_chapter_publications (
          student_id,
          year_of_study,
          special_lab_id,
          chapter_title,
          authors_names,
          author_or_coauthor_name,
          total_authors,
          student_author_count,
          faculty_author_count,
          student_author_names,
          faculty_author_names,
          date_of_publication,
          volume_number,
          edition,
          isbn_number,
          book_title,
          publisher_name,
          doi_number,
          page_from,
          page_to,
          web_url,
          student_author_position,
          labs_involved,
          chapter_indexed,
          indexed_details,
          indexed_other_details,
          impact_factor,
          impact_factor_value,
          project_outcome,
          sponsorship_type,
          sdg_goals,
          interdisciplinary,
          interdisciplinary_dept_id,
          other_dept_student_count,
          abstract_proof_url,
          full_document_proof_url,
          original_cert_proof_url,
          attested_cert_proof_url,
          iqac_status,
          created_at,
          updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()
        )`,
        [
          student,
          yearOfStudy,
          specialLab,
          chapterTitle,
          authorsNames,
          authorOrCoauthorName,
          parseInt(totalAuthors),
          parseInt(studentAuthorCount),
          parseInt(facultyAuthorCount),
          JSON.stringify(parsedStudentAuthorNames),
          JSON.stringify(parsedFacultyAuthorNames),
          dateOfPublication,
          volumeNumber,
          edition,
          isbnNumber,
          bookTitle,
          publisherName,
          doiNumber,
          parseInt(pageFrom),
          parseInt(pageTo),
          webUrl,
          studentAuthorPosition,
          labsInvolved,
          chapterIndexed,
          chapterIndexed === "Yes" ? (indexedDetails || null) : null,
          indexedDetails === "Others" ? (indexedOtherDetails || null) : null,
          impactFactor,
          impactFactor === "Yes" ? (impactFactorValue || null) : null,
          projectOutcome,
          sponsorshipType,
          parseInt(sdgGoals),
          interdisciplinary === "Yes" ? 1 : 0,
          interdisciplinary === "Yes" ? (interdisciplinaryDepartment || null) : null,
          interdisciplinary === "Yes" ? (parseInt(otherDeptStudentCount) || null) : null,
          abstractProofFilename,
          fullDocumentProofFilename,
          originalCertFilename,
          attestedCertFilename,
          iqacVerification,
        ]
      );

      await connection.commit();

      res.status(201).json({
        message: "Book chapter publication record created successfully",
        id: result.insertId,
        data: {
          id: result.insertId,
          studentId: student,
          chapterTitle,
          bookTitle,
          iqacStatus: iqacVerification,
          abstractProofUrl:     generateFileUrl(abstractProofFilename),
          fullDocumentProofUrl: generateFileUrl(fullDocumentProofFilename),
          originalCertProofUrl: originalCertFilename ? generateFileUrl(originalCertFilename) : null,
          attestedCertProofUrl: attestedCertFilename ? generateFileUrl(attestedCertFilename) : null,
        },
      });
    } catch (err) {
      await connection.rollback();
      console.error("Error creating book chapter publication:", err);
      res.status(500).json({
        error: "Failed to create book chapter publication record",
        details: err.message,
      });
    } finally {
      connection.release();
    }
  }
);

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        bcp.*,
        ds.student_name,
        sl.name     AS lab_name,
        d.dept_name AS interdisciplinary_dept_name
       FROM book_chapter_publications bcp
       LEFT JOIN dummy_students ds ON bcp.student_id               = ds.id
       LEFT JOIN special_labs   sl ON bcp.special_lab_id           = sl.id
       LEFT JOIN departments     d ON bcp.interdisciplinary_dept_id = d.id
       ORDER BY bcp.created_at DESC`
    );

    const rowsWithUrls = rows.map((row) => ({
      ...row,
      abstract_proof_url:      row.abstract_proof_url      ? generateFileUrl(row.abstract_proof_url)      : null,
      full_document_proof_url: row.full_document_proof_url ? generateFileUrl(row.full_document_proof_url) : null,
      original_cert_proof_url: row.original_cert_proof_url ? generateFileUrl(row.original_cert_proof_url) : null,
      attested_cert_proof_url: row.attested_cert_proof_url ? generateFileUrl(row.attested_cert_proof_url) : null,
      student_author_names:    safeParseJson(row.student_author_names),
      faculty_author_names:    safeParseJson(row.faculty_author_names),
    }));

    res.json(rowsWithUrls);
  } catch (err) {
    console.error("Error fetching book chapter publications:", err);
    res.status(500).json({
      error: "Failed to fetch book chapter publication records",
      details: err.message,
    });
  }
});

// ─── GET - Single book chapter publication by ID ──────────────────────────────

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT
        bcp.*,
        ds.student_name,
        sl.name           AS lab_name,
        d.dept_name       AS interdisciplinary_dept_name
       FROM book_chapter_publications bcp
       LEFT JOIN dummy_students ds ON bcp.student_id               = ds.id
       LEFT JOIN special_labs   sl ON bcp.special_lab_id           = sl.id
       LEFT JOIN departments     d ON bcp.interdisciplinary_dept_id = d.id
       WHERE bcp.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Book chapter publication not found" });
    }

    const row = rows[0];

    res.json({
      id:                          row.id,
      iqac_status:                 row.iqac_status,
      created_at:                  row.created_at,
      updated_at:                  row.updated_at,
      student_id:                  row.student_id,
      student_name:                row.student_name,
      year_of_study:               row.year_of_study,
      special_lab_id:              row.special_lab_id,
      lab_name:                    row.lab_name,
      chapter_title:               row.chapter_title,
      authors_names:               row.authors_names,
      author_or_coauthor_name:     row.author_or_coauthor_name,
      total_authors:               row.total_authors,
      student_author_count:        row.student_author_count,
      faculty_author_count:        row.faculty_author_count,
      student_author_names:        safeParseJson(row.student_author_names),
      faculty_author_names:        safeParseJson(row.faculty_author_names),
      date_of_publication:         row.date_of_publication,
      volume_number:               row.volume_number,
      edition:                     row.edition,
      isbn_number:                 row.isbn_number,
      book_title:                  row.book_title,
      publisher_name:              row.publisher_name,
      doi_number:                  row.doi_number,
      page_from:                   row.page_from,
      page_to:                     row.page_to,
      web_url:                     row.web_url,
      student_author_position:     row.student_author_position,
      labs_involved:               row.labs_involved,
      chapter_indexed:             row.chapter_indexed,
      indexed_details:             row.indexed_details,
      indexed_other_details:       row.indexed_other_details,
      impact_factor:               row.impact_factor,
      impact_factor_value:         row.impact_factor_value,
      project_outcome:             row.project_outcome,
      sponsorship_type:            row.sponsorship_type,
      sdg_goals:                   row.sdg_goals,
      interdisciplinary:           row.interdisciplinary,
      interdisciplinary_dept_id:   row.interdisciplinary_dept_id,
      interdisciplinary_dept_name: row.interdisciplinary_dept_name,
      other_dept_student_count:    row.other_dept_student_count,
      abstract_proof_url:      row.abstract_proof_url      ? generateFileUrl(row.abstract_proof_url)      : null,
      full_document_proof_url: row.full_document_proof_url ? generateFileUrl(row.full_document_proof_url) : null,
      original_cert_proof_url: row.original_cert_proof_url ? generateFileUrl(row.original_cert_proof_url) : null,
      attested_cert_proof_url: row.attested_cert_proof_url ? generateFileUrl(row.attested_cert_proof_url) : null,
    });
  } catch (err) {
    console.error("Error fetching book chapter publication:", err);
    res.status(500).json({
      error: "Failed to fetch book chapter publication record",
      details: err.message,
    });
  }
});

export default router;