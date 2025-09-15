"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { orderService } from "@/services/OrderService/orderService";

const statusColors = {
    PENDING: "bg-blue-400",
    PACKING: "bg-blue-500",
    SHIPPING: "bg-blue-600",
    DELIVERED: "bg-green-500",
    CANCELLED: "bg-gray-400",
};

const statusLabels = {
    PENDING: "Đã đặt hàng",
    PACKING: "Đang đóng gói",
    SHIPPING: "Đang giao",
    DELIVERED: "Đã giao",
    CANCELLED: "Đã hủy",
};

const OrdersPage = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await orderService.getOrders();
            setOrders(res.data || []);
            console.log('res', res)
        } catch (err: any) {
            alert(err.message || "Không thể tải danh sách đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-2 py-8">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Đơn hàng của tôi</h1>
            {orders.length === 0 ? (
                <div className="text-center text-gray-500 py-12">Bạn chưa có đơn hàng nào.</div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <Link key={order._id} href={`/orders/${order._id}`}>
                            <div className="block bg-white rounded-xl shadow p-4 hover:shadow-lg transition">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                    <div>
                                        <div className="font-semibold text-gray-800">
                                            Mã đơn hàng:{" "}
                                            <span className="text-blue-600">{order.orderNumber || order._id}</span>
                                        </div>
                                        <div className="text-gray-500 text-sm">
                                            Ngày đặt: {order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : ""}
                                        </div>
                                    </div>
                                    <div className="mt-2 sm:mt-0">
                                        <span
                                            className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium shadow ${
                                                statusColors[order.status?.toUpperCase()] || "bg-gray-400"
                                            }`}
                                        >
                                            {statusLabels[order.status?.toUpperCase()] || order.status || "Không xác định"}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-2 text-gray-700 text-sm">
                                    Tổng tiền:{" "}
                                    <span className="font-bold text-red-600">{order.total?.toLocaleString("vi-VN")}đ</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrdersPage;