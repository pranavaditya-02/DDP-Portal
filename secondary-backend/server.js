import express from "express";
import dotenv from "dotenv";
import cors from 'cors'
import path from "path";
import { fileURLToPath } from "url";
import pool, { testDB } from "./config/db.js";
import { ensureUploadDirectories } from "./upload.js"
import studentOnlineCourseRoutes from "./handlers/online_course.js";
import competitionReportRoutes from "./handlers/competition_report.js"
import bookChapterRoutes from "./handlers/book_chapter.js"
import journalPublicationsRouter from "./handlers/journalPublications.js"


const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

// Ensure upload directories exist on startup
ensureUploadDirectories();

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

(async () => {
  await testDB();
})();

app.get("/", (req, res) => {
  res.send("🚀 Server running");
});

// ════════════════════════ COURSES ════════════════════════
app.get("/courses", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, course_name AS name, is_active FROM online_courses"
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

app.get("/courses/active", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, course_name AS name, is_active FROM online_courses WHERE is_active = 1"
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// ════════════════════════ SPECIAL LABS ════════════════════════
app.get("/speciallabs/active", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        id, 
        name AS specialLabName, 
        is_active 
       FROM special_labs 
       WHERE is_active = 1`
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

app.get("/speciallabs", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name AS specialLabName, is_active FROM special_labs`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/departments", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        id,
        dept_name,
        status
       FROM departments`
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/students", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id,
        student_name
      FROM dummy_students
    `);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/departments/active", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        id,
        dept_name AS name
       FROM departments
       WHERE status = 1`
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use("/api/online", studentOnlineCourseRoutes);
app.use("/api/online/course", studentOnlineCourseRoutes);
app.use("/api/competition",competitionReportRoutes)
app.use("/api/book-chapter-publications", bookChapterRoutes)
app.use("/api/journal-publications", journalPublicationsRouter);


app.get("/sdg", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        id, 
        sdg_number, 
        title 
       FROM sdg`
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🔥 Server running on http://localhost:${PORT}`);
});