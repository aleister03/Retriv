const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken, checkUserStatus } = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);
router.use(checkUserStatus);

// Get user's notifications
router.get('/', notificationController.getUserNotifications);

// Mark notification as read
router.patch('/:notificationId/read', notificationController.markAsRead);

// Mark all notifications as read
router.patch('/read-all', notificationController.markAllAsRead);

// Delete notification
router.delete('/:notificationId', notificationController.deleteNotification);

module.exports = router;