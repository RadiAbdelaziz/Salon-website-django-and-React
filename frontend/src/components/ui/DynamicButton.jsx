import React from 'react';
import { useDynamicColors } from '../../hooks/useDynamicColors';

/**
 * Dynamic button component that changes color based on category
 */
const DynamicButton = ({ 
  categoryId, 
  categories = [], 
  children, 
  className = '', 
  onClick, 
  disabled = false,
  type = 'button',
  size = 'md',
  variant = 'primary',
  ...props 
}) => {
  const { dynamicStyles } = useDynamicColors(categoryId, categories);

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  // Apply variant-specific styles
  const getVariantStyles = () => {
    if (variant === 'outline') {
      return {
        backgroundColor: 'transparent',
        borderColor: dynamicStyles.backgroundColor,
        color: dynamicStyles.backgroundColor,
        '--hover-bg': dynamicStyles.backgroundColor,
        '--hover-border': dynamicStyles.backgroundColor,
        '--hover-color': '#ffffff',
      };
    }
    return dynamicStyles;
  };

  const finalStyles = getVariantStyles();

  const baseClasses = `
    inline-flex items-center justify-center
    font-semibold rounded-lg border
    transition-all duration-300 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${sizeClasses[size]}
    ${className}
  `.trim();

  const handleMouseEnter = (e) => {
    if (!disabled) {
      e.target.style.backgroundColor = finalStyles['--hover-bg'];
      e.target.style.borderColor = finalStyles['--hover-border'];
      e.target.style.color = finalStyles['--hover-color'] || finalStyles.color;
    }
  };

  const handleMouseLeave = (e) => {
    if (!disabled) {
      e.target.style.backgroundColor = finalStyles.backgroundColor;
      e.target.style.borderColor = finalStyles.borderColor;
      e.target.style.color = finalStyles.color;
    }
  };

  return (
    <button
      type={type}
      className={baseClasses}
      style={finalStyles}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </button>
  );
};

export default DynamicButton;
