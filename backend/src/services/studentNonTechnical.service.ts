import { getMysqlPool } from '../database/mysql';
import { logger } from '../utils/logger';

export interface StudentNonTechnicalData {
  studentId: string;
  studentName: string;
  yearOfStudy: 'first' | 'second' | 'third' | 'fourth';
  eventAttended: 'club' | 'ncc_nss_yrc' | 'sports' | 'others';
  clubId?: number;
  clubEvents?: string;
  otherEventSpecify?: string;
  eventStartDate: string;
  eventEndDate: string;
  eventDuration: number;
  eventLocation: string;
  eventOrganiser: 'BIT' | 'industry' | 'foreign_institute' | 'other';
  organisorNameOther?: string;
  eventLevel: 'international' | 'national' | 'district' | 'regional' | 'zonal';
  country?: string;
  state?: string;
  withinBIT: 'yes' | 'no';
  homeDepartment?: 'yes' | 'no';
  roleInEvent: 'organised' | 'participated';
  roleSpecifyOrganised?: string;
  roleSpecifyParticipated?: string;
  status: 'winner' | 'runner' | 'participated';
  prizeType?: 'cash' | 'momento';
  prizeAmount?: number;
  socialActivityInvolved: 'yes' | 'no';
  socialActivityName?: string;
  timeSpentHours: number;
  interdisciplinary: 'yes' | 'no';
  interdisciplinaryDept?: number;
  otherDeptStudentCount?: number;
  certificateProofPath?: string;
  iqacVerification?: 'initiated' | 'processing' | 'completed';
  createdBy?: string;
}

function convertToCamelCase(row: any): any {
  return {
    id: row.id,
    studentId: row.student_id,
    studentName: row.student_name,
    yearOfStudy: row.year_of_study,
    eventAttended: row.event_attended,
    clubId: row.club_id,
    clubEvents: row.club_events,
    otherEventSpecify: row.other_event_specify,
    eventStartDate: row.event_start_date,
    eventEndDate: row.event_end_date,
    eventDuration: row.event_duration,
    eventLocation: row.event_location,
    eventOrganiser: row.event_organiser,
    organisorNameOther: row.organisor_name_other,
    eventLevel: row.event_level,
    country: row.country,
    state: row.state,
    withinBIT: row.within_bit,
    homeDepartment: row.home_department,
    roleInEvent: row.role_in_event,
    roleSpecifyOrganised: row.role_specify_organised,
    roleSpecifyParticipated: row.role_specify_participated,
    status: row.status,
    prizeType: row.prize_type,
    prizeAmount: row.prize_amount,
    socialActivityInvolved: row.social_activity_involved,
    socialActivityName: row.social_activity_name,
    timeSpentHours: row.time_spent_hours,
    interdisciplinary: row.interdisciplinary,
    interdisciplinaryDept: row.interdisciplinary_dept,
    otherDeptStudentCount: row.other_dept_student_count,
    certificateProofPath: row.certificate_proof_path,
    iqacVerification: row.iqac_verification,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

class StudentNonTechnicalService {
  /**
   * Create a new non-technical event record
   */
  async createRecord(data: StudentNonTechnicalData): Promise<any> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const query = `
        INSERT INTO student_non_technical (
          student_id, student_name, year_of_study, event_attended, club_id, club_events,
          other_event_specify, event_start_date, event_end_date, event_duration, event_location,
          event_organiser, organisor_name_other, event_level, country, state, within_bit,
          home_department, role_in_event, role_specify_organised, role_specify_participated,
          status, prize_type, prize_amount, social_activity_involved, social_activity_name,
          time_spent_hours, interdisciplinary, interdisciplinary_dept, other_dept_student_count,
          certificate_proof_path, iqac_verification, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await connection.execute(query, [
        data.studentId,
        data.studentName,
        data.yearOfStudy,
        data.eventAttended,
        data.clubId || null,
        data.clubEvents || null,
        data.otherEventSpecify || null,
        data.eventStartDate,
        data.eventEndDate,
        data.eventDuration,
        data.eventLocation,
        data.eventOrganiser,
        data.organisorNameOther || null,
        data.eventLevel,
        data.country || null,
        data.state || null,
        data.withinBIT,
        data.homeDepartment || null,
        data.roleInEvent,
        data.roleSpecifyOrganised || null,
        data.roleSpecifyParticipated || null,
        data.status,
        data.prizeType || null,
        data.prizeAmount || null,
        data.socialActivityInvolved,
        data.socialActivityName || null,
        data.timeSpentHours,
        data.interdisciplinary,
        data.interdisciplinaryDept || null,
        data.otherDeptStudentCount || null,
        data.certificateProofPath || null,
        data.iqacVerification || 'initiated',
        data.createdBy || null,
      ]);

      logger.info(`Non-technical event record created with ID: ${(result as any).insertId}`);
      return { id: (result as any).insertId, ...data };
    } catch (error) {
      logger.error('Error creating non-technical event record:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get all non-technical event records with pagination
   */
  async getAllRecords(filters: any = {}, page: number = 1, limit: number = 20): Promise<any> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      let query = 'SELECT * FROM student_non_technical WHERE 1=1';
      const params: any[] = [];

      if (filters.studentId) {
        query += ' AND student_id LIKE ?';
        params.push(`%${filters.studentId}%`);
      }
      if (filters.status) {
        query += ' AND status = ?';
        params.push(filters.status);
      }
      if (filters.iqacVerification) {
        query += ' AND iqac_verification = ?';
        params.push(filters.iqacVerification);
      }

      // Count total records
      const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
      const [[{ count }]] = await connection.execute(countQuery, params);

      // Fetch paginated records
      const offset = (page - 1) * limit;
      query += ` ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;

      const [rows] = await connection.execute(query, params);

      const records = (rows as any[]).map(convertToCamelCase);

      return {
        records,
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      };
    } catch (error) {
      logger.error('Error fetching non-technical event records:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get a specific non-technical event record by ID
   */
  async getRecordById(id: number): Promise<any> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const query = 'SELECT * FROM student_non_technical WHERE id = ?';
      const [rows] = await connection.execute(query, [id]);

      if ((rows as any[]).length === 0) {
        return null;
      }

      return convertToCamelCase((rows as any[])[0]);
    } catch (error) {
      logger.error('Error fetching non-technical event record:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update a non-technical event record
   */
  async updateRecord(id: number, updates: Partial<StudentNonTechnicalData>): Promise<any> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const fields: string[] = [];
      const params: any[] = [];

      const fieldMapping: Record<string, string> = {
        yearOfStudy: 'year_of_study',
        eventAttended: 'event_attended',
        clubId: 'club_id',
        clubEvents: 'club_events',
        otherEventSpecify: 'other_event_specify',
        eventStartDate: 'event_start_date',
        eventEndDate: 'event_end_date',
        eventDuration: 'event_duration',
        eventLocation: 'event_location',
        eventOrganiser: 'event_organiser',
        organisorNameOther: 'organisor_name_other',
        eventLevel: 'event_level',
        withinBIT: 'within_bit',
        homeDepartment: 'home_department',
        roleInEvent: 'role_in_event',
        roleSpecifyOrganised: 'role_specify_organised',
        roleSpecifyParticipated: 'role_specify_participated',
        prizeType: 'prize_type',
        prizeAmount: 'prize_amount',
        socialActivityInvolved: 'social_activity_involved',
        socialActivityName: 'social_activity_name',
        timeSpentHours: 'time_spent_hours',
        interdisciplinary: 'interdisciplinary',
        interdisciplinaryDept: 'interdisciplinary_dept',
        otherDeptStudentCount: 'other_dept_student_count',
        iqacVerification: 'iqac_verification',
      };

      Object.keys(updates).forEach((key) => {
        const dbColumn = fieldMapping[key] || key;
        if (dbColumn !== 'studentId' && dbColumn !== 'studentName') {
          fields.push(`${dbColumn} = ?`);
          params.push((updates as any)[key]);
        }
      });

      if (fields.length === 0) {
        return this.getRecordById(id);
      }

      params.push(id);
      const query = `UPDATE student_non_technical SET ${fields.join(', ')} WHERE id = ?`;

      await connection.execute(query, params);

      logger.info(`Non-technical event record ${id} updated`);
      return this.getRecordById(id);
    } catch (error) {
      logger.error('Error updating non-technical event record:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Delete a non-technical event record
   */
  async deleteRecord(id: number): Promise<boolean> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const query = 'DELETE FROM student_non_technical WHERE id = ?';
      const [result] = await connection.execute(query, [id]);

      const deleted = (result as any).affectedRows > 0;
      if (deleted) {
        logger.info(`Non-technical event record ${id} deleted`);
      }
      return deleted;
    } catch (error) {
      logger.error('Error deleting non-technical event record:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update IQAC verification status
   */
  async updateIqacStatus(id: number, status: string): Promise<any> {
    return this.updateRecord(id, { iqacVerification: status as any });
  }
}

export default new StudentNonTechnicalService();
