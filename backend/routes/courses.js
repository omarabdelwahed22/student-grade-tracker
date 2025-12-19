const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');
const auth = require('../middleware/auth');
const coursesController = require('../controllers/coursesController');

// Validation rules
const createCourseRules = [
  body('name').trim().notEmpty().withMessage('Course name is required'),
  body('code').trim().notEmpty().withMessage('Course code is required'),
  body('credits').optional().isInt({ min: 1, max: 6 }).withMessage('Credits must be between 1 and 6')
];

const updateCourseRules = [
  body('name').optional().trim().notEmpty().withMessage('Course name cannot be empty'),
  body('code').optional().trim().notEmpty().withMessage('Course code cannot be empty'),
  body('credits').optional().isInt({ min: 1, max: 6 }).withMessage('Credits must be between 1 and 6'),
  body('status').optional().isIn(['in-progress', 'completed', 'archived']).withMessage('Invalid status'),
  body('completedAt').optional().isISO8601().withMessage('completedAt must be a valid date')
];

const enrollRules = [
  body('studentId').trim().notEmpty().withMessage('Student ID is required')
];

// All routes require authentication
router.use(auth);

// GET /api/courses/my - Get courses for authenticated user
router.get('/my', coursesController.getMyCourses);

// GET /api/courses - Get all courses (requires instructor role)
router.get('/', (req, res, next) => {
  if (req.user.role !== 'instructor') {
    return res.status(403).json({ message: 'Access denied: instructors only' });
  }
  next();
}, coursesController.getAllCourses);

// GET /api/courses/:id - Get a single course
router.get('/:id', coursesController.getCourseById);

// POST /api/courses - Create a new course (instructor only)
router.post('/', (req, res, next) => {
  if (req.user.role !== 'instructor') {
    return res.status(403).json({ message: 'Access denied: instructors only' });
  }
  next();
}, createCourseRules, validateRequest, coursesController.createCourse);

// PUT /api/courses/:id - Update a course (instructor only)
router.put('/:id', (req, res, next) => {
  if (req.user.role !== 'instructor') {
    return res.status(403).json({ message: 'Access denied: instructors only' });
  }
  next();
}, updateCourseRules, validateRequest, coursesController.updateCourse);

// DELETE /api/courses/:id - Delete a course (instructor only)
router.delete('/:id', (req, res, next) => {
  if (req.user.role !== 'instructor') {
    return res.status(403).json({ message: 'Access denied: instructors only' });
  }
  next();
}, coursesController.deleteCourse);

// POST /api/courses/:id/enroll - Enroll a student (instructor only)
router.post('/:id/enroll', (req, res, next) => {
  if (req.user.role !== 'instructor') {
    return res.status(403).json({ message: 'Access denied: instructors only' });
  }
  next();
}, enrollRules, validateRequest, coursesController.enrollStudent);

// POST /api/courses/:id/unenroll - Unenroll a student (instructor only)
router.post('/:id/unenroll', (req, res, next) => {
  if (req.user.role !== 'instructor') {
    return res.status(403).json({ message: 'Access denied: instructors only' });
  }
  next();
}, enrollRules, validateRequest, coursesController.unenrollStudent);

module.exports = router;
