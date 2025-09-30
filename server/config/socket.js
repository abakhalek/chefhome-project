import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId} (${socket.userRole})`);

    // Join user to their personal room
    socket.join(`user-${socket.userId}`);
    socket.join(`role-${socket.userRole}`);

    // Handle booking notifications
    socket.on('booking-update', (data) => {
      if (data.targetUserId) {
        socket.to(`user-${data.targetUserId}`).emit('booking-notification', {
          type: data.type,
          bookingId: data.bookingId,
          message: data.message,
          timestamp: new Date()
        });
      }
    });

    // Handle chat messages
    socket.on('send-message', async (data) => {
      try {
        // Validate message data
        if (!data.recipientId || !data.content) {
          socket.emit('error', { message: 'Invalid message data' });
          return;
        }

        // Send message to recipient
        socket.to(`user-${data.recipientId}`).emit('new-message', {
          id: data.id,
          senderId: socket.userId,
          senderName: data.senderName,
          content: data.content,
          timestamp: new Date(),
          conversationId: data.conversationId
        });

        // Confirm message sent
        socket.emit('message-sent', { messageId: data.id });
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing-start', (data) => {
      socket.to(`user-${data.recipientId}`).emit('user-typing', {
        userId: socket.userId,
        conversationId: data.conversationId
      });
    });

    socket.on('typing-stop', (data) => {
      socket.to(`user-${data.recipientId}`).emit('user-stopped-typing', {
        userId: socket.userId,
        conversationId: data.conversationId
      });
    });

    // Handle chef availability updates
    socket.on('availability-update', (data) => {
      // Broadcast to admin users
      socket.to('role-admin').emit('chef-availability-changed', {
        chefId: socket.userId,
        availability: data.availability,
        timestamp: new Date()
      });
    });

    // Handle admin actions
    socket.on('admin-action', (data) => {
      if (socket.userRole === 'admin' && data.targetUserId) {
        socket.to(`user-${data.targetUserId}`).emit('admin-notification', {
          type: data.type,
          message: data.message,
          timestamp: new Date()
        });
      }
    });

    // Handle B2B mission updates
    socket.on('mission-update', (data) => {
      if (socket.userRole === 'b2b') {
        // Notify relevant chefs about new missions
        socket.to('role-chef').emit('new-mission-available', {
          missionId: data.missionId,
          title: data.title,
          budget: data.budget,
          location: data.location,
          timestamp: new Date()
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${socket.userId} (${reason})`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.userId}:`, error);
    });
  });

  // Broadcast system notifications
  io.broadcastSystemNotification = (notification) => {
    io.emit('system-notification', {
      ...notification,
      timestamp: new Date()
    });
  };

  // Send notification to specific user
  io.sendToUser = (userId, event, data) => {
    io.to(`user-${userId}`).emit(event, {
      ...data,
      timestamp: new Date()
    });
  };

  // Send notification to role
  io.sendToRole = (role, event, data) => {
    io.to(`role-${role}`).emit(event, {
      ...data,
      timestamp: new Date()
    });
  };

  return io;
};