// src/lib/orderApi.ts
// Simple API service to connect your existing frontend to the backend

const API_BASE_URL = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL_DEV || 'http://localhost:8000'

interface BackendOrder {
  id: string
  shopify_order_id: string
  order_number: string
  customer_email: string
  customer_phone?: string
  customer_first_name?: string
  customer_last_name?: string
  total_price?: number
  subtotal_price?: number
  total_discounts?: number
  shipping_price?: number
  currency: string
  discount_codes?: Array<{ code: string; amount: string; type: string }>
  financial_status?: string
  fulfillment_status?: string
  shipping_address?: any
  billing_address?: any
  created_at: string
  order_items?: Array<{ product_title: string }>
}

interface BackendResponse {
  orders: BackendOrder[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

// Transform backend order to match your existing Order type
function transformOrder(backendOrder: BackendOrder): any {
  const discountCode = backendOrder.discount_codes?.[0]?.code || ''
  const discountAmount = backendOrder.total_discounts || 0
  const subtotal = backendOrder.subtotal_price || 0
  const discountPercentage = subtotal > 0 ? (discountAmount / subtotal) * 100 : 0
  
  const firstName = backendOrder.customer_first_name || ''
  const lastName = backendOrder.customer_last_name || ''
  const fullName = `${firstName} ${lastName}`.trim() || 'Unknown Customer'
  
  const address = backendOrder.shipping_address || backendOrder.billing_address
  const productTitle = backendOrder.order_items?.[0]?.product_title || 'Product Information Not Available'

  return {
    id: parseInt(backendOrder.id),
    shopify_order_id: backendOrder.shopify_order_id,
    order_number: backendOrder.order_number,
    email: backendOrder.customer_email,
    mobile_phone: backendOrder.customer_phone || address?.phone,
    first_name: firstName,
    last_name: lastName,
    full_name: fullName,
    country: address?.country,
    address_line1: address?.address1,
    address_line2: address?.address2,
    city: address?.city,
    postal_code: address?.zip,
    payment_method: 'Card Payment',
    product_title: productTitle,
    subtotal_price: backendOrder.subtotal_price || 0,
    shipping_method: 'Standard',
    shipping_price: backendOrder.shipping_price || 0,
    total_price: backendOrder.total_price || 0,
    currency: backendOrder.currency,
    discount_code: discountCode,
    discount_amount: discountAmount,
    discount_percentage: discountPercentage,
    financial_status: backendOrder.financial_status || 'unknown',
    fulfillment_status: backendOrder.fulfillment_status || 'unfulfilled',
    notes: '',
    source_name: 'online_store',
    order_created_at: backendOrder.created_at,
    created_at: backendOrder.created_at,
    updated_at: backendOrder.created_at
  }
}

// Search orders by discount code - connects to your backend
export async function searchOrdersByDiscountCode(discountCode: string): Promise<any[]> {
  try {
    console.log('🔍 Searching for discount code:', discountCode)
    
    const response = await fetch(
      `${API_BASE_URL}/api/v0/orders/discount/${encodeURIComponent(discountCode)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        return [] // No orders found
      }
      throw new Error(`API Error: ${response.status}`)
    }

    const data: BackendResponse = await response.json()
    console.log('✅ Found orders:', data.total)
    
    // Transform backend orders to match your frontend format
    return data.orders.map(transformOrder)
    
  } catch (error) {
    console.error('❌ Error searching orders:', error)
    throw error
  }
}