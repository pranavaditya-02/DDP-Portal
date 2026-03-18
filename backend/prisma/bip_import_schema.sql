-- SQL dump generated using DBML (dbml.dbdiagram.io)
-- Database: MySQL
-- Generated at: 2026-03-18T09:07:50.536Z

CREATE TABLE `ref_iqac_status` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(20) UNIQUE NOT NULL COMMENT 'Initiated | Approved | Rejected'
);

CREATE TABLE `ref_event_level` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(60) UNIQUE NOT NULL COMMENT 'State | National | International | Institute (BIT)'
);

CREATE TABLE `ref_event_mode` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(20) UNIQUE NOT NULL COMMENT 'Online | Offline | Hybrid'
);

CREATE TABLE `ref_organizer_type` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(40) UNIQUE NOT NULL COMMENT 'BIT | Industry | Foreign Institute | Institute in India | Others'
);

CREATE TABLE `ref_sponsorship_type` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(30) UNIQUE NOT NULL COMMENT 'Self | BIT | Funding Agency | Others'
);

CREATE TABLE `ref_fund_type` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(30) UNIQUE NOT NULL COMMENT 'Self | Management | Funding Agency'
);

CREATE TABLE `ref_event_type_attended` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(120) UNIQUE NOT NULL COMMENT 'Certificate course | Conference attended-without presentation | Educational fair | Faculty exchange programme | FDP | Guest Lecture | Non-technical events | One credit course | Orientation programme | Seminar | Session chair | STTP | Summer School | Training | Value-Added course | Webinar | Winter School | Workshop | Hands-On Training | PS-Certification (BIT) | NPTEL-FDP | AICTE-UHV-FDP | Innovation Ambassador- IIC Certificate | CEE-ACO & BEI panelist workshop certificate | Other'
);

CREATE TABLE `ref_event_type_organized` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(120) UNIQUE NOT NULL COMMENT 'HRD Programs | Certificate course | Partial Delivery of Course | Competitions for BIT students | Conference | Faculty training Program | FDP/STTP | Guest Lecture | Hands on training | Leader of the Week | Non Technical Event | One credit course | Orientation program | Refresher Program | Seminar | Technical Events | Webinar | Workshop | Non-Teaching training programme | Others | Symposium | Interaction'
);

CREATE TABLE `ref_course_type` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(80) UNIQUE NOT NULL COMMENT 'AICTE | CEC | CISCO | COURSERA | edX | GOOGLE | IBM | IGNOU | IIMB | INI | NITTTR | MICROSOFT | NMEICT | NPTEL | SWAYAM | ICMR | UDEMY | UGC | AICTE QIP PG certificate Programme | AI Infinity | Oracle | Other'
);

CREATE TABLE `ref_journal_indexing` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(20) UNIQUE NOT NULL COMMENT 'Scopus | Web of Science | SCI | Others'
);

CREATE TABLE `ref_recognition_type` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(40) UNIQUE NOT NULL COMMENT 'Reviewer | Editorial Board Member | Editor in Chief | Advisory board Member | Others'
);

CREATE TABLE `ref_external_examiner_purpose` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(80) UNIQUE NOT NULL COMMENT 'Central Valuation | Flying Squad | Hall invigilator | Practical/Project viva External Examiner | Question Paper Scrutiny | QP Setter | University Representative'
);

CREATE TABLE `ref_technical_society` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(100) UNIQUE NOT NULL COMMENT 'IEEE | CSI | IAENG | SAE | etc.'
);

CREATE TABLE `ref_resource_person_category` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(80) UNIQUE NOT NULL COMMENT 'BoS Member | Chief Guest | Conference Session Chair | DC member | Energy Audit | Examiner - Ph.D Viva voce | External Academic Audit | Internal Academic Audit | Jury member | Quality Expert | Technical Expert | Thesis Evaluator | Interaction | Panel-Member'
);

CREATE TABLE `ref_e_content_type` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(80) UNIQUE NOT NULL COMMENT 'PERSONALIZED_SKILL (PS) | TUTORIAL | E-BOOK | VIDEO LECTURES | ACADEMIC BOOK | ASSESSMENT | ARTICLE | BLOG WRITING | COURSE BOARD GRAPHICS | DATABASE CREATION | E-LEARNING GAME | NPTEL TRANSLATION | PODCAST | SKILL-SCOURCE-BOOK | YOUTUBE-VIDEO | MAGAZINE | NEW METHODOLOGY IN TLP/ASSESSMENT | NEW COURSE IN CURICULLAM | Other'
);

CREATE TABLE `ref_newsletter_category` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(40) UNIQUE NOT NULL COMMENT 'Department Newsletter | Institution Newsletter'
);

CREATE TABLE `departments` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `dept_code` varchar(20) UNIQUE NOT NULL,
  `dept_name` varchar(120) UNIQUE NOT NULL,
  `status` boolean NOT NULL DEFAULT true COMMENT 'true=active, false=inactive',
  `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `faculty` (
  `id` varchar(50) PRIMARY KEY,
  `salutation` varchar(10) NOT NULL COMMENT 'Mr | Mrs | Ms | Dr',
  `name` varchar(200) NOT NULL,
  `designation` varchar(60) NOT NULL COMMENT 'Assistant Professor Level I | Assistant Professor Level II | Assistant Professor Level III | Associate Professor | Professor',
  `department_id` int,
  `email` varchar(200),
  `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `users` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `username` varchar(100) UNIQUE NOT NULL,
  `email` varchar(200) UNIQUE NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `faculty_id` varchar(50) UNIQUE COMMENT 'Optional link for faculty user accounts',
  `department_id` int COMMENT 'Primary department mapping',
  `role_id` int NOT NULL COMMENT 'Assigned role for page/resource access',
  `is_active` boolean DEFAULT true,
  `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `roles` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(100) UNIQUE NOT NULL,
  `is_active` boolean DEFAULT true,
  `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `app_pages` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `page_key` varchar(120) UNIQUE NOT NULL COMMENT 'dashboard | activities | achievements.submit | department | roles | etc.',
  `page_name` varchar(150) NOT NULL,
  `route_path` varchar(255) UNIQUE NOT NULL COMMENT '/dashboard | /activities | /achievements/submit | etc.',
  `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `role_page_access` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `role_id` int NOT NULL,
  `page_id` int NOT NULL,
  `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `ref_doc_type` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(60) UNIQUE NOT NULL COMMENT 'document_proof | apex_proof | certificate_proof | geotag_photos | syllabus | course_feedback | proceedings_proof | relevant_proof | marksheet_proof | fdp_proof | photo_proof | award_proof | sample_photographs'
);

CREATE TABLE `documents` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `doc_type_id` int NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `uploaded_at` timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `special_lab` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `code` varchar(20) UNIQUE NOT NULL COMMENT 'e.g. SL-001, AI-LAB, IOT-LAB',
  `name` varchar(200) NOT NULL,
  `is_active` boolean DEFAULT true,
  `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `submissions` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `task_id` varchar(100) UNIQUE COMMENT 'Task ID from activity forms (if applicable)',
  `remarks` text COMMENT 'General remarks/comments for the submission',
  `activity_type` varchar(60) NOT NULL COMMENT 'newsletter_archive | e_content_developed | events_attended | events_organized | external_examiner | faculty_journal_reviewer | guest_lecture_delivered | international_visit | notable_achievements | online_course | paper_presentation | resource_person | mou | irp_visit | consultancy | external_vip_visit | faculty_industry_project | centre_of_excellence | faculty_trained_by_industry | industry_advisor | lab_developed_by_industry | students_industrial_visit | training_to_industry | professional_body_membership',
  `faculty_id` varchar(50) COMMENT 'Nullable for department-level activities like newsletter_archive',
  `iqac_verification_id` int,
  `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `newsletter_archive` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `submission_id` int UNIQUE NOT NULL,
  `newsletter_category_id` int,
  `department_id` int,
  `academic_year` varchar(20),
  `date_of_publication` date,
  `volume_number` int,
  `issue_number` int,
  `issue_month` varchar(20),
  `num_faculty_editors` int,
  `num_student_editors` int,
  `proof_document_id` int COMMENT 'Upload the Document'
);

CREATE TABLE `e_content_developed` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `submission_id` int UNIQUE NOT NULL,
  `special_labs_involved` boolean DEFAULT false COMMENT 'Yes | No',
  `special_lab_id` int COMMENT 'Required if special_labs_involved = true',
  `e_content_type_id` int,
  `if_others_specify` varchar(200),
  `topic_name` varchar(300),
  `publisher_name` varchar(200),
  `publisher_address` text,
  `contact_no` varchar(20),
  `url_of_content` varchar(500),
  `date_of_publication` date,
  `document_proof_id` int COMMENT 'Document Proof'
);

CREATE TABLE `events_attended` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `submission_id` int UNIQUE NOT NULL,
  `special_labs_involved` boolean DEFAULT false COMMENT 'Yes | No',
  `special_lab_id` int COMMENT 'Required if special_labs_involved = true',
  `event_type_id` int,
  `if_event_type_others` varchar(200),
  `ps_domain` text,
  `ps_domain_level` text,
  `topic_name` varchar(300),
  `organizer_type_id` int,
  `industry_name` varchar(300),
  `industry_name_select` varchar(300),
  `industry_address` text,
  `institute_name` varchar(300),
  `event_level_id` int,
  `event_title` varchar(300),
  `organization_sector` varchar(20) COMMENT 'Private | Government',
  `event_organizer` varchar(300),
  `event_mode_id` int,
  `event_location` varchar(300),
  `event_duration_unit` varchar(10) COMMENT 'Months | Weeks | Hours | Days',
  `event_date_from` date,
  `event_date_to` date,
  `duration_days` int,
  `other_organizer_name` varchar(300),
  `sponsorship_type_id` int,
  `funding_agency_name` varchar(300),
  `amount_inrs` decimal(12,2),
  `outcome` varchar(100) COMMENT 'Programs organized | Development of working Models and prototypes | Funded projects received | Others',
  `if_outcome_others` varchar(300),
  `apex_proof_id` int COMMENT 'Apex Proof',
  `certificate_proof_id` int COMMENT 'Certificate Proof',
  `geotag_photos_id` int COMMENT 'Upload Geotag Photos'
);

CREATE TABLE `events_organized` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `submission_id` int UNIQUE NOT NULL,
  `special_labs_involved` boolean DEFAULT false COMMENT 'Yes | No',
  `special_lab_id` int COMMENT 'Required if special_labs_involved = true',
  `role` varchar(60) COMMENT 'Convener | Co-Convener | Co-ordinator | Organizing Secretary',
  `department_id` int,
  `is_iic_event` boolean,
  `is_iic_uploaded` boolean,
  `iic_bip_id` varchar(100),
  `is_dept_association` boolean,
  `is_rnd_organized` boolean,
  `is_technical_society` boolean,
  `technical_society_id` int,
  `is_mou_outcome` boolean,
  `mou_bip_id` varchar(100),
  `is_irp_outcome` boolean,
  `irp_bip_id` varchar(100),
  `is_centre_of_excellence` boolean,
  `coe_bip_id` varchar(100),
  `is_industry_supported_lab` boolean,
  `isl_bip_id` varchar(100),
  `event_name` varchar(300),
  `type_of_program` varchar(20) COMMENT 'Academic | Non Academic',
  `club_society_name` varchar(200),
  `event_type_id` int,
  `if_event_type_others` varchar(200),
  `topics_covered` text,
  `has_conference_proceedings` boolean,
  `publisher_detail` text,
  `publisher_year` int,
  `volume_number` int,
  `issue_number` int,
  `page_number` varchar(40),
  `isbn_number` varchar(30),
  `indexing_detail` varchar(200),
  `event_category` varchar(100),
  `event_organizer` varchar(300),
  `event_description` text,
  `event_mode_id` int,
  `event_location` varchar(300),
  `start_date` date,
  `end_date` date,
  `event_duration_days` int,
  `event_level_id` int,
  `jointly_organized_with` varchar(60),
  `joint_org_name` varchar(300),
  `joint_org_address` text,
  `internal_students_count` int,
  `internal_faculty_count` int,
  `external_students_count` int,
  `external_faculty_count` int,
  `amount_from_management` boolean,
  `amount_received_inrs` decimal(12,2),
  `has_funding_agency` boolean,
  `funding_agency_name` varchar(300),
  `registration_amount_inrs` decimal(12,2),
  `total_sponsored_amount` decimal(12,2),
  `total_revenue` decimal(12,2),
  `syllabus_id` int COMMENT 'Upload the Syllabus',
  `course_feedback_id` int COMMENT 'Upload the Course Feedback',
  `proceedings_proof_id` int COMMENT 'Submit the Proceedings proof',
  `apex_proof_id` int COMMENT 'Apex Proof',
  `relevant_proof_id` int COMMENT 'Approval letter, Brochure, Attendance sheet, Photos, Feedback'
);

CREATE TABLE `event_organized_faculty` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `event_organized_id` int NOT NULL,
  `faculty_id` varchar(50) NOT NULL,
  `role` varchar(60) COMMENT 'Convener | Co-Convener | Co-ordinator | Organizing Secretary'
);

CREATE TABLE `event_organized_student` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `event_organized_id` int NOT NULL,
  `student_name` varchar(200),
  `student_ref_id` int
);

CREATE TABLE `event_organized_guest` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `event_organized_id` int NOT NULL,
  `guest_number` smallint NOT NULL COMMENT '1 to 5',
  `institution_type` varchar(60) COMMENT 'International | National (Within TamilNadu) | National (Outside TamilNadu)',
  `guest_name` varchar(200),
  `designation` varchar(200),
  `email` varchar(200),
  `contact_no` varchar(20),
  `organization_detail` text,
  `is_alumni` boolean,
  `guest_type` varchar(20) COMMENT 'Academic | Industry'
);

CREATE TABLE `external_examiner` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `submission_id` int UNIQUE NOT NULL,
  `special_labs_involved` boolean DEFAULT false COMMENT 'Yes | No',
  `special_lab_id` int COMMENT 'Required if special_labs_involved = true',
  `college_name` varchar(300),
  `institute_address` text,
  `purpose_id` int,
  `examination_name` varchar(300),
  `department_of_qp_id` int,
  `subject_of_qp` varchar(300),
  `num_days` int,
  `from_date` date,
  `to_date` date,
  `document_proof_id` int COMMENT 'Document Proof'
);

CREATE TABLE `faculty_journal_reviewer` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `submission_id` int UNIQUE NOT NULL,
  `special_labs_involved` boolean DEFAULT false COMMENT 'Yes | No',
  `special_lab_id` int COMMENT 'Required if special_labs_involved = true',
  `journal_name` varchar(300),
  `indexing_id` int,
  `if_indexing_others` varchar(200),
  `issn_no` varchar(30),
  `publisher_name` varchar(200),
  `impact_factor` decimal(8,3),
  `journal_homepage_url` varchar(500),
  `recognition_type_id` int,
  `if_recognition_others` varchar(200),
  `num_papers_reviewed` int,
  `review_date` date,
  `document_proof_id` int COMMENT 'Mail/Letter/Certificate as single PDF'
);

CREATE TABLE `guest_lecture_delivered` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `submission_id` int UNIQUE NOT NULL,
  `special_labs_involved` boolean DEFAULT false COMMENT 'Yes | No',
  `special_lab_id` int COMMENT 'Required if special_labs_involved = true',
  `event_type` varchar(100),
  `topic` varchar(300),
  `event_mode_id` int,
  `event_level_id` int,
  `event_name` varchar(300),
  `from_date` date,
  `to_date` date,
  `num_days` int,
  `organization_type_id` int,
  `org_name` varchar(300),
  `org_address` text,
  `num_participants` int,
  `audience_type` varchar(200) COMMENT 'Students | Teaching Faculty | Non Teaching Faculty | Engineering Trainee | Industry persons | Others',
  `document_proof_id` int COMMENT 'Request Letter, Confirmation Letter, Brochure',
  `apex_proof_id` int COMMENT 'Apex Proof',
  `sample_photographs_id` int COMMENT 'Screenshot if online, Photograph if offline'
);

CREATE TABLE `international_visit` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `submission_id` int UNIQUE NOT NULL,
  `country_visited` varchar(100),
  `purpose_of_visit` text,
  `from_date` date,
  `to_date` date,
  `fund_type_id` int,
  `funding_agency_name` varchar(300),
  `apex_proof_id` int COMMENT 'Apex Proof',
  `relevant_proof_id` int COMMENT 'Approval letter, Brochure, Attendance sheet, Photos'
);

CREATE TABLE `notable_achievements` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `submission_id` int UNIQUE NOT NULL,
  `special_labs_involved` boolean DEFAULT false COMMENT 'Yes | No',
  `special_lab_id` int COMMENT 'Required if special_labs_involved = true',
  `is_technical_society` boolean,
  `technical_society_id` int,
  `type_of_recognition` varchar(20) COMMENT 'Award | Achievement',
  `award_type` varchar(100),
  `achievement_type` varchar(100),
  `award_achievement_name` varchar(300),
  `organization_type` varchar(20) COMMENT 'Government | Private | Others',
  `others_organization_name` varchar(300),
  `org_name` varchar(300),
  `awarding_body` varchar(100),
  `level_id` int,
  `received_date` date,
  `nature_of_recognition` varchar(60) COMMENT 'Cash Prize | Certificate | Momento',
  `prize_amount_inrs` decimal(12,2),
  `photo_proof_id` int COMMENT 'Photo Proofs',
  `document_proof_id` int COMMENT 'Document Proof'
);

CREATE TABLE `online_course` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `submission_id` int UNIQUE NOT NULL,
  `special_labs_involved` boolean DEFAULT false COMMENT 'Yes | No',
  `special_lab_id` int COMMENT 'Required if special_labs_involved = true',
  `mode_of_course` varchar(20) COMMENT 'Online | Offline | Hybrid',
  `course_type_id` int,
  `type_of_organizer` varchar(20) COMMENT 'Private | Government',
  `course_name` varchar(300),
  `organization_name` varchar(300),
  `organization_address` text,
  `level_of_event_id` int,
  `duration_unit` varchar(10) COMMENT 'Hours | Weeks | Days',
  `num_hours` int,
  `num_weeks` int,
  `num_days` int,
  `start_date` date,
  `end_date` date,
  `course_category` varchar(60) COMMENT 'Proctored-Exam | Self-paced with final assessment | Self-paced without final assessment',
  `exam_date` date,
  `grade_obtained` varchar(20),
  `is_approved_fdp` boolean,
  `sponsorship_type_id` int,
  `funding_agency_name` varchar(300),
  `claimed_for` varchar(30) COMMENT 'FAP | Competency | Not-Applicable',
  `marksheet_proof_id` int COMMENT 'Upload Mark Sheet Proof',
  `fdp_proof_id` int COMMENT 'Upload FDP Proof',
  `apex_proof_id` int COMMENT 'Apex Proof',
  `certificate_proof_id` int COMMENT 'Upload Certificate Proof'
);

CREATE TABLE `paper_presentation` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `submission_id` int UNIQUE NOT NULL,
  `special_labs_involved` boolean DEFAULT false COMMENT 'Yes | No',
  `special_lab_id` int COMMENT 'Required if special_labs_involved = true',
  `has_intl_institute_collab` boolean,
  `institute_name` varchar(300),
  `conference_name` varchar(300),
  `event_mode_id` int,
  `event_location` varchar(300),
  `organizer_type_id` int,
  `organizer_name` varchar(300),
  `event_level_id` int,
  `paper_title` varchar(500),
  `event_start_date` date,
  `event_end_date` date,
  `event_duration_days` int,
  `published_in_proceedings` boolean,
  `page_from` int,
  `page_to` int,
  `sponsorship_type_id` int,
  `funding_agency_name` varchar(300),
  `amount_inrs` decimal(12,2),
  `registration_amount_inrs` decimal(12,2),
  `award_received` boolean,
  `apex_proof_id` int COMMENT 'Apex Proof',
  `document_proof_id` int COMMENT 'Certificate & Proceeding page',
  `award_proof_id` int COMMENT 'Award Proof'
);

CREATE TABLE `paper_presentation_faculty` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `paper_presentation_id` int NOT NULL,
  `faculty_id` varchar(50) NOT NULL,
  `author_order` smallint
);

CREATE TABLE `paper_presentation_ext_faculty` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `paper_presentation_id` int NOT NULL,
  `faculty_name` varchar(300),
  `institution` varchar(300)
);

CREATE TABLE `paper_presentation_industry` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `paper_presentation_id` int NOT NULL,
  `person_name` varchar(300),
  `industry_name` varchar(300)
);

CREATE TABLE `paper_presentation_student` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `paper_presentation_id` int NOT NULL,
  `student_name` varchar(200),
  `year_of_study` varchar(10) COMMENT 'First | Second | Third | Fourth'
);

CREATE TABLE `resource_person` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `submission_id` int UNIQUE NOT NULL,
  `special_labs_involved` boolean DEFAULT false COMMENT 'Yes | No',
  `special_lab_id` int COMMENT 'Required if special_labs_involved = true',
  `category_id` int,
  `purpose_of_interaction` text,
  `panel_name` varchar(200),
  `organization_type` varchar(20) COMMENT 'Industry | Institute',
  `org_name_address` text,
  `visiting_dept_industry` varchar(200),
  `visiting_dept_institute` varchar(200),
  `num_days` int,
  `from_date` date,
  `to_date` date,
  `document_proof_id` int COMMENT 'Document Proof (PDF - max 2KB)'
);

CREATE TABLE `ref_mou_type` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(30) UNIQUE NOT NULL COMMENT 'National | International'
);

CREATE TABLE `ref_industry_org_type` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(40) UNIQUE NOT NULL COMMENT 'MNC | Large Scale | MSME | Small Scale | Others'
);

CREATE TABLE `ref_mou_based_on` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(20) UNIQUE NOT NULL COMMENT 'Industry | Institute'
);

CREATE TABLE `ref_mou_duration_unit` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(10) UNIQUE NOT NULL COMMENT 'Years | Months'
);

CREATE TABLE `ref_mou_purpose` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(100) UNIQUE NOT NULL COMMENT 'Internship | Centre of Excellence | Faculty Training | World Skills Training | Certification Course | Placement Training | Collaborative Projects | Laboratory Enhancement | Consultancy | Sharing Facilities | Product Development | Publications | Funding | Patents | Organizing Events | Student Projects | One-Credit Course | Placement Offers | Syllabus Framing for Curriculum | Syllabus Framing for One Credit | Student Training | Others'
);

CREATE TABLE `ref_irp_interaction_mode` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(60) UNIQUE NOT NULL COMMENT 'Email | Visit to Company Premises | Within BIT | Phone Call | Others'
);

CREATE TABLE `ref_irp_purpose` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(60) UNIQUE NOT NULL COMMENT 'Industry Interaction | Field Visit | Exhibition | IECC Planned Activity | Pskill'
);

CREATE TABLE `ref_irp_points_discussed` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(80) UNIQUE NOT NULL COMMENT 'Placement | Internship | One Credit Course | Student Project | Curriculum Feedback | Guest Lecture | Board of Studies | Workshop/Seminar | Faculty Training | Student Industrial Visit | Laboratory Enhancement | Skill Training | Industry Defined Problem | Joint Funding Proposals | Joint IPR Activity | Product Development | Teaching Materials | Sponsorship | Funding | Others'
);

CREATE TABLE `ref_approval_type` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(20) UNIQUE NOT NULL COMMENT 'Apex | Non-Apex | Dean | Principal'
);

CREATE TABLE `ref_approval_type_short` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(20) UNIQUE NOT NULL COMMENT 'Apex | Principal | Dean'
);

CREATE TABLE `ref_consultancy_type` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(20) UNIQUE NOT NULL COMMENT 'Industry | Institute'
);

CREATE TABLE `ref_sector_type` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(20) UNIQUE NOT NULL COMMENT 'Private | Government'
);

CREATE TABLE `ref_core_sector` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(60) UNIQUE NOT NULL COMMENT 'Manufacturing | Consulting | Supply Chain Management | Healthcare | Technology | Non-Profit (Public Service) | Research | Start Ups | UG Student Project | PG Student Project'
);

CREATE TABLE `ref_consultancy_category` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(20) UNIQUE NOT NULL COMMENT 'Service Based | Product Based'
);

CREATE TABLE `ref_scope_of_work` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(80) UNIQUE NOT NULL COMMENT 'Testing Service using Instrument Facility | Product Development | Hardware Module Prototype Design | Software Testing | Software Design | Software Application Development | Self-Knowledge Transfer'
);

CREATE TABLE `ref_duration_unit` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(10) UNIQUE NOT NULL COMMENT 'Year | Month | Day'
);

CREATE TABLE `ref_vip_event_type` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(60) UNIQUE NOT NULL COMMENT 'Workshop | Seminar | Conference | Symposium | Value Added Course | One Credit Course | Non-Technical Events | Technical Events | Special Programs | Leader of the Week | Guest Lecture | Placement Visit | FDP/SDP | Certificate Course | Other'
);

CREATE TABLE `ref_vip_category` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(10) UNIQUE NOT NULL COMMENT 'FAA | Events | R&D'
);

CREATE TABLE `ref_industry_project_type` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(20) UNIQUE NOT NULL COMMENT 'Product | Process'
);

CREATE TABLE `ref_coe_type` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(40) UNIQUE NOT NULL COMMENT 'Industry Sponsored Lab | Industry Supported Lab'
);

CREATE TABLE `ref_financial_assistance` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(20) UNIQUE NOT NULL COMMENT 'Self | Management | NA'
);

CREATE TABLE `ref_training_mode` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(10) UNIQUE NOT NULL COMMENT 'Online | Offline'
);

CREATE TABLE `ref_lab_layout_type` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(20) UNIQUE NOT NULL COMMENT 'New Layout | Modified Layout'
);

CREATE TABLE `ref_programme_level` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(5) UNIQUE NOT NULL COMMENT 'UG | PG'
);

CREATE TABLE `ref_year_of_study` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(10) UNIQUE NOT NULL COMMENT 'First | Second | Third | Fourth'
);

CREATE TABLE `ref_visit_source` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(20) UNIQUE NOT NULL COMMENT 'Self | Department | Special Lab | Institute'
);

CREATE TABLE `ref_training_event_type` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(30) UNIQUE NOT NULL COMMENT 'Conference | Workshop | Industry Training | Seminar | Others'
);

CREATE TABLE `ref_category_sharing` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(10) UNIQUE NOT NULL COMMENT '60:40 | 70:30'
);

CREATE TABLE `ref_membership_category` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(30) UNIQUE NOT NULL COMMENT 'Institute Membership | Faculty Membership'
);

CREATE TABLE `ref_membership_type` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(20) UNIQUE NOT NULL COMMENT 'Annual | Lifetime'
);

CREATE TABLE `ref_membership_level` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(20) UNIQUE NOT NULL COMMENT 'National | International'
);

CREATE TABLE `ref_membership_validity_type` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(20) UNIQUE NOT NULL COMMENT 'Self | BIT | Others'
);

CREATE TABLE `ref_technical_society_status` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `label` varchar(15) UNIQUE NOT NULL COMMENT 'Active | Non-Active'
);

CREATE TABLE `mou` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `submission_id` int UNIQUE NOT NULL,
  `sig_number` varchar(50),
  `special_labs_involved` boolean DEFAULT false,
  `special_lab_id` int,
  `claiming_department_id` int,
  `mou_type_id` int,
  `industry_org_type_id` int,
  `if_org_type_others` varchar(200),
  `mou_based_on_id` int,
  `domain_area` varchar(300),
  `date_of_agreement` date,
  `legal_name_collaborator` varchar(300),
  `industry_location` varchar(300),
  `industry_address` text,
  `industry_website` varchar(500),
  `industry_contact_mobile` varchar(20),
  `industry_email` varchar(200),
  `duration_unit_id` int,
  `num_years` int,
  `num_months` int,
  `mou_effect_from` date,
  `mou_effect_till` date,
  `scope_of_agreement` text,
  `objectives_and_goals` text,
  `boundaries_and_limitations` text,
  `bit_roles_responsibilities` text,
  `collaborator_roles` text,
  `spoc_name` varchar(200),
  `spoc_designation` varchar(200),
  `spoc_email` varchar(200),
  `spoc_phone` varchar(20),
  `mou_signing_initiated_by` varchar(200),
  `num_faculty` smallint COMMENT '1 | 2 | 3',
  `apex_proof_id` int COMMENT 'Upload the Apex Proof',
  `email_comm_letter_proof_id` int COMMENT 'Upload Email Communication / Letter Proof',
  `signed_mou_doc_id` int COMMENT 'Upload Signed MoU Document',
  `parties_rights_doc_id` int COMMENT 'Upload Papers showing Party Rights',
  `notarized_affidavit_id` int COMMENT 'Upload Notarized Affidavit(s) of Nondisclosure',
  `geotag_photos_id` int COMMENT 'Upload Geotag Photos',
  `consolidated_doc_id` int COMMENT 'Upload All Documents as Single File'
);

CREATE TABLE `mou_purpose` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `mou_id` int NOT NULL,
  `purpose_id` int NOT NULL
);

CREATE TABLE `mou_faculty` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `mou_id` int NOT NULL,
  `faculty_id` varchar(50) NOT NULL,
  `order_no` smallint NOT NULL COMMENT '1 | 2 | 3'
);

CREATE TABLE `irp_visit` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `submission_id` int UNIQUE NOT NULL,
  `sig_number` varchar(50),
  `special_labs_involved` boolean DEFAULT false,
  `special_lab_id` int,
  `num_faculty` smallint COMMENT '1 to 6',
  `claimed_for_faculty_id` varchar(50),
  `claimed_for_department_id` int,
  `approval_type_id` int,
  `apex_no` varchar(100),
  `is_mou_related` boolean,
  `mou_id` int COMMENT 'Required if is_mou_related = true',
  `mou_relation_points` text,
  `from_date` date,
  `to_date` date,
  `interaction_mode_id` int,
  `if_mode_others` varchar(200),
  `purpose_id` int,
  `amount_incurred_inrs` decimal(12,2),
  `num_industry` smallint COMMENT '1 to 6',
  `apex_proof_id` int COMMENT 'Upload Apex Proof',
  `geotag_photos_id` int COMMENT 'Upload Geotag Photos',
  `irp_form_signed_id` int COMMENT 'Upload IRP form duly signed by Industry person',
  `consolidated_doc_id` int COMMENT 'Upload Consolidated Document'
);

CREATE TABLE `irp_visit_faculty` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `irp_visit_id` int NOT NULL,
  `faculty_id` varchar(50) NOT NULL,
  `order_no` smallint NOT NULL COMMENT '1 to 6'
);

CREATE TABLE `irp_visit_industry` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `irp_visit_id` int NOT NULL,
  `industry_order` smallint NOT NULL COMMENT '1 to 6',
  `industry_name` varchar(300),
  `industry_type` varchar(100),
  `industry_location` varchar(300),
  `industry_website` varchar(500),
  `contact_person_name` varchar(200),
  `contact_designation` varchar(200),
  `contact_no` varchar(20),
  `contact_email` varchar(200)
);

CREATE TABLE `irp_industry_points_discussed` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `irp_visit_industry_id` int NOT NULL,
  `point_id` int NOT NULL
);

CREATE TABLE `irp_industry_expected_outcomes` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `irp_visit_industry_id` int NOT NULL,
  `outcome_id` int NOT NULL
);

CREATE TABLE `consultancy` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `submission_id` int UNIQUE NOT NULL,
  `special_labs_involved` boolean DEFAULT false,
  `special_lab_id` int,
  `claiming_department_id` int,
  `consultant_type_id` int,
  `sector_id` int,
  `org_name` varchar(300),
  `org_address` text,
  `core_sector_id` int,
  `project_title` varchar(300),
  `project_category_id` int,
  `scope_of_work_id` int,
  `duration_unit_id` int,
  `from_date` date,
  `to_date` date,
  `is_mou_related` boolean,
  `mou_id` int,
  `is_irp_related` boolean,
  `irp_visit_id` int,
  `is_fesem_related` boolean,
  `is_roi_related` boolean,
  `date_of_payment_1` date,
  `consultancy_amount_1_inrs` decimal(14,2),
  `is_gst_included_1` boolean,
  `amount_after_gst_1` decimal(14,2),
  `ownership_rights_desc` text,
  `consultant_agreement_desc` text,
  `date_of_payment_2` date,
  `college_resources_utilized` boolean,
  `faculty_share_pct_resources` decimal(5,2),
  `institute_share_pct_resources` decimal(5,2),
  `resources_list` text,
  `college_transport_utilized` boolean,
  `transport_area_visited` varchar(300),
  `distance_km` decimal(10,2),
  `petrol_cost_per_km` decimal(8,2),
  `transport_cost` decimal(12,2),
  `consumables_utilized` boolean,
  `consumables_list` text,
  `consumables_charge` decimal(12,2),
  `faculty_share_pct_no_resources` decimal(5,2),
  `institute_share_pct_no_resources` decimal(5,2),
  `faculty_share_before_deduction` decimal(14,2),
  `institute_share_before_addition` decimal(14,2),
  `net_faculty_share_amount` decimal(14,2),
  `net_institute_share_amount` decimal(14,2),
  `num_faculty_members` int,
  `consolidated_doc_id` int COMMENT 'Upload Consolidated Document',
  `rent_agreement_id` int COMMENT 'Rent Agreement',
  `consultancy_agreement_id` int COMMENT 'Upload Consultancy Agreement',
  `communication_proof_id` int COMMENT 'Upload Communication Proof',
  `audit_doc_id` int COMMENT 'Upload Audit Documents Proof (Annexures 1/2)',
  `work_logs_id` int COMMENT 'Upload Work Logs Proof',
  `invoice_receipt_id` int COMMENT 'Upload Invoice Receipt',
  `transaction_proof_id` int COMMENT 'Upload Transaction Proof',
  `geotag_photos_id` int COMMENT 'Upload Geotag Photos',
  `consultancy_report_id` int COMMENT 'Upload Consultancy Report Proof',
  `all_consolidated_doc_id` int COMMENT 'Consolidated: Comm+Audit+WorkLogs+Invoice+Transaction+Geotag+Report',
  `visiting_card_id` int COMMENT 'Upload Visiting Card of the Organisation',
  `partnership_deed_id` int COMMENT 'Upload Partnership Deed Documents Proof',
  `noc_premises_id` int COMMENT 'Upload NOC of the Business Premises Proof',
  `nda_proof_id` int COMMENT 'Upload Non-Disclosure Agreement (Mutual) Proof'
);

CREATE TABLE `consultancy_faculty` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `consultancy_id` int NOT NULL,
  `faculty_id` varchar(50) NOT NULL,
  `sig_number` varchar(50),
  `order_no` smallint NOT NULL COMMENT '2 to 5'
);

CREATE TABLE `external_vip_visit` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `submission_id` int UNIQUE NOT NULL,
  `special_labs_involved` boolean DEFAULT false,
  `special_lab_id` int,
  `guest_from_industry` boolean,
  `event_name` varchar(300),
  `event_type_id` int,
  `category_id` int,
  `if_event_type_others` varchar(200),
  `guest_name` varchar(200),
  `guest_designation` varchar(200),
  `org_name` varchar(300),
  `org_address` text,
  `start_date` date,
  `end_date` date,
  `purpose_of_visit` text,
  `mobile_number` varchar(20),
  `guest_email` varchar(200),
  `department_visited_id` int,
  `topic_presented` varchar(300),
  `is_bit_alumni` boolean,
  `guided_faculty_id` varchar(50),
  `formal_photo_id` int COMMENT 'Formal Photo of Guest (good clarity)',
  `photo_proof_id` int COMMENT 'Photo Proof',
  `approval_letter_id` int COMMENT 'Approval Letter'
);

CREATE TABLE `faculty_industry_project` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `submission_id` int UNIQUE NOT NULL,
  `sig_number` varchar(50),
  `special_labs_involved` boolean DEFAULT false,
  `special_lab_id` int,
  `students_involved` boolean COMMENT 'Yes | NA',
  `industry_name` varchar(300),
  `industry_type_id` int,
  `if_type_others` varchar(200),
  `project_type_id` int,
  `project_title` varchar(300),
  `duration_months` int,
  `start_date` date,
  `end_date` date,
  `outcome` text,
  `project_proof_id` int COMMENT 'Approval Letter, BIT Approval, Certificate, Project Report, Photos, Joint IPR'
);

CREATE TABLE `faculty_industry_project_faculty` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `faculty_id` varchar(50) NOT NULL,
  `sig_number` varchar(50),
  `order_no` smallint NOT NULL COMMENT '2 to 5'
);

CREATE TABLE `faculty_industry_project_student` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `student_name` varchar(200),
  `order_no` smallint NOT NULL COMMENT '1 to 5'
);

CREATE TABLE `centre_of_excellence` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `submission_id` int UNIQUE NOT NULL,
  `sig_number` varchar(50),
  `coe_name` varchar(300),
  `claiming_department_id` int,
  `faculty_incharge_id` varchar(50),
  `coe_type_id` int,
  `collaborative_industry_name` varchar(300),
  `date_of_establishment` date,
  `area_sq_m` decimal(10,2),
  `domain_of_centre` varchar(300),
  `is_mou_related` boolean,
  `mou_id` int,
  `is_irp_related` boolean,
  `irp_visit_id` int,
  `stock_register_maintained` boolean,
  `total_amount_inrs` decimal(14,2),
  `bit_contribution_inrs` decimal(14,2),
  `industry_contribution_with_gst` decimal(14,2),
  `industry_contribution_no_gst` decimal(14,2),
  `students_per_batch` int,
  `academic_course` varchar(300),
  `syllabus_id` int COMMENT 'Upload Syllabus',
  `lab_photo_id` int COMMENT 'Upload Lab Photo',
  `communication_proof_id` int COMMENT 'Upload Communication Proof',
  `apex_document_id` int COMMENT 'Upload Apex Document',
  `facilities_report_id` int COMMENT 'Report of Facilities Available (Word Document)',
  `utilization_report_id` int COMMENT 'Lab Utilization Report'
);

CREATE TABLE `faculty_trained_by_industry` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `submission_id` int UNIQUE NOT NULL,
  `special_labs_involved` boolean DEFAULT false,
  `special_lab_id` int,
  `training_program_name` varchar(300),
  `financial_assistance_id` int,
  `amount_incurred_inrs` decimal(12,2),
  `approval_type_id` int,
  `apex_approval_no` varchar(100),
  `industry_name` varchar(300),
  `domain_area` varchar(300),
  `industry_type_id` int,
  `if_type_others` varchar(200),
  `training_mode_id` int,
  `training_venue` varchar(300),
  `duration_days` int,
  `start_date` date,
  `end_date` date,
  `industry_website` varchar(500),
  `trainer1_name` varchar(200),
  `trainer1_designation` varchar(200),
  `trainer1_email` varchar(200),
  `trainer1_phone` varchar(20),
  `has_trainer2` boolean,
  `trainer2_name` varchar(200),
  `trainer2_designation` varchar(200),
  `trainer2_email` varchar(200),
  `trainer2_phone` varchar(20),
  `outcome` text,
  `proof_id` int COMMENT 'Apex Approval Copy, Sample Photographs, Training Certificate, Bills/Invoices'
);

CREATE TABLE `industry_advisor` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `submission_id` int UNIQUE NOT NULL,
  `sig_number` varchar(50),
  `special_labs_involved` boolean DEFAULT false,
  `special_lab_id` int,
  `industry_name` varchar(300),
  `domain_area` varchar(300),
  `industry_type_id` int,
  `if_type_others` varchar(200),
  `expert_name` varchar(200),
  `expert_designation` varchar(200),
  `expert_email` varchar(200),
  `expert_phone` varchar(20),
  `experience_years` int,
  `area_of_expertise` varchar(300),
  `industry_address` text,
  `industry_website` varchar(500),
  `interaction_frequency_months` int,
  `date_of_meeting` date,
  `expense_incurred_inrs` decimal(12,2),
  `suggestions_for_improvement` text,
  `collaborative_activities` text,
  `proof_id` int COMMENT 'Approval Letter, Minutes of Meeting, Sample Photographs, Collaborative Activities'
);

CREATE TABLE `lab_developed_by_industry` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `submission_id` int UNIQUE NOT NULL,
  `sig_number` varchar(50),
  `lab_name` varchar(300),
  `collaborative_industry` varchar(300),
  `domain_area` varchar(300),
  `lab_area_sq_m` decimal(10,2),
  `total_amount_inrs` decimal(14,2),
  `bit_contribution_inrs` decimal(14,2),
  `industry_financial_support_inrs` decimal(14,2),
  `any_equipment_sponsored` boolean,
  `sponsored_equipment_names` text,
  `any_equipment_enhancement` boolean,
  `enhanced_equipment_names` text,
  `layout_design_type_id` int,
  `curriculum_mapping` text COMMENT 'Course code and name for newly set laboratories',
  `expected_outcomes` text,
  `proof_id` int COMMENT 'Bills & Invoices, Sample Training/Equipment Sponsored, Photographs, Approval Letter'
);

CREATE TABLE `students_industrial_visit` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `submission_id` int UNIQUE NOT NULL,
  `sig_number` varchar(50),
  `programme_level_id` int,
  `industry_name` varchar(300),
  `domain_area` varchar(300),
  `industry_type_id` int,
  `if_type_others` varchar(200),
  `industry_location` varchar(300),
  `industry_website` varchar(500),
  `contact_person_name` varchar(200),
  `contact_designation` varchar(200),
  `contact_email` varchar(200),
  `contact_phone` varchar(20),
  `start_date` date,
  `end_date` date,
  `purpose_of_visit` text,
  `num_students_visited` int,
  `num_male_students` int,
  `num_female_students` int,
  `year_of_study_id` int COMMENT 'First | Second | Third | Fourth',
  `source_of_arrangement_id` int,
  `curriculum_mapping` text,
  `outcome` text,
  `proof_id` int COMMENT 'IV Approval Letter, Institute Approval, IV Report with Photos, Student Feedback Samples, Payment Proofs'
);

CREATE TABLE `students_iv_faculty` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `iv_id` int NOT NULL,
  `faculty_id` varchar(50) NOT NULL,
  `order_no` smallint NOT NULL COMMENT '1 to 3'
);

CREATE TABLE `technical_society_dept_mapping` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `technical_society_id` int NOT NULL,
  `department_id` int NOT NULL,
  `status_id` int NOT NULL COMMENT 'Active | Non-Active',
  `created_at` timestamp DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` timestamp DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE `training_to_industry` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `submission_id` int UNIQUE NOT NULL,
  `sig_number` varchar(50),
  `special_labs_involved` boolean DEFAULT false,
  `special_lab_id` int,
  `event_type_id` int,
  `if_event_type_others` varchar(200),
  `industry_name` varchar(300),
  `industry_address` text,
  `domain_area` varchar(300),
  `industry_type_id` int,
  `if_type_others` varchar(200),
  `training_mode_id` int,
  `training_venue` varchar(300),
  `industry_website` varchar(500),
  `num_persons_trained` int,
  `duration_days` int,
  `start_date` date,
  `end_date` date,
  `outcome` text,
  `honorarium_received` boolean,
  `honorarium_amount_inrs` decimal(12,2),
  `honorarium_includes_gst` boolean,
  `amount_after_gst` decimal(12,2),
  `college_resources_utilized` boolean,
  `resources_list` text,
  `consumable_charges` decimal(12,2),
  `college_transport_utilized` boolean,
  `transport_area` varchar(300),
  `distance_km` decimal(10,2),
  `petrol_cost_per_km` decimal(8,2),
  `transport_cost` decimal(12,2),
  `is_claimed_as_consultancy` boolean,
  `category_sharing_id` int,
  `faculty_share_before` decimal(14,2),
  `institute_share_before` decimal(14,2),
  `net_faculty_share` decimal(14,2),
  `net_institute_share` decimal(14,2),
  `num_faculty_members` int,
  `share_per_faculty` decimal(14,2) COMMENT 'Net faculty share / num faculty members',
  `communication_proof_id` int COMMENT 'Upload Communication Proof',
  `approval_letter_id` int COMMENT 'Approval Letter from BIT',
  `geotag_photos_id` int COMMENT 'Upload Geotag Photos',
  `participant_attendance_id` int COMMENT 'Upload Participant''s Attendance',
  `payment_proof_id` int COMMENT 'Upload Payment Proofs',
  `consolidated_doc_id` int COMMENT 'Upload Consolidated Document'
);

CREATE TABLE `professional_body_membership` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `submission_id` int UNIQUE NOT NULL,
  `membership_category_id` int NOT NULL,
  `special_labs_involved` boolean DEFAULT false,
  `special_lab_id` int,
  `professional_body_name` varchar(300),
  `membership_type_id` int,
  `membership_id` varchar(100),
  `grade_level_position` varchar(200),
  `level_id` int,
  `validity_type_id` int,
  `apex_document_id` int COMMENT 'Apex Document Proof (if applicable)',
  `amount_self_bit_inrs` decimal(12,2) COMMENT 'Amount for Self or BIT validity type',
  `if_validity_others` varchar(200),
  `amount_others_inrs` decimal(12,2) COMMENT 'Amount when Validity Type = Others',
  `document_proof_id` int COMMENT 'Certificate Proof & Apex Proof'
);

CREATE UNIQUE INDEX `role_page_access_index_0` ON `role_page_access` (`role_id`, `page_id`);

CREATE UNIQUE INDEX `mou_purpose_index_1` ON `mou_purpose` (`mou_id`, `purpose_id`);

CREATE UNIQUE INDEX `mou_faculty_index_2` ON `mou_faculty` (`mou_id`, `faculty_id`);

CREATE UNIQUE INDEX `irp_visit_faculty_index_3` ON `irp_visit_faculty` (`irp_visit_id`, `faculty_id`);

CREATE UNIQUE INDEX `consultancy_faculty_index_4` ON `consultancy_faculty` (`consultancy_id`, `faculty_id`);

CREATE UNIQUE INDEX `faculty_industry_project_faculty_index_5` ON `faculty_industry_project_faculty` (`project_id`, `faculty_id`);

CREATE UNIQUE INDEX `students_iv_faculty_index_6` ON `students_iv_faculty` (`iv_id`, `faculty_id`);

CREATE UNIQUE INDEX `technical_society_dept_mapping_index_7` ON `technical_society_dept_mapping` (`technical_society_id`, `department_id`);

ALTER TABLE `faculty` ADD FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`);

ALTER TABLE `users` ADD FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`);

ALTER TABLE `users` ADD FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`);

ALTER TABLE `users` ADD FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`);

ALTER TABLE `role_page_access` ADD FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`);

ALTER TABLE `role_page_access` ADD FOREIGN KEY (`page_id`) REFERENCES `app_pages` (`id`);

ALTER TABLE `documents` ADD FOREIGN KEY (`doc_type_id`) REFERENCES `ref_doc_type` (`id`);

ALTER TABLE `submissions` ADD FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`);

ALTER TABLE `submissions` ADD FOREIGN KEY (`iqac_verification_id`) REFERENCES `ref_iqac_status` (`id`);

ALTER TABLE `newsletter_archive` ADD FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`);

ALTER TABLE `newsletter_archive` ADD FOREIGN KEY (`newsletter_category_id`) REFERENCES `ref_newsletter_category` (`id`);

ALTER TABLE `newsletter_archive` ADD FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`);

ALTER TABLE `newsletter_archive` ADD FOREIGN KEY (`proof_document_id`) REFERENCES `documents` (`id`);

ALTER TABLE `e_content_developed` ADD FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`);

ALTER TABLE `e_content_developed` ADD FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`);

ALTER TABLE `e_content_developed` ADD FOREIGN KEY (`e_content_type_id`) REFERENCES `ref_e_content_type` (`id`);

ALTER TABLE `e_content_developed` ADD FOREIGN KEY (`document_proof_id`) REFERENCES `documents` (`id`);

ALTER TABLE `events_attended` ADD FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`);

ALTER TABLE `events_attended` ADD FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`);

ALTER TABLE `events_attended` ADD FOREIGN KEY (`event_type_id`) REFERENCES `ref_event_type_attended` (`id`);

ALTER TABLE `events_attended` ADD FOREIGN KEY (`organizer_type_id`) REFERENCES `ref_organizer_type` (`id`);

ALTER TABLE `events_attended` ADD FOREIGN KEY (`event_level_id`) REFERENCES `ref_event_level` (`id`);

ALTER TABLE `events_attended` ADD FOREIGN KEY (`event_mode_id`) REFERENCES `ref_event_mode` (`id`);

ALTER TABLE `events_attended` ADD FOREIGN KEY (`sponsorship_type_id`) REFERENCES `ref_sponsorship_type` (`id`);

ALTER TABLE `events_attended` ADD FOREIGN KEY (`apex_proof_id`) REFERENCES `documents` (`id`);

ALTER TABLE `events_attended` ADD FOREIGN KEY (`certificate_proof_id`) REFERENCES `documents` (`id`);

ALTER TABLE `events_attended` ADD FOREIGN KEY (`geotag_photos_id`) REFERENCES `documents` (`id`);

ALTER TABLE `events_organized` ADD FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`);

ALTER TABLE `events_organized` ADD FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`);

ALTER TABLE `events_organized` ADD FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`);

ALTER TABLE `events_organized` ADD FOREIGN KEY (`technical_society_id`) REFERENCES `ref_technical_society` (`id`);

ALTER TABLE `events_organized` ADD FOREIGN KEY (`event_type_id`) REFERENCES `ref_event_type_organized` (`id`);

ALTER TABLE `events_organized` ADD FOREIGN KEY (`event_mode_id`) REFERENCES `ref_event_mode` (`id`);

ALTER TABLE `events_organized` ADD FOREIGN KEY (`event_level_id`) REFERENCES `ref_event_level` (`id`);

ALTER TABLE `events_organized` ADD FOREIGN KEY (`syllabus_id`) REFERENCES `documents` (`id`);

ALTER TABLE `events_organized` ADD FOREIGN KEY (`course_feedback_id`) REFERENCES `documents` (`id`);

ALTER TABLE `events_organized` ADD FOREIGN KEY (`proceedings_proof_id`) REFERENCES `documents` (`id`);

ALTER TABLE `events_organized` ADD FOREIGN KEY (`apex_proof_id`) REFERENCES `documents` (`id`);

ALTER TABLE `events_organized` ADD FOREIGN KEY (`relevant_proof_id`) REFERENCES `documents` (`id`);

ALTER TABLE `event_organized_faculty` ADD FOREIGN KEY (`event_organized_id`) REFERENCES `events_organized` (`id`);

ALTER TABLE `event_organized_faculty` ADD FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`);

ALTER TABLE `event_organized_student` ADD FOREIGN KEY (`event_organized_id`) REFERENCES `events_organized` (`id`);

ALTER TABLE `event_organized_guest` ADD FOREIGN KEY (`event_organized_id`) REFERENCES `events_organized` (`id`);

ALTER TABLE `external_examiner` ADD FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`);

ALTER TABLE `external_examiner` ADD FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`);

ALTER TABLE `external_examiner` ADD FOREIGN KEY (`purpose_id`) REFERENCES `ref_external_examiner_purpose` (`id`);

ALTER TABLE `external_examiner` ADD FOREIGN KEY (`department_of_qp_id`) REFERENCES `departments` (`id`);

ALTER TABLE `external_examiner` ADD FOREIGN KEY (`document_proof_id`) REFERENCES `documents` (`id`);

ALTER TABLE `faculty_journal_reviewer` ADD FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`);

ALTER TABLE `faculty_journal_reviewer` ADD FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`);

ALTER TABLE `faculty_journal_reviewer` ADD FOREIGN KEY (`indexing_id`) REFERENCES `ref_journal_indexing` (`id`);

ALTER TABLE `faculty_journal_reviewer` ADD FOREIGN KEY (`recognition_type_id`) REFERENCES `ref_recognition_type` (`id`);

ALTER TABLE `faculty_journal_reviewer` ADD FOREIGN KEY (`document_proof_id`) REFERENCES `documents` (`id`);

ALTER TABLE `guest_lecture_delivered` ADD FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`);

ALTER TABLE `guest_lecture_delivered` ADD FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`);

ALTER TABLE `guest_lecture_delivered` ADD FOREIGN KEY (`event_mode_id`) REFERENCES `ref_event_mode` (`id`);

ALTER TABLE `guest_lecture_delivered` ADD FOREIGN KEY (`event_level_id`) REFERENCES `ref_event_level` (`id`);

ALTER TABLE `guest_lecture_delivered` ADD FOREIGN KEY (`organization_type_id`) REFERENCES `ref_organizer_type` (`id`);

ALTER TABLE `guest_lecture_delivered` ADD FOREIGN KEY (`document_proof_id`) REFERENCES `documents` (`id`);

ALTER TABLE `guest_lecture_delivered` ADD FOREIGN KEY (`apex_proof_id`) REFERENCES `documents` (`id`);

ALTER TABLE `guest_lecture_delivered` ADD FOREIGN KEY (`sample_photographs_id`) REFERENCES `documents` (`id`);

ALTER TABLE `international_visit` ADD FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`);

ALTER TABLE `international_visit` ADD FOREIGN KEY (`fund_type_id`) REFERENCES `ref_fund_type` (`id`);

ALTER TABLE `international_visit` ADD FOREIGN KEY (`apex_proof_id`) REFERENCES `documents` (`id`);

ALTER TABLE `international_visit` ADD FOREIGN KEY (`relevant_proof_id`) REFERENCES `documents` (`id`);

ALTER TABLE `notable_achievements` ADD FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`);

ALTER TABLE `notable_achievements` ADD FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`);

ALTER TABLE `notable_achievements` ADD FOREIGN KEY (`technical_society_id`) REFERENCES `ref_technical_society` (`id`);

ALTER TABLE `notable_achievements` ADD FOREIGN KEY (`level_id`) REFERENCES `ref_event_level` (`id`);

ALTER TABLE `notable_achievements` ADD FOREIGN KEY (`photo_proof_id`) REFERENCES `documents` (`id`);

ALTER TABLE `notable_achievements` ADD FOREIGN KEY (`document_proof_id`) REFERENCES `documents` (`id`);

ALTER TABLE `online_course` ADD FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`);

ALTER TABLE `online_course` ADD FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`);

ALTER TABLE `online_course` ADD FOREIGN KEY (`course_type_id`) REFERENCES `ref_course_type` (`id`);

ALTER TABLE `online_course` ADD FOREIGN KEY (`level_of_event_id`) REFERENCES `ref_event_level` (`id`);

ALTER TABLE `online_course` ADD FOREIGN KEY (`sponsorship_type_id`) REFERENCES `ref_sponsorship_type` (`id`);

ALTER TABLE `online_course` ADD FOREIGN KEY (`marksheet_proof_id`) REFERENCES `documents` (`id`);

ALTER TABLE `online_course` ADD FOREIGN KEY (`fdp_proof_id`) REFERENCES `documents` (`id`);

ALTER TABLE `online_course` ADD FOREIGN KEY (`apex_proof_id`) REFERENCES `documents` (`id`);

ALTER TABLE `online_course` ADD FOREIGN KEY (`certificate_proof_id`) REFERENCES `documents` (`id`);

ALTER TABLE `paper_presentation` ADD FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`);

ALTER TABLE `paper_presentation` ADD FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`);

ALTER TABLE `paper_presentation` ADD FOREIGN KEY (`event_mode_id`) REFERENCES `ref_event_mode` (`id`);

ALTER TABLE `paper_presentation` ADD FOREIGN KEY (`organizer_type_id`) REFERENCES `ref_organizer_type` (`id`);

ALTER TABLE `paper_presentation` ADD FOREIGN KEY (`event_level_id`) REFERENCES `ref_event_level` (`id`);

ALTER TABLE `paper_presentation` ADD FOREIGN KEY (`sponsorship_type_id`) REFERENCES `ref_sponsorship_type` (`id`);

ALTER TABLE `paper_presentation` ADD FOREIGN KEY (`apex_proof_id`) REFERENCES `documents` (`id`);

ALTER TABLE `paper_presentation` ADD FOREIGN KEY (`document_proof_id`) REFERENCES `documents` (`id`);

ALTER TABLE `paper_presentation` ADD FOREIGN KEY (`award_proof_id`) REFERENCES `documents` (`id`);

ALTER TABLE `paper_presentation_faculty` ADD FOREIGN KEY (`paper_presentation_id`) REFERENCES `paper_presentation` (`id`);

ALTER TABLE `paper_presentation_faculty` ADD FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`);

ALTER TABLE `paper_presentation_ext_faculty` ADD FOREIGN KEY (`paper_presentation_id`) REFERENCES `paper_presentation` (`id`);

ALTER TABLE `paper_presentation_industry` ADD FOREIGN KEY (`paper_presentation_id`) REFERENCES `paper_presentation` (`id`);

ALTER TABLE `paper_presentation_student` ADD FOREIGN KEY (`paper_presentation_id`) REFERENCES `paper_presentation` (`id`);

ALTER TABLE `resource_person` ADD FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`);

ALTER TABLE `resource_person` ADD FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`);

ALTER TABLE `resource_person` ADD FOREIGN KEY (`category_id`) REFERENCES `ref_resource_person_category` (`id`);

ALTER TABLE `resource_person` ADD FOREIGN KEY (`document_proof_id`) REFERENCES `documents` (`id`);

ALTER TABLE `mou` ADD FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`);

ALTER TABLE `mou` ADD FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`);

ALTER TABLE `mou` ADD FOREIGN KEY (`claiming_department_id`) REFERENCES `departments` (`id`);

ALTER TABLE `mou` ADD FOREIGN KEY (`mou_type_id`) REFERENCES `ref_mou_type` (`id`);

ALTER TABLE `mou` ADD FOREIGN KEY (`industry_org_type_id`) REFERENCES `ref_industry_org_type` (`id`);

ALTER TABLE `mou` ADD FOREIGN KEY (`mou_based_on_id`) REFERENCES `ref_mou_based_on` (`id`);

ALTER TABLE `mou` ADD FOREIGN KEY (`duration_unit_id`) REFERENCES `ref_mou_duration_unit` (`id`);

ALTER TABLE `mou` ADD FOREIGN KEY (`apex_proof_id`) REFERENCES `documents` (`id`);

ALTER TABLE `mou` ADD FOREIGN KEY (`email_comm_letter_proof_id`) REFERENCES `documents` (`id`);

ALTER TABLE `mou` ADD FOREIGN KEY (`signed_mou_doc_id`) REFERENCES `documents` (`id`);

ALTER TABLE `mou` ADD FOREIGN KEY (`parties_rights_doc_id`) REFERENCES `documents` (`id`);

ALTER TABLE `mou` ADD FOREIGN KEY (`notarized_affidavit_id`) REFERENCES `documents` (`id`);

ALTER TABLE `mou` ADD FOREIGN KEY (`geotag_photos_id`) REFERENCES `documents` (`id`);

ALTER TABLE `mou` ADD FOREIGN KEY (`consolidated_doc_id`) REFERENCES `documents` (`id`);

ALTER TABLE `mou_purpose` ADD FOREIGN KEY (`mou_id`) REFERENCES `mou` (`id`);

ALTER TABLE `mou_purpose` ADD FOREIGN KEY (`purpose_id`) REFERENCES `ref_mou_purpose` (`id`);

ALTER TABLE `mou_faculty` ADD FOREIGN KEY (`mou_id`) REFERENCES `mou` (`id`);

ALTER TABLE `mou_faculty` ADD FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`);

ALTER TABLE `irp_visit` ADD FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`);

ALTER TABLE `irp_visit` ADD FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`);

ALTER TABLE `irp_visit` ADD FOREIGN KEY (`claimed_for_faculty_id`) REFERENCES `faculty` (`id`);

ALTER TABLE `irp_visit` ADD FOREIGN KEY (`claimed_for_department_id`) REFERENCES `departments` (`id`);

ALTER TABLE `irp_visit` ADD FOREIGN KEY (`approval_type_id`) REFERENCES `ref_approval_type` (`id`);

ALTER TABLE `irp_visit` ADD FOREIGN KEY (`mou_id`) REFERENCES `mou` (`id`);

ALTER TABLE `irp_visit` ADD FOREIGN KEY (`interaction_mode_id`) REFERENCES `ref_irp_interaction_mode` (`id`);

ALTER TABLE `irp_visit` ADD FOREIGN KEY (`purpose_id`) REFERENCES `ref_irp_purpose` (`id`);

ALTER TABLE `irp_visit` ADD FOREIGN KEY (`apex_proof_id`) REFERENCES `documents` (`id`);

ALTER TABLE `irp_visit` ADD FOREIGN KEY (`geotag_photos_id`) REFERENCES `documents` (`id`);

ALTER TABLE `irp_visit` ADD FOREIGN KEY (`irp_form_signed_id`) REFERENCES `documents` (`id`);

ALTER TABLE `irp_visit` ADD FOREIGN KEY (`consolidated_doc_id`) REFERENCES `documents` (`id`);

ALTER TABLE `irp_visit_faculty` ADD FOREIGN KEY (`irp_visit_id`) REFERENCES `irp_visit` (`id`);

ALTER TABLE `irp_visit_faculty` ADD FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`);

ALTER TABLE `irp_visit_industry` ADD FOREIGN KEY (`irp_visit_id`) REFERENCES `irp_visit` (`id`);

ALTER TABLE `irp_industry_points_discussed` ADD FOREIGN KEY (`irp_visit_industry_id`) REFERENCES `irp_visit_industry` (`id`);

ALTER TABLE `irp_industry_points_discussed` ADD FOREIGN KEY (`point_id`) REFERENCES `ref_irp_points_discussed` (`id`);

ALTER TABLE `irp_industry_expected_outcomes` ADD FOREIGN KEY (`irp_visit_industry_id`) REFERENCES `irp_visit_industry` (`id`);

ALTER TABLE `irp_industry_expected_outcomes` ADD FOREIGN KEY (`outcome_id`) REFERENCES `ref_irp_points_discussed` (`id`);

ALTER TABLE `consultancy` ADD FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`);

ALTER TABLE `consultancy` ADD FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`);

ALTER TABLE `consultancy` ADD FOREIGN KEY (`claiming_department_id`) REFERENCES `departments` (`id`);

ALTER TABLE `consultancy` ADD FOREIGN KEY (`consultant_type_id`) REFERENCES `ref_consultancy_type` (`id`);

ALTER TABLE `consultancy` ADD FOREIGN KEY (`sector_id`) REFERENCES `ref_sector_type` (`id`);

ALTER TABLE `consultancy` ADD FOREIGN KEY (`core_sector_id`) REFERENCES `ref_core_sector` (`id`);

ALTER TABLE `consultancy` ADD FOREIGN KEY (`project_category_id`) REFERENCES `ref_consultancy_category` (`id`);

ALTER TABLE `consultancy` ADD FOREIGN KEY (`scope_of_work_id`) REFERENCES `ref_scope_of_work` (`id`);

ALTER TABLE `consultancy` ADD FOREIGN KEY (`duration_unit_id`) REFERENCES `ref_duration_unit` (`id`);

ALTER TABLE `consultancy` ADD FOREIGN KEY (`mou_id`) REFERENCES `mou` (`id`);

ALTER TABLE `consultancy` ADD FOREIGN KEY (`irp_visit_id`) REFERENCES `irp_visit` (`id`);

ALTER TABLE `consultancy` ADD FOREIGN KEY (`consolidated_doc_id`) REFERENCES `documents` (`id`);

ALTER TABLE `consultancy` ADD FOREIGN KEY (`rent_agreement_id`) REFERENCES `documents` (`id`);

ALTER TABLE `consultancy` ADD FOREIGN KEY (`consultancy_agreement_id`) REFERENCES `documents` (`id`);

ALTER TABLE `consultancy` ADD FOREIGN KEY (`communication_proof_id`) REFERENCES `documents` (`id`);

ALTER TABLE `consultancy` ADD FOREIGN KEY (`audit_doc_id`) REFERENCES `documents` (`id`);

ALTER TABLE `consultancy` ADD FOREIGN KEY (`work_logs_id`) REFERENCES `documents` (`id`);

ALTER TABLE `consultancy` ADD FOREIGN KEY (`invoice_receipt_id`) REFERENCES `documents` (`id`);

ALTER TABLE `consultancy` ADD FOREIGN KEY (`transaction_proof_id`) REFERENCES `documents` (`id`);

ALTER TABLE `consultancy` ADD FOREIGN KEY (`geotag_photos_id`) REFERENCES `documents` (`id`);

ALTER TABLE `consultancy` ADD FOREIGN KEY (`consultancy_report_id`) REFERENCES `documents` (`id`);

ALTER TABLE `consultancy` ADD FOREIGN KEY (`all_consolidated_doc_id`) REFERENCES `documents` (`id`);

ALTER TABLE `consultancy` ADD FOREIGN KEY (`visiting_card_id`) REFERENCES `documents` (`id`);

ALTER TABLE `consultancy` ADD FOREIGN KEY (`partnership_deed_id`) REFERENCES `documents` (`id`);

ALTER TABLE `consultancy` ADD FOREIGN KEY (`noc_premises_id`) REFERENCES `documents` (`id`);

ALTER TABLE `consultancy` ADD FOREIGN KEY (`nda_proof_id`) REFERENCES `documents` (`id`);

ALTER TABLE `consultancy_faculty` ADD FOREIGN KEY (`consultancy_id`) REFERENCES `consultancy` (`id`);

ALTER TABLE `consultancy_faculty` ADD FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`);

ALTER TABLE `external_vip_visit` ADD FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`);

ALTER TABLE `external_vip_visit` ADD FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`);

ALTER TABLE `external_vip_visit` ADD FOREIGN KEY (`event_type_id`) REFERENCES `ref_vip_event_type` (`id`);

ALTER TABLE `external_vip_visit` ADD FOREIGN KEY (`category_id`) REFERENCES `ref_vip_category` (`id`);

ALTER TABLE `external_vip_visit` ADD FOREIGN KEY (`department_visited_id`) REFERENCES `departments` (`id`);

ALTER TABLE `external_vip_visit` ADD FOREIGN KEY (`guided_faculty_id`) REFERENCES `faculty` (`id`);

ALTER TABLE `external_vip_visit` ADD FOREIGN KEY (`formal_photo_id`) REFERENCES `documents` (`id`);

ALTER TABLE `external_vip_visit` ADD FOREIGN KEY (`photo_proof_id`) REFERENCES `documents` (`id`);

ALTER TABLE `external_vip_visit` ADD FOREIGN KEY (`approval_letter_id`) REFERENCES `documents` (`id`);

ALTER TABLE `faculty_industry_project` ADD FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`);

ALTER TABLE `faculty_industry_project` ADD FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`);

ALTER TABLE `faculty_industry_project` ADD FOREIGN KEY (`industry_type_id`) REFERENCES `ref_industry_org_type` (`id`);

ALTER TABLE `faculty_industry_project` ADD FOREIGN KEY (`project_type_id`) REFERENCES `ref_industry_project_type` (`id`);

ALTER TABLE `faculty_industry_project` ADD FOREIGN KEY (`project_proof_id`) REFERENCES `documents` (`id`);

ALTER TABLE `faculty_industry_project_faculty` ADD FOREIGN KEY (`project_id`) REFERENCES `faculty_industry_project` (`id`);

ALTER TABLE `faculty_industry_project_faculty` ADD FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`);

ALTER TABLE `faculty_industry_project_student` ADD FOREIGN KEY (`project_id`) REFERENCES `faculty_industry_project` (`id`);

ALTER TABLE `centre_of_excellence` ADD FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`);

ALTER TABLE `centre_of_excellence` ADD FOREIGN KEY (`claiming_department_id`) REFERENCES `departments` (`id`);

ALTER TABLE `centre_of_excellence` ADD FOREIGN KEY (`faculty_incharge_id`) REFERENCES `faculty` (`id`);

ALTER TABLE `centre_of_excellence` ADD FOREIGN KEY (`coe_type_id`) REFERENCES `ref_coe_type` (`id`);

ALTER TABLE `centre_of_excellence` ADD FOREIGN KEY (`mou_id`) REFERENCES `mou` (`id`);

ALTER TABLE `centre_of_excellence` ADD FOREIGN KEY (`irp_visit_id`) REFERENCES `irp_visit` (`id`);

ALTER TABLE `centre_of_excellence` ADD FOREIGN KEY (`syllabus_id`) REFERENCES `documents` (`id`);

ALTER TABLE `centre_of_excellence` ADD FOREIGN KEY (`lab_photo_id`) REFERENCES `documents` (`id`);

ALTER TABLE `centre_of_excellence` ADD FOREIGN KEY (`communication_proof_id`) REFERENCES `documents` (`id`);

ALTER TABLE `centre_of_excellence` ADD FOREIGN KEY (`apex_document_id`) REFERENCES `documents` (`id`);

ALTER TABLE `centre_of_excellence` ADD FOREIGN KEY (`facilities_report_id`) REFERENCES `documents` (`id`);

ALTER TABLE `centre_of_excellence` ADD FOREIGN KEY (`utilization_report_id`) REFERENCES `documents` (`id`);

ALTER TABLE `faculty_trained_by_industry` ADD FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`);

ALTER TABLE `faculty_trained_by_industry` ADD FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`);

ALTER TABLE `faculty_trained_by_industry` ADD FOREIGN KEY (`financial_assistance_id`) REFERENCES `ref_financial_assistance` (`id`);

ALTER TABLE `faculty_trained_by_industry` ADD FOREIGN KEY (`approval_type_id`) REFERENCES `ref_approval_type_short` (`id`);

ALTER TABLE `faculty_trained_by_industry` ADD FOREIGN KEY (`industry_type_id`) REFERENCES `ref_industry_org_type` (`id`);

ALTER TABLE `faculty_trained_by_industry` ADD FOREIGN KEY (`training_mode_id`) REFERENCES `ref_training_mode` (`id`);

ALTER TABLE `faculty_trained_by_industry` ADD FOREIGN KEY (`proof_id`) REFERENCES `documents` (`id`);

ALTER TABLE `industry_advisor` ADD FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`);

ALTER TABLE `industry_advisor` ADD FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`);

ALTER TABLE `industry_advisor` ADD FOREIGN KEY (`industry_type_id`) REFERENCES `ref_industry_org_type` (`id`);

ALTER TABLE `industry_advisor` ADD FOREIGN KEY (`proof_id`) REFERENCES `documents` (`id`);

ALTER TABLE `lab_developed_by_industry` ADD FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`);

ALTER TABLE `lab_developed_by_industry` ADD FOREIGN KEY (`layout_design_type_id`) REFERENCES `ref_lab_layout_type` (`id`);

ALTER TABLE `lab_developed_by_industry` ADD FOREIGN KEY (`proof_id`) REFERENCES `documents` (`id`);

ALTER TABLE `students_industrial_visit` ADD FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`);

ALTER TABLE `students_industrial_visit` ADD FOREIGN KEY (`programme_level_id`) REFERENCES `ref_programme_level` (`id`);

ALTER TABLE `students_industrial_visit` ADD FOREIGN KEY (`industry_type_id`) REFERENCES `ref_industry_org_type` (`id`);

ALTER TABLE `students_industrial_visit` ADD FOREIGN KEY (`year_of_study_id`) REFERENCES `ref_year_of_study` (`id`);

ALTER TABLE `students_industrial_visit` ADD FOREIGN KEY (`source_of_arrangement_id`) REFERENCES `ref_visit_source` (`id`);

ALTER TABLE `students_industrial_visit` ADD FOREIGN KEY (`proof_id`) REFERENCES `documents` (`id`);

ALTER TABLE `students_iv_faculty` ADD FOREIGN KEY (`iv_id`) REFERENCES `students_industrial_visit` (`id`);

ALTER TABLE `students_iv_faculty` ADD FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`);

ALTER TABLE `technical_society_dept_mapping` ADD FOREIGN KEY (`technical_society_id`) REFERENCES `ref_technical_society` (`id`);

ALTER TABLE `technical_society_dept_mapping` ADD FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`);

ALTER TABLE `technical_society_dept_mapping` ADD FOREIGN KEY (`status_id`) REFERENCES `ref_technical_society_status` (`id`);

ALTER TABLE `training_to_industry` ADD FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`);

ALTER TABLE `training_to_industry` ADD FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`);

ALTER TABLE `training_to_industry` ADD FOREIGN KEY (`event_type_id`) REFERENCES `ref_training_event_type` (`id`);

ALTER TABLE `training_to_industry` ADD FOREIGN KEY (`industry_type_id`) REFERENCES `ref_industry_org_type` (`id`);

ALTER TABLE `training_to_industry` ADD FOREIGN KEY (`training_mode_id`) REFERENCES `ref_training_mode` (`id`);

ALTER TABLE `training_to_industry` ADD FOREIGN KEY (`category_sharing_id`) REFERENCES `ref_category_sharing` (`id`);

ALTER TABLE `training_to_industry` ADD FOREIGN KEY (`communication_proof_id`) REFERENCES `documents` (`id`);

ALTER TABLE `training_to_industry` ADD FOREIGN KEY (`approval_letter_id`) REFERENCES `documents` (`id`);

ALTER TABLE `training_to_industry` ADD FOREIGN KEY (`geotag_photos_id`) REFERENCES `documents` (`id`);

ALTER TABLE `training_to_industry` ADD FOREIGN KEY (`participant_attendance_id`) REFERENCES `documents` (`id`);

ALTER TABLE `training_to_industry` ADD FOREIGN KEY (`payment_proof_id`) REFERENCES `documents` (`id`);

ALTER TABLE `training_to_industry` ADD FOREIGN KEY (`consolidated_doc_id`) REFERENCES `documents` (`id`);

ALTER TABLE `professional_body_membership` ADD FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`);

ALTER TABLE `professional_body_membership` ADD FOREIGN KEY (`membership_category_id`) REFERENCES `ref_membership_category` (`id`);

ALTER TABLE `professional_body_membership` ADD FOREIGN KEY (`special_lab_id`) REFERENCES `special_lab` (`id`);

ALTER TABLE `professional_body_membership` ADD FOREIGN KEY (`membership_type_id`) REFERENCES `ref_membership_type` (`id`);

ALTER TABLE `professional_body_membership` ADD FOREIGN KEY (`level_id`) REFERENCES `ref_membership_level` (`id`);

ALTER TABLE `professional_body_membership` ADD FOREIGN KEY (`validity_type_id`) REFERENCES `ref_membership_validity_type` (`id`);

ALTER TABLE `professional_body_membership` ADD FOREIGN KEY (`apex_document_id`) REFERENCES `documents` (`id`);

ALTER TABLE `professional_body_membership` ADD FOREIGN KEY (`document_proof_id`) REFERENCES `documents` (`id`);
