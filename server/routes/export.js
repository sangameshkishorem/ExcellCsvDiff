const express = require('express');
const { buildExportWorkbook } = require('../services/excelExporter');

const router = express.Router();

// POST /api/export
// Body: { results, summary, columns, joinKey }
// Returns: xlsx file as download
router.post('/', async (req, res) => {
  try {
    const { results, summary, columns, joinKey } = req.body;

    if (!results || !summary || !columns || !joinKey) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const buffer = await buildExportWorkbook(results, summary, columns, joinKey);
    const fileName = `migration-comparison-${new Date().toISOString().slice(0, 10)}.xlsx`;

    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
