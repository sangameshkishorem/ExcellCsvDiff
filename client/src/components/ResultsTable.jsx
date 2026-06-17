import React, { useState, useMemo } from 'react';
import StatusBadge from './StatusBadge';

const STATUS_FILTERS = ['All', 'Full Match', 'Mismatch', 'Missing in Target', 'Missing in Source'];

export default function ResultsTable({ results, columns, joinKey }) {
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);

  const filtered = useMemo(() => {
    return results.filter((r) => {
      const matchStatus = statusFilter === 'All' || r.status === statusFilter;
      const matchSearch = r.itemId.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [results, statusFilter, search]);

  function toggleRow(itemId) {
    setExpandedRow((prev) => (prev === itemId ? null : itemId));
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <input
          type="text"
          placeholder={`Search by ${joinKey}…`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                statusFilter === s
                  ? 'bg-primary text-white border-primary'
                  : 'border-gray-300 text-gray-600 hover:border-primary'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-gray-400">{filtered.length} items</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-primary text-white">
              <th className="text-left px-4 py-3 font-semibold">{joinKey}</th>
              <th className="text-left px-4 py-3 font-semibold">Status</th>
              {columns.map((col) => (
                <th key={col} className="text-left px-4 py-3 font-semibold whitespace-nowrap">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={2 + columns.length} className="text-center py-10 text-gray-400">
                  No items match the current filter.
                </td>
              </tr>
            )}
            {filtered.map((row) => {
              const isExpanded = expandedRow === row.itemId;
              const rowBg =
                row.status === 'Full Match' ? 'bg-success/5' :
                row.status === 'Mismatch'   ? 'bg-warning/5' :
                                              'bg-danger/5';

              return (
                <React.Fragment key={row.itemId}>
                  <tr
                    onClick={() => toggleRow(row.itemId)}
                    className={`border-t border-gray-100 cursor-pointer hover:brightness-95 transition ${rowBg}`}
                  >
                    <td className="px-4 py-2.5 font-medium">{row.itemId}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={row.status} />
                    </td>
                    {columns.map((col) => {
                      const f = row.fields[col];
                      if (!f) return <td key={col} className="px-4 py-2.5 text-gray-300">—</td>;
                      if (f.match) {
                        return <td key={col} className="px-4 py-2.5">{f.source}</td>;
                      }
                      return (
                        <td key={col} className="px-4 py-2.5 text-danger font-medium">
                          {f.source || '∅'} → {f.target || '∅'}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Expanded detail row */}
                  {isExpanded && (
                    <tr className={`border-t border-gray-100 ${rowBg}`}>
                      <td colSpan={2 + columns.length} className="px-6 py-4 bg-white/60">
                        <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                          Field-by-Field Breakdown — {row.itemId}
                        </div>
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-gray-400">
                              <th className="text-left pb-1">Field</th>
                              <th className="text-left pb-1">Source Value</th>
                              <th className="text-left pb-1">Target Value</th>
                              <th className="text-left pb-1">Match</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(row.fields).map(([field, f]) => (
                              <tr key={field} className={f.match ? '' : 'text-danger'}>
                                <td className="py-0.5 pr-4 font-medium">{field}</td>
                                <td className="py-0.5 pr-4">{f.source || '∅'}</td>
                                <td className="py-0.5 pr-4">{f.target || '∅'}</td>
                                <td className="py-0.5">{f.match ? '✅' : '❌'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
