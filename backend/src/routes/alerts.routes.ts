import express from 'express';
import { z } from 'zod';
import deadlineAlertsService from '../services/deadlineAlerts.service';
import emailService from '../services/emailService';
import { authenticateToken, type AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();

// Validation schemas
const sendDeadlineAlertSchema = z.object({
  facultyId: z.number().optional(),
  facultyEmail: z.string().email().optional(),
  facultyName: z.string().optional(),
  deadlines: z.array(
    z.object({
      taskId: z.string(),
      taskTitle: z.string(),
      deadlineISO: z.string().datetime(),
      isCompleted: z.boolean().optional(),
    })
  ),
});

const bulkAlertSchema = z.object({
  facultyId: z.number(),
  facultyEmail: z.string().email(),
  facultyName: z.string(),
  deadlines: z.array(
    z.object({
      taskId: z.string(),
      taskTitle: z.string(),
      deadlineISO: z.string().datetime(),
    })
  ),
});

const taskCompletedSchema = z.object({
  taskTitle: z.string().min(1),
  completedAt: z.string().datetime().optional(),
  facultyEmail: z.string().email().optional(),
  facultyName: z.string().optional(),
});

/**
 * POST /api/alerts/check-and-send
 * Faculty calls this to check their deadlines and send alerts if needed
 * Sends emails for deadlines within 7 days that haven't been alerted today
 */
router.post('/check-and-send', async (req: AuthRequest, res) => {
  try {
    // Validate request body
    const validationResult = sendDeadlineAlertSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request body',
        details: validationResult.error.errors,
      });
    }

    const { deadlines, facultyEmail, facultyName, facultyId } = validationResult.data;

    // Filter out completed tasks
    const upcomingDeadlines = deadlines.filter((d) => !d.isCompleted);

    if (upcomingDeadlines.length === 0) {
      return res.json({
        message: 'No incomplete deadlines to check',
        sent: 0,
        skipped: 0,
      });
    }

    // Send alerts for this faculty member
    const result = await deadlineAlertsService.sendDeadlineAlertsForFaculty(
      facultyId || req.user?.id || 1,
      facultyEmail || req.user?.email || 'unknown@local.dev',
      facultyName || req.user?.email?.split('@')[0] || 'Faculty Member',
      upcomingDeadlines
    );

    res.json({
      message: 'Deadline alerts processed',
      sent: result.sent,
      skipped: result.skipped,
    });
  } catch (error) {
    logger.error('Error in check-and-send endpoint:', error);
    res.status(500).json({
      error: 'Failed to process deadline alerts',
      message: process.env.NODE_ENV === 'development' ? String(error) : undefined,
    });
  }
});

/**
 * POST /api/alerts/send-bulk
 * Admin endpoint to manually trigger alerts for multiple faculty members
 * Requires admin/maintenance role in production
 */
router.post('/send-bulk', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // In production, add role check here:
    // if (!['admin', 'maintenance'].includes(req.user.role)) {
    //   return res.status(403).json({ error: 'Insufficient permissions' });
    // }

    const validationResult = bulkAlertSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request body',
        details: validationResult.error.errors,
      });
    }

    const { facultyId, facultyEmail, facultyName, deadlines } = validationResult.data;

    const result = await deadlineAlertsService.sendDeadlineAlertsForFaculty(
      facultyId,
      facultyEmail,
      facultyName,
      deadlines
    );

    res.json({
      message: 'Bulk alerts processed',
      facultyId,
      sent: result.sent,
      skipped: result.skipped,
    });
  } catch (error) {
    logger.error('Error in send-bulk endpoint:', error);
    res.status(500).json({
      error: 'Failed to send bulk alerts',
      message: process.env.NODE_ENV === 'development' ? String(error) : undefined,
    });
  }
});

/**
 * POST /api/alerts/task-completed
 * Sends completion notification to configured recipient.
 */
router.post('/task-completed', async (req: AuthRequest, res) => {
  try {
    const validationResult = taskCompletedSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request body',
        details: validationResult.error.errors,
      });
    }

    const { taskTitle, completedAt, facultyEmail, facultyName } = validationResult.data;
    const recipient = process.env.ALERT_NOTIFY_EMAIL || 'hemasri.it23@bitsathy.ac.in';
    const senderEmail = facultyEmail || req.user?.email || 'unknown@local.dev';
    const senderName = facultyName || req.user?.email?.split('@')[0] || 'Faculty Member';
    const doneAt = completedAt || new Date().toISOString();

    const ok = await emailService.sendTaskCompletionNotification(
      recipient,
      senderName,
      senderEmail,
      taskTitle,
      doneAt
    );

    if (!ok) {
      return res.status(500).json({ error: 'Failed to send completion notification' });
    }

    res.json({ message: 'Completion notification sent', to: recipient });
  } catch (error) {
    logger.error('Error in task-completed endpoint:', error);
    res.status(500).json({
      error: 'Failed to send task completion notification',
      message: process.env.NODE_ENV === 'development' ? String(error) : undefined,
    });
  }
});

/**
 * GET /api/alerts/verify-email
 * Verify email configuration
 */
router.get('/verify-email', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const isConfigured = await emailService.verifyConnection();
    res.json({
      emailConfigured: isConfigured,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Error verifying email connection:', error);
    res.status(500).json({
      error: 'Failed to verify email configuration',
    });
  }
});

/**
 * GET /api/alerts/statistics
 * Get statistics about sent alerts
 */
router.get('/statistics', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const stats = deadlineAlertsService.getAlertStatistics();
    res.json({
      statistics: stats,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Error fetching alert statistics:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics',
    });
  }
});

export default router;
