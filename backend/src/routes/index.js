import { Router } from 'express';
import authRoutes from './auth.routes.js';
import profileRoutes from './profile.routes.js';
import listingRoutes from './listing.routes.js';
import reviewRoutes from './review.routes.js';
import orderRoutes from './order.routes.js';
import messageRoutes from './message.routes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'G2C API is running' });
});

router.use('/auth', authRoutes);
router.use('/', profileRoutes);
router.use('/listings', listingRoutes);
router.use('/', reviewRoutes);
router.use('/orders', orderRoutes);
router.use('/chat', messageRoutes);

export default router;
