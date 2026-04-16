import { getMysqlPool } from '../database/mysql';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { logger } from '../utils/logger';

export interface LabDevelopedByIndustryData {
  submissionId: number;
  sigNumber?: string;
  labName?: string;
  collaborativeIndustry?: string;
  domainArea?: string;
  labAreaSqM?: number;
  totalAmountInrs?: number;
  bitContributionInrs?: number;
  industryFinancialSupportInrs?: number;
  anyEquipmentSponsored?: boolean;
  sponsoredEquipmentNames?: string;
  anyEquipmentEnhancement?: boolean;
  enhancedEquipmentNames?: string;
  layoutDesignTypeId?: number;
  curriculumMapping?: string;
  expectedOutcomes?: string;
  proofId?: number;
  iqacVerification?: string;
  iqacRemarks?: string;
}

export interface LabDevelopedByIndustryRecord extends LabDevelopedByIndustryData, RowDataPacket {
  id: number;
}

function transformToCamelCase(record: any): any {
  if (!record) return null;

  return {
    id: record.id,
    submissionId: record.submission_id,
    sigNumber: record.sig_number,
    labName: record.lab_name,
    collaborativeIndustry: record.collaborative_industry,
    domainArea: record.domain_area,
    labAreaSqM: record.lab_area_sq_m,
    totalAmountInrs: record.total_amount_inrs,
    bitContributionInrs: record.bit_contribution_inrs,
    industryFinancialSupportInrs: record.industry_financial_support_inrs,
    anyEquipmentSponsored: record.any_equipment_sponsored,
    sponsoredEquipmentNames: record.sponsored_equipment_names,
    anyEquipmentEnhancement: record.any_equipment_enhancement,
    enhancedEquipmentNames: record.enhanced_equipment_names,
    layoutDesignTypeId: record.layout_design_type_id,
    curriculumMapping: record.curriculum_mapping,
    expectedOutcomes: record.expected_outcomes,
    proofId: record.proof_id,
    iqacVerification: record.iqac_verification,
    iqacRemarks: record.iqac_remarks,
  };
}

class LabDevelopedByIndustryService {
  async create(data: LabDevelopedByIndustryData): Promise<number> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = `
        INSERT INTO lab_developed_by_industry (
          submission_id, sig_number, lab_name, collaborative_industry, domain_area, lab_area_sq_m,
          total_amount_inrs, bit_contribution_inrs, industry_financial_support_inrs,
          any_equipment_sponsored, sponsored_equipment_names, any_equipment_enhancement, enhanced_equipment_names,
          layout_design_type_id, curriculum_mapping, expected_outcomes, proof_id,
          iqac_verification, iqac_remarks
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await connection.execute<ResultSetHeader>(query, [
        data.submissionId,
        data.sigNumber || null,
        data.labName || null,
        data.collaborativeIndustry || null,
        data.domainArea || null,
        data.labAreaSqM || null,
        data.totalAmountInrs || null,
        data.bitContributionInrs || null,
        data.industryFinancialSupportInrs || null,
        data.anyEquipmentSponsored ? 1 : 0,
        data.sponsoredEquipmentNames || null,
        data.anyEquipmentEnhancement ? 1 : 0,
        data.enhancedEquipmentNames || null,
        data.layoutDesignTypeId || null,
        data.curriculumMapping || null,
        data.expectedOutcomes || null,
        data.proofId || null,
        data.iqacVerification || 'initiated',
        data.iqacRemarks || null,
      ]);

      return result.insertId;
    } finally {
      connection.release();
    }
  }

  async getById(id: number): Promise<LabDevelopedByIndustryRecord | null> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = 'SELECT * FROM lab_developed_by_industry WHERE id = ?';
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
        SELECT lab.*, s.faculty_id as submissionFacultyId, f.email as facultyEmail, f.name as facultyName
        FROM lab_developed_by_industry lab
        LEFT JOIN submissions s ON lab.submission_id = s.id
        LEFT JOIN faculty f ON s.faculty_id = f.id
        WHERE lab.id = ?
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
  ): Promise<{ records: LabDevelopedByIndustryRecord[]; total: number }> {
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

      const countQuery = `SELECT COUNT(*) as total FROM lab_developed_by_industry ${whereClause}`;
      const [countRows] = await connection.execute<any[]>(countQuery, params);
      const total = countRows[0]?.total || 0;

      const query = `
        SELECT * FROM lab_developed_by_industry
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

  async update(id: number, data: Partial<LabDevelopedByIndustryData>): Promise<boolean> {
    const connection = await getMysqlPool().getConnection();
    try {
      const updates: string[] = [];
      const params: any[] = [];

      if (data.labName !== undefined) {
        updates.push('lab_name = ?');
        params.push(data.labName);
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
      const query = `UPDATE lab_developed_by_industry SET ${updates.join(', ')} WHERE id = ?`;
      const [result] = await connection.execute<ResultSetHeader>(query, params);

      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  async delete(id: number): Promise<boolean> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = 'DELETE FROM lab_developed_by_industry WHERE id = ?';
      const [result] = await connection.execute<ResultSetHeader>(query, [id]);
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }
}

export default new LabDevelopedByIndustryService();
