import React, { useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Navigation, X } from 'lucide-react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from '@vis.gl/react-google-maps';
import { API_KEY, MAP_ID, DEFAULT_CENTER, DEFAULT_ZOOM } from '../config/maps';
import './LocationPicker.css';

const LocationPicker = ({ isOpen, onClose, onLocationConfirm }) => {
  const [position, setPosition] = useState(DEFAULT_CENTER);
  const [addressData, setAddressData] = useState({
    title: '',
    detailedAddress: '',
    coordinates: DEFAULT_CENTER
  });
  const [isLocating, setIsLocating] = useState(false);
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    return () => {
      // Cleanup on unmount
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // الحصول على الموقع الحالي باستخدام Geolocation API
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('متصفحك لا يدعم تحديد الموقع');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude, 
          lng: position.coords.longitude
        };
        
        setPosition(coords);
        const addressText = `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
        setSelectedAddress(addressText);
        setAddressData(prev => ({ 
          ...prev, 
          coordinates: coords,
          detailedAddress: addressText
        }));
        setIsLocating(false);
        setShowInfoWindow(true);
      },
      (error) => {
        console.error('خطأ في تحديد الموقع:', error);
        setIsLocating(false);
        alert('لم نتمكن من تحديد موقعك. يمكنك النقر على الخريطة لتحديد الموقع يدوياً.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, []);

  // التعامل مع النقر على الخريطة
  const handleMapClick = useCallback((event) => {
    // Google Map API handles events internally, no need for stopPropagation
    
    try {
      const coords = {
        lat: event.detail.latLng.lat,
        lng: event.detail.latLng.lng
      };
      
      console.log('Map clicked at:', coords);
      
      setPosition(coords);
      const addressText = `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
      setSelectedAddress(addressText);
      setAddressData(prev => ({
        ...prev,
        coordinates: coords,
        detailedAddress: addressText
      }));
      setShowInfoWindow(true);
    } catch (error) {
      console.error('Error handling map click:', error);
    }
  }, []);

  // تأكيد العنوان
  const handleConfirm = () => {
    if (!addressData.title.trim()) {
      alert('⚠️ يرجى إدخال اسم للعنوان (مثل: المنزل، المكتب)');
      return;
    }

    const locationData = {
      title: addressData.title,
      address: addressData.detailedAddress,
      coordinates: addressData.coordinates,
      isDefault: false
    };

    console.log('📍 LocationPicker: Sending location data:', locationData);
    console.log('📍 LocationPicker: onLocationConfirm type:', typeof onLocationConfirm);

    if (typeof onLocationConfirm === 'function') {
      onLocationConfirm(locationData);
      console.log('✅ LocationPicker: Data sent successfully');
    } else {
      console.warn('⚠️ onLocationConfirm prop not passed or not a function');
    }
    onClose();
    
    // إعادة تعيين البيانات
    setAddressData({
      title: '',
      detailedAddress: '',
      coordinates: DEFAULT_CENTER
    });
    setPosition(DEFAULT_CENTER);
    setShowInfoWindow(false);
    setSelectedAddress('');
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div 
      className="location-picker-overlay" 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        overflowY: 'auto',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onMouseDown={(e) => {
        // إغلاق المودال فقط عند النقر على الخلفية الخارجية
        if (e.target === e.currentTarget) {
          e.preventDefault();
          onClose();
        }
      }}
    >
      <div 
        className="addressForm bg-white rounded-2xl shadow-2xl animate-slideUp"
        style={{ 
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          animation: 'slideUp 0.3s ease-out',
          position: 'relative',
          margin: 'auto',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto'
        }}
        onMouseDown={(e) => {
          // Prevent modal from closing when interacting with form
          e.stopPropagation();
        }}
        onClick={(e) => {
          // Prevent modal from closing when interacting with form
          e.stopPropagation();
        }}
      >
        {/* Header */}
        <div className="p-3 border-b border-gray-200" style={{ background: 'linear-gradient(135deg, var(--champagne-veil) 0%, #fff 100%)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'var(--glamour-gold)' }}>
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-base font-bold" style={{ color: 'var(--warm-brown)' }}>إضافة عنوان جديد</h2>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onClose();
              }}
              className="w-7 h-7 rounded-full hover:bg-red-50 border-none bg-transparent cursor-pointer flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>

        {/* Location Button */}
        <div className="p-3 border-b border-gray-200" style={{ background: 'var(--champagne-veil)' }}>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              getCurrentLocation();
            }}
            disabled={isLocating}
            className="flex items-center justify-center w-full px-4 py-2 text-white rounded-lg font-semibold shadow-md disabled:opacity-50 border-none cursor-pointer transition-all hover:shadow-lg text-sm"
            style={{ background: 'linear-gradient(135deg, var(--glamour-gold) 0%, var(--warm-brown) 100%)' }}
          >
            <Navigation className={`w-4 h-4 ml-2 ${isLocating ? 'animate-pulse' : ''}`} />
            {isLocating ? 'جاري التحديد...' : '📍 تحديد موقعي الحالي'}
          </button>
        </div>

        {/* Map Container - Fixed Height */}
        <div>
          <div 
            className="map-wrapper loaded"
            onClick={(e) => {
              // Prevent modal from closing when interacting with map
            }}
            onMouseDown={(e) => {
              // Prevent modal from closing when interacting with map
            }}
          >
            <div 
              className="address-form-google-map"
              style={{ userSelect: 'none', height: '200px' }}
            >
            {mapError ? (
              <div className="h-full bg-gray-100 flex items-center justify-center">
                <div className="text-center p-4">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium mb-2">لا يمكن تحميل الخريطة</p>
                  <p className="text-sm text-gray-500 mb-4">
                    يمكنك استخدام زر "تحديد موقعي الحالي" أو إدخال العنوان يدوياً
                  </p>
                  <Button
                    onClick={() => setMapError(false)}
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    إعادة المحاولة
                  </Button>
                </div>
              </div>
            ) : (
              <APIProvider 
                apiKey={API_KEY}
                onLoad={() => console.log('Google Maps API loaded successfully')}
                onError={(error) => {
                  console.error('Google Maps API error:', error);
                  setMapError(true);
                }}
              >
                <Map
                  zoom={DEFAULT_ZOOM}
                  center={position}
                  mapId={MAP_ID}
                  onClick={handleMapClick}
                  style={{ width: '100%', height: '100%' }}
                  gestureHandling="greedy"
                  disableDefaultUI={false}
                  zoomControl={true}
                  mapTypeControl={false}
                  streetViewControl={false}
                  fullscreenControl={false}
                  clickableIcons={false}
                  options={{
                    gestureHandling: 'greedy',
                    zoomControl: true,
                    mapTypeControl: false,
                    scaleControl: false,
                    streetViewControl: false,
                    rotateControl: false,
                    fullscreenControl: false,
                    clickableIcons: false,
                    keyboardShortcuts: false
                  }}
                >
                  <AdvancedMarker 
                    position={position} 
                    onClick={() => {
                      setShowInfoWindow(true);
                    }}
                    onDragEnd={(e) => {
                      const coords = {
                        lat: e.latLng.lat(),
                        lng: e.latLng.lng()
                      };
                      setPosition(coords);
                      const addressText = `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
                      setSelectedAddress(addressText);
                      setAddressData(prev => ({
                        ...prev,
                        coordinates: coords,
                        detailedAddress: addressText
                      }));
                    }}
                    draggable={true}
                  >
                    <Pin
                      background="#EF4444"
                      borderColor="#FFFFFF"
                      glyphColor="#FFFFFF"
                    />
                  </AdvancedMarker>

                  {showInfoWindow && (
                    <InfoWindow 
                      position={position} 
                      onCloseClick={() => setShowInfoWindow(false)}
                    >
                      <div className="p-2 text-sm">
                        <p className="font-semibold text-gray-800 mb-1">الموقع المحدد</p>
                        <p className="text-gray-600 text-xs">
                          {`${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`}
                        </p>
                      </div>
                    </InfoWindow>
                  )}
                </Map>
              </APIProvider>
            )}
          </div>

          {/* Location Button Overlay */}
          <button 
            id="getLocationBtn"
            onClick={(e) => {
              e.preventDefault();
              getCurrentLocation();
            }}
            disabled={isLocating}
            style={{ display: 'block' }}
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="88" height="96" viewBox="0 0 88 96" fill="none">
              <g filter="url(#filter0_d_1914_2427)">
                <rect x="24" y="20" width="48" height="48" rx="8" fill="white"></rect>
              </g>
              <path d="M53 44C53 46.7614 50.7614 49 48 49C45.2386 49 43 46.7614 43 44C43 41.2386 45.2386 39 48 39C50.7614 39 53 41.2386 53 44Z" fill={isLocating ? "#f97316" : "black"}></path>
              <path fillRule="evenodd" clipRule="evenodd" d="M49 34.0494V31H47V34.0494C42.2756 34.5184 38.5184 38.2756 38.0494 43H35V45H38.0494C38.5184 49.7244 42.2756 53.4816 47 53.9506V57H49V53.9506C53.7244 53.4816 57.4816 49.7244 57.9506 45H61V43H57.9506C57.4816 38.2756 53.7244 34.5184 49 34.0494ZM48 52C52.4183 52 56 48.4183 56 44C56 39.5817 52.4183 36 48 36C43.5817 36 40 39.5817 40 44C40 48.4183 43.5817 52 48 52Z" fill={isLocating ? "#f97316" : "black"}></path>
              <defs>
                <filter id="filter0_d_1914_2427" x="0" y="0" width="96" height="96" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                  <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
                  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"></feColorMatrix>
                  <feMorphology radius="10" operator="dilate" in="SourceAlpha" result="effect1_dropShadow_1914_2427"></feMorphology>
                  <feOffset dy="4"></feOffset>
                  <feGaussianBlur stdDeviation="7"></feGaussianBlur>
                  <feComposite in2="hardAlpha" operator="out"></feComposite>
                  <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0"></feColorMatrix>
                  <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1914_2427"></feBlend>
                  <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1914_2427" result="shape"></feBlend>
                </filter>
              </defs>
            </svg>
          </button>
        </div>

        </div>

        {/* Form Inputs - Always Visible Below Map */}
        <div className="p-3 space-y-2 bg-white">
          <div>
            <Label htmlFor="addressTitle" className="text-xs font-semibold mb-1 block" style={{ color: 'var(--warm-brown)' }}>
              اسم العنوان
            </Label>
            <Input
              id="addressTitle"
              required
              name="title"
              type="text"
              placeholder="مثال: المنزل، العمل، المكتب"
              value={addressData.title}
              onChange={(e) => setAddressData(prev => ({ ...prev, title: e.target.value }))}
              className="text-right h-9 text-sm"
            />
          </div>
          
          <div>
            <Label htmlFor="addressDescription" className="text-xs font-semibold mb-1 block" style={{ color: 'var(--warm-brown)' }}>
              وصف العنوان (اختياري)
            </Label>
            <Input
              id="addressDescription"
              name="internal_note"
              placeholder="مثال: بجانب المسجد، عمارة رقم 5"
              onChange={(e) => {
                if (e.target.value) {
                  setAddressData(prev => ({
                    ...prev,
                    detailedAddress: `${selectedAddress} - ${e.target.value}`
                  }));
                } else {
                  setAddressData(prev => ({
                    ...prev,
                    detailedAddress: selectedAddress
                  }));
                }
              }}
              className="text-right h-9 text-sm"
            />
          </div>

          {/* Selected Address Display */}
          {selectedAddress && (
            <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-1 mb-1">
                <MapPin className="w-3 h-3" style={{ color: 'var(--glamour-gold)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--warm-brown)' }}>
                  العنوان المختار
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-tight">{selectedAddress}</p>
            </div>
          )}
        </div>

        {/* Footer Button */}
        <div className="p-3 border-t border-gray-200" style={{ background: 'var(--champagne-veil)' }}>
          <button
            onClick={handleConfirm}
            disabled={!addressData.title.trim() || !selectedAddress}
            className="w-full py-2.5 text-sm font-bold rounded-lg text-white border-none cursor-pointer transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: !addressData.title.trim() || !selectedAddress 
                ? '#d1d5db' 
                : 'linear-gradient(135deg, var(--glamour-gold) 0%, var(--warm-brown) 100%)'
            }}
          >
            ✅ تأكيد العنوان
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LocationPicker;