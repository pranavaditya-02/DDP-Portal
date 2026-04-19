import getMysqlPool from '../database/mysql';
const DEFAULT_ACADEMIC_YEAR = '2026-27';
const TARGETS = [
    { code: 'wos_sci_count', name: 'WoS/SCI Journal Publications', unit: 'count' },
    { code: 'scopus_count', name: 'Scopus Journal Publications', unit: 'count' },
    { code: 'paper_target_count', name: 'Paper Target Count', unit: 'count' },
    { code: 'patent_count', name: 'Patent Target', unit: 'count' },
    { code: 'funding_proposal_slot_count', name: 'Funding Proposal Slot Count', unit: 'count' },
    { code: 'consultancy_lakh', name: 'Industrial Consultancy', unit: 'lakhs' },
    { code: 'research_funding_lakh', name: 'Research Funding', unit: 'lakhs' },
    { code: 'nptel_course_count', name: 'NPTEL Courses', unit: 'count' },
    { code: 'fdp_sttp_count', name: 'FDP/STTP Attendance', unit: 'count' },
];
const normalizeDesignationName = (value) => value.trim().toUpperCase();
const buildTaskId = (baseId, slotNo) => (slotNo <= 1 ? baseId : `${baseId}__t${slotNo}`);
const DEFAULT_WORKFLOW_DEADLINE_MAP = {
    'paper-title-finalization': '2026-06-01',
    'paper-abstract-preparation': '2026-06-15',
    'paper-first-draft-preparation': '2026-06-29',
    'paper-revised-draft-preparation': '2026-07-13',
    'paper-manuscript-submission': '2026-07-20',
    'paper-title-finalization__t2': '2026-07-22',
    'paper-abstract-preparation__t2': '2026-08-03',
    'paper-first-draft-preparation__t2': '2026-08-17',
    'paper-revised-draft-preparation__t2': '2026-08-31',
    'paper-manuscript-submission__t2': '2026-09-14',
    'paper-title-finalization__t3': '2026-09-16',
    'paper-abstract-preparation__t3': '2026-09-28',
    'paper-first-draft-preparation__t3': '2026-10-12',
    'paper-revised-draft-preparation__t3': '2026-10-26',
    'paper-manuscript-submission__t3': '2026-11-06',
    'paper-title-finalization__t4': '2026-11-09',
    'paper-abstract-preparation__t4': '2026-11-16',
    'paper-first-draft-preparation__t4': '2026-11-30',
    'paper-revised-draft-preparation__t4': '2026-12-14',
    'paper-manuscript-submission__t4': '2026-12-28',
    'proposal-title-finalization': '2026-06-01',
    'proposal-concept-presentation-rnd-approval': '2026-06-16',
    'proposal-initial-proposal-draft-preparation': '2026-07-11',
    'proposal-revised-proposal-draft-preparation': '2026-07-30',
    'proposal-final-proposal-submission': '',
    'proposal-title-finalization__t2': '2026-08-01',
    'proposal-concept-presentation-rnd-approval__t2': '2026-08-16',
    'proposal-initial-proposal-draft-preparation__t2': '2026-09-11',
    'proposal-revised-proposal-draft-preparation__t2': '2026-09-30',
    'proposal-final-proposal-submission__t2': '',
    'patent-title-finalization-with-bit-patent-office-approval': '2026-07-01',
    'patent-initial-patent-draft-preparation': '2026-07-25',
    'patent-revised-patent-draft-preparation': '2026-08-20',
    'patent-final-submission-of-patent-application': '2026-08-31',
};
const PAPER_TASKS = [
    { baseId: 'paper-title-finalization', title: 'Title Finalization' },
    { baseId: 'paper-abstract-preparation', title: 'Abstract Preparation' },
    { baseId: 'paper-first-draft-preparation', title: 'First Draft Preparation' },
    { baseId: 'paper-revised-draft-preparation', title: 'Revised Draft Preparation' },
    { baseId: 'paper-manuscript-submission', title: 'Manuscript Submission' },
];
const PROPOSAL_TASKS = [
    { baseId: 'proposal-title-finalization', title: 'Title Finalization' },
    { baseId: 'proposal-concept-presentation-rnd-approval', title: 'Concept Presentation & R&D Cell Approval' },
    { baseId: 'proposal-initial-proposal-draft-preparation', title: 'Initial Proposal Draft Preparation' },
    { baseId: 'proposal-revised-proposal-draft-preparation', title: 'Revised Proposal Draft Preparation' },
    { baseId: 'proposal-final-proposal-submission', title: 'Final Proposal Submission' },
];
const PATENT_TASKS = [
    { baseId: 'patent-title-finalization-with-bit-patent-office-approval', title: 'Title Finalization with BIT Patent Office Approval' },
    { baseId: 'patent-initial-patent-draft-preparation', title: 'Initial Patent Draft Preparation' },
    { baseId: 'patent-revised-patent-draft-preparation', title: 'Revised Patent Draft Preparation' },
    { baseId: 'patent-final-submission-of-patent-application', title: 'Final Submission of Patent Application' },
];
const getDefaultTargetsForDesignation = (designationName) => {
    const name = normalizeDesignationName(designationName);
    if (name === 'PROFESSOR' || name === 'SENIOR PROFESSOR' || name === 'ASSOCIATE PROFESSOR') {
        return {
            wos_sci_count: 1,
            scopus_count: 3,
            paper_target_count: 4,
            patent_count: 1,
            funding_proposal_slot_count: 2,
            consultancy_lakh: 2,
            research_funding_lakh: 5,
            nptel_course_count: 2,
            fdp_sttp_count: 1,
        };
    }
    if (name === 'ASSISTANT PROFESSOR LEVEL III') {
        return {
            wos_sci_count: 1,
            scopus_count: 1,
            paper_target_count: 2,
            patent_count: 1,
            funding_proposal_slot_count: 2,
            consultancy_lakh: 1,
            research_funding_lakh: 0,
            nptel_course_count: 2,
            fdp_sttp_count: 1,
        };
    }
    if (name === 'ASSISTANT PROFESSOR LEVEL II' ||
        name === 'ASSISTANT PROFESSOR LEVEL I' ||
        name === 'ASSISTANT PROFESSOR TRAINEE') {
        return {
            wos_sci_count: 0,
            scopus_count: 2,
            paper_target_count: 2,
            patent_count: 1,
            funding_proposal_slot_count: 2,
            consultancy_lakh: 1,
            research_funding_lakh: 0,
            nptel_course_count: 2,
            fdp_sttp_count: 1,
        };
    }
    return {
        wos_sci_count: 0,
        scopus_count: 0,
        paper_target_count: 0,
        patent_count: 0,
        funding_proposal_slot_count: 0,
        consultancy_lakh: 0,
        research_funding_lakh: 0,
        nptel_course_count: 2,
        fdp_sttp_count: 1,
    };
};
class WorkflowTargetsService {
    constructor() {
        this.bootstrapPromise = null;
    }
    async ensureSchema() {
        if (this.bootstrapPromise) {
            await this.bootstrapPromise;
            return;
        }
        this.bootstrapPromise = (async () => {
            const pool = getMysqlPool();
            await pool.query(`
        CREATE TABLE IF NOT EXISTS fap_target_master (
          id BIGINT NOT NULL AUTO_INCREMENT,
          target_code VARCHAR(60) NOT NULL,
          target_name VARCHAR(200) NOT NULL,
          unit VARCHAR(50) NOT NULL,
          is_active TINYINT(1) NOT NULL DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          UNIQUE KEY uk_fap_target_code (target_code)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin
      `);
            await pool.query(`
        CREATE TABLE IF NOT EXISTS fap_designation_target_rule (
          id BIGINT NOT NULL AUTO_INCREMENT,
          academic_year VARCHAR(20) NOT NULL,
          designation_id INT NOT NULL,
          target_id BIGINT NOT NULL,
          target_value DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          UNIQUE KEY uk_fap_rule (academic_year, designation_id, target_id),
          KEY idx_fap_rule_ay_desig (academic_year, designation_id),
          CONSTRAINT fk_fap_rule_designation FOREIGN KEY (designation_id) REFERENCES designation(id)
            ON DELETE RESTRICT ON UPDATE CASCADE,
          CONSTRAINT fk_fap_rule_target FOREIGN KEY (target_id) REFERENCES fap_target_master(id)
            ON DELETE RESTRICT ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin
      `);
            await pool.query(`
        CREATE TABLE IF NOT EXISTS faculty_fap_target_assignment (
          id BIGINT NOT NULL AUTO_INCREMENT,
          academic_year VARCHAR(20) NOT NULL,
          faculty_id VARCHAR(50) NOT NULL,
          designation_id INT NOT NULL,
          target_id BIGINT NOT NULL,
          assigned_value DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          assigned_on DATE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          UNIQUE KEY uk_faculty_target (academic_year, faculty_id, target_id),
          KEY idx_faculty_target_lookup (academic_year, faculty_id),
          CONSTRAINT fk_faculty_target_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(id)
            ON DELETE RESTRICT ON UPDATE CASCADE,
          CONSTRAINT fk_faculty_target_designation FOREIGN KEY (designation_id) REFERENCES designation(id)
            ON DELETE RESTRICT ON UPDATE CASCADE,
          CONSTRAINT fk_faculty_target_target FOREIGN KEY (target_id) REFERENCES fap_target_master(id)
            ON DELETE RESTRICT ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin
      `);
            await pool.query(`
        CREATE TABLE IF NOT EXISTS workflow_deadline_settings (
          academic_year VARCHAR(20) NOT NULL,
          settings_json JSON NOT NULL,
          updated_by INT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (academic_year),
          CONSTRAINT fk_workflow_deadline_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
            ON DELETE SET NULL ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin
      `);
            await pool.query(`
        CREATE TABLE IF NOT EXISTS faculty_workflow_task_status (
          id BIGINT NOT NULL AUTO_INCREMENT,
          academic_year VARCHAR(20) NOT NULL,
          faculty_id VARCHAR(50) NOT NULL,
          workflow_type ENUM('paper', 'patent', 'proposal') NOT NULL,
          slot_no TINYINT NOT NULL DEFAULT 1,
          task_code VARCHAR(120) NOT NULL,
          status ENUM('pending', 'completed') NOT NULL DEFAULT 'completed',
          payload_json JSON NULL,
          completed_at DATETIME NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          UNIQUE KEY uk_faculty_workflow_status (academic_year, faculty_id, workflow_type, slot_no, task_code),
          KEY idx_faculty_workflow_lookup (academic_year, faculty_id),
          CONSTRAINT fk_faculty_workflow_status_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(id)
            ON DELETE RESTRICT ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin
      `);
            for (const target of TARGETS) {
                await pool.query(`
            INSERT INTO fap_target_master (target_code, target_name, unit, is_active)
            VALUES (?, ?, ?, 1)
            ON DUPLICATE KEY UPDATE
              target_name = VALUES(target_name),
              unit = VALUES(unit),
              is_active = VALUES(is_active)
          `, [target.code, target.name, target.unit]);
            }
        })();
        await this.bootstrapPromise;
    }
    async getDeadlineSettings(academicYear) {
        await this.ensureSchema();
        const pool = getMysqlPool();
        const [rows] = await pool.query(`SELECT settings_json FROM workflow_deadline_settings WHERE academic_year = ? LIMIT 1`, [academicYear]);
        const stored = rows[0]?.settings_json;
        return {
            ...DEFAULT_WORKFLOW_DEADLINE_MAP,
            ...(stored || {}),
        };
    }
    async getDeadlineSettingsForAcademicYear(academicYear) {
        return this.getDeadlineSettings(academicYear);
    }
    async saveDeadlineSettings(input) {
        await this.ensureSchema();
        const pool = getMysqlPool();
        const merged = {
            ...DEFAULT_WORKFLOW_DEADLINE_MAP,
            ...(input.settings || {}),
        };
        await pool.query(`
        INSERT INTO workflow_deadline_settings (academic_year, settings_json, updated_by)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
          settings_json = VALUES(settings_json),
          updated_by = VALUES(updated_by)
      `, [input.academicYear, JSON.stringify(merged), input.updatedBy || null]);
        return merged;
    }
    async getTargetMasterMap() {
        const pool = getMysqlPool();
        const [rows] = await pool.query(`SELECT id, target_code FROM fap_target_master WHERE is_active = 1 ORDER BY id`);
        return new Map(rows.map((row) => [row.target_code, row.id]));
    }
    async seedDefaultsForAcademicYear(academicYear = DEFAULT_ACADEMIC_YEAR) {
        await this.ensureSchema();
        const pool = getMysqlPool();
        const [existing] = await pool.query(`SELECT id FROM fap_designation_target_rule WHERE academic_year = ? LIMIT 1`, [academicYear]);
        if (existing.length > 0) {
            return false;
        }
        const targetMap = await this.getTargetMasterMap();
        const [designations] = await pool.query(`SELECT id, designation_name FROM designation ORDER BY id`);
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            for (const designation of designations) {
                const defaults = getDefaultTargetsForDesignation(designation.designation_name);
                for (const [targetCode, targetId] of targetMap.entries()) {
                    await connection.query(`
              INSERT INTO fap_designation_target_rule (academic_year, designation_id, target_id, target_value)
              VALUES (?, ?, ?, ?)
              ON DUPLICATE KEY UPDATE target_value = VALUES(target_value)
            `, [academicYear, designation.id, targetId, defaults[targetCode] ?? 0]);
                }
            }
            await connection.commit();
            return true;
        }
        catch (error) {
            await connection.rollback();
            throw error;
        }
        finally {
            connection.release();
        }
    }
    async getDesignationRules(academicYear = DEFAULT_ACADEMIC_YEAR) {
        await this.ensureSchema();
        await this.seedDefaultsForAcademicYear(academicYear);
        const pool = getMysqlPool();
        const [ruleRows] = await pool.query(`
        SELECT
          d.id AS designation_id,
          d.designation_name,
          tm.target_code,
          r.target_value
        FROM designation d
        CROSS JOIN fap_target_master tm
        LEFT JOIN fap_designation_target_rule r
          ON r.designation_id = d.id
         AND r.target_id = tm.id
         AND r.academic_year = ?
        WHERE tm.is_active = 1
        ORDER BY d.id, tm.id
      `, [academicYear]);
        const [facultyCounts] = await pool.query(`
        SELECT designation_id, COUNT(*) AS faculty_count
        FROM faculty
        GROUP BY designation_id
      `);
        const facultyCountByDesignation = new Map(facultyCounts.map((row) => [row.designation_id, Number(row.faculty_count || 0)]));
        const grouped = new Map();
        for (const row of ruleRows) {
            const current = grouped.get(row.designation_id);
            if (!current) {
                grouped.set(row.designation_id, {
                    designationId: row.designation_id,
                    designationName: row.designation_name,
                    facultyCount: facultyCountByDesignation.get(row.designation_id) || 0,
                    academicYear,
                    targets: {
                        [row.target_code]: Number(row.target_value || 0),
                    },
                });
                continue;
            }
            current.targets[row.target_code] = Number(row.target_value || 0);
        }
        return Array.from(grouped.values());
    }
    async upsertDesignationTargets(input) {
        await this.ensureSchema();
        await this.seedDefaultsForAcademicYear(input.academicYear);
        const targetMap = await this.getTargetMasterMap();
        const entries = Object.entries(input.targets)
            .filter(([_, value]) => Number.isFinite(value) && value >= 0)
            .map(([key, value]) => [key, Number(value)]);
        if (entries.length === 0) {
            throw new Error('At least one valid target value is required');
        }
        const invalidKeys = entries
            .map(([code]) => code)
            .filter((code) => !targetMap.has(code));
        if (invalidKeys.length > 0) {
            throw new Error(`Invalid target code(s): ${invalidKeys.join(', ')}`);
        }
        const pool = getMysqlPool();
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            for (const [code, value] of entries) {
                const targetId = targetMap.get(code);
                if (!targetId)
                    continue;
                await connection.query(`
            INSERT INTO fap_designation_target_rule (academic_year, designation_id, target_id, target_value)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE target_value = VALUES(target_value)
          `, [input.academicYear, input.designationId, targetId, value]);
            }
            await connection.commit();
        }
        catch (error) {
            await connection.rollback();
            throw error;
        }
        finally {
            connection.release();
        }
        return this.getDesignationRules(input.academicYear);
    }
    async rebuildAssignments(input) {
        await this.ensureSchema();
        await this.seedDefaultsForAcademicYear(input.academicYear);
        const pool = getMysqlPool();
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            if (input.designationId) {
                await connection.query(`
            DELETE a
            FROM faculty_fap_target_assignment a
            JOIN faculty f ON f.id = a.faculty_id
            WHERE a.academic_year = ?
              AND f.designation_id = ?
          `, [input.academicYear, input.designationId]);
            }
            else {
                await connection.query(`DELETE FROM faculty_fap_target_assignment WHERE academic_year = ?`, [input.academicYear]);
            }
            const whereClause = input.designationId ? 'AND f.designation_id = ?' : '';
            const params = [input.academicYear];
            if (input.designationId) {
                params.push(input.designationId);
            }
            await connection.query(`
          INSERT INTO faculty_fap_target_assignment (
            academic_year,
            faculty_id,
            designation_id,
            target_id,
            assigned_value,
            assigned_on
          )
          SELECT
            r.academic_year,
            f.id,
            f.designation_id,
            r.target_id,
            r.target_value,
            CURDATE()
          FROM faculty f
          JOIN fap_designation_target_rule r
            ON r.designation_id = f.designation_id
           AND r.academic_year = ?
          WHERE 1 = 1 ${whereClause}
          ON DUPLICATE KEY UPDATE
            designation_id = VALUES(designation_id),
            assigned_value = VALUES(assigned_value),
            assigned_on = VALUES(assigned_on),
            updated_at = CURRENT_TIMESTAMP
        `, params);
            const [countRows] = await connection.query(`
          SELECT COUNT(*) AS count
          FROM faculty_fap_target_assignment
          WHERE academic_year = ?
        `, [input.academicYear]);
            await connection.commit();
            return Number(countRows[0]?.count || 0);
        }
        catch (error) {
            await connection.rollback();
            throw error;
        }
        finally {
            connection.release();
        }
    }
    async getFacultyTargets(academicYear, facultyId) {
        await this.ensureSchema();
        await this.seedDefaultsForAcademicYear(academicYear);
        const pool = getMysqlPool();
        const [rows] = await pool.query(`
        SELECT
          a.faculty_id,
          a.designation_id,
          d.designation_name,
          tm.target_code,
          a.assigned_value
        FROM faculty_fap_target_assignment a
        JOIN designation d ON d.id = a.designation_id
        JOIN fap_target_master tm ON tm.id = a.target_id
        WHERE a.academic_year = ?
          AND a.faculty_id = ?
        ORDER BY tm.id
      `, [academicYear, facultyId]);
        if (rows.length === 0) {
            return null;
        }
        const summary = {
            facultyId,
            designationId: rows[0].designation_id,
            designationName: rows[0].designation_name,
            academicYear,
            targets: {},
        };
        for (const row of rows) {
            summary.targets[row.target_code] = Number(row.assigned_value || 0);
        }
        return summary;
    }
    async getWorkflowPlanForFaculty(input) {
        await this.ensureSchema();
        await this.seedDefaultsForAcademicYear(input.academicYear);
        let targetSummary = await this.getFacultyTargets(input.academicYear, input.facultyId);
        if (!targetSummary) {
            await this.rebuildAssignments({ academicYear: input.academicYear });
            targetSummary = await this.getFacultyTargets(input.academicYear, input.facultyId);
        }
        if (!targetSummary) {
            return null;
        }
        const deadlineMap = await this.getDeadlineSettings(input.academicYear);
        const paperTargets = Math.max(1, Math.min(4, Math.trunc(targetSummary.targets.paper_target_count || 1)));
        const proposalSlots = Math.max(1, Math.min(2, Math.trunc(targetSummary.targets.funding_proposal_slot_count || 1)));
        const patentEnabled = Number(targetSummary.targets.patent_count || 0) > 0;
        const tasks = [];
        for (let slot = 1; slot <= paperTargets; slot += 1) {
            for (const task of PAPER_TASKS) {
                const id = buildTaskId(task.baseId, slot);
                tasks.push({
                    id,
                    baseId: task.baseId,
                    title: task.title,
                    type: 'paper',
                    slotNo: slot,
                    deadlineISO: deadlineMap[id] || deadlineMap[task.baseId] || '',
                    completed: false,
                });
            }
        }
        for (let slot = 1; slot <= proposalSlots; slot += 1) {
            for (const task of PROPOSAL_TASKS) {
                const id = buildTaskId(task.baseId, slot);
                tasks.push({
                    id,
                    baseId: task.baseId,
                    title: task.title,
                    type: 'proposal',
                    slotNo: slot,
                    deadlineISO: deadlineMap[id] || deadlineMap[task.baseId] || '',
                    completed: false,
                });
            }
        }
        if (patentEnabled) {
            for (const task of PATENT_TASKS) {
                const id = task.baseId;
                tasks.push({
                    id,
                    baseId: task.baseId,
                    title: task.title,
                    type: 'patent',
                    slotNo: 1,
                    deadlineISO: deadlineMap[id] || '',
                    completed: false,
                });
            }
        }
        const pool = getMysqlPool();
        const [statusRows] = await pool.query(`
        SELECT workflow_type, slot_no, task_code
        FROM faculty_workflow_task_status
        WHERE academic_year = ?
          AND faculty_id = ?
          AND status = 'completed'
      `, [input.academicYear, input.facultyId]);
        const completedSet = new Set(statusRows.map((row) => buildTaskId(row.task_code, Number(row.slot_no || 1))));
        for (const task of tasks) {
            task.completed = completedSet.has(task.id);
        }
        return {
            academicYear: input.academicYear,
            paperTargets,
            proposalSlots,
            patentEnabled,
            deadlineMap,
            completedTaskIds: Array.from(completedSet),
            tasks,
        };
    }
    async completeWorkflowTask(input) {
        await this.ensureSchema();
        const pool = getMysqlPool();
        await pool.query(`
        INSERT INTO faculty_workflow_task_status (
          academic_year,
          faculty_id,
          workflow_type,
          slot_no,
          task_code,
          status,
          payload_json,
          completed_at
        )
        VALUES (?, ?, ?, ?, ?, 'completed', ?, NOW())
        ON DUPLICATE KEY UPDATE
          status = 'completed',
          payload_json = VALUES(payload_json),
          completed_at = NOW()
      `, [
            input.academicYear,
            input.facultyId,
            input.workflowType,
            Math.max(1, Math.trunc(input.slotNo || 1)),
            input.taskCode,
            input.payload ? JSON.stringify(input.payload) : null,
        ]);
    }
}
export default new WorkflowTargetsService();
