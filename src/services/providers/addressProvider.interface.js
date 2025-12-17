/**
 * Interface/Contract for address validation providers
 * This defines the contract that all providers must implement
 */

/**
 * @typedef {Object} GeocodeResult
 * @property {string} status - Status of the geocoding request
 * @property {Array} results - Array of geocoding results
 */

/**
 * @typedef {Object} AddressComponents
 * @property {string} number - Street number
 * @property {string} street - Street name
 * @property {string} city - City name
 * @property {string} state - State abbreviation
 * @property {string} zipCode - ZIP code
 */

/**
 * Abstract interface for address validation providers
 * All providers must implement these methods
 */
export class AddressProvider {
  /**
   * Validates an address using the provider's API
   * @param {string} address - Free-form address string
   * @returns {Promise<GeocodeResult>} Geocoding result
   * @abstract
   */
  async validateAddress(address) {
    throw new Error('validateAddress must be implemented by provider');
  }

  /**
   * Extracts address components from provider result
   * @param {Object} result - Provider-specific result object
   * @returns {AddressComponents} Extracted address components
   * @abstract
   */
  extractAddressComponents(result) {
    throw new Error('extractAddressComponents must be implemented by provider');
  }

  /**
   * Gets location type/accuracy from provider result
   * @param {Object} result - Provider-specific result object
   * @returns {string} Location type
   * @abstract
   */
  getLocationType(result) {
    throw new Error('getLocationType must be implemented by provider');
  }

  /**
   * Gets provider name/identifier
   * @returns {string} Provider name
   * @abstract
   */
  getProviderName() {
    throw new Error('getProviderName must be implemented by provider');
  }
}
