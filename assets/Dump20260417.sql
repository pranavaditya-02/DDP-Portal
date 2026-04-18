-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: gateway01.ap-northeast-1.prod.aws.tidbcloud.com    Database: ddp
-- ------------------------------------------------------
-- Server version	8.0.11-TiDB-v7.5.6-serverless

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Activity_Master`
--

DROP TABLE IF EXISTS `Activity_Master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Activity_Master` (
  `id` int NOT NULL AUTO_INCREMENT,
  `maximum_count` int NOT NULL DEFAULT '0' COMMENT 'Maximum seats available for the event',
  `applied_count` int NOT NULL DEFAULT '0' COMMENT 'Number of applications received',
  `apply_by_student` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Whether students can apply directly',
  `event_code` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Unique identifier for the event',
  `event_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Name of the event',
  `event_organizer` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Organization or person organizing the event',
  `web_link` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'URL reference for the event',
  `event_category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Category: Webinar/Seminar, Workshop, Training program, etc.',
  `active_status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active' COMMENT 'Status: Active, Inactive, Closed, Completed',
  `start_date` date DEFAULT NULL COMMENT 'Event start date',
  `end_date` date DEFAULT NULL COMMENT 'Event end date',
  `duration_days` int DEFAULT NULL COMMENT 'Duration in days (calculated from start and end dates)',
  `event_location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Physical or virtual location of the event',
  `event_level` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Level: Department, Institution, State, National, International',
  `state` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'State where event is organized',
  `country` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Country where event is organized',
  `within_bit` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Whether event is within the institute',
  `related_to_special_lab` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Whether related to special lab facilities',
  `department` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Department organizing the event',
  `competition_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Name of competition (if applicable)',
  `total_level_of_competition` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Details about competition level',
  `eligible_for_rewards` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Whether winners are eligible for rewards',
  `winner_rewards` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Details of rewards for winners',
  `img_link` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Optional image/cover link for the event',
  `created_date` timestamp DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
  `updated_date` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Record last update timestamp',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `uk_event_code` (`event_code`),
  KEY `idx_event_name` (`event_name`),
  KEY `idx_status` (`active_status`),
  KEY `idx_start_date` (`start_date`),
  KEY `idx_category` (`event_category`),
  UNIQUE KEY `event_code` (`event_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=183456 COMMENT='Master table for all events in the system';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Activity_logger`
--

DROP TABLE IF EXISTS `Activity_logger`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Activity_logger` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL,
  `student_id` int DEFAULT NULL,
  `student_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `student_department` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `applied_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `approved_at` timestamp NULL DEFAULT NULL,
  `approved_by` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `event_category` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activity_event` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `from_date` date DEFAULT NULL,
  `to_date` date DEFAULT NULL,
  `mode_of_participation` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `iqac_verification` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Initiated',
  `verified_by` int DEFAULT NULL,
  `verified_at` datetime DEFAULT NULL,
  `created_date` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_date` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `rejection_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `idx_activity_logger_event_id` (`event_id`),
  KEY `idx_activity_logger_student_id` (`student_id`),
  KEY `idx_activity_logger_status` (`status`),
  CONSTRAINT `fk_activity_logger_event` FOREIGN KEY (`event_id`) REFERENCES `Activity_Master` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=30001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `app_pages`
--

DROP TABLE IF EXISTS `app_pages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_pages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `page_key` varchar(120) NOT NULL COMMENT 'dashboard | activities | achievements.submit | department | roles | etc.',
  `page_name` varchar(150) NOT NULL,
  `route_path` varchar(255) NOT NULL COMMENT '/dashboard | /activities | /achievements/submit | etc.',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `page_key` (`page_key`),
  UNIQUE KEY `route_path` (`route_path`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=270001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `book_chapter_publications`
--

DROP TABLE IF EXISTS `book_chapter_publications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `book_chapter_publications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `year_of_study` enum('First','Second','Third','Fourth') NOT NULL,
  `special_lab_id` int NOT NULL,
  `chapter_title` varchar(500) NOT NULL,
  `authors_names` text NOT NULL,
  `author_or_coauthor_name` varchar(255) NOT NULL,
  `total_authors` tinyint unsigned NOT NULL,
  `student_author_count` tinyint unsigned NOT NULL,
  `faculty_author_count` tinyint unsigned NOT NULL,
  `student_author_names` json NOT NULL,
  `faculty_author_names` json NOT NULL,
  `date_of_publication` date NOT NULL,
  `volume_number` varchar(50) NOT NULL,
  `edition` varchar(100) NOT NULL,
  `isbn_number` varchar(30) NOT NULL,
  `book_title` varchar(500) NOT NULL,
  `publisher_name` varchar(255) NOT NULL,
  `doi_number` varchar(255) NOT NULL,
  `page_from` smallint unsigned NOT NULL,
  `page_to` smallint unsigned NOT NULL,
  `web_url` text NOT NULL,
  `student_author_position` varchar(50) NOT NULL,
  `labs_involved` varchar(255) NOT NULL,
  `chapter_indexed` enum('Yes','No') NOT NULL,
  `indexed_details` enum('Scopus','SCI/SCI(E)','WoS','Others') DEFAULT NULL,
  `indexed_other_details` varchar(255) DEFAULT NULL,
  `impact_factor` enum('Yes','No') NOT NULL,
  `impact_factor_value` varchar(50) DEFAULT NULL,
  `project_outcome` enum('Yes','No') NOT NULL,
  `sponsorship_type` enum('Self','Institution','Government','Industry') NOT NULL,
  `sdg_goals` tinyint unsigned NOT NULL,
  `interdisciplinary` tinyint(1) NOT NULL DEFAULT '0',
  `interdisciplinary_dept_id` int DEFAULT NULL,
  `other_dept_student_count` tinyint unsigned DEFAULT NULL,
  `abstract_proof_url` varchar(500) DEFAULT NULL,
  `full_document_proof_url` varchar(500) DEFAULT NULL,
  `original_cert_proof_url` varchar(500) DEFAULT NULL,
  `attested_cert_proof_url` varchar(500) DEFAULT NULL,
  `iqac_status` enum('Initiated','Verified','Rejected') NOT NULL DEFAULT 'Initiated',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_1` (`student_id`),
  KEY `fk_2` (`special_lab_id`),
  KEY `fk_3` (`interdisciplinary_dept_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`student_id`) REFERENCES `dummy_students` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`special_lab_id`) REFERENCES `special_labs` (`id`),
  CONSTRAINT `fk_3` FOREIGN KEY (`interdisciplinary_dept_id`) REFERENCES `departments` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `centre_of_excellence`
--

DROP TABLE IF EXISTS `centre_of_excellence`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `centre_of_excellence` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `sig_number` varchar(50) DEFAULT NULL,
  `coe_name` varchar(300) DEFAULT NULL,
  `claiming_department_id` int DEFAULT NULL,
  `faculty_incharge_id` varchar(50) DEFAULT NULL,
  `coe_type_id` int DEFAULT NULL,
  `collaborative_industry_name` varchar(300) DEFAULT NULL,
  `date_of_establishment` date DEFAULT NULL,
  `area_sq_m` decimal(10,2) DEFAULT NULL,
  `domain_of_centre` varchar(300) DEFAULT NULL,
  `is_mou_related` tinyint(1) DEFAULT NULL,
  `mou_id` int DEFAULT NULL,
  `is_irp_related` tinyint(1) DEFAULT NULL,
  `irp_visit_id` int DEFAULT NULL,
  `stock_register_maintained` tinyint(1) DEFAULT NULL,
  `total_amount_inrs` decimal(14,2) DEFAULT NULL,
  `bit_contribution_inrs` decimal(14,2) DEFAULT NULL,
  `industry_contribution_with_gst` decimal(14,2) DEFAULT NULL,
  `industry_contribution_no_gst` decimal(14,2) DEFAULT NULL,
  `students_per_batch` int DEFAULT NULL,
  `academic_course` varchar(300) DEFAULT NULL,
  `syllabus_id` int DEFAULT NULL COMMENT 'Upload Syllabus',
  `lab_photo_id` int DEFAULT NULL COMMENT 'Upload Lab Photo',
  `communication_proof_id` int DEFAULT NULL COMMENT 'Upload Communication Proof',
  `apex_document_id` int DEFAULT NULL COMMENT 'Upload Apex Document',
  `facilities_report_id` int DEFAULT NULL COMMENT 'Report of Facilities Available (Word Document)',
  `utilization_report_id` int DEFAULT NULL COMMENT 'Lab Utilization Report',
  `iqac_verification` varchar(50) DEFAULT 'initiated' COMMENT 'initiated | approved | rejected',
  `iqac_remarks` text DEFAULT NULL COMMENT 'Remarks/reason for rejection from IQAC',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `submission_id` (`submission_id`),
  KEY `fk_2` (`claiming_department_id`),
  KEY `fk_3` (`faculty_incharge_id`),
  KEY `fk_4` (`coe_type_id`),
  KEY `fk_5` (`mou_id`),
  KEY `fk_6` (`irp_visit_id`),
  KEY `fk_7` (`syllabus_id`),
  KEY `fk_8` (`lab_photo_id`),
  KEY `fk_9` (`communication_proof_id`),
  KEY `fk_10` (`apex_document_id`),
  KEY `fk_11` (`facilities_report_id`),
  KEY `fk_12` (`utilization_report_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`claiming_department_id`) REFERENCES `departments` (`id`),
  CONSTRAINT `fk_3` FOREIGN KEY (`faculty_incharge_id`) REFERENCES `faculty` (`id`),
  CONSTRAINT `fk_4` FOREIGN KEY (`coe_type_id`) REFERENCES `ref_coe_type` (`id`),
  CONSTRAINT `fk_5` FOREIGN KEY (`mou_id`) REFERENCES `mou` (`id`),
  CONSTRAINT `fk_6` FOREIGN KEY (`irp_visit_id`) REFERENCES `irp_visit` (`id`),
  CONSTRAINT `fk_7` FOREIGN KEY (`syllabus_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_8` FOREIGN KEY (`lab_photo_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_9` FOREIGN KEY (`communication_proof_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_10` FOREIGN KEY (`apex_document_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_11` FOREIGN KEY (`facilities_report_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_12` FOREIGN KEY (`utilization_report_id`) REFERENCES `documents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `clubs`
--

DROP TABLE IF EXISTS `clubs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clubs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `club_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `competition_reports`
--

DROP TABLE IF EXISTS `competition_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `competition_reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `sdg_id` int DEFAULT NULL,
  `title_of_event` varchar(255) NOT NULL,
  `level_of_event` varchar(50) NOT NULL,
  `individual_or_batch` enum('Individual','Batch') NOT NULL DEFAULT 'Individual',
  `number_of_participants` int DEFAULT NULL,
  `academic_project` enum('Yes','No') NOT NULL DEFAULT 'Yes',
  `specify_project` varchar(100) DEFAULT NULL,
  `from_date` date NOT NULL,
  `to_date` date NOT NULL,
  `type_of_sponsorship` enum('Self','Management') NOT NULL,
  `sponsorship_amount` decimal(10,2) DEFAULT NULL,
  `image_proof_url` varchar(500) DEFAULT NULL,
  `abstract_proof_url` varchar(500) DEFAULT NULL,
  `original_cert_proof_url` varchar(500) DEFAULT NULL,
  `attested_cert_proof_url` varchar(500) DEFAULT NULL,
  `status` enum('Winner','Participant') NOT NULL,
  `iqac_verification` enum('Initiated','Under Review','Verified') NOT NULL DEFAULT 'Initiated',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `place` enum('I','II','III') DEFAULT NULL,
  `prize_type` enum('Cash','Memento') DEFAULT NULL,
  `prize_amount` decimal(10,2) DEFAULT NULL,
  `prize_proof_url` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_1` (`student_id`),
  KEY `fk_2` (`sdg_id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`sdg_id`) REFERENCES `sdg` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=60001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `consultancy`
--

DROP TABLE IF EXISTS `consultancy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consultancy` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `special_labs_involved` tinyint(1) DEFAULT '0',
  `special_lab_id` int DEFAULT NULL,
  `claiming_department_id` int DEFAULT NULL,
  `consultant_type_id` int DEFAULT NULL,
  `sector_id` int DEFAULT NULL,
  `org_name` varchar(300) DEFAULT NULL,
  `org_address` text DEFAULT NULL,
  `core_sector_id` int DEFAULT NULL,
  `project_title` varchar(300) DEFAULT NULL,
  `project_category_id` int DEFAULT NULL,
  `scope_of_work_id` int DEFAULT NULL,
  `duration_unit_id` int DEFAULT NULL,
  `from_date` date DEFAULT NULL,
  `to_date` date DEFAULT NULL,
  `is_mou_related` tinyint(1) DEFAULT NULL,
  `mou_id` int DEFAULT NULL,
  `is_irp_related` tinyint(1) DEFAULT NULL,
  `irp_visit_id` int DEFAULT NULL,
  `is_fesem_related` tinyint(1) DEFAULT NULL,
  `is_roi_related` tinyint(1) DEFAULT NULL,
  `date_of_payment_1` date DEFAULT NULL,
  `consultancy_amount_1_inrs` decimal(14,2) DEFAULT NULL,
  `is_gst_included_1` tinyint(1) DEFAULT NULL,
  `amount_after_gst_1` decimal(14,2) DEFAULT NULL,
  `ownership_rights_desc` text DEFAULT NULL,
  `consultant_agreement_desc` text DEFAULT NULL,
  `date_of_payment_2` date DEFAULT NULL,
  `college_resources_utilized` tinyint(1) DEFAULT NULL,
  `faculty_share_pct_resources` decimal(5,2) DEFAULT NULL,
  `institute_share_pct_resources` decimal(5,2) DEFAULT NULL,
  `resources_list` text DEFAULT NULL,
  `college_transport_utilized` tinyint(1) DEFAULT NULL,
  `transport_area_visited` varchar(300) DEFAULT NULL,
  `distance_km` decimal(10,2) DEFAULT NULL,
  `petrol_cost_per_km` decimal(8,2) DEFAULT NULL,
  `transport_cost` decimal(12,2) DEFAULT NULL,
  `consumables_utilized` tinyint(1) DEFAULT NULL,
  `consumables_list` text DEFAULT NULL,
  `consumables_charge` decimal(12,2) DEFAULT NULL,
  `faculty_share_pct_no_resources` decimal(5,2) DEFAULT NULL,
  `institute_share_pct_no_resources` decimal(5,2) DEFAULT NULL,
  `faculty_share_before_deduction` decimal(14,2) DEFAULT NULL,
  `institute_share_before_addition` decimal(14,2) DEFAULT NULL,
  `net_faculty_share_amount` decimal(14,2) DEFAULT NULL,
  `net_institute_share_amount` decimal(14,2) DEFAULT NULL,
  `num_faculty_members` int DEFAULT NULL,
  `consolidated_doc_id` int DEFAULT NULL COMMENT 'Upload Consolidated Document',
  `rent_agreement_id` int DEFAULT NULL COMMENT 'Rent Agreement',
  `consultancy_agreement_id` int DEFAULT NULL COMMENT 'Upload Consultancy Agreement',
  `communication_proof_id` int DEFAULT NULL COMMENT 'Upload Communication Proof',
  `audit_doc_id` int DEFAULT NULL COMMENT 'Upload Audit Documents Proof (Annexures 1/2)',
  `work_logs_id` int DEFAULT NULL COMMENT 'Upload Work Logs Proof',
  `invoice_receipt_id` int DEFAULT NULL COMMENT 'Upload Invoice Receipt',
  `transaction_proof_id` int DEFAULT NULL COMMENT 'Upload Transaction Proof',
  `geotag_photos_id` int DEFAULT NULL COMMENT 'Upload Geotag Photos',
  `consultancy_report_id` int DEFAULT NULL COMMENT 'Upload Consultancy Report Proof',
  `all_consolidated_doc_id` int DEFAULT NULL COMMENT 'Consolidated: Comm+Audit+WorkLogs+Invoice+Transaction+Geotag+Report',
  `visiting_card_id` int DEFAULT NULL COMMENT 'Upload Visiting Card of the Organisation',
  `partnership_deed_id` int DEFAULT NULL COMMENT 'Upload Partnership Deed Documents Proof',
  `noc_premises_id` int DEFAULT NULL COMMENT 'Upload NOC of the Business Premises Proof',
  `nda_proof_id` int DEFAULT NULL COMMENT 'Upload Non-Disclosure Agreement (Mutual) Proof',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `submission_id` (`submission_id`),
  KEY `fk_2` (`special_lab_id`),
  KEY `fk_3` (`claiming_department_id`),
  KEY `fk_4` (`consultant_type_id`),
  KEY `fk_5` (`sector_id`),
  KEY `fk_6` (`core_sector_id`),
  KEY `fk_7` (`project_category_id`),
  KEY `fk_8` (`scope_of_work_id`),
  KEY `fk_9` (`duration_unit_id`),
  KEY `fk_10` (`mou_id`),
  KEY `fk_11` (`irp_visit_id`),
  KEY `fk_12` (`consolidated_doc_id`),
  KEY `fk_13` (`rent_agreement_id`),
  KEY `fk_14` (`consultancy_agreement_id`),
  KEY `fk_15` (`communication_proof_id`),
  KEY `fk_16` (`audit_doc_id`),
  KEY `fk_17` (`work_logs_id`),
  KEY `fk_18` (`invoice_receipt_id`),
  KEY `fk_19` (`transaction_proof_id`),
  KEY `fk_20` (`geotag_photos_id`),
  KEY `fk_21` (`consultancy_report_id`),
  KEY `fk_22` (`all_consolidated_doc_id`),
  KEY `fk_23` (`visiting_card_id`),
  KEY `fk_24` (`partnership_deed_id`),
  KEY `fk_25` (`noc_premises_id`),
  KEY `fk_26` (`nda_proof_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`),
  CONSTRAINT `fk_3` FOREIGN KEY (`claiming_department_id`) REFERENCES `departments` (`id`),
  CONSTRAINT `fk_4` FOREIGN KEY (`consultant_type_id`) REFERENCES `ref_consultancy_type` (`id`),
  CONSTRAINT `fk_5` FOREIGN KEY (`sector_id`) REFERENCES `ref_sector_type` (`id`),
  CONSTRAINT `fk_6` FOREIGN KEY (`core_sector_id`) REFERENCES `ref_core_sector` (`id`),
  CONSTRAINT `fk_7` FOREIGN KEY (`project_category_id`) REFERENCES `ref_consultancy_category` (`id`),
  CONSTRAINT `fk_8` FOREIGN KEY (`scope_of_work_id`) REFERENCES `ref_scope_of_work` (`id`),
  CONSTRAINT `fk_9` FOREIGN KEY (`duration_unit_id`) REFERENCES `ref_duration_unit` (`id`),
  CONSTRAINT `fk_10` FOREIGN KEY (`mou_id`) REFERENCES `mou` (`id`),
  CONSTRAINT `fk_11` FOREIGN KEY (`irp_visit_id`) REFERENCES `irp_visit` (`id`),
  CONSTRAINT `fk_12` FOREIGN KEY (`consolidated_doc_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_13` FOREIGN KEY (`rent_agreement_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_14` FOREIGN KEY (`consultancy_agreement_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_15` FOREIGN KEY (`communication_proof_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_16` FOREIGN KEY (`audit_doc_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_17` FOREIGN KEY (`work_logs_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_18` FOREIGN KEY (`invoice_receipt_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_19` FOREIGN KEY (`transaction_proof_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_20` FOREIGN KEY (`geotag_photos_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_21` FOREIGN KEY (`consultancy_report_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_22` FOREIGN KEY (`all_consolidated_doc_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_23` FOREIGN KEY (`visiting_card_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_24` FOREIGN KEY (`partnership_deed_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_25` FOREIGN KEY (`noc_premises_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_26` FOREIGN KEY (`nda_proof_id`) REFERENCES `documents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `consultancy_faculty`
--

DROP TABLE IF EXISTS `consultancy_faculty`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `consultancy_faculty` (
  `id` int NOT NULL AUTO_INCREMENT,
  `consultancy_id` int NOT NULL,
  `faculty_id` varchar(50) NOT NULL,
  `sig_number` varchar(50) DEFAULT NULL,
  `order_no` smallint NOT NULL COMMENT '2 to 5',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `consultancy_faculty_index_4` (`consultancy_id`,`faculty_id`),
  KEY `fk_2` (`faculty_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`consultancy_id`) REFERENCES `consultancy` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dept_code` varchar(20) NOT NULL,
  `dept_name` varchar(120) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'true=active, false=inactive',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `dept_code` (`dept_code`),
  UNIQUE KEY `dept_name` (`dept_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `designation`
--

DROP TABLE IF EXISTS `designation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `designation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `designation_name` varchar(100) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30002;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `documents`
--

DROP TABLE IF EXISTS `documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `doc_type_id` int NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `uploaded_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_1` (`doc_type_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`doc_type_id`) REFERENCES `ref_doc_type` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `dummy_students`
--

DROP TABLE IF EXISTS `dummy_students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dummy_students` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `student_id` (`student_id`),
  UNIQUE KEY `student_email` (`student_email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=30001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `e_content_developed`
--

DROP TABLE IF EXISTS `e_content_developed`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `e_content_developed` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `special_labs_involved` tinyint(1) DEFAULT '0' COMMENT 'Yes | No',
  `special_lab_id` int DEFAULT NULL COMMENT 'Required if special_labs_involved = true',
  `e_content_type_id` int DEFAULT NULL,
  `if_others_specify` varchar(200) DEFAULT NULL,
  `topic_name` varchar(300) DEFAULT NULL,
  `publisher_name` varchar(200) DEFAULT NULL,
  `publisher_address` text DEFAULT NULL,
  `contact_no` varchar(20) DEFAULT NULL,
  `url_of_content` varchar(500) DEFAULT NULL,
  `date_of_publication` date DEFAULT NULL,
  `document_proof_id` int DEFAULT NULL COMMENT 'Document Proof',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `submission_id` (`submission_id`),
  KEY `fk_2` (`special_lab_id`),
  KEY `fk_3` (`e_content_type_id`),
  KEY `fk_4` (`document_proof_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`),
  CONSTRAINT `fk_3` FOREIGN KEY (`e_content_type_id`) REFERENCES `ref_e_content_type` (`id`),
  CONSTRAINT `fk_4` FOREIGN KEY (`document_proof_id`) REFERENCES `documents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `event_organized_faculty`
--

DROP TABLE IF EXISTS `event_organized_faculty`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_organized_faculty` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_organized_id` int NOT NULL,
  `faculty_id` varchar(50) NOT NULL,
  `role` varchar(60) DEFAULT NULL COMMENT 'Convener | Co-Convener | Co-ordinator | Organizing Secretary',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_1` (`event_organized_id`),
  KEY `fk_2` (`faculty_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`event_organized_id`) REFERENCES `events_organized` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `event_organized_guest`
--

DROP TABLE IF EXISTS `event_organized_guest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_organized_guest` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_organized_id` int NOT NULL,
  `guest_number` smallint NOT NULL COMMENT '1 to 5',
  `institution_type` varchar(60) DEFAULT NULL COMMENT 'International | National (Within TamilNadu) | National (Outside TamilNadu)',
  `guest_name` varchar(200) DEFAULT NULL,
  `designation` varchar(200) DEFAULT NULL,
  `email` varchar(200) DEFAULT NULL,
  `contact_no` varchar(20) DEFAULT NULL,
  `organization_detail` text DEFAULT NULL,
  `is_alumni` tinyint(1) DEFAULT NULL,
  `guest_type` varchar(20) DEFAULT NULL COMMENT 'Academic | Industry',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_1` (`event_organized_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`event_organized_id`) REFERENCES `events_organized` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `event_organized_student`
--

DROP TABLE IF EXISTS `event_organized_student`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_organized_student` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_organized_id` int NOT NULL,
  `student_name` varchar(200) DEFAULT NULL,
  `student_ref_id` int DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_1` (`event_organized_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`event_organized_id`) REFERENCES `events_organized` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `events_attended`
--

DROP TABLE IF EXISTS `events_attended`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events_attended` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `special_labs_involved` tinyint(1) DEFAULT '0' COMMENT 'Yes | No',
  `special_lab_id` int DEFAULT NULL COMMENT 'Required if special_labs_involved = true',
  `event_type_id` int DEFAULT NULL,
  `if_event_type_others` varchar(200) DEFAULT NULL,
  `ps_domain` text DEFAULT NULL,
  `ps_domain_level` text DEFAULT NULL,
  `topic_name` varchar(300) DEFAULT NULL,
  `organizer_type_id` int DEFAULT NULL,
  `industry_id` int DEFAULT NULL,
  `industry_address` text DEFAULT NULL,
  `institute_name` varchar(300) DEFAULT NULL,
  `event_level_id` int DEFAULT NULL,
  `event_title` varchar(300) DEFAULT NULL,
  `organization_sector` varchar(20) DEFAULT NULL COMMENT 'Private | Government',
  `event_organizer` varchar(300) DEFAULT NULL,
  `event_mode_id` int DEFAULT NULL,
  `event_location` varchar(300) DEFAULT NULL,
  `event_duration_unit` varchar(10) DEFAULT NULL COMMENT 'Months | Weeks | Hours | Days',
  `event_date_from` date DEFAULT NULL,
  `event_date_to` date DEFAULT NULL,
  `duration_days` int DEFAULT NULL,
  `other_organizer_name` varchar(300) DEFAULT NULL,
  `sponsorship_type_id` int DEFAULT NULL,
  `funding_agency_name` varchar(300) DEFAULT NULL,
  `amount_inrs` decimal(12,2) DEFAULT NULL,
  `outcome` varchar(100) DEFAULT NULL COMMENT 'Programs organized | Development of working Models and prototypes | Funded projects received | Others',
  `if_outcome_others` varchar(300) DEFAULT NULL,
  `apex_proof_id` int DEFAULT NULL COMMENT 'Apex Proof',
  `certificate_proof_id` int DEFAULT NULL COMMENT 'Certificate Proof',
  `geotag_photos_id` int DEFAULT NULL COMMENT 'Upload Geotag Photos',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `submission_id` (`submission_id`),
  KEY `fk_2` (`special_lab_id`),
  KEY `fk_3` (`event_type_id`),
  KEY `fk_4` (`organizer_type_id`),
  KEY `fk_5` (`event_level_id`),
  KEY `fk_6` (`event_mode_id`),
  KEY `fk_7` (`sponsorship_type_id`),
  KEY `fk_8` (`apex_proof_id`),
  KEY `fk_9` (`certificate_proof_id`),
  KEY `fk_10` (`geotag_photos_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`),
  CONSTRAINT `fk_3` FOREIGN KEY (`event_type_id`) REFERENCES `ref_event_type_attended` (`id`),
  CONSTRAINT `fk_4` FOREIGN KEY (`organizer_type_id`) REFERENCES `ref_organizer_type` (`id`),
  CONSTRAINT `fk_5` FOREIGN KEY (`event_level_id`) REFERENCES `ref_event_level` (`id`),
  CONSTRAINT `fk_6` FOREIGN KEY (`event_mode_id`) REFERENCES `ref_event_mode` (`id`),
  CONSTRAINT `fk_7` FOREIGN KEY (`sponsorship_type_id`) REFERENCES `ref_sponsorship_type` (`id`),
  CONSTRAINT `fk_8` FOREIGN KEY (`apex_proof_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_9` FOREIGN KEY (`certificate_proof_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_10` FOREIGN KEY (`geotag_photos_id`) REFERENCES `documents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `events_organized`
--

DROP TABLE IF EXISTS `events_organized`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events_organized` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `special_labs_involved` tinyint(1) DEFAULT '0' COMMENT 'Yes | No',
  `special_lab_id` int DEFAULT NULL COMMENT 'Required if special_labs_involved = true',
  `role` varchar(60) DEFAULT NULL COMMENT 'Convener | Co-Convener | Co-ordinator | Organizing Secretary',
  `department_id` int DEFAULT NULL,
  `is_iic_event` tinyint(1) DEFAULT NULL,
  `is_iic_uploaded` tinyint(1) DEFAULT NULL,
  `iic_bip_id` varchar(100) DEFAULT NULL,
  `is_dept_association` tinyint(1) DEFAULT NULL,
  `is_rnd_organized` tinyint(1) DEFAULT NULL,
  `is_technical_society` tinyint(1) DEFAULT NULL,
  `technical_society_id` int DEFAULT NULL,
  `is_mou_outcome` tinyint(1) DEFAULT NULL,
  `mou_bip_id` varchar(100) DEFAULT NULL,
  `is_irp_outcome` tinyint(1) DEFAULT NULL,
  `irp_bip_id` varchar(100) DEFAULT NULL,
  `is_centre_of_excellence` tinyint(1) DEFAULT NULL,
  `coe_bip_id` varchar(100) DEFAULT NULL,
  `is_industry_supported_lab` tinyint(1) DEFAULT NULL,
  `isl_bip_id` varchar(100) DEFAULT NULL,
  `event_name` varchar(300) DEFAULT NULL,
  `type_of_program` varchar(20) DEFAULT NULL COMMENT 'Academic | Non Academic',
  `club_society_name` varchar(200) DEFAULT NULL,
  `event_type_id` int DEFAULT NULL,
  `if_event_type_others` varchar(200) DEFAULT NULL,
  `topics_covered` text DEFAULT NULL,
  `has_conference_proceedings` tinyint(1) DEFAULT NULL,
  `publisher_detail` text DEFAULT NULL,
  `publisher_year` int DEFAULT NULL,
  `volume_number` int DEFAULT NULL,
  `issue_number` int DEFAULT NULL,
  `page_number` varchar(40) DEFAULT NULL,
  `isbn_number` varchar(30) DEFAULT NULL,
  `indexing_detail` varchar(200) DEFAULT NULL,
  `event_category` varchar(100) DEFAULT NULL,
  `event_organizer` varchar(300) DEFAULT NULL,
  `event_description` text DEFAULT NULL,
  `event_mode_id` int DEFAULT NULL,
  `event_location` varchar(300) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `event_duration_days` int DEFAULT NULL,
  `event_level_id` int DEFAULT NULL,
  `jointly_organized_with` varchar(60) DEFAULT NULL,
  `joint_org_name` varchar(300) DEFAULT NULL,
  `joint_org_address` text DEFAULT NULL,
  `internal_students_count` int DEFAULT NULL,
  `internal_faculty_count` int DEFAULT NULL,
  `external_students_count` int DEFAULT NULL,
  `external_faculty_count` int DEFAULT NULL,
  `amount_from_management` tinyint(1) DEFAULT NULL,
  `amount_received_inrs` decimal(12,2) DEFAULT NULL,
  `has_funding_agency` tinyint(1) DEFAULT NULL,
  `funding_agency_name` varchar(300) DEFAULT NULL,
  `registration_amount_inrs` decimal(12,2) DEFAULT NULL,
  `total_sponsored_amount` decimal(12,2) DEFAULT NULL,
  `total_revenue` decimal(12,2) DEFAULT NULL,
  `syllabus_id` int DEFAULT NULL COMMENT 'Upload the Syllabus',
  `course_feedback_id` int DEFAULT NULL COMMENT 'Upload the Course Feedback',
  `proceedings_proof_id` int DEFAULT NULL COMMENT 'Submit the Proceedings proof',
  `apex_proof_id` int DEFAULT NULL COMMENT 'Apex Proof',
  `relevant_proof_id` int DEFAULT NULL COMMENT 'Approval letter, Brochure, Attendance sheet, Photos, Feedback',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `submission_id` (`submission_id`),
  KEY `fk_2` (`special_lab_id`),
  KEY `fk_3` (`department_id`),
  KEY `fk_4` (`technical_society_id`),
  KEY `fk_5` (`event_type_id`),
  KEY `fk_6` (`event_mode_id`),
  KEY `fk_7` (`event_level_id`),
  KEY `fk_8` (`syllabus_id`),
  KEY `fk_9` (`course_feedback_id`),
  KEY `fk_10` (`proceedings_proof_id`),
  KEY `fk_11` (`apex_proof_id`),
  KEY `fk_12` (`relevant_proof_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`),
  CONSTRAINT `fk_3` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`),
  CONSTRAINT `fk_4` FOREIGN KEY (`technical_society_id`) REFERENCES `ref_technical_society` (`id`),
  CONSTRAINT `fk_5` FOREIGN KEY (`event_type_id`) REFERENCES `ref_event_type_organized` (`id`),
  CONSTRAINT `fk_6` FOREIGN KEY (`event_mode_id`) REFERENCES `ref_event_mode` (`id`),
  CONSTRAINT `fk_7` FOREIGN KEY (`event_level_id`) REFERENCES `ref_event_level` (`id`),
  CONSTRAINT `fk_8` FOREIGN KEY (`syllabus_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_9` FOREIGN KEY (`course_feedback_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_10` FOREIGN KEY (`proceedings_proof_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_11` FOREIGN KEY (`apex_proof_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_12` FOREIGN KEY (`relevant_proof_id`) REFERENCES `documents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `external_examiner`
--

DROP TABLE IF EXISTS `external_examiner`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `external_examiner` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `special_labs_involved` tinyint(1) DEFAULT '0' COMMENT 'Yes | No',
  `special_lab_id` int DEFAULT NULL COMMENT 'Required if special_labs_involved = true',
  `college_name` varchar(300) DEFAULT NULL,
  `institute_address` text DEFAULT NULL,
  `purpose_id` int DEFAULT NULL,
  `examination_name` varchar(300) DEFAULT NULL,
  `department_of_qp_id` int DEFAULT NULL,
  `subject_of_qp` varchar(300) DEFAULT NULL,
  `num_days` int DEFAULT NULL,
  `from_date` date DEFAULT NULL,
  `to_date` date DEFAULT NULL,
  `document_proof_id` int DEFAULT NULL COMMENT 'Document Proof',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `submission_id` (`submission_id`),
  KEY `fk_2` (`special_lab_id`),
  KEY `fk_3` (`purpose_id`),
  KEY `fk_4` (`department_of_qp_id`),
  KEY `fk_5` (`document_proof_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`),
  CONSTRAINT `fk_3` FOREIGN KEY (`purpose_id`) REFERENCES `ref_external_examiner_purpose` (`id`),
  CONSTRAINT `fk_4` FOREIGN KEY (`department_of_qp_id`) REFERENCES `departments` (`id`),
  CONSTRAINT `fk_5` FOREIGN KEY (`document_proof_id`) REFERENCES `documents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `external_vip_visit`
--

DROP TABLE IF EXISTS `external_vip_visit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `external_vip_visit` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `special_labs_involved` tinyint(1) DEFAULT '0',
  `special_lab_id` int DEFAULT NULL,
  `guest_from_industry` tinyint(1) DEFAULT NULL,
  `event_name` varchar(300) DEFAULT NULL,
  `event_type_id` int DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `if_event_type_others` varchar(200) DEFAULT NULL,
  `guest_name` varchar(200) DEFAULT NULL,
  `guest_designation` varchar(200) DEFAULT NULL,
  `org_name` varchar(300) DEFAULT NULL,
  `org_address` text DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `purpose_of_visit` text DEFAULT NULL,
  `mobile_number` varchar(20) DEFAULT NULL,
  `guest_email` varchar(200) DEFAULT NULL,
  `department_visited_id` int DEFAULT NULL,
  `topic_presented` varchar(300) DEFAULT NULL,
  `is_bit_alumni` tinyint(1) DEFAULT NULL,
  `guided_faculty_id` varchar(50) DEFAULT NULL,
  `formal_photo_id` int DEFAULT NULL COMMENT 'Formal Photo of Guest (good clarity)',
  `photo_proof_id` int DEFAULT NULL COMMENT 'Photo Proof',
  `approval_letter_id` int DEFAULT NULL COMMENT 'Approval Letter',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `submission_id` (`submission_id`),
  KEY `fk_2` (`special_lab_id`),
  KEY `fk_3` (`event_type_id`),
  KEY `fk_4` (`category_id`),
  KEY `fk_5` (`department_visited_id`),
  KEY `fk_6` (`guided_faculty_id`),
  KEY `fk_7` (`formal_photo_id`),
  KEY `fk_8` (`photo_proof_id`),
  KEY `fk_9` (`approval_letter_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`),
  CONSTRAINT `fk_3` FOREIGN KEY (`event_type_id`) REFERENCES `ref_vip_event_type` (`id`),
  CONSTRAINT `fk_4` FOREIGN KEY (`category_id`) REFERENCES `ref_vip_category` (`id`),
  CONSTRAINT `fk_5` FOREIGN KEY (`department_visited_id`) REFERENCES `departments` (`id`),
  CONSTRAINT `fk_6` FOREIGN KEY (`guided_faculty_id`) REFERENCES `faculty` (`id`),
  CONSTRAINT `fk_7` FOREIGN KEY (`formal_photo_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_8` FOREIGN KEY (`photo_proof_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_9` FOREIGN KEY (`approval_letter_id`) REFERENCES `documents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `faculty`
--

DROP TABLE IF EXISTS `faculty`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faculty` (
  `id` varchar(50) NOT NULL,
  `salutation` varchar(10) NOT NULL COMMENT 'Mr | Mrs | Ms | Dr',
  `name` varchar(200) NOT NULL,
  `designation_id` varchar(60) NOT NULL COMMENT 'Assistant Professor Level I | Assistant Professor Level II | Assistant Professor Level III | Associate Professor | Professor',
  `department_id` int DEFAULT NULL,
  `email` varchar(200) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_1` (`department_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `faculty_activity_e_content_developed`
--

DROP TABLE IF EXISTS `faculty_activity_e_content_developed`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faculty_activity_e_content_developed` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `special_labs_involved` tinyint(1) DEFAULT '0' COMMENT 'Yes | No',
  `special_lab_id` int DEFAULT NULL COMMENT 'Required if special_labs_involved = true',
  `e_content_type_id` int DEFAULT NULL,
  `if_others_specify` varchar(200) DEFAULT NULL,
  `topic_name` varchar(300) DEFAULT NULL,
  `publisher_name` varchar(200) DEFAULT NULL,
  `publisher_address` text DEFAULT NULL,
  `contact_no` varchar(20) DEFAULT NULL,
  `url_of_content` varchar(500) DEFAULT NULL,
  `date_of_publication` date DEFAULT NULL,
  `document_proof_id` int DEFAULT NULL COMMENT 'Document Proof',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `submission_id` (`submission_id`),
  KEY `fk_2` (`special_lab_id`),
  KEY `fk_3` (`e_content_type_id`),
  KEY `fk_4` (`document_proof_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`),
  CONSTRAINT `fk_3` FOREIGN KEY (`e_content_type_id`) REFERENCES `ref_e_content_type` (`id`),
  CONSTRAINT `fk_4` FOREIGN KEY (`document_proof_id`) REFERENCES `documents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `faculty_activity_events_attended`
--

DROP TABLE IF EXISTS `faculty_activity_events_attended`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faculty_activity_events_attended` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `special_labs_involved` tinyint(1) DEFAULT '0' COMMENT 'Yes | No',
  `special_lab_id` int DEFAULT NULL COMMENT 'Required if special_labs_involved = true',
  `event_type_id` int DEFAULT NULL,
  `if_event_type_others` varchar(200) DEFAULT NULL,
  `ps_domain` text DEFAULT NULL,
  `ps_domain_level` text DEFAULT NULL,
  `topic_name` varchar(300) DEFAULT NULL,
  `organizer_type_id` int DEFAULT NULL,
  `industry_id` int DEFAULT NULL,
  `industry_address` text DEFAULT NULL,
  `institute_name` varchar(300) DEFAULT NULL,
  `event_level_id` int DEFAULT NULL,
  `event_title` varchar(300) DEFAULT NULL,
  `organization_sector` varchar(20) DEFAULT NULL COMMENT 'Private | Government',
  `event_organizer` varchar(300) DEFAULT NULL,
  `event_mode_id` int DEFAULT NULL,
  `event_location` varchar(300) DEFAULT NULL,
  `event_duration_unit` varchar(10) DEFAULT NULL COMMENT 'Months | Weeks | Hours | Days',
  `event_date_from` date DEFAULT NULL,
  `event_date_to` date DEFAULT NULL,
  `duration_days` int DEFAULT NULL,
  `other_organizer_name` varchar(300) DEFAULT NULL,
  `sponsorship_type_id` int DEFAULT NULL,
  `funding_agency_name` varchar(300) DEFAULT NULL,
  `amount_inrs` decimal(12,2) DEFAULT NULL,
  `outcome` varchar(100) DEFAULT NULL COMMENT 'Programs organized | Development of working Models and prototypes | Funded projects received | Others',
  `if_outcome_others` varchar(300) DEFAULT NULL,
  `apex_proof_id` int DEFAULT NULL COMMENT 'Apex Proof',
  `certificate_proof_id` int DEFAULT NULL COMMENT 'Certificate Proof',
  `geotag_photos_id` int DEFAULT NULL COMMENT 'Upload Geotag Photos',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `submission_id` (`submission_id`),
  KEY `fk_2` (`special_lab_id`),
  KEY `fk_3` (`event_type_id`),
  KEY `fk_4` (`organizer_type_id`),
  KEY `fk_5` (`event_level_id`),
  KEY `fk_6` (`event_mode_id`),
  KEY `fk_7` (`sponsorship_type_id`),
  KEY `fk_8` (`apex_proof_id`),
  KEY `fk_9` (`certificate_proof_id`),
  KEY `fk_10` (`geotag_photos_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`),
  CONSTRAINT `fk_3` FOREIGN KEY (`event_type_id`) REFERENCES `ref_event_type_attended` (`id`),
  CONSTRAINT `fk_4` FOREIGN KEY (`organizer_type_id`) REFERENCES `ref_organizer_type` (`id`),
  CONSTRAINT `fk_5` FOREIGN KEY (`event_level_id`) REFERENCES `ref_event_level` (`id`),
  CONSTRAINT `fk_6` FOREIGN KEY (`event_mode_id`) REFERENCES `ref_event_mode` (`id`),
  CONSTRAINT `fk_7` FOREIGN KEY (`sponsorship_type_id`) REFERENCES `ref_sponsorship_type` (`id`),
  CONSTRAINT `fk_8` FOREIGN KEY (`apex_proof_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_9` FOREIGN KEY (`certificate_proof_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_10` FOREIGN KEY (`geotag_photos_id`) REFERENCES `documents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `faculty_activity_events_organized`
--

DROP TABLE IF EXISTS `faculty_activity_events_organized`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faculty_activity_events_organized` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `special_labs_involved` tinyint(1) DEFAULT '0' COMMENT 'Yes | No',
  `special_lab_id` int DEFAULT NULL COMMENT 'Required if special_labs_involved = true',
  `role` varchar(60) DEFAULT NULL COMMENT 'Convener | Co-Convener | Co-ordinator | Organizing Secretary',
  `department_id` int DEFAULT NULL,
  `is_iic_event` tinyint(1) DEFAULT NULL,
  `is_iic_uploaded` tinyint(1) DEFAULT NULL,
  `iic_bip_id` varchar(100) DEFAULT NULL,
  `is_dept_association` tinyint(1) DEFAULT NULL,
  `is_rnd_organized` tinyint(1) DEFAULT NULL,
  `is_technical_society` tinyint(1) DEFAULT NULL,
  `technical_society_id` int DEFAULT NULL,
  `is_mou_outcome` tinyint(1) DEFAULT NULL,
  `mou_bip_id` varchar(100) DEFAULT NULL,
  `is_irp_outcome` tinyint(1) DEFAULT NULL,
  `irp_bip_id` varchar(100) DEFAULT NULL,
  `is_centre_of_excellence` tinyint(1) DEFAULT NULL,
  `coe_bip_id` varchar(100) DEFAULT NULL,
  `is_industry_supported_lab` tinyint(1) DEFAULT NULL,
  `isl_bip_id` varchar(100) DEFAULT NULL,
  `event_name` varchar(300) DEFAULT NULL,
  `type_of_program` varchar(20) DEFAULT NULL COMMENT 'Academic | Non Academic',
  `club_society_name` varchar(200) DEFAULT NULL,
  `event_type_id` int DEFAULT NULL,
  `if_event_type_others` varchar(200) DEFAULT NULL,
  `topics_covered` text DEFAULT NULL,
  `has_conference_proceedings` tinyint(1) DEFAULT NULL,
  `publisher_detail` text DEFAULT NULL,
  `publisher_year` int DEFAULT NULL,
  `volume_number` int DEFAULT NULL,
  `issue_number` int DEFAULT NULL,
  `page_number` varchar(40) DEFAULT NULL,
  `isbn_number` varchar(30) DEFAULT NULL,
  `indexing_detail` varchar(200) DEFAULT NULL,
  `event_category` varchar(100) DEFAULT NULL,
  `event_organizer` varchar(300) DEFAULT NULL,
  `event_description` text DEFAULT NULL,
  `event_mode_id` int DEFAULT NULL,
  `event_location` varchar(300) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `event_duration_days` int DEFAULT NULL,
  `event_level_id` int DEFAULT NULL,
  `jointly_organized_with` varchar(60) DEFAULT NULL,
  `joint_org_name` varchar(300) DEFAULT NULL,
  `joint_org_address` text DEFAULT NULL,
  `internal_students_count` int DEFAULT NULL,
  `internal_faculty_count` int DEFAULT NULL,
  `external_students_count` int DEFAULT NULL,
  `external_faculty_count` int DEFAULT NULL,
  `amount_from_management` tinyint(1) DEFAULT NULL,
  `amount_received_inrs` decimal(12,2) DEFAULT NULL,
  `has_funding_agency` tinyint(1) DEFAULT NULL,
  `funding_agency_name` varchar(300) DEFAULT NULL,
  `registration_amount_inrs` decimal(12,2) DEFAULT NULL,
  `total_sponsored_amount` decimal(12,2) DEFAULT NULL,
  `total_revenue` decimal(12,2) DEFAULT NULL,
  `syllabus_id` int DEFAULT NULL COMMENT 'Upload the Syllabus',
  `course_feedback_id` int DEFAULT NULL COMMENT 'Upload the Course Feedback',
  `proceedings_proof_id` int DEFAULT NULL COMMENT 'Submit the Proceedings proof',
  `apex_proof_id` int DEFAULT NULL COMMENT 'Apex Proof',
  `relevant_proof_id` int DEFAULT NULL COMMENT 'Approval letter, Brochure, Attendance sheet, Photos',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `submission_id` (`submission_id`),
  KEY `fk_2` (`special_lab_id`),
  KEY `fk_3` (`department_id`),
  KEY `fk_4` (`technical_society_id`),
  KEY `fk_5` (`event_type_id`),
  KEY `fk_6` (`event_mode_id`),
  KEY `fk_7` (`event_level_id`),
  KEY `fk_8` (`syllabus_id`),
  KEY `fk_9` (`course_feedback_id`),
  KEY `fk_10` (`proceedings_proof_id`),
  KEY `fk_11` (`apex_proof_id`),
  KEY `fk_12` (`relevant_proof_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`),
  CONSTRAINT `fk_3` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`),
  CONSTRAINT `fk_4` FOREIGN KEY (`technical_society_id`) REFERENCES `ref_technical_society` (`id`),
  CONSTRAINT `fk_5` FOREIGN KEY (`event_type_id`) REFERENCES `ref_event_type_organized` (`id`),
  CONSTRAINT `fk_6` FOREIGN KEY (`event_mode_id`) REFERENCES `ref_event_mode` (`id`),
  CONSTRAINT `fk_7` FOREIGN KEY (`event_level_id`) REFERENCES `ref_event_level` (`id`),
  CONSTRAINT `fk_8` FOREIGN KEY (`syllabus_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_9` FOREIGN KEY (`course_feedback_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_10` FOREIGN KEY (`proceedings_proof_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_11` FOREIGN KEY (`apex_proof_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_12` FOREIGN KEY (`relevant_proof_id`) REFERENCES `documents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `faculty_activity_external_examiner`
--

DROP TABLE IF EXISTS `faculty_activity_external_examiner`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faculty_activity_external_examiner` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `special_labs_involved` tinyint(1) DEFAULT '0' COMMENT 'Yes | No',
  `special_lab_id` int DEFAULT NULL COMMENT 'Required if special_labs_involved = true',
  `college_name` varchar(300) DEFAULT NULL,
  `institute_address` text DEFAULT NULL,
  `purpose_id` int DEFAULT NULL,
  `examination_name` varchar(300) DEFAULT NULL,
  `department_of_qp_id` int DEFAULT NULL,
  `subject_of_qp` varchar(300) DEFAULT NULL,
  `num_days` int DEFAULT NULL,
  `from_date` date DEFAULT NULL,
  `to_date` date DEFAULT NULL,
  `document_proof_id` int DEFAULT NULL COMMENT 'Document Proof',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `submission_id` (`submission_id`),
  KEY `fk_2` (`special_lab_id`),
  KEY `fk_3` (`purpose_id`),
  KEY `fk_4` (`department_of_qp_id`),
  KEY `fk_5` (`document_proof_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`),
  CONSTRAINT `fk_3` FOREIGN KEY (`purpose_id`) REFERENCES `ref_external_examiner_purpose` (`id`),
  CONSTRAINT `fk_4` FOREIGN KEY (`department_of_qp_id`) REFERENCES `departments` (`id`),
  CONSTRAINT `fk_5` FOREIGN KEY (`document_proof_id`) REFERENCES `documents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `faculty_activity_faculty_journal_reviewer`
--

DROP TABLE IF EXISTS `faculty_activity_faculty_journal_reviewer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faculty_activity_faculty_journal_reviewer` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `special_labs_involved` tinyint(1) DEFAULT '0' COMMENT 'Yes | No',
  `special_lab_id` int DEFAULT NULL COMMENT 'Required if special_labs_involved = true',
  `journal_name` varchar(300) DEFAULT NULL,
  `indexing_id` int DEFAULT NULL,
  `if_indexing_others` varchar(200) DEFAULT NULL,
  `issn_no` varchar(30) DEFAULT NULL,
  `publisher_name` varchar(200) DEFAULT NULL,
  `impact_factor` decimal(8,3) DEFAULT NULL,
  `journal_homepage_url` varchar(500) DEFAULT NULL,
  `recognition_type_id` int DEFAULT NULL,
  `if_recognition_others` varchar(200) DEFAULT NULL,
  `num_papers_reviewed` int DEFAULT NULL,
  `review_date` date DEFAULT NULL,
  `document_proof_id` int DEFAULT NULL COMMENT 'Mail/Letter/Certificate as single PDF',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `submission_id` (`submission_id`),
  KEY `fk_2` (`special_lab_id`),
  KEY `fk_3` (`indexing_id`),
  KEY `fk_4` (`recognition_type_id`),
  KEY `fk_5` (`document_proof_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`),
  CONSTRAINT `fk_3` FOREIGN KEY (`indexing_id`) REFERENCES `ref_journal_indexing` (`id`),
  CONSTRAINT `fk_4` FOREIGN KEY (`recognition_type_id`) REFERENCES `ref_recognition_type` (`id`),
  CONSTRAINT `fk_5` FOREIGN KEY (`document_proof_id`) REFERENCES `documents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `faculty_activity_guest_lecture_delivered`
--

DROP TABLE IF EXISTS `faculty_activity_guest_lecture_delivered`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faculty_activity_guest_lecture_delivered` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `special_labs_involved` tinyint(1) DEFAULT '0' COMMENT 'Yes | No',
  `special_lab_id` int DEFAULT NULL COMMENT 'Required if special_labs_involved = true',
  `event_type` varchar(100) DEFAULT NULL,
  `topic` varchar(300) DEFAULT NULL,
  `event_mode_id` int DEFAULT NULL,
  `event_level_id` int DEFAULT NULL,
  `event_name` varchar(300) DEFAULT NULL,
  `from_date` date DEFAULT NULL,
  `to_date` date DEFAULT NULL,
  `num_days` int DEFAULT NULL,
  `organization_type_id` int DEFAULT NULL,
  `org_name` varchar(300) DEFAULT NULL,
  `org_address` text DEFAULT NULL,
  `num_participants` int DEFAULT NULL,
  `audience_type` varchar(200) DEFAULT NULL COMMENT 'Students | Teaching Faculty | Non Teaching Faculty | Engineering Trainee | Industry persons | Others',
  `document_proof_id` int DEFAULT NULL COMMENT 'Request Letter, Confirmation Letter, Brochure',
  `apex_proof_id` int DEFAULT NULL COMMENT 'Apex Proof',
  `sample_photographs_id` int DEFAULT NULL COMMENT 'Screenshot if online, Photograph if offline',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `submission_id` (`submission_id`),
  KEY `fk_2` (`special_lab_id`),
  KEY `fk_3` (`event_mode_id`),
  KEY `fk_4` (`event_level_id`),
  KEY `fk_5` (`organization_type_id`),
  KEY `fk_6` (`document_proof_id`),
  KEY `fk_7` (`apex_proof_id`),
  KEY `fk_8` (`sample_photographs_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`),
  CONSTRAINT `fk_3` FOREIGN KEY (`event_mode_id`) REFERENCES `ref_event_mode` (`id`),
  CONSTRAINT `fk_4` FOREIGN KEY (`event_level_id`) REFERENCES `ref_event_level` (`id`),
  CONSTRAINT `fk_5` FOREIGN KEY (`organization_type_id`) REFERENCES `ref_organizer_type` (`id`),
  CONSTRAINT `fk_6` FOREIGN KEY (`document_proof_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_7` FOREIGN KEY (`apex_proof_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_8` FOREIGN KEY (`sample_photographs_id`) REFERENCES `documents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `faculty_activity_international_visit`
--

DROP TABLE IF EXISTS `faculty_activity_international_visit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faculty_activity_international_visit` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `country_visited` varchar(100) DEFAULT NULL,
  `purpose_of_visit` text DEFAULT NULL,
  `from_date` date DEFAULT NULL,
  `to_date` date DEFAULT NULL,
  `fund_type_id` int DEFAULT NULL,
  `funding_agency_name` varchar(300) DEFAULT NULL,
  `apex_proof_id` int DEFAULT NULL COMMENT 'Apex Proof',
  `relevant_proof_id` int DEFAULT NULL COMMENT 'Approval letter, Brochure, Attendance sheet, Photos',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `submission_id` (`submission_id`),
  KEY `fk_2` (`fund_type_id`),
  KEY `fk_3` (`apex_proof_id`),
  KEY `fk_4` (`relevant_proof_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`fund_type_id`) REFERENCES `ref_fund_type` (`id`),
  CONSTRAINT `fk_3` FOREIGN KEY (`apex_proof_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_4` FOREIGN KEY (`relevant_proof_id`) REFERENCES `documents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `faculty_activity_newsletter_archive`
--

DROP TABLE IF EXISTS `faculty_activity_newsletter_archive`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faculty_activity_newsletter_archive` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `newsletter_category_id` int DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  `academic_year` varchar(20) DEFAULT NULL,
  `date_of_publication` date DEFAULT NULL,
  `volume_number` int DEFAULT NULL,
  `issue_number` int DEFAULT NULL,
  `issue_month` varchar(20) DEFAULT NULL,
  `num_faculty_editors` int DEFAULT NULL,
  `num_student_editors` int DEFAULT NULL,
  `proof_document_id` int DEFAULT NULL COMMENT 'Upload the Document',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `submission_id` (`submission_id`),
  KEY `fk_2` (`newsletter_category_id`),
  KEY `fk_3` (`department_id`),
  KEY `fk_4` (`proof_document_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`newsletter_category_id`) REFERENCES `ref_newsletter_category` (`id`),
  CONSTRAINT `fk_3` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`),
  CONSTRAINT `fk_4` FOREIGN KEY (`proof_document_id`) REFERENCES `documents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `faculty_activity_notable_achievements`
--

DROP TABLE IF EXISTS `faculty_activity_notable_achievements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faculty_activity_notable_achievements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `special_labs_involved` tinyint(1) DEFAULT '0' COMMENT 'Yes | No',
  `special_lab_id` int DEFAULT NULL COMMENT 'Required if special_labs_involved = true',
  `is_technical_society` tinyint(1) DEFAULT NULL,
  `technical_society_id` int DEFAULT NULL,
  `type_of_recognition` varchar(20) DEFAULT NULL COMMENT 'Award | Achievement',
  `award_type` varchar(100) DEFAULT NULL,
  `achievement_type` varchar(100) DEFAULT NULL,
  `award_achievement_name` varchar(300) DEFAULT NULL,
  `organization_type` varchar(20) DEFAULT NULL COMMENT 'Government | Private | Others',
  `others_organization_name` varchar(300) DEFAULT NULL,
  `org_name` varchar(300) DEFAULT NULL,
  `awarding_body` varchar(100) DEFAULT NULL,
  `level_id` int DEFAULT NULL,
  `received_date` date DEFAULT NULL,
  `nature_of_recognition` varchar(60) DEFAULT NULL COMMENT 'Cash Prize | Certificate | Momento',
  `prize_amount_inrs` decimal(12,2) DEFAULT NULL,
  `photo_proof_id` int DEFAULT NULL COMMENT 'Photo Proofs',
  `document_proof_id` int DEFAULT NULL COMMENT 'Document Proof',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `submission_id` (`submission_id`),
  KEY `fk_2` (`special_lab_id`),
  KEY `fk_3` (`technical_society_id`),
  KEY `fk_4` (`level_id`),
  KEY `fk_5` (`photo_proof_id`),
  KEY `fk_6` (`document_proof_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`),
  CONSTRAINT `fk_3` FOREIGN KEY (`technical_society_id`) REFERENCES `ref_technical_society` (`id`),
  CONSTRAINT `fk_4` FOREIGN KEY (`level_id`) REFERENCES `ref_event_level` (`id`),
  CONSTRAINT `fk_5` FOREIGN KEY (`photo_proof_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_6` FOREIGN KEY (`document_proof_id`) REFERENCES `documents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `faculty_activity_online_course`
--

DROP TABLE IF EXISTS `faculty_activity_online_course`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faculty_activity_online_course` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `special_labs_involved` tinyint(1) DEFAULT '0' COMMENT 'Yes | No',
  `special_lab_id` int DEFAULT NULL COMMENT 'Required if special_labs_involved = true',
  `mode_of_course` varchar(20) DEFAULT NULL COMMENT 'Online | Offline | Hybrid',
  `course_type_id` int DEFAULT NULL,
  `type_of_organizer` varchar(20) DEFAULT NULL COMMENT 'Private | Government',
  `course_name` varchar(300) DEFAULT NULL,
  `organization_name` varchar(300) DEFAULT NULL,
  `organization_address` text DEFAULT NULL,
  `level_of_event_id` int DEFAULT NULL,
  `duration_unit` varchar(10) DEFAULT NULL COMMENT 'Hours | Weeks | Days',
  `num_hours` int DEFAULT NULL,
  `num_weeks` int DEFAULT NULL,
  `num_days` int DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `course_category` varchar(60) DEFAULT NULL COMMENT 'Proctored-Exam | Self-paced with final assessment | Self-paced without final assessment',
  `exam_date` date DEFAULT NULL,
  `grade_obtained` varchar(20) DEFAULT NULL,
  `is_approved_fdp` tinyint(1) DEFAULT NULL,
  `sponsorship_type_id` int DEFAULT NULL,
  `funding_agency_name` varchar(300) DEFAULT NULL,
  `claimed_for` varchar(30) DEFAULT NULL COMMENT 'FAP | Competency | Not-Applicable',
  `marksheet_proof_id` int DEFAULT NULL COMMENT 'Upload Mark Sheet Proof',
  `fdp_proof_id` int DEFAULT NULL COMMENT 'Upload FDP Proof',
  `apex_proof_id` int DEFAULT NULL COMMENT 'Apex Proof',
  `certificate_proof_id` int DEFAULT NULL COMMENT 'Upload Certificate Proof',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `submission_id` (`submission_id`),
  KEY `fk_2` (`special_lab_id`),
  KEY `fk_3` (`course_type_id`),
  KEY `fk_4` (`level_of_event_id`),
  KEY `fk_5` (`sponsorship_type_id`),
  KEY `fk_6` (`marksheet_proof_id`),
  KEY `fk_7` (`fdp_proof_id`),
  KEY `fk_8` (`apex_proof_id`),
  KEY `fk_9` (`certificate_proof_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`),
  CONSTRAINT `fk_3` FOREIGN KEY (`course_type_id`) REFERENCES `ref_course_type` (`id`),
  CONSTRAINT `fk_4` FOREIGN KEY (`level_of_event_id`) REFERENCES `ref_event_level` (`id`),
  CONSTRAINT `fk_5` FOREIGN KEY (`sponsorship_type_id`) REFERENCES `ref_sponsorship_type` (`id`),
  CONSTRAINT `fk_6` FOREIGN KEY (`marksheet_proof_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_7` FOREIGN KEY (`fdp_proof_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_8` FOREIGN KEY (`apex_proof_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_9` FOREIGN KEY (`certificate_proof_id`) REFERENCES `documents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `faculty_activity_paper_presentation`
--

DROP TABLE IF EXISTS `faculty_activity_paper_presentation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faculty_activity_paper_presentation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `special_labs_involved` tinyint(1) DEFAULT '0' COMMENT 'Yes | No',
  `special_lab_id` int DEFAULT NULL COMMENT 'Required if special_labs_involved = true',
  `has_intl_institute_collab` tinyint(1) DEFAULT NULL,
  `institute_name` varchar(300) DEFAULT NULL,
  `conference_name` varchar(300) DEFAULT NULL,
  `event_mode_id` int DEFAULT NULL,
  `event_location` varchar(300) DEFAULT NULL,
  `organizer_type_id` int DEFAULT NULL,
  `organizer_name` varchar(300) DEFAULT NULL,
  `event_level_id` int DEFAULT NULL,
  `paper_title` varchar(500) DEFAULT NULL,
  `event_start_date` date DEFAULT NULL,
  `event_end_date` date DEFAULT NULL,
  `event_duration_days` int DEFAULT NULL,
  `published_in_proceedings` tinyint(1) DEFAULT NULL,
  `page_from` int DEFAULT NULL,
  `page_to` int DEFAULT NULL,
  `sponsorship_type_id` int DEFAULT NULL,
  `funding_agency_name` varchar(300) DEFAULT NULL,
  `amount_inrs` decimal(12,2) DEFAULT NULL,
  `registration_amount_inrs` decimal(12,2) DEFAULT NULL,
  `award_received` tinyint(1) DEFAULT NULL,
  `apex_proof_id` int DEFAULT NULL COMMENT 'Apex Proof',
  `document_proof_id` int DEFAULT NULL COMMENT 'Certificate & Proceeding page',
  `award_proof_id` int DEFAULT NULL COMMENT 'Award Proof',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `submission_id` (`submission_id`),
  KEY `fk_2` (`special_lab_id`),
  KEY `fk_3` (`event_mode_id`),
  KEY `fk_4` (`organizer_type_id`),
  KEY `fk_5` (`event_level_id`),
  KEY `fk_6` (`sponsorship_type_id`),
  KEY `fk_7` (`apex_proof_id`),
  KEY `fk_8` (`document_proof_id`),
  KEY `fk_9` (`award_proof_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`),
  CONSTRAINT `fk_3` FOREIGN KEY (`event_mode_id`) REFERENCES `ref_event_mode` (`id`),
  CONSTRAINT `fk_4` FOREIGN KEY (`organizer_type_id`) REFERENCES `ref_organizer_type` (`id`),
  CONSTRAINT `fk_5` FOREIGN KEY (`event_level_id`) REFERENCES `ref_event_level` (`id`),
  CONSTRAINT `fk_6` FOREIGN KEY (`sponsorship_type_id`) REFERENCES `ref_sponsorship_type` (`id`),
  CONSTRAINT `fk_7` FOREIGN KEY (`apex_proof_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_8` FOREIGN KEY (`document_proof_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_9` FOREIGN KEY (`award_proof_id`) REFERENCES `documents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `faculty_activity_resource_person`
--

DROP TABLE IF EXISTS `faculty_activity_resource_person`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faculty_activity_resource_person` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `special_labs_involved` tinyint(1) DEFAULT '0' COMMENT 'Yes | No',
  `special_lab_id` int DEFAULT NULL COMMENT 'Required if special_labs_involved = true',
  `category_id` int DEFAULT NULL,
  `purpose_of_interaction` text DEFAULT NULL,
  `panel_name` varchar(200) DEFAULT NULL,
  `organization_type` varchar(20) DEFAULT NULL COMMENT 'Industry | Institute',
  `org_name_address` text DEFAULT NULL,
  `visiting_dept_industry` varchar(200) DEFAULT NULL,
  `visiting_dept_institute` varchar(200) DEFAULT NULL,
  `num_days` int DEFAULT NULL,
  `from_date` date DEFAULT NULL,
  `to_date` date DEFAULT NULL,
  `document_proof_id` int DEFAULT NULL COMMENT 'Document Proof (PDF - max 2KB)',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `submission_id` (`submission_id`),
  KEY `fk_2` (`special_lab_id`),
  KEY `fk_3` (`category_id`),
  KEY `fk_4` (`document_proof_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`),
  CONSTRAINT `fk_3` FOREIGN KEY (`category_id`) REFERENCES `ref_resource_person_category` (`id`),
  CONSTRAINT `fk_4` FOREIGN KEY (`document_proof_id`) REFERENCES `documents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `faculty_fap_target_assignment`
--

DROP TABLE IF EXISTS `faculty_fap_target_assignment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faculty_fap_target_assignment` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `academic_year` varchar(20) NOT NULL,
  `faculty_id` varchar(50) NOT NULL,
  `designation_id` int NOT NULL,
  `target_id` bigint NOT NULL,
  `assigned_value` decimal(10,2) NOT NULL DEFAULT '0.00',
  `assigned_on` date NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `uk_faculty_target` (`academic_year`,`faculty_id`,`target_id`),
  KEY `idx_faculty_target_lookup` (`academic_year`,`faculty_id`),
  KEY `fk_faculty_target_faculty` (`faculty_id`),
  KEY `fk_faculty_target_designation` (`designation_id`),
  KEY `fk_faculty_target_target` (`target_id`),
  CONSTRAINT `fk_faculty_target_faculty` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_faculty_target_designation` FOREIGN KEY (`designation_id`) REFERENCES `designation` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_faculty_target_target` FOREIGN KEY (`target_id`) REFERENCES `fap_target_master` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `faculty_industry_project`
--

DROP TABLE IF EXISTS `faculty_industry_project`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faculty_industry_project` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `sig_number` varchar(50) DEFAULT NULL,
  `special_labs_involved` tinyint(1) DEFAULT '0',
  `special_lab_id` int DEFAULT NULL,
  `students_involved` tinyint(1) DEFAULT NULL COMMENT 'Yes | NA',
  `industry_name` varchar(300) DEFAULT NULL,
  `industry_type_id` int DEFAULT NULL,
  `if_type_others` varchar(200) DEFAULT NULL,
  `project_type_id` int DEFAULT NULL,
  `project_title` varchar(300) DEFAULT NULL,
  `duration_months` int DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `outcome` text DEFAULT NULL,
  `project_proof_id` int DEFAULT NULL COMMENT 'Approval Letter, BIT Approval, Certificate, Project Report, Photos, Joint IPR',
  `iqac_verification` varchar(50) DEFAULT 'initiated' COMMENT 'initiated | approved | rejected',
  `iqac_remarks` text DEFAULT NULL COMMENT 'Remarks/reason for rejection from IQAC',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `submission_id` (`submission_id`),
  KEY `fk_2` (`special_lab_id`),
  KEY `fk_3` (`industry_type_id`),
  KEY `fk_4` (`project_type_id`),
  KEY `fk_5` (`project_proof_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`),
  CONSTRAINT `fk_3` FOREIGN KEY (`industry_type_id`) REFERENCES `ref_industry_org_type` (`id`),
  CONSTRAINT `fk_4` FOREIGN KEY (`project_type_id`) REFERENCES `ref_industry_project_type` (`id`),
  CONSTRAINT `fk_5` FOREIGN KEY (`project_proof_id`) REFERENCES `documents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `faculty_industry_project_faculty`
--

DROP TABLE IF EXISTS `faculty_industry_project_faculty`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faculty_industry_project_faculty` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `faculty_id` varchar(50) NOT NULL,
  `sig_number` varchar(50) DEFAULT NULL,
  `order_no` smallint NOT NULL COMMENT '2 to 5',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `faculty_industry_project_faculty_index_5` (`project_id`,`faculty_id`),
  KEY `fk_2` (`faculty_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`project_id`) REFERENCES `faculty_industry_project` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `faculty_industry_project_student`
--

DROP TABLE IF EXISTS `faculty_industry_project_student`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faculty_industry_project_student` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `student_name` varchar(200) DEFAULT NULL,
  `order_no` smallint NOT NULL COMMENT '1 to 5',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_1` (`project_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`project_id`) REFERENCES `faculty_industry_project` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `faculty_journal_reviewer`
--

DROP TABLE IF EXISTS `faculty_journal_reviewer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faculty_journal_reviewer` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `special_labs_involved` tinyint(1) DEFAULT '0' COMMENT 'Yes | No',
  `special_lab_id` int DEFAULT NULL COMMENT 'Required if special_labs_involved = true',
  `journal_name` varchar(300) DEFAULT NULL,
  `indexing_id` int DEFAULT NULL,
  `if_indexing_others` varchar(200) DEFAULT NULL,
  `issn_no` varchar(30) DEFAULT NULL,
  `publisher_name` varchar(200) DEFAULT NULL,
  `impact_factor` decimal(8,3) DEFAULT NULL,
  `journal_homepage_url` varchar(500) DEFAULT NULL,
  `recognition_type_id` int DEFAULT NULL,
  `if_recognition_others` varchar(200) DEFAULT NULL,
  `num_papers_reviewed` int DEFAULT NULL,
  `review_date` date DEFAULT NULL,
  `document_proof_id` int DEFAULT NULL COMMENT 'Mail/Letter/Certificate as single PDF',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `submission_id` (`submission_id`),
  KEY `fk_2` (`special_lab_id`),
  KEY `fk_3` (`indexing_id`),
  KEY `fk_4` (`recognition_type_id`),
  KEY `fk_5` (`document_proof_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`),
  CONSTRAINT `fk_3` FOREIGN KEY (`indexing_id`) REFERENCES `ref_journal_indexing` (`id`),
  CONSTRAINT `fk_4` FOREIGN KEY (`recognition_type_id`) REFERENCES `ref_recognition_type` (`id`),
  CONSTRAINT `fk_5` FOREIGN KEY (`document_proof_id`) REFERENCES `documents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `faculty_trained_by_industry`
--

DROP TABLE IF EXISTS `faculty_trained_by_industry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faculty_trained_by_industry` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `special_labs_involved` tinyint(1) DEFAULT '0',
  `special_lab_id` int DEFAULT NULL,
  `training_program_name` varchar(300) DEFAULT NULL,
  `financial_assistance_id` int DEFAULT NULL,
  `amount_incurred_inrs` decimal(12,2) DEFAULT NULL,
  `approval_type_id` int DEFAULT NULL,
  `apex_approval_no` varchar(100) DEFAULT NULL,
  `industry_name` varchar(300) DEFAULT NULL,
  `domain_area` varchar(300) DEFAULT NULL,
  `industry_type_id` int DEFAULT NULL,
  `if_type_others` varchar(200) DEFAULT NULL,
  `training_mode_id` int DEFAULT NULL,
  `training_venue` varchar(300) DEFAULT NULL,
  `duration_days` int DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `industry_website` varchar(500) DEFAULT NULL,
  `trainer1_name` varchar(200) DEFAULT NULL,
  `trainer1_designation` varchar(200) DEFAULT NULL,
  `trainer1_email` varchar(200) DEFAULT NULL,
  `trainer1_phone` varchar(20) DEFAULT NULL,
  `has_trainer2` tinyint(1) DEFAULT NULL,
  `trainer2_name` varchar(200) DEFAULT NULL,
  `trainer2_designation` varchar(200) DEFAULT NULL,
  `trainer2_email` varchar(200) DEFAULT NULL,
  `trainer2_phone` varchar(20) DEFAULT NULL,
  `outcome` text DEFAULT NULL,
  `proof_id` int DEFAULT NULL COMMENT 'Apex Approval Copy, Sample Photographs, Training Certificate, Bills/Invoices',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `submission_id` (`submission_id`),
  KEY `fk_2` (`special_lab_id`),
  KEY `fk_3` (`financial_assistance_id`),
  KEY `fk_4` (`approval_type_id`),
  KEY `fk_5` (`industry_type_id`),
  KEY `fk_6` (`training_mode_id`),
  KEY `fk_7` (`proof_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`),
  CONSTRAINT `fk_3` FOREIGN KEY (`financial_assistance_id`) REFERENCES `ref_financial_assistance` (`id`),
  CONSTRAINT `fk_4` FOREIGN KEY (`approval_type_id`) REFERENCES `ref_approval_type_short` (`id`),
  CONSTRAINT `fk_5` FOREIGN KEY (`industry_type_id`) REFERENCES `ref_industry_org_type` (`id`),
  CONSTRAINT `fk_6` FOREIGN KEY (`training_mode_id`) REFERENCES `ref_training_mode` (`id`),
  CONSTRAINT `fk_7` FOREIGN KEY (`proof_id`) REFERENCES `documents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `faculty_verified_students`
--

DROP TABLE IF EXISTS `faculty_verified_students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faculty_verified_students` (
  `id` int NOT NULL AUTO_INCREMENT,
  `faculty_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Student registration number',
  `student_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  `verification_date` timestamp DEFAULT CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT '1' COMMENT 'Can be set to false to revoke access',
  `notes` text COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Optional notes from faculty',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `unique_faculty_student` (`faculty_id`,`student_id`),
  KEY `idx_faculty_id` (`faculty_id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `faculty_workflow_task_status`
--

DROP TABLE IF EXISTS `faculty_workflow_task_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faculty_workflow_task_status` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `academic_year` varchar(20) NOT NULL,
  `faculty_id` varchar(50) NOT NULL,
  `workflow_type` enum('paper','patent','proposal') NOT NULL,
  `slot_no` tinyint NOT NULL DEFAULT '1',
  `task_code` varchar(120) NOT NULL,
  `status` enum('pending','completed') NOT NULL DEFAULT 'completed',
  `payload_json` json DEFAULT NULL,
  `completed_at` datetime NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `uk_faculty_workflow_status` (`academic_year`,`faculty_id`,`workflow_type`,`slot_no`,`task_code`),
  KEY `idx_faculty_workflow_lookup` (`academic_year`,`faculty_id`),
  KEY `fk_faculty_workflow_status_faculty` (`faculty_id`),
  CONSTRAINT `fk_faculty_workflow_status_faculty` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `fap_designation_target_rule`
--

DROP TABLE IF EXISTS `fap_designation_target_rule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fap_designation_target_rule` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `academic_year` varchar(20) NOT NULL,
  `designation_id` int NOT NULL,
  `target_id` bigint NOT NULL,
  `target_value` decimal(10,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `uk_fap_rule` (`academic_year`,`designation_id`,`target_id`),
  KEY `idx_fap_rule_ay_desig` (`academic_year`,`designation_id`),
  KEY `fk_fap_rule_designation` (`designation_id`),
  KEY `fk_fap_rule_target` (`target_id`),
  CONSTRAINT `fk_fap_rule_designation` FOREIGN KEY (`designation_id`) REFERENCES `designation` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_fap_rule_target` FOREIGN KEY (`target_id`) REFERENCES `fap_target_master` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `fap_target_master`
--

DROP TABLE IF EXISTS `fap_target_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fap_target_master` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `target_code` varchar(60) NOT NULL,
  `target_name` varchar(200) NOT NULL,
  `unit` varchar(50) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `uk_fap_target_code` (`target_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `guest_lecture_delivered`
--

DROP TABLE IF EXISTS `guest_lecture_delivered`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guest_lecture_delivered` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `special_labs_involved` tinyint(1) DEFAULT '0' COMMENT 'Yes | No',
  `special_lab_id` int DEFAULT NULL COMMENT 'Required if special_labs_involved = true',
  `event_type` varchar(100) DEFAULT NULL,
  `topic` varchar(300) DEFAULT NULL,
  `event_mode_id` int DEFAULT NULL,
  `event_level_id` int DEFAULT NULL,
  `event_name` varchar(300) DEFAULT NULL,
  `from_date` date DEFAULT NULL,
  `to_date` date DEFAULT NULL,
  `num_days` int DEFAULT NULL,
  `organization_type_id` int DEFAULT NULL,
  `org_name` varchar(300) DEFAULT NULL,
  `org_address` text DEFAULT NULL,
  `num_participants` int DEFAULT NULL,
  `audience_type` varchar(200) DEFAULT NULL COMMENT 'Students | Teaching Faculty | Non Teaching Faculty | Engineering Trainee | Industry persons | Others',
  `document_proof_id` int DEFAULT NULL COMMENT 'Request Letter, Confirmation Letter, Brochure',
  `apex_proof_id` int DEFAULT NULL COMMENT 'Apex Proof',
  `sample_photographs_id` int DEFAULT NULL COMMENT 'Screenshot if online, Photograph if offline',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `submission_id` (`submission_id`),
  KEY `fk_2` (`special_lab_id`),
  KEY `fk_3` (`event_mode_id`),
  KEY `fk_4` (`event_level_id`),
  KEY `fk_5` (`organization_type_id`),
  KEY `fk_6` (`document_proof_id`),
  KEY `fk_7` (`apex_proof_id`),
  KEY `fk_8` (`sample_photographs_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`),
  CONSTRAINT `fk_3` FOREIGN KEY (`event_mode_id`) REFERENCES `ref_event_mode` (`id`),
  CONSTRAINT `fk_4` FOREIGN KEY (`event_level_id`) REFERENCES `ref_event_level` (`id`),
  CONSTRAINT `fk_5` FOREIGN KEY (`organization_type_id`) REFERENCES `ref_organizer_type` (`id`),
  CONSTRAINT `fk_6` FOREIGN KEY (`document_proof_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_7` FOREIGN KEY (`apex_proof_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_8` FOREIGN KEY (`sample_photographs_id`) REFERENCES `documents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `industries`
--

DROP TABLE IF EXISTS `industries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `industries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `industry_name` text DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `industry_advisor`
--

DROP TABLE IF EXISTS `industry_advisor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `industry_advisor` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `sig_number` varchar(50) DEFAULT NULL,
  `special_labs_involved` tinyint(1) DEFAULT '0',
  `special_lab_id` int DEFAULT NULL,
  `industry_name` varchar(300) DEFAULT NULL,
  `domain_area` varchar(300) DEFAULT NULL,
  `industry_type_id` int DEFAULT NULL,
  `if_type_others` varchar(200) DEFAULT NULL,
  `expert_name` varchar(200) DEFAULT NULL,
  `expert_designation` varchar(200) DEFAULT NULL,
  `expert_email` varchar(200) DEFAULT NULL,
  `expert_phone` varchar(20) DEFAULT NULL,
  `experience_years` int DEFAULT NULL,
  `area_of_expertise` varchar(300) DEFAULT NULL,
  `industry_address` text DEFAULT NULL,
  `industry_website` varchar(500) DEFAULT NULL,
  `interaction_frequency_months` int DEFAULT NULL,
  `date_of_meeting` date DEFAULT NULL,
  `expense_incurred_inrs` decimal(12,2) DEFAULT NULL,
  `suggestions_for_improvement` text DEFAULT NULL,
  `collaborative_activities` text DEFAULT NULL,
  `proof_id` int DEFAULT NULL COMMENT 'Approval Letter, Minutes of Meeting, Sample Photographs, Collaborative Activities',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `submission_id` (`submission_id`),
  KEY `fk_2` (`special_lab_id`),
  KEY `fk_3` (`industry_type_id`),
  KEY `fk_4` (`proof_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`),
  CONSTRAINT `fk_3` FOREIGN KEY (`industry_type_id`) REFERENCES `ref_industry_org_type` (`id`),
  CONSTRAINT `fk_4` FOREIGN KEY (`proof_id`) REFERENCES `documents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `international_visit`
--

DROP TABLE IF EXISTS `international_visit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `international_visit` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `country_visited` varchar(100) DEFAULT NULL,
  `purpose_of_visit` text DEFAULT NULL,
  `from_date` date DEFAULT NULL,
  `to_date` date DEFAULT NULL,
  `fund_type_id` int DEFAULT NULL,
  `funding_agency_name` varchar(300) DEFAULT NULL,
  `apex_proof_id` int DEFAULT NULL COMMENT 'Apex Proof',
  `relevant_proof_id` int DEFAULT NULL COMMENT 'Approval letter, Brochure, Attendance sheet, Photos',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `submission_id` (`submission_id`),
  KEY `fk_2` (`fund_type_id`),
  KEY `fk_3` (`apex_proof_id`),
  KEY `fk_4` (`relevant_proof_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`fund_type_id`) REFERENCES `ref_fund_type` (`id`),
  CONSTRAINT `fk_3` FOREIGN KEY (`apex_proof_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_4` FOREIGN KEY (`relevant_proof_id`) REFERENCES `documents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `internship_industries`
--

DROP TABLE IF EXISTS `internship_industries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `internship_industries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `industry` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `website_link` varchar(255) DEFAULT NULL,
  `active_now` tinyint(1) DEFAULT '1',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `internship_reports`
--

DROP TABLE IF EXISTS `internship_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `internship_reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tracker_id` int NOT NULL,
  `report_number` bigint unsigned NOT NULL,
  `student_id` int NOT NULL,
  `special_lab_id` int NOT NULL,
  `year_of_study` int NOT NULL,
  `sector` enum('Government','Private') COLLATE utf8mb4_unicode_ci NOT NULL,
  `industry_address_line_1` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `industry_address_line_2` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `postal_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `industry_website` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `industry_contact_details` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `referred_by` enum('Alumni','Faculty','Others') COLLATE utf8mb4_unicode_ci NOT NULL,
  `referee_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referee_mobile_number` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stipend_received` enum('Yes','No') COLLATE utf8mb4_unicode_ci NOT NULL,
  `stipend_amount` decimal(10,2) DEFAULT '0.00',
  `is_through_aicte` enum('Yes','No') COLLATE utf8mb4_unicode_ci NOT NULL,
  `claim_type` enum('Course Exemption','Reward Points') COLLATE utf8mb4_unicode_ci NOT NULL,
  `sdg_goal_id` int NOT NULL,
  `full_document_proof_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_certificate_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `attested_certificate_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `iqac_verification` enum('initiated','approved','declined') COLLATE utf8mb4_unicode_ci DEFAULT 'initiated',
  `reject_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `uk_report_number` (`report_number`),
  KEY `idx_student` (`student_id`),
  KEY `idx_special_lab` (`special_lab_id`),
  KEY `idx_sdg_goal` (`sdg_goal_id`),
  KEY `fk_report_tracker` (`tracker_id`),
  CONSTRAINT `fk_report_tracker` FOREIGN KEY (`tracker_id`) REFERENCES `internship_tracker` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_report_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `fk_report_special_lab` FOREIGN KEY (`special_lab_id`) REFERENCES `special_labs` (`id`),
  CONSTRAINT `fk_report_sdg` FOREIGN KEY (`sdg_goal_id`) REFERENCES `sdg_goals` (`id`),
  CONSTRAINT `fk_tracker` FOREIGN KEY (`tracker_id`) REFERENCES `internship_tracker` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=150001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `internship_tracker`
--

DROP TABLE IF EXISTS `internship_tracker`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `internship_tracker` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int DEFAULT NULL,
  `industry_id` int DEFAULT NULL,
  `tracker_number` bigint unsigned NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `aim_objectives_link` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `offer_letter_link` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `iqac_verification` enum('initiated','approved','declined') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'initiated',
  `reject_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_1_idx` (`student_id`),
  KEY `fk_2_idx` (`industry_id`),
  CONSTRAINT `fk_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_industry` FOREIGN KEY (`industry_id`) REFERENCES `internship_industries` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=30001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `irp_industry_expected_outcomes`
--

DROP TABLE IF EXISTS `irp_industry_expected_outcomes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `irp_industry_expected_outcomes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `irp_visit_industry_id` int NOT NULL,
  `outcome_id` int NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_1` (`irp_visit_industry_id`),
  KEY `fk_2` (`outcome_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`irp_visit_industry_id`) REFERENCES `irp_visit_industry` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`outcome_id`) REFERENCES `ref_irp_points_discussed` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `irp_industry_points_discussed`
--

DROP TABLE IF EXISTS `irp_industry_points_discussed`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `irp_industry_points_discussed` (
  `id` int NOT NULL AUTO_INCREMENT,
  `irp_visit_industry_id` int NOT NULL,
  `point_id` int NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_1` (`irp_visit_industry_id`),
  KEY `fk_2` (`point_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`irp_visit_industry_id`) REFERENCES `irp_visit_industry` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`point_id`) REFERENCES `ref_irp_points_discussed` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `irp_visit`
--

DROP TABLE IF EXISTS `irp_visit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `irp_visit` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `sig_number` varchar(50) DEFAULT NULL,
  `special_labs_involved` tinyint(1) DEFAULT '0',
  `special_lab_id` int DEFAULT NULL,
  `num_faculty` smallint DEFAULT NULL COMMENT '1 to 6',
  `claimed_for_faculty_id` varchar(50) DEFAULT NULL,
  `claimed_for_department_id` int DEFAULT NULL,
  `approval_type_id` int DEFAULT NULL,
  `apex_no` varchar(100) DEFAULT NULL,
  `is_mou_related` tinyint(1) DEFAULT NULL,
  `mou_id` int DEFAULT NULL COMMENT 'Required if is_mou_related = true',
  `mou_relation_points` text DEFAULT NULL,
  `from_date` date DEFAULT NULL,
  `to_date` date DEFAULT NULL,
  `interaction_mode_id` int DEFAULT NULL,
  `if_mode_others` varchar(200) DEFAULT NULL,
  `purpose_id` int DEFAULT NULL,
  `amount_incurred_inrs` decimal(12,2) DEFAULT NULL,
  `num_industry` smallint DEFAULT NULL COMMENT '1 to 6',
  `apex_proof_id` int DEFAULT NULL COMMENT 'Upload Apex Proof',
  `geotag_photos_id` int DEFAULT NULL COMMENT 'Upload Geotag Photos',
  `irp_form_signed_id` int DEFAULT NULL COMMENT 'Upload IRP form duly signed by Industry person',
  `consolidated_doc_id` int DEFAULT NULL COMMENT 'Upload Consolidated Document',
  `iqac_verification` varchar(50) DEFAULT 'initiated' COMMENT 'initiated | approved | rejected',
  `iqac_remarks` text DEFAULT NULL COMMENT 'Remarks/reason for rejection from IQAC',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `submission_id` (`submission_id`),
  KEY `fk_2` (`special_lab_id`),
  KEY `fk_3` (`claimed_for_faculty_id`),
  KEY `fk_4` (`claimed_for_department_id`),
  KEY `fk_5` (`approval_type_id`),
  KEY `fk_6` (`mou_id`),
  KEY `fk_7` (`interaction_mode_id`),
  KEY `fk_8` (`purpose_id`),
  KEY `fk_9` (`apex_proof_id`),
  KEY `fk_10` (`geotag_photos_id`),
  KEY `fk_11` (`irp_form_signed_id`),
  KEY `fk_12` (`consolidated_doc_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`),
  CONSTRAINT `fk_3` FOREIGN KEY (`claimed_for_faculty_id`) REFERENCES `faculty` (`id`),
  CONSTRAINT `fk_4` FOREIGN KEY (`claimed_for_department_id`) REFERENCES `departments` (`id`),
  CONSTRAINT `fk_5` FOREIGN KEY (`approval_type_id`) REFERENCES `ref_approval_type` (`id`),
  CONSTRAINT `fk_6` FOREIGN KEY (`mou_id`) REFERENCES `mou` (`id`),
  CONSTRAINT `fk_7` FOREIGN KEY (`interaction_mode_id`) REFERENCES `ref_irp_interaction_mode` (`id`),
  CONSTRAINT `fk_8` FOREIGN KEY (`purpose_id`) REFERENCES `ref_irp_purpose` (`id`),
  CONSTRAINT `fk_9` FOREIGN KEY (`apex_proof_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_10` FOREIGN KEY (`geotag_photos_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_11` FOREIGN KEY (`irp_form_signed_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_12` FOREIGN KEY (`consolidated_doc_id`) REFERENCES `documents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `irp_visit_faculty`
--

DROP TABLE IF EXISTS `irp_visit_faculty`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `irp_visit_faculty` (
  `id` int NOT NULL AUTO_INCREMENT,
  `irp_visit_id` int NOT NULL,
  `faculty_id` varchar(50) NOT NULL,
  `order_no` smallint NOT NULL COMMENT '1 to 6',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `irp_visit_faculty_index_3` (`irp_visit_id`,`faculty_id`),
  KEY `fk_2` (`faculty_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`irp_visit_id`) REFERENCES `irp_visit` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `irp_visit_industry`
--

DROP TABLE IF EXISTS `irp_visit_industry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `irp_visit_industry` (
  `id` int NOT NULL AUTO_INCREMENT,
  `irp_visit_id` int NOT NULL,
  `industry_order` smallint NOT NULL COMMENT '1 to 6',
  `industry_name` varchar(300) DEFAULT NULL,
  `industry_type` varchar(100) DEFAULT NULL,
  `industry_location` varchar(300) DEFAULT NULL,
  `industry_website` varchar(500) DEFAULT NULL,
  `contact_person_name` varchar(200) DEFAULT NULL,
  `contact_designation` varchar(200) DEFAULT NULL,
  `contact_no` varchar(20) DEFAULT NULL,
  `contact_email` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_1` (`irp_visit_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`irp_visit_id`) REFERENCES `irp_visit` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `journal_publications`
--

DROP TABLE IF EXISTS `journal_publications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `journal_publications` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `year_of_study` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `special_lab_id` int NOT NULL,
  `paper_title` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `authors_names` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_authors` tinyint unsigned NOT NULL,
  `student_author_count` tinyint unsigned NOT NULL DEFAULT '0',
  `faculty_author_count` tinyint unsigned NOT NULL DEFAULT '0',
  `student_author_names` json DEFAULT NULL,
  `faculty_author_names` json DEFAULT NULL,
  `date_of_publication` date NOT NULL,
  `volume_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `issue_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `issn_number` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `doi_number` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `page_from` smallint unsigned NOT NULL,
  `page_to` smallint unsigned NOT NULL,
  `journal_name` varchar(300) COLLATE utf8mb4_unicode_ci NOT NULL,
  `publisher_name` varchar(300) COLLATE utf8mb4_unicode_ci NOT NULL,
  `web_url` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_author_position` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `labs_involved` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `paper_indexed` enum('Yes','No') COLLATE utf8mb4_unicode_ci NOT NULL,
  `indexed_details` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `indexed_other_details` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `impact_factor` enum('Yes','No') COLLATE utf8mb4_unicode_ci NOT NULL,
  `impact_factor_value` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `project_outcome` enum('Yes','No') COLLATE utf8mb4_unicode_ci NOT NULL,
  `sdg_goals` tinyint unsigned NOT NULL,
  `sponsorship_type` enum('Self','Institute','Others') COLLATE utf8mb4_unicode_ci NOT NULL,
  `sponsorship_amount` decimal(12,2) DEFAULT NULL,
  `sponsorship_other_specify` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `interdisciplinary` tinyint(1) NOT NULL DEFAULT '0',
  `interdisciplinary_dept_id` int DEFAULT NULL,
  `other_dept_student_count` smallint unsigned DEFAULT NULL,
  `iqac_status` enum('Initiated','Verified','Rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Initiated',
  `abstract_proof_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_document_proof_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_cert_proof_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `attested_cert_proof_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `idx_student` (`student_id`),
  KEY `idx_lab` (`special_lab_id`),
  KEY `idx_iqac` (`iqac_status`),
  KEY `idx_published` (`date_of_publication`),
  KEY `fk_jp_dept` (`interdisciplinary_dept_id`),
  CONSTRAINT `fk_jp_student` FOREIGN KEY (`student_id`) REFERENCES `dummy_students` (`id`),
  CONSTRAINT `fk_jp_lab` FOREIGN KEY (`special_lab_id`) REFERENCES `special_labs` (`id`),
  CONSTRAINT `fk_jp_dept` FOREIGN KEY (`interdisciplinary_dept_id`) REFERENCES `departments` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=30001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `journal_publications_applied`
--

DROP TABLE IF EXISTS `journal_publications_applied`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `journal_publications_applied` (
  `publication_id` int NOT NULL AUTO_INCREMENT,
  `faculty_name` varchar(255) NOT NULL,
  `indexing_type` enum('SCOPUS','SCI/SCIE/WOS','UGC CARE','OTHERS') NOT NULL,
  `indexing_others_specify` varchar(255) DEFAULT NULL,
  `journal_name` varchar(255) NOT NULL,
  `submitted_journal_title` text NOT NULL,
  `submitted_date` date NOT NULL,
  `proof_document_path` varchar(512) NOT NULL,
  `publication_status` enum('Submitted','Under Review','Accepted for Publication','Rejected for Publication') DEFAULT 'Submitted',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`publication_id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lab_developed_by_industry`
--

DROP TABLE IF EXISTS `lab_developed_by_industry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_developed_by_industry` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `sig_number` varchar(50) DEFAULT NULL,
  `lab_name` varchar(300) DEFAULT NULL,
  `collaborative_industry` varchar(300) DEFAULT NULL,
  `domain_area` varchar(300) DEFAULT NULL,
  `lab_area_sq_m` decimal(10,2) DEFAULT NULL,
  `total_amount_inrs` decimal(14,2) DEFAULT NULL,
  `bit_contribution_inrs` decimal(14,2) DEFAULT NULL,
  `industry_financial_support_inrs` decimal(14,2) DEFAULT NULL,
  `any_equipment_sponsored` tinyint(1) DEFAULT NULL,
  `sponsored_equipment_names` text DEFAULT NULL,
  `any_equipment_enhancement` tinyint(1) DEFAULT NULL,
  `enhanced_equipment_names` text DEFAULT NULL,
  `layout_design_type_id` int DEFAULT NULL,
  `curriculum_mapping` text DEFAULT NULL COMMENT 'Course code and name for newly set laboratories',
  `expected_outcomes` text DEFAULT NULL,
  `proof_id` int DEFAULT NULL COMMENT 'Bills & Invoices, Sample Training/Equipment Sponsored, Photographs, Approval Letter',
  `iqac_verification` varchar(50) DEFAULT 'initiated' COMMENT 'initiated | approved | rejected',
  `iqac_remarks` text DEFAULT NULL COMMENT 'Remarks/reason for rejection from IQAC',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `submission_id` (`submission_id`),
  KEY `fk_2` (`layout_design_type_id`),
  KEY `fk_3` (`proof_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`layout_design_type_id`) REFERENCES `ref_lab_layout_type` (`id`),
  CONSTRAINT `fk_3` FOREIGN KEY (`proof_id`) REFERENCES `documents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mou`
--

DROP TABLE IF EXISTS `mou`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mou` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `sig_number` varchar(50) DEFAULT NULL,
  `special_labs_involved` tinyint(1) DEFAULT '0',
  `special_lab_id` int DEFAULT NULL,
  `claiming_department_id` int DEFAULT NULL,
  `mou_type_id` int DEFAULT NULL,
  `industry_org_type_id` int DEFAULT NULL,
  `if_org_type_others` varchar(200) DEFAULT NULL,
  `mou_based_on_id` int DEFAULT NULL,
  `domain_area` varchar(300) DEFAULT NULL,
  `date_of_agreement` date DEFAULT NULL,
  `legal_name_collaborator` varchar(300) DEFAULT NULL,
  `industry_location` varchar(300) DEFAULT NULL,
  `industry_address` text DEFAULT NULL,
  `industry_website` varchar(500) DEFAULT NULL,
  `industry_contact_mobile` varchar(20) DEFAULT NULL,
  `industry_email` varchar(200) DEFAULT NULL,
  `duration_unit_id` int DEFAULT NULL,
  `num_years` int DEFAULT NULL,
  `num_months` int DEFAULT NULL,
  `mou_effect_from` date DEFAULT NULL,
  `mou_effect_till` date DEFAULT NULL,
  `scope_of_agreement` text DEFAULT NULL,
  `objectives_and_goals` text DEFAULT NULL,
  `boundaries_and_limitations` text DEFAULT NULL,
  `bit_roles_responsibilities` text DEFAULT NULL,
  `collaborator_roles` text DEFAULT NULL,
  `spoc_name` varchar(200) DEFAULT NULL,
  `spoc_designation` varchar(200) DEFAULT NULL,
  `spoc_email` varchar(200) DEFAULT NULL,
  `spoc_phone` varchar(20) DEFAULT NULL,
  `mou_signing_initiated_by` varchar(200) DEFAULT NULL,
  `num_faculty` smallint DEFAULT NULL COMMENT '1 | 2 | 3',
  `apex_proof_id` int DEFAULT NULL COMMENT 'Upload the Apex Proof',
  `email_comm_letter_proof_id` int DEFAULT NULL COMMENT 'Upload Email Communication / Letter Proof',
  `signed_mou_doc_id` int DEFAULT NULL COMMENT 'Upload Signed MoU Document',
  `parties_rights_doc_id` int DEFAULT NULL COMMENT 'Upload Papers showing Party Rights',
  `notarized_affidavit_id` int DEFAULT NULL COMMENT 'Upload Notarized Affidavit(s) of Nondisclosure',
  `geotag_photos_id` int DEFAULT NULL COMMENT 'Upload Geotag Photos',
  `consolidated_doc_id` int DEFAULT NULL COMMENT 'Upload All Documents as Single File',
  `iqac_verification` varchar(50) DEFAULT 'initiated' COMMENT 'initiated | approved | rejected',
  `iqac_remarks` text DEFAULT NULL COMMENT 'Remarks/reason for rejection from IQAC',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `submission_id` (`submission_id`),
  KEY `fk_2` (`special_lab_id`),
  KEY `fk_3` (`claiming_department_id`),
  KEY `fk_4` (`mou_type_id`),
  KEY `fk_5` (`industry_org_type_id`),
  KEY `fk_6` (`mou_based_on_id`),
  KEY `fk_7` (`duration_unit_id`),
  KEY `fk_8` (`apex_proof_id`),
  KEY `fk_9` (`email_comm_letter_proof_id`),
  KEY `fk_10` (`signed_mou_doc_id`),
  KEY `fk_11` (`parties_rights_doc_id`),
  KEY `fk_12` (`notarized_affidavit_id`),
  KEY `fk_13` (`geotag_photos_id`),
  KEY `fk_14` (`consolidated_doc_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`),
  CONSTRAINT `fk_3` FOREIGN KEY (`claiming_department_id`) REFERENCES `departments` (`id`),
  CONSTRAINT `fk_4` FOREIGN KEY (`mou_type_id`) REFERENCES `ref_mou_type` (`id`),
  CONSTRAINT `fk_5` FOREIGN KEY (`industry_org_type_id`) REFERENCES `ref_industry_org_type` (`id`),
  CONSTRAINT `fk_6` FOREIGN KEY (`mou_based_on_id`) REFERENCES `ref_mou_based_on` (`id`),
  CONSTRAINT `fk_7` FOREIGN KEY (`duration_unit_id`) REFERENCES `ref_mou_duration_unit` (`id`),
  CONSTRAINT `fk_8` FOREIGN KEY (`apex_proof_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_9` FOREIGN KEY (`email_comm_letter_proof_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_10` FOREIGN KEY (`signed_mou_doc_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_11` FOREIGN KEY (`parties_rights_doc_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_12` FOREIGN KEY (`notarized_affidavit_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_13` FOREIGN KEY (`geotag_photos_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_14` FOREIGN KEY (`consolidated_doc_id`) REFERENCES `documents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mou_faculty`
--

DROP TABLE IF EXISTS `mou_faculty`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mou_faculty` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mou_id` int NOT NULL,
  `faculty_id` varchar(50) NOT NULL,
  `order_no` smallint NOT NULL COMMENT '1 | 2 | 3',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `mou_faculty_index_2` (`mou_id`,`faculty_id`),
  KEY `fk_2` (`faculty_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`mou_id`) REFERENCES `mou` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `mou_purpose`
--

DROP TABLE IF EXISTS `mou_purpose`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mou_purpose` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mou_id` int NOT NULL,
  `purpose_id` int NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `mou_purpose_index_1` (`mou_id`,`purpose_id`),
  KEY `fk_2` (`purpose_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`mou_id`) REFERENCES `mou` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`purpose_id`) REFERENCES `ref_mou_purpose` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `newsletter_archive`
--

DROP TABLE IF EXISTS `newsletter_archive`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `newsletter_archive` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `newsletter_category_id` int DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  `academic_year` varchar(20) DEFAULT NULL,
  `date_of_publication` date DEFAULT NULL,
  `volume_number` int DEFAULT NULL,
  `issue_number` int DEFAULT NULL,
  `issue_month` varchar(20) DEFAULT NULL,
  `num_faculty_editors` int DEFAULT NULL,
  `num_student_editors` int DEFAULT NULL,
  `proof_document_id` int DEFAULT NULL COMMENT 'Upload the Document',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `submission_id` (`submission_id`),
  KEY `fk_2` (`newsletter_category_id`),
  KEY `fk_3` (`department_id`),
  KEY `fk_4` (`proof_document_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`newsletter_category_id`) REFERENCES `ref_newsletter_category` (`id`),
  CONSTRAINT `fk_3` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`),
  CONSTRAINT `fk_4` FOREIGN KEY (`proof_document_id`) REFERENCES `documents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `notable_achievements`
--

DROP TABLE IF EXISTS `notable_achievements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notable_achievements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `special_labs_involved` tinyint(1) DEFAULT '0' COMMENT 'Yes | No',
  `special_lab_id` int DEFAULT NULL COMMENT 'Required if special_labs_involved = true',
  `is_technical_society` tinyint(1) DEFAULT NULL,
  `technical_society_id` int DEFAULT NULL,
  `type_of_recognition` varchar(20) DEFAULT NULL COMMENT 'Award | Achievement',
  `award_type` varchar(100) DEFAULT NULL,
  `achievement_type` varchar(100) DEFAULT NULL,
  `award_achievement_name` varchar(300) DEFAULT NULL,
  `organization_type` varchar(20) DEFAULT NULL COMMENT 'Government | Private | Others',
  `others_organization_name` varchar(300) DEFAULT NULL,
  `org_name` varchar(300) DEFAULT NULL,
  `awarding_body` varchar(100) DEFAULT NULL,
  `level_id` int DEFAULT NULL,
  `received_date` date DEFAULT NULL,
  `nature_of_recognition` varchar(60) DEFAULT NULL COMMENT 'Cash Prize | Certificate | Momento',
  `prize_amount_inrs` decimal(12,2) DEFAULT NULL,
  `photo_proof_id` int DEFAULT NULL COMMENT 'Photo Proofs',
  `document_proof_id` int DEFAULT NULL COMMENT 'Document Proof',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `submission_id` (`submission_id`),
  KEY `fk_2` (`special_lab_id`),
  KEY `fk_3` (`technical_society_id`),
  KEY `fk_4` (`level_id`),
  KEY `fk_5` (`photo_proof_id`),
  KEY `fk_6` (`document_proof_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`),
  CONSTRAINT `fk_3` FOREIGN KEY (`technical_society_id`) REFERENCES `ref_technical_society` (`id`),
  CONSTRAINT `fk_4` FOREIGN KEY (`level_id`) REFERENCES `ref_event_level` (`id`),
  CONSTRAINT `fk_5` FOREIGN KEY (`photo_proof_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_6` FOREIGN KEY (`document_proof_id`) REFERENCES `documents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `online_course`
--

DROP TABLE IF EXISTS `online_course`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `online_course` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `special_labs_involved` tinyint(1) DEFAULT '0' COMMENT 'Yes | No',
  `special_lab_id` int DEFAULT NULL COMMENT 'Required if special_labs_involved = true',
  `mode_of_course` varchar(20) DEFAULT NULL COMMENT 'Online | Offline | Hybrid',
  `course_type_id` int DEFAULT NULL,
  `type_of_organizer` varchar(20) DEFAULT NULL COMMENT 'Private | Government',
  `course_name` varchar(300) DEFAULT NULL,
  `organization_name` varchar(300) DEFAULT NULL,
  `organization_address` text DEFAULT NULL,
  `level_of_event_id` int DEFAULT NULL,
  `duration_unit` varchar(10) DEFAULT NULL COMMENT 'Hours | Weeks | Days',
  `num_hours` int DEFAULT NULL,
  `num_weeks` int DEFAULT NULL,
  `num_days` int DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `course_category` varchar(60) DEFAULT NULL COMMENT 'Proctored-Exam | Self-paced with final assessment | Self-paced without final assessment',
  `exam_date` date DEFAULT NULL,
  `grade_obtained` varchar(20) DEFAULT NULL,
  `is_approved_fdp` tinyint(1) DEFAULT NULL,
  `sponsorship_type_id` int DEFAULT NULL,
  `funding_agency_name` varchar(300) DEFAULT NULL,
  `claimed_for` varchar(30) DEFAULT NULL COMMENT 'FAP | Competency | Not-Applicable',
  `marksheet_proof_id` int DEFAULT NULL COMMENT 'Upload Mark Sheet Proof',
  `fdp_proof_id` int DEFAULT NULL COMMENT 'Upload FDP Proof',
  `apex_proof_id` int DEFAULT NULL COMMENT 'Apex Proof',
  `certificate_proof_id` int DEFAULT NULL COMMENT 'Upload Certificate Proof',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `submission_id` (`submission_id`),
  KEY `fk_2` (`special_lab_id`),
  KEY `fk_3` (`course_type_id`),
  KEY `fk_4` (`level_of_event_id`),
  KEY `fk_5` (`sponsorship_type_id`),
  KEY `fk_6` (`marksheet_proof_id`),
  KEY `fk_7` (`fdp_proof_id`),
  KEY `fk_8` (`apex_proof_id`),
  KEY `fk_9` (`certificate_proof_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`),
  CONSTRAINT `fk_3` FOREIGN KEY (`course_type_id`) REFERENCES `ref_course_type` (`id`),
  CONSTRAINT `fk_4` FOREIGN KEY (`level_of_event_id`) REFERENCES `ref_event_level` (`id`),
  CONSTRAINT `fk_5` FOREIGN KEY (`sponsorship_type_id`) REFERENCES `ref_sponsorship_type` (`id`),
  CONSTRAINT `fk_6` FOREIGN KEY (`marksheet_proof_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_7` FOREIGN KEY (`fdp_proof_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_8` FOREIGN KEY (`apex_proof_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_9` FOREIGN KEY (`certificate_proof_id`) REFERENCES `documents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `online_courses`
--

DROP TABLE IF EXISTS `online_courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `online_courses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_name` varchar(255) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `paper_presentation`
--

DROP TABLE IF EXISTS `paper_presentation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `paper_presentation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `special_labs_involved` tinyint(1) DEFAULT '0' COMMENT 'Yes | No',
  `special_lab_id` int DEFAULT NULL COMMENT 'Required if special_labs_involved = true',
  `has_intl_institute_collab` tinyint(1) DEFAULT NULL,
  `institute_name` varchar(300) DEFAULT NULL,
  `conference_name` varchar(300) DEFAULT NULL,
  `event_mode_id` int DEFAULT NULL,
  `event_location` varchar(300) DEFAULT NULL,
  `organizer_type_id` int DEFAULT NULL,
  `organizer_name` varchar(300) DEFAULT NULL,
  `event_level_id` int DEFAULT NULL,
  `paper_title` varchar(500) DEFAULT NULL,
  `event_start_date` date DEFAULT NULL,
  `event_end_date` date DEFAULT NULL,
  `event_duration_days` int DEFAULT NULL,
  `published_in_proceedings` tinyint(1) DEFAULT NULL,
  `page_from` int DEFAULT NULL,
  `page_to` int DEFAULT NULL,
  `sponsorship_type_id` int DEFAULT NULL,
  `funding_agency_name` varchar(300) DEFAULT NULL,
  `amount_inrs` decimal(12,2) DEFAULT NULL,
  `registration_amount_inrs` decimal(12,2) DEFAULT NULL,
  `award_received` tinyint(1) DEFAULT NULL,
  `apex_proof_id` int DEFAULT NULL COMMENT 'Apex Proof',
  `document_proof_id` int DEFAULT NULL COMMENT 'Certificate & Proceeding page',
  `award_proof_id` int DEFAULT NULL COMMENT 'Award Proof',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `submission_id` (`submission_id`),
  KEY `fk_2` (`special_lab_id`),
  KEY `fk_3` (`event_mode_id`),
  KEY `fk_4` (`organizer_type_id`),
  KEY `fk_5` (`event_level_id`),
  KEY `fk_6` (`sponsorship_type_id`),
  KEY `fk_7` (`apex_proof_id`),
  KEY `fk_8` (`document_proof_id`),
  KEY `fk_9` (`award_proof_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`),
  CONSTRAINT `fk_3` FOREIGN KEY (`event_mode_id`) REFERENCES `ref_event_mode` (`id`),
  CONSTRAINT `fk_4` FOREIGN KEY (`organizer_type_id`) REFERENCES `ref_organizer_type` (`id`),
  CONSTRAINT `fk_5` FOREIGN KEY (`event_level_id`) REFERENCES `ref_event_level` (`id`),
  CONSTRAINT `fk_6` FOREIGN KEY (`sponsorship_type_id`) REFERENCES `ref_sponsorship_type` (`id`),
  CONSTRAINT `fk_7` FOREIGN KEY (`apex_proof_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_8` FOREIGN KEY (`document_proof_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_9` FOREIGN KEY (`award_proof_id`) REFERENCES `documents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `paper_presentation_ext_faculty`
--

DROP TABLE IF EXISTS `paper_presentation_ext_faculty`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `paper_presentation_ext_faculty` (
  `id` int NOT NULL AUTO_INCREMENT,
  `paper_presentation_id` int NOT NULL,
  `faculty_name` varchar(300) DEFAULT NULL,
  `institution` varchar(300) DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_1` (`paper_presentation_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`paper_presentation_id`) REFERENCES `paper_presentation` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `paper_presentation_faculty`
--

DROP TABLE IF EXISTS `paper_presentation_faculty`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `paper_presentation_faculty` (
  `id` int NOT NULL AUTO_INCREMENT,
  `paper_presentation_id` int NOT NULL,
  `faculty_id` varchar(50) NOT NULL,
  `author_order` smallint DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_1` (`paper_presentation_id`),
  KEY `fk_2` (`faculty_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`paper_presentation_id`) REFERENCES `paper_presentation` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `paper_presentation_industry`
--

DROP TABLE IF EXISTS `paper_presentation_industry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `paper_presentation_industry` (
  `id` int NOT NULL AUTO_INCREMENT,
  `paper_presentation_id` int NOT NULL,
  `person_name` varchar(300) DEFAULT NULL,
  `industry_name` varchar(300) DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_1` (`paper_presentation_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`paper_presentation_id`) REFERENCES `paper_presentation` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `paper_presentation_student`
--

DROP TABLE IF EXISTS `paper_presentation_student`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `paper_presentation_student` (
  `id` int NOT NULL AUTO_INCREMENT,
  `paper_presentation_id` int NOT NULL,
  `student_name` varchar(200) DEFAULT NULL,
  `year_of_study` varchar(10) DEFAULT NULL COMMENT 'First | Second | Third | Fourth',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_1` (`paper_presentation_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`paper_presentation_id`) REFERENCES `paper_presentation` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `patent_report`
--

DROP TABLE IF EXISTS `patent_report`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patent_report` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `patent_status` enum('filed','published','granted') NOT NULL,
  `position_of_student` int DEFAULT NULL,
  `is_academic_project` tinyint(1) DEFAULT '0',
  `faculty_id_1` varchar(50) DEFAULT NULL,
  `faculty_id_2` varchar(50) DEFAULT NULL,
  `faculty_id_3` varchar(50) DEFAULT NULL,
  `faculty_id_4` varchar(50) DEFAULT NULL,
  `registration_date` date DEFAULT NULL,
  `application_number` varchar(100) DEFAULT NULL,
  `sdg_goals_id` int DEFAULT NULL,
  `patent_tracker_id` int DEFAULT NULL,
  `level` enum('national','international') NOT NULL,
  `is_early_publication_filed` tinyint(1) DEFAULT NULL,
  `is_examination_filed` tinyint(1) DEFAULT NULL,
  `patent_license_details` text DEFAULT NULL,
  `funding_agency` varchar(255) DEFAULT NULL,
  `funds_received` tinyint(1) DEFAULT NULL,
  `fund_amount` decimal(12,2) DEFAULT NULL,
  `is_interdisciplinary` tinyint(1) DEFAULT NULL,
  `other_dept_name` varchar(100) DEFAULT NULL,
  `other_dept_student_count` int DEFAULT NULL,
  `approve_filed_by_bit_id_publication` int DEFAULT NULL,
  `approve_filed_by_bit_id_granted` int DEFAULT NULL,
  `yukti_proof_url` text DEFAULT NULL,
  `full_document_proof_url` text DEFAULT NULL,
  `cbr_receipt_url` text DEFAULT NULL,
  `publication_proof_url` text DEFAULT NULL,
  `granted_proof_url` text DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_student` (`student_id`),
  KEY `fk_faculty_1` (`faculty_id_1`),
  KEY `fk_faculty_2` (`faculty_id_2`),
  KEY `fk_faculty_3` (`faculty_id_3`),
  KEY `fk_faculty_4` (`faculty_id_4`),
  KEY `fk_sdg_goals` (`sdg_goals_id`),
  UNIQUE KEY `id` (`id`),
  CONSTRAINT `fk_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `fk_faculty_1` FOREIGN KEY (`faculty_id_1`) REFERENCES `faculty` (`id`),
  CONSTRAINT `fk_faculty_2` FOREIGN KEY (`faculty_id_2`) REFERENCES `faculty` (`id`),
  CONSTRAINT `fk_faculty_3` FOREIGN KEY (`faculty_id_3`) REFERENCES `faculty` (`id`),
  CONSTRAINT `fk_faculty_4` FOREIGN KEY (`faculty_id_4`) REFERENCES `faculty` (`id`),
  CONSTRAINT `fk_sdg_goals` FOREIGN KEY (`sdg_goals_id`) REFERENCES `sdg_goals` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `patent_tracker`
--

DROP TABLE IF EXISTS `patent_tracker`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patent_tracker` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tracker_number` bigint unsigned DEFAULT NULL,
  `student_id` int NOT NULL,
  `patent_contribution` enum('Applicant','Inventor') NOT NULL,
  `second_student_id` int DEFAULT NULL,
  `third_student_id` int DEFAULT NULL,
  `fourth_student_id` int DEFAULT NULL,
  `fifth_student_id` int DEFAULT NULL,
  `sixth_student_id` int DEFAULT NULL,
  `seventh_student_id` int DEFAULT NULL,
  `eighth_student_id` int DEFAULT NULL,
  `ninth_student_id` int DEFAULT NULL,
  `tenth_student_id` int DEFAULT NULL,
  `patent_title` varchar(255) NOT NULL,
  `applicants_involved` enum('BIT students only','BIT student along with faculty','BIT student along with external institutions') NOT NULL,
  `faculty_id` varchar(50) DEFAULT NULL,
  `patent_type` enum('Product/Process','Design') NOT NULL,
  `has_image_layout_support` enum('Yes','No') DEFAULT 'No',
  `experimentation_file_path` varchar(512) DEFAULT NULL,
  `has_formatted_drawings` enum('Yes','No') DEFAULT 'No',
  `drawings_file_path` varchar(512) DEFAULT NULL,
  `forms_1_and_2_prepared` enum('Yes','No') DEFAULT 'No',
  `forms_file_path` varchar(512) DEFAULT NULL,
  `iqac_verification` enum('Initiated','Approved','Declined') DEFAULT 'Initiated',
  `reject_reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_student_main` (`student_id`),
  KEY `fk_student_2` (`second_student_id`),
  KEY `fk_student_3` (`third_student_id`),
  KEY `fk_student_4` (`fourth_student_id`),
  KEY `fk_student_5` (`fifth_student_id`),
  KEY `fk_student_6` (`sixth_student_id`),
  KEY `fk_student_7` (`seventh_student_id`),
  KEY `fk_student_8` (`eighth_student_id`),
  KEY `fk_student_9` (`ninth_student_id`),
  KEY `fk_student_10` (`tenth_student_id`),
  KEY `fk_faculty` (`faculty_id`),
  CONSTRAINT `fk_student_main` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `fk_student_2` FOREIGN KEY (`second_student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `fk_student_3` FOREIGN KEY (`third_student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `fk_student_4` FOREIGN KEY (`fourth_student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `fk_student_5` FOREIGN KEY (`fifth_student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `fk_student_6` FOREIGN KEY (`sixth_student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `fk_student_7` FOREIGN KEY (`seventh_student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `fk_student_8` FOREIGN KEY (`eighth_student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `fk_student_9` FOREIGN KEY (`ninth_student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `fk_student_10` FOREIGN KEY (`tenth_student_id`) REFERENCES `students` (`id`),
  CONSTRAINT `fk_faculty` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `patents_filed`
--

DROP TABLE IF EXISTS `patents_filed`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patents_filed` (
  `id` int NOT NULL AUTO_INCREMENT,
  `preliminary_data_id` int DEFAULT NULL,
  `claimed_by_faculty_id` varchar(50) NOT NULL,
  `claimed_by_faculty_name` varchar(255) NOT NULL,
  `patent_contribution_type` enum('applicant','inventor') NOT NULL,
  `task_id` varchar(100) NOT NULL,
  `yukti_registration_proof_path` varchar(255) DEFAULT NULL,
  `special_labs_involved` enum('yes','no') NOT NULL DEFAULT 'no',
  `special_lab_id` int DEFAULT NULL,
  `special_lab_name` varchar(255) DEFAULT NULL,
  `registration_date` date NOT NULL,
  `claimed_by_department_id` int NOT NULL,
  `claimed_by_department_name` varchar(255) NOT NULL,
  `filed_application_number` varchar(100) NOT NULL,
  `early_publication_form9_filed` enum('yes','no') NOT NULL DEFAULT 'no',
  `examination_form18_filed` enum('yes','no') NOT NULL DEFAULT 'no',
  `collaboration_type` enum('none','other-institute-india','industry','foreign-institute') NOT NULL DEFAULT 'none',
  `collaborating_organization_name` varchar(500) DEFAULT NULL,
  `bit_name_included_in_applicant` enum('yes','no') NOT NULL DEFAULT 'yes',
  `patent_level` enum('national','international') NOT NULL,
  `patent_licensed` enum('yes','no') NOT NULL DEFAULT 'no',
  `patent_license_details` longtext DEFAULT NULL,
  `fund_from_management` enum('yes','no') NOT NULL DEFAULT 'no',
  `fund_amount` decimal(10,2) DEFAULT NULL,
  `apex_proof_path` varchar(255) DEFAULT NULL,
  `sponsorship_from_agency` enum('yes','no') NOT NULL DEFAULT 'no',
  `funding_agency_name` varchar(500) DEFAULT NULL,
  `patent_cbr_receipt_path` varchar(255) DEFAULT NULL,
  `document_proof_path` varchar(255) DEFAULT NULL,
  `iqac_verification` enum('initiated','approved','rejected') NOT NULL DEFAULT 'initiated',
  `iqac_remarks` text DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `idx_preliminary_data_id` (`preliminary_data_id`),
  KEY `idx_claimed_by_faculty_id` (`claimed_by_faculty_id`),
  KEY `idx_claimed_by_department_id` (`claimed_by_department_id`),
  KEY `idx_iqac_verification` (`iqac_verification`),
  KEY `idx_registration_date` (`registration_date`),
  KEY `idx_created_at` (`created_at`),
  KEY `fk_special_lab` (`special_lab_id`),
  CONSTRAINT `fk_preliminary_data` FOREIGN KEY (`preliminary_data_id`) REFERENCES `patents_preliminary_data` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_department` FOREIGN KEY (`claimed_by_department_id`) REFERENCES `departments` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_special_lab` FOREIGN KEY (`special_lab_id`) REFERENCES `special_labs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `patents_filed_faculty_members`
--

DROP TABLE IF EXISTS `patents_filed_faculty_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patents_filed_faculty_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patent_filed_id` int NOT NULL,
  `faculty_member_number` int NOT NULL COMMENT '1-6',
  `faculty_id` varchar(50) NOT NULL,
  `faculty_name` varchar(255) NOT NULL,
  `patent_contribution` enum('applicant','inventor') NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `uk_patent_faculty_number` (`patent_filed_id`,`faculty_member_number`),
  KEY `idx_patent_filed_id` (`patent_filed_id`),
  KEY `idx_faculty_id` (`faculty_id`),
  CONSTRAINT `fk_patent_filed_faculty` FOREIGN KEY (`patent_filed_id`) REFERENCES `patents_filed` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `patents_filed_student_members`
--

DROP TABLE IF EXISTS `patents_filed_student_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patents_filed_student_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patent_filed_id` int NOT NULL,
  `student_member_number` int NOT NULL COMMENT '1-5',
  `student_name` varchar(255) NOT NULL,
  `patent_contribution` enum('applicant','inventor') NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `uk_patent_student_number` (`patent_filed_id`,`student_member_number`),
  KEY `idx_patent_filed_id` (`patent_filed_id`),
  CONSTRAINT `fk_patent_filed_student` FOREIGN KEY (`patent_filed_id`) REFERENCES `patents_filed` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `patents_granted`
--

DROP TABLE IF EXISTS `patents_granted`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patents_granted` (
  `id` int NOT NULL AUTO_INCREMENT,
  `apply_from` enum('patent-old','patent-new') NOT NULL,
  `claimed_by_faculty_id` varchar(50) NOT NULL,
  `claimed_by_faculty_name` varchar(255) NOT NULL,
  `task_id` varchar(100) NOT NULL,
  `date_of_grant` date NOT NULL,
  `granted_application_number` varchar(100) NOT NULL,
  `yukti_portal_registration_proof_path` varchar(255) DEFAULT NULL,
  `grant_receipt_proof_path` varchar(255) DEFAULT NULL,
  `grant_documents_path` varchar(255) DEFAULT NULL,
  `iqac_verification` enum('initiated','approved','rejected') NOT NULL DEFAULT 'initiated',
  `iqac_remarks` text DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `idx_apply_from` (`apply_from`),
  KEY `idx_claimed_by_faculty_id` (`claimed_by_faculty_id`),
  KEY `idx_iqac_verification` (`iqac_verification`),
  KEY `idx_date_of_grant` (`date_of_grant`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `patents_preliminary_data`
--

DROP TABLE IF EXISTS `patents_preliminary_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patents_preliminary_data` (
  `id` int NOT NULL AUTO_INCREMENT,
  `faculty_id` varchar(50) NOT NULL,
  `faculty_name` varchar(255) NOT NULL,
  `patent_title` varchar(500) NOT NULL,
  `applicant_type` enum('bit-faculty-only','bit-faculty-and-student','bit-faculty-external') NOT NULL,
  `patent_type` enum('product','process','design') NOT NULL,
  `supported_by_experimentation` enum('yes','no') NOT NULL DEFAULT 'no',
  `experimentation_proof_path` varchar(255) DEFAULT NULL,
  `prior_art` text DEFAULT NULL,
  `novelty` text DEFAULT NULL,
  `involve_drawings` enum('yes','no') NOT NULL DEFAULT 'no',
  `drawings_proof_path` varchar(255) DEFAULT NULL,
  `form_prepared` enum('yes','no') NOT NULL DEFAULT 'no',
  `form_proof_path` varchar(255) DEFAULT NULL,
  `iqac_verification` enum('initiated','approved','rejected') NOT NULL DEFAULT 'initiated',
  `iqac_remarks` text DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `idx_faculty_id` (`faculty_id`),
  KEY `idx_iqac_verification` (`iqac_verification`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=60001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `patents_published`
--

DROP TABLE IF EXISTS `patents_published`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patents_published` (
  `id` int NOT NULL AUTO_INCREMENT,
  `apply_from` enum('patent-old','patent-new') NOT NULL,
  `claimed_by_faculty_id` varchar(50) NOT NULL,
  `claimed_by_faculty_name` varchar(255) NOT NULL,
  `task_id` varchar(100) NOT NULL,
  `date_of_publish` date NOT NULL,
  `published_application_number` varchar(100) NOT NULL,
  `yukti_portal_registration_proof_path` varchar(255) DEFAULT NULL,
  `publication_journal_receipt_proof_path` varchar(255) DEFAULT NULL,
  `publication_documents_path` varchar(255) DEFAULT NULL,
  `iqac_verification` enum('initiated','approved','rejected') NOT NULL DEFAULT 'initiated',
  `iqac_remarks` text DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `idx_apply_from` (`apply_from`),
  KEY `idx_claimed_by_faculty_id` (`claimed_by_faculty_id`),
  KEY `idx_iqac_verification` (`iqac_verification`),
  KEY `idx_date_of_publish` (`date_of_publish`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=60001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `professional_body_membership`
--

DROP TABLE IF EXISTS `professional_body_membership`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `professional_body_membership` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `membership_category_id` int NOT NULL,
  `special_labs_involved` tinyint(1) DEFAULT '0',
  `special_lab_id` int DEFAULT NULL,
  `professional_body_name` varchar(300) DEFAULT NULL,
  `membership_type_id` int DEFAULT NULL,
  `membership_id` varchar(100) DEFAULT NULL,
  `grade_level_position` varchar(200) DEFAULT NULL,
  `level_id` int DEFAULT NULL,
  `validity_type_id` int DEFAULT NULL,
  `apex_document_id` int DEFAULT NULL COMMENT 'Apex Document Proof (if applicable)',
  `amount_self_bit_inrs` decimal(12,2) DEFAULT NULL COMMENT 'Amount for Self or BIT validity type',
  `if_validity_others` varchar(200) DEFAULT NULL,
  `amount_others_inrs` decimal(12,2) DEFAULT NULL COMMENT 'Amount when Validity Type = Others',
  `document_proof_id` int DEFAULT NULL COMMENT 'Certificate Proof & Apex Proof',
  `iqac_verification` varchar(50) DEFAULT 'initiated' COMMENT 'initiated | approved | rejected',
  `iqac_remarks` text DEFAULT NULL COMMENT 'Remarks/reason for rejection from IQAC',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `submission_id` (`submission_id`),
  KEY `fk_2` (`membership_category_id`),
  KEY `fk_3` (`special_lab_id`),
  KEY `fk_4` (`membership_type_id`),
  KEY `fk_5` (`level_id`),
  KEY `fk_6` (`validity_type_id`),
  KEY `fk_7` (`apex_document_id`),
  KEY `fk_8` (`document_proof_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`membership_category_id`) REFERENCES `ref_membership_category` (`id`),
  CONSTRAINT `fk_3` FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`),
  CONSTRAINT `fk_4` FOREIGN KEY (`membership_type_id`) REFERENCES `ref_membership_type` (`id`),
  CONSTRAINT `fk_5` FOREIGN KEY (`level_id`) REFERENCES `ref_membership_level` (`id`),
  CONSTRAINT `fk_6` FOREIGN KEY (`validity_type_id`) REFERENCES `ref_membership_validity_type` (`id`),
  CONSTRAINT `fk_7` FOREIGN KEY (`apex_document_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_8` FOREIGN KEY (`document_proof_id`) REFERENCES `documents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_approval_type`
--

DROP TABLE IF EXISTS `ref_approval_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_approval_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(20) NOT NULL COMMENT 'Apex | Non-Apex | Dean | Principal',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_approval_type_short`
--

DROP TABLE IF EXISTS `ref_approval_type_short`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_approval_type_short` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(20) NOT NULL COMMENT 'Apex | Principal | Dean',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_category_sharing`
--

DROP TABLE IF EXISTS `ref_category_sharing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_category_sharing` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(10) NOT NULL COMMENT '60:40 | 70:30',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_coe_type`
--

DROP TABLE IF EXISTS `ref_coe_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_coe_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(40) NOT NULL COMMENT 'Industry Sponsored Lab | Industry Supported Lab',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_consultancy_category`
--

DROP TABLE IF EXISTS `ref_consultancy_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_consultancy_category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(20) NOT NULL COMMENT 'Service Based | Product Based',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_consultancy_type`
--

DROP TABLE IF EXISTS `ref_consultancy_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_consultancy_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(20) NOT NULL COMMENT 'Industry | Institute',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_core_sector`
--

DROP TABLE IF EXISTS `ref_core_sector`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_core_sector` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(60) NOT NULL COMMENT 'Manufacturing | Consulting | Supply Chain Management | Healthcare | Technology | Non-Profit (Public Service) | Research | Start Ups | UG Student Project | PG Student Project',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_course_type`
--

DROP TABLE IF EXISTS `ref_course_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_course_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(80) NOT NULL COMMENT 'AICTE | CEC | CISCO | COURSERA | edX | GOOGLE | IBM | IGNOU | IIMB | INI | NITTTR | MICROSOFT | NMEICT | NPTEL | SWAYAM | ICMR | UDEMY | UGC | AICTE QIP PG certificate Programme | AI Infinity | Oracle | Other',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_doc_type`
--

DROP TABLE IF EXISTS `ref_doc_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_doc_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(60) NOT NULL COMMENT 'document_proof | apex_proof | certificate_proof | geotag_photos | syllabus | course_feedback | proceedings_proof | relevant_proof | marksheet_proof | fdp_proof | photo_proof | award_proof | sample_photographs',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_duration_unit`
--

DROP TABLE IF EXISTS `ref_duration_unit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_duration_unit` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(10) NOT NULL COMMENT 'Year | Month | Day',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_e_content_type`
--

DROP TABLE IF EXISTS `ref_e_content_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_e_content_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(80) NOT NULL COMMENT 'PERSONALIZED_SKILL (PS) | TUTORIAL | E-BOOK | VIDEO LECTURES | ACADEMIC BOOK | ASSESSMENT | ARTICLE | BLOG WRITING | COURSE BOARD GRAPHICS | DATABASE CREATION | E-LEARNING GAME | NPTEL TRANSLATION | PODCAST | SKILL-SCOURCE-BOOK | YOUTUBE-VIDEO | MAGAZINE | NEW METHODOLOGY IN TLP/ASSESSMENT | NEW COURSE IN CURICULLAM | Other',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_event_level`
--

DROP TABLE IF EXISTS `ref_event_level`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_event_level` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(60) NOT NULL COMMENT 'State | National | International | Institute (BIT)',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_event_mode`
--

DROP TABLE IF EXISTS `ref_event_mode`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_event_mode` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(20) NOT NULL COMMENT 'Online | Offline | Hybrid',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_event_type_attended`
--

DROP TABLE IF EXISTS `ref_event_type_attended`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_event_type_attended` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(120) NOT NULL COMMENT 'Certificate course | Conference attended-without presentation | Educational fair | Faculty exchange programme | FDP | Guest Lecture | Non-technical events | One credit course | Orientation programme | Seminar | Session chair | STTP | Summer School | Training | Value-Added course | Webinar | Winter School | Workshop | Hands-On Training | PS-Certification (BIT) | NPTEL-FDP | AICTE-UHV-FDP | Innovation Ambassador- IIC Certificate | CEE-ACO & BEI panelist workshop certificate | Other',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_event_type_organized`
--

DROP TABLE IF EXISTS `ref_event_type_organized`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_event_type_organized` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(120) NOT NULL COMMENT 'HRD Programs | Certificate course | Partial Delivery of Course | Competitions for BIT students | Conference | Faculty training Program | FDP/STTP | Guest Lecture | Hands on training | Leader of the Week | Non Technical Event | One credit course | Orientation program | Refresher Program | Seminar | Technical Events | Webinar | Workshop | Non-Teaching training programme | Others | Symposium | Interaction',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_external_examiner_purpose`
--

DROP TABLE IF EXISTS `ref_external_examiner_purpose`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_external_examiner_purpose` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(80) NOT NULL COMMENT 'Central Valuation | Flying Squad | Hall invigilator | Practical/Project viva External Examiner | Question Paper Scrutiny | QP Setter | University Representative',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_financial_assistance`
--

DROP TABLE IF EXISTS `ref_financial_assistance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_financial_assistance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(20) NOT NULL COMMENT 'Self | Management | NA',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_fund_type`
--

DROP TABLE IF EXISTS `ref_fund_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_fund_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(30) NOT NULL COMMENT 'Self | Management | Funding Agency',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_industry_org_type`
--

DROP TABLE IF EXISTS `ref_industry_org_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_industry_org_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(40) NOT NULL COMMENT 'MNC | Large Scale | MSME | Small Scale | Others',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_industry_project_type`
--

DROP TABLE IF EXISTS `ref_industry_project_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_industry_project_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(20) NOT NULL COMMENT 'Product | Process',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_iqac_status`
--

DROP TABLE IF EXISTS `ref_iqac_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_iqac_status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(20) NOT NULL COMMENT 'Initiated | Approved | Rejected',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_irp_interaction_mode`
--

DROP TABLE IF EXISTS `ref_irp_interaction_mode`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_irp_interaction_mode` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(60) NOT NULL COMMENT 'Email | Visit to Company Premises | Within BIT | Phone Call | Others',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_irp_points_discussed`
--

DROP TABLE IF EXISTS `ref_irp_points_discussed`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_irp_points_discussed` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(80) NOT NULL COMMENT 'Placement | Internship | One Credit Course | Student Project | Curriculum Feedback | Guest Lecture | Board of Studies | Workshop/Seminar | Faculty Training | Student Industrial Visit | Laboratory Enhancement | Skill Training | Industry Defined Problem | Joint Funding Proposals | Joint IPR Activity | Product Development | Teaching Materials | Sponsorship | Funding | Others',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_irp_purpose`
--

DROP TABLE IF EXISTS `ref_irp_purpose`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_irp_purpose` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(60) NOT NULL COMMENT 'Industry Interaction | Field Visit | Exhibition | IECC Planned Activity | Pskill',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_journal_indexing`
--

DROP TABLE IF EXISTS `ref_journal_indexing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_journal_indexing` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(20) NOT NULL COMMENT 'Scopus | Web of Science | SCI | Others',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_lab_layout_type`
--

DROP TABLE IF EXISTS `ref_lab_layout_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_lab_layout_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(20) NOT NULL COMMENT 'New Layout | Modified Layout',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_membership_category`
--

DROP TABLE IF EXISTS `ref_membership_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_membership_category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(30) NOT NULL COMMENT 'Institute Membership | Faculty Membership',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_membership_level`
--

DROP TABLE IF EXISTS `ref_membership_level`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_membership_level` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(20) NOT NULL COMMENT 'National | International',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_membership_type`
--

DROP TABLE IF EXISTS `ref_membership_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_membership_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(20) NOT NULL COMMENT 'Annual | Lifetime',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_membership_validity_type`
--

DROP TABLE IF EXISTS `ref_membership_validity_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_membership_validity_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(20) NOT NULL COMMENT 'Self | BIT | Others',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_mou_based_on`
--

DROP TABLE IF EXISTS `ref_mou_based_on`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_mou_based_on` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(20) NOT NULL COMMENT 'Industry | Institute',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_mou_duration_unit`
--

DROP TABLE IF EXISTS `ref_mou_duration_unit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_mou_duration_unit` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(10) NOT NULL COMMENT 'Years | Months',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_mou_purpose`
--

DROP TABLE IF EXISTS `ref_mou_purpose`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_mou_purpose` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(100) NOT NULL COMMENT 'Internship | Centre of Excellence | Faculty Training | World Skills Training | Certification Course | Placement Training | Collaborative Projects | Laboratory Enhancement | Consultancy | Sharing Facilities | Product Development | Publications | Funding | Patents | Organizing Events | Student Projects | One-Credit Course | Placement Offers | Syllabus Framing for Curriculum | Syllabus Framing for One Credit | Student Training | Others',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_mou_type`
--

DROP TABLE IF EXISTS `ref_mou_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_mou_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(30) NOT NULL COMMENT 'National | International',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_newsletter_category`
--

DROP TABLE IF EXISTS `ref_newsletter_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_newsletter_category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(40) NOT NULL COMMENT 'Department Newsletter | Institution Newsletter',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_organizer_type`
--

DROP TABLE IF EXISTS `ref_organizer_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_organizer_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(40) NOT NULL COMMENT 'BIT | Industry | Foreign Institute | Institute in India | Others',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_programme_level`
--

DROP TABLE IF EXISTS `ref_programme_level`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_programme_level` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(5) NOT NULL COMMENT 'UG | PG',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_recognition_type`
--

DROP TABLE IF EXISTS `ref_recognition_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_recognition_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(40) NOT NULL COMMENT 'Reviewer | Editorial Board Member | Editor in Chief | Advisory board Member | Others',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_resource_person_category`
--

DROP TABLE IF EXISTS `ref_resource_person_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_resource_person_category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(80) NOT NULL COMMENT 'BoS Member | Chief Guest | Conference Session Chair | DC member | Energy Audit | Examiner - Ph.D Viva voce | External Academic Audit | Internal Academic Audit | Jury member | Quality Expert | Technical Expert | Thesis Evaluator | Interaction | Panel-Member',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_scope_of_work`
--

DROP TABLE IF EXISTS `ref_scope_of_work`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_scope_of_work` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(80) NOT NULL COMMENT 'Testing Service using Instrument Facility | Product Development | Hardware Module Prototype Design | Software Testing | Software Design | Software Application Development | Self-Knowledge Transfer',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_sector_type`
--

DROP TABLE IF EXISTS `ref_sector_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_sector_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(20) NOT NULL COMMENT 'Private | Government',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_sponsorship_type`
--

DROP TABLE IF EXISTS `ref_sponsorship_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_sponsorship_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(30) NOT NULL COMMENT 'Self | BIT | Funding Agency | Others',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_technical_society`
--

DROP TABLE IF EXISTS `ref_technical_society`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_technical_society` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(100) NOT NULL COMMENT 'IEEE | CSI | IAENG | SAE | etc.',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_technical_society_status`
--

DROP TABLE IF EXISTS `ref_technical_society_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_technical_society_status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(15) NOT NULL COMMENT 'Active | Non-Active',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_training_event_type`
--

DROP TABLE IF EXISTS `ref_training_event_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_training_event_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(30) NOT NULL COMMENT 'Conference | Workshop | Industry Training | Seminar | Others',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_training_mode`
--

DROP TABLE IF EXISTS `ref_training_mode`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_training_mode` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(10) NOT NULL COMMENT 'Online | Offline',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_vip_category`
--

DROP TABLE IF EXISTS `ref_vip_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_vip_category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(10) NOT NULL COMMENT 'FAA | Events | R&D',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_vip_event_type`
--

DROP TABLE IF EXISTS `ref_vip_event_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_vip_event_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(60) NOT NULL COMMENT 'Workshop | Seminar | Conference | Symposium | Value Added Course | One Credit Course | Non-Technical Events | Technical Events | Special Programs | Leader of the Week | Guest Lecture | Placement Visit | FDP/SDP | Certificate Course | Other',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_visit_source`
--

DROP TABLE IF EXISTS `ref_visit_source`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_visit_source` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(20) NOT NULL COMMENT 'Self | Department | Special Lab | Institute',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ref_year_of_study`
--

DROP TABLE IF EXISTS `ref_year_of_study`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_year_of_study` (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(10) NOT NULL COMMENT 'First | Second | Third | Fourth',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `resource_person`
--

DROP TABLE IF EXISTS `resource_person`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resource_person` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `special_labs_involved` tinyint(1) DEFAULT '0' COMMENT 'Yes | No',
  `special_lab_id` int DEFAULT NULL COMMENT 'Required if special_labs_involved = true',
  `category_id` int DEFAULT NULL,
  `purpose_of_interaction` text DEFAULT NULL,
  `panel_name` varchar(200) DEFAULT NULL,
  `organization_type` varchar(20) DEFAULT NULL COMMENT 'Industry | Institute',
  `org_name_address` text DEFAULT NULL,
  `visiting_dept_industry` varchar(200) DEFAULT NULL,
  `visiting_dept_institute` varchar(200) DEFAULT NULL,
  `num_days` int DEFAULT NULL,
  `from_date` date DEFAULT NULL,
  `to_date` date DEFAULT NULL,
  `document_proof_id` int DEFAULT NULL COMMENT 'Document Proof (PDF - max 2KB)',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `submission_id` (`submission_id`),
  KEY `fk_2` (`special_lab_id`),
  KEY `fk_3` (`category_id`),
  KEY `fk_4` (`document_proof_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`),
  CONSTRAINT `fk_3` FOREIGN KEY (`category_id`) REFERENCES `ref_resource_person_category` (`id`),
  CONSTRAINT `fk_4` FOREIGN KEY (`document_proof_id`) REFERENCES `documents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `role_page_access`
--

DROP TABLE IF EXISTS `role_page_access`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_page_access` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_id` int NOT NULL,
  `page_id` int NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `role_page_access_index_0` (`role_id`,`page_id`),
  KEY `fk_2` (`page_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`page_id`) REFERENCES `app_pages` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=210001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=90002;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sdg`
--

DROP TABLE IF EXISTS `sdg`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sdg` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sdg_number` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `sdg_number` (`sdg_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sdg_goals`
--

DROP TABLE IF EXISTS `sdg_goals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sdg_goals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `goal_index` int NOT NULL,
  `goal_name` varchar(255) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `goal_index` (`goal_index`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30002;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `special_lab`
--

DROP TABLE IF EXISTS `special_lab`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `special_lab` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(20) NOT NULL COMMENT 'e.g. SL-001, AI-LAB, IOT-LAB',
  `name` varchar(200) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `special_labs`
--

DROP TABLE IF EXISTS `special_labs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `special_labs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `special_lab_code` varchar(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `special_lab_code` (`special_lab_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `student_non_technical`
--

DROP TABLE IF EXISTS `student_non_technical`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_non_technical` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `year_of_study` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_attended` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `club_id` int DEFAULT NULL,
  `club_events` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `other_event_specify` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `event_start_date` date NOT NULL,
  `event_end_date` date NOT NULL,
  `event_duration` int NOT NULL,
  `event_mode` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_location` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_organiser` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `organisation_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `organisation_location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `organisor_name_other` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `event_level` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `state` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `within_bit` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `home_department` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role_in_event` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_specify_organised` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role_specify_participated` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prize_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `prize_amount` int DEFAULT NULL,
  `social_activity_involved` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `social_activity_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `time_spent_hours` int NOT NULL,
  `interdisciplinary` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `interdisciplinary_dept` int DEFAULT NULL,
  `other_dept_student_count` int DEFAULT NULL,
  `certificate_proof_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `iqac_verification` enum('initiated','approved','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'initiated',
  `iqac_rejection_remarks` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `idx_student_id` (`student_id`),
  KEY `idx_status` (`status`),
  KEY `idx_iqac_verification` (`iqac_verification`),
  KEY `idx_event_level` (`event_level`),
  KEY `idx_created_at` (`created_at`),
  KEY `fk_student_non_technical_club` (`club_id`),
  KEY `fk_student_non_technical_dept` (`interdisciplinary_dept`),
  CONSTRAINT `fk_student_non_technical_club` FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_student_non_technical_dept` FOREIGN KEY (`interdisciplinary_dept`) REFERENCES `departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=60001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `student_online_courses`
--

DROP TABLE IF EXISTS `student_online_courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_online_courses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `year_of_study` varchar(10) NOT NULL,
  `special_lab_id` int DEFAULT NULL,
  `online_course_id` int DEFAULT NULL,
  `course_type` varchar(50) DEFAULT NULL,
  `marks_available` tinyint(1) DEFAULT NULL,
  `percentage_obtained` decimal(5,2) DEFAULT NULL,
  `credit_transfer` decimal(4,2) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `exam_date` date DEFAULT NULL,
  `duration_weeks` int DEFAULT NULL,
  `is_part_of_academic` tinyint(1) DEFAULT NULL,
  `semester` int DEFAULT NULL,
  `sponsorship_type` varchar(100) DEFAULT NULL,
  `sponsorship_amount` decimal(12,2) DEFAULT NULL,
  `sponsorship_specify` varchar(255) DEFAULT NULL,
  `interdisciplinary` tinyint(1) DEFAULT NULL,
  `department` varchar(50) DEFAULT NULL,
  `original_certificate_file` varchar(255) DEFAULT NULL,
  `attested_certificate_file` varchar(255) DEFAULT NULL,
  `certificate_url` text DEFAULT NULL,
  `iqac_status` varchar(50) DEFAULT 'Initiated',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_1` (`special_lab_id`),
  KEY `fk_2` (`online_course_id`),
  KEY `fk_student` (`student_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`special_lab_id`) REFERENCES `special_labs` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`online_course_id`) REFERENCES `online_courses` (`id`),
  CONSTRAINT `fk_student` FOREIGN KEY (`student_id`) REFERENCES `dummy_students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=60001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `student_paper_presentations`
--

DROP TABLE IF EXISTS `student_paper_presentations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_paper_presentations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Student registration number or ID',
  `student_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Student name (auto-populated from dropdown)',
  `student_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paper_title` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_start_date` date NOT NULL,
  `event_end_date` date NOT NULL,
  `is_academic_project_outcome` enum('yes','no') COLLATE utf8mb4_unicode_ci DEFAULT 'no' COMMENT 'Is this claiming as outcome of academic project?',
  `image_proof_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Photo/Geotag proof - Format: Reg.No-PPI-Date (e.g., 201CS111-PPI-08.06.2021)',
  `abstract_proof_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Abstract Document - Format: Reg.No-PPA-Date (e.g., 201CS111-PPA-08.06.2021)',
  `certificate_proof_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Original Certificate - Format: Reg.No-PRO-Date (e.g., 201CS111-PRO-08.06.2024)',
  `attested_certificate_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Attested Certificate - Format: Reg.No-PRX-Date (e.g., 201CS111-PRX-08.06.2024)',
  `status` enum('participated','winner') COLLATE utf8mb4_unicode_ci DEFAULT 'participated',
  `iqac_verification` enum('initiated','approved','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'initiated',
  `parental_department_id` int DEFAULT NULL COMMENT 'FK to departments table (to be populated from db)',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'User ID who created this record',
  `academic_project_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Academic project ID (S5-Mini Project-I, S6-Mini Project-II, etc.)',
  `sdg_goal` int DEFAULT NULL COMMENT 'FK to sdg table - SDG goal number (1-17)',
  `winner_place` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Winner place: I, II, or III',
  `prize_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Prize type: cash or momento',
  `winner_certificate_proof` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Winner certificate proof file path - Format: Reg.No-PPW-Date',
  `iqac_rejection_remarks` text COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Remarks when IQAC verification is rejected',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `idx_student_id` (`student_id`),
  KEY `idx_status` (`status`),
  KEY `idx_iqac_verification` (`iqac_verification`),
  KEY `idx_parental_department` (`parental_department_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_sdg_goal` (`sdg_goal`),
  KEY `idx_student_email` (`student_email`),
  CONSTRAINT `fk_sdg_goal` FOREIGN KEY (`sdg_goal`) REFERENCES `sdg` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=210001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `student_project_competitions`
--

DROP TABLE IF EXISTS `student_project_competitions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_project_competitions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Student registration number or ID',
  `student_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Student name (auto-populated from dropdown)',
  `competition_type` enum('national','international') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'National or International competition',
  `project_title` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_start_date` date NOT NULL,
  `event_end_date` date NOT NULL,
  `is_academic_project_outcome` enum('yes','no') COLLATE utf8mb4_unicode_ci DEFAULT 'no' COMMENT 'Is this claiming as outcome of academic project?',
  `academic_project_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sdg_goal` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_proof_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Photo/Geotag proof - Format: Reg.No-PCI-Date (e.g., 201CS111-PCI-08.06.2021)',
  `abstract_proof_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Abstract Document - Format: Reg.No-PCA-Date (e.g., 201CS111-PCA-08.06.2021)',
  `winner_certificate_proof_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Winner Certificate - Format: Reg.No-PCW-Date (e.g., 201CS111-PCW-08.06.2021)',
  `runner_certificate_proof_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Runner Certificate - Format: Reg.No-PCR-Date (e.g., 201CS111-PCR-08.06.2021)',
  `status` enum('participated','winner','runner') COLLATE utf8mb4_unicode_ci DEFAULT 'participated',
  `winner_place` enum('I','II','III') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Place if winner (I, II, or III)',
  `prize_type` enum('cash','momento') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Prize type if winner',
  `iqac_verification` enum('initiated','approved','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'initiated',
  `iqac_rejection_remarks` text COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Remarks if rejected',
  `parental_department_id` int DEFAULT NULL COMMENT 'FK to departments table (to be populated from db)',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'User ID who created this record',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `idx_student_id` (`student_id`),
  KEY `idx_status` (`status`),
  KEY `idx_competition_type` (`competition_type`),
  KEY `idx_iqac_verification` (`iqac_verification`),
  KEY `idx_parental_department` (`parental_department_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=60001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `student_technical_body_memberships`
--

DROP TABLE IF EXISTS `student_technical_body_memberships`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_technical_body_memberships` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Student registration number or ID',
  `student_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Student name (auto-populated from dropdown)',
  `year_of_study` enum('first','second','third','fourth') COLLATE utf8mb4_unicode_ci NOT NULL,
  `membership` enum('yes','no') COLLATE utf8mb4_unicode_ci DEFAULT 'no',
  `level_of_membership` enum('state','national','international') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Level of membership (if membership = yes)',
  `state_of_membership` enum('temporary','permanent') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'State of membership (if membership = yes)',
  `membership_number` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Membership number',
  `membership_society` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Name of membership society',
  `valid_from` date DEFAULT NULL,
  `valid_till` date DEFAULT NULL,
  `validity` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Validity period (e.g., date range or duration)',
  `charges_in_rupees` int DEFAULT NULL COMMENT 'Charges in rupees',
  `activities_conducted` enum('yes','no') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Activities conducted by technical society',
  `specify_activity` text COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Description of the activity conducted',
  `activity_status` enum('competition','participation') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Status of activity (if activities_conducted = yes)',
  `certificate_proof_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Path to certificate document proof',
  `iqac_verification` enum('initiated','approved','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'initiated',
  `iqac_rejection_remarks` text COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Remarks for completed status',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'User ID who created this record',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `idx_student_id` (`student_id`),
  KEY `idx_membership` (`membership`),
  KEY `idx_iqac_verification` (`iqac_verification`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_valid_from` (`valid_from`),
  KEY `idx_valid_till` (`valid_till`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=90001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_name` varchar(255) NOT NULL,
  `roll_no` varchar(100) NOT NULL,
  `enrollment_no` varchar(100) DEFAULT NULL,
  `college_email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `year_of_join` int DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `roll_no` (`roll_no`),
  UNIQUE KEY `enrollment_no` (`enrollment_no`),
  UNIQUE KEY `college_email` (`college_email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=60001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `students_industrial_visit`
--

DROP TABLE IF EXISTS `students_industrial_visit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students_industrial_visit` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `sig_number` varchar(50) DEFAULT NULL,
  `programme_level_id` int DEFAULT NULL,
  `industry_name` varchar(300) DEFAULT NULL,
  `domain_area` varchar(300) DEFAULT NULL,
  `industry_type_id` int DEFAULT NULL,
  `if_type_others` varchar(200) DEFAULT NULL,
  `industry_location` varchar(300) DEFAULT NULL,
  `industry_website` varchar(500) DEFAULT NULL,
  `contact_person_name` varchar(200) DEFAULT NULL,
  `contact_designation` varchar(200) DEFAULT NULL,
  `contact_email` varchar(200) DEFAULT NULL,
  `contact_phone` varchar(20) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `purpose_of_visit` text DEFAULT NULL,
  `num_students_visited` int DEFAULT NULL,
  `num_male_students` int DEFAULT NULL,
  `num_female_students` int DEFAULT NULL,
  `year_of_study_id` int DEFAULT NULL COMMENT 'First | Second | Third | Fourth',
  `source_of_arrangement_id` int DEFAULT NULL,
  `curriculum_mapping` text DEFAULT NULL,
  `outcome` text DEFAULT NULL,
  `proof_id` int DEFAULT NULL COMMENT 'IV Approval Letter, Institute Approval, IV Report with Photos, Student Feedback Samples, Payment Proofs',
  `iqac_verification` varchar(50) DEFAULT 'initiated' COMMENT 'initiated | approved | rejected',
  `iqac_remarks` text DEFAULT NULL COMMENT 'Remarks/reason for rejection from IQAC',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `submission_id` (`submission_id`),
  KEY `fk_2` (`programme_level_id`),
  KEY `fk_3` (`industry_type_id`),
  KEY `fk_4` (`year_of_study_id`),
  KEY `fk_5` (`source_of_arrangement_id`),
  KEY `fk_6` (`proof_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`programme_level_id`) REFERENCES `ref_programme_level` (`id`),
  CONSTRAINT `fk_3` FOREIGN KEY (`industry_type_id`) REFERENCES `ref_industry_org_type` (`id`),
  CONSTRAINT `fk_4` FOREIGN KEY (`year_of_study_id`) REFERENCES `ref_year_of_study` (`id`),
  CONSTRAINT `fk_5` FOREIGN KEY (`source_of_arrangement_id`) REFERENCES `ref_visit_source` (`id`),
  CONSTRAINT `fk_6` FOREIGN KEY (`proof_id`) REFERENCES `documents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `students_iv_faculty`
--

DROP TABLE IF EXISTS `students_iv_faculty`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students_iv_faculty` (
  `id` int NOT NULL AUTO_INCREMENT,
  `iv_id` int NOT NULL,
  `faculty_id` varchar(50) NOT NULL,
  `order_no` smallint NOT NULL COMMENT '1 to 3',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `students_iv_faculty_index_6` (`iv_id`,`faculty_id`),
  KEY `fk_2` (`faculty_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`iv_id`) REFERENCES `students_industrial_visit` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `submissions`
--

DROP TABLE IF EXISTS `submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `submissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `task_id` varchar(100) DEFAULT NULL COMMENT 'Task ID from activity forms (if applicable)',
  `remarks` text DEFAULT NULL COMMENT 'General remarks/comments for the submission',
  `activity_type` varchar(60) NOT NULL COMMENT 'newsletter_archive | e_content_developed | events_attended | events_organized | external_examiner | faculty_journal_reviewer | guest_lecture_delivered | international_visit | notable_achievements | online_course | paper_presentation | resource_person | mou | irp_visit | consultancy | external_vip_visit | faculty_industry_project | centre_of_excellence | faculty_trained_by_industry | industry_advisor | lab_developed_by_industry | students_industrial_visit | training_to_industry | professional_body_membership',
  `faculty_id` varchar(50) DEFAULT NULL COMMENT 'Nullable for department-level activities like newsletter_archive',
  `iqac_verification_id` int DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `task_id` (`task_id`),
  KEY `fk_1` (`faculty_id`),
  KEY `fk_2` (`iqac_verification_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`iqac_verification_id`) REFERENCES `ref_iqac_status` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `technical_society_dept_mapping`
--

DROP TABLE IF EXISTS `technical_society_dept_mapping`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `technical_society_dept_mapping` (
  `id` int NOT NULL AUTO_INCREMENT,
  `technical_society_id` int NOT NULL,
  `department_id` int NOT NULL,
  `status_id` int NOT NULL COMMENT 'Active | Non-Active',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `technical_society_dept_mapping_index_7` (`technical_society_id`,`department_id`),
  KEY `fk_2` (`department_id`),
  KEY `fk_3` (`status_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`technical_society_id`) REFERENCES `ref_technical_society` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`),
  CONSTRAINT `fk_3` FOREIGN KEY (`status_id`) REFERENCES `ref_technical_society_status` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `training_to_industry`
--

DROP TABLE IF EXISTS `training_to_industry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `training_to_industry` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `sig_number` varchar(50) DEFAULT NULL,
  `special_labs_involved` tinyint(1) DEFAULT '0',
  `special_lab_id` int DEFAULT NULL,
  `event_type_id` int DEFAULT NULL,
  `if_event_type_others` varchar(200) DEFAULT NULL,
  `industry_name` varchar(300) DEFAULT NULL,
  `industry_address` text DEFAULT NULL,
  `domain_area` varchar(300) DEFAULT NULL,
  `industry_type_id` int DEFAULT NULL,
  `if_type_others` varchar(200) DEFAULT NULL,
  `training_mode_id` int DEFAULT NULL,
  `training_venue` varchar(300) DEFAULT NULL,
  `industry_website` varchar(500) DEFAULT NULL,
  `num_persons_trained` int DEFAULT NULL,
  `duration_days` int DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `outcome` text DEFAULT NULL,
  `honorarium_received` tinyint(1) DEFAULT NULL,
  `honorarium_amount_inrs` decimal(12,2) DEFAULT NULL,
  `honorarium_includes_gst` tinyint(1) DEFAULT NULL,
  `amount_after_gst` decimal(12,2) DEFAULT NULL,
  `college_resources_utilized` tinyint(1) DEFAULT NULL,
  `resources_list` text DEFAULT NULL,
  `consumable_charges` decimal(12,2) DEFAULT NULL,
  `college_transport_utilized` tinyint(1) DEFAULT NULL,
  `transport_area` varchar(300) DEFAULT NULL,
  `distance_km` decimal(10,2) DEFAULT NULL,
  `petrol_cost_per_km` decimal(8,2) DEFAULT NULL,
  `transport_cost` decimal(12,2) DEFAULT NULL,
  `is_claimed_as_consultancy` tinyint(1) DEFAULT NULL,
  `category_sharing_id` int DEFAULT NULL,
  `faculty_share_before` decimal(14,2) DEFAULT NULL,
  `institute_share_before` decimal(14,2) DEFAULT NULL,
  `net_faculty_share` decimal(14,2) DEFAULT NULL,
  `net_institute_share` decimal(14,2) DEFAULT NULL,
  `num_faculty_members` int DEFAULT NULL,
  `share_per_faculty` decimal(14,2) DEFAULT NULL COMMENT 'Net faculty share / num faculty members',
  `communication_proof_id` int DEFAULT NULL COMMENT 'Upload Communication Proof',
  `approval_letter_id` int DEFAULT NULL COMMENT 'Approval Letter from BIT',
  `geotag_photos_id` int DEFAULT NULL COMMENT 'Upload Geotag Photos',
  `participant_attendance_id` int DEFAULT NULL COMMENT 'Upload Participant''s Attendance',
  `payment_proof_id` int DEFAULT NULL COMMENT 'Upload Payment Proofs',
  `consolidated_doc_id` int DEFAULT NULL COMMENT 'Upload Consolidated Document',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `submission_id` (`submission_id`),
  KEY `fk_2` (`special_lab_id`),
  KEY `fk_3` (`event_type_id`),
  KEY `fk_4` (`industry_type_id`),
  KEY `fk_5` (`training_mode_id`),
  KEY `fk_6` (`category_sharing_id`),
  KEY `fk_7` (`communication_proof_id`),
  KEY `fk_8` (`approval_letter_id`),
  KEY `fk_9` (`geotag_photos_id`),
  KEY `fk_10` (`participant_attendance_id`),
  KEY `fk_11` (`payment_proof_id`),
  KEY `fk_12` (`consolidated_doc_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`),
  CONSTRAINT `fk_2` FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`),
  CONSTRAINT `fk_3` FOREIGN KEY (`event_type_id`) REFERENCES `ref_training_event_type` (`id`),
  CONSTRAINT `fk_4` FOREIGN KEY (`industry_type_id`) REFERENCES `ref_industry_org_type` (`id`),
  CONSTRAINT `fk_5` FOREIGN KEY (`training_mode_id`) REFERENCES `ref_training_mode` (`id`),
  CONSTRAINT `fk_6` FOREIGN KEY (`category_sharing_id`) REFERENCES `ref_category_sharing` (`id`),
  CONSTRAINT `fk_7` FOREIGN KEY (`communication_proof_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_8` FOREIGN KEY (`approval_letter_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_9` FOREIGN KEY (`geotag_photos_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_10` FOREIGN KEY (`participant_attendance_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_11` FOREIGN KEY (`payment_proof_id`) REFERENCES `documents` (`id`),
  CONSTRAINT `fk_12` FOREIGN KEY (`consolidated_doc_id`) REFERENCES `documents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `email` varchar(200) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `user_id` varchar(50) DEFAULT NULL COMMENT 'Optional link for faculty user accounts',
  `role_id` int NOT NULL COMMENT 'Assigned role for page/resource access',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `faculty_id` (`user_id`),
  KEY `fk_3` (`role_id`),
  CONSTRAINT `fk_3` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=210001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `workflow_deadline_settings`
--

DROP TABLE IF EXISTS `workflow_deadline_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workflow_deadline_settings` (
  `academic_year` varchar(20) NOT NULL,
  `settings_json` json NOT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`academic_year`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_workflow_deadline_updated_by` (`updated_by`),
  CONSTRAINT `fk_workflow_deadline_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-17 13:38:13
