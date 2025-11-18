/**
 * Contrast utilities for the salon website
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
  },
  
  // Adjust color for better contrast
  adjustForContrast: (color, targetRatio = 4.5) => {
    const rgb = color.match(/\d+/g);
    if (!rgb) return color;
    
    let [r, g, b] = rgb.map(c => parseInt(c));
    const originalR = r;
    const originalG = g;
    const originalB = b;
    
    // Try to increase contrast by adjusting brightness
    const factor = 1.2;
    r = Math.min(255, Math.round(r * factor));
    g = Math.min(255, Math.round(g * factor));
    b = Math.min(255, Math.round(b * factor));
    
    return `rgb(${r}, ${g}, ${b})`;
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

// Contrast enhancement
export const contrastEnhancer = {
  // Enhance contrast for better readability
  enhance: (element) => {
    const computedStyle = window.getComputedStyle(element);
    const backgroundColor = computedStyle.backgroundColor;
    const color = computedStyle.color;
    
    if (backgroundColor && color) {
      const ratio = contrastUtils.getContrastRatio(backgroundColor, color);
      
      if (ratio < 4.5) {
        // Apply contrast enhancement
        element.style.filter = 'contrast(1.2)';
        element.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.1)';
      }
    }
  },
  
  // Apply to all elements
  enhanceAll: () => {
    const elements = document.querySelectorAll('*');
    elements.forEach(element => {
      contrastEnhancer.enhance(element);
    });
  }
};

// Accessibility color utilities
export const accessibilityColors = {
  // WCAG compliant color combinations
  combinations: {
    // High contrast combinations
    highContrast: {
      black: '#000000',
      white: '#ffffff',
      darkGray: '#333333',
      lightGray: '#cccccc'
    },
    
    // Medium contrast combinations
    mediumContrast: {
      darkBlue: '#1e3a8a',
      lightBlue: '#dbeafe',
      darkGreen: '#166534',
      lightGreen: '#dcfce7'
    },
    
    // Salon brand colors with accessibility
    salon: {
      cream: '#dbc5a6',
      creamText: '#221e1f',
      gold: '#B89F67',
      goldText: '#f6e8d4',
      black: '#000000',
      blackText: '#f6e8d4'
    }
  },
  
  // Get accessible color combination
  getAccessibleCombination: (background, text) => {
    const combinations = accessibilityColors.combinations;
    
    for (const [name, colors] of Object.entries(combinations)) {
      if (colors[background] && colors[text]) {
        const ratio = contrastUtils.getContrastRatio(colors[background], colors[text]);
        if (ratio >= 4.5) {
          return {
            background: colors[background],
            text: colors[text],
            ratio,
            combination: name
          };
        }
      }
    }
    
    return null;
  }
};

// Contrast testing
export const contrastTester = {
  // Test all color combinations on page
  testPage: () => {
    const elements = document.querySelectorAll('*');
    const results = [];
    
    elements.forEach(element => {
      const computedStyle = window.getComputedStyle(element);
      const backgroundColor = computedStyle.backgroundColor;
      const color = computedStyle.color;
      
      if (backgroundColor && color && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const ratio = contrastUtils.getContrastRatio(backgroundColor, color);
        const meetsAA = ratio >= 4.5;
        const meetsAAA = ratio >= 7;
        
        results.push({
          element: element.tagName,
          className: element.className,
          backgroundColor,
          color,
          ratio: ratio.toFixed(2),
          meetsAA,
          meetsAAA
        });
      }
    });
    
    return results;
  },
  
  // Generate contrast report
  generateReport: () => {
    const results = contrastTester.testPage();
    const report = {
      total: results.length,
      passing: results.filter(r => r.meetsAA).length,
      failing: results.filter(r => !r.meetsAA).length,
      results
    };
    
    console.log('Contrast Report:', report);
    return report;
  }
};

// Dynamic contrast adjustment
export const dynamicContrast = {
  // Adjust contrast based on user preferences
  adjust: () => {
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersHighContrast) {
      document.body.classList.add('high-contrast');
    }
    
    if (prefersReducedMotion) {
      document.body.classList.add('reduced-motion');
    }
  },
  
  // Listen for preference changes
  listen: () => {
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    highContrastQuery.addEventListener('change', dynamicContrast.adjust);
    reducedMotionQuery.addEventListener('change', dynamicContrast.adjust);
  }
};

export default {
  contrastUtils,
  highContrastUtils,
  colorSchemeUtils,
  contrastEnhancer,
  accessibilityColors,
  contrastTester,
  dynamicContrast
};