import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { logger } from '../../src/utils/logger.js';

describe('logger', () => {
  let originalConsoleLog;
  let originalConsoleError;
  let originalConsoleWarn;
  let originalConsoleDebug;
  let originalEnv;

  beforeEach(() => {
    // Save original console methods
    originalConsoleLog = console.log;
    originalConsoleError = console.error;
    originalConsoleWarn = console.warn;
    originalConsoleDebug = console.debug;
    originalEnv = process.env.NODE_ENV;

    // Mock console methods
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
    console.debug = jest.fn();
  });

  afterEach(() => {
    // Restore original console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    console.debug = originalConsoleDebug;
    process.env.NODE_ENV = originalEnv;
  });

  describe('info', () => {
    it('should log info message without data', () => {
      logger.info('Test message');
      
      expect(console.log).toHaveBeenCalledTimes(1);
      const logCall = console.log.mock.calls[0][0];
      expect(logCall).toContain('[INFO]');
      expect(logCall).toContain('Test message');
      expect(logCall).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should log info message with null data', () => {
      logger.info('Test message', null);
      
      expect(console.log).toHaveBeenCalledTimes(1);
      const logCall = console.log.mock.calls[0][0];
      expect(logCall).toContain('[INFO]');
      expect(logCall).toContain('Test message');
      expect(logCall).not.toContain('null');
    });

    it('should log info message with string data', () => {
      logger.info('Test message', 'additional data');
      
      expect(console.log).toHaveBeenCalledTimes(1);
      const logCall = console.log.mock.calls[0][0];
      expect(logCall).toContain('Test message');
      expect(logCall).toContain('additional data');
    });

    it('should log info message with object data', () => {
      const data = { key: 'value', number: 123 };
      logger.info('Test message', data);
      
      expect(console.log).toHaveBeenCalledTimes(1);
      const logCall = console.log.mock.calls[0][0];
      expect(logCall).toContain('Test message');
      expect(logCall).toContain('"key": "value"');
      expect(logCall).toContain('"number": 123');
    });

    it('should format log message correctly when data is null', () => {
      logger.info('Test message', null);
      
      expect(console.log).toHaveBeenCalledTimes(1);
      const logCall = console.log.mock.calls[0][0];
      expect(logCall).toContain('Test message');
      // Should not contain "null" as string
      expect(logCall.split('Test message')[1] || '').not.toContain('null');
    });
  });

  describe('error', () => {
    it('should log error message without error', () => {
      logger.error('Test error');
      
      expect(console.error).toHaveBeenCalledTimes(1);
      const logCall = console.error.mock.calls[0][0];
      expect(logCall).toContain('[ERROR]');
      expect(logCall).toContain('Test error');
    });

    it('should log error message with Error object', () => {
      const error = new Error('Test error message');
      error.stack = 'Error stack trace';
      
      logger.error('Test error', error);
      
      expect(console.error).toHaveBeenCalledTimes(1);
      const logCall = console.error.mock.calls[0][0];
      expect(logCall).toContain('Test error');
      expect(logCall).toContain('"message": "Test error message"');
      expect(logCall).toContain('"stack": "Error stack trace"');
    });

    it('should log error message with non-Error data', () => {
      const data = { errorCode: 500 };
      
      logger.error('Test error', data);
      
      expect(console.error).toHaveBeenCalledTimes(1);
      const logCall = console.error.mock.calls[0][0];
      expect(logCall).toContain('Test error');
      expect(logCall).toContain('"errorCode": 500');
    });
  });

  describe('warn', () => {
    it('should log warning message', () => {
      logger.warn('Test warning');
      
      expect(console.warn).toHaveBeenCalledTimes(1);
      const logCall = console.warn.mock.calls[0][0];
      expect(logCall).toContain('[WARN]');
      expect(logCall).toContain('Test warning');
    });

    it('should log warning message with data', () => {
      logger.warn('Test warning', { level: 'high' });
      
      expect(console.warn).toHaveBeenCalledTimes(1);
      const logCall = console.warn.mock.calls[0][0];
      expect(logCall).toContain('Test warning');
      expect(logCall).toContain('"level": "high"');
    });
  });

  describe('debug', () => {
    it('should log debug message in development mode', () => {
      process.env.NODE_ENV = 'development';
      
      logger.debug('Test debug');
      
      expect(console.debug).toHaveBeenCalledTimes(1);
      const logCall = console.debug.mock.calls[0][0];
      expect(logCall).toContain('[DEBUG]');
      expect(logCall).toContain('Test debug');
    });

    it('should not log debug message in production mode', () => {
      process.env.NODE_ENV = 'production';
      
      logger.debug('Test debug');
      
      expect(console.debug).not.toHaveBeenCalled();
    });

    it('should not log debug message when NODE_ENV is not set', () => {
      delete process.env.NODE_ENV;
      
      logger.debug('Test debug');
      
      expect(console.debug).not.toHaveBeenCalled();
    });

    it('should log debug message with data in development', () => {
      process.env.NODE_ENV = 'development';
      
      logger.debug('Test debug', { debugInfo: 'value' });
      
      expect(console.debug).toHaveBeenCalledTimes(1);
      const logCall = console.debug.mock.calls[0][0];
      expect(logCall).toContain('Test debug');
      expect(logCall).toContain('"debugInfo": "value"');
    });
  });
});
