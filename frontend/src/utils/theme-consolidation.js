/**
 * Theme Consolidation Utilities
 * 
 * This file provides utilities to replace inline styles with consistent theme classes
 */

// Color mapping for inline styles to theme classes
export const colorMappings = {
  // Background colors
  'backgroundColor: var(--glamour-gold)': 'bg-salon-gold',
  'backgroundColor: var(--glamour-gold-light)': 'bg-salon-gold-light',
  'backgroundColor: var(--glamour-gold-dark)': 'bg-salon-gold-dark',
  'backgroundColor: var(--warm-brown)': 'bg-warm-brown',
  'backgroundColor: var(--medium-beige)': 'bg-medium-beige',
  'backgroundColor: var(--silken-dune)': 'bg-silken-dune',
  'backgroundColor: var(--champagne-veil)': 'bg-champagne-veil',
  'backgroundColor: var(--ivory-whisper)': 'bg-ivory-whisper',
  
  // Text colors
  'color: var(--warm-brown)': 'text-warm-brown',
  'color: var(--medium-beige)': 'text-medium-beige',
  'color: var(--glamour-gold)': 'text-salon-gold',
  'color: var(--glamour-gold-light)': 'text-salon-gold-light',
  'color: var(--glamour-gold-dark)': 'text-salon-gold-dark',
  
  // Border colors
  'borderColor: var(--glamour-gold)': 'border-salon-gold',
  'borderColor: var(--warm-brown)': 'border-warm-brown',
  'borderColor: var(--silken-dune)': 'border-silken-dune',
};

// Gradient mappings
export const gradientMappings = {
  'linear-gradient(135deg, var(--glamour-gold), var(--glamour-gold-light))': 'bg-gradient-salon-gold',
  'linear-gradient(135deg, var(--glamour-gold), var(--glamour-gold-dark))': 'bg-gradient-salon-gold-dark',
  'linear-gradient(135deg, var(--salon-cream), var(--ivory-whisper))': 'bg-gradient-salon-cream',
};

// Common inline style patterns and their replacements
export const stylePatterns = {
  // Loading spinners
  "borderColor: 'var(--glamour-gold)'": 'spinner-salon-gold',
  
  // Button styles
  "background: 'var(--glamour-gold)', color: 'white'": 'btn-salon-primary',
  "border: '2px solid var(--glamour-gold)', color: 'var(--glamour-gold)'": 'btn-salon-secondary',
  "border: '2px solid var(--warm-brown)', color: 'var(--warm-brown)'": 'btn-salon-outline',
  
  // Card styles
  "background: 'var(--champagne-veil)'": 'bg-champagne-veil',
  "border: '2px solid var(--silken-dune)'": 'border-silken-dune',
  
  // Text styles
  "color: 'var(--warm-brown)'": 'text-warm-brown',
  "color: 'var(--medium-beige)'": 'text-medium-beige',
};

// Component-specific style replacements
export const componentStyles = {
  // HeroSection
  heroSection: {
    "style={{ margin: 0, padding: 0, minHeight: '400px' }}": 'min-h-[400px] p-0 m-0',
    "style={{ margin: 0, padding: 0 }}": 'p-0 m-0',
    "style={{ borderColor: 'var(--glamour-gold)' }}": 'spinner-salon-gold',
  },
  
  // ServicesSection
  servicesSection: {
    "style={{ color: 'var(--glamour-gold)' }}": 'text-salon-gold',
    "style={{ background: 'linear-gradient(135deg, var(--glamour-gold), var(--glamour-gold-light))' }}": 'bg-gradient-salon-gold',
    "style={{ boxShadow: 'rgba(192, 144, 82, 0.2) 0px 20px 40px' }}": 'shadow-salon-gold-xl',
  },
  
  // EnhancedBookingPage
  enhancedBookingPage: {
    "style={{ color: 'var(--warm-brown)' }}": 'text-warm-brown',
    "style={{ color: 'var(--medium-beige)' }}": 'text-medium-beige',
    "style={{ background: 'var(--glamour-gold)', color: 'white' }}": 'bg-salon-gold text-white',
    "style={{ background: 'var(--champagne-veil)' }}": 'bg-champagne-veil',
    "style={{ border: '2px solid var(--glamour-gold)', color: 'var(--glamour-gold)' }}": 'border-2 border-salon-gold text-salon-gold',
  },
};

// Utility function to replace inline styles with theme classes
export function replaceInlineStyles(componentName, jsxContent) {
  let updatedContent = jsxContent;
  
  // Get component-specific replacements
  const componentReplacements = componentStyles[componentName] || {};
  
  // Apply component-specific replacements
  Object.entries(componentReplacements).forEach(([inlineStyle, themeClass]) => {
    updatedContent = updatedContent.replace(
      new RegExp(inlineStyle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      `className="${themeClass}"`
    );
  });
  
  // Apply general color mappings
  Object.entries(colorMappings).forEach(([inlineStyle, themeClass]) => {
    updatedContent = updatedContent.replace(
      new RegExp(inlineStyle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      `className="${themeClass}"`
    );
  });
  
  // Apply gradient mappings
  Object.entries(gradientMappings).forEach(([inlineStyle, themeClass]) => {
    updatedContent = updatedContent.replace(
      new RegExp(inlineStyle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      `className="${themeClass}"`
    );
  });
  
  return updatedContent;
}

// Function to consolidate multiple className attributes
export function consolidateClassNames(jsxContent) {
  // This would need to be implemented based on specific patterns
  // For now, it's a placeholder for future enhancement
  return jsxContent;
}

// Function to validate theme consistency
export function validateThemeConsistency(jsxContent) {
  const issues = [];
  
  // Check for inline styles that should be replaced
  const inlineStylePattern = /style=\{[^}]+\}/g;
  const matches = jsxContent.match(inlineStylePattern);
  
  if (matches) {
    matches.forEach(match => {
      if (match.includes('var(--')) {
        issues.push({
          type: 'inline-style',
          message: `Inline style with CSS variable: ${match}`,
          suggestion: 'Replace with theme utility class'
        });
      }
    });
  }
  
  // Check for hardcoded colors
  const hardcodedColorPattern = /(?:bg-|text-|border-)(?:red-|blue-|green-|yellow-|purple-|pink-|gray-|slate-|zinc-|neutral-|stone-|orange-|amber-|lime-|emerald-|teal-|cyan-|sky-|indigo-|violet-|fuchsia-|rose-)/g;
  const hardcodedMatches = jsxContent.match(hardcodedColorPattern);
  
  if (hardcodedMatches) {
    hardcodedMatches.forEach(match => {
      issues.push({
        type: 'hardcoded-color',
        message: `Hardcoded color class: ${match}`,
        suggestion: 'Replace with salon theme color class'
      });
    });
  }
  
  return issues;
}

// Export all utilities
export default {
  colorMappings,
  gradientMappings,
  stylePatterns,
  componentStyles,
  replaceInlineStyles,
  consolidateClassNames,
  validateThemeConsistency
};
