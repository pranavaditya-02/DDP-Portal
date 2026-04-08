import { getMysqlPool } from '../database/mysql';
import { logger } from '../utils/logger';

export interface StudentPaperPresentationData {
  studentId: string;
  studentName: string;
  paperTitle: string;
  eventStartDate: string;
  eventEndDate: string;
  isAcademicProjectOutcome: 'yes' | 'no';
  imageProofPath?: string;
  abstractProofPath?: string;
  certificateProofPath?: string;
  attestedCertificatePath?: string;
  status: 'participated' | 'winner';
  iqacVerification?: 'initiated' | 'processing' | 'completed';
  parentalDepartmentId?: number;
  createdBy?: string;
}

function convertToCamelCase(row: any): any {
  return {
    id: row.id,
    studentId: row.student_id,
    studentName: row.student_name,
    paperTitle: row.paper_title,
    eventStartDate: row.event_start_date,
    eventEndDate: row.event_end_date,
    isAcademicProjectOutcome: row.is_academic_project_outcome,
    imageProofPath: row.image_proof_path,
    abstractProofPath: row.abstract_proof_path,
    certificateProofPath: row.certificate_proof_path,
    attestedCertificatePath: row.attested_certificate_path,
    status: row.status,
    iqacVerification: row.iqac_verification,
    parentalDepartmentId: row.parental_department_id,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

class StudentPaperPresentationService {
  /**
   * Create a new student paper presentation record
   */
  async createPresentation(data: StudentPaperPresentationData): Promise<any> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const query = `
        INSERT INTO student_paper_presentations (
          student_id, student_name, paper_title, event_start_date, event_end_date,
          is_academic_project_outcome, image_proof_path, abstract_proof_path,
          certificate_proof_path, attested_certificate_path,
          status, iqac_verification, parental_department_id, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await connection.execute(query, [
        data.studentId,
        data.studentName,
        data.paperTitle,
        data.eventStartDate,
        data.eventEndDate,
        data.isAcademicProjectOutcome,
        data.imageProofPath || null,
        data.abstractProofPath || null,
        data.certificateProofPath || null,
        data.attestedCertificatePath || null,
        data.status,
        data.iqacVerification || 'initiated',
        data.parentalDepartmentId || null,
        data.createdBy || null,
      ]);

      logger.info(`Paper presentation created with ID: ${(result as any).insertId}`);
      return { id: (result as any).insertId, ...data };
    } catch (error) {
      logger.error('Error creating paper presentation:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get all paper presentations with pagination
   */
  async getAllPresentations(filters?: any, page: number = 1, limit: number = 20): Promise<{ records: any[]; total: number; page: number; limit: number; pages: number }> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      // Build WHERE clause
      const conditions: string[] = [];
      const whereParams: any[] = [];

      if (filters) {
        if (filters.createdBy) {
          conditions.push('created_by = ?');
          whereParams.push(filters.createdBy);
        }
        if (filters.studentId) {
          conditions.push('student_id = ?');
          whereParams.push(filters.studentId);
        }
        if (filters.status) {
          conditions.push('status = ?');
          whereParams.push(filters.status);
        }
        if (filters.iqacVerification) {
          conditions.push('iqac_verification = ?');
          whereParams.push(filters.iqacVerification);
        }
      }

      const whereClause = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';

      // Get total count
      const countQuery = `SELECT COUNT(*) as count FROM student_paper_presentations${whereClause}`;
      const [countResult] = await connection.execute(countQuery, whereParams);
      const total = (countResult as any[])[0].count || 0;

      // Build main query with pagination - construct LIMIT clause as string
      const offset = Math.max(0, (page - 1) * limit);
      const limitClause = ` LIMIT ${offset}, ${limit}`;
      const dataQuery = `
        SELECT 
          id, student_id, student_name, paper_title, 
          event_start_date, event_end_date, 
          is_academic_project_outcome, image_proof_path, abstract_proof_path,
          certificate_proof_path, attested_certificate_path,
          status, iqac_verification, created_at
        FROM student_paper_presentations
        ${whereClause}
        ORDER BY created_at DESC${limitClause}
      `;

      const [rows] = await connection.execute(dataQuery, whereParams);
      const results = rows as any[];
      
      // Convert snake_case to camelCase for list view
      return {
        records: results.map(row => convertToCamelCase(row)),
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Error fetching paper presentations:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get single paper presentation by ID
   */
  async getPresentationById(id: number): Promise<any> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const query = 'SELECT * FROM student_paper_presentations WHERE id = ?';
      const [rows] = await connection.execute(query, [id]);
      const results = rows as any[];
      
      if (results.length > 0) {
        return convertToCamelCase(results[0]);
      }
      return null;
    } catch (error) {
      logger.error('Error fetching paper presentation:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update paper presentation
   */
  async updatePresentation(id: number, data: Partial<StudentPaperPresentationData>): Promise<any> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const updateFields: string[] = [];
      const values: any[] = [];

      Object.entries(data).forEach(([key, value]) => {
        // Convert camelCase to snake_case
        const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
        updateFields.push(`${snakeKey} = ?`);
        values.push(value);
      });

      values.push(id);

      const query = `UPDATE student_paper_presentations SET ${updateFields.join(', ')} WHERE id = ?`;
      const [result] = await connection.execute(query, values);

      logger.info(`Paper presentation ${id} updated`);
      return result;
    } catch (error) {
      logger.error('Error updating paper presentation:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Delete paper presentation
   */
  async deletePresentation(id: number): Promise<any> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const query = 'DELETE FROM student_paper_presentations WHERE id = ?';
      const [result] = await connection.execute(query, [id]);
      logger.info(`Paper presentation ${id} deleted`);
      return result;
    } catch (error) {
      logger.error('Error deleting paper presentation:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default new StudentPaperPresentationService();
