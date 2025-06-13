import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginForm from '@/components/login-form'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/lib/toast'

// Mock the hooks
jest.mock('@/lib/auth-context')
jest.mock('@/lib/toast')

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>

describe('LoginForm', () => {
  const mockLogin = jest.fn()
  const mockAddToast = jest.fn()

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      login: mockLogin,
      logout: jest.fn(),
      register: jest.fn(),
      updateProfile: jest.fn(),
    })

    mockUseToast.mockReturnValue({
      addToast: mockAddToast,
    })

    jest.clearAllMocks()
  })

  it('renders login form correctly', () => {
    render(<LoginForm />)
    
    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument()
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
    expect(screen.getByText(/¿no tienes cuenta\?/i)).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/el correo electrónico es requerido/i)).toBeInTheDocument()
      expect(screen.getByText(/la contraseña es requerida/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })
    
    await user.type(emailInput, 'invalid-email')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/correo electrónico inválido/i)).toBeInTheDocument()
    })
  })

  it('calls login function with correct credentials', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue({ success: true })
    
    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const passwordInput = screen.getByLabelText(/contraseña/i)
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('shows error toast when login fails', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue({ success: false, error: 'Credenciales inválidas' })
    
    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const passwordInput = screen.getByLabelText(/contraseña/i)
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrongpassword')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith('Credenciales inválidas', 'error')
    })
  })

  it('shows success toast when login succeeds', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue({ success: true })
    
    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const passwordInput = screen.getByLabelText(/contraseña/i)
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith('¡Inicio de sesión exitoso!', 'success')
    })
  })

  it('disables form during submission', async () => {
    const user = userEvent.setup()
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)))
    
    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const passwordInput = screen.getByLabelText(/contraseña/i)
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i })
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    expect(submitButton).toBeDisabled()
    expect(emailInput).toBeDisabled()
    expect(passwordInput).toBeDisabled()
  })
})