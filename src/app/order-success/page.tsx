"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const OrderSuccessPage = () => {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-check text-2xl text-green-600"></i>
                </div>
                
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Đặt hàng thành công!</h1>
                <p className="text-gray-600 mb-6">
                    Cảm ơn bạn đã mua hàng tại TpShop. Chúng tôi sẽ liên hệ với bạn sớm nhất.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <p className="text-sm text-gray-700 mb-2">Mã đơn hàng: <strong>#TP23456789</strong></p>
                    <p className="text-sm text-gray-700">Thời gian: <strong>{new Date().toLocaleString('vi-VN')}</strong></p>
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                    <Link href="/" className="flex-1">
                        <button className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                            Tiếp tục mua sắm
                        </button>
                    </Link>
                    <button 
                        onClick={() => {
                            // Implement order tracking later
                            alert('Tính năng theo dõi đơn hàng sẽ được phát triển sau');
                        }}
                        className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        Theo dõi đơn hàng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccessPage;