import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/lib/cart-context"
import { AuthProvider } from "@/lib/auth-context"
import { ProductsProvider } from "@/lib/products-context"
import { ToastProvider } from "@/lib/toast"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Davi-Commerce - Tu Tienda Online",
  description: "Aplicación de comercio electrónico moderna construida con Next.js",
  generator: 'v0.dev',
  icons: {
    icon: '/store-solid.png',
    shortcut: '/store-solid.png',
    apple: '/store-solid.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ToastProvider>
            <AuthProvider>
              <ProductsProvider>
                <CartProvider>{children}</CartProvider>
              </ProductsProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
