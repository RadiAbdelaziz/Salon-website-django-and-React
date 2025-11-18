// Simple API test utility
export async function testAPIConnection() {
  try {
    console.log('🔍 Testing API connection...');
    
    // Test categories endpoint
    const categoriesResponse = await fetch('http://localhost:8000/api/categories/');
    if (!categoriesResponse.ok) {
      throw new Error(`Categories API failed: ${categoriesResponse.status}`);
    }
    const categories = await categoriesResponse.json();
    console.log('✅ Categories loaded:', categories.length, 'categories');
    
    // Test services endpoint  
    const servicesResponse = await fetch('http://localhost:8000/api/services/');
    if (!servicesResponse.ok) {
      throw new Error(`Services API failed: ${servicesResponse.status}`);
    }
    const services = await servicesResponse.json();
    console.log('✅ Services loaded:', services.length, 'services');
    
    // Test hero images endpoint
    const heroResponse = await fetch('http://localhost:8000/api/hero-images/');
    if (!heroResponse.ok) {
      throw new Error(`Hero images API failed: ${heroResponse.status}`);
    }
    const heroImages = await heroResponse.json();
    console.log('✅ Hero images loaded:', heroImages.length, 'images');
    
    console.log('🎉 All API endpoints are working!');
    return true;
  } catch (error) {
    console.error('❌ API connection failed:', error);
    return false;
  }
}

// Auto-run test in development
if (import.meta.env.DEV) {
  testAPIConnection();
}
