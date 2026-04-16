import { getMysqlPool } from '../database/mysql';
import { logger } from '../utils/logger';

interface PatentPublishedFormData {
  applyFrom: 'patent-old' | 'patent-new';
  claimedByFacultyId: string;
  claimedByFacultyName: string;
  taskId: string;
  dateOfPublish: string;
  publishedApplicationNumber: string;
  yuktiPortalRegistrationProofPath?: string;
  publicationJournalReceiptProofPath?: string;
  publicationDocumentsPath?: string;
  iqacVerification?: 'initiated' | 'approved' | 'rejected';
  createdBy?: string;
}

interface PatentPublishedResponse {
  id: number;
  [key: string]: any;
}

class PatentPublishedService {
  /**
   * Create a new patent published record
   */
  async create(data: PatentPublishedFormData): Promise<PatentPublishedResponse> {
    const connection = await getMysqlPool().getConnection();

    try {
      const patentPublishedQuery = `
        INSERT INTO patents_published (
          apply_from,
          claimed_by_faculty_id,
          claimed_by_faculty_name,
          task_id,
          date_of_publish,
          published_application_number,
          yukti_portal_registration_proof_path,
          publication_journal_receipt_proof_path,
          publication_documents_path,
          iqac_verification,
          created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await connection.execute(patentPublishedQuery, [
        data.applyFrom,
        data.claimedByFacultyId,
        data.claimedByFacultyName,
        data.taskId,
        data.dateOfPublish,
        data.publishedApplicationNumber,
        data.yuktiPortalRegistrationProofPath || null,
        data.publicationJournalReceiptProofPath || null,
        data.publicationDocumentsPath || null,
        data.iqacVerification || 'initiated',
        data.createdBy || null,
      ]);

      const patentPublishedId = (result as any).insertId;

      return {
        id: patentPublishedId,
        success: true,
        message: 'Patent published record created successfully',
      };
    } catch (error) {
      logger.error('Error creating patent published record:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get patent published record by ID
   */
  async getById(id: number): Promise<any> {
    const connection = await getMysqlPool().getConnection();

    try {
      const patentQuery = 'SELECT * FROM patents_published WHERE id = ?';
      const [patentRows] = await connection.execute(patentQuery, [id]);

      if ((patentRows as any[]).length === 0) {
        return null;
      }

      return (patentRows as any[])[0];
    } catch (error) {
      logger.error('Error fetching patent published record:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * List patent published records with pagination and filters
   */
  async list(
    filters?: any,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{ records: any[]; total: number; page: number; pageSize: number }> {
    const connection = await getMysqlPool().getConnection();

    try {
      let query = 'SELECT * FROM patents_published WHERE 1=1';
      const params: any[] = [];

      if (filters?.claimedByFacultyId) {
        query += ' AND claimed_by_faculty_id = ?';
        params.push(filters.claimedByFacultyId);
      }

      if (filters?.iqacVerification) {
        query += ' AND iqac_verification = ?';
        params.push(filters.iqacVerification);
      }

      if (filters?.applyFrom) {
        query += ' AND apply_from = ?';
        params.push(filters.applyFrom);
      }

      // Count total records
      const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
      const [countResult] = await connection.execute(countQuery, params);
      const total = (countResult as any[])[0].total;

      // Get paginated records
      const offset = (page - 1) * pageSize;
      const paginatedQuery = query + ` ORDER BY created_at DESC LIMIT ${pageSize} OFFSET ${offset}`;
      const [records] = await connection.execute(paginatedQuery, params);

      return {
        records: records as any[],
        total,
        page,
        pageSize,
      };
    } catch (error) {
      logger.error('Error fetching patent published records:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update patent published record (for IQAC verification)
   */
  async update(
    id: number,
    data: Partial<PatentPublishedFormData> & { iqacVerification?: string; iqacRemarks?: string }
  ): Promise<any> {
    const connection = await getMysqlPool().getConnection();

    try {
      const updates: string[] = [];
      const params: any[] = [];

      if (data.iqacVerification) {
        updates.push('iqac_verification = ?');
        params.push(data.iqacVerification);
      }

      if (data.iqacRemarks) {
        updates.push('iqac_remarks = ?');
        params.push(data.iqacRemarks);
      }

      if (updates.length === 0) {
        return { success: false, message: 'No updates provided' };
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');

      const query = `UPDATE patents_published SET ${updates.join(', ')} WHERE id = ?`;
      params.push(id);

      const [result] = await connection.execute(query, params);

      if ((result as any).affectedRows === 0) {
        return { success: false, message: 'Record not found' };
      }

      return {
        id,
        success: true,
        message: 'Patent published record updated successfully',
      };
    } catch (error) {
      logger.error('Error updating patent published record:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default new PatentPublishedService();
