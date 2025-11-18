import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

const BookingCancelledPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Cancelled Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            تم إلغاء عملية الدفع
          </h1>
          <p className="text-lg text-gray-600">
            لقد ألغيت الدفعة. فضلاً حاول مجددًا أو اختر طريقة دفع أخرى.
          </p>
        </div>

        {/* Info Card */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-center" style={{ color: 'var(--warm-brown)' }}>
              ما حدث؟
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 space-x-reverse">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <p className="text-gray-600">
                  تم إلغاء عملية الدفع من جانبك أو انتهت صلاحية الجلسة
                </p>
              </div>
              
              <div className="flex items-start space-x-3 space-x-reverse">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <p className="text-gray-600">
                  لم يتم خصم أي مبلغ من حسابك
                </p>
              </div>
              
              <div className="flex items-start space-x-3 space-x-reverse">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <p className="text-gray-600">
                  يمكنك المحاولة مرة أخرى أو اختيار طريقة دفع أخرى
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate('/book')}
            className="flex items-center gap-2"
            style={{ background: 'var(--glamour-gold)', color: 'white' }}
          >
            <RefreshCw className="w-4 h-4" />
            المحاولة مرة أخرى
          </Button>
          
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="flex items-center gap-2"
            style={{ borderColor: 'var(--glamour-gold)', color: 'var(--warm-brown)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            العودة للصفحة الرئيسية
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            إذا كنت بحاجة إلى مساعدة، يرجى التواصل معنا
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookingCancelledPage;
