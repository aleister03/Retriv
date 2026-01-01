const Message = require('../models/Message');
const Post = require('../models/Post');
const User = require('../models/User'); 
const { sendNotificationToUser } = require('../config/socket'); 

// Get conversation messages with pagination
exports.getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.userId;

    // Verify user is part of this conversation
    const sampleMessage = await Message.findOne({ conversationId });
    if (!sampleMessage) {
      return res.json({ success: true, messages: [] });
    }

    if (
      sampleMessage.sender.toString() !== userId &&
      sampleMessage.receiver.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation',
      });
    }

    const messages = await Message.find({ conversationId })
      .populate('sender', 'name profilePicture')
      .populate('receiver', 'name profilePicture')
      .populate('post', 'title images type availability') 
      .sort({ createdAt: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalMessages = await Message.countDocuments({ conversationId });

    res.json({
      success: true,
      messages,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalMessages / limit),
        totalMessages,
      },
    });
  } catch (error) {
    console.error('Get conversation messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
    });
  }
};

// Get user's conversations list
exports.getUserConversations = async (req, res) => {
  try {
    const userId = req.userId;

    // Get all conversations where user is sender or receiver
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver', userId] },
                    { $eq: ['$isRead', false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $sort: { 'lastMessage.createdAt': -1 },
      },
    ]);

    // Populate conversation details
    await Message.populate(conversations, [
      { path: 'lastMessage.sender', select: 'name profilePicture' },
      { path: 'lastMessage.receiver', select: 'name profilePicture' },
      { path: 'lastMessage.post', select: 'title images type availability' },
    ]);

    // Filter out conversations where post is deleted
    const validConversations = conversations.filter(
      (conv) => conv.lastMessage.post && !conv.lastMessage.post.isDeleted
    );

    res.json({
      success: true,
      conversations: validConversations,
    });
  } catch (error) {
    console.error('Get user conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations',
    });
  }
};

// Delete conversation 
exports.deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;

    // Verify user is part of this conversation or is admin
    const sampleMessage = await Message.findOne({ conversationId });
    if (!sampleMessage) {
      return res.json({ success: true, message: 'Conversation not found' });
    }

    const user = await User.findById(userId);
    const isPartOfConversation =
      sampleMessage.sender.toString() === userId ||
      sampleMessage.receiver.toString() === userId;

    if (!isPartOfConversation && !user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    await Message.deleteMany({ conversationId });

    res.json({
      success: true,
      message: 'Conversation deleted',
    });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete conversation',
    });
  }
};

// Send message 
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, content, receiverId } = req.body;
    const senderId = req.userId;

    if (!conversationId || !content || !receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Conversation ID, content, and receiver are required',
      });
    }

    // Get the post from an existing message in this conversation
    const existingMessage = await Message.findOne({ conversationId }).populate('post');
    
    if (!existingMessage) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    const post = existingMessage.post;

    // Check if post exists and is not deleted
    if (!post || post.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Post not found or has been deleted',
      });
    }

    // Check if post is unavailable 
    if (post.availability === 'Unavailable') {
      return res.status(400).json({
        success: false,
        message: 'This item is no longer available for messaging',
      });
    }

    // Create the message
    const message = await Message.create({
      conversationId,
      post: post._id,
      sender: senderId,
      receiver: receiverId,
      content,
    });

    await message.populate([
      { path: 'sender', select: 'name profilePicture' },
      { path: 'receiver', select: 'name profilePicture' },
      { path: 'post', select: 'title images type availability' },
    ]);

    // Send socket notification
    const io = req.app.get('io');
    if (io) {
      io.to(receiverId).emit('newMessage', message);

      // Send push notification
      if (sendNotificationToUser) {
        await sendNotificationToUser(io, receiverId, {
          recipient: receiverId,
          type: 'message',
          title: 'New Message',
          message: `${message.sender.name} sent you a message about "${post.title}"`,
          post: post._id,
          relatedUser: senderId,
        });
      }
    }

    res.json({
      success: true,
      message: 'Message sent successfully',
      data: message,
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
    });
  }
};