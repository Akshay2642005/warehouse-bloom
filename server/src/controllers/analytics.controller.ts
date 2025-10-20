import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { createResponse } from '../utils/apiResponse';

function parseDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : d;
}

export const getAnalyticsSummary = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query as { from?: string; to?: string };
    const summary = await AnalyticsService.getSummary({
      from: parseDate(from),
      to: parseDate(to)
    }, req.tenantId);
    // Flatten structure so frontend can directly consume fields
    res.json(createResponse({ data: summary, message: 'Analytics summary generated' }));
  } catch (err: any) {
    console.error('getAnalyticsSummary error', err);
    res.status(500).json(createResponse({ success: false, message: 'Failed to compute analytics summary' }));
  }
};
