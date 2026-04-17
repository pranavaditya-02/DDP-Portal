import getMysqlPool from '../database/mysql';
export class EventCodeExistsError extends Error {
    constructor(eventCode) {
        super(`Event code '${eventCode}' already exists`);
        this.name = 'EventCodeExistsError';
    }
}
const quoteIdentifier = (identifier) => {
    const trimmed = identifier.trim();
    if (!trimmed) {
        throw new Error('Empty SQL identifier provided');
    }
    if (!/^[A-Za-z0-9_-]+$/.test(trimmed)) {
        throw new Error(`Unsafe SQL identifier: ${identifier}`);
    }
    return `\`${trimmed}\``;
};
const eventMasterTableRef = `${quoteIdentifier(process.env.MYSQL_DATABASE || 'ddp')}.${quoteIdentifier(process.env.MYSQL_Activity_Master_TABLE || 'Activity_Master')}`;
const mapRow = (row) => ({
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
    imgLink: row.img_link,
    createdDate: row.created_date,
    updatedDate: row.updated_date,
});
class EventMasterService {
    async getAllEvents(sort = 'desc') {
        const sortDirection = sort === 'asc' ? 'ASC' : 'DESC';
        const [rows] = await getMysqlPool().query(`SELECT
        id,
        maximum_count,
        applied_count,
        (maximum_count - applied_count) AS balance_count,
        apply_by_student,
        event_code,
        event_name,
        event_organizer,
        web_link,
        event_category,
        active_status AS status,
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
        img_link,
        created_date,
        updated_date
      FROM ${eventMasterTableRef}
      ORDER BY start_date IS NULL ASC, start_date ${sortDirection}, updated_date DESC`);
        return rows.map(mapRow);
    }
    async createEvent(input) {
        const [existingRows] = await getMysqlPool().query(`SELECT id FROM ${eventMasterTableRef} WHERE event_code = ? LIMIT 1`, [input.eventCode]);
        if (existingRows.length > 0) {
            throw new EventCodeExistsError(input.eventCode);
        }
        const columns = [
            'maximum_count',
            'applied_count',
            'apply_by_student',
            'event_code',
            'event_name',
            'event_organizer',
            'web_link',
            'event_category',
            'active_status',
            'start_date',
            'end_date',
            'duration_days',
            'event_location',
            'event_level',
            'state',
            'country',
            'within_bit',
            'related_to_special_lab',
            'department',
            'competition_name',
            'total_level_of_competition',
            'eligible_for_rewards',
            'winner_rewards',
            'img_link',
        ];
        const values = [
            input.maximumCount,
            input.appliedCount,
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
            input.imgLink ?? null,
        ];
        const placeholders = columns.map(() => '?').join(', ');
        const sql = `INSERT INTO ${eventMasterTableRef} (${columns.join(', ')}) VALUES (${placeholders})`;
        const [result] = await getMysqlPool().execute(sql, values);
        const [rows] = await getMysqlPool().query(`SELECT
        id,
        maximum_count,
        applied_count,
        (maximum_count - applied_count) AS balance_count,
        apply_by_student,
        event_code,
        event_name,
        event_organizer,
        web_link,
        event_category,
        active_status AS status,
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
        img_link,
        created_date,
        updated_date
      FROM ${eventMasterTableRef}
      WHERE id = ?
      LIMIT 1`, [Number(result.insertId)]);
        return mapRow(rows[0]);
    }
}
export default new EventMasterService();
