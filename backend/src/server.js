require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

// PORT setup
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ======================
// HEALTH ROUTES
// ======================
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend is running',
    timestamp: new Date()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API is running'
  });
});

// ======================
// ERROR HANDLER
// ======================
app.use((err, req, res, next) => {
  console.error('Error:', err);

  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// ======================
// 404 HANDLER
// ======================
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

// ======================
// START SERVER
// ======================
app.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════');

  console.log(`Server running on port ${PORT}`);

  console.log(`✓ Health check: http://localhost:${PORT}/health`);
  console.log(`✓ API: http://localhost:${PORT}/api/health`);
  console.log(`✓ Environment: ${process.env.NODE_ENV}`);

  console.log('═══════════════════════════════════════');
  console.log('');
});

module.exports = app;