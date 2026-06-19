import { asyncHandler, sendSuccess } from '../utils/apiResponse.js';
import * as aiService from '../services/ai.service.js';

export const parseSearchQuery = asyncHandler(async (req, res) => {
  const { query } = req.body;
  const parsed = await aiService.parseSemanticSearch(query || '');
  sendSuccess(res, parsed, 'Query parsed successfully');
});

export const translateMessage = asyncHandler(async (req, res) => {
  const { text, targetLang } = req.body;
  const translation = await aiService.translateText(text || '', targetLang || 'English');
  sendSuccess(res, { translation }, 'Text translated successfully');
});

export const getSmartSuggestions = asyncHandler(async (req, res) => {
  const { messageText } = req.body;
  const suggestions = await aiService.getSmartReplies(messageText || '');
  sendSuccess(res, { suggestions }, 'Suggestions generated successfully');
});
