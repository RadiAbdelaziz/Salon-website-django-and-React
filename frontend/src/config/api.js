// API Configuration
const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:8000';

export const API_ENDPOINTS = {
  addresses: `${API_BASE_URL}/api/addresses/`,
  bookings: `${API_BASE_URL}/api/bookings/`,
  services: `${API_BASE_URL}/api/services/`,
  validateCoupon: `${API_BASE_URL}/api/validate-coupon/`,
  customerPreferences: `${API_BASE_URL}/api/customer-preferences/`,
};

// API Helper Functions
export const apiRequest = async (url, options = {}) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${localStorage.getItem('authToken')}`
    }
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

// Retry logic for API calls
export const apiRequestWithRetry = async (url, options = {}, maxRetries = 3) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiRequest(url, options);
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        const delay = 1000 * (attempt + 1); // Exponential backoff
        console.log(`API request failed, retrying in ${delay}ms... (Attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};
