// Browser Extension Content Script Fix
// Add this to your content script to prevent null querySelector errors

// 1. Early exit for non-matching pages
if (!location.hostname.includes('your-salon-site') && !location.hostname.includes('localhost')) {
  console.log('Content script: Not on target site, exiting');
  return;
}

// 2. One-time initialization guard
if (window.__salon_extension_initialized) {
  console.log('Content script: Already initialized, skipping');
  return;
}
window.__salon_extension_initialized = true;

// 3. Safe DOM ready function
function onDOMReady(fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

// 4. Wait for specific element with timeout
function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    // Check if element already exists
    const existing = document.querySelector(selector);
    if (existing) {
      return resolve(existing);
    }

    // Set up observer for dynamic content
    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    // Start observing
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    // Timeout fallback
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
}

// 5. Safe querySelector with null guards
function safeQuerySelector(selector, parent = document) {
  if (!parent) {
    console.warn('Parent element is null');
    return null;
  }
  
  try {
    return parent.querySelector(selector);
  } catch (error) {
    console.warn('querySelector failed:', error);
    return null;
  }
}

// 6. Safe querySelectorAll with null guards
function safeQuerySelectorAll(selector, parent = document) {
  if (!parent) {
    console.warn('Parent element is null');
    return [];
  }
  
  try {
    return Array.from(parent.querySelectorAll(selector));
  } catch (error) {
    console.warn('querySelectorAll failed:', error);
    return [];
  }
}

// 7. Main initialization function
async function initializeExtension() {
  try {
    console.log('Content script: Initializing...');
    
    // Wait for the main app container
    const appContainer = await waitForElement('#root, #app, [data-reactroot]', 10000);
    if (!appContainer) {
      console.log('Content script: App container not found, skipping');
      return;
    }

    // Wait a bit more for React to render
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Now safely query for elements
    const salonElements = safeQuerySelectorAll('.bg-salon-cream, .bg-salon-gold, .bg-salon-black');
    console.log('Found salon elements:', salonElements.length);

    // Apply your extension logic here
    salonElements.forEach(element => {
      if (!element) return;
      
      // Your extension logic here
      console.log('Processing salon element:', element);
    });

  } catch (error) {
    console.log('Content script: Initialization failed:', error.message);
    // Fail silently - don't spam console
  }
}

// 8. Debounced initialization
let initTimeout;
function debouncedInit() {
  clearTimeout(initTimeout);
  initTimeout = setTimeout(initializeExtension, 100);
}

// 9. Multiple initialization triggers
onDOMReady(debouncedInit);

// Also listen for SPA navigation changes
const observer = new MutationObserver(debouncedInit);
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// 10. Cleanup on page unload
window.addEventListener('beforeunload', () => {
  observer.disconnect();
  clearTimeout(initTimeout);
});

console.log('Content script: Loaded and ready');
