import { Router, Request, Response } from 'express';
import { getRedis } from '../utils/redis';

export const eventsRouter = Router();

/** SSE endpoint for realtime events */
eventsRouter.get('/stream', async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const redis = getRedis();
  const subscriber = redis.duplicate();
  await subscriber.connect();
  await subscriber.subscribe('events', (message) => {
    res.write(`data: ${message}\n\n`);
  });

  const heartbeat = setInterval(() => {
    res.write(': ping\n\n');
  }, 30000);

  req.on('close', async () => {
    clearInterval(heartbeat);
    await subscriber.unsubscribe('events');
    await subscriber.disconnect();
    res.end();
  });
}); 