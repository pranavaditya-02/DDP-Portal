import nodemailer, { type Transporter } from 'nodemailer';
import { logger } from '../utils/logger';

// Email service for sending notifications
class EmailService {
  private transporter: Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    try {
      // Support multiple email providers
      const emailProvider = process.env.EMAIL_PROVIDER || 'gmail';

      if (emailProvider === 'gmail') {
        const gmailUser = process.env.EMAIL_USER;
        const gmailPass = process.env.EMAIL_PASSWORD;
        if (!gmailUser || !gmailPass || gmailUser.includes('your-') || gmailPass.includes('your-')) {
          logger.warn('Gmail credentials are not configured. Email sending is disabled.');
          this.transporter = null;
          return;
        }
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: gmailUser,
            pass: gmailPass,
          },
        });
      } else if (emailProvider === 'smtp') {
        const smtpHost = process.env.SMTP_HOST;
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASSWORD;

        if (!smtpHost || smtpHost === 'your_smtp_server') {
          logger.warn('SMTP host is not configured. Email sending is disabled until SMTP settings are updated.');
          this.transporter = null;
          return;
        }

        if (!smtpUser || !smtpPass || smtpUser.includes('your_') || smtpPass.includes('your_')) {
          logger.warn('SMTP credentials are not configured. Email sending is disabled until SMTP_USER and SMTP_PASSWORD are set.');
          this.transporter = null;
          return;
        }

        this.transporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });
      } else {
        logger.warn('Email provider not configured, using mock transporter');
        this.transporter = nodemailer.createTransport({
          host: 'localhost',
          port: 1025,
          ignoreTLS: true,
        });
      }

      logger.info('Email service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email transporter:', error);
    }
  }

  async sendDeadlineAlert(
    facultyEmail: string,
    facultyName: string,
    taskTitle: string,
    deadlineDate: string,
    daysUntilDeadline: number
  ): Promise<boolean> {
    if (!this.transporter) {
      logger.warn('Email transporter not initialized, skipping email send');
      return false;
    }

    try {
      const subject = `⏰ Deadline Reminder: ${taskTitle} due in ${daysUntilDeadline} day(s)`;

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">Deadline Reminder</h2>
            <p style="color: #666; line-height: 1.6;">
              Dear <strong>${facultyName}</strong>,
            </p>
            <p style="color: #666; line-height: 1.6;">
              This is a reminder that your task <strong>"${taskTitle}"</strong> is due on <strong>${deadlineDate}</strong>.
            </p>
            <p style="color: #666; line-height: 1.6;">
              You have <strong>${daysUntilDeadline} day(s)</strong> to complete and submit this task.
            </p>
          </div>

          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 20px;">
            <p style="color: #856404; margin: 0; line-height: 1.6;">
              <strong>Action Required:</strong> Please log in to the Faculty Achievement Dashboard to submit your work before the deadline.
            </p>
          </div>

          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
            This is an automated email. Please do not reply to this message.
          </p>
        </div>
      `;

      const textContent = `
Deadline Reminder

Dear ${facultyName},

This is a reminder that your task "${taskTitle}" is due on ${deadlineDate}.
You have ${daysUntilDeadline} day(s) to complete and submit this task.

Please log in to the Faculty Achievement Dashboard to submit your work before the deadline.

---
This is an automated email. Please do not reply to this message.
      `;

      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER,
        to: facultyEmail,
        subject,
        html: htmlContent,
        text: textContent,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Deadline alert email sent successfully to ${facultyEmail}`, {
        messageId: info.messageId,
        taskTitle,
      });
      return true;
    } catch (error) {
      logger.error(`Failed to send deadline alert email to ${facultyEmail}:`, error);
      return false;
    }
  }

  async sendTaskCompletionNotification(
    toEmail: string,
    facultyName: string,
    facultyEmail: string,
    taskTitle: string,
    completedAtISO: string
  ): Promise<boolean> {
    if (!this.transporter) {
      logger.warn('Email transporter not initialized, skipping task completion notification');
      return false;
    }

    try {
      const completedAt = new Date(completedAtISO).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });

      const subject = `Task Completed: ${taskTitle}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
          <h2 style="color: #333;">Task Completion Alert</h2>
          <p>A task has been marked as completed in the Faculty Achievement Dashboard.</p>
          <table style="border-collapse: collapse; width: 100%; margin-top: 12px;">
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Faculty Name</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${facultyName}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Faculty Email</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${facultyEmail}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Task</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${taskTitle}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Completed At</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${completedAt}</td></tr>
          </table>
        </div>
      `;

      const text = `Task Completion Alert\n\nFaculty Name: ${facultyName}\nFaculty Email: ${facultyEmail}\nTask: ${taskTitle}\nCompleted At: ${completedAt}`;

      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER,
        to: toEmail,
        subject,
        html,
        text,
      });

      logger.info(`Task completion notification sent to ${toEmail}`, { messageId: info.messageId, taskTitle });
      return true;
    } catch (error) {
      logger.error(`Failed to send task completion notification to ${toEmail}:`, error);
      return false;
    }
  }

  async sendBulkDeadlineAlerts(
    recipients: Array<{
      email: string;
      name: string;
      taskTitle: string;
      deadlineDate: string;
      daysUntilDeadline: number;
    }>
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const recipient of recipients) {
      const success = await this.sendDeadlineAlert(
        recipient.email,
        recipient.name,
        recipient.taskTitle,
        recipient.deadlineDate,
        recipient.daysUntilDeadline
      );
      if (success) {
        sent++;
      } else {
        failed++;
      }
      // Small delay between emails to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return { sent, failed };
  }

  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      logger.info('Email connection verified');
      return true;
    } catch (error) {
      logger.error('Email connection verification failed:', error);
      return false;
    }
  }
}

export default new EmailService();
