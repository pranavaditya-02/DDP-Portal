const fs = require('fs')
const path = require('path')
const XLSX = require('xlsx')

const SOURCE_FILE = 'Premium SSG Project - DDP Ranking_Index calculation (2).xlsx'
const INPUT_PATH = path.join(process.cwd(), 'assets', SOURCE_FILE)
const OUTPUT_PATH = path.join(process.cwd(), 'assets', 'ddp-indexing.generated.json')

function toNumber(value) {
  if (value === null || value === undefined || value === '') return 0
  if (typeof value === 'number') return value
  const cleaned = String(value).replace(/,/g, '').trim()
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : 0
}

function toNullableNumber(value) {
  if (value === null || value === undefined || value === '' || value === '-') return null
  if (typeof value === 'number') return value
  const cleaned = String(value).replace(/,/g, '').trim()
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : null
}

function shortNameFrom(deptName) {
  const n = String(deptName || '').trim()
  if (!n) return ''
  return n.replace(/[^a-zA-Z0-9]+/g, '').toUpperCase()
}

function readRows(sheet) {
  return XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: null,
    raw: false,
  })
}

function parseDeptSheet(sheetName, sheet) {
  const rows = readRows(sheet)
  const activities = []

  for (let i = 2; i < rows.length; i += 1) {
    const row = rows[i] || []
    const sNo = toNumber(row[0])
    const activityName = String(row[1] || '').trim()

    if (!sNo || !activityName) break

    const item = {
      sNo,
      activityName,
      weightage: toNumber(row[3]),
      totalTarget: toNumber(row[4]),
      attained: toNumber(row[5]),
      actualIndex: toNumber(row[6]),
      permittedIndex: toNumber(row[7]),
      additionalActual: toNullableNumber(row[8]),
      additionalPermitted: toNullableNumber(row[9]),
    }
    activities.push(item)
  }

  const sumRow = rows[35] || []
  const weightedRow = rows[36] || []
  const cappedRow = rows[37] || []

  return {
    sheetName,
    activities,
    totalWeightage: toNumber(sumRow[3]),
    totalTarget: toNumber(sumRow[4]),
    achieved: toNumber(sumRow[5]),
    rawIndex: toNumber(sumRow[6]),
    baseIndex: toNumber(weightedRow[7]),
    additionalIndexRaw: toNullableNumber(weightedRow[8]),
    additionalIndex: toNumber(weightedRow[9]),
    cappedBonus: toNumber(cappedRow[7]),
  }
}

function main() {
  if (!fs.existsSync(INPUT_PATH)) {
    throw new Error(`Input workbook not found: ${INPUT_PATH}`)
  }

  const workbook = XLSX.readFile(INPUT_PATH, { cellFormula: true, raw: false })
  const summarySheet = workbook.Sheets['Summary']
  if (!summarySheet) {
    throw new Error('Summary sheet not found in workbook')
  }

  const deptSheetNames = workbook.SheetNames.filter((n) => /^Dept\.\s*\d+$/i.test(n))
  if (!deptSheetNames.length) {
    throw new Error('No department sheets found (expected names like "Dept. 1")')
  }

  const deptSheets = new Map()
  for (const sheetName of deptSheetNames) {
    deptSheets.set(sheetName, parseDeptSheet(sheetName, workbook.Sheets[sheetName]))
  }

  const summaryRows = readRows(summarySheet)
  const overallIndexing = []

  for (let i = 1; i < summaryRows.length; i += 1) {
    const row = summaryRows[i] || []
    const rank = toNumber(row[0])
    const department = String(row[1] || '').trim()
    if (!rank || !department) break

    const shortName = shortNameFrom(department)
    const totalTarget = toNumber(row[2])
    const achieved = toNumber(row[3])
    const baseIndex = toNumber(row[4])
    const additionalIndex = toNumber(row[5])
    const cappedBonus = toNumber(row[6])
    const normalizedBonus = toNumber(row[7])

    const deptDetails = deptSheets.get(department)

    overallIndexing.push({
      rank,
      department,
      shortName,
      totalTarget,
      achieved,
      baseIndex,
      additionalIndex,
      cappedBonus,
      normalizedBonus,
      sheetName: department,
      activityCount: deptDetails ? deptDetails.activities.length : 0,
    })
  }

  const allActivitiesMap = new Map()
  for (const deptName of deptSheetNames) {
    const dept = deptSheets.get(deptName)
    if (!dept) continue

    for (const item of dept.activities) {
      const key = item.activityName.toUpperCase()
      if (!allActivitiesMap.has(key)) {
        allActivitiesMap.set(key, {
          activityName: item.activityName,
          proposedTarget: 0,
          proposedAchieved: 0,
        })
      }
      const agg = allActivitiesMap.get(key)
      agg.proposedTarget += item.totalTarget
      agg.proposedAchieved += item.attained
    }
  }

  const allActivities = [...allActivitiesMap.values()].map((a) => ({
    ...a,
    pending: a.proposedTarget - a.proposedAchieved,
  }))

  const overallTotals = {
    proposedTargets: allActivities.reduce((sum, a) => sum + a.proposedTarget, 0),
    proposedAchieved: allActivities.reduce((sum, a) => sum + a.proposedAchieved, 0),
    pending: allActivities.reduce((sum, a) => sum + a.pending, 0),
  }

  const journalName = 'Journal Publications (SCI / WoS)'
  const journalDeptBreakdown = deptSheetNames.map((deptName, idx) => {
    const dept = deptSheets.get(deptName)
    const journal = dept.activities.find((a) => a.activityName.toUpperCase() === journalName.toUpperCase())

    return {
      sNo: idx + 1,
      department: deptName,
      shortName: shortNameFrom(deptName),
      totalTarget: journal ? journal.totalTarget : 0,
      achieved: journal ? journal.attained : 0,
      pending: journal ? journal.totalTarget - journal.attained : 0,
      bipIds: '',
    }
  })

  const firstDept = deptSheets.get(deptSheetNames[0])

  const payload = {
    sourceFile: SOURCE_FILE,
    generatedAt: new Date().toISOString(),
    sheets: workbook.SheetNames,
    overallIndexing,
    departments: deptSheetNames.map((deptName) => {
      const d = deptSheets.get(deptName)
      return {
        name: deptName,
        shortName: shortNameFrom(deptName),
        totalWeightage: d.totalWeightage,
        totalTarget: d.totalTarget,
        achieved: d.achieved,
        rawIndex: d.rawIndex,
        baseIndex: d.baseIndex,
        additionalIndexRaw: d.additionalIndexRaw,
        additionalIndex: d.additionalIndex,
        cappedBonus: d.cappedBonus,
        activities: d.activities,
      }
    }),
    cseLike: {
      totalWeightage: firstDept ? firstDept.totalWeightage : 0,
      totalIndex: firstDept ? firstDept.baseIndex : 0,
      additionalIndex: firstDept ? firstDept.additionalIndex : 0,
      activityIndexing: firstDept ? firstDept.activities : [],
    },
    ddpJournalPublicationsOverall: {
      activityName: journalName,
      proposedTarget: journalDeptBreakdown.reduce((sum, d) => sum + d.totalTarget, 0),
      proposedAchieved: journalDeptBreakdown.reduce((sum, d) => sum + d.achieved, 0),
      pending: journalDeptBreakdown.reduce((sum, d) => sum + d.pending, 0),
    },
    ddpJournalDeptBreakdown: journalDeptBreakdown,
    ddpAllActivities: allActivities,
    ddpOverallTotals: overallTotals,
  }

  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  console.log(`Generated ${path.relative(process.cwd(), OUTPUT_PATH)} from ${SOURCE_FILE}`)
  console.log(`Departments: ${payload.overallIndexing.length} | Activities: ${payload.ddpAllActivities.length}`)
}

main()
