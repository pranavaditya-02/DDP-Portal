import { getMysqlPool } from '../database/mysql';
import { logger } from '../utils/logger';

export interface PaperPresentationData {
  student_id: number;
  student_name: string;
  paper_title: string;
  event_start_date: string;
  event_end_date: string;
  academic_project_type: 'yes' | 'no';
  image_proof_path?: string;
  image_proof_name?: string;
  abstract_proof_path?: string;
  abstract_proof_name?: string;
  certificate_proof_path?: string;
  certificate_proof_name?: string;
  attested_cert_path?: string;
  attested_cert_name?: string;
  status: 'participated' | 'winner';
  iqac_verification?: 'initiated' | 'processing' | 'completed';
  parental_department?: string;
  created_by?: number;
}

class PaperPresentationService {
  /**
   * Create a new paper presentation record
   */
  async createPresentation(data: PaperPresentationData, userId?: number): Promise<any> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const query = `
        INSERT INTO paper_presentation (
          student_id, student_name, paper_title, event_start_date, event_end_date,
          academic_project_type, image_proof_path, image_proof_name,
          abstract_proof_path, abstract_proof_name, certificate_proof_path,
          certificate_proof_name, attested_cert_path, attested_cert_name,
          status, iqac_verification, parental_department, created_by
        ) VALUES (
          ?, ?, ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?, ?
        )
      `;

      const [result] = await connection.execute(query, [
        data.student_id,
        data.student_name,
        data.paper_title,
        data.event_start_date,
        data.event_end_date,
        data.academic_project_type,
        data.image_proof_path || null,
        data.image_proof_name || null,
        data.abstract_proof_path || null,
        data.abstract_proof_name || null,
        data.certificate_proof_path || null,
        data.certificate_proof_name || null,
        data.attested_cert_path || null,
        data.attested_cert_name || null,
        data.status,
        data.iqac_verification || 'initiated',
        data.parental_department || null,
        userId || null,
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
   * Get all paper presentations with optional filtering
   */
  async getAllPresentations(filters?: {
    student_id?: number;
    status?: string;
    iqac_verification?: string;
  }): Promise<any[]> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      let query = 'SELECT * FROM paper_presentation WHERE 1=1';
      const params: any[] = [];

      if (filters?.student_id) {
        query += ' AND student_id = ?';
        params.push(filters.student_id);
      }

      if (filters?.status) {
        query += ' AND status = ?';
        params.push(filters.status);
      }

      if (filters?.iqac_verification) {
        query += ' AND iqac_verification = ?';
        params.push(filters.iqac_verification);
      }

      query += ' ORDER BY created_at DESC';

      const [results] = await connection.execute(query, params);
      return results as any[];
    } catch (error) {
      logger.error('Error fetching paper presentations:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get paper presentation by ID
   */
  async getPresentationById(id: number): Promise<any> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const query = 'SELECT * FROM paper_presentation WHERE id = ?';
      const [results] = await connection.execute(query, [id]);
      return (results as any[])[0] || null;
    } catch (error) {
      logger.error('Error fetching paper presentation by ID:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update paper presentation record
   */
  async updatePresentation(
    id: number,
    data: Partial<PaperPresentationData>,
    userId?: number
  ): Promise<any> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const fields: string[] = [];
      const values: any[] = [];

      // Dynamically build update query
      const allowedFields = [
        'student_name',
        'paper_title',
        'event_start_date',
        'event_end_date',
        'academic_project_type',
        'image_proof_path',
        'image_proof_name',
        'abstract_proof_path',
        'abstract_proof_name',
        'certificate_proof_path',
        'certificate_proof_name',
        'attested_cert_path',
        'attested_cert_name',
        'status',
        'iqac_verification',
        'parental_department',
      ];

      for (const field of allowedFields) {
        if (field in data) {
          fields.push(`${field} = ?`);
          values.push((data as any)[field]);
        }
      }

      if (fields.length === 0) {
        return { id, message: 'No fields to update' };
      }

      fields.push('updated_by = ?');
      values.push(userId || null);
      values.push(id);

      const query = `UPDATE paper_presentation SET ${fields.join(', ')} WHERE id = ?`;
      await connection.execute(query, values);

      logger.info(`Paper presentation ${id} updated`);
      return { id, message: 'Updated successfully' };
    } catch (error) {
      logger.error('Error updating paper presentation:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Delete paper presentation record
   */
  async deletePresentation(id: number): Promise<any> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const query = 'DELETE FROM paper_presentation WHERE id = ?';
      await connection.execute(query, [id]);
      logger.info(`Paper presentation ${id} deleted`);
      return { id, message: 'Deleted successfully' };
    } catch (error) {
      logger.error('Error deleting paper presentation:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get presentations by student ID
   */
  async getPresentationsByStudent(studentId: number): Promise<any[]> {
    return this.getAllPresentations({ student_id: studentId });
  }

  /**
   * Update IQAC verification status
   */
  async updateIQACVerification(
    id: number,
    status: 'initiated' | 'processing' | 'completed',
    userId?: number
  ): Promise<any> {
    return this.updatePresentation(id, { iqac_verification: status }, userId);
  }
}

export default new PaperPresentationService();
