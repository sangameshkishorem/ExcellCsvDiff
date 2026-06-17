import React, { useState } from 'react';
import UploadPage from './pages/UploadPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  const [page, setPage] = useState('upload'); // 'upload' | 'dashboard'
  const [comparisonData, setComparisonData] = useState(null);

  function handleComparisonComplete(results) {
    setComparisonData(results); // array of comparison results
    setPage('dashboard');
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="bg-primary text-white py-3 px-6 flex items-center gap-4 shadow">
        <button
          onClick={() => setPage('upload')}
          className="text-white font-bold text-lg tracking-wide hover:opacity-80"
        >
          ExcelDiff
        </button>
        {page === 'dashboard' && (
          <button
            onClick={() => { setPage('upload'); setComparisonData(null); }}
            className="ml-auto text-sm bg-white/10 hover:bg-white/20 px-3 py-1 rounded"
          >
            ← New Comparison
          </button>
        )}
      </header>

      {/* Page content */}
      {page === 'upload' && (
        <UploadPage onComparisonComplete={handleComparisonComplete} />
      )}
      {page === 'dashboard' && comparisonData && (
        <DashboardPage data={comparisonData} />
      )}
    </div>
  );
}
