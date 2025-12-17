import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import {
  createErrorResponse,
  ErrorResponses,
  handleError,
} from '../../src/utils/errorHandler.js';

describe('errorHandler', () => {
  let mockRes;
  let mockLogger;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockLogger = {
      error: jest.fn(),
    };
  });

  describe('createErrorResponse', () => {
    it('should create error response with default status code', () => {
      const response = createErrorResponse('Test error', 'Test message');
      
      expect(response).toEqual({
        error: 'Test error',
        message: 'Test message',
        statusCode: 500,
      });
    });

    it('should create error response with custom status code', () => {
      const response = createErrorResponse('Test error', 'Test message', 404);
      
      expect(response).toEqual({
        error: 'Test error',
        message: 'Test message',
        statusCode: 404,
      });
    });
  });

  describe('ErrorResponses', () => {
    it('should create INVALID_REQUEST response with default message', () => {
      const response = ErrorResponses.INVALID_REQUEST();
      
      expect(response).toEqual({
        error: 'Invalid request',
        message: 'Invalid request',
        statusCode: 400,
      });
    });

    it('should create INVALID_REQUEST response with custom message', () => {
      const response = ErrorResponses.INVALID_REQUEST('Custom message');
      
      expect(response).toEqual({
        error: 'Invalid request',
        message: 'Custom message',
        statusCode: 400,
      });
    });

    it('should create NOT_FOUND response with custom message', () => {
      const response = ErrorResponses.NOT_FOUND('Resource not found');
      
      expect(response).toEqual({
        error: 'Not found',
        message: 'Resource not found',
        statusCode: 404,
      });
    });

    it('should create NOT_FOUND response with default message', () => {
      const response = ErrorResponses.NOT_FOUND();
      
      expect(response).toEqual({
        error: 'Not found',
        message: 'Resource not found',
        statusCode: 404,
      });
    });

    it('should create INTERNAL_SERVER_ERROR response', () => {
      const response = ErrorResponses.INTERNAL_SERVER_ERROR();
      
      expect(response).toEqual({
        error: 'Internal server error',
        message: 'An unexpected error occurred',
        statusCode: 500,
      });
    });

    it('should create VALIDATION_ERROR response', () => {
      const response = ErrorResponses.VALIDATION_ERROR('Validation failed');
      
      expect(response).toEqual({
        error: 'Validation error',
        message: 'Validation failed',
        statusCode: 400,
      });
    });

    it('should create VALIDATION_ERROR response with default message', () => {
      const response = ErrorResponses.VALIDATION_ERROR();
      
      expect(response).toEqual({
        error: 'Validation error',
        message: 'Validation failed',
        statusCode: 400,
      });
    });

    it('should create INTERNAL_SERVER_ERROR response with custom message', () => {
      const response = ErrorResponses.INTERNAL_SERVER_ERROR('Custom error message');
      
      expect(response).toEqual({
        error: 'Internal server error',
        message: 'Custom error message',
        statusCode: 500,
      });
    });
  });

  describe('handleError', () => {
    it('should handle generic error and return 500', () => {
      const error = new Error('Generic error');
      
      handleError(error, mockRes, 'TestContext', mockLogger);

      expect(mockLogger.error).toHaveBeenCalledWith('Error in TestContext:', error);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        message: 'An unexpected error occurred',
        statusCode: 500,
      });
    });

    it('should handle error with "required" in message and return 400', () => {
      const error = new Error('Field is required');
      
      handleError(error, mockRes, 'TestContext', mockLogger);

      expect(mockLogger.error).toHaveBeenCalledWith('Error in TestContext:', error);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        message: 'Field is required',
        statusCode: 400,
      });
    });

    it('should handle error with "Invalid" in message and return 400', () => {
      const error = new Error('Invalid input');
      
      handleError(error, mockRes, 'TestContext', mockLogger);

      expect(mockLogger.error).toHaveBeenCalledWith('Error in TestContext:', error);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        message: 'Invalid input',
        statusCode: 400,
      });
    });

    it('should handle error with "not found" in message and return 404', () => {
      const error = new Error('Resource not found');
      
      handleError(error, mockRes, 'TestContext', mockLogger);

      expect(mockLogger.error).toHaveBeenCalledWith('Error in TestContext:', error);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        message: 'Resource not found',
        statusCode: 404,
      });
    });

    it('should work without logger', () => {
      const error = new Error('Test error');
      
      handleError(error, mockRes, 'TestContext', null);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        message: 'An unexpected error occurred',
        statusCode: 500,
      });
    });

    it('should use default context when not provided', () => {
      const error = new Error('Test error');
      
      handleError(error, mockRes, undefined, mockLogger);

      expect(mockLogger.error).toHaveBeenCalledWith('Error in Unknown:', error);
    });

    it('should handle error without message property', () => {
      const error = { customProperty: 'value' };
      
      handleError(error, mockRes, 'TestContext', mockLogger);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Internal server error',
        message: 'An unexpected error occurred',
        statusCode: 500,
      });
    });
  });
});
