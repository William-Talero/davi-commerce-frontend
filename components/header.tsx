"use client"

import Link from "next/link"
import { ShoppingCart, User, Settings, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { ThemeToggle } from "./theme-toggle"

export default function Header() {
  const { items } = useCart()
  const { user, logout } = useAuth()
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40 dark:bg-gray-900 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="text-2xl hidden md:block font-bold text-gray-900 hover:text-blue-600 transition-colors dark:text-white dark:hover:text-blue-400"
          >
            Davi-Commerce
          </Link>

          <Link
            href="/"
            className="text-md block md:hidden font-bold text-gray-900 hover:text-blue-600 transition-colors dark:text-white dark:hover:text-blue-400"
          >
            DaviCo
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-gray-900 transition-colors dark:text-gray-300 dark:hover:text-white"
            >
              Inicio
            </Link>
            <Link
              href="/products"
              className="text-gray-700 hover:text-gray-900 transition-colors dark:text-gray-300 dark:hover:text-white"
            >
              Productos
            </Link>
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className="text-blue-600 hover:text-blue-700 transition-colors font-medium dark:text-blue-400 dark:hover:text-blue-300"
              >
                Administración
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-1 md:space-x-4">
            <Link href="/search">
              <Button variant="ghost" size="icon" className="hover:scale-110 transition-transform">
                <Search className="h-5 w-5 dark:text-gray-300" />
              </Button>
            </Link>

            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon" className="hover:scale-110 transition-transform">
                <ShoppingCart className="h-5 w-5 dark:text-gray-300" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>

            <ThemeToggle />

            {user ? (
              <div className="flex items-center space-x-2">
                <Link href="/profile">
                  <Button variant="ghost" size="icon" className="hover:scale-110 transition-transform">
                    <User className="h-5 w-5 dark:text-gray-300" />
                  </Button>
                </Link>
                {user.role === "admin" && (
                  <Link href="/admin">
                    <Button variant="ghost" size="icon" className="hover:scale-110 transition-transform">
                      <Settings className="h-5 w-5 dark:text-gray-300" />
                    </Button>
                  </Link>
                )}
                <Button
                  variant="outline"
                  onClick={logout}
                  className="hover:scale-105 transition-transform dark:text-white dark:border-gray-600"
                >
                  Cerrar Sesión
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button
                    variant="outline"
                    className="hover:scale-105 transition-transform dark:text-white dark:border-gray-600"
                  >
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="hover:scale-105 transition-transform">Registrarse</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
