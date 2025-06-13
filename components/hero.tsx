import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Hero() {
  return (
    <section
      className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-20"
      style={{
        background: "linear-gradient(135deg, #FF5733 0%, #C70039 100%)",
      }}
    >
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold mb-6">Descubre Productos Increíbles</h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Compra las últimas tendencias y encuentra todo lo que necesitas en nuestra colección de productos
          premium.
        </p>
        <Link href="/products">
          <Button size="lg" variant="secondary" className="bg-white text-gray-900 hover:bg-gray-100">
            Comprar Ahora
          </Button>
        </Link>
      </div>
    </section>
  )
}
