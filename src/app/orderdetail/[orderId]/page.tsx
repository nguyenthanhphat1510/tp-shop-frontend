"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { orderService } from "@/services/OrderService/orderService"; // Đảm bảo đã có service này

const statusSteps = [
    { key: "PENDING", label: "Đã đặt hàng" },
    { key: "PACKING", label: "Đang đóng gói" },
    { key: "SHIPPING", label: "Đang giao" },
    { key: "DELIVERED", label: "Đã giao" },
    { key: "CANCELLED", label: "Đã hủy" },
];

const statusColors = {
    PENDING: "bg-blue-400",
    PACKING: "bg-blue-500",
    SHIPPING: "bg-blue-600",
    DELIVERED: "bg-green-500",
    CANCELLED: "bg-gray-400",
};

const OrderDetailPage = () => {
    const params = useParams();
    const orderId = params?.orderId as string;
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (orderId) {
            fetchOrder();
        }
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const res = await orderService.getOrderById(orderId);
            setOrder(res.data);
        } catch (err: any) {
            alert(err.message || "Không thể tải chi tiết đơn hàng");
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

    if (!order) {
        return (
            <div className="text-center py-16">
                <div className="text-4xl mb-4">⚠️</div>
                <p>Không tìm thấy đơn hàng</p>
                <Link href="/orders">
                    <button className="mt-4 px-5 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-600">
                        Quay lại danh sách đơn hàng
                    </button>
                </Link>
            </div>
        );
    }

    const currentStep = statusSteps.findIndex((s) => s.key === order.status?.toUpperCase());

    return (
        <div className="max-w-3xl mx-auto px-2 py-8">
            {/* Card tổng */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                {/* Tóm tắt đơn hàng */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                    <div>
                        <div className="text-gray-700 font-semibold text-lg mb-1">
                            Mã đơn hàng:{" "}
                            <span className="text-blue-600">
                                {order.orderNumber || order.id}
                            </span>
                        </div>
                        <div className="text-gray-500 text-sm">
                            Ngày đặt:{" "}
                            {order.createdAt
                                ? new Date(order.createdAt).toLocaleString("vi-VN")
                                : ""}
                        </div>
                    </div>
                    <div className="mt-2 sm:mt-0">
                        <span
                            className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium shadow ${
                                statusColors[order.status] ||
                                "bg-gray-400"
                            }`}
                        >
                            {
                                statusSteps.find(
                                    (s) => s.key === order.status
                                )?.label || "Không xác định"
                            }
                        </span>
                    </div>
                </div>

                {/* Trạng thái giao hàng */}
                <div className="flex items-center justify-between mt-4 mb-6">
                    {statusSteps.slice(0, 4).map((step, idx) => (
                        <React.Fragment key={step.key}>
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-bold shadow ${
                                        idx <= currentStep
                                            ? "bg-blue-500"
                                            : "bg-gray-300"
                                    }`}
                                >
                                    {idx + 1}
                                </div>
                                <span
                                    className={`mt-2 text-xs ${
                                        idx <= currentStep
                                            ? "text-blue-600 font-semibold"
                                            : "text-gray-400"
                                    }`}
                                >
                                    {step.label}
                                </span>
                            </div>
                            {idx < 3 && (
                                <div
                                    className={`flex-1 h-1 mx-1 ${
                                        idx < currentStep
                                            ? "bg-blue-400"
                                            : "bg-gray-200"
                                    } rounded`}
                                ></div>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Thông tin khách hàng */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="font-semibold mb-1 text-gray-700">
                        Thông tin khách hàng
                    </div>
                    <div className="text-gray-700 text-sm">
                        <div>Họ tên: {order.shippingInfo?.fullName}</div>
                        <div>Điện thoại: {order.shippingInfo?.phone}</div>
                        <div>Địa chỉ: {order.shippingInfo?.address}</div>
                    </div>
                </div>

                {/* Danh sách sản phẩm */}
                <div className="mb-4">
                    <div className="font-semibold mb-2 text-gray-700">Sản phẩm</div>
                    <div className="divide-y divide-gray-200">
                        {order.items?.map((item: any, idx: number) => (
                            <div key={item.productId || idx} className="flex py-3 items-center">
                                <div className="w-14 h-14 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 border">
                                    <Image
                                        src={item.imageUrl}
                                        alt={item.productName}
                                        width={56}
                                        height={56}
                                        className="object-cover"
                                    />
                                </div>
                                <div className="ml-4 flex-1">
                                    <div className="font-medium text-gray-900">
                                        {item.productName}
                                    </div>
                                    <div className="text-gray-500 text-xs">
                                        SL: {item.quantity}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-gray-700 font-semibold">
                                        {item.price?.toLocaleString("vi-VN")}đ
                                    </div>
                                    <div className="text-gray-500 text-xs">
                                        Tổng:{" "}
                                        {(item.price * item.quantity)?.toLocaleString(
                                            "vi-VN"
                                        )}
                                        đ
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Phương thức thanh toán & tổng tiền */}
                <div className="bg-gray-50 rounded-lg p-4 mb-2 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <div className="text-gray-700 text-sm">
                        <div>
                            Phương thức thanh toán:{" "}
                            <span className="font-medium">
                                {order.paymentMethod === "cod"
                                    ? "Thanh toán khi nhận hàng"
                                    : order.paymentMethod}
                            </span>
                        </div>
                    </div>
                    <div className="text-gray-900 font-bold text-lg mt-2 sm:mt-0">
                        Tổng tiền: {order.total?.toLocaleString("vi-VN")}đ
                    </div>
                </div>

                {/* Nút quay lại */}
                <div className="mt-6 text-center">
                    <Link href="/orders">
                        <button className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors">
                            Quay lại danh sách đơn hàng
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;