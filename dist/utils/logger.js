"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAuth = exports.logDatabaseOperation = exports.logRequest = exports.logDebug = exports.logWarn = exports.logInfo = exports.logError = exports.stream = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const config_1 = require("../config");
const logsDir = path_1.default.dirname(config_1.config.logging.file);
if (!fs_1.default.existsSync(logsDir)) {
    fs_1.default.mkdirSync(logsDir, { recursive: true });
}
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
}), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json(), winston_1.default.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    if (stack) {
        log += `\n${stack}`;
    }
    const metaStr = Object.keys(meta).length > 0 ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return log + metaStr;
}));
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp({
    format: 'HH:mm:ss'
}), winston_1.default.format.printf(({ timestamp, level, message, stack }) => {
    let log = `${timestamp} ${level}: ${message}`;
    if (stack && config_1.config.nodeEnv === 'development') {
        log += `\n${stack}`;
    }
    return log;
}));
const logger = winston_1.default.createLogger({
    level: config_1.config.logging.level,
    format: logFormat,
    defaultMeta: { service: 'hba-foundation' },
    transports: [
        new winston_1.default.transports.File({
            filename: config_1.config.logging.file,
            maxsize: 5242880,
            maxFiles: 5,
            tailable: true
        }),
        new winston_1.default.transports.File({
            filename: path_1.default.join(logsDir, 'error.log'),
            level: 'error',
            maxsize: 5242880,
            maxFiles: 5,
            tailable: true
        }),
    ],
    exceptionHandlers: [
        new winston_1.default.transports.File({
            filename: path_1.default.join(logsDir, 'exceptions.log'),
            maxsize: 5242880,
            maxFiles: 5,
            tailable: true
        })
    ],
    rejectionHandlers: [
        new winston_1.default.transports.File({
            filename: path_1.default.join(logsDir, 'rejections.log'),
            maxsize: 5242880,
            maxFiles: 5,
            tailable: true
        })
    ]
});
if (config_1.config.nodeEnv !== 'production') {
    logger.add(new winston_1.default.transports.Console({
        format: consoleFormat,
        handleExceptions: true,
        handleRejections: true
    }));
}
exports.stream = {
    write: (message) => {
        logger.info(message.trim());
    }
};
const logError = (error, context) => {
    logger.error(error.message, {
        stack: error.stack,
        context,
        timestamp: new Date().toISOString()
    });
};
exports.logError = logError;
const logInfo = (message, metadata) => {
    logger.info(message, metadata);
};
exports.logInfo = logInfo;
const logWarn = (message, metadata) => {
    logger.warn(message, metadata);
};
exports.logWarn = logWarn;
const logDebug = (message, metadata) => {
    logger.debug(message, metadata);
};
exports.logDebug = logDebug;
const logRequest = (req, res, responseTime) => {
    const logData = {
        method: req.method,
        url: req.originalUrl || req.url,
        statusCode: res.statusCode,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
        responseTime: responseTime ? `${responseTime}ms` : undefined,
        userId: req.user?.id,
        timestamp: new Date().toISOString()
    };
    if (res.statusCode >= 400) {
        logger.warn('HTTP Request', logData);
    }
    else {
        logger.info('HTTP Request', logData);
    }
};
exports.logRequest = logRequest;
const logDatabaseOperation = (operation, collection, duration, error) => {
    const logData = {
        operation,
        collection,
        duration: duration ? `${duration}ms` : undefined,
        timestamp: new Date().toISOString()
    };
    if (error) {
        logger.error(`Database ${operation} failed`, {
            ...logData,
            error: error.message,
            stack: error.stack
        });
    }
    else {
        logger.debug(`Database ${operation} completed`, logData);
    }
};
exports.logDatabaseOperation = logDatabaseOperation;
const logAuth = (action, userId, email, success = true, error) => {
    const logData = {
        action,
        userId,
        email,
        success,
        error,
        timestamp: new Date().toISOString()
    };
    if (success) {
        logger.info(`Auth: ${action}`, logData);
    }
    else {
        logger.warn(`Auth: ${action} failed`, logData);
    }
};
exports.logAuth = logAuth;
exports.default = logger;
//# sourceMappingURL=logger.js.map