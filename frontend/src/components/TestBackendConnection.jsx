import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TestBackendConnection = () => {
  const [services, setServices] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/services/');
      if (response.ok) {
        const data = await response.json();
        setServices(Array.isArray(data) ? data : data.results || []);
      } else {
        setError(`HTTP Error: ${response.status}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testAddresses = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('No auth token found');
        return;
      }
      
      const response = await fetch('http://localhost:8000/api/addresses/', {
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAddresses(Array.isArray(data) ? data : data.results || []);
      } else {
        setError(`HTTP Error: ${response.status}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">اختبار الاتصال بالـ Backend</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>اختبار الخدمات</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={testServices} disabled={loading} className="mb-4">
                {loading ? 'جاري التحميل...' : 'اختبار الخدمات'}
              </Button>
              
              {error && (
                <div className="text-red-600 mb-4">
                  خطأ: {error}
                </div>
              )}
              
              {services.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">الخدمات المتاحة ({services.length}):</h3>
                  <ul className="space-y-1">
                    {services.slice(0, 5).map(service => (
                      <li key={service.id} className="text-sm">
                        {service.name} - {service.price} ر.س
                      </li>
                    ))}
                    {services.length > 5 && (
                      <li className="text-sm text-gray-500">... و {services.length - 5} خدمة أخرى</li>
                    )}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>اختبار العناوين</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={testAddresses} disabled={loading} className="mb-4">
                {loading ? 'جاري التحميل...' : 'اختبار العناوين'}
              </Button>
              
              {error && (
                <div className="text-red-600 mb-4">
                  خطأ: {error}
                </div>
              )}
              
              {addresses.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">العناوين المتاحة ({addresses.length}):</h3>
                  <ul className="space-y-1">
                    {addresses.slice(0, 3).map(address => (
                      <li key={address.id} className="text-sm">
                        {address.title} - {address.address}
                      </li>
                    ))}
                    {addresses.length > 3 && (
                      <li className="text-sm text-gray-500">... و {addresses.length - 3} عنوان آخر</li>
                    )}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TestBackendConnection;
