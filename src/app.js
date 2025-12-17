import express from 'express';
import validateAddressRoutes from './routes/validateAddress.route.js';
import { logger } from './utils/logger.js';
import { ErrorResponses, handleError } from './utils/errorHandler.js';

/**
 * Creates and configures Express application
 * @returns {express.Application} Configured Express app
 */
export function createApp() {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging middleware
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'address-validator' });
  });

  // API routes
  app.use('/', validateAddressRoutes);

  // 404 handler
  app.use((req, res) => {
    const errorResponse = ErrorResponses.NOT_FOUND(`Route ${req.method} ${req.path} not found`);
    res.status(errorResponse.statusCode).json(errorResponse);
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    handleError(err, res, 'Express middleware', logger);
  });

  return app;
}
