const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createAssignment,
  getAssignmentsByCourse,
  getUpcomingAssignments,
  updateAssignment,
  deleteAssignment
} = require('../controllers/assignmentController');

// All routes require authentication
router.use(auth);

// Create assignment (instructor only)
router.post('/', (req, res, next) => {
  if (req.user.role !== 'instructor') {
    return res.status(403).json({ message: 'Only instructors can create assignments' });
  }
  next();
}, createAssignment);

// Get assignments by course
router.get('/course/:courseId', getAssignmentsByCourse);

// Get upcoming assignments (student only)
router.get('/upcoming', (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Only students can access this endpoint' });
  }
  next();
}, getUpcomingAssignments);

// Update assignment (instructor only)
router.put('/:id', (req, res, next) => {
  if (req.user.role !== 'instructor') {
    return res.status(403).json({ message: 'Only instructors can update assignments' });
  }
  next();
}, updateAssignment);

// Delete assignment (instructor only)
router.delete('/:id', (req, res, next) => {
  if (req.user.role !== 'instructor') {
    return res.status(403).json({ message: 'Only instructors can delete assignments' });
  }
  next();
}, deleteAssignment);

module.exports = router;
