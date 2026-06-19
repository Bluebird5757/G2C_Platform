import { asyncHandler, sendSuccess } from '../utils/apiResponse.js';
import * as messageService from '../services/message.service.js';

export const getConversations = asyncHandler(async (req, res) => {
  const conversations = await messageService.getChatConversations(req.user._id);
  sendSuccess(res, { conversations });
});

export const getChatHistory = asyncHandler(async (req, res) => {
  const messages = await messageService.getChatHistory(
    req.user._id,
    req.params.otherUserId
  );
  sendSuccess(res, { messages });
});
