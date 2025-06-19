// src/components/public/order-track/ResultsTable.tsx
import React from 'react'
import { ResultsTableProps, Order } from './types'
import { formatCurrency, formatDateTime, formatPhoneNumber } from './utils'
import Pagination from './Pagination'

export default function ResultsTable({ orders, pagination, activeSearch, onPageChange }: ResultsTableProps) {
  // Calculate summary statistics
  const totalRevenue = orders.reduce((sum, order) => sum + order.total_price, 0)
  const totalDiscount = orders.reduce((sum, order) => sum + order.discount_amount, 0)
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header with Summary Stats */}
      <div className="p-6 pb-4 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900">
              Orders found with code: <span className="text-blue-600">"{activeSearch}"</span>
            </h3>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
              {pagination.totalRecords} order{pagination.totalRecords !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>

      </div>

      <div className="p-6 pt-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product & Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pricing & Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="pt-6 border-t border-gray-200">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// Order Row Component
function OrderRow({ order }: { order: Order }) {
  const getPaymentIcon = (paymentMethod: string) => {
    if (paymentMethod && paymentMethod.toLowerCase().includes('credit')) {
      return (
        <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      )
    } else if (paymentMethod && paymentMethod.toLowerCase().includes('paypal')) {
      return (
        <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    }
    return (
      <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  }

  return (
    <tr className="hover:bg-gray-50">
      {/* Order Details */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="space-y-1">
          <div className="flex items-center">
            <svg className="h-4 w-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="text-sm font-medium text-gray-900">
              #{order.order_number}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            ID: {order.shopify_order_id}
          </div>
          <div className="flex items-center">
            {getPaymentIcon(order.payment_method)}
            <span className="text-xs text-gray-600 ml-2">
              {order.payment_method}
            </span>
          </div>
        </div>
      </td>

      {/* Customer Info */}
      <td className="px-6 py-4">
        <div className="space-y-1">
          <div className="flex items-center">
            <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-sm font-medium text-gray-900">
              {order.full_name}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <svg className="h-3 w-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="truncate max-w-xs">{order.email}</span>
          </div>
          {order.mobile_phone && (
            <div className="flex items-center text-sm text-gray-600">
              <svg className="h-3 w-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{formatPhoneNumber(order.mobile_phone)}</span>
            </div>
          )}
          {(order.city || order.country) && (
            <div className="flex items-center text-xs text-gray-500">
              <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate max-w-xs">
                {[order.city, order.country].filter(Boolean).join(', ')}
              </span>
            </div>
          )}
        </div>
      </td>

      {/* Product & Status */}
      <td className="px-6 py-4">
        <div className="space-y-2">
          <div className="flex items-start">
            <svg className="h-4 w-4 text-gray-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="text-sm text-gray-900 max-w-xs truncate">
              {order.product_title}
            </span>
          </div>
          <div className="space-y-1">
            <StatusBadge status={order.financial_status} type="financial" />
            <StatusBadge status={order.fulfillment_status} type="fulfillment" />
          </div>
          <div className="text-xs text-gray-500">
            Shipping: {order.shipping_method}
          </div>
        </div>
      </td>

      {/* Pricing & Discount */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="space-y-1">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {order.discount_code}
          </span>
          {order.discount_amount > 0 && (
            <div className="text-xs text-green-600 font-medium">
              -{formatCurrency(order.discount_amount)} ({order.discount_percentage}% off)
            </div>
          )}
          <div className="text-sm text-gray-900">
            <span className="font-medium">{formatCurrency(order.total_price)}</span>
          </div>
          <div className="text-xs text-gray-500">
            Subtotal: {formatCurrency(order.subtotal_price)}
            {order.shipping_price > 0 && (
              <span> + {formatCurrency(order.shipping_price)} shipping</span>
            )}
          </div>
        </div>
      </td>

      {/* Order Date */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="space-y-1">
          <div className="flex items-center text-sm text-gray-900">
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDateTime(order.order_created_at)}</span>
          </div>
          {order.address_line1 && (
            <div className="text-xs text-gray-500 max-w-xs truncate">
              {order.address_line1}
            </div>
          )}
          {order.postal_code && (
            <div className="text-xs text-gray-500">
              {order.postal_code}
            </div>
          )}
        </div>
      </td>
    </tr>
  )
}

// Status Badge Component
function StatusBadge({ status, type }: { status: string; type: 'financial' | 'fulfillment' }) {
  const getStatusColor = (status: string, type: string) => {
    if (type === 'financial') {
      switch (status?.toLowerCase()) {
        case 'paid':
          return 'bg-green-100 text-green-800'
        case 'pending':
          return 'bg-yellow-100 text-yellow-800'
        case 'cancelled':
        case 'failed':
          return 'bg-red-100 text-red-800'
        case 'refunded':
          return 'bg-gray-100 text-gray-800'
        default:
          return 'bg-gray-100 text-gray-800'
      }
    } else {
      switch (status?.toLowerCase()) {
        case 'delivered':
        case 'shipped':
          return 'bg-green-100 text-green-800'
        case 'processing':
          return 'bg-blue-100 text-blue-800'
        case 'unfulfilled':
          return 'bg-yellow-100 text-yellow-800'
        case 'cancelled':
          return 'bg-red-100 text-red-800'
        default:
          return 'bg-gray-100 text-gray-800'
      }
    }
  }

  const getStatusIcon = (status: string, type: string) => {
    if (type === 'financial') {
      switch (status?.toLowerCase()) {
        case 'paid':
          return (
            <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )
        case 'pending':
          return (
            <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        default:
          return null
      }
    } else {
      switch (status?.toLowerCase()) {
        case 'delivered':
          return (
            <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )
        case 'shipped':
          return (
            <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          )
        case 'processing':
          return (
            <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        default:
          return null
      }
    }
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status, type)}`}>
      {getStatusIcon(status, type)}
      {status || 'unknown'}
    </span>
  )
}