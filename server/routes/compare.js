const express = require('express');
const { compareItems, buildSummary } = require('../services/comparisonService');

const router = express.Router();

// POST /api/compare
// Body: { sourceRows, targetRows, joinKey, columns }
// Returns: { results, summary }
router.post('/', (req, res) => {
  try {
    const { sourceRows, targetRows, joinKey, columns } = req.body;

    if (!sourceRows || !targetRows || !joinKey || !columns?.length) {
      return res.status(400).json({ error: 'Missing required fields: sourceRows, targetRows, joinKey, columns' });
    }

    const results = compareItems(sourceRows, targetRows, joinKey, columns);
    const summary = buildSummary(results, sourceRows.length, targetRows.length);

    res.json({ results, summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
