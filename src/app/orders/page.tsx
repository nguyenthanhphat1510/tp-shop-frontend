"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { orderService } from "@/services/OrderService/orderService";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    shipping: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
};

const statusLabels = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    shipping: "Đang giao hàng",
    delivered: "Đã giao hàng",
    cancelled: "Đã hủy",
};

const statusIcons = {
    pending: "⏳",
    confirmed: "✓",
    shipping: "🚚",
    delivered: "✅",
    cancelled: "❌",
};

const paymentStatusColors = {
    pending: "text-yellow-600",
    paid: "text-green-600",
    failed: "text-red-600",
};

const paymentStatusLabels = {
    pending: "Chưa thanh toán",
    paid: "Đã thanh toán",
    failed: "Thanh toán thất bại",
};

const OrdersPage = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>("all");

    useEffect(() => {
        if (!user) {
            toast.error("Vui lòng đăng nhập để xem đơn hàng");
            router.push("/");
            return;
        }
        fetchOrders();
    }, [user, router]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await orderService.getOrders();
            const ordersData = res.data || [];
            // Sort by createdAt descending (newest first)
            ordersData.sort((a: any, b: any) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setOrders(ordersData);
        } catch (err: any) {
            toast.error(err.message || "Không thể tải danh sách đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = filterStatus === "all" 
        ? orders 
        : orders.filter(order => order.status === filterStatus);

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Đang tải đơn hàng...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Đơn hàng của tôi</h1>
                <p className="text-gray-600">Quản lý và theo dõi đơn hàng của bạn</p>
            </div>

            {/* Filter Tabs */}
            <div className="mb-6 bg-white rounded-lg shadow-sm p-2">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setFilterStatus("all")}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            filterStatus === "all"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        Tất cả ({orders.length})
                    </button>
                    {Object.keys(statusLabels).map((status) => {
                        const count = orders.filter(o => o.status === status).length;
                        return (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    filterStatus === status
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                {statusIcons[status]} {statusLabels[status]} ({count})
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                    <div className="mb-4">
                        <i className="fas fa-shopping-bag text-6xl text-gray-300"></i>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {filterStatus === "all" ? "Chưa có đơn hàng nào" : `Không có đơn hàng ${statusLabels[filterStatus]?.toLowerCase()}`}
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Hãy khám phá và mua sắm những sản phẩm yêu thích của bạn
                    </p>
                    <Link href="/products">
                        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <i className="fas fa-shopping-cart mr-2"></i>
                            Mua sắm ngay
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((order) => {
                        
                        // *** LOG 1: KIỂM TRA TOÀN BỘ ĐƠN HÀNG ***
                        // Xem 'order.orderItems' có dữ liệu hay không
                        console.log("Đang render ĐƠN HÀNG:", order);

                        return (
                        <Link 
                            key={order._id} 
                            href={`/orders/${order._id}`}
                            className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                            {/* Order Header */}
                            <div className="p-4 bg-gray-50 rounded-t-lg">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                                    <div className="flex items-center gap-3">
                                        <i className="fas fa-receipt text-blue-600 text-xl"></i>
                                        <div>
                                            <div className="font-semibold text-gray-900">
                                                Đơn hàng: <span className="text-blue-600">#{order.orderNumber || order._id?.slice(-8)}</span>
                                            </div>
                                            <div className="text-sm text-gray-600 flex items-center gap-2">
                                                <i className="far fa-clock"></i>
                                                {order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : "N/A"}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${
                                                statusColors[order.status] || "bg-gray-100 text-gray-800"
                                            }`}
                                        >
                                            <span>{statusIcons[order.status]}</span>
                                            {statusLabels[order.status] || order.status || "Không xác định"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items Preview */}
                            <div className="p-4">
                                {order.orderItems && order.orderItems.length > 0 && (
                                    <div className="space-y-3 mb-4">
                                        {order.orderItems.slice(0, 2).map((item: any, idx: number) => {
                                            
                                            // *** LOG 2: KIỂM TRA TỪNG ITEM ***
                                            // Xem 'item.productImageUrl' có giá trị không
                                            console.log(`Đang render item ${idx}:`, item);
                                            
                                            // Thêm 'return' vì đã đổi () thành {}
                                            return (
                                            <div key={idx} className="flex items-center gap-3">
                                                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                    {item.productImageUrl ? (
                                                        <Image
                                                            src={item.productImageUrl}
                                                            alt={item.productName || 'Product'}
                                                            width={64}
                                                            height={64}
                                                            className="object-cover w-full h-full"
                                                            unoptimized
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <i className="fas fa-image text-gray-400 text-xl"></i>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-gray-900 truncate">
                                                        {item.productName}
                                                    </h4>
                                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                                        <span>x{item.quantity}</span>
                                                        <span className="font-medium text-gray-900">
                                                            {item.unitPrice?.toLocaleString("vi-VN")}đ
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            );
                                        })}
                                        {order.orderItems.length > 2 && (
                                            <div className="text-sm text-gray-600 text-center py-2 bg-gray-50 rounded">
                                                +{order.orderItems.length - 2} sản phẩm khác
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Order Summary */}
                                <div className="border-t pt-4 space-y-2">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">Tạm tính:</span>
                                        <span className="font-medium">{order.subtotal?.toLocaleString("vi-VN")}đ</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">Phí vận chuyển:</span>
                                        <span className="font-medium">{order.shippingFee?.toLocaleString("vi-VN")}đ</span>
                                    </div>
                                    {order.discount > 0 && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-600">Giảm giá:</span>
                                            <span className="font-medium text-green-600">-{order.discount?.toLocaleString("vi-VN")}đ</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center pt-2 border-t">
                                        <span className="font-semibold text-gray-900">Tổng cộng:</span>
                                        <span className="text-xl font-bold text-red-600">
                                            {order.total?.toLocaleString("vi-VN")}đ
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">Thanh toán:</span>
                                        <span className={`font-medium ${paymentStatusColors[order.paymentStatus]}`}>
                                            {paymentStatusLabels[order.paymentStatus]}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default OrdersPage;