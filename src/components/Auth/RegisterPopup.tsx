"use client";
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const RegisterPopup = () => {
    const { register, setShowRegisterModal, switchToLogin } = useAuth();
    
    // Form states - Removed phone, confirmPassword
    const [formData, setFormData] = useState({
        name: '',
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

    // Validate form - Simplified
    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Họ tên là bắt buộc';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Họ tên phải có ít nhất 2 ký tự';
        }
        
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
            await register(formData);
        } catch (error: any) {
            setErrors({ submit: error.message });
        } finally {
            setLoading(false);
        }
    };

    // Handle close modal
    const handleClose = () => {
        setShowRegisterModal(false);
        setFormData({
            name: '',
            email: '',
            password: ''
        });
        setErrors({});
    };

    return (
        // ✅ Thêm backdrop đen mờ toàn màn hình
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            {/* ✅ Bỏ border và custom styling */}
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative">
                {/* Header with gradient background - Made smaller, no avatar */}
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

                    {/* Header Content - No avatar icon */}
                    <div className="text-center text-white">
                        <h2 className="text-2xl font-bold mb-1">Đăng ký</h2>
                        <p className="text-red-100 text-sm">Tạo tài khoản mới để bắt đầu mua sắm</p>
                    </div>
                </div>

                {/* Form Body */}
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Họ và tên <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <i className="fas fa-user absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${
                                        errors.name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Nhập họ và tên"
                                    disabled={loading}
                                />
                            </div>
                            {errors.name && (
                                <p className="text-red-500 text-sm mt-1 flex items-center">
                                    <i className="fas fa-exclamation-circle mr-1"></i>
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email <span className="text-red-500">*</span>
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
                                Mật khẩu <span className="text-red-500">*</span>
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
                                    Đang đăng ký...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center">
                                    <i className="fas fa-user-plus mr-2"></i>
                                    Đăng ký
                                </span>
                            )}
                        </button>
                    </form>

                    {/* Switch to Login */}
                    <div className="text-center mt-6 p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-sm">
                            Đã có tài khoản?{' '}
                            <button
                                onClick={switchToLogin}
                                className="text-red-600 hover:text-red-700 font-medium transition-colors"
                                disabled={loading}
                            >
                                Đăng nhập ngay
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPopup;