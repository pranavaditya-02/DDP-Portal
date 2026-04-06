# Email Deadline Alerts Setup Guide

This guide explains how to configure and use the email deadline alert system for the Faculty Achievement Dashboard.

## Overview

The email deadline alerts system automatically notifies faculty members 1 week before their task deadlines are due. Emails are sent only once per day per deadline to avoid spam.

## Architecture

### Frontend
- **Hook**: `useDeadlineAlerts()` in [hooks/useDeadlineAlerts.ts](../hooks/useDeadlineAlerts.ts)
- **Integration**: Activities page checks deadlines when loaded
- **Frequency**: Once per day (tracked via localStorage)

### Backend
- **Email Service**: [backend/src/services/emailService.ts](../backend/src/services/emailService.ts)
- **Alert Logic**: [backend/src/services/deadlineAlerts.service.ts](../backend/src/services/deadlineAlerts.service.ts)
- **API Routes**: [backend/src/routes/alerts.routes.ts](../backend/src/routes/alerts.routes.ts)

## Setup Instructions

### 1. Configure Email Provider

Choose one of the following methods:

#### Option A: Gmail (Recommended for Testing)

1. Enable 2-Step Verification on your Gmail account
2. Create an App Password:
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Navigate to Security → App passwords
   - Select Mail and Windows Computer
   - Copy the generated 16-character password

3. Update `.env` in backend:
```env
EMAIL_PROVIDER=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx
EMAIL_FROM=your-email@gmail.com
```

#### Option B: Generic SMTP Provider (SendGrid, AWS SES, etc.)

1. Obtain SMTP credentials from your email service provider

2. Update `.env` in backend:
```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
EMAIL_FROM=noreply@example.com
```

#### Option C: Mock Transporter (Development/Testing)

Leave EMAIL_PROVIDER unset or empty:
```env
# Emails will be logged but not actually sent
```

### 2. Install Dependencies

The required `nodemailer` package is already installed in both frontend and backend.

Check backend:
```bash
cd backend
npm install
# nodemailer should be in dependencies
```

### 3. Verify Email Configuration

Call the verification endpoint to test your setup:

```bash
curl -X GET http://localhost:5000/api/alerts/verify-email \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Expected response:
```json
{
  "emailConfigured": true,
  "timestamp": "2026-04-06T10:30:00.000Z"
}
```

## API Endpoints

### POST /api/alerts/check-and-send
**Description**: Faculty calls this to check their upcoming deadlines and send alerts

**Request Body**:
```json
{
  "deadlines": [
    {
      "taskId": "paper-idea-selection",
      "taskTitle": "Idea Selection",
      "deadlineISO": "2026-07-31T00:00:00Z",
      "isCompleted": false
    }
  ]
}
```

**Response**:
```json
{
  "message": "Deadline alerts processed",
  "sent": 2,
  "skipped": 0
}
```

**Auto-triggered**: Yes, when Activities page loads (once per day)

### POST /api/alerts/send-bulk
**Description**: Admin endpoint to manually send alerts to multiple faculty members

**Request Body**:
```json
{
  "facultyId": 123,
  "facultyEmail": "faculty@example.com",
  "facultyName": "Dr. John Doe",
  "deadlines": [
    {
      "taskId": "paper-idea-selection",
      "taskTitle": "Idea Selection",
      "deadlineISO": "2026-07-31T00:00:00Z"
    }
  ]
}
```

### GET /api/alerts/verify-email
**Description**: Verify email configuration is working

**Response**:
```json
{
  "emailConfigured": true,
  "timestamp": "2026-04-06T10:30:00.000Z"
}
```

### GET /api/alerts/statistics
**Description**: Get statistics about sent alerts today

**Response**:
```json
{
  "statistics": {
    "totalSentToday": 5,
    "alertsTracked": 48
  },
  "timestamp": "2026-04-06T10:30:00.000Z"
}
```

## Email Content

Deadline reminder emails include:
- Faculty member name
- Task title
- Deadline date (formatted as "31 Jul 2026")
- Days until deadline
- Call to action to submit work
- Link/reminder to login to dashboard

Example email subject:
```
⏰ Deadline Reminder: Idea Selection due in 5 day(s)
```

## How It Works

### Daily Alert Flow

1. **Faculty logs in** → Activities page loads
2. **Page triggers alert check** → `checkAndSendAlerts()` function called
3. **One time per day** → Alert history checked in localStorage
4. **Deadline window** → Only tasks with 1-7 days until deadline
5. **Email sent** → Faculty receives reminder email
6. **History updated** → `deadline_alerts_last_check` timestamp set

### Key Features

- ✅ **Once-per-day limit**: Prevents duplicate emails
- ✅ **Smart filtering**: Only incomplete tasks within 7 days
- ✅ **Graceful degradation**: Non-blocking on error
- ✅ **Date-based tracking**: Resets at midnight
- ✅ **Timezone aware**: Uses local timezone conversion

## Monitoring & Debugging

### Check Alert Statistics

View via the admin dashboard or API:
```bash
curl http://localhost:5000/api/alerts/statistics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Enable Debug Logging

In backend `.env`:
```env
LOG_LEVEL=debug
```

Check server logs for:
```
[INFO] Deadline alert email sent successfully to faculty@example.com
[ERROR] Failed to send deadline alert email to faculty@example.com
```

### Test Email (Manual)

Create a test task with deadline 5 days away:
1. Go to /activities/admin
2. Edit any task deadline to `today + 5 days`
3. Navigate to /activities
4. Check:
   - Email inbox for reminder
   - Browser console for logs
   - Server logs for details

## Troubleshooting

### "Email not sending"

1. **Verify configuration**:
   ```bash
   curl -X GET http://localhost:5000/api/alerts/verify-email
   ```

2. **Check .env file**:
   - EMAIL_USER and EMAIL_PASSWORD match expectations
   - SMTP_HOST is correct if using SMTP

3. **Gmail specific**:
   - Ensure 2FA is enabled
   - App password is 16 characters with hyphens
   - Less secure apps setting may need to be on

### "Same email sent multiple times"

- This is prevented by date-based deduplication
- Check `deadline_alerts_last_check` in localStorage
- Clear localStorage if testing multiple times per day

### "Emails going to spam"

1. Add noreply email to contacts
2. Use verified email domain for SMTP
3. Add SPF/DKIM records if self-hosting

## Production Considerations

### Recommended Enhancements

1. **Database Persistence**
   - Replace in-memory `sentAlertsMap` with Prisma model
   - Track email delivery status

2. **Email Queue**
   - Use Bull/RabbitMQ for async processing
   - Retry failed deliveries

3. **Analytics**
   - Track open rates (with tracking pixel)
   - Monitor bounce rates
   - Log all sends to audit trail

4. **Rate Limiting**
   - Implement per-faculty rate limits
   - Prevent API abuse

5. **Templates**
   - Store email templates in database
   - Allow customization per institution

### Environment Variables to Set

```env
# Email
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxxxxxxxxxxx
EMAIL_FROM=noreply@yourinstitution.edu

# Other
NODE_ENV=production
PORT=5000
```

## Support

For issues or questions:
1. Check server logs: `docker logs faculty-backend`
2. Verify email config: `GET /api/alerts/verify-email`
3. Check statistics: `GET /api/alerts/statistics`
4. Review alert service code: `backend/src/services/deadlineAlerts.service.ts`
