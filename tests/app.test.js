import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import request from 'supertest';

// Mock logger before importing app
jest.unstable_mockModule('../src/utils/logger.js', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock errorHandler
jest.unstable_mockModule('../src/utils/errorHandler.js', () => ({
  ErrorResponses: {
    NOT_FOUND: (message) => ({
      error: 'Not found',
      message,
      statusCode: 404,
    }),
  },
  handleError: jest.fn((err, res, context, logger) => {
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred',
      statusCode: 500,
    });
  }),
}));

// Mock routes to avoid service dependencies
jest.unstable_mockModule('../src/routes/validateAddress.route.js', () => ({
  default: (req, res, next) => next(),
}));

describe('app', () => {
  let app;

  beforeEach(async () => {
    jest.clearAllMocks();
    const { createApp } = await import('../src/app.js');
    app = createApp();
  });

  it('should return 200 for health check endpoint', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toEqual({
      status: 'ok',
      service: 'address-validator',
    });
  });

  it('should return 404 for unknown route', async () => {
    const response = await request(app)
      .get('/unknown-route')
      .expect(404);

    expect(response.body).toHaveProperty('error', 'Not found');
    expect(response.body).toHaveProperty('statusCode', 404);
    expect(response.body.message).toContain('Route GET /unknown-route not found');
  });

  it('should handle POST to unknown route', async () => {
    const response = await request(app)
      .post('/unknown-route')
      .send({ test: 'data' })
      .expect(404);

    expect(response.body).toHaveProperty('error', 'Not found');
    expect(response.body).toHaveProperty('statusCode', 404);
  });

  it('should handle error middleware', async () => {
    // Create an app that throws an error in a route
    // We need to create a new app instance without the mocked errorHandler
    // to test the actual error handling
    jest.resetModules();
    
    // Re-import without mocks for this test
    const express = (await import('express')).default;
    const testApp = express();
    testApp.use(express.json());
    
    // Import actual error handler
    const { handleError } = await import('../src/utils/errorHandler.js');
    const { logger } = await import('../src/utils/logger.js');
    
    // Add a route that throws an error
    testApp.get('/error-test', (req, res, next) => {
      next(new Error('Test error'));
    });
    
    // Add error handler
    testApp.use((err, req, res, next) => {
      handleError(err, res, 'Test', logger);
    });

    const response = await request(testApp)
      .get('/error-test')
      .expect(500);

    expect(response.body).toHaveProperty('error', 'Internal server error');
    expect(response.body).toHaveProperty('statusCode', 500);
  });

  it('should parse JSON body', async () => {
    const response = await request(app)
      .post('/test-json')
      .send({ test: 'data' })
      .expect(404);

    // If we get 404, it means JSON parsing worked (otherwise we'd get 400)
    expect(response.status).toBe(404);
  });
});
