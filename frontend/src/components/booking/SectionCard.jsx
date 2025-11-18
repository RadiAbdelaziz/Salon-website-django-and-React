import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

const SectionCard = ({ 
  number, 
  title, 
  isExpanded, 
  isEnabled, 
  onToggle, 
  children,
  preview,
  icon: Icon
}) => (
  <Card className="overflow-hidden">
    <CardHeader 
      className="cursor-pointer"
      onClick={isEnabled ? onToggle : undefined}
      style={{ 
        background: isEnabled ? 'var(--champagne-veil)' : '#f5f5f5',
        opacity: isEnabled ? 1 : 0.5
      }}
      role="button"
      tabIndex={isEnabled ? 0 : -1}
      aria-expanded={isExpanded}
      aria-disabled={!isEnabled}
      onKeyDown={(e) => {
        if (isEnabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center">
          <span 
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ml-3"
            style={{ background: isEnabled ? 'var(--glamour-gold)' : '#ccc' }}
          >
            {Icon ? <Icon className="w-4 h-4" /> : number}
          </span>
          {title}
        </CardTitle>
        <ArrowRight 
          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
        />
      </div>
      {!isExpanded && preview && (
        <div className="mt-4">{preview}</div>
      )}
    </CardHeader>
    {isExpanded && isEnabled && (
      <CardContent className="p-6">
        {children}
      </CardContent>
    )}
  </Card>
);

export default SectionCard;
