import { getMysqlPool } from '../database/mysql';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { logger } from '../utils/logger';

export interface StudentsIndustrialVisitData {
  submissionId: number;
  sigNumber?: string;
  programmeLevelId?: number;
  industryName?: string;
  domainArea?: string;
  industryTypeId?: number;
  ifTypeOthers?: string;
  industryLocation?: string;
  industryWebsite?: string;
  contactPersonName?: string;
  contactDesignation?: string;
  contactEmail?: string;
  contactPhone?: string;
  startDate?: string;
  endDate?: string;
  purposeOfVisit?: string;
  numStudentsVisited?: number;
  numMaleStudents?: number;
  numFemaleStudents?: number;
  yearOfStudyId?: number;
  sourceOfArrangementId?: number;
  curriculumMapping?: string;
  outcome?: string;
  proofId?: number;
  iqacVerification?: string;
  iqacRemarks?: string;
}

export interface StudentsIndustrialVisitRecord extends StudentsIndustrialVisitData, RowDataPacket {
  id: number;
}

function transformToCamelCase(record: any): any {
  if (!record) return null;

  return {
    id: record.id,
    submissionId: record.submission_id,
    sigNumber: record.sig_number,
    programmeLevelId: record.programme_level_id,
    industryName: record.industry_name,
    domainArea: record.domain_area,
    industryTypeId: record.industry_type_id,
    ifTypeOthers: record.if_type_others,
    industryLocation: record.industry_location,
    industryWebsite: record.industry_website,
    contactPersonName: record.contact_person_name,
    contactDesignation: record.contact_designation,
    contactEmail: record.contact_email,
    contactPhone: record.contact_phone,
    startDate: record.start_date,
    endDate: record.end_date,
    purposeOfVisit: record.purpose_of_visit,
    numStudentsVisited: record.num_students_visited,
    numMaleStudents: record.num_male_students,
    numFemaleStudents: record.num_female_students,
    yearOfStudyId: record.year_of_study_id,
    sourceOfArrangementId: record.source_of_arrangement_id,
    curriculumMapping: record.curriculum_mapping,
    outcome: record.outcome,
    proofId: record.proof_id,
    iqacVerification: record.iqac_verification,
    iqacRemarks: record.iqac_remarks,
  };
}

class StudentsIndustrialVisitService {
  async create(data: StudentsIndustrialVisitData): Promise<number> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = `
        INSERT INTO students_industrial_visit (
          submission_id, sig_number, programme_level_id, industry_name, domain_area,
          industry_type_id, if_type_others, industry_location, industry_website,
          contact_person_name, contact_designation, contact_email, contact_phone,
          start_date, end_date, purpose_of_visit, num_students_visited, num_male_students,
          num_female_students, year_of_study_id, source_of_arrangement_id,
          curriculum_mapping, outcome, proof_id,
          iqac_verification, iqac_remarks
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await connection.execute<ResultSetHeader>(query, [
        data.submissionId,
        data.sigNumber || null,
        data.programmeLevelId || null,
        data.industryName || null,
        data.domainArea || null,
        data.industryTypeId || null,
        data.ifTypeOthers || null,
        data.industryLocation || null,
        data.industryWebsite || null,
        data.contactPersonName || null,
        data.contactDesignation || null,
        data.contactEmail || null,
        data.contactPhone || null,
        data.startDate || null,
        data.endDate || null,
        data.purposeOfVisit || null,
        data.numStudentsVisited || null,
        data.numMaleStudents || null,
        data.numFemaleStudents || null,
        data.yearOfStudyId || null,
        data.sourceOfArrangementId || null,
        data.curriculumMapping || null,
        data.outcome || null,
        data.proofId || null,
        data.iqacVerification || 'initiated',
        data.iqacRemarks || null,
      ]);

      return result.insertId;
    } finally {
      connection.release();
    }
  }

  async getById(id: number): Promise<StudentsIndustrialVisitRecord | null> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = 'SELECT * FROM students_industrial_visit WHERE id = ?';
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
        SELECT siv.*, s.faculty_id as submissionFacultyId, f.email as facultyEmail, f.name as facultyName
        FROM students_industrial_visit siv
        LEFT JOIN submissions s ON siv.submission_id = s.id
        LEFT JOIN faculty f ON s.faculty_id = f.id
        WHERE siv.id = ?
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
  ): Promise<{ records: StudentsIndustrialVisitRecord[]; total: number }> {
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

      const countQuery = `SELECT COUNT(*) as total FROM students_industrial_visit ${whereClause}`;
      const [countRows] = await connection.execute<any[]>(countQuery, params);
      const total = countRows[0]?.total || 0;

      const query = `
        SELECT * FROM students_industrial_visit
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

  async update(id: number, data: Partial<StudentsIndustrialVisitData>): Promise<boolean> {
    const connection = await getMysqlPool().getConnection();
    try {
      const updates: string[] = [];
      const params: any[] = [];

      if (data.industryName !== undefined) {
        updates.push('industry_name = ?');
        params.push(data.industryName);
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
      const query = `UPDATE students_industrial_visit SET ${updates.join(', ')} WHERE id = ?`;
      const [result] = await connection.execute<ResultSetHeader>(query, params);

      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  async delete(id: number): Promise<boolean> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = 'DELETE FROM students_industrial_visit WHERE id = ?';
      const [result] = await connection.execute<ResultSetHeader>(query, [id]);
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  // Faculty coordinator management
  async addFacultyCoordinator(visitId: number, facultyId: string, orderNo: number): Promise<number> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = `
        INSERT INTO students_iv_faculty (students_iv_id, faculty_id, order_no)
        VALUES (?, ?, ?)
      `;
      const [result] = await connection.execute<ResultSetHeader>(query, [visitId, facultyId, orderNo]);
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  async removeFacultyCoordinator(visitId: number, facultyId: string): Promise<boolean> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = 'DELETE FROM students_iv_faculty WHERE students_iv_id = ? AND faculty_id = ?';
      const [result] = await connection.execute<ResultSetHeader>(query, [visitId, facultyId]);
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  async listFacultyCoordinators(visitId: number): Promise<any[]> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = `
        SELECT f.id, f.name, f.email, sif.order_no
        FROM students_iv_faculty sif
        LEFT JOIN faculty f ON sif.faculty_id = f.id
        WHERE sif.students_iv_id = ?
        ORDER BY sif.order_no ASC
      `;
      const [rows] = await connection.execute<any[]>(query, [visitId]);
      return rows;
    } finally {
      connection.release();
    }
  }
}

export default new StudentsIndustrialVisitService();
