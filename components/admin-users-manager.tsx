"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/lib/toast"
import { useRouter } from "next/navigation"
import Header from "./header"
import Footer from "./footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Shield, User } from "lucide-react"
import { getAllUsers, updateUserRole, deleteUser } from "@/lib/admin"
import type { User as UserType } from "@/lib/types"

export default function AdminUsersManager() {
  const { user, loading } = useAuth()
  const { addToast } = useToast()
  const router = useRouter()
  const [users, setUsers] = useState<UserType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/")
      return
    }

    if (user?.role === "admin") {
      fetchUsers()
    }
  }, [user, loading, router])

  const fetchUsers = async () => {
    setIsLoading(true)
    const usersData = await getAllUsers()
    setUsers(usersData)
    setIsLoading(false)
  }

  const handleRoleUpdate = async (userId: string, newRole: "customer" | "admin") => {
    const success = await updateUserRole(userId, newRole)
    if (success) {
      addToast("¡Rol de usuario actualizado con éxito!", "success")
      await fetchUsers()
    } else {
      addToast("Error al actualizar el rol del usuario", "error")
    }
  }

  const handleDeleteUser = async (userToDelete: UserType) => {
    if (userToDelete.id === user?.id) {
      addToast("No puedes eliminar tu propia cuenta", "error")
      return
    }

    if (confirm(`¿Estás seguro de que deseas eliminar a ${userToDelete.first_name} ${userToDelete.last_name}?`)) {
      const success = await deleteUser(userToDelete.id)
      if (success) {
        addToast("¡Usuario eliminado con éxito!", "success")
        await fetchUsers()
      } else {
        addToast("Error al eliminar el usuario", "error")
      }
    }
  }

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
          <h1 className="text-3xl font-bold mb-2 dark:text-white">Gestión de Usuarios</h1>
          <p className="text-gray-600 dark:text-gray-300">Administra cuentas de usuarios y permisos</p>
        </div>

        {isLoading ? (
          <div className="text-center py-8 dark:text-white">Cargando usuarios...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 h-screen lg:grid-cols-3 gap-6">
            {users.map((userItem) => (
              <Card key={userItem.id} className="hover:shadow-lg transition-all duration-300 hover:scale-105 dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {userItem.role === "admin" ? (
                        <Shield className="h-5 w-5 text-blue-500 mr-2" />
                      ) : (
                        <User className="h-5 w-5 text-gray-500 mr-2" />
                      )}
                      <CardTitle className="text-lg dark:text-white">
                        {userItem.first_name} {userItem.last_name}
                      </CardTitle>
                    </div>
                    <Badge variant={userItem.role === "admin" ? "default" : "secondary"}>{userItem.role}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{userItem.email}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Se unió: {userItem.created_at ? new Date(userItem.created_at).toLocaleDateString() : "N/A"}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block dark:text-white">Rol</label>
                      <Select
                        value={userItem.role || "customer"}
                        onValueChange={(value: "customer" | "admin") => handleRoleUpdate(userItem.id, value)}
                        disabled={userItem.id === user.id}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="customer">Cliente</SelectItem>
                          <SelectItem value="admin">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteUser(userItem)}
                      disabled={userItem.id === user.id}
                      className="w-full"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar Usuario
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
