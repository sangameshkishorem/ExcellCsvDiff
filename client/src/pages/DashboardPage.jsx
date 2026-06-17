import React, { useState } from 'react';
import KpiCard from '../components/KpiCard';
import SummaryChart from '../components/SummaryChart';
import ResultsTable from '../components/ResultsTable';
import LoadingSpinner from '../components/LoadingSpinner';
import { exportToExcel } from '../api';

export default function DashboardPage({ data }) {
  const [activeTab, setActiveTab] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  const current = data[activeTab] ?? data[0];
  const { results, summary, columns, joinKey, sourceFileName, targetFileName } = current;

  async function handleExport() {
    setExporting(true);
    setError(null);
    try {
      await exportToExcel(results, summary, columns, joinKey);
    } catch (err) {
      setError(err.response?.data?.error ?? err.message);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      {exporting && <LoadingSpinner message="Generating Excel report…" />}

      {/* Tabs — only shown for multiple pairs */}
      {data.length > 1 && (
        <div className="flex flex-wrap gap-1 mb-6 border-b border-gray-200">
          {data.map((d, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg border border-b-0 transition-colors max-w-xs truncate ${
                i === activeTab
                  ? 'bg-white border-gray-200 text-primary'
                  : 'bg-gray-50 border-transparent text-gray-400 hover:text-gray-600'
              }`}
              title={`${d.sourceFileName} → ${d.targetFileName}`}
            >
              {d.sourceFileName} → {d.targetFileName}
            </button>
          ))}
        </div>
      )}

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Comparison Results</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {sourceFileName} → {targetFileName} &nbsp;·&nbsp; Join key: <b>{joinKey}</b>
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          ⬇ Export to Excel
        </button>
      </div>

      {error && (
        <div className="bg-danger/10 text-danger border border-danger/30 rounded-lg p-3 mb-5 text-sm">
          {error}
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <KpiCard label="Source Items"      value={summary.totalSource}      color="default" />
        <KpiCard label="Target Items"      value={summary.totalTarget}      color="default" />
        <KpiCard label="Full Matches"      value={summary.matched}          color="success" />
        <KpiCard label="Mismatches"        value={summary.mismatched}       color="warning" />
        <KpiCard label="Missing in Target" value={summary.missingInTarget}  color="danger"  />
        <KpiCard label="Missing in Source" value={summary.missingInSource}  color="danger"  />
      </div>

      {/* Chart + success rate */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="text-sm font-semibold text-gray-600 mb-3">Comparison Breakdown</div>
          <SummaryChart summary={summary} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col items-center justify-center">
          <div className="text-6xl font-bold text-primary">{summary.successRate}%</div>
          <div className="text-sm text-gray-400 mt-2">Success Rate</div>
          <div className="text-xs text-gray-300 mt-1">(Matched / Source Items)</div>
        </div>
      </div>

      {/* Results table */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div className="text-sm font-semibold text-gray-600 mb-4">Item Details</div>
        <ResultsTable results={results} columns={columns} joinKey={joinKey} />
      </div>
    </div>
  );
}
