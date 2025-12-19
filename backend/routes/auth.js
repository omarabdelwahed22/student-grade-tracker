const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

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

const profileUpdateRules = [
  body('name').optional().isString().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email required')
];

const passwordChangeRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
];

const forgotPasswordRules = [
  body('email').isEmail().withMessage('Valid email required')
];

router.post('/register', registerRules, validateRequest, authController.register);
router.post('/login', loginRules, validateRequest, authController.login);
router.post('/forgot', forgotPasswordRules, validateRequest, authController.forgotPassword);
router.put('/profile', authMiddleware, profileUpdateRules, validateRequest, authController.updateProfile);
router.put('/password', authMiddleware, passwordChangeRules, validateRequest, authController.changePassword);

module.exports = router;
