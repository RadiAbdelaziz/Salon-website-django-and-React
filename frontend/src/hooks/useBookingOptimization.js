import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { debounce } from 'lodash';

/**
 * Performance optimization hook for booking components
 */
export const useBookingOptimization = (initialState = {}) => {
  const [state, setState] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const timeoutRef = useRef(null);

  // Debounced state updates to prevent excessive re-renders
  const debouncedSetState = useCallback(
    debounce((updates) => {
      setState(prev => ({ ...prev, ...updates }));
    }, 300),
    []
  );

  // Memoized computed values
  const computedValues = useMemo(() => {
    return {
      isFormValid: Object.values(errors).every(error => !error),
      hasRequiredFields: state.selectedService && state.selectedDate && state.selectedTime,
      progressPercentage: calculateProgress(state),
      canProceed: state.selectedService && state.selectedDate && state.selectedTime && state.selectedAddress
    };
  }, [state, errors]);

  // Optimized validation
  const validateField = useCallback((field, value, rules) => {
    const fieldErrors = [];
    
    for (const rule of rules) {
      if (!rule.validator(value)) {
        fieldErrors.push(rule.message);
      }
    }
    
    setErrors(prev => ({
      ...prev,
      [field]: fieldErrors.length > 0 ? fieldErrors[0] : null
    }));
    
    return fieldErrors.length === 0;
  }, []);

  // Batch state updates
  const batchUpdate = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    state,
    setState: debouncedSetState,
    batchUpdate,
    isLoading,
    setIsLoading,
    errors,
    setErrors,
    validateField,
    ...computedValues
  };
};

/**
 * Calculate booking progress percentage
 */
const calculateProgress = (state) => {
  let progress = 0;
  const totalSteps = 5;
  
  if (state.selectedService) progress += 20;
  if (state.selectedDate && state.selectedTime) progress += 20;
  if (state.selectedAddress) progress += 20;
  if (state.paymentMethod) progress += 20;
  if (state.specialRequests || state.couponCode) progress += 20;
  
  return Math.min(progress, 100);
};

/**
 * Virtual scrolling hook for large lists
 */
export const useVirtualScrolling = (items, itemHeight = 200, containerHeight = 600) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerRef, setContainerRef] = useState(null);

  const visibleItems = useMemo(() => {
    if (!containerRef) return items;
    
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return items.slice(startIndex, endIndex).map((item, index) => ({
      ...item,
      index: startIndex + index,
      style: {
        position: 'absolute',
        top: (startIndex + index) * itemHeight,
        height: itemHeight,
        width: '100%'
      }
    }));
  }, [items, scrollTop, itemHeight, containerHeight, containerRef]);

  const totalHeight = items.length * itemHeight;

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    handleScroll,
    setContainerRef
  };
};

/**
 * Intersection Observer hook for lazy loading
 */
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        ...options
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [hasIntersected, options]);

  return {
    elementRef,
    isIntersecting,
    hasIntersected
  };
};

/**
 * Performance monitoring hook
 */
export const usePerformanceMonitor = (componentName) => {
  const [metrics, setMetrics] = useState({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0
  });

  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      setMetrics(prev => ({
        renderCount: prev.renderCount + 1,
        lastRenderTime: renderTime,
        averageRenderTime: (prev.averageRenderTime + renderTime) / 2
      }));
      
      // Log performance warnings
      if (renderTime > 16) { // More than one frame
        console.warn(`${componentName} render took ${renderTime.toFixed(2)}ms`);
      }
    };
  });

  return metrics;
};
