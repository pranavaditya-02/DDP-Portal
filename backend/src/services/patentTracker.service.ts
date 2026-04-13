import { getMysqlPool } from "../database/mysql";
import { logger } from "../utils/logger";
import { OkPacket, RowDataPacket } from "mysql2";

const CREATE_PATENT_TRACKER_SQL = `CREATE TABLE IF NOT EXISTS patent_tracker (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  patent_contribution ENUM('Applicant', 'Inventor') NOT NULL,
  second_student_id INT DEFAULT NULL,
  third_student_id INT DEFAULT NULL,
  fourth_student_id INT DEFAULT NULL,
  fifth_student_id INT DEFAULT NULL,
  sixth_student_id INT DEFAULT NULL,
  seventh_student_id INT DEFAULT NULL,
  eighth_student_id INT DEFAULT NULL,
  ninth_student_id INT DEFAULT NULL,
  tenth_student_id INT DEFAULT NULL,
  patent_title VARCHAR(255) NOT NULL,
  applicants_involved ENUM('BIT students only','BIT student along with faculty','BIT student along with external institutions') NOT NULL,
  faculty_id VARCHAR(50),
  patent_type ENUM('Product','Process','Design') NOT NULL,
  has_image_layout_support ENUM('Yes','No') DEFAULT 'No',
  experimentation_file_path VARCHAR(512),
  prior_art TEXT NOT NULL,
  novelty TEXT NOT NULL,
  has_formatted_drawings ENUM('Yes','No') DEFAULT 'No',
  drawings_file_path VARCHAR(512),
  forms_1_and_2_prepared ENUM('Yes','No') DEFAULT 'No',
  forms_file_path VARCHAR(512),
  iqac_verification ENUM('Initiated','Approved','Declined') DEFAULT 'Initiated',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);`;

let tableReady = false;

async function ensureTableExists(): Promise<void> {
  if (tableReady) return;
  const pool = getMysqlPool();
  await pool.query(CREATE_PATENT_TRACKER_SQL);
  tableReady = true;
  logger.info('patent_tracker table is ready');
}

export interface PatentTrackerCreateInput {
  student_id: number;
  patent_contribution: 'Applicant' | 'Inventor';
  second_student_id?: number | null;
  third_student_id?: number | null;
  fourth_student_id?: number | null;
  fifth_student_id?: number | null;
  sixth_student_id?: number | null;
  seventh_student_id?: number | null;
  eighth_student_id?: number | null;
  ninth_student_id?: number | null;
  tenth_student_id?: number | null;
  patent_title: string;
  applicants_involved: 'BIT students only' | 'BIT student along with faculty' | 'BIT student along with external institutions';
  faculty_id?: string | null;
  patent_type: 'Product' | 'Process' | 'Design';
  has_image_layout_support?: 'Yes' | 'No';
  experimentation_file_path?: string | null;
  prior_art: string;
  novelty: string;
  has_formatted_drawings?: 'Yes' | 'No';
  drawings_file_path?: string | null;
  forms_1_and_2_prepared?: 'Yes' | 'No';
  forms_file_path?: string | null;
  iqac_verification?: 'Initiated' | 'Approved' | 'Declined';
}

export interface PatentTrackerRecord {
  id: number;
  student_id: number;
  patent_contribution: string;
  patent_title: string;
  applicants_involved: string;
  faculty_id?: string | null;
  patent_type: string;
  has_image_layout_support: string;
  experimentation_file_path?: string | null;
  prior_art: string;
  novelty: string;
  has_formatted_drawings: string;
  drawings_file_path?: string | null;
  forms_1_and_2_prepared: string;
  forms_file_path?: string | null;
  iqac_verification: string;
  created_at: string;
  updated_at: string;
}

export class PatentTrackerService {
  async createTracker(data: PatentTrackerCreateInput): Promise<PatentTrackerRecord> {
    await ensureTableExists();
    const pool = getMysqlPool();
    const [result] = await pool.query<OkPacket>(
      `INSERT INTO patent_tracker (
        student_id, patent_contribution, second_student_id, third_student_id, fourth_student_id, fifth_student_id,
        sixth_student_id, seventh_student_id, eighth_student_id, ninth_student_id, tenth_student_id,
        patent_title, applicants_involved, faculty_id, patent_type, has_image_layout_support, experimentation_file_path,
        prior_art, novelty, has_formatted_drawings, drawings_file_path, forms_1_and_2_prepared, forms_file_path, iqac_verification
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        data.student_id,
        data.patent_contribution,
        data.second_student_id ?? null,
        data.third_student_id ?? null,
        data.fourth_student_id ?? null,
        data.fifth_student_id ?? null,
        data.sixth_student_id ?? null,
        data.seventh_student_id ?? null,
        data.eighth_student_id ?? null,
        data.ninth_student_id ?? null,
        data.tenth_student_id ?? null,
        data.patent_title,
        data.applicants_involved,
        data.faculty_id ?? null,
        data.patent_type,
        data.has_image_layout_support ?? 'No',
        data.experimentation_file_path ?? null,
        data.prior_art,
        data.novelty,
        data.has_formatted_drawings ?? 'No',
        data.drawings_file_path ?? null,
        data.forms_1_and_2_prepared ?? 'No',
        data.forms_file_path ?? null,
        data.iqac_verification ?? 'Initiated',
      ],
    );

    const insertedId = result.insertId;
    const tracker = await this.getTrackerById(insertedId);
    if (!tracker) throw new Error('Failed to load created patent tracker');
    return tracker;
  }

  async updateIqacVerification(id: number, iqac_verification: 'Initiated' | 'Approved' | 'Declined'): Promise<PatentTrackerRecord | null> {
    await ensureTableExists();
    const pool = getMysqlPool();
    await pool.query('UPDATE patent_tracker SET iqac_verification = ? WHERE id = ?', [iqac_verification, id]);
    return this.getTrackerById(id);
  }

  async getTrackerById(id: number): Promise<PatentTrackerRecord | null> {
    await ensureTableExists();
    const pool = getMysqlPool();
    const [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM patent_tracker WHERE id = ? LIMIT 1`, [id]);
    return (rows as PatentTrackerRecord[])[0] ?? null;
  }

  async listTrackers(): Promise<PatentTrackerRecord[]> {
    await ensureTableExists();
    const pool = getMysqlPool();
    const [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM patent_tracker ORDER BY created_at DESC LIMIT 1000`);
    return rows as PatentTrackerRecord[];
  }
}

export default new PatentTrackerService();
