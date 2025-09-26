import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth';
import { prisma } from '../utils/prisma';
import { z } from 'zod';
import { sendMail } from '../utils/mailer';

export const alertsRouter = Router();

alertsRouter.get('/', requireAuth, async (_req, res) => {
  const alerts = await prisma.alert.findMany({
    where: { acknowledged: false },
    include: { item: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ success: true, data: { alerts } });
});

alertsRouter.post('/:id/ack', requireAuth, async (req, res) => {
  const { id } = z.object({ id: z.string() }).parse(req.params);
  await prisma.alert.update({ where: { id }, data: { acknowledged: true } });
  res.json({ success: true });
});

alertsRouter.post('/:itemId/restock', requireAuth, async (req, res) => {
  const { itemId } = z.object({ itemId: z.string() }).parse(req.params);
  const { amount } = z.object({ amount: z.coerce.number().int().positive() }).parse(req.body);
  const updated = await prisma.item.update({ where: { id: itemId }, data: { quantity: { increment: amount } } });

  // send email notification
  try {
    const recipient = process.env.ALERTS_TO || process.env.MAIL_TO || 'admin@example.com';
    await sendMail({
      to: recipient,
      subject: `Restock confirmation: ${updated.name} (+${amount})`,
      text: `The item ${updated.name} (SKU ${updated.sku}) was restocked by ${amount}. New quantity: ${updated.quantity}.`
    });
  } catch { }

  res.json({ success: true, data: { item: updated } });
}); 