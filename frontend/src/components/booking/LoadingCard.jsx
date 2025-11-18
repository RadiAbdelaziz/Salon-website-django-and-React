import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const LoadingCard = ({ className = "" }) => (
  <Card className={`animate-pulse ${className}`}>
    <CardContent className="p-6">
      <div className="flex items-center space-x-4 space-x-reverse">
        <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const LoadingGrid = ({ count = 3, className = "" }) => (
  <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
    {Array.from({ length: count }, (_, i) => (
      <LoadingCard key={i} />
    ))}
  </div>
);

export const LoadingSkeleton = ({ className = "" }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
  </div>
);

export default LoadingCard;
