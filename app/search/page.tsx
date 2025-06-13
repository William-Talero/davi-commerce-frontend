import Header from "@/components/header"
import Footer from "@/components/footer"
import SearchProducts from "@/components/search-products"

export default function SearchPage() {
  return (
    <div className="min-h-screen-footer bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-grow-content">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 dark:text-white">Buscar Productos</h1>
          <SearchProducts />
        </div>
      </main>
      <Footer />
    </div>
  )
}
