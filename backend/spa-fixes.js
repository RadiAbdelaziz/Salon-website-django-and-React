// React/SPA-specific fixes for browser extensions
// Handle dynamic content loading in single-page applications

// 1. Wait for React to mount
function waitForReactMount() {
  return new Promise((resolve) => {
    const checkForReact = () => {
      // Look for React-specific attributes
      const reactRoot = document.querySelector('[data-reactroot], #root, #app');
      if (reactRoot) {
        resolve(reactRoot);
        return;
      }
      
      // Check for React DevTools
      if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        resolve(document.body);
        return;
      }
      
      // Fallback: wait a bit more
      setTimeout(checkForReact, 100);
    };
    
    checkForReact();
  });
}

// 2. Handle React Router navigation
function setupSPANavigationListener() {
  let currentPath = location.pathname;
  
  const checkForNavigation = () => {
    if (location.pathname !== currentPath) {
      currentPath = location.pathname;
      console.log('SPA navigation detected:', currentPath);
      
      // Re-initialize your extension logic
      setTimeout(initializeExtension, 500);
    }
  };
  
  // Check for navigation changes
  setInterval(checkForNavigation, 1000);
  
  // Also listen for popstate events
  window.addEventListener('popstate', () => {
    setTimeout(initializeExtension, 500);
  });
}

// 3. Handle dynamic content injection
function setupDynamicContentObserver() {
  const observer = new MutationObserver((mutations) => {
    let shouldReinitialize = false;
    
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        // Check if salon-related elements were added
        const addedNodes = Array.from(mutation.addedNodes);
        const hasSalonElements = addedNodes.some(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            return node.classList?.contains('bg-salon-cream') ||
                   node.classList?.contains('bg-salon-gold') ||
                   node.classList?.contains('bg-salon-black') ||
                   node.querySelector?.('.bg-salon-cream, .bg-salon-gold, .bg-salon-black');
          }
          return false;
        });
        
        if (hasSalonElements) {
          shouldReinitialize = true;
        }
      }
    });
    
    if (shouldReinitialize) {
      console.log('Salon elements detected, reinitializing...');
      setTimeout(initializeExtension, 100);
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  return observer;
}

// 4. Main SPA initialization
async function initializeSPAExtension() {
  try {
    console.log('SPA Extension: Waiting for React mount...');
    
    // Wait for React to be ready
    await waitForReactMount();
    
    // Wait a bit more for initial render
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Setup navigation listener
    setupSPANavigationListener();
    
    // Setup dynamic content observer
    const observer = setupDynamicContentObserver();
    
    // Initial setup
    await initializeExtension();
    
    console.log('SPA Extension: Initialized successfully');
    
  } catch (error) {
    console.log('SPA Extension: Initialization failed:', error.message);
  }
}

// 5. Cleanup function
function cleanup() {
  // Remove event listeners
  window.removeEventListener('popstate', initializeExtension);
  
  // Disconnect observers
  if (window.__salon_observer) {
    window.__salon_observer.disconnect();
  }
}

// Export for use in your main content script
window.salonSPAExtension = {
  init: initializeSPAExtension,
  cleanup: cleanup
};
