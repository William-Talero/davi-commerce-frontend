"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { getProducts, getProductById } from "./products-backend"
import { setRefreshProductsCallback } from "./orders-backend"
import type { Product } from "./types"

interface ProductsContextType {
  products: Product[]
  isLoading: boolean
  refreshProducts: () => Promise<void>
  updateProductStock: (productId: string, newStock: number) => void
  getProduct: (productId: string) => Product | undefined
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined)

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const refreshProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      const productsData = await getProducts()
      setProducts(productsData)
    } catch (error) {
      console.error("Error refreshing products:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateProductStock = useCallback((productId: string, newStock: number) => {
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === productId 
          ? { ...product, stock: newStock }
          : product
      )
    )
  }, [])

  const getProduct = useCallback((productId: string) => {
    return products.find(product => product.id === productId)
  }, [products])

  // Set up the callback for order creation
  useEffect(() => {
    setRefreshProductsCallback(refreshProducts)
  }, [refreshProducts])

  return (
    <ProductsContext.Provider value={{
      products,
      isLoading,
      refreshProducts,
      updateProductStock,
      getProduct
    }}>
      {children}
    </ProductsContext.Provider>
  )
}

export function useProducts() {
  const context = useContext(ProductsContext)
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductsProvider")
  }
  return context
}