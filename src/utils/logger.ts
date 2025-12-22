/**
 * Production-ready logger with environment-based filtering
 *
 * Usage:
 *   import { logger } from '@/utils/logger';
 *   logger.info('User loaded character', { characterId: '123' });
 *   logger.warn('Deprecated format detected');
 *   logger.error('Failed to save', error);
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: unknown;
}

// Log levels in order of severity
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Minimum log level based on environment
const getMinLogLevel = (): LogLevel => {
  if (import.meta.env.PROD) {
    return 'warn'; // Only warn and error in production
  }
  return 'debug'; // All logs in development
};

// Format log entry for console output
const formatLogEntry = (entry: LogEntry): string => {
  const time = entry.timestamp.split('T')[1].split('.')[0];
  return `[${time}] [${entry.level.toUpperCase()}] ${entry.message}`;
};

// Check if a log level should be displayed
const shouldLog = (level: LogLevel): boolean => {
  const minLevel = getMinLogLevel();
  return LOG_LEVELS[level] >= LOG_LEVELS[minLevel];
};

// Create a log entry
const createLogEntry = (level: LogLevel, message: string, data?: unknown): LogEntry => ({
  level,
  message,
  timestamp: new Date().toISOString(),
  data,
});

// Console output methods mapped to log levels
const consoleMethod: Record<LogLevel, 'log' | 'info' | 'warn' | 'error'> = {
  debug: 'log',
  info: 'info',
  warn: 'warn',
  error: 'error',
};

// Main logger implementation
const log = (level: LogLevel, message: string, data?: unknown): void => {
  if (!shouldLog(level)) return;

  const entry = createLogEntry(level, message, data);
  const formatted = formatLogEntry(entry);

  const method = consoleMethod[level];

  if (data !== undefined) {
    console[method](formatted, data);
  } else {
    console[method](formatted);
  }
};

/**
 * Logger interface for application-wide logging
 *
 * In production, only warn and error are displayed.
 * In development, all log levels are displayed.
 */
export const logger = {
  /**
   * Debug-level logging (development only)
   * Use for detailed debugging information
   */
  debug: (message: string, data?: unknown): void => log('debug', message, data),

  /**
   * Info-level logging (development only)
   * Use for general operational information
   */
  info: (message: string, data?: unknown): void => log('info', message, data),

  /**
   * Warning-level logging (always displayed)
   * Use for potentially problematic situations
   */
  warn: (message: string, data?: unknown): void => log('warn', message, data),

  /**
   * Error-level logging (always displayed)
   * Use for errors and exceptions
   */
  error: (message: string, data?: unknown): void => log('error', message, data),
};

/**
 * Create a scoped logger with a prefix
 *
 * Usage:
 *   const log = createScopedLogger('Storage');
 *   log.info('Character saved'); // [HH:MM:SS] [INFO] [Storage] Character saved
 */
export const createScopedLogger = (scope: string) => ({
  debug: (message: string, data?: unknown) => logger.debug(`[${scope}] ${message}`, data),
  info: (message: string, data?: unknown) => logger.info(`[${scope}] ${message}`, data),
  warn: (message: string, data?: unknown) => logger.warn(`[${scope}] ${message}`, data),
  error: (message: string, data?: unknown) => logger.error(`[${scope}] ${message}`, data),
});

export default logger;
