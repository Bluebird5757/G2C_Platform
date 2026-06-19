import GrowerProfile from '../models/GrowerProfile.model.js';
import ConsumerProfile from '../models/ConsumerProfile.model.js';
import { ApiError } from '../utils/apiResponse.js';
import { CATEGORIES } from '../config/constants.js';

export const getGrowerProfile = async (userId) => {
  const profile = await GrowerProfile.findOne({ userId });
  if (!profile) {
    throw new ApiError(404, 'Grower profile not found');
  }
  return profile;
};

export const updateGrowerProfile = async (userId, data) => {
  const update = {
    name: data.name,
    city: data.city,
    phone: data.phone || '',
    address: data.address || '',
    aadharLast4: data.aadharLast4 || '',
    latitude: data.latitude !== undefined ? Number(data.latitude) : 0,
    longitude: data.longitude !== undefined ? Number(data.longitude) : 0,
    isProfileComplete: true,
  };

  if (data.category && Object.values(CATEGORIES).includes(data.category)) {
    update.category = data.category;
  }

  const profile = await GrowerProfile.findOneAndUpdate(
    { userId },
    update,
    { new: true, runValidators: true }
  );

  if (!profile) {
    throw new ApiError(404, 'Grower profile not found');
  }

  return profile;
};

export const updateGrowerAvatar = async (userId, filename) => {
  const profile = await GrowerProfile.findOneAndUpdate(
    { userId },
    { avatar: filename },
    { new: true }
  );
  if (!profile) {
    throw new ApiError(404, 'Grower profile not found');
  }
  return profile;
};

export const getConsumerProfile = async (userId) => {
  const profile = await ConsumerProfile.findOne({ userId });
  if (!profile) {
    throw new ApiError(404, 'Consumer profile not found');
  }
  return profile;
};

export const updateConsumerProfile = async (userId, data) => {
  const profile = await ConsumerProfile.findOneAndUpdate(
    { userId },
    {
      name: data.name,
      city: data.city,
      phone: data.phone || '',
      address: data.address || '',
      isProfileComplete: true,
    },
    { new: true, runValidators: true }
  );

  if (!profile) {
    throw new ApiError(404, 'Consumer profile not found');
  }

  return profile;
};

export const getPublicGrowerProfile = async (userId) => {
  const profile = await GrowerProfile.findOne({ userId }).populate('userId', 'email');
  if (!profile) {
    throw new ApiError(404, 'Grower not found');
  }
  return profile;
};
