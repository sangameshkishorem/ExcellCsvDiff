const express = require('express');
const cors = require('cors');

const uploadRoutes = require('./routes/upload');
const compareRoutes = require('./routes/compare');
const exportRoutes = require('./routes/export');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.use('/api/upload', uploadRoutes);
app.use('/api/compare', compareRoutes);
app.use('/api/export', exportRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
