"use client"

import Header from "@/components/header"
import Footer from "@/components/footer"
import ProductsWithSearch from "@/components/products-with-search"

export default function ProductsPage() {
  return (
    <div className="min-h-screen-footer bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-grow-content">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 dark:text-white">Todos los Productos</h1>
          <ProductsWithSearch />
        </div>
      </main>
      <Footer />
    </div>
  )
}
