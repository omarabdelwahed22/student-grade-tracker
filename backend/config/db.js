const mongoose = require('mongoose');

const STATE = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting'
};

async function connect() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn('MONGO_URI not set; skipping MongoDB connection');
    return;
  }

  try {
    // Recommended options for mongoose 6+ are mostly default; keep minimal
    await mongoose.connect(uri, {
      // options left default for mongoose v6+
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }
}

function getStatus() {
  const state = mongoose.connection.readyState;
  return {
    state,
    status: STATE[state] || 'unknown'
  };
}

async function disconnect() {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (err) {
    console.error('Error during MongoDB disconnect:', err.message);
  }
}

module.exports = {
  connect,
  getStatus
};
