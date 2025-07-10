import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Create axios instance with config
const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add token interceptor
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor for token expiry
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Redirect to login or refresh page
            window.location.reload();
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
    user?: User;
    message: string;
}

// Helper function to transform user data
const transformUser = (item: any): User => ({
    id: item._id || item.id,
    name: item.name,
    email: item.email,
    role: item.role || 'user',
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
});

// Auth Service
export const authService = {
    // Login user
    login: async (credentials: LoginRequest): Promise<AuthResponse> => {
        try {
            console.log('🔍 Calling Login API:', `${API_URL}/auth/login`);

            // Validate credentials
            if (!credentials.email || !credentials.password) {
                throw new Error('Email và mật khẩu là bắt buộc');
            }

            // ✅ FIX: Đổi endpoint từ /user/login → /auth/login
            const response = await apiClient.post('/auth/login', credentials);

            console.log('📦 Raw Login Response:', response.data);

            // Transform response
            const authResponse: AuthResponse = {
                success: response.data.success,
                token: response.data.token,
                user: response.data.user ? transformUser(response.data.user) : undefined,
                message: response.data.message || 'Đăng nhập thành công'
            };

            console.log('✅ Transformed auth response:', authResponse);
            return authResponse;

        } catch (error: unknown) {
            console.error('❌ Error during login:', error);

            if (axios.isAxiosError(error)) {
                if (error.response) {
                    console.error('❌ Response error:', error.response.data);
                    console.error('❌ Response status:', error.response.status);

                    // Handle specific error status codes
                    switch (error.response.status) {
                        case 400:
                            throw new Error('Thông tin đăng nhập không hợp lệ');
                        case 401:
                            throw new Error('Email hoặc mật khẩu không đúng');
                        case 403:
                            throw new Error('Tài khoản bị khóa');
                        case 404:
                            throw new Error('Tài khoản không tồn tại');
                        case 500:
                            throw new Error('Lỗi server, vui lòng thử lại sau');
                        default:
                            throw new Error(error.response.data?.message || 'Đăng nhập thất bại');
                    }
                } else if (error.request) {
                    throw new Error('Không thể kết nối đến server');
                } else {
                    throw new Error('Lỗi không xác định');
                }
            }

            throw new Error(`Đăng nhập thất bại: ${error}`);
        }
    },

    // Register new user
    register: async (userData: RegisterRequest): Promise<AuthResponse> => {
        try {
            console.log('🔍 Calling Register API:', `${API_URL}/auth/register`);

            // Validate user data
            if (!userData.name || !userData.email || !userData.password) {
                throw new Error('Tất cả các trường là bắt buộc');
            }

            if (userData.password.length < 6) {
                throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
            }

            // ✅ FIX: Đổi endpoint từ /user/register → /auth/register
            const response = await apiClient.post('/auth/register', userData);

            console.log('📦 Raw Register Response:', response.data);

            // Transform response
            const authResponse: AuthResponse = {
                success: response.data.success,
                token: response.data.token,
                user: response.data.user ? transformUser(response.data.user) : undefined,
                message: response.data.message || 'Đăng ký thành công'
            };

            console.log('✅ Transformed register response:', authResponse);
            return authResponse;

        } catch (error: unknown) {
            console.error('❌ Error during registration:', error);

            if (axios.isAxiosError(error)) {
                if (error.response) {
                    console.error('❌ Response error:', error.response.data);
                    console.error('❌ Response status:', error.response.status);

                    // Handle specific error status codes
                    switch (error.response.status) {
                        case 400:
                            throw new Error('Thông tin đăng ký không hợp lệ');
                        case 409:
                            throw new Error('Email đã được sử dụng');
                        case 500:
                            throw new Error('Lỗi server, vui lòng thử lại sau');
                        default:
                            throw new Error(error.response.data?.message || 'Đăng ký thất bại');
                    }
                } else if (error.request) {
                    throw new Error('Không thể kết nối đến server');
                } else {
                    throw new Error('Lỗi không xác định');
                }
            }

            throw new Error(`Đăng ký thất bại: ${error}`);
        }
    },

    // Get current user profile
    getCurrentUser: async (): Promise<User> => {
        try {
            console.log('🔍 Calling Get User API:', `${API_URL}/auth/profile`);

            // ✅ FIX: Đổi endpoint từ /user/profile → /auth/profile
            const response = await apiClient.get('/auth/profile');

            console.log('📦 Raw User Response:', response.data);

            // Transform user data
            const user: User = transformUser(response.data);

            console.log('✅ Transformed user:', user);
            return user;

        } catch (error: unknown) {
            console.error('❌ Error fetching user:', error);

            if (axios.isAxiosError(error)) {
                if (error.response) {
                    switch (error.response.status) {
                        case 401:
                            throw new Error('Phiên đăng nhập hết hạn');
                        case 404:
                            throw new Error('Người dùng không tồn tại');
                        case 500:
                            throw new Error('Lỗi server, vui lòng thử lại sau');
                        default:
                            throw new Error(error.response.data?.message || 'Lấy thông tin người dùng thất bại');
                    }
                } else if (error.request) {
                    throw new Error('Không thể kết nối đến server');
                } else {
                    throw new Error('Lỗi không xác định');
                }
            }

            throw new Error(`Lấy thông tin người dùng thất bại: ${error}`);
        }
    },

    // Logout user
    logout: async (): Promise<void> => {
        try {
            console.log('🔍 Calling Logout API:', `${API_URL}/auth/logout`);

            // ✅ FIX: Đổi endpoint từ /user/logout → /auth/logout
            await apiClient.post('/auth/logout');

            console.log('✅ Logout successful');

        } catch (error: unknown) {
            console.error('❌ Error during logout:', error);
            // Continue with local logout even if API fails
        } finally {
            // Always clear local storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    },

    // Refresh token
    refreshToken: async (): Promise<string> => {
        try {
            console.log('🔍 Calling Refresh Token API:', `${API_URL}/auth/refresh`);

            // ✅ FIX: Đổi endpoint từ /user/refresh → /auth/refresh
            const response = await apiClient.post('/auth/refresh');

            console.log('📦 Raw Refresh Response:', response.data);

            const newToken = response.data.token;

            if (newToken) {
                localStorage.setItem('token', newToken);
                console.log('✅ Token refreshed successfully');
                return newToken;
            } else {
                throw new Error('No token received');
            }

        } catch (error: unknown) {
            console.error('❌ Error refreshing token:', error);

            // Clear storage and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            throw new Error('Phiên đăng nhập hết hạn');
        }
    }
};

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