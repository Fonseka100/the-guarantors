import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

describe('env config', () => {
  let originalEnv;
  let originalExit;

  beforeEach(() => {
    originalEnv = process.env;
    originalExit = process.exit;
    process.exit = jest.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
    process.exit = originalExit;
    jest.resetModules();
  });

  it('should load config with default port', async () => {
    delete process.env.PORT;
    delete process.env.ADDRESS_API_KEY;
    
    jest.resetModules();
    const { config } = await import('../../src/config/env.js');
    
    // PORT comes from process.env as string, but default is number
    expect(Number(config.port)).toBe(3000);
    expect(config.confidenceThreshold).toBe(0.7);
  });

  it('should load config with custom port', async () => {
    process.env.PORT = '8080';
    delete process.env.ADDRESS_API_KEY;
    
    jest.resetModules();
    const { config } = await import('../../src/config/env.js');
    
    // PORT from env is always a string
    expect(config.port).toBe('8080');
  });

  it('should load config with address API key', async () => {
    process.env.ADDRESS_API_KEY = 'test-api-key';
    
    jest.resetModules();
    const { config } = await import('../../src/config/env.js');
    
    expect(config.addressApiKey).toBe('test-api-key');
  });

  it('should throw error when ADDRESS_API_KEY is missing in validateConfig', async () => {
    // Save original value
    const originalKey = process.env.ADDRESS_API_KEY;
    delete process.env.ADDRESS_API_KEY;
    
    try {
      jest.resetModules();
      // Import after deleting env var
      const { validateConfig, config } = await import('../../src/config/env.js');
      
      // Config might have value from .env file, so we need to force it to be falsy
      // by temporarily overriding it
      const originalAddressApiKey = config.addressApiKey;
      Object.defineProperty(config, 'addressApiKey', {
        value: undefined,
        writable: true,
        configurable: true,
      });
      
      // Now validateConfig should throw
      expect(() => validateConfig()).toThrow('ADDRESS_API_KEY is required');
      
      // Restore
      config.addressApiKey = originalAddressApiKey;
    } finally {
      // Restore original env
      if (originalKey) {
        process.env.ADDRESS_API_KEY = originalKey;
      }
    }
  });

  it('should not throw error when ADDRESS_API_KEY is present in validateConfig', async () => {
    process.env.ADDRESS_API_KEY = 'test-key';
    
    jest.resetModules();
    const { validateConfig } = await import('../../src/config/env.js');
    
    expect(() => validateConfig()).not.toThrow();
  });
});
