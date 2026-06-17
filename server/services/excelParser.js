const XLSX = require('xlsx');

/**
 * Parse an Excel file buffer into an array of plain objects.
 * Returns { headers: string[], rows: object[], rowCount: number }
 */
function parseExcelBuffer(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert to array of arrays to get raw header row
  const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  if (raw.length < 2) {
    return { headers: [], rows: [], rowCount: 0 };
  }

  // Trim all header values; deduplicate by appending index if needed
  const rawHeaders = raw[0].map((h) => String(h).trim());
  const headers = rawHeaders.map((h, i) =>
    rawHeaders.indexOf(h) === i ? h : `${h}_${i}`
  );

  const rows = raw.slice(1).map((rowArr) => {
    const obj = {};
    headers.forEach((h, i) => {
      const val = rowArr[i];
      if (val instanceof Date) {
        // Normalize dates to ISO date string (YYYY-MM-DD) to avoid format drift
        obj[h] = val.toISOString().slice(0, 10);
      } else {
        obj[h] = String(val ?? '').trim();
      }
    });
    return obj;
  });

  return { headers, rows, rowCount: rows.length };
}

module.exports = { parseExcelBuffer };
