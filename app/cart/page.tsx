import Header from "@/components/header"
import Footer from "@/components/footer"
import CartPage from "@/components/cart-page"

export default function Cart() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <CartPage />
      </main>
      <Footer />
    </div>
  )
}
