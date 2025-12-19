const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// All admin routes require authentication and admin privileges
router.use(verifyToken);
router.use(verifyAdmin);

// Dashboard stats
router.get('/stats', adminController.getDashboardStats);

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId', adminController.getUserDetails);
router.put('/users/:userId/ban', adminController.banUser);
router.put('/users/:userId/unban', adminController.unbanUser);
router.put('/users/:userId/suspend', adminController.suspendUser);
router.put('/users/:userId/unsuspend', adminController.unsuspendUser);
router.delete('/users/:userId', adminController.deleteUser);
router.put('/users/:userId/promote', adminController.promoteToAdmin);
router.put('/users/:userId/demote', adminController.demoteFromAdmin);

module.exports = router;