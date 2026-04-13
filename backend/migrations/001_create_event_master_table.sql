-- Migration: Create Activity_Master table for event intake and management
-- This table stores all event master records used for activity tracking

CREATE TABLE IF NOT EXISTS `Activity_Master` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `maximum_count` INT NOT NULL DEFAULT 0 COMMENT 'Maximum seats available for the event',
  `applied_count` INT NOT NULL DEFAULT 0 COMMENT 'Number of applications received',
  `apply_by_student` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Whether students can apply directly',
  `event_code` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Unique identifier for the event',
  `event_name` VARCHAR(255) NOT NULL COMMENT 'Name of the event',
  `event_organizer` VARCHAR(255) NULL COMMENT 'Organization or person organizing the event',
  `web_link` VARCHAR(500) NULL COMMENT 'URL reference for the event',
  `event_category` VARCHAR(100) NULL COMMENT 'Category: Webinar/Seminar, Workshop, Training program, etc.',
  `active_status` VARCHAR(50) NOT NULL DEFAULT 'Active' COMMENT 'Status: Active, Inactive, Closed, Completed',
  `start_date` DATE NULL COMMENT 'Event start date',
  `end_date` DATE NULL COMMENT 'Event end date',
  `duration_days` INT NULL COMMENT 'Duration in days (calculated from start and end dates)',
  `event_location` VARCHAR(255) NULL COMMENT 'Physical or virtual location of the event',
  `event_level` VARCHAR(50) NULL COMMENT 'Level: Department, Institution, State, National, International',
  `state` VARCHAR(100) NULL COMMENT 'State where event is organized',
  `country` VARCHAR(100) NULL COMMENT 'Country where event is organized',
  `within_bit` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Whether event is within the institute',
  `related_to_special_lab` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Whether related to special lab facilities',
  `department` VARCHAR(100) NULL COMMENT 'Department organizing the event',
  `competition_name` VARCHAR(255) NULL COMMENT 'Name of competition (if applicable)',
  `total_level_of_competition` VARCHAR(255) NULL COMMENT 'Details about competition level',
  `eligible_for_rewards` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Whether winners are eligible for rewards',
  `winner_rewards` VARCHAR(500) NULL COMMENT 'Details of rewards for winners',
  `img_link` VARCHAR(500) NULL COMMENT 'Optional image/cover link for the event',
  `created_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
  `updated_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record last update timestamp',
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_event_code` (`event_code`),
  INDEX `idx_event_name` (`event_name`),
  INDEX `idx_status` (`active_status`),
  INDEX `idx_start_date` (`start_date`),
  INDEX `idx_category` (`event_category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Master table for all events in the system';

-- Optional: Create event_drafts table for saving incomplete event submissions
CREATE TABLE IF NOT EXISTS `event_drafts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL COMMENT 'User who created the draft',
  `draft_data` JSON NOT NULL COMMENT 'Serialized form data',
  `event_code` VARCHAR(100) NULL COMMENT 'Event code if editing existing',
  `created_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_draft` (`user_id`),
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores draft event submissions';
