/**
 * Centralized logging utility
 */

/**
 * Log levels
 */
const LogLevel = {
  INFO: 'INFO',
  ERROR: 'ERROR',
  WARN: 'WARN',
  DEBUG: 'DEBUG',
};

/**
 * Formats log message with timestamp and level
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {*} data - Optional data to log
 * @returns {string} Formatted log message
 */
function formatLogMessage(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level}] ${message}`;
  
  if (data !== null) {
    return `${logEntry} ${typeof data === 'object' ? JSON.stringify(data, null, 2) : data}`;
  }
  
  return logEntry;
}

/**
 * Centralized logger utility
 */
export const logger = {
  /**
   * Logs info message
   * @param {string} message - Log message
   * @param {*} data - Optional data to log
   */
  info(message, data = null) {
    console.log(formatLogMessage(LogLevel.INFO, message, data));
  },

  /**
   * Logs error message
   * @param {string} message - Log message
   * @param {Error|*} error - Error object or data to log
   */
  error(message, error = null) {
    const errorData = error instanceof Error 
      ? { message: error.message, stack: error.stack }
      : error;
    console.error(formatLogMessage(LogLevel.ERROR, message, errorData));
  },

  /**
   * Logs warning message
   * @param {string} message - Log message
   * @param {*} data - Optional data to log
   */
  warn(message, data = null) {
    console.warn(formatLogMessage(LogLevel.WARN, message, data));
  },

  /**
   * Logs debug message
   * @param {string} message - Log message
   * @param {*} data - Optional data to log
   */
  debug(message, data = null) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(formatLogMessage(LogLevel.DEBUG, message, data));
    }
  },
};
