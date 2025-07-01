// src/components/public/order-track/ResultsTable.tsx
// Simplified version with essential information only

import React from 'react'
import { ResultsTableProps, Order } from './types'
import { formatCurrency, formatDateTime } from './utils'
import Pagination from './Pagination'

export default function ResultsTable({ orders, pagination, activeSearch, onPageChange }: ResultsTableProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="p-6 pb-4 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900">
              Orders with code: <span className="text-blue-600">"{activeSearch}"</span>
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
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount & Discount code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
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

// Simplified Order Row Component
function OrderRow({ order }: { order: Order }) {
  return (
    <tr className="hover:bg-gray-50">
      {/* Order */}
      <td className="px-6 py-4">
        <div className="space-y-1">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-900">
              #{order.order_number}
            </span>
          </div>
        </div>
      </td>

      {/* Customer */}
      <td className="px-6 py-4">
        <div className="space-y-1">
          <div className="text-sm text-gray-600">
            {order.full_name}
          </div>
          <div className="text-xs text-gray-500 truncate max-w-xs">
            {order.email}
          </div>
        </div>
      </td>

      {/* Product */}
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900 max-w-xs truncate">
          {order.product_title}
        </div>
        <div className="text-xs text-gray-500">
          Qty: {order.quantity || 1}
        </div>
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <div className="space-y-1">
          <StatusBadge status={order.financial_status} type="financial" />
          <StatusBadge status={order.fulfillment_status} type="fulfillment" />
        </div>
      </td>

      {/* Discount code */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="space-y-1">
          <div className="text-sm font-medium text-gray-900">
            {formatCurrency(order.total_price)}
          </div>
          <div className="text-xs text-green-600">
            Code: {order.discount_code}
          </div>
        </div>
      </td>

      {/* Amount */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="space-y-1">
          {order.discount_amount > 0 && (
            <div className="text-xs text-green-600">
              -{formatCurrency(order.discount_amount)}
            </div>
          )}
        </div>
      </td>

      {/* Date */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {formatDateTime(order.order_created_at)}
        </div>
        {order.city && (
          <div className="text-xs text-gray-500">
            {order.city}
          </div>
        )}
      </td>
    </tr>
  )
}

// Simplified Status Badge Component
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

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status, type)}`}>
      {status || 'unknown'}
    </span>
  )
}