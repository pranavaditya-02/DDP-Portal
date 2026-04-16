import { getMysqlPool } from '../database/mysql';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { logger } from '../utils/logger';

export interface PatentPreliminaryDataData {
  facultyId: string;
  facultyName: string;
  patentTitle: string;
  applicantType: string;
  patentType: string;
  supportedByExperimentation: string;
  priorArt: string;
  novelty: string;
  involveDrawings: string;
  formPrepared: string;
  iqacVerification?: string;
  iqacVerificationRemarks?: string;
  experimentationProofPath?: string;
  drawingsProofPath?: string;
  formProofPath?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PatentPreliminaryDataRecord extends PatentPreliminaryDataData, RowDataPacket {
  id: number;
}

// Helper function to convert snake_case database columns to camelCase
function transformToCamelCase(record: any): any {
  if (!record) return null;
  
  const transformed: any = { id: record.id };
  
  // Map snake_case database columns to camelCase
  if (record.faculty_id !== undefined) transformed.facultyId = record.faculty_id;
  if (record.faculty_name !== undefined) transformed.facultyName = record.faculty_name;
  if (record.patent_title !== undefined) transformed.patentTitle = record.patent_title;
  if (record.applicant_type !== undefined) transformed.applicantType = record.applicant_type;
  if (record.patent_type !== undefined) transformed.patentType = record.patent_type;
  if (record.supported_by_experimentation !== undefined) transformed.supportedByExperimentation = record.supported_by_experimentation;
  if (record.prior_art !== undefined) transformed.priorArt = record.prior_art;
  if (record.novelty !== undefined) transformed.novelty = record.novelty;
  if (record.involve_drawings !== undefined) transformed.involveDrawings = record.involve_drawings;
  if (record.form_prepared !== undefined) transformed.formPrepared = record.form_prepared;
  if (record.iqac_verification !== undefined) transformed.iqacVerification = record.iqac_verification;
  if (record.iqac_verification_remarks !== undefined) transformed.iqacVerificationRemarks = record.iqac_verification_remarks;
  if (record.experimentation_proof_path !== undefined) transformed.experimentationProofPath = record.experimentation_proof_path;
  if (record.drawings_proof_path !== undefined) transformed.drawingsProofPath = record.drawings_proof_path;
  if (record.form_proof_path !== undefined) transformed.formProofPath = record.form_proof_path;
  if (record.created_at !== undefined) transformed.createdAt = record.created_at;
  if (record.updated_at !== undefined) transformed.updatedAt = record.updated_at;
  
  return transformed;
}

class PatentPreliminaryDataService {
  async create(data: PatentPreliminaryDataData & { experimentationProofPath?: string; drawingsProofPath?: string; formProofPath?: string }): Promise<number> {
    const connection = await getMysqlPool().getConnection();
    try {
      // Ensure all required fields have values and log them
      const facultyId = String(data.facultyId || '').trim();
      const facultyName = String(data.facultyName || '').trim();
      const patentTitle = String(data.patentTitle || '').trim();
      const applicantType = String(data.applicantType || '').trim();
      const patentType = String(data.patentType || '').trim();
      const supportedByExperimentation = String(data.supportedByExperimentation || 'no').trim();
      const priorArt = String(data.priorArt || '').trim();
      const novelty = String(data.novelty || '').trim();
      const involveDrawings = String(data.involveDrawings || 'no').trim();
      const formPrepared = String(data.formPrepared || 'no').trim();
      const iqacVerification = String(data.iqacVerification || 'initiated').trim();

      if (!facultyId || !patentTitle || !applicantType || !patentType) {
        throw new Error(`Required field is empty: facultyId=${facultyId}, patentTitle=${patentTitle}, applicantType=${applicantType}, patentType=${patentType}`);
      }

      const query = `
        INSERT INTO patents_preliminary_data (
          faculty_id,
          faculty_name,
          patent_title,
          applicant_type,
          patent_type,
          supported_by_experimentation,
          prior_art,
          novelty,
          involve_drawings,
          form_prepared,
          iqac_verification,
          experimentation_proof_path,
          drawings_proof_path,
          form_proof_path,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      const params = [
        facultyId,
        facultyName,
        patentTitle,
        applicantType,
        patentType,
        supportedByExperimentation,
        priorArt,
        novelty,
        involveDrawings,
        formPrepared,
        iqacVerification,
        data.experimentationProofPath || null,
        data.drawingsProofPath || null,
        data.formProofPath || null,
      ];

      logger.info(`Executing INSERT with params count: ${params.length}`);

      const [result] = await connection.execute<ResultSetHeader>(query, params);

      return result.insertId;
    } finally {
      connection.release();
    }
  }

  async getById(id: number): Promise<PatentPreliminaryDataRecord | null> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = 'SELECT * FROM patents_preliminary_data WHERE id = ?';
      const [rows] = await connection.execute<PatentPreliminaryDataRecord[]>(query, [id]);
      return rows.length > 0 ? transformToCamelCase(rows[0]) : null;
    } finally {
      connection.release();
    }
  }

  async getByIdWithFacultyEmail(id: number): Promise<(PatentPreliminaryDataRecord & { facultyEmail?: string }) | null> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = `
        SELECT ppd.*, u.email as facultyEmail
        FROM patents_preliminary_data ppd
        LEFT JOIN users u ON ppd.faculty_id = u.id
        WHERE ppd.id = ?
      `;
      const [rows] = await connection.execute<any[]>(query, [id]);
      if (rows.length === 0) return null;
      
      const record = transformToCamelCase(rows[0]);
      const facultyEmail = rows[0].facultyEmail || null;
      return { ...record, facultyEmail };
    } finally {
      connection.release();
    }
  }

  async list(filters: { faculty_id?: string; iqac_verification?: string }, page: number = 1, pageSize: number = 10): Promise<{ records: PatentPreliminaryDataRecord[]; total: number }> {
    const connection = await getMysqlPool().getConnection();
    try {
      // Ensure page and pageSize are valid positive integers
      const validPage = Math.max(1, Math.floor(Number(page)) || 1);
      const validPageSize = Math.max(1, Math.floor(Number(pageSize)) || 10);
      const offset = (validPage - 1) * validPageSize;

      let whereClause = 'WHERE 1=1';
      const params: any[] = [];

      if (filters.faculty_id) {
        whereClause += ' AND faculty_id = ?';
        params.push(filters.faculty_id);
      }

      if (filters.iqac_verification) {
        whereClause += ' AND iqac_verification = ?';
        params.push(filters.iqac_verification);
      }

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM patents_preliminary_data ${whereClause}`;
      const [countRows] = await connection.execute<any[]>(countQuery, params);
      const total = countRows[0]?.total || 0;

      // Get paginated records
      const query = `
        SELECT * FROM patents_preliminary_data
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ${validPageSize} OFFSET ${offset}
      `;

      const [records] = await connection.execute<PatentPreliminaryDataRecord[]>(query, params);
      const transformedRecords = records.map(transformToCamelCase);
      return { records: transformedRecords, total };
    } finally {
      connection.release();
    }
  }

  async update(id: number, data: Partial<PatentPreliminaryDataData>): Promise<boolean> {
    const connection = await getMysqlPool().getConnection();
    try {
      const updates: string[] = [];
      const values: any[] = [];

      if (data.iqacVerification !== undefined) {
        updates.push('iqac_verification = ?');
        values.push(data.iqacVerification);
      }

      if (data.iqacVerificationRemarks !== undefined) {
        updates.push('iqac_verification_remarks = ?');
        values.push(data.iqacVerificationRemarks);
      }

      if (updates.length === 0) {
        return false;
      }

      updates.push('updated_at = NOW()');
      values.push(id);

      const query = `UPDATE patents_preliminary_data SET ${updates.join(', ')} WHERE id = ?`;
      const [result] = await connection.execute<ResultSetHeader>(query, values);

      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  async delete(id: number): Promise<boolean> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = 'DELETE FROM patents_preliminary_data WHERE id = ?';
      const [result] = await connection.execute<ResultSetHeader>(query, [id]);
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }
}

export default new PatentPreliminaryDataService();
