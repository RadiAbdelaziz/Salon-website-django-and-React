import { useState, useEffect } from 'react';
import { getCategoryPrimaryColor, getCategoryHoverColor, getCategoryInlineStyles } from '../utils/dynamicColors';

/**
 * Custom hook for managing dynamic colors based on categories
 */
export const useDynamicColors = (categoryId, categories = []) => {
  const [dynamicStyles, setDynamicStyles] = useState({});

  useEffect(() => {
    if (!categoryId || !categories.length) {
      // Use default styles if no category or categories not loaded
      setDynamicStyles({
        backgroundColor: '#B89F67',
        borderColor: '#B89F67',
        color: '#ffffff',
        '--hover-bg': '#A68B4F',
        '--hover-border': '#A68B4F',
      });
      return;
    }

    // Find the category by ID
    const category = categories.find(cat => cat.id === categoryId);
    
    if (category) {
      const styles = getCategoryInlineStyles(category);
      setDynamicStyles(styles);
    } else {
      // Fallback to default if category not found
      setDynamicStyles({
        backgroundColor: '#B89F67',
        borderColor: '#B89F67',
        color: '#ffffff',
        '--hover-bg': '#A68B4F',
        '--hover-border': '#A68B4F',
      });
    }
  }, [categoryId, categories]);

  return {
    dynamicStyles,
    primaryColor: getCategoryPrimaryColor(categories.find(cat => cat.id === categoryId)),
    hoverColor: getCategoryHoverColor(categories.find(cat => cat.id === categoryId)),
  };
};

/**
 * Hook for getting category colors by category object
 */
export const useCategoryColors = (category) => {
  const [colors, setColors] = useState({
    primary: '#B89F67',
    hover: '#A68B4F',
  });

  useEffect(() => {
    if (category) {
      setColors({
        primary: getCategoryPrimaryColor(category),
        hover: getCategoryHoverColor(category),
      });
    }
  }, [category]);

  return colors;
};
