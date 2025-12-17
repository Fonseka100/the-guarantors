import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Create a mock service instance
const mockValidateAddress = jest.fn();
const mockServiceInstance = {
  validateAddress: mockValidateAddress,
};

// Mock the module before importing
jest.unstable_mockModule('../../src/services/addressValidation.service.js', () => ({
  AddressValidationService: jest.fn(() => mockServiceInstance),
}));

// Import controller after mocking
const { ValidateAddressController } = await import('../../src/controllers/validateAddress.controller.js');

describe('ValidateAddressController', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    // Reset mocks
    mockValidateAddress.mockClear();

    // Mock request
    mockReq = {
      body: {},
    };

    // Mock response
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateAddress', () => {
    it('should return 400 for missing address', async () => {
      mockReq.body = {};

      await ValidateAddressController.validateAddress(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid request',
        message: 'Address is required and must be a non-empty string',
        statusCode: 400,
      });
      expect(mockValidateAddress).not.toHaveBeenCalled();
    });

    it('should return 400 for non-string address', async () => {
      mockReq.body = { address: 123 };

      await ValidateAddressController.validateAddress(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid request',
        message: 'Address is required and must be a non-empty string',
        statusCode: 400,
      });
      expect(mockValidateAddress).not.toHaveBeenCalled();
    });

    it('should return 400 for empty string address', async () => {
      mockReq.body = { address: '   ' };

      await ValidateAddressController.validateAddress(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid request',
        message: 'Address is required and must be a non-empty string',
        statusCode: 400,
      });
      expect(mockValidateAddress).not.toHaveBeenCalled();
    });

    it('should return validation result for valid address', async () => {
      const mockResult = {
        status: 'corrected',
        original: '1600 amphitheatre pkwy mountain view ca',
        standardized: {
          street: 'Amphitheatre Pkwy',
          number: '1600',
          city: 'Mountain View',
          state: 'CA',
          zipCode: '94043',
        },
        confidence: 0.92,
        provider: 'google-geocoding',
      };

      mockReq.body = { address: '1600 amphitheatre pkwy mountain view ca' };
      mockValidateAddress.mockResolvedValue(mockResult);

      await ValidateAddressController.validateAddress(mockReq, mockRes);

      expect(mockValidateAddress).toHaveBeenCalledWith(
        '1600 amphitheatre pkwy mountain view ca'
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle service errors and return 500', async () => {
      mockReq.body = { address: 'test address' };
      mockValidateAddress.mockRejectedValue(new Error('Service error'));

      await ValidateAddressController.validateAddress(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        message: 'An unexpected error occurred',
        statusCode: 500,
      });
    });
  });
});
