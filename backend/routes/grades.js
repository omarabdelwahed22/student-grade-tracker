const express = require('express');
const { body } = require('express-validator');
const {
  getGrades,
  getGradeById,
  createGrade,
  updateGrade,
  deleteGrade,
  getCourseStats,
  getCourseAnalytics,
  getGpa,
  getAnalytics
} = require('../controllers/gradesController');
const auth = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

// Validation rules
const createGradeRules = [
  body('studentId').notEmpty().withMessage('Student ID is required').isMongoId().withMessage('Invalid student ID'),
  body('courseId').notEmpty().withMessage('Course ID is required').isMongoId().withMessage('Invalid course ID'),
  body('assignmentName').optional().trim(),
  body('category').notEmpty().withMessage('Category is required').trim(),
  body('weight').optional().isNumeric().withMessage('Weight must be a number').custom((value) => {
    if (value < 0 || value > 100) throw new Error('Weight must be between 0 and 100');
    return true;
  }),
  body('score').isNumeric().withMessage('Score must be a number').custom((value) => {
    if (value < 0) throw new Error('Score cannot be negative');
    return true;
  }),
  body('maxScore').isNumeric().withMessage('Max score must be a number').custom((value) => {
    if (value < 1) throw new Error('Max score must be at least 1');
    return true;
  }),
  body('letterGrade').optional().isString().trim().toUpperCase(),
  body('feedback').optional().isString().trim(),
  body('dueDate').optional().isISO8601().withMessage('Due date must be a valid date')
];

const updateGradeRules = [
  body('assignmentName').optional().notEmpty().withMessage('Assignment name cannot be empty').trim(),
  body('category').optional().notEmpty().withMessage('Category cannot be empty').trim(),
  body('weight').optional().isNumeric().withMessage('Weight must be a number').custom((value) => {
    if (value < 0 || value > 100) throw new Error('Weight must be between 0 and 100');
    return true;
  }),
  body('score').optional().isNumeric().withMessage('Score must be a number').custom((value) => {
    if (value < 0) throw new Error('Score cannot be negative');
    return true;
  }),
  body('maxScore').optional().isNumeric().withMessage('Max score must be a number').custom((value) => {
    if (value < 1) throw new Error('Max score must be at least 1');
    return true;
  }),
  body('letterGrade').optional().isString().trim().toUpperCase(),
  body('feedback').optional().isString().trim(),
  body('dueDate').optional().isISO8601().withMessage('Due date must be a valid date')
];

// Check if user is instructor
const isInstructor = (req, res, next) => {
  if (req.user.role !== 'instructor') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Instructors only.'
    });
  }
  next();
};

// Routes
router.get('/', auth, getGrades);
router.get('/analytics', auth, getAnalytics);
router.get('/gpa', auth, getGpa);
router.get('/course/:courseId/analytics', auth, isInstructor, getCourseAnalytics);
router.get('/course/:courseId/stats', auth, isInstructor, getCourseStats);
router.get('/:id', auth, getGradeById);
router.post('/', auth, isInstructor, createGradeRules, validateRequest, createGrade);
router.put('/:id', auth, isInstructor, updateGradeRules, validateRequest, updateGrade);
router.delete('/:id', auth, isInstructor, deleteGrade);

module.exports = router;

module.exports = router;