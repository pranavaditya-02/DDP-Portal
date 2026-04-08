# DDP-Portal Project Structure Analysis

## 1. Database Setup & Architecture

### Technology Stack
- **ORM**: Prisma (v5.8.0) - configured but currently disabled/mocked
- **Database**: MySQL with mysql2 driver
- **Connection Management**: Connection pooling via `getMysqlPool()`
- **Database Client**: Located at [backend/src/database/client.ts](backend/src/database/client.ts)

### Current Database Status
The project has Prisma configured but the actual services are **mocked** and returning empty results. This suggests the database schema hasn't been fully implemented yet.

### Database Connection Pattern
```typescript
// backend/src/database/client.ts
const prisma = new PrismaClient({
  log: ['warn', 'error'],
});
```

### MySQL Connection Pattern (Used for Internship Tracker)
```typescript
// backend/src/database/mysql.ts
const mysqlPool = mysql.createPool({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || '',
  waitForConnections: true,
  connectionLimit: 10,
  timezone: 'Z',
});
```

### Internship Tracker Schema (Example)
The project uses direct SQL queries. Here's an example table structure:
```sql
CREATE TABLE students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_name VARCHAR(255) NOT NULL,
  roll_no VARCHAR(100) UNIQUE NOT NULL,
  enrollment_no VARCHAR(100) UNIQUE,
  college_email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  department VARCHAR(100),
  year_of_join INT,
  date_of_birth DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE internship_tracker (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  industry_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  aim_objectives_link VARCHAR(255),
  offer_letter_link VARCHAR(255),
  iqac_verification ENUM('initiated', 'inprogress', 'completed') DEFAULT 'initiated',
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (industry_id) REFERENCES industries(id)
);
```

### Key Database Features
- **Timestamps**: auto_increment primary keys, created_at/updated_at tracking
- **Enums**: used for status fields (initiated, inprogress, completed)
- **Foreign Keys**: for relationships between entities
- **Connection Pooling**: maintains 10 active connections by default

---

## 2. Achievement Pages Structure

### Directory Organization
```
app/achievements/
├── guest-lecture-delivered/
│   ├── page.tsx              # List view
│   └── submit/page.tsx       # Form submission
├── online-course/
├── paper-presentation/       # Current focus
├── events-attended/
├── events-organized/
├── external-examiner/
├── e-content-developed/
├── international-visit/
├── journal-reviewer/
├── newsletter/
├── notable-achievements-and-awards/
└── resource-person/
```

### Achievement Page Types (Total: 12 types)
1. **Guest Lecture Delivered** - Faculty-led lecture events
2. **Paper Presentation** - Conference paper presentations
3. **Online Course** - Completed online courses
4. **Events Attended** - Attended events
5. **Events Organized** - Organized events
6. **External Examiner** - External examining roles
7. **E-Content Developed** - Digital content creation
8. **International Visit** - International travel/collaboration
9. **Journal Reviewer** - Journal review assignments
10. **Newsletter** - Newsletter contributions
11. **Notable Achievements & Awards** - Special achievements
12. **Resource Person** - Resource person activities

### Page Structure Pattern

#### List/View Page (`page.tsx`)
- Shows records in a table with filters
- Implements search functionality
- Status badge display (Approved/Pending/Rejected)
- Delete functionality
- "Add Record" button linking to submit page
- Filters by status, level, and other relevant fields
- Uses mock data (sample records for UI demonstration)

**Example**: [app/achievements/guest-lecture-delivered/page.tsx](app/achievements/guest-lecture-delivered/page.tsx)

#### Submit Form Page (`submit/page.tsx`)
- Client-side form with local state management
- File upload with drag-and-drop support
- Conditional field visibility based on form values
- Comprehensive validation before submission
- Currently mocks submission (no actual API call implementation)

**Example**: [app/achievements/paper-presentation/submit/page.tsx](app/achievements/paper-presentation/submit/page.tsx)

---

## 3. Form Implementation Patterns

### Guest Lecture Form Structure
[app/achievements/guest-lecture-delivered/submit/page.tsx](app/achievements/guest-lecture-delivered/submit/page.tsx)

**Key Features**:
- Task ID (required)
- Special Labs toggle with conditional dropdown
- Event type selection (13 options)
- Mode of conduct (Online/Offline/Hybrid)
- Event level (Within BIT/State/National/International)
- Organizer type with conditional details
- Date range validation
- 3 file uploads (Document Proof, Apex Proof, Photos)

**Form State Management**:
```typescript
type FormData = {
  taskID: string;
  specialLabsInvolved: "yes" | "no";
  specialLab: string;
  eventType: string;
  topic: string;
  modeOfConduct: string;
  eventLevel: string;
  // ... more fields
  documentProof: File | null;
  apexProof: File | null;
  photos: File | null;
};

type FormErrors = Partial<Record<keyof FormData, string>>;
```

### Online Course Form Structure
[app/achievements/online-course/submit/page.tsx](app/achievements/online-course/submit/page.tsx)

**Key Content Options**:
- Mode: Online/Offline/Hybrid
- Course Type: AICTE, CISCO, COURSERA, edX, GOOGLE, IBM, IGNOU, MICROSOFT, NPTEL, SWAYAM, etc.
- Organizer Type: Private/Government
- Event Level: State/National/International

### Common Form Patterns

#### 1. Required Field Validation
```typescript
const validate = () => {
  const nextErrors: FormErrors = {};
  
  if (!formData.taskID) nextErrors.taskID = "Task ID is required";
  if (!formData.eventType || formData.eventType === "Click to choose") {
    nextErrors.eventType = "Event Type is required";
  }
  
  setErrors(nextErrors);
  return Object.keys(nextErrors).length === 0;
};
```

#### 2. Conditional Field Display
```typescript
const showOrganizerDetails = 
  formData.eventOrganizer !== "Click to choose" &&
  formData.eventOrganizer !== "BIT";

// In JSX:
{showOrganizerDetails && (
  <div>
    {/* Fields shown only when condition is true */}
  </div>
)}
```

#### 3. Date Validation
```typescript
if (new Date(formData.toDate) < new Date(formData.fromDate)) {
  nextErrors.toDate = "To Date cannot be before From Date";
}
```

#### 4. Form Submission
```typescript
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (!validate()) return;
  
  setIsSubmitting(true);
  try {
    // Currently just navigates after delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push("/achievements/guest-lecture-delivered");
  } catch (error) {
    console.error("Error submitting form:", error);
    alert("Failed to submit form. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};
```

---

## 4. File Upload & Data Submission

### File Upload Component Pattern

#### Drag-and-Drop Upload Area
**Location**: [app/achievements/guest-lecture-delivered/submit/page.tsx](app/achievements/guest-lecture-delivered/submit/page.tsx) (lines 70-170)

**Features**:
```typescript
interface UploadCardProps {
  label: string;
  required?: boolean;
  file: File | null;
  error?: string;
  dragActive: boolean;
  setDragActive: (v: boolean) => void;
  onDropFile: (field: FileField, file: File) => void;
  fieldName: FileField;
  clearFile: (field: FileField) => void;
  accept?: string;
  icon?: "upload" | "image";
}
```

**Drag Handler**:
```typescript
const handleDrag = (e: DragEvent<HTMLDivElement>) => {
  e.preventDefault();
  e.stopPropagation();
  if (e.type === "dragenter" || e.type === "dragover") {
    setDragActive(true);
  } else if (e.type === "dragleave") {
    setDragActive(false);
  }
};

const handleDrop = (e: DragEvent<HTMLDivElement>) => {
  e.preventDefault();
  e.stopPropagation();
  setDragActive(false);
  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
    onDropFile(fieldName, e.dataTransfer.files[0]);
  }
};
```

**UI Styling**:
- Dashed border that changes color on drag (slate-300 → indigo-500)
- Background changes on drag (white → indigo-50)
- Cloud upload icon
- File display with name and remove button
- Support for PDF, JPG, PNG up to 10MB
- Error state styling with red borders

#### File State Management
```typescript
type FileField = "documentProof" | "apexProof" | "photos";

const [formData, setFormData] = useState<FormData>({
  // ... other fields
  documentProof: null,
  apexProof: null,
  photos: null,
});

const handleFilePick = (fieldName: FileField, file: File) => {
  setFormData((prev) => ({ ...prev, [fieldName]: file }));
  setErrors((prev) => ({ ...prev, [fieldName]: "" }));
};

const clearFile = (fieldName: FileField) => {
  setFormData((prev) => ({ ...prev, [fieldName]: null }));
};
```

### Current Submission Flow
⚠️ **Note**: File submission is **NOT** currently implemented. Forms are mocked.

1. User fills form
2. Validation occurs
3. File selected/uploaded stays in memory
4. On submit → setTimeout delay → redirect to list page
5. No actual API call or database storage

### Expected Future Implementation
```typescript
// Would need to:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validate()) return;
  
  setIsSubmitting(true);
  try {
    const formDataToSend = new FormData();
    
    // Add text fields
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && typeof value !== 'object') {
        formDataToSend.append(key, String(value));
      }
    });
    
    // Add files
    if (formData.documentProof) {
      formDataToSend.append('documentProof', formData.documentProof);
    }
    if (formData.apexProof) {
      formDataToSend.append('apexProof', formData.apexProof);
    }
    if (formData.photos) {
      formDataToSend.append('photos', formData.photos);
    }
    
    // Send to API
    const response = await fetch('/api/achievements/guest-lecture', {
      method: 'POST',
      body: formDataToSend, // FormData sets correct content-type
    });
    
    if (!response.ok) throw new Error('Submission failed');
    
    router.push("/achievements/guest-lecture-delivered");
  } catch (error) {
    console.error(error);
    alert("Failed to submit form. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};
```

---

## 5. Student/Faculty Relationship Models

### User Model (Auth Store)
**Location**: [lib/store.ts](lib/store.ts)

```typescript
interface User {
  id: number;
  email: string;
  name: string;
  roles: string[];           // Multiple roles per user
  departmentId?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean;

  // Helper methods
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
}
```

### Role-Based Access Control
**Roles identified in activity routes**:
- `faculty` - Can submit activities
- `verification` - Can approve/reject activities
- `admin` / `HOD` / `dean` - Administrative roles

**Implementation**: [backend/src/middleware/auth.ts](backend/src/middleware/auth.ts)
```typescript
router.post('/submit',
  authenticateToken,
  requireRole('faculty'),
  async (req: AuthRequest, res) => {
    // Faculty-specific logic
  }
);
```

### Internship Tracker Service (Example Schema)
**Location**: [backend/src/services/internshipTracker.service.ts](backend/src/services/internshipTracker.service.ts)

```typescript
export interface InternshipTrackerCreateInput {
  student_id: number;
  industry_id: number;
  start_date: string;
  end_date: string;
  aim_objectives_link?: string | null;
  offer_letter_link?: string | null;
  iqac_verification?: 'initiated' | 'inprogress' | 'completed';
}

export interface InternshipTrackerRecord {
  id: number;
  student_id: number;
  student_name?: string | null;
  student_roll_no?: string | null;
  industry_id: number;
  industry_name?: string | null;
  start_date: string;
  end_date: string;
  aim_objectives_link?: string | null;
  offer_letter_link?: string | null;
  iqac_verification: 'initiated' | 'inprogress' | 'completed';
}
```

### Activity Service (Mocked)
**Location**: [backend/src/services/activity.service.ts](backend/src/services/activity.service.ts)

```typescript
export class ActivityService {
  async getFacultyActivities(facultyId: number) { /* ... */ }
  async getPendingActivities(departmentId?: number) { /* ... */ }
  async getDepartmentActivities(departmentId?: number, academicYear?: string) { /* ... */ }
  async submitActivity(facultyId: number, data: {
    activityTypeId: number;
    title: string;
    description: string;
    activityDate: Date;
    proofDocumentPath?: string;
    additionalData?: Record<string, any>;
  }) { /* ... */ }
  async approveActivity(activityId: number, verifiedBy: number, pointsEarned: number) { /* ... */ }
  async rejectActivity(activityId: number, verifiedBy: number, rejectionReason: string) { /* ... */ }
}
```

### Activity Routes
**Location**: [backend/src/routes/activity.routes.ts](backend/src/routes/activity.routes.ts)

- `GET /my-activities` - Faculty retrieves their own activities
- `POST /submit` - Faculty submits new activity
- `GET /pending` - Verification team retrieves pending activities
- `POST /:activityId/approve` - Approve with points
- `POST /:activityId/reject` - Reject with reason
- `GET /stats` - Activity statistics

---

## 6. UI Component Patterns

### Form Layout Components

#### Grid-Based Layout
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div>{/* Field 1 */}</div>
  <div>{/* Field 2 */}</div>
</div>
```

#### Common Margin/Padding Pattern
```tsx
<form className="p-6 md:p-8 space-y-8">
  {/* space-y-8: 2rem vertical spacing between sections */}
</form>
```

### Input Field Component Pattern
```tsx
<div>
  <label htmlFor="fieldId" className="block text-sm font-medium text-slate-700 mb-1">
    Field Label <RequiredAst />
  </label>
  <input
    type="text"
    id="fieldId"
    name="fieldName"
    value={formData.fieldName}
    onChange={handleChange}
    className={`mt-1 block w-full px-3 py-2 border ${
      errors.fieldName ? "border-red-500" : "border-slate-300"
    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
    placeholder="Placeholder text"
  />
  {errors.fieldName && (
    <p className="mt-1 text-sm text-red-600">{errors.fieldName}</p>
  )}
</div>
```

### Select Field Component Pattern
```tsx
<select
  name="selectField"
  onChange={handleChange}
  className={`mt-1 block w-full px-3 py-2 border ${
    errors.selectField ? "border-red-500" : "border-slate-300"
  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white`}
>
  {OPTIONS.map((option) => (
    <option
      key={option}
      value={option}
      disabled={option === "Click to choose"}
    >
      {option}
    </option>
  ))}
</select>
```

### Radio Button Group Pattern
```tsx
<div>
  <label className="block text-sm font-medium text-slate-700 mb-1">
    Radio Group Label
  </label>
  <div className="mt-2 flex space-x-6">
    {(["Yes", "No"] as const).map((value) => (
      <label key={value} className="inline-flex items-center">
        <input
          type="radio"
          name="radioField"
          value={value}
          checked={formData.radioField === value}
          onChange={handleChange}
          className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
        />
        <span className="ml-2 text-sm text-slate-700">{value}</span>
      </label>
    ))}
  </div>
</div>
```

### Status Badge Component Pattern
```tsx
const StatusBadge = ({ status }: { status: Status }) => {
  const config = {
    Approved: {
      icon: CheckCircle2,
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    Pending: {
      icon: Clock,
      cls: "bg-amber-50 text-amber-700 border-amber-200",
    },
    Rejected: {
      icon: XCircle,
      cls: "bg-red-50 text-red-700 border-red-200",
    },
  }[status];
  
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${config.cls}`}>
      <Icon size={12} />
      {status}
    </span>
  );
};
```

### Color Scheme
- **Base**: Slate (slate-50, slate-300, slate-700, slate-900)
- **Primary**: Indigo (indigo-500, indigo-600, indigo-50)
- **Success**: Emerald (emerald-50, emerald-700)
- **Warning**: Amber (amber-50, amber-700)
- **Error**: Red (red-50, red-500, red-600, red-700)
- **Info**: Blue (blue-100, blue-600, blue-700)

### Common Tailwind Classes Used
```
Spacing: p-2, p-4, p-6, p-8, mb-1, mb-2, gap-1, gap-2, gap-3, gap-6, space-y-4, space-y-8
Layout: grid, grid-cols-1, md:grid-cols-2, flex, flex-col, gap-6
Text: text-sm, text-lg, text-xl, font-medium, font-semibold, font-bold
Border: border, border-2, rounded-md, rounded-lg, rounded-full, border-dashed
Effects: shadow-sm, hover:bg-slate-200, transition-colors, focus:ring-2, focus:ring-indigo-500
Display: block, inline-flex, flex-1, w-full, h-32, mx-auto
```

### DashboardShell Component
**Location**: [components/DashboardShell.tsx](components/DashboardShell.tsx)

Wrapper component that:
- Shows sidebar for authenticated users
- Hides sidebar for public pages (login, register)
- Responsive design (mobile drawer overlay + desktop sidebar)
- Handles sidebar collapse state
- Manages mobile menu toggle

---

## 7. Data Storage & Retrieval Summary

### Current State ⚠️
- **Database**: Configured but services are mocked (return empty/mock data)
- **File Upload**: Files stored in memory only, not persisted
- **API Implementation**: Incomplete - routes exist but logic returns mocked data

### Data Flow for Achievements
```
User Form Input → Local State (React) → Validation → Would submit to API
                                                     → Backend would store in DB
                                                     → DB would persist files to disk
```

### File Storage Structure
**Intended Location**: `backend/uploads/`
**Current**: Not implemented, would need:
- Multer middleware for handling file uploads
- File naming strategy (e.g., UUID-based)
- Storage location: `backend/uploads/achievements/{type}/{id}/`
- Database references: Store file path as string

### API Route Example Structure (From Activity Routes)
```typescript
// GET: Retrieve achievement records
router.get('/my-activities', authenticateToken, requireRole('faculty'), async (req, res) => {
  const activities = await activityService.getFacultyActivities(req.user.id);
  res.json({ activities });
});

// POST: Submit achievement
router.post('/submit', authenticateToken, requireRole('faculty'), async (req, res) => {
  const data = submitActivitySchema.parse(req.body);
  const activity = await activityService.submitActivity(req.user.id, data);
  res.status(201).json({ message: 'Activity submitted successfully', activity });
});

// POST: Approve achievement
router.post('/:activityId/approve', authenticateToken, requireRole('verification'), async (req, res) => {
  const { pointsEarned } = approveActivitySchema.parse(req.body);
  const result = await activityService.approveActivity(activityId, req.user.id, pointsEarned);
  res.json({ message: 'Activity approved', result });
});
```

### Event Master Service
**Location**: [backend/src/services/eventMaster.service.ts](backend/src/services/eventMaster.service.ts)

Manages event master data with fields:
- Event code and name
- Categories and levels
- Location and venue details
- Competition info (for competitions)
- Eligibility and rewards

### Import Services
**Location**: `backend/src/services/`

Handles bulk CSV imports:
- `eventsAttendedImport.service.ts`
- `industryImport.service.ts`

These create/update records from CSV files (used for data initialization/migration).

---

## Recommendations for Paper Presentation Implementation

### To Complete Paper Presentation Feature:

1. **Create Backend Service**
   - Similar to `activity.service.ts` pattern
   - Methods: create, get, update, delete, approve, reject
   - Validate conference data, dates, sponsorship types

2. **Create API Routes**
   - POST `/api/paper-presentation/submit` - Submit new paper
   - GET `/api/paper-presentation/my-papers` - Retrieve faculty papers
   - GET `/api/paper-presentation/pending` - For verification team
   - POST `/api/paper-presentation/:id/approve` - Approve paper
   - POST `/api/paper-presentation/:id/reject` - Reject paper

3. **Create Database Schema**
   ```sql
   CREATE TABLE paper_presentations (
     id INT AUTO_INCREMENT PRIMARY KEY,
     faculty_id INT NOT NULL,
     task_id VARCHAR(100) NOT NULL,
     paper_title VARCHAR(255) NOT NULL,
     conference_name VARCHAR(255) NOT NULL,
     event_mode ENUM('Online', 'Offline', 'Hybrid'),
     event_level ENUM('International', 'National'),
     event_organizer VARCHAR(100),
     event_location VARCHAR(255),
     event_start_date DATE NOT NULL,
     event_end_date DATE NOT NULL,
     event_duration_days INT,
     special_labs_involved BOOLEAN DEFAULT FALSE,
     special_lab VARCHAR(100),
     published_in_proceedings BOOLEAN DEFAULT FALSE,
     page_from INT,
     page_to INT,
     sponsorship_type ENUM('Self', 'BIT', 'Funding Agency', 'Others'),
     funding_agency_name VARCHAR(255),
     funding_amount DECIMAL(10,2),
     students_involved BOOLEAN DEFAULT FALSE,
     award_received BOOLEAN DEFAULT FALSE,
     document_proof_path VARCHAR(255),
     apex_proof_path VARCHAR(255),
     award_proof_path VARCHAR(255),
     status ENUM('draft', 'submitted', 'approved', 'rejected') DEFAULT 'draft',
     submitted_date TIMESTAMP,
     approved_date TIMESTAMP,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
     FOREIGN KEY (faculty_id) REFERENCES faculty(id)
   );
   
   CREATE TABLE paper_authors (
     id INT AUTO_INCREMENT PRIMARY KEY,
     paper_id INT NOT NULL,
     author_name VARCHAR(255) NOT NULL,
     author_type ENUM('BIT Faculty', 'External Faculty', 'Industrial Person', 'Student'),
     affiliation VARCHAR(255),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (paper_id) REFERENCES paper_presentations(id) ON DELETE CASCADE
   );
   ```

4. **Implement File Upload**
   - Use multer middleware in Express
   - Store files with unique identifiers
   - Return file paths to database

5. **Update Frontend Submit Form**
   - Connect form to actual API endpoint
   - Handle file upload with FormData
   - Show loading state during submission
   - Display success/error messages

6. **Update List Page**
   - Fetch actual data from API
   - Implement real-time filtering/search
   - Show actual submission data instead of mock data

---

**Next Steps**: Review this analysis and let me know which area you'd like to explore deeper or which component you need help implementing!
