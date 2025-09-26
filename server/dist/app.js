"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const hpp_1 = __importDefault(require("hpp"));
const errorHandler_1 = require("./middlewares/errorHandler");
const notFound_1 = require("./middlewares/notFound");
const auth_routes_1 = require("./routes/auth.routes");
const items_routes_1 = require("./routes/items.routes");
const dashboard_routes_1 = require("./routes/dashboard.routes");
const status_routes_1 = require("./routes/status.routes");
const config_1 = require("./utils/config");
const user_routes_1 = require("./routes/user.routes");
const events_routes_1 = require("./routes/events.routes");
const orders_routes_1 = require("./routes/orders.routes");
const alerts_routes_1 = require("./routes/alerts.routes");
const settings_routes_1 = require("./routes/settings.routes");
const shipments_routes_1 = require("./routes/shipments.routes");
/**
 * Creates and configures the Express application.
 * @returns Configured Express Application instance
 */
function createApp() {
    const app = (0, express_1.default)();
    // Security & parsing middlewares
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({ origin: config_1.config.CLIENT_ORIGIN?.split(',') || '*', credentials: true }));
    app.use(express_1.default.json({ limit: '1mb' }));
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use((0, cookie_parser_1.default)());
    app.use((0, hpp_1.default)());
    app.use((0, morgan_1.default)(config_1.config.NODE_ENV === 'production' ? 'combined' : 'dev'));
    // Basic rate limiting
    const limiter = (0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, max: 100 });
    app.use('/api', limiter);
    // Health
    app.get('/health', (_req, res) => {
        res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    });
    // API routes
    app.use('/api/auth', auth_routes_1.authRouter);
    app.use('/api/items', items_routes_1.itemsRouter);
    app.use('/api/orders', orders_routes_1.ordersRouter);
    app.use('/api/shipments', shipments_routes_1.shipmentsRouter);
    app.use('/api/dashboard', dashboard_routes_1.dashboardRouter);
    app.use('/api/alerts', alerts_routes_1.alertsRouter);
    app.use('/api/status', status_routes_1.statusRouter);
    app.use('/api/users', user_routes_1.userRouter);
    app.use('/api/settings', settings_routes_1.settingsRouter);
    app.use('/api/events', events_routes_1.eventsRouter);
    // 404 and error handling
    app.use(notFound_1.notFoundHandler);
    app.use(errorHandler_1.errorHandler);
    return app;
}
