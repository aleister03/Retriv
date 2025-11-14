const { validationResult } = require('express-validator');
const Admin = require('../models/Admin');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

// Admin Registration
const registerAdmin = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password, department, employeeId } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ email }, { employeeId }]
    });

    if (existingAdmin) {
      return res.status(400).json({
        message: 'Admin with this email or employee ID already exists'
      });
    }

    // Create new admin
    const admin = new Admin({
      name,
      email,
      password,
      department,
      employeeId
    });

    await admin.save();

    // Generate token
    const token = generateToken(admin._id, 'admin');

    res.status(201).json({
      message: 'Admin registered successfully',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        department: admin.department,
        employeeId: admin.employeeId,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({
      message: 'Server error during admin registration',
      error: error.message
    });
  }
};

// Admin Login
const loginAdmin = async (req, res) => {
  try {
    console.log('Admin login attempt:', req.body);
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find admin by email
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({
        message: 'Account is deactivated. Please contact system administrator.'
      });
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(admin._id, 'admin');

    res.json({
      message: 'Admin login successful',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        department: admin.department,
        employeeId: admin.employeeId,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      message: 'Server error during admin login',
      error: error.message
    });
  }
};

// Student Registration
const registerStudent = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password, studentId, department, year, phone } = req.body;

    // Check if student already exists
    const existingStudent = await User.findOne({
      $or: [{ email }, { studentId }]
    });

    if (existingStudent) {
      return res.status(400).json({
        message: 'Student with this email or student ID already exists'
      });
    }

    // Create new student (without file upload for now)
    const student = new User({
      name,
      email,
      password,
      studentId,
      department,
      year,
      phone
      // idCardPhoto will be added later when multer is installed
    });

    await student.save();

    // Generate token
    const token = generateToken(student._id, 'student');

    res.status(201).json({
      message: 'Student registered successfully',
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        studentId: student.studentId,
        department: student.department,
        year: student.year,
        phone: student.phone,
        role: student.role
      }
    });
  } catch (error) {
    console.error('Student registration error:', error);
    res.status(500).json({
      message: 'Server error during student registration',
      error: error.message
    });
  }
};

// Student Login
const loginStudent = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find student by email
    const student = await User.findOne({ email }).select('+password');
    if (!student) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    // Check if student is active
    if (!student.isActive) {
      return res.status(401).json({
        message: 'Account is deactivated. Please contact administrator.'
      });
    }

    // Check password
    const isPasswordValid = await student.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(student._id, 'student');

    res.json({
      message: 'Student login successful',
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        studentId: student.studentId,
        department: student.department,
        year: student.year,
        phone: student.phone,
        role: student.role
      }
    });
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({
      message: 'Server error during student login',
      error: error.message
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    res.json({
      message: 'Profile retrieved successfully',
      user: req.user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      message: 'Server error while retrieving profile',
      error: error.message
    });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  registerStudent,
  loginStudent,
  getProfile
};
