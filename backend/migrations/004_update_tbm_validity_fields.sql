-- Migrate student_technical_body_memberships table to use separate valid_from and valid_till dates
-- This replaces the single validity field with two date fields for better control

ALTER TABLE student_technical_body_memberships 
ADD COLUMN valid_from DATE AFTER membership_society,
ADD COLUMN valid_till DATE AFTER valid_from;

-- Add index on the new date columns for better query performance
ALTER TABLE student_technical_body_memberships 
ADD INDEX idx_valid_from (valid_from),
ADD INDEX idx_valid_till (valid_till);

-- Note: The old 'validity' column can remain for backward compatibility or be dropped with:
-- ALTER TABLE student_technical_body_memberships DROP COLUMN validity;
