import { readFile, writeFile } from 'fs/promises';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger';
const DEFAULT_TEMPLATES = [
    {
        id: 'deadline-reminder',
        name: 'Deadline Reminder',
        type: 'deadline-reminder',
        subject: 'Deadline Reminder: {{taskTitle}} due in {{daysRemaining}} day(s)',
        content: `Dear {{facultyName}},

This is a reminder that your task "{{taskTitle}}" is due on {{deadlineDate}}.

You have {{daysRemaining}} day(s) to complete and submit this task.

Important Details:
- Task: {{taskTitle}}
- Deadline: {{deadlineDate}}
- Status: {{taskStatus}}

Please log in to the Faculty Achievement Dashboard to submit your work before the deadline.

Dashboard Link: {{dashboardLink}}

This is an automated email. Please do not reply to this message.`,
        placeholders: ['facultyName', 'taskTitle', 'daysRemaining', 'deadlineDate', 'taskStatus', 'dashboardLink'],
    },
    {
        id: 'submission-confirmation',
        name: 'Submission Confirmation',
        type: 'submission-confirmation',
        subject: 'Submission Confirmed: {{taskTitle}}',
        content: `Dear {{facultyName}},

Your submission for "{{taskTitle}}" has been received successfully.

Submission Details:
- Task: {{taskTitle}}
- Submission Date: {{submissionDate}}
- Reference ID: {{submissionId}}

Your submission is now under review. You will be notified once it has been verified.

This is an automated email. Please do not reply to this message.`,
        placeholders: ['facultyName', 'taskTitle', 'submissionDate', 'submissionId'],
    },
    {
        id: 'approval-notification',
        name: 'Approval Notification',
        type: 'approval-notification',
        subject: '{{taskTitle}} - Approved',
        content: `Dear {{facultyName}},

Great news! Your submission for "{{taskTitle}}" has been approved.

Approval Details:
- Task: {{taskTitle}}
- Points Earned: {{pointsEarned}}
- Approval Date: {{approvalDate}}
- Status: Approved

Your achievement points have been updated in the system.

This is an automated email. Please do not reply to this message.`,
        placeholders: ['facultyName', 'taskTitle', 'pointsEarned', 'approvalDate'],
    },
    {
        id: 'task-completion',
        name: 'Task Completion',
        type: 'task-completion',
        subject: 'Task Completed: {{taskTitle}}',
        content: `Dear {{facultyName}},

Your task "{{taskTitle}}" has been marked as completed in the Faculty Achievement Dashboard.

Faculty Email: {{facultyEmail}}
Completed At: {{completedAt}}

This is an automated email. Please do not reply to this message.`,
        placeholders: ['facultyName', 'facultyEmail', 'taskTitle', 'completedAt'],
    },
];
const TEMPLATE_FILE_PATH = resolve(dirname(fileURLToPath(import.meta.url)), '../../data/email-templates.json');
class EmailTemplateService {
    replacePlaceholders(template, values) {
        return template.replace(/{{\s*([\w-]+)\s*}}/g, (_, key) => values[key] ?? '');
    }
    escapeHtml(value) {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    toHtml(content) {
        const escaped = this.escapeHtml(content);
        return escaped.replace(/\n/g, '<br />');
    }
    async readTemplatesFromDisk() {
        try {
            const raw = await readFile(TEMPLATE_FILE_PATH, 'utf8');
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) {
                return null;
            }
            return parsed;
        }
        catch (error) {
            return null;
        }
    }
    async writeTemplatesToDisk(templates) {
        await writeFile(TEMPLATE_FILE_PATH, JSON.stringify(templates, null, 2), 'utf8');
    }
    async getTemplates() {
        const templates = await this.readTemplatesFromDisk();
        if (templates && templates.length > 0) {
            return templates;
        }
        await this.writeTemplatesToDisk(DEFAULT_TEMPLATES);
        return DEFAULT_TEMPLATES;
    }
    async saveTemplates(templates) {
        await this.writeTemplatesToDisk(templates);
        return templates;
    }
    async resetTemplates() {
        await this.writeTemplatesToDisk(DEFAULT_TEMPLATES);
        return DEFAULT_TEMPLATES;
    }
    async getTemplateByType(type) {
        const templates = await this.getTemplates();
        return templates.find((template) => template.type === type) ?? null;
    }
    async renderTemplate(type, values) {
        const template = await this.getTemplateByType(type);
        if (!template) {
            logger.warn(`Email template not found for type: ${type}`);
            return null;
        }
        const mergedValues = {
            ...values,
            dashboardLink: values.dashboardLink || process.env.APP_URL || 'http://localhost:3000',
        };
        const subject = this.replacePlaceholders(template.subject, mergedValues);
        const text = this.replacePlaceholders(template.content, mergedValues);
        const html = this.toHtml(text);
        return { subject, text, html };
    }
}
export default new EmailTemplateService();
export { DEFAULT_TEMPLATES };
