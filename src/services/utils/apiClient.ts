import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// ✅ Shared axios instance cho TẤT CẢ services
export const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// ✅ Unified token management
export class TokenManager {
    // ✅ Chỉ dùng 1 key duy nhất
    static setAccessToken(token: string) {
        localStorage.setItem('token', token); // ✅ Key thống nhất: 'token'
    }

    static getAccessToken(): string {
        return localStorage.getItem('token') || '';
    }

    static clearAccessToken() {
        localStorage.removeItem('token');
    }
    
    static setRefreshToken(token: string) {
        try {
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

// ✅ Request interceptor - tự động thêm token
apiClient.interceptors.request.use((config) => {
    const token = TokenManager.getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Request with token:', token.substring(0, 20) + '...');
    }
    return config;
});

// ✅ Response interceptor với less aggressive error handling
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // ✅ CHỈ handle 401 cho authenticated requests
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                const refreshToken = TokenManager.getRefreshToken();
                if (!refreshToken) {
                    console.log('⚠️ No refresh token, but not clearing tokens yet');
                    return Promise.reject(error); // ✅ Chỉ reject, không clear tokens
                }
                
                console.log('🔄 Access token expired, refreshing...');
                
                // ✅ Dùng axios trực tiếp để tránh interceptor loop
                const response = await axios.post(`${API_URL}/auth/refresh`, {
                    refreshToken
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.data.success) {
                    const { token, refreshToken: newRefreshToken } = response.data;
                    
                    // Lưu tokens mới
                    TokenManager.setAccessToken(token);
                    if (newRefreshToken) {
                        TokenManager.setRefreshToken(newRefreshToken);
                    }
                    
                    // ✅ Update user info nếu có
                    if (response.data.user) {
                        localStorage.setItem('user', JSON.stringify(response.data.user));
                        window.dispatchEvent(new Event('auth-login'));
                    }
                    
                    // Retry request với token mới
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    console.log('✅ Token refreshed, retrying request');
                    return apiClient(originalRequest);
                }
                
            } catch (refreshError) {
                console.log('⚠️ Refresh failed:', refreshError);
                
                // ✅ CHỈ clear tokens cho specific errors
                if (refreshError.response?.status === 401 || 
                    refreshError.response?.status === 403) {
                    console.log('🚪 Invalid refresh token, clearing tokens');
                    TokenManager.clearAll();
                    window.dispatchEvent(new Event('auth-logout'));
                } else {
                    console.log('⚠️ Network/temporary error, not logging out');
                }
                
                return Promise.reject(refreshError);
            }
        }
        
        // ✅ KHÔNG auto logout cho các lỗi khác
        return Promise.reject(error);
    }
);

export default apiClient;