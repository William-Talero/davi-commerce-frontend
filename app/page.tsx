"use client"

import { useEffect, useState } from "react"
import Header from "@/components/header"
import Hero from "@/components/hero"
import ProductGrid from "@/components/product-grid"
import Footer from "@/components/footer"
import { useProducts } from "@/lib/products-context"
import type { Product } from "@/lib/types"

export default function Home() {
  const { products, refreshProducts } = useProducts()
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])

  useEffect(() => {
    if (products.length === 0) {
      refreshProducts()
    }
  }, [products.length, refreshProducts])

  useEffect(() => {
    if (products.length > 0) {
      setFeaturedProducts(products.slice(0, 8))
    }
  }, [products])

  return (
    <div className="min-h-screen-footer bg-gray-50 dark:bg-gray-900">
      <Header />
      <Hero />
      <main className="container mx-auto px-4 py-8 flex-grow-content">
        <section>
          <h2 className="text-3xl font-bold text-center mb-8 dark:text-white">Productos Destacados</h2>
          <ProductGrid products={featuredProducts} />
        </section>
      </main>
      <Footer />
    </div>
  )
}
