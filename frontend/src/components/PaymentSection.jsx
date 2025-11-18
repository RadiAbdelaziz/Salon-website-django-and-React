const PaymentSection = () => (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--warm-brown)' }}>
            طريقة الدفع
          </h3>
          <p className="text-sm" style={{ color: 'var(--medium-beige)' }}>
            اختاري طريقة الدفع المناسبة لك
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paymentMethods.map((method) => (
          <Card 
            key={method.id}
            className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
              bookingState.paymentMethod?.id === method.id ? 'ring-2 ring-yellow-400' : ''
            }`}
            onClick={() => handlePaymentSelect(method)}
          >
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">{method.icon}</div>
              <h4 className="font-semibold mb-1" style={{ color: 'var(--warm-brown)' }}>
                {method.name}
              </h4>
              <p className="text-xs opacity-80" style={{ color: 'var(--warm-brown)' }}>
                {method.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>


      {/* Price Summary */}
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-6 border" style={{ borderColor: 'var(--glamour-gold)' }}>
        <h4 className="font-semibold mb-4 text-center" style={{ color: 'var(--warm-brown)' }}>
          ملخص الطلب
        </h4>
        
        {/* Cart Items Summary */}
        {cartItems.length > 0 && (
          <div className="space-y-2 mb-4">
            <h5 className="font-medium text-sm" style={{ color: 'var(--warm-brown)' }}>
              الخدمات المختارة:
            </h5>
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <span className="truncate flex-1">{item.name}</span>
                <div className="flex items-center space-x-2 space-x-reverse text-xs text-gray-500">
                  <span>x{item.quantity}</span>
<span>{item.price * item.quantity}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Total Price */}
        <div className="border-t pt-4" style={{ borderColor: 'var(--silken-dune)' }}>
          <div className="flex justify-between items-center text-lg font-bold">
            <span style={{ color: 'var(--warm-brown)' }}>المجموع الكلي:</span>
            <span className="text-2xl" style={{ color: 'var(--glamour-gold)' }}>
              {cartItems.length > 0 
                ? cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
                : bookingState.totalPrice
              }
            </span>
          </div>
        </div>
      </div>

      {/* Coupon Section */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold mb-3" style={{ color: 'var(--warm-brown)' }}>
          كود الخصم
        </h4>
        <div className="flex gap-2">
          <Input
            placeholder="أدخل كود الخصم"
            value={bookingState.couponCode}
            onChange={(e) => setBookingState(prev => ({ ...prev, couponCode: e.target.value }))}
            className="flex-1"
          />
          <Button
            onClick={handleCouponValidation}
            disabled={isValidatingCoupon || !bookingState.couponCode.trim()}
            style={{ background: 'var(--glamour-gold)', color: 'white' }}
          >
            {isValidatingCoupon ? 'جاري التحقق...' : 'تطبيق'}
          </Button>
        </div>
        {couponError && (
          <p className="text-red-500 text-sm mt-2">{couponError}</p>
        )}
        {bookingState.couponData && (
          <div className="flex items-center mt-2 text-green-600">
            <Check className="w-4 h-4 ml-1" />
            <span className="text-sm">تم تطبيق الخصم: {bookingState.couponData.discount_amount} ر.س</span>
          </div>
        )}
      </div>

    </div>
  );