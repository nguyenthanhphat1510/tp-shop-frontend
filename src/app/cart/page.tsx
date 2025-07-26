"use client";
import { useEffect, useState } from 'react';
import Cart from '@/components/Cart/Cart';
import { useAuth } from '@/contexts/AuthContext';

export default function CartPage() {
    const [mounted, setMounted] = useState(false);
    // Helper: kiểm tra đã đăng nhập (có token trong localStorage)
    const isLoggedIn = typeof window !== 'undefined' && (!!localStorage.getItem('token') || !!localStorage.getItem('accessToken'));
    const { isAuthenticated, setShowLoginModal } = useAuth();

    useEffect(() => {
        setMounted(true);
        
        // Nếu chưa đăng nhập, hiện modal đăng nhập
        if (!isAuthenticated && !isLoggedIn) {
            setShowLoginModal(true);
        }
    }, [isAuthenticated, isLoggedIn, setShowLoginModal]);

    // Chờ component mount
    if (!mounted) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="ml-3 text-gray-600">Đang tải...</p>
            </div>
        );
    }

    // Nếu chưa đăng nhập, hiển thị thông báo và không render Cart
    if (!isAuthenticated && !isLoggedIn) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-5xl mb-4">🔒</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Bạn chưa đăng nhập</h2>
                    <p className="text-gray-600 mb-4">Vui lòng đăng nhập để xem giỏ hàng của bạn.</p>
                    <button
                        onClick={() => setShowLoginModal(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Đăng nhập ngay
                    </button>
                </div>
            </div>
        );
    }

    // Nếu đã đăng nhập, hiển thị giỏ hàng
    return (
        <div className="min-h-screen bg-gray-50">
            <Cart />
        </div>
    );
}