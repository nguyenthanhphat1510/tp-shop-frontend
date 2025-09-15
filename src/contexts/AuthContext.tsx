"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/auth';
import { authService, TokenManager } from '@/services/AuthService/authService';
import { toast } from 'react-toastify';

interface AuthContextType {
    // States
    user: User | null;
    isAuthenticated: boolean;
    showLoginModal: boolean;
    showRegisterModal: boolean;
    loading: boolean;
     cartCount: number;
    
    
    // Modal controls
    setShowLoginModal: (show: boolean) => void;
    setShowRegisterModal: (show: boolean) => void;
    switchToLogin: () => void;
    switchToRegister: () => void;
     setCartCount: (count: number) => void;
    
    // Auth actions
    login: (email: string, password: string) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => void;
    loginWithGoogle: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    // ✅ Listen cho auth events từ interceptor
    useEffect(() => {
        const handleAuthLogin = () => {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                try {
                    setUser(JSON.parse(savedUser));
                } catch (error) {
                    console.error('Error parsing user data:', error);
                }
            }
        };

        const handleAuthLogout = () => {
            setUser(null);
            setShowLoginModal(false);
            setShowRegisterModal(false);
        };

        window.addEventListener('auth-login', handleAuthLogin);
        window.addEventListener('auth-logout', handleAuthLogout);

        return () => {
            window.removeEventListener('auth-login', handleAuthLogin);
            window.removeEventListener('auth-logout', handleAuthLogout);
        };
    }, []);

    // ✅ Check tokens on app start
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token'); // ✅ Chỉ check key 'token'
        
        if (savedUser && token) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (error) {
                console.error('Error restoring auth state:', error);
                localStorage.clear();
            }
        }
    }, []);

    // Modal controls
    const switchToLogin = () => {
        setShowRegisterModal(false);
        setShowLoginModal(true);
    };

    const switchToRegister = () => {
        setShowLoginModal(false);
        setShowRegisterModal(true);
    };

    // ✅ LOGIN - đơn giản
    const login = async (email: string, password: string) => {
        try {
            setLoading(true);
            
            const response = await authService.login({ email, password });
            
            if (response.success && response.user) {
                setUser(response.user);
                setShowLoginModal(false);
                toast.success(`Chào mừng ${response.user.name}! Đăng nhập thành công.`);
            } else {
                throw new Error(response.message || 'Đăng nhập thất bại');
            }
        } catch (error: any) {
            console.error('❌ Login error:', error);
            toast.error(error.message || 'Email hoặc mật khẩu không đúng');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // ✅ REGISTER - đơn giản
    const register = async (userData: any) => {
        try {
            setLoading(true);
            
            const response = await authService.register({
                name: userData.name,
                email: userData.email,
                password: userData.password
            });
            
            if (response.success) {
                setShowRegisterModal(false);
                
                if (response.token && response.user) {
                    setUser(response.user);
                    toast.success(`Chào mừng ${response.user.name}! Đăng ký thành công.`);
                } else {
                    toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
                    switchToLogin();
                }
            } else {
                throw new Error(response.message || 'Đăng ký thất bại');
            }
        } catch (error: any) {
            console.error('❌ Register error:', error);
            toast.error(error.message || 'Có lỗi xảy ra khi đăng ký');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // ✅ LOGOUT - đơn giản
    const logout = () => {
        try {
            const userName = user?.name || 'bạn';
            authService.logout();
            setUser(null);
            setShowLoginModal(false);
            setShowRegisterModal(false);
            toast.info(`Tạm biệt ${userName}! Đăng xuất thành công.`);
        } catch (error: any) {
            console.error('❌ Logout error:', error);
            toast.error('Có lỗi xảy ra khi đăng xuất');
        }
    };

    // ✅ GOOGLE LOGIN
const loginWithGoogle = () => {
    try {
        setLoading(true);
        // Redirect đến backend Google OAuth route
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        console.log('🔄 Redirecting to Google OAuth:', `${backendUrl}/api/auth/google`);
        window.location.href = `${backendUrl}/api/auth/google`;
    } catch (error) {
        console.error('❌ Google login error:', error);
        setLoading(false);
        toast.error('Không thể kết nối với Google');
    }
};

// Thêm vào useEffect để handle Google callback
useEffect(() => {
    // Handle Google OAuth callback
    const handleGoogleCallback = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const refreshToken = urlParams.get('refreshToken');
        const userParam = urlParams.get('user');
        const error = urlParams.get('error');

        if (error) {
            console.error('❌ Google OAuth error:', error);
            toast.error('Đăng nhập Google thất bại');
            setLoading(false);
            return;
        }

        if (token && userParam) {
            try {
                setLoading(true);
                
                // ✅ SỬ DỤNG CÙNG LOGIC NHU ĐĂNG NHẬP THƯỜNG
                // Thay vì validate manual, chúng ta setup như response từ login API
                const userData = JSON.parse(decodeURIComponent(userParam));
                
                // ✅ Tạo fake response giống như authService.login trả về
                const mockLoginResponse = {
                    success: true,
                    token: token,
                    refreshToken: refreshToken,
                    user: userData,
                    message: 'Đăng nhập Google thành công'
                };
                
                // ✅ Sử dụng cùng logic lưu token như login thường
                TokenManager.setAccessToken(token);
                if (refreshToken) {
                    TokenManager.setRefreshToken(refreshToken);
                }
                
                // ✅ Transform user data cùng cách
                const transformedUser = {
                    id: userData.id,
                    name: userData.name || userData.fullName,
                    email: userData.email,
                    role: userData.role || 'user',
                    createdAt: userData.createdAt,
                    updatedAt: userData.updatedAt
                };
                
                localStorage.setItem('user', JSON.stringify(transformedUser));
                setUser(transformedUser);

                // ✅ Trigger auth-login event giống như login thường
                window.dispatchEvent(new Event('auth-login'));

                window.history.replaceState({}, document.title, window.location.pathname);

                toast.success(`Chào mừng ${transformedUser.name}! Đăng nhập Google thành công.`);
                setShowLoginModal(false);
                
            } catch (error) {
                console.error('❌ Error handling Google auth:', error);
                toast.error('Có lỗi xảy ra khi xử lý đăng nhập Google');
                // ✅ Clear tokens giống như lỗi login thường
                TokenManager.clearAll();
            } finally {
                setLoading(false);
            }
        }
    };

    // Kiểm tra nếu đang ở callback URL
    if (typeof window !== 'undefined') {
        if (window.location.pathname === '/auth/google/callback') {
            handleGoogleCallback();
        }
        
        // Check for error in URL params on any page
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get('error');
        if (error === 'google_auth_failed') {
            toast.error('Đăng nhập Google thất bại');
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
}, []);

// ✅ Fix token checking - ít aggressive hơn như yêu cầu
useEffect(() => {
    const checkAndRefreshToken = async () => {
        const token = TokenManager.getAccessToken();
        const user = localStorage.getItem('user');
        
        if (!token || !user) {
            return; // ✅ Không logout nếu không có token
        }
        
        try {
            // Decode token để check expiry
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            const timeToExpiry = payload.exp - currentTime;
            
            console.log('🔍 Token expires in:', Math.floor(timeToExpiry / 60), 'minutes');
            
            // ✅ CHỈ refresh khi token sắp hết hạn (còn < 2 phút)
            if (timeToExpiry < 120 && timeToExpiry > 0) {
                console.log('🔄 Token expiring soon, refreshing...');
                const refreshSuccess = await authService.refreshTokens(); // ✅ Dùng authService.refreshTokens thay vì forceRefreshTokens
                
                if (!refreshSuccess) {
                    console.log('⚠️ Refresh failed, but not logging out yet');
                    // ✅ KHÔNG logout ngay, chờ token thực sự hết hạn
                }
            }
            // ✅ CHỈ logout khi token đã hết hạn > 5 phút (tránh logout ngay lập tức)
            else if (timeToExpiry < -300) {
                console.log('❌ Token expired for too long, logging out');
                logout();
            }
            
        } catch (error) {
            console.error('⚠️ Error checking token (but not logging out):', error);
            // ✅ KHÔNG logout khi có lỗi decode token
        }
    };

    // ✅ Check ngay khi mount, nhưng chỉ 1 lần
    checkAndRefreshToken();
    
    // ✅ Check ít thường xuyên hơn - mỗi 10 phút thay vì 2 phút
    const interval = setInterval(checkAndRefreshToken, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
}, []); // ✅ Empty dependency array - chỉ chạy 1 lần

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            showLoginModal,
            showRegisterModal,
            loading,
            setShowLoginModal,
            setShowRegisterModal,
            switchToLogin,
            switchToRegister,
            login,
            register,
            logout,
            loginWithGoogle,
             cartCount,
            setCartCount
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};