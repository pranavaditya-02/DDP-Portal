-- Migration: Create event_registration_logger table for approved student event applications

CREATE TABLE IF NOT EXISTS `event_registration_logger` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `registration_id` INT NOT NULL COMMENT 'FK to Activity_logger.id',
  `event_id` INT NOT NULL COMMENT 'FK to Activity_Master.id',
  `student_id` INT NULL COMMENT 'Student user id when available',
  `student_name` VARCHAR(255) NOT NULL,
  `student_email` VARCHAR(255) NULL,
  `student_department` VARCHAR(150) NULL,
  `approved_by` INT NOT NULL COMMENT 'Verifier user id',
  `approved_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_event_registration_logger_registration_id` (`registration_id`),
  KEY `idx_event_registration_logger_event_id` (`event_id`),
  KEY `idx_event_registration_logger_student_id` (`student_id`),
  KEY `idx_event_registration_logger_approved_by` (`approved_by`),
  KEY `idx_event_registration_logger_approved_at` (`approved_at`),
  CONSTRAINT `fk_event_registration_logger_registration`
    FOREIGN KEY (`registration_id`) REFERENCES `Activity_logger` (`id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_event_registration_logger_event`
    FOREIGN KEY (`event_id`) REFERENCES `Activity_Master` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Audit/log table for approved event registrations';
