import { Router } from 'express';
import missingPersonRoutes from './missingPersonRoutes';
import locationRoutes from './locationRoutes';
import resourceRoutes from './resourceRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

router.use('/missing-persons', missingPersonRoutes);
router.use('/locations', locationRoutes);
router.use('/resources', resourceRoutes);
// Allow GET for Vercel Cron (it uses GET by default) and POST for manual trigger
router.use('/admin/crawl', adminRoutes);

export default router;



