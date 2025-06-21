// src/components/public/order-track/HelpSection.tsx
import React from 'react'
import { HelpSectionProps } from './types'

export default function HelpSection({ onExampleSearch }: HelpSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm max-w-4xl mx-auto">
      <div className="p-6 pt-0">
        <div className="p-8">
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">How to Track Your Order</h3>
            <p className="text-gray-600">
              Use your discount code to find and track your order details
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">1. Enter Discount Code</h4>
              <p className="text-sm text-gray-600">Type the discount code you used when placing your order</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">2. View Order Details</h4>
              <p className="text-sm text-gray-600">See your complete order information and current status</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">3. Track Shipping</h4>
              <p className="text-sm text-gray-600">Monitor payment status and shipping progress</p>
            </div>
          </div>

          {/* Example codes section */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="text-center">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Try these example discount codes:</h4>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => onExampleSearch('SAVE20')}
                  className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                >
                  SAVE20
                </button>
                <button
                  onClick={() => onExampleSearch('WELCOME10')}
                  className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm hover:bg-green-200 transition-colors"
                >
                  WELCOME10
                </button>
                <button
                  onClick={() => onExampleSearch('FLASH50')}
                  className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg text-sm hover:bg-purple-200 transition-colors"
                >
                  FLASH50
                </button>
                <button
                  onClick={() => onExampleSearch('STUDENT15')}
                  className="px-4 py-2 bg-orange-100 text-orange-800 rounded-lg text-sm hover:bg-orange-200 transition-colors"
                >
                  STUDENT15
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Click on any example code to test the order tracking system
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}