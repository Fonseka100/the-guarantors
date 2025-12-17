import { config } from '../../config/env.js';
import { AddressProvider } from './addressProvider.interface.js';
import { isValidNonEmptyString } from '../../utils/validation.js';
import { logger } from '../../utils/logger.js';

/**
 * Google Geocoding API provider
 * Implements AddressProvider interface
 */
export class GoogleProvider extends AddressProvider {
  constructor() {
    super();
    this.apiKey = config.addressApiKey;
    this.baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
  }

  /**
   * Validates an address using Google Geocoding API
   * @param {string} address - Free-form address string
   * @returns {Promise<Object>} Geocoding result
   */
  async validateAddress(address) {
    if (!isValidNonEmptyString(address)) {
      throw new Error('Address is required and must be a non-empty string');
    }

    const url = new URL(this.baseUrl);
    url.searchParams.set('address', address.trim());
    url.searchParams.set('key', this.apiKey);
    url.searchParams.set('region', 'us'); // Restrict to US addresses

    try {
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Google Geocoding API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === 'REQUEST_DENIED') {
        throw new Error('Google Geocoding API key is invalid or quota exceeded');
      }

      if (data.status === 'ZERO_RESULTS') {
        return {
          results: [],
          status: 'ZERO_RESULTS',
        };
      }

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error(`Google Geocoding API error: ${data.status}`);
      }

      return {
        results: data.results || [],
        status: data.status,
      };
    } catch (error) {
      // Re-throw with more context
      if (error.message.includes('API')) {
        logger.error('Google Geocoding API error:', error);
        throw error;
      }
      logger.error('Failed to call Google Geocoding API:', error);
      throw new Error(`Failed to call Google Geocoding API: ${error.message}`);
    }
  }

  /**
   * Extracts address components from Google Geocoding result
   * @param {Object} result - Google Geocoding result
   * @returns {Object} Extracted address components
   */
  extractAddressComponents(result) {
    if (!result || !result.address_components) {
      return {
        number: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
      };
    }

    const components = result.address_components;
    const extracted = {
      number: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
    };

    for (const component of components) {
      const types = component.types;

      if (types.includes('street_number')) {
        extracted.number = component.long_name;
      } else if (types.includes('route')) {
        extracted.street = component.long_name;
      } else if (types.includes('locality')) {
        extracted.city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        extracted.state = component.short_name;
      } else if (types.includes('postal_code')) {
        extracted.zipCode = component.long_name;
      }
    }

    return extracted;
  }

  /**
   * Gets location type from Google result
   * @param {Object} result - Google Geocoding result
   * @returns {string} Location type
   */
  getLocationType(result) {
    return result?.geometry?.location_type || 'APPROXIMATE';
  }

  /**
   * Gets provider name
   * @returns {string} Provider name
   */
  getProviderName() {
    return 'google-geocoding';
  }
}
