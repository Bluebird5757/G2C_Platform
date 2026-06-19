import { Router } from 'express';
import * as aiController from '../controllers/ai.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Query parsing can be public (like search is public)
router.post('/search-parse', aiController.parseSearchQuery);

// Chat translation & smart replies require login
router.post('/translate', authenticate, aiController.translateMessage);
router.post('/suggestions', authenticate, aiController.getSmartSuggestions);

export default router;
