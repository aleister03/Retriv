const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { verifyToken, optionalVerifyToken, checkUserStatus } = require('../middleware/auth');

// Public routes with optional auth (to check bookmark status if logged in)
router.get('/', optionalVerifyToken, postController.getPosts);

// User-specific routes (auth required)
router.get('/my-posts', verifyToken, checkUserStatus, postController.getUserPosts);
router.get('/bookmarked', verifyToken, checkUserStatus, postController.getBookmarkedPosts);

// Single post view (optional auth)
router.get('/:postId', optionalVerifyToken, postController.getPostById);

// Protected routes (auth required)
router.post('/', verifyToken, checkUserStatus, postController.createPost);
router.put('/:postId', verifyToken, checkUserStatus, postController.updatePost);
router.delete('/:postId', verifyToken, checkUserStatus, postController.deletePost);
router.post('/:postId/bookmark', verifyToken, checkUserStatus, postController.toggleBookmark);
router.post('/:postId/report', verifyToken, checkUserStatus, postController.reportPost);

// Update availability status
router.patch('/:postId/availability', verifyToken, checkUserStatus, postController.updateAvailability);

module.exports = router;