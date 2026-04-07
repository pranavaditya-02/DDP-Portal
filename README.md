# Faculty Achievement Dashboard

Faculty Achievement Dashboard is a full-stack academic workflow platform for tracking faculty achievements, departmental performance, and institutional compliance timelines.

It combines a modern Next.js frontend with a role-aware backend API to support multiple user types including faculty, HOD, dean, verification teams, maintenance/admin users, and students.

## Why This Project Exists

Academic performance tracking is often spread across spreadsheets, emails, and manual follow-ups. This project centralizes those workflows into one platform with:
- Submission and tracking of achievement activities
- Department and college-level visibility
- Verification and approval flows
- Deadline reminders and alert automation
- CSV-assisted data ingestion for legacy records

## Core Capabilities

- Multi-role dashboard experience with route-level navigation
- Faculty activity submission and personal progress tracking
- Verification queue for approve/reject workflows
- Department and college analytics views
- Deadline alert engine with email notifications
- Admin email template management
- CSV import pipeline for events-attended data

## Architecture Overview

The system uses a split frontend-backend architecture.

Frontend:
- Next.js App Router pages in [app](app)
- Shared UI and navigation components in [components](components)
- Role and state handling via [lib/store.ts](lib/store.ts) and [hooks/useRoles.ts](hooks/useRoles.ts)

Backend:
- Express API entry at [backend/src/index.ts](backend/src/index.ts)
- Route modules in [backend/src/routes](backend/src/routes)
- Business services in [backend/src/services](backend/src/services)
- MySQL connection utilities in [backend/src/database/mysql.ts](backend/src/database/mysql.ts)

Data and utilities:
- Institutional assets in [assets](assets)
- Supporting scripts in [scripts](scripts)

## Tech Stack

Frontend stack:
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Zustand
- Axios
- Recharts
- Framer Motion

Backend stack:
- Node.js
- Express
- TypeScript
- JWT-based auth middleware
- MySQL via mysql2
- Nodemailer
- Multer (multipart file upload)
- Zod validation

Tooling and project infrastructure:
- npm package management
- ESLint (backend)
- Docker Compose file available for containerized setup baseline

## Project Structure

```text
app/                             Next.js pages (dashboard, college, department, student, achievements)
components/                      Shared UI and navigation components
hooks/                           Custom hooks (roles, alerts, data)
lib/                             API client, store, helpers, workflow definitions
backend/                         Express backend project
backend/src/routes/              auth, activities, import, alerts routes
backend/src/services/            auth, alerts, import, email services
backend/src/database/            MySQL connection helpers
assets/                          CSV/SQL/JSON datasets and generated files
scripts/                         Data extraction and verification scripts
```

## Getting Started

## 1. Run Frontend

From repository root:

```bash
npm install
npm run dev
```

Frontend URL: http://localhost:3000

You can test quickly using demo login buttons on [app/login/page.tsx](app/login/page.tsx).

## 2. Run Backend

From [backend](backend):

```bash
npm install
npm run dev
```

Backend URL: http://localhost:5000

Health endpoint:

```text
GET /api/health
```

## 3. Configure Environment Variables

Create [backend/.env](backend/.env) locally (already gitignored) with these minimum keys:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=change-me
ALLOWED_ORIGINS=http://localhost:3000

AUTH_BYPASS=true
AUTH_BYPASS_ROLES=admin,faculty,verification,hod,dean,student

MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=your_database
MYSQL_SSL=false
```

Optional mail configuration:

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASSWORD=app-password
EMAIL_FROM=noreply@example.com
ALERT_NOTIFY_EMAIL=recipient@example.com
```

## API Surface

Auth:
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/verify
- GET /api/auth/me

Activities:
- GET /api/activities/my-activities
- POST /api/activities/submit
- GET /api/activities/pending
- POST /api/activities/:activityId/approve
- POST /api/activities/:activityId/reject
- GET /api/activities/department/:departmentId
- GET /api/activities/stats/department/:departmentId

Import:
- POST /api/import/events-attended/csv

Alerts:
- POST /api/alerts/check-and-send
- POST /api/alerts/send-bulk
- POST /api/alerts/task-completed
- GET /api/alerts/email-templates
- PUT /api/alerts/email-templates
- GET /api/alerts/verify-email
- GET /api/alerts/statistics

## Scripts

Root scripts from [package.json](package.json):
- npm run dev
- npm run build
- npm run start
- npm run lint
- npm run extract:ddp-indexing

Backend scripts from [backend/package.json](backend/package.json):
- npm run dev
- npm run build
- npm run start
- npm run lint
- npm test

Note: Prisma-related backend scripts may exist as legacy entries depending on branch history and should be used only if a Prisma schema/migration setup is present.

## Documentation Map

- [DOCS_INDEX.md](DOCS_INDEX.md)
- [GETTING_STARTED.md](GETTING_STARTED.md)
- [SETUP.md](SETUP.md)
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)
- [DEADLINE_ALERTS_SETUP.md](DEADLINE_ALERTS_SETUP.md)
- [EMAIL_ALERTS_IMPLEMENTATION.md](EMAIL_ALERTS_IMPLEMENTATION.md)
- [EMAIL_ALERTS_QUICK_START.md](EMAIL_ALERTS_QUICK_START.md)

When documentation and implementation differ, prefer the implementation in source files as the current truth.

## Security and Git Hygiene

- Environment files are excluded from Git in [.gitignore](.gitignore)
- Keep secrets only in local env files or secure secret stores
- If any secret was previously committed, rotate it immediately

## Contributing

1. Create a feature branch from main.
2. Make focused changes with clear commit messages.
3. Verify frontend and backend start cleanly.
4. Open a pull request with testing notes.

## License

Internal academic software project for faculty achievement and compliance tracking.
