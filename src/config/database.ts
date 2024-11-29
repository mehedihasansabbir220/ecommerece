import mongoose from 'mongoose';
import { ENV } from './environment';
import logger from './logger';

class Database {
  private uri: string;

  constructor() {
    this.uri = ENV.MONGODB_URI;
  }

  connect(): Promise<typeof mongoose> {
    return mongoose.connect(this.uri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
    })
    .then(connection => {
      logger.info('MongoDB connected successfully');
      return connection;
    })
    .catch(error => {
      logger.error('MongoDB connection error:', error);
      process.exit(1);
    });
  }

  disconnect(): Promise<void> {
    return mongoose.disconnect();
  }
}

export default new Database();