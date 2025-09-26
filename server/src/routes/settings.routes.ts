import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth';
import { requireAdmin } from '../middlewares/requireAdmin';
import { prisma } from '../utils/prisma';
import { z } from 'zod';

export const settingsRouter = Router();

settingsRouter.get('/', requireAuth, requireAdmin, async (_req, res) => {
  const rows = await prisma.systemSetting.findMany();
  res.json({ success: true, data: { settings: rows } });
});

settingsRouter.put('/', requireAuth, requireAdmin, async (req, res) => {
  const schema = z.array(z.object({ key: z.string(), value: z.string() }));
  const updates = schema.parse(req.body);
  const results = await Promise.all(updates.map(s => prisma.systemSetting.upsert({ where: { key: s.key }, create: s, update: { value: s.value } })));
  res.json({ success: true, data: { settings: results } });
});

// User preferences placeholder (store in SystemSetting with user-scoped key)
settingsRouter.put('/preferences', requireAuth, async (req, res) => {
  const schema = z.record(z.string());
  const prefs = schema.parse(req.body);
  const userKeyPrefix = `user:${req.user!.id}:`;
  const entries = Object.entries(prefs).map(([k, v]) => ({ key: userKeyPrefix + k, value: v }));
  await Promise.all(entries.map(s => prisma.systemSetting.upsert({ where: { key: s.key }, create: s, update: { value: s.value } })));
  res.json({ success: true });
}); 