import { apiClient, isBackendAvailable } from "./api"
import { toFrontendProduct, toBackendProduct } from "./backend-types"
import type { Product } from "./types"
import type { CreateProductRequest, UpdateProductRequest } from "./backend-types"

// Fallback mock data when backend is not available
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Wireless Bluetooth Headphones",
    description: "High-quality wireless headphones with noise cancellation",
    price: 99.99,
    image_url: "/placeholder.svg?height=400&width=400",
    category: "Electronics",
    stock: 15,
  },
  {
    id: "2",
    name: "Smart Fitness Watch",
    description: "Track your fitness goals with this advanced smartwatch",
    price: 199.99,
    image_url: "/placeholder.svg?height=400&width=400",
    category: "Electronics",
    stock: 8,
  },
  {
    id: "3",
    name: "Organic Cotton T-Shirt",
    description: "Comfortable and sustainable organic cotton t-shirt",
    price: 29.99,
    image_url: "/placeholder.svg?height=400&width=400",
    category: "Clothing",
    stock: 25,
  },
  {
    id: "4",
    name: "Professional Camera Lens",
    description: "50mm f/1.8 lens perfect for portrait photography",
    price: 299.99,
    image_url: "/placeholder.svg?height=400&width=400",
    category: "Electronics",
    stock: 5,
  },
  {
    id: "5",
    name: "Yoga Mat Premium",
    description: "Non-slip yoga mat made from eco-friendly materials",
    price: 49.99,
    image_url: "/placeholder.svg?height=400&width=400",
    category: "Sports",
    stock: 12,
  },
  {
    id: "6",
    name: "Coffee Maker Deluxe",
    description: "Programmable coffee maker with built-in grinder",
    price: 149.99,
    image_url: "/placeholder.svg?height=400&width=400",
    category: "Home & Garden",
    stock: 7,
  },
  {
    id: "7",
    name: "Running Shoes",
    description: "Lightweight running shoes with superior cushioning",
    price: 89.99,
    image_url: "/placeholder.svg?height=400&width=400",
    category: "Sports",
    stock: 18,
  },
  {
    id: "8",
    name: "Desk Lamp LED",
    description: "Adjustable LED desk lamp with USB charging port",
    price: 39.99,
    image_url: "/placeholder.svg?height=400&width=400",
    category: "Home & Garden",
    stock: 22,
  },
]

export async function getProducts(): Promise<Product[]> {
  const backendAvailable = await isBackendAvailable()
  
  if (backendAvailable) {
    try {
      const response = await apiClient.getProducts()
      
      if (response && Array.isArray(response)) {
        return response.map(toFrontendProduct)
      }
      
      return mockProducts
    } catch (error) {
      console.warn("Backend getProducts failed, using mock data:", error)
      return mockProducts
    }
  }

  // Fallback when backend is not available
  return mockProducts
}

export async function getProductById(id: string): Promise<Product | null> {
  const backendAvailable = await isBackendAvailable()
  
  if (backendAvailable) {
    try {
      const response = await apiClient.getProductById(id)
      
      if (response) {
        return toFrontendProduct(response)
      }
      
      return null
    } catch (error) {
      console.warn("Backend getProductById failed, using mock data:", error)
      return mockProducts.find((product) => product.id === id) || null
    }
  }

  // Fallback when backend is not available
  return mockProducts.find((product) => product.id === id) || null
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const backendAvailable = await isBackendAvailable()
  
  if (backendAvailable) {
    try {
      const response = await apiClient.getProducts({ category })
      
      if (response && Array.isArray(response)) {
        return response.map(toFrontendProduct)
      }
      
      return []
    } catch (error) {
      console.warn("Backend getProductsByCategory failed, using mock data:", error)
      return mockProducts.filter((product) => product.category === category)
    }
  }

  // Fallback when backend is not available
  return mockProducts.filter((product) => product.category === category)
}

export async function searchProducts(query: string): Promise<Product[]> {
  const backendAvailable = await isBackendAvailable()
  
  if (backendAvailable) {
    try {
      const response = await apiClient.getProducts({ search: query })
      
      if (response && Array.isArray(response)) {
        return response.map(toFrontendProduct)
      }
      
      return []
    } catch (error) {
      console.warn("Backend searchProducts failed, using mock data:", error)
      return mockProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.description.toLowerCase().includes(query.toLowerCase()),
      )
    }
  }

  // Fallback when backend is not available
  return mockProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase()),
  )
}

export async function createProduct(productData: CreateProductRequest): Promise<Product | null> {
  const backendAvailable = await isBackendAvailable()
  
  if (backendAvailable) {
    try {
      const response = await apiClient.createProduct(productData)
      
      if (response) {
        return toFrontendProduct(response)
      }
      
      return null
    } catch (error) {
      console.warn("Backend createProduct failed:", error)
      return null
    }
  }

  // No fallback for creation when backend is not available
  console.warn("Backend not available for product creation")
  return null
}

export async function updateProduct(id: string, updates: UpdateProductRequest): Promise<Product | null> {
  const backendAvailable = await isBackendAvailable()
  
  if (backendAvailable) {
    try {
      const response = await apiClient.updateProduct(id, updates)
      
      if (response) {
        return toFrontendProduct(response)
      }
      
      return null
    } catch (error) {
      console.warn("Backend updateProduct failed:", error)
      return null
    }
  }

  // No fallback for updates when backend is not available
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
      console.warn("Backend deleteProduct failed:", error)
      return false
    }
  }

  // No fallback for deletion when backend is not available
  console.warn("Backend not available for product deletion")
  return false
}

export async function updateProductStock(productId: string, newStock: number): Promise<boolean> {
  const backendAvailable = await isBackendAvailable()
  
  if (backendAvailable) {
    try {
      await apiClient.updateProduct(productId, { stock: newStock })
      return true
    } catch (error) {
      console.warn("Backend updateProductStock failed:", error)
      return false
    }
  }

  // No fallback for stock updates when backend is not available
  console.warn("Backend not available for stock update")
  return false
}