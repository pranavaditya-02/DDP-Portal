-- Migration: Create event_registrations table for student event registrations and verification workflow

CREATE TABLE IF NOT EXISTS `event_registrations` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `event_id` INT NOT NULL COMMENT 'FK to event_master.id',
  `student_id` INT NULL COMMENT 'User id from auth token when available',
  `student_name` VARCHAR(255) NOT NULL COMMENT 'Display name of student',
  `student_email` VARCHAR(255) NULL COMMENT 'Email from auth token when available',
  `student_department` VARCHAR(150) NULL COMMENT 'Department label if provided',
  `event_category` VARCHAR(100) NULL COMMENT 'Copied from registration form',
  `activity_event` TEXT NULL COMMENT 'Human-readable event details from form',
  `from_date` DATE NULL COMMENT 'Registration from date',
  `to_date` DATE NULL COMMENT 'Registration to date',
  `mode_of_participation` VARCHAR(50) NULL COMMENT 'Online/Offline',
  `iqac_verification` VARCHAR(100) NOT NULL DEFAULT 'Initiated' COMMENT 'Verification flow status label',
  `status` VARCHAR(30) NOT NULL DEFAULT 'pending' COMMENT 'pending/approved/rejected',
  `rejection_reason` TEXT NULL COMMENT 'Reason when rejected',
  `verified_by` INT NULL COMMENT 'Verifier user id',
  `verified_at` TIMESTAMP NULL COMMENT 'Verification timestamp',
  `created_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_event_registrations_event_id` (`event_id`),
  KEY `idx_event_registrations_status` (`status`),
  KEY `idx_event_registrations_student_id` (`student_id`),
  KEY `idx_event_registrations_created_date` (`created_date`),
  CONSTRAINT `fk_event_registrations_event_id`
    FOREIGN KEY (`event_id`) REFERENCES `event_master` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Student registrations and verification decisions for event master records';
