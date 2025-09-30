import { Client, Notification } from 'pg';
import { logger } from './logger';

let client: Client | null = null;

export async function connectPgListener(connectionString: string): Promise<Client> {
  if (client) return client;
  client = new Client({ connectionString });
  await client.connect();
  await client.query('LISTEN alert_channel');
  logger.info('Listening on PostgreSQL channel alert_channel');
  return client;
}

export function onPgNotification(handler: (payload: any) => void): void {
  if (!client) throw new Error('PG listener not initialized');
  client.on('notification', (msg: Notification) => {
    if (msg.channel !== 'alert_channel' || !msg.payload) return;
    try {
      const data = JSON.parse(msg.payload);
      handler(data);
    } catch (err) {
      // ignore malformed payloads
    }
  });
} 