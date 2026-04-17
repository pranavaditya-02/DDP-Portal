import { getMysqlPool } from '../database/mysql';
const normalizeKey = (value) => value.trim().toLowerCase();
const detectDelimiter = (headerLine) => {
    const delimiters = ['\t', ',', ';'];
    let selected = ',';
    let maxCount = -1;
    for (const delimiter of delimiters) {
        const count = headerLine.split(delimiter).length;
        if (count > maxCount) {
            selected = delimiter;
            maxCount = count;
        }
    }
    return selected;
};
const parseDelimitedLine = (line, delimiter) => {
    const values = [];
    let current = '';
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
            current = '';
            continue;
        }
        current += ch;
    }
    values.push(current.trim());
    return values;
};
const parseCsvText = (content) => {
    const cleaned = content.replace(/^\uFEFF/, '');
    const lines = cleaned
        .split(/\r?\n/)
        .map((line) => line.trimEnd())
        .filter((line) => line.length > 0);
    if (lines.length < 2) {
        return [];
    }
    const delimiter = detectDelimiter(lines[0]);
    const headers = parseDelimitedLine(lines[0], delimiter).map(normalizeKey);
    const rows = [];
    for (let i = 1; i < lines.length; i += 1) {
        const values = parseDelimitedLine(lines[i], delimiter);
        const row = {};
        for (let j = 0; j < headers.length; j += 1) {
            row[headers[j]] = values[j] ?? '';
        }
        rows.push(row);
    }
    return rows;
};
const parseBoolean = (value, fallback) => {
    const raw = value.trim().toLowerCase();
    if (raw === 'false' || raw === '0' || raw === 'no' || raw === 'off')
        return false;
    if (raw === 'true' || raw === '1' || raw === 'yes' || raw === 'on')
        return true;
    return fallback;
};
const cleanCell = (value) => value?.trim() ?? '';
export class IndustryImportService {
    async importFromCsv(csvContent) {
        const rows = parseCsvText(csvContent);
        if (rows.length === 0) {
            throw new Error('CSV is empty or contains no rows.');
        }
        const expectedHeaders = ['industry', 'address', 'website_link'];
        const headerKeys = Object.keys(rows[0]).map(normalizeKey);
        const missingHeaders = expectedHeaders.filter((header) => !headerKeys.includes(header));
        if (missingHeaders.length > 0) {
            throw new Error(`CSV is missing required headers: ${missingHeaders.join(', ')}`);
        }
        const connection = await getMysqlPool().getConnection();
        try {
            await connection.beginTransaction();
            const summary = {
                processedRows: 0,
                insertedRows: 0,
                skippedRows: 0,
                warnings: [],
            };
            for (const row of rows) {
                summary.processedRows += 1;
                const industry = cleanCell(row['industry'] ?? '');
                const address = cleanCell(row['address'] ?? '');
                const website = cleanCell(row['website_link'] ?? '');
                const activeNow = parseBoolean(row['active_now'] ?? '', true);
                if (!industry || !address || !website) {
                    summary.skippedRows += 1;
                    summary.warnings.push(`Row ${summary.processedRows}: missing required industry, address, or website_link.`);
                    continue;
                }
                await connection.query('INSERT INTO internship_industries (industry, address, website_link, active_now) VALUES (?, ?, ?, ?)', [industry, address, website, activeNow ? 1 : 0]);
                summary.insertedRows += 1;
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
export default new IndustryImportService();
