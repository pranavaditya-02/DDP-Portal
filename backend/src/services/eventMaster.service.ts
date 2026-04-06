import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import getMysqlPool from '../database/mysql';

export interface EventMasterRecord {
  id: number;
  maximumCount: number;
  appliedCount: number;
  balanceCount: number;
  applyByStudent: boolean;
  eventCode: string;
  eventName: string;
  eventOrganizer: string | null;
  webLink: string | null;
  eventCategory: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  durationDays: number | null;
  eventLocation: string | null;
  eventLevel: string | null;
  state: string | null;
  country: string | null;
  withinBit: boolean;
  relatedToSpecialLab: boolean;
  department: string | null;
  competitionName: string | null;
  totalLevelOfCompetition: string | null;
  eligibleForRewards: boolean;
  winnerRewards: string | null;
  createdDate: string;
  updatedDate: string;
}

interface EventMasterRow extends RowDataPacket {
  id: number;
  maximum_count: number;
  applied_count: number;
  balance_count: number;
  apply_by_student: number;
  event_code: string;
  event_name: string;
  event_organizer: string | null;
  web_link: string | null;
  event_category: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  duration_days: number | null;
  event_location: string | null;
  event_level: string | null;
  state: string | null;
  country: string | null;
  within_bit: number;
  related_to_special_lab: number;
  department: string | null;
  competition_name: string | null;
  total_level_of_competition: string | null;
  eligible_for_rewards: number;
  winner_rewards: string | null;
  created_date: string;
  updated_date: string;
}

export interface CreateEventMasterInput {
  maximumCount: number;
  appliedCount: number;
  balanceCount: number;
  applyByStudent: boolean;
  eventCode: string;
  eventName: string;
  eventOrganizer?: string | null;
  webLink?: string | null;
  eventCategory?: string | null;
  status: string;
  startDate?: string | null;
  endDate?: string | null;
  durationDays?: number | null;
  eventLocation?: string | null;
  eventLevel?: string | null;
  state?: string | null;
  country?: string | null;
  withinBit: boolean;
  relatedToSpecialLab: boolean;
  department?: string | null;
  competitionName?: string | null;
  totalLevelOfCompetition?: string | null;
  eligibleForRewards: boolean;
  winnerRewards?: string | null;
}

const mapRow = (row: EventMasterRow): EventMasterRecord => ({
  id: Number(row.id),
  maximumCount: Number(row.maximum_count ?? 0),
  appliedCount: Number(row.applied_count ?? 0),
  balanceCount: Number(row.balance_count ?? 0),
  applyByStudent: Number(row.apply_by_student ?? 0) === 1,
  eventCode: row.event_code,
  eventName: row.event_name,
  eventOrganizer: row.event_organizer,
  webLink: row.web_link,
  eventCategory: row.event_category,
  status: row.status,
  startDate: row.start_date,
  endDate: row.end_date,
  durationDays: row.duration_days,
  eventLocation: row.event_location,
  eventLevel: row.event_level,
  state: row.state,
  country: row.country,
  withinBit: Number(row.within_bit ?? 0) === 1,
  relatedToSpecialLab: Number(row.related_to_special_lab ?? 0) === 1,
  department: row.department,
  competitionName: row.competition_name,
  totalLevelOfCompetition: row.total_level_of_competition,
  eligibleForRewards: Number(row.eligible_for_rewards ?? 0) === 1,
  winnerRewards: row.winner_rewards,
  createdDate: row.created_date,
  updatedDate: row.updated_date,
});

class EventMasterService {
  async getAllEvents(): Promise<EventMasterRecord[]> {
    const [rows] = await getMysqlPool().query<EventMasterRow[]>(
      `SELECT
        id,
        maximum_count,
        applied_count,
        balance_count,
        apply_by_student,
        event_code,
        event_name,
        event_organizer,
        web_link,
        event_category,
        status,
        start_date,
        end_date,
        duration_days,
        event_location,
        event_level,
        state,
        country,
        within_bit,
        related_to_special_lab,
        department,
        competition_name,
        total_level_of_competition,
        eligible_for_rewards,
        winner_rewards,
        created_date,
        updated_date
      FROM event_master
      ORDER BY created_date DESC`
    );

    return rows.map(mapRow);
  }

  async createEvent(input: CreateEventMasterInput): Promise<EventMasterRecord> {
    const [result] = await getMysqlPool().execute<ResultSetHeader>(
      `INSERT INTO event_master (
        maximum_count,
        applied_count,
        balance_count,
        apply_by_student,
        event_code,
        event_name,
        event_organizer,
        web_link,
        event_category,
        status,
        start_date,
        end_date,
        duration_days,
        event_location,
        event_level,
        state,
        country,
        within_bit,
        related_to_special_lab,
        department,
        competition_name,
        total_level_of_competition,
        eligible_for_rewards,
        winner_rewards
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.maximumCount,
        input.appliedCount,
        input.balanceCount,
        input.applyByStudent ? 1 : 0,
        input.eventCode,
        input.eventName,
        input.eventOrganizer ?? null,
        input.webLink ?? null,
        input.eventCategory ?? null,
        input.status,
        input.startDate ?? null,
        input.endDate ?? null,
        input.durationDays ?? null,
        input.eventLocation ?? null,
        input.eventLevel ?? null,
        input.state ?? null,
        input.country ?? null,
        input.withinBit ? 1 : 0,
        input.relatedToSpecialLab ? 1 : 0,
        input.department ?? null,
        input.competitionName ?? null,
        input.totalLevelOfCompetition ?? null,
        input.eligibleForRewards ? 1 : 0,
        input.winnerRewards ?? null,
      ]
    );

    const [rows] = await getMysqlPool().query<EventMasterRow[]>(
      `SELECT
        id,
        maximum_count,
        applied_count,
        balance_count,
        apply_by_student,
        event_code,
        event_name,
        event_organizer,
        web_link,
        event_category,
        status,
        start_date,
        end_date,
        duration_days,
        event_location,
        event_level,
        state,
        country,
        within_bit,
        related_to_special_lab,
        department,
        competition_name,
        total_level_of_competition,
        eligible_for_rewards,
        winner_rewards,
        created_date,
        updated_date
      FROM event_master
      WHERE id = ?
      LIMIT 1`,
      [Number(result.insertId)]
    );

    return mapRow(rows[0]);
  }
}

export default new EventMasterService();
