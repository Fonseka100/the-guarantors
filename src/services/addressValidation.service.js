import { GoogleProvider } from './providers/google.provider.js';
import {
  normalizeStreet,
  normalizeCity,
  normalizeState,
  normalizeZipCode,
  normalizeNumber,
} from '../utils/addressNormalizer.js';
import {
  calculateConfidence,
  mapGoogleLocationTypeToAccuracy,
} from '../utils/confidenceScore.js';
import { isValidNonEmptyString } from '../utils/validation.js';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

/**
 * Address validation service
 * Abstracts the provider layer and handles business logic
 */
export class AddressValidationService {
  constructor(provider = null) {
    this.provider = provider || new GoogleProvider();
  }

  /**
   * Validates and standardizes an address
   * @param {string} address - Free-form address string
   * @returns {Promise<Object>} Validation response
   */
  async validateAddress(address) {
    try {
      // Validate input
      if (!isValidNonEmptyString(address)) {
        return this.createUnverifiableResponse(address, 'Address is required');
      }

      const trimmedAddress = address.trim();

      // Call provider
      const geocodeResult = await this.provider.validateAddress(trimmedAddress);

      // Handle zero results
      if (geocodeResult.status === 'ZERO_RESULTS' || !geocodeResult.results || geocodeResult.results.length === 0) {
        return this.createUnverifiableResponse(trimmedAddress, 'No results found');
      }

      // Handle multiple results (ambiguous address)
      if (geocodeResult.results.length > 1) {
        return this.createUnverifiableResponse(trimmedAddress, 'Multiple matches found');
      }

      const result = geocodeResult.results[0];

      // Extract and normalize components
      const rawComponents = this.provider.extractAddressComponents(result);
      const standardized = {
        number: normalizeNumber(rawComponents.number),
        street: normalizeStreet(rawComponents.street),
        city: normalizeCity(rawComponents.city),
        state: normalizeState(rawComponents.state),
        zipCode: normalizeZipCode(rawComponents.zipCode),
      };

      // Check if all components are present
      const hasAllComponents = 
        standardized.number &&
        standardized.street &&
        standardized.city &&
        standardized.state &&
        standardized.zipCode;

      // Calculate confidence
      const locationType = this.provider.getLocationType(result);
      const googleAccuracy = mapGoogleLocationTypeToAccuracy(locationType);
      
      // Check if address matches exactly (simplified check)
      const isExactMatch = this.checkExactMatch(trimmedAddress, result.formatted_address);
      
      // Calculate component match ratio
      const componentMatchRatio = this.calculateComponentMatchRatio(trimmedAddress, standardized);

      const confidence = calculateConfidence({
        hasAllComponents,
        googleAccuracy,
        isExactMatch,
        componentMatchRatio,
      });

      // Determine status
      let status;
      if (confidence < config.confidenceThreshold) {
        status = 'unverifiable';
      } else if (isExactMatch && hasAllComponents) {
        status = 'valid';
      } else {
        status = 'corrected';
      }

      return {
        status,
        original: trimmedAddress,
        standardized,
        confidence: Math.round(confidence * 100) / 100, // Round to 2 decimal places
        provider: this.provider.getProviderName(),
      };
    } catch (error) {
      // Defensive programming: never crash on malformed input
      logger.error('Address validation error:', error);
      return this.createUnverifiableResponse(address, `Validation error: ${error.message}`);
    }
  }

  /**
   * Creates an unverifiable response
   * @param {string} address - Original address
   * @param {string} reason - Reason for unverifiable status
   * @returns {Object} Unverifiable response
   */
  createUnverifiableResponse(address, reason) {
    return {
      status: 'unverifiable',
      original: address || '',
      standardized: {
        street: '',
        number: '',
        city: '',
        state: '',
        zipCode: '',
      },
      confidence: 0,
      provider: this.provider.getProviderName(),
      reason,
    };
  }

  /**
   * Checks if the original address matches the formatted address exactly
   * @param {string} original - Original address
   * @param {string} formatted - Formatted address from provider
   * @returns {boolean} True if exact match
   */
  checkExactMatch(original, formatted) {
    if (!original || !formatted) return false;
    
    // Normalize both for comparison (remove all non-alphanumeric characters)
    const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedOriginal = normalize(original);
    const normalizedFormatted = normalize(formatted);
    
    // Check if normalized strings are similar (either contains the other)
    // This handles formatting differences while checking for substantial match
    return normalizedFormatted.includes(normalizedOriginal) || 
           normalizedOriginal.includes(normalizedFormatted);
  }

  /**
   * Calculates how many components from the original address match the standardized version
   * @param {string} original - Original address
   * @param {Object} standardized - Standardized address components
   * @returns {number} Match ratio (0-1)
   */
  calculateComponentMatchRatio(original, standardized) {
    const originalLower = original.toLowerCase();
    let matches = 0;
    let total = 0;

    const components = ['number', 'street', 'city', 'state', 'zipCode'];
    
    for (const component of components) {
      const value = standardized[component];
      if (value) {
        total++;
        if (originalLower.includes(value.toLowerCase())) {
          matches++;
        }
      }
    }

    return total > 0 ? matches / total : 0;
  }
}
