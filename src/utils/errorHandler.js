/**
 * Centralized error handling utilities
 */

/**
 * Creates standardized error response
 * @param {string} error - Error type/code
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @returns {Object} Standardized error response
 */
export function createErrorResponse(error, message, statusCode = 500) {
  return {
    error,
    message,
    statusCode,
  };
}

/**
 * Common error responses
 */
export const ErrorResponses = {
  INVALID_REQUEST: (message = 'Invalid request') => 
    createErrorResponse('Invalid request', message, 400),
  
  NOT_FOUND: (message = 'Resource not found') => 
    createErrorResponse('Not found', message, 404),
  
  INTERNAL_SERVER_ERROR: (message = 'An unexpected error occurred') => 
    createErrorResponse('Internal server error', message, 500),
  
  VALIDATION_ERROR: (message = 'Validation failed') => 
    createErrorResponse('Validation error', message, 400),
};

/**
 * Handles errors and returns appropriate response
 * @param {Error} error - Error object
 * @param {Object} res - Express response object
 * @param {string} context - Context where error occurred
 * @param {Object} logger - Logger instance
 */
export function handleError(error, res, context = 'Unknown', logger) {
  // Log error with context
  if (logger) {
    logger.error(`Error in ${context}:`, error);
  }

  // Determine status code based on error type
  let statusCode = 500;
  let message = 'An unexpected error occurred';

  if (error.message?.includes('required') || error.message?.includes('Invalid')) {
    statusCode = 400;
    message = error.message;
  } else if (error.message?.includes('not found')) {
    statusCode = 404;
    message = error.message;
  }

  const errorResponse = createErrorResponse(
    'Internal server error',
    message,
    statusCode
  );

  return res.status(statusCode).json(errorResponse);
}
