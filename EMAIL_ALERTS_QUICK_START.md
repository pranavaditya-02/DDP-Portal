# Email Alerts Setup - Next Steps

## ✅ What I've Done

1. **Created frontend `.env.local`** with `NEXT_PUBLIC_API_URL=http://localhost:5000/api`
2. **Updated backend `.env`** with `EMAIL_PROVIDER=smtp` configuration
3. **Registered alert routes** in backend server
4. **Integrated alert checking** in Activities page (once per day)

## 🔧 What You Need to Do

### Step 1: Configure Email Provider

Edit `backend/.env` and add your Gmail credentials:

```env
# Email Configuration
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@facultytracking.com
```

**To get Gmail App Password:**
1. Enable 2-Step Verification on your Google Account
2. Go to [Google Account → App passwords](https://myaccount.google.com/apppasswords)
3. Select "Mail" and "Windows Computer"
4. Copy the 16-character password → paste as `SMTP_PASSWORD`

### Step 2: Start the Backend Server

```bash
cd backend
npm install  # if not done already
npm run dev
```

You should see:
```
Server running on port 5000
Environment: development
```

### Step 3: Start/Restart the Frontend Server

```bash
npm run dev
```

The `.env.local` file will be picked up automatically.

### Step 4: Test the Email Alerts

1. Open Activities page: `http://localhost:3000/activities`
2. Check browser console for logs
3. If alerts are sent, you'll see a toast: "📧 N deadline reminder(s) sent to your email"
4. Check your email inbox for the deadline reminder

### Step 5: Verify It's Working

**Backend logs should show:**
```
[INFO] Deadline alert email sent successfully to faculty@example.com
```

**Frontend console should show:**
```
Deadline alerts checked: {sent: N, skipped: M}
```

## 🐛 Troubleshooting

### Still getting 404 errors?

**Check 1:** Is backend running on port 5000?
```bash
curl http://localhost:5000/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

**Check 2:** Is .env.local in the root directory?
```bash
ls .env.local  # Should exist
```

**Check 3:** Did you restart the Next.js dev server after creating .env.local?
```bash
# Stop: Ctrl+C
# Start: npm run dev
```

### Emails not sending?

1. Verify SMTP credentials in `backend/.env`
2. Check backend logs for email errors:
   ```bash
   # Look for lines like:
   # [ERROR] Failed to send deadline alert email
   ```
3. Try Gmail App Password (not regular password)
4. Check Gmail "Less secure apps" setting if using older Gmail

## 📋 File Locations

- Frontend API config: `/.env.local` ← **Create this or verify it exists**
- Backend email config: `/backend/.env` ← **Update SMTP credentials here**
- Alert routes: `/backend/src/routes/alerts.routes.ts`
- Alert hook: `/hooks/useDeadlineAlerts.ts`
- Activities integration: `/app/activities/page.tsx`

## 🎯 Expected Behavior

1. **First visit to Activities page:**
   - Checks if alerts already sent today
   - Identifies deadlines 1-7 days away
   - Sends email for each incomplete task within deadline window
   - Shows toast notification on success

2. **Subsequent visits (same day):**
   - Checks localStorage
   - Skips sending (already sent today)
   - No notification shown

3. **Next day:**
   - Process repeats
   - New emails can be sent if deadlines still within 7 days

---

**Status:** ✅ Implementation complete, waiting for email configuration

Once you configure the SMTP credentials and restart both servers, the email alerts will work!
