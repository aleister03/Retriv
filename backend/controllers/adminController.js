const User = require('../models/User');
const Post = require('../models/Post');
const VerificationRequest = require('../models/VerificationRequest');
// Get admin dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments(); // Total users count
    const totalPosts = await Post.countDocuments({ isDeleted: false });// Total posts 
    const pendingRequests = await VerificationRequest.countDocuments({ status: 'pending' });// Pending VERIFICATION REQUESTS 

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalPosts,
        pendingRequests,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
    });
  }
};

// Get all users with pagination and filters
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = 'all' } = req.query;
    
    // Build query
    let query = {};
    
    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Filter by status
    if (status === 'banned') {
      query.isBanned = true;
    } else if (status === 'suspended') {
      query.isSuspended = true;
    } else if (status === 'admin') {
      query.isAdmin = true;
    }
    
    // Fetch users with pagination
    const users = await User.find(query)
      .select('-googleId -__v')
      .populate('promotedBy', 'name email')
      .populate('bannedBy', 'name email')
      .populate('suspendedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const totalUsers = await User.countDocuments(query);
    
    res.json({
      success: true,
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        usersPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch users' 
    });
  }
};

// Get single user details
exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId)
      .select('-googleId -__v')
      .populate('promotedBy', 'name email')
      .populate('bannedBy', 'name email')
      .populate('suspendedBy', 'name email');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch user details' 
    });
  }
};

// Ban a user
exports.banUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    const adminId = req.userId;
    
    // Get target user and admin
    const targetUser = await User.findById(userId);
    const admin = await User.findById(adminId);
    
    if (!targetUser) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Prevent banning yourself
    if (userId === adminId) {
      return res.status(400).json({ 
        success: false,
        message: 'You cannot ban yourself' 
      });
    }
    
    // Prevent banning the admin who promoted you
    if (targetUser.isAdmin && admin.promotedBy && admin.promotedBy.toString() === userId) {
      return res.status(403).json({ 
        success: false,
        message: 'You cannot ban the admin who promoted you' 
      });
    }
    
    // Ban the user
    targetUser.isBanned = true;
    targetUser.banReason = reason || 'No reason provided';
    targetUser.bannedBy = adminId;
    targetUser.bannedAt = new Date();
    
    // Clear suspension if exists
    targetUser.isSuspended = false;
    targetUser.suspendedUntil = null;
    targetUser.suspensionReason = '';
    targetUser.suspendedBy = null;
    
    await targetUser.save();
    
    res.json({
      success: true,
      message: `User ${targetUser.name} has been banned`,
      user: targetUser,
    });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to ban user' 
    });
  }
};

// Suspend a user
exports.suspendUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason, duration } = req.body; // duration in hours
    const adminId = req.userId;
    
    // Get target user and admin
    const targetUser = await User.findById(userId);
    const admin = await User.findById(adminId);
    
    if (!targetUser) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Prevent suspending yourself
    if (userId === adminId) {
      return res.status(400).json({ 
        success: false,
        message: 'You cannot suspend yourself' 
      });
    }
    
    // Prevent suspending the admin who promoted you
    if (targetUser.isAdmin && admin.promotedBy && admin.promotedBy.toString() === userId) {
      return res.status(403).json({ 
        success: false,
        message: 'You cannot suspend the admin who promoted you' 
      });
    }
    
    // Validate duration
    const validDurations = [24, 48, 168];
    if (!validDurations.includes(duration)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid suspension duration. Must be 24, 48, or 168 hours.' 
      });
    }
    
    // Calculate suspension end time
    const suspendedUntil = new Date();
    suspendedUntil.setHours(suspendedUntil.getHours() + duration);
    
    // Suspend the user
    targetUser.isSuspended = true;
    targetUser.suspensionReason = reason || 'No reason provided';
    targetUser.suspendedBy = adminId;
    targetUser.suspendedUntil = suspendedUntil;
    
    await targetUser.save();
    
    res.json({
      success: true,
      message: `User ${targetUser.name} has been suspended for ${duration} hours`,
      user: targetUser,
    });
  } catch (error) {
    console.error('Suspend user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to suspend user' 
    });
  }
};

// Unban a user
exports.unbanUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    if (!user.isBanned) {
      return res.status(400).json({ 
        success: false,
        message: 'User is not banned' 
      });
    }
    
    // Unban the user
    user.isBanned = false;
    user.banReason = '';
    user.bannedBy = null;
    user.bannedAt = null;
    
    await user.save();
    
    res.json({
      success: true,
      message: `User ${user.name} has been unbanned`,
      user,
    });
  } catch (error) {
    console.error('Unban user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to unban user' 
    });
  }
};

// Unsuspend a user
exports.unsuspendUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    if (!user.isSuspended) {
      return res.status(400).json({ 
        success: false,
        message: 'User is not suspended' 
      });
    }
    
    // Unsuspend the user
    user.isSuspended = false;
    user.suspensionReason = '';
    user.suspendedBy = null;
    user.suspendedUntil = null;
    
    await user.save();
    
    res.json({
      success: true,
      message: `User ${user.name} has been unsuspended`,
      user,
    });
  } catch (error) {
    console.error('Unsuspend user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to unsuspend user' 
    });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.userId;
    
    // Get target user and admin
    const targetUser = await User.findById(userId);
    const admin = await User.findById(adminId);
    
    if (!targetUser) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Prevent deleting yourself
    if (userId === adminId) {
      return res.status(400).json({ 
        success: false,
        message: 'You cannot delete yourself' 
      });
    }
    
    // Prevent deleting the admin who promoted you
    if (targetUser.isAdmin && admin.promotedBy && admin.promotedBy.toString() === userId) {
      return res.status(403).json({ 
        success: false,
        message: 'You cannot delete the admin who promoted you' 
      });
    }
    
    const userName = targetUser.name;
    await User.findByIdAndDelete(userId);
    
    res.json({
      success: true,
      message: `User ${userName} has been deleted permanently`,
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete user' 
    });
  }
};

// Promote user to admin
exports.promoteToAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.userId;
    
    const targetUser = await User.findById(userId);
    
    if (!targetUser) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    if (targetUser.isAdmin) {
      return res.status(400).json({ 
        success: false,
        message: 'User is already an admin' 
      });
    }
    
    // Promote to admin
    targetUser.isAdmin = true;
    targetUser.promotedBy = adminId;
    targetUser.promotedAt = new Date();
    
    // Clear any bans or suspensions
    targetUser.isBanned = false;
    targetUser.banReason = '';
    targetUser.bannedBy = null;
    targetUser.bannedAt = null;
    targetUser.isSuspended = false;
    targetUser.suspensionReason = '';
    targetUser.suspendedBy = null;
    targetUser.suspendedUntil = null;
    
    await targetUser.save();
    
    res.json({
      success: true,
      message: `User ${targetUser.name} has been promoted to admin`,
      user: targetUser,
    });
  } catch (error) {
    console.error('Promote to admin error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to promote user to admin' 
    });
  }
};

// Demote admin to regular user
exports.demoteFromAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.userId;
    
    const targetUser = await User.findById(userId);
    const admin = await User.findById(adminId);
    
    if (!targetUser) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    if (!targetUser.isAdmin) {
      return res.status(400).json({ 
        success: false,
        message: 'User is not an admin' 
      });
    }
    
    // Prevent demoting yourself
    if (userId === adminId) {
      return res.status(400).json({ 
        success: false,
        message: 'You cannot demote yourself' 
      });
    }
    
    // Prevent demoting the admin who promoted you
    if (admin.promotedBy && admin.promotedBy.toString() === userId) {
      return res.status(403).json({ 
        success: false,
        message: 'You cannot demote the admin who promoted you' 
      });
    }
    
    // Demote from admin
    targetUser.isAdmin = false;
    targetUser.promotedBy = null;
    targetUser.promotedAt = null;
    
    await targetUser.save();
    
    res.json({
      success: true,
      message: `User ${targetUser.name} has been demoted from admin`,
      user: targetUser,
    });
  } catch (error) {
    console.error('Demote from admin error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to demote user from admin' 
    });
  }
};

// Get all posts for admin dashboard
exports.getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', type = 'all' } = req.query;

    let query = { isDeleted: false };

    // Search by title
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // Filter by type
    if (type !== 'all') {
      query.type = type;
    }

    const posts = await Post.find(query)
      .populate('author', 'name email profilePicture')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalPosts = await Post.countDocuments(query);

    res.json({
      success: true,
      posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts,
        postsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get all posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
    });
  }
};

// Delete post by admin
exports.deletePostByAdmin = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);

    if (!post || post.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Soft delete
    post.isDeleted = true;
    await post.save();

    res.json({
      success: true,
      message: 'Post deleted successfully by admin',
    });
  } catch (error) {
    console.error('Admin delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post',
    });
  }
};

// Get all pending post reports
exports.getPostReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'pending' } = req.query;

    // Build query to find posts with reports
    const query = {
      isDeleted: false,
      'reports.0': { $exists: true }, // Posts that have at least one report
    };

    // Filter by report status if specified
    let posts = await Post.find(query)
      .populate('author', 'name email profilePicture')
      .populate('reports.reportedBy', 'name email')
      .sort({ 'reports.reportedAt': -1 })
      .lean();

    // Filter reports by status
    posts = posts.map(post => ({
      ...post,
      reports: post.reports.filter(report => 
        status === 'all' ? true : report.status === status
      ),
    })).filter(post => post.reports.length > 0); // Only keep posts with matching reports

    // Pagination
    const totalReports = posts.reduce((sum, post) => sum + post.reports.length, 0);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Flatten reports for pagination
    const allReports = [];
    posts.forEach(post => {
      post.reports.forEach(report => {
        allReports.push({
          _id: report._id,
          post: {
            _id: post._id,
            title: post.title,
            description: post.description,
            type: post.type,
            images: post.images,
            author: post.author,
          },
          reportedBy: report.reportedBy,
          reason: report.reason,
          reportedAt: report.reportedAt,
          status: report.status,
        });
      });
    });

    // Sort by most recent
    allReports.sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt));

    const paginatedReports = allReports.slice(startIndex, endIndex);

    res.json({
      success: true,
      reports: paginatedReports,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalReports / limit),
        totalReports,
        reportsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get post reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch post reports',
    });
  }
};

// Update report status 
exports.updateReportStatus = async (req, res) => {
  try {
    const { postId, reportId } = req.params;
    const { status } = req.body; 

    if (!['reviewed', 'dismissed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "reviewed" or "dismissed"',
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const report = post.reports.id(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found',
      });
    }

    report.status = status;
    await post.save();

    res.json({
      success: true,
      message: `Report marked as ${status}`,
      report,
    });
  } catch (error) {
    console.error('Update report status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update report status',
    });
  }
};