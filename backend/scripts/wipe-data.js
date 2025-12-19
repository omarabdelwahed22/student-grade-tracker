const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/userModel');
const Grade = require('../models/gradeModel');
const Assignment = require('../models/assignmentModel');
const Course = require('../models/courseModel');

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI not set');
    process.exit(1);
  }

  await mongoose.connect(uri);

  const [userRes, gradeRes, assignmentRes, courseRes] = await Promise.all([
    User.deleteMany({}),
    Grade.deleteMany({}),
    Assignment.deleteMany({}),
    Course.deleteMany({})
  ]);

  console.log('Deleted counts:', {
    users: userRes.deletedCount,
    grades: gradeRes.deletedCount,
    assignments: assignmentRes.deletedCount,
    courses: courseRes.deletedCount
  });

  console.log('Note: statistics are derived from grades; clearing grades removes them.');

  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
