const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  refreshTokenFromStorage(): void {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('auth_token');
      if (storedToken && storedToken !== this.token) {
        this.token = storedToken;
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };


    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle empty responses
      const text = await response.text();
      if (!text) return {} as T;
      
      return JSON.parse(text);
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Authentication endpoints
  async login(email: string, password: string) {
    const response = await this.request<ApiResponse<{ user: any; accessToken: string }>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.data?.accessToken) {
      this.setToken(response.data.accessToken);
    }
    
    return response.data;
  }

  async register(email: string, password: string, firstName: string, lastName: string) {
    const response = await this.request<ApiResponse<{ user: any; accessToken: string }>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ 
        email, 
        password, 
        firstName, 
        lastName 
      }),
    });
    
    if (response.data?.accessToken) {
      this.setToken(response.data.accessToken);
    }
    
    return response.data;
  }

  // User endpoints
  async getCurrentUser() {
    return this.request<any>('/users/me');
  }

  async updateCurrentUser(updates: any) {
    return this.request<any>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async getAllUsers() {
    return this.request<any[]>('/users');
  }

  async getUserById(id: string) {
    return this.request<any>(`/users/${id}`);
  }

  async updateUser(id: string, updates: any) {
    return this.request<any>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteUser(id: string) {
    return this.request<{ message: string }>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Product endpoints
  async getProducts(params?: { category?: string; search?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.search) searchParams.append('search', params.search);
    
    const queryString = searchParams.toString();
    return this.request<any[]>(`/products${queryString ? `?${queryString}` : ''}`);
  }

  async getProductById(id: string) {
    return this.request<any>(`/products/${id}`);
  }

  async createProduct(product: any) {
    return this.request<any>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: string, updates: any) {
    return this.request<any>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteProduct(id: string) {
    return this.request<{ message: string }>(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Order endpoints
  async getOrders() {
    return this.request<any[]>('/orders');
  }

  async getOrdersByUser(userId: string) {
    return this.request<any[]>(`/orders/user/${userId}`);
  }

  async getOrderById(id: string) {
    return this.request<any>(`/orders/${id}`);
  }

  async createOrder(orderData: any) {
    return this.request<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrder(id: string, updates: any) {
    return this.request<any>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteOrder(id: string) {
    return this.request<{ message: string }>(`/orders/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin endpoints
  async getAllOrders() {
    return this.request<any[]>('/orders');
  }

  async updateOrderStatus(id: string, status: string) {
    return this.request<any>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getLowStockProducts() {
    return this.request<any[]>('/products?lowStock=true');
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Utility function to check if backend is available
export async function isBackendAvailable(): Promise<boolean> {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'GET',
      // Add timeout
      signal: AbortSignal.timeout(2000),
    });
    return response.ok;
  } catch (error) {
    console.warn('Backend not available:', error);
    return false;
  }
}