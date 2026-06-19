import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    consumerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    growerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true, versionKey: false }
);

// A consumer can only review a grower once
reviewSchema.index({ consumerId: 1, growerId: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
