/**
 * Naming Convention Standards
 * Defines consistent naming patterns across the codebase
 */

// Naming convention rules
export const NAMING_CONVENTIONS = {
  // File naming
  files: {
    components: 'PascalCase', // Header.jsx, BookingModal.jsx
    hooks: 'camelCase with use prefix', // useAuth.js, useApi.js
    utilities: 'camelCase', // apiService.js, validation.js
    constants: 'UPPER_SNAKE_CASE', // API_ENDPOINTS.js, ERROR_TYPES.js
    types: 'PascalCase with .types suffix', // User.types.js, Booking.types.js
  },

  // Variable naming
  variables: {
    camelCase: [
      'function names',
      'variable names',
      'object properties',
      'array indices',
      'event handlers',
      'API responses',
      'component props'
    ],
    PascalCase: [
      'component names',
      'class names',
      'constructor functions',
      'React components'
    ],
    UPPER_SNAKE_CASE: [
      'constants',
      'environment variables',
      'API endpoints',
      'error types',
      'enum values'
    ],
    kebab-case: [
      'CSS classes',
      'HTML attributes',
      'URL paths',
      'file names in some contexts'
    ]
  },

  // Specific patterns
  patterns: {
    // React components
    componentNames: /^[A-Z][a-zA-Z0-9]*$/,
    
    // Hooks
    hookNames: /^use[A-Z][a-zA-Z0-9]*$/,
    
    // Event handlers
    eventHandlers: /^handle[A-Z][a-zA-Z0-9]*$/,
    
    // API functions
    apiFunctions: /^[a-z][a-zA-Z0-9]*$/,
    
    // Constants
    constants: /^[A-Z][A-Z0-9_]*$/,
    
    // CSS classes
    cssClasses: /^[a-z][a-z0-9-]*$/
  }
};

// Common naming violations to fix
export const COMMON_VIOLATIONS = {
  // Mixed case issues
  mixedCase: [
    'userData', // Should be userData (camelCase)
    'user_data', // Should be userData (camelCase)
    'UserData', // Should be userData (camelCase) for variables
  ],

  // Inconsistent prefixes
  inconsistentPrefixes: [
    'getUserData', // Should be getUserData (consistent with other getters)
    'fetchUserData', // Should be getUserData (standardize on get)
    'loadUserData', // Should be getUserData (standardize on get)
  ],

  // Inconsistent suffixes
  inconsistentSuffixes: [
    'userInfo', // Should be user (if it's the main user object)
    'userData', // Should be user (if it's the main user object)
    'userObject', // Should be user (if it's the main user object)
  ]
};

// Naming transformation functions
export const namingTransformers = {
  // Convert snake_case to camelCase
  snakeToCamel: (str) => {
    return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
  },

  // Convert camelCase to snake_case
  camelToSnake: (str) => {
    return str.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`);
  },

  // Convert to PascalCase
  toPascalCase: (str) => {
    return str.replace(/(^|_)([a-z])/g, (match, prefix, letter) => letter.toUpperCase());
  },

  // Convert to kebab-case
  toKebabCase: (str) => {
    return str.replace(/([A-Z])/g, (match) => `-${match.toLowerCase()}`).replace(/^-/, '');
  },

  // Convert to UPPER_SNAKE_CASE
  toUpperSnakeCase: (str) => {
    return str.replace(/([A-Z])/g, (match) => `_${match}`).toUpperCase().replace(/^_/, '');
  }
};

// Validation functions
export const validators = {
  // Validate component name
  isValidComponentName: (name) => {
    return NAMING_CONVENTIONS.patterns.componentNames.test(name);
  },

  // Validate hook name
  isValidHookName: (name) => {
    return NAMING_CONVENTIONS.patterns.hookNames.test(name);
  },

  // Validate event handler name
  isValidEventHandlerName: (name) => {
    return NAMING_CONVENTIONS.patterns.eventHandlers.test(name);
  },

  // Validate API function name
  isValidApiFunctionName: (name) => {
    return NAMING_CONVENTIONS.patterns.apiFunctions.test(name);
  },

  // Validate constant name
  isValidConstantName: (name) => {
    return NAMING_CONVENTIONS.patterns.constants.test(name);
  }
};

// Naming suggestions
export const namingSuggestions = {
  // Common component naming patterns
  components: {
    'Header': 'Header',
    'Footer': 'Footer',
    'Navigation': 'Navigation',
    'Sidebar': 'Sidebar',
    'Modal': 'Modal',
    'Button': 'Button',
    'Input': 'Input',
    'Form': 'Form',
    'Card': 'Card',
    'List': 'List',
    'Item': 'Item',
    'Container': 'Container',
    'Wrapper': 'Wrapper',
    'Layout': 'Layout',
    'Page': 'Page',
    'Section': 'Section',
    'Block': 'Block',
    'Element': 'Element',
    'Component': 'Component'
  },

  // Common hook naming patterns
  hooks: {
    'useAuth': 'useAuth',
    'useApi': 'useApi',
    'useLocalStorage': 'useLocalStorage',
    'useDebounce': 'useDebounce',
    'useThrottle': 'useThrottle',
    'useClickOutside': 'useClickOutside',
    'useIntersectionObserver': 'useIntersectionObserver',
    'useMediaQuery': 'useMediaQuery',
    'useWindowSize': 'useWindowSize',
    'useScrollPosition': 'useScrollPosition'
  },

  // Common API function naming patterns
  apiFunctions: {
    'get': 'get',
    'post': 'post',
    'put': 'put',
    'patch': 'patch',
    'delete': 'delete',
    'create': 'create',
    'update': 'update',
    'remove': 'remove',
    'find': 'find',
    'search': 'search',
    'fetch': 'fetch',
    'load': 'load',
    'save': 'save',
    'validate': 'validate',
    'check': 'check',
    'verify': 'verify'
  }
};

// Generate naming report
export function generateNamingReport() {
  return {
    summary: {
      totalConventions: Object.keys(NAMING_CONVENTIONS).length,
      commonViolations: COMMON_VIOLATIONS.mixedCase.length + COMMON_VIOLATIONS.inconsistentPrefixes.length,
      transformers: Object.keys(namingTransformers).length,
      validators: Object.keys(validators).length
    },
    recommendations: [
      {
        priority: 'high',
        title: 'Standardize variable naming',
        description: 'Use camelCase for all variables and functions',
        action: 'Convert snake_case and mixed case to camelCase',
        impact: 'High - Improves code readability and consistency'
      },
      {
        priority: 'medium',
        title: 'Standardize component naming',
        description: 'Use PascalCase for all React components',
        action: 'Ensure all component files use PascalCase',
        impact: 'Medium - Follows React conventions'
      },
      {
        priority: 'low',
        title: 'Standardize hook naming',
        description: 'Use camelCase with use prefix for all hooks',
        action: 'Ensure all custom hooks start with use',
        impact: 'Low - Follows React hooks conventions'
      }
    ],
    nextSteps: [
      'Run ESLint with naming convention rules',
      'Use automated refactoring tools',
      'Create naming convention documentation',
      'Add pre-commit hooks for naming validation'
    ]
  };
}

export default {
  NAMING_CONVENTIONS,
  COMMON_VIOLATIONS,
  namingTransformers,
  validators,
  namingSuggestions,
  generateNamingReport
};
