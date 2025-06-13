export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 dark:bg-gray-950 mt-auto border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center space-y-4">
          {/* Logo/Brand */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-2">Davi-Commerce</h3>
            <p className="text-gray-400 text-sm max-w-md">
              Tu destino de compras en línea de confianza para productos de calidad a excelentes precios.
            </p>
          </div>

          {/* Divider */}
          <div className="w-full max-w-md border-t border-gray-700"></div>

          {/* Copyright and Creator */}
          <div className="text-center space-y-2">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Davi-Commerce. Todos los derechos reservados.
            </p>
            <p className="text-gray-500 text-xs">
              Creado con ❤️ por <span className="text-blue-400 font-medium">William Talero</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
