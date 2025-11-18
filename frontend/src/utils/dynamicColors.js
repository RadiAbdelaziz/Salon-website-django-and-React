/**
 * Dynamic color utilities for category-based button styling
 */

// Default color fallback
const DEFAULT_PRIMARY_COLOR = '#B89F67'; // salon-gold
const DEFAULT_HOVER_COLOR = '#A68B4F'; // darker gold

/**
 * Get primary color for a category
 * @param {Object} category - Category object with primary_color field
 * @returns {string} - Hex color code
 */
export const getCategoryPrimaryColor = (category) => {
  if (!category) return DEFAULT_PRIMARY_COLOR;
  return category.primary_color || DEFAULT_PRIMARY_COLOR;
};

/**
 * Get hover color for a category (darker version of primary)
 * @param {Object} category - Category object with primary_color field
 * @returns {string} - Hex color code
 */
export const getCategoryHoverColor = (category) => {
  const primaryColor = getCategoryPrimaryColor(category);
  
  // Convert hex to RGB and darken by 15%
  const hex = primaryColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  const darkenedR = Math.max(0, Math.floor(r * 0.85));
  const darkenedG = Math.max(0, Math.floor(g * 0.85));
  const darkenedB = Math.max(0, Math.floor(b * 0.85));
  
  return `#${darkenedR.toString(16).padStart(2, '0')}${darkenedG.toString(16).padStart(2, '0')}${darkenedB.toString(16).padStart(2, '0')}`;
};

/**
 * Get CSS styles for a category's primary button
 * @param {Object} category - Category object with primary_color field
 * @returns {Object} - CSS styles object
 */
export const getCategoryButtonStyles = (category) => {
  const primaryColor = getCategoryPrimaryColor(category);
  const hoverColor = getCategoryHoverColor(category);
  
  return {
    backgroundColor: primaryColor,
    borderColor: primaryColor,
    color: '#ffffff',
    '&:hover': {
      backgroundColor: hoverColor,
      borderColor: hoverColor,
    },
    '&:focus': {
      backgroundColor: hoverColor,
      borderColor: hoverColor,
      boxShadow: `0 0 0 3px ${primaryColor}33`, // 20% opacity
    },
    '&:active': {
      backgroundColor: hoverColor,
      borderColor: hoverColor,
    }
  };
};

/**
 * Get inline styles for dynamic button styling
 * @param {Object} category - Category object with primary_color field
 * @returns {Object} - Inline styles object
 */
export const getCategoryInlineStyles = (category) => {
  const primaryColor = getCategoryPrimaryColor(category);
  const hoverColor = getCategoryHoverColor(category);
  
  return {
    backgroundColor: primaryColor,
    borderColor: primaryColor,
    color: '#ffffff',
    transition: 'all 0.3s ease',
    '--hover-bg': hoverColor,
    '--hover-border': hoverColor,
  };
};

/**
 * Get CSS class name for category-based styling
 * @param {Object} category - Category object with primary_color field
 * @returns {string} - CSS class name
 */
export const getCategoryButtonClass = (category) => {
  if (!category) return 'btn-category-default';
  return `btn-category-${category.id || 'default'}`;
};

/**
 * Generate CSS for category buttons
 * @param {Array} categories - Array of category objects
 * @returns {string} - CSS string
 */
export const generateCategoryButtonCSS = (categories) => {
  let css = `
    .btn-category-default {
      background-color: ${DEFAULT_PRIMARY_COLOR};
      border-color: ${DEFAULT_PRIMARY_COLOR};
      color: #ffffff;
    }
    .btn-category-default:hover {
      background-color: ${DEFAULT_HOVER_COLOR};
      border-color: ${DEFAULT_HOVER_COLOR};
    }
  `;
  
  categories.forEach(category => {
    if (category.primary_color) {
      const primaryColor = category.primary_color;
      const hoverColor = getCategoryHoverColor(category);
      
      css += `
        .btn-category-${category.id} {
          background-color: ${primaryColor};
          border-color: ${primaryColor};
          color: #ffffff;
        }
        .btn-category-${category.id}:hover {
          background-color: ${hoverColor};
          border-color: ${hoverColor};
        }
        .btn-category-${category.id}:focus {
          box-shadow: 0 0 0 3px ${primaryColor}33;
        }
      `;
    }
  });
  
  return css;
};
