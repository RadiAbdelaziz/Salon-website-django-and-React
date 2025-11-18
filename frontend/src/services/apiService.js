/**
 * Centralized API Service Layer
 * Handles all API communications with proper error handling and caching
 */

import { cacheManager, CACHE_TTL } from '../utils/cacheManager.js';
import { logger } from '../utils/logger.js';

const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Get authentication token from localStorage
   */
  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  /**
   * Get headers with authentication
   */
  getHeaders(includeAuth = true) {
    const headers = { ...this.defaultHeaders };
    
    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }
    }
    
    return headers;
  }

  /**
   * Generic API request method
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(options.includeAuth !== false),
      ...options,
    };

    const startTime = Date.now();
    logger.apiRequest(url, config.method || 'GET', config.body);

    try {
      const response = await fetch(url, config);
      
      // Handle authentication errors
      if (response.status === 401) {
        this.handleAuthError();
        throw new Error('Authentication failed. Please login again.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      logger.apiResponse(url, response.status, data);
      logger.performance(`API Request: ${endpoint}`, startTime);
      
      // Handle Django REST Framework pagination
      if (data && typeof data === 'object' && data.results) {
        return data.results;
      }
      
      return data;
    } catch (error) {
      logger.apiError(url, error);
      throw error;
    }
  }

  /**
   * Handle authentication errors
   */
  handleAuthError() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('customerData');
    // Redirect to login page
    window.location.href = '/sign-in';
  }

  /**
   * GET request with intelligent caching
   */
  async get(endpoint, useCache = true, ttl = null) {
    if (useCache) {
      const cached = cacheManager.get(endpoint);
      if (cached) {
        logger.cacheHit(endpoint);
        return cached;
      }
      logger.cacheMiss(endpoint);
    }

    const data = await this.request(endpoint, { method: 'GET' });
    
    if (useCache) {
      // Determine TTL based on endpoint type
      const cacheTTL = ttl || this.getTTLForEndpoint(endpoint);
      cacheManager.set(endpoint, data, cacheTTL);
      logger.cacheSet(endpoint, cacheTTL);
    }
    
    return data;
  }

  /**
   * Get appropriate TTL for endpoint
   */
  getTTLForEndpoint(endpoint) {
    if (endpoint.includes('/services/')) return CACHE_TTL.SERVICES;
    if (endpoint.includes('/categories/')) return CACHE_TTL.CATEGORIES;
    if (endpoint.includes('/auth/profile')) return CACHE_TTL.USER_PROFILE;
    if (endpoint.includes('/bookings/')) return CACHE_TTL.BOOKINGS;
    if (endpoint.includes('/availability/')) return CACHE_TTL.AVAILABILITY;
    if (endpoint.includes('/hero-images/') || endpoint.includes('/testimonials/')) return CACHE_TTL.STATIC_DATA;
    return CACHE_TTL.SERVICES; // Default
  }

  /**
   * POST request
   */
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   */
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * PATCH request
   */
  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// Create singleton instance
const apiService = new ApiService();

// Specific API methods
export const api = {
  // Authentication
  auth: {
    login: (credentials) => apiService.post('/auth/login/', credentials),
    register: (userData) => apiService.post('/auth/register/', userData),
    logout: () => apiService.post('/auth/logout/'),
    getProfile: () => apiService.get('/auth/profile/'),
    updateProfile: (profileData) => apiService.put('/auth/update-profile/', profileData),
  },

  // Services
  services: {
    getAll: (params = {}) => {
      const searchParams = new URLSearchParams(params);
      const endpoint = searchParams.toString() ? `/services/?${searchParams}` : '/services/';
      return apiService.get(endpoint);
    },
    getById: (id) => apiService.get(`/services/${id}/`),
    getByCategory: (categoryId) => apiService.get(`/services/?category=${categoryId}`),
    getFeatured: () => apiService.get('/services/?featured=true'),
  },

  // Categories
  categories: {
    getAll: () => apiService.get('/categories/'),
  },

  // Service Categories
  serviceCategories: {
    getAll: () => apiService.get('/service-categories/'),
  },

  // Bookings
  bookings: {
    getAll: (params = {}) => {
      const searchParams = new URLSearchParams(params);
      const endpoint = searchParams.toString() ? `/bookings/?${searchParams}` : '/bookings/';
      return apiService.get(endpoint);
    },
    create: (bookingData) => apiService.post('/bookings/', bookingData),
    getById: (id) => apiService.get(`/bookings/${id}/`),
    update: (id, bookingData) => apiService.patch(`/bookings/${id}/`, bookingData),
    getTimeSlots: (date, serviceId) => {
      const params = new URLSearchParams({ date });
      if (serviceId) params.append('service', serviceId);
      return apiService.get(`/booking-time-slots/?${params}`);
    },
  },

  // Customers
  customers: {
    create: (customerData) => apiService.post('/customers/', customerData),
    getById: (id) => apiService.get(`/customers/${id}/`),
    update: (id, customerData) => apiService.patch(`/customers/${id}/`, customerData),
  },

  // Addresses
  addresses: {
    getByCustomer: (customerId) => apiService.get(`/addresses/?customer=${customerId}`),
    create: (addressData) => apiService.post('/addresses/', addressData),
    update: (id, addressData) => apiService.patch(`/addresses/${id}/`, addressData),
    delete: (id) => apiService.delete(`/addresses/${id}/`),
  },

  // Coupons
  coupons: {
    validate: (code, amount) => apiService.post('/validate-coupon/', { code, amount }),
  },

  // Staff
  staff: {
    getAll: () => apiService.get('/staff/'),
    getByService: (serviceId) => apiService.get(`/staff/?service=${serviceId}`),
  },

  // Hero Images
  heroImages: {
    getAll: () => apiService.get('/hero-images/'),
  },

  // Testimonials
  testimonials: {
    getAll: () => apiService.get('/testimonials/'),
  },

  // Contact Info
  contactInfo: {
    get: () => apiService.get('/contact-info/'),
  },

  // Offers
  offers: {
    getAll: (params = {}) => {
      const searchParams = new URLSearchParams(params);
      const endpoint = searchParams.toString() ? `/offers/?${searchParams}` : '/offers/';
      return apiService.get(endpoint);
    },
    getById: (id) => apiService.get(`/offers/${id}/`),
  },

  // Availability
  availability: {
    get: (data) => apiService.post('/availability/', data),
  },

  // Dashboard
  dashboard: {
    getStats: () => apiService.get('/dashboard-stats/'),
  },
};

export default api;
