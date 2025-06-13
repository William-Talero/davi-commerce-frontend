import { type NextRequest, NextResponse } from "next/server"
import { getProducts, createProduct, searchProducts, getProductsByCategory } from "@/lib/products-backend"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    let products
    
    if (search) {
      products = await searchProducts(search)
    } else if (category) {
      products = await getProductsByCategory(category)
    } else {
      products = await getProducts()
    }

    return NextResponse.json(products)
  } catch (error) {
    console.error("Get products error:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const productData = await request.json()

    if (!productData.name || !productData.description || !productData.price || !productData.stock) {
      return NextResponse.json(
        { error: "Name, description, price, and stock are required" }, 
        { status: 400 }
      )
    }

    const product = await createProduct(productData)

    if (!product) {
      return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Create product error:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}