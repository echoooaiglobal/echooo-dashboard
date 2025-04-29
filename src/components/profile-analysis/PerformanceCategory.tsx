// src/components/profile-analysis/PerformanceCategory.tsx
import React from 'react';
import MetricDisplay from './MetricDisplay';

interface PerformanceCategoryProps {
  title: string;
  variant: 'success' | 'info' | 'warning';
  data: {
    shortcodes?: string[];
    qualitative?: {
      themes?: string[];
      emotional_tones?: string[];
      storytelling_styles?: string[];
      [key: string]: any;
    };
    quantitative?: {
      [key: string]: any;
    };
  };
  icon: React.ReactNode;
}

export default function PerformanceCategory({
  title,
  variant,
  data,
  icon
}: PerformanceCategoryProps) {
  // Map variant to color classes
  const colorMap = {
    success: 'border-green-500 text-green-600',
    info: 'border-blue-500 text-blue-600',
    warning: 'border-orange-500 text-orange-600'
  };
  
  return (
    <div className={`bg-white rounded-lg p-5 shadow-sm border-l-4 ${colorMap[variant]}`}>
      <div className="flex items-center mb-3">
        {icon}
        <h4 className="font-medium">{title}</h4>
      </div>
      
      {data?.shortcodes && data.shortcodes.length > 0 && (
        <div className="text-xs bg-gray-50 p-2 rounded mb-3">
          {data.shortcodes.map((code: string, index: number) => (
            <a 
              key={code}
              href={`https://www.instagram.com/p/${code}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-block px-2 py-1 rounded mr-2 mb-1 ${
                variant === 'success' ? 'bg-green-100 text-green-800' : 
                variant === 'info' ? 'bg-blue-100 text-blue-800' : 
                'bg-orange-100 text-orange-800'
              }`}
            >
              #{index + 1}
            </a>
          ))}
        </div>
      )}
      
      <div className="text-sm text-gray-600">
        {data?.qualitative?.themes && (
          <MetricDisplay 
            label="Key Themes" 
            value={data.qualitative.themes} 
            variant={variant} 
          />
        )}
        
        {data?.qualitative?.emotional_tones && (
          <MetricDisplay 
            label="Emotional Tone" 
            value={data.qualitative.emotional_tones} 
            variant={variant} 
          />
        )}
        
        {data?.qualitative?.storytelling_styles && (
          <MetricDisplay 
            label="Storytelling Style" 
            value={data.qualitative.storytelling_styles} 
            variant={variant} 
          />
        )}
      </div>
    </div>
  );
}