import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth';
import { requireAdmin } from '../middlewares/requireAdmin';
import { prisma } from '../utils/prisma';
import { z } from 'zod';

export const settingsRouter = Router();

settingsRouter.get('/', requireAuth, async (_req, res) => {
  const rows = await prisma.systemSetting.findMany({
    where: {
      NOT: {
        key: { startsWith: 'user:' }
      }
    }
  });
  const settings = rows.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {} as Record<string, string>);
  res.json({ success: true, data: settings });
});

settingsRouter.get('/preferences', requireAuth, async (req, res) => {
  const userKeyPrefix = `user:${req.user!.id}:`;
  const rows = await prisma.systemSetting.findMany({
    where: {
      key: { startsWith: userKeyPrefix }
    }
  });
  const preferences = rows.reduce((acc, row) => {
    const key = row.key.replace(userKeyPrefix, '');
    acc[key] = row.value;
    return acc;
  }, {} as Record<string, string>);
  res.json({ success: true, data: preferences });
});

settingsRouter.put('/', requireAuth, requireAdmin, async (req, res) => {
  const schema = z.array(z.object({ key: z.string(), value: z.string() }));
  const updates = schema.parse(req.body);
  await Promise.all(updates.map(s => 
    prisma.systemSetting.upsert({ 
      where: { key: s.key }, 
      create: s, 
      update: { value: s.value } 
    })
  ));
  res.json({ success: true, message: 'Settings updated successfully' });
});

settingsRouter.post('/clear-cache', requireAuth, requireAdmin, async (_req, res) => {
  // In a real app, this would clear Redis cache
  res.json({ success: true, message: 'Cache cleared successfully' });
});

settingsRouter.put('/preferences', requireAuth, async (req, res) => {
  const schema = z.record(z.string());
  const prefs = schema.parse(req.body);
  const userKeyPrefix = `user:${req.user!.id}:`;
  const entries = Object.entries(prefs).map(([k, v]) => ({ key: userKeyPrefix + k, value: v }));
  await Promise.all(entries.map(s => 
    prisma.systemSetting.upsert({ 
      where: { key: s.key }, 
      create: s, 
      update: { value: s.value } 
    })
  ));
  res.json({ success: true, message: 'Preferences updated successfully' });
});

settingsRouter.get('/sessions', requireAuth, async (req, res) => {
  const sessions = await prisma.userSession.findMany({
    where: { userId: req.user!.id },
    orderBy: { lastActivity: 'desc' }
  });
  res.json({ success: true, data: { sessions } });
});

settingsRouter.delete('/sessions/:sessionId', requireAuth, async (req, res) => {
  const { sessionId } = req.params;
  await prisma.userSession.delete({ where: { id: sessionId } });
  res.json({ success: true, message: 'Session revoked successfully' });
});

settingsRouter.delete('/sessions', requireAuth, async (req, res) => {
  await prisma.userSession.deleteMany({ where: { userId: req.user!.id } });
  res.json({ success: true, message: 'All sessions revoked successfully' });
}); 