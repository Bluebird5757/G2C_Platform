import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { saveMessage } from '../services/message.service.js';

let io;
const userSockets = new Map(); // userId string -> socketId string

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // We can allow all during dev, or handle dynamically
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // JWT socket authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'grower2consumer_super_secret_dev_key_2026');
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.userId;
    userSockets.set(userId, socket.id);
    console.log(`Socket client connected: ${userId} (Socket ID: ${socket.id})`);

    // Listen for live messages
    socket.on('send_message', async (data) => {
      try {
        const { receiverId, text } = data;
        if (!receiverId || !text) return;

        // 1. Save to MongoDB
        const message = await saveMessage(userId, receiverId, text);
        const messageObj = message.toObject();

        // 2. Direct message to receiver if online
        const receiverSocketId = userSockets.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receive_message', messageObj);
        }

        // 3. Confirm back to sender
        socket.emit('message_sent', messageObj);
      } catch (err) {
        console.error('Socket send_message error:', err.message);
      }
    });

    socket.on('disconnect', () => {
      userSockets.delete(userId);
      console.log(`Socket client disconnected: ${userId}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized');
  }
  return io;
};
