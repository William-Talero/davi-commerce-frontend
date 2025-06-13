"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

interface Toast {
  id: string
  message: string
  type: "success" | "error" | "info" | "warning"
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (message: string, type?: Toast["type"]) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Date.now().toString()
    const toast = { id, message, type }

    setToasts((prev) => [...prev, toast])

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(id)
    }, 5000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

function ToastContainer() {
  const { toasts, removeToast } = useToast()

  const getToastIcon = (type: Toast["type"]) => {
    switch (type) {
      case "success":
        return "✓"
      case "error":
        return "✕"
      case "warning":
        return "⚠"
      case "info":
        return "ℹ"
      default:
        return ""
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out
            animate-in slide-in-from-right-full cursor-pointer border min-w-0
            ${toast.type === "success" ? "bg-green-600 text-white border-green-600" : ""}
            ${toast.type === "error" ? "bg-red-600 text-white border-red-600" : ""}
            ${toast.type === "warning" ? "bg-yellow-600 text-white border-yellow-600" : ""}
            ${toast.type === "info" ? "bg-blue-600 text-white border-blue-600" : ""}
          `}
          style={{
            backgroundColor: toast.type === "success" ? "#059669" : 
                           toast.type === "error" ? "#dc2626" : 
                           toast.type === "warning" ? "#d97706" : 
                           toast.type === "info" ? "#2563eb" : undefined,
            color: "#ffffff",
            borderColor: toast.type === "success" ? "#059669" : 
                        toast.type === "error" ? "#dc2626" : 
                        toast.type === "warning" ? "#d97706" : 
                        toast.type === "info" ? "#2563eb" : undefined
          }}
          onClick={() => removeToast(toast.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">{getToastIcon(toast.type)}</span>
              <span>{toast.message}</span>
            </div>
            <button className="ml-4 opacity-70 hover:opacity-100 text-lg font-bold transition-opacity">×</button>
          </div>
        </div>
      ))}
    </div>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
