"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

interface OrderData {
    id: string;
    orderNumber: string;
    totalAmount?: number;
    total?: number;
    createdAt: string;
    status: string;
    paymentMethod?: string;
    paymentStatus?: string;
}

const OrderSuccessPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [orderData, setOrderData] = useState<OrderData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const orderId = searchParams.get('orderId');
        if (!orderId || orderId.length !== 24) {
            setLoading(false);
            return;
        }
        fetchOrderDetails(orderId);
    }, [searchParams]);

    const fetchOrderDetails = async (orderId: string) => {
        if (!orderId || orderId.length !== 24) {
            console.error('OrderId không hợp lệ:', orderId);
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token') || localStorage.getItem('accessToken');

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/orders/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (result.success) {
                setOrderData(result.data);
            } else {
                console.error('Failed to fetch order:', result.message);
            }
        } catch (error) {
            console.error('Error fetching order:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number | undefined | null): string => {
        if (amount === undefined || amount === null || isNaN(amount)) {
            return '0';
        }
        return amount.toLocaleString('vi-VN');
    };

    const getTotalAmount = (order: OrderData): number => {
        return order.totalAmount || order.total || 0;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="text-2xl text-green-600">✅</div>
                </div>

                <h1 className="text-2xl font-bold text-gray-800 mb-2">Đặt hàng thành công!</h1>
                <p className="text-gray-600 mb-6">
                    {orderData?.paymentMethod?.toLowerCase() === 'momo'
                        ? 'Cảm ơn bạn đã thanh toán qua MoMo. Đơn hàng đã được xác nhận.'
                        : 'Cảm ơn bạn đã mua hàng tại TpShop. Chúng tôi sẽ liên hệ với bạn sớm nhất.'
                    }
                </p>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    {orderData ? (
                        <>
                            <p className="text-sm text-gray-700 mb-2">
                                Mã đơn hàng: <strong>#{orderData.orderNumber || 'N/A'}</strong>
                            </p>
                            <p className="text-sm text-gray-700 mb-2">
                                Tổng tiền: <strong>{formatCurrency(getTotalAmount(orderData))} đ</strong>
                            </p>
                            {orderData.paymentMethod && (
                                <p className="text-sm text-gray-700 mb-2">
                                    Phương thức: <strong>
                                        {orderData.paymentMethod === 'momo' ? 'Ví MoMo' :
                                            orderData.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' :
                                                orderData.paymentMethod}
                                    </strong>
                                </p>
                            )}
                            {orderData.paymentStatus && (
                                <p className="text-sm text-gray-700 mb-2">
                                    Trạng thái: <strong className={
                                        orderData.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'
                                    }>
                                        {orderData.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                    </strong>
                                </p>
                            )}
                            <p className="text-sm text-gray-700">
                                Thời gian: <strong>{new Date(orderData.createdAt).toLocaleString('vi-VN')}</strong>
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="text-sm text-gray-700 mb-2">Mã đơn hàng: <strong>Đang tải...</strong></p>
                            <p className="text-sm text-gray-700">Thời gian: <strong>{new Date().toLocaleString('vi-VN')}</strong></p>
                        </>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                    <Link href="/" className="flex-1">
                        <button className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                            Tiếp tục mua sắm
                        </button>
                    </Link>
                    <Link href="/orders" className="flex-1">
                        <button className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                            Xem đơn hàng
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccessPage;