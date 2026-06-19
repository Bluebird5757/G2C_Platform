import mongoose from 'mongoose';
import { CATEGORIES } from '../config/constants.js';

const listingSchema = new mongoose.Schema(
  {
    growerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: Object.values(CATEGORIES),
      required: true,
    },
    items: {
      type: [String],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'At least one item is required',
      },
    },
    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, versionKey: false }
);

listingSchema.index({ category: 1, city: 1, items: 1 });

const Listing = mongoose.model('Listing', listingSchema);
export default Listing;
