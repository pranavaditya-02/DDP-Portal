import { getMysqlPool } from '../database/mysql';
import { logger } from '../utils/logger';

export interface StudentProjectCompetitionData {
  studentId: string;
  studentName: string;
  competitionType: 'national' | 'international';
  projectTitle: string;
  eventStartDate: string;
  eventEndDate: string;
  isAcademicProjectOutcome: 'yes' | 'no';
  academicProjectId?: string;
  sdgGoal?: string;
  imageProofPath?: string;
  abstractProofPath?: string;
  winnerCertificateProofPath?: string;
  runnerCertificateProofPath?: string;
  status: 'participated' | 'winner' | 'runner';
  winnerPlace?: string;
  prizeType?: string;
  iqacVerification?: 'initiated' | 'approved' | 'rejected';
  iqacRejectionRemarks?: string;
  parentalDepartmentId?: number;
  createdBy?: string;
}

function convertToCamelCase(row: any): any {
  return {
    id: row.id,
    studentId: row.student_id,
    studentName: row.student_name,
    competitionType: row.competition_type,
    projectTitle: row.project_title,
    eventStartDate: row.event_start_date,
    eventEndDate: row.event_end_date,
    isAcademicProjectOutcome: row.is_academic_project_outcome,
    academicProjectId: row.academic_project_id,
    sdgGoal: row.sdg_goal,
    imageProofPath: row.image_proof_path,
    abstractProofPath: row.abstract_proof_path,
    winnerCertificateProofPath: row.winner_certificate_proof_path,
    runnerCertificateProofPath: row.runner_certificate_proof_path,
    status: row.status,
    winnerPlace: row.winner_place,
    prizeType: row.prize_type,
    iqacVerification: row.iqac_verification,
    iqacRejectionRemarks: row.iqac_rejection_remarks,
    parentalDepartmentId: row.parental_department_id,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

class StudentProjectCompetitionService {
  /**
   * Create a new student project competition record
   */
  async createCompetition(data: StudentProjectCompetitionData): Promise<any> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const query = `
        INSERT INTO student_project_competitions (
          student_id, student_name, competition_type, project_title, event_start_date, event_end_date,
          is_academic_project_outcome, academic_project_id, sdg_goal, image_proof_path, abstract_proof_path,
          winner_certificate_proof_path, runner_certificate_proof_path,
          status, winner_place, prize_type, iqac_verification, iqac_rejection_remarks, parental_department_id, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await connection.execute(query, [
        data.studentId,
        data.studentName,
        data.competitionType,
        data.projectTitle,
        data.eventStartDate,
        data.eventEndDate,
        data.isAcademicProjectOutcome,
        data.academicProjectId || null,
        data.sdgGoal || null,
        data.imageProofPath || null,
        data.abstractProofPath || null,
        data.winnerCertificateProofPath || null,
        data.runnerCertificateProofPath || null,
        data.status,
        data.winnerPlace || null,
        data.prizeType || null,
        data.iqacVerification || 'initiated',
        data.iqacRejectionRemarks || null,
        data.parentalDepartmentId || null,
        data.createdBy || null,
      ]);

      logger.info(`Project competition created with ID: ${(result as any).insertId}`);
      return { id: (result as any).insertId, ...data };
    } catch (error) {
      logger.error('Error creating project competition:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get all project competitions with pagination
   */
  async getAllCompetitions(filters?: any, page: number = 1, limit: number = 20): Promise<{ records: any[]; total: number; page: number; limit: number; pages: number }> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      // Ensure page and limit are valid positive integers
      const validPage = Math.max(1, parseInt(String(page)) || 1);
      const validLimit = Math.max(1, parseInt(String(limit)) || 20);

      // Build WHERE clause
      const conditions: string[] = [];
      const whereParams: any[] = [];

      if (filters) {
        if (filters.studentId) {
          conditions.push('student_id = ?');
          whereParams.push(filters.studentId);
        }
        if (filters.status) {
          conditions.push('status = ?');
          whereParams.push(filters.status);
        }
        if (filters.competitionType) {
          conditions.push('competition_type = ?');
          whereParams.push(filters.competitionType);
        }
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Count total records
      const countQuery = `SELECT COUNT(*) as total FROM student_project_competitions ${whereClause}`;
      const [countResult] = await connection.execute(countQuery, whereParams);
      const total = (countResult as any)[0].total;

      // Get paginated records
      const offset = (validPage - 1) * validLimit;
      const query = `
        SELECT * FROM student_project_competitions 
        ${whereClause} 
        ORDER BY created_at DESC 
        LIMIT ${validLimit} OFFSET ${offset}
      `;

      const [rows] = await connection.execute(query, whereParams);

      const records = (rows as any[]).map(convertToCamelCase);

      return {
        records,
        total,
        page: validPage,
        limit: validLimit,
        pages: Math.ceil(total / validLimit),
      };
    } catch (error) {
      logger.error('Error fetching project competitions:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get a single project competition by ID
   */
  async getCompetitionById(id: number): Promise<any> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const query = 'SELECT * FROM student_project_competitions WHERE id = ?';
      const [rows] = await connection.execute(query, [id]);

      if ((rows as any[]).length === 0) {
        return null;
      }

      return convertToCamelCase((rows as any)[0]);
    } catch (error) {
      logger.error('Error fetching project competition:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update a project competition record
   */
  async updateCompetition(id: number, data: Partial<StudentProjectCompetitionData>): Promise<any> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const updates: string[] = [];
      const values: any[] = [];

      // Build dynamic update clause
      if (data.competitionType) {
        updates.push('competition_type = ?');
        values.push(data.competitionType);
      }
      if (data.projectTitle !== undefined) {
        updates.push('project_title = ?');
        values.push(data.projectTitle);
      }
      if (data.eventStartDate) {
        updates.push('event_start_date = ?');
        values.push(data.eventStartDate);
      }
      if (data.eventEndDate) {
        updates.push('event_end_date = ?');
        values.push(data.eventEndDate);
      }
      if (data.status) {
        updates.push('status = ?');
        values.push(data.status);
      }
      if (data.iqacVerification) {
        updates.push('iqac_verification = ?');
        values.push(data.iqacVerification);
      }
      if (data.iqacRejectionRemarks !== undefined) {
        updates.push('iqac_rejection_remarks = ?');
        values.push(data.iqacRejectionRemarks);
      }

      if (updates.length === 0) {
        return null;
      }

      values.push(id);
      const query = `UPDATE student_project_competitions SET ${updates.join(', ')} WHERE id = ?`;
      await connection.execute(query, values);

      logger.info(`Project competition updated: ${id}`);
      return this.getCompetitionById(id);
    } catch (error) {
      logger.error('Error updating project competition:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Delete a project competition record
   */
  async deleteCompetition(id: number): Promise<boolean> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const query = 'DELETE FROM student_project_competitions WHERE id = ?';
      const [result] = await connection.execute(query, [id]);

      const affectedRows = (result as any).affectedRows;
      if (affectedRows > 0) {
        logger.info(`Project competition deleted: ${id}`);
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Error deleting project competition:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get a project competition record by ID with student email for notifications
   */
  async getCompetitionByIdWithEmail(id: number): Promise<any> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const query = `
        SELECT spc.*, s.college_email as student_email
        FROM student_project_competitions spc
        LEFT JOIN students s ON spc.student_id = s.roll_no
        WHERE spc.id = ?
      `;
      const [rows] = await connection.execute(query, [id]);
      const results = rows as any[];
      
      if (results.length > 0) {
        const record = convertToCamelCase(results[0]);
        return record;
      }
      return null;
    } catch (error) {
      logger.error('Error fetching project competition with email:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default new StudentProjectCompetitionService();
