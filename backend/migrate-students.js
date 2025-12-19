require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/courseModel');

async function migrateStudents() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.MONGO_DB
    });
    console.log('MongoDB connected');
    console.log('Database name:', mongoose.connection.db.databaseName);

    // List all databases
    const admin = mongoose.connection.db.admin();
    const dbList = await admin.listDatabases();
    console.log('Available databases:', dbList.databases.map(d => d.name));

    // Use native MongoDB driver to bypass Mongoose validation
    const db = mongoose.connection.db;

    // Also check test database
    const testDb = mongoose.connection.client.db('test');
    const testCollections = await testDb.listCollections().toArray();
    console.log('Collections in test db:', testCollections.map(c => c.name));

    const testCoursesCollection = testDb.collection('courses');
    const testCount = await testCoursesCollection.countDocuments();
    console.log(`Documents in test.courses: ${testCount}`);

    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));

    const coursesCollection = db.collection('courses');

    // Check document count
    const count = await coursesCollection.countDocuments();
    console.log(`Total documents in courses collection: ${count}`);

    // Get all courses using native driver
    const courses = await coursesCollection.find({}).toArray();
    console.log(`Found ${courses.length} courses to check`);

    // Debug: show first course structure
    if (courses.length > 0) {
      console.log('Sample course structure:', JSON.stringify(courses[0], null, 2));
    }

    let migratedCount = 0;
    for (const course of courses) {
      let needsUpdate = false;
      const newStudents = [];

      if (!course.students || course.students.length === 0) {
        continue;
      }

      for (const student of course.students) {
        // Check if it's old format (direct ObjectId) or new format (nested object)
        if (!student.student) {
          // Old format - convert to new format
          newStudents.push({
            student: student,
            enrolledBy: course.instructor // Use course instructor as default enrolledBy
          });
          needsUpdate = true;
        } else {
          // Already new format
          newStudents.push(student);
        }
      }

      if (needsUpdate) {
        await coursesCollection.updateOne(
          { _id: course._id },
          { $set: { students: newStudents } }
        );
        migratedCount++;
        console.log(`Migrated course: ${course.code} - ${course.name} (${newStudents.length} students)`);
      }
    }

    console.log(`Migration completed! Migrated ${migratedCount} courses.`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

migrateStudents();
