import React from 'react';

const ProgressIndicator = ({ progress, className = "" }) => (
  <div className={`booking-progress-bar ${className}`}>
    <div 
      className="booking-progress-fill" 
      style={{ width: `${progress}%` }}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label={`تقدم الحجز: ${progress}%`}
    />
  </div>
);

export const getBookingProgress = (bookingState, cartItems) => {
  let progress = 0;
  
  // Service selection (20%)
  if (bookingState.selectedService || cartItems.length > 0) {
    progress += 20;
  }
  
  // Date and time selection (20%)
  if (bookingState.selectedDate && bookingState.selectedTime) {
    progress += 20;
  }
  
  // Address selection (20%)
  if (bookingState.selectedAddress) {
    progress += 20;
  }
  
  // Payment method selection (20%)
  if (bookingState.paymentMethod) {
    progress += 20;
  }
  
  // Ready to submit (20%)
  if (progress === 80) {
    progress = 100;
  }
  
  return progress;
};

export default ProgressIndicator;
