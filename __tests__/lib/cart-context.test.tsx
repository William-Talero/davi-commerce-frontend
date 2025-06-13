import { renderHook, act } from '@testing-library/react'
import { CartProvider, useCart } from '@/lib/cart-context'
import { Product } from '@/lib/types'
import { ReactNode } from 'react'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock as any

const wrapper = ({ children }: { children: ReactNode }) => (
  <CartProvider>{children}</CartProvider>
)

describe('CartContext', () => {
  const mockProduct: Product = {
    id: '1',
    name: 'Producto de Prueba',
    description: 'Descripción del producto',
    price: 99.99,
    image_url: 'https://example.com/image.jpg',
    category: 'Electrónicos',
    stock: 10,
    low_stock_threshold: 2,
    created_at: '2023-01-01',
    updated_at: '2023-01-01'
  }

  const anotherProduct: Product = {
    id: '2',
    name: 'Otro Producto',
    description: 'Otra descripción',
    price: 149.99,
    image_url: 'https://example.com/image2.jpg',
    category: 'Ropa',
    stock: 5,
    low_stock_threshold: 1,
    created_at: '2023-01-01',
    updated_at: '2023-01-01'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('provides initial cart state', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    
    expect(result.current.items).toEqual([])
    expect(result.current.getCartTotal()).toBe(0)
    expect(result.current.getCartItemsCount()).toBe(0)
    expect(typeof result.current.addToCart).toBe('function')
    expect(typeof result.current.removeFromCart).toBe('function')
    expect(typeof result.current.updateQuantity).toBe('function')
    expect(typeof result.current.clearCart).toBe('function')
  })

  it('loads cart from localStorage on mount', () => {
    const savedCart = [
      { ...mockProduct, quantity: 2 },
      { ...anotherProduct, quantity: 1 }
    ]
    
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedCart))
    
    const { result } = renderHook(() => useCart(), { wrapper })
    
    expect(result.current.items).toEqual(savedCart)
    expect(result.current.getCartItemsCount()).toBe(3)
  })

  it('adds product to empty cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    
    act(() => {
      result.current.addToCart(mockProduct)
    })
    
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0]).toEqual({ ...mockProduct, quantity: 1 })
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'cart',
      JSON.stringify([{ ...mockProduct, quantity: 1 }])
    )
  })

  it('increases quantity when adding existing product', () => {
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify([{ ...mockProduct, quantity: 1 }])
    )
    
    const { result } = renderHook(() => useCart(), { wrapper })
    
    act(() => {
      result.current.addToCart(mockProduct)
    })
    
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(2)
  })

  it('adds multiple different products', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    
    act(() => {
      result.current.addToCart(mockProduct)
      result.current.addToCart(anotherProduct)
    })
    
    expect(result.current.items).toHaveLength(2)
    expect(result.current.items[0]).toEqual({ ...mockProduct, quantity: 1 })
    expect(result.current.items[1]).toEqual({ ...anotherProduct, quantity: 1 })
  })

  it('removes product from cart', () => {
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify([
        { ...mockProduct, quantity: 1 },
        { ...anotherProduct, quantity: 2 }
      ])
    )
    
    const { result } = renderHook(() => useCart(), { wrapper })
    
    act(() => {
      result.current.removeFromCart('1')
    })
    
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].id).toBe('2')
  })

  it('does nothing when removing non-existent product', () => {
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify([{ ...mockProduct, quantity: 1 }])
    )
    
    const { result } = renderHook(() => useCart(), { wrapper })
    
    act(() => {
      result.current.removeFromCart('999')
    })
    
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].id).toBe('1')
  })

  it('updates product quantity', () => {
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify([{ ...mockProduct, quantity: 1 }])
    )
    
    const { result } = renderHook(() => useCart(), { wrapper })
    
    act(() => {
      result.current.updateQuantity('1', 5)
    })
    
    expect(result.current.items[0].quantity).toBe(5)
  })

  it('removes product when quantity is set to 0', () => {
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify([{ ...mockProduct, quantity: 2 }])
    )
    
    const { result } = renderHook(() => useCart(), { wrapper })
    
    act(() => {
      result.current.updateQuantity('1', 0)
    })
    
    expect(result.current.items).toHaveLength(0)
  })

  it('ignores negative quantity updates', () => {
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify([{ ...mockProduct, quantity: 2 }])
    )
    
    const { result } = renderHook(() => useCart(), { wrapper })
    
    act(() => {
      result.current.updateQuantity('1', -1)
    })
    
    expect(result.current.items[0].quantity).toBe(2) // Should remain unchanged
  })

  it('clears entire cart', () => {
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify([
        { ...mockProduct, quantity: 1 },
        { ...anotherProduct, quantity: 2 }
      ])
    )
    
    const { result } = renderHook(() => useCart(), { wrapper })
    
    expect(result.current.items).toHaveLength(2)
    
    act(() => {
      result.current.clearCart()
    })
    
    expect(result.current.items).toHaveLength(0)
    expect(localStorageMock.setItem).toHaveBeenCalledWith('cart', JSON.stringify([]))
  })

  it('calculates correct cart total', () => {
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify([
        { ...mockProduct, quantity: 2 },      // 99.99 * 2 = 199.98
        { ...anotherProduct, quantity: 1 }    // 149.99 * 1 = 149.99
      ])
    )
    
    const { result } = renderHook(() => useCart(), { wrapper })
    
    expect(result.current.getCartTotal()).toBe(349.97)
  })

  it('calculates correct cart items count', () => {
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify([
        { ...mockProduct, quantity: 3 },
        { ...anotherProduct, quantity: 2 }
      ])
    )
    
    const { result } = renderHook(() => useCart(), { wrapper })
    
    expect(result.current.getCartItemsCount()).toBe(5)
  })

  it('returns 0 for empty cart calculations', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    
    expect(result.current.getCartTotal()).toBe(0)
    expect(result.current.getCartItemsCount()).toBe(0)
  })

  it('handles invalid JSON in localStorage gracefully', () => {
    localStorageMock.getItem.mockReturnValue('invalid-json')
    
    const { result } = renderHook(() => useCart(), { wrapper })
    
    expect(result.current.items).toEqual([])
  })

  it('persists cart changes to localStorage', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    
    act(() => {
      result.current.addToCart(mockProduct)
    })
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'cart',
      JSON.stringify([{ ...mockProduct, quantity: 1 }])
    )
    
    act(() => {
      result.current.updateQuantity('1', 3)
    })
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'cart',
      JSON.stringify([{ ...mockProduct, quantity: 3 }])
    )
  })

  it('handles products with decimal prices correctly', () => {
    const expensiveProduct: Product = {
      ...mockProduct,
      id: '3',
      price: 1234.56
    }
    
    const { result } = renderHook(() => useCart(), { wrapper })
    
    act(() => {
      result.current.addToCart(expensiveProduct)
      result.current.updateQuantity('3', 2)
    })
    
    expect(result.current.getCartTotal()).toBe(2469.12)
  })

  it('maintains cart state across multiple operations', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    
    // Add products
    act(() => {
      result.current.addToCart(mockProduct)
      result.current.addToCart(anotherProduct)
      result.current.addToCart(mockProduct) // This should increase quantity
    })
    
    expect(result.current.items).toHaveLength(2)
    expect(result.current.items[0].quantity).toBe(2)
    expect(result.current.items[1].quantity).toBe(1)
    
    // Update quantity
    act(() => {
      result.current.updateQuantity('2', 3)
    })
    
    expect(result.current.items[1].quantity).toBe(3)
    
    // Remove one product
    act(() => {
      result.current.removeFromCart('1')
    })
    
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].id).toBe('2')
    expect(result.current.getCartTotal()).toBe(449.97) // 149.99 * 3
  })
})