import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../config/db.js";
import { generateFileUrl } from "../upload.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, "../uploads/certificates");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
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
  limits: { fileSize: 5 * 1024 * 1024 }, 
});

// POST - Create a new student online course
router.post(
  "/student-online-courses",
  upload.fields([
    { name: "originalProof", maxCount: 1 },
    { name: "attendedProof", maxCount: 1 },
  ]),
  async (req, res) => {
    const connection = await pool.getConnection();

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
      } = req.body;

      // Validate required fields
      const requiredFields = [
        "student",
        "yearOfStudy",
        "specialLab",
        "onlineCourse",
        "courseType",
        "marksAvailable",
        "startDate",
        "endDate",
        "examDate",
        "durationWeeks",
        "partOfAcademic",
        "sponsorshipType",
        "interdisciplinary",
        "certificateUrl",
        "iqacVerification",
      ];

      for (const field of requiredFields) {
        if (!req.body[field]) {
          return res.status(400).json({
            error: `Missing required field: ${field}`,
          });
        }
      }

      // Validate conditional fields
      if (marksAvailable === "Yes" && !marksObtained) {
        return res.status(400).json({
          error: "Marks Obtained is required when Marks Available is 'Yes'",
        });
      }

      if (partOfAcademic === "Yes" && !semester) {
        return res.status(400).json({
          error: "Semester is required when Part of Academic is 'Yes'",
        });
      }

      if (interdisciplinary === "Yes" && !department) {
        return res.status(400).json({
          error: "Department is required when Interdisciplinary is 'Yes'",
        });
      }

      // Validate file uploads
      if (!req.files.originalProof || !req.files.attendedProof) {
        return res.status(400).json({
          error: "Both Original Certificate Proof and Attended Certificate are required",
        });
      }

      // Get file paths and generate URLs
      const originalProofFilename = req.files.originalProof[0].filename;
      const attendedProofFilename = req.files.attendedProof[0].filename;

      const originalProofUrl = generateFileUrl(originalProofFilename);
      const attendedProofUrl = generateFileUrl(attendedProofFilename);

      // Validate dates
      const start = new Date(startDate);
      const end = new Date(endDate);
      const exam = new Date(examDate);

      if (start >= end) {
        return res.status(400).json({
          error: "Start Date must be before End Date",
        });
      }

      if (exam < end) {
        return res.status(400).json({
          error: "Exam Date must be on or after End Date",
        });
      }

      // Convert Yes/No to boolean (1/0)
      const isPartOfAcademic = partOfAcademic === "Yes" ? 1 : 0;
      const isInterdisciplinary = interdisciplinary === "Yes" ? 1 : 0;
      const hasMarks = marksAvailable === "Yes" ? 1 : 0;

      // Insert into database
      const [result] = await connection.query(
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
          partOfAcademic === "Yes" ? semester : null,
          sponsorshipType,
          isInterdisciplinary,
          interdisciplinary === "Yes" ? department : null,
          originalProofFilename,
          attendedProofFilename,
          certificateUrl,
          iqacVerification,
        ]
      );

      await connection.commit();

      res.status(201).json({
        message: "Online course record created successfully",
        id: result.insertId,
        data: {
          id: result.insertId,
          studentId: student,
          courseId: onlineCourse,
          courseType,
          startDate,
          endDate,
          iqacStatus: iqacVerification,
          originalProofUrl,
          attendedProofUrl,
        },
      });
    } catch (err) {
      await connection.rollback();
      console.error("Error creating online course:", err);

      res.status(500).json({
        error: "Failed to create online course record",
        details: err.message,
      });
    } finally {
      connection.release();
    }
  }
);

// GET - Retrieve all student online courses
router.get("/student-online-courses", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        soc.*,
        ds.student_name AS student_name,
        oc.course_name,
        sl.name AS lab_name,
        d.dept_name
       FROM student_online_courses soc
       LEFT JOIN dummy_students ds ON soc.student_id = ds.id
       LEFT JOIN online_courses oc ON soc.online_course_id = oc.id
       LEFT JOIN special_labs sl ON soc.special_lab_id = sl.id
       LEFT JOIN departments d ON soc.department = d.id
       ORDER BY soc.created_at DESC`
    );

    const rowsWithUrls = rows.map((row) => ({
      ...row,
      originalProofUrl: row.original_certificate_file
        ? generateFileUrl(row.original_certificate_file)
        : null,
      attendedProofUrl: row.attested_certificate_file
        ? generateFileUrl(row.attested_certificate_file)
        : null,
    }));

    res.json(rowsWithUrls);
  } catch (err) {
    console.error("Error fetching online courses:", err);
    res.status(500).json({
      error: "Failed to fetch online course records",
      details: err.message,
    });
  }
});

// GET - Retrieve single student online course by ID
router.get("/student-online-courses/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT 
        soc.*,
        COALESCE(ds.student_name, ds.name) AS student_name,
        oc.course_name,
        sl.name AS lab_name,
        d.dept_name
       FROM student_online_courses soc
       LEFT JOIN dummy_students ds ON soc.student_id = ds.id
       LEFT JOIN online_courses oc ON soc.online_course_id = oc.id
       LEFT JOIN special_labs sl ON soc.special_lab_id = sl.id
       LEFT JOIN departments d ON soc.department = d.id
       WHERE soc.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Online course record not found",
      });
    }

    const data = {
      ...rows[0],
      originalProofUrl: rows[0].original_certificate_file
        ? generateFileUrl(rows[0].original_certificate_file)
        : null,
      attendedProofUrl: rows[0].attested_certificate_file
        ? generateFileUrl(rows[0].attested_certificate_file)
        : null,
    };

    res.json(data);
  } catch (err) {
    console.error("Error fetching online course:", err);
    res.status(500).json({
      error: "Failed to fetch online course record",
      details: err.message,
    });
  }
});
// PUT - Update student online course
router.put("/student-online-courses/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      courseType,
      marksAvailable,
      marksObtained,
      startDate,
      endDate,
      examDate,
      durationWeeks,
      sponsorshipType,
      certificateUrl,
      iqacVerification,
    } = req.body;

    // Check if record exists
    const [existing] = await pool.query(
      "SELECT id FROM student_online_courses WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        error: "Online course record not found",
      });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (courseType) {
      updates.push("course_type = ?");
      values.push(courseType);
    }
    if (marksAvailable !== undefined) {
      updates.push("marks_available = ?");
      values.push(marksAvailable === "Yes" ? 1 : 0);
    }
    if (marksObtained !== undefined) {
      updates.push("percentage_obtained = ?");
      values.push(marksObtained);
    }
    if (startDate) {
      updates.push("start_date = ?");
      values.push(startDate);
    }
    if (endDate) {
      updates.push("end_date = ?");
      values.push(endDate);
    }
    if (examDate) {
      updates.push("exam_date = ?");
      values.push(examDate);
    }
    if (durationWeeks) {
      updates.push("duration_weeks = ?");
      values.push(durationWeeks);
    }
    if (sponsorshipType) {
      updates.push("sponsorship_type = ?");
      values.push(sponsorshipType);
    }
    if (certificateUrl) {
      updates.push("certificate_url = ?");
      values.push(certificateUrl);
    }
    if (iqacVerification) {
      updates.push("iqac_status = ?");
      values.push(iqacVerification);
    }

    // Always update updated_at
    updates.push("updated_at = NOW()");
    values.push(id);

    if (updates.length === 1) {
      return res.status(400).json({
        error: "No fields to update",
      });
    }

    const query = `UPDATE student_online_courses SET ${updates.join(", ")} WHERE id = ?`;

    await pool.query(query, values);

    res.json({
      message: "Online course record updated successfully",
      id,
    });
  } catch (err) {
    console.error("Error updating online course:", err);
    res.status(500).json({
      error: "Failed to update online course record",
      details: err.message,
    });
  }
});

// DELETE - Delete student online course
router.delete("/student-online-courses/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if record exists
    const [existing] = await pool.query(
      "SELECT original_certificate_file, attested_certificate_file FROM student_online_courses WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        error: "Online course record not found",
      });
    }

    // Delete the record
    await pool.query("DELETE FROM student_online_courses WHERE id = ?", [id]);

    res.json({
      message: "Online course record deleted successfully",
      id,
    });
  } catch (err) {
    console.error("Error deleting online course:", err);
    res.status(500).json({
      error: "Failed to delete online course record",
      details: err.message,
    });
  }
});

export default router;