import dotenv from 'dotenv';

dotenv.config();

/**
 * Environment configuration
 */
export const config = {
  port: process.env.PORT || 3000,
  addressApiKey: process.env.ADDRESS_API_KEY,
  confidenceThreshold: 0.7,
};

/**
 * Validates that required environment variables are set
 */
export function validateConfig() {
  if (!config.addressApiKey) {
    throw new Error('ADDRESS_API_KEY is required. Please set it in your .env file.');
  }
}
