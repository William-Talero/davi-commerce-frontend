// Types specifically for backend integration
// These match the backend entity structure

export interface BackendProduct {
  id: string
  name: string
  description: string
  price: number | string
  imageUrl: string
  category: string
  stock: number
  lowStockThreshold?: number
  createdAt?: string
  updatedAt?: string
}

export interface BackendUser {
  id: string
  email: string
  firstName: string
  lastName: string
  passwordHash?: string
  role?: "customer" | "admin"
  createdAt?: string
  updatedAt?: string
}

export interface BackendOrder {
  id: string
  userId: string
  totalAmount: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  shippingAddress: string
  notes?: string
  items?: BackendOrderItem[]
  createdAt: string
  updatedAt: string
  user?: {
    firstName: string
    lastName: string
    email: string
  }
}

export interface BackendOrderItem {
  id: string
  orderId: string
  productId: string
  productName: string
  quantity: number
  price: number
  createdAt: string
  product?: {
    name: string
    imageUrl: string
  }
}

// Request/Response types for API
export interface CreateOrderRequest {
  items: {
    productId: string
    quantity: number
    price?: number  // Optional, will use product price if not provided
  }[]
  shippingAddress: string
  notes?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: BackendUser
  accessToken: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface CreateProductRequest {
  name: string
  description: string
  price: number
  imageUrl?: string
  category?: string
  stock: number
}

export interface UpdateProductRequest {
  name?: string
  description?: string
  price?: number
  imageUrl?: string
  category?: string
  stock?: number
}

export interface UpdateUserRequest {
  email?: string
  firstName?: string
  lastName?: string
  role?: "customer" | "admin"
}

export interface UpdateOrderRequest {
  status?: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  shippingAddress?: string
  notes?: string
}

// Utility functions to convert between frontend and backend types
export function toFrontendProduct(backendProduct: BackendProduct): import('./types').Product {
  return {
    id: backendProduct.id,
    name: backendProduct.name,
    description: backendProduct.description,
    price: typeof backendProduct.price === 'string' ? parseFloat(backendProduct.price) : backendProduct.price,
    image_url: backendProduct.imageUrl,
    category: backendProduct.category,
    stock: backendProduct.stock,
    low_stock_threshold: backendProduct.lowStockThreshold,
    created_at: backendProduct.createdAt,
    updated_at: backendProduct.updatedAt,
  }
}

export function toBackendProduct(frontendProduct: import('./types').Product): BackendProduct {
  return {
    id: frontendProduct.id,
    name: frontendProduct.name,
    description: frontendProduct.description,
    price: frontendProduct.price,
    imageUrl: frontendProduct.image_url,
    category: frontendProduct.category,
    stock: frontendProduct.stock,
    lowStockThreshold: frontendProduct.low_stock_threshold,
    createdAt: frontendProduct.created_at,
    updatedAt: frontendProduct.updated_at,
  }
}

export function toFrontendUser(backendUser: BackendUser): import('./types').User {
  return {
    id: backendUser.id,
    email: backendUser.email,
    first_name: backendUser.firstName,
    last_name: backendUser.lastName,
    role: backendUser.role,
    created_at: backendUser.createdAt,
    updated_at: backendUser.updatedAt,
  }
}

export function toBackendUser(frontendUser: import('./types').User): BackendUser {
  return {
    id: frontendUser.id,
    email: frontendUser.email,
    firstName: frontendUser.first_name,
    lastName: frontendUser.last_name,
    role: frontendUser.role,
    createdAt: frontendUser.created_at,
    updatedAt: frontendUser.updated_at,
  }
}

export function toFrontendOrder(backendOrder: BackendOrder): import('./types').Order {
  return {
    id: backendOrder.id,
    user_id: backendOrder.userId,
    total_amount: backendOrder.totalAmount,
    status: backendOrder.status,
    shipping_address: backendOrder.shippingAddress,
    created_at: backendOrder.createdAt,
    updated_at: backendOrder.updatedAt,
    user: backendOrder.user ? {
      first_name: backendOrder.user.firstName,
      last_name: backendOrder.user.lastName,
      email: backendOrder.user.email,
    } : undefined,
  }
}

export function toFrontendOrderItem(backendOrderItem: BackendOrderItem): import('./types').OrderItem {
  return {
    id: backendOrderItem.id,
    order_id: backendOrderItem.orderId,
    product_id: backendOrderItem.productId,
    quantity: backendOrderItem.quantity,
    price: backendOrderItem.price,
    created_at: backendOrderItem.createdAt,
    product: backendOrderItem.product ? {
      name: backendOrderItem.product.name,
      image_url: backendOrderItem.product.imageUrl,
    } : undefined,
  }
}