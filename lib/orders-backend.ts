import { apiClient, isBackendAvailable } from "./api"
import { toFrontendOrder, toFrontendOrderItem } from "./backend-types"
import type { Order, OrderItem, CartItem } from "./types"
import type { CreateOrderRequest, UpdateOrderRequest } from "./backend-types"

// Function to refresh products after order creation
let refreshProductsCallback: (() => Promise<void>) | null = null

export function setRefreshProductsCallback(callback: () => Promise<void>) {
  refreshProductsCallback = callback
}

export async function createOrder(userId: string, items: CartItem[], shippingAddress: any): Promise<Order | null> {
  const backendAvailable = await isBackendAvailable()
  
  if (backendAvailable) {
    try {
      // Refresh token from localStorage in case it was updated
      apiClient.refreshTokenFromStorage()
      
      // Check if we have a valid token for authentication
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      const apiToken = apiClient.getToken()
      
      // If we have a token but it's different, sync them
      if (token && !apiToken) {
        apiClient.setToken(token)
      }
      
      if (!token && !apiToken) {
        // Create mock order when no token is available
        const totalAmount = items.reduce((sum, item) => {
          const price = typeof item.price === 'number' ? item.price : parseFloat(item.price || '0')
          return sum + price * item.quantity
        }, 0)
        
        return {
          id: `mock-order-${Date.now()}`,
          user_id: userId,
          total_amount: totalAmount,
          status: "pending",
          shipping_address: shippingAddress,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      }

      // Prepare order data for backend
      const orderData: CreateOrderRequest = {
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: typeof item.price === 'number' ? item.price : parseFloat(item.price || '0'),
        })),
        shippingAddress: typeof shippingAddress === 'string' ? shippingAddress : JSON.stringify(shippingAddress),
        notes: "Orden creada desde el frontend", // Add required notes field
      }

      const response = await apiClient.createOrder(orderData)
      
      if (response) {
        // Refresh products to get updated stock
        if (refreshProductsCallback) {
          refreshProductsCallback()
        }
        
        return toFrontendOrder(response)
      }
      
      return null
    } catch (error) {
      console.warn("Backend createOrder failed:", error)
      
      // Fallback to mock order for demo purposes
      const totalAmount = items.reduce((sum, item) => {
        const price = typeof item.price === 'number' ? item.price : parseFloat(item.price || '0')
        return sum + price * item.quantity
      }, 0)
      
      return {
        id: `fallback-order-${Date.now()}`,
        user_id: userId,
        total_amount: totalAmount,
        status: "pending",
        shipping_address: shippingAddress,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }
  }

  // Fallback when backend is not available
  const totalAmount = items.reduce((sum, item) => {
    const price = typeof item.price === 'number' ? item.price : parseFloat(item.price || '0')
    return sum + price * item.quantity
  }, 0)

  return {
    id: `offline-order-${Date.now()}`,
    user_id: userId,
    total_amount: totalAmount,
    status: "pending",
    shipping_address: shippingAddress,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const backendAvailable = await isBackendAvailable()
  
  if (backendAvailable) {
    try {
      const response = await apiClient.getOrders(userId)
      
      if (response && Array.isArray(response)) {
        // Backend returns orders filtered by user
        return response.map(toFrontendOrder)
      }
      
      return []
    } catch (error) {
      console.warn("Backend getUserOrders failed:", error)
      return []
    }
  }

  // Fallback when backend is not available
  console.warn("Backend not available for orders")
  return []
}

export async function getAllOrders(): Promise<Order[]> {
  const backendAvailable = await isBackendAvailable()
  
  if (backendAvailable) {
    try {
      const response = await apiClient.getOrders()
      
      if (response && Array.isArray(response)) {
        return response.map(toFrontendOrder)
      }
      
      return []
    } catch (error) {
      console.warn("Backend getAllOrders failed:", error)
      return []
    }
  }

  // Fallback when backend is not available
  console.warn("Backend not available for orders")
  return []
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const backendAvailable = await isBackendAvailable()
  
  if (backendAvailable) {
    try {
      const response = await apiClient.getOrderById(orderId)
      
      if (response) {
        return toFrontendOrder(response)
      }
      
      return null
    } catch (error) {
      console.warn("Backend getOrderById failed:", error)
      return null
    }
  }

  // Fallback when backend is not available
  console.warn("Backend not available for order details")
  return null
}

export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  const backendAvailable = await isBackendAvailable()
  
  if (backendAvailable) {
    try {
      // The backend should return order items as part of the order details
      const order = await apiClient.getOrderById(orderId)
      
      if (order && order.items) {
        return order.items.map(toFrontendOrderItem)
      }
      
      return []
    } catch (error) {
      console.warn("Backend getOrderItems failed:", error)
      return []
    }
  }

  // Fallback when backend is not available
  console.warn("Backend not available for order items")
  return []
}

export async function updateOrderStatus(orderId: string, status: string): Promise<boolean> {
  const backendAvailable = await isBackendAvailable()
  
  if (backendAvailable) {
    try {
      const updateData: UpdateOrderRequest = {
        status: status as any, // Cast to the specific status type
      }
      
      await apiClient.updateOrder(orderId, updateData)
      return true
    } catch (error) {
      console.warn("Backend updateOrderStatus failed:", error)
      return false
    }
  }

  // No fallback for updates when backend is not available
  console.warn("Backend not available for order status update")
  return false
}

export async function updateOrder(orderId: string, updates: UpdateOrderRequest): Promise<Order | null> {
  const backendAvailable = await isBackendAvailable()
  
  if (backendAvailable) {
    try {
      const response = await apiClient.updateOrder(orderId, updates)
      
      if (response) {
        return toFrontendOrder(response)
      }
      
      return null
    } catch (error) {
      console.warn("Backend updateOrder failed:", error)
      return null
    }
  }

  // No fallback for updates when backend is not available
  console.warn("Backend not available for order update")
  return null
}

export async function deleteOrder(orderId: string): Promise<boolean> {
  const backendAvailable = await isBackendAvailable()
  
  if (backendAvailable) {
    try {
      await apiClient.deleteOrder(orderId)
      return true
    } catch (error) {
      console.warn("Backend deleteOrder failed:", error)
      return false
    }
  }

  // No fallback for deletion when backend is not available
  console.warn("Backend not available for order deletion")
  return false
}

// Helper function to cancel an order (change status to cancelled)
export async function cancelOrder(orderId: string): Promise<boolean> {
  return updateOrderStatus(orderId, "cancelled")
}