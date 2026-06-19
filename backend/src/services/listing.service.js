import Listing from '../models/Listing.model.js';
import GrowerProfile from '../models/GrowerProfile.model.js';
import { ApiError } from '../utils/apiResponse.js';
import { CATEGORIES } from '../config/constants.js';

export const createListing = async (growerId, { category, items }) => {
  const profile = await GrowerProfile.findOne({ userId: growerId });
  if (!profile || !profile.isProfileComplete) {
    throw new ApiError(400, 'Complete your grower profile before listing products');
  }

  if (!Object.values(CATEGORIES).includes(category)) {
    throw new ApiError(400, 'Invalid category');
  }

  const listing = await Listing.create({
    growerId,
    category,
    items: items.map((i) => i.toLowerCase().trim()),
    city: profile.city,
  });

  return listing;
};

export const getMyListings = async (growerId) => {
  return Listing.find({ growerId, isActive: true }).sort({ createdAt: -1 });
};

export const deleteListing = async (growerId, listingId) => {
  const listing = await Listing.findOne({ _id: listingId, growerId });
  if (!listing) {
    throw new ApiError(404, 'Listing not found');
  }

  await Listing.findByIdAndDelete(listingId);
  return { id: listingId };
};

export const removeItemFromListing = async (growerId, listingId, itemName) => {
  const listing = await Listing.findOne({ _id: listingId, growerId });
  if (!listing) {
    throw new ApiError(404, 'Listing not found');
  }

  listing.items = listing.items.filter(
    (item) => item.toLowerCase() !== itemName.toLowerCase()
  );

  if (listing.items.length === 0) {
    await Listing.findByIdAndDelete(listingId);
    return { deleted: true, id: listingId };
  }

  await listing.save();
  return listing;
};

export const getDistinctCities = async () => {
  return Listing.distinct('city', { isActive: true });
};

export const searchGrowers = async ({ category, item, city }) => {
  return Listing.find({
    isActive: true,
    category,
    city,
    items: item.toLowerCase(),
  }).populate({
    path: 'growerId',
    select: 'email',
  });
};

export const getCategoriesMeta = () => {
  return { categories: Object.values(CATEGORIES) };
};
