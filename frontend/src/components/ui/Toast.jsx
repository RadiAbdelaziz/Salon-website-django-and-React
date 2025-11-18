import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ 
  isOpen, 
  onClose, 
  type = 'success', 
  title, 
  message, 
  action = null,
  autoClose = true, 
  autoCloseDelay = 4000 
}) => {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-yellow-600" />;
      case 'info':
        return <Info className="w-6 h-6 text-blue-600" />;
      default:
        return <CheckCircle className="w-6 h-6 text-green-600" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          iconBg: 'bg-green-100'
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          iconBg: 'bg-red-100'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          iconBg: 'bg-yellow-100'
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          iconBg: 'bg-blue-100'
        };
      default:
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          iconBg: 'bg-green-100'
        };
    }
  };

  const colors = getColors();

  return (
    <div className="fixed top-4 right-4 z-[100] max-w-sm w-full">
      <div className={`${colors.bg} ${colors.border} border rounded-xl shadow-lg p-4 transform transition-all duration-300 ease-out`}>
        <div className="flex items-start space-x-3 space-x-reverse">
          {/* Icon */}
          <div className={`${colors.iconBg} rounded-full p-1 flex-shrink-0`}>
            {getIcon()}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                {title}
              </h4>
            )}
            <p className="text-sm text-gray-700">
              {message}
            </p>
            
            {/* Action Button */}
            {action && (
              <div className="mt-3">
                <button
                  onClick={action.onClick}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 underline"
                >
                  {action.text}
                </button>
              </div>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:bg-gray-200 rounded-full transition-colors duration-200"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Progress Bar */}
        {autoClose && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div 
                className={`h-1 rounded-full transition-all duration-300 ease-linear ${
                  type === 'success' ? 'bg-green-600' :
                  type === 'error' ? 'bg-red-600' :
                  type === 'warning' ? 'bg-yellow-600' :
                  'bg-blue-600'
                }`}
                style={{
                  animation: `shrink ${autoCloseDelay}ms linear forwards`
                }}
              />
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};

export default Toast;
