const { Types } = require('mongoose');
const Grade = require('../models/gradeModel');
const Course = require('../models/courseModel');
const Notification = require('../models/notificationModel');

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
    console.log('createGrade called with body:', req.body);
    const { studentId, courseId, assignmentName, category, weight, score, maxScore, letterGrade, feedback, dueDate } = req.body;

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
    // course.students stores objects with shape { student, enrolledBy }
    const enrolled = course.students.some(s => s.student?.toString() === studentId || s.student?._id?.toString() === studentId);
    if (!enrolled) {
      console.log('Enrollment check failed. courseId:', courseId, 'studentId:', studentId, 'course.students:', course.students.map(s => ({ student: s.student?.toString(), enrolledBy: s.enrolledBy?.toString() })));
      return res.status(400).json({
        success: false,
        message: 'Student is not enrolled in this course'
      });
    }

    const grade = await Grade.create({
      student: studentId,
      course: courseId,
      assignmentName,
      category,
      weight,
      score,
      maxScore,
      letterGrade,
      feedback,
      dueDate
    });

    const populatedGrade = await Grade.findById(grade._id)
      .populate('student', 'email name studentId')
      .populate('course', 'name code');

    // Create notification for student
    await Notification.create({
      recipient: studentId,
      type: 'grade',
      title: 'New Grade Posted',
      message: `You received a grade for ${course.name}: ${score}/${maxScore} (${((score/maxScore)*100).toFixed(1)}%)`,
      relatedId: grade._id,
      relatedModel: 'Grade',
      priority: 'normal'
    });

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
 * @desc    Get per-course analytics for instructors
 * @route   GET /api/grades/course/:courseId/analytics
 * @access  Private (Instructor only)
 */
exports.getCourseAnalytics = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    if (!Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: 'Invalid courseId' });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.instructor.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this course analytics' });
    }

    const grades = await Grade.find({ course: courseId })
      .populate('student', 'name email')
      .sort({ createdAt: -1 });

    if (!grades.length) {
      return res.json({
        success: true,
        analytics: {
          course: {
            id: course._id,
            name: course.name,
            code: course.code,
            status: course.status || 'in-progress'
          },
          totalGrades: 0,
          averageScore: 0,
          totalStudents: 0,
          gradeDistribution: [],
          byCategory: [],
          recentGrades: []
        }
      });
    }

    const percentages = grades.map(g => (g.score / g.maxScore) * 100);
    const averageScore = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
    const uniqueStudents = new Set(grades.map(g => g.student?.id?.toString() || g.student?.toString())).size;

    const distributionBuckets = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    percentages.forEach(pct => {
      if (pct >= 90) distributionBuckets.A += 1;
      else if (pct >= 80) distributionBuckets.B += 1;
      else if (pct >= 70) distributionBuckets.C += 1;
      else if (pct >= 60) distributionBuckets.D += 1;
      else distributionBuckets.F += 1;
    });

    const gradeDistribution = [
      { label: 'A (90-100%)', count: distributionBuckets.A },
      { label: 'B (80-89%)', count: distributionBuckets.B },
      { label: 'C (70-79%)', count: distributionBuckets.C },
      { label: 'D (60-69%)', count: distributionBuckets.D },
      { label: 'F (Below 60%)', count: distributionBuckets.F }
    ].map(bucket => ({
      ...bucket,
      percentage: ((bucket.count / grades.length) * 100).toFixed(1)
    }));

    const categoryMap = {};
    grades.forEach(grade => {
      const cat = grade.category || 'Other';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { category: cat, total: 0, count: 0 };
      }
      const pct = (grade.score / grade.maxScore) * 100;
      categoryMap[cat].total += pct;
      categoryMap[cat].count += 1;
    });

    const byCategory = Object.values(categoryMap).map(cat => ({
      category: cat.category,
      average: (cat.total / cat.count).toFixed(2),
      count: cat.count
    }));

    const recentGrades = grades.slice(0, 6).map(grade => ({
      id: grade._id,
      studentName: grade.student?.name || 'Student',
      assignmentName: grade.assignmentName,
      category: grade.category,
      score: grade.score,
      maxScore: grade.maxScore,
      percentage: ((grade.score / grade.maxScore) * 100).toFixed(2),
      letterGrade: grade.letterGrade,
      date: grade.createdAt
    }));

    res.json({
      success: true,
      analytics: {
        course: {
          id: course._id,
          name: course.name,
          code: course.code,
          status: course.status || 'in-progress'
        },
        totalGrades: grades.length,
        averageScore: averageScore.toFixed(2),
        totalStudents: uniqueStudents,
        gradeDistribution,
        byCategory,
        recentGrades
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get grade analytics for student
 * @route   GET /api/grades/analytics
 * @access  Private (Student only)
 */
exports.getAnalytics = async (req, res, next) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'This endpoint is for students only'
      });
    }

    const grades = await Grade.find({ student: req.user.id })
      .populate('course', 'name code')
      .sort({ createdAt: 1 });

    if (!grades.length) {
      return res.json({
        success: true,
        analytics: {
          totalGrades: 0,
          averageScore: 0,
          byCategory: [],
          byCourse: [],
          timeline: [],
          recentGrades: []
        }
      });
    }

    // Overall statistics
    const percentages = grades.map(g => (g.score / g.maxScore) * 100);
    const averageScore = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;

    // By category
    const categoryMap = {};
    grades.forEach(grade => {
      const cat = grade.category || 'Other';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { category: cat, grades: [], total: 0, count: 0 };
      }
      const pct = (grade.score / grade.maxScore) * 100;
      categoryMap[cat].grades.push(pct);
      categoryMap[cat].total += pct;
      categoryMap[cat].count++;
    });

    const byCategory = Object.values(categoryMap).map(cat => ({
      category: cat.category,
      average: (cat.total / cat.count).toFixed(2),
      count: cat.count
    }));

    // By course
    const courseMap = {};
    grades.forEach(grade => {
      const courseId = grade.course._id.toString();
      if (!courseMap[courseId]) {
        courseMap[courseId] = {
          courseId: grade.course._id,
          courseName: grade.course.name,
          courseCode: grade.course.code,
          grades: [],
          total: 0,
          count: 0
        };
      }
      const pct = (grade.score / grade.maxScore) * 100;
      courseMap[courseId].grades.push(pct);
      courseMap[courseId].total += pct;
      courseMap[courseId].count++;
    });

    const byCourse = Object.values(courseMap).map(course => ({
      courseId: course.courseId,
      courseName: course.courseName,
      courseCode: course.courseCode,
      average: (course.total / course.count).toFixed(2),
      count: course.count,
      letterGrade: getLetterGrade(course.total / course.count)
    }));

    // Timeline (last 10 grades)
    const timeline = grades.slice(-10).map(grade => ({
      date: grade.createdAt,
      courseName: grade.course.name,
      category: grade.category,
      score: grade.score,
      maxScore: grade.maxScore,
      percentage: ((grade.score / grade.maxScore) * 100).toFixed(2)
    }));

    // Recent grades (last 5)
    const recentGrades = grades.slice(-5).reverse().map(grade => ({
      id: grade._id,
      courseName: grade.course.name,
      category: grade.category,
      score: grade.score,
      maxScore: grade.maxScore,
      percentage: ((grade.score / grade.maxScore) * 100).toFixed(2),
      letterGrade: grade.letterGrade,
      date: grade.createdAt
    }));

    res.json({
      success: true,
      analytics: {
        totalGrades: grades.length,
        averageScore: averageScore.toFixed(2),
        byCategory,
        byCourse,
        timeline,
        recentGrades
      }
    });
  } catch (error) {
    next(error);
  }
};

function getLetterGrade(percentage) {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}

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

    // Get all grades for the student
    const grades = await Grade.find({ student: studentObjectId }).populate('course');

    if (!grades.length) {
      return res.json({
        success: true,
        gpa: 0,
        totalCredits: 0,
        breakdown: [],
        projectedGpa: 0,
        projectedTotalCredits: 0
      });
    }

    // Group grades by course and calculate weighted average per course
    const courseGradeMap = {};
    
    grades.forEach(grade => {
      const courseId = grade.course._id.toString();
      
      if (!courseGradeMap[courseId]) {
        courseGradeMap[courseId] = {
          courseId: grade.course._id,
          courseName: grade.course.name,
          courseCode: grade.course.code,
          credits: Number(grade.course.credits) || 3,
          status: grade.course.status || 'in-progress',
          completedAt: grade.course.completedAt,
          grades: [],
          totalWeight: 0
        };
      }

      const percentage = (grade.score / grade.maxScore) * 100;
      courseGradeMap[courseId].grades.push({
        percentage,
        weight: grade.weight || 0
      });
      courseGradeMap[courseId].totalWeight += (grade.weight || 0);
    });

    // Calculate weighted average for each course
    const breakdown = Object.values(courseGradeMap).map(course => {
      let coursePercentage = 0;

      // If there are grades with weights, use weighted average
      if (course.totalWeight > 0) {
        // Calculate weighted average: sum of (percentage * weight) / total weight
        let weightedSum = 0;
        course.grades.forEach(g => {
          weightedSum += g.percentage * g.weight;
        });
        // Divide by total weight to get the weighted average percentage
        coursePercentage = weightedSum / course.totalWeight;
      } else {
        // If no weights, use simple average of percentages
        coursePercentage = course.grades.reduce((sum, g) => sum + g.percentage, 0) / course.grades.length;
      }

      coursePercentage = Math.round(coursePercentage * 100) / 100;
      const points = percentageToGpa(coursePercentage);

      return {
        courseId: course.courseId,
        courseCode: course.courseCode,
        courseName: course.courseName,
        credits: course.credits,
        status: course.status,
        completedAt: course.completedAt,
        percentage: coursePercentage,
        points
      };
    });

    // Separate completed vs in-progress
    const completedCourses = breakdown.filter(c => c.status === 'completed');
    const inProgressCourses = breakdown.filter(c => c.status !== 'completed');

    const totalCredits = completedCourses.reduce((sum, c) => sum + c.credits, 0);
    const totalQualityPoints = completedCourses.reduce((sum, c) => sum + c.points * c.credits, 0);
    const gpa = totalCredits > 0 ? Number((totalQualityPoints / totalCredits).toFixed(2)) : 0;

    // Projected GPA includes in-progress courses as-is (using current averages)
    const projectedTotalCredits = breakdown.reduce((sum, c) => sum + c.credits, 0);
    const projectedQualityPoints = breakdown.reduce((sum, c) => sum + c.points * c.credits, 0);
    const projectedGpa = projectedTotalCredits > 0 ? Number((projectedQualityPoints / projectedTotalCredits).toFixed(2)) : 0;

    res.json({
      success: true,
      gpa,
      totalCredits,
      breakdown,
      projectedGpa,
      projectedTotalCredits,
      completedCourses,
      inProgressCourses
    });
  } catch (error) {
    next(error);
  }
};
