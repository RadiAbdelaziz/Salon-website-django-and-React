import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Edit, MapPin, Plus, Trash2, User, Mail, Phone, Calendar, ArrowLeft, Save, X } from 'lucide-react'
import LocationPicker from './LocationPicker'

export default function ProfilePage() {
  const { user, customer, updateProfile, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [addresses, setAddresses] = useState([])
  const [loadingAddresses, setLoadingAddresses] = useState(false)
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  
  const [editForm, setEditForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: customer?.phone || '',
    name: customer?.name || ''
  })

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/sign-in')
      return
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    setEditForm({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: customer?.phone || '',
      name: customer?.name || ''
    })
  }, [user, customer])

  // Load customer addresses
  useEffect(() => {
    const loadAddresses = async () => {
      if (!customer?.id) return

      setLoadingAddresses(true)
      try {
        const response = await fetch(`http://localhost:8000/api/addresses/?customer=${customer.id}`, {
          headers: {
            'Authorization': `Token ${localStorage.getItem('authToken')}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          let addressList = Array.isArray(data) ? data : (data.results || data.addresses || [])
          setAddresses(addressList)
        }
      } catch (error) {
        console.error('Error loading addresses:', error)
      } finally {
        setLoadingAddresses(false)
      }
    }

    loadAddresses()
  }, [customer?.id])

  const handleInputChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await updateProfile(editForm)
      setIsEditing(false)
      alert('تم حفظ التغييرات بنجاح')
    } catch (error) {
      console.error('Failed to update profile:', error)
      alert('حدث خطأ أثناء حفظ البيانات')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditForm({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: customer?.phone || '',
      name: customer?.name || ''
    })
    setIsEditing(false)
  }

  // Handle location confirmation
  const handleLocationConfirm = async (locationData) => {
    try {
      const latitude = locationData.coordinates?.lat 
        ? parseFloat(locationData.coordinates.lat.toFixed(7))
        : null
      const longitude = locationData.coordinates?.lng 
        ? parseFloat(locationData.coordinates.lng.toFixed(7))
        : null

      const addressPayload = {
        customer: parseInt(customer.id),
        title: locationData.title || 'العنوان المحدد',
        address: locationData.address,
        latitude: latitude,
        longitude: longitude,
        is_default: addresses.length === 0 // First address is default
      }

      const response = await fetch('http://localhost:8000/api/addresses/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(addressPayload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(JSON.stringify(errorData))
      }

      const savedAddress = await response.json()
      setAddresses(prev => [...prev, savedAddress])
      setShowLocationPicker(false)
      alert('✅ تم إضافة العنوان بنجاح!')
      
    } catch (error) {
      console.error('Error saving address:', error)
      alert('❌ فشل في حفظ العنوان')
    }
  }

  // Handle address deletion
  const handleAddressDelete = async (addressId) => {
    if (!confirm('هل أنت متأكد من حذف هذا العنوان؟')) {
      return
    }

    try {
      const response = await fetch(`http://localhost:8000/api/addresses/${addressId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${localStorage.getItem('authToken')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete address')
      }

      setAddresses(prev => prev.filter(addr => addr.id !== addressId))
      alert('✅ تم حذف العنوان بنجاح')
      
    } catch (error) {
      console.error('Error deleting address:', error)
      alert('❌ فشل في حذف العنوان')
    }
  }

  // Toggle default address
  const handleToggleDefault = async (addressId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/addresses/${addressId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ is_default: true })
      })

      if (!response.ok) {
        throw new Error('Failed to update address')
      }

      // Reload addresses
      const listResponse = await fetch(`http://localhost:8000/api/addresses/?customer=${customer.id}`, {
        headers: {
          'Authorization': `Token ${localStorage.getItem('authToken')}`
        }
      })

      if (listResponse.ok) {
        const data = await listResponse.json()
        let addressList = Array.isArray(data) ? data : (data.results || data.addresses || [])
        setAddresses(addressList)
      }
      
      alert('✅ تم تحديث العنوان الافتراضي')
      
    } catch (error) {
      console.error('Error updating address:', error)
      alert('❌ فشل في تحديث العنوان')
    }
  }

  // Show loading if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-salon-cream flex items-center justify-center text-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحقق من تسجيل الدخول...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'var(--champagne-veil)' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
            style={{ borderColor: 'var(--glamour-gold)', color: 'var(--warm-brown)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            رجوع للرئيسية
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information Card */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader style={{ background: 'var(--champagne-veil)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{ background: 'var(--glamour-gold)' }}>
                      {customer?.name?.charAt(0) || user?.first_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <CardTitle style={{ color: 'var(--warm-brown)' }}>الملف الشخصي</CardTitle>
                      <p className="text-sm" style={{ color: 'var(--medium-beige)' }}>إدارة معلوماتك الشخصية</p>
                    </div>
                  </div>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      style={{ borderColor: 'var(--glamour-gold)', color: 'var(--warm-brown)' }}
                    >
                      <Edit className="w-4 h-4 ml-2" />
                      تعديل
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="first_name" className="flex items-center gap-2" style={{ color: 'var(--warm-brown)' }}>
                          <User className="w-4 h-4" />
                          الاسم الأول
                        </Label>
                        <Input
                          id="first_name"
                          name="first_name"
                          value={editForm.first_name}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="last_name" className="flex items-center gap-2" style={{ color: 'var(--warm-brown)' }}>
                          <User className="w-4 h-4" />
                          اسم العائلة
                        </Label>
                        <Input
                          id="last_name"
                          name="last_name"
                          value={editForm.last_name}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email" className="flex items-center gap-2" style={{ color: 'var(--warm-brown)' }}>
                        <Mail className="w-4 h-4" />
                        البريد الإلكتروني
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        name="email"
                        value={editForm.email}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="flex items-center gap-2" style={{ color: 'var(--warm-brown)' }}>
                        <Phone className="w-4 h-4" />
                        رقم الهاتف
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        name="phone"
                        value={editForm.phone}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-1"
                        style={{ background: 'var(--glamour-gold)', color: 'white' }}
                      >
                        <Save className="w-4 h-4 ml-2" />
                        {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="outline"
                        className="flex-1"
                      >
                        <X className="w-4 h-4 ml-2" />
                        إلغاء
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5" style={{ color: 'var(--glamour-gold)' }} />
                      <div className="flex-1">
                        <p className="text-xs" style={{ color: 'var(--medium-beige)' }}>الاسم الكامل</p>
                        <p className="font-semibold" style={{ color: 'var(--warm-brown)' }}>
                          {customer?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Mail className="w-5 h-5" style={{ color: 'var(--glamour-gold)' }} />
                      <div className="flex-1">
                        <p className="text-xs" style={{ color: 'var(--medium-beige)' }}>البريد الإلكتروني</p>
                        <p className="font-semibold" style={{ color: 'var(--warm-brown)' }}>{user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5" style={{ color: 'var(--glamour-gold)' }} />
                      <div className="flex-1">
                        <p className="text-xs" style={{ color: 'var(--medium-beige)' }}>رقم الهاتف</p>
                        <p className="font-semibold" style={{ color: 'var(--warm-brown)' }}>{customer?.phone || 'غير محدد'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Calendar className="w-5 h-5" style={{ color: 'var(--glamour-gold)' }} />
                      <div className="flex-1">
                        <p className="text-xs" style={{ color: 'var(--medium-beige)' }}>تاريخ الانضمام</p>
                        <p className="font-semibold" style={{ color: 'var(--warm-brown)' }}>{new Date().toLocaleDateString('ar-SA')}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Addresses Card */}
            <Card className="shadow-lg mt-6">
              <CardHeader style={{ background: 'var(--champagne-veil)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-6 h-6" style={{ color: 'var(--glamour-gold)' }} />
                    <div>
                      <CardTitle style={{ color: 'var(--warm-brown)' }}>عناويني المحفوظة</CardTitle>
                      <p className="text-sm" style={{ color: 'var(--medium-beige)' }}>إدارة عناوينك</p>
                    </div>
                  </div>
                  <Badge style={{ background: 'var(--glamour-gold)', color: 'white' }}>
                    {addresses.length} عنوان
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {loadingAddresses ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: 'var(--glamour-gold)' }}></div>
                    <p className="mt-2 text-sm" style={{ color: 'var(--warm-brown)' }}>جاري تحميل العناوين...</p>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">📍</div>
                    <p className="text-sm font-semibold mb-2" style={{ color: 'var(--warm-brown)' }}>
                      لا توجد عناوين محفوظة
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      أضف عنوانك الأول لتسهيل عملية الحجز
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <Card 
                        key={address.id}
                        className="border transition-all duration-300 hover:shadow-md"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <MapPin className="w-5 h-5 mt-1" style={{ color: 'var(--glamour-gold)' }} />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold" style={{ color: 'var(--warm-brown)' }}>
                                    {address.title}
                                  </h4>
                                  {address.is_default && (
                                    <Badge style={{ background: 'var(--glamour-gold)', color: 'white', fontSize: '10px' }}>
                                      افتراضي
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm opacity-80" style={{ color: 'var(--warm-brown)' }}>
                                  {address.address}
                                </p>
                                {address.latitude && address.longitude && (
                                  <a
                                    href={`https://www.google.com/maps?q=${address.latitude},${address.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs mt-2 inline-flex items-center gap-1 hover:underline"
                                    style={{ color: 'var(--glamour-gold)' }}
                                  >
                                    🗺️ فتح في خرائط جوجل
                                  </a>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {!address.is_default && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleDefault(address.id)}
                                  className="text-xs"
                                  style={{ color: 'var(--glamour-gold)' }}
                                >
                                  جعله افتراضي
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAddressDelete(address.id)}
                                className="p-2 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                
                <Button
                  variant="outline"
                  onClick={() => setShowLocationPicker(true)}
                  className="w-full mt-4 py-3"
                  style={{ borderColor: 'var(--glamour-gold)', color: 'var(--glamour-gold)' }}
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة عنوان جديد
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats Sidebar */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg" style={{ background: 'linear-gradient(135deg, var(--glamour-gold) 0%, var(--warm-brown) 100%)' }}>
              <CardContent className="p-6 text-white">
                <h3 className="text-lg font-bold mb-4">إحصائياتك</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm opacity-90">الحجوزات</span>
                    <span className="text-2xl font-bold">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm opacity-90">العناوين</span>
                    <span className="text-2xl font-bold">{addresses.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm opacity-90">النقاط</span>
                    <span className="text-2xl font-bold">0</span>
                  </div>
                </div>
                <Button
                  onClick={() => navigate('/bookings')}
                  className="w-full mt-6 bg-white hover:bg-gray-100"
                  style={{ color: 'var(--warm-brown)' }}
                >
                  عرض حجوزاتي
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Location Picker Modal */}
      {showLocationPicker && (
        <LocationPicker
          isOpen={showLocationPicker}
          onClose={() => setShowLocationPicker(false)}
          onLocationConfirm={handleLocationConfirm}
        />
      )}
    </div>
  )
}


