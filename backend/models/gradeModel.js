const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  assignmentName: {
    type: String,
    trim: true
  },
  score: {
    type: Number,
    required: true,
    min: 0
  },
  maxScore: {
    type: Number,
    required: true,
    min: 1
  },
  category: {
    type: String,
    trim: true,
    enum: ['Quiz', 'Midterm', 'Final', 'Project', 'Lab', 'Exam', 'Assignment', 'Other'],
    default: 'Assignment'
  },
  weight: {
    type: Number,
    min: 0,
    max: 100,
    default: 10
  },
  letterGrade: {
    type: String,
    trim: true,
    uppercase: true
  },
  feedback: {
    type: String,
    trim: true
  },
  dueDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
gradeSchema.index({ student: 1, course: 1 });
gradeSchema.index({ course: 1 });

// Calculate percentage
gradeSchema.virtual('percentage').get(function() {
  return ((this.score / this.maxScore) * 100).toFixed(2);
});

// Auto-calculate letter grade if not provided
gradeSchema.pre('save', function() {
  if (!this.letterGrade) {
    const percentage = (this.score / this.maxScore) * 100;
    if (percentage >= 90) this.letterGrade = 'A';
    else if (percentage >= 80) this.letterGrade = 'B';
    else if (percentage >= 70) this.letterGrade = 'C';
    else if (percentage >= 60) this.letterGrade = 'D';
    else this.letterGrade = 'F';
  }
});

const Grade = mongoose.model('Grade', gradeSchema);

module.exports = Grade;
