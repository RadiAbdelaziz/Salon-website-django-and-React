import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

/**
 * Real-time form validation with visual feedback
 */
const FormValidation = ({ 
  field, 
  value, 
  rules, 
  showValidation = true,
  className = "" 
}) => {
  const [errors, setErrors] = useState([]);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (!showValidation || !rules) return;

    const validateField = async () => {
      setIsValidating(true);
      const fieldErrors = [];

      for (const rule of rules) {
        try {
          const result = await rule.validator(value);
          if (!result) {
            fieldErrors.push({
              type: rule.type || 'error',
              message: rule.message
            });
          }
        } catch (error) {
          fieldErrors.push({
            type: 'error',
            message: rule.message || 'خطأ في التحقق'
          });
        }
      }

      setErrors(fieldErrors);
      setIsValidating(false);
    };

    const timeoutId = setTimeout(validateField, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [value, rules, showValidation]);

  if (!showValidation || errors.length === 0) {
    return null;
  }

  return (
    <div className={`form-validation ${className}`}>
      {errors.map((error, index) => (
        <div
          key={index}
          className={`flex items-center space-x-2 space-x-reverse mt-2 text-sm ${
            error.type === 'error' 
              ? 'text-red-600' 
              : error.type === 'warning'
              ? 'text-yellow-600'
              : 'text-green-600'
          }`}
        >
          {error.type === 'error' ? (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          ) : error.type === 'warning' ? (
            <Info className="w-4 h-4 flex-shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{error.message}</span>
        </div>
      ))}
      
      {isValidating && (
        <div className="flex items-center space-x-2 space-x-reverse mt-2 text-sm text-gray-500">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          <span>جاري التحقق...</span>
        </div>
      )}
    </div>
  );
};

/**
 * Validation rules factory
 */
export const createValidationRules = {
  required: (message = 'هذا الحقل مطلوب') => ({
    validator: (value) => value && value.toString().trim().length > 0,
    message,
    type: 'error'
  }),

  email: (message = 'يرجى إدخال بريد إلكتروني صحيح') => ({
    validator: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return !value || emailRegex.test(value);
    },
    message,
    type: 'error'
  }),

  phone: (message = 'يرجى إدخال رقم هاتف صحيح') => ({
    validator: (value) => {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
      return !value || phoneRegex.test(value);
    },
    message,
    type: 'error'
  }),

  minLength: (min, message) => ({
    validator: (value) => !value || value.length >= min,
    message: message || `يجب أن يكون ${min} أحرف على الأقل`,
    type: 'error'
  }),

  maxLength: (max, message) => ({
    validator: (value) => !value || value.length <= max,
    message: message || `يجب أن يكون ${max} أحرف على الأكثر`,
    type: 'error'
  }),

  dateNotPast: (message = 'لا يمكن اختيار تاريخ سابق') => ({
    validator: (value) => {
      if (!value) return true;
      const today = new Date();
      const selectedDate = new Date(value);
      return selectedDate >= today;
    },
    message,
    type: 'error'
  }),

  timeSlotAvailable: (availableSlots, message = 'هذا الوقت غير متاح') => ({
    validator: (value) => !value || availableSlots.includes(value),
    message,
    type: 'error'
  })
};

export default FormValidation;
