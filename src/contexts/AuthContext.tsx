"use client";
import React, { createContext, useContext, useState } from 'react';
import { User } from '@/types/auth';

interface AuthContextType {
    // States
    user: User | null;
    isAuthenticated: boolean;
    showLoginModal: boolean;
    showRegisterModal: boolean;
    
    // Modal controls
    setShowLoginModal: (show: boolean) => void;
    setShowRegisterModal: (show: boolean) => void;
    switchToLogin: () => void;
    switchToRegister: () => void;
    
    // Auth actions (mock for now)
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

    // Modal controls
    const switchToLogin = () => {
        setShowRegisterModal(false);
        setShowLoginModal(true);
    };

    const switchToRegister = () => {
        setShowLoginModal(false);
        setShowRegisterModal(true);
    };

    // Mock login function
    const login = async (email: string, password: string) => {
        try {
            // Mock API call - thay bằng real API sau
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const mockUser: User = {
                id: '1',
                email: email,
                name: 'Nguyễn Văn A',
                phone: '0123456789'
            };
            
            setUser(mockUser);
            setShowLoginModal(false);
            
            // Save to localStorage
            localStorage.setItem('user', JSON.stringify(mockUser));
            
            console.log('✅ Login success:', mockUser);
        } catch (error) {
            console.error('❌ Login error:', error);
            throw new Error('Email hoặc mật khẩu không đúng');
        }
    };

    // Mock register function  
    const register = async (userData: any) => {
        try {
            // Mock API call - thay bằng real API sau
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const mockUser: User = {
                id: Date.now().toString(),
                email: userData.email,
                name: userData.name,
                phone: userData.phone
            };
            
            setUser(mockUser);
            setShowRegisterModal(false);
            
            // Save to localStorage
            localStorage.setItem('user', JSON.stringify(mockUser));
            
            console.log('✅ Register success:', mockUser);
        } catch (error) {
            console.error('❌ Register error:', error);
            throw new Error('Có lỗi xảy ra khi đăng ký');
        }
    };

    // Logout
    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        setShowLoginModal(false);
        setShowRegisterModal(false);
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            showLoginModal,
            showRegisterModal,
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

// Hook để sử dụng context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};