const Grade = require('../models/gradeModel');
const Course = require('../models/courseModel');

/**
 * @desc    Get grades (role-based filtering)
 * @route   GET /api/grades
 * @access  Private
 */
exports.getGrades = async (req, res, next) => {
  try {
    const { studentId, courseId } = req.query;
    let query = {};

    if (req.user.role === 'student') {
      // Students can only see their own grades
      query.student = req.user.id;
    } else if (req.user.role === 'instructor') {
      // Instructors can see grades for their courses
      const instructorCourses = await Course.find({ instructor: req.user.id }).select('_id');
      const courseIds = instructorCourses.map(c => c._id);
      query.course = { $in: courseIds };
    }

    // Apply additional filters if provided
    if (studentId) query.student = studentId;
    if (courseId) query.course = courseId;

    const grades = await Grade.find(query)
      .populate('student', 'email name studentId')
      .populate('course', 'name code')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: grades.length,
      grades
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single grade by ID
 * @route   GET /api/grades/:id
 * @access  Private
 */
exports.getGradeById = async (req, res, next) => {
  try {
    const grade = await Grade.findById(req.params.id)
      .populate('student', 'email name studentId')
      .populate('course', 'name code');

    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }

    // Authorization check
    if (req.user.role === 'student' && grade.student._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this grade'
      });
    }

    // Check if instructor owns the course
    if (req.user.role === 'instructor') {
      const course = await Course.findById(grade.course._id);
      if (course.instructor.toString() !== req.user.id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this grade'
        });
      }
    }

    res.json({
      success: true,
      grade
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new grade
 * @route   POST /api/grades
 * @access  Private (Instructor only)
 */
exports.createGrade = async (req, res, next) => {
  try {
    const { studentId, courseId, assignment, score, maxScore, letterGrade, feedback } = req.body;

    // Verify the course belongs to the instructor
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.instructor.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add grades for this course'
      });
    }

    // Verify student is enrolled in the course
    const enrolled = course.students.some(s => s.toString() === studentId);
    if (!enrolled) {
      return res.status(400).json({
        success: false,
        message: 'Student is not enrolled in this course'
      });
    }

    const grade = await Grade.create({
      student: studentId,
      course: courseId,
      assignment,
      score,
      maxScore,
      letterGrade,
      feedback
    });

    const populatedGrade = await Grade.findById(grade._id)
      .populate('student', 'email name studentId')
      .populate('course', 'name code');

    res.status(201).json({
      success: true,
      grade: populatedGrade
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update grade
 * @route   PUT /api/grades/:id
 * @access  Private (Instructor only)
 */
exports.updateGrade = async (req, res, next) => {
  try {
    const grade = await Grade.findById(req.params.id);

    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }

    // Verify the course belongs to the instructor
    const course = await Course.findById(grade.course);
    if (course.instructor.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this grade'
      });
    }

    const { assignment, score, maxScore, letterGrade, feedback } = req.body;

    if (assignment !== undefined) grade.assignment = assignment;
    if (score !== undefined) grade.score = score;
    if (maxScore !== undefined) grade.maxScore = maxScore;
    if (letterGrade !== undefined) grade.letterGrade = letterGrade;
    if (feedback !== undefined) grade.feedback = feedback;

    await grade.save();

    const updatedGrade = await Grade.findById(grade._id)
      .populate('student', 'email name studentId')
      .populate('course', 'name code');

    res.json({
      success: true,
      grade: updatedGrade
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete grade
 * @route   DELETE /api/grades/:id
 * @access  Private (Instructor only)
 */
exports.deleteGrade = async (req, res, next) => {
  try {
    const grade = await Grade.findById(req.params.id);

    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }

    // Verify the course belongs to the instructor
    const course = await Course.findById(grade.course);
    if (course.instructor.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this grade'
      });
    }

    await grade.deleteOne();

    res.json({
      success: true,
      message: 'Grade deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get course statistics
 * @route   GET /api/grades/course/:courseId/stats
 * @access  Private (Instructor only)
 */
exports.getCourseStats = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.instructor.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view course statistics'
      });
    }

    const grades = await Grade.find({ course: req.params.courseId });

    if (grades.length === 0) {
      return res.json({
        success: true,
        stats: {
          totalGrades: 0,
          averageScore: 0,
          highestScore: 0,
          lowestScore: 0
        }
      });
    }

    const percentages = grades.map(g => (g.score / g.maxScore) * 100);
    const average = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
    const highest = Math.max(...percentages);
    const lowest = Math.min(...percentages);

    res.json({
      success: true,
      stats: {
        totalGrades: grades.length,
        averageScore: average.toFixed(2),
        highestScore: highest.toFixed(2),
        lowestScore: lowest.toFixed(2)
      }
    });
  } catch (error) {
    next(error);
  }
};
