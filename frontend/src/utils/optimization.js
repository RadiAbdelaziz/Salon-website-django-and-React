/**
 * Optimization utilities for the salon website
 */

// Image optimization
export const imageOptimizer = {
  // Lazy load images
  lazyLoad: (img, src, placeholder = null) => {
    if (placeholder) {
      img.src = placeholder;
    }
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.src = src;
          entry.target.classList.remove('lazy');
          observer.unobserve(entry.target);
        }
      });
    });
    
    observer.observe(img);
    return observer;
  },
  
  // Preload critical images
  preload: (src) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  },
  
  // Optimize image size
  optimizeSize: (src, width, height) => {
    // Add size parameters to image URL
    const url = new URL(src);
    url.searchParams.set('w', width);
    url.searchParams.set('h', height);
    url.searchParams.set('q', '80'); // Quality
    return url.toString();
  }
};

// Bundle optimization
export const bundleOptimizer = {
  // Code splitting
  loadComponent: (importFn) => {
    return React.lazy(importFn);
  },
  
  // Dynamic imports
  dynamicImport: (modulePath) => {
    return import(modulePath);
  },
  
  // Preload modules
  preloadModule: (modulePath) => {
    const link = document.createElement('link');
    link.rel = 'modulepreload';
    link.href = modulePath;
    document.head.appendChild(link);
  }
};

// Memory optimization
export const memoryOptimizer = {
  // Clean up event listeners
  cleanup: (element) => {
    if (element) {
      element.removeEventListener('scroll', () => {});
      element.removeEventListener('resize', () => {});
      element.removeEventListener('click', () => {});
    }
  },
  
  // Clear unused data
  clearUnusedData: () => {
    // Clear unused images
    const images = document.querySelectorAll('img[data-lazy]');
    images.forEach(img => {
      if (!img.getBoundingClientRect().top < window.innerHeight) {
        img.src = '';
      }
    });
  },
  
  // Garbage collection hint
  forceGC: () => {
    if (window.gc) {
      window.gc();
    }
  }
};

// Network optimization
export const networkOptimizer = {
  // Request batching
  batchRequests: (requests, delay = 100) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        Promise.all(requests).then(resolve);
      }, delay);
    });
  },
  
  // Request deduplication
  deduplicate: (key, requestFn) => {
    if (!networkOptimizer.pendingRequests) {
      networkOptimizer.pendingRequests = new Map();
    }
    
    if (networkOptimizer.pendingRequests.has(key)) {
      return networkOptimizer.pendingRequests.get(key);
    }
    
    const promise = requestFn().finally(() => {
      networkOptimizer.pendingRequests.delete(key);
    });
    
    networkOptimizer.pendingRequests.set(key, promise);
    return promise;
  },
  
  // Request caching
  cache: (key, data, ttl = 300000) => { // 5 minutes default
    const cacheEntry = {
      data,
      timestamp: Date.now(),
      ttl
    };
    
    localStorage.setItem(`cache_${key}`, JSON.stringify(cacheEntry));
  },
  
  // Get cached data
  getCached: (key) => {
    try {
      const cached = localStorage.getItem(`cache_${key}`);
      if (cached) {
        const cacheEntry = JSON.parse(cached);
        if (Date.now() - cacheEntry.timestamp < cacheEntry.ttl) {
          return cacheEntry.data;
        }
        localStorage.removeItem(`cache_${key}`);
      }
    } catch (error) {
      console.error('Error getting cached data:', error);
    }
    return null;
  }
};

// Performance monitoring
export const performanceMonitor = {
  // Measure function execution time
  measure: (name, fn) => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
  },
  
  // Measure async function execution time
  measureAsync: async (name, fn) => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
  },
  
  // Get performance metrics
  getMetrics: () => {
    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');
    
    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime
    };
  },
  
  // Monitor Core Web Vitals
  monitorCoreWebVitals: () => {
    // Largest Contentful Paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });
    
    // First Input Delay
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        console.log('FID:', entry.processingStart - entry.startTime);
      });
    }).observe({ entryTypes: ['first-input'] });
    
    // Cumulative Layout Shift
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          console.log('CLS:', entry.value);
        }
      });
    }).observe({ entryTypes: ['layout-shift'] });
  }
};

// Resource optimization
export const resourceOptimizer = {
  // Preload critical resources
  preloadCritical: (resources) => {
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.url;
      link.as = resource.type;
      if (resource.crossorigin) {
        link.crossOrigin = resource.crossorigin;
      }
      document.head.appendChild(link);
    });
  },
  
  // Prefetch resources
  prefetch: (url) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  },
  
  // Preconnect to external domains
  preconnect: (url) => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    document.head.appendChild(link);
  }
};

// Animation optimization
export const animationOptimizer = {
  // Use requestAnimationFrame for smooth animations
  animate: (callback) => {
    requestAnimationFrame(callback);
  },
  
  // Smooth scroll
  smoothScroll: (element, target, duration = 300) => {
    const start = element.scrollTop;
    const change = target - start;
    const startTime = performance.now();
    
    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      element.scrollTop = start + change * progress;
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };
    
    requestAnimationFrame(animateScroll);
  },
  
  // Throttle scroll events
  throttleScroll: (callback, delay = 16) => {
    let ticking = false;
    
    return function() {
      if (!ticking) {
        requestAnimationFrame(() => {
          callback();
          ticking = false;
        });
        ticking = true;
      }
    };
  }
};

// Bundle analysis
export const bundleAnalyzer = {
  // Analyze bundle size
  analyze: () => {
    const scripts = document.querySelectorAll('script[src]');
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    
    const analysis = {
      scripts: Array.from(scripts).map(script => ({
        src: script.src,
        size: script.src.length // Approximate
      })),
      stylesheets: Array.from(stylesheets).map(link => ({
        href: link.href,
        size: link.href.length // Approximate
      }))
    };
    
    console.log('Bundle analysis:', analysis);
    return analysis;
  },
  
  // Monitor bundle loading
  monitor: () => {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (entry.entryType === 'resource') {
          console.log(`Resource loaded: ${entry.name} (${entry.duration}ms)`);
        }
      });
    });
    
    observer.observe({ entryTypes: ['resource'] });
    return observer;
  }
};

export default {
  imageOptimizer,
  bundleOptimizer,
  memoryOptimizer,
  networkOptimizer,
  performanceMonitor,
  resourceOptimizer,
  animationOptimizer,
  bundleAnalyzer
};