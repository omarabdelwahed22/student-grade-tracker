const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');
const authController = require('../controllers/authController');

const registerRules = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
  body('role').optional().isIn(['student', 'instructor']),
  body('name').isString().trim().notEmpty().withMessage('Name is required'),
  body('studentId').custom((value, { req }) => {
    const role = req.body.role || 'student';
    if (role === 'student') {
      if (!value || !/^\d{9}$/.test(String(value).trim())) {
        throw new Error('studentId must be exactly 9 digits for students');
      }
    }
    return true;
  })
];

const loginRules = [
  body('email').isEmail(),
  body('password').exists()
];

router.post('/register', registerRules, validateRequest, authController.register);
router.post('/login', loginRules, validateRequest, authController.login);

module.exports = router;
