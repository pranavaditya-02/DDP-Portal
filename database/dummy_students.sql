-- Dummy Students Table
-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS=0;

-- Drop table if exists to ensure clean slate
DROP TABLE IF EXISTS dummy_students;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS=1;

-- Create table with snake_case columns
CREATE TABLE dummy_students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id VARCHAR(50) NOT NULL UNIQUE,
  student_name VARCHAR(255) NOT NULL,
  student_email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert 10 dummy students
INSERT INTO dummy_students (student_id, student_name, student_email) VALUES
  ('DUMMY001', 'Aarav Patel', 'aarav.patel@college.edu'),
  ('DUMMY002', 'Zara Sharma', 'zara.sharma@college.edu'),
  ('DUMMY003', 'Rohan Kapoor', 'rohan.kapoor@college.edu'),
  ('DUMMY004', 'Priya Verma', 'priya.verma@college.edu'),
  ('DUMMY005', 'Arjun Singh', 'arjun.singh@college.edu'),
  ('DUMMY006', 'Neha Gupta', 'neha.gupta@college.edu'),
  ('DUMMY007', 'Vikram Reddy', 'vikram.reddy@college.edu'),
  ('DUMMY008', 'Ananya Nair', 'ananya.nair@college.edu'),
  ('DUMMY009', 'Siddharth Iyer', 'siddharth.iyer@college.edu'),
  ('DUMMY010', 'Maya Desai', 'maya.desai@college.edu');
