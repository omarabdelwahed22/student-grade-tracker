const db = require('../config/db');

exports.getHealth = (req, res) => {
  const dbStatus = db.getStatus();
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: Date.now(),
    db: dbStatus
  });
};
