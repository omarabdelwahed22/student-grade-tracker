const Course = require('../models/courseModel');

// Get all courses for the authenticated user
// - Instructors: courses they teach
// - Students: courses they're enrolled in
exports.getMyCourses = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let courses;
    if (role === 'instructor') {
      // Get courses where user is the instructor
      courses = await Course.find({ instructor: userId })
        .populate({
          path: 'students.student',
          select: 'email studentId name'
        })
        .populate({
          path: 'students.enrolledBy',
          select: 'name email _id'
        })
        .sort('-createdAt');
    } else if (role === 'student') {
      // Get courses where user is in the students array
      courses = await Course.find({ 'students.student': userId })
        .populate('instructor', 'name email')
        .sort('-createdAt');
    } else {
      return res.status(403).json({ message: 'Invalid role' });
    }

    res.json({ courses });
  } catch (err) {
    next(err);
  }
};

// Get all courses for instructors to view (visible to all instructors)
// - Instructors: all courses (can manage only their own students)
// - Students: not accessible
exports.getAllCourses = async (req, res, next) => {
  try {
    // Only instructors and admins can view all courses
    if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Instructors only.' });
    }

    const courses = await Course.find()
      .populate('instructor', 'name email _id')
      .populate({
        path: 'students.student',
        select: 'email studentId name'
      })
      .populate({
        path: 'students.enrolledBy',
        select: 'name email _id'
      })
      .sort('-createdAt');
    
    res.json({ success: true, courses });
  } catch (err) {
    next(err);
  }
};

// Get a single course by ID
exports.getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'email')
      .populate({
        path: 'students.student',
        select: 'email studentId name'
      })
      .populate({
        path: 'students.enrolledBy',
        select: 'name email _id'
      });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check authorization: instructor of the course or enrolled student
    const userId = req.user.id;
    const isInstructor = course.instructor._id.toString() === userId;
    const isEnrolled = course.students.some(s => s.student._id.toString() === userId);
    
    if (!isInstructor && !isEnrolled && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ course });
  } catch (err) {
    next(err);
  }
};

// Create a new course (instructor only)
exports.createCourse = async (req, res, next) => {
  try {
    const { name, code, description, credits, semester, year, status, completedAt } = req.body;
    
    // Set instructor to the authenticated user
    const course = new Course({
      name,
      code,
      description,
      instructor: req.user.id,
      credits,
      semester,
      year,
      status,
      completedAt
    });

    if (course.status === 'completed' && !course.completedAt) {
      course.completedAt = new Date();
    }

    await course.save();
    await course.populate('instructor', 'email');
    
    res.status(201).json({ course });
  } catch (err) {
    next(err);
  }
};

// Update a course (instructor only, must be course instructor)
exports.updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the instructor of this course
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the course instructor can update this course' });
    }

    const { name, code, description, credits, semester, year, status, completedAt } = req.body;
    
    if (name) course.name = name;
    if (code) course.code = code;
    if (description !== undefined) course.description = description;
    if (credits) course.credits = credits;
    if (semester) course.semester = semester;
    if (year) course.year = year;
    if (status) {
      course.status = status;
      if (status === 'completed' && completedAt === undefined && !course.completedAt) {
        course.completedAt = new Date();
      }
      if (status !== 'completed' && completedAt === undefined) {
        course.completedAt = null;
      }
    }
    if (completedAt !== undefined) course.completedAt = completedAt || null;

    await course.save();
    await course.populate('instructor', 'email');
    await course.populate({
      path: 'students.student',
      select: 'email studentId name'
    });
    await course.populate({
      path: 'students.enrolledBy',
      select: 'name email _id'
    });
    
    res.json({ course });
  } catch (err) {
    next(err);
  }
};

// Delete a course (instructor only, must be course instructor)
exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the instructor of this course
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the course instructor can delete this course' });
    }

    await course.deleteOne();
    
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Enroll a student in a course (any instructor can enroll their students)
exports.enrollStudent = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if student is already enrolled by this instructor
    const alreadyEnrolled = course.students.some(s => {
      // Handle both nested structure {student, enrolledBy} and direct ObjectId (legacy)
      const studentIdMatch = s.student ? s.student.toString() === studentId : s.toString() === studentId;
      const enrolledByMatch = s.enrolledBy ? s.enrolledBy.toString() === req.user.id : false;
      return studentIdMatch && (enrolledByMatch || !s.enrolledBy); // If no enrolledBy, consider it enrolled
    });
    
    if (alreadyEnrolled) {
      return res.status(400).json({ message: 'Student is already enrolled by you' });
    }

    course.students.push({
      student: studentId,
      enrolledBy: req.user.id
    });
    await course.save();
    await course.populate({
      path: 'students.student',
      select: 'email studentId name'
    });
    await course.populate({
      path: 'students.enrolledBy',
      select: 'name email _id'
    });
    
    res.json({ course, message: 'Student enrolled successfully' });
  } catch (err) {
    next(err);
  }
};

// Remove a student from a course (instructors can only unenroll their own students)
exports.unenrollStudent = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Only allow instructors to unenroll students they enrolled
    course.students = course.students.filter(s => {
      // Handle both nested structure {student, enrolledBy} and direct ObjectId (legacy)
      const studentIdMatch = s.student ? s.student.toString() === studentId : s.toString() === studentId;
      const enrolledByMatch = s.enrolledBy ? s.enrolledBy.toString() === req.user.id : true; // If no enrolledBy, allow removal
      return !(studentIdMatch && enrolledByMatch);
    });
    
    await course.save();
    await course.populate({
      path: 'students.student',
      select: 'email studentId name'
    });
    await course.populate({
      path: 'students.enrolledBy',
      select: 'name email _id'
    });
    
    res.json({ course, message: 'Student unenrolled successfully' });
  } catch (err) {
    next(err);
  }
};
