/**
 * Booking Confirmation Component
 * Handles booking confirmation and submission
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import DynamicButton from '../ui/DynamicButton';
import dayjs from 'dayjs';

const BookingConfirmation = ({ 
  bookingState, 
  onSubmit, 
  categories = [],
  cartItems = []
}) => {
  const { 
    selectedService, 
    selectedDate, 
    selectedTime, 
    selectedAddress, 
    paymentMethod, 
    couponData, 
    totalPrice 
  } = bookingState;

  const finalPrice = cartItems.length > 0 
    ? cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
    : totalPrice;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--warm-brown)' }}>
          تأكيد الحجز
        </h3>
        <p className="text-sm" style={{ color: 'var(--medium-beige)' }}>
          راجعي تفاصيل حجزك قبل التأكيد
        </p>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h4 className="font-semibold mb-4" style={{ color: 'var(--warm-brown)' }}>
          ملخص الحجز
        </h4>
        
        <div className="space-y-3">
          {/* Service Information */}
          {cartItems.length > 0 ? (
            <div>
              <span style={{ color: 'var(--medium-beige)' }}>الخدمات:</span>
              <div className="mt-1">
                {cartItems.map((item) => (
                  <div key={item.id} className="text-sm" style={{ color: 'var(--warm-brown)' }}>
                    {item.name} × {item.quantity} - {item.price * item.quantity} ر.س
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex justify-between">
              <span style={{ color: 'var(--medium-beige)' }}>الخدمة:</span>
              <span style={{ color: 'var(--warm-brown)' }}>{selectedService?.name}</span>
            </div>
          )}

          {/* Date and Time */}
          <div className="flex justify-between">
            <span style={{ color: 'var(--medium-beige)' }}>التاريخ:</span>
            <span style={{ color: 'var(--warm-brown)' }}>
              {selectedDate ? dayjs(selectedDate).format('YYYY/MM/DD') : 'غير محدد'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span style={{ color: 'var(--medium-beige)' }}>الوقت:</span>
            <span style={{ color: 'var(--warm-brown)' }}>{selectedTime || 'غير محدد'}</span>
          </div>

          {/* Address */}
          <div className="flex justify-between">
            <span style={{ color: 'var(--medium-beige)' }}>العنوان:</span>
            <span style={{ color: 'var(--warm-brown)' }}>{selectedAddress?.title || 'غير محدد'}</span>
          </div>

          {/* Payment Method */}
          <div className="flex justify-between">
            <span style={{ color: 'var(--medium-beige)' }}>طريقة الدفع:</span>
            <span style={{ color: 'var(--warm-brown)' }}>{paymentMethod?.name || 'غير محدد'}</span>
          </div>

          {/* Coupon Discount */}
          {couponData && (
            <div className="flex justify-between text-green-600">
              <span>الخصم:</span>
              <span>-{couponData.discount_amount} ر.س</span>
            </div>
          )}

          {/* Total Price */}
          <div className="border-t pt-3 flex justify-between font-bold text-lg">
            <span style={{ color: 'var(--warm-brown)' }}>المجموع:</span>
            <span style={{ color: 'var(--glamour-gold)' }}>{finalPrice} ر.س</span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <DynamicButton
        onClick={onSubmit}
        categoryId={selectedService?.category_id}
        categories={categories}
        className="w-full py-4 text-lg font-semibold"
        size="lg"
      >
        تأكيد الحجز
      </DynamicButton>
    </div>
  );
};

export default BookingConfirmation;
