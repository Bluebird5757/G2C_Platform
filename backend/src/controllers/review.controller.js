import { asyncHandler, sendSuccess } from '../utils/apiResponse.js';
import * as reviewService from '../services/review.service.js';

export const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const review = await reviewService.addOrUpdateReview(
    req.user._id,
    req.params.growerId,
    { rating, comment }
  );
  sendSuccess(res, { review }, 'Review submitted successfully', 201);
});

export const getGrowerReviews = asyncHandler(async (req, res) => {
  const reviews = await reviewService.getGrowerReviews(req.params.growerId);
  const stats = await reviewService.getGrowerRatingStats(req.params.growerId);
  sendSuccess(res, { reviews, stats });
});
