import { getMysqlPool } from '../database/mysql';
import { logger } from '../utils/logger';
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
const CREATE_SPECIAL_LABS_SQL = `CREATE TABLE IF NOT EXISTS special_labs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  special_lab_code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);`;
const CREATE_SDG_GOALS_SQL = `CREATE TABLE IF NOT EXISTS sdg_goals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  goal_index INT NOT NULL UNIQUE,
  goal_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;
const CREATE_REPORT_SQL = `CREATE TABLE IF NOT EXISTS internship_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_number BIGINT UNSIGNED NOT NULL,
  tracker_id INT NOT NULL,
  student_id INT NOT NULL,
  special_lab_id INT NOT NULL,
  year_of_study INT NOT NULL,
  sector ENUM('Government', 'Private') NOT NULL,
  industry_address_line_1 VARCHAR(255) NOT NULL,
  industry_address_line_2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL,
  industry_website VARCHAR(255) NOT NULL,
  industry_contact_details TEXT NOT NULL,
  referred_by ENUM('Alumni', 'Faculty', 'Others') NOT NULL,
  referee_name VARCHAR(255),
  referee_mobile_number VARCHAR(20),
  stipend_received ENUM('Yes', 'No') NOT NULL,
  stipend_amount DECIMAL(10, 2) DEFAULT 0.00,
  is_through_aicte ENUM('Yes', 'No') NOT NULL,
  claim_type ENUM('Course Exemption', 'Reward Points') NOT NULL,
  sdg_goal_id INT NOT NULL,
  full_document_proof_url VARCHAR(255) NOT NULL,
  original_certificate_url VARCHAR(255) NOT NULL,
  attested_certificate_url VARCHAR(255) NOT NULL,
  iqac_verification ENUM('initiated', 'approved', 'declined') DEFAULT 'initiated',
  
  reject_reason VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tracker FOREIGN KEY (tracker_id) REFERENCES internship_tracker(id),
  CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES students(id),
  CONSTRAINT fk_special_lab FOREIGN KEY (special_lab_id) REFERENCES special_labs(id),
  CONSTRAINT fk_mapping_sdg FOREIGN KEY (sdg_goal_id) REFERENCES sdg_goals(id)
);`;
let tableReady = false;
async function ensureTablesExist() {
    if (tableReady) {
        return;
    }
    const pool = getMysqlPool();
    await pool.query(CREATE_STUDENTS_SQL);
    await pool.query(CREATE_SPECIAL_LABS_SQL);
    await pool.query(CREATE_SDG_GOALS_SQL);
    await pool.query(CREATE_REPORT_SQL);
    try {
        await pool.query(`ALTER TABLE internship_reports ADD COLUMN tracker_id INT NOT NULL AFTER id`);
    }
    catch (error) {
        logger.warn('Could not add internship_reports.tracker_id column, it may already exist or require manual migration.', error);
    }
    try {
        await pool.query(`ALTER TABLE internship_reports DROP INDEX tracker_id`);
    }
    catch (error) {
        logger.warn('Could not drop internship_reports.tracker_id unique index, it may not exist yet.', error);
    }
    try {
        await pool.query(`ALTER TABLE internship_reports DROP INDEX uk_tracker_id`);
    }
    catch (error) {
        logger.warn('Could not drop internship_reports.uk_tracker_id unique index, it may not exist yet.', error);
    }
    try {
        const [rows] = await pool.query(`SELECT COUNT(1) AS cnt FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'internship_reports' AND INDEX_NAME = 'uk_tracker_id'`);
        const cnt = Number(rows?.[0]?.cnt ?? 0);
        if (cnt > 0) {
            await pool.query(`ALTER TABLE internship_reports DROP INDEX uk_tracker_id`);
            logger.info('Dropped existing uk_tracker_id index from internship_reports');
        }
    }
    catch (error) {
        logger.warn('Failed to detect/drop uk_tracker_id via INFORMATION_SCHEMA.', error);
    }
    try {
        await pool.query(`ALTER TABLE internship_reports ADD COLUMN report_number BIGINT UNSIGNED NULL AFTER id`);
    }
    catch (error) {
        logger.warn('Could not add internship_reports.report_number column, it may already exist or require manual migration.', error);
    }
    try {
        await pool.query(`ALTER TABLE internship_reports ADD COLUMN reject_reason VARCHAR(255) DEFAULT NULL AFTER iqac_verification`);
    }
    catch (error) {
        logger.warn('Could not add internship_reports.reject_reason column, it may already exist or require manual migration.', error);
    }
    try {
        await pool.query(`ALTER TABLE internship_reports ADD CONSTRAINT fk_tracker FOREIGN KEY (tracker_id) REFERENCES internship_tracker(id)`);
    }
    catch (error) {
        logger.warn('Could not add internship_reports.fk_tracker constraint, it may already exist or require manual migration.', error);
    }
    tableReady = true;
    logger.info('internship_reports tables are ready');
}
export class InternshipReportService {
    async getNextReportNumber() {
        const pool = getMysqlPool();
        const [rows] = await pool.query(`SELECT COALESCE(MAX(report_number), 0) AS max_number FROM internship_reports`);
        const maxNumber = Number(rows[0]?.max_number ?? 0);
        return maxNumber + 1;
    }
    async createReport(data) {
        await ensureTablesExist();
        const pool = getMysqlPool();
        const [existingReport] = await pool.query('SELECT id FROM internship_reports WHERE tracker_id = ? AND iqac_verification IN (\'initiated\', \'approved\') LIMIT 1', [data.tracker_id]);
        if (existingReport.length > 0) {
            throw new Error('A report already exists for this tracker.');
        }
        const reportNumber = await this.getNextReportNumber();
        const [result] = await pool.query(`INSERT INTO internship_reports (
        report_number,
        tracker_id,
        student_id,
        special_lab_id,
        year_of_study,
        sector,
        industry_address_line_1,
        industry_address_line_2,
        city,
        state,
        postal_code,
        country,
        industry_website,
        industry_contact_details,
        referred_by,
        referee_name,
        referee_mobile_number,
        stipend_received,
        stipend_amount,
        is_through_aicte,
        claim_type,
        sdg_goal_id,
        full_document_proof_url,
        original_certificate_url,
        attested_certificate_url,
        iqac_verification,
        reject_reason
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`, [
            reportNumber,
            data.tracker_id,
            data.student_id,
            data.special_lab_id,
            data.year_of_study,
            data.sector,
            data.industry_address_line_1,
            data.industry_address_line_2 ?? null,
            data.city,
            data.state,
            data.postal_code,
            data.country,
            data.industry_website,
            data.industry_contact_details,
            data.referred_by,
            data.referee_name ?? null,
            data.referee_mobile_number ?? null,
            data.stipend_received,
            data.stipend_amount,
            data.is_through_aicte,
            data.claim_type,
            data.sdg_goal_id,
            data.full_document_proof_url,
            data.original_certificate_url,
            data.attested_certificate_url,
            data.iqac_verification ?? 'initiated',
            data.reject_reason ?? null,
        ]);
        const insertedId = result.insertId;
        const report = await this.getReportById(insertedId);
        if (!report) {
            throw new Error('Failed to load created internship report');
        }
        return report;
    }
    async updateIqacVerification(id, iqac_verification, reject_reason) {
        await ensureTablesExist();
        const pool = getMysqlPool();
        if (iqac_verification === 'declined') {
            await pool.query('UPDATE internship_reports SET iqac_verification = ?, reject_reason = ? WHERE id = ?', [iqac_verification, reject_reason ?? null, id]);
        }
        else {
            await pool.query('UPDATE internship_reports SET iqac_verification = ?, reject_reason = NULL WHERE id = ?', [iqac_verification, id]);
        }
        return this.getReportById(id);
    }
    async getReportById(id) {
        await ensureTablesExist();
        const pool = getMysqlPool();
        const [rows] = await pool.query(`SELECT
        ir.id,
        ir.report_number,
        ir.tracker_id,
          it.tracker_number AS tracker_number,
        ir.student_id,
        s.student_name,
        s.college_email AS student_email,
        ir.special_lab_id,
        sl.name AS special_lab_name,
        ir.year_of_study,
        ir.sector,
        ir.industry_address_line_1,
        ir.industry_address_line_2,
        ir.city,
        ir.state,
        ir.postal_code,
        ir.country,
        ir.industry_website,
        ir.industry_contact_details,
        ir.referred_by,
        ir.referee_name,
        ir.referee_mobile_number,
        ir.stipend_received,
        ir.stipend_amount,
        ir.is_through_aicte,
        ir.claim_type,
        ir.sdg_goal_id,
        sg.goal_name AS sdg_goal_name,
        ir.full_document_proof_url,
        ir.original_certificate_url,
        ir.attested_certificate_url,
        ir.iqac_verification,
        ir.reject_reason,
        ir.created_at,
        ir.updated_at
      FROM internship_reports ir
      LEFT JOIN internship_tracker it ON ir.tracker_id = it.id
      LEFT JOIN students s ON ir.student_id = s.id
      LEFT JOIN special_labs sl ON ir.special_lab_id = sl.id
      LEFT JOIN sdg_goals sg ON ir.sdg_goal_id = sg.id
      WHERE ir.id = ?`, [id]);
        return rows[0] ?? null;
    }
    async getReportByNumber(reportNumber) {
        await ensureTablesExist();
        const pool = getMysqlPool();
        const [rows] = await pool.query(`SELECT
        ir.id,
        ir.report_number,
        ir.tracker_id,
        it.tracker_number AS tracker_number,
        ir.student_id,
        s.student_name,
        s.college_email AS student_email,
        ir.special_lab_id,
        sl.name AS special_lab_name,
        ir.year_of_study,
        ir.sector,
        ir.industry_address_line_1,
        ir.industry_address_line_2,
        ir.city,
        ir.state,
        ir.postal_code,
        ir.country,
        ir.industry_website,
        ir.industry_contact_details,
        ir.referred_by,
        ir.referee_name,
        ir.referee_mobile_number,
        ir.stipend_received,
        ir.stipend_amount,
        ir.is_through_aicte,
        ir.claim_type,
        ir.sdg_goal_id,
        sg.goal_name AS sdg_goal_name,
        ir.full_document_proof_url,
        ir.original_certificate_url,
        ir.attested_certificate_url,
        ir.iqac_verification,
        ir.reject_reason,
        ir.created_at,
        ir.updated_at
      FROM internship_reports ir
      LEFT JOIN internship_tracker it ON ir.tracker_id = it.id
      LEFT JOIN students s ON ir.student_id = s.id
      LEFT JOIN special_labs sl ON ir.special_lab_id = sl.id
      LEFT JOIN sdg_goals sg ON ir.sdg_goal_id = sg.id
      WHERE ir.report_number = ?`, [reportNumber]);
        return rows[0] ?? null;
    }
    async getReportByIdOrNumber(idOrNumber) {
        await ensureTablesExist();
        const report = await this.getReportById(idOrNumber);
        if (report)
            return report;
        return this.getReportByNumber(idOrNumber);
    }
    async listReports() {
        await ensureTablesExist();
        const pool = getMysqlPool();
        const [rows] = await pool.query(`SELECT
        ir.id,
        ir.report_number,
        ir.tracker_id,
        it.tracker_number AS tracker_number,
        ir.student_id,
        s.student_name,
        s.college_email AS student_email,
        ir.special_lab_id,
        sl.name AS special_lab_name,
        ir.year_of_study,
        ir.sector,
        ir.industry_address_line_1,
        ir.industry_address_line_2,
        ir.city,
        ir.state,
        ir.postal_code,
        ir.country,
        ir.industry_website,
        ir.industry_contact_details,
        ir.referred_by,
        ir.referee_name,
        ir.referee_mobile_number,
        ir.stipend_received,
        ir.stipend_amount,
        ir.is_through_aicte,
        ir.claim_type,
        ir.sdg_goal_id,
        sg.goal_name AS sdg_goal_name,
        ir.full_document_proof_url,
        ir.original_certificate_url,
        ir.attested_certificate_url,
        ir.iqac_verification,
        ir.reject_reason,
        ir.created_at,
        ir.updated_at
      FROM internship_reports ir
      LEFT JOIN internship_tracker it ON ir.tracker_id = it.id
      LEFT JOIN students s ON ir.student_id = s.id
      LEFT JOIN special_labs sl ON ir.special_lab_id = sl.id
      LEFT JOIN sdg_goals sg ON ir.sdg_goal_id = sg.id
      ORDER BY ir.created_at DESC
      LIMIT 500`, []);
        return rows;
    }
    async listSpecialLabs() {
        await ensureTablesExist();
        const pool = getMysqlPool();
        const [rows] = await pool.query(`SELECT id, special_lab_code, name, is_active FROM special_labs WHERE is_active = TRUE ORDER BY name ASC`);
        return rows;
    }
    async listSdgGoals() {
        await ensureTablesExist();
        const pool = getMysqlPool();
        const [rows] = await pool.query(`SELECT id, goal_index, goal_name FROM sdg_goals ORDER BY goal_index ASC`);
        return rows;
    }
}
export default new InternshipReportService();
