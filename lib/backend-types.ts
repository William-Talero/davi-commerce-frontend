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
  // Parse shipping address if it's a JSON string
  let parsedShippingAddress
  try {
    if (typeof backendOrder.shippingAddress === 'string') {
      parsedShippingAddress = JSON.parse(backendOrder.shippingAddress)
    } else {
      parsedShippingAddress = backendOrder.shippingAddress
    }
  } catch (error) {
    console.warn('Failed to parse shipping address:', error)
    parsedShippingAddress = {
      first_name: '',
      last_name: '',
      address: backendOrder.shippingAddress || '',
      city: '',
      state: '',
      zip_code: '',
      country: ''
    }
  }

  // Convert field names from frontend format to expected format
  if (parsedShippingAddress && typeof parsedShippingAddress === 'object') {
    // Special case: Check if the real data is in the 'street' field as JSON string
    if (parsedShippingAddress.street && typeof parsedShippingAddress.street === 'string') {
      try {
        const streetData = JSON.parse(parsedShippingAddress.street)
        parsedShippingAddress = {
          first_name: streetData.firstName || streetData.first_name || '',
          last_name: streetData.lastName || streetData.last_name || '',
          address: streetData.address || '',
          city: streetData.city || '',
          state: streetData.state || '',
          zip_code: streetData.zipCode || streetData.zip_code || '',
          country: streetData.country || ''
        }
      } catch (streetError) {
        console.warn('Failed to parse street field as JSON:', streetError)
        // Fallback to using street as address
        parsedShippingAddress = {
          first_name: '',
          last_name: '',
          address: parsedShippingAddress.street,
          city: parsedShippingAddress.city || '',
          state: parsedShippingAddress.state || '',
          zip_code: parsedShippingAddress.zipCode || parsedShippingAddress.zip_code || '',
          country: parsedShippingAddress.country || ''
        }
      }
    }
    // Handle both formats: frontend (firstName) and backend (first_name)
    else if (parsedShippingAddress.firstName && !parsedShippingAddress.first_name) {
      parsedShippingAddress = {
        first_name: parsedShippingAddress.firstName,
        last_name: parsedShippingAddress.lastName,
        address: parsedShippingAddress.address,
        city: parsedShippingAddress.city,
        state: parsedShippingAddress.state || '',
        zip_code: parsedShippingAddress.zipCode,
        country: parsedShippingAddress.country || ''
      }
    }
  }

  return {
    id: backendOrder.id,
    user_id: backendOrder.userId,
    total_amount: backendOrder.totalAmount,
    status: backendOrder.status,
    shipping_address: parsedShippingAddress,
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