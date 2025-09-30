import { Router } from 'express';
import { SearchService } from '../services/search.service';
import { requireAuth } from '../middlewares/requireAuth';
import { createResponse } from '../utils/apiResponse';
import { z } from 'zod';

const router = Router();

const searchSchema = z.object({
  q: z.string().optional(),
  type: z.enum(['items', 'orders']).default('items'),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(50).default(20),
  status: z.string().optional(),
  sortBy: z.string().optional()
});

/**
 * Universal search endpoint
 */
router.get('/', requireAuth, async (req, res) => {
  const params = searchSchema.parse(req.query);
  const { type, ...searchParams } = params;

  let result;
  if (type === 'items') {
    result = await SearchService.searchItems({
      ...searchParams,
      filters: { 
        status: params.status,
        sortBy: params.sortBy,
        ownerId: req.user?.role !== 'ADMIN' ? req.user?.id : undefined
      }
    });
  } else {
    result = await SearchService.searchOrders({
      ...searchParams,
      filters: { 
        status: params.status,
        userId: req.user?.role !== 'ADMIN' ? req.user?.id : undefined
      }
    });
  }

  res.set('Cache-Control', 'public, max-age=30');
  res.json(createResponse({ data: result, message: 'Search completed' }));
});

export { router as searchRouter };