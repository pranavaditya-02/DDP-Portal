import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import getMysqlPool from '../database/mysql';

interface EventMasterCounterRow extends RowDataPacket {
  id: number;
  event_name: string;
  event_code: string;
  maximum_count: number;
  applied_count: number;
  balance_count: number;
  active_status: string;
}

interface RegistrationRow extends RowDataPacket {
  id: number;
  event_id: number;
  student_id: number | null;
  student_name: string;
  student_email: string | null;
  student_department: string | null;
  event_category: string | null;
  activity_event: string | null;
  from_date: string | null;
  to_date: string | null;
  mode_of_participation: string | null;
  iqac_verification: string;
  status: string;
  rejection_reason: string | null;
  verified_by: number | null;
  verified_at: string | null;
  created_date: string;
  updated_date: string;
  event_name: string;
  event_code: string;
  event_organizer: string | null;
  event_level: string | null;
}

export interface CreateRegistrationInput {
  eventId: number;
  studentId?: number | null;
  studentName: string;
  studentEmail?: string | null;
  studentDepartment?: string | null;
  eventCategory?: string | null;
  activityEvent?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
  modeOfParticipation?: string | null;
  iqacVerification?: string | null;
}

export interface RegistrationRecord {
  id: number;
  eventId: number;
  studentId: number | null;
  studentName: string;
  studentEmail: string | null;
  studentDepartment: string | null;
  eventCategory: string | null;
  activityEvent: string | null;
  fromDate: string | null;
  toDate: string | null;
  modeOfParticipation: string | null;
  iqacVerification: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason: string | null;
  verifiedBy: number | null;
  verifiedAt: string | null;
  createdDate: string;
  updatedDate: string;
  eventName: string;
  eventCode: string;
  eventOrganizer: string | null;
  eventLevel: string | null;
}

export class EventNotFoundError extends Error {
  constructor(eventId: number) {
    super(`Event ${eventId} not found`);
    this.name = 'EventNotFoundError';
  }
}

export class EventNotOpenError extends Error {
  constructor(eventCode: string) {
    super(`Event '${eventCode}' is not active for registrations`);
    this.name = 'EventNotOpenError';
  }
}

export class EventCapacityExceededError extends Error {
  constructor(eventCode: string) {
    super(`No seats left for event '${eventCode}'`);
    this.name = 'EventCapacityExceededError';
  }
}

export class DuplicateRegistrationError extends Error {
  constructor() {
    super('This student has already registered for this event');
    this.name = 'DuplicateRegistrationError';
  }
}

export class RegistrationNotFoundError extends Error {
  constructor(id: number) {
    super(`Registration ${id} not found`);
    this.name = 'RegistrationNotFoundError';
  }
}

const mapRow = (row: RegistrationRow): RegistrationRecord => ({
  id: Number(row.id),
  eventId: Number(row.event_id),
  studentId: row.student_id === null ? null : Number(row.student_id),
  studentName: row.student_name,
  studentEmail: row.student_email,
  studentDepartment: row.student_department,
  eventCategory: row.event_category,
  activityEvent: row.activity_event,
  fromDate: row.from_date,
  toDate: row.to_date,
  modeOfParticipation: row.mode_of_participation,
  iqacVerification: row.iqac_verification,
  status: row.status as RegistrationRecord['status'],
  rejectionReason: row.rejection_reason,
  verifiedBy: row.verified_by === null ? null : Number(row.verified_by),
  verifiedAt: row.verified_at,
  createdDate: row.created_date,
  updatedDate: row.updated_date,
  eventName: row.event_name,
  eventCode: row.event_code,
  eventOrganizer: row.event_organizer,
  eventLevel: row.event_level,
});

class RegistrationService {
  private async ensureRegistrationLoggerTable(): Promise<void> {
    const pool = getMysqlPool();

    await pool.query(
      `CREATE TABLE IF NOT EXISTS Activity_logger (
        id INT AUTO_INCREMENT PRIMARY KEY,
        registration_id INT NULL,
        event_id INT NOT NULL,
        student_id INT NULL,
        student_name VARCHAR(255) NOT NULL,
        student_email VARCHAR(255) NULL,
        student_department VARCHAR(255) NULL,
        event_category VARCHAR(255) NULL,
        activity_event VARCHAR(255) NULL,
        from_date DATE NULL,
        to_date DATE NULL,
        mode_of_participation VARCHAR(255) NULL,
        iqac_verification VARCHAR(255) NOT NULL DEFAULT 'Initiated',
        status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
        rejection_reason VARCHAR(255) NULL,
        verified_by INT NULL,
        verified_at DATETIME NULL,
        approved_by INT NULL,
        approved_at DATETIME NULL,
        created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_activity_logger_registration_id (registration_id)
      )`,
    );

    const [columnRows] = await pool.query<Array<RowDataPacket & { COLUMN_NAME: string; IS_NULLABLE: string }>>(
      `SELECT COLUMN_NAME, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'Activity_logger'`,
    );

    const columns = new Map(columnRows.map((row) => [row.COLUMN_NAME, row.IS_NULLABLE]));
    const alterStatements: string[] = [];

    if (!columns.has('event_category')) {
      alterStatements.push(`ADD COLUMN event_category VARCHAR(255) NULL`);
    }

    if (!columns.has('activity_event')) {
      alterStatements.push(`ADD COLUMN activity_event VARCHAR(255) NULL`);
    }

    if (!columns.has('from_date')) {
      alterStatements.push(`ADD COLUMN from_date DATE NULL`);
    }

    if (!columns.has('to_date')) {
      alterStatements.push(`ADD COLUMN to_date DATE NULL`);
    }

    if (!columns.has('mode_of_participation')) {
      alterStatements.push(`ADD COLUMN mode_of_participation VARCHAR(255) NULL`);
    }

    if (!columns.has('iqac_verification')) {
      alterStatements.push(`ADD COLUMN iqac_verification VARCHAR(255) NOT NULL DEFAULT 'Initiated'`);
    }

    if (!columns.has('status')) {
      alterStatements.push(`ADD COLUMN status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending'`);
    }

    if (!columns.has('verified_by')) {
      alterStatements.push(`ADD COLUMN verified_by INT NULL`);
    }

    if (!columns.has('verified_at')) {
      alterStatements.push(`ADD COLUMN verified_at DATETIME NULL`);
    }

    if (!columns.has('approved_by')) {
      alterStatements.push(`ADD COLUMN approved_by INT NULL`);
    }

    if (!columns.has('approved_at')) {
      alterStatements.push(`ADD COLUMN approved_at DATETIME NULL`);
    }

    if (!columns.has('created_date')) {
      alterStatements.push(`ADD COLUMN created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
    }

    if (!columns.has('updated_date')) {
      alterStatements.push(`ADD COLUMN updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
    }

    if (columns.get('registration_id') === 'NO') {
      alterStatements.push(`MODIFY COLUMN registration_id INT NULL`);
    }

    if (alterStatements.length > 0) {
      await pool.query(`ALTER TABLE Activity_logger ${alterStatements.join(', ')}`);
    }
  }

  async registerForEvent(input: CreateRegistrationInput): Promise<RegistrationRecord> {
    await this.ensureRegistrationLoggerTable();

    const connection = await getMysqlPool().getConnection();

    try {
      await connection.beginTransaction();

      const [eventRows] = await connection.query<EventMasterCounterRow[]>(
        `SELECT
          id,
          event_name,
          event_code,
          maximum_count,
          applied_count,
          (maximum_count - applied_count) AS balance_count,
          active_status
        FROM Activity_Master
        WHERE id = ?
        LIMIT 1
        FOR UPDATE`,
        [input.eventId],
      );

      const event = eventRows[0];
      if (!event) {
        throw new EventNotFoundError(input.eventId);
      }

      if ((event.active_status || '').trim().toLowerCase() !== 'active') {
        throw new EventNotOpenError(event.event_code);
      }

      if (Number(event.balance_count ?? 0) <= 0) {
        throw new EventCapacityExceededError(event.event_code);
      }

      if (input.studentId) {
        const [duplicateRows] = await connection.query<Array<RowDataPacket & { id: number }>>(
          `SELECT id
          FROM Activity_logger
          WHERE event_id = ?
            AND student_id = ?
            AND status IN ('pending', 'approved')
          LIMIT 1`,
          [input.eventId, input.studentId],
        );

        if (duplicateRows.length > 0) {
          throw new DuplicateRegistrationError();
        }
      }

      const [insertResult] = await connection.execute<ResultSetHeader>(
        `INSERT INTO Activity_logger (
          event_id,
          student_id,
          student_name,
          student_email,
          student_department,
          event_category,
          activity_event,
          from_date,
          to_date,
          mode_of_participation,
          iqac_verification,
          status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [
          input.eventId,
          input.studentId ?? null,
          input.studentName,
          input.studentEmail ?? null,
          input.studentDepartment ?? null,
          input.eventCategory ?? null,
          input.activityEvent ?? null,
          input.fromDate ?? null,
          input.toDate ?? null,
          input.modeOfParticipation ?? null,
          input.iqacVerification ?? 'Initiated',
        ],
      );

      await connection.execute<ResultSetHeader>(
        `UPDATE Activity_Master
        SET
          applied_count = applied_count + 1
        WHERE id = ?`,
        [input.eventId],
      );

      await connection.commit();

      const created = await this.getRegistrationById(Number(insertResult.insertId));
      if (!created) {
        throw new RegistrationNotFoundError(Number(insertResult.insertId));
      }

      return created;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getRegistrationById(id: number): Promise<RegistrationRecord | null> {
    await this.ensureRegistrationLoggerTable();

    const [rows] = await getMysqlPool().query<RegistrationRow[]>(
      `SELECT
        er.id,
        er.event_id,
        er.student_id,
        er.student_name,
        er.student_email,
        er.student_department,
        er.event_category,
        er.activity_event,
        er.from_date,
        er.to_date,
        er.mode_of_participation,
        er.iqac_verification,
        er.status,
        er.rejection_reason,
        er.verified_by,
        er.verified_at,
        er.created_date,
        er.updated_date,
        em.event_name,
        em.event_code,
        em.event_organizer,
        em.event_level
      FROM Activity_logger er
      INNER JOIN Activity_Master em ON em.id = er.event_id
      WHERE er.id = ?
      LIMIT 1`,
      [id],
    );

    if (rows.length === 0) {
      return null;
    }

    return mapRow(rows[0]);
  }

  async listRegistrations(status?: 'pending' | 'approved' | 'rejected'): Promise<RegistrationRecord[]> {
    await this.ensureRegistrationLoggerTable();

    const where = status ? 'WHERE er.status = ?' : '';
    const params = status ? [status] : [];

    const [rows] = await getMysqlPool().query<RegistrationRow[]>(
      `SELECT
        er.id,
        er.event_id,
        er.student_id,
        er.student_name,
        er.student_email,
        er.student_department,
        er.event_category,
        er.activity_event,
        er.from_date,
        er.to_date,
        er.mode_of_participation,
        er.iqac_verification,
        er.status,
        er.rejection_reason,
        er.verified_by,
        er.verified_at,
        er.created_date,
        er.updated_date,
        em.event_name,
        em.event_code,
        em.event_organizer,
        em.event_level
      FROM Activity_logger er
      INNER JOIN Activity_Master em ON em.id = er.event_id
      ${where}
      ORDER BY
        CASE er.status
          WHEN 'pending' THEN 0
          WHEN 'approved' THEN 1
          ELSE 2
        END ASC,
        er.created_date DESC`,
      params,
    );

    return rows.map(mapRow);
  }

  async approveRegistration(registrationId: number, verifiedBy: number): Promise<RegistrationRecord> {
    await this.ensureRegistrationLoggerTable();

    const connection = await getMysqlPool().getConnection();

    try {
      await connection.beginTransaction();

      const [updateResult] = await connection.execute<ResultSetHeader>(
        `UPDATE Activity_logger
        SET
          status = 'approved',
          iqac_verification = 'Approved',
          rejection_reason = NULL,
          verified_by = ?,
          verified_at = NOW()
        WHERE id = ?
          AND status = 'pending'`,
        [verifiedBy, registrationId],
      );

      if (updateResult.affectedRows === 0) {
        await connection.rollback();
        const existing = await this.getRegistrationById(registrationId);
        if (!existing) {
          throw new RegistrationNotFoundError(registrationId);
        }
        return existing;
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    const updated = await this.getRegistrationById(registrationId);
    if (!updated) {
      throw new RegistrationNotFoundError(registrationId);
    }
    return updated;
  }

  async rejectRegistration(registrationId: number, verifiedBy: number, reason: string): Promise<RegistrationRecord> {
    await this.ensureRegistrationLoggerTable();

    const connection = await getMysqlPool().getConnection();

    try {
      await connection.beginTransaction();

      const [rows] = await connection.query<Array<RowDataPacket & { event_id: number; status: string }>>(
        `SELECT event_id, status FROM Activity_logger WHERE id = ? LIMIT 1 FOR UPDATE`,
        [registrationId],
      );

      const existing = rows[0];
      if (!existing) {
        throw new RegistrationNotFoundError(registrationId);
      }

      const wasPending = existing.status === 'pending';

      await connection.execute<ResultSetHeader>(
        `UPDATE Activity_logger
        SET
          status = 'rejected',
          iqac_verification = 'Rejected',
          rejection_reason = ?,
          verified_by = ?,
          verified_at = NOW()
        WHERE id = ?`,
        [reason, verifiedBy, registrationId],
      );

      if (wasPending) {
        await connection.execute<ResultSetHeader>(
          `UPDATE Activity_Master
          SET
            applied_count = CASE WHEN applied_count > 0 THEN applied_count - 1 ELSE 0 END
          WHERE id = ?`,
          [existing.event_id],
        );
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    const updated = await this.getRegistrationById(registrationId);
    if (!updated) {
      throw new RegistrationNotFoundError(registrationId);
    }
    return updated;
  }

  async getRegistrationsByEventId(eventId: number, status?: 'pending' | 'approved' | 'rejected'): Promise<RegistrationRecord[]> {
    await this.ensureRegistrationLoggerTable();

    const where = status ? 'WHERE er.event_id = ? AND er.status = ?' : 'WHERE er.event_id = ?';
    const params = status ? [eventId, status] : [eventId];

    const [rows] = await getMysqlPool().query<RegistrationRow[]>(
      `SELECT
        er.id,
        er.event_id,
        er.student_id,
        er.student_name,
        er.student_email,
        er.student_department,
        er.event_category,
        er.activity_event,
        er.from_date,
        er.to_date,
        er.mode_of_participation,
        er.iqac_verification,
        er.status,
        er.rejection_reason,
        er.verified_by,
        er.verified_at,
        er.created_date,
        er.updated_date,
        em.event_name,
        em.event_code,
        em.event_organizer,
        em.event_level
      FROM Activity_logger er
      INNER JOIN Activity_Master em ON em.id = er.event_id
      ${where}
      ORDER BY
        CASE er.status
          WHEN 'pending' THEN 0
          WHEN 'approved' THEN 1
          ELSE 2
        END ASC,
        er.created_date DESC`,
      params,
    );

    return rows.map(mapRow);
  }

  async getRegistrationsByStudentId(studentId: number, status?: 'pending' | 'approved' | 'rejected'): Promise<RegistrationRecord[]> {
    await this.ensureRegistrationLoggerTable();

    const where = status ? 'WHERE er.student_id = ? AND er.status = ?' : 'WHERE er.student_id = ?';
    const params = status ? [studentId, status] : [studentId];

    const [rows] = await getMysqlPool().query<RegistrationRow[]>(
      `SELECT
        er.id,
        er.event_id,
        er.student_id,
        er.student_name,
        er.student_email,
        er.student_department,
        er.event_category,
        er.activity_event,
        er.from_date,
        er.to_date,
        er.mode_of_participation,
        er.iqac_verification,
        er.status,
        er.rejection_reason,
        er.verified_by,
        er.verified_at,
        er.created_date,
        er.updated_date,
        em.event_name,
        em.event_code,
        em.event_organizer,
        em.event_level
      FROM Activity_logger er
      INNER JOIN Activity_Master em ON em.id = er.event_id
      ${where}
      ORDER BY er.created_date DESC`,
      params,
    );

    return rows.map(mapRow);
  }
}

export default new RegistrationService();
