const ExcelJS = require('exceljs');

const COLORS = {
  headerFill:  { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F4F7F' } },
  match:       { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } },
  mismatch:    { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB9C' } },
  missing:     { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } },
  cellMismatch:{ type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF9999' } },
};

const HEADER_FONT = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Calibri', size: 11 };

function applyHeader(sheet, values) {
  const row = sheet.addRow(values);
  row.eachCell((cell) => {
    cell.fill = COLORS.headerFill;
    cell.font = HEADER_FONT;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } },
    };
  });
  sheet.getRow(1).height = 20;
}

function autoFitColumns(sheet) {
  sheet.columns.forEach((col) => {
    let maxLen = 10;
    col.eachCell({ includeEmpty: true }, (cell) => {
      const len = String(cell.value ?? '').length;
      if (len > maxLen) maxLen = len;
    });
    col.width = Math.min(maxLen + 2, 50);
  });
}

function freezeAndFilter(sheet) {
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: sheet.columnCount } };
}

function rowFillForStatus(status) {
  if (status === 'Full Match') return COLORS.match;
  if (status === 'Mismatch') return COLORS.mismatch;
  return COLORS.missing;
}

/**
 * Build a full comparison workbook and return it as a Buffer.
 *
 * @param {object[]} results   - from compareItems()
 * @param {object}   summary   - from buildSummary()
 * @param {string[]} columns   - columns that were compared
 * @param {string}   joinKey   - the join key column name
 */
async function buildExportWorkbook(results, summary, columns, joinKey) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'ExcelDiff';
  wb.created = new Date();

  // ── Sheet 1: Summary ───────────────────────────────────────────────
  const sumSheet = wb.addWorksheet('Summary');
  applyHeader(sumSheet, ['Metric', 'Value']);
  const summaryRows = [
    ['Migration Date', new Date().toLocaleDateString()],
    ['Total Items in Source', summary.totalSource],
    ['Total Items in Target', summary.totalTarget],
    ['Matched (Full Match)', summary.matched],
    ['Mismatched', summary.mismatched],
    ['Missing in Target', summary.missingInTarget],
    ['Missing in Source', summary.missingInSource],
    ['Success Rate (%)', `${summary.successRate}%`],
  ];
  summaryRows.forEach(([metric, value]) => {
    const r = sumSheet.addRow([metric, value]);
    r.getCell(1).font = { bold: true };
  });
  autoFitColumns(sumSheet);
  freezeAndFilter(sumSheet);

  // ── Sheet 2: Full Comparison ────────────────────────────────────────
  const fullSheet = wb.addWorksheet('Full Comparison');
  const fullHeaders = [joinKey, 'Status'];
  columns.forEach((col) => {
    fullHeaders.push(`${col}_Source`, `${col}_Target`, `${col}_Match`);
  });
  applyHeader(fullSheet, fullHeaders);

  results.forEach(({ itemId, status, fields }) => {
    const rowData = [itemId, status];
    columns.forEach((col) => {
      const f = fields[col] ?? { source: '', target: '', match: true };
      rowData.push(f.source, f.target, f.match ? 'YES' : 'NO');
    });
    const r = fullSheet.addRow(rowData);
    r.fill = rowFillForStatus(status);

    // Highlight individual mismatched cells in orange/red
    if (status === 'Mismatch') {
      columns.forEach((col, i) => {
        const f = fields[col];
        if (f && !f.match) {
          const srcCell = r.getCell(3 + i * 3);
          const tgtCell = r.getCell(4 + i * 3);
          srcCell.fill = COLORS.cellMismatch;
          tgtCell.fill = COLORS.cellMismatch;
        }
      });
    }
  });
  autoFitColumns(fullSheet);
  freezeAndFilter(fullSheet);

  // ── Sheet 3: Mismatches Only ────────────────────────────────────────
  const mmSheet = wb.addWorksheet('Mismatches Only');
  applyHeader(mmSheet, fullHeaders);
  results
    .filter((r) => r.status === 'Mismatch')
    .forEach(({ itemId, status, fields }) => {
      const rowData = [itemId, status];
      columns.forEach((col) => {
        const f = fields[col] ?? { source: '', target: '', match: true };
        rowData.push(f.source, f.target, f.match ? 'YES' : 'NO');
      });
      const r = mmSheet.addRow(rowData);
      r.fill = COLORS.mismatch;
      columns.forEach((col, i) => {
        const f = fields[col];
        if (f && !f.match) {
          mmSheet.getRow(r.number).getCell(3 + i * 3).fill = COLORS.cellMismatch;
          mmSheet.getRow(r.number).getCell(4 + i * 3).fill = COLORS.cellMismatch;
        }
      });
    });
  autoFitColumns(mmSheet);
  freezeAndFilter(mmSheet);

  // ── Sheet 4: Missing Items ──────────────────────────────────────────
  const missSheet = wb.addWorksheet('Missing Items');
  applyHeader(missSheet, [joinKey, 'Status', 'Direction', ...columns]);
  results
    .filter((r) => r.status === 'Missing in Target' || r.status === 'Missing in Source')
    .forEach(({ itemId, status, fields }) => {
      const direction = status === 'Missing in Target' ? 'In Source Only' : 'In Target Only';
      const rowData = [itemId, status, direction];
      columns.forEach((col) => {
        const f = fields[col] ?? { source: '', target: '' };
        rowData.push(status === 'Missing in Target' ? f.source : f.target);
      });
      const r = missSheet.addRow(rowData);
      r.fill = COLORS.missing;
    });
  autoFitColumns(missSheet);
  freezeAndFilter(missSheet);

  return wb.xlsx.writeBuffer();
}

module.exports = { buildExportWorkbook };
