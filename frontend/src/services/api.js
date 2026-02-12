const API_BASE_URL = 'http://localhost:8000/api';

// Request cache to prevent duplicate requests
const requestCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 100; // Maximum number of cached requests

// Generic API request function
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Create a cache key for this request
  const cacheKey = `${options.method || 'GET'}:${url}:${JSON.stringify(options.body || {})}`;
  
  // Check if this request is already in progress
  if (requestCache.has(cacheKey)) {
    const cachedRequest = requestCache.get(cacheKey);
    // Check if cache is still valid
    if (Date.now() - cachedRequest.timestamp < CACHE_DURATION) {
      return cachedRequest.promise;
    } else {
      // Remove expired cache
      requestCache.delete(cacheKey);
    }
  }
  
  // Get auth token from localStorage
  const token = localStorage.getItem('authToken');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Token ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  // Create a promise for this request
  const requestPromise = (async () => {
    try {
      const response = await fetch(url, config);
      
      // Handle authentication errors
      if (response.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('customerData');
        throw new Error('Authentication failed. Please login again.');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle Django REST Framework pagination
      if (data && typeof data === 'object' && data.results) {
        return data.results;
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    } finally {
      // Remove from cache when done
      requestCache.delete(cacheKey);
    }
  })();
  
  // Store the promise in cache with timestamp
  requestCache.set(cacheKey, {
    promise: requestPromise,
    timestamp: Date.now()
  });
  
  // Clean up old cache entries if cache is too large
  if (requestCache.size > MAX_CACHE_SIZE) {
    const oldestKey = requestCache.keys().next().value;
    requestCache.delete(oldestKey);
  }
  
  return requestPromise;
}

// Categories API
export const categoriesAPI = {
  getAll: () => apiRequest('/categories/'),
};

// Service Categories API (new ServiceCategory and ServiceItem models)
export const serviceCategoriesAPI = {
  getAll: () => apiRequest('/service-categories/'),
  getBySlug: (slug) => apiRequest(`/categories/${encodeURIComponent(slug)}/`),
};

// Testimonials API
export const testimonialsAPI = {
  getAll: () => apiRequest('/testimonials/'),
};

// Contact Info API
export const contactInfoAPI = {
  get: () => apiRequest('/contact-info/'),
};

// Services API
export const servicesAPI = {
  getAll: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    const endpoint = searchParams.toString() ? `/services/?${searchParams}` : '/services/';
    return apiRequest(endpoint);
  },
  getById: (id) => apiRequest(`/services/${id}/`),
  getByCategory: (categoryId) => apiRequest(`/services/?category=${categoryId}`),
  getFeatured: () => apiRequest('/services/?featured=true'),
};

// Staff API
export const staffAPI = {
  getAll: () => apiRequest('/staff/'),
  getByService: (serviceId) => apiRequest(`/staff/?service=${serviceId}`),
};

// Hero Images API
export const heroImagesAPI = {
  getAll: () => apiRequest('/hero-images/'),
};

// Customers API
export const customersAPI = {
  create: (customerData) => apiRequest('/customers/', {
    method: 'POST',
    body: JSON.stringify(customerData),
  }),
  getById: (id) => apiRequest(`/customers/${id}/`),
  update: (id, customerData) => apiRequest(`/customers/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(customerData),
  }),
};

// Addresses API
export const addressesAPI = {
  getByCustomer: (customerId) => apiRequest(`/addresses/?customer=${customerId}`),
  create: (addressData) => apiRequest('/addresses/', {
    method: 'POST',
    body: JSON.stringify(addressData),
  }),
  update: (id, addressData) => apiRequest(`/addresses/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(addressData),
  }),
  delete: (id) => apiRequest(`/addresses/${id}/`, {
    method: 'DELETE',
  }),
};

// Bookings API
export const bookingsAPI = {
  getAll: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    const endpoint = searchParams.toString() ? `/bookings/?${searchParams}` : '/bookings/';
    return apiRequest(endpoint);
  },
  create: (bookingData) => apiRequest('/bookings/', {
    method: 'POST',
    body: JSON.stringify(bookingData),
  }),
  getById: (id) => apiRequest(`/bookings/${id}/`),
  update: (id, bookingData) => apiRequest(`/bookings/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(bookingData),
  }),
  getTimeSlots: (date, serviceId) => {
    const params = new URLSearchParams({ date });
    if (serviceId) params.append('service', serviceId);
    return apiRequest(`/booking-time-slots/?${params}`);
  },
};

// Availability API
export const availabilityAPI = {
  get: ({ service_id, date, lat, lng }) => apiRequest('/availability/', {
    method: 'POST',
    body: JSON.stringify({ service_id, date, lat, lng })
  }),
};

// Admin Slot Availability API
export const adminSlotsAPI = {
  getAll: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    const endpoint = searchParams.toString() ? `/admin-slots/?${searchParams}` : '/admin-slots/';
    return apiRequest(endpoint);
  },
  create: (slotData) => apiRequest('/admin-slots/', {
    method: 'POST',
    body: JSON.stringify(slotData),
  }),
  getById: (id) => apiRequest(`/admin-slots/${id}/`),
  update: (id, slotData) => apiRequest(`/admin-slots/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(slotData),
  }),
  delete: (id) => apiRequest(`/admin-slots/${id}/`, {
    method: 'DELETE',
  }),
  getAvailableSlots: (serviceId, date) => {
    const params = new URLSearchParams({ service_id: serviceId, date });
    return apiRequest(`/admin-slots/available/?${params}`);
  },
  bookSlot: (slotId) => apiRequest('/admin-slots/book/', {
    method: 'POST',
    body: JSON.stringify({ slot_id: slotId }),
  }),
  cancelSlot: (slotId) => apiRequest('/admin-slots/cancel/', {
    method: 'POST',
    body: JSON.stringify({ slot_id: slotId }),
  }),
};

// Coupons API
export const couponsAPI = {
  validate: (code, amount) => apiRequest('/validate-coupon/', {
    method: 'POST',
    body: JSON.stringify({ code, amount }),
  }),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => apiRequest('/dashboard-stats/'),
};

// Authentication API (OTP based)
export const authAPI = {
  // 🔐 إرسال رمز التحقق
  sendOtp: (data) =>
    apiRequest('/auth/send-otp/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // ✅ التحقق من الرمز
  verifyOtp: (data) =>
    apiRequest('/auth/verify-otp/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // ===== الموجود سابقًا =====
  login: (credentials) =>
    apiRequest('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  logout: () =>
    apiRequest('/auth/logout/', {
      method: 'POST',
    }),

  getProfile: () => apiRequest('/auth/profile/'),

  updateProfile: (profileData) =>
    apiRequest('/auth/update-profile/', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),
};


// Configuration API
export const configAPI = {
  get: () => apiRequest('/config/'),
  update: (configData) => apiRequest('/config/', {
    method: 'PATCH',
    body: JSON.stringify(configData),
  }),
};

// Working Hours API
export const workingHoursAPI = {
  getAll: () => apiRequest('/working-hours/'),
  getByStaff: (staffId) => apiRequest(`/working-hours/?staff=${staffId}`),
  create: (workingHoursData) => apiRequest('/working-hours/', {
    method: 'POST',
    body: JSON.stringify(workingHoursData),
  }),
  update: (id, workingHoursData) => apiRequest(`/working-hours/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(workingHoursData),
  }),
  delete: (id) => apiRequest(`/working-hours/${id}/`, {
    method: 'DELETE',
  }),
};

// Days Off API
export const daysOffAPI = {
  getAll: () => apiRequest('/days-off/'),
  getByStaff: (staffId) => apiRequest(`/days-off/?staff=${staffId}`),
  create: (dayOffData) => apiRequest('/days-off/', {
    method: 'POST',
    body: JSON.stringify(dayOffData),
  }),
  update: (id, dayOffData) => apiRequest(`/days-off/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(dayOffData),
  }),
  delete: (id) => apiRequest(`/days-off/${id}/`, {
    method: 'DELETE',
  }),
};

// Appointment Requests API
export const appointmentRequestsAPI = {
  getAll: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    const endpoint = searchParams.toString() ? `/appointment-requests/?${searchParams}` : '/appointment-requests/';
    return apiRequest(endpoint);
  },
  create: (requestData) => apiRequest('/appointment-requests/', {
    method: 'POST',
    body: JSON.stringify(requestData),
  }),
  getById: (id) => apiRequest(`/appointment-requests/${id}/`),
  update: (id, requestData) => apiRequest(`/appointment-requests/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(requestData),
  }),
  delete: (id) => apiRequest(`/appointment-requests/${id}/`, {
    method: 'DELETE',
  }),
  reschedule: (id, rescheduleData) => apiRequest(`/appointment-requests/${id}/reschedule/`, {
    method: 'POST',
    body: JSON.stringify(rescheduleData),
  }),
};

// Appointment Reschedule History API
export const rescheduleHistoryAPI = {
  getAll: (params = {}) => {
    const searchParams = new URLSearchParams(params);
    const endpoint = searchParams.toString() ? `/reschedule-history/?${searchParams}` : '/reschedule-history/';
    return apiRequest(endpoint);
  },
  getByAppointment: (appointmentId) => apiRequest(`/reschedule-history/?appointment_request=${appointmentId}`),
  create: (historyData) => apiRequest('/reschedule-history/', {
    method: 'POST',
    body: JSON.stringify(historyData),
  }),
};

// Password Reset API
// export const passwordResetAPI = {
//   requestReset: (email) => apiRequest('/password-reset/request/', {
//     method: 'POST',
//     body: JSON.stringify({ email }),
//   }),
//   verifyToken: (token) => apiRequest('/password-reset/verify/', {
//     method: 'POST',
//     body: JSON.stringify({ token }),
//   }),
//   resetPassword: (token, newPassword) => apiRequest('/password-reset/reset/', {
//     method: 'POST',
//     body: JSON.stringify({ token, new_password: newPassword }),
//   }),
// };


// Blog API
export const blogAPI = {
  // Get all published blog posts
  getAllPosts: (params = {}) => {
    // Filter out undefined values
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([key, value]) => value !== undefined && value !== null && value !== '')
    );
    
    const searchParams = new URLSearchParams(cleanParams);
    const endpoint = searchParams.toString() ? `/blog/posts/?${searchParams}` : '/blog/posts/';
    return apiRequest(endpoint);
  },
  
  // Get a single blog post by slug
  getPostBySlug: (slug) => apiRequest(`/blog/posts/${slug}/`),
  
  // Get featured blog posts
  getFeaturedPosts: () => apiRequest('/blog/posts/featured/'),
  
  // Get trending blog posts
  getTrendingPosts: () => apiRequest('/blog/posts/trending/'),
  
  // Get blog categories
  getCategories: () => apiRequest('/blog/categories/'),
  
  // Get comments for a post
  getPostComments: (postId) => apiRequest(`/blog/posts/${postId}/comments/`),
  
  // Create a comment
  createComment: (postId, commentData) => apiRequest(`/blog/posts/${postId}/comments/create/`, {
    method: 'POST',
    body: JSON.stringify(commentData),
  }),
  
  // Like/unlike a post
  likePost: (postId) => apiRequest(`/blog/posts/${postId}/like/`, {
    method: 'POST',
  }),
  
  // Subscribe to newsletter
  subscribeNewsletter: (emailData) => apiRequest('/blog/newsletter/subscribe/', {
    method: 'POST',
    body: JSON.stringify(emailData),
  }),
  
  // Get blog statistics
  getStats: () => apiRequest('/blog/stats/'),
};

// Transform API data to match frontend expectations
export const transformers = {
  // Transform category data from API to match frontend format
  transformCategories: (apiCategories) => {
    // Ensure apiCategories is an array
    const categoriesArray = Array.isArray(apiCategories) ? apiCategories : [];
    
    const transformed = {};
    categoriesArray.forEach(cat => {
      const key = cat.name_en ? cat.name_en.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') : cat.id;
      transformed[key] = {
        id: cat.id, // Use actual database ID
        title: cat.name,
        description: cat.description,
        services: [], // Will be populated separately
        image: cat.image,
        order: cat.order || 0,
        primary_color: cat.primary_color || '#B89F67' // Include primary_color for dynamic buttons
      };
    });
    return transformed;
  },

  // Transform service data from API to match frontend format
  transformServices: (apiServices) => {
    // Ensure apiServices is an array
    const servicesArray = Array.isArray(apiServices) ? apiServices : [];
    
    return servicesArray.map(service => ({
      id: service.id.toString(),
      name: service.name,
      title: service.name,
      duration: service.duration,
      price: service.price_display || service.price_min.toString(),
      basePrice: parseFloat(service.price_min),
      maxPrice: service.price_max ? parseFloat(service.price_max) : parseFloat(service.price_min),
      category: service.category_name,
      category_id: service.category, // Include category ID for dynamic buttons
      description: service.description,
      image: service.image || 'https://images.unsplash.com/photo-1562322140-8ba1ce3e4c5f?w=400&h=300&fit=crop&auto=format&q=80',
      is_featured: service.is_featured
    }));
  },

  // Transform staff data
  transformStaff: (apiStaff) => {
    const staffArray = Array.isArray(apiStaff) ? apiStaff : [];
    
    return staffArray.map(staff => ({
      id: staff.id.toString(),
      name: staff.name,
      specialization: staff.specialization,
      rating: parseFloat(staff.rating),
      image: staff.image || 'http://localhost:8000/api/placeholder/60/60/'
    }));
  },

  // Transform hero images
  transformHeroImages: (apiHeroImages) => {
    const heroArray = Array.isArray(apiHeroImages) ? apiHeroImages : [];
    
    return heroArray.map((hero, index) => ({
      id: hero.id,
      image: hero.image,
      alt: hero.title
    }));
  },

  // Transform blog posts
  transformBlogPosts: (apiBlogPosts) => {
    const postsArray = Array.isArray(apiBlogPosts) ? apiBlogPosts : [];
    
    return postsArray.map(post => ({
      id: post.id,
      title: post.title,
      title_en: post.title_en || post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      excerpt_en: post.excerpt_en || post.excerpt,
      content: post.content,
      content_en: post.content_en || post.content,
      author: post.author ? {
        id: post.author.id,
        name: post.author.full_name || post.author.user?.get_full_name() || post.author.user?.username,
        email: post.author.email || post.author.user?.email,
        bio: post.author.bio,
        bio_en: post.author.bio_en || post.author.bio,
        profile_image: post.author.profile_image,
        social_instagram: post.author.social_instagram,
        social_facebook: post.author.social_facebook,
        social_twitter: post.author.social_twitter,
      } : null,
      category: post.category ? {
        id: post.category.id,
        name: post.category.name,
        name_en: post.category.name_en || post.category.name,
        description: post.category.description,
        description_en: post.category.description_en || post.category.description,
        color: post.category.color,
        icon: post.category.icon,
      } : null,
      featured_image: post.featured_image,
      featured_image_alt: post.featured_image_alt,
      status: post.status,
      is_featured: post.is_featured,
      is_trending: post.is_trending,
      read_time: post.read_time,
      views: post.views,
      likes: post.likes,
      comments_count: post.comments_count,
      tags: post.tags_list || [],
      meta_description: post.meta_description,
      meta_keywords: post.meta_keywords,
      published_at: post.published_at,
      created_at: post.created_at,
      updated_at: post.updated_at,
      // Legacy fields for compatibility
      date: post.published_at || post.created_at,
      image: post.featured_image,
      authorImage: post.author?.profile_image,
      category: post.category?.name,
      readTime: `${post.read_time} دقائق`,
      comments: post.comments_count,
      featured: post.is_featured,
      trending: post.is_trending,
    }));
  }
};


export { apiRequest };

export default {
  categoriesAPI,
  serviceCategoriesAPI,
  testimonialsAPI,
  contactInfoAPI,
  servicesAPI,
  staffAPI,
  heroImagesAPI,
  customersAPI,
  addressesAPI,
  bookingsAPI,
  availabilityAPI,
  couponsAPI,
  dashboardAPI,
  configAPI,
  workingHoursAPI,
  daysOffAPI,
  appointmentRequestsAPI,
  rescheduleHistoryAPI,
  // passwordResetAPI,
  blogAPI,
  transformers
};
