import { Router } from 'express';
import { getAnalyticsSummary } from '../controllers/analytics.controller';

const router = Router();

// GET /api/analytics/summary?from=2025-01-01&to=2025-12-31
// Made public so analytics page can be viewed without authentication
router.get('/summary', getAnalyticsSummary);

export default router;
