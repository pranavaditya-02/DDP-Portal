import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import 'express-async-errors';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import authRoutes from './routes/auth.routes';
import activityRoutes from './routes/activity.routes';
import importRoutes from './routes/import.routes';
import internshipTrackerRoutes from './routes/internshipTracker.routes';
import internshipReportRoutes from './routes/internshipReport.routes';
import patentTrackerRoutes from './routes/patentTracker.routes';
import studentsRoutes from './routes/students.routes';
import patentReportRoutes from './routes/patentReport.routes';
import eventsRoutes from './routes/events.routes';
import registrationRoutes from './routes/registration.routes';
import journalPublicationRoutes from './routes/journalPublication.routes';
import facultyActivitiesRoutes from './facultyActivities/facultyActivities.routes';
import onlineCourseRoutes from './routes/onlineCourse.routes';
import { getMysqlPool, verifyMysqlConnection } from './database/mysql';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const normalizeOrigin = (value) => {
    const candidate = value?.trim();
    if (!candidate)
        return null;
    try {
        return new URL(candidate).origin;
    }
    catch {
        return null;
    }
};
const parseAllowedOrigins = () => {
    const configuredOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
        .split(',')
        .map((origin) => normalizeOrigin(origin))
        .filter((origin) => Boolean(origin));
    const frontendOrigin = normalizeOrigin(process.env.FRONTEND_URL);
    if (frontendOrigin) {
        configuredOrigins.push(frontendOrigin);
    }
    if ((process.env.NODE_ENV || 'development').toLowerCase() !== 'production') {
        configuredOrigins.push('http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001');
    }
    return Array.from(new Set(configuredOrigins));
};
const allowedOrigins = parseAllowedOrigins();
const isDevelopment = (process.env.NODE_ENV || 'development').toLowerCase() !== 'production';
// Middleware
app.use(cors({
    origin: (origin, callback) => {
        // Allow server-to-server requests and same-origin requests without Origin header.
        if (!origin) {
            callback(null, true);
            return;
        }
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        if (isDevelopment && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
}));
const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || './uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
// Request logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
});
// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});
// Routes
import industriesRoutes from './routes/industries.routes';
import facultiesRoutes from './routes/faculties.routes';
app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/import', importRoutes);
app.use('/api/internship-tracker', internshipTrackerRoutes);
app.use('/api/internship-report', internshipReportRoutes);
app.use('/api/patent-tracker', patentTrackerRoutes);
app.use('/api/patent-report', patentReportRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/industries', industriesRoutes);
app.use('/api/faculties', facultiesRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/journal-publications', journalPublicationRoutes);
app.use('/api/faculty-activities', facultyActivitiesRoutes);
app.use('/api/online/course', onlineCourseRoutes);
const fetchStudents = async (_req, res) => {
    try {
        const pool = getMysqlPool();
        const [rows] = await pool.query(`SELECT id, student_name FROM students ORDER BY student_name ASC`);
        return res.json(rows);
    }
    catch (error) {
        logger.error('Error fetching students route:', error);
        return res.status(500).json({ error: 'Failed to fetch students' });
    }
};
const fetchActiveSpecialLabs = async (_req, res) => {
    try {
        const pool = getMysqlPool();
        const [rows] = await pool.query(`SELECT id, name AS specialLabName, is_active FROM special_labs WHERE is_active = TRUE ORDER BY name ASC`);
        return res.json(rows);
    }
    catch (error) {
        logger.error('Error fetching special labs route:', error);
        return res.status(500).json({ error: 'Failed to fetch special labs' });
    }
};
const fetchDepartments = async (_req, res) => {
    try {
        const pool = getMysqlPool();
        const [rows] = await pool.query(`SELECT id, dept_name AS dept_name, status FROM departments ORDER BY dept_name ASC`);
        return res.json(rows);
    }
    catch (error) {
        logger.error('Error fetching departments route:', error);
        return res.status(500).json({ error: 'Failed to fetch departments' });
    }
};
const fetchActiveCourses = async (_req, res) => {
    try {
        const pool = getMysqlPool();
        const [rows] = await pool.query(`SELECT id, course_name AS name, is_active FROM online_courses WHERE is_active = TRUE ORDER BY course_name ASC`);
        return res.json(rows);
    }
    catch (error) {
        logger.error('Error fetching active courses route:', error);
        return res.status(500).json({ error: 'Failed to fetch active courses' });
    }
};
app.get('/students', fetchStudents);
app.get('/api/students', fetchStudents);
app.get('/speciallabs/active', fetchActiveSpecialLabs);
app.get('/api/speciallabs/active', fetchActiveSpecialLabs);
app.get('/departments', fetchDepartments);
app.get('/api/departments', fetchDepartments);
app.get('/api/courses/active', fetchActiveCourses);
// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// Start server
const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
    verifyMysqlConnection().catch((error) => {
        logger.warn('MySQL verification failed on startup:', error);
    });
});
// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
});
export default app;
