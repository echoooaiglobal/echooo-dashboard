// src/components/ui/LoadingSpinner.tsx
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  fullScreen?: boolean;
  message?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'purple',
  fullScreen = false,
  message
}: LoadingSpinnerProps) {
  // Size mapping
  const sizeMap = {
    sm: 'h-6 w-6 border-2',
    md: 'h-12 w-12 border-2',
    lg: 'h-16 w-16 border-3',
  };

  // Color mapping
  const colorMap: Record<string, string> = {
    purple: 'border-purple-500',
    blue: 'border-blue-500',
    indigo: 'border-indigo-500',
    pink: 'border-pink-500',
    green: 'border-green-500',
  };

  const spinnerSize = sizeMap[size];
  const spinnerColor = colorMap[color] || 'border-purple-500';

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
        <div className="text-center">
          <div className={`animate-spin rounded-full ${spinnerSize} border-t-transparent ${spinnerColor} mx-auto`}></div>
          {message && <p className="mt-4 text-gray-600">{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`animate-spin rounded-full ${spinnerSize} border-t-transparent ${spinnerColor}`}></div>
      {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
    </div>
  );
}