// src/components/public/order-track/types.ts

export interface Order {
  quantity: number
  id: number
  shopify_order_id: string
  order_number: string
  email: string
  mobile_phone?: string
  first_name: string
  last_name: string
  full_name: string
  country?: string
  address_line1?: string
  address_line2?: string
  city?: string
  postal_code?: string
  payment_method: string
  product_title: string
  subtotal_price: number
  shipping_method: string
  shipping_price: number
  total_price: number
  currency: string
  discount_code: string
  discount_amount: number
  discount_percentage: number
  financial_status: string
  fulfillment_status: string
  notes?: string
  source_name: string
  order_created_at: string
  created_at: string
  updated_at: string
}

export interface Pagination {
  currentPage: number
  totalPages: number
  totalRecords: number
  hasNext: boolean
  hasPrev: boolean
}

export interface SearchSectionProps {
  onSearch: (discountCode: string) => void
  onClear: () => void
  isLoading: boolean
  searchQuery: string
}

export interface ResultsTableProps {
  orders: Order[]
  pagination: Pagination
  activeSearch: string
  onPageChange: (page: number) => void
}

export interface HelpSectionProps {
  onExampleSearch: (code: string) => void
}