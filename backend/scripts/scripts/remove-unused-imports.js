#!/usr/bin/env node

/**
 * Script to remove unused imports and dependencies
 * Run with: node scripts/remove-unused-imports.js
 */

const fs = require('fs');
const path = require('path');

// Common unused imports to remove
const COMMON_UNUSED_IMPORTS = [
  'console.log',
  'console.warn',
  'console.info',
  'console.debug',
  'console.error',
];

// Files to process
const FILES_TO_PROCESS = [
  'src/components',
  'src/services',
  'src/utils',
  'src/hooks',
  'src/contexts'
];

function removeUnusedImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Remove console.log statements
    const consoleRegex = /console\.(log|warn|info|debug|error)\([^)]*\);?\s*/g;
    const originalContent = content;
    content = content.replace(consoleRegex, '');
    
    if (content !== originalContent) {
      modified = true;
      console.log(`Removed console statements from: ${filePath}`);
    }

    // Remove empty import statements
    const emptyImportRegex = /import\s*{\s*}\s*from\s*['"][^'"]*['"];?\s*/g;
    content = content.replace(emptyImportRegex, '');
    
    // Remove unused React imports (if only using JSX)
    const reactImportRegex = /import\s+React\s+from\s+['"]react['"];?\s*/g;
    if (content.includes('React.') === false && content.includes('createElement') === false) {
      content = content.replace(reactImportRegex, '');
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`Directory not found: ${dirPath}`);
    return;
  }

  const files = fs.readdirSync(dirPath);
  let processedCount = 0;

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
      if (removeUnusedImports(filePath)) {
        processedCount++;
      }
    }
  });

  if (processedCount > 0) {
    console.log(`Processed ${processedCount} files in ${dirPath}`);
  }
}

function main() {
  console.log('🧹 Starting unused imports removal...');
  
  FILES_TO_PROCESS.forEach(dir => {
    const fullPath = path.resolve(dir);
    processDirectory(fullPath);
  });

  console.log('✅ Unused imports removal completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Review the changes');
  console.log('2. Run tests to ensure nothing is broken');
  console.log('3. Run bundle analyzer to check size reduction');
}

if (require.main === module) {
  main();
}

module.exports = {
  removeUnusedImports,
  processDirectory
};
