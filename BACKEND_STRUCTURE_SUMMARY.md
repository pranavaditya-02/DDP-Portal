# DDP-Portal Backend Structure Summary

## 1. Prisma Schema File Status

**Current State**: No Prisma schema file exists in the repository
- Prisma is configured in `backend/package.json` (v5.8.0)
- Project has `db:migrate`, `db:push`, `db:studio` scripts defined
- Prisma client is initialized in `backend/src/database/client.ts` but not actively used
- **Note**: The project currently uses raw MySQL queries instead of Prisma ORM

---

## 2. Backend Source Structure

```
backend/src/
├── database/
│   ├── mysql.ts          # MySQL pool creation & connection management
│   └── client.ts         # Prisma singleton instance
├── routes/               # API endpoint definitions
│   ├── auth.routes.ts
│   ├── activity.routes.ts
│   ├── paperPresentation.routes.ts  # ⭐ Paper Presentation APIs
│   ├── events.routes.ts
│   ├── import.routes.ts
│   ├── industries.routes.ts
│   └── internshipTracker.routes.ts
├── services/             # Business logic & database operations
│   ├── auth.service.ts
│   ├── activity.service.ts         # Currently Prisma-disabled (mock returns)
│   ├── paperPresentation.service.ts # ⭐ Business logic for paper presentations
│   ├── eventMaster.service.ts
│   ├── industries.service.ts
│   ├── internshipTracker.service.ts
│   └── import services (*.service.ts)
├── middleware/
│   └── auth.ts          # JWT token verification & role-based access
├── utils/
│   └── logger.ts        # Winston logger
└── index.ts             # Express app setup
```

---

## 3. Database Connection Architecture

### MySQL Connection (Primary)
- **File**: `backend/src/database/mysql.ts`
- **Pool Configuration**:
  - Host: `process.env.MYSQL_HOST` (default: 127.0.0.1)
  - Port: `process.env.MYSQL_PORT` (default: 3306)
  - User: `process.env.MYSQL_USER` (default: root)
  - Database: `process.env.MYSQL_DATABASE`
  - Connection limit: `process.env.MYSQL_CONNECTION_LIMIT` (default: 10)
  - SSL support via environment variables
  - Named placeholders enabled (`namedPlaceholders: true`)

- **Exported Functions**:
  ```typescript
  getMysqlPool(): mysql.Pool
  verifyMysqlConnection(): Promise<void>
  ```

### Prisma Client (Configured but Dormant)
- **File**: `backend/src/database/client.ts`
- **Instance**: Singleton pattern with global caching for dev/hot-reload
- **Status**: Logs warning/error events but not actively used for queries
- **Connection**: Not yet integrated with services

---

## 4. API Route Patterns & Endpoints

### Paper Presentation Routes (`/api/paper-presentations`)
**File**: `backend/src/routes/paperPresentation.routes.ts`

#### Endpoints:
1. **POST** `/api/paper-presentations/` - Create new submission
   - Multer file upload: `image_proof`, `abstract_proof`, `certificate_proof`, `attested_cert`
   - Validation: Zod schema
   - Returns: Created record with ID

2. **GET** `/api/paper-presentations/` - List all presentations
   - Query filters: `student_id`, `status`, `iqac_verification`
   - Optional pagination/sorting

3. **GET** `/api/paper-presentations/:id` - Get single presentation
   - Path parameter: `id`

4. **PUT** `/api/paper-presentations/:id` - Update presentation
   - Partial updates supported
   - Tracks `updated_by` user

5. **DELETE** `/api/paper-presentations/:id` - Delete presentation

#### File Upload Configuration:
- **Multiple files**: Handled via `multer.fields()`
- **Destination**: `/uploads/paper-presentations/`
- **Allowed types**: PDF, JPG, JPEG, PNG, DOCX, XLSX (configurable)
- **Max file size**: 10MB (default, configurable)
- **Filename pattern**: `{timestamp}-{sanitized-original-name}`

---

## 5. Paper Presentation Service Implementation

**File**: `backend/src/services/paperPresentation.service.ts`

### Interface: PaperPresentationData
```typescript
{
  student_id: number
  student_name: string
  paper_title: string
  event_start_date: string
  event_end_date: string
  academic_project_type: 'yes' | 'no'
  image_proof_path?: string
  image_proof_name?: string
  abstract_proof_path?: string
  abstract_proof_name?: string
  certificate_proof_path?: string
  certificate_proof_name?: string
  attested_cert_path?: string
  attested_cert_name?: string
  status: 'participated' | 'winner'
  iqac_verification?: 'initiated' | 'processing' | 'completed'
  parental_department?: string
  created_by?: number
}
```

### Core Methods:
1. **createPresentation(data, userId?)** → Returns `{ id, ...data }`
   - Inserts into `paper_presentation` table
   - Sets auto-timestamps via SQL

2. **getAllPresentations(filters?)** → Returns array
   - Supports filters: `student_id`, `status`, `iqac_verification`
   - Orders by `created_at DESC`

3. **getPresentationById(id)** → Returns single record

4. **getPresentationsByStudent(studentId)** → Wrapper for filtered query

5. **updatePresentation(id, data, userId?)** → Returns `{ id, message }`
   - Dynamic SQL: builds SET clause only for provided fields
   - Allowed fields: student_name, paper_title, dates, statuses, proofs, department

6. **updateIQACVerification(id, status, userId?)** → Updates verification status

7. **deletePresentation(id)** → Deletes record permanently

### Error Handling:
- Try-catch blocks with logging via `logger.error()`
- Connection release in finally blocks
- Throws errors up to route handler

---

## 6. Existing Achievement-Related Database Patterns

### Activity Service (`backend/src/services/activity.service.ts`)
**Status**: Currently Prisma-disabled (mock implementation)
- Returns mock/empty data with warning logs
- Methods defined but not persisting to DB
- Designed for role-based access:
  - **Faculty**: Get only their own activities
  - **Verification Team**: Get pending activities
  - **HOD/Dean**: Get department activities
- Future: Will use Prisma when schema is defined

### Event Master Service (`backend/src/services/eventMaster.service.ts`)
- **Used by**: Events-attended, online-course, guest-lecture features
- **Pattern**: Raw MySQL queries with connection pool
- **Key Methods**:
  - `getAllEvents()` - List all event masters
  - `createEvent(input)` - Insert new event
  - `getEventById(id)` - Single record fetch
- **Data Mapping**: Snake_case DB columns → camelCase objects
- **Foreign Keys**: Extensive use of FK relationships

---

## 7. Paper Presentation Database Schema

### Actual SQL Schema (from Dump20260319.sql)
```sql
CREATE TABLE `paper_presentation` (
  id                      INT AUTO_INCREMENT PRIMARY KEY,
  submission_id           INT NOT NULL UNIQUE (FK to submissions)
  special_labs_involved   TINYINT(1) DEFAULT 0
  special_lab_id          INT (FK to special_lab)
  has_intl_institute_collab TINYINT(1)
  institute_name          VARCHAR(300)
  conference_name         VARCHAR(300)
  event_mode_id           INT (FK to ref_event_mode)
  event_location          VARCHAR(300)
  organizer_type_id       INT (FK to ref_organizer_type)
  organizer_name          VARCHAR(300)
  event_level_id          INT (FK to ref_event_level)
  paper_title             VARCHAR(500)
  event_start_date        DATE
  event_end_date          DATE
  event_duration_days     INT
  published_in_proceedings TINYINT(1)
  page_from               INT
  page_to                 INT
  sponsorship_type_id     INT (FK to ref_sponsorship_type)
  funding_agency_name     VARCHAR(300)
  amount_inrs             DECIMAL(12,2)
  registration_amount_inrs DECIMAL(12,2)
  award_received          TINYINT(1)
  apex_proof_id           INT (FK to documents)
  document_proof_id       INT (FK to documents)
  award_proof_id          INT (FK to documents)
)
```

### Reference Tables (Foreign Keys):
- `submissions` - Main activity submission
- `special_lab` - Special labs master
- `ref_event_mode` - Event mode options (Online/Offline)
- `ref_event_level` - Event level options (International/National)
- `ref_organizer_type` - Organizer type options
- `ref_sponsorship_type` - Sponsorship type options
- `documents` - File/document storage table

### Issues with Current Schema vs Service Implementation:
- **Service Code** uses direct string fields: `image_proof_path`, `abst...path`
- **Actual Schema** uses `submission_id` FK + separate `documents` table
- **Mismatch**: Service queries won't match actual table structure!
- **To Fix**: Either update service to match schema or align schema to service

---

## 8. Request Validation Patterns

### Zod Schema (Paper Presentation)
```typescript
z.object({
  student_id: z.preprocess(Number, z.number().int().positive()),
  student_name: z.string().min(1).max(255),
  paper_title: z.string().min(1).max(512),
  event_start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  event_end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  academic_project_type: z.enum(['yes', 'no']),
  status: z.enum(['participated', 'winner']),
  iqac_verification: z.enum(['initiated', 'processing', 'completed']),
  // ... optional fields
})
```

### Error Handling Pattern:
```typescript
try {
  const parsed = schema.parse(req.body)
  // Use parsed data
} catch (error) {
  if (error instanceof z.ZodError) {
    return res.status(400).json({ error: error.errors })
  }
  logger.error('Error:', error)
  res.status(500).json({ error: 'Failed to process' })
}
```

---

## 9. Storage & File Management

### File Upload Flow:
1. **Client**: FormData with files + fields sent to API
2. **Route**: Multer middleware processes files
3. **Service**: Receives file paths from multer
4. **Database**: Stores file path string or FK to documents table
5. **Static Server**: `/uploads` directory served via Express static middleware

### Current File Structure:
- Base: `process.env.UPLOAD_DIR || './uploads'`
- Paper presentations: `/uploads/paper-presentations/`
- Filename: `{timestamp}-{original-name}` (sanitized)

---

## 10. Authentication & Authorization Pattern

**File**: `backend/src/middleware/auth.ts`

### Middleware Functions:
- `authenticateToken` - JWT verification
- `requireRole(role)` - Role-based access check

### Usage in Routes:
```typescript
router.get(
  '/endpoint',
  authenticateToken,        // Verify JWT
  requireRole('faculty'),   // Check role
  async (req: AuthRequest, res) => { ... }
)
```

### Supported Roles:
- `faculty` - Faculty members
- `student` - Students  
- `verification` - Verification team
- `hod` - Head of Department
- `dean` - Dean/College admin

---

## 11. Environment Configuration

### Required Backend .env Variables:
```
# MySQL
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=ddp_portal

# Server
PORT=5000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000

# File Upload
UPLOAD_DIR=./uploads
ALLOWED_FILE_TYPES=pdf,jpg,jpeg,png,docx,xlsx
MAX_FILE_SIZE=10485760

# JWT (if used)
JWT_SECRET=your-secret-key

# MySQL Connection
MYSQL_CONNECTION_LIMIT=10
MYSQL_SSL=true
MYSQL_SSL_REJECT_UNAUTHORIZED=false
```

---

## 12. Key Patterns & Best Practices Used

✅ **Connection Pooling**: MySQL pool reused, released in finally blocks
✅ **Error Handling**: Try-catch with logging via Winston logger
✅ **File Upload**: Multer with type/size validation
✅ **Input Validation**: Zod schemas for request data
✅ **Async/Await**: express-async-errors for error handling
✅ **Role-Based Access**: Middleware for auth checks
✅ **Logging**: Winston logger for all operations
✅ **Environment Config**: dotenv for secrets/config

---

## 13. Recommended Next Steps

For implementing paper-presentation feature:
1. **Schema Decision**: Reconcile service code vs actual DB schema
2. **Prisma Migration**: Move from raw SQL to Prisma (align schema first)
3. **Missing Tables**: Create reference tables if not present
4. **API Testing**: Test all CRUD endpoints with mock data
5. **Frontend Integration**: Connect Next.js forms to backend API
6. **Document Storage**: Consider moving files to cloud (S3/GCS) for scalability
