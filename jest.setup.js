import '@testing-library/jest-dom'
import React from 'react'

// Mock Next.js router
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  beforePopState: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isFallback: false,
  loading: false,
  pathname: '/',
  route: '/',
  query: {},
  asPath: '/',
  basePath: '',
}

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    const { src, alt, fill, ...rest } = props
    return React.createElement('img', {
      src: src || '/placeholder.svg',
      alt: alt || '',
      ...rest
    })
  },
}))

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }) => React.createElement('button', props, children)
}))

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }) => React.createElement('div', props, children),
  CardContent: ({ children, ...props }) => React.createElement('div', props, children),
  CardHeader: ({ children, ...props }) => React.createElement('div', props, children),
  CardTitle: ({ children, ...props }) => React.createElement('h3', props, children),
}))

jest.mock('@/components/ui/input', () => ({
  Input: (props) => React.createElement('input', props)
}))

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }) => React.createElement('label', props, children)
}))

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...props }) => React.createElement('span', props, children)
}))

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, ...props }) => React.createElement('div', props, children),
  SelectContent: ({ children, ...props }) => React.createElement('div', props, children),
  SelectItem: ({ children, ...props }) => React.createElement('div', props, children),
  SelectTrigger: ({ children, ...props }) => React.createElement('button', props, children),
  SelectValue: ({ children, ...props }) => React.createElement('span', props, children),
}))

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open, ...props }) => open ? React.createElement('div', props, children) : null,
  DialogContent: ({ children, ...props }) => React.createElement('div', props, children),
  DialogHeader: ({ children, ...props }) => React.createElement('div', props, children),
  DialogTitle: ({ children, ...props }) => React.createElement('h2', props, children),
}))

jest.mock('@/components/ui/separator', () => ({
  Separator: (props) => React.createElement('hr', props)
}))

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Edit: (props) => React.createElement('svg', props, 'Edit'),
  Eye: (props) => React.createElement('svg', props, 'Eye'),
  Package: (props) => React.createElement('svg', props, 'Package'),
  MapPin: (props) => React.createElement('svg', props, 'MapPin'),
  Calendar: (props) => React.createElement('svg', props, 'Calendar'),
  CreditCard: (props) => React.createElement('svg', props, 'CreditCard'),
  User: (props) => React.createElement('svg', props, 'User'),
  X: (props) => React.createElement('svg', props, 'X'),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock fetch
global.fetch = jest.fn()

// Mock AbortSignal.timeout for older environments
if (!global.AbortSignal?.timeout) {
  global.AbortSignal = {
    ...global.AbortSignal,
    timeout: jest.fn(() => ({
      aborted: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }))
  }
}

// Mock console methods to reduce noise in tests
const originalError = console.error
const originalWarn = console.warn
beforeEach(() => {
  console.error = jest.fn()
  console.warn = jest.fn()
  jest.clearAllMocks()
})

afterEach(() => {
  console.error = originalError
  console.warn = originalWarn
})