// Simplified API that works with existing data structure
// No fallback imports - only use real API data from Django
import { cacheManager } from '../utils/cacheManager.js';

// Function to clear cache and force fresh data
export function clearCategoriesCache() {
  cacheManager.clear('categories');
  console.log('🔄 Categories cache cleared');
}

// Function to clear all cache
export function clearAllCache() {
  cacheManager.clearAll();
  console.log('🔄 All cache cleared');
}

const API_BASE_URL = 'http://localhost:8000/api';

// Simple API request with fallback
async function simpleApiRequest(endpoint) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : (data.results || []);
  } catch (error) {
    console.error('API request failed:', error);
    return null;
  }
}

// Get all categories with services
export async function getCategories() {
  const cacheKey = 'categories';
  const cached = cacheManager.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const [apiCategories, apiServices] = await Promise.all([
      simpleApiRequest('/categories/'),
      simpleApiRequest('/services/')
    ]);

    if (!apiCategories || !apiServices) {
      // No API data available
      return {};
    }
    
    // API data loaded successfully

    // Transform categories - simplified logic
    const categories = {};
    apiCategories.forEach(cat => {
      const key = cat.name_en ? cat.name_en.toLowerCase().replace(/\s+/g, '-') : cat.name.toLowerCase().replace(/\s+/g, '-');
      
      // Get services for this category ONLY by category ID
      const categoryServices = apiServices.filter(service => service.category === cat.id);
      
      // Category services loaded

      categories[key] = {
        id: cat.id, // Use actual database ID
        slug_en: cat.slug_en, // Include slug for routing
        title: cat.name,
        description: cat.description,
        image: cat.image,
        primary_color: cat.primary_color || '#B89F67', // Include primary_color for dynamic buttons
        services: categoryServices.map(service => ({
          id: service.id.toString(),
          name: service.name,
          title: service.name,
          duration: service.duration,
          price: service.price_display || service.price_min?.toString() || '0',
          basePrice: parseFloat(service.price_min || 0),
          maxPrice: parseFloat(service.price_max || service.price_min || 0),
          category: cat.name,
          category_id: cat.id, // Include category ID for dynamic buttons
          description: service.description,
          image: service.image || 'https://images.unsplash.com/photo-1562322140-8ba1ce3e4c5f?w=400&h=300&fit=crop&auto=format&q=80',
          is_featured: service.is_featured
        }))
      };
    });

    cacheManager.set(cacheKey, categories);
    return categories;
  } catch (error) {
    console.error('Failed to get categories:', error);
    console.log('⚠️ API error, returning empty data');
    return {};
  }
}

// Get all services
export async function getServices() {
  try {
    const apiServices = await simpleApiRequest('/services/');
    
    if (!apiServices) {
      console.log('⚠️ No services data available');
      return [];
    }

    console.log(`📊 API returned ${apiServices.length} services`);

    return apiServices.map(service => ({
      id: service.id.toString(),
      name: service.name,
      title: service.name,
      duration: service.duration,
      price: service.price_display || service.price_min?.toString() || '0',
      basePrice: parseFloat(service.price_min || 0),
      maxPrice: parseFloat(service.price_max || service.price_min || 0),
      category: service.category_name,
      category_id: service.category, // Include category ID for dynamic buttons
      description: service.description,
      image: service.image || 'https://images.unsplash.com/photo-1562322140-8ba1ce3e4c5f?w=400&h=300&fit=crop&auto=format&q=80',
      is_featured: service.is_featured
    }));
  } catch (error) {
    console.error('Failed to get services:', error);
    console.log('⚠️ API error, returning empty data');
    return [];
  }
}

// Get single service by ID
export async function getServiceById(serviceId) {
  try {
    const response = await fetch(`${API_BASE_URL}/services/${serviceId}/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const service = await response.json();
    
    return {
      id: service.id.toString(),
      name: service.name,
      title: service.name,
      duration: service.duration,
      price: service.price_display || service.price_min?.toString() || '0',
      price_min: service.price_min,
      price_max: service.price_max,
      price_display: service.price_display,
      category_name: service.category_name,
      description: service.description,
      image: service.image || 'https://images.unsplash.com/photo-1562322140-8ba1ce3e4c5f?w=400&h=300&fit=crop&auto=format&q=80',
      is_featured: service.is_featured
    };
  } catch (error) {
    console.error('Failed to get service by ID:', error);
    // No fallback data - return null if not found
    return null;
  }
}

// Get category by slug
export async function getCategoryBySlug(slug) {
  try {
    console.log('🔍 getCategoryBySlug called with slug:', slug, 'type:', typeof slug);
    const url = `${API_BASE_URL}/categories/${slug}/`;
    console.log('🔗 Fetching category URL:', url);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const category = await response.json();
    
    // Use services returned directly from the API
    const categoryServices = category.services || [];
    
    return {
      id: category.id,
      slug_en: category.slug_en,
      title: category.name,
      description: category.description,
      image: category.image,
      primary_color: category.primary_color || '#B89F67',
      services: categoryServices
    };
  } catch (error) {
    console.error('Failed to get category by slug:', error);
    return null;
  }
}

// Get hero images
export async function getHeroImages() {
  const fallbackImages = [
    {
      id: 1,
      image: "https://admin.ozeesalon.com/storage/uploads/contents/images/302e88e1-3dd1-42e6-9138-eb4f927ce07d.jpeg",
      alt: "عرض مساج كاسات الهواء"
    },
    {
      id: 2,
      image: "https://admin.ozeesalon.com/storage/uploads/contents/images/e21b7dfa-85a8-4b40-a6d2-db3485e12768.jpeg",
      alt: "عرض مساج لمفاوي"
    },
    {
      id: 3,
      image: "https://admin.ozeesalon.com/storage/uploads/contents/images/f31d9710-96f3-4d36-9469-c35b9115f624.jpeg",
      alt: "هديتك غير وبخصم مايتكرر"
    }
  ];

  try {
    const apiHeroImages = await simpleApiRequest('/hero-images/');
    
    if (!apiHeroImages || !Array.isArray(apiHeroImages) || apiHeroImages.length === 0) {
      return fallbackImages;
    }

    return apiHeroImages.map((hero, index) => ({
      id: hero.id || index + 1,
      image: hero.image,
      alt: hero.title || hero.alt || `Hero image ${index + 1}`
    }));
  } catch (error) {
    console.error('Failed to get hero images:', error);
    return fallbackImages;
  }
}
