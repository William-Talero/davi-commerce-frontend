import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CheckoutForm from '@/components/checkout-form'
import { useAuth } from '@/lib/auth-context'
import { useCart } from '@/lib/cart-context'
import { useToast } from '@/lib/toast'

// Mock the hooks and modules
jest.mock('@/lib/auth-context')
jest.mock('@/lib/cart-context')
jest.mock('@/lib/toast')
jest.mock('@/lib/orders-backend')

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUseCart = useCart as jest.MockedFunction<typeof useCart>
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>

describe('CheckoutForm', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    first_name: 'Juan',
    last_name: 'Pérez',
    role: 'customer' as const,
    created_at: '2023-01-01',
  }

  const mockCartItems = [
    {
      id: '1',
      name: 'Producto 1',
      price: 99.99,
      quantity: 2,
      image_url: 'https://example.com/image1.jpg',
      description: 'Descripción 1',
      category: 'Electrónicos',
      stock: 10,
      created_at: '2023-01-01',
      updated_at: '2023-01-01'
    }
  ]

  const mockAddToast = jest.fn()
  const mockClearCart = jest.fn()

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      updateProfile: jest.fn(),
    })

    mockUseCart.mockReturnValue({
      items: mockCartItems,
      addToCart: jest.fn(),
      removeFromCart: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: mockClearCart,
      getCartTotal: jest.fn().mockReturnValue(199.98),
      getCartItemsCount: jest.fn().mockReturnValue(2),
    })

    mockUseToast.mockReturnValue({
      addToast: mockAddToast,
    })

    jest.clearAllMocks()
  })

  it('renders checkout form correctly for authenticated user', () => {
    render(<CheckoutForm />)
    
    expect(screen.getByText(/finalizar compra/i)).toBeInTheDocument()
    expect(screen.getByText(/información de envío/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/apellido/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/dirección/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/ciudad/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/código postal/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /realizar pedido/i })).toBeInTheDocument()
  })

  it('shows login message for unauthenticated user', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      updateProfile: jest.fn(),
    })

    render(<CheckoutForm />)
    
    expect(screen.getByText(/por favor, inicia sesión/i)).toBeInTheDocument()
  })

  it('shows empty cart message when cart is empty', () => {
    mockUseCart.mockReturnValue({
      items: [],
      addToCart: jest.fn(),
      removeFromCart: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
      getCartTotal: jest.fn().mockReturnValue(0),
      getCartItemsCount: jest.fn().mockReturnValue(0),
    })

    render(<CheckoutForm />)
    
    expect(screen.getByText(/tu carrito está vacío/i)).toBeInTheDocument()
  })

  it('pre-fills user information', () => {
    render(<CheckoutForm />)
    
    const firstNameInput = screen.getByLabelText(/nombre/i)
    const lastNameInput = screen.getByLabelText(/apellido/i)
    
    expect(firstNameInput).toHaveValue('Juan')
    expect(lastNameInput).toHaveValue('Pérez')
  })

  it('shows validation errors for empty required fields', async () => {
    const user = userEvent.setup()
    render(<CheckoutForm />)
    
    // Clear pre-filled values
    const firstNameInput = screen.getByLabelText(/nombre/i)
    const lastNameInput = screen.getByLabelText(/apellido/i)
    await user.clear(firstNameInput)
    await user.clear(lastNameInput)
    
    const submitButton = screen.getByRole('button', { name: /realizar pedido/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/el nombre es requerido/i)).toBeInTheDocument()
      expect(screen.getByText(/el apellido es requerido/i)).toBeInTheDocument()
      expect(screen.getByText(/la dirección es requerida/i)).toBeInTheDocument()
      expect(screen.getByText(/la ciudad es requerida/i)).toBeInTheDocument()
      expect(screen.getByText(/el código postal es requerido/i)).toBeInTheDocument()
    })
  })

  it('displays order summary correctly', () => {
    render(<CheckoutForm />)
    
    expect(screen.getByText(/resumen del pedido/i)).toBeInTheDocument()
    expect(screen.getByText('Producto 1')).toBeInTheDocument()
    expect(screen.getByText('Cantidad: 2')).toBeInTheDocument()
    expect(screen.getByText('$99.99')).toBeInTheDocument()
    expect(screen.getByText('$199.98')).toBeInTheDocument()
  })

  it('handles form submission successfully', async () => {
    const user = userEvent.setup()
    
    // Mock successful order creation
    const mockCreateOrder = jest.fn().mockResolvedValue({ success: true, orderId: 'order-123' })
    jest.doMock('@/lib/orders-backend', () => ({
      createOrder: mockCreateOrder
    }))
    
    render(<CheckoutForm />)
    
    const addressInput = screen.getByLabelText(/dirección/i)
    const cityInput = screen.getByLabelText(/ciudad/i)
    const zipInput = screen.getByLabelText(/código postal/i)
    const submitButton = screen.getByRole('button', { name: /realizar pedido/i })
    
    await user.type(addressInput, 'Calle Falsa 123')
    await user.type(cityInput, 'Bogotá')
    await user.type(zipInput, '12345')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.stringContaining('¡Pedido realizado exitosamente!'),
        'success'
      )
    })
  })

  it('handles form submission failure', async () => {
    const user = userEvent.setup()
    
    // Mock failed order creation
    const mockCreateOrder = jest.fn().mockResolvedValue({ success: false, error: 'Error del servidor' })
    jest.doMock('@/lib/orders-backend', () => ({
      createOrder: mockCreateOrder
    }))
    
    render(<CheckoutForm />)
    
    const addressInput = screen.getByLabelText(/dirección/i)
    const cityInput = screen.getByLabelText(/ciudad/i)
    const zipInput = screen.getByLabelText(/código postal/i)
    const submitButton = screen.getByRole('button', { name: /realizar pedido/i })
    
    await user.type(addressInput, 'Calle Falsa 123')
    await user.type(cityInput, 'Bogotá')
    await user.type(zipInput, '12345')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith('Error del servidor', 'error')
    })
  })

  it('disables form during submission', async () => {
    const user = userEvent.setup()
    
    // Mock slow order creation
    const mockCreateOrder = jest.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
    )
    jest.doMock('@/lib/orders-backend', () => ({
      createOrder: mockCreateOrder
    }))
    
    render(<CheckoutForm />)
    
    const addressInput = screen.getByLabelText(/dirección/i)
    const cityInput = screen.getByLabelText(/ciudad/i)
    const zipInput = screen.getByLabelText(/código postal/i)
    const submitButton = screen.getByRole('button', { name: /realizar pedido/i })
    
    await user.type(addressInput, 'Calle Falsa 123')
    await user.type(cityInput, 'Bogotá')
    await user.type(zipInput, '12345')
    await user.click(submitButton)
    
    expect(submitButton).toBeDisabled()
    expect(screen.getByText(/procesando pedido/i)).toBeInTheDocument()
  })

  it('validates postal code format', async () => {
    const user = userEvent.setup()
    render(<CheckoutForm />)
    
    const zipInput = screen.getByLabelText(/código postal/i)
    const submitButton = screen.getByRole('button', { name: /realizar pedido/i })
    
    await user.type(zipInput, 'abc')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/código postal inválido/i)).toBeInTheDocument()
    })
  })
})