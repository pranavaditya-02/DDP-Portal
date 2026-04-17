import type { OkPacket, RowDataPacket } from 'mysql2';
import type { PoolConnection } from 'mysql2/promise';
import getMysqlPool from '../database/mysql';

export type FacultyActivityCategory =
  | 'e-content-developed'
  | 'events-attended'
  | 'events-organized'
  | 'external-examiner'
  | 'guest-lecture-delivered'
  | 'international-visit'
  | 'journal-reviewer'
  | 'newsletter'
  | 'notable-achievements'
  | 'online-course'
  | 'paper-presentation'
  | 'resource-person';

interface FieldMapping {
  bodyKey: string;
  columnName: string;
  transform?: (value: unknown) => unknown;
}

interface CategoryDefinition {
  tableName: string;
  activityType: string;
  mappings: FieldMapping[];
}

const toBooleanInt = (value: unknown): number | null => {
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'number') return value === 1 ? 1 : value === 0 ? 0 : null;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['1', 'true', 'yes', 'y'].includes(normalized)) return 1;
    if (['0', 'false', 'no', 'n'].includes(normalized)) return 0;
  }
  return null;
};

const toNumberOrNull = (value: unknown): number | null => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.length === 0) return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const toStringOrNull = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return null;
};

const categoryDefinitions: Record<FacultyActivityCategory, CategoryDefinition> = {
  'e-content-developed': {
    tableName: 'e_content_developed',
    activityType: 'e_content_developed',
    mappings: [
      { bodyKey: 'specialLabsInvolved', columnName: 'special_labs_involved', transform: toBooleanInt },
      { bodyKey: 'specialLab', columnName: 'special_lab_id', transform: toNumberOrNull },
      { bodyKey: 'eContentType', columnName: 'e_content_type_id', transform: toNumberOrNull },
      { bodyKey: 'otherEContentType', columnName: 'if_others_specify', transform: toStringOrNull },
      { bodyKey: 'topicName', columnName: 'topic_name', transform: toStringOrNull },
      { bodyKey: 'publisherName', columnName: 'publisher_name', transform: toStringOrNull },
      { bodyKey: 'publisherAddress', columnName: 'publisher_address', transform: toStringOrNull },
      { bodyKey: 'contactNo', columnName: 'contact_no', transform: toStringOrNull },
      { bodyKey: 'urlOfContent', columnName: 'url_of_content', transform: toStringOrNull },
      { bodyKey: 'dateOfPublication', columnName: 'date_of_publication', transform: toStringOrNull },
      { bodyKey: 'documentProof', columnName: 'document_proof_id', transform: toNumberOrNull },
    ],
  },
  'events-attended': {
    tableName: 'events_attended',
    activityType: 'events_attended',
    mappings: [
      { bodyKey: 'specialLabsInvolved', columnName: 'special_labs_involved', transform: toBooleanInt },
      { bodyKey: 'specialLab', columnName: 'special_lab_id', transform: toNumberOrNull },
      { bodyKey: 'eventType', columnName: 'event_type_id', transform: toNumberOrNull },
      { bodyKey: 'otherEventType', columnName: 'if_event_type_others', transform: toStringOrNull },
      { bodyKey: 'psDomain', columnName: 'ps_domain', transform: toStringOrNull },
      { bodyKey: 'psDomainLevel', columnName: 'ps_domain_level', transform: toStringOrNull },
      { bodyKey: 'topicName', columnName: 'topic_name', transform: toStringOrNull },
      { bodyKey: 'organizerType', columnName: 'organizer_type_id', transform: toNumberOrNull },
      { bodyKey: 'industryNameSelect', columnName: 'industry_id', transform: toNumberOrNull },
      { bodyKey: 'industryAddress', columnName: 'industry_address', transform: toStringOrNull },
      { bodyKey: 'instituteName', columnName: 'institute_name', transform: toStringOrNull },
      { bodyKey: 'eventLevel', columnName: 'event_level_id', transform: toNumberOrNull },
      { bodyKey: 'eventTitle', columnName: 'event_title', transform: toStringOrNull },
      { bodyKey: 'organizationSector', columnName: 'organization_sector', transform: toStringOrNull },
      { bodyKey: 'eventOrganizer', columnName: 'event_organizer', transform: toStringOrNull },
      { bodyKey: 'eventMode', columnName: 'event_mode_id', transform: toNumberOrNull },
      { bodyKey: 'eventLocation', columnName: 'event_location', transform: toStringOrNull },
      { bodyKey: 'eventDuration', columnName: 'event_duration_unit', transform: toStringOrNull },
      { bodyKey: 'startDate', columnName: 'event_date_from', transform: toStringOrNull },
      { bodyKey: 'endDate', columnName: 'event_date_to', transform: toStringOrNull },
      { bodyKey: 'durationInDays', columnName: 'duration_days', transform: toNumberOrNull },
      { bodyKey: 'otherOrganizerName', columnName: 'other_organizer_name', transform: toStringOrNull },
      { bodyKey: 'sponsorshipType', columnName: 'sponsorship_type_id', transform: toNumberOrNull },
      { bodyKey: 'fundingAgencyName', columnName: 'funding_agency_name', transform: toStringOrNull },
      { bodyKey: 'amount', columnName: 'amount_inrs', transform: toNumberOrNull },
      { bodyKey: 'outcome', columnName: 'outcome', transform: toStringOrNull },
      { bodyKey: 'otherOutcome', columnName: 'if_outcome_others', transform: toStringOrNull },
    ],
  },
  'events-organized': {
    tableName: 'events_organized',
    activityType: 'events_organized',
    mappings: [
      { bodyKey: 'specialLabsInvolved', columnName: 'special_labs_involved', transform: toBooleanInt },
      { bodyKey: 'specialLab', columnName: 'special_lab_id', transform: toNumberOrNull },
      { bodyKey: 'role', columnName: 'role', transform: toStringOrNull },
      { bodyKey: 'department', columnName: 'department_id', transform: toNumberOrNull },
      { bodyKey: 'eventType', columnName: 'event_type_id', transform: toNumberOrNull },
      { bodyKey: 'otherEventType', columnName: 'if_event_type_others', transform: toStringOrNull },
      { bodyKey: 'topicsCovered', columnName: 'topics_covered', transform: toStringOrNull },
      { bodyKey: 'eventCategory', columnName: 'event_category', transform: toStringOrNull },
      { bodyKey: 'eventMode', columnName: 'event_mode_id', transform: toNumberOrNull },
      { bodyKey: 'eventLevel', columnName: 'event_level_id', transform: toNumberOrNull },
      { bodyKey: 'eventName', columnName: 'event_name', transform: toStringOrNull },
      { bodyKey: 'programType', columnName: 'type_of_program', transform: toStringOrNull },
      { bodyKey: 'clubSocietyName', columnName: 'club_society_name', transform: toStringOrNull },
      { bodyKey: 'eventOrganizer', columnName: 'event_organizer', transform: toStringOrNull },
      { bodyKey: 'eventDescription', columnName: 'event_description', transform: toStringOrNull },
      { bodyKey: 'eventLocation', columnName: 'event_location', transform: toStringOrNull },
      { bodyKey: 'startDate', columnName: 'start_date', transform: toStringOrNull },
      { bodyKey: 'endDate', columnName: 'end_date', transform: toStringOrNull },
      { bodyKey: 'eventDuration', columnName: 'event_duration_days', transform: toNumberOrNull },
      { bodyKey: 'jointlyOrganizedWith', columnName: 'jointly_organized_with', transform: toStringOrNull },
      { bodyKey: 'jointOrgName', columnName: 'joint_org_name', transform: toStringOrNull },
      { bodyKey: 'jointOrgAddress', columnName: 'joint_org_address', transform: toStringOrNull },
      { bodyKey: 'internalStudentsCount', columnName: 'internal_students_count', transform: toNumberOrNull },
      { bodyKey: 'internalFacultyCount', columnName: 'internal_faculty_count', transform: toNumberOrNull },
      { bodyKey: 'externalStudentsCount', columnName: 'external_students_count', transform: toNumberOrNull },
      { bodyKey: 'externalFacultyCount', columnName: 'external_faculty_count', transform: toNumberOrNull },
      { bodyKey: 'amountReceivedFromManagement', columnName: 'amount_from_management', transform: toBooleanInt },
      { bodyKey: 'amountReceived', columnName: 'amount_received_inrs', transform: toNumberOrNull },
      { bodyKey: 'hasFundingAgency', columnName: 'has_funding_agency', transform: toBooleanInt },
      { bodyKey: 'fundingAgencyName', columnName: 'funding_agency_name', transform: toStringOrNull },
      { bodyKey: 'registrationAmount', columnName: 'registration_amount_inrs', transform: toNumberOrNull },
      { bodyKey: 'sponsoredAmount', columnName: 'total_sponsored_amount', transform: toNumberOrNull },
      { bodyKey: 'totalRevenue', columnName: 'total_revenue', transform: toNumberOrNull },
      { bodyKey: 'publisherDetail', columnName: 'publisher_detail', transform: toStringOrNull },
      { bodyKey: 'publisherYear', columnName: 'publisher_year', transform: toNumberOrNull },
      { bodyKey: 'volumeNumber', columnName: 'volume_number', transform: toNumberOrNull },
      { bodyKey: 'issueNumber', columnName: 'issue_number', transform: toNumberOrNull },
      { bodyKey: 'pageNumber', columnName: 'page_number', transform: toStringOrNull },
      { bodyKey: 'isbnNumber', columnName: 'isbn_number', transform: toStringOrNull },
      { bodyKey: 'indexingDetail', columnName: 'indexing_detail', transform: toStringOrNull },
      { bodyKey: 'isIIC', columnName: 'is_iic_event', transform: toBooleanInt },
      { bodyKey: 'isIICUpload', columnName: 'is_iic_uploaded', transform: toBooleanInt },
      { bodyKey: 'iicBipId', columnName: 'iic_bip_id', transform: toStringOrNull },
      { bodyKey: 'isDeptAssociation', columnName: 'is_dept_association', transform: toBooleanInt },
      { bodyKey: 'isRnd', columnName: 'is_rnd_organized', transform: toBooleanInt },
      { bodyKey: 'isTechSociety', columnName: 'is_technical_society', transform: toBooleanInt },
      { bodyKey: 'techSocietyName', columnName: 'technical_society_id', transform: toNumberOrNull },
      { bodyKey: 'isMouOutcome', columnName: 'is_mou_outcome', transform: toBooleanInt },
      { bodyKey: 'mouBipId', columnName: 'mou_bip_id', transform: toStringOrNull },
      { bodyKey: 'isIrpOutcome', columnName: 'is_irp_outcome', transform: toBooleanInt },
      { bodyKey: 'irpBipId', columnName: 'irp_bip_id', transform: toStringOrNull },
      { bodyKey: 'isCoe', columnName: 'is_centre_of_excellence', transform: toBooleanInt },
      { bodyKey: 'coeBipId', columnName: 'coe_bip_id', transform: toStringOrNull },
      { bodyKey: 'isIndustryLab', columnName: 'is_industry_supported_lab', transform: toBooleanInt },
      { bodyKey: 'industryLabBipId', columnName: 'isl_bip_id', transform: toStringOrNull },
      { bodyKey: 'surchargeType', columnName: 'sponsorship_type_id', transform: toNumberOrNull },
    ],
  },
  'external-examiner': {
    tableName: 'external_examiner',
    activityType: 'external_examiner',
    mappings: [
      { bodyKey: 'specialLabsInvolved', columnName: 'special_labs_involved', transform: toBooleanInt },
      { bodyKey: 'specialLab', columnName: 'special_lab_id', transform: toNumberOrNull },
      { bodyKey: 'collegeName', columnName: 'college_name', transform: toStringOrNull },
      { bodyKey: 'instituteAddress', columnName: 'institute_address', transform: toStringOrNull },
      { bodyKey: 'purposeOfVisit', columnName: 'purpose_id', transform: toNumberOrNull },
      { bodyKey: 'nameOfExamination', columnName: 'examination_name', transform: toStringOrNull },
      { bodyKey: 'departmentOfQP', columnName: 'department_of_qp_id', transform: toNumberOrNull },
      { bodyKey: 'subjectOfQP', columnName: 'subject_of_qp', transform: toStringOrNull },
      { bodyKey: 'numberOfDays', columnName: 'num_days', transform: toNumberOrNull },
      { bodyKey: 'fromDate', columnName: 'from_date', transform: toStringOrNull },
      { bodyKey: 'toDate', columnName: 'to_date', transform: toStringOrNull },
      { bodyKey: 'documentProof', columnName: 'document_proof_id', transform: toNumberOrNull },
    ],
  },
  'guest-lecture-delivered': {
    tableName: 'guest_lecture_delivered',
    activityType: 'guest_lecture_delivered',
    mappings: [
      { bodyKey: 'specialLabsInvolved', columnName: 'special_labs_involved', transform: toBooleanInt },
      { bodyKey: 'specialLab', columnName: 'special_lab_id', transform: toNumberOrNull },
      { bodyKey: 'eventType', columnName: 'event_type', transform: toStringOrNull },
      { bodyKey: 'topic', columnName: 'topic', transform: toStringOrNull },
      { bodyKey: 'eventMode', columnName: 'event_mode_id', transform: toNumberOrNull },
      { bodyKey: 'eventLevel', columnName: 'event_level_id', transform: toNumberOrNull },
      { bodyKey: 'eventName', columnName: 'event_name', transform: toStringOrNull },
      { bodyKey: 'fromDate', columnName: 'from_date', transform: toStringOrNull },
      { bodyKey: 'toDate', columnName: 'to_date', transform: toStringOrNull },
      { bodyKey: 'numberOfDays', columnName: 'num_days', transform: toNumberOrNull },
      { bodyKey: 'typeOfOrganisation', columnName: 'organization_type_id', transform: toNumberOrNull },
      { bodyKey: 'companyName', columnName: 'org_name', transform: toStringOrNull },
      { bodyKey: 'companyAddress', columnName: 'org_address', transform: toStringOrNull },
      { bodyKey: 'numberOfParticipants', columnName: 'num_participants', transform: toNumberOrNull },
      { bodyKey: 'typeOfAudience', columnName: 'audience_type', transform: toStringOrNull },
      { bodyKey: 'documentProof', columnName: 'document_proof_id', transform: toNumberOrNull },
      { bodyKey: 'apexProof', columnName: 'apex_proof_id', transform: toNumberOrNull },
      { bodyKey: 'samplePhotographs', columnName: 'sample_photographs_id', transform: toNumberOrNull },
    ],
  },
  'international-visit': {
    tableName: 'international_visit',
    activityType: 'international_visit',
    mappings: [
      { bodyKey: 'countryVisited', columnName: 'country_visited', transform: toStringOrNull },
      { bodyKey: 'purposeOfVisit', columnName: 'purpose_of_visit', transform: toStringOrNull },
      { bodyKey: 'fromDate', columnName: 'from_date', transform: toStringOrNull },
      { bodyKey: 'toDate', columnName: 'to_date', transform: toStringOrNull },
      { bodyKey: 'fundType', columnName: 'fund_type_id', transform: toNumberOrNull },
      { bodyKey: 'fundingAgencyName', columnName: 'funding_agency_name', transform: toStringOrNull },
      { bodyKey: 'apexProof', columnName: 'apex_proof_id', transform: toNumberOrNull },
      { bodyKey: 'relevantProof', columnName: 'relevant_proof_id', transform: toNumberOrNull },
    ],
  },
  'journal-reviewer': {
    tableName: 'faculty_journal_reviewer',
    activityType: 'faculty_journal_reviewer',
    mappings: [
      { bodyKey: 'specialLabsInvolved', columnName: 'special_labs_involved', transform: toBooleanInt },
      { bodyKey: 'specialLab', columnName: 'special_lab_id', transform: toNumberOrNull },
      { bodyKey: 'journalName', columnName: 'journal_name', transform: toStringOrNull },
      { bodyKey: 'journalIndexing', columnName: 'indexing_id', transform: toNumberOrNull },
      { bodyKey: 'otherJournalIndexing', columnName: 'if_indexing_others', transform: toStringOrNull },
      { bodyKey: 'issnNo', columnName: 'issn_no', transform: toStringOrNull },
      { bodyKey: 'publisherName', columnName: 'publisher_name', transform: toStringOrNull },
      { bodyKey: 'impactFactor', columnName: 'impact_factor', transform: toNumberOrNull },
      { bodyKey: 'journalHomepageURL', columnName: 'journal_homepage_url', transform: toStringOrNull },
      { bodyKey: 'recognitionType', columnName: 'recognition_type_id', transform: toNumberOrNull },
      { bodyKey: 'otherRecognitionType', columnName: 'if_recognition_others', transform: toStringOrNull },
      { bodyKey: 'numberOfPapersReviewed', columnName: 'num_papers_reviewed', transform: toNumberOrNull },
      { bodyKey: 'date', columnName: 'review_date', transform: toStringOrNull },
      { bodyKey: 'documentProof', columnName: 'document_proof_id', transform: toNumberOrNull },
    ],
  },
  newsletter: {
    tableName: 'newsletter_archive',
    activityType: 'newsletter_archive',
    mappings: [
      { bodyKey: 'newsletterCategory', columnName: 'newsletter_category_id', transform: toNumberOrNull },
      { bodyKey: 'department', columnName: 'department_id', transform: toNumberOrNull },
      { bodyKey: 'academicYear', columnName: 'academic_year', transform: toStringOrNull },
      { bodyKey: 'dateOfPublication', columnName: 'date_of_publication', transform: toStringOrNull },
      { bodyKey: 'volumeNumber', columnName: 'volume_number', transform: toNumberOrNull },
      { bodyKey: 'issueNumber', columnName: 'issue_number', transform: toNumberOrNull },
      { bodyKey: 'issueMonth', columnName: 'issue_month', transform: toStringOrNull },
      { bodyKey: 'facultyEditorCount', columnName: 'num_faculty_editors', transform: toNumberOrNull },
      { bodyKey: 'studentEditorCount', columnName: 'num_student_editors', transform: toNumberOrNull },
      { bodyKey: 'proofDocument', columnName: 'proof_document_id', transform: toNumberOrNull },
    ],
  },
  'notable-achievements': {
    tableName: 'notable_achievements',
    activityType: 'notable_achievements',
    mappings: [
      { bodyKey: 'specialLabsInvolved', columnName: 'special_labs_involved', transform: toBooleanInt },
      { bodyKey: 'specialLab', columnName: 'special_lab_id', transform: toNumberOrNull },
      { bodyKey: 'achievementType', columnName: 'achievement_type', transform: toStringOrNull },
      { bodyKey: 'awardType', columnName: 'award_type', transform: toStringOrNull },
      { bodyKey: 'awardName', columnName: 'award_achievement_name', transform: toStringOrNull },
      { bodyKey: 'organizationType', columnName: 'organization_type', transform: toStringOrNull },
      { bodyKey: 'otherOrganizationName', columnName: 'others_organization_name', transform: toStringOrNull },
      { bodyKey: 'organizationName', columnName: 'org_name', transform: toStringOrNull },
      { bodyKey: 'awardingAgency', columnName: 'awarding_body', transform: toStringOrNull },
      { bodyKey: 'level', columnName: 'level_id', transform: toNumberOrNull },
      { bodyKey: 'receivedDate', columnName: 'received_date', transform: toStringOrNull },
      { bodyKey: 'natureOfRecognition', columnName: 'nature_of_recognition', transform: toStringOrNull },
      { bodyKey: 'prizeAmount', columnName: 'prize_amount_inrs', transform: toNumberOrNull },
      { bodyKey: 'photoProofs', columnName: 'photo_proof_id', transform: toNumberOrNull },
      { bodyKey: 'documentProof', columnName: 'document_proof_id', transform: toNumberOrNull },
      { bodyKey: 'technicalSocietyChapter', columnName: 'technical_society_id', transform: toNumberOrNull },
      { bodyKey: 'technicalSocietyInvolved', columnName: 'is_technical_society', transform: toBooleanInt },
      { bodyKey: 'typeOfRecognition', columnName: 'type_of_recognition', transform: toStringOrNull },
    ],
  },
  'online-course': {
    tableName: 'online_course',
    activityType: 'online_course',
    mappings: [
      { bodyKey: 'specialLabsInvolved', columnName: 'special_labs_involved', transform: toBooleanInt },
      { bodyKey: 'specialLab', columnName: 'special_lab_id', transform: toNumberOrNull },
      { bodyKey: 'modeOfCourse', columnName: 'mode_of_course', transform: toStringOrNull },
      { bodyKey: 'courseType', columnName: 'course_type_id', transform: toNumberOrNull },
      { bodyKey: 'typeOfOrganizer', columnName: 'type_of_organizer', transform: toStringOrNull },
      { bodyKey: 'courseName', columnName: 'course_name', transform: toStringOrNull },
      { bodyKey: 'organizationName', columnName: 'organization_name', transform: toStringOrNull },
      { bodyKey: 'organizationAddress', columnName: 'organization_address', transform: toStringOrNull },
      { bodyKey: 'levelOfEvent', columnName: 'level_of_event_id', transform: toNumberOrNull },
      { bodyKey: 'duration', columnName: 'duration_unit', transform: toStringOrNull },
      { bodyKey: 'numberOfHours', columnName: 'num_hours', transform: toNumberOrNull },
      { bodyKey: 'numberOfWeeks', columnName: 'num_weeks', transform: toNumberOrNull },
      { bodyKey: 'numberOfDays', columnName: 'num_days', transform: toNumberOrNull },
      { bodyKey: 'startDate', columnName: 'start_date', transform: toStringOrNull },
      { bodyKey: 'endDate', columnName: 'end_date', transform: toStringOrNull },
      { bodyKey: 'courseCategory', columnName: 'course_category', transform: toStringOrNull },
      { bodyKey: 'dateOfExamination', columnName: 'exam_date', transform: toStringOrNull },
      { bodyKey: 'gradeObtained', columnName: 'grade_obtained', transform: toStringOrNull },
      { bodyKey: 'isApprovedFDP', columnName: 'is_approved_fdp', transform: toBooleanInt },
      { bodyKey: 'typeOfSponsorship', columnName: 'sponsorship_type_id', transform: toNumberOrNull },
      { bodyKey: 'fundingAgencyName', columnName: 'funding_agency_name', transform: toStringOrNull },
      { bodyKey: 'claimedFor', columnName: 'claimed_for', transform: toStringOrNull },
      { bodyKey: 'markSheetProof', columnName: 'marksheet_proof_id', transform: toNumberOrNull },
      { bodyKey: 'fdpProof', columnName: 'fdp_proof_id', transform: toNumberOrNull },
      { bodyKey: 'apexProof', columnName: 'apex_proof_id', transform: toNumberOrNull },
      { bodyKey: 'certificateProof', columnName: 'certificate_proof_id', transform: toNumberOrNull },
    ],
  },
  'paper-presentation': {
    tableName: 'paper_presentation',
    activityType: 'paper_presentation',
    mappings: [
      { bodyKey: 'specialLabsInvolved', columnName: 'special_labs_involved', transform: toBooleanInt },
      { bodyKey: 'specialLab', columnName: 'special_lab_id', transform: toNumberOrNull },
      { bodyKey: 'internationalCollaboration', columnName: 'has_intl_institute_collab', transform: toBooleanInt },
      { bodyKey: 'instituteName', columnName: 'institute_name', transform: toStringOrNull },
      { bodyKey: 'conferenceName', columnName: 'conference_name', transform: toStringOrNull },
      { bodyKey: 'eventMode', columnName: 'event_mode_id', transform: toNumberOrNull },
      { bodyKey: 'eventLocation', columnName: 'event_location', transform: toStringOrNull },
      { bodyKey: 'eventOrganizer', columnName: 'organizer_name', transform: toStringOrNull },
      { bodyKey: 'eventLevel', columnName: 'event_level_id', transform: toNumberOrNull },
      { bodyKey: 'paperTitle', columnName: 'paper_title', transform: toStringOrNull },
      { bodyKey: 'eventStartDate', columnName: 'event_start_date', transform: toStringOrNull },
      { bodyKey: 'eventEndDate', columnName: 'event_end_date', transform: toStringOrNull },
      { bodyKey: 'eventDurationDays', columnName: 'event_duration_days', transform: toNumberOrNull },
      { bodyKey: 'publishedInProceedings', columnName: 'published_in_proceedings', transform: toBooleanInt },
      { bodyKey: 'pageFrom', columnName: 'page_from', transform: toNumberOrNull },
      { bodyKey: 'pageTo', columnName: 'page_to', transform: toNumberOrNull },
      { bodyKey: 'typeOfSponsorship', columnName: 'sponsorship_type_id', transform: toNumberOrNull },
      { bodyKey: 'fundingAgencyName', columnName: 'funding_agency_name', transform: toStringOrNull },
      { bodyKey: 'fundingAmount', columnName: 'amount_inrs', transform: toNumberOrNull },
      { bodyKey: 'registrationAmount', columnName: 'registration_amount_inrs', transform: toNumberOrNull },
      { bodyKey: 'awardReceived', columnName: 'award_received', transform: toBooleanInt },
      { bodyKey: 'apexProof', columnName: 'apex_proof_id', transform: toNumberOrNull },
      { bodyKey: 'documentProof', columnName: 'document_proof_id', transform: toNumberOrNull },
      { bodyKey: 'awardProof', columnName: 'award_proof_id', transform: toNumberOrNull },
    ],
  },
  'resource-person': {
    tableName: 'resource_person',
    activityType: 'resource_person',
    mappings: [
      { bodyKey: 'specialLabsInvolved', columnName: 'special_labs_involved', transform: toBooleanInt },
      { bodyKey: 'specialLab', columnName: 'special_lab_id', transform: toNumberOrNull },
      { bodyKey: 'resourcePersonCategory', columnName: 'category_id', transform: toNumberOrNull },
      { bodyKey: 'purposeOfInteraction', columnName: 'purpose_of_interaction', transform: toStringOrNull },
      { bodyKey: 'nameOfPanel', columnName: 'panel_name', transform: toStringOrNull },
      { bodyKey: 'typeOfOrganisation', columnName: 'organization_type', transform: toStringOrNull },
      { bodyKey: 'organisationNameAndAddress', columnName: 'org_name_address', transform: toStringOrNull },
      { bodyKey: 'visitingDepartmentIndustry', columnName: 'visiting_dept_industry', transform: toStringOrNull },
      { bodyKey: 'visitingDepartmentInstitute', columnName: 'visiting_dept_institute', transform: toStringOrNull },
      { bodyKey: 'numberOfDays', columnName: 'num_days', transform: toNumberOrNull },
      { bodyKey: 'fromDate', columnName: 'from_date', transform: toStringOrNull },
      { bodyKey: 'toDate', columnName: 'to_date', transform: toStringOrNull },
      { bodyKey: 'documentProof', columnName: 'document_proof_id', transform: toNumberOrNull },
    ],
  },
};

const getDefinition = (category: string): CategoryDefinition => {
  const definition = categoryDefinitions[category as FacultyActivityCategory];
  if (!definition) {
    throw new Error(`Unsupported category: ${category}`);
  }
  return definition;
};

const createSubmission = async (
  connection: PoolConnection,
  taskId: string | null,
  activityType: string,
  facultyId: string | null,
  remarks: string | null,
): Promise<number> => {
  try {
    const [result] = await connection.execute<OkPacket>(
      `INSERT INTO submissions (task_id, remarks, activity_type, faculty_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [taskId, remarks, activityType, facultyId],
    );

    return Number(result.insertId);
  } catch (error) {
    const sqlError = error as { code?: string };
    if (sqlError.code === 'ER_DUP_ENTRY' && taskId) {
      throw new Error(`Task ID '${taskId}' already exists`);
    }
    throw error;
  }
};

const buildInsertPayload = (category: FacultyActivityCategory, data: Record<string, unknown>) => {
  const definition = getDefinition(category);
  const payload: Array<{ columnName: string; value: unknown }> = [];
  const seenColumns = new Set<string>();

  for (const mapping of definition.mappings) {
    if (!(mapping.bodyKey in data)) continue;
    const raw = data[mapping.bodyKey];
    const value = mapping.transform ? mapping.transform(raw) : raw;

    if (value === null || value === undefined) {
      continue;
    }

    if (seenColumns.has(mapping.columnName)) {
      continue;
    }

    seenColumns.add(mapping.columnName);
    payload.push({ columnName: mapping.columnName, value });
  }

  return payload;
};

class FacultyActivitiesService {
  async getCategories(): Promise<string[]> {
    return Object.keys(categoryDefinitions);
  }

  async getEntries(category: FacultyActivityCategory): Promise<RowDataPacket[]> {
    const definition = getDefinition(category);
    const pool = getMysqlPool();

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT t.*, s.task_id AS taskId
       FROM ${definition.tableName} t
       JOIN submissions s ON s.id = t.submission_id
       ORDER BY t.id DESC`,
    );

    return rows;
  }

  async createEntry(category: FacultyActivityCategory, data: Record<string, unknown>): Promise<{ id: number; submissionId: number }> {
    const definition = getDefinition(category);

    const taskId = toStringOrNull(data.taskID) ?? null;
    if (!taskId) {
      throw new Error('taskID is required');
    }

    const facultyId = toStringOrNull(data.facultyId) ?? null;
    const remarks = toStringOrNull(data.remarks) ?? null;

    const connection = await getMysqlPool().getConnection();
    try {
      await connection.beginTransaction();

      const submissionId = await createSubmission(connection, taskId, definition.activityType, facultyId, remarks);
      const payload = buildInsertPayload(category, data);
      const columns = ['submission_id', ...payload.map((item) => item.columnName)];
      const placeholders = columns.map(() => '?').join(', ');
      const values = [submissionId, ...payload.map((item) => item.value)] as unknown[];

      await connection.execute<OkPacket>(
        `INSERT INTO ${definition.tableName} (${columns.join(', ')}) VALUES (${placeholders})`,
        values as any,
      );

      await connection.commit();
      return { id: submissionId, submissionId };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default new FacultyActivitiesService();
