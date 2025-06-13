export interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
  stock: number
  low_stock_threshold?: number
  created_at?: string
  updated_at?: string
}

export interface CartItem extends Product {
  quantity: number
}

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  role?: "customer" | "admin"
  created_at?: string
  updated_at?: string
}

export interface Order {
  id: string
  user_id: string
  total_amount: number
  status: string
  shipping_address: any
  created_at: string
  updated_at: string
  user?: {
    first_name: string
    last_name: string
    email: string
  }
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  created_at: string
  product?: {
    name: string
    image_url: string
  }
}
