import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import 'express-async-errors';
import { logger } from './utils/logger';
import authRoutes from './routes/auth.routes';
import activityRoutes from './routes/activity.routes';
import importRoutes from './routes/import.routes';
import alertsRoutes from './routes/alerts.routes';
import internshipTrackerRoutes from './routes/internshipTracker.routes';
import internshipReportRoutes from './routes/internshipReport.routes';
import patentTrackerRoutes from './routes/patentTracker.routes';
import studentsRoutes from './routes/students.routes';
import industriesRoutes from './routes/industries.routes';
import eventsRoutes from './routes/events.routes';
import registrationRoutes from './routes/registration.routes';
import usersRoutes from './routes/users.routes';
import rolesRoutes from './routes/roles.routes';
import workflowTargetsRoutes from './routes/workflowTargets.routes';
import onlineCourseRoutes from './routes/onlineCourse.routes';
import { verifyMysqlConnection } from './database/mysql';

const app = express();
const PORT = process.env.PORT || 5000;

const normalizeOrigin = (value?: string) => {
  const candidate = value?.trim()
  if (!candidate) return null

  try {
    return new URL(candidate).origin
  } catch {
    return null
  }
}

const parseAllowedOrigins = () => {
  const configuredOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((origin) => normalizeOrigin(origin))
    .filter((origin): origin is string => Boolean(origin))

  const frontendOrigin = normalizeOrigin(process.env.FRONTEND_URL)
  if (frontendOrigin) {
    configuredOrigins.push(frontendOrigin)
  }

  if ((process.env.NODE_ENV || 'development').toLowerCase() !== 'production') {
    configuredOrigins.push(
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    )
  }

  return Array.from(new Set(configuredOrigins))
}

const allowedOrigins = parseAllowedOrigins()
const isDevelopment = (process.env.NODE_ENV || 'development').toLowerCase() !== 'production'

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server requests and same-origin requests without Origin header.
    if (!origin) {
      callback(null, true)
      return
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }

    if (isDevelopment && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) {
      callback(null, true)
      return
    }

    callback(new Error(`Origin ${origin} is not allowed by CORS`))
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
app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/import', importRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/internship-tracker', internshipTrackerRoutes);
app.use('/api/internship-report', internshipReportRoutes);
app.use('/api/patent-tracker', patentTrackerRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/industries', industriesRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/workflow-targets', workflowTargetsRoutes);
app.use('/api/online-course', onlineCourseRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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
