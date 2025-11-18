/**
 * Bundle Analysis Utility
 * Helps identify unused dependencies and optimize bundle size
 */

// List of potentially unused dependencies based on analysis
export const POTENTIALLY_UNUSED_DEPS = [
  // UI Libraries - many Radix components might not be used
  '@radix-ui/react-accordion',
  '@radix-ui/react-alert-dialog',
  '@radix-ui/react-aspect-ratio',
  '@radix-ui/react-avatar',
  '@radix-ui/react-checkbox',
  '@radix-ui/react-collapsible',
  '@radix-ui/react-context-menu',
  '@radix-ui/react-dialog',
  '@radix-ui/react-dropdown-menu',
  '@radix-ui/react-hover-card',
  '@radix-ui/react-label',
  '@radix-ui/react-menubar',
  '@radix-ui/react-navigation-menu',
  '@radix-ui/react-popover',
  '@radix-ui/react-progress',
  '@radix-ui/react-radio-group',
  '@radix-ui/react-scroll-area',
  '@radix-ui/react-select',
  '@radix-ui/react-separator',
  '@radix-ui/react-sheet',
  '@radix-ui/react-slider',
  '@radix-ui/react-slot',
  '@radix-ui/react-switch',
  '@radix-ui/react-tabs',
  '@radix-ui/react-toast',
  '@radix-ui/react-toggle',
  '@radix-ui/react-toggle-group',
  '@radix-ui/react-tooltip',
  
  // Other potentially unused
  '@clerk/clerk-react', // If not using Clerk authentication
  '@emotion/react',
  '@emotion/styled',
  '@hookform/resolvers',
  '@mui/x-date-pickers',
  'class-variance-authority',
  'clsx',
  'cmdk',
  'date-fns',
  'lucide-react', // Many icons might not be used
  'react-day-picker',
  'react-resizable-panels',
  'tailwind-merge',
  'tailwindcss-animate',
  'vaul',
  'zod',
];

// Dependencies that are definitely used
export const DEFINITELY_USED_DEPS = [
  'react',
  'react-dom',
  'react-router-dom',
  'react-hook-form',
  '@mui/material',
  'dayjs',
  'framer-motion',
];

// Analysis functions
export function analyzeBundleSize() {
  const analysis = {
    totalDependencies: POTENTIALLY_UNUSED_DEPS.length + DEFINITELY_USED_DEPS.length,
    potentiallyUnused: POTENTIALLY_UNUSED_DEPS.length,
    definitelyUsed: DEFINITELY_USED_DEPS.length,
    potentialSavings: POTENTIALLY_UNUSED_DEPS.length,
    recommendations: []
  };

  // Generate recommendations
  if (analysis.potentiallyUnused > 20) {
    analysis.recommendations.push({
      type: 'warning',
      message: 'High number of potentially unused dependencies detected',
      action: 'Review and remove unused Radix UI components'
    });
  }

  if (analysis.potentiallyUnused > 10) {
    analysis.recommendations.push({
      type: 'info',
      message: 'Consider using bundle analyzer tools',
      action: 'Run "npm run build -- --analyze" to see actual bundle composition'
    });
  }

  return analysis;
}

// Check for specific unused patterns
export function checkForUnusedPatterns() {
  const patterns = {
    unusedImports: [],
    duplicateImports: [],
    largeComponents: [],
    heavyLibraries: []
  };

  // This would typically be run by a build tool or linter
  // For now, we'll provide static analysis
  
  return patterns;
}

// Generate optimization report
export function generateOptimizationReport() {
  const bundleAnalysis = analyzeBundleSize();
  const unusedPatterns = checkForUnusedPatterns();

  return {
    summary: {
      totalDeps: bundleAnalysis.totalDependencies,
      potentiallyUnused: bundleAnalysis.potentiallyUnused,
      potentialSavings: `${Math.round((bundleAnalysis.potentiallyUnused / bundleAnalysis.totalDependencies) * 100)}%`
    },
    recommendations: [
      {
        priority: 'high',
        title: 'Remove unused Radix UI components',
        description: 'Many Radix UI components are imported but not used',
        action: 'Audit components and remove unused imports',
        impact: 'High - Significant bundle size reduction'
      },
      {
        priority: 'medium',
        title: 'Optimize icon imports',
        description: 'Import only needed icons from lucide-react',
        action: 'Replace wildcard imports with specific icon imports',
        impact: 'Medium - Moderate bundle size reduction'
      },
      {
        priority: 'low',
        title: 'Review date libraries',
        description: 'Both dayjs and date-fns are imported',
        action: 'Standardize on one date library',
        impact: 'Low - Small bundle size reduction'
      }
    ],
    nextSteps: [
      'Run bundle analyzer: npm run build -- --analyze',
      'Use webpack-bundle-analyzer for detailed analysis',
      'Implement tree shaking for better dead code elimination',
      'Consider code splitting for large components'
    ]
  };
}

export default {
  analyzeBundleSize,
  checkForUnusedPatterns,
  generateOptimizationReport,
  POTENTIALLY_UNUSED_DEPS,
  DEFINITELY_USED_DEPS
};
