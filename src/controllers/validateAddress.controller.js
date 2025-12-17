import { AddressValidationService } from '../services/addressValidation.service.js';
import { isValidNonEmptyString } from '../utils/validation.js';
import { ErrorResponses, handleError } from '../utils/errorHandler.js';
import { logger } from '../utils/logger.js';

const addressValidationService = new AddressValidationService();

/**
 * Controller for address validation endpoint
 */
export class ValidateAddressController {
  /**
   * Handles POST /validate-address request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async validateAddress(req, res) {
    try {
      const { address } = req.body;

      // Basic input validation - using centralized validation
      if (!isValidNonEmptyString(address)) {
        const errorResponse = ErrorResponses.INVALID_REQUEST('Address is required and must be a non-empty string');
        return res.status(errorResponse.statusCode).json(errorResponse);
      }

      // Validate address
      const result = await addressValidationService.validateAddress(address);

      // Return result
      return res.status(200).json(result);
    } catch (error) {
      return handleError(error, res, 'ValidateAddressController', logger);
    }
  }
}

