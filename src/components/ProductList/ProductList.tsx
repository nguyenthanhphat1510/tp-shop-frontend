"use client";
import React, { useState, useEffect } from 'react';
import ProductItem from '@/components/ProductItem/ProductItem';
import { productService, Product } from '@/services/productService/productService';

const ProductList = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch products from your NestJS API
    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('🚀 Starting to fetch products...');
            const data = await productService.getAll();
            
            console.log('✅ Products received:', data.length);
            setProducts(data);
            
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Không thể tải danh sách sản phẩm';
            setError(errorMessage);
            console.error('❌ Failed to fetch products:', err);
        } finally {
            setLoading(false);
        }
    };

    // Load products on component mount
    useEffect(() => {
        fetchProducts();
    }, []);

    // Retry on error
    const handleRetry = () => {
        fetchProducts();
    };

    // Loading state
    if (loading) {
        return (
            <div className="w-full flex justify-center py-8">
                <div className="w-[1160px] px-4">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Sản phẩm nổi bật</h2>
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
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Sản phẩm nổi bật</h2>
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

    // No products
    if (products.length === 0) {
        return (
            <div className="w-full flex justify-center py-8">
                <div className="w-[1160px] px-4">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Sản phẩm nổi bật</h2>
                        <p className="text-gray-600">Chưa có sản phẩm nào</p>
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
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Sản phẩm nổi bật</h2>
                    <p className="text-gray-600">Khám phá những sản phẩm công nghệ mới nhất</p>
                </div>

                {/* Grid 5 columns */}
                <div className="grid grid-cols-5">
                    {products.map((product) => (
                        <ProductItem 
                            key={product.id} 
                            product={product}
                        />
                    ))}
                </div>

                {/* Load More Button */}
                <div className="flex justify-center mt-8">
                    <button className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium">
                        Xem thêm sản phẩm
                        <i className="fas fa-chevron-down ml-2"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductList;
