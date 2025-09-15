import { LoginRequest, RegisterRequest, User } from '@/types/auth';
import apiClient, { TokenManager } from '../utils/apiClient';

// Helper function
const transformUser = (item: any): User => ({
    id: item._id || item.id,
    name: item.name || item.fullName,
    email: item.email,
    role: item.role || 'user',
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
});

// ✅ Complete Auth Service
export const authService = {
    login: async (credentials: LoginRequest): Promise<Response> => {
        try {
            console.log('🔍 Calling Login API');

            const response = await apiClient.post('/auth/login', credentials);
            console.log('📦 Raw Login Response:', response.data);

            if (response.data.success && response.data.token && response.data.user) {
                TokenManager.setAccessToken(response.data.token);
                if (response.data.refreshToken) {
                    TokenManager.setRefreshToken(response.data.refreshToken);
                }
                
                const user = transformUser(response.data.user);
                localStorage.setItem('user', JSON.stringify(user));
                
                // Trigger AuthContext update
                window.dispatchEvent(new Event('auth-login'));
                
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

    // ✅ THÊM: Register method
    register: async (userData: RegisterRequest): Promise<Response> => {
        try {
            console.log('🔍 Calling Register API');

            const response = await apiClient.post('/auth/register', userData);
            console.log('📦 Raw Register Response:', response.data);

            if (response.data.success) {
                // Nếu backend trả về token luôn sau khi register
                if (response.data.token && response.data.user) {
                    TokenManager.setAccessToken(response.data.token);
                    if (response.data.refreshToken) {
                        TokenManager.setRefreshToken(response.data.refreshToken);
                    }
                    
                    const user = transformUser(response.data.user);
                    localStorage.setItem('user', JSON.stringify(user));
                    
                    // Trigger AuthContext update
                    window.dispatchEvent(new Event('auth-login'));
                }
                
                return {
                    success: true,
                    token: response.data.token,
                    refreshToken: response.data.refreshToken,
                    user: response.data.user ? transformUser(response.data.user) : null,
                    message: response.data.message || 'Đăng ký thành công'
                };
            }

            throw new Error(response.data.message || 'Đăng ký thất bại');

        } catch (error: any) {
            console.error('❌ Error during register:', error);
            throw new Error(error.response?.data?.message || error.message || 'Đăng ký thất bại');
        }
    },
logout: async (): Promise<void> => {
    try {
        await apiClient.post('/auth/logout');
    } catch (error) {
        console.error('Error during logout:', error);
    } finally {
        // ✅ Trực tiếp xóa mọi token khỏi localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken'); // Loại bỏ key cũ nếu có
        localStorage.removeItem('rt');
        localStorage.removeItem('user');
        
        // Log để debug
        console.log('🧹 Đã xóa tất cả tokens khỏi localStorage');
        
        TokenManager.clearAll();
        
        // Reset state của app khác nếu cần
        sessionStorage.clear(); // Xóa cả session storage
        
        // Trigger AuthContext update
        window.dispatchEvent(new Event('auth-logout'));
    }
},

    // ✅ THÊM: Get current user method
    getCurrentUser: async (): Promise<User | null> => {
        try {
            console.log('🔍 Calling Get Current User API');

            const response = await apiClient.get('/auth/me');
            console.log('📦 Raw Current User Response:', response.data);

            if (response.data.success && response.data.user) {
                const user = transformUser(response.data.user);
                localStorage.setItem('user', JSON.stringify(user));
                return user;
            }

            return null;

        } catch (error: any) {
            console.error('⚠️ Error getting current user:', error);
            
            // ✅ CHỈ clear tokens nếu chắc chắn là unauthorized
            if (error.response?.status === 401 && error.response?.data?.message?.includes('token')) {
                console.log('🚪 Confirmed token invalid, clearing');
                TokenManager.clearAll();
                window.dispatchEvent(new Event('auth-logout'));
            } else {
                console.log('⚠️ Network/temporary error, not logging out');
            }
            
            return null;
        }
    },

    // ✅ THÊM: Refresh tokens method
    refreshTokens: async (): Promise<boolean> => {
        try {
            const refreshToken = TokenManager.getRefreshToken();
            if (!refreshToken) {
                console.log('⚠️ No refresh token available');
                return false; // ✅ Chỉ return false, không clear tokens ngay
            }

            console.log('🔄 Refreshing tokens...');

            // ✅ Sử dụng apiClient để consistent với login thường
            const response = await apiClient.post('/auth/refresh', {
                refreshToken
            });

            if (response.data.success) {
                const { token, refreshToken: newRefreshToken } = response.data;
                
                TokenManager.setAccessToken(token);
                if (newRefreshToken) {
                    TokenManager.setRefreshToken(newRefreshToken);
                }
                
                // ✅ Update user info nếu có (giống login thường)
                if (response.data.user) {
                    const user = transformUser(response.data.user);
                    localStorage.setItem('user', JSON.stringify(user));
                    
                    // ✅ Trigger event giống login thường
                    window.dispatchEvent(new Event('auth-login'));
                }
                
                console.log('✅ Tokens refreshed successfully');
                return true;
            }

            return false;

        } catch (error: any) {
            console.error('⚠️ Error refreshing tokens:', error);
            
            // ✅ CHỈ clear tokens khi chắc chắn refresh token invalid
            if (error.response?.status === 401 || error.response?.status === 403) {
                console.log('🚪 Refresh token invalid, clearing');
                TokenManager.clearAll();
                window.dispatchEvent(new Event('auth-logout'));
            } else {
                console.log('⚠️ Network/temporary error, not clearing tokens');
            }
            
            return false;
        }
    },

    // ✅ THÊM: Check if user is authenticated
    isAuthenticated: (): boolean => {
        const token = TokenManager.getAccessToken();
        const user = localStorage.getItem('user');
        return !!(token && user);
    },

    // ✅ THÊM: Get stored user
    getStoredUser: (): User | null => {
        try {
            const userData = localStorage.getItem('user');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error parsing stored user:', error);
            return null;
        }
    },
};

export { TokenManager };

// Legacy functions for backward compatibility
export const loginUser = async (credentials: LoginRequest): Promise<Response> => {
    try {
        return await authService.login(credentials);
    } catch (error: unknown) {
        console.error('Error during login:', error);
        throw error;
    }
};

export const registerUser = async (userData: RegisterRequest): Promise<Response> => {
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