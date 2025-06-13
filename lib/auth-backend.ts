import { apiClient, isBackendAvailable } from "./api"
import { toFrontendUser } from "./backend-types"
import type { User } from "./types"
import type { LoginRequest, RegisterRequest } from "./backend-types"

const mockAdminUser: User = {
  id: "admin-demo-1",
  email: "admin@store.com",
  first_name: "Admin",
  last_name: "User",
  role: "admin",
}

const mockUser: User = {
  id: "demo-user-1",
  email: "demo@example.com",
  first_name: "Demo",
  last_name: "User",
  role: "customer",
}

export async function signUp(email: string, password: string, firstName: string, lastName: string): Promise<User> {
  const backendAvailable = await isBackendAvailable()
  
  if (backendAvailable) {
    try {
      // For now, we don't have a signup endpoint in the backend, so we'll use mock
          console.warn("Signup not implemented in backend yet, using mock user")
      return {
        id: `user-${Date.now()}`,
        email,
        first_name: firstName,
        last_name: lastName,
        role: "customer",
      }
    } catch (error) {
      console.warn("Backend signup failed, using mock user:", error)
      return {
        id: `user-${Date.now()}`,
        email,
        first_name: firstName,
        last_name: lastName,
        role: "customer",
      }
    }
  }

  return {
    id: `user-${Date.now()}`,
    email,
    first_name: firstName,
    last_name: lastName,
    role: "customer",
  }
}

export async function signIn(email: string, password: string): Promise<User> {
  const backendAvailable = await isBackendAvailable()
  
  if (backendAvailable) {
    try {
      const response = await apiClient.login(email, password)
      
      if (response?.user) {
        // Convert backend user format to frontend format
        return toFrontendUser(response.user)
      }
      
      throw new Error("Invalid response from backend")
    } catch (error) {
      console.warn("Backend login failed:", error)
      
          if (email === "admin@store.com" && password === "admin123") {
        return mockAdminUser
      }
      if (email === "demo@example.com" && password === "password") {
        return mockUser
      }
      
        throw new Error("Credenciales inválidas")
    }
  }

  if (email === "admin@store.com" && password === "admin123") {
    return mockAdminUser
  }
  if (email === "demo@example.com" && password === "password") {
    return mockUser
  }
  
  throw new Error("Invalid credentials")
}

export async function getUserById(id: string): Promise<User | null> {
  const backendAvailable = await isBackendAvailable()
  
  if (backendAvailable) {
    try {
      const response = await apiClient.getUserById(id)
      
      if (response) {
        return toFrontendUser(response)
      }
      
      return null
    } catch (error) {
      console.warn("Backend getUserById failed:", error)
          return id === "admin-demo-1" ? mockAdminUser : mockUser
    }
  }

  return id === "admin-demo-1" ? mockAdminUser : mockUser
}

export async function getCurrentUser(): Promise<User | null> {
  const backendAvailable = await isBackendAvailable()
  
  if (backendAvailable) {
    try {
      const response = await apiClient.getCurrentUser()
      
      if (response) {
        return toFrontendUser(response)
      }
      
      return null
    } catch (error) {
      console.warn("Backend getCurrentUser failed:", error)
      return null
    }
  }

  return null
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const backendAvailable = await isBackendAvailable()
  
  if (backendAvailable) {
    try {
          const backendUpdates: any = {}
      if (updates.email) backendUpdates.email = updates.email
      if (updates.first_name) backendUpdates.firstName = updates.first_name
      if (updates.last_name) backendUpdates.lastName = updates.last_name
      if (updates.role) backendUpdates.role = updates.role

      let response
      if (id === "me") {
        response = await apiClient.updateCurrentUser(backendUpdates)
      } else {
        response = await apiClient.updateUser(id, backendUpdates)
      }
      
      if (response) {
        return toFrontendUser(response)
      }
      
      return null
    } catch (error) {
      console.warn("Backend updateUser failed:", error)
      return null
    }
  }

  console.warn("Backend not available for user update")
  return null
}

export async function getAllUsers(): Promise<User[]> {
  const backendAvailable = await isBackendAvailable()
  
  if (backendAvailable) {
    try {
      const response = await apiClient.getAllUsers()
      
      if (response && Array.isArray(response)) {
        return response.map(toFrontendUser)
      }
      
      return []
    } catch (error) {
      console.warn("Backend getAllUsers failed:", error)
      return [mockAdminUser, mockUser]
    }
  }

  return [mockAdminUser, mockUser]
}

export async function deleteUser(id: string): Promise<boolean> {
  const backendAvailable = await isBackendAvailable()
  
  if (backendAvailable) {
    try {
      await apiClient.deleteUser(id)
      return true
    } catch (error) {
      console.warn("Backend deleteUser failed:", error)
      return false
    }
  }

  console.warn("Backend not available for user deletion")
  return false
}

export function signOut(): void {
  apiClient.clearToken()
}