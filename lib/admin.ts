import { supabase } from "./supabase"
import type { Product, User, Order } from "./types"

// Product Management
export async function createProduct(
  product: Omit<Product, "id" | "created_at" | "updated_at">,
): Promise<Product | null> {
  try {
    const { data, error } = await supabase.from("products").insert([product]).select().single()

    if (error) {
      console.error("Error creating product:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Database connection failed:", error)
    return null
  }
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  try {
    const { data, error } = await supabase.from("products").update(updates).eq("id", id).select().single()

    if (error) {
      console.error("Error updating product:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Database connection failed:", error)
    return null
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("products").delete().eq("id", id)

    if (error) {
      console.error("Error deleting product:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Database connection failed:", error)
    return false
  }
}

// User Management
export async function getAllUsers(): Promise<User[]> {
  try {
    // First try with role column
    const { data, error } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, role, created_at")
      .order("created_at", { ascending: false })

    if (error) {
      console.warn("Error fetching users with role, trying without role:", error)

      // If role column doesn't exist, try without it
      const { data: usersWithoutRole, error: secondError } = await supabase
        .from("users")
        .select("id, email, first_name, last_name, created_at")
        .order("created_at", { ascending: false })

      if (secondError) {
        console.error("Error fetching users:", secondError)
        return []
      }

      // Add default role
      return usersWithoutRole?.map((user: any) => ({ ...user, role: "customer" as const })) || []
    }

    return data || []
  } catch (error) {
    console.error("Database connection failed:", error)
    return []
  }
}

export async function updateUserRole(userId: string, role: "customer" | "admin"): Promise<boolean> {
  try {
    const { error } = await supabase.from("users").update({ role }).eq("id", userId)

    if (error) {
      console.error("Error updating user role:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Database connection failed:", error)
    return false
  }
}

export async function deleteUser(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("users").delete().eq("id", userId)

    if (error) {
      console.error("Error deleting user:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Database connection failed:", error)
    return false
  }
}

// Order Management
export async function getAllOrders(): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        users (
          first_name,
          last_name,
          email
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching orders:", error)
      return []
    }

    return (
      data?.map((order: any) => ({
        ...order,
        user: order.users,
      })) || []
    )
  } catch (error) {
    console.error("Database connection failed:", error)
    return []
  }
}

export async function updateOrderStatus(orderId: string, status: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId)

    if (error) {
      console.error("Error updating order status:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Database connection failed:", error)
    return false
  }
}

// Stock Management
export async function getLowStockProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .lt("stock", 10)
      .order("stock", { ascending: true })

    if (error) {
      console.error("Error fetching low stock products:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Database connection failed:", error)
    return []
  }
}
