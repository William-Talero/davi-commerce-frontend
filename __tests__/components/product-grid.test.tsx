import { render, screen } from '@testing-library/react'
import ProductGrid from '@/components/product-grid'
import { Product } from '@/lib/types'

// Mock ProductCard component
jest.mock('@/components/product-card', () => {
  return function MockProductCard({ product }: { product: Product }) {
    return <div data-testid={`product-card-${product.id}`}>{product.name}</div>
  }
})

describe('ProductGrid', () => {
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Producto 1',
      description: 'Descripción 1',
      price: 99.99,
      image_url: 'https://example.com/image1.jpg',
      category: 'Electrónicos',
      stock: 10,
      low_stock_threshold: 2,
      created_at: '2023-01-01',
      updated_at: '2023-01-01'
    },
    {
      id: '2',
      name: 'Producto 2',
      description: 'Descripción 2',
      price: 149.99,
      image_url: 'https://example.com/image2.jpg',
      category: 'Ropa',
      stock: 5,
      low_stock_threshold: 2,
      created_at: '2023-01-01',
      updated_at: '2023-01-01'
    },
    {
      id: '3',
      name: 'Producto 3',
      description: 'Descripción 3',
      price: 79.99,
      image_url: 'https://example.com/image3.jpg',
      category: 'Hogar',
      stock: 0,
      low_stock_threshold: 2,
      created_at: '2023-01-01',
      updated_at: '2023-01-01'
    }
  ]

  it('renders all products in grid layout', () => {
    render(<ProductGrid products={mockProducts} />)
    
    expect(screen.getByTestId('product-card-1')).toBeInTheDocument()
    expect(screen.getByTestId('product-card-2')).toBeInTheDocument()
    expect(screen.getByTestId('product-card-3')).toBeInTheDocument()
    
    expect(screen.getByText('Producto 1')).toBeInTheDocument()
    expect(screen.getByText('Producto 2')).toBeInTheDocument()
    expect(screen.getByText('Producto 3')).toBeInTheDocument()
  })

  it('displays empty state when no products provided', () => {
    render(<ProductGrid products={[]} />)
    
    expect(screen.getByText(/no se encontraron productos/i)).toBeInTheDocument()
  })

  it('handles single product correctly', () => {
    const singleProduct = [mockProducts[0]]
    render(<ProductGrid products={singleProduct} />)
    
    expect(screen.getByTestId('product-card-1')).toBeInTheDocument()
    expect(screen.getByText('Producto 1')).toBeInTheDocument()
    expect(screen.queryByTestId('product-card-2')).not.toBeInTheDocument()
  })

  it('applies correct grid classes for responsive design', () => {
    const { container } = render(<ProductGrid products={mockProducts} />)
    
    const gridContainer = container.querySelector('.grid')
    expect(gridContainer).toHaveClass('grid')
    expect(gridContainer).toHaveClass('grid-cols-1')
    expect(gridContainer).toHaveClass('md:grid-cols-2')
    expect(gridContainer).toHaveClass('lg:grid-cols-3')
    expect(gridContainer).toHaveClass('xl:grid-cols-4')
  })

  it('maintains proper spacing between products', () => {
    const { container } = render(<ProductGrid products={mockProducts} />)
    
    const gridContainer = container.querySelector('.grid')
    expect(gridContainer).toHaveClass('gap-6')
  })

  it('handles large number of products', () => {
    const manyProducts = Array.from({ length: 20 }, (_, i) => ({
      ...mockProducts[0],
      id: `${i + 1}`,
      name: `Producto ${i + 1}`
    }))
    
    render(<ProductGrid products={manyProducts} />)
    
    // Check that all products are rendered
    manyProducts.forEach(product => {
      expect(screen.getByTestId(`product-card-${product.id}`)).toBeInTheDocument()
    })
  })

  it('handles products with missing or invalid data gracefully', () => {
    const productsWithMissingData: Product[] = [
      {
        id: '1',
        name: '',
        description: '',
        price: 0,
        image_url: '',
        category: '',
        stock: 0,
        created_at: '2023-01-01',
        updated_at: '2023-01-01'
      }
    ]
    
    render(<ProductGrid products={productsWithMissingData} />)
    
    expect(screen.getByTestId('product-card-1')).toBeInTheDocument()
  })

  it('preserves product order', () => {
    render(<ProductGrid products={mockProducts} />)
    
    const productElements = screen.getAllByTestId(/product-card-/)
    expect(productElements).toHaveLength(3)
    
    // Check that products appear in the correct order
    expect(productElements[0]).toHaveAttribute('data-testid', 'product-card-1')
    expect(productElements[1]).toHaveAttribute('data-testid', 'product-card-2')
    expect(productElements[2]).toHaveAttribute('data-testid', 'product-card-3')
  })

  it('updates when products prop changes', () => {
    const { rerender } = render(<ProductGrid products={[mockProducts[0]]} />)
    
    expect(screen.getByTestId('product-card-1')).toBeInTheDocument()
    expect(screen.queryByTestId('product-card-2')).not.toBeInTheDocument()
    
    rerender(<ProductGrid products={mockProducts} />)
    
    expect(screen.getByTestId('product-card-1')).toBeInTheDocument()
    expect(screen.getByTestId('product-card-2')).toBeInTheDocument()
    expect(screen.getByTestId('product-card-3')).toBeInTheDocument()
  })
})