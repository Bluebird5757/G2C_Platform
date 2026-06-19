import { Router } from 'express';
import * as messageController from '../controllers/message.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Retrieve all active chat conversation summaries for the logged-in user
router.get('/conversations', authenticate, messageController.getConversations);

// Retrieve full message history with a specific peer user
router.get('/history/:otherUserId', authenticate, messageController.getChatHistory);

export default router;
