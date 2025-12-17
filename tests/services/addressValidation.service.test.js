import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { AddressValidationService } from '../../src/services/addressValidation.service.js';
import { GoogleProvider } from '../../src/services/providers/google.provider.js';

// Mock the GoogleProvider
jest.mock('../../src/services/providers/google.provider.js');

describe('AddressValidationService', () => {
  let service;
  let mockProvider;

  beforeEach(() => {
    mockProvider = {
      validateAddress: jest.fn(),
      extractAddressComponents: jest.fn(),
      getLocationType: jest.fn(),
      getProviderName: jest.fn(() => 'google-geocoding'),
    };
    service = new AddressValidationService(mockProvider);
  });

  describe('validateAddress', () => {
    it('should return unverifiable for empty address', async () => {
      const result = await service.validateAddress('');
      expect(result.status).toBe('unverifiable');
      expect(result.confidence).toBe(0);
    });

    it('should return unverifiable for null address', async () => {
      const result = await service.validateAddress(null);
      expect(result.status).toBe('unverifiable');
    });

    it('should return valid status for perfect match', async () => {
      mockProvider.validateAddress.mockResolvedValue({
        status: 'OK',
        results: [
          {
            formatted_address: '1600 Amphitheatre Parkway, Mountain View, CA 94043, USA',
            address_components: [
              { long_name: '1600', types: ['street_number'] },
              { long_name: 'Amphitheatre Parkway', types: ['route'] },
              { long_name: 'Mountain View', types: ['locality'] },
              { short_name: 'CA', types: ['administrative_area_level_1'] },
              { long_name: '94043', types: ['postal_code'] },
            ],
            geometry: { location_type: 'ROOFTOP' },
          },
        ],
      });

      mockProvider.extractAddressComponents.mockReturnValue({
        number: '1600',
        street: 'Amphitheatre Parkway',
        city: 'Mountain View',
        state: 'CA',
        zipCode: '94043',
      });

      mockProvider.getLocationType.mockReturnValue('ROOFTOP');

      const result = await service.validateAddress('1600 Amphitheatre Parkway, Mountain View, CA 94043');

      expect(result.status).toBe('valid');
      expect(result.standardized.number).toBe('1600');
      expect(result.standardized.street).toBe('Amphitheatre Pkwy');
      expect(result.standardized.city).toBe('Mountain View');
      expect(result.standardized.state).toBe('CA');
      expect(result.standardized.zipCode).toBe('94043');
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('should return corrected status for address with typos', async () => {
      mockProvider.validateAddress.mockResolvedValue({
        status: 'OK',
        results: [
          {
            formatted_address: '1600 Amphitheatre Parkway, Mountain View, CA 94043, USA',
            address_components: [
              { long_name: '1600', types: ['street_number'] },
              { long_name: 'Amphitheatre Parkway', types: ['route'] },
              { long_name: 'Mountain View', types: ['locality'] },
              { short_name: 'CA', types: ['administrative_area_level_1'] },
              { long_name: '94043', types: ['postal_code'] },
            ],
            geometry: { location_type: 'ROOFTOP' },
          },
        ],
      });

      mockProvider.extractAddressComponents.mockReturnValue({
        number: '1600',
        street: 'Amphitheatre Parkway',
        city: 'Mountain View',
        state: 'CA',
        zipCode: '94043',
      });

      mockProvider.getLocationType.mockReturnValue('ROOFTOP');

      const result = await service.validateAddress('1600 amphitheatre pkwy mountain view ca');

      expect(result.status).toBe('corrected');
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('should return unverifiable for zero results', async () => {
      mockProvider.validateAddress.mockResolvedValue({
        status: 'ZERO_RESULTS',
        results: [],
      });

      const result = await service.validateAddress('invalid address 99999');

      expect(result.status).toBe('unverifiable');
      expect(result.confidence).toBe(0);
    });

    it('should return unverifiable for multiple results', async () => {
      mockProvider.validateAddress.mockResolvedValue({
        status: 'OK',
        results: [
          { formatted_address: 'Address 1' },
          { formatted_address: 'Address 2' },
        ],
      });

      const result = await service.validateAddress('ambiguous address');

      expect(result.status).toBe('unverifiable');
    });

    it('should return unverifiable for low confidence', async () => {
      mockProvider.validateAddress.mockResolvedValue({
        status: 'OK',
        results: [
          {
            formatted_address: 'Approximate Location',
            address_components: [
              { long_name: 'City', types: ['locality'] },
            ],
            geometry: { location_type: 'APPROXIMATE' },
          },
        ],
      });

      mockProvider.extractAddressComponents.mockReturnValue({
        number: '',
        street: '',
        city: 'City',
        state: '',
        zipCode: '',
      });

      mockProvider.getLocationType.mockReturnValue('APPROXIMATE');

      const result = await service.validateAddress('city only');

      expect(result.status).toBe('unverifiable');
      expect(result.confidence).toBeLessThan(0.7);
    });

    it('should handle provider errors gracefully', async () => {
      mockProvider.validateAddress.mockRejectedValue(new Error('API Error'));

      const result = await service.validateAddress('test address');

      expect(result.status).toBe('unverifiable');
      expect(result.reason).toContain('Validation error');
    });
  });

  describe('createUnverifiableResponse', () => {
    it('should create proper unverifiable response', () => {
      const result = service.createUnverifiableResponse('test address', 'Test reason');

      expect(result.status).toBe('unverifiable');
      expect(result.original).toBe('test address');
      expect(result.confidence).toBe(0);
      expect(result.reason).toBe('Test reason');
      expect(result.standardized).toEqual({
        street: '',
        number: '',
        city: '',
        state: '',
        zipCode: '',
      });
    });

    it('should handle null address in createUnverifiableResponse', () => {
      const result = service.createUnverifiableResponse(null, 'Test reason');
      expect(result.original).toBe('');
    });
  });

  describe('checkExactMatch', () => {
    it('should return false for null or undefined addresses', () => {
      expect(service.checkExactMatch(null, 'formatted')).toBe(false);
      expect(service.checkExactMatch('original', null)).toBe(false);
      expect(service.checkExactMatch(null, null)).toBe(false);
    });

    it('should return true for exact match', () => {
      expect(service.checkExactMatch('1600 Amphitheatre Parkway', '1600 Amphitheatre Parkway')).toBe(true);
    });

    it('should return true when formatted contains original', () => {
      expect(service.checkExactMatch('1600 Amphitheatre', '1600 Amphitheatre Parkway, Mountain View')).toBe(true);
    });

    it('should return true when original contains formatted', () => {
      expect(service.checkExactMatch('1600 Amphitheatre Parkway, Mountain View', '1600 Amphitheatre')).toBe(true);
    });

    it('should handle formatting differences', () => {
      expect(service.checkExactMatch('1600 Amphitheatre Parkway', '1600-Amphitheatre-Parkway')).toBe(true);
    });
  });

  describe('calculateComponentMatchRatio', () => {
    it('should return 0 when no components are present', () => {
      const ratio = service.calculateComponentMatchRatio('test', {
        number: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
      });
      expect(ratio).toBe(0);
    });

    it('should return 1 when all components match', () => {
      const ratio = service.calculateComponentMatchRatio('1600 Amphitheatre Mountain View CA 94043', {
        number: '1600',
        street: 'Amphitheatre',
        city: 'Mountain View',
        state: 'CA',
        zipCode: '94043',
      });
      expect(ratio).toBe(1);
    });

    it('should return partial ratio when some components match', () => {
      const ratio = service.calculateComponentMatchRatio('1600 Amphitheatre Mountain View', {
        number: '1600',
        street: 'Amphitheatre',
        city: 'Mountain View',
        state: 'NY', // Doesn't match
        zipCode: '94043', // Doesn't match
      });
      expect(ratio).toBe(0.6); // 3 out of 5 match
    });

    it('should be case insensitive', () => {
      const ratio = service.calculateComponentMatchRatio('mountain view', {
        city: 'Mountain View',
      });
      expect(ratio).toBe(1);
    });
  });

  describe('constructor', () => {
    it('should use GoogleProvider when no provider is provided', () => {
      const serviceWithoutProvider = new AddressValidationService();
      expect(serviceWithoutProvider.provider).toBeInstanceOf(GoogleProvider);
    });
  });
});

