const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    trim: true,
    enum: ['Homework', 'Quiz', 'Midterm', 'Final', 'Project', 'Lab', 'Exam', 'Other'],
    default: 'Homework'
  },
  maxScore: {
    type: Number,
    required: true,
    min: 1,
    default: 100
  },
  weight: {
    type: Number,
    min: 0,
    max: 100,
    default: 10
  },
  status: {
    type: String,
    enum: ['pending', 'graded', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Index for efficient queries
assignmentSchema.index({ course: 1, dueDate: 1 });
assignmentSchema.index({ instructor: 1 });

// Virtual to check if assignment is overdue
assignmentSchema.virtual('isOverdue').get(function() {
  return this.dueDate < new Date() && this.status === 'pending';
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;
