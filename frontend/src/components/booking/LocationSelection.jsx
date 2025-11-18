/**
 * Location Selection Component
 * Handles address selection in the booking flow
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import LocationPicker from '../LocationPicker';

const LocationSelection = ({ 
  addresses, 
  selectedAddress, 
  onAddressSelect,
  onAddressDelete,
  onLocationPickerOpen,
  showLocationPicker,
  onLocationPickerClose,
  onLocationConfirm 
}) => {
  console.log('📍 LocationSelection: Received addresses:', addresses);
  console.log('📍 LocationSelection: Selected address:', selectedAddress);
  console.log('📍 LocationSelection: onLocationConfirm type:', typeof onLocationConfirm);
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--warm-brown)' }}>
          اختيار العنوان
        </h3>
        <p className="text-sm" style={{ color: 'var(--medium-beige)' }}>
          اختاري العنوان أو أضيفي عنوان جديد
        </p>
      </div>

      <div className="space-y-4">
        {addresses.map((address) => (
          <Card 
            key={address.id}
            className={`cursor-pointer transition-all duration-300 ${
              selectedAddress?.id === address.id ? 'ring-2 ring-yellow-400' : ''
            }`}
            onClick={() => onAddressSelect(address)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 space-x-reverse flex-1">
                  <MapPin className="w-5 h-5" style={{ color: 'var(--glamour-gold)' }} />
                  <div className="flex-1">
                    <h4 className="font-semibold" style={{ color: 'var(--warm-brown)' }}>
                      {address.title}
                    </h4>
                    <p className="text-sm opacity-80" style={{ color: 'var(--warm-brown)' }}>
                      {address.address}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {address.isDefault && (
                    <Badge style={{ background: 'var(--glamour-gold)', color: 'white' }}>
                      افتراضي
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => onAddressDelete(address.id, e)}
                    className="p-2 hover:bg-red-50"
                    aria-label="حذف العنوان"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          variant="outline"
          onClick={onLocationPickerOpen}
          className="w-full py-3"
          style={{ borderColor: 'var(--glamour-gold)', color: 'var(--glamour-gold)' }}
        >
          <Plus className="w-4 h-4 ml-2" />
          إضافة عنوان جديد
        </Button>
      </div>

      {showLocationPicker && (
        <LocationPicker
          isOpen={showLocationPicker}
          onClose={onLocationPickerClose}
          onLocationConfirm={onLocationConfirm}
        />
      )}
    </div>
  );
};

export default LocationSelection;
