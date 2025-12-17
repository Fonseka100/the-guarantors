import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { GoogleProvider } from '../../../src/services/providers/google.provider.js';

// Mock fetch globally
global.fetch = jest.fn();

describe('GoogleProvider', () => {
  let provider;

  beforeEach(() => {
    // Reset fetch mock before each test
    global.fetch.mockClear();
    provider = new GoogleProvider();
    // Mock the API key from config
    provider.apiKey = 'test-api-key';
  });

  describe('validateAddress', () => {
    it('should throw error for empty address', async () => {
      await expect(provider.validateAddress('')).rejects.toThrow();
      await expect(provider.validateAddress(null)).rejects.toThrow();
    });

    it('should call Google Geocoding API with correct parameters', async () => {
      const mockResponse = {
        status: 'OK',
        results: [
          {
            formatted_address: '1600 Amphitheatre Parkway, Mountain View, CA 94043, USA',
            address_components: [
              { long_name: '1600', short_name: '1600', types: ['street_number'] },
              { long_name: 'Amphitheatre Parkway', short_name: 'Amphitheatre Pkwy', types: ['route'] },
              { long_name: 'Mountain View', short_name: 'Mountain View', types: ['locality'] },
              { long_name: 'California', short_name: 'CA', types: ['administrative_area_level_1'] },
              { long_name: '94043', short_name: '94043', types: ['postal_code'] },
            ],
            geometry: {
              location_type: 'ROOFTOP',
            },
          },
        ],
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await provider.validateAddress('1600 amphitheatre pkwy mountain view ca');

      expect(global.fetch).toHaveBeenCalledTimes(1);
      const callUrl = global.fetch.mock.calls[0][0];
      expect(callUrl).toContain('maps.googleapis.com');
      expect(callUrl).toContain('address=1600+amphitheatre+pkwy+mountain+view+ca');
      expect(callUrl).toContain('key=test-api-key');
      expect(callUrl).toContain('region=us');
      expect(result.status).toBe('OK');
      expect(result.results).toHaveLength(1);
    });

    it('should handle ZERO_RESULTS status', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'ZERO_RESULTS', results: [] }),
      });

      const result = await provider.validateAddress('invalid address 99999');

      expect(result.status).toBe('ZERO_RESULTS');
      expect(result.results).toEqual([]);
    });

    it('should throw error for REQUEST_DENIED status', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'REQUEST_DENIED' }),
      });

      await expect(provider.validateAddress('test address')).rejects.toThrow('API key is invalid');
    });

    it('should throw error for network failures', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(provider.validateAddress('test address')).rejects.toThrow('Failed to call');
    });
  });

  describe('extractAddressComponents', () => {
    it('should extract all address components correctly', () => {
      const mockResult = {
        address_components: [
          { long_name: '1600', short_name: '1600', types: ['street_number'] },
          { long_name: 'Amphitheatre Parkway', short_name: 'Amphitheatre Pkwy', types: ['route'] },
          { long_name: 'Mountain View', short_name: 'Mountain View', types: ['locality'] },
          { long_name: 'California', short_name: 'CA', types: ['administrative_area_level_1'] },
          { long_name: '94043', short_name: '94043', types: ['postal_code'] },
        ],
      };

      const components = provider.extractAddressComponents(mockResult);

      expect(components.number).toBe('1600');
      expect(components.street).toBe('Amphitheatre Parkway');
      expect(components.city).toBe('Mountain View');
      expect(components.state).toBe('CA');
      expect(components.zipCode).toBe('94043');
    });

    it('should return empty strings for missing components', () => {
      const mockResult = {
        address_components: [],
      };

      const components = provider.extractAddressComponents(mockResult);

      expect(components.number).toBe('');
      expect(components.street).toBe('');
      expect(components.city).toBe('');
      expect(components.state).toBe('');
      expect(components.zipCode).toBe('');
    });

    it('should handle null or undefined result', () => {
      expect(provider.extractAddressComponents(null)).toEqual({
        number: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
      });
    });
  });

  describe('getLocationType', () => {
    it('should return location type from result', () => {
      const mockResult = {
        geometry: {
          location_type: 'ROOFTOP',
        },
      };

      expect(provider.getLocationType(mockResult)).toBe('ROOFTOP');
    });

    it('should return APPROXIMATE as default', () => {
      expect(provider.getLocationType(null)).toBe('APPROXIMATE');
      expect(provider.getLocationType({})).toBe('APPROXIMATE');
    });
  });

  describe('getProviderName', () => {
    it('should return provider name', () => {
      expect(provider.getProviderName()).toBe('google-geocoding');
    });
  });
});
