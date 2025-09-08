"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseConfig = exports.apiDocsConfig = exports.securityConfig = exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET'
];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}
exports.config = {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || 'localhost',
    nodeEnv: process.env.NODE_ENV || 'development',
    cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
        credentials: true,
    },
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
        max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        refreshSecret: process.env.JWT_REFRESH_SECRET,
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    },
    mongodb: {
        uri: process.env.MONGODB_URI,
        options: {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            bufferMaxEntries: 0,
            bufferCommands: false,
        },
    },
    email: {
        smtp: {
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            secure: process.env.SMTP_PORT === '465',
            auth: {
                user: process.env.SMTP_USER || '',
                pass: process.env.SMTP_PASS || '',
            },
        },
        from: process.env.EMAIL_FROM || 'noreply@hbafoundation.org',
    },
    upload: {
        maxSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
        destination: process.env.UPLOAD_PATH || 'uploads/',
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || 'logs/application.log',
    },
};
exports.securityConfig = {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    cookieSecret: process.env.COOKIE_SECRET || 'your-cookie-secret',
    adminEmail: process.env.ADMIN_EMAIL || 'admin@hbafoundation.org',
    adminPassword: process.env.ADMIN_PASSWORD || 'change-this-secure-password',
};
exports.apiDocsConfig = {
    enabled: process.env.API_DOCS_ENABLED === 'true' || exports.config.nodeEnv === 'development',
    path: process.env.API_DOCS_PATH || '/api-docs',
    title: 'HBA Foundation Scholarship Platform API',
    version: '2.0.0',
    description: 'RESTful API for managing scholarship opportunities and contributions',
};
exports.databaseConfig = {
    uri: exports.config.mongodb.uri,
    testUri: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/hba-foundation-test',
    options: exports.config.mongodb.options,
};
exports.default = exports.config;
//# sourceMappingURL=index.js.map