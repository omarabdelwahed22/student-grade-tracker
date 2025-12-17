// Centralized error handling middleware
module.exports = (err, req, res, next) => {
  // Handle mongoose duplicate key error
  if (err && err.code === 11000) {
    const key = Object.keys(err.keyValue || {}).join(', ');
    return res.status(409).json({ message: `${key} already exists. Please use a different one.` });
  }

  // Handle mongoose validation errors
  if (err && err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message).join(', ');
    return res.status(400).json({ message: messages });
  }

  // Log error for debugging
  console.error('Error:', err && err.stack ? err.stack : err);
  
  // Send user-friendly error message
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({ message });
};
