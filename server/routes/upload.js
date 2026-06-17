const express = require('express');
const multer = require('multer');
const path = require('path');
const { parseExcelBuffer } = require('../services/excelParser');

const router = express.Router();

const storage = multer.memoryStorage(); // keep files in RAM, no disk write needed
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.xlsx' || ext === '.xls' || ext === '.csv') {
      cb(null, true);
    } else {
      cb(new Error('Only .xlsx, .xls, and .csv files are allowed'));
    }
  },
});

// POST /api/upload
// Accepts: multipart with fields "source" and "target"
// Returns: { source: { headers, rowCount, rows, fileName }, target: { headers, rowCount, rows, fileName } }
router.post('/', upload.fields([{ name: 'source' }, { name: 'target' }]), (req, res) => {
  try {
    if (!req.files?.source || !req.files?.target) {
      return res.status(400).json({ error: 'Both source and target files are required' });
    }

    const sourceResult = parseExcelBuffer(req.files.source[0].buffer);
    const targetResult = parseExcelBuffer(req.files.target[0].buffer);

    if (sourceResult.rowCount === 0) {
      return res.status(400).json({ error: 'Source file appears to be empty or has no data rows' });
    }
    if (targetResult.rowCount === 0) {
      return res.status(400).json({ error: 'Target file appears to be empty or has no data rows' });
    }

    res.json({
      source: {
        headers: sourceResult.headers,
        rowCount: sourceResult.rowCount,
        rows: sourceResult.rows,
        fileName: req.files.source[0].originalname,
      },
      target: {
        headers: targetResult.headers,
        rowCount: targetResult.rowCount,
        rows: targetResult.rows,
        fileName: req.files.target[0].originalname,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
