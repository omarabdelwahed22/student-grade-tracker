const { Types } = require('mongoose');
const Grade = require('../models/gradeModel');
const Course = require('../models/courseModel');

// GPA helper: map percentage to 4.0 scale
function percentageToGpa(pct) {
  if (pct >= 90) return 4.0;
  if (pct >= 85) return 3.7;
  if (pct >= 80) return 3.3;
  if (pct >= 75) return 3.0;
  if (pct >= 70) return 2.7;
  if (pct >= 65) return 2.3;
  if (pct >= 60) return 2.0;
  if (pct >= 55) return 1.7;
  if (pct >= 50) return 1.0;
  return 0.0;
}

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
    const { studentId, courseId, category, weight, score, maxScore, letterGrade, feedback } = req.body;

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
      category,
      weight,
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

    const { category, weight, score, maxScore, letterGrade, feedback } = req.body;

    if (category !== undefined) grade.category = category;
    if (weight !== undefined) grade.weight = weight;
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

/**
 * @desc    Get GPA for the current student (or specified studentId for instructors)
 * @route   GET /api/grades/gpa
 * @access  Private
 */
exports.getGpa = async (req, res, next) => {
  try {
    const isInstructor = req.user.role === 'instructor';
    const studentId = isInstructor ? (req.query.studentId || null) : req.user.id;

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'studentId is required for instructors' });
    }

    if (!Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: 'Invalid studentId' });
    }

    const studentObjectId = new Types.ObjectId(studentId);

    const courseAggregates = await Grade.aggregate([
      { $match: { student: studentObjectId } },
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      {
        $group: {
          _id: '$course._id',
          courseName: { $first: '$course.name' },
          courseCode: { $first: '$course.code' },
          credits: { $first: '$course.credits' },
          totalScore: { $sum: '$score' },
          totalMax: { $sum: '$maxScore' }
        }
      },
      {
        $addFields: {
          percentage: {
            $cond: [
              { $gt: ['$totalMax', 0] },
              { $multiply: [{ $divide: ['$totalScore', '$totalMax'] }, 100] },
              0
            ]
          }
        }
      }
    ]);

    if (!courseAggregates.length) {
      return res.json({ success: true, gpa: 0, totalCredits: 0, breakdown: [] });
    }

    const breakdown = courseAggregates.map(c => {
      const credits = Number(c.credits) || 3;
      const percentage = Number(c.percentage?.toFixed(2));
      const points = percentageToGpa(percentage);
      return {
        courseId: c._id,
        courseCode: c.courseCode,
        courseName: c.courseName,
        credits,
        percentage,
        points
      };
    });

    const totalCredits = breakdown.reduce((sum, c) => sum + c.credits, 0);
    const totalQualityPoints = breakdown.reduce((sum, c) => sum + c.points * c.credits, 0);
    const gpa = totalCredits > 0 ? Number((totalQualityPoints / totalCredits).toFixed(2)) : 0;

    res.json({
      success: true,
      gpa,
      totalCredits,
      breakdown
    });
  } catch (error) {
    next(error);
  }
};
