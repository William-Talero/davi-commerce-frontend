import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RegisterForm from '@/components/register-form'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/lib/toast'

// Mock the hooks
jest.mock('@/lib/auth-context')
jest.mock('@/lib/toast')

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>

describe('RegisterForm', () => {
  const mockRegister = jest.fn()
  const mockAddToast = jest.fn()

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      login: jest.fn(),
      logout: jest.fn(),
      register: mockRegister,
      updateProfile: jest.fn(),
    })

    mockUseToast.mockReturnValue({
      addToast: mockAddToast,
    })

    jest.clearAllMocks()
  })

  it('renders register form correctly', () => {
    render(<RegisterForm />)
    
    expect(screen.getByText('Crear Cuenta')).toBeInTheDocument()
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/apellido/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument()
    expect(screen.getByText(/¿ya tienes cuenta\?/i)).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)
    
    const submitButton = screen.getByRole('button', { name: /crear cuenta/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/el nombre es requerido/i)).toBeInTheDocument()
      expect(screen.getByText(/el apellido es requerido/i)).toBeInTheDocument()
      expect(screen.getByText(/el correo electrónico es requerido/i)).toBeInTheDocument()
      expect(screen.getByText(/la contraseña es requerida/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)
    
    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const submitButton = screen.getByRole('button', { name: /crear cuenta/i })
    
    await user.type(emailInput, 'invalid-email')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/correo electrónico inválido/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for short password', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)
    
    const passwordInput = screen.getByLabelText(/contraseña/i)
    const submitButton = screen.getByRole('button', { name: /crear cuenta/i })
    
    await user.type(passwordInput, '123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/la contraseña debe tener al menos 6 caracteres/i)).toBeInTheDocument()
    })
  })

  it('calls register function with correct data', async () => {
    const user = userEvent.setup()
    mockRegister.mockResolvedValue({ success: true })
    
    render(<RegisterForm />)
    
    const firstNameInput = screen.getByLabelText(/nombre/i)
    const lastNameInput = screen.getByLabelText(/apellido/i)
    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const passwordInput = screen.getByLabelText(/contraseña/i)
    const submitButton = screen.getByRole('button', { name: /crear cuenta/i })
    
    await user.type(firstNameInput, 'Juan')
    await user.type(lastNameInput, 'Pérez')
    await user.type(emailInput, 'juan@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@example.com',
        password: 'password123'
      })
    })
  })

  it('shows error toast when registration fails', async () => {
    const user = userEvent.setup()
    mockRegister.mockResolvedValue({ success: false, error: 'El email ya está registrado' })
    
    render(<RegisterForm />)
    
    const firstNameInput = screen.getByLabelText(/nombre/i)
    const lastNameInput = screen.getByLabelText(/apellido/i)
    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const passwordInput = screen.getByLabelText(/contraseña/i)
    const submitButton = screen.getByRole('button', { name: /crear cuenta/i })
    
    await user.type(firstNameInput, 'Juan')
    await user.type(lastNameInput, 'Pérez')
    await user.type(emailInput, 'juan@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith('El email ya está registrado', 'error')
    })
  })

  it('shows success toast when registration succeeds', async () => {
    const user = userEvent.setup()
    mockRegister.mockResolvedValue({ success: true })
    
    render(<RegisterForm />)
    
    const firstNameInput = screen.getByLabelText(/nombre/i)
    const lastNameInput = screen.getByLabelText(/apellido/i)
    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const passwordInput = screen.getByLabelText(/contraseña/i)
    const submitButton = screen.getByRole('button', { name: /crear cuenta/i })
    
    await user.type(firstNameInput, 'Juan')
    await user.type(lastNameInput, 'Pérez')
    await user.type(emailInput, 'juan@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith('¡Cuenta creada exitosamente!', 'success')
    })
  })

  it('disables form during submission', async () => {
    const user = userEvent.setup()
    mockRegister.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)))
    
    render(<RegisterForm />)
    
    const firstNameInput = screen.getByLabelText(/nombre/i)
    const lastNameInput = screen.getByLabelText(/apellido/i)
    const emailInput = screen.getByLabelText(/correo electrónico/i)
    const passwordInput = screen.getByLabelText(/contraseña/i)
    const submitButton = screen.getByRole('button', { name: /crear cuenta/i })
    
    await user.type(firstNameInput, 'Juan')
    await user.type(lastNameInput, 'Pérez')
    await user.type(emailInput, 'juan@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)
    
    expect(submitButton).toBeDisabled()
    expect(firstNameInput).toBeDisabled()
    expect(lastNameInput).toBeDisabled()
    expect(emailInput).toBeDisabled()
    expect(passwordInput).toBeDisabled()
  })
})