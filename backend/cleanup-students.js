require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/courseModel');
const User = require('./models/userModel');

async function cleanupStudents() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.MONGO_DB
    });
    console.log('MongoDB connected');
    console.log('Database name:', mongoose.connection.db.databaseName);

    const db = mongoose.connection.db;
    const coursesCollection = db.collection('courses');
    const usersCollection = db.collection('users');

    // Step 1: Remove students with no name or ID from courses
    console.log('\n--- Cleaning up courses ---');
    const courses = await coursesCollection.find({}).toArray();
    console.log(`Found ${courses.length} courses to check`);

    let removedCount = 0;
    for (const course of courses) {
      if (!course.students || course.students.length === 0) {
        continue;
      }

      const originalLength = course.students.length;
      const cleanedStudents = course.students.filter(enrollment => {
        const student = enrollment?.student || enrollment;
        // Keep only students with both name and studentId
        return student?.name && student?.studentId;
      });

      if (cleanedStudents.length < originalLength) {
        const removed = originalLength - cleanedStudents.length;
        await coursesCollection.updateOne(
          { _id: course._id },
          { $set: { students: cleanedStudents } }
        );
        removedCount += removed;
        console.log(`${course.code} - ${course.name}: Removed ${removed} invalid student(s) (${cleanedStudents.length} remaining)`);
      }
    }

    // Step 2: Delete users with no name from users collection
    console.log('\n--- Cleaning up users ---');
    const usersWithoutName = await usersCollection.find({
      $or: [
        { name: { $exists: false } },
        { name: null },
        { name: '' },
        { studentId: { $exists: false } },
        { studentId: null },
        { studentId: '' }
      ]
    }).toArray();

    if (usersWithoutName.length > 0) {
      const deleteResult = await usersCollection.deleteMany({
        $or: [
          { name: { $exists: false } },
          { name: null },
          { name: '' },
          { studentId: { $exists: false } },
          { studentId: null },
          { studentId: '' }
        ]
      });
      console.log(`Deleted ${deleteResult.deletedCount} users without proper name or studentId`);
    } else {
      console.log('No invalid users found');
    }

    console.log('\n✅ Cleanup completed!');
    console.log(`Total removed from courses: ${removedCount} student(s)`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Cleanup failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

cleanupStudents();
