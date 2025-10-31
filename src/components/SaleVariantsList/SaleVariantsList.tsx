"use client";
import React, { useState, useEffect } from 'react';
import { productService, SaleVariant } from '@/services/productService/productService';

const SaleVariantsList = () => {
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

                {/* Grid 5 columns */}
                <div className="grid grid-cols-5 gap-4">
                    {saleVariants.map((variant) => (
                        <div key={variant._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
                            {/* Sale Badge */}
                            <div className="relative">
                                <img 
                                    src={variant.imageUrls[0] || '/placeholder.jpg'} 
                                    alt={variant.sku}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-sm font-bold">
                                    -{variant.discountPercent}%
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <h3 className="font-medium text-gray-800 mb-2 line-clamp-2">
                                    {variant.productName || variant.sku}
                                </h3>
                                
                                <div className="text-sm text-gray-600 mb-2">
                                    {variant.storage && <span>{variant.storage} - </span>}
                                    <span>{variant.color}</span>
                                </div>

                                {/* Price */}
                                <div className="mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-red-600 font-bold text-lg">
                                            {variant.finalPrice.toLocaleString()}đ
                                        </span>
                                        <span className="text-gray-500 line-through text-sm">
                                            {variant.price.toLocaleString()}đ
                                        </span>
                                    </div>
                                    <div className="text-green-600 text-sm">
                                        Tiết kiệm: {variant.savedAmount.toLocaleString()}đ
                                    </div>
                                </div>

                                {/* Stock */}
                                <div className="text-sm text-gray-600 mb-3">
                                    Kho: {variant.stock} | Đã bán: {variant.sold}
                                </div>

                                {/* Action Button */}
                                <button className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium">
                                    Mua ngay
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Load More Button */}
                <div className="flex justify-center mt-8">
                    <button className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium">
                        Xem thêm sản phẩm giảm giá
                        <i className="fas fa-chevron-down ml-2"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SaleVariantsList;