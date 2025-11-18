/**
 * Custom hooks for API data fetching
 * Provides consistent data fetching patterns across components
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/apiService.js';

/**
 * Generic hook for API data fetching
 */
export function useApi(endpoint, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await endpoint();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    if (options.enabled !== false) {
      fetchData();
    }
  }, [fetchData, options.enabled]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

/**
 * Hook for services data
 */
export function useServices(params = {}) {
  return useApi(() => api.services.getAll(params));
}

/**
 * Hook for service categories
 */
export function useServiceCategories() {
  return useApi(() => api.serviceCategories.getAll());
}

/**
 * Hook for categories
 */
export function useCategories() {
  return useApi(() => api.categories.getAll());
}

/**
 * Hook for bookings
 */
export function useBookings(params = {}) {
  return useApi(() => api.bookings.getAll(params));
}

/**
 * Hook for staff
 */
export function useStaff() {
  return useApi(() => api.staff.getAll());
}

/**
 * Hook for hero images
 */
export function useHeroImages() {
  return useApi(() => api.heroImages.getAll());
}

/**
 * Hook for testimonials
 */
export function useTestimonials() {
  return useApi(() => api.testimonials.getAll());
}

/**
 * Hook for contact info
 */
export function useContactInfo() {
  return useApi(() => api.contactInfo.get());
}

/**
 * Hook for offers
 */
export function useOffers(params = {}) {
  return useApi(() => api.offers.getAll(params));
}

/**
 * Hook for user profile
 */
export function useUserProfile() {
  return useApi(() => api.auth.getProfile());
}

/**
 * Hook for customer addresses
 */
export function useCustomerAddresses(customerId) {
  return useApi(
    () => api.addresses.getByCustomer(customerId),
    { enabled: !!customerId }
  );
}

/**
 * Hook for booking time slots
 */
export function useBookingTimeSlots(date, serviceId) {
  return useApi(
    () => api.bookings.getTimeSlots(date, serviceId),
    { enabled: !!(date && serviceId) }
  );
}

/**
 * Hook for coupon validation
 */
export function useCouponValidation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const validateCoupon = useCallback(async (code, amount) => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.coupons.validate(code, amount);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { validateCoupon, loading, error };
}

/**
 * Hook for availability checking
 */
export function useAvailability() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkAvailability = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.availability.get(data);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { checkAvailability, loading, error };
}
