# IQAC Email Notifications Implementation

## Overview
Implemented email notifications for student achievement forms (PPR, PCR, TBM) when verification role updates IQAC verification status. This allows students to receive immediate feedback when their submissions are approved or rejected.

## Forms Updated
1. **PPR** - Paper Presentation (`/app/student/paper-presentation/submit/page.tsx`)
2. **PCR** - Project Competition (`/app/student/project-competition/submit/page.tsx`)
3. **TBM** - Technical Body Membership (`/app/student/technical-body-membership/submit/page.tsx`)
4. **NT** - Newsletter - Uses faculty API, no IQAC verification

## Email Service Pattern (Analyzed from Internship)

### Internship Email Implementation
- **Files Used**: `internshipTracker.routes.ts`, `internshipReport.routes.ts`
- **Email Utility**: `src/utils/mailer.ts` with `sendEmail()` function
- **Pattern**:
  1. Check if status changed from 'initiated' to approved/rejected
  2. Get student email from record
  3. Create HTML and text email bodies
  4. Send email via sendEmail() function
  5. Log email sending for debugging

### Email Configuration
**File**: `src/utils/mailer.ts`
```
Environment Variables (Priority Order):
1. INTERNSHIP_SMTP_HOST / SMTP_HOST
2. INTERNSHIP_SMTP_PORT / SMTP_PORT
3. INTERNSHIP_SMTP_SECURE / SMTP_SECURE
4. INTERNSHIP_SMTP_USER / SMTP_USER
5. INTERNSHIP_SMTP_PASSWORD / SMTP_PASSWORD
6. INTERNSHIP_SMTP_FROM (optional)
```

## Implementation Details

### 1. Database Migrations Created

#### Migration 008: Add student_email to Project Competitions
**File**: `backend/migrations/008_add_student_email_to_project_competitions.sql`
```sql
ALTER TABLE student_project_competitions ADD COLUMN student_email VARCHAR(255) AFTER student_name;
CREATE INDEX idx_student_email ON student_project_competitions (student_email);
```

#### Migration 009: Add student_email to Technical Body Memberships
**File**: `backend/migrations/009_add_student_email_to_technical_body_memberships.sql`
```sql
ALTER TABLE student_technical_body_memberships ADD COLUMN student_email VARCHAR(255) AFTER student_name;
CREATE INDEX idx_student_email ON student_technical_body_memberships (student_email);
```

### 2. Service Layer Updates

#### Updated Files:
- `backend/src/services/studentProjectCompetition.service.ts`
- `backend/src/services/studentTechnicalBodyMembership.service.ts`

#### New Methods Added:
```typescript
// In studentProjectCompetitionService
async getCompetitionByIdWithEmail(id: number): Promise<any>

// In studentTechnicalBodyMembershipService
async getMembershipByIdWithEmail(id: number): Promise<any>
```

**Purpose**: Fetch record with student email for sending notifications.

### 3. Route Updates

#### Files Updated:
- `backend/src/routes/studentProjectCompetition.routes.ts`
- `backend/src/routes/studentTechnicalBodyMembership.routes.ts`

#### For Both Routes:
1. **Import sendEmail utility**:
   ```typescript
   import { sendEmail } from '../utils/mailer';
   ```

2. **Updated IQAC Status Endpoints** (`PUT /:id/iqac-status`):
   - Fetch record with email using new service method
   - Update verification status
   - Send email notification when status changes to 'processing' (APPROVED) or 'completed' (REJECTED)
   - Email includes:
     - Student name and ID
     - Submission details (title, society, etc.)
     - IQAC verification status
     - Rejection remarks (if applicable)

#### Email Status Mapping:
- `'processing'` → Status Text: **APPROVED**
- `'completed'` → Status Text: **REJECTED**
- `'initiated'` → Status Text: **UNDER REVIEW** (no email sent)

### 4. Email Content Templates

#### Paper Presentation Email
```
Subject: Paper Presentation Submission [STATUS] - BannariAmman College

Body includes:
- Student greeting
- Submission ID and title
- IQAC status
- Rejection remarks (if rejected)
- Support contact info
```

#### Project Competition Email
```
Subject: Project Competition Submission [STATUS] - BannariAmman College

Body includes:
- Student greeting
- Submission ID and project title
- IQAC status
- Rejection remarks (if rejected)
- Support contact info
```

#### Technical Body Membership Email
```
Subject: Technical Body Membership Submission [STATUS] - BannariAmman College

Body includes:
- Student greeting
- Submission ID and society name
- IQAC status
- Rejection remarks (if rejected)
- Support contact info
```

## Integration with Existing Systems

### Email Sending Flow:
1. Verification role updates IQAC status via `PUT /:id/iqac-status` endpoint
2. Endpoint retrieves current record with student email
3. Prepares update with new verification status
4. Sends email to student email address (async, non-blocking)
5. Logs email successfully sent or failure
6. Returns updated record to client

### Error Handling:
- Email sending failures are logged but don't block the API response
- Verification status is updated regardless of email sending success
- Students see confirmation on frontend even if email fails to send

## Testing Checklist

- [ ] Run migrations 008 and 009 to add student_email columns
- [ ] Verify students table is populated with college_email addresses
- [ ] Configure SMTP settings in environment:
  - SMTP_HOST (or INTERNSHIP_SMTP_HOST)
  - SMTP_PORT (or INTERNSHIP_SMTP_PORT)
  - SMTP_USER (or INTERNSHIP_SMTP_USER)
  - SMTP_PASSWORD (or INTERNSHIP_SMTP_PASSWORD)
- [ ] Restart backend server
- [ ] Test PPR form IQAC status update → verify email sent
- [ ] Test PCR form IQAC status update → verify email sent
- [ ] Test TBM form IQAC status update → verify email sent
- [ ] Test rejection with remarks → verify remarks appear in email
- [ ] Check server logs for email sending confirmations
- [ ] Verify HTML email renders correctly in mail clients

## Files Modified

### Backend Routes:
1. `backend/src/routes/studentPaperPresentation.routes.ts` - Already had email (no changes)
2. `backend/src/routes/studentProjectCompetition.routes.ts` - Updated
3. `backend/src/routes/studentTechnicalBodyMembership.routes.ts` - Updated

### Backend Services:
1. `backend/src/services/studentProjectCompetition.service.ts` - Added getCompetitionByIdWithEmail()
2. `backend/src/services/studentTechnicalBodyMembership.service.ts` - Added getMembershipByIdWithEmail()

### Migrations:
1. `backend/migrations/008_add_student_email_to_project_competitions.sql` - Created
2. `backend/migrations/009_add_student_email_to_technical_body_memberships.sql` - Created

## Dependencies & Requirements

- **Email Service**: Nodemailer (already installed)
- **SMTP Server**: Must be configured in environment variables
- **Database**: Migrations must be applied to add email columns
- **Student Records**: Must have college_email populated

## Notes

- Paper Presentation (PPR) already had email notification implemented
- Newsletter (NT) is a faculty form with different API endpoint, doesn't use IQAC verification
- Email sending is asynchronous and doesn't block API responses
- All three forms follow the same internship email pattern for consistency
- Student email comes directly from the students table (college_email field)
