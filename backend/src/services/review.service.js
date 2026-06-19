import mongoose from 'mongoose';
import Review from '../models/Review.model.js';
import User from '../models/User.model.js';
import ConsumerProfile from '../models/ConsumerProfile.model.js';
import { ApiError } from '../utils/apiResponse.js';
import { ROLES } from '../config/constants.js';

export const addOrUpdateReview = async (consumerId, growerId, { rating, comment }) => {
  // 1. Verify grower exists
  const grower = await User.findOne({ _id: growerId, role: ROLES.GROWER });
  if (!grower) {
    throw new ApiError(404, 'Grower not found');
  }

  // 2. Add or update the review
  const review = await Review.findOneAndUpdate(
    { consumerId, growerId },
    { rating, comment },
    { new: true, upsert: true, runValidators: true }
  );

  return review;
};

export const getGrowerReviews = async (growerId) => {
  const reviews = await Review.find({ growerId })
    .populate({
      path: 'consumerId',
      select: 'email',
    })
    .sort({ createdAt: -1 });

  // Map to include consumer profile names if available
  const populatedReviews = await Promise.all(
    reviews.map(async (rev) => {
      const profile = await ConsumerProfile.findOne({ userId: rev.consumerId._id });
      const revObj = rev.toObject();
      revObj.consumerName = profile?.name || 'Anonymous Consumer';
      return revObj;
    })
  );

  return populatedReviews;
};

export const getGrowerRatingStats = async (growerId) => {
  const stats = await Review.aggregate([
    { $match: { growerId: new mongoose.Types.ObjectId(growerId) } },
    {
      $group: {
        _id: '$growerId',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length === 0) {
    return { averageRating: 0, totalReviews: 0 };
  }

  return {
    averageRating: Math.round(stats[0].averageRating * 10) / 10,
    totalReviews: stats[0].totalReviews,
  };
};
