// مصدر موحد لجميع بيانات الخدمات في التطبيق
import { getCategories, getServices, getServiceById as apiGetServiceById, getCategoryBySlug } from '../services/simpleApi.js';

// Cache for API data - reset to force fresh data
let cachedCategories = null;
let cachedServices = null;
let cachedStaff = null;

// Fetch categories from API
export async function fetchCategories() {
  if (cachedCategories) return cachedCategories;
  
  try {
    cachedCategories = await getCategories();
    return cachedCategories;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return {};
  }
}

// Fetch services from API
export async function fetchServices() {
  if (cachedServices) return cachedServices;
  
  try {
    cachedServices = await getServices();
    return cachedServices;
  } catch (error) {
    console.error('Failed to fetch services:', error);
    return [];
  }
}

// Fetch staff from API
export async function fetchStaff() {
  if (cachedStaff) return cachedStaff;
  
  try {
    const apiStaff = await staffAPI.getAll();
    cachedStaff = transformers.transformStaff(apiStaff);
    return cachedStaff;
  } catch (error) {
    console.error('Failed to fetch staff:', error);
    return [];
  }
}

// Clear cache to force refresh
export function clearCache() {
  cachedCategories = null;
  cachedServices = null;
  cachedStaff = null;
}

// Force refresh data (clear cache and reload)
export function refreshData() {
  clearCache();
  // Also clear any browser cache
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
}

// Auto-clear cache every 30 seconds to get fresh data
if (typeof window !== 'undefined') {
  setInterval(() => {
    clearCache();
  }, 30000);
}

// No fallback data - only use real API data from Django
export const fallbackServiceCategories = {};

// دمج جميع الخدمات في مصفوفة واحدة (fallback) - EMPTY FOR TESTING
export const fallbackAllServices = [];

// No fallback staff data - only use real API data from Django
export const fallbackStaff = [];

// API-compatible functions
export async function getServiceCategories() {
  try {
    const categories = await fetchCategories();
    const services = await fetchServices();
    
    // Group services by category
    const categoriesWithServices = { ...categories };
    services.forEach(service => {
      const categoryKey = Object.keys(categoriesWithServices).find(key => 
        categoriesWithServices[key].title === service.category
      );
      if (categoryKey && categoriesWithServices[categoryKey]) {
        if (!categoriesWithServices[categoryKey].services) {
          categoriesWithServices[categoryKey].services = [];
        }
        categoriesWithServices[categoryKey].services.push(service);
      }
    });
    
    return categoriesWithServices;
  } catch (error) {
    console.error('Failed to get service categories:', error);
    return {};
  }
}

export async function getAllServices() {
  try {
    return await fetchServices();
  } catch (error) {
    console.error('Failed to get all services:', error);
    return [];
  }
}

// دالة للبحث عن خدمة بواسطة ID
export async function getServiceById(serviceId) {
  try {
    // Try API first
    const apiService = await apiGetServiceById(serviceId);
    if (apiService) return apiService;
    
    // Fallback to cached services
    const services = await fetchServices();
    return services.find(service => service.id === serviceId || service.id === serviceId.toString());
  } catch (error) {
    console.error('Failed to get service by ID:', error);
    return null;
  }
}

// دالة للبحث عن خدمة بواسطة الاسم أو العنوان
export async function getServiceByName(serviceName) {
  try {
    const services = await fetchServices();
    return services.find(service => 
      service.name === serviceName || service.title === serviceName
    );
  } catch (error) {
    console.error('Failed to get service by name:', error);
    return null;
  }
}

// دالة للحصول على خدمات فئة معينة
export async function getServicesByCategory(categoryId) {
  try {
    const categories = await getServiceCategories();
    return categories[categoryId]?.services || [];
  } catch (error) {
    console.error('Failed to get services by category:', error);
    return [];
  }
}

// دالة للحصول على معلومات الفئة
export async function getCategoryById(categoryId) {
  try {
    const categories = await fetchCategories();
    return categories[categoryId];
  } catch (error) {
    console.error('Failed to get category by ID:', error);
    return null;
  }
}

// دالة للحصول على معلومات الفئة بواسطة slug
export async function getCategoryBySlugFromAPI(slug) {
  try {
    return await getCategoryBySlug(slug);
  } catch (error) {
    console.error('Failed to get category by slug:', error);
    return null;
  }
}

// Legacy exports for backward compatibility (empty - only Django data)
export const serviceCategories = {};
export const allServices = [];
