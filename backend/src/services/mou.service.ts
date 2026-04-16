import { getMysqlPool } from '../database/mysql';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { logger } from '../utils/logger';

export interface MouData {
  submissionId: number;
  sigNumber?: string;
  specialLabsInvolved?: boolean;
  specialLabId?: number;
  claimingDepartmentId?: number;
  mouTypeId?: number;
  industryOrgTypeId?: number;
  ifOrgTypeOthers?: string;
  mouBasedOnId?: number;
  domainArea?: string;
  dateOfAgreement?: string;
  legalNameCollaborator?: string;
  industryLocation?: string;
  industryAddress?: string;
  industryWebsite?: string;
  industryContactMobile?: string;
  industryEmail?: string;
  durationUnitId?: number;
  numYears?: number;
  numMonths?: number;
  mouEffectFrom?: string;
  mouEffectTill?: string;
  scopeOfAgreement?: string;
  objectivesAndGoals?: string;
  boundariesAndLimitations?: string;
  bitRolesResponsibilities?: string;
  collaboratorRoles?: string;
  spocName?: string;
  spocDesignation?: string;
  spocEmail?: string;
  spocPhone?: string;
  mouSigningInitiatedBy?: string;
  numFaculty?: number;
  apexProofId?: number;
  emailCommLetterProofId?: number;
  signedMouDocId?: number;
  partiesRightsDocId?: number;
  notarizedAffidavitId?: number;
  geotagPhotosId?: number;
  consolidatedDocId?: number;
  iqacVerification?: string;
  iqacRemarks?: string;
}

export interface MouRecord extends MouData, RowDataPacket {
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
    claimingDepartmentId: record.claiming_department_id,
    mouTypeId: record.mou_type_id,
    industryOrgTypeId: record.industry_org_type_id,
    ifOrgTypeOthers: record.if_org_type_others,
    mouBasedOnId: record.mou_based_on_id,
    domainArea: record.domain_area,
    dateOfAgreement: record.date_of_agreement,
    legalNameCollaborator: record.legal_name_collaborator,
    industryLocation: record.industry_location,
    industryAddress: record.industry_address,
    industryWebsite: record.industry_website,
    industryContactMobile: record.industry_contact_mobile,
    industryEmail: record.industry_email,
    durationUnitId: record.duration_unit_id,
    numYears: record.num_years,
    numMonths: record.num_months,
    mouEffectFrom: record.mou_effect_from,
    mouEffectTill: record.mou_effect_till,
    scopeOfAgreement: record.scope_of_agreement,
    objectivesAndGoals: record.objectives_and_goals,
    boundariesAndLimitations: record.boundaries_and_limitations,
    bitRolesResponsibilities: record.bit_roles_responsibilities,
    collaboratorRoles: record.collaborator_roles,
    spocName: record.spoc_name,
    spocDesignation: record.spoc_designation,
    spocEmail: record.spoc_email,
    spocPhone: record.spoc_phone,
    mouSigningInitiatedBy: record.mou_signing_initiated_by,
    numFaculty: record.num_faculty,
    apexProofId: record.apex_proof_id,
    emailCommLetterProofId: record.email_comm_letter_proof_id,
    signedMouDocId: record.signed_mou_doc_id,
    partiesRightsDocId: record.parties_rights_doc_id,
    notarizedAffidavitId: record.notarized_affidavit_id,
    geotagPhotosId: record.geotag_photos_id,
    consolidatedDocId: record.consolidated_doc_id,
    iqacVerification: record.iqac_verification,
    iqacRemarks: record.iqac_remarks,
  };
}

class MouService {
  async create(data: MouData): Promise<number> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = `
        INSERT INTO mou (
          submission_id, sig_number, special_labs_involved, special_lab_id, claiming_department_id,
          mou_type_id, industry_org_type_id, if_org_type_others, mou_based_on_id, domain_area,
          date_of_agreement, legal_name_collaborator, industry_location, industry_address, industry_website,
          industry_contact_mobile, industry_email, duration_unit_id, num_years, num_months,
          mou_effect_from, mou_effect_till, scope_of_agreement, objectives_and_goals, boundaries_and_limitations,
          bit_roles_responsibilities, collaborator_roles, spoc_name, spoc_designation, spoc_email, spoc_phone,
          mou_signing_initiated_by, num_faculty, apex_proof_id, email_comm_letter_proof_id, signed_mou_doc_id,
          parties_rights_doc_id, notarized_affidavit_id, geotag_photos_id, consolidated_doc_id,
          iqac_verification, iqac_remarks
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await connection.execute<ResultSetHeader>(query, [
        data.submissionId, data.sigNumber || null, data.specialLabsInvolved ? 1 : 0, data.specialLabId || null,
        data.claimingDepartmentId || null, data.mouTypeId || null, data.industryOrgTypeId || null,
        data.ifOrgTypeOthers || null, data.mouBasedOnId || null, data.domainArea || null,
        data.dateOfAgreement || null, data.legalNameCollaborator || null, data.industryLocation || null,
        data.industryAddress || null, data.industryWebsite || null, data.industryContactMobile || null,
        data.industryEmail || null, data.durationUnitId || null, data.numYears || null, data.numMonths || null,
        data.mouEffectFrom || null, data.mouEffectTill || null, data.scopeOfAgreement || null,
        data.objectivesAndGoals || null, data.boundariesAndLimitations || null,
        data.bitRolesResponsibilities || null, data.collaboratorRoles || null, data.spocName || null,
        data.spocDesignation || null, data.spocEmail || null, data.spocPhone || null,
        data.mouSigningInitiatedBy || null, data.numFaculty || null, data.apexProofId || null,
        data.emailCommLetterProofId || null, data.signedMouDocId || null, data.partiesRightsDocId || null,
        data.notarizedAffidavitId || null, data.geotagPhotosId || null, data.consolidatedDocId || null,
        data.iqacVerification || 'initiated', data.iqacRemarks || null,
      ]);

      return result.insertId;
    } finally {
      connection.release();
    }
  }

  async getById(id: number): Promise<MouRecord | null> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = 'SELECT * FROM mou WHERE id = ?';
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
        SELECT m.*, s.faculty_id as submissionFacultyId, f.email as facultyEmail, f.name as facultyName
        FROM mou m
        LEFT JOIN submissions s ON m.submission_id = s.id
        LEFT JOIN faculty f ON s.faculty_id = f.id
        WHERE m.id = ?
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
  ): Promise<{ records: MouRecord[]; total: number }> {
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

      const countQuery = `SELECT COUNT(*) as total FROM mou ${whereClause}`;
      const [countRows] = await connection.execute<any[]>(countQuery, params);
      const total = countRows[0]?.total || 0;

      const query = `
        SELECT * FROM mou
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

  async update(id: number, data: Partial<MouData>): Promise<boolean> {
    const connection = await getMysqlPool().getConnection();
    try {
      const updates: string[] = [];
      const params: any[] = [];

      if (data.legalNameCollaborator !== undefined) {
        updates.push('legal_name_collaborator = ?');
        params.push(data.legalNameCollaborator);
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
      const query = `UPDATE mou SET ${updates.join(', ')} WHERE id = ?`;
      const [result] = await connection.execute<ResultSetHeader>(query, params);

      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  async delete(id: number): Promise<boolean> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = 'DELETE FROM mou WHERE id = ?';
      const [result] = await connection.execute<ResultSetHeader>(query, [id]);
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  // Faculty management
  async addFaculty(mouId: number, facultyId: string, orderNo: number): Promise<number> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = `INSERT INTO mou_faculty (mou_id, faculty_id, order_no) VALUES (?, ?, ?)`;
      const [result] = await connection.execute<ResultSetHeader>(query, [mouId, facultyId, orderNo]);
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  async removeFaculty(mouId: number, facultyId: string): Promise<boolean> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = 'DELETE FROM mou_faculty WHERE mou_id = ? AND faculty_id = ?';
      const [result] = await connection.execute<ResultSetHeader>(query, [mouId, facultyId]);
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  async listFaculty(mouId: number): Promise<any[]> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = `
        SELECT f.id, f.name, f.email, mf.order_no
        FROM mou_faculty mf
        LEFT JOIN faculty f ON mf.faculty_id = f.id
        WHERE mf.mou_id = ?
        ORDER BY mf.order_no ASC
      `;
      const [rows] = await connection.execute<any[]>(query, [mouId]);
      return rows;
    } finally {
      connection.release();
    }
  }

  // Purpose management
  async addPurpose(mouId: number, purposeId: number): Promise<number> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = `INSERT INTO mou_purpose (mou_id, purpose_id) VALUES (?, ?)`;
      const [result] = await connection.execute<ResultSetHeader>(query, [mouId, purposeId]);
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  async removePurpose(mouId: number, purposeId: number): Promise<boolean> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = 'DELETE FROM mou_purpose WHERE mou_id = ? AND purpose_id = ?';
      const [result] = await connection.execute<ResultSetHeader>(query, [mouId, purposeId]);
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  async listPurposes(mouId: number): Promise<any[]> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = `
        SELECT mp.id, mp.purpose_id, rmp.purpose_name
        FROM mou_purpose mp
        LEFT JOIN ref_mou_purpose rmp ON mp.purpose_id = rmp.id
        WHERE mp.mou_id = ?
      `;
      const [rows] = await connection.execute<any[]>(query, [mouId]);
      return rows;
    } finally {
      connection.release();
    }
  }
}

export default new MouService();
