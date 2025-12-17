import { describe, it, expect } from '@jest/globals';
import { AddressProvider } from '../../../src/services/providers/addressProvider.interface.js';

describe('AddressProvider', () => {
  it('should throw error when validateAddress is called', async () => {
    const provider = new AddressProvider();
    
    await expect(provider.validateAddress('test address')).rejects.toThrow(
      'validateAddress must be implemented by provider'
    );
  });

  it('should throw error when extractAddressComponents is called', () => {
    const provider = new AddressProvider();
    
    expect(() => provider.extractAddressComponents({})).toThrow(
      'extractAddressComponents must be implemented by provider'
    );
  });

  it('should throw error when getLocationType is called', () => {
    const provider = new AddressProvider();
    
    expect(() => provider.getLocationType({})).toThrow(
      'getLocationType must be implemented by provider'
    );
  });

  it('should throw error when getProviderName is called', () => {
    const provider = new AddressProvider();
    
    expect(() => provider.getProviderName()).toThrow(
      'getProviderName must be implemented by provider'
    );
  });
});

