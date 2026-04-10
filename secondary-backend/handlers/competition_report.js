import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../config/db.js";
import { generateFileUrl } from "../upload.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, "../uploads/certificates");

const router = express.Router();

// ── Multer config ──────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = ["application/pdf", "image/jpeg", "image/png"];
  allowed.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error("Only PDF, JPG and PNG files are allowed"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// ── POST  /competition-reports ─────────────────────────────────────────────────
router.post(
  "/competition-reports",
  upload.fields([
    { name: "imageProof",        maxCount: 1 },
    { name: "abstractProof",     maxCount: 1 },
    { name: "originalCertProof", maxCount: 1 },
    { name: "attestedCertProof", maxCount: 1 },
  ]),
  async (req, res) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const {
        student,             // student_id (FK → dummy_students)
        sdgGoals,            // sdg_id  (FK → sdg) — we'll look it up by title
        titleOfEvent,
        levelOfEvent,
        individualOrBatch,
        numberOfParticipants,
        academicProject,
        specifyProject,
        fromDate,
        toDate,
        typeOfSponsorship,
        sponsorshipAmount,
        status,
        iqacVerification,
      } = req.body;

      // ── Required-field validation ────────────────────────────────────────────
      const required = {
        student, titleOfEvent, levelOfEvent, individualOrBatch,
        academicProject, fromDate, toDate, typeOfSponsorship,
        sdgGoals, status,
      };

      for (const [field, value] of Object.entries(required)) {
        if (!value || String(value).trim() === "") {
          return res.status(400).json({ error: `Missing required field: ${field}` });
        }
      }

      // ── Conditional validation ───────────────────────────────────────────────
      if (individualOrBatch === "Batch" && !numberOfParticipants) {
        return res.status(400).json({ error: "numberOfParticipants is required for Batch submissions" });
      }

      if (academicProject === "Yes" && !specifyProject) {
        return res.status(400).json({ error: "specifyProject is required when academicProject is Yes" });
      }

      if (typeOfSponsorship === "Management" && !sponsorshipAmount) {
        return res.status(400).json({ error: "sponsorshipAmount is required for Management sponsorship" });
      }

      // ── File validation ──────────────────────────────────────────────────────
      const files = req.files || {};
      if (!files.imageProof || !files.abstractProof || !files.originalCertProof || !files.attestedCertProof) {
        return res.status(400).json({ error: "All four proof files are required" });
      }

      // ── Resolve SDG id from title ────────────────────────────────────────────
      const [[sdgRow]] = await connection.query(
        "SELECT id FROM sdg WHERE title = ? LIMIT 1",
        [sdgGoals]
      );
      if (!sdgRow) {
        return res.status(400).json({ error: `SDG goal not found: ${sdgGoals}` });
      }
      const sdgId = sdgRow.id;

      // ── Date validation ──────────────────────────────────────────────────────
      if (new Date(fromDate) > new Date(toDate)) {
        return res.status(400).json({ error: "fromDate must be before or equal to toDate" });
      }

      // ── Generate file URLs ───────────────────────────────────────────────────
      const imageProofUrl        = generateFileUrl(files.imageProof[0].filename);
      const abstractProofUrl     = generateFileUrl(files.abstractProof[0].filename);
      const originalCertProofUrl = generateFileUrl(files.originalCertProof[0].filename);
      const attestedCertProofUrl = generateFileUrl(files.attestedCertProof[0].filename);

      // ── Insert ───────────────────────────────────────────────────────────────
      const [result] = await connection.query(
        `INSERT INTO competition_reports (
          student_id, sdg_id, title_of_event, level_of_event,
          individual_or_batch, number_of_participants,
          academic_project, specify_project,
          from_date, to_date,
          type_of_sponsorship, sponsorship_amount,
          image_proof_url, abstract_proof_url,
          original_cert_proof_url, attested_cert_proof_url,
          status, iqac_verification
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          student,
          sdgId,
          titleOfEvent,
          levelOfEvent,
          individualOrBatch,
          individualOrBatch === "Batch" ? numberOfParticipants : null,
          academicProject,
          academicProject === "Yes" ? specifyProject : null,
          fromDate,
          toDate,
          typeOfSponsorship,
          typeOfSponsorship === "Management" ? sponsorshipAmount : null,
          imageProofUrl,
          abstractProofUrl,
          originalCertProofUrl,
          attestedCertProofUrl,
          status,
          iqacVerification || "Initiated",
        ]
      );

      await connection.commit();

      res.status(201).json({
        message: "Competition report created successfully",
        id: result.insertId,
        data: {
          id: result.insertId,
          studentId: student,
          titleOfEvent,
          status,
          iqacStatus: iqacVerification || "Initiated",
          imageProofUrl,
          abstractProofUrl,
          originalCertProofUrl,
          attestedCertProofUrl,
        },
      });
    } catch (err) {
      await connection.rollback();
      console.error("Error creating competition report:", err);
      res.status(500).json({ error: "Failed to create competition report", details: err.message });
    } finally {
      connection.release();
    }
  }
);

// ── GET  /competition-reports ──────────────────────────────────────────────────
router.get("/competition-reports", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         cr.*,
         ds.student_name          AS student_name,
         s.sdg_number,
         s.title          AS sdg_title
       FROM competition_reports cr
       LEFT JOIN dummy_students ds ON cr.student_id = ds.id
       LEFT JOIN sdg s             ON cr.sdg_id     = s.id
       ORDER BY cr.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching competition reports:", err);
    res.status(500).json({ error: "Failed to fetch competition reports", details: err.message });
  }
});

// ── GET  /competition-reports/:id ─────────────────────────────────────────────
router.get("/competition-reports/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         cr.*,
         ds.student_name          AS student_name,
         s.sdg_number,
         s.title          AS sdg_title
       FROM competition_reports cr
       LEFT JOIN dummy_students ds ON cr.student_id = ds.id
       LEFT JOIN sdg s             ON cr.sdg_id     = s.id
       WHERE cr.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Competition report not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching competition report:", err);
    res.status(500).json({ error: "Failed to fetch competition report", details: err.message });
  }
});

// ── PUT  /competition-reports/:id ─────────────────────────────────────────────
router.put("/competition-reports/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query(
      "SELECT id FROM competition_reports WHERE id = ?", [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: "Competition report not found" });
    }

    const allowedFields = {
      title_of_event:        req.body.titleOfEvent,
      level_of_event:        req.body.levelOfEvent,
      individual_or_batch:   req.body.individualOrBatch,
      number_of_participants:req.body.numberOfParticipants,
      academic_project:      req.body.academicProject,
      specify_project:       req.body.specifyProject,
      from_date:             req.body.fromDate,
      to_date:               req.body.toDate,
      type_of_sponsorship:   req.body.typeOfSponsorship,
      sponsorship_amount:    req.body.sponsorshipAmount,
      status:                req.body.status,
      iqac_verification:     req.body.iqacVerification,
    };

    const updates = [];
    const values  = [];

    for (const [col, val] of Object.entries(allowedFields)) {
      if (val !== undefined && val !== null && val !== "") {
        updates.push(`${col} = ?`);
        values.push(val);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    values.push(id);
    await pool.query(
      `UPDATE competition_reports SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    res.json({ message: "Competition report updated successfully", id });
  } catch (err) {
    console.error("Error updating competition report:", err);
    res.status(500).json({ error: "Failed to update competition report", details: err.message });
  }
});

// ── DELETE  /competition-reports/:id ──────────────────────────────────────────
router.delete("/competition-reports/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query(
      "SELECT id FROM competition_reports WHERE id = ?", [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: "Competition report not found" });
    }

    await pool.query("DELETE FROM competition_reports WHERE id = ?", [id]);
    res.json({ message: "Competition report deleted successfully", id });
  } catch (err) {
    console.error("Error deleting competition report:", err);
    res.status(500).json({ error: "Failed to delete competition report", details: err.message });
  }
});

export default router;