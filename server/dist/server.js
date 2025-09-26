"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = require("./app");
const redis_1 = require("./utils/redis");
const prisma_1 = require("./utils/prisma");
const logger_1 = require("./utils/logger");
const pg_1 = require("./utils/pg");
const mailer_1 = require("./utils/mailer");
dotenv_1.default.config();
const PORT = Number(process.env.PORT || 4000);
async function bootstrap() {
    try {
        // Initialize external services
        await (0, redis_1.connectRedis)();
        await prisma_1.prisma.$connect();
        // Start PG LISTEN for alert notifications
        const databaseUrl = process.env.DATABASE_URL;
        await (0, pg_1.connectPgListener)(databaseUrl);
        (0, pg_1.onPgNotification)(async (payload) => {
            try {
                const redis = (0, redis_1.getRedis)();
                const event = { type: 'alert', data: payload };
                await redis.publish('events', JSON.stringify(event));
                // Send mail for critical/high alerts (if SMTP configured)
                if (process.env.SMTP_HOST) {
                    const severity = String(payload.severity || 'LOW');
                    if (severity === 'CRITICAL' || severity === 'HIGH') {
                        await (0, mailer_1.sendMail)({
                            to: process.env.ALERTS_TO || process.env.MAIL_TO || 'admin@example.com',
                            subject: `[${severity}] ${payload.type} - ${payload.message}`,
                            text: `Alert: ${payload.message} (itemId=${payload.itemId || 'N/A'})\nTime: ${payload.createdAt}`,
                        });
                    }
                }
            }
            catch (err) {
                // log and continue
                logger_1.logger.error('Failed to process alert notification', { err });
            }
        });
        const app = (0, app_1.createApp)();
        app.listen(PORT, () => {
            logger_1.logger.info(`Server listening on http://localhost:${PORT}`);
        });
    }
    catch (err) {
        logger_1.logger.error('Failed to start server', { err });
        process.exit(1);
    }
}
void bootstrap();
