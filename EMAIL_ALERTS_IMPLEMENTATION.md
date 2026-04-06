# Email Deadline Alerts Implementation Summary

## Overview

I've implemented a comprehensive email alert system that notifies faculty members 1 week before task deadlines expire. Here's what was built:

## Components Created

### 1. **Backend Services**

#### Email Service (`backend/src/services/emailService.ts`)
- Configurable email provider support (Gmail, SMTP, or mock)
- Professional HTML and plain-text email templates
- Graceful error handling and logging
- Email verification endpoint

#### Deadline Alerts Service (`backend/src/services/deadlineAlerts.service.ts`)
- Intelligent deadline scanning (1-7 days before due date)
- Daily alert deduplication (prevents duplicate emails)
- Per-faculty alert tracking
- Batch email sending with rate limiting

### 2. **Backend API Routes** (`backend/src/routes/alerts.routes.ts`)

Four endpoints:

**POST /api/alerts/check-and-send**
- Faculty calls this to check their deadlines and send alerts
- Auto-triggered once per day when Activities page loads
- Filters completed tasks
- Returns count of emails sent

**POST /api/alerts/send-bulk**
- Admin endpoint for manual alert triggers
- Send alerts to multiple faculty members
- Includes database lookup for full names

**GET /api/alerts/verify-email**
- Test email configuration
- Returns emailConfigured status

**GET /api/alerts/statistics**
- View alerts sent today
- Track total alerts in memory

### 3. **Frontend Hook** (`hooks/useDeadlineAlerts.ts`)

React hook providing:
- `checkAndSendAlerts()` function to trigger backend
- `verifyEmailConfig()` to test setup
- Daily deduplication via localStorage
- Error handling and loading states

### 4. **Activities Page Integration** (`app/activities/page.tsx`)

- Automatically checks deadlines when page loads
- Shows toast notification when emails are sent
- Prepares deadline list from all paper and patent tasks
- Passes completed status to API

## Architecture Flow

```
User visits Activities page
    ↓
Check if alerts already sent today (localStorage)
    ↓
Prepare list of all deadlines with completion status
    ↓
Call POST /api/alerts/check-and-send
    ↓
Backend checks: 1-7 days to deadline + not sent today
    ↓
Send email for each qualifying deadline
    ↓
Mark as sent in memory to prevent duplicates
    ↓
Return count to frontend
    ↓
Toast notification shown to user
```

## Email Content

Emails include:
- ✅ Professional HTML formatting
- ✅ Task title and deadline date
- ✅ Days remaining until deadline
- ✅ Call to action (submit work)
- ✅ "Do not reply" footer
- ✅ Plain text fallback

Example subject line:
```
⏰ Deadline Reminder: Idea Selection due in 5 day(s)
```

## Setup Required

### 1. Configure Email Provider

Update `.env` in `/backend`:

**Option A - Gmail (Recommended)**
```env
EMAIL_PROVIDER=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx  # App password, not regular password
EMAIL_FROM=your-email@gmail.com
```

**Option B - SMTP (SendGrid, AWS SES, etc.)**
```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
EMAIL_FROM=noreply@example.com
```

**Option C - Development/Testing (No emails sent)**
```env
# Leave EMAIL_PROVIDER unset or empty
```

### 2. Verify Configuration

Test your setup:
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

## Key Features

✅ **Automatic Triggering** - Checks run when Activities page loads
✅ **Smart Deduplication** - One email per deadline per day
✅ **7-Day Window** - Alerts sent when 1-7 days remain
✅ **Completed Task Filtering** - Skips already-submitted tasks
✅ **Multiple Provider Support** - Gmail, SMTP, or mock
✅ **Error Resilient** - Non-blocking on email failures
✅ **User-Friendly** - Toast notifications in UI
✅ **Admin Tools** - Statistics and bulk send endpoints
✅ **Database Integration** - Fetches user names from Prisma

## Files Modified/Created

### Created:
- `backend/src/services/emailService.ts` - Email provider integration
- `backend/src/services/deadlineAlerts.service.ts` - Alert logic
- `backend/src/routes/alerts.routes.ts` - REST API endpoints
- `backend/src/types/nodemailer.d.ts` - TypeScript definitions
- `hooks/useDeadlineAlerts.ts` - React hook
- `backend/.env.example` - Environment template
- `DEADLINE_ALERTS_SETUP.md` - Comprehensive setup guide

### Modified:
- `backend/src/index.ts` - Registered alerts routes
- `app/activities/page.tsx` - Integrated alert checking

## Usage Flow

1. **Initial Setup**
   - Add email credentials to `.env`
   - Verify configuration with test endpoint

2. **Faculty Experience**
   - Visit Activities page
   - Automatic check runs (once per day)
   - If deadlines within 7 days → Check email
   - Toast notification confirms emails sent

3. **Admin Features**
   - Call `/api/alerts/verify-email` to test setup
   - Call `/api/alerts/statistics` to see alerts sent
   - Call `/api/alerts/send-bulk` to manually trigger alerts

## Security Considerations

✅ **Authentication Required** - All endpoints require JWT token
✅ **Environment Variables** - Credentials never in code
✅ **Rate Limiting Ready** - 100ms delay between bulk sends
✅ **Error Logging** - All failures logged (no credentials exposed)
✅ **Production Ready** - Non-blocking, error-resilient design

## Known Limitations & Future Enhancements

### Current Limitations:
- ⚠️ In-memory alert tracking (lost on server restart)
- ⚠️ No email delivery confirmation
- ⚠️ No email template customization

### Recommended Enhancements:
- 📋 Store sent alerts in database (Prisma Model)
- 📊 Add email delivery tracking (open rates, bounces)
- 🎨 Allow admin to customize email templates
- 🔔 Add in-app notifications as fallback
- 📧 Implement email queue with retry logic
- 🌍 Multi-language email templates
- 📱 SMS alerts as alternative channel

## Testing

### Manual Testing Steps:

1. **Set deadline to 3 days from now**
   - Go to `/activities/admin`
   - Change any task deadline to today + 3 days

2. **Visit Activities page**
   - Check browser console for debug logs
   - Look for toast notification
   - Check email inbox

3. **Verify alert deduplication**
   - Refresh Activities page
   - No second email should be sent (same day)

4. **Check statistics**
   ```bash
   curl http://localhost:5000/api/alerts/statistics \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

## Support

For setup help, refer to:
- [`DEADLINE_ALERTS_SETUP.md`](./DEADLINE_ALERTS_SETUP.md) - Full setup guide
- [`backend/.env.example`](./backend/.env.example) - Configuration template
- Server logs for debugging: `docker logs faculty-backend`

---

**Implementation Status**: ✅ Complete and production-ready
