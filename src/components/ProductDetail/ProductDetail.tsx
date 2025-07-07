"use client";
import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Zoom } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/zoom';

import { Product, productService } from '@/services/ProductService/productService';

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

    const fetchProductDetail = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('🔄 Fetching product with ID:', productId);
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

    // 🎯 TẠO GALLERY VỚI 3 ẢNH CỐ ĐỊNH
    const getProductImages = () => {
        const images = [];
        
        // Ảnh chính từ sản phẩm (nếu có)
        if (product?.imageUrl) {
            images.push({
                url: product.imageUrl,
                alt: product.name,
                isMain: true
            });
        }
        
        // 🖼️ 3 ẢNH TỪ THƯ MỤC PRODUCTS
        const staticImages = [
            '/images/products/product-iphone16-promax-256-1.jpg',
            '/images/products/product-iphone16-promax-256-2.jpg',
            '/images/products/product-iphone16-promax-256-3.jpg'
        ];

        staticImages.forEach((url, index) => {
            images.push({
                url: url,
                alt: `${product?.name} - Góc nhìn ${index + 1}`,
                isMain: false
            });
        });

        return images;
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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

    const productImages = getProductImages();

    return (
        <div className="product-detail-container max-w-7xl mx-auto p-4">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12">

                {/* 🖼️ PRODUCT IMAGES - FIXED RESPONSIVE */}
                <div className="product-images w-full flex flex-col items-center">
                    <div className="main-swiper w-full max-w-lg">
                        <Swiper
                            spaceBetween={0}
                            navigation={true}
                            pagination={{
                                clickable: true,
                                dynamicBullets: true,
                            }}
                            zoom={true}
                            modules={[Navigation, Pagination, Zoom]}
                            className="rounded-lg shadow-lg overflow-hidden bg-white"
                            style={{ 
                                '--swiper-navigation-color': '#374151',
                                '--swiper-pagination-color': '#374151',
                                '--swiper-navigation-size': '28px',
                                aspectRatio: '3/2', // 720/480 = 3/2
                                width: '100%',
                                maxWidth: '720px',
                            } as any}
                        >
                            {productImages.map((image, index) => (
                                <SwiperSlide key={index}>
                                    <div className="swiper-zoom-container">
                                        <div 
                                            className="w-full h-full flex items-center justify-center relative bg-white"
                                            style={{
                                                aspectRatio: '3/2', // 720/480 = 3/2
                                            }}
                                        >
                                            <img
                                                src={image.url}
                                                alt={image.alt}
                                                className="object-contain rounded max-w-[79%] max-h-[79%]"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = '/images/products/placeholder.jpg';
                                                }}
                                            />
                                            {/* Badge cho ảnh chính */}
                                            {image.isMain && (
                                                <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                                                    Ảnh chính
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>

                    {/* Image Counter & Features */}
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-600 w-full max-w-lg">
                        <div className="flex items-center gap-4">
                            <span>📸 {productImages.length} ảnh</span>
                            <span>🔍 Click để phóng to</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                Tỷ lệ 3:2 (720×480)
                            </span>
                        </div>
                    </div>
                </div>

                {/* 📝 PRODUCT INFORMATION - CLEAN STYLE */}
                <div className="product-info w-full">
                    {/* Breadcrumb Navigation */}
                    <nav className="breadcrumb mb-6 text-sm text-gray-500">
                        <span className="hover:text-blue-600 cursor-pointer">Trang chủ</span>
                        <span className="mx-2">›</span>
                        <span className="hover:text-blue-600 cursor-pointer">Sản phẩm</span>
                        <span className="mx-2">›</span>
                        <span className="text-gray-800 font-medium">{product.name}</span>
                    </nav>

                    {/* Product Name */}
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6 leading-tight">
                        {product.name}
                    </h1>

                    {/* Product ID */}
                    <p className="text-sm text-gray-500 mb-6">
                        Mã sản phẩm: {product.id}
                    </p>

                    {/* Price Section */}
                    <div className="price-section mb-8">
                        <span className="text-3xl font-bold text-blue-600">
                            {product.price.toLocaleString('vi-VN')} đ
                        </span>
                    </div>

                    {/* Product Description */}
                    <div className="description mb-8">
                        <h3 className="text-lg font-semibold mb-3">Mô tả sản phẩm:</h3>
                        <p className="text-gray-700 leading-relaxed">
                            {product.description}
                        </p>
                    </div>

                    {/* Product Options */}
                    <div className="product-options mb-8 space-y-4">
                        {/* Stock Status */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">Tình trạng:</span>
                            <div className="flex items-center gap-2">
                                <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {product.stock > 0 ? `Còn lại ${product.stock} sản phẩm` : 'Hết hàng'}
                                </span>
                                <div className={`w-2 h-2 rounded-full ${product.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            </div>
                        </div>

                        {/* Category */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">Danh mục:</span>
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-medium">
                                {product.categoryId}
                            </span>
                        </div>

                        {/* Quantity Selector */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">Số lượng:</span>
                            <div className="flex items-center border rounded-lg bg-white">
                                <button className="px-3 py-2 text-gray-500 hover:bg-gray-100 transition-colors">
                                    −
                                </button>
                                <input 
                                    type="number" 
                                    value="1" 
                                    min="1" 
                                    max={product.stock}
                                    className="w-16 text-center py-2 border-0 focus:outline-none"
                                />
                                <button className="px-3 py-2 text-gray-500 hover:bg-gray-100 transition-colors">
                                    +
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Actions - Clean Style */}
                    <div className="actions space-y-4">
                        {/* Add to Cart Button */}
                        <button
                            className={`w-full py-4 px-6 rounded-lg font-medium transition-all duration-200 ${
                                product.stock > 0
                                    ? 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-600 hover:text-white'
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                            disabled={product.stock === 0}
                            onClick={() => {
                                console.log('🛒 THÊM VÀO GIỎ HÀNG:', product.name);
                            }}
                        >
                            {product.stock > 0 ? (
                                <span className="flex items-center justify-center gap-2">
                                    🛒 Thêm vào giỏ hàng
                                </span>
                            ) : 'Hết hàng'}
                        </button>

                        {/* Buy Now Button */}
                        {product.stock > 0 && (
                            <button
                                className="w-full py-4 px-6 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
                                onClick={() => {
                                    console.log('💳 MUA NGAY:', product.name);
                                }}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    ⚡ Mua ngay
                                </span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Product Description Section */}
            <div className="mt-16">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Chi tiết sản phẩm</h2>
                    <div className="bg-white rounded-lg shadow border p-6">
                        <p className="text-gray-700 leading-relaxed text-base">
                            {product.description}
                        </p>
                    </div>
                </div>
            </div>

            {/* Additional Product Info */}
            <div className="mt-12">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin kỹ thuật</h2>
                    <div className="bg-white rounded-lg shadow border overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
                            <div className="p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Thông tin cơ bản</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Mã sản phẩm:</span>
                                        <span className="font-medium text-gray-900">{product.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Trạng thái:</span>
                                        <span className={`font-medium ${product.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                            {product.isActive ? 'Đang bán' : 'Ngừng bán'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tỷ lệ ảnh:</span>
                                        <span className="font-medium text-gray-900">3:2 (720×480)</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Responsive:</span>
                                        <span className="font-medium text-gray-900">✅ Có</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Thông tin kho</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tồn kho:</span>
                                        <span className="font-medium text-gray-900">{product.stock} sản phẩm</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Danh mục:</span>
                                        <span className="font-medium text-gray-900">{product.categoryId}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Ngày tạo:</span>
                                        <span className="font-medium text-gray-900">
                                            {new Date(product.createdAt).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Số ảnh:</span>
                                        <span className="font-medium text-gray-900">{productImages.length} ảnh</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;