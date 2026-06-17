# ExcelDiff

A full-stack web tool for comparing two Excel files row by row. Upload any two `.xlsx` files, pick a join key, choose which columns to compare, and get an interactive dashboard with match/mismatch/missing breakdown — plus a color-coded Excel export.

## Features

- **Any Excel file** — columns auto-detected from headers, no configuration needed
- **Flexible join key** — pick any column as the row identifier
- **Column selection** — compare all columns or a chosen subset
- **Interactive dashboard** — KPI cards, donut chart, filterable table with click-to-expand detail
- **Excel export** — 4-sheet color-coded workbook (Summary, Full Comparison, Mismatches Only, Missing Items)

## Quick Start

### Prerequisites
- Node.js 18+

### 1. Start the backend
```
cd server
npm install
npm start
```
API runs on http://localhost:3001

### 2. Start the frontend (new terminal)
```
cd client
npm install
npm run dev
```
App opens on http://localhost:5173

### 3. Try the sample data
Upload files from the `sample-data/` directory:
- **Source:** `source_sample.xlsx` (20 rows, 8 columns)
- **Target:** `target_sample.xlsx` (18 rows — 2 missing, 5 with field differences)

Set **Join Key** to `Item ID`, select all other columns, click **Run Comparison**.

Expected: 13 Full Match · 5 Mismatch · 2 Missing in Target · 0 Missing in Source

## Project Structure
```
ExcelDiff/
├── client/          # React + Vite frontend (port 5173)
│   └── src/
│       ├── pages/       # UploadPage, DashboardPage
│       └── components/  # DropZone, ResultsTable, SummaryChart, KpiCard, ...
├── server/          # Express API (port 3001)
│   ├── routes/      # upload, compare, export
│   └── services/    # excelParser, comparisonService, excelExporter
└── sample-data/     # Test Excel files + generator script
```

## API Reference
| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET  /api/health` | GET | Health check |
| `POST /api/upload` | POST | Upload source + target Excel files (multipart: `source`, `target`) |
| `POST /api/compare` | POST | Compare parsed rows — body: `{ sourceRows, targetRows, joinKey, columns }` |
| `POST /api/export` | POST | Download 4-sheet Excel report — body: `{ results, summary, columns, joinKey }` |

## How Comparison Works

| Status | Meaning |
|--------|---------|
| Full Match | Row exists in both files; all selected columns are identical |
| Mismatch | Row exists in both files; at least one column differs |
| Missing in Target | Row found in source but not in target |
| Missing in Source | Row found in target but not in source |

Values are trimmed and compared as strings. Dates are normalised to `YYYY-MM-DD` before comparison to avoid format drift.
