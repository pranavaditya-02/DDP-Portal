import { getMysqlPool } from '../database/mysql';
import { logger } from '../utils/logger';

export interface StudentTechnicalBodyMembershipData {
  studentId: string;
  studentName: string;
  yearOfStudy: 'first' | 'second' | 'third' | 'fourth';
  membership: 'yes' | 'no';
  levelOfMembership?: string;
  stateOfMembership?: string;
  membershipNumber?: string;
  membershipSociety?: string;
  validFrom?: string;
  validTill?: string;
  chargesInRupees?: number;
  activitiesConducted?: 'yes' | 'no';
  specifyActivity?: string;
  activityStatus?: string;
  certificateProofPath?: string;
  iqacVerification?: 'initiated' | 'approved' | 'rejected';
  iqacRejectionRemarks?: string;
  createdBy?: string;
}

function convertToCamelCase(row: any): any {
  return {
    id: row.id,
    studentId: row.student_id,
    studentName: row.student_name,
    yearOfStudy: row.year_of_study,
    membership: row.membership,
    levelOfMembership: row.level_of_membership,
    stateOfMembership: row.state_of_membership,
    membershipNumber: row.membership_number,
    membershipSociety: row.membership_society,
    validFrom: row.valid_from,
    validTill: row.valid_till,
    chargesInRupees: row.charges_in_rupees,
    activitiesConducted: row.activities_conducted,
    specifyActivity: row.specify_activity,
    activityStatus: row.activity_status,
    certificateProofPath: row.certificate_proof_path,
    iqacVerification: row.iqac_verification,
    iqacRejectionRemarks: row.iqac_rejection_remarks,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

class StudentTechnicalBodyMembershipService {
  /**
   * Create a new technical body membership record
   */
  async createMembership(data: StudentTechnicalBodyMembershipData): Promise<any> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const query = `
        INSERT INTO student_technical_body_memberships (
          student_id, student_name, year_of_study, membership, level_of_membership,
          state_of_membership, membership_number, membership_society, valid_from, valid_till, charges_in_rupees,
          activities_conducted, specify_activity, activity_status, certificate_proof_path,
          iqac_verification, iqac_rejection_remarks, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await connection.execute(query, [
        data.studentId,
        data.studentName,
        data.yearOfStudy,
        data.membership,
        data.levelOfMembership || null,
        data.stateOfMembership || null,
        data.membershipNumber || null,
        data.membershipSociety || null,
        data.validFrom || null,
        data.validTill || null,
        data.chargesInRupees || null,
        data.activitiesConducted || null,
        data.specifyActivity || null,
        data.activityStatus || null,
        data.certificateProofPath || null,
        data.iqacVerification || 'initiated',
        data.iqacRejectionRemarks || null,
        data.createdBy || null,
      ]);

      logger.info(`Technical body membership created with ID: ${(result as any).insertId}`);
      return { id: (result as any).insertId, ...data };
    } catch (error) {
      logger.error('Error creating technical body membership:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get all technical body memberships with pagination
   */
  async getAllMemberships(
    filters?: any,
    page: number = 1,
    limit: number = 20
  ): Promise<{ records: any[]; total: number; page: number; limit: number; pages: number }> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const validPage = Math.max(1, parseInt(String(page)) || 1);
      const validLimit = Math.max(1, parseInt(String(limit)) || 20);

      const conditions: string[] = [];
      const whereParams: any[] = [];

      if (filters) {
        if (filters.studentId) {
          conditions.push('student_id = ?');
          whereParams.push(filters.studentId);
        }
        if (filters.membership) {
          conditions.push('membership = ?');
          whereParams.push(filters.membership);
        }
        if (filters.iqacVerification) {
          conditions.push('iqac_verification = ?');
          whereParams.push(filters.iqacVerification);
        }
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const countQuery = `SELECT COUNT(*) as total FROM student_technical_body_memberships ${whereClause}`;
      const [countResult] = await connection.execute(countQuery, whereParams);
      const total = (countResult as any)[0].total;

      const offset = (validPage - 1) * validLimit;
      const query = `
        SELECT * FROM student_technical_body_memberships 
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
      logger.error('Error fetching technical body memberships:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get a specific membership record by ID
   */
  async getMembershipById(id: number): Promise<any> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.execute(
        'SELECT * FROM student_technical_body_memberships WHERE id = ?',
        [id]
      );

      const record = (rows as any[])[0];
      return record ? convertToCamelCase(record) : null;
    } catch (error) {
      logger.error('Error fetching technical body membership:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update a membership record
   */
  async updateMembership(id: number, updates: Partial<StudentTechnicalBodyMembershipData>): Promise<any> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const fields: string[] = [];
      const values: any[] = [];

      Object.entries(updates).forEach(([key, value]) => {
        const snakeCaseKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        fields.push(`${snakeCaseKey} = ?`);
        values.push(value);
      });

      if (fields.length === 0) {
        return this.getMembershipById(id);
      }

      values.push(id);
      const query = `UPDATE student_technical_body_memberships SET ${fields.join(', ')} WHERE id = ?`;

      await connection.execute(query, values);
      return this.getMembershipById(id);
    } catch (error) {
      logger.error('Error updating technical body membership:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Delete a membership record
   */
  async deleteMembership(id: number): Promise<boolean> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const [result] = await connection.execute(
        'DELETE FROM student_technical_body_memberships WHERE id = ?',
        [id]
      );

      const affectedRows = (result as any).affectedRows;
      logger.info(`Technical body membership deleted: ${id}`);
      return affectedRows > 0;
    } catch (error) {
      logger.error('Error deleting technical body membership:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get a technical body membership record by ID with student email for notifications
   */
  async getMembershipByIdWithEmail(id: number): Promise<any> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const query = `
        SELECT stbm.*, s.college_email as student_email
        FROM student_technical_body_memberships stbm
        LEFT JOIN students s ON stbm.student_id = s.roll_no
        WHERE stbm.id = ?
      `;
      const [rows] = await connection.execute(query, [id]);
      const results = rows as any[];
      
      if (results.length > 0) {
        const record = convertToCamelCase(results[0]);
        return record;
      }
      return null;
    } catch (error) {
      logger.error('Error fetching technical body membership with email:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default new StudentTechnicalBodyMembershipService();
