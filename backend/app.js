const express = require('express');
const path = require('path');
// Load .env from the backend folder if present
require('dotenv').config({ path: path.join(__dirname, '.env') });

const healthRoute = require('./routes/health');
const db = require('./config/db');
const morgan = require('morgan');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const authRoute = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
// Logging and CORS
app.use(morgan('dev'));
app.use(cors());

// API routes
app.use('/api/health', healthRoute);
// Students routes
const studentsRoute = require('./routes/students');
app.use('/api/students', studentsRoute);
// Auth routes
app.use('/api/auth', authRoute);

// Basic root route
app.get('/', (req, res) => {
  res.json({ message: 'Student Grade Tracker API' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// Use centralized error handler (duplicate-key handling etc.)
app.use(errorHandler);

// Connect to DB (async) and start server
const serverPromise = db.connect().then(() => {
  return new Promise((resolve) => {
    const server = app.listen(PORT, () => {
      console.log(`Backend listening on port ${PORT}`);
      resolve(server);
    });
  });
});

// Graceful shutdown
async function shutdown(signal) {
  console.log(`Received ${signal}. Closing server...`);
  try {
    const server = await serverPromise;
    server.close(async (err) => {
      if (err) {
        console.error('Error closing server', err);
        process.exit(1);
      }
      await db.disconnect();
      console.log('Shutdown complete');
      process.exit(0);
    });
  } catch (err) {
    console.error('Error during shutdown', err);
    process.exit(1);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
