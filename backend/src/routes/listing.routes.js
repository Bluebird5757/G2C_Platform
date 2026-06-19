import { Router } from 'express';
import * as listingController from '../controllers/listing.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { listingValidator, searchValidator } from '../validators/auth.validator.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.get('/meta', listingController.getMeta);
router.get('/cities', listingController.getCities);
router.get('/price-trends', listingController.getPriceTrends);
router.post('/search', searchValidator, validate, listingController.searchGrowers);

router.post(
  '/',
  authenticate,
  authorize(ROLES.GROWER),
  listingValidator,
  validate,
  listingController.createListing
);

router.get(
  '/mine',
  authenticate,
  authorize(ROLES.GROWER),
  listingController.getMyListings
);

router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.GROWER),
  listingController.deleteListing
);

router.patch(
  '/:id/items',
  authenticate,
  authorize(ROLES.GROWER),
  listingController.removeItem
);

export default router;
