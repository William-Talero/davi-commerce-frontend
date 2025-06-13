import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminProductsManager from '@/components/admin-products-manager'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/lib/toast'
import { useProducts } from '@/lib/products-context'
import { Product } from '@/lib/types'

// Mock the dependencies
jest.mock('@/lib/auth-context')
jest.mock('@/lib/toast')
jest.mock('@/lib/products-context')
jest.mock('@/components/header', () => {
  return function MockHeader() {
    return <div data-testid="header">Header</div>
  }
})
jest.mock('@/components/footer', () => {
  return function MockFooter() {
    return <div data-testid="footer">Footer</div>
  }
})
jest.mock('@/components/hybrid-image-input', () => {
  return function MockHybridImageInput({ onImageSelected }: any) {
    return (
      <div data-testid="image-input">
        <button onClick={() => onImageSelected('https://example.com/test-image.jpg')}>
          Select Image
        </button>
      </div>
    )
  }
})

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>
const mockUseProducts = useProducts as jest.MockedFunction<typeof useProducts>

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
}

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}))

describe('AdminProductsManager', () => {
  const mockAdminUser = {
    id: 'admin-1',
    email: 'admin@example.com',
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin' as const,
    created_at: '2023-01-01',
  }

  const mockProducts: Product[] = [
    {
      id: 'product-1',
      name: 'Producto 1',
      description: 'Descripción del producto 1',
      price: 99.99,
      image_url: 'https://example.com/image1.jpg',
      category: 'Electrónicos',
      stock: 10,
      low_stock_threshold: 2,
      created_at: '2023-01-01',
      updated_at: '2023-01-01'
    },
    {
      id: 'product-2',
      name: 'Producto 2',
      description: 'Descripción del producto 2',
      price: 149.99,
      image_url: 'https://example.com/image2.jpg',
      category: 'Ropa',
      stock: 5,
      low_stock_threshold: 2,
      created_at: '2023-01-01',
      updated_at: '2023-01-01'
    }
  ]

  const mockAddToast = jest.fn()
  const mockFetchProducts = jest.fn()

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: mockAdminUser,
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      updateProfile: jest.fn(),
    })

    mockUseToast.mockReturnValue({
      addToast: mockAddToast,
    })

    mockUseProducts.mockReturnValue({
      products: mockProducts,
      loading: false,
      error: null,
      fetchProducts: mockFetchProducts,
      getProduct: jest.fn(),
    })

    jest.clearAllMocks()
  })

  it('renders admin products manager for admin user', () => {
    render(<AdminProductsManager />)
    
    expect(screen.getByText(/gestión de productos/i)).toBeInTheDocument()
    expect(screen.getByText(/agregar, editar y gestionar productos/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /agregar nuevo producto/i })).toBeInTheDocument()
  })

  it('redirects non-admin users', () => {
    mockUseAuth.mockReturnValue({
      user: { ...mockAdminUser, role: 'customer' },
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      updateProfile: jest.fn(),
    })

    render(<AdminProductsManager />)
    
    expect(mockRouter.push).toHaveBeenCalledWith('/')
  })

  it('shows loading state', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      updateProfile: jest.fn(),
    })

    render(<AdminProductsManager />)
    
    expect(screen.getByText(/cargando/i)).toBeInTheDocument()
  })

  it('displays products list correctly', () => {
    render(<AdminProductsManager />)
    
    expect(screen.getByText('Producto 1')).toBeInTheDocument()
    expect(screen.getByText('Producto 2')).toBeInTheDocument()
    expect(screen.getByText('$99.99')).toBeInTheDocument()
    expect(screen.getByText('$149.99')).toBeInTheDocument()
    expect(screen.getByText('Electrónicos')).toBeInTheDocument()
    expect(screen.getByText('Ropa')).toBeInTheDocument()
  })

  it('shows stock information correctly', () => {
    render(<AdminProductsManager />)
    
    expect(screen.getByText('Stock: 10')).toBeInTheDocument()
    expect(screen.getByText('Stock: 5')).toBeInTheDocument()
  })

  it('opens create product modal', async () => {
    const user = userEvent.setup()
    render(<AdminProductsManager />)
    
    const addButton = screen.getByRole('button', { name: /agregar nuevo producto/i })
    await user.click(addButton)
    
    expect(screen.getByText(/agregar nuevo producto/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/nombre del producto/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/precio/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/categoría/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/stock/i)).toBeInTheDocument()
  })

  it('validates required fields in create form', async () => {
    const user = userEvent.setup()
    render(<AdminProductsManager />)
    
    const addButton = screen.getByRole('button', { name: /agregar nuevo producto/i })
    await user.click(addButton)
    
    const submitButton = screen.getByRole('button', { name: /crear producto/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/el nombre es requerido/i)).toBeInTheDocument()
      expect(screen.getByText(/la descripción es requerida/i)).toBeInTheDocument()
      expect(screen.getByText(/el precio es requerido/i)).toBeInTheDocument()
      expect(screen.getByText(/la categoría es requerida/i)).toBeInTheDocument()
      expect(screen.getByText(/el stock es requerido/i)).toBeInTheDocument()
    })
  })

  it('creates new product successfully', async () => {
    const user = userEvent.setup()
    
    // Mock successful API call
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    })
    
    render(<AdminProductsManager />)
    
    const addButton = screen.getByRole('button', { name: /agregar nuevo producto/i })
    await user.click(addButton)
    
    // Fill form
    await user.type(screen.getByLabelText(/nombre del producto/i), 'Nuevo Producto')
    await user.type(screen.getByLabelText(/descripción/i), 'Descripción del nuevo producto')
    await user.type(screen.getByLabelText(/precio/i), '199.99')
    await user.type(screen.getByLabelText(/categoría/i), 'Tecnología')
    await user.type(screen.getByLabelText(/stock/i), '15')
    
    // Select image
    const selectImageButton = screen.getByText('Select Image')
    await user.click(selectImageButton)
    
    const submitButton = screen.getByRole('button', { name: /crear producto/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        '¡Producto creado exitosamente!',
        'success'
      )
      expect(mockFetchProducts).toHaveBeenCalled()
    })
  })

  it('handles create product failure', async () => {
    const user = userEvent.setup()
    
    // Mock failed API call
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Error del servidor' })
    })
    
    render(<AdminProductsManager />)
    
    const addButton = screen.getByRole('button', { name: /agregar nuevo producto/i })
    await user.click(addButton)
    
    // Fill form
    await user.type(screen.getByLabelText(/nombre del producto/i), 'Nuevo Producto')
    await user.type(screen.getByLabelText(/descripción/i), 'Descripción del nuevo producto')
    await user.type(screen.getByLabelText(/precio/i), '199.99')
    await user.type(screen.getByLabelText(/categoría/i), 'Tecnología')
    await user.type(screen.getByLabelText(/stock/i), '15')
    
    const submitButton = screen.getByRole('button', { name: /crear producto/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        'Error del servidor',
        'error'
      )
    })
  })

  it('opens edit product modal', async () => {
    const user = userEvent.setup()
    render(<AdminProductsManager />)
    
    const editButtons = screen.getAllByText(/editar/i)
    await user.click(editButtons[0])
    
    expect(screen.getByText(/editar producto/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue('Producto 1')).toBeInTheDocument()
    expect(screen.getByDisplayValue('99.99')).toBeInTheDocument()
  })

  it('updates product successfully', async () => {
    const user = userEvent.setup()
    
    // Mock successful API call
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    })
    
    render(<AdminProductsManager />)
    
    const editButtons = screen.getAllByText(/editar/i)
    await user.click(editButtons[0])
    
    // Update name
    const nameInput = screen.getByDisplayValue('Producto 1')
    await user.clear(nameInput)
    await user.type(nameInput, 'Producto Actualizado')
    
    const submitButton = screen.getByRole('button', { name: /actualizar producto/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        '¡Producto actualizado exitosamente!',
        'success'
      )
      expect(mockFetchProducts).toHaveBeenCalled()
    })
  })

  it('deletes product successfully', async () => {
    const user = userEvent.setup()
    
    // Mock successful API call
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    })
    
    render(<AdminProductsManager />)
    
    const deleteButtons = screen.getAllByText(/eliminar/i)
    await user.click(deleteButtons[0])
    
    // Confirm deletion in alert dialog
    const confirmButton = screen.getByRole('button', { name: /eliminar/i })
    await user.click(confirmButton)
    
    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        '¡Producto eliminado exitosamente!',
        'success'
      )
      expect(mockFetchProducts).toHaveBeenCalled()
    })
  })

  it('shows empty state when no products exist', () => {
    mockUseProducts.mockReturnValue({
      products: [],
      loading: false,
      error: null,
      fetchProducts: mockFetchProducts,
      getProduct: jest.fn(),
    })
    
    render(<AdminProductsManager />)
    
    expect(screen.getByText(/no hay productos disponibles/i)).toBeInTheDocument()
  })

  it('shows products loading state', () => {
    mockUseProducts.mockReturnValue({
      products: [],
      loading: true,
      error: null,
      fetchProducts: mockFetchProducts,
      getProduct: jest.fn(),
    })
    
    render(<AdminProductsManager />)
    
    expect(screen.getByText(/cargando productos/i)).toBeInTheDocument()
  })

  it('handles products error state', () => {
    mockUseProducts.mockReturnValue({
      products: [],
      loading: false,
      error: 'Error al cargar productos',
      fetchProducts: mockFetchProducts,
      getProduct: jest.fn(),
    })
    
    render(<AdminProductsManager />)
    
    expect(screen.getByText(/error al cargar productos/i)).toBeInTheDocument()
  })

  it('validates price as positive number', async () => {
    const user = userEvent.setup()
    render(<AdminProductsManager />)
    
    const addButton = screen.getByRole('button', { name: /agregar nuevo producto/i })
    await user.click(addButton)
    
    const priceInput = screen.getByLabelText(/precio/i)
    await user.type(priceInput, '-10')
    
    const submitButton = screen.getByRole('button', { name: /crear producto/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/el precio debe ser mayor a 0/i)).toBeInTheDocument()
    })
  })

  it('validates stock as non-negative number', async () => {
    const user = userEvent.setup()
    render(<AdminProductsManager />)
    
    const addButton = screen.getByRole('button', { name: /agregar nuevo producto/i })
    await user.click(addButton)
    
    const stockInput = screen.getByLabelText(/stock/i)
    await user.type(stockInput, '-5')
    
    const submitButton = screen.getByRole('button', { name: /crear producto/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/el stock debe ser mayor o igual a 0/i)).toBeInTheDocument()
    })
  })
})