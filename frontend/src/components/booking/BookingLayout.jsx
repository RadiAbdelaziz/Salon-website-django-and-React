import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

/**
 * Modern booking layout with improved visual hierarchy
 */
const BookingLayout = ({ 
  children, 
  title, 
  subtitle, 
  stepNumber, 
  isCompleted = false, 
  isActive = false, 
  isDisabled = false,
  className = "" 
}) => {
  return (
    <Card className={`booking-section-card ${className} ${
      isActive ? 'ring-2 ring-blue-500 shadow-lg' : ''
    } ${
      isDisabled ? 'opacity-50 pointer-events-none' : ''
    } transition-all duration-300`}>
      <CardContent className="p-0">
        {/* Section Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-4 space-x-reverse">
            {/* Step Indicator */}
            <div className={`relative flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold ${
              isCompleted 
                ? 'bg-green-500 text-white' 
                : isActive 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-600'
            }`}>
              {isCompleted ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                stepNumber
              )}
            </div>
            
            {/* Title & Subtitle */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {title}
              </h3>
              {subtitle && (
                <p className="text-sm text-gray-600">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          {/* Status Badge */}
          {isCompleted && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              مكتمل
            </Badge>
          )}
        </div>
        
        {/* Section Content */}
        <div className="p-6">
          {children}
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingLayout;
