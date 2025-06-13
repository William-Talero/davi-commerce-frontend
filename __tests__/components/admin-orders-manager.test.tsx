import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminOrdersManager from '@/components/admin-orders-manager'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/lib/toast'
import { getAllOrders, updateOrderStatus } from '@/lib/admin'
import { Order } from '@/lib/types'

// Mock the dependencies
jest.mock('@/lib/auth-context')
jest.mock('@/lib/toast')
jest.mock('@/lib/admin')
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
jest.mock('@/components/order-detail-modal', () => {
  return function MockOrderDetailModal({ isOpen, onClose, order }: any) {
    return isOpen ? (
      <div data-testid="order-detail-modal">
        <p>Order: {order?.id}</p>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null
  }
})

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>
const mockGetAllOrders = getAllOrders as jest.MockedFunction<typeof getAllOrders>
const mockUpdateOrderStatus = updateOrderStatus as jest.MockedFunction<typeof updateOrderStatus>

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
}

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}))

describe('AdminOrdersManager', () => {
  const mockAdminUser = {
    id: 'admin-1',
    email: 'admin@example.com',
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin' as const,
    created_at: '2023-01-01',
  }

  const mockOrders: Order[] = [
    {
      id: 'order-1',
      user_id: 'user-1',
      total_amount: 199.98,
      status: 'pending',
      shipping_address: {
        first_name: 'Juan',
        last_name: 'Pérez',
        address: 'Calle Falsa 123',
        city: 'Bogotá',
        zip_code: '12345',
        country: 'Colombia'
      },
      created_at: '2023-01-01T10:00:00Z',
      updated_at: '2023-01-01T10:00:00Z',
      user: {
        first_name: 'Juan',
        last_name: 'Pérez',
        email: 'juan@example.com'
      }
    },
    {
      id: 'order-2',
      user_id: 'user-2',
      total_amount: 99.99,
      status: 'shipped',
      shipping_address: {
        first_name: 'María',
        last_name: 'García',
        address: 'Carrera 10 #20-30',
        city: 'Medellín',
        zip_code: '54321',
        country: 'Colombia'
      },
      created_at: '2023-01-02T10:00:00Z',
      updated_at: '2023-01-02T10:00:00Z',
      user: {
        first_name: 'María',
        last_name: 'García',
        email: 'maria@example.com'
      }
    }
  ]

  const mockAddToast = jest.fn()

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

    mockGetAllOrders.mockResolvedValue(mockOrders)
    mockUpdateOrderStatus.mockResolvedValue(true)

    jest.clearAllMocks()
  })

  it('renders admin orders manager for admin user', async () => {
    render(<AdminOrdersManager />)
    
    expect(screen.getByText(/gestión de pedidos/i)).toBeInTheDocument()
    expect(screen.getByText(/ver y gestionar pedidos de clientes/i)).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.getByText(/pedido #order-1/i)).toBeInTheDocument()
      expect(screen.getByText(/pedido #order-2/i)).toBeInTheDocument()
    })
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

    render(<AdminOrdersManager />)
    
    expect(mockRouter.push).toHaveBeenCalledWith('/')
  })

  it('shows loading state initially', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      updateProfile: jest.fn(),
    })

    render(<AdminOrdersManager />)
    
    expect(screen.getByText(/cargando/i)).toBeInTheDocument()
  })

  it('displays order information correctly', async () => {
    render(<AdminOrdersManager />)
    
    await waitFor(() => {
      expect(screen.getByText('$199.98')).toBeInTheDocument()
      expect(screen.getByText('$99.99')).toBeInTheDocument()
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
      expect(screen.getByText('María García')).toBeInTheDocument()
      expect(screen.getByText('Pendiente')).toBeInTheDocument()
      expect(screen.getByText('Enviado')).toBeInTheDocument()
    })
  })

  it('displays shipping addresses correctly', async () => {
    render(<AdminOrdersManager />)
    
    await waitFor(() => {
      expect(screen.getByText('Calle Falsa 123')).toBeInTheDocument()
      expect(screen.getByText('Bogotá, 12345')).toBeInTheDocument()
      expect(screen.getByText('Carrera 10 #20-30')).toBeInTheDocument()
      expect(screen.getByText('Medellín, 54321')).toBeInTheDocument()
    })
  })

  it('handles order status updates', async () => {
    const user = userEvent.setup()
    render(<AdminOrdersManager />)
    
    await waitFor(() => {
      expect(screen.getByText(/pedido #order-1/i)).toBeInTheDocument()
    })

    // Find and click the status select for the first order
    const statusSelects = screen.getAllByRole('combobox')
    await user.click(statusSelects[0])
    
    // Select "Procesando" option
    const processingOption = screen.getByText('Procesando')
    await user.click(processingOption)
    
    expect(mockUpdateOrderStatus).toHaveBeenCalledWith('order-1', 'processing')
    
    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        '¡Estado del pedido actualizado exitosamente!',
        'success'
      )
    })
  })

  it('handles order status update failure', async () => {
    const user = userEvent.setup()
    mockUpdateOrderStatus.mockResolvedValue(false)
    
    render(<AdminOrdersManager />)
    
    await waitFor(() => {
      expect(screen.getByText(/pedido #order-1/i)).toBeInTheDocument()
    })

    const statusSelects = screen.getAllByRole('combobox')
    await user.click(statusSelects[0])
    
    const processingOption = screen.getByText('Procesando')
    await user.click(processingOption)
    
    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        'Error al actualizar el estado del pedido',
        'error'
      )
    })
  })

  it('opens order detail modal when "Ver Detalles" is clicked', async () => {
    const user = userEvent.setup()
    render(<AdminOrdersManager />)
    
    await waitFor(() => {
      expect(screen.getByText(/pedido #order-1/i)).toBeInTheDocument()
    })

    const detailButtons = screen.getAllByText(/ver detalles/i)
    await user.click(detailButtons[0])
    
    expect(screen.getByTestId('order-detail-modal')).toBeInTheDocument()
    expect(screen.getByText('Order: order-1')).toBeInTheDocument()
  })

  it('closes order detail modal', async () => {
    const user = userEvent.setup()
    render(<AdminOrdersManager />)
    
    await waitFor(() => {
      expect(screen.getByText(/pedido #order-1/i)).toBeInTheDocument()
    })

    const detailButtons = screen.getAllByText(/ver detalles/i)
    await user.click(detailButtons[0])
    
    expect(screen.getByTestId('order-detail-modal')).toBeInTheDocument()
    
    const closeButton = screen.getByText('Close')
    await user.click(closeButton)
    
    expect(screen.queryByTestId('order-detail-modal')).not.toBeInTheDocument()
  })

  it('shows empty state when no orders exist', async () => {
    mockGetAllOrders.mockResolvedValue([])
    
    render(<AdminOrdersManager />)
    
    await waitFor(() => {
      expect(screen.getByText(/no se encontraron pedidos/i)).toBeInTheDocument()
    })
  })

  it('translates order statuses correctly', async () => {
    const ordersWithAllStatuses: Order[] = [
      { ...mockOrders[0], status: 'pending' },
      { ...mockOrders[0], id: 'order-2', status: 'processing' },
      { ...mockOrders[0], id: 'order-3', status: 'shipped' },
      { ...mockOrders[0], id: 'order-4', status: 'delivered' },
      { ...mockOrders[0], id: 'order-5', status: 'cancelled' },
    ]
    
    mockGetAllOrders.mockResolvedValue(ordersWithAllStatuses)
    
    render(<AdminOrdersManager />)
    
    await waitFor(() => {
      expect(screen.getByText('Pendiente')).toBeInTheDocument()
      expect(screen.getByText('Procesando')).toBeInTheDocument()
      expect(screen.getByText('Enviado')).toBeInTheDocument()
      expect(screen.getByText('Entregado')).toBeInTheDocument()
      expect(screen.getByText('Cancelado')).toBeInTheDocument()
    })
  })

  it('handles shipping address parsing correctly', async () => {
    const orderWithJsonAddress = {
      ...mockOrders[0],
      shipping_address: JSON.stringify({
        firstName: 'Test',
        lastName: 'User',
        address: 'Test Address 123',
        city: 'Test City',
        zipCode: '99999'
      })
    }
    
    mockGetAllOrders.mockResolvedValue([orderWithJsonAddress])
    
    render(<AdminOrdersManager />)
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument()
      expect(screen.getByText('Test Address 123')).toBeInTheDocument()
      expect(screen.getByText('Test City, 99999')).toBeInTheDocument()
    })
  })

  it('handles special street field JSON parsing', async () => {
    const orderWithStreetJson = {
      ...mockOrders[0],
      shipping_address: {
        street: JSON.stringify({
          firstName: 'Street',
          lastName: 'User',
          address: 'Street Address 456',
          city: 'Street City'
        }),
        city: 'DefaultCity',
        zipCode: '88888'
      }
    }
    
    mockGetAllOrders.mockResolvedValue([orderWithStreetJson])
    
    render(<AdminOrdersManager />)
    
    await waitFor(() => {
      expect(screen.getByText('Street User')).toBeInTheDocument()
      expect(screen.getByText('Street Address 456')).toBeInTheDocument()
      expect(screen.getByText('Street City')).toBeInTheDocument()
    })
  })
})