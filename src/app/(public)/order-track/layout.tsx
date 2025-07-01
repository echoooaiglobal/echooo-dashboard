// src/app/(public)/order-track/layout.tsx
// Create this file to remove navbar for order tracking page

import React from 'react'

export default function OrderTrackLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full">
      {children}
    </div>
  )
}