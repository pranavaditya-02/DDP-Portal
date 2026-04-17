import nodemailer from 'nodemailer';
import { logger } from './logger';
const getTransporter = () => {
    const host = process.env.INTERNSHIP_SMTP_HOST || process.env.SMTP_HOST;
    const port = Number(process.env.INTERNSHIP_SMTP_PORT || process.env.SMTP_PORT || 587);
    const secure = (process.env.INTERNSHIP_SMTP_SECURE === 'true' || process.env.SMTP_SECURE === 'true') || port === 465;
    const user = process.env.INTERNSHIP_SMTP_USER || process.env.SMTP_USER;
    const pass = process.env.INTERNSHIP_SMTP_PASSWORD || process.env.SMTP_PASSWORD;
    if (!host || !user || !pass) {
        throw new Error('SMTP configuration is incomplete. Please set INTERNSHIP_SMTP_HOST, INTERNSHIP_SMTP_USER and INTERNSHIP_SMTP_PASSWORD or the standard SMTP settings in your environment.');
    }
    return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
            user,
            pass,
        },
    });
};
export async function sendEmail({ to, subject, text, html, }) {
    const transporter = getTransporter();
    const from = process.env.INTERNSHIP_SMTP_FROM || `${process.env.INTERNSHIP_SMTP_USER}`;
    try {
        await transporter.sendMail({
            from,
            to,
            subject,
            text,
            html,
        });
        logger.info(`Email sent to ${to} with subject: ${subject}`);
    }
    catch (error) {
        logger.error('Failed to send email:', error);
        throw error;
    }
}
