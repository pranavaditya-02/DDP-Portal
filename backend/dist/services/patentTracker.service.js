import { getMysqlPool } from "../database/mysql";
import { logger } from "../utils/logger";
const CREATE_PATENT_TRACKER_SQL = `CREATE TABLE IF NOT EXISTS patent_tracker (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tracker_number BIGINT UNSIGNED NULL,
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
  patent_type ENUM('Product/Process','Design') NOT NULL,
  has_image_layout_support ENUM('Yes','No') DEFAULT 'No',
  experimentation_file_path VARCHAR(512),
  has_formatted_drawings ENUM('Yes','No') DEFAULT 'No',
  drawings_file_path VARCHAR(512),
  forms_1_and_2_prepared ENUM('Yes','No') DEFAULT 'No',
  forms_file_path VARCHAR(512),
  iqac_verification ENUM('Initiated','Approved','Declined') DEFAULT 'Initiated',
  reject_reason VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);`;
let tableReady = false;
async function hasColumn(pool, tableName, columnName) {
    const [rows] = await pool.query(`SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? LIMIT 1`, [tableName, columnName]);
    return rows.length > 0;
}
async function ensureTableExists() {
    if (tableReady)
        return;
    const pool = getMysqlPool();
    await pool.query(CREATE_PATENT_TRACKER_SQL);
    try {
        if (!(await hasColumn(pool, 'patent_tracker', 'tracker_number'))) {
            await pool.query(`ALTER TABLE patent_tracker ADD COLUMN tracker_number BIGINT UNSIGNED NULL AFTER id;`);
            await pool.query(`SET @rownum := 0`);
            await pool.query(`UPDATE patent_tracker pt JOIN (SELECT id, (@rownum := @rownum + 1) AS rn FROM patent_tracker ORDER BY created_at DESC, id DESC) seq ON pt.id = seq.id SET pt.tracker_number = seq.rn WHERE pt.tracker_number IS NULL;`);
        }
    }
    catch (error) {
        logger.warn('Could not add patent_tracker.tracker_number column, it may already exist or require manual migration.', error);
    }
    try {
        if (!(await hasColumn(pool, 'patent_tracker', 'reject_reason'))) {
            await pool.query(`ALTER TABLE patent_tracker ADD COLUMN reject_reason VARCHAR(255) DEFAULT NULL AFTER iqac_verification;`);
        }
    }
    catch (error) {
        logger.warn('Could not add patent_tracker.reject_reason column, it may already exist or require manual migration.', error);
    }
    tableReady = true;
    logger.info('patent_tracker table is ready');
}
export class PatentTrackerService {
    async createTracker(data) {
        await ensureTableExists();
        const pool = getMysqlPool();
        const [maxRows] = await pool.query(`SELECT COALESCE(MAX(tracker_number), 0) AS max_number FROM patent_tracker`);
        const nextTrackerNumber = Number(maxRows[0]?.max_number ?? 0) + 1;
        const [result] = await pool.query(`INSERT INTO patent_tracker (
        tracker_number, student_id, patent_contribution, second_student_id, third_student_id, fourth_student_id, fifth_student_id,
        sixth_student_id, seventh_student_id, eighth_student_id, ninth_student_id, tenth_student_id,
        patent_title, applicants_involved, faculty_id, patent_type, has_image_layout_support, experimentation_file_path,
        has_formatted_drawings, drawings_file_path, forms_1_and_2_prepared, forms_file_path, iqac_verification
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`, [
            nextTrackerNumber,
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
            data.has_formatted_drawings ?? 'No',
            data.drawings_file_path ?? null,
            data.forms_1_and_2_prepared ?? 'No',
            data.forms_file_path ?? null,
            data.iqac_verification ?? 'Initiated',
        ]);
        const insertedId = result.insertId;
        const tracker = await this.getTrackerById(insertedId);
        if (!tracker)
            throw new Error('Failed to load created patent tracker');
        return tracker;
    }
    async updateIqacVerification(id, iqac_verification, reject_reason) {
        await ensureTableExists();
        const pool = getMysqlPool();
        if (reject_reason) {
            await pool.query('UPDATE patent_tracker SET iqac_verification = ?, reject_reason = ? WHERE id = ?', [iqac_verification, reject_reason, id]);
        }
        else {
            await pool.query('UPDATE patent_tracker SET iqac_verification = ?, reject_reason = NULL WHERE id = ?', [iqac_verification, id]);
        }
        return this.getTrackerById(id);
    }
    async getTrackerById(id) {
        await ensureTableExists();
        const pool = getMysqlPool();
        const [rows] = await pool.query(`SELECT pt.*, s.student_name, s.roll_no AS student_roll_no, s.college_email AS student_email FROM patent_tracker pt LEFT JOIN students s ON pt.student_id = s.id WHERE pt.id = ? LIMIT 1`, [id]);
        return rows[0] ?? null;
    }
    async getTrackerByNumber(trackerNumber) {
        await ensureTableExists();
        const pool = getMysqlPool();
        const [rows] = await pool.query(`SELECT pt.*, s.student_name, s.roll_no AS student_roll_no, s.college_email AS student_email FROM patent_tracker pt LEFT JOIN students s ON pt.student_id = s.id WHERE pt.tracker_number = ? LIMIT 1`, [trackerNumber]);
        return rows[0] ?? null;
    }
    async getTrackerByIdOrNumber(idOrNumber) {
        const tracker = await this.getTrackerById(idOrNumber);
        if (tracker)
            return tracker;
        return this.getTrackerByNumber(idOrNumber);
    }
    async listTrackers() {
        await ensureTableExists();
        const pool = getMysqlPool();
        const [rows] = await pool.query(`SELECT pt.*, s.student_name, s.roll_no AS student_roll_no, s.college_email AS student_email FROM patent_tracker pt LEFT JOIN students s ON pt.student_id = s.id ORDER BY pt.created_at DESC LIMIT 1000`);
        return rows;
    }
}
export default new PatentTrackerService();
