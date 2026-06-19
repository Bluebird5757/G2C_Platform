import { Router } from 'express';
import * as profileController from '../controllers/profile.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import {
  growerProfileValidator,
  consumerProfileValidator,
} from '../validators/auth.validator.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.get(
  '/growers/profile',
  authenticate,
  authorize(ROLES.GROWER),
  profileController.getGrowerProfile
);

router.put(
  '/growers/profile',
  authenticate,
  authorize(ROLES.GROWER),
  growerProfileValidator,
  validate,
  profileController.updateGrowerProfile
);

router.post(
  '/growers/profile/avatar',
  authenticate,
  authorize(ROLES.GROWER),
  upload.single('avatar'),
  profileController.uploadGrowerAvatar
);

router.get(
  '/consumers/profile',
  authenticate,
  authorize(ROLES.CONSUMER),
  profileController.getConsumerProfile
);

router.put(
  '/consumers/profile',
  authenticate,
  authorize(ROLES.CONSUMER),
  consumerProfileValidator,
  validate,
  profileController.updateConsumerProfile
);

router.get('/growers/public/:userId', profileController.getPublicGrower);

export default router;
