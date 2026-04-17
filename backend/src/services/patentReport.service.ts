import { getMysqlPool } from '../database/mysql';
import { logger } from '../utils/logger';
import { OkPacket, RowDataPacket } from 'mysql2';

const CREATE_PATENT_REPORT_SQL = `CREATE TABLE IF NOT EXISTS patent_report (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  patent_status ENUM('filed','published','granted') NOT NULL,
  position_of_student INT DEFAULT NULL,
  is_academic_project TINYINT(1) DEFAULT 0,
  faculty_id_1 VARCHAR(50) DEFAULT NULL,
  faculty_id_2 VARCHAR(50) DEFAULT NULL,
  faculty_id_3 VARCHAR(50) DEFAULT NULL,
  faculty_id_4 VARCHAR(50) DEFAULT NULL,
  registration_date DATE DEFAULT NULL,
  application_number VARCHAR(100) DEFAULT NULL,
  sdg_goals_id INT DEFAULT NULL,
  patent_tracker_id INT DEFAULT NULL,
  level ENUM('national','international') DEFAULT NULL,
  is_early_publication_filed TINYINT(1) DEFAULT NULL,
  is_examination_filed TINYINT(1) DEFAULT NULL,
  patent_license_details TEXT,
  funding_agency VARCHAR(255) DEFAULT NULL,
  funds_received TINYINT(1) DEFAULT NULL,
  fund_amount DECIMAL(12,2) DEFAULT NULL,
  is_interdisciplinary TINYINT(1) DEFAULT NULL,
  other_dept_name VARCHAR(100) DEFAULT NULL,
  other_dept_student_count INT DEFAULT NULL,
  approve_filed_by_bit_id_publication INT DEFAULT NULL,
  approve_filed_by_bit_id_granted INT DEFAULT NULL,
  yukti_proof_url TEXT,
  full_document_proof_url TEXT,
  cbr_receipt_url TEXT,
  publication_proof_url TEXT,
  granted_proof_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);`;

let ready = false;

async function ensureTableExists(): Promise<void> {
  if (ready) return;
  const pool = getMysqlPool();
  await pool.query(CREATE_PATENT_REPORT_SQL);
  ready = true;
  logger.info('patent_report table is ready');
}

export interface PatentReportCreateInput {
  student_id: number;
  patent_status: 'filed' | 'published' | 'granted';
  position_of_student?: number | null;
  is_academic_project?: boolean;
  faculty_id_1?: string | null;
  faculty_id_2?: string | null;
  faculty_id_3?: string | null;
  faculty_id_4?: string | null;
  registration_date?: string | null;
  application_number?: string | null;
  sdg_goals_id?: number | null;
  patent_tracker_id?: number | null;
  level?: 'national' | 'international' | null;
  is_early_publication_filed?: boolean | null;
  is_examination_filed?: boolean | null;
  patent_license_details?: string | null;
  funding_agency?: string | null;
  funds_received?: boolean | null;
  fund_amount?: number | null;
  is_interdisciplinary?: boolean | null;
  other_dept_name?: string | null;
  other_dept_student_count?: number | null;
  approve_filed_by_bit_id_publication?: number | null;
  approve_filed_by_bit_id_granted?: number | null;
  yukti_proof_url?: string | null;
  full_document_proof_url?: string | null;
  cbr_receipt_url?: string | null;
  publication_proof_url?: string | null;
  granted_proof_url?: string | null;
}

export interface PatentReportRecord {
  id: number;
  student_id: number;
  patent_status: string;
  position_of_student?: number | null;
  is_academic_project?: number | null;
  faculty_id_1?: string | null;
  faculty_id_2?: string | null;
  faculty_id_3?: string | null;
  faculty_id_4?: string | null;
  registration_date?: string | null;
  application_number?: string | null;
  sdg_goals_id?: number | null;
  patent_tracker_id?: number | null;
  level?: string | null;
  is_early_publication_filed?: number | null;
  is_examination_filed?: number | null;
  patent_license_details?: string | null;
  funding_agency?: string | null;
  funds_received?: number | null;
  fund_amount?: number | null;
  is_interdisciplinary?: number | null;
  other_dept_name?: string | null;
  other_dept_student_count?: number | null;
  approve_filed_by_bit_id_publication?: number | null;
  approve_filed_by_bit_id_granted?: number | null;
  yukti_proof_url?: string | null;
  full_document_proof_url?: string | null;
  cbr_receipt_url?: string | null;
  publication_proof_url?: string | null;
  granted_proof_url?: string | null;
  student_name?: string | null;
  student_roll_no?: string | null;
  student_email?: string | null;
  created_at?: string;
  updated_at?: string;
}

class PatentReportService {
  async createReport(input: PatentReportCreateInput): Promise<PatentReportRecord> {
    await ensureTableExists();
    const pool = getMysqlPool();
    const [result] = await pool.query<OkPacket>(
      `INSERT INTO patent_report (
        student_id, patent_status, position_of_student, is_academic_project,
        faculty_id_1, faculty_id_2, faculty_id_3, faculty_id_4,
        registration_date, application_number, sdg_goals_id,
        patent_tracker_id, level, is_early_publication_filed, is_examination_filed,
        patent_license_details, funding_agency, funds_received, fund_amount,
        is_interdisciplinary, other_dept_name, other_dept_student_count,
        approve_filed_by_bit_id_publication, approve_filed_by_bit_id_granted,
        yukti_proof_url, full_document_proof_url, cbr_receipt_url, publication_proof_url, granted_proof_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        input.student_id,
        input.patent_status,
        input.position_of_student ?? null,
        input.is_academic_project ? 1 : 0,
        input.faculty_id_1 ?? null,
        input.faculty_id_2 ?? null,
        input.faculty_id_3 ?? null,
        input.faculty_id_4 ?? null,
        input.registration_date ?? null,
        input.application_number ?? null,
        input.sdg_goals_id ?? null,
        input.patent_tracker_id ?? null,
        input.level ?? null,
        typeof input.is_early_publication_filed === 'boolean' ? (input.is_early_publication_filed ? 1 : 0) : null,
        typeof input.is_examination_filed === 'boolean' ? (input.is_examination_filed ? 1 : 0) : null,
        input.patent_license_details ?? null,
        input.funding_agency ?? null,
        typeof input.funds_received === 'boolean' ? (input.funds_received ? 1 : 0) : null,
        input.fund_amount ?? null,
        typeof input.is_interdisciplinary === 'boolean' ? (input.is_interdisciplinary ? 1 : 0) : null,
        input.other_dept_name ?? null,
        input.other_dept_student_count ?? null,
        input.approve_filed_by_bit_id_publication ?? null,
        input.approve_filed_by_bit_id_granted ?? null,
        input.yukti_proof_url ?? null,
        input.full_document_proof_url ?? null,
        input.cbr_receipt_url ?? null,
        input.publication_proof_url ?? null,
        input.granted_proof_url ?? null,
      ],
    );

    const id = result.insertId;
    const rec = await this.getReportById(id);
    if (!rec) throw new Error('Failed to load created patent report');
    return rec;
  }

  async getReportById(id: number): Promise<PatentReportRecord | null> {
    await ensureTableExists();
    const pool = getMysqlPool();
    const [rows] = await pool.query<RowDataPacket[]>(`SELECT pr.*, s.student_name, s.roll_no AS student_roll_no, s.college_email AS student_email FROM patent_report pr LEFT JOIN students s ON pr.student_id = s.id WHERE pr.id = ? LIMIT 1`, [id]);
    return (rows as PatentReportRecord[])[0] ?? null;
  }

  async listReports(): Promise<PatentReportRecord[]> {
    await ensureTableExists();
    const pool = getMysqlPool();
    const [rows] = await pool.query<RowDataPacket[]>(`SELECT pr.*, s.student_name, s.roll_no AS student_roll_no, s.college_email AS student_email FROM patent_report pr LEFT JOIN students s ON pr.student_id = s.id ORDER BY pr.created_at DESC LIMIT 1000`);
    return rows as PatentReportRecord[];
  }
}

export default new PatentReportService();
