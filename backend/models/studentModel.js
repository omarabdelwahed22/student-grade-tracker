const mongoose = require('mongoose');

const GradeSchema = new mongoose.Schema({
  course: { type: String, required: true },
  score: { type: Number, required: true }
}, { _id: false });

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  enrolledAt: { type: Date, default: Date.now },
  grades: { type: [GradeSchema], default: [] }
});

module.exports = mongoose.model('Student', StudentSchema);
