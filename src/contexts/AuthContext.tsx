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
    
    // Modal controls
    setShowLoginModal: (show: boolean) => void;
    setShowRegisterModal: (show: boolean) => void;
    switchToLogin: () => void;
    switchToRegister: () => void;
    
    // Auth actions
    login: (email: string, password: string) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // States
    const [user, setUser] = useState<User | null>(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [loading, setLoading] = useState(false);

    // ✅ Check tokens on app start
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        const refreshToken = TokenManager.getRefreshToken();
        
        if (savedUser && refreshToken) {
            try {
                setUser(JSON.parse(savedUser));
                // ✅ Thử refresh để lấy access token mới
                authService.refreshToken().catch(() => {
                    // Nếu refresh thất bại, clear data
                    TokenManager.clearAll();
                    setUser(null);
                });
            } catch (error) {
                console.error('Error restoring auth state:', error);
                TokenManager.clearAll();
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
            logout
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