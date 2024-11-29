import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce',
  JWT_SECRET: process.env.JWT_SECRET || 'default_secret',
  STRIPE_SECRET: process.env.STRIPE_SECRET_KEY || '',
  EMAIL_CONFIG: {
    host: process.env.EMAIL_HOST || '',
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || ''
  }
};