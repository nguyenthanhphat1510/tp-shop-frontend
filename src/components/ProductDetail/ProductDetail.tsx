"use client";
import React, { useState, useEffect } from 'react';
import { Product, productService } from '@/services/ProductService/productService'; // 🎯 Import service

interface ProductDetailProps {
    productId: string;
}

const ProductDetail = ({ productId }: ProductDetailProps) => {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchProductDetail();
    }, [productId]);

    // 🎯 SỬ DỤNG: productService.getById
    const fetchProductDetail = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('🔄 Fetching product with ID:', productId);

            // 🎯 GỌI SERVICE: Sử dụng productService
            const productData = await productService.getById(productId);

            setProduct(productData);
            console.log('✅ Product loaded successfully:', productData.name);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra';
            setError(errorMessage);
            console.error('❌ Error loading product:', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                <span className="ml-4">Đang tải sản phẩm...</span>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                    onClick={fetchProductDetail}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    // Product not found
    if (!product) {
        return (
            <div className="text-center py-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                    Không tìm thấy sản phẩm
                </h1>
                <p className="text-gray-600">Sản phẩm có ID "{productId}" không tồn tại.</p>
            </div>
        );
    }

    return (
        <div className="product-detail-container max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* 🖼️ PRODUCT IMAGES */}
                <div className="product-images">
                    <div className="main-image bg-gray-100 rounded-lg overflow-hidden aspect-square">
                        <img
                            src={product.imageUrl || '/placeholder.jpg'}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {/* Có thể thêm thumbnail images */}
                </div>

                {/* 📝 PRODUCT INFORMATION */}
                <div className="product-info">

                    {/* Breadcrumb Navigation */}
                    <nav className="breadcrumb mb-4 text-sm text-gray-600">
                        <span>Trang chủ</span> /
                        <span> Sản phẩm</span> /
                        <span className="text-gray-800"> {product.name}</span>
                    </nav>

                    {/* Product Name */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        {product.name}
                    </h1>

                    {/* Product ID (for debugging) */}
                    <p className="text-sm text-gray-500 mb-2">
                        Mã sản phẩm: {product.id}
                    </p>

                    {/* Price Section */}
                    <div className="price-section mb-6">
                        <span className="text-3xl font-bold text-red-600">
                            {product.price.toLocaleString('vi-VN')} đ
                        </span>
                        {/* Có thể thêm original price nếu có sale */}
                    </div>

                    {/* Product Description */}
                    <div className="description mb-6">
                        <h3 className="text-lg font-semibold mb-3">Mô tả sản phẩm:</h3>
                        <p className="text-gray-700 leading-relaxed">
                            {product.description}
                        </p>
                    </div>

                    {/* Stock Information */}
                    <div className="stock-info mb-6">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-600">Tình trạng:</span>
                            <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {product.stock > 0 ? `Còn lại ${product.stock} sản phẩm` : 'Hết hàng'}
                            </span>
                            <div className={`w-2 h-2 rounded-full ${product.isActive ? 'bg-green-500' : 'bg-red-500'
                                }`}></div>
                        </div>
                    </div>

                    {/* Product Category */}
                    <div className="category-info mb-6">
                        <span className="text-gray-600">Danh mục: </span>
                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm">
                            {product.categoryId}
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="actions space-y-4">
                        {/* Add to Cart Button */}
                        <button
                            className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${product.stock > 0
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            disabled={product.stock === 0}
                            onClick={() => {
                                console.log('🛒 THÊM VÀO GIỎ HÀNG:', product.name);
                                // TODO: Implement add to cart logic
                            }}
                        >
                            {product.stock > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
                        </button>

                        {/* Buy Now Button */}
                        {product.stock > 0 && (
                            <button
                                className="w-full py-3 px-6 rounded-lg font-medium bg-orange-600 text-white hover:bg-orange-700 transition-colors"
                                onClick={() => {
                                    console.log('💳 MUA NGAY:', product.name);
                                    // TODO: Implement buy now logic
                                }}
                            >
                                Mua ngay
                            </button>
                        )}
                    </div>

                </div>
            </div>

            {/* Additional Sections */}
            <div className="mt-12">
                {/* Product Specifications */}
                <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4">Thông số kỹ thuật</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-600">ID:</span>
                            <span className="ml-2 font-medium">{product.id}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">Trạng thái:</span>
                            <span className="ml-2 font-medium">
                                {product.isActive ? 'Đang bán' : 'Ngừng bán'}
                            </span>
                        </div>
                        {/* Có thể thêm nhiều thông số khác */}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ProductDetail;