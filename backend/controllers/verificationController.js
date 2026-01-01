const VerificationRequest = require('../models/VerificationRequest');
const RentalTracking = require('../models/RentalTracking');
const Post = require('../models/Post');
const User = require('../models/User');
const Message = require('../models/Message');
const { sendNotificationToUser } = require('../config/socket');

// Create verification request
exports.createVerificationRequest = async (req, res) => {
  try {
    const {
      type,
      postId,
      proofImages,
      details,
      rentalDuration,
      ownershipProof,
    } = req.body;
    const userId = req.userId;

    const validTypes = ['borrow', 'rent', 'swap', 'purchase', 'claim', 'return'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification type',
      });
    }

    const post = await Post.findById(postId).populate('author');
    if (!post || post.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    if (post.availability === 'Unavailable' && type !== 'return') {
      return res.status(400).json({
        success: false,
        message: 'This item is no longer available',
      });
    }

    if (post.availability === 'Reserved' && type !== 'return') {
      return res.status(400).json({
        success: false,
        message: 'This item is currently reserved for rent',
      });
    }

    if (type === 'rent' && !rentalDuration) {
      return res.status(400).json({
        success: false,
        message: 'Rental duration is required for rent requests',
      });
    }

    if (type === 'claim' && !ownershipProof) {
      return res.status(400).json({
        success: false,
        message: 'Ownership proof is required for claim requests',
      });
    }

    const verificationRequest = await VerificationRequest.create({
      type,
      post: postId,
      requester: userId,
      proofImages: proofImages || [],
      details: details || '',
      rentalDuration,
      ownershipProof,
    });

    await verificationRequest.populate([
      { path: 'post', select: 'title images type author' },
      { path: 'requester', select: 'name email profilePicture' },
    ]);

    const io = req.app.get('io');
    if (type !== 'claim' && type !== 'return') {
      await sendNotificationToUser(io, post.author._id, {
        recipient: post.author._id,
        type: 'verification_pending',
        title: `New ${type} request`,
        message: `${verificationRequest.requester.name} wants to ${type} your item: ${post.title}`,
        post: postId,
        relatedUser: userId,
        verificationRequest: verificationRequest._id,
      });
    }

    res.json({
      success: true,
      message: 'Verification request submitted successfully',
      verificationRequest,
    });
  } catch (error) {
    console.error('Create verification request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create verification request',
    });
  }
};

// Get user's verification requests
exports.getUserRequests = async (req, res) => {
  try {
    const userId = req.userId;
    const { status } = req.query;

    const query = { requester: userId };
    if (status) {
      query.status = status;
    }

    const requests = await VerificationRequest.find(query)
      .populate('post', 'title images type')
      .populate('requester', 'name profilePicture')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error('Get user requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch requests',
    });
  }
};

// Submit return proof for rental
exports.submitReturnProof = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { returnProofImages } = req.body;
    const userId = req.userId;

    const rentalTracking = await RentalTracking.findOne({
      verificationRequest: requestId,
      renter: userId,
    });

    if (!rentalTracking) {
      return res.status(404).json({
        success: false,
        message: 'Rental tracking not found',
      });
    }

    if (!returnProofImages || returnProofImages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Return proof images are required',
      });
    }

    rentalTracking.returnProofImages = returnProofImages;
    rentalTracking.returnStatus = 'returned_pending';
    await rentalTracking.save();

    const returnVerification = await VerificationRequest.create({
      type: 'return',
      post: rentalTracking.post,
      requester: userId,
      proofImages: returnProofImages,
      details: 'Return proof for rental',
    });

    const io = req.app.get('io');
    const admins = await User.find({ isAdmin: true });
    for (const admin of admins) {
      await sendNotificationToUser(io, admin._id, {
        recipient: admin._id,
        type: 'verification_pending',
        title: 'Return proof submitted',
        message: 'A user has submitted return proof for a rental',
        post: rentalTracking.post,
        relatedUser: userId,
        verificationRequest: returnVerification._id,
      });
    }

    res.json({
      success: true,
      message: 'Return proof submitted successfully',
    });
  } catch (error) {
    console.error('Submit return proof error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit return proof',
    });
  }
};

// Admin: Get all verification requests
exports.getAllVerificationRequests = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const requests = await VerificationRequest.find(query)
      .populate('post', 'title images type author')
      .populate('requester', 'name email profilePicture')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalRequests = await VerificationRequest.countDocuments(query);

    res.json({
      success: true,
      requests,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalRequests / limit),
        totalRequests,
      },
    });
  } catch (error) {
    console.error('Get all verification requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch verification requests',
    });
  }
};

// Admin: Review verification request
exports.reviewVerificationRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, adminNotes } = req.body;
    const adminId = req.userId;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be approved or rejected',
      });
    }

    const verificationRequest = await VerificationRequest.findById(requestId)
      .populate('post')
      .populate('requester');

    if (!verificationRequest) {
      return res.status(404).json({
        success: false,
        message: 'Verification request not found',
      });
    }

    verificationRequest.status = status;
    verificationRequest.adminNotes = adminNotes || '';
    verificationRequest.reviewedBy = adminId;
    verificationRequest.reviewedAt = new Date();
    await verificationRequest.save();

    const io = req.app.get('io');

    if (status === 'approved' && verificationRequest.type === 'rent') {
      const { startDate, endDate, durationInDays } =
        verificationRequest.rentalDuration;

      await RentalTracking.create({
        verificationRequest: requestId,
        post: verificationRequest.post._id,
        renter: verificationRequest.requester._id,
        owner: verificationRequest.post.author,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        durationInDays,
      });
    }

    if (status === 'approved' && verificationRequest.type === 'return') {
      const rentalTracking = await RentalTracking.findOne({
        verificationRequest: verificationRequest._id,
      });

      if (rentalTracking) {
        rentalTracking.returnStatus = 'returned_verified';
        rentalTracking.isCompleted = true;
        await rentalTracking.save();
      }
    }

    await sendNotificationToUser(io, verificationRequest.requester._id, {
      recipient: verificationRequest.requester._id,
      type: status === 'approved' ? 'verification_approved' : 'verification_rejected',
      title: `Request ${status}`,
      message: `Your ${verificationRequest.type} request for "${verificationRequest.post.title}" has been ${status}`,
      post: verificationRequest.post._id,
      verificationRequest: requestId,
    });

    res.json({
      success: true,
      message: `Request ${status} successfully`,
      verificationRequest,
    });
  } catch (error) {
    console.error('Review verification request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to review verification request',
    });
  }
};

// Approve verification request
exports.approveVerification = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;
    const adminId = req.userId;

    const verificationRequest = await VerificationRequest.findById(requestId)
      .populate('post')
      .populate('requester');

    if (!verificationRequest) {
      return res.status(404).json({
        success: false,
        message: 'Verification request not found',
      });
    }

    verificationRequest.status = 'approved';
    verificationRequest.adminNotes = reason || '';
    verificationRequest.reviewedBy = adminId;
    verificationRequest.reviewedAt = new Date();
    await verificationRequest.save();

    const io = req.app.get('io');
    const post = await Post.findById(verificationRequest.post._id);

    if (post) {
      // Handle different verification types
      
      if (['claim', 'purchase', 'borrow', 'swap'].includes(verificationRequest.type)) {
        post.availability = 'Unavailable';
        await post.save();

        // Notify other interested users
        try {
          const messages = await Message.find({ post: post._id }).select('sender receiver');
          
          if (messages.length > 0 && io) {
            const allUsers = new Set();
            messages.forEach(msg => {
              allUsers.add(msg.sender.toString());
              allUsers.add(msg.receiver.toString());
            });

            const uniqueUsers = Array.from(allUsers);

            for (const userId of uniqueUsers) {
              if (
                userId !== verificationRequest.requester._id.toString() &&
                userId !== post.author.toString()
              ) {
                await sendNotificationToUser(io, userId, {
                  recipient: userId,
                  type: 'item_unavailable',
                  title: 'Item No Longer Available',
                  message: `The item "${post.title}" is no longer available`,
                  post: post._id,
                });
              }
            }
          }
        } catch (notifError) {
          console.error('Notification error:', notifError);
        }
      }

      // For rent - Create rental tracking and mark as Reserved
      if (verificationRequest.type === 'rent') {
        const { startDate, endDate, durationInDays } =
          verificationRequest.rentalDuration;

        await RentalTracking.create({
          verificationRequest: requestId,
          post: post._id,
          renter: verificationRequest.requester._id,
          owner: post.author,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          durationInDays,
        });

        post.availability = 'Reserved';
        await post.save();
      }

      // For return - Two types: rental return or lost-found return
      if (verificationRequest.type === 'return') {
        const rentalTracking = await RentalTracking.findOne({
          post: post._id,
          isCompleted: false,
        });

        if (rentalTracking) {
          // Rental return - mark as Available again
          rentalTracking.returnStatus = 'returned_verified';
          rentalTracking.isCompleted = true;
          await rentalTracking.save();

          post.availability = 'Available';
          await post.save();
        } else {
          // Lost-found return - mark as Unavailable 
          post.availability = 'Unavailable';
          await post.save();
        }
      }
    }

    // Send notification to requester
    if (io) {
      await sendNotificationToUser(io, verificationRequest.requester._id, {
        recipient: verificationRequest.requester._id,
        type: 'verification_approved',
        title: 'Request Approved',
        message: `Your ${verificationRequest.type} request for "${verificationRequest.post.title}" has been approved`,
        post: verificationRequest.post._id,
        verificationRequest: requestId,
      });
    }

    res.json({
      success: true,
      message: 'Request approved successfully',
      verificationRequest,
    });
  } catch (error) {
    console.error('Approve verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve verification request',
      error: error.message,
    });
  }
};

// Reject verification request
exports.rejectVerification = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;
    const adminId = req.userId;

    const verificationRequest = await VerificationRequest.findById(requestId)
      .populate('post')
      .populate('requester');

    if (!verificationRequest) {
      return res.status(404).json({
        success: false,
        message: 'Verification request not found',
      });
    }

    verificationRequest.status = 'rejected';
    verificationRequest.adminNotes = reason || 'No reason provided';
    verificationRequest.reviewedBy = adminId;
    verificationRequest.reviewedAt = new Date();
    await verificationRequest.save();

    const io = req.app.get('io');

    if (io) {
      await sendNotificationToUser(io, verificationRequest.requester._id, {
        recipient: verificationRequest.requester._id,
        type: 'verification_rejected',
        title: 'Request Rejected',
        message: `Your ${verificationRequest.type} request for "${verificationRequest.post.title}" has been rejected. ${reason ? 'Reason: ' + reason : ''}`,
        post: verificationRequest.post._id,
        verificationRequest: requestId,
      });
    }

    res.json({
      success: true,
      message: 'Request rejected successfully',
      verificationRequest,
    });
  } catch (error) {
    console.error('Reject verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject verification request',
    });
  }
};