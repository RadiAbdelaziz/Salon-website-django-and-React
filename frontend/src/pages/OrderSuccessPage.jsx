import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Home, Calendar, MapPin, CreditCard } from 'lucide-react';
import Header from '../components/Header';

const OrderSuccessPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <Header 
        onBookingClick={() => navigate('/book')} 
        onNavigate={(page) => navigate(page)}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center p-8">
            <CardContent>
              {/* Success Icon */}
              <div className="mb-6">
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
              </div>

              {/* Success Message */}
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                تم إكمال الطلب بنجاح! 🎉
              </h1>
              
              <p className="text-lg text-gray-600 mb-8">
                شكراً لك على اختيار خدماتنا. تم تأكيد طلبك وسنتواصل معك قريباً.
              </p>

              {/* Order Details */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">تفاصيل الطلب</h3>
                <div className="space-y-3 text-right">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">رقم الطلب:</span>
                    <span className="font-semibold">#12345</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">تاريخ الطلب:</span>
                    <span className="font-semibold">{new Date().toLocaleDateString('ar-SA')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">المجموع:</span>
                    <span className="font-semibold text-green-600">449.00 ر.س</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate('/')}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
                >
                  <Home className="w-5 h-5" />
                  العودة للرئيسية
                </Button>
                
                <Button
                  onClick={() => navigate('/book')}
                  variant="outline"
                  className="flex items-center gap-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3"
                >
                  <Calendar className="w-5 h-5" />
                  حجز جديد
                </Button>
              </div>

              {/* Additional Info */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">معلومات إضافية:</h4>
                <ul className="text-sm text-blue-700 space-y-1 text-right">
                  <li>• سيتم إرسال رسالة تأكيد إلى رقم هاتفك</li>
                  <li>• يمكنك تتبع حالة الطلب من خلال حسابك</li>
                  <li>• فريقنا سيتواصل معك قبل موعد الخدمة</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
};

export default OrderSuccessPage;
