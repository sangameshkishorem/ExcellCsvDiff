import React, { useState, useEffect, useMemo } from 'react';
import DropZone from '../components/DropZone';
import LoadingSpinner from '../components/LoadingSpinner';
import { uploadFiles, runComparison } from '../api';

let _nextId = 0;
function createPair() {
  return {
    id: _nextId++,
    sourceFile: null,
    targetFile: null,
    uploadedData: null,
    joinKey: '',
    selectedCols: [],
    error: null,
    loading: false,
  };
}

export default function UploadPage({ onComparisonComplete }) {
  const [pairs, setPairs] = useState([createPair()]);
  const [comparing, setComparing] = useState(false);
  const [globalError, setGlobalError] = useState(null);

  function updatePair(id, updates) {
    setPairs(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }

  // Auto-upload when both files are set for any pair
  useEffect(() => {
    pairs
      .filter(p => p.sourceFile && p.targetFile && !p.uploadedData && !p.loading && !p.error)
      .forEach(pair => {
        updatePair(pair.id, { loading: true, error: null });
        uploadFiles(pair.sourceFile, pair.targetFile)
          .then(data => {
            const firstHeader = data.source.headers[0] ?? '';
            updatePair(pair.id, {
              uploadedData: data,
              joinKey: firstHeader,
              selectedCols: data.source.headers.filter(h => h !== firstHeader),
              loading: false,
            });
          })
          .catch(err => {
            updatePair(pair.id, {
              error: err.response?.data?.error ?? err.message,
              loading: false,
            });
          });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pairs]);

  function addPair() {
    setPairs(prev => [...prev, createPair()]);
  }

  function removePair(id) {
    setPairs(prev => prev.filter(p => p.id !== id));
  }

  function setFile(id, side, file) {
    updatePair(id, {
      [side === 'source' ? 'sourceFile' : 'targetFile']: file,
      uploadedData: null,
      joinKey: '',
      selectedCols: [],
      error: null,
    });
  }

  function toggleCol(id, col) {
    setPairs(prev => prev.map(p => {
      if (p.id !== id) return p;
      const selectedCols = p.selectedCols.includes(col)
        ? p.selectedCols.filter(c => c !== col)
        : [...p.selectedCols, col];
      return { ...p, selectedCols };
    }));
  }

  function setJoinKey(id, key) {
    setPairs(prev => prev.map(p => {
      if (p.id !== id) return p;
      return { ...p, joinKey: key, selectedCols: p.selectedCols.filter(c => c !== key) };
    }));
  }

  const readyPairs = pairs.filter(p => p.uploadedData && p.joinKey && p.selectedCols.length > 0);
  const canCompare = readyPairs.length > 0 && !comparing;

  async function handleCompareAll() {
    if (!canCompare) return;
    setComparing(true);
    setGlobalError(null);
    try {
      const results = await Promise.all(
        readyPairs.map(pair =>
          runComparison(
            pair.uploadedData.source.rows,
            pair.uploadedData.target.rows,
            pair.joinKey,
            pair.selectedCols
          ).then(result => ({
            ...result,
            columns: pair.selectedCols,
            joinKey: pair.joinKey,
            sourceFileName: pair.uploadedData.source.fileName,
            targetFileName: pair.uploadedData.target.fileName,
          }))
        )
      );
      onComparisonComplete(results);
    } catch (err) {
      setGlobalError(err.response?.data?.error ?? err.message);
    } finally {
      setComparing(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      {comparing && <LoadingSpinner message="Running comparisons…" />}

      <h1 className="text-2xl font-bold text-primary mb-2">Upload Files</h1>
      <p className="text-gray-500 mb-8 text-sm">
        Upload file pairs to compare. Add more pairs with the button below.
      </p>

      {pairs.map((pair, idx) => (
        <PairCard
          key={pair.id}
          pair={pair}
          index={idx}
          canRemove={pairs.length > 1}
          onRemove={() => removePair(pair.id)}
          onSetFile={(side, file) => setFile(pair.id, side, file)}
          onToggleCol={col => toggleCol(pair.id, col)}
          onSetJoinKey={key => setJoinKey(pair.id, key)}
          onSelectAll={() => updatePair(pair.id, {
            selectedCols: pair.uploadedData.source.headers.filter(h => h !== pair.joinKey),
          })}
          onClearCols={() => updatePair(pair.id, { selectedCols: [] })}
        />
      ))}

      <button
        onClick={addPair}
        className="w-full border-2 border-dashed border-gray-300 hover:border-accent text-gray-400 hover:text-accent rounded-xl py-3 text-sm font-medium transition-colors mb-6"
      >
        + Add Another Pair
      </button>

      {globalError && (
        <div className="bg-danger/10 text-danger border border-danger/30 rounded-lg p-4 mb-6 text-sm">
          {globalError}
        </div>
      )}

      <button
        onClick={handleCompareAll}
        disabled={!canCompare}
        className="bg-accent text-white font-semibold px-8 py-3 rounded-lg hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-base"
      >
        Compare All →
      </button>
    </div>
  );
}

function PairCard({ pair, index, canRemove, onRemove, onSetFile, onToggleCol, onSetJoinKey, onSelectAll, onClearCols }) {
  const targetHeadersLower = useMemo(() => {
    if (!pair.uploadedData) return new Set();
    return new Set(pair.uploadedData.target.headers.map(h => h.toLowerCase()));
  }, [pair.uploadedData]);

  return (
    <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200">
        <span className="text-sm font-semibold text-primary">Pair {index + 1}</span>
        {canRemove && (
          <button
            onClick={onRemove}
            className="text-gray-400 hover:text-danger text-xl leading-none"
            title="Remove this pair"
          >
            ×
          </button>
        )}
      </div>

      <div className="p-5">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Source File</div>
            <DropZone
              label="Source File"
              onFile={f => onSetFile('source', f)}
              file={pair.sourceFile}
              rowCount={pair.uploadedData?.source?.rowCount}
            />
          </div>
          <div>
            <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Target File</div>
            <DropZone
              label="Target File"
              onFile={f => onSetFile('target', f)}
              file={pair.targetFile}
              rowCount={pair.uploadedData?.target?.rowCount}
            />
          </div>
        </div>

        {pair.loading && (
          <div className="text-sm text-gray-400 text-center py-2">Parsing files…</div>
        )}

        {pair.error && (
          <div className="bg-danger/10 text-danger border border-danger/30 rounded-lg p-3 text-sm">
            {pair.error}
          </div>
        )}

        {pair.uploadedData && (
          <div className="border-t border-gray-100 pt-4 mt-2">
            <h3 className="text-sm font-semibold text-primary mb-3">Configure Comparison</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Join Key Column</label>
              <select
                value={pair.joinKey}
                onChange={e => onSetJoinKey(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {pair.uploadedData.source.headers.map(h => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Columns to Compare</label>
                <div className="flex gap-3 text-xs text-accent">
                  <button onClick={onSelectAll}>Select All</button>
                  <button onClick={onClearCols}>Clear</button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
                {pair.uploadedData.source.headers
                  .filter(h => h !== pair.joinKey)
                  .map(h => (
                    <label key={h} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pair.selectedCols.includes(h)}
                        onChange={() => onToggleCol(h)}
                        className="accent-accent"
                      />
                      <span className="truncate" title={h}>{h}</span>
                      {!targetHeadersLower.has(h.toLowerCase()) && (
                        <span className="text-warning text-xs" title="Column not in target file">⚠️</span>
                      )}
                    </label>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
