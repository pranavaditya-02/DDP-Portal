import { getMysqlPool } from "../database/mysql";
import { logger } from "../utils/logger";
import { OkPacket, RowDataPacket } from "mysql2";

const CREATE_STUDENTS_SQL = `CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_name VARCHAR(255) NOT NULL,
  roll_no VARCHAR(100) UNIQUE NOT NULL,
  enrollment_no VARCHAR(100) UNIQUE,
  college_email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  department VARCHAR(100),
  year_of_join INT,
  date_of_birth DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);`;

const CREATE_TRACKER_SQL = `CREATE TABLE IF NOT EXISTS internship_tracker (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tracker_number BIGINT UNSIGNED NOT NULL,
  student_id INT NOT NULL,
  industry_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  aim_objectives_link VARCHAR(255),
  offer_letter_link VARCHAR(255),
  iqac_verification ENUM('initiated', 'approved', 'declined') DEFAULT 'initiated',
  reject_reason VARCHAR(255) DEFAULT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (industry_id) REFERENCES internship_industries(id)
);`;

let tableReady = false;

async function ensureTableExists(): Promise<void> {
  if (tableReady) {
    return;
  }

  const pool = getMysqlPool();
  await pool.query(CREATE_STUDENTS_SQL);
  await pool.query(CREATE_TRACKER_SQL);

  try {
    await pool.query(`ALTER TABLE internship_tracker
      MODIFY iqac_verification ENUM('initiated', 'approved', 'declined') NOT NULL DEFAULT 'initiated';
    `);
  } catch (error) {
    logger.warn('Could not alter internship_tracker.iqac_verification, it may already match the desired schema or the table is not ready yet.', error);
  }

  try {
    await pool.query(`ALTER TABLE internship_tracker ADD COLUMN reject_reason VARCHAR(255) DEFAULT NULL AFTER iqac_verification;`);
  } catch (error) {
    logger.warn('Could not add internship_tracker.reject_reason column, it may already exist or require manual migration.', error);
  }

  try {
    await pool.query(`ALTER TABLE internship_tracker ADD COLUMN tracker_number BIGINT UNSIGNED NULL AFTER id;`);
  } catch (error) {
    logger.warn('Could not add internship_tracker.tracker_number column, it may already exist or require manual migration.', error);
  }

  tableReady = true;
  logger.info("internship_tracker table is ready");
}

export interface InternshipTrackerCreateInput {
  student_id: number;
  industry_id: number;
  start_date: string;
  end_date: string;
  aim_objectives_link?: string | null;
  offer_letter_link?: string | null;
  iqac_verification?: "initiated" | "approved" | "declined";
  reject_reason?: string | null;
}

export interface InternshipTrackerRecord {
  id: number;
  tracker_number?: number;
  student_id: number;
  student_name?: string | null;
  student_roll_no?: string | null;
  student_email?: string | null;
  industry_id: number;
  industry_name?: string | null;
  start_date: string;
  end_date: string;
  aim_objectives_link?: string | null;
  offer_letter_link?: string | null;
  iqac_verification: "initiated" | "approved" | "declined";
  reject_reason?: string | null;
}

export class InternshipTrackerService {
  private async getNextTrackerNumber(): Promise<number> {
    const pool = getMysqlPool();
    const [rows] = await pool.query<RowDataPacket[]>(`SELECT COALESCE(MAX(tracker_number), 0) AS max_number FROM internship_tracker`);
    const maxNumber = Number((rows[0] as any)?.max_number ?? 0);
    return maxNumber + 1;
  }

  async createTracker(
    data: InternshipTrackerCreateInput,
  ): Promise<InternshipTrackerRecord> {
    await ensureTableExists();

    const pool = getMysqlPool();
    const trackerNumber = await this.getNextTrackerNumber();
    const [result] = await pool.query<OkPacket>(
      `INSERT INTO internship_tracker (
          tracker_number,
          student_id,
          industry_id,
          start_date,
          end_date,
          aim_objectives_link,
          offer_letter_link,
          iqac_verification,
          reject_reason
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        trackerNumber,
        data.student_id,
        data.industry_id,
        data.start_date,
        data.end_date,
        data.aim_objectives_link ?? null,
        data.offer_letter_link ?? null,
        data.iqac_verification ?? "initiated",
        data.reject_reason ?? null,
      ],
    );

    const insertedId = result.insertId;
    const tracker = await this.getTrackerById(insertedId);
    if (!tracker) {
      throw new Error("Failed to load created internship tracker");
    }

    return tracker;
  }

  async updateIqacVerification(
    id: number,
    iqac_verification: "initiated" | "approved" | "declined",
    reject_reason?: string | null,
  ): Promise<InternshipTrackerRecord | null> {
    await ensureTableExists();

    const pool = getMysqlPool();
    if (iqac_verification === 'declined') {
      await pool.query(
        "UPDATE internship_tracker SET iqac_verification = ?, reject_reason = ? WHERE id = ?",
        [iqac_verification, reject_reason ?? null, id],
      );
    } else {
      await pool.query(
        "UPDATE internship_tracker SET iqac_verification = ?, reject_reason = NULL WHERE id = ?",
        [iqac_verification, id],
      );
    }

    return this.getTrackerById(id);
  }

  async getTrackerById(id: number): Promise<InternshipTrackerRecord | null> {
    await ensureTableExists();

    const pool = getMysqlPool();
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
        it.id,
        it.tracker_number,
        it.student_id,
        s.student_name,
        s.college_email AS student_email,
        s.roll_no AS student_roll_no,
        it.industry_id,
        i.industry AS industry_name,
        it.start_date,
        it.end_date,
        it.aim_objectives_link,
        it.offer_letter_link,
        it.iqac_verification,
        it.reject_reason
      FROM internship_tracker it
      LEFT JOIN students s ON it.student_id = s.id
      LEFT JOIN internship_industries i ON it.industry_id = i.id
      WHERE it.id = ?`,
      [id],
    );

    return (rows as InternshipTrackerRecord[])[0] ?? null;
  }

  async getTrackerByNumber(trackerNumber: number): Promise<InternshipTrackerRecord | null> {
    await ensureTableExists();

    const pool = getMysqlPool();
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
        it.id,
        it.tracker_number,
        it.student_id,
        s.student_name,
        s.college_email AS student_email,
        s.roll_no AS student_roll_no,
        it.industry_id,
        i.industry AS industry_name,
        it.start_date,
        it.end_date,
        it.aim_objectives_link,
        it.offer_letter_link,
        it.iqac_verification,
        it.reject_reason
      FROM internship_tracker it
      LEFT JOIN students s ON it.student_id = s.id
      LEFT JOIN internship_industries i ON it.industry_id = i.id
      WHERE it.tracker_number = ?`,
      [trackerNumber],
    );

    return (rows as InternshipTrackerRecord[])[0] ?? null;
  }

  async getTrackerByIdOrNumber(idOrNumber: number): Promise<InternshipTrackerRecord | null> {
    await ensureTableExists();
    const tracker = await this.getTrackerById(idOrNumber);
    if (tracker) return tracker;
    return this.getTrackerByNumber(idOrNumber);
  }

  async listTrackers(): Promise<InternshipTrackerRecord[]> {
    await ensureTableExists();

    const pool = getMysqlPool();
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
        it.id,
        it.tracker_number,
        it.student_id,
        s.student_name,
        s.college_email AS student_email,
        s.roll_no AS student_roll_no,
        it.industry_id,
        i.industry AS industry_name,
        it.start_date,
        it.end_date,
        it.aim_objectives_link,
        it.offer_letter_link,
        it.iqac_verification,
        it.reject_reason
      FROM internship_tracker it
      LEFT JOIN students s ON it.student_id = s.id
      LEFT JOIN internship_industries i ON it.industry_id = i.id
      ORDER BY it.start_date DESC
      LIMIT 500;`,
    );

    return rows as InternshipTrackerRecord[];
  }

  async listApprovedTrackersByStudent(studentId: number): Promise<InternshipTrackerRecord[]> {
    await ensureTableExists();

    const pool = getMysqlPool();
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
        it.id,
        it.tracker_number,
        it.student_id,
        s.student_name,
        s.college_email AS student_email,
        s.roll_no AS student_roll_no,
        it.industry_id,
        i.industry AS industry_name,
        it.start_date,
        it.end_date,
        it.aim_objectives_link,
        it.offer_letter_link,
        it.iqac_verification,
        it.reject_reason
      FROM internship_tracker it
      LEFT JOIN internship_reports ir ON ir.tracker_id = it.id
      LEFT JOIN students s ON it.student_id = s.id
      LEFT JOIN internship_industries i ON it.industry_id = i.id
      WHERE it.student_id = ?
        AND it.iqac_verification = 'approved'
        AND ir.id IS NULL
      ORDER BY it.start_date DESC;`,
      [studentId],
    );

    return rows as InternshipTrackerRecord[];
  }
}

export default new InternshipTrackerService();
