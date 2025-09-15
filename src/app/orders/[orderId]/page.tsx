"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { orderService } from "@/services/OrderService/orderService";

const statusFlow = [
    { key: 'PENDING', label: 'Đã đặt hàng', icon: '📝' },
    { key: 'CONFIRMED', label: 'Đã xác nhận', icon: '✅' },
    { key: 'PACKING', label: 'Đang đóng gói', icon: '📦' },
    { key: 'SHIPPING', label: 'Đang giao hàng', icon: '🚚' },
    { key: 'DELIVERED', label: 'Đã giao hàng', icon: '🏠' }
];

const statusColors = {
    PENDING: "bg-blue-400",
    CONFIRMED: "bg-blue-500", 
    PACKING: "bg-orange-400",
    SHIPPING: "bg-purple-500",
    DELIVERED: "bg-green-500",
    CANCELLED: "bg-red-500",
};

const statusLabels = {
    PENDING: "Đã đặt hàng",
    CONFIRMED: "Đã xác nhận",
    PACKING: "Đang đóng gói", 
    SHIPPING: "Đang giao hàng",
    DELIVERED: "Đã giao hàng",
    CANCELLED: "Đã hủy",
};

const paymentMethodLabels = {
    cod: "Thanh toán khi nhận hàng",
    bank: "Chuyển khoản ngân hàng",
    momo: "Ví MoMo",
    vnpay: "VNPay",
};

const paymentStatusLabels: { [key: string]: string } = {
    pending: "Chưa thanh toán",
    paid: "Đã thanh toán",
    failed: "Thanh toán thất bại",
};

interface OrderDetail {
    _id: string;
    orderNumber: string;
    userId: string;
    shippingInfo: {
        fullName: string;
        phone: string;
        address: string;
    };
    paymentMethod: string;
    paymentStatus: string;
    subtotal: number;
    shippingFee: number;
    discount: number;
    total: number;
    status: string;
    note?: string;
    trackingNumber?: string;
    createdAt: string;
    updatedAt: string;
    orderItems: Array<{
        _id: string;
        orderId: string;
        productId: string;
        productName: string;
        productImageUrl: string;
        unitPrice: string;
        quantity: number;
        subtotal: number;
        status: string;
        cancelReason?: string;
        createdAt: string;
    }>;
}

const OrderDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const orderId = params.orderId as string;
    
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (orderId) {
            fetchOrderDetail();
        }
    }, [orderId]);

    const fetchOrderDetail = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await orderService.getOrderById(orderId);
            console.log("Order detail response:", res.data);
            if (res.success) {
                setOrder(res.data);
            } else {
                setError(res.message || "Không thể tải chi tiết đơn hàng");
            }
        } catch (err: any) {
            setError(err.message || "Không thể tải chi tiết đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: string | number) => {
        const numPrice = typeof price === 'string' ? parseInt(price.replace(/\s/g, '')) : price;
        return numPrice.toLocaleString("vi-VN");
    };

    const getCurrentStatusIndex = (status: string) => {
        return statusFlow.findIndex(step => step.key === status.toUpperCase());
    };

    const isStepCompleted = (stepIndex: number, currentIndex: number, status: string) => {
        if (status.toUpperCase() === 'CANCELLED') return false;
        return stepIndex <= currentIndex;
    };

    const isStepActive = (stepIndex: number, currentIndex: number) => {
        return stepIndex === currentIndex;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="text-center">
                    <div className="text-red-500 text-lg mb-4">{error || "Không tìm thấy đơn hàng"}</div>
                    <Link href="/orders" className="text-blue-600 hover:text-blue-800">
                        ← Quay lại danh sách đơn hàng
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-6">
                <Link href="/orders" className="text-blue-600 hover:text-blue-800 text-sm">
                    ← Quay lại danh sách đơn hàng
                </Link>
                <h1 className="text-2xl font-bold mt-2 text-gray-900">Chi tiết đơn hàng</h1>
            </div>

            {/* ORDER STATUS TIMELINE - THÊM MỚI */}
            {order.status.toUpperCase() !== 'CANCELLED' && (
                <div className="bg-white rounded-xl shadow p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-6 text-gray-800">Trạng thái đơn hàng</h2>
                    <div className="relative">
                        {/* Progress Line */}
                        <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200">
                            <div 
                                className="h-full bg-blue-500 transition-all duration-500"
                                style={{ 
                                    width: `${(getCurrentStatusIndex(order.status) / (statusFlow.length - 1)) * 100}%` 
                                }}
                            ></div>
                        </div>

                        {/* Status Steps */}
                        <div className="relative flex justify-between">
                            {statusFlow.map((step, index) => {
                                const currentIndex = getCurrentStatusIndex(order.status);
                                const isCompleted = isStepCompleted(index, currentIndex, order.status);
                                const isActive = isStepActive(index, currentIndex);
                                
                                return (
                                    <div key={step.key} className="flex flex-col items-center text-center">
                                        {/* Circle */}
                                        <div className={`
                                            w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm z-10 transition-all duration-300
                                            ${isCompleted 
                                                ? (isActive ? 'bg-blue-500 scale-110' : 'bg-green-500') 
                                                : 'bg-gray-300'
                                            }
                                        `}>
                                            {isCompleted && !isActive ? '✓' : step.icon}
                                        </div>
                                        
                                        {/* Label */}
                                        <div className={`
                                            mt-3 text-xs sm:text-sm font-medium max-w-[80px] sm:max-w-none
                                            ${isCompleted ? 'text-blue-600' : 'text-gray-400'}
                                        `}>
                                            {step.label}
                                        </div>
                                        
                                        {/* Time - if available */}
                                        {isCompleted && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                {index === currentIndex ? 'Hiện tại' : ''}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* CANCELLED ORDER STATUS */}
            {order.status.toUpperCase() === 'CANCELLED' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                    <div className="flex items-center">
                        <div className="text-red-500 text-3xl mr-4">❌</div>
                        <div>
                            <h3 className="text-lg font-semibold text-red-800">Đơn hàng đã bị hủy</h3>
                            <p className="text-red-600 text-sm">
                                Đơn hàng này đã bị hủy vào {new Date(order.updatedAt).toLocaleString("vi-VN")}
                            </p>
                            {order.note && (
                                <p className="text-red-600 text-sm mt-2">
                                    <span className="font-semibold">Lý do:</span> {order.note}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Order Info - cập nhật status display */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h2 className="text-lg font-semibold mb-4 text-gray-800">Thông tin đơn hàng</h2>
                        <div className="space-y-2 text-sm">
                            <div>
                                <span className="text-gray-600">Mã đơn hàng:</span>
                                <span className="ml-2 font-semibold text-blue-600">{order.orderNumber}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Ngày đặt:</span>
                                <span className="ml-2">{new Date(order.createdAt).toLocaleString("vi-VN")}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Trạng thái hiện tại:</span>
                                <span
                                    className={`ml-2 inline-block px-3 py-1 rounded-full text-white text-xs font-medium ${
                                        statusColors[order.status.toUpperCase()] || "bg-gray-400"
                                    }`}
                                >
                                    {statusLabels[order.status.toUpperCase()] || "Không xác định"}
                                </span>
                            </div>
                            {order.trackingNumber && (
                                <div>
                                    <span className="text-gray-600">Mã vận đơn:</span>
                                    <span className="ml-2 font-semibold text-blue-600">{order.trackingNumber}</span>
                                </div>
                            )}
                            <div>
                                <span className="text-gray-600">Cập nhật lần cuối:</span>
                                <span className="ml-2">{new Date(order.updatedAt).toLocaleString("vi-VN")}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h2 className="text-lg font-semibold mb-4 text-gray-800">Thông tin thanh toán</h2>
                        <div className="space-y-2 text-sm">
                            <div>
                                <span className="text-gray-600">Phương thức:</span>
                                <span className="ml-2">
                                    {paymentMethodLabels[order.paymentMethod?.toLowerCase()] || order.paymentMethod}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600">Trạng thái thanh toán:</span>
                                <span className={`ml-2 font-semibold ${
                                    order.paymentStatus === 'paid' ? 'text-green-600' : 
                                    order.paymentStatus === 'failed' ? 'text-red-600' : 'text-orange-600'
                                }`}>
                                    {paymentStatusLabels[order.paymentStatus] || order.paymentStatus}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Thông tin giao hàng</h2>
                <div className="space-y-2 text-sm">
                    <div>
                        <span className="text-gray-600">Người nhận:</span>
                        <span className="ml-2 font-semibold">{order.shippingInfo.fullName}</span>
                    </div>
                    <div>
                        <span className="text-gray-600">Số điện thoại:</span>
                        <span className="ml-2">{order.shippingInfo.phone}</span>
                    </div>
                    <div>
                        <span className="text-gray-600">Địa chỉ:</span>
                        <span className="ml-2">{order.shippingInfo.address}</span>
                    </div>
                    {order.note && (
                        <div>
                            <span className="text-gray-600">Ghi chú:</span>
                            <span className="ml-2">{order.note}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Sản phẩm đã đặt</h2>
                <div className="space-y-4">
                    {order.orderItems.map((item) => (
                        <div key={item._id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                            <img
                                src={item.productImageUrl}
                                alt={item.productName}
                                className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-800">{item.productName}</h3>
                                <div className="text-sm text-gray-600 mt-1">
                                    <div>Đơn giá: {formatPrice(item.unitPrice)}đ</div>
                                    <div>Số lượng: {item.quantity}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-semibold text-red-600">
                                    {formatPrice(item.subtotal)}đ
                                </div>
                                {/* Bỏ dòng trạng thái sản phẩm */}
                                {/* <div className={`text-xs mt-1 ${item.status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>
                                    {item.status === 'active' ? 'Đang xử lý' : 'Đã hủy'}
                                </div> */}
                                {item.status !== 'active' && (
                                    <div className="text-xs mt-1 text-gray-500">Đã hủy</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Tổng quan đơn hàng</h2>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tạm tính:</span>
                        <span>{formatPrice(order.subtotal)}đ</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Phí vận chuyển:</span>
                        <span>{formatPrice(order.shippingFee)}đ</span>
                    </div>
                    {order.discount > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Giảm giá:</span>
                            <span className="text-green-600">-{formatPrice(order.discount)}đ</span>
                        </div>
                    )}
                    <hr className="my-2" />
                    <div className="flex justify-between font-semibold text-lg">
                        <span>Tổng cộng:</span>
                        <span className="text-red-600">{formatPrice(order.total)}đ</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;