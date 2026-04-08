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
import studentsRoutes from './routes/students.routes';
import eventsRoutes from './routes/events.routes';
import paperPresentationRoutes from './routes/paperPresentation.routes';
import studentPaperPresentationRoutes from './routes/studentPaperPresentation.routes';
import studentProjectCompetitionRoutes from './routes/studentProjectCompetition.routes';
import studentTechnicalBodyMembershipRoutes from './routes/studentTechnicalBodyMembership.routes';
import studentNonTechnicalRoutes from './routes/studentNonTechnical.routes';
import departmentsRoutes from './routes/departments.routes';
import clubsRoutes from './routes/clubs.routes';
import verifiedStudentsRoutes from './routes/verifiedStudents.routes';
import sdgRoutes from './routes/sdg.routes';
import registrationRoutes from './routes/registration.routes';
import { verifyMysqlConnection } from './database/mysql';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
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
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/api/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Routes
import industriesRoutes from './routes/industries.routes';

app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/import', importRoutes);
app.use('/api/internship-tracker', internshipTrackerRoutes);
app.use('/api/internship-report', internshipReportRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/industries', industriesRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/paper-presentations', paperPresentationRoutes);
app.use('/api/student-paper-presentations', studentPaperPresentationRoutes);
app.use('/api/student-project-competitions', studentProjectCompetitionRoutes);
app.use('/api/student-technical-body-memberships', studentTechnicalBodyMembershipRoutes);
app.use('/api/student-non-technical', studentNonTechnicalRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/clubs', clubsRoutes);
app.use('/api/verified-students', verifiedStudentsRoutes);
app.use('/api/sdgs', sdgRoutes);
app.use('/api/registrations', registrationRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
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
