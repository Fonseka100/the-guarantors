/**
 * Common validation utilities
 */

/**
 * Validates if a value is a non-empty string
 * @param {*} value - Value to validate
 * @returns {boolean} True if value is a non-empty string
 */
export function isValidNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validates if a value is a string (can be empty)
 * @param {*} value - Value to validate
 * @returns {boolean} True if value is a string
 */
export function isValidString(value) {
  return typeof value === 'string';
}
