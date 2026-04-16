import { getMysqlPool } from '../database/mysql';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { logger } from '../utils/logger';

export interface CoeData {
  submissionId: number;
  sigNumber?: string;
  coeName?: string;
  claimingDepartmentId?: number;
  facultyInchargeId?: string;
  coeTypeId?: number;
  collaborativeIndustryName?: string;
  dateOfEstablishment?: string;
  areaSqM?: number;
  domainOfCentre?: string;
  isMouRelated?: boolean;
  mouId?: number;
  isIrpRelated?: boolean;
  irpVisitId?: number;
  stockRegisterMaintained?: boolean;
  totalAmountInrs?: number;
  bitContributionInrs?: number;
  industryContributionWithGst?: number;
  industryContributionNoGst?: number;
  studentsPerBatch?: number;
  academicCourse?: string;
  syllabusId?: number;
  labPhotoId?: number;
  communicationProofId?: number;
  apexDocumentId?: number;
  facilitiesReportId?: number;
  utilizationReportId?: number;
  iqacVerification?: string;
  iqacRemarks?: string;
}

export interface CoeRecord extends CoeData, RowDataPacket {
  id: number;
}

function transformToCamelCase(record: any): any {
  if (!record) return null;

  return {
    id: record.id,
    submissionId: record.submission_id,
    sigNumber: record.sig_number,
    coeName: record.coe_name,
    claimingDepartmentId: record.claiming_department_id,
    facultyInchargeId: record.faculty_incharge_id,
    coeTypeId: record.coe_type_id,
    collaborativeIndustryName: record.collaborative_industry_name,
    dateOfEstablishment: record.date_of_establishment,
    areaSqM: record.area_sq_m,
    domainOfCentre: record.domain_of_centre,
    isMouRelated: record.is_mou_related,
    mouId: record.mou_id,
    isIrpRelated: record.is_irp_related,
    irpVisitId: record.irp_visit_id,
    stockRegisterMaintained: record.stock_register_maintained,
    totalAmountInrs: record.total_amount_inrs,
    bitContributionInrs: record.bit_contribution_inrs,
    industryContributionWithGst: record.industry_contribution_with_gst,
    industryContributionNoGst: record.industry_contribution_no_gst,
    studentsPerBatch: record.students_per_batch,
    academicCourse: record.academic_course,
    syllabusId: record.syllabus_id,
    labPhotoId: record.lab_photo_id,
    communicationProofId: record.communication_proof_id,
    apexDocumentId: record.apex_document_id,
    facilitiesReportId: record.facilities_report_id,
    utilizationReportId: record.utilization_report_id,
    iqacVerification: record.iqac_verification,
    iqacRemarks: record.iqac_remarks,
  };
}

class CoeService {
  async create(data: CoeData): Promise<number> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = `
        INSERT INTO centre_of_excellence (
          submission_id,
          sig_number,
          coe_name,
          claiming_department_id,
          faculty_incharge_id,
          coe_type_id,
          collaborative_industry_name,
          date_of_establishment,
          area_sq_m,
          domain_of_centre,
          is_mou_related,
          mou_id,
          is_irp_related,
          irp_visit_id,
          stock_register_maintained,
          total_amount_inrs,
          bit_contribution_inrs,
          industry_contribution_with_gst,
          industry_contribution_no_gst,
          students_per_batch,
          academic_course,
          syllabus_id,
          lab_photo_id,
          communication_proof_id,
          apex_document_id,
          facilities_report_id,
          utilization_report_id,
          iqac_verification,
          iqac_remarks
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await connection.execute<ResultSetHeader>(query, [
        data.submissionId,
        data.sigNumber || null,
        data.coeName || null,
        data.claimingDepartmentId || null,
        data.facultyInchargeId || null,
        data.coeTypeId || null,
        data.collaborativeIndustryName || null,
        data.dateOfEstablishment || null,
        data.areaSqM || null,
        data.domainOfCentre || null,
        data.isMouRelated ? 1 : 0,
        data.mouId || null,
        data.isIrpRelated ? 1 : 0,
        data.irpVisitId || null,
        data.stockRegisterMaintained ? 1 : 0,
        data.totalAmountInrs || null,
        data.bitContributionInrs || null,
        data.industryContributionWithGst || null,
        data.industryContributionNoGst || null,
        data.studentsPerBatch || null,
        data.academicCourse || null,
        data.syllabusId || null,
        data.labPhotoId || null,
        data.communicationProofId || null,
        data.apexDocumentId || null,
        data.facilitiesReportId || null,
        data.utilizationReportId || null,
        data.iqacVerification || 'initiated',
        data.iqacRemarks || null,
      ]);

      return result.insertId;
    } finally {
      connection.release();
    }
  }

  async getById(id: number): Promise<CoeRecord | null> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = 'SELECT * FROM centre_of_excellence WHERE id = ?';
      const [rows] = await connection.execute<any[]>(query, [id]);
      return rows.length > 0 ? transformToCamelCase(rows[0]) : null;
    } finally {
      connection.release();
    }
  }

  async getByIdWithFacultyEmail(id: number): Promise<(CoeRecord & { facultyEmail?: string; facultyName?: string }) | null> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = `
        SELECT coe.*, f.email as facultyEmail, f.name as facultyName
        FROM centre_of_excellence coe
        LEFT JOIN faculty f ON coe.faculty_incharge_id = f.id
        WHERE coe.id = ?
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
    filters: { facultyInchargeId?: string; iqacVerification?: string },
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ records: CoeRecord[]; total: number }> {
    const connection = await getMysqlPool().getConnection();
    try {
      const validPage = Math.max(1, Math.floor(Number(page)) || 1);
      const validPageSize = Math.max(1, Math.floor(Number(pageSize)) || 10);
      const offset = (validPage - 1) * validPageSize;

      let whereClause = 'WHERE 1=1';
      const params: any[] = [];

      if (filters.facultyInchargeId) {
        whereClause += ' AND faculty_incharge_id = ?';
        params.push(filters.facultyInchargeId);
      }

      if (filters.iqacVerification) {
        whereClause += ' AND iqac_verification = ?';
        params.push(filters.iqacVerification);
      }

      const countQuery = `SELECT COUNT(*) as total FROM centre_of_excellence ${whereClause}`;
      const [countRows] = await connection.execute<any[]>(countQuery, params);
      const total = countRows[0]?.total || 0;

      const query = `
        SELECT * FROM centre_of_excellence
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

  async update(id: number, data: Partial<CoeData>): Promise<boolean> {
    const connection = await getMysqlPool().getConnection();
    try {
      const updates: string[] = [];
      const params: any[] = [];

      if (data.coeName !== undefined) {
        updates.push('coe_name = ?');
        params.push(data.coeName);
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
      const query = `UPDATE centre_of_excellence SET ${updates.join(', ')} WHERE id = ?`;
      const [result] = await connection.execute<ResultSetHeader>(query, params);

      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  async delete(id: number): Promise<boolean> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = 'DELETE FROM centre_of_excellence WHERE id = ?';
      const [result] = await connection.execute<ResultSetHeader>(query, [id]);
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }
}

export default new CoeService();
