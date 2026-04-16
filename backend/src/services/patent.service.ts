import { getMysqlPool } from '../database/mysql';
import { logger } from '../utils/logger';

// ==================== Interfaces ====================

export interface PatentPreliminaryData {
  facultyId: number;
  facultyName: string;
  patentTitle: string;
  applicantType: 'bit-faculty-only' | 'bit-faculty-with-bit-student' | 'bit-faculty-with-external';
  patentType: 'product' | 'process' | 'design';
  supportedByExperimentation: 'yes' | 'no';
  experimentationProofPath?: string;
  priorArt: string;
  novelty: string;
  involveDrawings: 'yes' | 'no';
  drawingsProofPath?: string;
  formPrepared: 'yes' | 'no';
  formProofPath?: string;
  iqacVerification?: 'initiated' | 'approved' | 'rejected';
  iqacRemarks?: string;
  createdBy?: string;
}

export interface PatentFiled {
  facultyId: number;
  facultyName: string;
  patentTitle: string;
  inventors: string;
  patentType: 'product' | 'process' | 'design';
  applicationNo?: string;
  filedDate: string;
  collaboration: 'yes' | 'no';
  collaborationDetails?: string;
  institutionNameIncluded: 'yes' | 'no';
  specialLabsInvolved: 'yes' | 'no';
  specialLab?: string;
  remarks?: string;
  documentProofPath?: string;
  iqacVerification?: 'initiated' | 'approved' | 'rejected';
  iqacRemarks?: string;
  createdBy?: string;
}

export interface PatentPublished {
  facultyId: number;
  facultyName: string;
  patentTitle: string;
  inventors: string;
  patentType: 'product' | 'process' | 'design';
  publicationNo?: string;
  publishedDate: string;
  collaboration: 'yes' | 'no';
  collaborationDetails?: string;
  institutionNameIncluded: 'yes' | 'no';
  specialLabsInvolved: 'yes' | 'no';
  specialLab?: string;
  remarks?: string;
  documentProofPath?: string;
  iqacVerification?: 'initiated' | 'approved' | 'rejected';
  iqacRemarks?: string;
  createdBy?: string;
}

export interface PatentGranted {
  facultyId: number;
  facultyName: string;
  patentTitle: string;
  inventors: string;
  patentType: 'product' | 'process' | 'design';
  grantedApplicationNo?: string;
  grantedDate: string;
  collaboration: 'yes' | 'no';
  collaborationDetails?: string;
  institutionNameIncluded: 'yes' | 'no';
  specialLabsInvolved: 'yes' | 'no';
  specialLab?: string;
  remarks?: string;
  documentProofPath?: string;
  iqacVerification?: 'initiated' | 'approved' | 'rejected';
  iqacRemarks?: string;
  createdBy?: string;
}

// ==================== Helper Functions ====================

function convertToCamelCasePreliminary(row: any): any {
  return {
    id: row.id,
    facultyId: row.faculty_id,
    facultyName: row.faculty_name,
    patentTitle: row.patent_title,
    applicantType: row.applicant_type,
    patentType: row.patent_type,
    supportedByExperimentation: row.supported_by_experimentation,
    experimentationProofPath: row.experimentation_proof_path,
    priorArt: row.prior_art,
    novelty: row.novelty,
    involveDrawings: row.involve_drawings,
    drawingsProofPath: row.drawings_proof_path,
    formPrepared: row.form_prepared,
    formProofPath: row.form_proof_path,
    iqacVerification: row.iqac_verification,
    iqacRemarks: row.iqac_remarks,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function convertToCamelCaseFiled(row: any): any {
  return {
    id: row.id,
    facultyId: row.faculty_id,
    facultyName: row.faculty_name,
    patentTitle: row.patent_title,
    inventors: row.inventors,
    patentType: row.patent_type,
    applicationNo: row.application_no,
    filedDate: row.filed_date,
    collaboration: row.collaboration,
    collaborationDetails: row.collaboration_details,
    institutionNameIncluded: row.institution_name_included,
    specialLabsInvolved: row.special_labs_involved,
    specialLab: row.special_lab,
    remarks: row.remarks,
    documentProofPath: row.document_proof_path,
    iqacVerification: row.iqac_verification,
    iqacRemarks: row.iqac_remarks,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function convertToCamelCasePublished(row: any): any {
  return {
    id: row.id,
    facultyId: row.faculty_id,
    facultyName: row.faculty_name,
    patentTitle: row.patent_title,
    inventors: row.inventors,
    patentType: row.patent_type,
    publicationNo: row.publication_no,
    publishedDate: row.published_date,
    collaboration: row.collaboration,
    collaborationDetails: row.collaboration_details,
    institutionNameIncluded: row.institution_name_included,
    specialLabsInvolved: row.special_labs_involved,
    specialLab: row.special_lab,
    remarks: row.remarks,
    documentProofPath: row.document_proof_path,
    iqacVerification: row.iqac_verification,
    iqacRemarks: row.iqac_remarks,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function convertToCamelCaseGranted(row: any): any {
  return {
    id: row.id,
    facultyId: row.faculty_id,
    facultyName: row.faculty_name,
    patentTitle: row.patent_title,
    inventors: row.inventors,
    patentType: row.patent_type,
    grantedApplicationNo: row.granted_application_no,
    grantedDate: row.granted_date,
    collaboration: row.collaboration,
    collaborationDetails: row.collaboration_details,
    institutionNameIncluded: row.institution_name_included,
    specialLabsInvolved: row.special_labs_involved,
    specialLab: row.special_lab,
    remarks: row.remarks,
    documentProofPath: row.document_proof_path,
    iqacVerification: row.iqac_verification,
    iqacRemarks: row.iqac_remarks,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ==================== Patent Service Class ====================

class PatentService {
  /**
   * ===== PATENT PRELIMINARY DATA OPERATIONS =====
   */

  /**
   * Create a new patent preliminary data record
   */
  async createPreliminaryData(data: PatentPreliminaryData): Promise<any> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const query = `
        INSERT INTO patents_preliminary_data (
          faculty_id, faculty_name, patent_title, applicant_type, patent_type,
          supported_by_experimentation, experimentation_proof_path, prior_art, novelty,
          involve_drawings, drawings_proof_path, form_prepared, form_proof_path,
          iqac_verification, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await connection.execute(query, [
        data.facultyId,
        data.facultyName,
        data.patentTitle,
        data.applicantType,
        data.patentType,
        data.supportedByExperimentation,
        data.experimentationProofPath || null,
        data.priorArt,
        data.novelty,
        data.involveDrawings,
        data.drawingsProofPath || null,
        data.formPrepared,
        data.formProofPath || null,
        data.iqacVerification || 'initiated',
        data.createdBy || null,
      ]);

      logger.info(`Patent preliminary data record created with ID: ${(result as any).insertId}`);
      return { id: (result as any).insertId, ...data };
    } catch (error) {
      logger.error('Error creating patent preliminary data record:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get all patent preliminary data records
   */
  async getAllPreliminaryData(filters: any = {}, page: number = 1, limit: number = 20): Promise<any> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      let query = 'SELECT * FROM patents_preliminary_data WHERE 1=1';
      const params: any[] = [];

      if (filters.facultyId) {
        query += ' AND faculty_id = ?';
        params.push(filters.facultyId);
      }
      if (filters.iqacVerification) {
        query += ' AND iqac_verification = ?';
        params.push(filters.iqacVerification);
      }

      const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
      const [[{ count }]] = await connection.execute(countQuery, params);

      const offset = (page - 1) * limit;
      query += ` ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;

      const [rows] = await connection.execute(query, params);

      const records = (rows as any[]).map(convertToCamelCasePreliminary);

      return {
        records,
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      };
    } catch (error) {
      logger.error('Error fetching patent preliminary data records:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get a specific patent preliminary data record by ID
   */
  async getPreliminaryDataById(id: number): Promise<any> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const query = 'SELECT * FROM patents_preliminary_data WHERE id = ?';
      const [rows] = await connection.execute(query, [id]);

      if ((rows as any[]).length === 0) {
        return null;
      }

      return convertToCamelCasePreliminary((rows as any[])[0]);
    } catch (error) {
      logger.error('Error fetching patent preliminary data record:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update a patent preliminary data record
   */
  async updatePreliminaryData(id: number, updates: Partial<PatentPreliminaryData>): Promise<any> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const fields: string[] = [];
      const params: any[] = [];

      const fieldMapping: Record<string, string> = {
        patentTitle: 'patent_title',
        applicantType: 'applicant_type',
        patentType: 'patent_type',
        supportedByExperimentation: 'supported_by_experimentation',
        experimentationProofPath: 'experimentation_proof_path',
        priorArt: 'prior_art',
        novelty: 'novelty',
        involveDrawings: 'involve_drawings',
        drawingsProofPath: 'drawings_proof_path',
        formPrepared: 'form_prepared',
        formProofPath: 'form_proof_path',
        iqacVerification: 'iqac_verification',
        iqacRemarks: 'iqac_remarks',
      };

      Object.keys(updates).forEach((key) => {
        const dbColumn = fieldMapping[key] || key;
        if (!['facultyId', 'facultyName'].includes(key)) {
          fields.push(`${dbColumn} = ?`);
          params.push((updates as any)[key]);
        }
      });

      if (fields.length === 0) {
        return this.getPreliminaryDataById(id);
      }

      params.push(id);
      const query = `UPDATE patents_preliminary_data SET ${fields.join(', ')} WHERE id = ?`;

      await connection.execute(query, params);

      logger.info(`Patent preliminary data record ${id} updated`);
      return this.getPreliminaryDataById(id);
    } catch (error) {
      logger.error('Error updating patent preliminary data record:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Delete a patent preliminary data record
   */
  async deletePreliminaryData(id: number): Promise<boolean> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const query = 'DELETE FROM patents_preliminary_data WHERE id = ?';
      const [result] = await connection.execute(query, [id]);

      const deleted = (result as any).affectedRows > 0;
      if (deleted) {
        logger.info(`Patent preliminary data record ${id} deleted`);
      }
      return deleted;
    } catch (error) {
      logger.error('Error deleting patent preliminary data record:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * ===== PATENT FILED OPERATIONS =====
   */

  async createFiled(data: PatentFiled): Promise<any> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const query = `
        INSERT INTO patents_filed (
          faculty_id, faculty_name, patent_title, inventors, patent_type,
          application_no, filed_date, collaboration, collaboration_details,
          institution_name_included, special_labs_involved, special_lab, remarks,
          document_proof_path, iqac_verification, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await connection.execute(query, [
        data.facultyId,
        data.facultyName,
        data.patentTitle,
        data.inventors,
        data.patentType,
        data.applicationNo || null,
        data.filedDate,
        data.collaboration,
        data.collaborationDetails || null,
        data.institutionNameIncluded,
        data.specialLabsInvolved,
        data.specialLab || null,
        data.remarks || null,
        data.documentProofPath || null,
        data.iqacVerification || 'initiated',
        data.createdBy || null,
      ]);

      logger.info(`Patent filed record created with ID: ${(result as any).insertId}`);
      return { id: (result as any).insertId, ...data };
    } catch (error) {
      logger.error('Error creating patent filed record:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async getAllFiled(filters: any = {}, page: number = 1, limit: number = 20): Promise<any> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      let query = 'SELECT * FROM patents_filed WHERE 1=1';
      const params: any[] = [];

      if (filters.facultyId) {
        query += ' AND faculty_id = ?';
        params.push(filters.facultyId);
      }
      if (filters.iqacVerification) {
        query += ' AND iqac_verification = ?';
        params.push(filters.iqacVerification);
      }

      const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
      const [[{ count }]] = await connection.execute(countQuery, params);

      const offset = (page - 1) * limit;
      query += ` ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;

      const [rows] = await connection.execute(query, params);

      const records = (rows as any[]).map(convertToCamelCaseFiled);

      return {
        records,
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      };
    } catch (error) {
      logger.error('Error fetching patent filed records:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async getFiledById(id: number): Promise<any> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const query = 'SELECT * FROM patents_filed WHERE id = ?';
      const [rows] = await connection.execute(query, [id]);

      if ((rows as any[]).length === 0) {
        return null;
      }

      return convertToCamelCaseFiled((rows as any[])[0]);
    } catch (error) {
      logger.error('Error fetching patent filed record:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async updateFiled(id: number, updates: Partial<PatentFiled>): Promise<any> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const fields: string[] = [];
      const params: any[] = [];

      const fieldMapping: Record<string, string> = {
        patentTitle: 'patent_title',
        inventors: 'inventors',
        patentType: 'patent_type',
        applicationNo: 'application_no',
        filedDate: 'filed_date',
        collaboration: 'collaboration',
        collaborationDetails: 'collaboration_details',
        institutionNameIncluded: 'institution_name_included',
        specialLabsInvolved: 'special_labs_involved',
        specialLab: 'special_lab',
        remarks: 'remarks',
        documentProofPath: 'document_proof_path',
        iqacVerification: 'iqac_verification',
        iqacRemarks: 'iqac_remarks',
      };

      Object.keys(updates).forEach((key) => {
        const dbColumn = fieldMapping[key] || key;
        if (!['facultyId', 'facultyName'].includes(key)) {
          fields.push(`${dbColumn} = ?`);
          params.push((updates as any)[key]);
        }
      });

      if (fields.length === 0) {
        return this.getFiledById(id);
      }

      params.push(id);
      const query = `UPDATE patents_filed SET ${fields.join(', ')} WHERE id = ?`;

      await connection.execute(query, params);

      logger.info(`Patent filed record ${id} updated`);
      return this.getFiledById(id);
    } catch (error) {
      logger.error('Error updating patent filed record:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async deleteFiled(id: number): Promise<boolean> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const query = 'DELETE FROM patents_filed WHERE id = ?';
      const [result] = await connection.execute(query, [id]);

      const deleted = (result as any).affectedRows > 0;
      if (deleted) {
        logger.info(`Patent filed record ${id} deleted`);
      }
      return deleted;
    } catch (error) {
      logger.error('Error deleting patent filed record:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * ===== PATENT PUBLISHED OPERATIONS =====
   */

  async createPublished(data: PatentPublished): Promise<any> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const query = `
        INSERT INTO patents_published (
          faculty_id, faculty_name, patent_title, inventors, patent_type,
          publication_no, published_date, collaboration, collaboration_details,
          institution_name_included, special_labs_involved, special_lab, remarks,
          document_proof_path, iqac_verification, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await connection.execute(query, [
        data.facultyId,
        data.facultyName,
        data.patentTitle,
        data.inventors,
        data.patentType,
        data.publicationNo || null,
        data.publishedDate,
        data.collaboration,
        data.collaborationDetails || null,
        data.institutionNameIncluded,
        data.specialLabsInvolved,
        data.specialLab || null,
        data.remarks || null,
        data.documentProofPath || null,
        data.iqacVerification || 'initiated',
        data.createdBy || null,
      ]);

      logger.info(`Patent published record created with ID: ${(result as any).insertId}`);
      return { id: (result as any).insertId, ...data };
    } catch (error) {
      logger.error('Error creating patent published record:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async getAllPublished(filters: any = {}, page: number = 1, limit: number = 20): Promise<any> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      let query = 'SELECT * FROM patents_published WHERE 1=1';
      const params: any[] = [];

      if (filters.facultyId) {
        query += ' AND faculty_id = ?';
        params.push(filters.facultyId);
      }
      if (filters.iqacVerification) {
        query += ' AND iqac_verification = ?';
        params.push(filters.iqacVerification);
      }

      const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
      const [[{ count }]] = await connection.execute(countQuery, params);

      const offset = (page - 1) * limit;
      query += ` ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;

      const [rows] = await connection.execute(query, params);

      const records = (rows as any[]).map(convertToCamelCasePublished);

      return {
        records,
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      };
    } catch (error) {
      logger.error('Error fetching patent published records:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async getPublishedById(id: number): Promise<any> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const query = 'SELECT * FROM patents_published WHERE id = ?';
      const [rows] = await connection.execute(query, [id]);

      if ((rows as any[]).length === 0) {
        return null;
      }

      return convertToCamelCasePublished((rows as any[])[0]);
    } catch (error) {
      logger.error('Error fetching patent published record:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async updatePublished(id: number, updates: Partial<PatentPublished>): Promise<any> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const fields: string[] = [];
      const params: any[] = [];

      const fieldMapping: Record<string, string> = {
        patentTitle: 'patent_title',
        inventors: 'inventors',
        patentType: 'patent_type',
        publicationNo: 'publication_no',
        publishedDate: 'published_date',
        collaboration: 'collaboration',
        collaborationDetails: 'collaboration_details',
        institutionNameIncluded: 'institution_name_included',
        specialLabsInvolved: 'special_labs_involved',
        specialLab: 'special_lab',
        remarks: 'remarks',
        documentProofPath: 'document_proof_path',
        iqacVerification: 'iqac_verification',
        iqacRemarks: 'iqac_remarks',
      };

      Object.keys(updates).forEach((key) => {
        const dbColumn = fieldMapping[key] || key;
        if (!['facultyId', 'facultyName'].includes(key)) {
          fields.push(`${dbColumn} = ?`);
          params.push((updates as any)[key]);
        }
      });

      if (fields.length === 0) {
        return this.getPublishedById(id);
      }

      params.push(id);
      const query = `UPDATE patents_published SET ${fields.join(', ')} WHERE id = ?`;

      await connection.execute(query, params);

      logger.info(`Patent published record ${id} updated`);
      return this.getPublishedById(id);
    } catch (error) {
      logger.error('Error updating patent published record:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async deletePublished(id: number): Promise<boolean> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const query = 'DELETE FROM patents_published WHERE id = ?';
      const [result] = await connection.execute(query, [id]);

      const deleted = (result as any).affectedRows > 0;
      if (deleted) {
        logger.info(`Patent published record ${id} deleted`);
      }
      return deleted;
    } catch (error) {
      logger.error('Error deleting patent published record:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * ===== PATENT GRANTED OPERATIONS =====
   */

  async createGranted(data: PatentGranted): Promise<any> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const query = `
        INSERT INTO patents_granted (
          faculty_id, faculty_name, patent_title, inventors, patent_type,
          granted_application_no, granted_date, collaboration, collaboration_details,
          institution_name_included, special_labs_involved, special_lab, remarks,
          document_proof_path, iqac_verification, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await connection.execute(query, [
        data.facultyId,
        data.facultyName,
        data.patentTitle,
        data.inventors,
        data.patentType,
        data.grantedApplicationNo || null,
        data.grantedDate,
        data.collaboration,
        data.collaborationDetails || null,
        data.institutionNameIncluded,
        data.specialLabsInvolved,
        data.specialLab || null,
        data.remarks || null,
        data.documentProofPath || null,
        data.iqacVerification || 'initiated',
        data.createdBy || null,
      ]);

      logger.info(`Patent granted record created with ID: ${(result as any).insertId}`);
      return { id: (result as any).insertId, ...data };
    } catch (error) {
      logger.error('Error creating patent granted record:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async getAllGranted(filters: any = {}, page: number = 1, limit: number = 20): Promise<any> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      let query = 'SELECT * FROM patents_granted WHERE 1=1';
      const params: any[] = [];

      if (filters.facultyId) {
        query += ' AND faculty_id = ?';
        params.push(filters.facultyId);
      }
      if (filters.iqacVerification) {
        query += ' AND iqac_verification = ?';
        params.push(filters.iqacVerification);
      }

      const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
      const [[{ count }]] = await connection.execute(countQuery, params);

      const offset = (page - 1) * limit;
      query += ` ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;

      const [rows] = await connection.execute(query, params);

      const records = (rows as any[]).map(convertToCamelCaseGranted);

      return {
        records,
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      };
    } catch (error) {
      logger.error('Error fetching patent granted records:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async getGrantedById(id: number): Promise<any> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const query = 'SELECT * FROM patents_granted WHERE id = ?';
      const [rows] = await connection.execute(query, [id]);

      if ((rows as any[]).length === 0) {
        return null;
      }

      return convertToCamelCaseGranted((rows as any[])[0]);
    } catch (error) {
      logger.error('Error fetching patent granted record:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async updateGranted(id: number, updates: Partial<PatentGranted>): Promise<any> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const fields: string[] = [];
      const params: any[] = [];

      const fieldMapping: Record<string, string> = {
        patentTitle: 'patent_title',
        inventors: 'inventors',
        patentType: 'patent_type',
        grantedApplicationNo: 'granted_application_no',
        grantedDate: 'granted_date',
        collaboration: 'collaboration',
        collaborationDetails: 'collaboration_details',
        institutionNameIncluded: 'institution_name_included',
        specialLabsInvolved: 'special_labs_involved',
        specialLab: 'special_lab',
        remarks: 'remarks',
        documentProofPath: 'document_proof_path',
        iqacVerification: 'iqac_verification',
        iqacRemarks: 'iqac_remarks',
      };

      Object.keys(updates).forEach((key) => {
        const dbColumn = fieldMapping[key] || key;
        if (!['facultyId', 'facultyName'].includes(key)) {
          fields.push(`${dbColumn} = ?`);
          params.push((updates as any)[key]);
        }
      });

      if (fields.length === 0) {
        return this.getGrantedById(id);
      }

      params.push(id);
      const query = `UPDATE patents_granted SET ${fields.join(', ')} WHERE id = ?`;

      await connection.execute(query, params);

      logger.info(`Patent granted record ${id} updated`);
      return this.getGrantedById(id);
    } catch (error) {
      logger.error('Error updating patent granted record:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async deleteGranted(id: number): Promise<boolean> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const query = 'DELETE FROM patents_granted WHERE id = ?';
      const [result] = await connection.execute(query, [id]);

      const deleted = (result as any).affectedRows > 0;
      if (deleted) {
        logger.info(`Patent granted record ${id} deleted`);
      }
      return deleted;
    } catch (error) {
      logger.error('Error deleting patent granted record:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * ===== IQAC VERIFICATION OPERATIONS =====
   */

  async updateIqacStatusPreliminary(id: number, status: string, remarks?: string): Promise<any> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const updateData: any = { iqacVerification: status };
      if (remarks && status === 'rejected') {
        updateData.iqacRemarks = remarks;
      }

      await this.updatePreliminaryData(id, updateData);

      return this.getPreliminaryDataById(id);
    } catch (error) {
      logger.error('Error updating IQAC status (preliminary):', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async updateIqacStatusFiled(id: number, status: string, remarks?: string): Promise<any> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const updateData: any = { iqacVerification: status };
      if (remarks && status === 'rejected') {
        updateData.iqacRemarks = remarks;
      }

      await this.updateFiled(id, updateData);

      return this.getFiledById(id);
    } catch (error) {
      logger.error('Error updating IQAC status (filed):', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async updateIqacStatusPublished(id: number, status: string, remarks?: string): Promise<any> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const updateData: any = { iqacVerification: status };
      if (remarks && status === 'rejected') {
        updateData.iqacRemarks = remarks;
      }

      await this.updatePublished(id, updateData);

      return this.getPublishedById(id);
    } catch (error) {
      logger.error('Error updating IQAC status (published):', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async updateIqacStatusGranted(id: number, status: string, remarks?: string): Promise<any> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const updateData: any = { iqacVerification: status };
      if (remarks && status === 'rejected') {
        updateData.iqacRemarks = remarks;
      }

      await this.updateGranted(id, updateData);

      return this.getGrantedById(id);
    } catch (error) {
      logger.error('Error updating IQAC status (granted):', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default new PatentService();
