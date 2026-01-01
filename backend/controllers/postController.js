const Post = require('../models/Post');
const User = require('../models/User');

// Get all posts by type with pagination
exports.getPosts = async (req, res) => {
  try {
    const { type, page = 1, limit = 10, sort = 'newest' } = req.query;
    const userId = req.userId; 

    const query = { isDeleted: false };
    if (type) {
      query.type = type;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    const posts = await Post.find(query)
      .populate('author', 'name email profilePicture phoneNumber gender address reputationScore isProfileLocked isAdmin isBanned isSuspended createdAt')
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean(); 

    const totalPosts = await Post.countDocuments(query);

    let bookmarkedPostIds = [];
    if (userId) {
      const user = await User.findById(userId).select('bookmarkedPosts');
      bookmarkedPostIds = user?.bookmarkedPosts?.map(id => id.toString()) || [];
    }

    const postsWithBookmarkStatus = posts.map(post => ({
      ...post,
      isBookmarked: bookmarkedPostIds.includes(post._id.toString()),
    }));

    res.json({
      success: true,
      posts: postsWithBookmarkStatus,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts,
        postsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
      error: error.message,
    });
  }
};

// Get single post by ID
exports.getPostById = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.userId;

    const post = await Post.findById(postId)
      .populate('author', 'name email profilePicture phoneNumber gender address reputationScore isProfileLocked isAdmin isBanned isSuspended createdAt')
      .lean();

    if (!post || post.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    let isBookmarked = false;
    if (userId) {
      const user = await User.findById(userId).select('bookmarkedPosts');
      isBookmarked = user?.bookmarkedPosts?.some(id => id.toString() === postId) || false;
    }

    res.json({
      success: true,
      post: {
        ...post,
        isBookmarked,
      },
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch post',
    });
  }
};

// Create new post
exports.createPost = async (req, res) => {
  try {
    const userId = req.userId;
    const { title, description, location, images, type, price, condition, category, exchangeType, duration, rentalPrice } = req.body;

    // Validate required fields
    if (!title || !description || !type) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and type are required',
      });
    }

    // Validate images array length
    if (images && images.length > 3) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 3 images allowed',
      });
    }

    // Create post
    const post = await Post.create({
      title,
      description,
      location: location || '',
      images: images || [],
      type,
      author: userId,
      price: price || 0,
      condition: condition || '',
      category: category || '',
      exchangeType: exchangeType || '',
      duration: duration || '',
      rentalPrice: rentalPrice || 0,
    });

    // Award 10 reputation points to user
    await User.findByIdAndUpdate(userId, {
      $inc: { reputationScore: 10 },
    });

    // Populate author info
    await post.populate('author', 'name email profilePicture phoneNumber gender address');

    res.status(201).json({
      success: true,
      message: 'Post created successfully! You earned 10 reputation points.',
      post,
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post',
    });
  }
};

// Update post
exports.updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.userId;
    const { title, description, location, images, price, condition, category, exchangeType, duration, rentalPrice } = req.body;

    const post = await Post.findById(postId);

    if (!post || post.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check if user is the author
    if (post.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own posts',
      });
    }

    // Validate images array length
    if (images && images.length > 3) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 3 images allowed',
      });
    }

    // Update fields
    if (title) post.title = title;
    if (description) post.description = description;
    if (location !== undefined) post.location = location;
    if (images) post.images = images;
    if (price !== undefined) post.price = price;
    if (condition !== undefined) post.condition = condition;
    if (category !== undefined) post.category = category;
    if (exchangeType !== undefined) post.exchangeType = exchangeType;
    if (duration !== undefined) post.duration = duration;
    if (rentalPrice !== undefined) post.rentalPrice = rentalPrice;

    await post.save();
    await post.populate('author', 'name email profilePicture phoneNumber gender address');

    res.json({
      success: true,
      message: 'Post updated successfully',
      post,
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update post',
    });
  }
};

// Delete post
exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.userId;

    const post = await Post.findById(postId);

    if (!post || post.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check if user is the author
    if (post.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own posts',
      });
    }

    // Delete all messages related to this post
    const Message = require('../models/Message');
    await Message.deleteMany({ post: postId });

    // Delete all verification requests
    const VerificationRequest = require('../models/VerificationRequest');
    await VerificationRequest.deleteMany({ post: postId });

    // Delete all rental trackings
    const RentalTracking = require('../models/RentalTracking');
    await RentalTracking.deleteMany({ post: postId });

    // Notify users who had conversations about this post
    const Notification = require('../models/Notification');
    const io = req.app.get('io');
    
    // Find unique users who had messages about this post
    const conversations = await Message.aggregate([
      { $match: { post: postId } },
      {
        $group: {
          _id: null,
          users: { $addToSet: ['$sender', '$receiver'] },
        },
      },
    ]);

    if (conversations.length > 0 && io) {
      const { sendNotificationToUser } = require('../config/socket');
      const allUsers = conversations[0].users.flat();
      const uniqueUsers = [...new Set(allUsers.map(u => u.toString()))];

      for (const user of uniqueUsers) {
        if (user !== userId) {
          await sendNotificationToUser(io, user, {
            recipient: user,
            type: 'item_unavailable',
            title: 'Item No Longer Available',
            message: `The item "${post.title}" is no longer available. Related chats have been deleted.`,
            post: postId,
          });
        }
      }
    }

    // Delete the post
    await Post.findByIdAndDelete(postId);

    // Deduct 10 reputation points
    await User.findByIdAndUpdate(userId, {
      $inc: { reputationScore: -10 },
    });

    res.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post',
    });
  }
};

// Report post
exports.reportPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { reason } = req.body;
    const userId = req.userId;

    // Validate reason exists
    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Report reason is required',
      });
    }

    const post = await Post.findById(postId);
    
    if (!post || post.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check if user already reported this post
    const alreadyReported = post.reports.some(
      report => report.reportedBy.toString() === userId && report.status === 'pending'
    );

    if (alreadyReported) {
      return res.status(400).json({
        success: false,
        message: 'You have already reported this post',
      });
    }

    // Add report 
    post.reports.push({
      reportedBy: userId,
      reason: reason.trim(),
      reportedAt: new Date(),
      status: 'pending',
    });

    await post.save();

    res.json({
      success: true,
      message: 'Post reported successfully. Admin will review it.',
    });
  } catch (error) {
    console.error('Report post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to report post',
    });
  }
};

// Toggle bookmark
exports.toggleBookmark = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.userId;

    const user = await User.findById(userId);
    const post = await Post.findById(postId);

    if (!post || post.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const bookmarkIndex = user.bookmarkedPosts.indexOf(postId);
    let isBookmarked = false;

    if (bookmarkIndex > -1) {
      // Remove bookmark
      user.bookmarkedPosts.splice(bookmarkIndex, 1);
      isBookmarked = false;
    } else {
      // Add bookmark
      user.bookmarkedPosts.push(postId);
      isBookmarked = true;
    }

    await user.save();

    res.json({
      success: true,
      isBookmarked,
      message: isBookmarked ? 'Post bookmarked' : 'Bookmark removed',
    });
  } catch (error) {
    console.error('Bookmark error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bookmark post',
    });
  }
};

// get user's posts
exports.getUserPosts = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10 } = req.query;

    const posts = await Post.find({ author: userId, isDeleted: false })
      .populate('author', 'name email profilePicture phoneNumber gender address reputationScore isProfileLocked isAdmin isBanned isSuspended createdAt')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

const totalPosts = await Post.countDocuments({ author: userId, isDeleted: false });
    const user = await User.findById(userId).select('bookmarkedPosts');
    const bookmarkedPostIds = user?.bookmarkedPosts?.map(id => id.toString()) || [];
    const postsWithBookmarkStatus = posts.map(post => ({
      ...post,
      isBookmarked: bookmarkedPostIds.includes(post._id.toString()),
    }));

    res.json({
      success: true,
      posts: postsWithBookmarkStatus,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts,
        postsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user posts',
    });
  }
};

// get bookmarked posts
exports.getBookmarkedPosts = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10 } = req.query;

    const user = await User.findById(userId).select('bookmarkedPosts');
    
    if (!user || !user.bookmarkedPosts || user.bookmarkedPosts.length === 0) {
      return res.json({
        success: true,
        posts: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalPosts: 0,
          postsPerPage: parseInt(limit),
        },
      });
    }

    const posts = await Post.find({
      _id: { $in: user.bookmarkedPosts },
      isDeleted: false,
    })
      .populate('author', 'name email profilePicture phoneNumber gender address reputationScore isProfileLocked isAdmin isBanned isSuspended createdAt')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const totalPosts = await Post.countDocuments({
      _id: { $in: user.bookmarkedPosts },
      isDeleted: false,
    });

    const postsWithBookmarkStatus = posts.map(post => ({
      ...post,
      isBookmarked: true,
    }));

    res.json({
      success: true,
      posts: postsWithBookmarkStatus,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts,
        postsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get bookmarked posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookmarked posts',
    });
  }
};
// Update availability status 
exports.updateAvailability = async (req, res) => {
  try {
    const { postId } = req.params;
    const { availability } = req.body;
    const userId = req.userId;

    if (!['Available', 'Reserved', 'Unavailable'].includes(availability)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid availability status',
      });
    }

    const post = await Post.findById(postId);

    if (!post || post.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check if user is the author
    if (post.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own posts',
      });
    }

    // Check if post is exchange type
    if (post.type !== 'exchange') {
      return res.status(400).json({
        success: false,
        message: 'Availability can only be updated for exchange posts',
      });
    }

    post.availability = availability;
    await post.save();
    await post.populate('author', 'name email profilePicture phoneNumber gender address');

    res.json({
      success: true,
      message: `Availability updated to ${availability}`,
      post,
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update availability',
    });
  }
};