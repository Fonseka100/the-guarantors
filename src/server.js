import { createApp } from './app.js';
import { config, validateConfig } from './config/env.js';
import { logger } from './utils/logger.js';

/**
 * Sets up graceful shutdown handlers
 * @param {Object} server - Express server instance
 */
function setupGracefulShutdown(server) {
  const shutdown = (signal) => {
    logger.info(`${signal} received, shutting down gracefully...`);
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

/**
 * Starts the server
 */
async function startServer() {
  try {
    // Validate configuration
    validateConfig();

    // Create Express app
    const app = createApp();

    // Start server
    const server = app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
      logger.info(`Address validation endpoint: http://localhost:${config.port}/validate-address`);
      logger.info(`Health check: http://localhost:${config.port}/health`);
    });

    // Setup graceful shutdown
    setupGracefulShutdown(server);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();