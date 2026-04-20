import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';
import emailTemplateService from './emailTemplate.service';
// Email service for sending notifications
class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }
    initializeTransporter() {
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
            }
            else if (emailProvider === 'smtp') {
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
            }
            else {
                logger.warn('Email provider not configured, using mock transporter');
                this.transporter = nodemailer.createTransport({
                    host: 'localhost',
                    port: 1025,
                    ignoreTLS: true,
                });
            }
            logger.info('Email service initialized successfully');
        }
        catch (error) {
            logger.error('Failed to initialize email transporter:', error);
        }
    }
    async sendDeadlineAlert(facultyEmail, facultyName, taskTitle, deadlineDate, daysUntilDeadline) {
        if (!this.transporter) {
            logger.warn('Email transporter not initialized, skipping email send');
            return false;
        }
        try {
            const template = await emailTemplateService.renderTemplate('deadline-reminder', {
                facultyName,
                taskTitle,
                deadlineDate,
                daysRemaining: String(daysUntilDeadline),
                daysUntilDeadline: String(daysUntilDeadline),
                taskStatus: 'Pending',
            });
            if (!template) {
                return false;
            }
            const mailOptions = {
                from: process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER,
                to: facultyEmail,
                subject: template.subject,
                html: template.html,
                text: template.text,
            };
            const info = await this.transporter.sendMail(mailOptions);
            logger.info(`Deadline alert email sent successfully to ${facultyEmail}`, {
                messageId: info.messageId,
                taskTitle,
            });
            return true;
        }
        catch (error) {
            logger.error(`Failed to send deadline alert email to ${facultyEmail}:`, error);
            return false;
        }
    }
    async sendTaskCompletionNotification(toEmail, facultyName, facultyEmail, taskTitle, completedAtISO) {
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
            const template = await emailTemplateService.renderTemplate('task-completion', {
                facultyName,
                facultyEmail,
                taskTitle,
                completedAt,
            });
            if (!template) {
                return false;
            }
            const info = await this.transporter.sendMail({
                from: process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER,
                to: toEmail,
                subject: template.subject,
                html: template.html,
                text: template.text,
            });
            logger.info(`Task completion notification sent to ${toEmail}`, { messageId: info.messageId, taskTitle });
            return true;
        }
        catch (error) {
            logger.error(`Failed to send task completion notification to ${toEmail}:`, error);
            return false;
        }
    }
    async sendBulkDeadlineAlerts(recipients) {
        let sent = 0;
        let failed = 0;
        for (const recipient of recipients) {
            const success = await this.sendDeadlineAlert(recipient.email, recipient.name, recipient.taskTitle, recipient.deadlineDate, recipient.daysUntilDeadline);
            if (success) {
                sent++;
            }
            else {
                failed++;
            }
            // Small delay between emails to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        return { sent, failed };
    }
    async verifyConnection() {
        if (!this.transporter) {
            return false;
        }
        try {
            await this.transporter.verify();
            logger.info('Email connection verified');
            return true;
        }
        catch (error) {
            logger.error('Email connection verification failed:', error);
            return false;
        }
    }
}
export default new EmailService();
