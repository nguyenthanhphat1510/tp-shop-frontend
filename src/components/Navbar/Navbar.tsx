"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

const Navbar = () => {
    const { isAuthenticated, user, setShowLoginModal, logout, cartCount } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="w-full h-[68px] shadow-lg" style={{background: 'linear-gradient(5deg, #cb1c22 67.61%, #d9503f 95.18%)'}}>
            <div className="container mx-auto px-4 h-full flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center">
                    <Link href="/">
                        <h1 className="text-3xl font-bold text-white cursor-pointer hover:text-red-200 transition-colors">
                            TpShop
                        </h1>
                    </Link>
                </div>
                
                {/* Navigation Links */}
                <nav className="hidden md:flex items-center space-x-12">
                    <Link href="/dtdd" className="text-white hover:text-red-200 transition-colors text-lg font-medium">
                        Điện thoại
                    </Link>
                    <Link href="/laptop" className="text-white hover:text-red-200 transition-colors text-lg font-medium">
                        Laptop
                    </Link>
                </nav>
                
                {/* User Actions */}
                <div className="flex items-center space-x-8">
                    {/* Auth Section */}
                    {isAuthenticated ? (
                        <div className="flex items-center space-x-4 relative" ref={dropdownRef}>
                            {/* User Info (click để mở dropdown) */}
                            <button
                                className="flex items-center space-x-2 focus:outline-none"
                                onClick={() => setShowDropdown((v) => !v)}
                            >
                                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <span className="hidden lg:block text-white text-lg font-medium">
                                    {user?.name}
                                </span>
                                <i className="fas fa-chevron-down ml-2 text-white"></i>
                            </button>
                            {/* Dropdown menu */}
                            {showDropdown && (
                                <div className="absolute right-0 top-12 w-44 bg-white rounded-lg shadow-lg border z-50">
                                    <Link href="/orders">
                                        <button
                                            className="w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-700"
                                            onClick={() => setShowDropdown(false)}
                                        >
                                            Đơn mua
                                        </button>
                                    </Link>
                                    <button
                                        className="w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-700"
                                        onClick={() => {
                                            setShowDropdown(false);
                                            logout();
                                        }}
                                    >
                                        Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Login Button */
                        <button 
                            onClick={() => setShowLoginModal(true)}
                            className="flex items-center space-x-2 text-white hover:text-red-200 transition-colors"
                        >
                            <i className="fas fa-user text-xl"></i>
                            <span className="text-lg font-medium">Đăng nhập</span>
                        </button>
                    )}
                    
                    {/* Giỏ hàng */}
                    <Link href="/cart">
                        <button className="flex items-center space-x-2 text-white hover:text-red-200 transition-colors relative">
                            <i className="fas fa-shopping-cart text-xl"></i>
                            <span className="text-lg font-medium">Giỏ hàng</span>
                            {/* Badge số lượng mặt hàng */}
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-yellow-400 text-red-600 text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    </Link>
                </div>
                
                {/* Mobile Menu Button */}
                <button className="md:hidden text-white hover:text-red-200">
                    <i className="fas fa-bars text-xl"></i>
                </button>
            </div>
        </header>
    );
};

export default Navbar;