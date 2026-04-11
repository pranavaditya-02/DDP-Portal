-- SQL Queries for Student Achievement Forms IQAC Verification Status
-- ENUM values: 'initiated', 'approved', 'rejected'

-- ==============================================================
-- 1. Paper Presentation (PPR)
-- ==============================================================
ALTER TABLE student_paper_presentations 
MODIFY COLUMN iqac_verification enum('initiated','approved','rejected') 
COLLATE utf8mb4_unicode_ci DEFAULT 'initiated';

-- ==============================================================
-- 2. Project Competition (PCR)
-- ==============================================================
ALTER TABLE student_project_competitions 
MODIFY COLUMN iqac_verification enum('initiated','approved','rejected') 
COLLATE utf8mb4_unicode_ci DEFAULT 'initiated';

-- ==============================================================
-- 3. Technical Body Membership (TBM)
-- ==============================================================
ALTER TABLE student_technical_body_memberships 
MODIFY COLUMN iqac_verification enum('initiated','approved','rejected') 
COLLATE utf8mb4_unicode_ci DEFAULT 'initiated';

-- ==============================================================
-- 4. Non-Technical (NT)
-- ==============================================================
ALTER TABLE student_non_technical 
MODIFY COLUMN iqac_verification enum('initiated','approved','rejected') 
COLLATE utf8mb4_unicode_ci DEFAULT 'initiated';

-- ==============================================================
-- Verify the changes (run these to confirm)
-- ==============================================================
-- SHOW COLUMNS FROM student_paper_presentations WHERE Field = 'iqac_verification';
-- SHOW COLUMNS FROM student_project_competitions WHERE Field = 'iqac_verification';
-- SHOW COLUMNS FROM student_technical_body_memberships WHERE Field = 'iqac_verification';
-- SHOW COLUMNS FROM student_non_technical WHERE Field = 'iqac_verification';
