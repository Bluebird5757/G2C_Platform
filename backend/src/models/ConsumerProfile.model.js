import mongoose from 'mongoose';

const consumerProfileSchema = new mongoose.Schema(
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
    avatar: { type: String, default: 'default-avatar.jpg' },
    isProfileComplete: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

const ConsumerProfile = mongoose.model('ConsumerProfile', consumerProfileSchema);
export default ConsumerProfile;
