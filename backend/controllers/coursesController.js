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
        .populate('students', 'email studentId name')
        .sort('-createdAt');
    } else if (role === 'student') {
      // Get courses where user is in the students array
      courses = await Course.find({ students: userId })
        .populate('instructor', 'email')
        .sort('-createdAt');
    } else {
      return res.status(403).json({ message: 'Invalid role' });
    }

    res.json({ courses });
  } catch (err) {
    next(err);
  }
};

// Get all courses (admin/instructor view)
exports.getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find()
      .populate('instructor', 'email')
      .populate('students', 'email studentId name')
      .sort('-createdAt');
    res.json({ courses });
  } catch (err) {
    next(err);
  }
};

// Get a single course by ID
exports.getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'email')
      .populate('students', 'email studentId name');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check authorization: instructor of the course or enrolled student
    const userId = req.user.id;
    const isInstructor = course.instructor._id.toString() === userId;
    const isEnrolled = course.students.some(s => s._id.toString() === userId);
    
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
    const { name, code, description, credits, semester, year } = req.body;
    
    // Set instructor to the authenticated user
    const course = new Course({
      name,
      code,
      description,
      instructor: req.user.id,
      credits,
      semester,
      year
    });

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

    const { name, code, description, credits, semester, year } = req.body;
    
    if (name) course.name = name;
    if (code) course.code = code;
    if (description !== undefined) course.description = description;
    if (credits) course.credits = credits;
    if (semester) course.semester = semester;
    if (year) course.year = year;

    await course.save();
    await course.populate('instructor', 'email');
    await course.populate('students', 'email studentId name');
    
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

// Enroll a student in a course (instructor only)
exports.enrollStudent = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the instructor of this course
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the course instructor can enroll students' });
    }

    // Check if student is already enrolled
    if (course.students.includes(studentId)) {
      return res.status(400).json({ message: 'Student is already enrolled' });
    }

    course.students.push(studentId);
    await course.save();
    await course.populate('students', 'email studentId name');
    
    res.json({ course, message: 'Student enrolled successfully' });
  } catch (err) {
    next(err);
  }
};

// Remove a student from a course (instructor only)
exports.unenrollStudent = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is the instructor of this course
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the course instructor can unenroll students' });
    }

    course.students = course.students.filter(s => s.toString() !== studentId);
    await course.save();
    await course.populate('students', 'email studentId name');
    
    res.json({ course, message: 'Student unenrolled successfully' });
  } catch (err) {
    next(err);
  }
};
