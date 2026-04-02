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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `app_pages`
--

LOCK TABLES `app_pages` WRITE;
/*!40000 ALTER TABLE `app_pages` DISABLE KEYS */;
/*!40000 ALTER TABLE `app_pages` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `centre_of_excellence`
--

LOCK TABLES `centre_of_excellence` WRITE;
/*!40000 ALTER TABLE `centre_of_excellence` DISABLE KEYS */;
/*!40000 ALTER TABLE `centre_of_excellence` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `consultancy`
--

LOCK TABLES `consultancy` WRITE;
/*!40000 ALTER TABLE `consultancy` DISABLE KEYS */;
/*!40000 ALTER TABLE `consultancy` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `consultancy_faculty`
--

LOCK TABLES `consultancy_faculty` WRITE;
/*!40000 ALTER TABLE `consultancy_faculty` DISABLE KEYS */;
/*!40000 ALTER TABLE `consultancy_faculty` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (1,'AG','AGRICULTURAL ENGINEERING',1,'2026-03-19 06:06:06','2026-03-19 06:06:06'),(2,'AIDS','ARTIFICIAL INTELLIGENCE AND DATA SCIENCE',1,'2026-03-19 06:06:06','2026-03-19 06:06:06'),(3,'AIML','ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING',1,'2026-03-19 06:06:06','2026-03-19 06:06:06'),(4,'BM','BIOMEDICAL ENGINEERING',1,'2026-03-19 06:06:06','2026-03-19 06:06:06'),(5,'BT','BIOTECHNOLOGY',1,'2026-03-19 06:06:06','2026-03-19 06:06:06'),(6,'CH','CHEMISTRY',1,'2026-03-19 06:06:06','2026-03-19 06:06:06'),(7,'CE','CIVIL ENGINEERING',1,'2026-03-19 06:06:06','2026-03-19 06:06:06'),(8,'CSBS','COMPUTER SCIENCE AND BUSINESS SYSTEMS',1,'2026-03-19 06:06:06','2026-03-19 06:06:06'),(9,'CSD','COMPUTER SCIENCE AND DESIGN',1,'2026-03-19 06:06:06','2026-03-19 06:06:06'),(10,'CSE','COMPUTER SCIENCE AND ENGINEERING',1,'2026-03-19 06:06:06','2026-03-19 06:06:06'),(11,'CT','COMPUTER TECHNOLOGY',1,'2026-03-19 06:06:06','2026-03-19 06:06:06'),(12,'EEE','ELECTRICAL AND ELECTRONICS ENGINEERING',1,'2026-03-19 06:06:06','2026-03-19 06:06:06'),(13,'ECE','ELECTRONICS AND COMMUNICATION ENGINEERING',1,'2026-03-19 06:06:06','2026-03-19 06:06:06'),(14,'EI','ELECTRONICS AND INSTRUMENTATION ENGINEERING',1,'2026-03-19 06:06:06','2026-03-19 06:06:06'),(15,'FT','FASHION TECHNOLOGY',1,'2026-03-19 06:06:06','2026-03-19 06:06:06'),(16,'FD','FOOD TECHNOLOGY',1,'2026-03-19 06:06:06','2026-03-19 06:06:06'),(17,'HU','HUMANITIES',1,'2026-03-19 06:06:06','2026-03-19 06:06:06'),(18,'ISE','INFORMATION SCIENCE AND ENGINEERING',1,'2026-03-19 06:06:06','2026-03-19 06:06:06'),(19,'IT','INFORMATION TECHNOLOGY',1,'2026-03-19 06:06:06','2026-03-19 06:06:06'),(20,'MA','MATHEMATICS',1,'2026-03-19 06:06:06','2026-03-19 06:06:06'),(21,'ME','MECHANICAL ENGINEERING',1,'2026-03-19 06:06:06','2026-03-19 06:06:06'),(22,'MC','MECHATRONICS ENGINEERING',1,'2026-03-19 06:06:06','2026-03-19 06:06:06'),(23,'PE','PHYSICAL EDUCATION',1,'2026-03-19 06:06:06','2026-03-19 06:06:06'),(24,'PH','PHYSICS',1,'2026-03-19 06:06:06','2026-03-19 06:06:06'),(25,'SMS','SCHOOL OF MANAGEMENT STUDIES',1,'2026-03-19 06:06:06','2026-03-19 06:06:06'),(26,'AE','AERONATICAL ENGINEERING',1,'2026-03-19 06:19:25','2026-03-19 06:19:25'),(27,'TT','TEXTILE TECHNOLOGY',1,'2026-03-19 06:22:53','2026-03-19 06:22:53'),(28,'AU','AUTOMOBILE ENGINNERING',1,'2026-03-19 06:24:09','2026-03-19 06:24:09'),(29,'MEISE','MECHANICAL ',1,'2026-03-19 06:25:47','2026-03-19 06:25:47');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `designation`
--

LOCK TABLES `designation` WRITE;
/*!40000 ALTER TABLE `designation` DISABLE KEYS */;
INSERT INTO `designation` VALUES (1,'Assistant Professor Level I','2026-03-19 06:50:22','2026-03-19 06:50:22'),(2,'Assistant Professor Level II','2026-03-19 06:50:22','2026-03-19 06:50:22'),(3,'Assistant Professor Level III','2026-03-19 06:50:22','2026-03-19 06:50:22'),(4,'Assistant Professor Trainee','2026-03-19 06:50:22','2026-03-19 06:50:22'),(5,'Associate Professor','2026-03-19 06:50:22','2026-03-19 06:50:22'),(6,'Professor','2026-03-19 06:50:22','2026-03-19 06:50:22'),(7,'Senior Professor','2026-03-19 06:50:22','2026-03-19 06:50:22'),(8,'Hindi Teacher','2026-03-19 06:50:22','2026-03-19 06:50:22');
/*!40000 ALTER TABLE `designation` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `documents`
--

LOCK TABLES `documents` WRITE;
/*!40000 ALTER TABLE `documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `documents` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `e_content_developed`
--

LOCK TABLES `e_content_developed` WRITE;
/*!40000 ALTER TABLE `e_content_developed` DISABLE KEYS */;
/*!40000 ALTER TABLE `e_content_developed` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `event_organized_faculty`
--

LOCK TABLES `event_organized_faculty` WRITE;
/*!40000 ALTER TABLE `event_organized_faculty` DISABLE KEYS */;
/*!40000 ALTER TABLE `event_organized_faculty` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `event_organized_guest`
--

LOCK TABLES `event_organized_guest` WRITE;
/*!40000 ALTER TABLE `event_organized_guest` DISABLE KEYS */;
/*!40000 ALTER TABLE `event_organized_guest` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `event_organized_student`
--

LOCK TABLES `event_organized_student` WRITE;
/*!40000 ALTER TABLE `event_organized_student` DISABLE KEYS */;
/*!40000 ALTER TABLE `event_organized_student` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `events_attended`
--

LOCK TABLES `events_attended` WRITE;
/*!40000 ALTER TABLE `events_attended` DISABLE KEYS */;
/*!40000 ALTER TABLE `events_attended` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `events_organized`
--

LOCK TABLES `events_organized` WRITE;
/*!40000 ALTER TABLE `events_organized` DISABLE KEYS */;
/*!40000 ALTER TABLE `events_organized` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `external_examiner`
--

LOCK TABLES `external_examiner` WRITE;
/*!40000 ALTER TABLE `external_examiner` DISABLE KEYS */;
/*!40000 ALTER TABLE `external_examiner` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `external_vip_visit`
--

LOCK TABLES `external_vip_visit` WRITE;
/*!40000 ALTER TABLE `external_vip_visit` DISABLE KEYS */;
/*!40000 ALTER TABLE `external_vip_visit` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `faculty`
--

LOCK TABLES `faculty` WRITE;
/*!40000 ALTER TABLE `faculty` DISABLE KEYS */;
INSERT INTO `faculty` VALUES ('AD10543','Mr','RANJITH G','3',2,'ranjith@bitsathy.ac.in','2026-03-19 06:50:22'),('AD10628','Dr','ARUN KUMAR R','5',2,'arunkumarr@bitsathy.ac.in','2026-03-19 06:50:22'),('AD10818','Dr','ESWARAMOORTHY V','6',2,'eswaramoorthyv@bitsathy.ac.in','2026-03-19 06:50:22'),('AD10838','Mrs','NITHYAPRIYA S','3',2,'nithyapriyas@bitsathy.ac.in','2026-03-19 06:50:22'),('AD10928','Mrs','NISHA DEVI K','2',2,'nishadevik@bitsathy.ac.in','2026-03-19 06:50:22'),('AD10931','Dr','BALASAMY K','3',2,'balasamyk@bitsathy.ac.in','2026-03-19 06:50:22'),('AD10936','Mr','PRABANAND S C','3',2,'prabanandsc@bitsathy.ac.in','2026-03-19 06:50:22'),('AD10945','Mr','SATHEESH N P','1',2,'satheeshnp@bitsathy.ac.in','2026-03-19 06:50:22'),('AD10953','Mr','RAJ KUMAR V S','2',2,'rajkumarvs@bitsathy.ac.in','2026-03-19 06:50:22'),('AD10955','Ms','ESAKKI MADURA E','3',2,'esakkimadurae@bitsathy.ac.in','2026-03-19 06:50:22'),('AD11009','Mrs','DIVYABARATHI P','2',2,'divyabarathip@bitsathy.ac.in','2026-03-19 06:50:22'),('AD11016','Mr','SATHEESHKUMAR S','2',2,'satheeshkumars@bitsathy.ac.in','2026-03-19 06:50:22'),('AD11019','Mrs','KIRUTHIGA R','1',2,'kiruthigar@bitsathy.ac.in','2026-03-19 06:50:22'),('AD11023','Mrs','VAANATHI S','2',2,'vaanathi@bitsathy.ac.in','2026-03-19 06:50:22'),('AD11026','Mr','CHOZHARAJAN P','3',2,'chozharajanp@bitsathy.ac.in','2026-03-19 06:50:22'),('AD11041','Mrs','ASHFORN HERMINA J M','1',2,'ashfornherminajm@bitsathy.ac.in','2026-03-19 06:50:22'),('AD11042','Mrs','JEEVITHA S V','1',2,'jeevithasv@bitsathy.ac.in','2026-03-19 06:50:22'),('AD11068','Ms','BENITA GRACIA THANGAM J','1',2,'benitagraciathangam@bitsathy.ac.in','2026-03-19 06:50:22'),('AD11069','Mr','PREMKUMAR C','1',2,'premkumar@bitsathy.ac.in','2026-03-19 06:50:22'),('AD1108','Dr','SUNDARA MURTHY S','6',2,'sundaramurthys@bitsathy.ac.in','2026-03-19 06:50:22'),('AD11089','Mrs','RESHMI T S','1',2,'reshmits@bitsathy.ac.in','2026-03-19 06:50:22'),('AD11096','Dr','SUBBULAKSHMI M','3',2,'subbulakshmi@bitsathy.ac.in','2026-03-19 06:50:22'),('AD11104','Mrs','KALPANA R','1',2,'kalpana@bitsathy.ac.in','2026-03-19 06:50:22'),('AD11111','Ms','SURIYA V','1',2,'suriya@bitsathy.ac.in','2026-03-19 06:50:22'),('AD11112','Mrs','HEMA PRIYA D','1',2,'hemapriyad@bitsathy.ac.in','2026-03-19 06:50:22'),('AD11114','Mrs','MANJU M','1',2,'manju@bitsathy.ac.in','2026-03-19 06:50:22'),('AD11116','Ms','PRIYADHARSHNI S','1',2,'priyadharshni@bitsathy.ac.in','2026-03-19 06:50:22'),('AD11164','Mr','SASSON TAFFWIN MOSES S','1',2,'sassontaffwinmosess@bitsathy.ac.in','2026-03-19 06:50:22'),('AD11169','Mrs','MANOCHITRA A S','1',2,'manochitra@bitsathy.ac.in','2026-03-19 06:50:22'),('AD11193','Mr','NAVANEETH KUMAR K','3',2,'navaneethkumark@bitsathy.ac.in','2026-03-19 06:50:22'),('AD1444','Dr','GOMATHI R','6',2,'gomathir@bitsathy.ac.in','2026-03-19 06:50:22'),('AD1963','Dr','NANDHINI S S','5',2,'nandhiniss@bitsathy.ac.in','2026-03-19 06:50:22'),('AG10092','Dr','VASUDEVAN M','5',1,'vasudevan@bitsathy.ac.in','2026-03-19 06:50:22'),('AG10172','Dr','VINOTH KUMAR J','3',1,'vinothkumar@bitsathy.ac.in','2026-03-19 06:50:22'),('AG10503','Dr','CHELLADURAI V','5',1,'chelladurai@bitsathy.ac.in','2026-03-19 06:50:22'),('AG10895','Ms','ANANTHI D','1',1,'ananthid@bitsathy.ac.in','2026-03-19 06:50:22'),('AG10994','Mr','MUTHUKUMARAVEL K','1',1,'muthukumaravelk@bitsathy.ac.in','2026-03-19 06:50:22'),('AG11049','Dr','PRAVEEN KUMAR D','2',1,'praveenkumard@bitsathy.ac.in','2026-03-19 06:50:22'),('AG11083','Dr','RAGHUL S','1',1,'raghul@bitsathy.ac.in','2026-03-19 06:50:22'),('AG11178','Ms','SNEKHA A R','1',1,'snekhaar@bitsathy.ac.in','2026-03-19 06:50:22'),('AG1312','Dr','UVARAJA V C','6',1,'uvarajavc@bitsathy.ac.in','2026-03-19 06:50:22'),('AM10176','Mrs','SUDHA R','2',3,'sudha@bitsathy.ac.in','2026-03-19 06:50:22'),('AM1025','Dr','BHARATHI A','6',3,'bharathia@bitsathy.ac.in','2026-03-19 06:50:22'),('AM10795','Dr','PADMASHREE A','5',3,'padmashreea@bitsathy.ac.in','2026-03-19 06:50:22'),('AM10907','Dr','RAJASEKAR S S','5',3,'rajasekarss@bitsathy.ac.in','2026-03-19 06:50:22'),('AM10954','Mrs','HARI PRIYA R','2',3,'haripriyar@bitsathy.ac.in','2026-03-19 06:50:22'),('AM10956','Ms','KARTHIKA S','1',3,'karthikas@bitsathy.ac.in','2026-03-19 06:50:22'),('AM10971','Mr','NITHIN P','2',3,'nithinp@bitsathy.ac.in','2026-03-19 06:50:22'),('AM11013','Mr','SATHESHKUMAR K','2',3,'satheshkumar@bitsathy.ac.in','2026-03-19 06:50:22'),('AM11039','Mrs','EUGENE BERNA I','3',3,'eugenebernai@bitsathy.ac.in','2026-03-19 06:50:22'),('AM11052','Ms','MOHANAPRIYA K','1',3,'mohanapriyak@bitsathy.ac.in','2026-03-19 06:50:22'),('AM11058','Mr','BALAMURUGAN E','2',3,'balamurugane@bitsathy.ac.in','2026-03-19 06:50:22'),('AM11092','Ms','KANIMOZHI A','1',3,'kanimozhi@bitsathy.ac.in','2026-03-19 06:50:22'),('AM11095','Mrs','GAYATHRIDEVI M','1',3,'gayathridevi@bitsathy.ac.in','2026-03-19 06:50:22'),('AM11100','Ms','NISHANTHINI S','1',3,'nishanthinis@bitsathy.ac.in','2026-03-19 06:50:22'),('AM11110','Ms','SASITHRA S','1',3,'sasithra@bitsathy.ac.in','2026-03-19 06:50:22'),('AM11113','Mrs','LOKESWARI P','1',3,'lokeswari@bitsathy.ac.in','2026-03-19 06:50:22'),('AM11161','Dr','KARTHIKEYAN G','3',3,'karthikeyang@bitsathy.ac.in','2026-03-19 06:50:22'),('AM11166','Mrs','SARANYA M K','1',3,'saranyamk@bitsathy.ac.in','2026-03-19 06:50:22'),('AM1131','Dr','GOPALAKRISHNAN B','6',3,'gopalakrishnanb@bitsathy.ac.in','2026-03-19 06:50:22'),('AM2241','Dr','KODIESWARI A','5',3,'kodieswaria@bitsathy.ac.in','2026-03-19 06:50:22'),('AU10440','Mr','TAMILSELVAN A','3',28,'tamilselvan@bitsathy.ac.in','2026-03-19 06:50:22'),('AU10645','Dr','DHAYANEETHI S','3',28,'dhayaneethi@bitsathy.ac.in','2026-03-19 06:50:22'),('BM10939','Ms','CAROLINE VINNETIA S','2',4,'carolinevinnetias@bitsathy.ac.in','2026-03-19 06:50:22'),('BM11066','Ms','SAAHINA S','1',4,'saahina@bitsathy.ac.in','2026-03-19 06:50:22'),('BM11071','Mr','SYED ALTHAF S','1',4,'syedalthaf@bitsathy.ac.in','2026-03-19 06:50:22'),('BM11175','Ms','SREENIVEATHA P','1',4,'sreeniveathap@bitsathy.ac.in','2026-03-19 06:50:22'),('BM11176','Ms','PRATHEEBHA G','1',4,'pratheebhag@bitsathy.ac.in','2026-03-19 06:50:22'),('BM1429','Dr','DEEPA D','6',4,'ddeepa@bitsathy.ac.in','2026-03-19 06:50:22'),('BT10375','Dr','ASHWIN RAJ S','3',5,'ashwinraj@bitsathy.ac.in','2026-03-19 06:50:22'),('BT10708','Mr','RAJASEETHARAMA S','2',5,'rajaseetharama@bitsathy.ac.in','2026-03-19 06:50:22'),('BT10733','Ms','SWATHI G','1',5,'swathi@bitsathy.ac.in','2026-03-19 06:50:22'),('BT10782','Mr','JEYAVEL KARTHICK P','2',5,'jeyavelkarthick@bitsathy.ac.in','2026-03-19 06:50:22'),('BT10978','Mrs','SAKTHISHOBANA K','2',5,'sakthishobanak@bitsathy.ac.in','2026-03-19 06:50:22'),('BT10984','Mrs','MAHIMA P','1',5,'mahimap@bitsathy.ac.in','2026-03-19 06:50:22'),('BT10991','Mr','BALAJI S','2',5,'balajisadhasivam@bitsathy.ac.in','2026-03-19 06:50:22'),('BT11035','Ms','NANDHINI N','1',5,'nandhinin@bitsathy.ac.in','2026-03-19 06:50:22'),('BT11050','Mrs','VINODHINI R T','1',5,'vinodhinirt@bitsathy.ac.in','2026-03-19 06:50:22'),('BT11134','Dr','SARANYA S','2',5,'saranya@bitsathy.ac.in','2026-03-19 06:50:22'),('BT11198','Mrs','SHANKARI V','1',5,'shankariv@bitsathy.ac.in','2026-03-19 06:50:22'),('BT1388','Dr','KANNAN K P','6',5,'kannankp@bitsathy.ac.in','2026-03-19 06:50:22'),('BT1477','Dr','TAMILSELVI S','6',5,'tamilselvis@bitsathy.ac.in','2026-03-19 06:50:22'),('BT1606','Dr','BALAKRISHNARAJA R','6',5,'balakrishnarajar@bitsathy.ac.in','2026-03-19 06:50:22'),('BT1849','Dr','KIRUPA SANKAR M','5',5,'kirupasankarm@bitsathy.ac.in','2026-03-19 06:50:22'),('BT1930','Dr','PAVITHRA MKS','5',5,'pavithramks@bitsathy.ac.in','2026-03-19 06:50:22'),('CB10791','Mr','CHANDRU K S','3',8,'chandruks@bitsathy.ac.in','2026-03-19 06:50:22'),('CB10890','Ms','YUVALATHA S','3',8,'yuvalathas@bitsathy.ac.in','2026-03-19 06:50:22'),('CB10949','Mrs','MADHUMITHA A','1',8,'madhumithaa@bitsathy.ac.in','2026-03-19 06:50:22'),('CB10992','Mrs','SARANYA N','1',8,'saranyanj@bitsathy.ac.in','2026-03-19 06:50:22'),('CB11107','Ms','NAVEENYA B P','1',8,'naveenya@bitsathy.ac.in','2026-03-19 06:50:22'),('CB11145','Mrs','DIVYA S','1',8,'divyaks@bitsathy.ac.in','2026-03-19 06:50:22'),('CB11170','Ms','VAISHNAVI N','1',8,'vaishnavin@bitsathy.ac.in','2026-03-19 06:50:22'),('CB11172','Mr','PRABAKAR S J','1',8,'prabakar@bitsathy.ac.in','2026-03-19 06:50:22'),('CD11061','Mrs','PREETHIMATHI L','1',9,'preethimathi@bitsathy.ac.in','2026-03-19 06:50:22'),('CD11062','Mr','MAHESHKUMAR K','2',9,'maheshkumar@bitsathy.ac.in','2026-03-19 06:50:22'),('CD11174','Ms','KIRUTHIKA S','1',9,'kiruthikas@bitsathy.ac.in','2026-03-19 06:50:22'),('CD11183','Mrs','INDHUMATHI K','4',9,'indhumathik@bitsathy.ac.in','2026-03-19 06:50:22'),('CE10010','Dr','MOHANRAJ A','3',7,'mohanraja@bitsathy.ac.in','2026-03-19 06:50:22'),('CE10600','Ms','ASHWATHI R','2',7,'ashwathi@bitsathy.ac.in','2026-03-19 06:50:22'),('CE10783','Dr','JEYANTH B','3',7,'jeyanth@bitsathy.ac.in','2026-03-19 06:50:22'),('CE1797','Dr','KARTHIGA SHENBAGAM N','5',7,'karthigashenbagamn@bitsathy.ac.in','2026-03-19 06:50:22'),('CE1865','Dr','GEETHAMANI R','3',7,'geethamanir@bitsathy.ac.in','2026-03-19 06:50:22'),('CE1954','Mr','RAJENDRAN M','3',7,'rajendranm@bitsathy.ac.in','2026-03-19 06:50:22'),('CH10003','Dr','SATHISH V','3',6,'sathishv@bitsathy.ac.in','2026-03-19 06:50:22'),('CH10225','Dr','MUTHUKUMAR P','3',6,'muthukumar@bitsathy.ac.in','2026-03-19 06:50:22'),('CH10333','Dr','MURALI KRISHNAN M','3',6,'muralikrishnan@bitsathy.ac.in','2026-03-19 06:50:22'),('CH10372','Dr','RAMESHKUMAR A','3',6,'rameshkumar@bitsathy.ac.in','2026-03-19 06:50:22'),('CH10957','Dr','DEEPHA V','1',6,'deephav@bitsathy.ac.in','2026-03-19 06:50:22'),('CH11057','Dr','KARUPPUSAMY S','1',6,'karuppusamys@bitsathy.ac.in','2026-03-19 06:50:22'),('CH11126','Dr','JESIN BENETO A','2',6,'jesinbeneto@bitsathy.ac.in','2026-03-19 06:50:22'),('CH11127','Dr','MANIGANDAN S','1',6,'manigandan@bitsathy.ac.in','2026-03-19 06:50:22'),('CH11156','Dr','KASTHURI S','1',6,'kasthuris@bitsathy.ac.in','2026-03-19 06:50:22'),('CH11202','Dr','PAWEL P','1',6,'PAWELPANDIYAN1998.PP@GMAIL.COM','2026-03-19 06:50:22'),('CH1493','Dr','SUBHAPRIYA P','5',6,'subhapriyap@bitsathy.ac.in','2026-03-19 06:50:22'),('CH1557','Dr','VIJAYANAND P S','6',6,'vijayanandps@bitsathy.ac.in','2026-03-19 06:50:22'),('CH1558','Dr','PRAVEENA R','5',6,'praveenar@bitsathy.ac.in','2026-03-19 06:50:22'),('CH1578','Dr','KAVITHA C','5',6,'kavithac@bitsathy.ac.in','2026-03-19 06:50:22'),('CH1894','Dr','MALATHI MAHALINGAM','5',6,'malathimahalingamm@bitsathy.ac.in','2026-03-19 06:50:22'),('CS10025','Mr','DINESH P S','3',10,'dineshps@bitsathy.ac.in','2026-03-19 06:50:22'),('CS10239','Dr','KARTHIGA M','5',10,'karthigam@bitsathy.ac.in','2026-03-19 06:50:22'),('CS10308','Mr','MOHAN KUMAR V','2',10,'mohankumar@bitsathy.ac.in','2026-03-19 06:50:22'),('CS10449','Mrs','PRABHA DEVI D','3',10,'prabhadevi@bitsathy.ac.in','2026-03-19 06:50:22'),('CS10473','Ms','SOUNDARIYA R S','3',10,'soundariya@bitsathy.ac.in','2026-03-19 06:50:22'),('CS10538','Dr','PRAVEEN V','5',10,'praveen@bitsathy.ac.in','2026-03-19 06:50:22'),('CS10560','Dr','SWATHYPRIYADHARSINI P','3',10,'swathypriyadharsini@bitsathy.ac.in','2026-03-19 06:50:22'),('CS10767','Mr','MAGESH KUMAR B','2',10,'mageshkumar@bitsathy.ac.in','2026-03-19 06:50:22'),('CS10776','Mr','SUSEENDRAN S','3',10,'suseendrans@bitsathy.ac.in','2026-03-19 06:50:22'),('CS10787','Dr','PARTHASARATHI P','5',10,'parthasarathip@bitsathy.ac.in','2026-03-19 06:50:22'),('CS10789','Dr','DHIVYA P','5',10,'dhivyap@bitsathy.ac.in','2026-03-19 06:50:22'),('CS10797','Dr','SANGEETHAA SN','6',10,'sangeethaasn@bitsathy.ac.in','2026-03-19 06:50:22'),('CS10820','Dr','RAJESH KANNA P','5',10,'rajeshkannap@bitsathy.ac.in','2026-03-19 06:50:22'),('CS10825','Ms','KIRUTHIKA V R','2',10,'kiruthikavr@bitsathy.ac.in','2026-03-19 06:50:22'),('CS10843','Mrs','NITHYA R','2',10,'nithyars@bitsathy.ac.in','2026-03-19 06:50:22'),('CS10861','Ms','SANGAVI N','2',10,'sangavin@bitsathy.ac.in','2026-03-19 06:50:22'),('CS10876','Mr','SATHISHKANNAN R','3',10,'sathishkannanr@bitsathy.ac.in','2026-03-19 06:50:22'),('CS10880','Mrs','KALAIVANI E','1',10,'kalaivanie@bitsathy.ac.in','2026-03-19 06:50:22'),('CS10906','Dr','SARANYA K','5',10,'saranyaks@bitsathy.ac.in','2026-03-19 06:50:22'),('CS10946','Mr','RAMASAMI S','3',10,'ramasamis@bitsathy.ac.in','2026-03-19 06:50:22'),('CS10963','Dr','RAJESHKUMAR G','6',10,'rajeshkumarg@bitsathy.ac.in','2026-03-19 06:50:22'),('CS10974','Mr','STEEPHAN AMALRAJ J','1',10,'steephanamalrajj@bitsathy.ac.in','2026-03-19 06:50:22'),('CS10983','Mrs','KAVITHA R','3',10,'kavithar@bitsathy.ac.in','2026-03-19 06:50:22'),('CS11027','Mr','SATHYAMOORTHY J','1',10,'sathyamoorthyj@bitsathy.ac.in','2026-03-19 06:50:22'),('CS11064','Mrs','MOHANAMBAL K','1',10,'mohanambal@bitsathy.ac.in','2026-03-19 06:50:22'),('CS11075','Mrs','CHITRADEVI T N','2',10,'chitradevi@bitsathy.ac.in','2026-03-19 06:50:22'),('CS11080','Mrs','AMMU V','3',10,'ammu@bitsathy.ac.in','2026-03-19 06:50:22'),('CS11081','Dr','DEEPA PRIYA B S','5',10,'deepapriya@bitsathy.ac.in','2026-03-19 06:50:22'),('CS11084','Mrs','GUNAVARDINI V','1',10,'gunavardini@bitsathy.ac.in','2026-03-19 06:50:22'),('CS11086','Mrs','GAYATHRI S','2',10,'gayathris@bitsathy.ac.in','2026-03-19 06:50:22'),('CS11087','Mrs','PRIYANGA M A','1',10,'priyanga@bitsathy.ac.in','2026-03-19 06:50:22'),('CS11088','Ms','SATHIYA B','1',10,'sathiya@bitsathy.ac.in','2026-03-19 06:50:22'),('CS11094','Ms','RATHNA S','1',10,'rathna@bitsathy.ac.in','2026-03-19 06:50:22'),('CS1110','Dr','SASIKALA D','6',10,'sasikalad@bitsathy.ac.in','2026-03-19 06:50:22'),('CS11101','Mrs','ALAMELU M','3',10,'alamelu@bitsathy.ac.in','2026-03-19 06:50:22'),('CS11119','Ms','PARKAVI S','1',10,'parkavi@bitsathy.ac.in','2026-03-19 06:50:22'),('CS11150','Mrs','MYTHILI G M','1',10,'mythili@bitsathy.ac.in','2026-03-19 06:50:22'),('CS11157','Ms','GAYATHIRI DEVI S','1',10,'gayathiridevis@bitsathy.ac.in','2026-03-19 06:50:22'),('CS11158','Mrs','KAYALVIZHI B','1',10,'kayalvizhib@bitsathy.ac.in','2026-03-19 06:50:22'),('CS11162','Ms','THANGATAMILSELVI S','1',10,'thangatamilselvis@bitsathy.ac.in','2026-03-19 06:50:22'),('CS11163','Ms','MAHESH S','1',10,'maheshs@bitsathy.ac.in','2026-03-19 06:50:22'),('CS11171','Mr','JACKSON J','1',10,'jacksonj@bitsathy.ac.in','2026-03-19 06:50:22'),('CS11180','Mr','RANGARAJ K','1',10,'rangarajk@bitsathy.ac.in','2026-03-19 06:50:22'),('CS11185','Mr','ASWIN JAYA SURYA M J','1',10,'aswinjayasuryamj@bitsathy.ac.in','2026-03-19 06:50:22'),('CS11197','Mr','GOKUL M S','1',10,'gokulms@bitsathy.ac.in','2026-03-19 06:50:22'),('CS11203','Mrs','RAMYA M','1',10,'RAMYAPRABA2011@GMAIL.COM','2026-03-19 06:50:22'),('CS1362','Dr','SATHISHKUMAR P','6',10,'sathishkumarp@bitsathy.ac.in','2026-03-19 06:50:22'),('CS1618','Dr','PREMALATHA K','6',10,'premalathak@bitsathy.ac.in','2026-03-19 06:50:22'),('CS1906','Dr','RAMYA R','5',10,'ramyarv@bitsathy.ac.in','2026-03-19 06:50:22'),('CT10659','Dr','THANGA PARVATHI B','6',11,'btparvathi@bitsathy.ac.in','2026-03-19 06:50:22'),('CT10933','Mrs','SWEETY PRASANNA KIRUBA G','1',11,'prasannakiruba@bitsathy.ac.in','2026-03-19 06:50:22'),('CT10965','Mr','GUNALAN K','2',11,'gunalank@bitsathy.ac.in','2026-03-19 06:50:22'),('CT11020','Mr','ANANDAN P','2',11,'anandan@bitsathy.ac.in','2026-03-19 06:50:22'),('CT11030','Mrs','SAVEETHA R','3',11,'saveethar@bitsathy.ac.in','2026-03-19 06:50:22'),('CT1349','Dr','MURUGESAN P','3',11,'murugesanp@bitsathy.ac.in','2026-03-19 06:50:22'),('EC10005','Dr','SANNASI CHAKRAVARTHY S R','5',13,'sannasi@bitsathy.ac.in','2026-03-19 06:50:22'),('EC10186','Dr','SAMPOORNAM K P','6',13,'sampoornam@bitsathy.ac.in','2026-03-19 06:50:22'),('EC10194','Mr','KARTHIKEYAN S','3',13,'karthikeyan@bitsathy.ac.in','2026-03-19 06:50:22'),('EC10229','Mrs','SARANYA N','3',13,'saranyan@bitsathy.ac.in','2026-03-19 06:50:22'),('EC10443','Mr','BARANIDHARAN V','3',13,'baranidharan@bitsathy.ac.in','2026-03-19 06:50:22'),('EC10581','Mr','TAMILSELVAN S','3',13,'tamilselvans@bitsathy.ac.in','2026-03-19 06:50:22'),('EC10603','Mr','RAJA SEKAR S','3',13,'rajasekar@bitsathy.ac.in','2026-03-19 06:50:22'),('EC10678','Dr','LEEBAN MOSES M','5',13,'leebanmoses@bitsathy.ac.in','2026-03-19 06:50:22'),('EC10680','Dr','PERARASI T','6',13,'perarasi@bitsathy.ac.in','2026-03-19 06:50:22'),('EC10692','Mrs','GAYATHRI R','2',13,'gayathrir@bitsathy.ac.in','2026-03-19 06:50:22'),('EC1072','Dr','POONGODI C','6',13,'poongodic@bitsathy.ac.in','2026-03-19 06:50:22'),('EC10725','Mrs','ABINAYA M','2',13,'abinayam@bitsathy.ac.in','2026-03-19 06:50:22'),('EC10739','Dr','ARULMURUGAN L','5',13,'arulmurugan@bitsathy.ac.in','2026-03-19 06:50:22'),('EC10764','Mrs','SOUNDARYA B','2',13,'soundarya@bitsathy.ac.in','2026-03-19 06:50:22'),('EC10774','Mr','KRISHNARAJ R','2',13,'krishnarajr@bitsathy.ac.in','2026-03-19 06:50:22'),('EC10775','Mrs','MYTHILI S','2',13,'mythilis@bitsathy.ac.in','2026-03-19 06:50:22'),('EC10813','Ms','SHARMILA A','2',13,'sharmilaa@bitsathy.ac.in','2026-03-19 06:50:22'),('EC10827','Dr','MURUGAN K','5',13,'murugank@bitsathy.ac.in','2026-03-19 06:50:22'),('EC10915','Dr','STEPHEN SAGAYARAJ A','3',13,'stephensagayaraja@bitsathy.ac.in','2026-03-19 06:50:22'),('EC10916','Mrs','KARTHIGA M','2',13,'karthiga@bitsathy.ac.in','2026-03-19 06:50:22'),('EC10969','Dr','VENKATESHKUMAR U','5',13,'venkateshkumaru@bitsathy.ac.in','2026-03-19 06:50:22'),('EC10972','Mr','VELLINGIRI A','3',13,'vellingiria@bitsathy.ac.in','2026-03-19 06:50:22'),('EC11010','Mrs','MARIAAMUTHA R','1',13,'mariaamuthar@bitsathy.ac.in','2026-03-19 06:50:22'),('EC11021','Dr','SATHIYAMURTHI P','5',13,'sathiyamurthi@bitsathy.ac.in','2026-03-19 06:50:22'),('EC11043','Mrs','NIVETHA G','1',13,'nivethag@bitsathy.ac.in','2026-03-19 06:50:22'),('EC11044','Mr','HARISH KUMAAR P','2',13,'harishkumaarp@bitsathy.ac.in','2026-03-19 06:50:22'),('EC11045','Mrs','DHANALAKSHMI S','3',13,'dhanalakshmis@bitsathy.ac.in','2026-03-19 06:50:22'),('EC11047','Mr','RAMESH R','1',13,'rameshr@bitsathy.ac.in','2026-03-19 06:50:22'),('EC11051','Mrs','SANDHIYADEVI P','1',13,'sandhiyadevip@bitsathy.ac.in','2026-03-19 06:50:22'),('EC11131','Dr','SANKARANANTH S','3',13,'sankarananth@bitsathy.ac.in','2026-03-19 06:50:22'),('EC11147','Mrs','RAGAVI M','1',13,'ragavim@bitsathy.ac.in','2026-03-19 06:50:22'),('EC11190','Dr','TAMILARASI R','3',13,'tamilarasir@bitsathy.ac.in','2026-03-19 06:50:22'),('EC11192','Mrs','NALIFABEGAM J','1',13,'nalifabegamj@bitsathy.ac.in','2026-03-19 06:50:22'),('EC11194','Dr','LINO L','4',13,'linol@bitsathy.ac.in','2026-03-19 06:50:22'),('EC1417','Dr','HARIKUMAR R','6',13,'harikumarr@bitsathy.ac.in','2026-03-19 06:50:22'),('EC1453','Dr','PRAKASH S P','5',13,'prakashsp@bitsathy.ac.in','2026-03-19 06:50:22'),('EC1537','Dr','PUSHPAVALLI M','5',13,'pushpavallim@bitsathy.ac.in','2026-03-19 06:50:22'),('EC1721','Mr','NIRMAL KUMAR R','3',13,'nirmalkumarr@bitsathy.ac.in','2026-03-19 06:50:22'),('EC1744','Dr','RAMYA P','5',13,'ramyap@bitsathy.ac.in','2026-03-19 06:50:22'),('EC1834','Dr','SANJOY DEB','6',13,'sanjoydeb@bitsathy.ac.in','2026-03-19 06:50:22'),('EC1893','Dr','ELANGO S','5',13,'elangos@bitsathy.ac.in','2026-03-19 06:50:22'),('EC1911','Dr','DANIEL RAJ A','5',13,'danielraja@bitsathy.ac.in','2026-03-19 06:50:22'),('EC1912','Dr','SAJAN P PHILIP','5',13,'sajanpphilip@bitsathy.ac.in','2026-03-19 06:50:22'),('EC1938','Dr','RAMKUMAR R','5',13,'ramkumarr@bitsathy.ac.in','2026-03-19 06:50:22'),('EE10155','Dr','ALEX STANLEY RAJA T','3',12,'alexstanleyraja@bitsathy.ac.in','2026-03-19 06:50:22'),('EE10317','Mr','ARUN CHENDHURAN R','3',12,'arunchendhuran@bitsathy.ac.in','2026-03-19 06:50:22'),('EE10397','Dr','SATHISHKUMAR S','5',12,'sathishkumars@bitsathy.ac.in','2026-03-19 06:50:22'),('EE1040','Dr','BHARANI KUMAR R','6',12,'bharanikumarr@bitsathy.ac.in','2026-03-19 06:50:22'),('EE10616','Mrs','NITHYA G','3',12,'nithyag@bitsathy.ac.in','2026-03-19 06:50:22'),('EE10619','Mrs','MADHUMITHA J','1',12,'madhumithaj@bitsathy.ac.in','2026-03-19 06:50:22'),('EE10647','Dr','SENTHIL KUMAR J','3',12,'senthilkumarj@bitsathy.ac.in','2026-03-19 06:50:22'),('EE10652','Mr','RISHIKESH N','3',12,'rishikesh@bitsathy.ac.in','2026-03-19 06:50:22'),('EE10721','Mrs','GOPIKA N P','2',12,'gopika@bitsathy.ac.in','2026-03-19 06:50:22'),('EE10786','Dr','MANOJKUMAR P','5',12,'manojkumarp@bitsathy.ac.in','2026-03-19 06:50:22'),('EE10873','Dr','CHINNADURRAI CL','3',12,'chinnadurraicl@bitsathy.ac.in','2026-03-19 06:50:22'),('EE10883','Dr','GOLDVIN SUGIRTHA DHAS B','3',12,'goldvinsugirthadhasb@bitsathy.ac.in','2026-03-19 06:50:22'),('EE11199','Mrs','KIRUTHIKA M','1',12,'kiruthikam@bitsathy.ac.in','2026-03-19 06:50:22'),('EE11200','Dr','SURESH N S','3',12,'sureshns@bitsathy.ac.in','2026-03-19 06:50:22'),('EE1311','Dr','SRINIVASAN M','5',12,'srinivasanm@bitsathy.ac.in','2026-03-19 06:50:22'),('EE1325','Dr','RAJALASHMI K','3',12,'rajalashmik@bitsathy.ac.in','2026-03-19 06:50:22'),('EE1329','Dr','SIVARAMAN P','6',12,'sivaramanpsr@bitsathy.ac.in','2026-03-19 06:50:22'),('EE1437','Dr','VEERAKUMAR S','5',12,'veerakumars@bitsathy.ac.in','2026-03-19 06:50:22'),('EE1682','Dr','MAHESWARI K T','5',12,'maheswarikt@bitsathy.ac.in','2026-03-19 06:50:22'),('EE1695','Dr','NANDHAKUMAR A','3',12,'nandhakumara@bitsathy.ac.in','2026-03-19 06:50:22'),('EE1747','Dr','SRITHA P','3',12,'srithap@bitsathy.ac.in','2026-03-19 06:50:22'),('EE1785','Mrs','MOHANAPRIYA V','3',12,'mohanapriyav@bitsathy.ac.in','2026-03-19 06:50:22'),('EE1908','Mr','SUNDAR S','3',12,'sundars@bitsathy.ac.in','2026-03-19 06:50:22'),('EI10187','Dr','BALAMURUGAN V T','6',14,'balamurugan@bitsathy.ac.in','2026-03-19 06:50:22'),('EI10249','Dr','DHANASEKAR R','3',14,'dhanasekar@bitsathy.ac.in','2026-03-19 06:50:22'),('EI10266','Dr','HARITHA J','3',14,'haritha@bitsathy.ac.in','2026-03-19 06:50:22'),('EI10270','Dr','NANDHINI K M','3',14,'nandhinikm@bitsathy.ac.in','2026-03-19 06:50:22'),('EI10403','Dr','SAKTHIYA RAM S','3',14,'sakthiyaram@bitsathy.ac.in','2026-03-19 06:50:22'),('EI10428','Dr','KALAIYARASI M','5',14,'kalaiyarasim@bitsathy.ac.in','2026-03-19 06:50:22'),('EI10459','Mr','PRAVIN SAVARIDASS M','3',14,'pravinsavaridass@bitsathy.ac.in','2026-03-19 06:50:22'),('EI10670','Mr','PRATHAP M R','2',14,'prathap@bitsathy.ac.in','2026-03-19 06:50:22'),('EI11048','Mr','KUMARESAN K','1',14,'kumaresank@bitsathy.ac.in','2026-03-19 06:50:22'),('EI1438','Dr','VAIRAVEL K S','5',14,'vairavelks@bitsathy.ac.in','2026-03-19 06:50:22'),('EI1688','Dr','SUDHAHAR S','5',14,'sudhahars@bitsathy.ac.in','2026-03-19 06:50:22'),('EI1996','Dr','ARUN JAYAKAR S','5',14,'arunjayakars@bitsathy.ac.in','2026-03-19 06:50:22'),('FD10755','Mr','GOWRISHANKAR L','3',16,'gowrishankar@bitsathy.ac.in','2026-03-19 06:50:22'),('FD10959','Ms','PIDATHALA SAHITYA','1',16,'pidathalasahitya@bitsathy.ac.in','2026-03-19 06:50:22'),('FD10999','Dr','ARUNASREE TNA','2',16,'arunasreetna@bitsathy.ac.in','2026-03-19 06:50:22'),('FD11130','Ms','SIVARAHINI K','1',16,'sivarahini@bitsathy.ac.in','2026-03-19 06:50:22'),('FT10224','Mrs','SARANYA D V','3',15,'saranyadv@bitsathy.ac.in','2026-03-19 06:50:22'),('FT10427','Mrs','MEKALA N','2',15,'mekalan@bitsathy.ac.in','2026-03-19 06:50:22'),('FT10809','Dr','MOHAN BHARATHI C','3',15,'mohanbharathic@bitsathy.ac.in','2026-03-19 06:50:22'),('HU11011','Dr','AJAI A','1',17,'ajai@bitsathy.ac.in','2026-03-19 06:50:22'),('HU11085','Dr','SAGUNTHALA DEVI P','1',17,'sagunthaladevi@bitsathy.ac.in','2026-03-19 06:50:22'),('HU11115','Ms','KAMALI D','1',17,'kamali@bitsathy.ac.in','2026-03-19 06:50:22'),('HU11125','Dr','GAYATHRI G M','1',17,'gayathri@bitsathy.ac.in','2026-03-19 06:50:22'),('HU11139','Dr','ASLIN JERUSHA D','1',17,'aslinjerusha@bitsathy.ac.in','2026-03-19 06:50:22'),('HU11141','Dr','EZHIL G','1',17,'ezhil@bitsathy.ac.in','2026-03-19 06:50:22'),('HU11151','Dr','NITHYA S','1',17,'nithyas@bitsathy.ac.in','2026-03-19 06:50:22'),('HU11154','Mr','SHYAMSUNDAR S','1',17,'shyamsundar@bitsathy.ac.in','2026-03-19 06:50:22'),('HU11159','Dr','JAYA K','1',17,'jayak@bitsathy.ac.in','2026-03-19 06:50:22'),('HU11201','Dr','SAMSONRAJ C','1',17,'SAMSONRAJC@bitsathy.ac.in','2026-03-19 06:50:22'),('HU2351','Mr','RANGANATHAN A','8',17,'ranganathana@bitsathy.ac.in','2026-03-19 06:50:22'),('IS10823','Mr','GOPAL R','3',18,'gopalr@bitsathy.ac.in','2026-03-19 06:50:22'),('IS10829','Mr','PANDIYAN M','3',18,'pandiyanm@bitsathy.ac.in','2026-03-19 06:50:22'),('IS10850','Ms','POORNIMA A','1',18,'poornimaa@bitsathy.ac.in','2026-03-19 06:50:22'),('IS10944','Mr','SOMASUNDARAM K','3',18,'somasundaramk@bitsathy.ac.in','2026-03-19 06:50:22'),('IS1899','Dr','ANANDAKUMAR K','3',18,'anandakumark@bitsathy.ac.in','2026-03-19 06:50:22'),('IT10262','Ms','SABARMATHI K R','3',19,'sabarmathi@bitsathy.ac.in','2026-03-19 06:50:22'),('IT10395','Dr','SRI VINITHA V','5',19,'srivinitha@bitsathy.ac.in','2026-03-19 06:50:22'),('IT10544','Mr','VINOTH M','3',19,'vinothm@bitsathy.ac.in','2026-03-19 06:50:22'),('IT10571','Mrs','SOBIYAA P','3',19,'sobiyaa@bitsathy.ac.in','2026-03-19 06:50:22'),('IT10736','Mrs','JANANI T','2',19,'jananit@bitsathy.ac.in','2026-03-19 06:50:22'),('IT10803','Mrs','PRIYA L','3',19,'priyal@bitsathy.ac.in','2026-03-19 06:50:22'),('IT10824','Dr','CHANDRAPRABHA K','5',19,'chandraprabhak@bitsathy.ac.in','2026-03-19 06:50:22'),('IT10845','Dr','VENKATESAN R','5',19,'venkatesanr@bitsathy.ac.in','2026-03-19 06:50:22'),('IT10846','Mr','SELVAKUMAR M','3',19,'selvakumarm@bitsathy.ac.in','2026-03-19 06:50:22'),('IT10941','Ms','NIKITHA M','2',19,'nikitham@bitsathy.ac.in','2026-03-19 06:50:22'),('IT11040','Dr','PRIYA J','5',19,'priyajn@bitsathy.ac.in','2026-03-19 06:50:22'),('IT11056','Dr','SADHASIVAM N','6',19,'sadhasivamn@bitsathy.ac.in','2026-03-19 06:50:22'),('IT11105','Mrs','SANTHIYA B','1',19,'santhiyab@bitsathy.ac.in','2026-03-19 06:50:22'),('IT11124','Ms','MUTHUMEENA S','1',19,'muthumeena@bitsathy.ac.in','2026-03-19 06:50:22'),('IT11128','Dr','TAMILTHENDRAL M','3',19,'tamilthendral@bitsathy.ac.in','2026-03-19 06:50:22'),('IT11129','Dr','NIVEDHA S','3',19,'nivedha@bitsathy.ac.in','2026-03-19 06:50:22'),('IT11132','Mrs','KAVITHA V','1',19,'kavitha@bitsathy.ac.in','2026-03-19 06:50:22'),('IT11140','Mrs','PRIYA A','1',19,'priyaa@bitsathy.ac.in','2026-03-19 06:50:22'),('IT11142','Mrs','KEERTHANA K','2',19,'keerthana@bitsathy.ac.in','2026-03-19 06:50:22'),('IT11144','Mrs','SHANGARA NARAYANEE N P','1',19,'shangaranarayanee@bitsathy.ac.in','2026-03-19 06:50:22'),('IT11146','Ms','INDHU BHASHINI V','1',19,'indhubhashiniv@bitsathy.ac.in','2026-03-19 06:50:22'),('IT11148','Mr','MOHEMMED YOUSUF','2',19,'mohemmedyousuf@bitsathy.ac.in','2026-03-19 06:50:22'),('IT11149','Mr','SENTHILNATHAN S','2',19,'senthilnathans@bitsathy.ac.in','2026-03-19 06:50:22'),('IT11155','Mrs','DEEPA SUMATHI M','1',19,'deepasumathim@bitsathy.ac.in','2026-03-19 06:50:22'),('IT11160','Mrs','ELAVARASI T','1',19,'elavarasit@bitsathy.ac.in','2026-03-19 06:50:22'),('IT11173','Mrs','GAYATHRI D','1',19,'gayathrid@bitsathy.ac.in','2026-03-19 06:50:22'),('IT11195','Mr','SATHYARAJ S','2',19,'sathyarajs@bitsathy.ac.in','2026-03-19 06:50:22'),('IT11196','Ms','MANISHA G','1',19,'manishag@bitsathy.ac.in','2026-03-19 06:50:22'),('IT1441','Dr','PAARIVALLAL RA','5',19,'parivallalr@bitsathy.ac.in','2026-03-19 06:50:22'),('IT1442','Dr','PALANISAMY C','6',19,'cpalanisamy@bitsathy.ac.in','2026-03-19 06:50:22'),('IT1764','Dr','SATHIS KUMAR K','5',19,'sathiskumark@bitsathy.ac.in','2026-03-19 06:50:22'),('IT1846','Dr','NAVEENA S','5',19,'naveena@bitsathy.ac.in','2026-03-19 06:50:22'),('IT2078','Mr','PRABHU P S','2',19,'prabhups@bitsathy.ac.in','2026-03-19 06:50:22'),('IT2771','Dr','NATARAJ N','5',19,'nataraj@bitsathy.ac.in','2026-03-19 06:50:22'),('MA10071','Mrs','PREETHA R','3',20,'preetha@bitsathy.ac.in','2026-03-19 06:50:22'),('MA10119','Dr','SARANYA D','3',20,'saranyad@bitsathy.ac.in','2026-03-19 06:50:22'),('MA10202','Mr','KARUPPUSAMY M','3',20,'karuppusamy@bitsathy.ac.in','2026-03-19 06:50:22'),('MA10347','Mrs','KARTHIKA M','3',20,'karthikam@bitsathy.ac.in','2026-03-19 06:50:22'),('MA10388','Dr','SELVI S','3',20,'selvi@bitsathy.ac.in','2026-03-19 06:50:22'),('MA10452','Mr','KALAISELVAN S','3',20,'kalaiselvan@bitsathy.ac.in','2026-03-19 06:50:22'),('MA10518','Dr','PRABAKARAN P','3',20,'prabakaran@bitsathy.ac.in','2026-03-19 06:50:22'),('MA10763','Dr','REVATHI V M','3',20,'revathivm@bitsathy.ac.in','2026-03-19 06:50:22'),('MA10986','Dr','GOMATHI M','2',20,'gomathim@bitsathy.ac.in','2026-03-19 06:50:22'),('MA11017','Dr','GAYATHIRI B','3',20,'gayathirib@bitsathy.ac.in','2026-03-19 06:50:22'),('MA11028','Mr','SURESH R','2',20,'sureshr@bitsathy.ac.in','2026-03-19 06:50:22'),('MA11070','Dr','MALATHI M','2',20,'malathim@bitsathy.ac.in','2026-03-19 06:50:22'),('MA11122','Dr','AKALYADEVI K','2',20,'akalyadevi@bitsathy.ac.in','2026-03-19 06:50:22'),('MA11181','Dr','HEMALATHA B','1',20,'hemalathab@bitsathy.ac.in','2026-03-19 06:50:22'),('MA1303','Dr','INDIRANI C','3',20,'indiranic@bitsathy.ac.in','2026-03-19 06:50:22'),('MA1334','Dr','PRABHAVATHI K','3',20,'prabhavathik@bitsathy.ac.in','2026-03-19 06:50:22'),('MA1342','Dr','VINOTHINI V R','3',20,'vinothinivr@bitsathy.ac.in','2026-03-19 06:50:22'),('MA1373','Dr','SARAVANA MOORTHI P','3',20,'saravanamoorthip@bitsathy.ac.in','2026-03-19 06:50:22'),('MA1465','Dr','PRAKASH K','3',20,'prakashk@bitsathy.ac.in','2026-03-19 06:50:22'),('MA1566','Dr','PARIMALA M','5',20,'parimalam@bitsathy.ac.in','2026-03-19 06:50:22'),('MA1702','Dr','UMAMAGESWARI D','3',20,'umamageswarid@bitsathy.ac.in','2026-03-19 06:50:22'),('MC10149','Dr','SIVABALAKRISHNAN R','5',22,'sivabalakrishnan@bitsathy.ac.in','2026-03-19 06:50:22'),('MC10299','Mr','VIGNESH S','3',22,'vignesh@bitsathy.ac.in','2026-03-19 06:50:22'),('MC10369','Dr','NIJANDHAN K','3',22,'nijandhan@bitsathy.ac.in','2026-03-19 06:50:22'),('MC10412','Mr','RAGHUNATH M','5',22,'raghunath@bitsathy.ac.in','2026-03-19 06:50:22'),('MC10450','Dr','DHINESH S K','5',22,'dhineshsk@bitsathy.ac.in','2026-03-19 06:50:22'),('MC10664','Dr','SIDDHARTHAN B','3',22,'siddharthan@bitsathy.ac.in','2026-03-19 06:50:22'),('MC10697','Dr','VADIVEL VIVEK V','3',22,'vadivelvivek@bitsathy.ac.in','2026-03-19 06:50:22'),('MC1071','Dr','SENTHIL KUMAR K L','6',22,'senthilkumarkl@bitsathy.ac.in','2026-03-19 06:50:22'),('MC10729','Dr','NAGARAJAN P','5',22,'nagarajanp@bitsathy.ac.in','2026-03-19 06:50:22'),('MC1627','Dr','RAJIEV R','5',22,'rajievr@bitsathy.ac.in','2026-03-19 06:50:22'),('MC1843','Dr','SENTHILKUMAR P','5',22,'senthilkumarp@bitsathy.ac.in','2026-03-19 06:50:22'),('MC1878','Dr','JEGADHEESWARAN S','6',22,'jegadheeswarans@bitsathy.ac.in','2026-03-19 06:50:22'),('ME10081','Dr','KUMARESAN G','6',21,'kumaresan@bitsathy.ac.in','2026-03-19 06:50:22'),('ME10098','Dr','PRADEEP A D','3',21,'pradeep@bitsathy.ac.in','2026-03-19 06:50:22'),('ME10174','Dr','MADHESWARAN S','3',21,'madheswaran@bitsathy.ac.in','2026-03-19 06:50:22'),('ME10233','Dr','SUBRAMANIYAN C','3',21,'subramaniyan@bitsathy.ac.in','2026-03-19 06:50:22'),('ME10273','Dr','BHUVANESH N','3',21,'bhuvanesh@bitsathy.ac.in','2026-03-19 06:50:22'),('ME10313','Dr','MUTHUKUMAR K','6',21,'muthukumarkm@bitsathy.ac.in','2026-03-19 06:50:22'),('ME10416','Mr','KAMAL BASHA K','2',21,'kamalbasha@bitsathy.ac.in','2026-03-19 06:50:22'),('ME10492','Dr','PRAKASH K B','3',21,'prakashkb@bitsathy.ac.in','2026-03-19 06:50:22'),('ME10673','Dr','BOOPATHIRAJA K P','3',21,'boopathiraja@bitsathy.ac.in','2026-03-19 06:50:22'),('ME10699','Dr','PRAVIN M C','5',21,'pravin@bitsathy.ac.in','2026-03-19 06:50:22'),('ME10714','Mr','CHANDRASEKARAN M','2',21,'chandrasekaran@bitsathy.ac.in','2026-03-19 06:50:22'),('ME1093','Dr','RAVI KUMAR M','6',21,'ravikumarm@bitsathy.ac.in','2026-03-19 06:50:22'),('ME1094','Dr','SENTHILKUMAR G','6',21,'senthilkumarg@bitsathy.ac.in','2026-03-19 06:50:22'),('ME1107','Dr','SASIKUMAR C','6',21,'sasikumarc@bitsathy.ac.in','2026-03-19 06:50:22'),('ME11077','Mr','JOSEPH SILVESTER K','2',29,'josephsilvester@bitsathy.ac.in','2026-03-19 06:50:22'),('ME11099','Dr','PAVANADITYA BADIDA','1',21,'pavanaditya@bitsathy.ac.in','2026-03-19 06:50:22'),('ME1335','Dr','AMARKARTHIK A','6',21,'amarkarthik@bitsathy.ac.in','2026-03-19 06:50:22'),('ME1410','Dr','RAMESH KUMAR T','6',21,'rameshkumart@bitsathy.ac.in','2026-03-19 06:50:22'),('ME1472','Dr','SIVAKUMAR K','7',21,'sivakumark@bitsathy.ac.in','2026-03-19 06:50:22'),('ME1543','Dr','ANANDHA MOORTHY A','5',21,'anandhamoorthya@bitsathy.ac.in','2026-03-19 06:50:22'),('ME1819','Dr','DINESH D','3',21,'dineshd@bitsathy.ac.in','2026-03-19 06:50:22'),('ME1820','Dr','MATHANKUMAR P','5',21,'mathankumarp@bitsathy.ac.in','2026-03-19 06:50:22'),('ME1869','Dr','VELMURUGAN S','3',21,'velmurugans@bitsathy.ac.in','2026-03-19 06:50:22'),('ME1877','Mr','SATHISHKUMAR C','3',21,'sathishkumarc@bitsathy.ac.in','2026-03-19 06:50:22'),('ME1880','Dr','SURESHKUMAR M','5',21,'sureshkumarm@bitsathy.ac.in','2026-03-19 06:50:22'),('ME1957','Dr','SUNDARRAJU G','5',21,'sundarrajug@bitsathy.ac.in','2026-03-19 06:50:22'),('ME1970','Mr','RAMAKRISHNAN A','3',21,'ramakrishnana@bitsathy.ac.in','2026-03-19 06:50:22'),('ME1974','Dr','SAKTHIVEL MURUGAN E','3',21,'sakthivelmurugane@bitsathy.ac.in','2026-03-19 06:50:22'),('ME1975','Dr','TAJDEEN A','3',21,'tajdeena@bitsathy.ac.in','2026-03-19 06:50:22'),('PH10204','Dr','PARASURAMAN P','3',24,'parasuraman@bitsathy.ac.in','2026-03-19 06:50:22'),('PH10218','Dr','ASHOKAN S','3',24,'ashokan@bitsathy.ac.in','2026-03-19 06:50:22'),('PH10380','Dr','SELVAKUMAR K','3',24,'selvakumark@bitsathy.ac.in','2026-03-19 06:50:22'),('PH10457','Dr','THIRUMOORTHY M','3',24,'thirumoorthy@bitsathy.ac.in','2026-03-19 06:50:22'),('PH1054','Dr','SADASIVAM K','6',24,'sadasivamk@bitsathy.ac.in','2026-03-19 06:50:22'),('PH10870','Dr','VANITHA K','3',24,'vanithak@bitsathy.ac.in','2026-03-19 06:50:22'),('PH10981','Dr','SUNDARAM S','2',24,'sundarams@bitsathy.ac.in','2026-03-19 06:50:22'),('PH10987','Dr','ANANDHA BABU G','2',24,'anandhababug@bitsathy.ac.in','2026-03-19 06:50:22'),('PH11015','Dr','GOPI G','1',24,'gopi@bitsathy.ac.in','2026-03-19 06:50:22'),('PH11034','Dr','SIVA G','2',24,'sivag@bitsathy.ac.in','2026-03-19 06:50:22'),('PH11036','Dr','BASKARAN P','1',24,'baskaranp@bitsathy.ac.in','2026-03-19 06:50:22'),('PH11152','Dr','PRIYADHARSINI A','1',24,'Priyadharsinia@bitsathy.ac.in','2026-03-19 06:50:22'),('PH11153','Dr','SANGEETHA K','3',24,'sangeethak@bitsathy.ac.in','2026-03-19 06:50:22'),('PH1407','Dr','VIJAYAKUMAR V N','6',24,'vijayakumarvn@bitsathy.ac.in','2026-03-19 06:50:22'),('PH1653','Dr','PONGALI SATHYA PRABU N','5',24,'pongalispn@bitsathy.ac.in','2026-03-19 06:50:22'),('PH1889','Dr','ROHINI P','3',24,'rohinip@bitsathy.ac.in','2026-03-19 06:50:22'),('SM10346','Mrs','NANDHINI B','2',25,'nandhinib@bitsathy.ac.in','2026-03-19 06:50:22'),('SM10625','Mr','SIBI JOHN A','3',25,'sibijohn@bitsathy.ac.in','2026-03-19 06:50:22'),('SM11065','Mr','SENTHIL KUMAR N','3',25,'senthilkumar@bitsathy.ac.in','2026-03-19 06:50:22'),('SM11118','Mrs','AISHWARIYA M R','1',25,'aishwariya@bitsathy.ac.in','2026-03-19 06:50:22'),('SM11133','Mr','MAGESWARAN J','2',25,'mageswaran@bitsathy.ac.in','2026-03-19 06:50:22'),('SM11186','Mr','SUGANESH S','1',25,'suganeshs@bitsathy.ac.in','2026-03-19 06:50:22'),('SM11187','Mr','DHANABALU S N','2',25,'dhanabalusn@bitsathy.ac.in','2026-03-19 06:50:22'),('SM11188','Dr','ADHINARAYANAN B','5',25,'adhinarayananb@bitsathy.ac.in','2026-03-19 06:50:22'),('SM11189','Mrs','SARANYA S','2',25,'saranyasms@bitsathy.ac.in','2026-03-19 06:50:22'),('SM11191','Dr','SATHEESH KUMAR T','5',25,'satheeshkumart@bitsathy.ac.in','2026-03-19 06:50:22'),('SM1661','Dr','MURUGAPPAN S','6',25,'murugappans@bitsathy.ac.in','2026-03-19 06:50:22'),('SM41012','Dr','SARASWATHI C','3',25,'saraswathic@bitsathy.ac.in','2026-03-19 06:50:22');
/*!40000 ALTER TABLE `faculty` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `faculty_industry_project`
--

LOCK TABLES `faculty_industry_project` WRITE;
/*!40000 ALTER TABLE `faculty_industry_project` DISABLE KEYS */;
/*!40000 ALTER TABLE `faculty_industry_project` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `faculty_industry_project_faculty`
--

LOCK TABLES `faculty_industry_project_faculty` WRITE;
/*!40000 ALTER TABLE `faculty_industry_project_faculty` DISABLE KEYS */;
/*!40000 ALTER TABLE `faculty_industry_project_faculty` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `faculty_industry_project_student`
--

LOCK TABLES `faculty_industry_project_student` WRITE;
/*!40000 ALTER TABLE `faculty_industry_project_student` DISABLE KEYS */;
/*!40000 ALTER TABLE `faculty_industry_project_student` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `faculty_journal_reviewer`
--

LOCK TABLES `faculty_journal_reviewer` WRITE;
/*!40000 ALTER TABLE `faculty_journal_reviewer` DISABLE KEYS */;
/*!40000 ALTER TABLE `faculty_journal_reviewer` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `faculty_trained_by_industry`
--

LOCK TABLES `faculty_trained_by_industry` WRITE;
/*!40000 ALTER TABLE `faculty_trained_by_industry` DISABLE KEYS */;
/*!40000 ALTER TABLE `faculty_trained_by_industry` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guest_lecture_delivered`
--

LOCK TABLES `guest_lecture_delivered` WRITE;
/*!40000 ALTER TABLE `guest_lecture_delivered` DISABLE KEYS */;
/*!40000 ALTER TABLE `guest_lecture_delivered` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `industries`
--

LOCK TABLES `industries` WRITE;
/*!40000 ALTER TABLE `industries` DISABLE KEYS */;
INSERT INTO `industries` VALUES (1,'ADOBE CERTIFIED PROFESSIONAL'),(2,'ADOBE ILLUSTRATOR FOR FASHION'),(3,'AGRIBUSINESS MANAGEMENT'),(4,'ANSYS / CFD / FEA SIMULATION TRAINING'),(5,'APPAREL PRODUCTION & MERCHANDISING'),(6,'AUTOCAD / SOLIDWORKS PROFESSIONAL CERTIFICATION'),(7,'AUTODESK CERTIFIED PROFESSIONAL: AUTOCAD FOR DESIGN AND DRAFTING'),(8,'AUTOMATION WITH PLC/SCADA'),(9,'AWS CERTIFIED AI PRACTITIONER'),(10,'AWS CERTIFIED CLOUD PRACTITIONER'),(11,'AWS CERTIFIED MACHINE LEARNING'),(12,'BIOINFORMATICS SPECIALIZATION'),(13,'BIOTECHNOLOGY FUNDAMENTALS'),(14,'CERTIFIED BIOMEDICAL EQUIPMENT TECHNICIAN (CBET)'),(15,'CERTIFIED BUSINESS ANALYST'),(16,'CERTIFIED CLOUD PRACTITIONER'),(17,'CERTIFIED ELECTRICAL POWER ENGINEER'),(18,'CERTIFIED ELECTRONICS TECHNICIAN (CETA)'),(19,'CERTIFIED ETHICAL HACKER (CEH)'),(20,'CERTIFIED FINANCIAL ANALYST (CFA)'),(21,'CERTIFIED INFORMATION SYSTEMS SECURITY PROFESSIONAL (CISSP)'),(22,'CERTIFIED MANUFACTURING ENGINEER – SME'),(23,'CERTIFIED RF ENGINEER'),(24,'CHEMICAL ENGINEERING THERMODYNAMICS'),(25,'CISCO CERTIFIED NETWORK ASSOCIATE (CCNA)'),(26,'COMPTIA A+ / NETWORK+ CERTIFICATION'),(27,'COMPUTATIONAL PHYSICS WITH PYTHON'),(28,'CREATIVE WRITING'),(29,'CYBERSECURITY ANALYST'),(30,'CYBERSECURITY FUNDAMENTALS'),(31,'DATA SCIENCE FOR PHYSICISTS'),(32,'DATA SCIENCE MATH SKILLS'),(33,'DATA STRUCTURES AND ALGORITHMS SPECIALIZATION'),(34,'DEEP LEARNING SPECIALIZATION'),(35,'DIGITAL MARKETING SPECIALIZATION'),(36,'E WASTE RECYCLING BUSINESS'),(37,'EFFECTIVE COMMUNICATION SKILLS'),(38,'EMBEDDED SYSTEMS CERTIFICATION'),(39,'FASHION DESIGN CERTIFICATION'),(40,'FOOD SAFETY AND STANDARDS (FSSAI CERTIFICATION)'),(41,'FUNDAMENTALS OF DIGITAL MARKETING'),(42,'GOOGLE DATA ANALYTICS CERTIFICATE'),(43,'GOOGLE IT SUPPORT PROFESSIONAL CERTIFICATE'),(44,'HACCP CERTIFICATION'),(45,'HARVARD CS50X + BUSINESS STRATEGY'),(46,'IBM DATA SCIENCE PROFESSIONAL CERTIFICATE'),(47,'INDUSTRIAL BIOTECHNOLOGY'),(48,'INDUSTRIAL IOT (IIOT) CERTIFICATION'),(49,'INTERACTION DESIGN'),(50,'INTRODUCTION TO FPGA DESIGN FOR EMBEDDED SYSTEMS'),(51,'INTRODUCTION TO MEDICAL IMAGING'),(52,'ISO 22000 FOOD SAFETY MANAGEMENT SYSTEM'),(53,'ITECH METAL ALLOYS'),(54,'JAVA FOUNDATIONS'),(55,'JAVA FULL STACK'),(56,'JAVA SE 17 DEVELOPER'),(57,'LABVIEW CERTIFICATION'),(58,'MACHINE LEARNING MATH'),(59,'MATHEMATICAL THINKING'),(60,'MATHEMATICS FOR MACHINE LEARNING SPECIALIZATION'),(61,'MATLAB FOR ELECTRICAL ENGINEERS'),(62,'MATLAB FOR ROBOTICS & MECHATRONICS'),(63,'MEDICAL DEVICE REGULATORY AFFAIRS'),(64,'MEDICAL EQUIPMENT TROUBLESHOOTING'),(65,'MICROSOFT CERTIFIED: AZURE AI ENGINEER ASSOCIATE'),(66,'MICROSOFT CERTIFIED: AZURE FUNDAMENTALS / SOLUTIONS ARCHITECT'),(67,'MYSQL 8.0 DATABASE DEVELOPER'),(68,'MYSQL IMPLEMENTATION ASSOCIATE'),(69,'NVIDIA-CERTIFIED GENERATIVE AI LLMS SPECIALIZATION'),(70,'ORACLE AI VECTOR SEARCH PROFESSIONAL'),(71,'ORACLE ANALYTICS CLOUD 2025 PROFESSIONAL'),(72,'ORACLE APEX CLOUD DEVELOPER PROFESSIONAL'),(73,'ORACLE AUTONOMOUS DATABASE CLOUD 2025 PROFESSIONAL'),(74,'ORACLE CERTIFIED JAVA PROGRAMMER / PYTHON'),(75,'ORACLE CLOUD DATABASE SERVICES 2025 PROFESSIONAL'),(76,'ORACLE CLOUD INFRASTRUCTURE 2025 AI FOUNDATIONS ASSOCIATE'),(77,'ORACLE CLOUD INFRASTRUCTURE 2025 APPLICATION INTEGRATION PROFESSIONAL'),(78,'ORACLE CLOUD INFRASTRUCTURE 2025 ARCHITECT ASSOCIATE'),(79,'ORACLE CLOUD INFRASTRUCTURE 2025 DATA SCIENCE PROFESSIONAL'),(80,'ORACLE CLOUD INFRASTRUCTURE 2025 DEVELOPER PROFESSIONAL'),(81,'ORACLE CLOUD INFRASTRUCTURE 2025 DEVOPS PROFESSIONAL'),(82,'ORACLE CLOUD INFRASTRUCTURE 2025 FOUNDATIONS ASSOCIATE'),(83,'ORACLE CLOUD INFRASTRUCTURE 2025 MIGRATION ARCHITECT PROFESSIONAL'),(84,'ORACLE CLOUD INFRASTRUCTURE 2025 MULTICLOUD ARCHITECT PROFESSIONAL'),(85,'ORACLE CLOUD INFRASTRUCTURE 2025 NETWORKING PROFESSIONAL'),(86,'ORACLE CLOUD INFRASTRUCTURE 2025 OBSERVABILITY PROFESSIONAL'),(87,'ORACLE DATA PLATFORM 2025 FOUNDATIONS ASSOCIATE'),(88,'ORACLE DATABASE PROGRAM WITH PL/SQL'),(89,'ORACLE DATABASE SQL'),(90,'ORACLE REDWOOD APPLICATION 2025 DEVELOPER ASSOCIATE'),(91,'PLC & SCADA AUTOMATION CERTIFICATION'),(92,'PMP (PROJECT MANAGEMENT PROFESSIONAL) – PMI'),(93,'POST-HARVEST TECHNOLOGY'),(94,'POWER SECTOR SKILLS (GREEN ENERGY, SAFETY, POWER, ETC.)'),(95,'PRECISION AGRICULTURE TECHNOLOGY CERTIFICATE'),(96,'PROCESS AUTOMATION USING DCS/PLC/SCADA'),(97,'PROCESS DESIGN AND SIMULATION'),(98,'PROFESSIONAL CERTIFICATE IN AI & ML'),(99,'PROJECT MANAGEMENT PROFESSIONAL (PMP)'),(100,'PYTHON FOR EVERYBODY'),(101,'PYTHON PROGRAMMING'),(102,'QUANTUM MECHANICS CERTIFICATION'),(103,'REMOTE SENSING AND GIS FOR AGRICULTURE'),(104,'ROBOTICS SPECIALIZATION'),(105,'SOLAR WATER HEATER COURSE'),(106,'STAAD PRO / ETABS STRUCTURAL DESIGN CERTIFICATION'),(107,'SUSTAINABLE FASHION'),(108,'SUSTAINABLE TEXTILE MANUFACTURING'),(109,'SUSTAINABLE TEXTILES'),(110,'TENSORFLOW DEVELOPER CERTIFICATE'),(111,'TESOL / TEFL CERTIFICATION FOR ENGLISH LANGUAGE TEACHING'),(112,'TESOL/TOEFL CERTIFICATION'),(113,'TEXTILE TESTING & QUALITY CONTROL'),(114,'UI/UX DESIGN SPECIALIZATION'),(115,'VLSI DESIGN USING CADENCE TOOLS'),(116,'WINTEX PROCESSING MILLS');
/*!40000 ALTER TABLE `industries` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `industry_advisor`
--

LOCK TABLES `industry_advisor` WRITE;
/*!40000 ALTER TABLE `industry_advisor` DISABLE KEYS */;
/*!40000 ALTER TABLE `industry_advisor` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `international_visit`
--

LOCK TABLES `international_visit` WRITE;
/*!40000 ALTER TABLE `international_visit` DISABLE KEYS */;
/*!40000 ALTER TABLE `international_visit` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `irp_industry_expected_outcomes`
--

LOCK TABLES `irp_industry_expected_outcomes` WRITE;
/*!40000 ALTER TABLE `irp_industry_expected_outcomes` DISABLE KEYS */;
/*!40000 ALTER TABLE `irp_industry_expected_outcomes` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `irp_industry_points_discussed`
--

LOCK TABLES `irp_industry_points_discussed` WRITE;
/*!40000 ALTER TABLE `irp_industry_points_discussed` DISABLE KEYS */;
/*!40000 ALTER TABLE `irp_industry_points_discussed` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `irp_visit`
--

LOCK TABLES `irp_visit` WRITE;
/*!40000 ALTER TABLE `irp_visit` DISABLE KEYS */;
/*!40000 ALTER TABLE `irp_visit` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `irp_visit_faculty`
--

LOCK TABLES `irp_visit_faculty` WRITE;
/*!40000 ALTER TABLE `irp_visit_faculty` DISABLE KEYS */;
/*!40000 ALTER TABLE `irp_visit_faculty` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `irp_visit_industry`
--

LOCK TABLES `irp_visit_industry` WRITE;
/*!40000 ALTER TABLE `irp_visit_industry` DISABLE KEYS */;
/*!40000 ALTER TABLE `irp_visit_industry` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `lab_developed_by_industry`
--

LOCK TABLES `lab_developed_by_industry` WRITE;
/*!40000 ALTER TABLE `lab_developed_by_industry` DISABLE KEYS */;
/*!40000 ALTER TABLE `lab_developed_by_industry` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `mou`
--

LOCK TABLES `mou` WRITE;
/*!40000 ALTER TABLE `mou` DISABLE KEYS */;
/*!40000 ALTER TABLE `mou` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `mou_faculty`
--

LOCK TABLES `mou_faculty` WRITE;
/*!40000 ALTER TABLE `mou_faculty` DISABLE KEYS */;
/*!40000 ALTER TABLE `mou_faculty` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `mou_purpose`
--

LOCK TABLES `mou_purpose` WRITE;
/*!40000 ALTER TABLE `mou_purpose` DISABLE KEYS */;
/*!40000 ALTER TABLE `mou_purpose` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `newsletter_archive`
--

LOCK TABLES `newsletter_archive` WRITE;
/*!40000 ALTER TABLE `newsletter_archive` DISABLE KEYS */;
/*!40000 ALTER TABLE `newsletter_archive` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `notable_achievements`
--

LOCK TABLES `notable_achievements` WRITE;
/*!40000 ALTER TABLE `notable_achievements` DISABLE KEYS */;
/*!40000 ALTER TABLE `notable_achievements` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `online_course`
--

LOCK TABLES `online_course` WRITE;
/*!40000 ALTER TABLE `online_course` DISABLE KEYS */;
/*!40000 ALTER TABLE `online_course` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `paper_presentation`
--

LOCK TABLES `paper_presentation` WRITE;
/*!40000 ALTER TABLE `paper_presentation` DISABLE KEYS */;
/*!40000 ALTER TABLE `paper_presentation` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `paper_presentation_ext_faculty`
--

LOCK TABLES `paper_presentation_ext_faculty` WRITE;
/*!40000 ALTER TABLE `paper_presentation_ext_faculty` DISABLE KEYS */;
/*!40000 ALTER TABLE `paper_presentation_ext_faculty` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `paper_presentation_faculty`
--

LOCK TABLES `paper_presentation_faculty` WRITE;
/*!40000 ALTER TABLE `paper_presentation_faculty` DISABLE KEYS */;
/*!40000 ALTER TABLE `paper_presentation_faculty` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `paper_presentation_industry`
--

LOCK TABLES `paper_presentation_industry` WRITE;
/*!40000 ALTER TABLE `paper_presentation_industry` DISABLE KEYS */;
/*!40000 ALTER TABLE `paper_presentation_industry` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `paper_presentation_student`
--

LOCK TABLES `paper_presentation_student` WRITE;
/*!40000 ALTER TABLE `paper_presentation_student` DISABLE KEYS */;
/*!40000 ALTER TABLE `paper_presentation_student` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `professional_body_membership`
--

LOCK TABLES `professional_body_membership` WRITE;
/*!40000 ALTER TABLE `professional_body_membership` DISABLE KEYS */;
/*!40000 ALTER TABLE `professional_body_membership` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_approval_type`
--

LOCK TABLES `ref_approval_type` WRITE;
/*!40000 ALTER TABLE `ref_approval_type` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_approval_type` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_approval_type_short`
--

LOCK TABLES `ref_approval_type_short` WRITE;
/*!40000 ALTER TABLE `ref_approval_type_short` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_approval_type_short` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_category_sharing`
--

LOCK TABLES `ref_category_sharing` WRITE;
/*!40000 ALTER TABLE `ref_category_sharing` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_category_sharing` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_coe_type`
--

LOCK TABLES `ref_coe_type` WRITE;
/*!40000 ALTER TABLE `ref_coe_type` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_coe_type` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_consultancy_category`
--

LOCK TABLES `ref_consultancy_category` WRITE;
/*!40000 ALTER TABLE `ref_consultancy_category` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_consultancy_category` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_consultancy_type`
--

LOCK TABLES `ref_consultancy_type` WRITE;
/*!40000 ALTER TABLE `ref_consultancy_type` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_consultancy_type` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_core_sector`
--

LOCK TABLES `ref_core_sector` WRITE;
/*!40000 ALTER TABLE `ref_core_sector` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_core_sector` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_course_type`
--

LOCK TABLES `ref_course_type` WRITE;
/*!40000 ALTER TABLE `ref_course_type` DISABLE KEYS */;
INSERT INTO `ref_course_type` VALUES (1,'AICTE'),(2,'CEC'),(3,'CISCO'),(4,'COURSERA'),(5,'edX'),(6,'GOOGLE'),(7,'IBM'),(8,'IGNOU'),(9,'IIMB'),(10,'INI'),(11,'NITTTR'),(12,'MICROSOFT'),(13,'NMEICT'),(14,'NPTEL'),(15,'SWAYAM'),(16,'ICMR'),(17,'UDEMY'),(18,'UGC'),(19,'AICTE QIP PG certificate Programme'),(20,'AI Infinity'),(21,'Oracle'),(22,'Other');
/*!40000 ALTER TABLE `ref_course_type` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_doc_type`
--

LOCK TABLES `ref_doc_type` WRITE;
/*!40000 ALTER TABLE `ref_doc_type` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_doc_type` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_duration_unit`
--

LOCK TABLES `ref_duration_unit` WRITE;
/*!40000 ALTER TABLE `ref_duration_unit` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_duration_unit` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_e_content_type`
--

LOCK TABLES `ref_e_content_type` WRITE;
/*!40000 ALTER TABLE `ref_e_content_type` DISABLE KEYS */;
INSERT INTO `ref_e_content_type` VALUES (1,'PERSONALIZED_SKILL (PS)'),(2,'TUTORIAL'),(3,'E-BOOK'),(4,'VIDEO LECTURES'),(5,'ACADEMIC BOOK'),(6,'ASSESSMENT'),(7,'ARTICLE'),(8,'BLOG WRITING'),(9,'COURSE BOARD GRAPHICS'),(10,'DATABASE CREATION'),(11,'E-LEARNING GAME'),(12,'NPTEL TRANSLATION'),(13,'PODCAST'),(14,'SKILL-SCOURCE-BOOK'),(15,'YOUTUBE-VIDEO'),(16,'MAGAZINE'),(17,'NEW METHODOLOGY IN TLP/ASSESSMENT'),(18,'NEW COURSE IN CURICULLAM'),(19,'Other');
/*!40000 ALTER TABLE `ref_e_content_type` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_event_level`
--

LOCK TABLES `ref_event_level` WRITE;
/*!40000 ALTER TABLE `ref_event_level` DISABLE KEYS */;
INSERT INTO `ref_event_level` VALUES (1,'State'),(2,'National'),(3,'International'),(4,'Institute (BIT)');
/*!40000 ALTER TABLE `ref_event_level` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_event_mode`
--

LOCK TABLES `ref_event_mode` WRITE;
/*!40000 ALTER TABLE `ref_event_mode` DISABLE KEYS */;
INSERT INTO `ref_event_mode` VALUES (1,'Online'),(2,'Offline'),(3,'Hybrid');
/*!40000 ALTER TABLE `ref_event_mode` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_event_type_attended`
--

LOCK TABLES `ref_event_type_attended` WRITE;
/*!40000 ALTER TABLE `ref_event_type_attended` DISABLE KEYS */;
INSERT INTO `ref_event_type_attended` VALUES (1,'Certificate course'),(2,'Conference attended-without presentation'),(3,'Educational fair'),(4,'Faculty exchange programme'),(5,'FDP'),(6,'Guest Lecture'),(7,'Non-technical events'),(8,'One credit course'),(9,'Orientation programme'),(10,'Seminar'),(11,'Session chair'),(12,'STTP'),(13,'Summer School'),(14,'Training'),(15,'Value-Added course'),(16,'Webinar'),(17,'Winter School'),(18,'Workshop'),(19,'Hands-On Training'),(20,'PS-Certification (BIT)'),(21,'NPTEL-FDP'),(22,'AICTE-UHV-FDP'),(23,'Innovation Ambassador- IIC Certificate'),(24,'CEE-ACO & BEI panelist workshop certificate'),(25,'Other');
/*!40000 ALTER TABLE `ref_event_type_attended` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_event_type_organized`
--

LOCK TABLES `ref_event_type_organized` WRITE;
/*!40000 ALTER TABLE `ref_event_type_organized` DISABLE KEYS */;
INSERT INTO `ref_event_type_organized` VALUES (1,'HRD Programs'),(2,'Certificate course'),(3,'Partial Delivery of Course'),(4,'Competitions for BIT students'),(5,'Conference'),(6,'Faculty training Program'),(7,'FDP/STTP'),(8,'Guest Lecture'),(9,'Hands on training'),(10,'Leader of the Week'),(11,'Non Technical Event'),(12,'One credit course'),(13,'Orientation program'),(14,'Refresher Program'),(15,'Seminar'),(16,'Technical Events'),(17,'Webinar'),(18,'Workshop'),(19,'Non-Teaching training programme'),(20,'Others'),(21,'Symposium'),(22,'Interaction');
/*!40000 ALTER TABLE `ref_event_type_organized` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_external_examiner_purpose`
--

LOCK TABLES `ref_external_examiner_purpose` WRITE;
/*!40000 ALTER TABLE `ref_external_examiner_purpose` DISABLE KEYS */;
INSERT INTO `ref_external_examiner_purpose` VALUES (1,'Central Valuation'),(2,'Flying Squad'),(3,'Hall invigilator'),(4,'Practical/Project viva External Examiner'),(5,'Question Paper Scrutiny'),(6,'QP Setter'),(7,'University Representative');
/*!40000 ALTER TABLE `ref_external_examiner_purpose` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_financial_assistance`
--

LOCK TABLES `ref_financial_assistance` WRITE;
/*!40000 ALTER TABLE `ref_financial_assistance` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_financial_assistance` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_fund_type`
--

LOCK TABLES `ref_fund_type` WRITE;
/*!40000 ALTER TABLE `ref_fund_type` DISABLE KEYS */;
INSERT INTO `ref_fund_type` VALUES (1,'Self'),(2,'Management'),(3,'Funding Agency');
/*!40000 ALTER TABLE `ref_fund_type` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_industry_org_type`
--

LOCK TABLES `ref_industry_org_type` WRITE;
/*!40000 ALTER TABLE `ref_industry_org_type` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_industry_org_type` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_industry_project_type`
--

LOCK TABLES `ref_industry_project_type` WRITE;
/*!40000 ALTER TABLE `ref_industry_project_type` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_industry_project_type` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_iqac_status`
--

LOCK TABLES `ref_iqac_status` WRITE;
/*!40000 ALTER TABLE `ref_iqac_status` DISABLE KEYS */;
INSERT INTO `ref_iqac_status` VALUES (1,'Initiated'),(2,'Approved'),(3,'Rejected');
/*!40000 ALTER TABLE `ref_iqac_status` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_irp_interaction_mode`
--

LOCK TABLES `ref_irp_interaction_mode` WRITE;
/*!40000 ALTER TABLE `ref_irp_interaction_mode` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_irp_interaction_mode` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_irp_points_discussed`
--

LOCK TABLES `ref_irp_points_discussed` WRITE;
/*!40000 ALTER TABLE `ref_irp_points_discussed` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_irp_points_discussed` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_irp_purpose`
--

LOCK TABLES `ref_irp_purpose` WRITE;
/*!40000 ALTER TABLE `ref_irp_purpose` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_irp_purpose` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_journal_indexing`
--

LOCK TABLES `ref_journal_indexing` WRITE;
/*!40000 ALTER TABLE `ref_journal_indexing` DISABLE KEYS */;
INSERT INTO `ref_journal_indexing` VALUES (1,'Scopus'),(2,'Web of Science'),(3,'SCI'),(4,'Others');
/*!40000 ALTER TABLE `ref_journal_indexing` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_lab_layout_type`
--

LOCK TABLES `ref_lab_layout_type` WRITE;
/*!40000 ALTER TABLE `ref_lab_layout_type` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_lab_layout_type` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_membership_category`
--

LOCK TABLES `ref_membership_category` WRITE;
/*!40000 ALTER TABLE `ref_membership_category` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_membership_category` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_membership_level`
--

LOCK TABLES `ref_membership_level` WRITE;
/*!40000 ALTER TABLE `ref_membership_level` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_membership_level` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_membership_type`
--

LOCK TABLES `ref_membership_type` WRITE;
/*!40000 ALTER TABLE `ref_membership_type` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_membership_type` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_membership_validity_type`
--

LOCK TABLES `ref_membership_validity_type` WRITE;
/*!40000 ALTER TABLE `ref_membership_validity_type` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_membership_validity_type` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_mou_based_on`
--

LOCK TABLES `ref_mou_based_on` WRITE;
/*!40000 ALTER TABLE `ref_mou_based_on` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_mou_based_on` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_mou_duration_unit`
--

LOCK TABLES `ref_mou_duration_unit` WRITE;
/*!40000 ALTER TABLE `ref_mou_duration_unit` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_mou_duration_unit` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_mou_purpose`
--

LOCK TABLES `ref_mou_purpose` WRITE;
/*!40000 ALTER TABLE `ref_mou_purpose` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_mou_purpose` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_mou_type`
--

LOCK TABLES `ref_mou_type` WRITE;
/*!40000 ALTER TABLE `ref_mou_type` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_mou_type` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_newsletter_category`
--

LOCK TABLES `ref_newsletter_category` WRITE;
/*!40000 ALTER TABLE `ref_newsletter_category` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_newsletter_category` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_organizer_type`
--

LOCK TABLES `ref_organizer_type` WRITE;
/*!40000 ALTER TABLE `ref_organizer_type` DISABLE KEYS */;
INSERT INTO `ref_organizer_type` VALUES (1,'BIT'),(2,'Industry'),(3,'Foreign Institute'),(4,'Institute in India'),(5,'Others');
/*!40000 ALTER TABLE `ref_organizer_type` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_programme_level`
--

LOCK TABLES `ref_programme_level` WRITE;
/*!40000 ALTER TABLE `ref_programme_level` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_programme_level` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_recognition_type`
--

LOCK TABLES `ref_recognition_type` WRITE;
/*!40000 ALTER TABLE `ref_recognition_type` DISABLE KEYS */;
INSERT INTO `ref_recognition_type` VALUES (1,'Reviewer'),(2,'Editorial Board Member'),(3,'Editor in Chief'),(4,'Advisory board Member'),(5,'Others');
/*!40000 ALTER TABLE `ref_recognition_type` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_resource_person_category`
--

LOCK TABLES `ref_resource_person_category` WRITE;
/*!40000 ALTER TABLE `ref_resource_person_category` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_resource_person_category` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_scope_of_work`
--

LOCK TABLES `ref_scope_of_work` WRITE;
/*!40000 ALTER TABLE `ref_scope_of_work` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_scope_of_work` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_sector_type`
--

LOCK TABLES `ref_sector_type` WRITE;
/*!40000 ALTER TABLE `ref_sector_type` DISABLE KEYS */;
INSERT INTO `ref_sector_type` VALUES (1,'Private'),(2,'Government');
/*!40000 ALTER TABLE `ref_sector_type` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_sponsorship_type`
--

LOCK TABLES `ref_sponsorship_type` WRITE;
/*!40000 ALTER TABLE `ref_sponsorship_type` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_sponsorship_type` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_technical_society`
--

LOCK TABLES `ref_technical_society` WRITE;
/*!40000 ALTER TABLE `ref_technical_society` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_technical_society` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_technical_society_status`
--

LOCK TABLES `ref_technical_society_status` WRITE;
/*!40000 ALTER TABLE `ref_technical_society_status` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_technical_society_status` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_training_event_type`
--

LOCK TABLES `ref_training_event_type` WRITE;
/*!40000 ALTER TABLE `ref_training_event_type` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_training_event_type` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_training_mode`
--

LOCK TABLES `ref_training_mode` WRITE;
/*!40000 ALTER TABLE `ref_training_mode` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_training_mode` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_vip_category`
--

LOCK TABLES `ref_vip_category` WRITE;
/*!40000 ALTER TABLE `ref_vip_category` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_vip_category` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_vip_event_type`
--

LOCK TABLES `ref_vip_event_type` WRITE;
/*!40000 ALTER TABLE `ref_vip_event_type` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_vip_event_type` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_visit_source`
--

LOCK TABLES `ref_visit_source` WRITE;
/*!40000 ALTER TABLE `ref_visit_source` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_visit_source` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ref_year_of_study`
--

LOCK TABLES `ref_year_of_study` WRITE;
/*!40000 ALTER TABLE `ref_year_of_study` DISABLE KEYS */;
INSERT INTO `ref_year_of_study` VALUES (1,'First'),(2,'Second'),(3,'Third'),(4,'Fourth');
/*!40000 ALTER TABLE `ref_year_of_study` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `resource_person`
--

LOCK TABLES `resource_person` WRITE;
/*!40000 ALTER TABLE `resource_person` DISABLE KEYS */;
/*!40000 ALTER TABLE `resource_person` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_page_access`
--

LOCK TABLES `role_page_access` WRITE;
/*!40000 ALTER TABLE `role_page_access` DISABLE KEYS */;
/*!40000 ALTER TABLE `role_page_access` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30002;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'ADMIN',1,'2026-03-19 06:01:11'),(2,'FACULTY',1,'2026-03-19 06:01:12'),(3,'HOD',1,'2026-03-19 06:01:12'),(4,'DEAN',1,'2026-03-19 06:01:13'),(5,'IQAC',1,'2026-03-19 06:01:13');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `special_lab`
--

LOCK TABLES `special_lab` WRITE;
/*!40000 ALTER TABLE `special_lab` DISABLE KEYS */;
INSERT INTO `special_lab` VALUES (1,'PIC','Product Innovation Centre',1,'2026-03-19 06:08:18','2026-03-19 06:08:18'),(2,'BT','Biotechnology',1,'2026-03-19 06:08:18','2026-03-19 06:08:18'),(3,'CIR','Circuit',1,'2026-03-19 06:08:18','2026-03-19 06:08:18'),(4,'IT','Information Technology',1,'2026-03-19 06:08:18','2026-03-19 06:08:18'),(5,'MS','Mechanical Sciences',1,'2026-03-19 06:08:18','2026-03-19 06:08:18'),(6,'CIV','Civil',1,'2026-03-19 06:08:18','2026-03-19 06:08:18'),(7,'FT','Fashion Technology',1,'2026-03-19 06:08:18','2026-03-19 06:08:18'),(8,'FOOD','Food Technology',1,'2026-03-19 06:08:18','2026-03-19 06:08:18');
/*!40000 ALTER TABLE `special_lab` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `students_industrial_visit`
--

LOCK TABLES `students_industrial_visit` WRITE;
/*!40000 ALTER TABLE `students_industrial_visit` DISABLE KEYS */;
/*!40000 ALTER TABLE `students_industrial_visit` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `students_iv_faculty`
--

LOCK TABLES `students_iv_faculty` WRITE;
/*!40000 ALTER TABLE `students_iv_faculty` DISABLE KEYS */;
/*!40000 ALTER TABLE `students_iv_faculty` ENABLE KEYS */;
UNLOCK TABLES;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `submissions`
--

LOCK TABLES `submissions` WRITE;
/*!40000 ALTER TABLE `submissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `submissions` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `technical_society_dept_mapping`
--

LOCK TABLES `technical_society_dept_mapping` WRITE;
/*!40000 ALTER TABLE `technical_society_dept_mapping` DISABLE KEYS */;
/*!40000 ALTER TABLE `technical_society_dept_mapping` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `training_to_industry`
--

LOCK TABLES `training_to_industry` WRITE;
/*!40000 ALTER TABLE `training_to_industry` DISABLE KEYS */;
/*!40000 ALTER TABLE `training_to_industry` ENABLE KEYS */;
UNLOCK TABLES;

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
  `faculty_id` varchar(50) DEFAULT NULL COMMENT 'Optional link for faculty user accounts',
  `role_id` int NOT NULL COMMENT 'Assigned role for page/resource access',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `faculty_id` (`faculty_id`),
  KEY `fk_3` (`role_id`),
  CONSTRAINT `fk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`),
  CONSTRAINT `fk_3` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'ranjith','ranjith@bitsathy.ac.in','','AD10543',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(2,'arunkumarr','arunkumarr@bitsathy.ac.in','','AD10628',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(3,'eswaramoorthyv','eswaramoorthyv@bitsathy.ac.in','','AD10818',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(4,'nithyapriyas','nithyapriyas@bitsathy.ac.in','','AD10838',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(5,'nishadevik','nishadevik@bitsathy.ac.in','','AD10928',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(6,'balasamyk','balasamyk@bitsathy.ac.in','','AD10931',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(7,'prabanandsc','prabanandsc@bitsathy.ac.in','','AD10936',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(8,'satheeshnp','satheeshnp@bitsathy.ac.in','','AD10945',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(9,'rajkumarvs','rajkumarvs@bitsathy.ac.in','','AD10953',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(10,'esakkimadurae','esakkimadurae@bitsathy.ac.in','','AD10955',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(11,'divyabarathip','divyabarathip@bitsathy.ac.in','','AD11009',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(12,'satheeshkumars','satheeshkumars@bitsathy.ac.in','','AD11016',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(13,'kiruthigar','kiruthigar@bitsathy.ac.in','','AD11019',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(14,'vaanathi','vaanathi@bitsathy.ac.in','','AD11023',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(15,'chozharajanp','chozharajanp@bitsathy.ac.in','','AD11026',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(16,'ashfornherminajm','ashfornherminajm@bitsathy.ac.in','','AD11041',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(17,'jeevithasv','jeevithasv@bitsathy.ac.in','','AD11042',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(18,'benitagraciathangam','benitagraciathangam@bitsathy.ac.in','','AD11068',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(19,'premkumar','premkumar@bitsathy.ac.in','','AD11069',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(20,'sundaramurthys','sundaramurthys@bitsathy.ac.in','','AD1108',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(21,'reshmits','reshmits@bitsathy.ac.in','','AD11089',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(22,'subbulakshmi','subbulakshmi@bitsathy.ac.in','','AD11096',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(23,'kalpana','kalpana@bitsathy.ac.in','','AD11104',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(24,'suriya','suriya@bitsathy.ac.in','','AD11111',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(25,'hemapriyad','hemapriyad@bitsathy.ac.in','','AD11112',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(26,'manju','manju@bitsathy.ac.in','','AD11114',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(27,'priyadharshni','priyadharshni@bitsathy.ac.in','','AD11116',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(28,'sassontaffwinmosess','sassontaffwinmosess@bitsathy.ac.in','','AD11164',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(29,'manochitra','manochitra@bitsathy.ac.in','','AD11169',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(30,'navaneethkumark','navaneethkumark@bitsathy.ac.in','','AD11193',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(31,'gomathir','gomathir@bitsathy.ac.in','','AD1444',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(32,'nandhiniss','nandhiniss@bitsathy.ac.in','','AD1963',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(33,'vasudevan','vasudevan@bitsathy.ac.in','','AG10092',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(34,'vinothkumar','vinothkumar@bitsathy.ac.in','','AG10172',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(35,'chelladurai','chelladurai@bitsathy.ac.in','','AG10503',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(36,'ananthid','ananthid@bitsathy.ac.in','','AG10895',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(37,'muthukumaravelk','muthukumaravelk@bitsathy.ac.in','','AG10994',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(38,'praveenkumard','praveenkumard@bitsathy.ac.in','','AG11049',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(39,'raghul','raghul@bitsathy.ac.in','','AG11083',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(40,'snekhaar','snekhaar@bitsathy.ac.in','','AG11178',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(41,'uvarajavc','uvarajavc@bitsathy.ac.in','','AG1312',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(42,'sudha','sudha@bitsathy.ac.in','','AM10176',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(43,'bharathia','bharathia@bitsathy.ac.in','','AM1025',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(44,'padmashreea','padmashreea@bitsathy.ac.in','','AM10795',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(45,'rajasekarss','rajasekarss@bitsathy.ac.in','','AM10907',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(46,'haripriyar','haripriyar@bitsathy.ac.in','','AM10954',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(47,'karthikas','karthikas@bitsathy.ac.in','','AM10956',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(48,'nithinp','nithinp@bitsathy.ac.in','','AM10971',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(49,'satheshkumar','satheshkumar@bitsathy.ac.in','','AM11013',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(50,'eugenebernai','eugenebernai@bitsathy.ac.in','','AM11039',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(51,'mohanapriyak','mohanapriyak@bitsathy.ac.in','','AM11052',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(52,'balamurugane','balamurugane@bitsathy.ac.in','','AM11058',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(53,'kanimozhi','kanimozhi@bitsathy.ac.in','','AM11092',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(54,'gayathridevi','gayathridevi@bitsathy.ac.in','','AM11095',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(55,'nishanthinis','nishanthinis@bitsathy.ac.in','','AM11100',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(56,'sasithra','sasithra@bitsathy.ac.in','','AM11110',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(57,'lokeswari','lokeswari@bitsathy.ac.in','','AM11113',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(58,'karthikeyang','karthikeyang@bitsathy.ac.in','','AM11161',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(59,'saranyamk','saranyamk@bitsathy.ac.in','','AM11166',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(60,'gopalakrishnanb','gopalakrishnanb@bitsathy.ac.in','','AM1131',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(61,'kodieswaria','kodieswaria@bitsathy.ac.in','','AM2241',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(62,'tamilselvan','tamilselvan@bitsathy.ac.in','','AU10440',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(63,'dhayaneethi','dhayaneethi@bitsathy.ac.in','','AU10645',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(64,'carolinevinnetias','carolinevinnetias@bitsathy.ac.in','','BM10939',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(65,'saahina','saahina@bitsathy.ac.in','','BM11066',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(66,'syedalthaf','syedalthaf@bitsathy.ac.in','','BM11071',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(67,'sreeniveathap','sreeniveathap@bitsathy.ac.in','','BM11175',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(68,'pratheebhag','pratheebhag@bitsathy.ac.in','','BM11176',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(69,'ddeepa','ddeepa@bitsathy.ac.in','','BM1429',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(70,'ashwinraj','ashwinraj@bitsathy.ac.in','','BT10375',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(71,'rajaseetharama','rajaseetharama@bitsathy.ac.in','','BT10708',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(72,'swathi','swathi@bitsathy.ac.in','','BT10733',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(73,'jeyavelkarthick','jeyavelkarthick@bitsathy.ac.in','','BT10782',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(74,'sakthishobanak','sakthishobanak@bitsathy.ac.in','','BT10978',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(75,'mahimap','mahimap@bitsathy.ac.in','','BT10984',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(76,'balajisadhasivam','balajisadhasivam@bitsathy.ac.in','','BT10991',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(77,'nandhinin','nandhinin@bitsathy.ac.in','','BT11035',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(78,'vinodhinirt','vinodhinirt@bitsathy.ac.in','','BT11050',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(79,'saranya','saranya@bitsathy.ac.in','','BT11134',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(80,'shankariv','shankariv@bitsathy.ac.in','','BT11198',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(81,'kannankp','kannankp@bitsathy.ac.in','','BT1388',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(82,'tamilselvis','tamilselvis@bitsathy.ac.in','','BT1477',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(83,'balakrishnarajar','balakrishnarajar@bitsathy.ac.in','','BT1606',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(84,'kirupasankarm','kirupasankarm@bitsathy.ac.in','','BT1849',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(85,'pavithramks','pavithramks@bitsathy.ac.in','','BT1930',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(86,'chandruks','chandruks@bitsathy.ac.in','','CB10791',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(87,'yuvalathas','yuvalathas@bitsathy.ac.in','','CB10890',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(88,'madhumithaa','madhumithaa@bitsathy.ac.in','','CB10949',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(89,'saranyanj','saranyanj@bitsathy.ac.in','','CB10992',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(90,'naveenya','naveenya@bitsathy.ac.in','','CB11107',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(91,'divyaks','divyaks@bitsathy.ac.in','','CB11145',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(92,'vaishnavin','vaishnavin@bitsathy.ac.in','','CB11170',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(93,'prabakar','prabakar@bitsathy.ac.in','','CB11172',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(94,'preethimathi','preethimathi@bitsathy.ac.in','','CD11061',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(95,'maheshkumar','maheshkumar@bitsathy.ac.in','','CD11062',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(96,'kiruthikas','kiruthikas@bitsathy.ac.in','','CD11174',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(97,'indhumathik','indhumathik@bitsathy.ac.in','','CD11183',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(98,'mohanraja','mohanraja@bitsathy.ac.in','','CE10010',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(99,'ashwathi','ashwathi@bitsathy.ac.in','','CE10600',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(100,'jeyanth','jeyanth@bitsathy.ac.in','','CE10783',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(101,'karthigashenbagamn','karthigashenbagamn@bitsathy.ac.in','','CE1797',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(102,'geethamanir','geethamanir@bitsathy.ac.in','','CE1865',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(103,'rajendranm','rajendranm@bitsathy.ac.in','','CE1954',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(104,'sathishv','sathishv@bitsathy.ac.in','','CH10003',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(105,'muthukumar','muthukumar@bitsathy.ac.in','','CH10225',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(106,'muralikrishnan','muralikrishnan@bitsathy.ac.in','','CH10333',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(107,'rameshkumar','rameshkumar@bitsathy.ac.in','','CH10372',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(108,'deephav','deephav@bitsathy.ac.in','','CH10957',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(109,'karuppusamys','karuppusamys@bitsathy.ac.in','','CH11057',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(110,'jesinbeneto','jesinbeneto@bitsathy.ac.in','','CH11126',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(111,'manigandan','manigandan@bitsathy.ac.in','','CH11127',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(112,'kasthuris','kasthuris@bitsathy.ac.in','','CH11156',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(113,'pawelpandiyan','PAWELPANDIYAN1998.PP@GMAIL.COM','','CH11202',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(114,'subhapriyap','subhapriyap@bitsathy.ac.in','','CH1493',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(115,'vijayanandps','vijayanandps@bitsathy.ac.in','','CH1557',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(116,'praveenar','praveenar@bitsathy.ac.in','','CH1558',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(117,'kavithac','kavithac@bitsathy.ac.in','','CH1578',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(118,'malathimahalingamm','malathimahalingamm@bitsathy.ac.in','','CH1894',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(119,'dineshps','dineshps@bitsathy.ac.in','','CS10025',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(120,'karthigam','karthigam@bitsathy.ac.in','','CS10239',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(121,'mohankumar','mohankumar@bitsathy.ac.in','','CS10308',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(122,'prabhadevi','prabhadevi@bitsathy.ac.in','','CS10449',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(123,'soundariya','soundariya@bitsathy.ac.in','','CS10473',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(124,'praveen','praveen@bitsathy.ac.in','','CS10538',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(125,'swathypriyadharsini','swathypriyadharsini@bitsathy.ac.in','','CS10560',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(126,'mageshkumar','mageshkumar@bitsathy.ac.in','','CS10767',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(127,'suseendrans','suseendrans@bitsathy.ac.in','','CS10776',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(128,'parthasarathip','parthasarathip@bitsathy.ac.in','','CS10787',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(129,'dhivyap','dhivyap@bitsathy.ac.in','','CS10789',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(130,'sangeethaasn','sangeethaasn@bitsathy.ac.in','','CS10797',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(131,'rajeshkannap','rajeshkannap@bitsathy.ac.in','','CS10820',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(132,'kiruthikavr','kiruthikavr@bitsathy.ac.in','','CS10825',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(133,'nithyars','nithyars@bitsathy.ac.in','','CS10843',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(134,'sangavin','sangavin@bitsathy.ac.in','','CS10861',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(135,'sathishkannanr','sathishkannanr@bitsathy.ac.in','','CS10876',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(136,'kalaivanie','kalaivanie@bitsathy.ac.in','','CS10880',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(137,'saranyaks','saranyaks@bitsathy.ac.in','','CS10906',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(138,'ramasamis','ramasamis@bitsathy.ac.in','','CS10946',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(139,'rajeshkumarg','rajeshkumarg@bitsathy.ac.in','','CS10963',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(140,'steephanamalrajj','steephanamalrajj@bitsathy.ac.in','','CS10974',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(141,'kavithar','kavithar@bitsathy.ac.in','','CS10983',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(142,'sathyamoorthyj','sathyamoorthyj@bitsathy.ac.in','','CS11027',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(143,'mohanambal','mohanambal@bitsathy.ac.in','','CS11064',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(144,'chitradevi','chitradevi@bitsathy.ac.in','','CS11075',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(145,'ammu','ammu@bitsathy.ac.in','','CS11080',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(146,'deepapriya','deepapriya@bitsathy.ac.in','','CS11081',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(147,'gunavardini','gunavardini@bitsathy.ac.in','','CS11084',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(148,'gayathris','gayathris@bitsathy.ac.in','','CS11086',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(149,'priyanga','priyanga@bitsathy.ac.in','','CS11087',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(150,'sathiya','sathiya@bitsathy.ac.in','','CS11088',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(151,'rathna','rathna@bitsathy.ac.in','','CS11094',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(152,'sasikalad','sasikalad@bitsathy.ac.in','','CS1110',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(153,'alamelu','alamelu@bitsathy.ac.in','','CS11101',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(154,'parkavi','parkavi@bitsathy.ac.in','','CS11119',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(155,'mythili','mythili@bitsathy.ac.in','','CS11150',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(156,'gayathiridevis','gayathiridevis@bitsathy.ac.in','','CS11157',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(157,'kayalvizhib','kayalvizhib@bitsathy.ac.in','','CS11158',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(158,'thangatamilselvis','thangatamilselvis@bitsathy.ac.in','','CS11162',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(159,'maheshs','maheshs@bitsathy.ac.in','','CS11163',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(160,'jacksonj','jacksonj@bitsathy.ac.in','','CS11171',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(161,'rangarajk','rangarajk@bitsathy.ac.in','','CS11180',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(162,'aswinjayasuryamj','aswinjayasuryamj@bitsathy.ac.in','','CS11185',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(163,'gokulms','gokulms@bitsathy.ac.in','','CS11197',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(164,'ramyapraba','RAMYAPRABA2011@GMAIL.COM','','CS11203',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(165,'sathishkumarp','sathishkumarp@bitsathy.ac.in','','CS1362',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(166,'premalathak','premalathak@bitsathy.ac.in','','CS1618',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(167,'ramyarv','ramyarv@bitsathy.ac.in','','CS1906',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(168,'btparvathi','btparvathi@bitsathy.ac.in','','CT10659',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(169,'prasannakiruba','prasannakiruba@bitsathy.ac.in','','CT10933',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(170,'gunalank','gunalank@bitsathy.ac.in','','CT10965',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(171,'anandan','anandan@bitsathy.ac.in','','CT11020',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(172,'saveethar','saveethar@bitsathy.ac.in','','CT11030',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(173,'murugesanp','murugesanp@bitsathy.ac.in','','CT1349',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(174,'sannasi','sannasi@bitsathy.ac.in','','EC10005',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(175,'sampoornam','sampoornam@bitsathy.ac.in','','EC10186',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(176,'karthikeyan','karthikeyan@bitsathy.ac.in','','EC10194',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(177,'saranyan','saranyan@bitsathy.ac.in','','EC10229',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(178,'baranidharan','baranidharan@bitsathy.ac.in','','EC10443',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(179,'tamilselvans','tamilselvans@bitsathy.ac.in','','EC10581',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(180,'rajasekar','rajasekar@bitsathy.ac.in','','EC10603',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(181,'leebanmoses','leebanmoses@bitsathy.ac.in','','EC10678',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(182,'perarasi','perarasi@bitsathy.ac.in','','EC10680',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(183,'gayathrir','gayathrir@bitsathy.ac.in','','EC10692',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(184,'poongodic','poongodic@bitsathy.ac.in','','EC1072',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(185,'abinayam','abinayam@bitsathy.ac.in','','EC10725',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(186,'arulmurugan','arulmurugan@bitsathy.ac.in','','EC10739',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(187,'soundarya','soundarya@bitsathy.ac.in','','EC10764',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(188,'krishnarajr','krishnarajr@bitsathy.ac.in','','EC10774',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(189,'mythilis','mythilis@bitsathy.ac.in','','EC10775',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(190,'sharmilaa','sharmilaa@bitsathy.ac.in','','EC10813',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(191,'murugank','murugank@bitsathy.ac.in','','EC10827',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(192,'stephensagayaraja','stephensagayaraja@bitsathy.ac.in','','EC10915',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(193,'karthiga','karthiga@bitsathy.ac.in','','EC10916',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(194,'venkateshkumaru','venkateshkumaru@bitsathy.ac.in','','EC10969',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(195,'vellingiria','vellingiria@bitsathy.ac.in','','EC10972',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(196,'mariaamuthar','mariaamuthar@bitsathy.ac.in','','EC11010',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(197,'sathiyamurthi','sathiyamurthi@bitsathy.ac.in','','EC11021',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(198,'nivethag','nivethag@bitsathy.ac.in','','EC11043',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(199,'harishkumaarp','harishkumaarp@bitsathy.ac.in','','EC11044',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(200,'dhanalakshmis','dhanalakshmis@bitsathy.ac.in','','EC11045',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(201,'rameshr','rameshr@bitsathy.ac.in','','EC11047',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(202,'sandhiyadevip','sandhiyadevip@bitsathy.ac.in','','EC11051',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(203,'sankarananth','sankarananth@bitsathy.ac.in','','EC11131',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(204,'ragavim','ragavim@bitsathy.ac.in','','EC11147',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(205,'tamilarasir','tamilarasir@bitsathy.ac.in','','EC11190',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(206,'nalifabegamj','nalifabegamj@bitsathy.ac.in','','EC11192',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(207,'linol','linol@bitsathy.ac.in','','EC11194',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(208,'harikumarr','harikumarr@bitsathy.ac.in','','EC1417',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(209,'prakashsp','prakashsp@bitsathy.ac.in','','EC1453',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(210,'pushpavallim','pushpavallim@bitsathy.ac.in','','EC1537',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(211,'nirmalkumarr','nirmalkumarr@bitsathy.ac.in','','EC1721',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(212,'ramyap','ramyap@bitsathy.ac.in','','EC1744',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(213,'sanjoydeb','sanjoydeb@bitsathy.ac.in','','EC1834',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(214,'elangos','elangos@bitsathy.ac.in','','EC1893',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(215,'danielraja','danielraja@bitsathy.ac.in','','EC1911',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(216,'sajanpphilip','sajanpphilip@bitsathy.ac.in','','EC1912',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(217,'ramkumarr','ramkumarr@bitsathy.ac.in','','EC1938',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(218,'alexstanleyraja','alexstanleyraja@bitsathy.ac.in','','EE10155',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(219,'arunchendhuran','arunchendhuran@bitsathy.ac.in','','EE10317',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(220,'sathishkumars','sathishkumars@bitsathy.ac.in','','EE10397',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(221,'bharanikumarr','bharanikumarr@bitsathy.ac.in','','EE1040',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(222,'nithyag','nithyag@bitsathy.ac.in','','EE10616',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(223,'madhumithaj','madhumithaj@bitsathy.ac.in','','EE10619',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(224,'senthilkumarj','senthilkumarj@bitsathy.ac.in','','EE10647',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(225,'rishikesh','rishikesh@bitsathy.ac.in','','EE10652',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(226,'gopika','gopika@bitsathy.ac.in','','EE10721',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(227,'manojkumarp','manojkumarp@bitsathy.ac.in','','EE10786',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(228,'chinnadurraicl','chinnadurraicl@bitsathy.ac.in','','EE10873',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(229,'goldvinsugirthadhasb','goldvinsugirthadhasb@bitsathy.ac.in','','EE10883',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(230,'kiruthikam','kiruthikam@bitsathy.ac.in','','EE11199',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(231,'sureshns','sureshns@bitsathy.ac.in','','EE11200',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(232,'srinivasanm','srinivasanm@bitsathy.ac.in','','EE1311',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(233,'rajalashmik','rajalashmik@bitsathy.ac.in','','EE1325',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(234,'sivaramanpsr','sivaramanpsr@bitsathy.ac.in','','EE1329',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(235,'veerakumars','veerakumars@bitsathy.ac.in','','EE1437',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(236,'maheswarikt','maheswarikt@bitsathy.ac.in','','EE1682',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(237,'nandhakumara','nandhakumara@bitsathy.ac.in','','EE1695',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(238,'srithap','srithap@bitsathy.ac.in','','EE1747',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(239,'mohanapriyav','mohanapriyav@bitsathy.ac.in','','EE1785',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(240,'sundars','sundars@bitsathy.ac.in','','EE1908',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(241,'balamurugan','balamurugan@bitsathy.ac.in','','EI10187',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(242,'dhanasekar','dhanasekar@bitsathy.ac.in','','EI10249',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(243,'haritha','haritha@bitsathy.ac.in','','EI10266',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(244,'nandhinikm','nandhinikm@bitsathy.ac.in','','EI10270',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(245,'sakthiyaram','sakthiyaram@bitsathy.ac.in','','EI10403',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(246,'kalaiyarasim','kalaiyarasim@bitsathy.ac.in','','EI10428',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(247,'pravinsavaridass','pravinsavaridass@bitsathy.ac.in','','EI10459',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(248,'prathap','prathap@bitsathy.ac.in','','EI10670',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(249,'kumaresank','kumaresank@bitsathy.ac.in','','EI11048',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(250,'vairavelks','vairavelks@bitsathy.ac.in','','EI1438',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(251,'sudhahars','sudhahars@bitsathy.ac.in','','EI1688',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(252,'arunjayakars','arunjayakars@bitsathy.ac.in','','EI1996',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(253,'gowrishankar','gowrishankar@bitsathy.ac.in','','FD10755',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(254,'pidathalasahitya','pidathalasahitya@bitsathy.ac.in','','FD10959',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(255,'arunasreetna','arunasreetna@bitsathy.ac.in','','FD10999',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(256,'sivarahini','sivarahini@bitsathy.ac.in','','FD11130',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(257,'saranyadv','saranyadv@bitsathy.ac.in','','FT10224',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(258,'mekalan','mekalan@bitsathy.ac.in','','FT10427',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(259,'mohanbharathic','mohanbharathic@bitsathy.ac.in','','FT10809',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(260,'ajai','ajai@bitsathy.ac.in','','HU11011',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(261,'sagunthaladevi','sagunthaladevi@bitsathy.ac.in','','HU11085',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(262,'kamali','kamali@bitsathy.ac.in','','HU11115',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(263,'gayathri','gayathri@bitsathy.ac.in','','HU11125',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(264,'aslinjerusha','aslinjerusha@bitsathy.ac.in','','HU11139',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(265,'ezhil','ezhil@bitsathy.ac.in','','HU11141',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(266,'nithyas','nithyas@bitsathy.ac.in','','HU11151',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(267,'shyamsundar','shyamsundar@bitsathy.ac.in','','HU11154',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(268,'jayak','jayak@bitsathy.ac.in','','HU11159',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(269,'samsonrajc','SAMSONRAJC@bitsathy.ac.in','','HU11201',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(270,'ranganathana','ranganathana@bitsathy.ac.in','','HU2351',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(271,'gopalr','gopalr@bitsathy.ac.in','','IS10823',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(272,'pandiyanm','pandiyanm@bitsathy.ac.in','','IS10829',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(273,'poornimaa','poornimaa@bitsathy.ac.in','','IS10850',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(274,'somasundaramk','somasundaramk@bitsathy.ac.in','','IS10944',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(275,'anandakumark','anandakumark@bitsathy.ac.in','','IS1899',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(276,'sabarmathi','sabarmathi@bitsathy.ac.in','','IT10262',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(277,'srivinitha','srivinitha@bitsathy.ac.in','','IT10395',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(278,'vinothm','vinothm@bitsathy.ac.in','','IT10544',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(279,'sobiyaa','sobiyaa@bitsathy.ac.in','','IT10571',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(280,'jananit','jananit@bitsathy.ac.in','','IT10736',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(281,'priyal','priyal@bitsathy.ac.in','','IT10803',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(282,'chandraprabhak','chandraprabhak@bitsathy.ac.in','','IT10824',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(283,'venkatesanr','venkatesanr@bitsathy.ac.in','','IT10845',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(284,'selvakumarm','selvakumarm@bitsathy.ac.in','','IT10846',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(285,'nikitham','nikitham@bitsathy.ac.in','','IT10941',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(286,'priyajn','priyajn@bitsathy.ac.in','','IT11040',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(287,'sadhasivamn','sadhasivamn@bitsathy.ac.in','','IT11056',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(288,'santhiyab','santhiyab@bitsathy.ac.in','','IT11105',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(289,'muthumeena','muthumeena@bitsathy.ac.in','','IT11124',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(290,'tamilthendral','tamilthendral@bitsathy.ac.in','','IT11128',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(291,'nivedha','nivedha@bitsathy.ac.in','','IT11129',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(292,'kavitha','kavitha@bitsathy.ac.in','','IT11132',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(293,'priyaa','priyaa@bitsathy.ac.in','','IT11140',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(294,'keerthana','keerthana@bitsathy.ac.in','','IT11142',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(295,'shangaranarayanee','shangaranarayanee@bitsathy.ac.in','','IT11144',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(296,'indhubhashiniv','indhubhashiniv@bitsathy.ac.in','','IT11146',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(297,'mohemmedyousuf','mohemmedyousuf@bitsathy.ac.in','','IT11148',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(298,'senthilnathans','senthilnathans@bitsathy.ac.in','','IT11149',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(299,'deepasumathim','deepasumathim@bitsathy.ac.in','','IT11155',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(300,'elavarasit','elavarasit@bitsathy.ac.in','','IT11160',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(301,'gayathrid','gayathrid@bitsathy.ac.in','','IT11173',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(302,'sathyarajs','sathyarajs@bitsathy.ac.in','','IT11195',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(303,'manishag','manishag@bitsathy.ac.in','','IT11196',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(304,'parivallalr','parivallalr@bitsathy.ac.in','','IT1441',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(305,'cpalanisamy','cpalanisamy@bitsathy.ac.in','','IT1442',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(306,'sathiskumark','sathiskumark@bitsathy.ac.in','','IT1764',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(307,'naveena','naveena@bitsathy.ac.in','','IT1846',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(308,'prabhups','prabhups@bitsathy.ac.in','','IT2078',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(309,'nataraj','nataraj@bitsathy.ac.in','','IT2771',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(310,'preetha','preetha@bitsathy.ac.in','','MA10071',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(311,'saranyad','saranyad@bitsathy.ac.in','','MA10119',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(312,'karuppusamy','karuppusamy@bitsathy.ac.in','','MA10202',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(313,'karthikam','karthikam@bitsathy.ac.in','','MA10347',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(314,'selvi','selvi@bitsathy.ac.in','','MA10388',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(315,'kalaiselvan','kalaiselvan@bitsathy.ac.in','','MA10452',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(316,'prabakaran','prabakaran@bitsathy.ac.in','','MA10518',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(317,'revathivm','revathivm@bitsathy.ac.in','','MA10763',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(318,'gomathim','gomathim@bitsathy.ac.in','','MA10986',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(319,'gayathirib','gayathirib@bitsathy.ac.in','','MA11017',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(320,'sureshr','sureshr@bitsathy.ac.in','','MA11028',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(321,'malathim','malathim@bitsathy.ac.in','','MA11070',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(322,'akalyadevi','akalyadevi@bitsathy.ac.in','','MA11122',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(323,'hemalathab','hemalathab@bitsathy.ac.in','','MA11181',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(324,'indiranic','indiranic@bitsathy.ac.in','','MA1303',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(325,'prabhavathik','prabhavathik@bitsathy.ac.in','','MA1334',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(326,'vinothinivr','vinothinivr@bitsathy.ac.in','','MA1342',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(327,'saravanamoorthip','saravanamoorthip@bitsathy.ac.in','','MA1373',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(328,'prakashk','prakashk@bitsathy.ac.in','','MA1465',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(329,'parimalam','parimalam@bitsathy.ac.in','','MA1566',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(330,'umamageswarid','umamageswarid@bitsathy.ac.in','','MA1702',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(331,'sivabalakrishnan','sivabalakrishnan@bitsathy.ac.in','','MC10149',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(332,'vignesh','vignesh@bitsathy.ac.in','','MC10299',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(333,'nijandhan','nijandhan@bitsathy.ac.in','','MC10369',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(334,'raghunath','raghunath@bitsathy.ac.in','','MC10412',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(335,'dhineshsk','dhineshsk@bitsathy.ac.in','','MC10450',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(336,'siddharthan','siddharthan@bitsathy.ac.in','','MC10664',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(337,'vadivelvivek','vadivelvivek@bitsathy.ac.in','','MC10697',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(338,'senthilkumarkl','senthilkumarkl@bitsathy.ac.in','','MC1071',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(339,'nagarajanp','nagarajanp@bitsathy.ac.in','','MC10729',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(340,'rajievr','rajievr@bitsathy.ac.in','','MC1627',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(341,'senthilkumarp','senthilkumarp@bitsathy.ac.in','','MC1843',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(342,'jegadheeswarans','jegadheeswarans@bitsathy.ac.in','','MC1878',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(343,'kumaresan','kumaresan@bitsathy.ac.in','','ME10081',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(344,'pradeep','pradeep@bitsathy.ac.in','','ME10098',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(345,'madheswaran','madheswaran@bitsathy.ac.in','','ME10174',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(346,'subramaniyan','subramaniyan@bitsathy.ac.in','','ME10233',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(347,'bhuvanesh','bhuvanesh@bitsathy.ac.in','','ME10273',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(348,'muthukumarkm','muthukumarkm@bitsathy.ac.in','','ME10313',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(349,'kamalbasha','kamalbasha@bitsathy.ac.in','','ME10416',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(350,'prakashkb','prakashkb@bitsathy.ac.in','','ME10492',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(351,'boopathiraja','boopathiraja@bitsathy.ac.in','','ME10673',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(352,'pravin','pravin@bitsathy.ac.in','','ME10699',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(353,'chandrasekaran','chandrasekaran@bitsathy.ac.in','','ME10714',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(354,'ravikumarm','ravikumarm@bitsathy.ac.in','','ME1093',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(355,'senthilkumarg','senthilkumarg@bitsathy.ac.in','','ME1094',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(356,'sasikumarc','sasikumarc@bitsathy.ac.in','','ME1107',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(357,'josephsilvester','josephsilvester@bitsathy.ac.in','','ME11077',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(358,'pavanaditya','pavanaditya@bitsathy.ac.in','','ME11099',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(359,'amarkarthik','amarkarthik@bitsathy.ac.in','','ME1335',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(360,'rameshkumart','rameshkumart@bitsathy.ac.in','','ME1410',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(361,'sivakumark','sivakumark@bitsathy.ac.in','','ME1472',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(362,'anandhamoorthya','anandhamoorthya@bitsathy.ac.in','','ME1543',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(363,'dineshd','dineshd@bitsathy.ac.in','','ME1819',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(364,'mathankumarp','mathankumarp@bitsathy.ac.in','','ME1820',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(365,'velmurugans','velmurugans@bitsathy.ac.in','','ME1869',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(366,'sathishkumarc','sathishkumarc@bitsathy.ac.in','','ME1877',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(367,'sureshkumarm','sureshkumarm@bitsathy.ac.in','','ME1880',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(368,'sundarrajug','sundarrajug@bitsathy.ac.in','','ME1957',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(369,'ramakrishnana','ramakrishnana@bitsathy.ac.in','','ME1970',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(370,'sakthivelmurugane','sakthivelmurugane@bitsathy.ac.in','','ME1974',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(371,'tajdeena','tajdeena@bitsathy.ac.in','','ME1975',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(372,'parasuraman','parasuraman@bitsathy.ac.in','','PH10204',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(373,'ashokan','ashokan@bitsathy.ac.in','','PH10218',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(374,'selvakumark','selvakumark@bitsathy.ac.in','','PH10380',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(375,'thirumoorthy','thirumoorthy@bitsathy.ac.in','','PH10457',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(376,'sadasivamk','sadasivamk@bitsathy.ac.in','','PH1054',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(377,'vanithak','vanithak@bitsathy.ac.in','','PH10870',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(378,'sundarams','sundarams@bitsathy.ac.in','','PH10981',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(379,'anandhababug','anandhababug@bitsathy.ac.in','','PH10987',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(380,'gopi','gopi@bitsathy.ac.in','','PH11015',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(381,'sivag','sivag@bitsathy.ac.in','','PH11034',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(382,'baskaranp','baskaranp@bitsathy.ac.in','','PH11036',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(383,'priyadharsinia','Priyadharsinia@bitsathy.ac.in','','PH11152',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(384,'sangeethak','sangeethak@bitsathy.ac.in','','PH11153',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(385,'vijayakumarvn','vijayakumarvn@bitsathy.ac.in','','PH1407',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(386,'pongalispn','pongalispn@bitsathy.ac.in','','PH1653',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(387,'rohinip','rohinip@bitsathy.ac.in','','PH1889',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(388,'nandhinib','nandhinib@bitsathy.ac.in','','SM10346',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(389,'sibijohn','sibijohn@bitsathy.ac.in','','SM10625',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(390,'senthilkumar','senthilkumar@bitsathy.ac.in','','SM11065',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(391,'aishwariya','aishwariya@bitsathy.ac.in','','SM11118',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(392,'mageswaran','mageswaran@bitsathy.ac.in','','SM11133',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(393,'suganeshs','suganeshs@bitsathy.ac.in','','SM11186',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(394,'dhanabalusn','dhanabalusn@bitsathy.ac.in','','SM11187',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(395,'adhinarayananb','adhinarayananb@bitsathy.ac.in','','SM11188',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(396,'saranyasms','saranyasms@bitsathy.ac.in','','SM11189',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(397,'satheeshkumart','satheeshkumart@bitsathy.ac.in','','SM11191',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(398,'murugappans','murugappans@bitsathy.ac.in','','SM1661',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58'),(399,'saraswathic','saraswathic@bitsathy.ac.in','','SM41012',2,1,'2026-03-19 07:42:58','2026-03-19 07:42:58');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-19 14:27:41
