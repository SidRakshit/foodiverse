export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface BackendFridgeItem {
  id: string;
  name: string;
  quantity: number;
  addedBy: string;
  dateAdded: Date;
  expirationDate?: Date;
  category: 'dairy' | 'meat' | 'vegetables' | 'fruits' | 'leftovers' | 'beverages' | 'condiments' | 'other';
  status: 'available' | 'claimed' | 'completed';
  photo_url?: string;
  apartment_number?: string;
  building_number?: string;
  building_id?: string;
  user_id?: string;
}

export interface CreateFridgeItemRequest {
  item_name: string;
  photo_url?: string;
  apartment_number?: string;
  building_number?: string;
  days_to_expiry?: number;
  quantity?: number;
  category?: string;
}

export interface UpdateFridgeRequest {
  id?: string;
  status?: string;
  apartment_id?: string;
  building_id?: string;
  items?: Array<{
    id?: string;
    name: string;
    days_to_expiry?: number;
    status?: string;
  }>;
}

class ApiService {
  private baseUrl: string;
  private authToken: string | null = null;
  private isOffline: boolean = false;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    console.log('🔗 ApiService initialized with baseUrl:', this.baseUrl);
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log(`📡 Making ${options.method || 'GET'} request to:`, url);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.warn(`❌ API request failed with status ${response.status}:`, url);
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        this.isOffline = response.status >= 500;
        return { error: errorData.error || `HTTP ${response.status}: ${response.statusText}` };
      }

      const data = await response.json();
      console.log('✅ API request successful:', endpoint, data);
      this.isOffline = false;
      return { data };
    } catch (error: any) {
      this.isOffline = true;
      console.error('💥 API request failed:', {
        url,
        error: error.message,
        name: error.name,
        cause: error.cause
      });
      
      // Provide more specific error messages
      let errorMessage = 'Network error - backend may be offline';
      
      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout - backend is taking too long to respond';
      } else if (error.message?.includes('fetch')) {
        errorMessage = 'Cannot connect to backend server. Please ensure the backend is running on ' + this.baseUrl;
      } else if (error.message?.includes('CORS')) {
        errorMessage = 'CORS error - backend may not allow requests from this origin';
      }
      
      return { error: errorMessage };
    }
  }

  // Get fridge items with optional filtering
  async getFridgeItems(apartmentId?: string, buildingId?: string): Promise<ApiResponse<BackendFridgeItem[]>> {
    const queryParams = new URLSearchParams();
    if (apartmentId) queryParams.append('apartment_id', apartmentId);
    if (buildingId) queryParams.append('building_id', buildingId);
    
    const endpoint = `/listings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest<BackendFridgeItem[]>(endpoint);
  }

  // Add a new fridge item
  async addFridgeItem(item: CreateFridgeItemRequest): Promise<ApiResponse<BackendFridgeItem>> {
    return this.makeRequest<BackendFridgeItem>('/listings', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  // Update fridge items (single or bulk)
  async updateFridge(update: UpdateFridgeRequest): Promise<ApiResponse<any>> {
    return this.makeRequest('/listings', {
      method: 'PUT',
      body: JSON.stringify(update),
    });
  }

  // Delete a fridge item
  async deleteFridgeItem(itemId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/listings/${itemId}`, {
      method: 'DELETE',
    });
  }

  // Legacy endpoints for compatibility
  async claimItem(itemId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/listings/${itemId}/claim`, {
      method: 'PUT',
    });
  }

  async completeItem(itemId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/listings/${itemId}/complete`, {
      method: 'PUT',
    });
  }

  // Health check
  async ping(): Promise<boolean> {
    try {
      console.log('🏥 Checking backend health...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for health check
      
      const response = await fetch(`${this.baseUrl}/listings/health`, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      const isHealthy = response.ok;
      
      if (isHealthy) {
        console.log('💚 Backend is healthy');
        this.isOffline = false;
      } else {
        console.warn('💛 Backend health check failed:', response.status);
        this.isOffline = true;
      }
      
      return isHealthy;
    } catch (error: any) {
      console.error('❤️‍🩹 Backend health check error:', error.message);
      this.isOffline = true;
      return false;
    }
  }

  // Get current offline status
  isOfflineMode(): boolean {
    return this.isOffline;
  }

  // Manual connection test
  async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      console.log('🔍 Testing connection to backend...');
      
      // Test basic connectivity
      const basicResponse = await fetch(this.baseUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      if (!basicResponse.ok) {
        return {
          success: false,
          message: `Backend server responded with ${basicResponse.status}: ${basicResponse.statusText}`,
          details: { status: basicResponse.status, url: this.baseUrl }
        };
      }
      
      // Test health endpoint
      const healthCheck = await this.ping();
      
      if (!healthCheck) {
        return {
          success: false,
          message: 'Backend server is running but health check failed',
          details: { healthEndpoint: `${this.baseUrl}/listings/health` }
        };
      }
      
      return {
        success: true,
        message: 'Backend connection successful',
        details: { baseUrl: this.baseUrl }
      };
      
    } catch (error: any) {
      return {
        success: false,
        message: `Connection failed: ${error.message}`,
        details: { 
          error: error.name,
          baseUrl: this.baseUrl,
          suggestion: 'Make sure the backend server is running on ' + this.baseUrl
        }
      };
    }
  }
}

// Singleton instance
export const apiService = new ApiService();
export default ApiService;

// Test connection on startup (only in development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  setTimeout(async () => {
    const result = await apiService.testConnection();
    if (result.success) {
      console.log('🎉', result.message);
    } else {
      console.error('🚨 Backend Connection Issue:', result.message);
      console.error('💡 Details:', result.details);
      console.error('🔧 To fix: Make sure to run "cd backend && npm run dev" in a separate terminal');
    }
  }, 1000);
}
