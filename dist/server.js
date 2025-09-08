"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = void 0;
require("express-async-errors");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const path_1 = __importDefault(require("path"));
const config_1 = require("./config");
const database_1 = require("./config/database");
const logger_1 = __importStar(require("./utils/logger"));
const errorHandler_1 = require("./middleware/errorHandler");
const swagger_1 = require("./utils/swagger");
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
app.set('trust proxy', 1);
app.use((0, helmet_1.default)({
    contentSecurityPolicy: config_1.config.nodeEnv === 'production',
    hsts: config_1.config.nodeEnv === 'production'
}));
app.use((0, cors_1.default)(config_1.config.cors));
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, express_mongo_sanitize_1.default)());
if (config_1.config.nodeEnv === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
else {
    app.use((0, morgan_1.default)('combined', { stream: logger_1.stream }));
}
const limiter = (0, express_rate_limit_1.default)({
    windowMs: config_1.config.rateLimit.windowMs,
    max: config_1.config.rateLimit.max,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        error: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api/', limiter);
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config_1.config.nodeEnv
    });
});
app.use('/api', routes_1.default);
(0, swagger_1.setupSwagger)(app);
app.use(express_1.default.static(path_1.default.join(process.cwd(), 'public')));
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(process.cwd(), 'index.html'));
});
app.get('/admin', (req, res) => {
    res.sendFile(path_1.default.join(process.cwd(), 'admin.html'));
});
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
        return next();
    }
    res.sendFile(path_1.default.join(process.cwd(), 'index.html'));
});
app.use(errorHandler_1.notFound);
app.use(errorHandler_1.errorHandler);
const gracefulShutdown = async (signal) => {
    logger_1.default.info(`Received ${signal}, shutting down gracefully...`);
    const server = app.listen();
    server.close(async () => {
        logger_1.default.info('HTTP server closed');
        try {
            const { disconnectFromDatabase } = await Promise.resolve().then(() => __importStar(require('./config/database')));
            await disconnectFromDatabase();
            logger_1.default.info('Database connection closed');
            logger_1.default.info('Graceful shutdown completed');
            process.exit(0);
        }
        catch (error) {
            logger_1.default.error('Error during graceful shutdown:', error);
            process.exit(1);
        }
    });
    setTimeout(() => {
        logger_1.default.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('uncaughtException', (error) => {
    logger_1.default.error('Uncaught Exception:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    logger_1.default.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
const startServer = async () => {
    try {
        await (0, database_1.connectToDatabase)();
        logger_1.default.info('Connected to database successfully');
        const server = app.listen(config_1.config.port, config_1.config.host, () => {
            logger_1.default.info(`Server running at http://${config_1.config.host === '0.0.0.0' ? 'localhost' : config_1.config.host}:${config_1.config.port}`);
            logger_1.default.info(`Environment: ${config_1.config.nodeEnv}`);
            logger_1.default.info(`API Documentation: http://${config_1.config.host === '0.0.0.0' ? 'localhost' : config_1.config.host}:${config_1.config.port}/api-docs`);
        });
        server.on('error', (error) => {
            if (error.syscall !== 'listen') {
                throw error;
            }
            const bind = typeof config_1.config.port === 'string' ? 'Pipe ' + config_1.config.port : 'Port ' + config_1.config.port;
            switch (error.code) {
                case 'EACCES':
                    logger_1.default.error(`${bind} requires elevated privileges`);
                    process.exit(1);
                    break;
                case 'EADDRINUSE':
                    logger_1.default.error(`${bind} is already in use`);
                    process.exit(1);
                    break;
                default:
                    throw error;
            }
        });
        return server;
    }
    catch (error) {
        logger_1.default.error('Failed to start server:', error);
        process.exit(1);
    }
};
exports.startServer = startServer;
if (require.main === module) {
    startServer();
}
exports.default = app;
//# sourceMappingURL=server.js.map