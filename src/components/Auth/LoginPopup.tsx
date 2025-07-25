"use client";
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const LoginPopup = () => {
    const { login, setShowLoginModal, switchToRegister } = useAuth();
    
    // Form states
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        
        if (!formData.email) {
            newErrors.email = 'Email là bắt buộc';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }
        
        if (!formData.password) {
            newErrors.password = 'Mật khẩu là bắt buộc';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        try {
            setLoading(true);
            await login(formData.email, formData.password);
        } catch (error: any) {
            setErrors({ submit: error.message });
        } finally {
            setLoading(false);
        }
    };

    // Handle close modal
    const handleClose = () => {
        setShowLoginModal(false);
        setFormData({ email: '', password: '' });
        setErrors({});
    };

    return (
        // ✅ Dùng Tailwind classes thay vì inline style
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            {/* Modal không có border */}
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative">
                {/* Header with gradient background */}
                <div 
                    className="rounded-t-xl px-6 py-4 relative"
                    style={{background: 'linear-gradient(5deg, #cb1c22 67.61%, #d9503f 95.18%)'}}
                >
                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-3 right-4 text-white hover:text-red-200 text-2xl leading-none transition-colors"
                    >
                        ×
                    </button>

                    {/* Header Content */}
                    <div className="text-center text-white">
                        <h2 className="text-2xl font-bold mb-1">Đăng nhập</h2>
                        <p className="text-red-100 text-sm">Chào mừng bạn quay trở lại!</p>
                    </div>
                </div>

                {/* Form Body */}
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <div className="relative">
                                <i className="fas fa-envelope absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${
                                        errors.email ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Nhập email của bạn"
                                    disabled={loading}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1 flex items-center">
                                    <i className="fas fa-exclamation-circle mr-1"></i>
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Mật khẩu
                            </label>
                            <div className="relative">
                                <i className="fas fa-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${
                                        errors.password ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Nhập mật khẩu"
                                    disabled={loading}
                                />
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1 flex items-center">
                                    <i className="fas fa-exclamation-circle mr-1"></i>
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Submit Error */}
                        {errors.submit && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-red-600 text-sm text-center flex items-center justify-center">
                                    <i className="fas fa-exclamation-triangle mr-2"></i>
                                    {errors.submit}
                                </p>
                            </div>
                        )}

                        {/* Forgot Password */}
                        <div className="text-right">
                            <button
                                type="button"
                                className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                                disabled={loading}
                            >
                                Quên mật khẩu?
                            </button>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full text-white py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                            style={{
                                background: loading ? '#9CA3AF' : 'linear-gradient(5deg, #cb1c22 67.61%, #d9503f 95.18%)',
                                transform: loading ? 'scale(0.98)' : 'scale(1)'
                            }}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang đăng nhập...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center">
                                    <i className="fas fa-sign-in-alt mr-2"></i>
                                    Đăng nhập
                                </span>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-6 flex items-center">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className="px-4 text-gray-500 text-sm bg-gray-50 rounded-full">hoặc</span>
                        <div className="flex-1 border-t border-gray-300"></div>
                    </div>

                    {/* Social Login */}
                    <div className="space-y-3">
                        <button 
                            type="button"
                            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={loading}
                        >
                            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Đăng nhập với Google
                        </button>
                        
                        <button 
                            type="button"
                            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={loading}
                        >
                            <svg className="w-5 h-5 mr-3" fill="#1877F2" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            Đăng nhập với Facebook
                        </button>
                    </div>

                    {/* Switch to Register */}
                    <div className="text-center mt-6 p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-sm">
                            Chưa có tài khoản?{' '}
                            <button
                                onClick={switchToRegister}
                                className="text-red-600 hover:text-red-700 font-medium transition-colors"
                                disabled={loading}
                            >
                                Đăng ký ngay
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPopup;