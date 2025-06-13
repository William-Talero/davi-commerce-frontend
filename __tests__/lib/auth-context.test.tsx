import { renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/lib/auth-context'
import { ReactNode } from 'react'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock as any

// Mock fetch
global.fetch = jest.fn()

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    ;(global.fetch as jest.Mock).mockClear()
  })

  it('provides initial auth state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    expect(result.current.user).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(typeof result.current.login).toBe('function')
    expect(typeof result.current.logout).toBe('function')
    expect(typeof result.current.register).toBe('function')
    expect(typeof result.current.updateProfile).toBe('function')
  })

  it('loads user from localStorage on mount', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      first_name: 'Juan',
      last_name: 'Pérez',
      role: 'customer',
      created_at: '2023-01-01'
    }
    
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser))
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    expect(result.current.user).toEqual(mockUser)
  })

  it('handles login successfully', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      first_name: 'Juan',
      last_name: 'Pérez',
      role: 'customer',
      created_at: '2023-01-01'
    }
    
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        user: mockUser,
        token: 'fake-token'
      })
    })
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    let loginResult
    await act(async () => {
      loginResult = await result.current.login('test@example.com', 'password')
    })
    
    expect(loginResult).toEqual({ success: true })
    expect(result.current.user).toEqual(mockUser)
    expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser))
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'fake-token')
  })

  it('handles login failure', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({
        success: false,
        error: 'Credenciales inválidas'
      })
    })
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    let loginResult
    await act(async () => {
      loginResult = await result.current.login('test@example.com', 'wrongpassword')
    })
    
    expect(loginResult).toEqual({ success: false, error: 'Credenciales inválidas' })
    expect(result.current.user).toBeNull()
  })

  it('handles register successfully', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      first_name: 'Juan',
      last_name: 'Pérez',
      role: 'customer',
      created_at: '2023-01-01'
    }
    
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        user: mockUser,
        token: 'fake-token'
      })
    })
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    let registerResult
    await act(async () => {
      registerResult = await result.current.register({
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'test@example.com',
        password: 'password123'
      })
    })
    
    expect(registerResult).toEqual({ success: true })
    expect(result.current.user).toEqual(mockUser)
    expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser))
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'fake-token')
  })

  it('handles register failure', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({
        success: false,
        error: 'El email ya está registrado'
      })
    })
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    let registerResult
    await act(async () => {
      registerResult = await result.current.register({
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'test@example.com',
        password: 'password123'
      })
    })
    
    expect(registerResult).toEqual({ success: false, error: 'El email ya está registrado' })
    expect(result.current.user).toBeNull()
  })

  it('handles logout correctly', () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      first_name: 'Juan',
      last_name: 'Pérez',
      role: 'customer',
      created_at: '2023-01-01'
    }
    
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser))
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    expect(result.current.user).toEqual(mockUser)
    
    act(() => {
      result.current.logout()
    })
    
    expect(result.current.user).toBeNull()
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
  })

  it('handles updateProfile successfully', async () => {
    const initialUser = {
      id: '1',
      email: 'test@example.com',
      first_name: 'Juan',
      last_name: 'Pérez',
      role: 'customer',
      created_at: '2023-01-01'
    }
    
    const updatedUser = {
      ...initialUser,
      first_name: 'Carlos',
      last_name: 'García'
    }
    
    localStorageMock.getItem.mockReturnValue(JSON.stringify(initialUser))
    
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        user: updatedUser
      })
    })
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    let updateResult
    await act(async () => {
      updateResult = await result.current.updateProfile({
        firstName: 'Carlos',
        lastName: 'García'
      })
    })
    
    expect(updateResult).toEqual({ success: true })
    expect(result.current.user).toEqual(updatedUser)
    expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify(updatedUser))
  })

  it('handles updateProfile failure', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      first_name: 'Juan',
      last_name: 'Pérez',
      role: 'customer',
      created_at: '2023-01-01'
    }
    
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockUser))
    
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({
        success: false,
        error: 'Error al actualizar perfil'
      })
    })
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    let updateResult
    await act(async () => {
      updateResult = await result.current.updateProfile({
        firstName: 'Carlos',
        lastName: 'García'
      })
    })
    
    expect(updateResult).toEqual({ success: false, error: 'Error al actualizar perfil' })
    expect(result.current.user).toEqual(mockUser) // User should remain unchanged
  })

  it('handles fetch errors gracefully', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    let loginResult
    await act(async () => {
      loginResult = await result.current.login('test@example.com', 'password')
    })
    
    expect(loginResult).toEqual({ 
      success: false, 
      error: 'Error de conexión. Por favor, inténtalo de nuevo.' 
    })
  })

  it('handles invalid JSON in localStorage', () => {
    localStorageMock.getItem.mockReturnValue('invalid-json')
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    expect(result.current.user).toBeNull()
  })

  it('sets loading state during async operations', async () => {
    ;(global.fetch as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, user: {}, token: 'token' })
      }), 100))
    )
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    expect(result.current.loading).toBe(false)
    
    act(() => {
      result.current.login('test@example.com', 'password')
    })
    
    expect(result.current.loading).toBe(true)
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150))
    })
    
    expect(result.current.loading).toBe(false)
  })
})