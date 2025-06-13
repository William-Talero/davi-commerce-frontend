"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/lib/toast"
import { updateUser } from "@/lib/auth-backend"
import type { User } from "@/lib/types"

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  user: User
}

export default function EditProfileModal({ isOpen, onClose, user }: EditProfileModalProps) {
  const { login } = useAuth() // To update the context with new user data
  const { addToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user.first_name || "",
    lastName: user.last_name || "",
    email: user.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Basic validation
    if (!formData.firstName.trim()) {
      errors.firstName = "El nombre es requerido"
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "El apellido es requerido"
    }

    if (!formData.email.trim()) {
      errors.email = "El correo electrónico es requerido"
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        errors.email = "Por favor ingresa un correo electrónico válido"
      }
    }

    // Password validation (only if changing password)
    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        errors.currentPassword = "La contraseña actual es requerida para cambiar la contraseña"
      }

      if (formData.newPassword.length < 6) {
        errors.newPassword = "La nueva contraseña debe tener al menos 6 caracteres"
      }

      if (formData.newPassword !== formData.confirmPassword) {
        errors.confirmPassword = "Las contraseñas no coinciden"
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      addToast("Por favor corrige los errores en el formulario", "error")
      return
    }

    setIsLoading(true)

    try {
      // Prepare update data
      const updateData: Partial<User> = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
      }

      // Update user
      const updatedUser = await updateUser(user.id, updateData)

      if (updatedUser) {
        // Update the auth context with new user data
        const userData = {
          ...user,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
        }

        // Update localStorage
        localStorage.setItem("user", JSON.stringify(userData))

        addToast("¡Perfil actualizado exitosamente!", "success")
        onClose()

        // Refresh the page to update all components
        window.location.reload()
      } else {
        throw new Error("Error al actualizar el perfil")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      addToast("Error al actualizar el perfil. Por favor, inténtalo de nuevo.", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      firstName: user.first_name || "",
      lastName: user.last_name || "",
      email: user.email || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
    setFormErrors({})
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Editar Perfil</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="dark:text-white">
                  Nombre *
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    formErrors.firstName ? "border-red-500" : ""
                  }`}
                />
                {formErrors.firstName && <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>}
              </div>

              <div>
                <Label htmlFor="lastName" className="dark:text-white">
                  Apellido *
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    formErrors.lastName ? "border-red-500" : ""
                  }`}
                />
                {formErrors.lastName && <p className="text-red-500 text-sm mt-1">{formErrors.lastName}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="dark:text-white">
                Correo Electrónico *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  formErrors.email ? "border-red-500" : ""
                }`}
              />
              {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
            </div>
          </div>

          {/* Password Change Section */}
          <div className="border-t pt-4 dark:border-gray-600">
            <h4 className="font-medium mb-3 dark:text-white">Cambiar Contraseña (Opcional)</h4>

            <div className="space-y-3">
              <div>
                <Label htmlFor="currentPassword" className="dark:text-white">
                  Contraseña Actual
                </Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    formErrors.currentPassword ? "border-red-500" : ""
                  }`}
                />
                {formErrors.currentPassword && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.currentPassword}</p>
                )}
              </div>

              <div>
                <Label htmlFor="newPassword" className="dark:text-white">
                  Nueva Contraseña
                </Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    formErrors.newPassword ? "border-red-500" : ""
                  }`}
                />
                {formErrors.newPassword && <p className="text-red-500 text-sm mt-1">{formErrors.newPassword}</p>}
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="dark:text-white">
                  Confirmar Nueva Contraseña
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    formErrors.confirmPassword ? "border-red-500" : ""
                  }`}
                />
                {formErrors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.confirmPassword}</p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 dark:border-gray-600 dark:text-white"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </div>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
