const XLSX = require('../server/node_modules/xlsx');
const path = require('path');

const SOURCE_ROWS = [
  { 'Item ID': 'ITEM-001', 'Description': 'Bolt M6',        'Material': 'Steel',    'Release Status': 'Released', 'Revision': 'A', 'Weight (g)': '12.5',  'Owner': 'John Smith',   'Created Date': '2023-01-10' },
  { 'Item ID': 'ITEM-002', 'Description': 'Nut M6',         'Material': 'Steel',    'Release Status': 'Released', 'Revision': 'B', 'Weight (g)': '4.2',   'Owner': 'Jane Doe',     'Created Date': '2023-01-11' },
  { 'Item ID': 'ITEM-003', 'Description': 'Pin 4mm',        'Material': 'Aluminum', 'Release Status': 'In Work',  'Revision': 'A', 'Weight (g)': '1.8',   'Owner': 'John Smith',   'Created Date': '2023-02-05' },
  { 'Item ID': 'ITEM-004', 'Description': 'Bracket Type A', 'Material': 'Steel',    'Release Status': 'Released', 'Revision': 'C', 'Weight (g)': '85.0',  'Owner': 'Alice Brown',  'Created Date': '2023-02-10' },
  { 'Item ID': 'ITEM-005', 'Description': 'Spring 20mm',    'Material': 'Steel',    'Release Status': 'Released', 'Revision': 'A', 'Weight (g)': '6.3',   'Owner': 'Bob Lee',      'Created Date': '2023-03-01' },
  { 'Item ID': 'ITEM-006', 'Description': 'Washer M8',      'Material': 'Steel',    'Release Status': 'Released', 'Revision': 'A', 'Weight (g)': '2.1',   'Owner': 'Jane Doe',     'Created Date': '2023-03-05' },
  { 'Item ID': 'ITEM-007', 'Description': 'Screw M4x10',    'Material': 'Steel',    'Release Status': 'In Work',  'Revision': 'B', 'Weight (g)': '0.9',   'Owner': 'John Smith',   'Created Date': '2023-03-10' },
  { 'Item ID': 'ITEM-008', 'Description': 'Housing Body',   'Material': 'Plastic',  'Release Status': 'Released', 'Revision': 'D', 'Weight (g)': '210.0', 'Owner': 'Alice Brown',  'Created Date': '2023-04-01' },
  { 'Item ID': 'ITEM-009', 'Description': 'Seal Ring 12',   'Material': 'Rubber',   'Release Status': 'Released', 'Revision': 'A', 'Weight (g)': '3.5',   'Owner': 'Bob Lee',      'Created Date': '2023-04-05' },
  { 'Item ID': 'ITEM-010', 'Description': 'Drive Shaft',    'Material': 'Steel',    'Release Status': 'Released', 'Revision': 'B', 'Weight (g)': '520.0', 'Owner': 'Jane Doe',     'Created Date': '2023-04-10' },
  { 'Item ID': 'ITEM-011', 'Description': 'Gear Pinion',    'Material': 'Steel',    'Release Status': 'Released', 'Revision': 'A', 'Weight (g)': '145.0', 'Owner': 'John Smith',   'Created Date': '2023-05-01' },
  { 'Item ID': 'ITEM-012', 'Description': 'Cover Plate',    'Material': 'Aluminum', 'Release Status': 'In Work',  'Revision': 'B', 'Weight (g)': '95.0',  'Owner': 'Alice Brown',  'Created Date': '2023-05-05' },
  { 'Item ID': 'ITEM-013', 'Description': 'Bushing 8mm',    'Material': 'Bronze',   'Release Status': 'Released', 'Revision': 'A', 'Weight (g)': '18.0',  'Owner': 'Bob Lee',      'Created Date': '2023-05-10' },
  { 'Item ID': 'ITEM-014', 'Description': 'Cam Follower',   'Material': 'Steel',    'Release Status': 'Released', 'Revision': 'C', 'Weight (g)': '62.0',  'Owner': 'Jane Doe',     'Created Date': '2023-06-01' },
  { 'Item ID': 'ITEM-015', 'Description': 'Key 5x5x20',     'Material': 'Steel',    'Release Status': 'Released', 'Revision': 'A', 'Weight (g)': '3.8',   'Owner': 'John Smith',   'Created Date': '2023-06-05' },
  { 'Item ID': 'ITEM-016', 'Description': 'Bearing 6205',   'Material': 'Steel',    'Release Status': 'Released', 'Revision': 'B', 'Weight (g)': '112.0', 'Owner': 'Alice Brown',  'Created Date': '2023-06-10' },
  { 'Item ID': 'ITEM-017', 'Description': 'O-Ring 50mm',    'Material': 'Rubber',   'Release Status': 'In Work',  'Revision': 'A', 'Weight (g)': '4.5',   'Owner': 'Bob Lee',      'Created Date': '2023-07-01' },
  { 'Item ID': 'ITEM-018', 'Description': 'Flange Coupler', 'Material': 'Steel',    'Release Status': 'Released', 'Revision': 'D', 'Weight (g)': '380.0', 'Owner': 'Jane Doe',     'Created Date': '2023-07-05' },
  { 'Item ID': 'ITEM-019', 'Description': 'Retaining Ring', 'Material': 'Steel',    'Release Status': 'Released', 'Revision': 'A', 'Weight (g)': '1.2',   'Owner': 'John Smith',   'Created Date': '2023-07-10' },
  { 'Item ID': 'ITEM-020', 'Description': 'Pulley 80mm',    'Material': 'Aluminum', 'Release Status': 'Released', 'Revision': 'B', 'Weight (g)': '280.0', 'Owner': 'Alice Brown',  'Created Date': '2023-07-15' },
];

// Target: 18 rows (drop ITEM-019, ITEM-020), with intentional mismatches
const TARGET_ROWS = SOURCE_ROWS.slice(0, 18).map((row) => {
  const r = { ...row };
  if (r['Item ID'] === 'ITEM-002') { r['Revision'] = 'C'; }
  if (r['Item ID'] === 'ITEM-004') { r['Description'] = 'Bracket Type B'; r['Weight (g)'] = '90.0'; }
  if (r['Item ID'] === 'ITEM-007') { r['Release Status'] = 'Released'; }
  if (r['Item ID'] === 'ITEM-012') { r['Material'] = 'Steel'; r['Owner'] = 'Bob Lee'; }
  if (r['Item ID'] === 'ITEM-016') { r['Revision'] = 'C'; }
  return r;
});

function writeExcel(rows, filePath) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, filePath);
  console.log(`Written: ${filePath} (${rows.length} rows)`);
}

const outDir = path.join(__dirname);
writeExcel(SOURCE_ROWS, path.join(outDir, 'source_sample.xlsx'));
writeExcel(TARGET_ROWS, path.join(outDir, 'target_sample.xlsx'));
