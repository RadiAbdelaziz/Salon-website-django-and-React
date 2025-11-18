/**
 * Centralized validation utilities
 * Provides consistent validation patterns across forms
 */

/**
 * Email validation
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Phone number validation (Saudi format)
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^(\+966|966|0)?[5-9][0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Required field validation
 */
export const validateRequired = (value) => {
  return value && value.toString().trim().length > 0;
};

/**
 * Minimum length validation
 */
export const validateMinLength = (value, minLength) => {
  return value && value.toString().length >= minLength;
};

/**
 * Maximum length validation
 */
export const validateMaxLength = (value, maxLength) => {
  return !value || value.toString().length <= maxLength;
};

/**
 * Password validation
 */
export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
    errors: {
      minLength: password.length < minLength ? `Password must be at least ${minLength} characters` : null,
      hasUpperCase: !hasUpperCase ? 'Password must contain at least one uppercase letter' : null,
      hasLowerCase: !hasLowerCase ? 'Password must contain at least one lowercase letter' : null,
      hasNumbers: !hasNumbers ? 'Password must contain at least one number' : null,
      hasSpecialChar: !hasSpecialChar ? 'Password must contain at least one special character' : null,
    }
  };
};

/**
 * Date validation
 */
export const validateDate = (date) => {
  if (!date) return false;
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selectedDate >= today;
};

/**
 * Time validation
 */
export const validateTime = (time) => {
  if (!time) return false;
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

/**
 * Price validation
 */
export const validatePrice = (price) => {
  const numPrice = parseFloat(price);
  return !isNaN(numPrice) && numPrice > 0;
};

/**
 * Form validation schema
 */
export const createValidationSchema = (fields) => {
  return (values) => {
    const errors = {};

    Object.keys(fields).forEach(fieldName => {
      const field = fields[fieldName];
      const value = values[fieldName];

      // Required validation
      if (field.required && !validateRequired(value)) {
        errors[fieldName] = field.requiredMessage || `${fieldName} is required`;
        return;
      }

      // Skip other validations if field is empty and not required
      if (!value && !field.required) return;

      // Email validation
      if (field.type === 'email' && value && !validateEmail(value)) {
        errors[fieldName] = 'Please enter a valid email address';
        return;
      }

      // Phone validation
      if (field.type === 'phone' && value && !validatePhone(value)) {
        errors[fieldName] = 'Please enter a valid phone number';
        return;
      }

      // Password validation
      if (field.type === 'password' && value) {
        const passwordValidation = validatePassword(value);
        if (!passwordValidation.isValid) {
          errors[fieldName] = Object.values(passwordValidation.errors).filter(Boolean)[0];
          return;
        }
      }

      // Date validation
      if (field.type === 'date' && value && !validateDate(value)) {
        errors[fieldName] = 'Date cannot be in the past';
        return;
      }

      // Time validation
      if (field.type === 'time' && value && !validateTime(value)) {
        errors[fieldName] = 'Please enter a valid time';
        return;
      }

      // Price validation
      if (field.type === 'price' && value && !validatePrice(value)) {
        errors[fieldName] = 'Please enter a valid price';
        return;
      }

      // Min length validation
      if (field.minLength && value && !validateMinLength(value, field.minLength)) {
        errors[fieldName] = `${fieldName} must be at least ${field.minLength} characters`;
        return;
      }

      // Max length validation
      if (field.maxLength && value && !validateMaxLength(value, field.maxLength)) {
        errors[fieldName] = `${fieldName} must be no more than ${field.maxLength} characters`;
        return;
      }

      // Custom validation
      if (field.validate && typeof field.validate === 'function') {
        const customError = field.validate(value, values);
        if (customError) {
          errors[fieldName] = customError;
          return;
        }
      }
    });

    return errors;
  };
};

/**
 * Common validation schemas
 */
export const validationSchemas = {
  login: createValidationSchema({
    username: { required: true, requiredMessage: 'Username is required' },
    password: { required: true, requiredMessage: 'Password is required' },
  }),

  register: createValidationSchema({
    username: { 
      required: true, 
      minLength: 3,
      maxLength: 30,
      requiredMessage: 'Username is required' 
    },
    email: { 
      required: true, 
      type: 'email',
      requiredMessage: 'Email is required' 
    },
    password: { 
      required: true, 
      type: 'password',
      requiredMessage: 'Password is required' 
    },
    first_name: { 
      required: true, 
      minLength: 2,
      requiredMessage: 'First name is required' 
    },
    last_name: { 
      required: true, 
      minLength: 2,
      requiredMessage: 'Last name is required' 
    },
    phone: { 
      required: true, 
      type: 'phone',
      requiredMessage: 'Phone number is required' 
    },
  }),

  booking: createValidationSchema({
    service: { required: true, requiredMessage: 'Please select a service' },
    date: { required: true, type: 'date', requiredMessage: 'Please select a date' },
    time: { required: true, type: 'time', requiredMessage: 'Please select a time' },
    address: { required: true, requiredMessage: 'Please select an address' },
    payment_method: { required: true, requiredMessage: 'Please select a payment method' },
  }),

  profile: createValidationSchema({
    first_name: { 
      required: true, 
      minLength: 2,
      requiredMessage: 'First name is required' 
    },
    last_name: { 
      required: true, 
      minLength: 2,
      requiredMessage: 'Last name is required' 
    },
    email: { 
      required: true, 
      type: 'email',
      requiredMessage: 'Email is required' 
    },
    phone: { 
      required: true, 
      type: 'phone',
      requiredMessage: 'Phone number is required' 
    },
  }),
};
