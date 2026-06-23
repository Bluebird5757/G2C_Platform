import Listing from '../models/Listing.model.js';
import GrowerProfile from '../models/GrowerProfile.model.js';
import Order from '../models/Order.model.js';
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
  const query = {
    isActive: true,
    category,
    items: item.toLowerCase(),
  };

  // Only filter by city if provided (proximity mode skips city)
  if (city && city.trim()) {
    query.city = city;
  }

  const listings = await Listing.find(query).populate({
    path: 'growerId',
    select: 'email',
  });

  const growerIds = listings.map((l) => l.growerId._id || l.growerId);
  const profiles = await GrowerProfile.find({ userId: { $in: growerIds } });

  return listings.map((l) => {
    const profile = profiles.find(
      (p) => p.userId.toString() === (l.growerId._id || l.growerId).toString()
    );
    const obj = l.toObject();
    obj.growerProfile = profile
      ? {
          name: profile.name,
          city: profile.city,
          latitude: profile.latitude,
          longitude: profile.longitude,
          avatar: profile.avatar,
          isProfileComplete: profile.isProfileComplete,
        }
      : null;
    return obj;
  });
};

export const getCategoriesMeta = () => {
  return { categories: Object.values(CATEGORIES) };
};

export const getPriceTrends = async () => {
  return Order.aggregate([
    {
      $unwind: '$items',
    },
    {
      $lookup: {
        from: 'growerprofiles',
        localField: 'growerId',
        foreignField: 'userId',
        as: 'profile',
      },
    },
    {
      $unwind: '$profile',
    },
    {
      $group: {
        _id: {
          item: '$items.name',
          city: '$profile.city',
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        },
        avgPrice: { $avg: '$items.price' },
      },
    },
    {
      $project: {
        _id: 0,
        item: '$_id.item',
        city: '$_id.city',
        date: '$_id.date',
        avgPrice: { $round: ['$avgPrice', 2] },
      },
    },
    {
      $sort: { date: 1 },
    },
  ]);
};
