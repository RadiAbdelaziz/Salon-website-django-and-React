/**
 * Performance utilities for the salon website
 */

// Debounce function for performance optimization
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for performance optimization
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Lazy loading utility
export const lazyLoad = (element, callback) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry.target);
        observer.unobserve(entry.target);
      }
    });
  });
  
  observer.observe(element);
  return observer;
};

// Image lazy loading
export const lazyLoadImage = (img, src) => {
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
};

// Performance monitoring
export const performanceMonitor = {
  start: (name) => {
    performance.mark(`${name}-start`);
  },
  
  end: (name) => {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    const measure = performance.getEntriesByName(name)[0];
    console.log(`${name} took ${measure.duration}ms`);
    return measure.duration;
  }
};

// Memory management
export const memoryManager = {
  clearCache: () => {
    // Clear any cached data
    if (window.caches) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
  },
  
  cleanup: () => {
    // Clean up event listeners and other resources
    const elements = document.querySelectorAll('[data-cleanup]');
    elements.forEach(element => {
      element.removeEventListener('scroll', () => {});
      element.removeEventListener('resize', () => {});
    });
  }
};

// Error boundary utility
export const errorBoundary = (component, errorHandler) => {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
      console.error('Error caught by boundary:', error, errorInfo);
      if (errorHandler) {
        errorHandler(error, errorInfo);
      }
    }

    render() {
      if (this.state.hasError) {
        return (
          <div className="error-boundary">
            <h2>حدث خطأ في التطبيق</h2>
            <p>يرجى إعادة تحميل الصفحة أو المحاولة مرة أخرى</p>
            <button onClick={() => window.location.reload()}>
              إعادة التحميل
            </button>
          </div>
        );
      }

      return component;
    }
  };
};

// Loading states management
export const loadingStates = {
  show: (element) => {
    if (element) {
      element.classList.add('loading');
      element.setAttribute('aria-busy', 'true');
    }
  },
  
  hide: (element) => {
    if (element) {
      element.classList.remove('loading');
      element.removeAttribute('aria-busy');
    }
  },
  
  toggle: (element) => {
    if (element) {
      element.classList.toggle('loading');
      const isBusy = element.getAttribute('aria-busy') === 'true';
      element.setAttribute('aria-busy', !isBusy);
    }
  }
};

// API request optimization
export const apiOptimizer = {
  // Request deduplication
  pendingRequests: new Map(),
  
  deduplicate: (key, requestFn) => {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }
    
    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key);
    });
    
    this.pendingRequests.set(key, promise);
    return promise;
  },
  
  // Request batching
  batchRequests: (requests, delay = 100) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        Promise.all(requests).then(resolve);
      }, delay);
    });
  }
};

// Animation performance
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
  }
};

export default {
  debounce,
  throttle,
  lazyLoad,
  lazyLoadImage,
  performanceMonitor,
  memoryManager,
  errorBoundary,
  loadingStates,
  apiOptimizer,
  animationOptimizer
};