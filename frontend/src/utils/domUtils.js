/**
 * DOM Utilities for safe element access
 * Prevents errors when browser extensions try to access non-existent elements
 */

// Safe querySelector that won't throw errors
export const safeQuerySelector = (selector, context = document) => {
  try {
    return context.querySelector(selector);
  } catch (error) {
    console.warn(`Failed to query selector "${selector}":`, error);
    return null;
  }
};

// Safe querySelectorAll that won't throw errors
export const safeQuerySelectorAll = (selector, context = document) => {
  try {
    return context.querySelectorAll(selector);
  } catch (error) {
    console.warn(`Failed to query selector all "${selector}":`, error);
    return [];
  }
};

// Safe getElementById that won't throw errors
export const safeGetElementById = (id, context = document) => {
  try {
    return context.getElementById(id);
  } catch (error) {
    console.warn(`Failed to get element by id "${id}":`, error);
    return null;
  }
};

// Safe addEventListener that checks if element exists
export const safeAddEventListener = (element, event, handler, options = {}) => {
  if (element && typeof element.addEventListener === 'function') {
    try {
      element.addEventListener(event, handler, options);
      return true;
    } catch (error) {
      console.warn(`Failed to add event listener for "${event}":`, error);
      return false;
    }
  }
  return false;
};

// Safe removeEventListener that checks if element exists
export const safeRemoveEventListener = (element, event, handler, options = {}) => {
  if (element && typeof element.removeEventListener === 'function') {
    try {
      element.removeEventListener(event, handler, options);
      return true;
    } catch (error) {
      console.warn(`Failed to remove event listener for "${event}":`, error);
      return false;
    }
  }
  return false;
};

// Wait for element to exist before executing callback
export const waitForElement = (selector, timeout = 5000, context = document) => {
  return new Promise((resolve, reject) => {
    const element = safeQuerySelector(selector, context);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver((mutations, obs) => {
      const element = safeQuerySelector(selector, context);
      if (element) {
        obs.disconnect();
        resolve(element);
      }
    });

    observer.observe(context.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element "${selector}" not found within ${timeout}ms`));
    }, timeout);
  });
};

// Prevent browser extension conflicts
export const preventExtensionConflicts = () => {
  // Override common extension methods that might cause conflicts
  if (typeof window !== 'undefined') {
    // Store original methods
    const originalQuerySelector = document.querySelector;
    const originalQuerySelectorAll = document.querySelectorAll;
    
    // Wrap with error handling
    document.querySelector = function(selector) {
      try {
        return originalQuerySelector.call(this, selector);
      } catch (error) {
        console.warn(`Extension conflict prevented for querySelector("${selector}"):`, error);
        return null;
      }
    };
    
    document.querySelectorAll = function(selector) {
      try {
        return originalQuerySelectorAll.call(this, selector);
      } catch (error) {
        console.warn(`Extension conflict prevented for querySelectorAll("${selector}"):`, error);
        return [];
      }
    };
  }
};

// Initialize DOM safety measures
export const initializeDOMSafety = () => {
  preventExtensionConflicts();
  
  // Add global error handler for DOM-related errors
  window.addEventListener('error', (event) => {
    if (event.filename && (event.filename.includes('contentscript') || event.filename.includes('extension'))) {
      console.warn('Browser extension error caught and handled:', event.message);
      event.preventDefault();
      return false;
    }
  });
  
  // Handle unhandled promise rejections from extensions
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && 
        (event.reason.message.includes('message channel') || 
         event.reason.message.includes('extension') ||
         event.reason.message.includes('chrome.runtime'))) {
      console.warn('Extension promise rejection caught and handled:', event.reason.message);
      event.preventDefault();
      return false;
    }
  });
  
  // Prevent extension image loading violations
  const originalImage = window.Image;
  window.Image = function() {
    const img = new originalImage();
    img.addEventListener('error', (event) => {
      if (event.target.src && event.target.src.includes('extension://')) {
        console.warn('Extension image loading prevented:', event.target.src);
        event.preventDefault();
        return false;
      }
    });
    return img;
  };
  
  console.log('🔒 DOM safety measures initialized');
};
