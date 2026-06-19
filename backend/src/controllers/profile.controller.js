import { asyncHandler, sendSuccess, ApiError } from '../utils/apiResponse.js';
import { getFileUrl } from '../middleware/upload.middleware.js';
import * as profileService from '../services/profile.service.js';
import { getGrowerRatingStats } from '../services/review.service.js';

export const getGrowerProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.getGrowerProfile(req.user._id);
  const stats = await getGrowerRatingStats(req.user._id);
  sendSuccess(res, {
    profile: {
      ...profile.toObject(),
      avatarUrl: getFileUrl(profile.avatar, req),
      averageRating: stats.averageRating,
      totalReviews: stats.totalReviews,
    },
  });
});

export const updateGrowerProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.updateGrowerProfile(req.user._id, req.body);
  const stats = await getGrowerRatingStats(req.user._id);
  sendSuccess(res, {
    profile: {
      ...profile.toObject(),
      avatarUrl: getFileUrl(profile.avatar, req),
      averageRating: stats.averageRating,
      totalReviews: stats.totalReviews,
    },
  }, 'Profile updated');
});

export const uploadGrowerAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Image file is required');
  }
  const filename = (req.file.path && (req.file.path.startsWith('http://') || req.file.path.startsWith('https://'))) 
    ? req.file.path 
    : req.file.filename;
  const profile = await profileService.updateGrowerAvatar(req.user._id, filename);
  const stats = await getGrowerRatingStats(req.user._id);
  sendSuccess(res, {
    profile: {
      ...profile.toObject(),
      avatarUrl: getFileUrl(profile.avatar, req),
      averageRating: stats.averageRating,
      totalReviews: stats.totalReviews,
    },
  }, 'Avatar uploaded');
});

export const getConsumerProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.getConsumerProfile(req.user._id);
  sendSuccess(res, { profile });
});

export const updateConsumerProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.updateConsumerProfile(req.user._id, req.body);
  sendSuccess(res, { profile }, 'Profile updated');
});

export const getPublicGrower = asyncHandler(async (req, res) => {
  const profile = await profileService.getPublicGrowerProfile(req.params.userId);
  const stats = await getGrowerRatingStats(req.params.userId);
  sendSuccess(res, {
    profile: {
      ...profile.toObject(),
      avatarUrl: getFileUrl(profile.avatar, req),
      averageRating: stats.averageRating,
      totalReviews: stats.totalReviews,
    },
  });
});
