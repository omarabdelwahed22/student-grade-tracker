const express = require('express');

const { body, param } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');
const router = express.Router();
const studentsController = require('../controllers/studentsController');

// Validation rules
const createRules = [
	body('name').isString().isLength({ min: 1 }).withMessage('Name is required'),
	body('email').isEmail().withMessage('Valid email is required'),
	body('grades').optional().isArray().withMessage('Grades must be an array')
];

const updateRules = [
	body('name').optional().isString(),
	body('email').optional().isEmail(),
	body('grades').optional().isArray()
];

const idParam = [param('id').isMongoId().withMessage('Invalid id')];

router.post('/', createRules, validateRequest, studentsController.createStudent);
router.get('/', studentsController.getStudents);
router.get('/:id', idParam, validateRequest, studentsController.getStudentById);
router.put('/:id', idParam.concat(updateRules), validateRequest, studentsController.updateStudent);
router.delete('/:id', idParam, validateRequest, studentsController.deleteStudent);

module.exports = router;
