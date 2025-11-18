import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mail, 
  Lock, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff
} from 'lucide-react';
import { passwordResetAPI } from '../services/api';

const PasswordReset = () => {
  const [step, setStep] = useState(1); // 1: Request, 2: Reset, 3: Success
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await passwordResetAPI.requestReset(email);
      setSuccess('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
      setStep(2);
    } catch (error) {
      setError(error.message || 'حدث خطأ في إرسال طلب إعادة تعيين كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyToken = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await passwordResetAPI.verifyToken(token);
      setSuccess('تم التحقق من الرمز بنجاح');
      setStep(3);
    } catch (error) {
      setError(error.message || 'الرمز غير صحيح أو منتهي الصلاحية');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      setLoading(false);
      return;
    }

    try {
      await passwordResetAPI.resetPassword(token, newPassword);
      setSuccess('تم تغيير كلمة المرور بنجاح');
      setStep(4);
    } catch (error) {
      setError(error.message || 'حدث خطأ في تغيير كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setEmail('');
    setToken('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-pink-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {step === 1 && 'إعادة تعيين كلمة المرور'}
              {step === 2 && 'التحقق من الرمز'}
              {step === 3 && 'كلمة مرور جديدة'}
              {step === 4 && 'تم بنجاح'}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {step === 1 && 'أدخل بريدك الإلكتروني لإرسال رابط إعادة التعيين'}
              {step === 2 && 'أدخل الرمز المرسل إلى بريدك الإلكتروني'}
              {step === 3 && 'أدخل كلمة المرور الجديدة'}
              {step === 4 && 'تم تغيير كلمة المرور بنجاح'}
            </p>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            {step === 1 && (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div>
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="أدخل بريدك الإلكتروني"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-pink-500 hover:bg-pink-600"
                  disabled={loading}
                >
                  {loading ? 'جاري الإرسال...' : 'إرسال رابط إعادة التعيين'}
                </Button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyToken} className="space-y-4">
                <div>
                  <Label htmlFor="token">رمز التحقق</Label>
                  <Input
                    id="token"
                    type="text"
                    placeholder="أدخل الرمز المرسل إليك"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                  />
                </div>

                <div className="flex space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    رجوع
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-pink-500 hover:bg-pink-600"
                    disabled={loading}
                  >
                    {loading ? 'جاري التحقق...' : 'تحقق'}
                  </Button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 h-4 text-gray-400" />
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="أدخل كلمة المرور الجديدة"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="أكد كلمة المرور الجديدة"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setStep(2)}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    رجوع
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-pink-500 hover:bg-pink-600"
                    disabled={loading}
                  >
                    {loading ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
                  </Button>
                </div>
              </form>
            )}

            {step === 4 && (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    تم تغيير كلمة المرور بنجاح
                  </h3>
                  <p className="text-gray-600">
                    يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة
                  </p>
                </div>
                <Button 
                  onClick={resetForm}
                  className="w-full bg-pink-500 hover:bg-pink-600"
                >
                  إعادة تعيين كلمة مرور أخرى
                </Button>
              </div>
            )}

            {step < 4 && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  تذكرت كلمة المرور؟{' '}
                  <a href="/login" className="text-pink-600 hover:text-pink-700 font-medium">
                    تسجيل الدخول
                  </a>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress Indicator */}
        <div className="mt-6">
          <div className="flex items-center justify-center space-x-2">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber
                      ? 'bg-pink-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div
                    className={`w-8 h-0.5 ${
                      step > stepNumber ? 'bg-pink-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>طلب إعادة التعيين</span>
            <span>التحقق</span>
            <span>كلمة مرور جديدة</span>
            <span>مكتمل</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;
