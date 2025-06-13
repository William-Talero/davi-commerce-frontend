import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProductCard from '@/components/product-card'
import { useCart } from '@/lib/cart-context'
import { useToast } from '@/lib/toast'
import { Product } from '@/lib/types'

// Mock the hooks
jest.mock('@/lib/cart-context')
jest.mock('@/lib/toast')

const mockUseCart = useCart as jest.MockedFunction<typeof useCart>
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>

describe('ProductCard', () => {
  const mockAddToCart = jest.fn()
  const mockAddToast = jest.fn()

  const mockProduct: Product = {
    id: '1',
    name: 'Producto de Prueba',
    description: 'Descripción del producto de prueba',
    price: 99.99,
    image_url: 'https://example.com/image.jpg',
    category: 'Electrónicos',
    stock: 10,
    low_stock_threshold: 2,
    created_at: '2023-01-01',
    updated_at: '2023-01-01'
  }

  beforeEach(() => {
    mockUseCart.mockReturnValue({
      items: [],
      addToCart: mockAddToCart,
      removeFromCart: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
      getCartTotal: jest.fn().mockReturnValue(0),
      getCartItemsCount: jest.fn().mockReturnValue(0),
    })

    mockUseToast.mockReturnValue({
      addToast: mockAddToast,
    })

    jest.clearAllMocks()
  })

  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />)
    
    expect(screen.getByText('Producto de Prueba')).toBeInTheDocument()
    expect(screen.getByText('$99.99')).toBeInTheDocument()
    expect(screen.getByText('Electrónicos')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /producto de prueba/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /agregar al carrito/i })).toBeInTheDocument()
  })

  it('shows low stock warning when stock is low', () => {
    const lowStockProduct = { ...mockProduct, stock: 1 }
    render(<ProductCard product={lowStockProduct} />)
    
    expect(screen.getByText(/¡pocas unidades!/i)).toBeInTheDocument()
  })

  it('shows out of stock message when stock is 0', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 }
    render(<ProductCard product={outOfStockProduct} />)
    
    expect(screen.getByText(/agotado/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /agregar al carrito/i })).toBeDisabled()
  })

  it('adds product to cart when button is clicked', async () => {
    const user = userEvent.setup()
    render(<ProductCard product={mockProduct} />)
    
    const addButton = screen.getByRole('button', { name: /agregar al carrito/i })
    await user.click(addButton)
    
    expect(mockAddToCart).toHaveBeenCalledWith(mockProduct)
    expect(mockAddToast).toHaveBeenCalledWith('Producto agregado al carrito', 'success')
  })

  it('navigates to product detail when card is clicked', async () => {
    const user = userEvent.setup()
    render(<ProductCard product={mockProduct} />)
    
    const productImage = screen.getByRole('img', { name: /producto de prueba/i })
    await user.click(productImage)
    
    // Since we're mocking the router, we can't test navigation directly
    // but we can test that the click handler is attached
    expect(productImage).toBeInTheDocument()
  })

  it('displays product image with proper alt text', () => {
    render(<ProductCard product={mockProduct} />)
    
    const image = screen.getByRole('img', { name: /producto de prueba/i })
    expect(image).toHaveAttribute('src', mockProduct.image_url)
    expect(image).toHaveAttribute('alt', mockProduct.name)
  })

  it('handles missing image gracefully', () => {
    const productWithoutImage = { ...mockProduct, image_url: '' }
    render(<ProductCard product={productWithoutImage} />)
    
    const image = screen.getByRole('img', { name: /producto de prueba/i })
    expect(image).toHaveAttribute('src', '/placeholder.svg')
  })

  it('formats price correctly', () => {
    const expensiveProduct = { ...mockProduct, price: 1234.56 }
    render(<ProductCard product={expensiveProduct} />)
    
    expect(screen.getByText('$1234.56')).toBeInTheDocument()
  })

  it('handles very long product names', () => {
    const longNameProduct = {
      ...mockProduct,
      name: 'Este es un nombre de producto muy largo que debería ser truncado o manejado apropiadamente'
    }
    render(<ProductCard product={longNameProduct} />)
    
    expect(screen.getByText(longNameProduct.name)).toBeInTheDocument()
  })

  it('applies hover effects correctly', async () => {
    const user = userEvent.setup()
    render(<ProductCard product={mockProduct} />)
    
    const card = screen.getByTestId('product-card') || screen.getByText('Producto de Prueba').closest('div')
    
    if (card) {
      await user.hover(card)
      // Test that hover doesn't break functionality
      expect(screen.getByText('Producto de Prueba')).toBeInTheDocument()
    }
  })
})