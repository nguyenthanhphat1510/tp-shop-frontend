"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { productService, SaleVariant } from '@/services/productService/productService';

const SaleVariantsList = () => {
    // ... (Giữ nguyên toàn bộ state, useEffect, và các hàm fetch) ...
    const [saleVariants, setSaleVariants] = useState<SaleVariant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch sale variants
    const fetchSaleVariants = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('🚀 Starting to fetch sale variants...');
            const data = await productService.getSaleVariants();
            
            console.log('✅ Sale variants received:', data.length);
            setSaleVariants(data);
            
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Không thể tải danh sách sản phẩm giảm giá';
            setError(errorMessage);
            console.error('❌ Failed to fetch sale variants:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSaleVariants();
    }, []);

    const handleRetry = () => {
        fetchSaleVariants();
    };

    // ✅ GET PRODUCT URL WITH VARIANTID
    const getProductUrl = (variant: SaleVariant) => {
        return `/products/${variant.productId}?variantId=${variant.id}`;
    };

    // ... (Giữ nguyên các phần Loading, Error, No sale variants) ...
    // Loading state
    if (loading) {
        return (
            <div className="w-full flex justify-center py-8">
                <div className="w-[1160px] px-4">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">🔥 Sản phẩm đang giảm giá</h2>
                        <p className="text-gray-600">Đang tải sản phẩm...</p>
                    </div>
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="w-full flex justify-center py-8">
                <div className="w-[1160px] px-4">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">🔥 Sản phẩm đang giảm giá</h2>
                        <p className="text-red-600">{error}</p>
                    </div>
                    <div className="flex justify-center items-center h-64">
                        <button 
                            onClick={handleRetry}
                            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // No sale variants
    if (saleVariants.length === 0) {
        return (
            <div className="w-full flex justify-center py-8">
                <div className="w-[1160px] px-4">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">🔥 Sản phẩm đang giảm giá</h2>
                        <p className="text-gray-600">Hiện tại chưa có sản phẩm nào đang giảm giá</p>
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className="w-full flex justify-center py-8">
            <div className="w-[1160px] px-4">
                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">🔥 Sản phẩm đang giảm giá</h2>
                    <p className="text-gray-600">Khuyến mãi hấp dẫn - Số lượng có hạn</p>
                </div>

                {/* FIX: Đổi từ 'grid' sang 'flex' để cuộn ngang */}
                {/* Thêm 'overflow-x-auto' để cho phép cuộn */}
                {/* Thêm 'pb-6' để chừa khoảng trống cho thanh cuộn (nếu nó xuất hiện) */}
                <div className="flex overflow-x-auto gap-4 bg-[linear-gradient(5deg,_#cb1c22_67.61%,_#d9503f_95.18%)] p-4 rounded-lg pb-6">
                    {saleVariants.map((variant) => (
                        <Link 
                            key={variant.id} 
                            href={getProductUrl(variant)}
                            // FIX: Thêm 'flex-shrink-0' và set width
                            // Width tính toán để hiển thị ~5 item (1160px - padding - gap) / 5
                            className="block flex-shrink-0 w-[213px]"
                        >
                            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden cursor-pointer group">
                                {/* Sale Badge */}
                                <div className="relative">
                                    <img
                                        src={variant.imageUrls[0] || '/images/placeholder.jpg'}
                                        alt={variant.productName || variant.sku}
                                        className="w-full h-48 object-cover
                                                   transform transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-sm font-bold shadow-md">
                                        -{variant.discountPercent}%
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <h3 className="font-medium text-gray-800 mb-2 line-clamp-2 min-h-[3rem]">
                                        {variant.productName || variant.sku}
                                    </h3>
                                    
                                    <div className="text-sm text-gray-600 mb-2">
                                        {variant.storage && <span className="font-medium">{variant.storage}</span>}
                                        {variant.storage && variant.color && <span> - </span>}
                                        <span>{variant.color}</span>
                                    </div>

                                    {/* Price */}
                                    <div className="mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-red-600 font-bold text-lg">
                                                {Number(variant.finalPrice).toLocaleString('vi-VN')}đ
                                            </span>
                                            <span className="text-gray-500 line-through text-sm">
                                                {Number(variant.price).toLocaleString('vi-VN')}đ
                                            </span>
                                        </div>
                                        <div className="text-green-600 text-sm font-medium">
                                            Tiết kiệm: {Number(variant.savedAmount).toLocaleString('vi-VN')}đ
                                        </div>
                                    </div>

                                    {/* Stock */}
                                    <div className="text-sm text-gray-600 mb-3">
                                        <span className={variant.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                                            Kho: {variant.stock}
                                        </span>
                                        <span className="mx-1">|</span>
                                        <span>Đã bán: {variant.sold}</span>
                                    </div>

                                    {/* Action Button */}
                                    <button 
                                        className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                                    >
                                        Mua ngay
                                    </button>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* FIX: Đã xóa nút "Load More" */}
            </div>
        </div>
    );
};

export default SaleVariantsList;