const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { verifyToken, checkUserStatus } = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);
router.use(checkUserStatus);

// Send message 
router.post('/send', messageController.sendMessage);

// Get conversation messages
router.get('/conversation/:conversationId', messageController.getConversationMessages);

// Get user's conversations list
router.get('/conversations', messageController.getUserConversations);

// Delete conversation (when post is deleted)
router.delete('/conversation/:conversationId', messageController.deleteConversation);

module.exports = router;