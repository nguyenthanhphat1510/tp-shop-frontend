"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/auth';
import { authService } from '@/services/AuthService/authService';
import { toast } from 'react-toastify'; // ✅ Import toast

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

    // Check localStorage on app start
    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (token && savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (error) {
                console.error('Error parsing saved user:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
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
            
            if (response.success && response.token && response.user) {
                const contextUser: User = {
                    id: response.user.id,
                    email: response.user.email,
                    name: response.user.name,
                };
                
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(contextUser));
                setUser(contextUser);
                setShowLoginModal(false);
                
                // ✅ SUCCESS TOAST - đơn giản
                toast.success(`Chào mừng ${contextUser.name}! Đăng nhập thành công.`);
                
                console.log('✅ Login success:', contextUser);
            } else {
                throw new Error(response.message || 'Đăng nhập thất bại');
            }
        } catch (error: any) {
            console.error('❌ Login error:', error);
            
            // ✅ ERROR TOAST - đơn giản
            toast.error(error.message || 'Email hoặc mật khẩu không đúng');
            
            throw new Error(error.message || 'Đăng nhập thất bại');
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
                if (response.token && response.user) {
                    const contextUser: User = {
                        id: response.user.id,
                        email: response.user.email,
                        name: response.user.name,
                        phone: userData.phone || '',
                    };
                    
                    localStorage.setItem('token', response.token);
                    localStorage.setItem('user', JSON.stringify(contextUser));
                    setUser(contextUser);
                    
                    // ✅ SUCCESS TOAST - đơn giản
                    toast.success(`Chào mừng ${contextUser.name}! Đăng ký thành công.`);
                } else {
                    // ✅ SUCCESS TOAST - đơn giản
                    toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
                }
                
                setShowRegisterModal(false);
                
                if (!response.token) {
                    switchToLogin();
                }
                
                console.log('✅ Register success:', response.user);
            } else {
                throw new Error(response.message || 'Đăng ký thất bại');
            }
        } catch (error: any) {
            console.error('❌ Register error:', error);
            
            // ✅ ERROR TOAST - đơn giản
            toast.error(error.message || 'Có lỗi xảy ra khi đăng ký');
            
            throw new Error(error.message || 'Đăng ký thất bại');
        } finally {
            setLoading(false);
        }
    };

    // ✅ LOGOUT - đơn giản
    const logout = () => {
        try {
            authService.logout();
            
            const userName = user?.name || 'bạn';
            setUser(null);
            setShowLoginModal(false);
            setShowRegisterModal(false);
            
            // ✅ SUCCESS TOAST - đơn giản
            toast.info(`Tạm biệt ${userName}! Đăng xuất thành công.`);
            
            console.log('✅ Logout success');
        } catch (error: any) {
            console.error('❌ Logout error:', error);
            
            // ✅ ERROR TOAST - đơn giản
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