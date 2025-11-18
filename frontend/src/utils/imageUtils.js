/**
 * Image Utilities for safe image loading
 * Prevents browser extension conflicts with image loading
 */

// Safe image loading function
export const safeLoadImage = (src, options = {}) => {
  return new Promise((resolve, reject) => {
    // Check if src is from an extension
    if (src && src.includes('extension://')) {
      console.warn('Extension image loading prevented:', src);
      reject(new Error('Extension image blocked'));
      return;
    }

    const img = new Image();
    
    // Set up event listeners
    img.onload = () => {
      resolve(img);
    };
    
    img.onerror = (event) => {
      console.warn('Image loading failed:', src, event);
      reject(new Error(`Failed to load image: ${src}`));
    };
    
    // Set image source
    img.src = src;
    
    // Apply options
    if (options.crossOrigin) {
      img.crossOrigin = options.crossOrigin;
    }
    
    if (options.alt) {
      img.alt = options.alt;
    }
  });
};

// Safe image preloading
export const safePreloadImage = (src) => {
  return safeLoadImage(src).catch(error => {
    console.warn('Image preload failed:', src, error);
    return null;
  });
};

// Safe image element creation
export const createSafeImageElement = (src, attributes = {}) => {
  // Check if src is from an extension
  if (src && src.includes('extension://')) {
    console.warn('Extension image creation prevented:', src);
    return null;
  }

  const img = document.createElement('img');
  img.src = src;
  
  // Apply attributes
  Object.keys(attributes).forEach(key => {
    img.setAttribute(key, attributes[key]);
  });
  
  // Add error handling
  img.addEventListener('error', (event) => {
    console.warn('Image error:', src, event);
  });
  
  return img;
};

// Safe image URL validation
export const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  // Block extension URLs
  if (url.includes('extension://') || url.includes('chrome-extension://')) {
    return false;
  }
  
  // Allow data URLs, blob URLs, and regular URLs
  return url.startsWith('data:') || 
         url.startsWith('blob:') || 
         url.startsWith('http://') || 
         url.startsWith('https://') ||
         url.startsWith('/');
};

// Safe image loading with fallback
export const loadImageWithFallback = async (src, fallbackSrc = null) => {
  try {
    if (!isValidImageUrl(src)) {
      throw new Error('Invalid image URL');
    }
    
    const img = await safeLoadImage(src);
    return img;
  } catch (error) {
    console.warn('Primary image failed, trying fallback:', src, error);
    
    if (fallbackSrc && isValidImageUrl(fallbackSrc)) {
      try {
        const fallbackImg = await safeLoadImage(fallbackSrc);
        return fallbackImg;
      } catch (fallbackError) {
        console.warn('Fallback image also failed:', fallbackSrc, fallbackError);
        throw fallbackError;
      }
    }
    
    throw error;
  }
};

// Initialize image safety measures
export const initializeImageSafety = () => {
  // Override Image constructor to add safety checks
  const OriginalImage = window.Image;
  
  window.Image = function() {
    const img = new OriginalImage();
    
    // Override src setter to validate URLs
    let currentSrc = '';
    Object.defineProperty(img, 'src', {
      get: function() {
        return currentSrc;
      },
      set: function(value) {
        if (!isValidImageUrl(value)) {
          console.warn('Invalid image URL blocked:', value);
          return;
        }
        currentSrc = value;
        img.setAttribute('src', value);
      }
    });
    
    return img;
  };
  
  console.log('🖼️ Image safety measures initialized');
};

// Image sizing utilities for 1200x800 images
export const getOptimalImageSize = (containerWidth, containerHeight, imageWidth = 1200, imageHeight = 800) => {
  const aspectRatio = imageWidth / imageHeight;
  const containerAspectRatio = containerWidth / containerHeight;
  
  if (containerAspectRatio > aspectRatio) {
    // Container is wider than image aspect ratio
    return {
      width: containerHeight * aspectRatio,
      height: containerHeight,
      scale: containerHeight / imageHeight
    };
  } else {
    // Container is taller than image aspect ratio
    return {
      width: containerWidth,
      height: containerWidth / aspectRatio,
      scale: containerWidth / imageWidth
    };
  }
};

// Generate responsive image sizes for 1200x800 images
export const getResponsiveImageSizes = (baseWidth = 1200, baseHeight = 800) => {
  return {
    mobile: {
      width: 400,
      height: Math.round(400 * (baseHeight / baseWidth)),
      breakpoint: 'max-width: 768px'
    },
    tablet: {
      width: 600,
      height: Math.round(600 * (baseHeight / baseWidth)),
      breakpoint: 'max-width: 1024px'
    },
    desktop: {
      width: 800,
      height: Math.round(800 * (baseHeight / baseWidth)),
      breakpoint: 'min-width: 1025px'
    },
    large: {
      width: 1200,
      height: baseHeight,
      breakpoint: 'min-width: 1440px'
    }
  };
};

// Generate srcset for responsive images
export const generateImageSrcSet = (baseUrl, sizes = null) => {
  if (!sizes) {
    sizes = getResponsiveImageSizes();
  }
  
  const srcset = Object.values(sizes)
    .map(size => `${baseUrl}?w=${size.width}&h=${size.height} ${size.width}w`)
    .join(', ');
    
  return srcset;
};

// Calculate optimal object position for 1200x800 images
export const getOptimalObjectPosition = (imageWidth = 1200, imageHeight = 800, containerWidth, containerHeight) => {
  const imageAspectRatio = imageWidth / imageHeight;
  const containerAspectRatio = containerWidth / containerHeight;
  
  if (imageAspectRatio > containerAspectRatio) {
    // Image is wider than container - focus on center horizontally
    return 'center center';
  } else {
    // Image is taller than container - focus on center vertically
    return 'center center';
  }
};