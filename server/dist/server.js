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
dotenv_1.default.config();
const PORT = Number(process.env.PORT || 4000);
async function bootstrap() {
    try {
        // Initialize external services
        await (0, redis_1.connectRedis)();
        await prisma_1.prisma.$connect();
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
