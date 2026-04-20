import { getMysqlPool } from '../database/mysql';
import { logger } from '../utils/logger';
import { OkPacket, RowDataPacket } from 'mysql2';

const CREATE_JOURNAL_PUBLICATIONS_PUBLISHED_SQL = `CREATE TABLE IF NOT EXISTS journal_publications_published (
  publication_id INT AUTO_INCREMENT PRIMARY KEY,
  faculty_name VARCHAR(255) NOT NULL,
  task_id INT NOT NULL,
  nature_of_publication ENUM('Journal','Through Conference/Proceedings') DEFAULT 'Journal',
  conference_name VARCHAR(255) DEFAULT NULL,
  article_title TEXT NOT NULL,
  journal_name VARCHAR(255) NOT NULL,
  publisher_name VARCHAR(255) DEFAULT NULL,
  publication_type ENUM('International','National') DEFAULT NULL,
  impact_factor DECIMAL(5,3) DEFAULT NULL,
  journal_h_index INT DEFAULT NULL,
  scientific_journal_rankings ENUM('Q1','Q2','Q3','Q4','NA') DEFAULT 'NA',
  indexing SET('SCOPUS','SCI/SCIE/WOS','UGC CARE','OTHERS') DEFAULT NULL,
  indexing_others_specify VARCHAR(255) DEFAULT NULL,
  author_1 ENUM('BIT Faculty','BIT Student','Institute -National','Institute - International','Industry','NA') DEFAULT NULL,
  author_1_faculty_id VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  author_1_student_id VARCHAR(50) DEFAULT NULL,
  author_1_name VARCHAR(255) DEFAULT NULL,
  author_1_designation_dept_address TEXT DEFAULT NULL,
  author_2 ENUM('BIT Faculty','BIT Student','Institute -National','Institute - International','Industry','NA') DEFAULT NULL,
  author_2_faculty_id VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  author_2_student_id VARCHAR(50) DEFAULT NULL,
  author_2_name VARCHAR(255) DEFAULT NULL,
  author_2_designation_dept_address TEXT DEFAULT NULL,
  author_3 ENUM('BIT Faculty','BIT Student','Institute -National','Institute - International','Industry','NA') DEFAULT NULL,
  author_3_faculty_id VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  author_3_student_id VARCHAR(50) DEFAULT NULL,
  author_3_name VARCHAR(255) DEFAULT NULL,
  author_3_designation_dept_address TEXT DEFAULT NULL,
  author_4 ENUM('BIT Faculty','BIT Student','Institute -National','Institute - International','Industry','NA') DEFAULT NULL,
  author_4_faculty_id VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  author_4_student_id VARCHAR(50) DEFAULT NULL,
  author_4_name VARCHAR(255) DEFAULT NULL,
  author_4_designation_dept_address TEXT DEFAULT NULL,
  author_5 ENUM('BIT Faculty','BIT Student','Institute -National','Institute - International','Industry','NA') DEFAULT NULL,
  author_5_faculty_id VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  author_5_student_id VARCHAR(50) DEFAULT NULL,
  author_5_name VARCHAR(255) DEFAULT NULL,
  author_5_designation_dept_address TEXT DEFAULT NULL,
  author_6 ENUM('BIT Faculty','BIT Student','Institute -National','Institute - International','Industry','NA') DEFAULT NULL,
  author_6_faculty_id VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  author_6_student_id VARCHAR(50) DEFAULT NULL,
  author_6_name VARCHAR(255) DEFAULT NULL,
  author_6_designation_dept_address TEXT DEFAULT NULL,
  anna_university_annexure ENUM('Yes','No') DEFAULT NULL,
  article_web_link TEXT DEFAULT NULL,
  doi VARCHAR(255) DEFAULT NULL,
  volume_art_no VARCHAR(50) DEFAULT NULL,
  issue_no VARCHAR(50) DEFAULT NULL,
  page_number_from_to VARCHAR(50) DEFAULT NULL,
  issn VARCHAR(20) DEFAULT NULL,
  document_proof_path VARCHAR(512) DEFAULT NULL,
  claimed_by VARCHAR(255) DEFAULT NULL,
  author_position ENUM('First','Second','Third','Fourth','Corresponding','NA') DEFAULT 'NA',
  rd_verification ENUM('Initiated','Approved','Rejected') DEFAULT 'Initiated',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_task_applied FOREIGN KEY (task_id) REFERENCES journal_publications_applied(publication_id) ON DELETE CASCADE,
  CONSTRAINT fk_auth1_fac FOREIGN KEY (author_1_faculty_id) REFERENCES faculty(id) ON DELETE SET NULL,
  CONSTRAINT fk_auth2_fac FOREIGN KEY (author_2_faculty_id) REFERENCES faculty(id) ON DELETE SET NULL,
  CONSTRAINT fk_auth3_fac FOREIGN KEY (author_3_faculty_id) REFERENCES faculty(id) ON DELETE SET NULL,
  CONSTRAINT fk_auth4_fac FOREIGN KEY (author_4_faculty_id) REFERENCES faculty(id) ON DELETE SET NULL,
  CONSTRAINT fk_auth5_fac FOREIGN KEY (author_5_faculty_id) REFERENCES faculty(id) ON DELETE SET NULL,
  CONSTRAINT fk_auth6_fac FOREIGN KEY (author_6_faculty_id) REFERENCES faculty(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;`;

const CREATE_JOURNAL_PUBLICATION_SDG_MAPPING_SQL = `CREATE TABLE IF NOT EXISTS journal_publication_sdg_mapping (
  mapping_id INT AUTO_INCREMENT PRIMARY KEY,
  publication_id INT NOT NULL,
  sdg_goal_id INT NOT NULL,
  UNIQUE KEY uk_publication_sdg (publication_id, sdg_goal_id),
  CONSTRAINT fk_sdg_publication FOREIGN KEY (publication_id) REFERENCES journal_publications_published(publication_id) ON DELETE CASCADE,
  CONSTRAINT fk_sdg_goal FOREIGN KEY (sdg_goal_id) REFERENCES sdg_goals(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;`;

let ready = false;
let sdgMappingColumn: 'sdg_goal_id' | 'sdg_goals_id' | 'sdg_goal_ids' | 'sdg_goal_index' = 'sdg_goal_id';
let sdgMappingColumnReady = false;

async function resolveJournalPublicationSdgMappingColumn(pool: any): Promise<'sdg_goal_id' | 'sdg_goals_id' | 'sdg_goal_ids' | 'sdg_goal_index'> {
  if (sdgMappingColumnReady) return sdgMappingColumn;

  const [rows] = (await pool.query(
    `SELECT COLUMN_NAME
     FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = 'journal_publication_sdg_mapping'
       AND COLUMN_NAME IN ('sdg_goal_id', 'sdg_goals_id', 'sdg_goal_ids', 'sdg_goal_index')`
  )) as [RowDataPacket[], any];

  const foundColumns = (rows as any[]).map((row) => String(row.COLUMN_NAME));
  if (foundColumns.includes('sdg_goal_id')) {
    sdgMappingColumn = 'sdg_goal_id';
  } else if (foundColumns.includes('sdg_goals_id')) {
    await pool.query(`ALTER TABLE journal_publication_sdg_mapping CHANGE COLUMN sdg_goals_id sdg_goal_id INT NOT NULL`);
    sdgMappingColumn = 'sdg_goal_id';
  } else if (foundColumns.includes('sdg_goal_ids')) {
    await pool.query(`ALTER TABLE journal_publication_sdg_mapping CHANGE COLUMN sdg_goal_ids sdg_goal_id INT NOT NULL`);
    sdgMappingColumn = 'sdg_goal_id';
  } else if (foundColumns.includes('sdg_goal_index')) {
    sdgMappingColumn = 'sdg_goal_index';
  }

  sdgMappingColumnReady = true;
  return sdgMappingColumn;
}

async function ensureTablesExist(): Promise<void> {
  if (ready) return;
  const pool = getMysqlPool();
  await pool.query(CREATE_JOURNAL_PUBLICATIONS_PUBLISHED_SQL);
  await pool.query(CREATE_JOURNAL_PUBLICATION_SDG_MAPPING_SQL);
  await resolveJournalPublicationSdgMappingColumn(pool);
  ready = true;
  logger.info('journal_publications_published tables are ready');
}

export interface JournalPublicationPublishedCreateInput {
  faculty_name: string;
  task_id: number;
  nature_of_publication: 'Journal' | 'Through Conference/Proceedings';
  conference_name?: string | null;
  article_title: string;
  journal_name: string;
  publisher_name?: string | null;
  publication_type?: 'International' | 'National' | null;
  impact_factor?: number | null;
  journal_h_index?: number | null;
  scientific_journal_rankings?: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'NA' | null;
  indexing?: 'SCOPUS' | 'SCI/SCIE/WOS' | 'UGC CARE' | 'OTHERS' | null;
  indexing_others_specify?: string | null;
  author_1?: string | null;
  author_1_faculty_id?: string | null;
  author_1_student_id?: string | null;
  author_1_name?: string | null;
  author_1_designation_dept_address?: string | null;
  author_2?: string | null;
  author_2_faculty_id?: string | null;
  author_2_student_id?: string | null;
  author_2_name?: string | null;
  author_2_designation_dept_address?: string | null;
  author_3?: string | null;
  author_3_faculty_id?: string | null;
  author_3_student_id?: string | null;
  author_3_name?: string | null;
  author_3_designation_dept_address?: string | null;
  author_4?: string | null;
  author_4_faculty_id?: string | null;
  author_4_student_id?: string | null;
  author_4_name?: string | null;
  author_4_designation_dept_address?: string | null;
  author_5?: string | null;
  author_5_faculty_id?: string | null;
  author_5_student_id?: string | null;
  author_5_name?: string | null;
  author_5_designation_dept_address?: string | null;
  author_6?: string | null;
  author_6_faculty_id?: string | null;
  author_6_student_id?: string | null;
  author_6_name?: string | null;
  author_6_designation_dept_address?: string | null;
  anna_university_annexure?: 'Yes' | 'No' | null;
  article_web_link?: string | null;
  doi?: string | null;
  volume_art_no?: string | null;
  issue_no?: string | null;
  page_number_from_to?: string | null;
  issn?: string | null;
  document_proof_path?: string | null;
  claimed_by?: string | null;
  author_position?: 'First' | 'Second' | 'Third' | 'Fourth' | 'Corresponding' | 'NA' | null;
  rd_verification?: 'Initiated' | 'Approved' | 'Rejected' | null;
  sdg_goal_ids?: number[];
}

export interface JournalPublicationPublishedRecord {
  publication_id: number;
  faculty_name: string;
  task_id: number;
  nature_of_publication: string;
  conference_name?: string | null;
  article_title: string;
  journal_name: string;
  publisher_name?: string | null;
  publication_type?: string | null;
  impact_factor?: number | null;
  journal_h_index?: number | null;
  scientific_journal_rankings?: string | null;
  indexing?: string | null;
  indexing_others_specify?: string | null;
  author_1?: string | null;
  author_1_faculty_id?: string | null;
  author_1_student_id?: string | null;
  author_1_name?: string | null;
  author_1_designation_dept_address?: string | null;
  author_2?: string | null;
  author_2_faculty_id?: string | null;
  author_2_student_id?: string | null;
  author_2_name?: string | null;
  author_2_designation_dept_address?: string | null;
  author_3?: string | null;
  author_3_faculty_id?: string | null;
  author_3_student_id?: string | null;
  author_3_name?: string | null;
  author_3_designation_dept_address?: string | null;
  author_4?: string | null;
  author_4_faculty_id?: string | null;
  author_4_student_id?: string | null;
  author_4_name?: string | null;
  author_4_designation_dept_address?: string | null;
  author_5?: string | null;
  author_5_faculty_id?: string | null;
  author_5_student_id?: string | null;
  author_5_name?: string | null;
  author_5_designation_dept_address?: string | null;
  author_6?: string | null;
  author_6_faculty_id?: string | null;
  author_6_student_id?: string | null;
  author_6_name?: string | null;
  author_6_designation_dept_address?: string | null;
  anna_university_annexure?: string | null;
  article_web_link?: string | null;
  doi?: string | null;
  volume_art_no?: string | null;
  issue_no?: string | null;
  page_number_from_to?: string | null;
  issn?: string | null;
  document_proof_path?: string | null;
  claimed_by?: string | null;
  author_position?: string | null;
  rd_verification?: string | null;
  sdg_goal_ids?: number[];
  sdg_goal_names?: string[];
  created_at: string;
  updated_at: string;
}

class JournalPublicationsPublishedService {
  async createPublication(input: JournalPublicationPublishedCreateInput): Promise<JournalPublicationPublishedRecord> {
    await ensureTablesExist();
    const pool = getMysqlPool();

    const [result] = await pool.query<OkPacket>(
      `INSERT INTO journal_publications_published (
        faculty_name,
        task_id,
        nature_of_publication,
        conference_name,
        article_title,
        journal_name,
        publisher_name,
        publication_type,
        impact_factor,
        journal_h_index,
        scientific_journal_rankings,
        indexing,
        indexing_others_specify,
        author_1,
        author_1_faculty_id,
        author_1_student_id,
        author_1_name,
        author_1_designation_dept_address,
        author_2,
        author_2_faculty_id,
        author_2_student_id,
        author_2_name,
        author_2_designation_dept_address,
        author_3,
        author_3_faculty_id,
        author_3_student_id,
        author_3_name,
        author_3_designation_dept_address,
        author_4,
        author_4_faculty_id,
        author_4_student_id,
        author_4_name,
        author_4_designation_dept_address,
        author_5,
        author_5_faculty_id,
        author_5_student_id,
        author_5_name,
        author_5_designation_dept_address,
        author_6,
        author_6_faculty_id,
        author_6_student_id,
        author_6_name,
        author_6_designation_dept_address,
        anna_university_annexure,
        article_web_link,
        doi,
        volume_art_no,
        issue_no,
        page_number_from_to,
        issn,
        document_proof_path,
        claimed_by,
        author_position,
        rd_verification
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        input.faculty_name,
        input.task_id,
        input.nature_of_publication,
        input.conference_name ?? null,
        input.article_title,
        input.journal_name,
        input.publisher_name ?? null,
        input.publication_type ?? null,
        input.impact_factor ?? null,
        input.journal_h_index ?? null,
        input.scientific_journal_rankings ?? null,
        input.indexing ?? null,
        input.indexing_others_specify ?? null,
        input.author_1 ?? null,
        input.author_1_faculty_id ?? null,
        input.author_1_student_id ?? null,
        input.author_1_name ?? null,
        input.author_1_designation_dept_address ?? null,
        input.author_2 ?? null,
        input.author_2_faculty_id ?? null,
        input.author_2_student_id ?? null,
        input.author_2_name ?? null,
        input.author_2_designation_dept_address ?? null,
        input.author_3 ?? null,
        input.author_3_faculty_id ?? null,
        input.author_3_student_id ?? null,
        input.author_3_name ?? null,
        input.author_3_designation_dept_address ?? null,
        input.author_4 ?? null,
        input.author_4_faculty_id ?? null,
        input.author_4_student_id ?? null,
        input.author_4_name ?? null,
        input.author_4_designation_dept_address ?? null,
        input.author_5 ?? null,
        input.author_5_faculty_id ?? null,
        input.author_5_student_id ?? null,
        input.author_5_name ?? null,
        input.author_5_designation_dept_address ?? null,
        input.author_6 ?? null,
        input.author_6_faculty_id ?? null,
        input.author_6_student_id ?? null,
        input.author_6_name ?? null,
        input.author_6_designation_dept_address ?? null,
        input.anna_university_annexure ?? null,
        input.article_web_link ?? null,
        input.doi ?? null,
        input.volume_art_no ?? null,
        input.issue_no ?? null,
        input.page_number_from_to ?? null,
        input.issn ?? null,
        input.document_proof_path ?? null,
        input.claimed_by ?? null,
        input.author_position ?? null,
        input.rd_verification ?? 'Initiated',
      ],
    );

    const publicationId = result.insertId;
    if (input.sdg_goal_ids && input.sdg_goal_ids.length > 0) {
      const mappingColumn = await resolveJournalPublicationSdgMappingColumn(pool);
      const insertValues = input.sdg_goal_ids
        .map(() => '(?, ?)')
        .join(', ');
      const params: unknown[] = [];
      input.sdg_goal_ids.forEach((goalId) => {
        params.push(publicationId, goalId);
      });
      await pool.query(
        `INSERT IGNORE INTO journal_publication_sdg_mapping (publication_id, ${mappingColumn}) VALUES ${insertValues};`,
        params,
      );
    }

    const record = await this.getPublicationById(publicationId);
    if (!record) {
      throw new Error('Failed to load created published publication');
    }

    return record;
  }

  async getPublicationById(publication_id: number): Promise<JournalPublicationPublishedRecord | null> {
    await ensureTablesExist();
    const pool = getMysqlPool();
    const mappingColumn = await resolveJournalPublicationSdgMappingColumn(pool);
    const joinTarget = mappingColumn === 'sdg_goal_index' ? 'sg.goal_index' : 'sg.id';
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT p.*, 
        COALESCE(GROUP_CONCAT(sg.id ORDER BY sg.goal_index ASC SEPARATOR ','), '') AS sdg_goal_ids,
        COALESCE(GROUP_CONCAT(sg.goal_name ORDER BY sg.goal_index ASC SEPARATOR '||'), '') AS sdg_goal_names
      FROM journal_publications_published p
      LEFT JOIN journal_publication_sdg_mapping m ON p.publication_id = m.publication_id
      LEFT JOIN sdg_goals sg ON m.${mappingColumn} = ${joinTarget}
      WHERE p.publication_id = ?
      GROUP BY p.publication_id
      LIMIT 1;`,
      [publication_id],
    );

    const row = rows[0] as any;
    if (!row) return null;

    return {
      ...row,
      sdg_goal_ids: row.sdg_goal_ids ? String(row.sdg_goal_ids).split(',').map(Number) : [],
      sdg_goal_names: row.sdg_goal_names ? String(row.sdg_goal_names).split('||') : [],
    };
  }

  async listPublications(): Promise<JournalPublicationPublishedRecord[]> {
    await ensureTablesExist();
    const pool = getMysqlPool();
    const mappingColumn = await resolveJournalPublicationSdgMappingColumn(pool);
    const joinTarget = mappingColumn === 'sdg_goal_index' ? 'sg.goal_index' : 'sg.id';
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT p.*, 
        COALESCE(GROUP_CONCAT(sg.id ORDER BY sg.goal_index ASC SEPARATOR ','), '') AS sdg_goal_ids,
        COALESCE(GROUP_CONCAT(sg.goal_name ORDER BY sg.goal_index ASC SEPARATOR '||'), '') AS sdg_goal_names
      FROM journal_publications_published p
      LEFT JOIN journal_publication_sdg_mapping m ON p.publication_id = m.publication_id
      LEFT JOIN sdg_goals sg ON m.${mappingColumn} = ${joinTarget}
      GROUP BY p.publication_id
      ORDER BY p.created_at DESC
      LIMIT 1000;`,
    );

    return (rows as any[]).map((row) => ({
      ...row,
      sdg_goal_ids: row.sdg_goal_ids ? String(row.sdg_goal_ids).split(',').map(Number) : [],
      sdg_goal_names: row.sdg_goal_names ? String(row.sdg_goal_names).split('||') : [],
    }));
  }
}

export default new JournalPublicationsPublishedService();
