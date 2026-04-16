import { getMysqlPool } from '../database/mysql';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { logger } from '../utils/logger';

export interface FacultyIndustryProjectData {
  submissionId: number;
  sigNumber?: string;
  specialLabsInvolved?: boolean;
  specialLabId?: number;
  studentsInvolved?: boolean;
  industryName?: string;
  industryTypeId?: number;
  ifTypeOthers?: string;
  projectTypeId?: number;
  projectTitle?: string;
  durationMonths?: number;
  startDate?: string;
  endDate?: string;
  outcome?: string;
  projectProofId?: number;
  iqacVerification?: string;
  iqacRemarks?: string;
}

export interface FacultyIndustryProjectRecord extends FacultyIndustryProjectData, RowDataPacket {
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
    studentsInvolved: record.students_involved,
    industryName: record.industry_name,
    industryTypeId: record.industry_type_id,
    ifTypeOthers: record.if_type_others,
    projectTypeId: record.project_type_id,
    projectTitle: record.project_title,
    durationMonths: record.duration_months,
    startDate: record.start_date,
    endDate: record.end_date,
    outcome: record.outcome,
    projectProofId: record.project_proof_id,
    iqacVerification: record.iqac_verification,
    iqacRemarks: record.iqac_remarks,
  };
}

class FacultyIndustryProjectService {
  async create(data: FacultyIndustryProjectData): Promise<number> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = `
        INSERT INTO faculty_industry_project (
          submission_id,
          sig_number,
          special_labs_involved,
          special_lab_id,
          students_involved,
          industry_name,
          industry_type_id,
          if_type_others,
          project_type_id,
          project_title,
          duration_months,
          start_date,
          end_date,
          outcome,
          project_proof_id,
          iqac_verification,
          iqac_remarks
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await connection.execute<ResultSetHeader>(query, [
        data.submissionId,
        data.sigNumber || null,
        data.specialLabsInvolved ? 1 : 0,
        data.specialLabId || null,
        data.studentsInvolved ? 1 : 0,
        data.industryName || null,
        data.industryTypeId || null,
        data.ifTypeOthers || null,
        data.projectTypeId || null,
        data.projectTitle || null,
        data.durationMonths || null,
        data.startDate || null,
        data.endDate || null,
        data.outcome || null,
        data.projectProofId || null,
        data.iqacVerification || 'initiated',
        data.iqacRemarks || null,
      ]);

      return result.insertId;
    } finally {
      connection.release();
    }
  }

  async getById(id: number): Promise<FacultyIndustryProjectRecord | null> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = 'SELECT * FROM faculty_industry_project WHERE id = ?';
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
        SELECT fip.*, s.faculty_id as submissionFacultyId, f.email as facultyEmail, f.name as facultyName
        FROM faculty_industry_project fip
        LEFT JOIN submissions s ON fip.submission_id = s.id
        LEFT JOIN faculty f ON s.faculty_id = f.id
        WHERE fip.id = ?
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
  ): Promise<{ records: FacultyIndustryProjectRecord[]; total: number }> {
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

      const countQuery = `SELECT COUNT(*) as total FROM faculty_industry_project ${whereClause}`;
      const [countRows] = await connection.execute<any[]>(countQuery, params);
      const total = countRows[0]?.total || 0;

      const query = `
        SELECT * FROM faculty_industry_project
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

  async update(id: number, data: Partial<FacultyIndustryProjectData>): Promise<boolean> {
    const connection = await getMysqlPool().getConnection();
    try {
      const updates: string[] = [];
      const params: any[] = [];

      if (data.projectTitle !== undefined) {
        updates.push('project_title = ?');
        params.push(data.projectTitle);
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
      const query = `UPDATE faculty_industry_project SET ${updates.join(', ')} WHERE id = ?`;
      const [result] = await connection.execute<ResultSetHeader>(query, params);

      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  async delete(id: number): Promise<boolean> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = 'DELETE FROM faculty_industry_project WHERE id = ?';
      const [result] = await connection.execute<ResultSetHeader>(query, [id]);
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  // Faculty management for many-to-many
  async addFaculty(projectId: number, facultyId: string, orderNo: number): Promise<number> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = `
        INSERT INTO faculty_industry_project_faculty (project_id, faculty_id, order_no)
        VALUES (?, ?, ?)
      `;
      const [result] = await connection.execute<ResultSetHeader>(query, [projectId, facultyId, orderNo]);
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  async removeFaculty(projectId: number, facultyId: string): Promise<boolean> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = 'DELETE FROM faculty_industry_project_faculty WHERE project_id = ? AND faculty_id = ?';
      const [result] = await connection.execute<ResultSetHeader>(query, [projectId, facultyId]);
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  async listFaculty(projectId: number): Promise<any[]> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = `
        SELECT f.id, f.name, f.email, fipf.order_no
        FROM faculty_industry_project_faculty fipf
        LEFT JOIN faculty f ON fipf.faculty_id = f.id
        WHERE fipf.project_id = ?
        ORDER BY fipf.order_no ASC
      `;
      const [rows] = await connection.execute<any[]>(query, [projectId]);
      return rows;
    } finally {
      connection.release();
    }
  }

  // Student management for many-to-many
  async addStudent(projectId: number, studentName: string, orderNo: number): Promise<number> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = `
        INSERT INTO faculty_industry_project_student (project_id, student_name, order_no)
        VALUES (?, ?, ?)
      `;
      const [result] = await connection.execute<ResultSetHeader>(query, [projectId, studentName, orderNo]);
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  async removeStudent(projectId: number, studentId: number): Promise<boolean> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = 'DELETE FROM faculty_industry_project_student WHERE project_id = ? AND id = ?';
      const [result] = await connection.execute<ResultSetHeader>(query, [projectId, studentId]);
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  async listStudents(projectId: number): Promise<any[]> {
    const connection = await getMysqlPool().getConnection();
    try {
      const query = `
        SELECT id, student_name, order_no
        FROM faculty_industry_project_student
        WHERE project_id = ?
        ORDER BY order_no ASC
      `;
      const [rows] = await connection.execute<any[]>(query, [projectId]);
      return rows;
    } finally {
      connection.release();
    }
  }
}

export default new FacultyIndustryProjectService();
