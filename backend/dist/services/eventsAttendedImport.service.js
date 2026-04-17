import getMysqlPool from "../database/mysql";
const EXPECTED_HEADERS = [
    "BIP ID",
    "Faculty ID",
    "Task ID",
    "Special Lab Involved",
    "Special Lab Id",
    "Event Type",
    "If Others Please Specify",
    "Event Level",
    "Event Title",
    "Event Organizer",
    "event Mode",
    "Event Location",
    "Start Date",
    "End Date",
    "Event Duration",
    "Organizer Type",
    "Industry",
    "Other Organizer Name",
    "Type of Sponsorship",
    "Name of the Funding Agency If Others",
    "Amount in Rs.",
    "IQAC Verification",
    "Apex Proof",
    "certificate_proof",
];
const normalizeKey = (value) => value.trim().toLowerCase();
const normalizeLookupToken = (value) => normalizeKey(value).replace(/[\s-]+/g, "_");
const normalizeSpecialLabCode = (value) => value.trim().toUpperCase();
const getLookupId = (map, label) => {
    const direct = map.get(normalizeKey(label));
    if (direct) {
        return direct;
    }
    return map.get(normalizeLookupToken(label)) ?? null;
};
const parseCsvText = (content) => {
    const source = content.replace(/^\uFEFF/, "");
    const lines = source
        .split(/\r?\n/)
        .map((line) => line.trimEnd())
        .filter((line) => line.length > 0);
    if (lines.length < 2) {
        return [];
    }
    const headerLine = lines[0];
    const delimiter = detectDelimiter(headerLine);
    const headers = parseDelimitedLine(headerLine, delimiter);
    const rows = [];
    for (let i = 1; i < lines.length; i += 1) {
        const values = parseDelimitedLine(lines[i], delimiter);
        const row = {};
        for (let j = 0; j < headers.length; j += 1) {
            row[headers[j]] = values[j] ?? "";
        }
        rows.push(row);
    }
    return rows;
};
const detectDelimiter = (headerLine) => {
    const delimiters = ["\t", ",", ";"];
    let selected = ",";
    let count = -1;
    for (const delimiter of delimiters) {
        const c = headerLine.split(delimiter).length;
        if (c > count) {
            selected = delimiter;
            count = c;
        }
    }
    return selected;
};
const parseDelimitedLine = (line, delimiter) => {
    const values = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i += 1;
            }
            else {
                inQuotes = !inQuotes;
            }
            continue;
        }
        if (!inQuotes && ch === delimiter) {
            values.push(current.trim());
            current = "";
            continue;
        }
        current += ch;
    }
    values.push(current.trim());
    return values;
};
const toDateSql = (value) => {
    const raw = value.trim();
    if (!raw) {
        return null;
    }
    const dmy = raw.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (dmy) {
        return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
    }
    const ymd = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (ymd) {
        return raw;
    }
    return null;
};
const toNumber = (value) => {
    const clean = value.trim().replace(/,/g, "");
    if (!clean) {
        return null;
    }
    const parsed = Number(clean);
    return Number.isFinite(parsed) ? parsed : null;
};
const cleanText = (value) => {
    const clean = value.trim();
    if (!clean) {
        return null;
    }
    const upper = clean.toUpperCase();
    if (upper === "NIL" || upper === "NULL") {
        return null;
    }
    return clean;
};
const ensureHeaders = (rows) => {
    if (rows.length === 0) {
        throw new Error("CSV is empty or has only a header row.");
    }
    const available = new Set(Object.keys(rows[0]).map(normalizeKey));
    const missing = EXPECTED_HEADERS.filter((header) => !available.has(normalizeKey(header)));
    if (missing.length > 0) {
        throw new Error(`CSV is missing required headers: ${missing.join(", ")}`);
    }
};
const loadLookupMap = async (connection, tableName) => {
    const [rows] = await connection.query(`SELECT id, label FROM ${tableName}`);
    const map = new Map();
    for (const row of rows) {
        const label = String(row.label);
        const id = Number(row.id);
        map.set(normalizeKey(label), id);
        map.set(normalizeLookupToken(label), id);
    }
    return map;
};
const ensureDocType = async (connection, lookups, label) => {
    const existing = getLookupId(lookups.docType, label);
    if (existing) {
        return { id: existing, inserted: false };
    }
    const [insertResult] = await connection.execute("INSERT INTO ref_doc_type (label) VALUES (?)", [label]);
    const id = Number(insertResult.insertId);
    lookups.docType.set(normalizeKey(label), id);
    lookups.docType.set(normalizeLookupToken(label), id);
    return { id, inserted: true };
};
const loadIndustryMap = async (connection) => {
    const [rows] = await connection.query("SELECT id, industry FROM internship_industries");
    const map = new Map();
    for (const row of rows) {
        map.set(normalizeKey(String(row.industry)), Number(row.id));
    }
    return map;
};
const loadSpecialLabCodeMap = async (connection) => {
    const [rows] = await connection.query("SELECT id, code FROM special_lab");
    const byCode = new Map();
    const ids = new Set();
    for (const row of rows) {
        const id = Number(row.id);
        ids.add(id);
        const code = String(row.code ?? "").trim();
        if (code) {
            byCode.set(normalizeSpecialLabCode(code), id);
        }
    }
    return { byCode, ids };
};
const loadFacultyIds = async (connection) => {
    const [rows] = await connection.query("SELECT id FROM faculty");
    const ids = new Set();
    for (const row of rows) {
        ids.add(String(row.id).trim().toUpperCase());
    }
    return ids;
};
const getOrCreateIndustry = async (connection, lookups, industryName) => {
    const key = normalizeKey(industryName);
    const existing = lookups.industries.get(key);
    if (existing) {
        return { id: existing, inserted: false };
    }
    const [result] = await connection.execute("INSERT INTO internship_industries (industry) VALUES (?)", [industryName]);
    const id = Number(result.insertId);
    lookups.industries.set(key, id);
    return { id, inserted: true };
};
const getOrCreateSubmission = async (connection, taskId, facultyId, iqacId, bipId) => {
    try {
        const [insertResult] = await connection.execute(`INSERT INTO submissions (
        task_id,
        remarks,
        activity_type,
        faculty_id,
        iqac_verification_id,
        created_at,
        updated_at
      ) VALUES (?, ?, 'events_attended', ?, ?, NOW(), NOW())`, [
            taskId,
            bipId ? `Migrated from BIP ID ${bipId}` : "Migrated from CSV import",
            facultyId,
            iqacId,
        ]);
        return { id: Number(insertResult.insertId), inserted: true };
    }
    catch (error) {
        const sqlError = error;
        if (sqlError.code === "ER_DUP_ENTRY" && taskId) {
            const [fallbackResult] = await connection.execute(`INSERT INTO submissions (
          task_id,
          remarks,
          activity_type,
          faculty_id,
          iqac_verification_id,
          created_at,
          updated_at
        ) VALUES (NULL, ?, 'events_attended', ?, ?, NOW(), NOW())`, [
                bipId ? `Migrated from BIP ID ${bipId}` : "Migrated from CSV import",
                facultyId,
                iqacId,
            ]);
            return {
                id: Number(fallbackResult.insertId),
                inserted: true,
                warning: `Task ID '${taskId}' already exists; inserted submission with NULL task_id to keep one submission per event row.`,
            };
        }
        throw error;
    }
};
const getOrCreateDocument = async (connection, docTypeId, filePath) => {
    const [existing] = await connection.execute("SELECT id FROM documents WHERE doc_type_id = ? AND file_path = ? LIMIT 1", [docTypeId, filePath]);
    if (existing.length > 0) {
        return { id: Number(existing[0].id), inserted: false };
    }
    const [insertResult] = await connection.execute("INSERT INTO documents (doc_type_id, file_path, uploaded_at) VALUES (?, ?, NOW())", [docTypeId, filePath]);
    return { id: Number(insertResult.insertId), inserted: true };
};
export class EventsAttendedImportService {
    async importFromCsv(csvContent) {
        const rows = parseCsvText(csvContent);
        ensureHeaders(rows);
        const summary = {
            processedRows: 0,
            insertedSubmissions: 0,
            insertedEvents: 0,
            insertedDocuments: 0,
            insertedIndustries: 0,
            skippedRows: 0,
            warnings: [],
        };
        const connection = await getMysqlPool().getConnection();
        try {
            await connection.beginTransaction();
            const lookups = {
                ...(await (async () => {
                    const specialLabData = await loadSpecialLabCodeMap(connection);
                    return {
                        specialLabByCode: specialLabData.byCode,
                        specialLabIds: specialLabData.ids,
                    };
                })()),
                iqacStatus: await loadLookupMap(connection, "ref_iqac_status"),
                eventType: await loadLookupMap(connection, "ref_event_type_attended"),
                eventLevel: await loadLookupMap(connection, "ref_event_level"),
                eventMode: await loadLookupMap(connection, "ref_event_mode"),
                organizerType: await loadLookupMap(connection, "ref_organizer_type"),
                sponsorshipType: await loadLookupMap(connection, "ref_sponsorship_type"),
                docType: await loadLookupMap(connection, "ref_doc_type"),
                industries: await loadIndustryMap(connection),
                facultyIds: await loadFacultyIds(connection),
            };
            const apexDocType = await ensureDocType(connection, lookups, "apex_proof");
            const certificateDocType = await ensureDocType(connection, lookups, "certificate_proof");
            if (apexDocType.inserted) {
                summary.warnings.push("ref_doc_type missing apex_proof; created automatically.");
            }
            if (certificateDocType.inserted) {
                summary.warnings.push("ref_doc_type missing certificate_proof; created automatically.");
            }
            for (const row of rows) {
                summary.processedRows += 1;
                const taskId = cleanText(row["Task ID"] ?? "") ?? null;
                const facultyIdRaw = cleanText(row["Faculty ID"] ?? "");
                let facultyId = null;
                if (facultyIdRaw) {
                    const normalizedFacultyId = facultyIdRaw.trim().toUpperCase();
                    if (lookups.facultyIds.has(normalizedFacultyId)) {
                        facultyId = normalizedFacultyId;
                    }
                    else {
                        summary.warnings.push(`Row ${summary.processedRows}: Faculty ID '${facultyIdRaw}' not found in faculty table; storing NULL faculty_id.`);
                    }
                }
                else {
                    summary.warnings.push(`Row ${summary.processedRows}: Faculty ID is empty; storing NULL faculty_id.`);
                }
                const iqacLabel = normalizeKey(row["IQAC Verification"] ?? "");
                const iqacId = lookups.iqacStatus.get(iqacLabel) ?? null;
                const submission = await getOrCreateSubmission(connection, taskId, facultyId, iqacId, cleanText(row["BIP ID"] ?? ""));
                if (submission.inserted) {
                    summary.insertedSubmissions += 1;
                }
                if (submission.warning) {
                    summary.warnings.push(`Row ${summary.processedRows}: ${submission.warning}`);
                }
                const industryName = cleanText(row["Industry"] ?? "");
                let industryId = null;
                if (industryName) {
                    const industry = await getOrCreateIndustry(connection, lookups, industryName);
                    industryId = industry.id;
                    if (industry.inserted) {
                        summary.insertedIndustries += 1;
                    }
                }
                let apexProofId = null;
                const apexProofUrl = cleanText(row["Apex Proof"] ?? "");
                if (apexProofUrl) {
                    const doc = await getOrCreateDocument(connection, apexDocType.id, apexProofUrl);
                    apexProofId = doc.id;
                    if (doc.inserted) {
                        summary.insertedDocuments += 1;
                    }
                }
                let certificateProofId = null;
                const certificateProofUrl = cleanText(row["certificate_proof"] ?? "");
                if (certificateProofUrl) {
                    const doc = await getOrCreateDocument(connection, certificateDocType.id, certificateProofUrl);
                    certificateProofId = doc.id;
                    if (doc.inserted) {
                        summary.insertedDocuments += 1;
                    }
                }
                const specialLabInvolved = normalizeKey(row["Special Lab Involved"] ?? "") === "yes" ? 1 : 0;
                const specialLabCodeOrId = cleanText(row["Special Lab Id"] ?? "");
                let specialLabId = null;
                if (specialLabInvolved === 1 && specialLabCodeOrId) {
                    const specialLabNumericId = toNumber(specialLabCodeOrId);
                    if (specialLabNumericId !== null) {
                        const numericId = Math.trunc(specialLabNumericId);
                        if (lookups.specialLabIds.has(numericId)) {
                            specialLabId = numericId;
                        }
                    }
                    else {
                        specialLabId =
                            lookups.specialLabByCode.get(normalizeSpecialLabCode(specialLabCodeOrId)) ?? null;
                    }
                    if (specialLabId === null) {
                        summary.warnings.push(`Row ${summary.processedRows}: Special Lab Id '${specialLabCodeOrId}' not found; storing NULL special_lab_id.`);
                    }
                }
                if (specialLabInvolved === 1 && !specialLabCodeOrId) {
                    summary.warnings.push(`Row ${summary.processedRows}: Special Lab Involved is Yes but Special Lab Id is empty; storing NULL special_lab_id.`);
                }
                const eventTypeId = getLookupId(lookups.eventType, row["Event Type"] ?? "");
                const eventLevelId = getLookupId(lookups.eventLevel, row["Event Level"] ?? "");
                const eventModeId = getLookupId(lookups.eventMode, row["event Mode"] ?? "");
                const organizerTypeId = getLookupId(lookups.organizerType, row["Organizer Type"] ?? "");
                const sponsorshipTypeId = getLookupId(lookups.sponsorshipType, row["Type of Sponsorship"] ?? "");
                const outcome = cleanText(row["Outcome"] ?? row["Claimed For"] ?? "");
                const ifOutcomeOthers = cleanText(row["If Outcome Others"] ??
                    row["If outcome others"] ??
                    row["If Outcome Others Please Specify"] ??
                    "");
                if (!eventTypeId) {
                    summary.warnings.push(`Row ${summary.processedRows}: Event Type not found -> ${row["Event Type"]}`);
                }
                if (!eventLevelId) {
                    summary.warnings.push(`Row ${summary.processedRows}: Event Level not found -> ${row["Event Level"]}`);
                }
                if (!eventModeId) {
                    summary.warnings.push(`Row ${summary.processedRows}: Event Mode not found -> ${row["event Mode"]}`);
                }
                await connection.execute(`INSERT INTO events_attended (
            submission_id,
            special_labs_involved,
            special_lab_id,
            event_type_id,
            if_event_type_others,
            topic_name,
            organizer_type_id,
            industry_id,
            event_level_id,
            event_title,
            event_organizer,
            event_mode_id,
            event_location,
            event_date_from,
            event_date_to,
            duration_days,
            other_organizer_name,
            sponsorship_type_id,
            funding_agency_name,
            amount_inrs,
            outcome,
            if_outcome_others,
            apex_proof_id,
            certificate_proof_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            special_labs_involved = VALUES(special_labs_involved),
            special_lab_id = VALUES(special_lab_id),
            event_type_id = VALUES(event_type_id),
            if_event_type_others = VALUES(if_event_type_others),
            topic_name = VALUES(topic_name),
            organizer_type_id = VALUES(organizer_type_id),
            industry_id = VALUES(industry_id),
            event_level_id = VALUES(event_level_id),
            event_title = VALUES(event_title),
            event_organizer = VALUES(event_organizer),
            event_mode_id = VALUES(event_mode_id),
            event_location = VALUES(event_location),
            event_date_from = VALUES(event_date_from),
            event_date_to = VALUES(event_date_to),
            duration_days = VALUES(duration_days),
            other_organizer_name = VALUES(other_organizer_name),
            sponsorship_type_id = VALUES(sponsorship_type_id),
            funding_agency_name = VALUES(funding_agency_name),
            amount_inrs = VALUES(amount_inrs),
            outcome = VALUES(outcome),
            if_outcome_others = VALUES(if_outcome_others),
            apex_proof_id = VALUES(apex_proof_id),
            certificate_proof_id = VALUES(certificate_proof_id)`, [
                    submission.id,
                    specialLabInvolved,
                    specialLabId,
                    eventTypeId,
                    cleanText(row["If Others Please Specify"] ?? ""),
                    cleanText(row["Event Title"] ?? ""),
                    organizerTypeId,
                    industryId,
                    eventLevelId,
                    cleanText(row["Event Title"] ?? ""),
                    cleanText(row["Event Organizer"] ?? ""),
                    eventModeId,
                    cleanText(row["Event Location"] ?? ""),
                    toDateSql(row["Start Date"] ?? ""),
                    toDateSql(row["End Date"] ?? ""),
                    toNumber(row["Event Duration"] ?? ""),
                    cleanText(row["Other Organizer Name"] ?? ""),
                    sponsorshipTypeId,
                    cleanText(row["Name of the Funding Agency If Others"] ?? ""),
                    toNumber(row["Amount in Rs."] ?? ""),
                    outcome,
                    ifOutcomeOthers,
                    apexProofId,
                    certificateProofId,
                ]);
                summary.insertedEvents += 1;
            }
            await connection.commit();
            return summary;
        }
        catch (error) {
            await connection.rollback();
            throw error;
        }
        finally {
            connection.release();
        }
    }
}
export default new EventsAttendedImportService();
