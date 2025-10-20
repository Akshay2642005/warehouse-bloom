type LogLevel = 'info' | 'error' | 'warn' | 'debug';

/**
 * Simple structured logger for the backend.
 */
export const logger = {
  info(message: string, meta?: unknown): void {
    console.log(JSON.stringify({ level: 'info', message, meta, timestamp: new Date().toISOString() }));
  },
  error(message: string, meta?: unknown): void {
    console.error(JSON.stringify({ level: 'error', message, meta, timestamp: new Date().toISOString() }));
  },
  warn(message: string, meta?: unknown): void {
    console.warn(JSON.stringify({ level: 'warn', message, meta, timestamp: new Date().toISOString() }));
  },
  debug(message: string, meta?: unknown): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(JSON.stringify({ level: 'debug', message, meta, timestamp: new Date().toISOString() }));
    }
  }
}; 