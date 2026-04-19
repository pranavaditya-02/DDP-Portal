import { getMysqlPool } from '../database/mysql';
import { logger } from '../utils/logger';
const CREATE_JOURNAL_PUBLICATIONS_APPLIED_SQL = `CREATE TABLE IF NOT EXISTS journal_publications_applied (
  publication_id INT AUTO_INCREMENT PRIMARY KEY,
  faculty_id VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  indexing_type ENUM('SCOPUS','SCI/SCIE/WOS','UGC CARE','OTHERS') NOT NULL,
  indexing_others_specify VARCHAR(255) DEFAULT NULL,
  journal_name VARCHAR(255) NOT NULL,
  submitted_journal_title TEXT NOT NULL,
  submitted_date DATE NOT NULL,
  proof_document_path VARCHAR(512) NOT NULL,
  publication_status ENUM('Submitted','Under Review','Accepted for Publication','Rejected for Publication') DEFAULT 'Submitted',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;`;
let ready = false;
async function ensureTableExists() {
    if (ready)
        return;
    const pool = getMysqlPool();
    await pool.query(CREATE_JOURNAL_PUBLICATIONS_APPLIED_SQL);
    ready = true;
    logger.info('journal_publications_applied table is ready');
}
class JournalPublicationsAppliedService {
    async createPublication(input) {
        await ensureTableExists();
        const pool = getMysqlPool();
        const [result] = await pool.query(`INSERT INTO journal_publications_applied (
        faculty_id,
        indexing_type,
        indexing_others_specify,
        journal_name,
        submitted_journal_title,
        submitted_date,
        proof_document_path,
        publication_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`, [
            input.faculty_id,
            input.indexing_type,
            input.indexing_others_specify ?? null,
            input.journal_name,
            input.submitted_journal_title,
            input.submitted_date,
            input.proof_document_path,
            input.publication_status ?? 'Submitted',
        ]);
        const insertId = result.insertId;
        const record = await this.getPublicationById(insertId);
        if (!record) {
            throw new Error('Failed to load created journal publication');
        }
        return record;
    }
    async getPublicationById(publication_id) {
        await ensureTableExists();
        const pool = getMysqlPool();
        const [rows] = await pool.query(`SELECT * FROM journal_publications_applied WHERE publication_id = ? LIMIT 1`, [publication_id]);
        return rows[0] ?? null;
    }
    async listPublications() {
        await ensureTableExists();
        const pool = getMysqlPool();
        const [rows] = await pool.query(`SELECT * FROM journal_publications_applied ORDER BY created_at DESC LIMIT 1000`);
        return rows;
    }
}
export default new JournalPublicationsAppliedService();
