import { logger } from '../utils/logger';
import emailService from './emailService';

interface DeadlineAlert {
  facultyId: number;
  facultyEmail: string;
  facultyName: string;
  taskId: string;
  taskTitle: string;
  deadlineDate: string;
  daysUntilDeadline: number;
}

// Storage key for tracking sent alerts (in practice, this should be in a database table)
const ALERT_SENT_KEY_PREFIX = 'deadline_alert_sent_';

// In-memory store for tracking sent alerts (in production, use database)
const sentAlertsMap = new Map<string, number>();

class DeadlineAlertsService {
  /**
   * Calculate days until deadline
   */
  private getDaysUntilDeadline(deadlineISO: string): number {
    const deadline = new Date(deadlineISO);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Check if an alert has already been sent today for this deadline
   */
  private hasAlertBeenSent(facultyId: number, taskId: string): boolean {
    const key = `${ALERT_SENT_KEY_PREFIX}${facultyId}_${taskId}`;
    const lastSentTime = sentAlertsMap.get(key);

    if (!lastSentTime) {
      return false;
    }

    // Check if alert was sent today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastSentDate = new Date(lastSentTime);
    lastSentDate.setHours(0, 0, 0, 0);

    return lastSentDate.getTime() === today.getTime();
  }

  /**
   * Mark alert as sent
   */
  private markAlertAsSent(facultyId: number, taskId: string): void {
    const key = `${ALERT_SENT_KEY_PREFIX}${facultyId}_${taskId}`;
    sentAlertsMap.set(key, Date.now());
  }

  /**
   * Find all deadlines within 7 days that need alerts
   */
  async findUpcomingDeadlines(): Promise<DeadlineAlert[]> {
    try {
      logger.info('Scanning for upcoming deadlines...');
      // Prisma is intentionally disabled in this deployment.
      // Deadline scans are driven by frontend payloads via sendDeadlineAlertsForFaculty.
      return [];
    } catch (error) {
      logger.error('Error finding upcoming deadlines:', error);
      return [];
    }
  }

  /**
   * Send alerts for a specific faculty member based on their deadlines
   * This is called from the frontend with the faculty's deadline data
   */
  async sendDeadlineAlertsForFaculty(
    facultyId: number,
    facultyEmail: string,
    facultyName: string,
    deadlines: Array<{
      taskId: string;
      taskTitle: string;
      deadlineISO: string;
    }>
  ): Promise<{ sent: number; skipped: number }> {
    let sent = 0;
    let skipped = 0;

    for (const deadline of deadlines) {
      const daysUntilDeadline = this.getDaysUntilDeadline(deadline.deadlineISO);

      // Check if deadline is within 7 days and hasn't been alerted today
      if (daysUntilDeadline <= 7 && daysUntilDeadline > 0) {
        if (this.hasAlertBeenSent(facultyId, deadline.taskId)) {
          logger.info(
            `Alert already sent today for ${deadline.taskId} to faculty ${facultyId}`
          );
          skipped++;
          continue;
        }

        // Format deadline for display
        const deadlineDate = new Date(deadline.deadlineISO).toLocaleDateString(
          'en-US',
          { year: 'numeric', month: 'short', day: 'numeric' }
        );

        // Send email alert
        const emailSent = await emailService.sendDeadlineAlert(
          facultyEmail,
          facultyName,
          deadline.taskTitle,
          deadlineDate,
          daysUntilDeadline
        );

        if (emailSent) {
          this.markAlertAsSent(facultyId, deadline.taskId);
          sent++;
        } else {
          skipped++;
        }
      }
    }

    return { sent, skipped };
  }

  /**
   * Get statistics about sent alerts
   */
  getAlertStatistics(): {
    totalSentToday: number;
    alertsTracked: number;
  } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let sentToday = 0;
    for (const [, timestamp] of sentAlertsMap) {
      const sentDate = new Date(timestamp);
      sentDate.setHours(0, 0, 0, 0);
      if (sentDate.getTime() === today.getTime()) {
        sentToday++;
      }
    }

    return {
      totalSentToday: sentToday,
      alertsTracked: sentAlertsMap.size,
    };
  }
}

export default new DeadlineAlertsService();
