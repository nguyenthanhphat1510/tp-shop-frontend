"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GoogleCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const error = urlParams.get('error');

        if (token) {
            // Success - AuthContext sẽ handle việc parse data
            console.log('✅ Google callback successful, redirecting...');
            setTimeout(() => {
                router.push('/'); // Redirect về home
            }, 1500);
        } else if (error) {
            console.error('❌ Google callback error:', error);
            setTimeout(() => {
                router.push('/login?error=google_auth_failed');
            }, 2000);
        } else {
            // No token or error, redirect to login
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        }
    }, [router]);

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="text-center bg-white p-8 rounded-lg shadow-md">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Đang xử lý đăng nhập Google...
                </h3>
                <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
            </div>
        </div>
    );
}