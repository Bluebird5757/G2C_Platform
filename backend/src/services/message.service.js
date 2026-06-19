import Message from '../models/Message.model.js';
import User from '../models/User.model.js';
import GrowerProfile from '../models/GrowerProfile.model.js';
import ConsumerProfile from '../models/ConsumerProfile.model.js';

export const saveMessage = async (senderId, receiverId, text) => {
  const message = await Message.create({
    senderId,
    receiverId,
    text,
  });
  return message;
};

export const getChatHistory = async (userId1, userId2) => {
  return Message.find({
    $or: [
      { senderId: userId1, receiverId: userId2 },
      { senderId: userId2, receiverId: userId1 },
    ],
  }).sort({ createdAt: 1 });
};

export const getChatConversations = async (userId) => {
  // Find all messages involving this user, sorted newest first
  const messages = await Message.find({
    $or: [{ senderId: userId }, { receiverId: userId }],
  }).sort({ createdAt: -1 });

  const conversationsMap = new Map();
  for (const msg of messages) {
    const otherUserId =
      msg.senderId.toString() === userId.toString()
        ? msg.receiverId.toString()
        : msg.senderId.toString();

    if (!conversationsMap.has(otherUserId)) {
      conversationsMap.set(otherUserId, msg);
    }
  }

  const conversations = [];
  for (const [otherId, lastMsg] of conversationsMap.entries()) {
    const otherUser = await User.findById(otherId);
    if (!otherUser) continue;

    let name = 'Anonymous User';
    let role = otherUser.role;

    if (role === 'grower') {
      const profile = await GrowerProfile.findOne({ userId: otherId });
      name = profile?.name || 'Unknown Farm';
    } else {
      const profile = await ConsumerProfile.findOne({ userId: otherId });
      name = profile?.name || 'Consumer';
    }

    conversations.push({
      userId: otherId,
      name,
      role,
      email: otherUser.email,
      lastMessage: lastMsg.text,
      lastMessageTime: lastMsg.createdAt,
    });
  }

  return conversations;
};
