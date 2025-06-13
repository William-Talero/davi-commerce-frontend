import { apiClient, isBackendAvailable } from "./api"
import { toFrontendProduct, toFrontendUser, toFrontendOrder } from "./backend-types"
import type { Product, User, Order } from "./types"

// Product Management
export async function createProduct(
  product: Omit<Product, "id" | "created_at" | "updated_at">,
): Promise<Product | null> {
  const backendAvailable = await isBackendAvailable()
  
  if (backendAvailable) {
    try {
      const response = await apiClient.createProduct({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        stock: product.stock,
        imageUrl: product.image_url,
        lowStockThreshold: product.low_stock_threshold
      })
      
      if (response) {
        return toFrontendProduct(response)
      }
      
      return null
    } catch (error) {
      console.error("Backend createProduct failed:", error)
      return null
    }
  }

  console.warn("Backend not available for product creation")
  return null
}

export async function updateProduct(
  id: string,
  updates: Partial<Product>,
): Promise<Product | null> {
  const backendAvailable = await isBackendAvailable()
  
  if (backendAvailable) {
    try {
      const response = await apiClient.updateProduct(id, {
        name: updates.name,
        description: updates.description,
        price: updates.price,
        category: updates.category,
        stock: updates.stock,
        imageUrl: updates.image_url,
        lowStockThreshold: updates.low_stock_threshold
      })
      
      if (response) {
        return toFrontendProduct(response)
      }
      
      return null
    } catch (error) {
      console.error("Backend updateProduct failed:", error)
      return null
    }
  }

  console.warn("Backend not available for product update")
  return null
}

export async function deleteProduct(id: string): Promise<boolean> {
  const backendAvailable = await isBackendAvailable()
  
  if (backendAvailable) {
    try {
      await apiClient.deleteProduct(id)
      return true
    } catch (error) {
      console.error("Backend deleteProduct failed:", error)
      return false
    }
  }

  console.warn("Backend not available for product deletion")
  return false
}

// User Management
export async function getAllUsers(): Promise<User[]> {
  const backendAvailable = await isBackendAvailable()
  
  if (backendAvailable) {
    try {
      const response = await apiClient.getAllUsers()
      return response.map(toFrontendUser)
    } catch (error) {
      console.error("Backend getAllUsers failed:", error)
      return []
    }
  }

  console.warn("Backend not available for user management")
  return []
}

export async function updateUserRole(
  userId: string,
  role: "customer" | "admin",
): Promise<boolean> {
  const backendAvailable = await isBackendAvailable()
  
  if (backendAvailable) {
    try {
      await apiClient.updateUser(userId, { role })
      return true
    } catch (error) {
      console.error("Backend updateUserRole failed:", error)
      return false
    }
  }

  console.warn("Backend not available for user role update")
  return false
}

export async function deleteUser(userId: string): Promise<boolean> {
  const backendAvailable = await isBackendAvailable()
  
  if (backendAvailable) {
    try {
      await apiClient.deleteUser(userId)
      return true
    } catch (error) {
      console.error("Backend deleteUser failed:", error)
      return false
    }
  }

  console.warn("Backend not available for user deletion")
  return false
}

// Order Management
export async function getAllOrders(): Promise<Order[]> {
  const backendAvailable = await isBackendAvailable()
  
  if (backendAvailable) {
    try {
      const response = await apiClient.getAllOrders()
      return response.map(toFrontendOrder)
    } catch (error) {
      console.error("Backend getAllOrders failed:", error)
      return []
    }
  }

  console.warn("Backend not available for order management")
  return []
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
): Promise<boolean> {
  const backendAvailable = await isBackendAvailable()
  
  if (backendAvailable) {
    try {
      await apiClient.updateOrderStatus(orderId, status)
      return true
    } catch (error) {
      console.error("Backend updateOrderStatus failed:", error)
      return false
    }
  }

  console.warn("Backend not available for order status update")
  return false
}

// Analytics
export async function getLowStockProducts(): Promise<Product[]> {
  const backendAvailable = await isBackendAvailable()
  
  if (backendAvailable) {
    try {
      const response = await apiClient.getLowStockProducts()
      return response.map(toFrontendProduct)
    } catch (error) {
      console.error("Backend getLowStockProducts failed:", error)
      return []
    }
  }

  console.warn("Backend not available for low stock products")
  return []
}