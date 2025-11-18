import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import BookingLayout from './BookingLayout';

/**
 * Mobile-optimized booking flow with step-by-step navigation
 */
const MobileBookingFlow = ({ 
  steps, 
  currentStep, 
  onStepChange, 
  onComplete,
  isSubmitting = false 
}) => {
  const [direction, setDirection] = useState('forward');

  const handleNext = () => {
    setDirection('forward');
    onStepChange(currentStep + 1);
  };

  const handlePrevious = () => {
    setDirection('backward');
    onStepChange(currentStep - 1);
  };

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="mobile-booking-container min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevious}
            disabled={isFirstStep}
            className="flex items-center space-x-2 space-x-reverse"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>السابق</span>
          </Button>
          
          <div className="flex-1 text-center">
            <h1 className="text-lg font-semibold text-gray-900">
              {currentStepData.title}
            </h1>
            <p className="text-sm text-gray-600">
              خطوة {currentStep + 1} من {steps.length}
            </p>
          </div>
          
          <div className="w-16" /> {/* Spacer for alignment */}
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="p-4 pb-24">
        <BookingLayout
          title={currentStepData.title}
          subtitle={currentStepData.subtitle}
          stepNumber={currentStep + 1}
          isActive={true}
          className="mb-6"
        >
          {currentStepData.content}
        </BookingLayout>
      </div>

      {/* Mobile Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex space-x-3 space-x-reverse">
          {!isFirstStep && (
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="flex-1"
            >
              السابق
            </Button>
          )}
          
          <Button
            onClick={isLastStep ? onComplete : handleNext}
            disabled={!currentStepData.isValid || isSubmitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                جاري المعالجة...
              </>
            ) : isLastStep ? (
              <>
                <Check className="w-4 h-4 ml-2" />
                تأكيد الحجز
              </>
            ) : (
              <>
                التالي
                <ChevronRight className="w-4 h-4 mr-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileBookingFlow;
