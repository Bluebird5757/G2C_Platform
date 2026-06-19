import { Router } from 'express';
import * as reviewController from '../controllers/review.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { reviewValidator } from '../validators/auth.validator.js';
import { ROLES } from '../config/constants.js';

const router = Router();

// Consumers can post or update their review for a grower
router.post(
  '/growers/:growerId/reviews',
  authenticate,
  authorize(ROLES.CONSUMER),
  reviewValidator,
  validate,
  reviewController.addReview
);

// Anyone can view reviews for a grower
router.get(
  '/growers/:growerId/reviews',
  reviewController.getGrowerReviews
);

export default router;
