import mongoose from 'mongoose';
import { CATEGORIES } from '../config/constants.js';

const growerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    category: {
      type: String,
      enum: Object.values(CATEGORIES),
      default: CATEGORIES.VEGETABLES,
    },
    aadharLast4: { type: String, trim: true, default: '' },
    avatar: { type: String, default: 'default-avatar.jpg' },
    isProfileComplete: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

const GrowerProfile = mongoose.model('GrowerProfile', growerProfileSchema);
export default GrowerProfile;
