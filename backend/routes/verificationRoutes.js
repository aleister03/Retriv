const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');
const { verifyToken, checkUserStatus, verifyAdmin } = require('../middleware/auth');

// User routes (require authentication)
router.post('/request', verifyToken, checkUserStatus, verificationController.createVerificationRequest);
router.get('/my-requests', verifyToken, checkUserStatus, verificationController.getUserRequests);
router.post('/submit-return-proof/:requestId', verifyToken, checkUserStatus, verificationController.submitReturnProof);

// Admin routes
router.get('/requests', verifyToken, verifyAdmin, verificationController.getAllVerificationRequests); // NEW ROUTE
router.get('/all', verifyToken, verifyAdmin, verificationController.getAllVerificationRequests); // Keep old for backward compatibility

router.put('/:requestId/review', verifyToken, verifyAdmin, verificationController.reviewVerificationRequest);

// Add approve and reject routes
router.put('/approve/:requestId', verifyToken, verifyAdmin, verificationController.approveVerification);
router.put('/reject/:requestId', verifyToken, verifyAdmin, verificationController.rejectVerification);

module.exports = router;