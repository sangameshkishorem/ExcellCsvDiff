/**
 * Compare source and target datasets.
 *
 * @param {object[]} sourceRows  - parsed rows from source file
 * @param {object[]} targetRows  - parsed rows from target file
 * @param {string}   joinKey     - column name to join on
 * @param {string[]} columns     - column names to compare
 * @returns {ComparisonResult[]}
 *
 * ComparisonResult: {
 *   itemId: string,
 *   status: 'Full Match' | 'Mismatch' | 'Missing in Target' | 'Missing in Source',
 *   fields: { [col]: { source: string, target: string, match: boolean } }
 * }
 */
function compareItems(sourceRows, targetRows, joinKey, columns) {
  const sourceMap = new Map();
  sourceRows.forEach((row) => {
    const key = String(row[joinKey] ?? '').trim();
    if (key) sourceMap.set(key, row);
  });

  const targetMap = new Map();
  targetRows.forEach((row) => {
    const key = String(row[joinKey] ?? '').trim();
    if (key) targetMap.set(key, row);
  });

  const results = [];

  // Items in source
  sourceMap.forEach((srcRow, itemId) => {
    if (!targetMap.has(itemId)) {
      const fields = {};
      columns.forEach((col) => {
        fields[col] = { source: String(srcRow[col] ?? '').trim(), target: '', match: false };
      });
      results.push({ itemId, status: 'Missing in Target', fields });
      return;
    }

    const tgtRow = targetMap.get(itemId);
    const fields = {};
    let allMatch = true;

    columns.forEach((col) => {
      const src = String(srcRow[col] ?? '').trim();
      const tgt = String(tgtRow[col] ?? '').trim();
      const match = src === tgt;
      if (!match) allMatch = false;
      fields[col] = { source: src, target: tgt, match };
    });

    results.push({
      itemId,
      status: allMatch ? 'Full Match' : 'Mismatch',
      fields,
    });
  });

  // Items only in target
  targetMap.forEach((tgtRow, itemId) => {
    if (!sourceMap.has(itemId)) {
      const fields = {};
      columns.forEach((col) => {
        fields[col] = { source: '', target: String(tgtRow[col] ?? '').trim(), match: false };
      });
      results.push({ itemId, status: 'Missing in Source', fields });
    }
  });

  return results;
}

/**
 * Compute KPI summary from comparison results.
 */
function buildSummary(results, sourceRowCount, targetRowCount) {
  const counts = {
    totalSource: sourceRowCount,
    totalTarget: targetRowCount,
    matched: 0,
    mismatched: 0,
    missingInTarget: 0,
    missingInSource: 0,
  };

  results.forEach(({ status }) => {
    if (status === 'Full Match') counts.matched++;
    else if (status === 'Mismatch') counts.mismatched++;
    else if (status === 'Missing in Target') counts.missingInTarget++;
    else if (status === 'Missing in Source') counts.missingInSource++;
  });

  counts.successRate =
    counts.totalSource > 0
      ? ((counts.matched / counts.totalSource) * 100).toFixed(1)
      : '0.0';

  return counts;
}

module.exports = { compareItems, buildSummary };
