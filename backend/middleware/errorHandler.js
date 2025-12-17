// Centralized error handling middleware
module.exports = (err, req, res, next) => {
  // Handle mongoose duplicate key error
  if (err && err.code === 11000) {
    const key = Object.keys(err.keyValue || {}).join(', ');
    return res.status(409).json({ message: `Duplicate value for field(s): ${key}` });
  }

  // Validation errors from express-validator come through as normal responses, but keep fallback
  console.error(err && err.stack ? err.stack : err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
};
