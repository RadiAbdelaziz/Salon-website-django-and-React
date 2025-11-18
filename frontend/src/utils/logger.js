/**
 * Centralized logging utility
 * Provides controlled logging for development vs production
 */

const isDevelopment = process.env.NODE_ENV === 'development';

class Logger {
  constructor() {
    this.enabled = isDevelopment;
    this.logLevel = isDevelopment ? 'debug' : 'error';
  }

  setLevel(level) {
    this.logLevel = level;
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  debug(message, ...args) {
    if (this.enabled && this.shouldLog('debug')) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  info(message, ...args) {
    if (this.enabled && this.shouldLog('info')) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  warn(message, ...args) {
    if (this.enabled && this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  error(message, ...args) {
    if (this.enabled && this.shouldLog('error')) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }

  shouldLog(level) {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  // API specific logging
  apiRequest(url, method, data) {
    this.debug(`API Request: ${method} ${url}`, data);
  }

  apiResponse(url, status, data) {
    this.debug(`API Response: ${status} ${url}`, data);
  }

  apiError(url, error) {
    this.error(`API Error: ${url}`, error);
  }

  // Performance logging
  performance(label, startTime) {
    const duration = Date.now() - startTime;
    this.debug(`Performance: ${label} took ${duration}ms`);
  }

  // User action logging
  userAction(action, details) {
    this.info(`User Action: ${action}`, details);
  }

  // Cache logging
  cacheHit(key) {
    this.debug(`Cache Hit: ${key}`);
  }

  cacheMiss(key) {
    this.debug(`Cache Miss: ${key}`);
  }

  cacheSet(key, ttl) {
    this.debug(`Cache Set: ${key} (TTL: ${ttl}ms)`);
  }
}

// Create singleton instance
export const logger = new Logger();

// Export for use in other modules
export default logger;
