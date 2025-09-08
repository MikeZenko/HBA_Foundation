import mongoose from 'mongoose';
import { config } from './index';
import logger from '../utils/logger';

class Database {
  private static instance: Database;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      logger.info('Database already connected');
      return;
    }

    try {
      // Set mongoose options
      mongoose.set('strictQuery', false);
      
      // Connect to MongoDB
      await mongoose.connect(config.mongodb.uri, config.mongodb.options);
      
      this.isConnected = true;
      logger.info('Successfully connected to MongoDB');
      
      // Connection event listeners
      mongoose.connection.on('connected', () => {
        logger.info('Mongoose connected to MongoDB');
      });

      mongoose.connection.on('error', (error) => {
        logger.error('Mongoose connection error:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('Mongoose disconnected from MongoDB');
        this.isConnected = false;
      });

      // Handle application termination
      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });

    } catch (error) {
      logger.error('Error connecting to MongoDB:', error);
      this.isConnected = false;
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.connection.close();
      this.isConnected = false;
      logger.info('Disconnected from MongoDB');
    } catch (error) {
      logger.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  public async healthCheck(): Promise<boolean> {
    try {
      if (!this.isConnected) {
        return false;
      }
      
      // Ping the database
      await mongoose.connection.db.admin().ping();
      return true;
    } catch (error) {
      logger.error('Database health check failed:', error);
      return false;
    }
  }

  public async dropDatabase(): Promise<void> {
    if (config.nodeEnv !== 'test') {
      throw new Error('Database can only be dropped in test environment');
    }
    
    try {
      await mongoose.connection.db.dropDatabase();
      logger.info('Test database dropped successfully');
    } catch (error) {
      logger.error('Error dropping test database:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const database = Database.getInstance();

// Convenience function for connecting
export const connectToDatabase = async (): Promise<void> => {
  await database.connect();
};

// Convenience function for disconnecting
export const disconnectFromDatabase = async (): Promise<void> => {
  await database.disconnect();
};

// Database health check
export const isDatabaseHealthy = async (): Promise<boolean> => {
  return await database.healthCheck();
};

export default database; 