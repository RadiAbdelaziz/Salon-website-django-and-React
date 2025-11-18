import React, { memo, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Clock, MapPin } from 'lucide-react';
import DynamicButton from '../ui/DynamicButton';
import FormValidation, { createValidationRules } from './FormValidation';

/**
 * Optimized service selection with virtual scrolling and search
 */
const ServiceCard = memo(({ 
  service, 
  isSelected, 
  onSelect, 
  categories,
  className = "" 
}) => {
  const handleSelect = () => {
    onSelect(service);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect();
    }
  };

  return (
    <Card 
      className={`service-card cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
        isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
      } ${className}`}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`اختيار خدمة ${service.name}`}
      aria-pressed={isSelected}
    >
      <div className="relative">
        <img 
          src={service.image || '/api/placeholder/300/200/'} 
          alt={`صورة خدمة ${service.name}`}
          className="w-full h-48 object-cover rounded-t-lg"
          loading="lazy"
        />
        
        {/* Price Badge */}
        <Badge 
          className="absolute top-3 right-3 bg-blue-600 text-white"
        >
          {service.basePrice || service.price_min || service.price || 800} ر.س
        </Badge>
        
        {/* Rating Badge */}
        {service.rating && (
          <Badge 
            variant="secondary"
            className="absolute top-3 left-3 bg-yellow-100 text-yellow-800"
          >
            <Star className="w-3 h-3 ml-1" />
            {service.rating}
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        <h4 className="font-bold text-lg mb-2 text-gray-900">
          {service.name}
        </h4>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {service.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-500">
            <div className="flex items-center">
              <Clock className="w-4 h-4 ml-1" />
              {service.duration || 60} دقيقة
            </div>
          </div>
          
          <DynamicButton 
            size="sm"
            categoryId={service.category_id}
            categories={categories}
            className="px-4 py-2 rounded-full"
            onClick={handleSelect}
          >
            {isSelected ? 'مختار' : 'اختيار'}
          </DynamicButton>
        </div>
      </CardContent>
    </Card>
  );
});

ServiceCard.displayName = 'ServiceCard';

const ServiceSelection = ({ 
  services, 
  selectedService, 
  onServiceSelect, 
  categories,
  loading = false,
  error = null,
  className = "" 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Memoized filtered services
  const filteredServices = useMemo(() => {
    if (!services) return [];
    
    return services.filter(service => {
      const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          service.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || 
                             service.category_id === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [services, searchTerm, selectedCategory]);

  // Memoized categories for filter
  const categoryOptions = useMemo(() => {
    const uniqueCategories = [...new Set(services?.map(s => s.category_id).filter(Boolean))];
    return [
      { id: 'all', name: 'جميع الخدمات' },
      ...uniqueCategories.map(id => {
        const category = categories.find(c => c.id === id);
        return { id, name: category?.name || `فئة ${id}` };
      })
    ];
  }, [services, categories]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-t-lg"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <p className="text-lg font-semibold">حدث خطأ في تحميل الخدمات</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
        <Button 
          onClick={() => window.location.reload()} 
          className="bg-blue-600 hover:bg-blue-700"
        >
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className={`service-selection ${className}`}>
      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="البحث في الخدمات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categoryOptions.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Results count */}
        <p className="text-sm text-gray-600">
          {filteredServices.length} خدمة متاحة
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            isSelected={selectedService?.id === service.id}
            onSelect={onServiceSelect}
            categories={categories}
          />
        ))}
      </div>
      
      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <p className="text-lg font-semibold mb-2">لا توجد خدمات</p>
            <p className="text-sm">جرب تغيير معايير البحث</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceSelection;