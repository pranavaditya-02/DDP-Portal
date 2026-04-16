import { getMysqlPool } from '../database/mysql';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { logger } from '../utils/logger';

export interface IrpVisitData {
  submissionId: number;
  sigNumber?: string;
  specialLabsInvolved?: boolean;
  specialLabId?: number;
  numFaculty?: number;
  claimedForFacultyId?: string;
  claimedForDepartmentId?: number;
  approvalTypeId?: number;
  apexNo?: string;
  isMouRelated?: boolean;
  mouId?: number;
  mouRelationPoints?: string;
  fromDate?: string;
  toDate?: string;
  interactionModeId?: number;
  ifModeOthers?: string;
  purposeId?: number;
  amountIncurredInrs?: number;
  numIndustry?: number;
  apexProofId?: number;
  geotagPhotosId?: number;
  irpFormSignedId?: number;
  consolidatedDocId?: number;
  iqacVerification?: string;
  iqacRemarks?: string;
}

export interface IrpVisitRecord extends IrpVisitData, RowDataPacket {
  id: number;
}

function transformToCamelCase(record: any): any {
  if (!record) return null;

  return {
    id: record.id,
    submissionId: record.submission_id,
    sigNumber: record.sig_number,
    specialLabsInvolved: record.special_labs_involved,
    specialLabId: record.special_lab_id,
    numFaculty: record.num_faculty,
    claimedForFacultyId: record.claimed_for_faculty_id,
    claimedForDepartmentId: record.claimed_for_department_id,
    approvalTypeId: record.approval_type_id,
    apexNo: record.apex_no,
    isMouRelated: record.is_mou_related,
    mouId: record.mou_id,
    mouRelationPoints: record.mou_relation_points,
    fromDate: record.from_date,
    toDate: record.to_date,
    interactionModeId: record.interaction_mode_id,
    ifModeOthers: record.if_mode_others,
    purposeId: record.purpose_id,
    amountIncurredInrs: record.amount_incurred_inrs,
    numIndustry: record.num_industry,
    apexProofId: record.apex_proof_id,
    geotagPhotosId: record.geotag_photos_id,
    irpFormSignedId: record.irp_form_signed_id,
    consolidatedDocId: record.consolidated_doc_id,
    iqacVerification: record.iqac_verification,
    iqacRemarks: record.iqac_remarks,
  };
}

class IrpVisitService {
  async create(data: IrpVisitData): Promise<number> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = `
        INSERT INTO irp_visit (
          submission_id,
          sig_number,
          special_labs_involved,
          special_lab_id,
          num_faculty,
          claimed_for_faculty_id,
          claimed_for_department_id,
          approval_type_id,
          apex_no,
          is_mou_related,
          mou_id,
          mou_relation_points,
          from_date,
          to_date,
          interaction_mode_id,
          if_mode_others,
          purpose_id,
          amount_incurred_inrs,
          num_industry,
          apex_proof_id,
          geotag_photos_id,
          irp_form_signed_id,
          consolidated_doc_id,
          iqac_verification,
          iqac_remarks
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await connection.execute<ResultSetHeader>(query, [
        data.submissionId,
        data.sigNumber || null,
        data.specialLabsInvolved ? 1 : 0,
        data.specialLabId || null,
        data.numFaculty || null,
        data.claimedForFacultyId || null,
        data.claimedForDepartmentId || null,
        data.approvalTypeId || null,
        data.apexNo || null,
        data.isMouRelated ? 1 : 0,
        data.mouId || null,
        data.mouRelationPoints || null,
        data.fromDate || null,
        data.toDate || null,
        data.interactionModeId || null,
        data.ifModeOthers || null,
        data.purposeId || null,
        data.amountIncurredInrs || null,
        data.numIndustry || null,
        data.apexProofId || null,
        data.geotagPhotosId || null,
        data.irpFormSignedId || null,
        data.consolidatedDocId || null,
        data.iqacVerification || 'initiated',
        data.iqacRemarks || null,
      ]);

      return result.insertId;
    } finally {
      connection.release();
    }
  }

  async getById(id: number): Promise<IrpVisitRecord | null> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = 'SELECT * FROM irp_visit WHERE id = ?';
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
        SELECT irp.*, s.faculty_id as submissionFacultyId, f.email as facultyEmail, f.name as facultyName
        FROM irp_visit irp
        LEFT JOIN submissions s ON irp.submission_id = s.id
        LEFT JOIN faculty f ON s.faculty_id = f.id
        WHERE irp.id = ?
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
  ): Promise<{ records: IrpVisitRecord[]; total: number }> {
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

      const countQuery = `SELECT COUNT(*) as total FROM irp_visit ${whereClause}`;
      const [countRows] = await connection.execute<any[]>(countQuery, params);
      const total = countRows[0]?.total || 0;

      const query = `
        SELECT * FROM irp_visit
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

  async update(id: number, data: Partial<IrpVisitData>): Promise<boolean> {
    const connection = await getMysqlPool().getConnection();
    try {
      const updates: string[] = [];
      const params: any[] = [];

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
      const query = `UPDATE irp_visit SET ${updates.join(', ')} WHERE id = ?`;
      const [result] = await connection.execute<ResultSetHeader>(query, params);

      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  async delete(id: number): Promise<boolean> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = 'DELETE FROM irp_visit WHERE id = ?';
      const [result] = await connection.execute<ResultSetHeader>(query, [id]);
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  // Faculty management
  async addFaculty(irpVisitId: number, facultyId: string, orderNo: number): Promise<number> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = `
        INSERT INTO irp_visit_faculty (irp_visit_id, faculty_id, order_no)
        VALUES (?, ?, ?)
      `;
      const [result] = await connection.execute<ResultSetHeader>(query, [irpVisitId, facultyId, orderNo]);
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  async removeFaculty(irpVisitId: number, facultyId: string): Promise<boolean> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = 'DELETE FROM irp_visit_faculty WHERE irp_visit_id = ? AND faculty_id = ?';
      const [result] = await connection.execute<ResultSetHeader>(query, [irpVisitId, facultyId]);
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  async listFaculty(irpVisitId: number): Promise<any[]> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = `
        SELECT f.id, f.name, f.email, ivf.order_no
        FROM irp_visit_faculty ivf
        LEFT JOIN faculty f ON ivf.faculty_id = f.id
        WHERE ivf.irp_visit_id = ?
        ORDER BY ivf.order_no ASC
      `;
      const [rows] = await connection.execute<any[]>(query, [irpVisitId]);
      return rows;
    } finally {
      connection.release();
    }
  }

  // Industry contact management
  async addIndustryContact(irpVisitId: number, industryOrder: number, industryName: string, designation: string, phone: string, email: string): Promise<number> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = `
        INSERT INTO irp_visit_industry (irp_visit_id, industry_order, industry_name, designation, phone, email)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const [result] = await connection.execute<ResultSetHeader>(query, [irpVisitId, industryOrder, industryName, designation, phone, email]);
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  async removeIndustryContact(irpVisitId: number, industryContactId: number): Promise<boolean> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = 'DELETE FROM irp_visit_industry WHERE irp_visit_id = ? AND id = ?';
      const [result] = await connection.execute<ResultSetHeader>(query, [irpVisitId, industryContactId]);
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  async listIndustryContacts(irpVisitId: number): Promise<any[]> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = `
        SELECT id, industry_order, industry_name, designation, phone, email
        FROM irp_visit_industry
        WHERE irp_visit_id = ?
        ORDER BY industry_order ASC
      `;
      const [rows] = await connection.execute<any[]>(query, [irpVisitId]);
      return rows;
    } finally {
      connection.release();
    }
  }
}

export default new IrpVisitService();
