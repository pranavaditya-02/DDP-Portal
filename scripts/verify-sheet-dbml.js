const fs = require('fs');
const XLSX = require('xlsx');

const dbml = fs.readFileSync('backend/prisma/bip_import_schema.dbml', 'utf8');

const tableMap = {
  'Newsletter Archive': 'newsletter_archive',
  'E-Content Developed': 'e_content_developed',
  'Events Attended': 'events_attended',
  'Events Organized': 'events_organized',
  ' External Examiner': 'external_examiner',
  'Faculty Journal Reviewer': 'faculty_journal_reviewer',
  'Guest Lecture Delivered': 'guest_lecture_delivered',
  'International Visit': 'international_visit',
  'Notable AchievementAwards': 'notable_achievements',
  'Online Course': 'online_course',
  ' Paper Presentation': 'paper_presentation',
  'Resource Person': 'resource_person',
};

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getTableColumns(tableName) {
  const re = new RegExp(`Table\\s+${escapeRegex(tableName)}\\s*\\{([\\s\\S]*?)\\n\\}`, 'm');
  const match = dbml.match(re);
  if (!match) return [];

  return match[1]
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^[a-zA-Z_][a-zA-Z0-9_]*\s+/.test(line))
    .map((line) => line.split(/\s+/)[0]);
}

const stopWords = new Set([
  'of',
  'the',
  'and',
  'or',
  'to',
  'in',
  'is',
  'if',
  'no',
  'name',
  'upload',
  'proof',
  'date',
  'number',
  'type',
  'for',
  'as',
  'a',
]);

function tokens(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .filter((w) => !stopWords.has(w));
}

function similarity(a, b) {
  const aSet = new Set(tokens(a));
  const bSet = new Set(tokens(b));
  if (!aSet.size || !bSet.size) return 0;

  let intersection = 0;
  for (const item of aSet) {
    if (bSet.has(item)) intersection += 1;
  }

  return intersection / Math.max(aSet.size, bSet.size);
}

const ignoreSheetFields = new Set(['Faculty', 'Task ID', 'IQAC Verification']);
const ignoreDbColumns = new Set(['id', 'submission_id', 'special_labs_involved', 'special_lab_id']);

const wb = XLSX.readFile('assets/PS-FAA (1).xlsx');
const report = [];

for (const [sheetName, tableName] of Object.entries(tableMap)) {
  const sheet = wb.Sheets[sheetName];
  const dbColumns = getTableColumns(tableName);

  if (!sheet) {
    report.push({
      sheet: sheetName,
      table: tableName,
      error: 'Sheet not found in workbook',
    });
    continue;
  }

  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' });
  const sheetFields = [...new Set(rows.map((r) => (r[0] || '').toString().trim()).filter(Boolean))].filter(
    (f) => !ignoreSheetFields.has(f)
  );

  const missingInDbml = [];
  for (const field of sheetFields) {
    let bestScore = 0;
    let bestColumn = '';
    for (const column of dbColumns) {
      const score = Math.max(similarity(field, column), similarity(field, column.replace(/_/g, ' ')));
      if (score > bestScore) {
        bestScore = score;
        bestColumn = column;
      }
    }

    if (bestScore < 0.34) {
      missingInDbml.push({ field, bestColumn, score: Number(bestScore.toFixed(2)) });
    }
  }

  const extraInDbml = [];
  for (const column of dbColumns) {
    if (ignoreDbColumns.has(column)) continue;

    let bestScore = 0;
    for (const field of sheetFields) {
      bestScore = Math.max(bestScore, similarity(column, field));
    }

    if (bestScore < 0.34) {
      extraInDbml.push({ column, score: Number(bestScore.toFixed(2)) });
    }
  }

  report.push({
    sheet: sheetName,
    table: tableName,
    sheetFieldCount: sheetFields.length,
    dbColumnCount: dbColumns.length,
    missingInDbml,
    extraInDbml,
  });
}

console.log(JSON.stringify(report, null, 2));
