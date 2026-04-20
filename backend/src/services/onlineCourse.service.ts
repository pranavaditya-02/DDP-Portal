import { OkPacket, RowDataPacket } from 'mysql2';
import { getMysqlPool } from '../database/mysql';
import { logger } from '../utils/logger';

const CREATE_ONLINE_COURSE_SQL = `CREATE TABLE IF NOT EXISTS student_online_course_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id VARCHAR(120) NOT NULL,
  special_labs_involved ENUM('yes', 'no') NOT NULL DEFAULT 'no',
  special_lab VARCHAR(255) DEFAULT NULL,
  mode_of_course ENUM('Online', 'Offline', 'Hybrid') NOT NULL,
  course_type VARCHAR(120) NOT NULL,
  other_course_type VARCHAR(255) DEFAULT NULL,
  type_of_organizer ENUM('Private', 'Government') NOT NULL,
  course_name VARCHAR(300) NOT NULL,
  organization_name VARCHAR(300) NOT NULL,
  organization_address TEXT NOT NULL,
  level_of_event ENUM('State', 'National', 'International') NOT NULL,
  duration_unit ENUM('Hours', 'Weeks', 'Days') NOT NULL,
  number_of_hours INT DEFAULT NULL,
  number_of_weeks INT DEFAULT NULL,
  number_of_days INT DEFAULT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  course_category ENUM('Proctored-Exam', 'Self-paced with final assessment', 'Self-paced without final assessment') NOT NULL,
  date_of_examination DATE DEFAULT NULL,
  grade_obtained VARCHAR(80) DEFAULT NULL,
  is_approved_fdp ENUM('yes', 'no') NOT NULL DEFAULT 'no',
  type_of_sponsorship ENUM('Self', 'BIT', 'Funding Agency') NOT NULL,
  funding_agency_name VARCHAR(300) DEFAULT NULL,
  claimed_for ENUM('FAP', 'Competency', 'Not-Applicable') NOT NULL,
  marksheet_proof_url VARCHAR(512) DEFAULT NULL,
  fdp_proof_url VARCHAR(512) DEFAULT NULL,
  apex_proof_url VARCHAR(512) DEFAULT NULL,
  certificate_proof_url VARCHAR(512) NOT NULL,
  iqac_verification ENUM('Initiated', 'Approved', 'Declined') NOT NULL DEFAULT 'Initiated',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_online_course_task_id (task_id),
  INDEX idx_online_course_iqac (iqac_verification),
  INDEX idx_online_course_created_at (created_at)
);`;

let tableReady = false;

async function ensureTableExists(): Promise<void> {
  if (tableReady) return;
  const pool = getMysqlPool();
  await pool.query(CREATE_ONLINE_COURSE_SQL);
  tableReady = true;
  logger.info('student_online_course_submissions table is ready');
}

export interface OnlineCourseCreateInput {
  task_id: string;
  special_labs_involved: 'yes' | 'no';
  special_lab?: string | null;
  mode_of_course: 'Online' | 'Offline' | 'Hybrid';
  course_type: string;
  other_course_type?: string | null;
  type_of_organizer: 'Private' | 'Government';
  course_name: string;
  organization_name: string;
  organization_address: string;
  level_of_event: 'State' | 'National' | 'International';
  duration_unit: 'Hours' | 'Weeks' | 'Days';
  number_of_hours?: number | null;
  number_of_weeks?: number | null;
  number_of_days?: number | null;
  start_date: string;
  end_date: string;
  course_category: 'Proctored-Exam' | 'Self-paced with final assessment' | 'Self-paced without final assessment';
  date_of_examination?: string | null;
  grade_obtained?: string | null;
  is_approved_fdp: 'yes' | 'no';
  type_of_sponsorship: 'Self' | 'BIT' | 'Funding Agency';
  funding_agency_name?: string | null;
  claimed_for: 'FAP' | 'Competency' | 'Not-Applicable';
  marksheet_proof_url?: string | null;
  fdp_proof_url?: string | null;
  apex_proof_url?: string | null;
  certificate_proof_url: string;
  iqac_verification?: 'Initiated' | 'Approved' | 'Declined';
}

export interface OnlineCourseRecord {
  id: number;
  task_id: string;
  special_labs_involved: 'yes' | 'no';
  special_lab?: string | null;
  mode_of_course: 'Online' | 'Offline' | 'Hybrid';
  course_type: string;
  other_course_type?: string | null;
  type_of_organizer: 'Private' | 'Government';
  course_name: string;
  organization_name: string;
  organization_address: string;
  level_of_event: 'State' | 'National' | 'International';
  duration_unit: 'Hours' | 'Weeks' | 'Days';
  number_of_hours?: number | null;
  number_of_weeks?: number | null;
  number_of_days?: number | null;
  start_date: string;
  end_date: string;
  course_category: 'Proctored-Exam' | 'Self-paced with final assessment' | 'Self-paced without final assessment';
  date_of_examination?: string | null;
  grade_obtained?: string | null;
  is_approved_fdp: 'yes' | 'no';
  type_of_sponsorship: 'Self' | 'BIT' | 'Funding Agency';
  funding_agency_name?: string | null;
  claimed_for: 'FAP' | 'Competency' | 'Not-Applicable';
  marksheet_proof_url?: string | null;
  fdp_proof_url?: string | null;
  apex_proof_url?: string | null;
  certificate_proof_url: string;
  iqac_verification: 'Initiated' | 'Approved' | 'Declined';
  created_at: string;
  updated_at: string;
}

export class OnlineCourseService {
  async createSubmission(data: OnlineCourseCreateInput): Promise<OnlineCourseRecord> {
    await ensureTableExists();

    const pool = getMysqlPool();
    const [result] = await pool.query<OkPacket>(
      `INSERT INTO student_online_course_submissions (
        task_id,
        special_labs_involved,
        special_lab,
        mode_of_course,
        course_type,
        other_course_type,
        type_of_organizer,
        course_name,
        organization_name,
        organization_address,
        level_of_event,
        duration_unit,
        number_of_hours,
        number_of_weeks,
        number_of_days,
        start_date,
        end_date,
        course_category,
        date_of_examination,
        grade_obtained,
        is_approved_fdp,
        type_of_sponsorship,
        funding_agency_name,
        claimed_for,
        marksheet_proof_url,
        fdp_proof_url,
        apex_proof_url,
        certificate_proof_url,
        iqac_verification
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        data.task_id,
        data.special_labs_involved,
        data.special_lab ?? null,
        data.mode_of_course,
        data.course_type,
        data.other_course_type ?? null,
        data.type_of_organizer,
        data.course_name,
        data.organization_name,
        data.organization_address,
        data.level_of_event,
        data.duration_unit,
        data.number_of_hours ?? null,
        data.number_of_weeks ?? null,
        data.number_of_days ?? null,
        data.start_date,
        data.end_date,
        data.course_category,
        data.date_of_examination ?? null,
        data.grade_obtained ?? null,
        data.is_approved_fdp,
        data.type_of_sponsorship,
        data.funding_agency_name ?? null,
        data.claimed_for,
        data.marksheet_proof_url ?? null,
        data.fdp_proof_url ?? null,
        data.apex_proof_url ?? null,
        data.certificate_proof_url,
        data.iqac_verification ?? 'Initiated',
      ],
    );

    const record = await this.getSubmissionById(result.insertId);
    if (!record) {
      throw new Error('Failed to load created online course submission');
    }
    return record;
  }

  async getSubmissionById(id: number): Promise<OnlineCourseRecord | null> {
    await ensureTableExists();

    const pool = getMysqlPool();
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM student_online_course_submissions WHERE id = ? LIMIT 1',
      [id],
    );
    return (rows as OnlineCourseRecord[])[0] ?? null;
  }

  async listSubmissions(): Promise<OnlineCourseRecord[]> {
    await ensureTableExists();

    const pool = getMysqlPool();
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM student_online_course_submissions ORDER BY created_at DESC LIMIT 1000',
    );
    return rows as OnlineCourseRecord[];
  }

  async updateIqacVerification(
    id: number,
    iqacVerification: 'Initiated' | 'Approved' | 'Declined',
  ): Promise<OnlineCourseRecord | null> {
    await ensureTableExists();

    const pool = getMysqlPool();
    await pool.query(
      'UPDATE student_online_course_submissions SET iqac_verification = ? WHERE id = ?',
      [iqacVerification, id],
    );
    return this.getSubmissionById(id);
  }

  async deleteSubmission(id: number): Promise<boolean> {
    await ensureTableExists();

    const pool = getMysqlPool();
    const [result] = await pool.query<OkPacket>(
      'DELETE FROM student_online_course_submissions WHERE id = ?',
      [id],
    );
    return result.affectedRows > 0;
  }
}

export default new OnlineCourseService();