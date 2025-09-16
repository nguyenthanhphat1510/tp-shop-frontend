"use client"; // ✅ phải đứng dòng 1

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// (tuỳ chọn) né prerender cứng nếu bạn cần:
export const dynamic = "force-dynamic";

function Content() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                <div className="text-green-500 text-6xl mb-4">✅</div>
                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                    Thanh toán thành công!
                </h1>
                <p className="text-gray-600 mb-6">
                    Đơn hàng của bạn đã được thanh toán và xác nhận thành công.
                </p>
                {orderId && (
                    <p className="text-sm text-gray-500 mb-6">Mã đơn hàng: {orderId}</p>
                )}
                <div className="space-x-4">
                    <Link
                        href={orderId ? `/orders/${orderId}` : "/orders"}
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                    >
                        Xem đơn hàng
                    </Link>
                    <Link
                        href="/"
                        className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                    >
                        Về trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={<div className="p-6 text-gray-600">Đang tải…</div>}>
            <Content />
        </Suspense>
    );
}
