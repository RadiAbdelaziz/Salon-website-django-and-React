/**
 * Duplicate Code Detection Utility
 * Identifies and helps remove duplicate code patterns
 */

// Common duplicate patterns found in the codebase
export const COMMON_DUPLICATES = {
  // API request patterns
  apiRequests: [
    {
      pattern: 'fetch(.*?)\\.then\\(response => response\\.json\\(\\)\\)',
      description: 'Repeated fetch with JSON parsing',
      suggestion: 'Use centralized API service'
    },
    {
      pattern: 'localStorage\\.getItem\\([\'"]authToken[\'"]\\)',
      description: 'Repeated auth token retrieval',
      suggestion: 'Use auth context or utility function'
    },
    {
      pattern: 'localStorage\\.setItem\\([\'"]authToken[\'"],',
      description: 'Repeated auth token storage',
      suggestion: 'Use auth context or utility function'
    }
  ],

  // Error handling patterns
  errorHandling: [
    {
      pattern: 'catch \\(error\\) \\{[^}]*console\\.error[^}]*\\}',
      description: 'Repeated error handling with console.error',
      suggestion: 'Use centralized error handler'
    },
    {
      pattern: 'if \\(!response\\.ok\\) \\{[^}]*throw new Error[^}]*\\}',
      description: 'Repeated response.ok checking',
      suggestion: 'Use centralized API service'
    }
  ],

  // Form validation patterns
  formValidation: [
    {
      pattern: 'validateEmail\\([^)]*\\)',
      description: 'Repeated email validation',
      suggestion: 'Use centralized validation utility'
    },
    {
      pattern: 'validatePhone\\([^)]*\\)',
      description: 'Repeated phone validation',
      suggestion: 'Use centralized validation utility'
    },
    {
      pattern: 'validateRequired\\([^)]*\\)',
      description: 'Repeated required field validation',
      suggestion: 'Use centralized validation utility'
    }
  ],

  // UI patterns
  uiPatterns: [
    {
      pattern: 'className=\\{[^}]*\\$\\{[^}]*\\}[^}]*\\}',
      description: 'Repeated className concatenation',
      suggestion: 'Use clsx or classnames utility'
    },
    {
      pattern: 'style=\\{\\{[^}]*var\\(--[^)]*\\)[^}]*\\}\\}',
      description: 'Repeated CSS variable usage',
      suggestion: 'Create CSS utility classes'
    }
  ],

  // State management patterns
  stateManagement: [
    {
      pattern: 'useState\\(null\\)',
      description: 'Repeated null state initialization',
      suggestion: 'Use custom hooks for common state patterns'
    },
    {
      pattern: 'useEffect\\([^,]*,\\[\\]\\)',
      description: 'Repeated empty dependency useEffect',
      suggestion: 'Use custom hooks for common effects'
    }
  ]
};

// Duplicate code detection functions
export const duplicateDetectors = {
  // Detect duplicate API request patterns
  detectApiDuplicates: (code) => {
    const duplicates = [];
    
    COMMON_DUPLICATES.apiRequests.forEach(({ pattern, description, suggestion }) => {
      const regex = new RegExp(pattern, 'g');
      const matches = code.match(regex);
      
      if (matches && matches.length > 1) {
        duplicates.push({
          type: 'api_request',
          pattern: description,
          count: matches.length,
          suggestion,
          matches: matches.slice(0, 3) // Show first 3 matches
        });
      }
    });
    
    return duplicates;
  },

  // Detect duplicate error handling patterns
  detectErrorHandlingDuplicates: (code) => {
    const duplicates = [];
    
    COMMON_DUPLICATES.errorHandling.forEach(({ pattern, description, suggestion }) => {
      const regex = new RegExp(pattern, 'g');
      const matches = code.match(regex);
      
      if (matches && matches.length > 1) {
        duplicates.push({
          type: 'error_handling',
          pattern: description,
          count: matches.length,
          suggestion,
          matches: matches.slice(0, 3)
        });
      }
    });
    
    return duplicates;
  },

  // Detect duplicate validation patterns
  detectValidationDuplicates: (code) => {
    const duplicates = [];
    
    COMMON_DUPLICATES.formValidation.forEach(({ pattern, description, suggestion }) => {
      const regex = new RegExp(pattern, 'g');
      const matches = code.match(regex);
      
      if (matches && matches.length > 1) {
        duplicates.push({
          type: 'validation',
          pattern: description,
          count: matches.length,
          suggestion,
          matches: matches.slice(0, 3)
        });
      }
    });
    
    return duplicates;
  },

  // Detect duplicate UI patterns
  detectUiDuplicates: (code) => {
    const duplicates = [];
    
    COMMON_DUPLICATES.uiPatterns.forEach(({ pattern, description, suggestion }) => {
      const regex = new RegExp(pattern, 'g');
      const matches = code.match(regex);
      
      if (matches && matches.length > 1) {
        duplicates.push({
          type: 'ui_pattern',
          pattern: description,
          count: matches.length,
          suggestion,
          matches: matches.slice(0, 3)
        });
      }
    });
    
    return duplicates;
  },

  // Detect duplicate state management patterns
  detectStateDuplicates: (code) => {
    const duplicates = [];
    
    COMMON_DUPLICATES.stateManagement.forEach(({ pattern, description, suggestion }) => {
      const regex = new RegExp(pattern, 'g');
      const matches = code.match(regex);
      
      if (matches && matches.length > 1) {
        duplicates.push({
          type: 'state_management',
          pattern: description,
          count: matches.length,
          suggestion,
          matches: matches.slice(0, 3)
        });
      }
    });
    
    return duplicates;
  }
};

// Code refactoring suggestions
export const refactoringSuggestions = {
  // API request refactoring
  apiRequests: {
    title: 'Centralize API Requests',
    description: 'Create a centralized API service to handle all requests',
    benefits: [
      'Consistent error handling',
      'Centralized authentication',
      'Easier to maintain',
      'Better caching support'
    ],
    implementation: `
// Before
const response = await fetch('/api/users');
const data = await response.json();

// After
const data = await api.users.getAll();
    `
  },

  // Error handling refactoring
  errorHandling: {
    title: 'Centralize Error Handling',
    description: 'Create a centralized error handling utility',
    benefits: [
      'Consistent error messages',
      'Centralized logging',
      'Better user experience',
      'Easier debugging'
    ],
    implementation: `
// Before
try {
  // some code
} catch (error) {
  console.error('Error:', error);
  alert('Something went wrong');
}

// After
try {
  // some code
} catch (error) {
  handleError(error, 'Component Name');
}
    `
  },

  // Validation refactoring
  validation: {
    title: 'Centralize Validation',
    description: 'Create a centralized validation utility',
    benefits: [
      'Consistent validation rules',
      'Reusable validation functions',
      'Easier to maintain',
      'Better error messages'
    ],
    implementation: `
// Before
const validateEmail = (email) => {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return emailRegex.test(email);
};

// After
import { validateEmail } from '../utils/validation';
    `
  },

  // UI patterns refactoring
  uiPatterns: {
    title: 'Centralize UI Patterns',
    description: 'Create reusable UI components and utilities',
    benefits: [
      'Consistent styling',
      'Reusable components',
      'Easier to maintain',
      'Better performance'
    ],
    implementation: `
// Before
<div className={\`button \${isActive ? 'active' : ''} \${isDisabled ? 'disabled' : ''}\`}>

// After
<div className={cn('button', { active: isActive, disabled: isDisabled })}>
    `
  }
};

// Generate duplicate analysis report
export function generateDuplicateReport() {
  return {
    summary: {
      totalPatterns: Object.keys(COMMON_DUPLICATES).length,
      totalDetectors: Object.keys(duplicateDetectors).length,
      totalSuggestions: Object.keys(refactoringSuggestions).length
    },
    recommendations: [
      {
        priority: 'high',
        title: 'Centralize API requests',
        description: 'Multiple fetch patterns found throughout codebase',
        action: 'Create centralized API service',
        impact: 'High - Reduces code duplication and improves maintainability'
      },
      {
        priority: 'high',
        title: 'Centralize error handling',
        description: 'Repeated error handling patterns found',
        action: 'Create centralized error handler',
        impact: 'High - Improves user experience and debugging'
      },
      {
        priority: 'medium',
        title: 'Centralize validation',
        description: 'Repeated validation patterns found',
        action: 'Create centralized validation utility',
        impact: 'Medium - Improves consistency and maintainability'
      },
      {
        priority: 'low',
        title: 'Optimize UI patterns',
        description: 'Repeated UI patterns found',
        action: 'Create reusable UI components',
        impact: 'Low - Improves consistency and performance'
      }
    ],
    nextSteps: [
      'Run duplicate detection on all files',
      'Prioritize high-impact refactoring',
      'Create utility functions for common patterns',
      'Update existing code to use new utilities',
      'Add linting rules to prevent future duplicates'
    ]
  };
}

export default {
  COMMON_DUPLICATES,
  duplicateDetectors,
  refactoringSuggestions,
  generateDuplicateReport
};
