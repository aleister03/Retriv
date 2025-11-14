const express = require('express');
const { body } = require('express-validator');
const {
  loginAdmin,
  registerStudent,
  loginStudent,
  getProfile
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
// const upload = require('../middleware/upload'); // Temporarily disabled

const router = express.Router();

// Validation rules
const studentRegistrationValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('studentId')
    .trim()
    .notEmpty()
    .withMessage('Student ID is required'),
  body('department')
    .trim()
    .notEmpty()
    .withMessage('Department is required'),
  body('year')
    .isIn(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14'])
    .withMessage('Semester must be between 1 and 14'),
  body('phone')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Admin routes
router.post('/admin/login', loginValidation, loginAdmin);

// Student routes
router.post('/student/register', studentRegistrationValidation, registerStudent);
router.post('/student/login', loginValidation, loginStudent);

// Protected routes
router.get('/profile', verifyToken, getProfile);

module.exports = router;
