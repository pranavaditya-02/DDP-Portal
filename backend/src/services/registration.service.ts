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
  async registerForEvent(input: CreateRegistrationInput): Promise<RegistrationRecord> {
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
          balance_count,
          active_status
        FROM event_master
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
          FROM event_registrations
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
        `INSERT INTO event_registrations (
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
        `UPDATE event_master
        SET
          applied_count = applied_count + 1,
          balance_count = CASE WHEN balance_count > 0 THEN balance_count - 1 ELSE 0 END
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
      FROM event_registrations er
      INNER JOIN event_master em ON em.id = er.event_id
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
      FROM event_registrations er
      INNER JOIN event_master em ON em.id = er.event_id
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
    const [updateResult] = await getMysqlPool().execute<ResultSetHeader>(
      `UPDATE event_registrations
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
      const existing = await this.getRegistrationById(registrationId);
      if (!existing) {
        throw new RegistrationNotFoundError(registrationId);
      }
      return existing;
    }

    const updated = await this.getRegistrationById(registrationId);
    if (!updated) {
      throw new RegistrationNotFoundError(registrationId);
    }
    return updated;
  }

  async rejectRegistration(registrationId: number, verifiedBy: number, reason: string): Promise<RegistrationRecord> {
    const connection = await getMysqlPool().getConnection();

    try {
      await connection.beginTransaction();

      const [rows] = await connection.query<Array<RowDataPacket & { event_id: number; status: string }>>(
        `SELECT event_id, status FROM event_registrations WHERE id = ? LIMIT 1 FOR UPDATE`,
        [registrationId],
      );

      const existing = rows[0];
      if (!existing) {
        throw new RegistrationNotFoundError(registrationId);
      }

      const wasPending = existing.status === 'pending';

      await connection.execute<ResultSetHeader>(
        `UPDATE event_registrations
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
          `UPDATE event_master
          SET
            applied_count = CASE WHEN applied_count > 0 THEN applied_count - 1 ELSE 0 END,
            balance_count = CASE
              WHEN balance_count < maximum_count THEN balance_count + 1
              ELSE maximum_count
            END
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
}

export default new RegistrationService();
