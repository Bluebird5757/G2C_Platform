import bcrypt from 'bcryptjs';
import User from '../models/User.model.js';
import GrowerProfile from '../models/GrowerProfile.model.js';
import ConsumerProfile from '../models/ConsumerProfile.model.js';
import { ApiError } from '../utils/apiResponse.js';
import { signToken } from '../utils/jwt.js';
import { ROLES } from '../config/constants.js';

const SALT_ROUNDS = 12;

export const registerUser = async ({ email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, 'Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ email, passwordHash, role });

  if (role === ROLES.GROWER) {
    await GrowerProfile.create({ userId: user._id });
  } else if (role === ROLES.CONSUMER) {
    await ConsumerProfile.create({ userId: user._id });
  }

  const token = signToken({ userId: user._id, role: user.role });

  return {
    user: { id: user._id, email: user.email, role: user.role },
    token,
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Account is deactivated');
  }

  const token = signToken({ userId: user._id, role: user.role });

  return {
    user: { id: user._id, email: user.email, role: user.role },
    token,
  };
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user;
};
