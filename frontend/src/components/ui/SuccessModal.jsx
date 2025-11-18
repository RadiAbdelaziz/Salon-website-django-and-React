import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

const SuccessModal = ({ isOpen, onClose, title, message, autoClose = true, autoCloseDelay = 3000 }) => {
  useEffect(() => {
    if (isOpen && autoClose) {
      console.log('🎉 Success modal opened, will auto-close in', autoCloseDelay, 'ms');
      const timer = setTimeout(() => {
        console.log('🎉 Auto-closing success modal');
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  console.log('🎉 Rendering success modal with:', { isOpen, title, message });

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4" 
      style={{ 
        zIndex: 9999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 transition-opacity duration-300"
        onClick={onClose}
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backdropFilter: 'blur(4px)'
        }}
      />
      
      {/* Modal */}
      <div 
        className="relative transform transition-all duration-300"
        style={{ 
          zIndex: 10000,
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxWidth: '448px',
          width: '100%',
          margin: '0 16px',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          aria-label="إغلاق"
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            padding: '8px',
            borderRadius: '50%',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer'
          }}
        >
          <X className="w-5 h-5 text-gray-500" style={{ color: '#6b7280' }} />
        </button>

        {/* Content */}
        <div 
          className="p-8 text-center"
          style={{
            padding: '32px',
            textAlign: 'center'
          }}
        >
          {/* Success Icon */}
          <div 
            className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6" 
            style={{ 
              backgroundColor: '#dcfce7',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px auto'
            }}
          >
            <CheckCircle className="w-10 h-10 text-green-600" style={{ color: '#16a34a', width: '40px', height: '40px' }} />
          </div>

          {/* Title */}
          <h3 
            className="text-2xl font-bold text-gray-900 mb-3" 
            style={{ 
              color: '#111827',
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '12px'
            }}
          >
            {title}
          </h3>

          {/* Message */}
          <p 
            className="text-gray-600 text-lg leading-relaxed" 
            style={{ 
              color: '#4b5563',
              fontSize: '18px',
              lineHeight: '1.6'
            }}
          >
            {message}
          </p>

          {/* Progress Bar */}
          {autoClose && (
            <div 
              className="mt-6"
              style={{ marginTop: '24px' }}
            >
              <div 
                className="w-full bg-gray-200 rounded-full h-1" 
                style={{ 
                  backgroundColor: '#e5e7eb',
                  width: '100%',
                  height: '4px',
                  borderRadius: '2px'
                }}
              >
                <div 
                  className="bg-green-600 h-1 rounded-full transition-all duration-300 ease-linear"
                  style={{
                    backgroundColor: '#16a34a',
                    height: '4px',
                    borderRadius: '2px',
                    animation: `shrink ${autoCloseDelay}ms linear forwards`
                  }}
                />
              </div>
            </div>
          )}
        </div>
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
      
      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ 
          position: 'fixed', 
          top: '10px', 
          left: '10px', 
          background: 'red', 
          color: 'white', 
          padding: '10px', 
          zIndex: 99999,
          fontSize: '12px',
          borderRadius: '4px'
        }}>
          Modal Debug: {isOpen ? 'OPEN' : 'CLOSED'}
        </div>
      )}
    </div>
  );
};

export default SuccessModal;
