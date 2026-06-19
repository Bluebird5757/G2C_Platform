import { Router } from 'express';
import * as orderController from '../controllers/order.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { orderValidator } from '../validators/auth.validator.js';
import { ROLES } from '../config/constants.js';

const router = Router();

// Place a new order (Consumers only)
router.post(
  '/',
  authenticate,
  authorize(ROLES.CONSUMER),
  orderValidator,
  validate,
  orderController.createOrder
);

// View list of placed orders (Consumers only)
router.get(
  '/consumer',
  authenticate,
  authorize(ROLES.CONSUMER),
  orderController.getConsumerOrders
);

// View list of received orders (Growers only)
router.get(
  '/grower',
  authenticate,
  authorize(ROLES.GROWER),
  orderController.getGrowerOrders
);

// Update order status (Grower accepts/completes, or Consumer/Grower cancels)
router.patch(
  '/:orderId/status',
  authenticate,
  orderController.updateStatus
);

export default router;
