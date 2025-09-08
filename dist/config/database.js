"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDatabaseHealthy = exports.disconnectFromDatabase = exports.connectToDatabase = exports.database = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = require("./index");
const logger_1 = __importDefault(require("../utils/logger"));
class Database {
    static instance;
    isConnected = false;
    constructor() { }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
    async connect() {
        if (this.isConnected) {
            logger_1.default.info('Database already connected');
            return;
        }
        try {
            mongoose_1.default.set('strictQuery', false);
            await mongoose_1.default.connect(index_1.config.mongodb.uri, index_1.config.mongodb.options);
            this.isConnected = true;
            logger_1.default.info('Successfully connected to MongoDB');
            mongoose_1.default.connection.on('connected', () => {
                logger_1.default.info('Mongoose connected to MongoDB');
            });
            mongoose_1.default.connection.on('error', (error) => {
                logger_1.default.error('Mongoose connection error:', error);
                this.isConnected = false;
            });
            mongoose_1.default.connection.on('disconnected', () => {
                logger_1.default.warn('Mongoose disconnected from MongoDB');
                this.isConnected = false;
            });
            process.on('SIGINT', async () => {
                await this.disconnect();
                process.exit(0);
            });
        }
        catch (error) {
            logger_1.default.error('Error connecting to MongoDB:', error);
            this.isConnected = false;
            throw error;
        }
    }
    async disconnect() {
        if (!this.isConnected) {
            return;
        }
        try {
            await mongoose_1.default.connection.close();
            this.isConnected = false;
            logger_1.default.info('Disconnected from MongoDB');
        }
        catch (error) {
            logger_1.default.error('Error disconnecting from MongoDB:', error);
            throw error;
        }
    }
    getConnectionStatus() {
        return this.isConnected && mongoose_1.default.connection.readyState === 1;
    }
    async healthCheck() {
        try {
            if (!this.isConnected) {
                return false;
            }
            await mongoose_1.default.connection.db.admin().ping();
            return true;
        }
        catch (error) {
            logger_1.default.error('Database health check failed:', error);
            return false;
        }
    }
    async dropDatabase() {
        if (index_1.config.nodeEnv !== 'test') {
            throw new Error('Database can only be dropped in test environment');
        }
        try {
            await mongoose_1.default.connection.db.dropDatabase();
            logger_1.default.info('Test database dropped successfully');
        }
        catch (error) {
            logger_1.default.error('Error dropping test database:', error);
            throw error;
        }
    }
}
exports.database = Database.getInstance();
const connectToDatabase = async () => {
    await exports.database.connect();
};
exports.connectToDatabase = connectToDatabase;
const disconnectFromDatabase = async () => {
    await exports.database.disconnect();
};
exports.disconnectFromDatabase = disconnectFromDatabase;
const isDatabaseHealthy = async () => {
    return await exports.database.healthCheck();
};
exports.isDatabaseHealthy = isDatabaseHealthy;
exports.default = exports.database;
//# sourceMappingURL=database.js.map