const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const passport = require("passport");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const postRoutes = require("./routes/postRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const verificationRoutes = require("./routes/verificationRoutes");
require("dotenv").config();
require("./config/passport");

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

// Connect Database
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(passport.initialize());

// Make io accessible in routes
app.set('io', io);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/verifications", verificationRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Socket.IO Connection
const userSockets = new Map();

io.on("connection", (socket) => {

  socket.on("register", (userId) => {
    userSockets.set(userId, socket.id);
    socket.userId = userId;

  });

  // Handle sending messages
  socket.on("sendmessage", async (data) => {
    try {
  
      
      const { conversationId, postId, senderId, receiverId, content } = data;
      
      const Message = require("./models/Message");
      const User = require("./models/User");
      const Post = require("./models/Post");
      const Notification = require("./models/Notification");
      
      // Save message to database
      const newMessage = await Message.create({
        conversationId,
        post: postId,
        sender: senderId,
        receiver: receiverId,
        content,
      });

      // Populate message details
      const populatedMessage = await Message.findById(newMessage._id)
        .populate("sender", "name profilePicture")
        .populate("receiver", "name profilePicture")
        .populate("post", "title images type availability");

      

      // Emit to sender 
      socket.emit("messagesent", populatedMessage);

      // Emit to receiver if online
      const receiverSocketId = userSockets.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newmessage", populatedMessage);
        
      } else {
        
      }

      // Create notification for receiver
      const senderInfo = await User.findById(senderId).select('name profilePicture');
      const postInfo = await Post.findById(postId).select('title images type availability');

      const notification = await Notification.create({
        recipient: receiverId,
        title: "New Message",
        message: `You have a new message from ${senderInfo.name}`,
        type: "message",
        relatedUser: senderId,
        relatedPost: postId,
        isRead: false
      });

      // Populate notification before emitting
      const populatedNotification = await Notification.findById(notification._id)
        .populate('relatedUser', 'name profilePicture')
        .populate('relatedPost', 'title images type availability');

      // Emit notification if receiver is online
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newnotification", populatedNotification);
      }
      
      
    } catch (error) {
      console.error("Send message error:", error);
      socket.emit("messageerror", { message: "Failed to send message" });
    }
  });

  // Handle marking messages as read
  socket.on("markmessageread", async (data) => {
    try {
      const { conversationId, userId } = data;
      
      
      const Message = require("./models/Message");
      
      await Message.updateMany(
        { conversationId, receiver: userId, isRead: false },
        { isRead: true }
      );

      
    } catch (error) {
      console.error("Mark message read error:", error);
    }
  });

  socket.on("disconnect", () => {
    if (socket.userId) {
      userSockets.delete(socket.userId);
      
    }
  });
});

// Make userSockets accessible globally
global.userSockets = userSockets;
global.io = io;

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
