const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'instructor'], default: 'student' },
  name: { type: String, trim: true, required: true },
  studentId: {
    type: String,
    trim: true,
    uppercase: true,
    unique: true,
    sparse: true,
    match: [/^\d{9}$/, 'studentId must be exactly 9 digits']
  },
  createdAt: { type: Date, default: Date.now }
});

UserSchema.index({ studentId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('User', UserSchema);
