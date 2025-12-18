const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, usersController.getAllUsers);
router.get('/students', authMiddleware, usersController.getStudents);
router.get('/instructors', authMiddleware, usersController.getInstructors);

module.exports = router;
