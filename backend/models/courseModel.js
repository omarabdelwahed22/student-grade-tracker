const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Course code is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  description: {
    type: String,
    trim: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Instructor is required']
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  credits: {
    type: Number,
    default: 3,
    min: 1,
    max: 6
  },
  semester: {
    type: String,
    trim: true
  },
  year: {
    type: Number
  }
}, {
  timestamps: true
});

// Index for faster queries
courseSchema.index({ instructor: 1 });
courseSchema.index({ students: 1 });

module.exports = mongoose.model('Course', courseSchema);
