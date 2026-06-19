import { asyncHandler, sendSuccess } from '../utils/apiResponse.js';
import * as listingService from '../services/listing.service.js';
import { CATEGORY_ITEMS } from '../config/constants.js';

export const createListing = asyncHandler(async (req, res) => {
  const listing = await listingService.createListing(req.user._id, req.body);
  sendSuccess(res, { listing }, 'Listing created', 201);
});

export const getMyListings = asyncHandler(async (req, res) => {
  const listings = await listingService.getMyListings(req.user._id);
  sendSuccess(res, { listings });
});

export const deleteListing = asyncHandler(async (req, res) => {
  const result = await listingService.deleteListing(req.user._id, req.params.id);
  sendSuccess(res, result, 'Listing deleted');
});

export const removeItem = asyncHandler(async (req, res) => {
  const result = await listingService.removeItemFromListing(
    req.user._id,
    req.params.id,
    req.body.item
  );
  sendSuccess(res, { result }, 'Item removed');
});

export const getCities = asyncHandler(async (req, res) => {
  const cities = await listingService.getDistinctCities();
  sendSuccess(res, { cities });
});

export const searchGrowers = asyncHandler(async (req, res) => {
  const listings = await listingService.searchGrowers(req.body);
  sendSuccess(res, { listings });
});

export const getMeta = asyncHandler(async (req, res) => {
  sendSuccess(res, {
    ...listingService.getCategoriesMeta(),
    categoryItems: CATEGORY_ITEMS,
  });
});

export const getPriceTrends = asyncHandler(async (req, res) => {
  const trends = await listingService.getPriceTrends();
  sendSuccess(res, { trends });
});
