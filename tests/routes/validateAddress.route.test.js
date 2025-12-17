import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import express from 'express';
import request from 'supertest';

describe('validateAddress route', () => {
  let app;
  let mockValidateAddress;

  beforeEach(async () => {
    // Reset modules to ensure fresh imports
    jest.resetModules();
    
    // Mock the controller method
    mockValidateAddress = jest.fn((req, res) => {
      res.status(200).json({ test: 'response' });
    });

    jest.unstable_mockModule('../../src/controllers/validateAddress.controller.js', () => ({
      ValidateAddressController: {
        validateAddress: mockValidateAddress,
      },
    }));

    // Import route after mocking
    const validateAddressRoutes = (await import('../../src/routes/validateAddress.route.js')).default;
    
    app = express();
    app.use(express.json());
    app.use('/', validateAddressRoutes);
  });

  it('should register POST /validate-address route', async () => {
    await request(app)
      .post('/validate-address')
      .send({ address: 'test' })
      .expect(200);

    expect(mockValidateAddress).toHaveBeenCalledTimes(1);
  });

  it('should call controller with req and res', async () => {
    await request(app)
      .post('/validate-address')
      .send({ address: 'test address' })
      .expect(200);

    expect(mockValidateAddress).toHaveBeenCalled();
    const callArgs = mockValidateAddress.mock.calls[0];
    expect(callArgs[0]).toHaveProperty('body');
    expect(callArgs[1]).toHaveProperty('status');
    expect(callArgs[1]).toHaveProperty('json');
  });
});
