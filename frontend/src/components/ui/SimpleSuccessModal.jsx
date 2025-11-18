import React, { useEffect } from 'react';

const SimpleSuccessModal = ({ isOpen, onClose, title, message, autoClose = true, autoCloseDelay = 3000 }) => {
  useEffect(() => {
    if (isOpen && autoClose) {
      console.log('🎉 Simple modal opened, will auto-close in', autoCloseDelay, 'ms');
      const timer = setTimeout(() => {
        console.log('🎉 Auto-closing simple modal');
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  console.log('🎉 Rendering simple modal with:', { isOpen, title, message });

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '20px'
      }}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '40px',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          ×
        </button>

        {/* Success Icon */}
        <div 
          style={{
            fontSize: '60px',
            color: '#22c55e',
            marginBottom: '20px'
          }}
        >
          ✅
        </div>

        {/* Title */}
        <h2 
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '16px',
            margin: '0 0 16px 0'
          }}
        >
          {title}
        </h2>

        {/* Message */}
        <p 
          style={{
            fontSize: '16px',
            color: '#4b5563',
            lineHeight: '1.5',
            margin: '0 0 20px 0'
          }}
        >
          {message}
        </p>

        {/* Progress Bar */}
        {autoClose && (
          <div style={{ marginTop: '20px' }}>
            <div 
              style={{
                width: '100%',
                height: '4px',
                backgroundColor: '#e5e7eb',
                borderRadius: '2px',
                overflow: 'hidden'
              }}
            >
              <div 
                style={{
                  height: '100%',
                  backgroundColor: '#22c55e',
                  borderRadius: '2px',
                  animation: `shrink ${autoCloseDelay}ms linear forwards`
                }}
              />
            </div>
          </div>
        )}

        {/* Debug Info */}
        <div 
          style={{
            position: 'fixed',
            top: '10px',
            left: '10px',
            background: 'red',
            color: 'white',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '12px',
            zIndex: 100000
          }}
        >
          Simple Modal: {isOpen ? 'OPEN' : 'CLOSED'}
        </div>
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default SimpleSuccessModal;
