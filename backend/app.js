const express = require('express');
const path = require('path');

const healthRoute = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// API routes
app.use('/api/health', healthRoute);

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

app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
