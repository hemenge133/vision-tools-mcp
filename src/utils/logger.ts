/**
 * Simple logging utility for the MCP server
 */

const writeToStderr = (prefix: string, message: string, ...optionalParams: any[]) => {
  const paramStr = optionalParams.length > 0 ? ` ${optionalParams.map(p => JSON.stringify(p)).join(' ')}` : '';
  process.stderr.write(`${prefix} ${message}${paramStr}\n`);
};

/**
 * Log an informational message
 * @param message The message to log
 * @param optionalParams Additional parameters to log
 */
export function logInfo(message: string, ...optionalParams: any[]) {
  writeToStderr('[INFO]', message, ...optionalParams);
}

/**
 * Log an error message
 * @param message The message to log
 * @param optionalParams Additional parameters to log
 */
export function logError(message: string, ...optionalParams: any[]) {
  writeToStderr('[ERROR]', message, ...optionalParams);
}

/**
 * Log a warning message
 * @param message The message to log
 * @param optionalParams Additional parameters to log
 */
export function logWarning(message: string, ...optionalParams: any[]) {
  writeToStderr('[WARN]', message, ...optionalParams);
}

/**
 * Log a debug message (only in development mode)
 * @param message The message to log
 * @param optionalParams Additional parameters to log
 */
export function logDebug(message: string, ...optionalParams: any[]) {
  if (process.env.NODE_ENV === 'development') {
    writeToStderr('[DEBUG]', message, ...optionalParams);
  }
} 