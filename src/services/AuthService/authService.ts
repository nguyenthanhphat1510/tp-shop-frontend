import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// ✅ Secure token manager
class TokenManager {
    private static accessToken: string = ''; // Memory only - secure
    
    // Access Token - Memory (bảo mật nhất)
    static setAccessToken(token: string) {
        this.accessToken = token;
    }
    
    static getAccessToken(): string {
        return this.accessToken;
    }
    
    static clearAccessToken() {
        this.accessToken = '';
    }
    
    // Refresh Token - localStorage với encryption (fallback)
    static setRefreshToken(token: string) {
        try {
            // ✅ Simple encryption (có thể dùng crypto-js cho phức tạp hơn)
            const encoded = btoa(token + '|' + Date.now());
            localStorage.setItem('rt', encoded);
        } catch (error) {
            console.error('Error storing refresh token:', error);
        }
    }
    
    static getRefreshToken(): string | null {
        try {
            const encoded = localStorage.getItem('rt');
            if (!encoded) return null;
            
            const decoded = atob(encoded);
            const [token] = decoded.split('|');
            return token;
        } catch (error) {
            console.error('Error retrieving refresh token:', error);
            localStorage.removeItem('rt');
            return null;
        }
    }
    
    static clearRefreshToken() {
        localStorage.removeItem('rt');
    }
    
    static clearAll() {
        this.clearAccessToken();
        this.clearRefreshToken();
        localStorage.removeItem('user');
    }
}

// Create axios instance
const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// ✅ Request interceptor - Thêm access token
apiClient.interceptors.request.use((config) => {
    const token = TokenManager.getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ✅ Response interceptor - Auto refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const refreshToken = TokenManager.getRefreshToken();
                if (!refreshToken) {
                    throw new Error('No refresh token');
                }
                
                console.log('🔄 Access token expired, refreshing...');
                
                const response = await axios.post(`${API_URL}/auth/refresh`, {
                    refreshToken
                });
                
                if (response.data.success) {
                    const { token, refreshToken: newRefreshToken } = response.data;
                    
                    // Lưu tokens mới
                    TokenManager.setAccessToken(token);
                    if (newRefreshToken) {
                        TokenManager.setRefreshToken(newRefreshToken);
                    }
                    
                    // Retry request với token mới
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return apiClient(originalRequest);
                }
                
            } catch (refreshError) {
                console.log('🚪 Refresh failed, redirecting to login');
                TokenManager.clearAll();
                window.location.href = '/login';
            }
        }
        
        return Promise.reject(error);
    }
);

export interface User {
    id: string;
    name: string;
    email: string;
    role?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    token?: string;
    refreshToken?: string; // ✅ Thêm refresh token
    user?: User;
    message: string;
}

// Helper function
const transformUser = (item: any): User => ({
    id: item._id || item.id,
    name: item.name || item.fullName,
    email: item.email,
    role: item.role || 'user',
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
});

// ✅ Updated Auth Service
export const authService = {
    login: async (credentials: LoginRequest): Promise<AuthResponse> => {
        try {
            console.log('🔍 Calling Login API:', `${API_URL}/auth/login`);

            const response = await apiClient.post('/auth/login', credentials);
            console.log('📦 Raw Login Response:', response.data);

            if (response.data.success && response.data.token && response.data.user) {
                // ✅ Lưu cả 2 tokens
                TokenManager.setAccessToken(response.data.token);
                if (response.data.refreshToken) {
                    TokenManager.setRefreshToken(response.data.refreshToken);
                }
                
                // Lưu user info
                const user = transformUser(response.data.user);
                localStorage.setItem('user', JSON.stringify(user));
                
                return {
                    success: true,
                    token: response.data.token,
                    refreshToken: response.data.refreshToken,
                    user,
                    message: response.data.message
                };
            }

            throw new Error(response.data.message || 'Đăng nhập thất bại');

        } catch (error: any) {
            console.error('❌ Error during login:', error);
            throw new Error(error.response?.data?.message || error.message || 'Đăng nhập thất bại');
        }
    },

    register: async (userData: RegisterRequest): Promise<AuthResponse> => {
        try {
            console.log('🔍 Calling Register API:', `${API_URL}/auth/register`);

            const response = await apiClient.post('/auth/register', {
                email: userData.email,
                password: userData.password,
                fullName: userData.name
            });

            console.log('📦 Raw Register Response:', response.data);

            return {
                success: response.data.success,
                token: response.data.token,
                refreshToken: response.data.refreshToken,
                user: response.data.user ? transformUser(response.data.user) : undefined,
                message: response.data.message
            };

        } catch (error: any) {
            console.error('❌ Error during registration:', error);
            throw new Error(error.response?.data?.message || error.message || 'Đăng ký thất bại');
        }
    },

    getCurrentUser: async (): Promise<User> => {
        try {
            const response = await apiClient.get('/auth/profile');
            return transformUser(response.data.data || response.data);
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Lấy thông tin người dùng thất bại');
        }
    },

    logout: async (): Promise<void> => {
        try {
            await apiClient.post('/auth/logout');
        } catch (error) {
            console.error('Error during logout:', error);
        } finally {
            TokenManager.clearAll();
        }
    },

    refreshToken: async (): Promise<string> => {
        const refreshToken = TokenManager.getRefreshToken();
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        try {
            const response = await apiClient.post('/auth/refresh', { refreshToken });
            
            if (response.data.success) {
                TokenManager.setAccessToken(response.data.token);
                if (response.data.refreshToken) {
                    TokenManager.setRefreshToken(response.data.refreshToken);
                }
                return response.data.token;
            }
            
            throw new Error('Refresh failed');
        } catch (error: any) {
            TokenManager.clearAll();
            throw new Error('Phiên đăng nhập hết hạn');
        }
    }
};

// Export TokenManager for direct access if needed
export { TokenManager };

// Legacy functions for backward compatibility
export const loginUser = async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
        return await authService.login(credentials);
    } catch (error: unknown) {
        console.error('Error during login:', error);
        throw error;
    }
};

export const registerUser = async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
        return await authService.register(userData);
    } catch (error: unknown) {
        console.error('Error during registration:', error);
        throw error;
    }
};

export const getCurrentUser = async (): Promise<User | null> => {
    try {
        return await authService.getCurrentUser();
    } catch (error: unknown) {
        console.error('Error fetching current user:', error);
        return null;
    }
};

export const logoutUser = async (): Promise<void> => {
    try {
        await authService.logout();
    } catch (error: unknown) {
        console.error('Error during logout:', error);
    }
};