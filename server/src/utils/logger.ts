import { config } from './config';

export interface LogContext {
  [key: string]: any;
}

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;

  private constructor() {
    this.logLevel = (process.env.NODE_ENV === 'production' ? 'warn' : 'error') as LogLevel;
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
    return levels[level] <= levels[this.logLevel];
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    if (config.isDevelopment) {
      // Simple format for development
      const contextStr = context ? ` ${JSON.stringify(context)}` : '';
      return `[${level.toUpperCase()}] ${message}${contextStr}`;
    }
    
    // JSON format for production
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...(context && Object.keys(context).length > 0 ? { context } : {})
    };

    return JSON.stringify(logEntry);
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, context);
    
    switch (level) {
      case 'error':
        console.error(formattedMessage);
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      case 'info':
        console.info(formattedMessage);
        break;
      case 'debug':
        console.debug(formattedMessage);
        break;
    }

    // In production, you might want to send logs to external service
    if (config.isProduction && level === 'error') {
      this.sendToExternalService(level, message, context);
    }
  }

  private async sendToExternalService(level: LogLevel, message: string, context?: LogContext): Promise<void> {
    // Implement external logging service integration here
    // Examples: DataDog, New Relic, CloudWatch, etc.
    try {
      // Example implementation would go here
    } catch (error) {
      // Fallback to console if external service fails
      console.error('Failed to send log to external service:', error);
    }
  }

  public error(message: string, context?: LogContext): void {
    this.log('error', message, context);
  }

  public warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  public info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  public debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  // Convenience methods for common scenarios
  public httpRequest(req: any, res: any, duration?: number): void {
    this.info('HTTP Request', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id,
      ...(duration ? { duration: `${duration}ms` } : {})
    });
  }

  public httpError(req: any, error: Error, statusCode: number): void {
    this.error('HTTP Error', {
      method: req.method,
      url: req.url,
      statusCode,
      error: error.message,
      stack: config.isDevelopment ? error.stack : undefined,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id
    });
  }

  public databaseQuery(query: string, duration?: number, error?: Error): void {
    if (error) {
      this.error('Database Query Failed', {
        query: query.substring(0, 200), // Truncate long queries
        error: error.message,
        ...(duration ? { duration: `${duration}ms` } : {})
      });
    } else {
      this.debug('Database Query', {
        query: query.substring(0, 200),
        ...(duration ? { duration: `${duration}ms` } : {})
      });
    }
  }

  public security(event: string, context?: LogContext): void {
    this.warn(`Security Event: ${event}`, context);
  }

  public performance(metric: string, value: number, unit: string = 'ms', context?: LogContext): void {
    this.info(`Performance Metric: ${metric}`, {
      value,
      unit,
      ...context
    });
  }

  public business(event: string, context?: LogContext): void {
    this.info(`Business Event: ${event}`, context);
  }
}

export const logger = Logger.getInstance();