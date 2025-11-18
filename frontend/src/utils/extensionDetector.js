/**
 * Browser Extension Conflict Detector
 * Helps identify which browser extensions might be causing conflicts
 */

export const detectExtensionConflicts = () => {
  const conflicts = [];
  
  // Check for common extension indicators
  const extensionIndicators = [
    'chrome-extension://',
    'moz-extension://',
    'safari-extension://',
    'edge-extension://'
  ];
  
  // Check for extension scripts in the DOM
  const scripts = document.querySelectorAll('script[src]');
  scripts.forEach(script => {
    const src = script.src;
    extensionIndicators.forEach(indicator => {
      if (src.includes(indicator)) {
        conflicts.push({
          type: 'script',
          source: src,
          element: script
        });
      }
    });
  });
  
  // Check for extension stylesheets
  const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
  stylesheets.forEach(link => {
    const href = link.href;
    extensionIndicators.forEach(indicator => {
      if (href.includes(indicator)) {
        conflicts.push({
          type: 'stylesheet',
          source: href,
          element: link
        });
      }
    });
  });
  
  // Check for extension-injected elements
  const suspiciousElements = document.querySelectorAll('[data-extension], [class*="extension"], [id*="extension"]');
  suspiciousElements.forEach(element => {
    conflicts.push({
      type: 'element',
      source: element.outerHTML.substring(0, 100) + '...',
      element: element
    });
  });
  
  // Check for extension global variables
  const extensionGlobals = [
    'chrome',
    'browser',
    'safari',
    'webkit',
    'opera'
  ];
  
  extensionGlobals.forEach(global => {
    if (window[global] && window[global].runtime) {
      conflicts.push({
        type: 'global',
        source: `${global}.runtime detected`,
        element: null
      });
    }
  });
  
  return conflicts;
};

export const logExtensionConflicts = () => {
  const conflicts = detectExtensionConflicts();
  
  if (conflicts.length > 0) {
    console.group('🔍 Browser Extension Conflicts Detected');
    conflicts.forEach((conflict, index) => {
      console.log(`${index + 1}. ${conflict.type.toUpperCase()}:`, conflict.source);
    });
    console.groupEnd();
    
    return conflicts;
  } else {
    console.log('✅ No browser extension conflicts detected');
    return [];
  }
};

export const preventExtensionInjection = () => {
  // Prevent extensions from injecting content
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Check if the added element is from an extension
          const scripts = node.querySelectorAll ? node.querySelectorAll('script') : [];
          scripts.forEach(script => {
            if (script.src && script.src.includes('extension://')) {
              console.warn('Extension script injection prevented:', script.src);
              script.remove();
            }
          });
          
          // Check for extension images
          const images = node.querySelectorAll ? node.querySelectorAll('img') : [];
          images.forEach(img => {
            if (img.src && img.src.includes('extension://')) {
              console.warn('Extension image injection prevented:', img.src);
              img.remove();
            }
          });
        }
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Prevent extension message channel errors
  const originalPostMessage = window.postMessage;
  window.postMessage = function(message, targetOrigin, transfer) {
    if (message && typeof message === 'object' && 
        (message.type === 'chrome.runtime' || message.source === 'extension')) {
      console.warn('Extension message prevented:', message);
      return;
    }
    return originalPostMessage.call(this, message, targetOrigin, transfer);
  };
  
  console.log('🛡️ Extension injection prevention activated');
  return observer;
};

// Auto-run detection in development
if (process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    logExtensionConflicts();
  }, 2000);
}
