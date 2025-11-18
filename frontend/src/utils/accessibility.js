/**
 * Accessibility utilities for the salon website
 */

// Color contrast utilities
export const contrastUtils = {
  // Calculate contrast ratio between two colors
  getContrastRatio: (color1, color2) => {
    const getLuminance = (color) => {
      const rgb = color.match(/\d+/g);
      if (!rgb) return 0;
      
      const [r, g, b] = rgb.map(c => {
        c = parseInt(c) / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  },
  
  // Check if contrast meets WCAG standards
  meetsWCAG: (color1, color2, level = 'AA') => {
    const ratio = contrastUtils.getContrastRatio(color1, color2);
    const standards = {
      'AA': 4.5,
      'AAA': 7
    };
    
    return ratio >= standards[level];
  },
  
  // Get accessible text color for background
  getAccessibleTextColor: (backgroundColor) => {
    const white = '#ffffff';
    const black = '#000000';
    
    const whiteRatio = contrastUtils.getContrastRatio(backgroundColor, white);
    const blackRatio = contrastUtils.getContrastRatio(backgroundColor, black);
    
    return whiteRatio > blackRatio ? white : black;
  }
};

// Focus management
export const focusManager = {
  // Trap focus within an element
  trapFocus: (element) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };
    
    element.addEventListener('keydown', handleTabKey);
    firstElement?.focus();
    
    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  },
  
  // Restore focus to previous element
  restoreFocus: (element) => {
    if (element) {
      element.focus();
    }
  },
  
  // Get next focusable element
  getNextFocusable: (currentElement) => {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const currentIndex = Array.from(focusableElements).indexOf(currentElement);
    return focusableElements[currentIndex + 1] || focusableElements[0];
  },
  
  // Get previous focusable element
  getPreviousFocusable: (currentElement) => {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const currentIndex = Array.from(focusableElements).indexOf(currentElement);
    return focusableElements[currentIndex - 1] || focusableElements[focusableElements.length - 1];
  }
};

// Screen reader utilities
export const screenReaderUtils = {
  // Announce message to screen readers
  announce: (message, priority = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },
  
  // Create screen reader only text
  srOnly: (text) => {
    const element = document.createElement('span');
    element.className = 'sr-only';
    element.textContent = text;
    return element;
  }
};

// Keyboard navigation
export const keyboardNavigation = {
  // Handle arrow key navigation
  handleArrowKeys: (elements, currentIndex, direction) => {
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const targetIndex = Math.max(0, Math.min(newIndex, elements.length - 1));
    elements[targetIndex]?.focus();
    return targetIndex;
  },
  
  // Handle Enter key
  handleEnter: (element, callback) => {
    element.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        callback();
      }
    });
  },
  
  // Handle Escape key
  handleEscape: (callback) => {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        callback();
      }
    });
  }
};

// ARIA utilities
export const ariaUtils = {
  // Set ARIA attributes
  setAttributes: (element, attributes) => {
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  },
  
  // Toggle ARIA expanded
  toggleExpanded: (element) => {
    const isExpanded = element.getAttribute('aria-expanded') === 'true';
    element.setAttribute('aria-expanded', !isExpanded);
  },
  
  // Set ARIA described by
  setDescribedBy: (element, descriptionId) => {
    element.setAttribute('aria-describedby', descriptionId);
  },
  
  // Set ARIA labelled by
  setLabelledBy: (element, labelId) => {
    element.setAttribute('aria-labelledby', labelId);
  }
};

// Form accessibility
export const formAccessibility = {
  // Add error message to form field
  addErrorMessage: (field, message) => {
    const errorId = `${field.id}-error`;
    let errorElement = document.getElementById(errorId);
    
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.id = errorId;
      errorElement.className = 'error-message';
      errorElement.setAttribute('role', 'alert');
      field.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', errorId);
  },
  
  // Remove error message from form field
  removeErrorMessage: (field) => {
    const errorId = `${field.id}-error`;
    const errorElement = document.getElementById(errorId);
    
    if (errorElement) {
      errorElement.remove();
    }
    
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');
  },
  
  // Validate form field
  validateField: (field, validator) => {
    const isValid = validator(field.value);
    
    if (!isValid) {
      formAccessibility.addErrorMessage(field, 'يرجى إدخال قيمة صحيحة');
    } else {
      formAccessibility.removeErrorMessage(field);
    }
    
    return isValid;
  }
};

// Motion and animation accessibility
export const motionAccessibility = {
  // Check if user prefers reduced motion
  prefersReducedMotion: () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },
  
  // Apply reduced motion styles
  applyReducedMotion: (element) => {
    if (motionAccessibility.prefersReducedMotion()) {
      element.style.animation = 'none';
      element.style.transition = 'none';
    }
  },
  
  // Respect motion preferences
  respectMotionPreferences: (callback) => {
    if (!motionAccessibility.prefersReducedMotion()) {
      callback();
    }
  }
};

// High contrast mode detection
export const highContrastUtils = {
  // Check if high contrast mode is enabled
  isHighContrast: () => {
    return window.matchMedia('(prefers-contrast: high)').matches;
  },
  
  // Apply high contrast styles
  applyHighContrast: (element) => {
    if (highContrastUtils.isHighContrast()) {
      element.classList.add('high-contrast');
    }
  },
  
  // Listen for contrast changes
  onContrastChange: (callback) => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    mediaQuery.addEventListener('change', callback);
    return () => mediaQuery.removeEventListener('change', callback);
  }
};

// Color scheme detection
export const colorSchemeUtils = {
  // Check if dark mode is preferred
  isDarkMode: () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  },
  
  // Listen for color scheme changes
  onColorSchemeChange: (callback) => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', callback);
    return () => mediaQuery.removeEventListener('change', callback);
  }
};

export default {
  contrastUtils,
  focusManager,
  screenReaderUtils,
  keyboardNavigation,
  ariaUtils,
  formAccessibility,
  motionAccessibility,
  highContrastUtils,
  colorSchemeUtils
};