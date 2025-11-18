/**
 * Centralized error handling utilities
 * Provides consistent error handling patterns across the application
 */

/**
 * Error types
 */
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
};

/**
 * Custom error class
 */
export class AppError extends Error {
  constructor(message, type = ERROR_TYPES.UNKNOWN, statusCode = null, details = null) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Parse error from API response
 */
export function parseApiError(error) {
  if (error instanceof AppError) {
    return error;
  }

  // Network errors
  if (!navigator.onLine) {
    return new AppError(
      'No internet connection. Please check your network and try again.',
      ERROR_TYPES.NETWORK
    );
  }

  // Fetch errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return new AppError(
      'Unable to connect to the server. Please try again later.',
      ERROR_TYPES.NETWORK
    );
  }

  // HTTP errors
  if (error.status) {
    switch (error.status) {
      case 400:
        return new AppError(
          error.message || 'Invalid request. Please check your input.',
          ERROR_TYPES.VALIDATION,
          400,
          error.details
        );
      case 401:
        return new AppError(
          'Authentication required. Please login again.',
          ERROR_TYPES.AUTHENTICATION,
          401
        );
      case 403:
        return new AppError(
          'You do not have permission to perform this action.',
          ERROR_TYPES.AUTHORIZATION,
          403
        );
      case 404:
        return new AppError(
          'The requested resource was not found.',
          ERROR_TYPES.NOT_FOUND,
          404
        );
      case 500:
        return new AppError(
          'Server error. Please try again later.',
          ERROR_TYPES.SERVER,
          500
        );
      default:
        return new AppError(
          error.message || 'An unexpected error occurred.',
          ERROR_TYPES.SERVER,
          error.status
        );
    }
  }

  // Generic errors
  return new AppError(
    error.message || 'An unexpected error occurred.',
    ERROR_TYPES.UNKNOWN
  );
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error) {
  const appError = parseApiError(error);
  
  // Return the error message directly for AppError instances
  if (appError instanceof AppError) {
    return appError.message;
  }

  // Handle specific error types
  switch (appError.type) {
    case ERROR_TYPES.NETWORK:
      return 'Network error. Please check your connection and try again.';
    case ERROR_TYPES.VALIDATION:
      return appError.message || 'Please check your input and try again.';
    case ERROR_TYPES.AUTHENTICATION:
      return 'Please login to continue.';
    case ERROR_TYPES.AUTHORIZATION:
      return 'You do not have permission to perform this action.';
    case ERROR_TYPES.NOT_FOUND:
      return 'The requested item was not found.';
    case ERROR_TYPES.SERVER:
      return 'Server error. Please try again later.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Log error for debugging
 */
export function logError(error, context = '') {
  const appError = parseApiError(error);
  
  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚨 Error${context ? ` in ${context}` : ''}`);
    console.error('Message:', appError.message);
    console.error('Type:', appError.type);
    console.error('Status Code:', appError.statusCode);
    console.error('Details:', appError.details);
    console.error('Timestamp:', appError.timestamp);
    console.error('Stack:', appError.stack);
    console.groupEnd();
  }
}

/**
 * Handle error with user notification
 */
export function handleError(error, context = '', showNotification = true) {
  const appError = parseApiError(error);
  
  // Log error
  logError(appError, context);
  
  // Show user notification if requested
  if (showNotification) {
    const message = getErrorMessage(appError);
    
    // You can integrate with your notification system here
    // For now, we'll use a simple alert
    if (typeof window !== 'undefined' && window.alert) {
      alert(message);
    }
  }
  
  return appError;
}

/**
 * Async error handler wrapper
 */
export function withErrorHandling(asyncFn, context = '') {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      throw handleError(error, context, false);
    }
  };
}

/**
 * React error boundary helper
 */
export function createErrorBoundary(Component, fallback = null) {
  return class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
      logError(error, 'ErrorBoundary');
    }

    render() {
      if (this.state.hasError) {
        return fallback || (
          <div className="error-boundary">
            <h2>Something went wrong.</h2>
            <p>Please refresh the page and try again.</p>
          </div>
        );
      }

      return <Component {...this.props} />;
    }
  };
}

/**
 * Validation error formatter
 */
export function formatValidationErrors(errors) {
  if (typeof errors === 'string') {
    return { general: errors };
  }

  if (Array.isArray(errors)) {
    return { general: errors.join(', ') };
  }

  if (typeof errors === 'object' && errors !== null) {
    const formatted = {};
    Object.keys(errors).forEach(key => {
      const error = errors[key];
      if (Array.isArray(error)) {
        formatted[key] = error[0];
      } else {
        formatted[key] = error;
      }
    });
    return formatted;
  }

  return { general: 'Validation failed' };
}

/**
 * Retry mechanism for failed requests
 */
export async function retryRequest(requestFn, maxRetries = 3, delay = 1000) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Don't retry for certain error types
      if (error.type === ERROR_TYPES.AUTHENTICATION || 
          error.type === ERROR_TYPES.AUTHORIZATION ||
          error.type === ERROR_TYPES.VALIDATION) {
        throw error;
      }
      
      // Wait before retrying
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  
  throw lastError;
}