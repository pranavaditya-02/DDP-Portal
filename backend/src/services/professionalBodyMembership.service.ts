import { getMysqlPool } from '../database/mysql';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { logger } from '../utils/logger';

export interface ProfessionalBodyMembershipData {
  submissionId: number;
  membershipCategoryId: number;
  specialLabsInvolved?: boolean;
  specialLabId?: number;
  professionalBodyName?: string;
  membershipTypeId?: number;
  membershipId?: string;
  gradeLevelPosition?: string;
  levelId?: number;
  validityTypeId?: number;
  apexDocumentId?: number;
  amountSelfBitInrs?: number;
  ifValidityOthers?: string;
  amountOthersInrs?: number;
  documentProofId?: number;
  iqacVerification?: string;
  iqacRemarks?: string;
}

export interface ProfessionalBodyMembershipRecord extends ProfessionalBodyMembershipData, RowDataPacket {
  id: number;
}

function transformToCamelCase(record: any): any {
  if (!record) return null;

  return {
    id: record.id,
    submissionId: record.submission_id,
    membershipCategoryId: record.membership_category_id,
    specialLabsInvolved: record.special_labs_involved,
    specialLabId: record.special_lab_id,
    professionalBodyName: record.professional_body_name,
    membershipTypeId: record.membership_type_id,
    membershipId: record.membership_id,
    gradeLevelPosition: record.grade_level_position,
    levelId: record.level_id,
    validityTypeId: record.validity_type_id,
    apexDocumentId: record.apex_document_id,
    amountSelfBitInrs: record.amount_self_bit_inrs,
    ifValidityOthers: record.if_validity_others,
    amountOthersInrs: record.amount_others_inrs,
    documentProofId: record.document_proof_id,
    iqacVerification: record.iqac_verification,
    iqacRemarks: record.iqac_remarks,
  };
}

class ProfessionalBodyMembershipService {
  async create(data: ProfessionalBodyMembershipData): Promise<number> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = `
        INSERT INTO professional_body_membership (
          submission_id, membership_category_id, special_labs_involved, special_lab_id,
          professional_body_name, membership_type_id, membership_id, grade_level_position,
          level_id, validity_type_id, apex_document_id, amount_self_bit_inrs,
          if_validity_others, amount_others_inrs, document_proof_id,
          iqac_verification, iqac_remarks
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await connection.execute<ResultSetHeader>(query, [
        data.submissionId,
        data.membershipCategoryId,
        data.specialLabsInvolved ? 1 : 0,
        data.specialLabId || null,
        data.professionalBodyName || null,
        data.membershipTypeId || null,
        data.membershipId || null,
        data.gradeLevelPosition || null,
        data.levelId || null,
        data.validityTypeId || null,
        data.apexDocumentId || null,
        data.amountSelfBitInrs || null,
        data.ifValidityOthers || null,
        data.amountOthersInrs || null,
        data.documentProofId || null,
        data.iqacVerification || 'initiated',
        data.iqacRemarks || null,
      ]);

      return result.insertId;
    } finally {
      connection.release();
    }
  }

  async getById(id: number): Promise<ProfessionalBodyMembershipRecord | null> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = 'SELECT * FROM professional_body_membership WHERE id = ?';
      const [rows] = await connection.execute<any[]>(query, [id]);
      return rows.length > 0 ? transformToCamelCase(rows[0]) : null;
    } finally {
      connection.release();
    }
  }

  async getByIdWithSubmission(id: number): Promise<any | null> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = `
        SELECT pbm.*, s.faculty_id as submissionFacultyId, f.email as facultyEmail, f.name as facultyName
        FROM professional_body_membership pbm
        LEFT JOIN submissions s ON pbm.submission_id = s.id
        LEFT JOIN faculty f ON s.faculty_id = f.id
        WHERE pbm.id = ?
      `;
      const [rows] = await connection.execute<any[]>(query, [id]);
      if (rows.length === 0) return null;

      const record = transformToCamelCase(rows[0]);
      return {
        ...record,
        facultyEmail: rows[0].facultyEmail || null,
        facultyName: rows[0].facultyName || null,
      };
    } finally {
      connection.release();
    }
  }

  async list(
    filters: { submissionId?: number; iqacVerification?: string },
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ records: ProfessionalBodyMembershipRecord[]; total: number }> {
    const connection = await getMysqlPool().getConnection();
    try {
      const validPage = Math.max(1, Math.floor(Number(page)) || 1);
      const validPageSize = Math.max(1, Math.floor(Number(pageSize)) || 10);
      const offset = (validPage - 1) * validPageSize;

      let whereClause = 'WHERE 1=1';
      const params: any[] = [];

      if (filters.submissionId) {
        whereClause += ' AND submission_id = ?';
        params.push(filters.submissionId);
      }

      if (filters.iqacVerification) {
        whereClause += ' AND iqac_verification = ?';
        params.push(filters.iqacVerification);
      }

      const countQuery = `SELECT COUNT(*) as total FROM professional_body_membership ${whereClause}`;
      const [countRows] = await connection.execute<any[]>(countQuery, params);
      const total = countRows[0]?.total || 0;

      const query = `
        SELECT * FROM professional_body_membership
        ${whereClause}
        ORDER BY id DESC
        LIMIT ${validPageSize} OFFSET ${offset}
      `;

      const [records] = await connection.execute<any[]>(query, params);
      const transformedRecords = records.map(transformToCamelCase);
      return { records: transformedRecords, total };
    } finally {
      connection.release();
    }
  }

  async update(id: number, data: Partial<ProfessionalBodyMembershipData>): Promise<boolean> {
    const connection = await getMysqlPool().getConnection();
    try {
      const updates: string[] = [];
      const params: any[] = [];

      if (data.professionalBodyName !== undefined) {
        updates.push('professional_body_name = ?');
        params.push(data.professionalBodyName);
      }

      if (data.iqacVerification !== undefined) {
        updates.push('iqac_verification = ?');
        params.push(data.iqacVerification);
      }

      if (data.iqacRemarks !== undefined) {
        updates.push('iqac_remarks = ?');
        params.push(data.iqacRemarks);
      }

      if (updates.length === 0) return true;

      params.push(id);
      const query = `UPDATE professional_body_membership SET ${updates.join(', ')} WHERE id = ?`;
      const [result] = await connection.execute<ResultSetHeader>(query, params);

      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  async delete(id: number): Promise<boolean> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = 'DELETE FROM professional_body_membership WHERE id = ?';
      const [result] = await connection.execute<ResultSetHeader>(query, [id]);
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }
}

export default new ProfessionalBodyMembershipService();
