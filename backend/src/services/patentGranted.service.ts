import { getMysqlPool } from '../database/mysql';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export interface PatentGrantedData {
  applyFrom: string;
  claimedByFacultyId: string;
  claimedByFacultyName: string;
  taskId: string;
  dateOfGrant: string;
  grantedApplicationNumber: string;
  iqacVerification?: string;
  iqacVerificationRemarks?: string;
  yuktiPortalRegistrationProofPath?: string;
  grantReceiptProofPath?: string;
  grantDocumentsPath?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PatentGrantedRecord extends PatentGrantedData, RowDataPacket {
  id: number;
}

class PatentGrantedService {
  async create(data: PatentGrantedData & { yuktiPortalRegistrationProofPath?: string; grantReceiptProofPath?: string; grantDocumentsPath?: string }): Promise<number> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = `
        INSERT INTO patents_granted (
          apply_from,
          claimed_by_faculty_id,
          claimed_by_faculty_name,
          task_id,
          date_of_grant,
          granted_application_number,
          iqac_verification,
          iqac_remarks,
          grant_receipt_proof_path,
          grant_documents_path
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await connection.execute<ResultSetHeader>(query, [
        data.applyFrom,
        data.claimedByFacultyId,
        data.claimedByFacultyName,
        data.taskId,
        data.dateOfGrant,
        data.grantedApplicationNumber,
        data.iqacVerification || 'initiated',
        null,
        data.grantReceiptProofPath || null,
        data.grantDocumentsPath || null,
      ]);

      return result.insertId;
    } finally {
      connection.release();
    }
  }

  async getById(id: number): Promise<PatentGrantedRecord | null> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = 'SELECT * FROM patents_granted WHERE id = ?';
      const [rows] = await connection.execute<PatentGrantedRecord[]>(query, [id]);
      return rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  }

  async list(filters: { claimedByFacultyId?: string; iqacVerification?: string; applyFrom?: string }, page: number = 1, pageSize: number = 10): Promise<{ records: PatentGrantedRecord[]; total: number }> {
    const connection = await getMysqlPool().getConnection();
    try {
      // Ensure page and pageSize are valid positive integers
      const validPage = Math.max(1, Math.floor(Number(page)) || 1);
      const validPageSize = Math.max(1, Math.floor(Number(pageSize)) || 10);
      const offset = (validPage - 1) * validPageSize;

      let whereClause = 'WHERE 1=1';
      const params: any[] = [];

      if (filters.claimedByFacultyId) {
        whereClause += ' AND claimed_by_faculty_id = ?';
        params.push(filters.claimedByFacultyId);
      }

      if (filters.iqacVerification) {
        whereClause += ' AND iqac_verification = ?';
        params.push(filters.iqacVerification);
      }

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM patents_granted ${whereClause}`;
      const [countRows] = await connection.execute<any[]>(countQuery, params);
      const total = countRows[0]?.total || 0;

      // Get paginated records
      const query = `
        SELECT * FROM patents_granted
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ${validPageSize} OFFSET ${offset}
      `;

      const [records] = await connection.execute<PatentGrantedRecord[]>(query, params);
      return { records, total };
    } finally {
      connection.release();
    }
  }

  async update(id: number, data: Partial<PatentGrantedData>): Promise<boolean> {
    const connection = await getMysqlPool().getConnection();
    try {
      const updates: string[] = [];
      const values: any[] = [];

      if (data.iqacVerification !== undefined) {
        updates.push('iqac_verification = ?');
        values.push(data.iqacVerification);
      }

      if (data.iqacVerificationRemarks !== undefined) {
        updates.push('iqac_remarks = ?');
        values.push(data.iqacVerificationRemarks);
      }

      if (updates.length === 0) {
        return false;
      }

      updates.push('updated_at = NOW()');
      values.push(id);

      const query = `UPDATE patents_granted SET ${updates.join(', ')} WHERE id = ?`;
      const [result] = await connection.execute<ResultSetHeader>(query, values);

      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }
}

export default new PatentGrantedService();
