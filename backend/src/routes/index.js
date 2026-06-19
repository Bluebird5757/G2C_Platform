import { Router } from 'express';
import authRoutes from './auth.routes.js';
import profileRoutes from './profile.routes.js';
import listingRoutes from './listing.routes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'G2C API is running' });
});

router.use('/auth', authRoutes);
router.use('/', profileRoutes);
router.use('/listings', listingRoutes);

export default router;
