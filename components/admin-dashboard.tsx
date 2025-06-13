"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import Header from "./header"
import Footer from "./footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, Users, ShoppingCart, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useProducts } from "@/lib/products-context"
import { getAllUsers, getAllOrders, getLowStockProducts } from "@/lib/admin"

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { products } = useProducts()
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    lowStockProducts: 0,
  })

  const fetchStats = useCallback(async () => {
    try {
      const [users, orders, lowStock] = await Promise.all([
        getAllUsers(),
        getAllOrders(),
        getLowStockProducts(),
      ])

      setStats({
        totalProducts: products.length,
        totalUsers: users.length,
        totalOrders: orders.length,
        lowStockProducts: lowStock.length,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }, [products.length])

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/")
      return
    }

    if (user?.role === "admin") {
      fetchStats()
    }
  }, [user, loading, router, fetchStats])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  }

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 dark:text-white">Panel de Administración</h1>
          <p className="text-gray-600 dark:text-gray-300">Bienvenido de nuevo, {user.first_name}!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/admin/products" className="block">
            <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer transform hover:scale-[1.02] dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium dark:text-white">Total Productos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dark:text-white">{stats.totalProducts}</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/users" className="block">
            <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer transform hover:scale-[1.02] dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium dark:text-white">Total Usuarios</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dark:text-white">{stats.totalUsers}</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/orders" className="block">
            <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer transform hover:scale-[1.02] dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium dark:text-white">Total Pedidos</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground dark:text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dark:text-white">{stats.totalOrders}</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/products" className="block">
            <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer transform hover:scale-[1.02] border-orange-200 dark:bg-gray-800 dark:border-orange-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium dark:text-white">Stock Bajo</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.lowStockProducts}</div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center dark:text-white">
                <Package className="mr-2" />
                Gestión de Productos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4 dark:text-gray-300">
                Administra tu catálogo de productos, inventario y precios.
              </p>
              <Link href="/admin/products">
                <Button className="w-full">Gestionar Productos</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center dark:text-white">
                <ShoppingCart className="mr-2" />
                Gestión de Pedidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4 dark:text-gray-300">Ver y gestionar pedidos de clientes y cumplimiento.</p>
              <Link href="/admin/orders">
                <Button className="w-full">Gestionar Pedidos</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center dark:text-white">
                <Users className="mr-2" />
                Gestión de Usuarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4 dark:text-gray-300">Administra cuentas de usuarios y permisos.</p>
              <Link href="/admin/users">
                <Button className="w-full">Gestionar Usuarios</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
