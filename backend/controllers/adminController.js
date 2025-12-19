const User = require('../models/User');

// Get admin dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    // Total users count
    const totalUsers = await User.countDocuments();
    
    // Total posts
    const totalPosts = 0;
    
    // Pending requests
    const pendingRequests = 0;
    
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
      message: 'Failed to fetch dashboard statistics' 
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
