const Message = require('../models/Message');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Store connected users: { userId: socketId }
const connectedUsers = new Map();

const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    // User authentication and registration
    socket.on('register', async (userId) => {
      if (userId) {
        connectedUsers.set(userId, socket.id);
        socket.userId = userId;
        // Send unread counts
        const unreadMessages = await Message.countDocuments({
          receiver: userId,
          isRead: false,
        });
        const unreadNotifications = await Notification.countDocuments({
          recipient: userId,
          isRead: false,
        });

        socket.emit('unread_counts', {
          messages: unreadMessages,
          notifications: unreadNotifications,
        });
      }
    });

    // Send message
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, postId, senderId, receiverId, content } = data;

        // Create message
        const message = await Message.create({
          conversationId,
          post: postId,
          sender: senderId,
          receiver: receiverId,
          content,
        });

        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'name profilePicture')
          .populate('receiver', 'name profilePicture')
          .populate('post', 'title images type');

        // Send to receiver if online
        const receiverSocketId = connectedUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('new_message', populatedMessage);
          
          // Send unread count update
          const unreadCount = await Message.countDocuments({
            receiver: receiverId,
            isRead: false,
          });
          io.to(receiverSocketId).emit('unread_counts', {
            messages: unreadCount,
          });
        }

        // Send back to sender
        socket.emit('message_sent', populatedMessage);

        // Create message notification
        const notification = await Notification.create({
          recipient: receiverId,
          type: 'message',
          title: 'New Message',
          message: `${populatedMessage.sender.name} sent you a message`,
          post: postId,
          relatedUser: senderId,
        });

        if (receiverSocketId) {
          const populatedNotification = await Notification.findById(notification._id)
            .populate('relatedUser', 'name profilePicture')
            .populate('post', 'title');
          
          io.to(receiverSocketId).emit('new_notification', populatedNotification);
        }
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    // Mark message as read
    socket.on('mark_message_read', async (data) => {
      try {
        const { conversationId, userId } = data;

        await Message.updateMany(
          { conversationId, receiver: userId, isRead: false },
          { $set: { isRead: true } }
        );

        const unreadCount = await Message.countDocuments({
          receiver: userId,
          isRead: false,
        });

        socket.emit('unread_counts', { messages: unreadCount });
      } catch (error) {
        console.error('Mark message read error:', error);
      }
    });

    // Mark notification as read
    socket.on('mark_notification_read', async (data) => {
      try {
        const { notificationId, userId } = data;

        await Notification.findByIdAndUpdate(notificationId, {
          $set: { isRead: true },
        });

        const unreadCount = await Notification.countDocuments({
          recipient: userId,
          isRead: false,
        });

        socket.emit('unread_counts', { notifications: unreadCount });
      } catch (error) {
        console.error('Mark notification read error:', error);
      }
    });

    // Mark all notifications as read
    socket.on('mark_all_notifications_read', async (userId) => {
      try {
        await Notification.updateMany(
          { recipient: userId, isRead: false },
          { $set: { isRead: true } }
        );

        socket.emit('unread_counts', { notifications: 0 });
      } catch (error) {
        console.error('Mark all notifications read error:', error);
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
      }
    });
  });

  return io;
};

// Helper function to send notification to user
const sendNotificationToUser = async (io, userId, notificationData) => {
  try {
    const notification = await Notification.create(notificationData);
    
    const populatedNotification = await Notification.findById(notification._id)
      .populate('relatedUser', 'name profilePicture')
      .populate('post', 'title');

    const socketId = connectedUsers.get(userId.toString());
    if (socketId) {
      io.to(socketId).emit('new_notification', populatedNotification);
      
      const unreadCount = await Notification.countDocuments({
        recipient: userId,
        isRead: false,
      });
      io.to(socketId).emit('unread_counts', { notifications: unreadCount });
    }

    return notification;
  } catch (error) {
    console.error('Send notification error:', error);
  }
};

module.exports = { initializeSocket, sendNotificationToUser, connectedUsers };