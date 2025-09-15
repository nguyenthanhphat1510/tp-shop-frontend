"use client";
import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Zoom } from 'swiper/modules';
import Image from 'next/image';
import Link from 'next/link';
import { cartService } from '../../services';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/zoom';

import { Product, productService } from '@/services/productService/productService';

interface ProductDetailProps {  
    productId: string;
}

const ProductDetail = ({ productId }: ProductDetailProps) => {
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [quantity, setQuantity] = useState(1);

        // Helper: kiểm tra đã đăng nhập (có token trong localStorage)
  const isLoggedIn = typeof window !== 'undefined' && (!!localStorage.getItem('token') || !!localStorage.getItem('accessToken'));
        const { isAuthenticated, setShowLoginModal, setCartCount } = useAuth();

    useEffect(() => {
        fetchProductDetail();
        fetchRelatedProducts();
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

    const fetchRelatedProducts = async () => {
        try {
            // Lấy tất cả sản phẩm và filter random 5 sản phẩm để hiển thị grid 5 cột
            const allProducts = await productService.getAll();
            const filtered = allProducts.filter(p => p.id !== productId);
            const shuffled = filtered.sort(() => 0.5 - Math.random());
            setRelatedProducts(shuffled.slice(0, 5)); // Lấy 5 sản phẩm cho grid 5 cột
        } catch (err) {
            console.error('❌ Error fetching related products:', err);
        }
    };

    // 🎯 CẬP NHẬT: Sử dụng nhiều ảnh từ API
    const getProductImages = () => {
        const images = [];
        
        // FIX 1: Kiểm tra và xử lý imageUrls từ API
        if (product?.imageUrls && Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
            product.imageUrls.forEach((url, index) => {
                // FIX: Kiểm tra URL hợp lệ
                if (url && typeof url === 'string' && url.trim()) {
                    images.push({
                        url: url.trim(),
                        alt: `${product.name} - Ảnh ${index + 1}`,
                        isMain: index === 0
                    });
                }
            });
        } 
        // FIX 2: Fallback cho imageUrl đơn
        else if (product?.imageUrl && typeof product.imageUrl === 'string' && product.imageUrl.trim()) {
            images.push({
                url: product.imageUrl.trim(),
                alt: product.name,
                isMain: true
            });
        }
        
        // FIX 3: Placeholder mặc định
        if (images.length === 0) {
            images.push({
                url: '/images/products/placeholder.jpg',
                alt: product?.name || 'Sản phẩm',
                isMain: true
            });
        }

        return images;
    };

    // Helper function to get category name (giống ProductItem)
    const getCategoryName = (categoryId: string) => {
        const categoryMap: { [key: string]: string } = {
            '685cbd213f7b05b5d70b860f': 'Điện thoại',
            // Add more category mappings as needed
        };
        return categoryMap[categoryId] || 'Sản phẩm';
    };

    const handleQuantityChange = (newQuantity: number) => {
        if (newQuantity >= 1 && newQuantity <= (product?.stock || 0)) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = async () => {
        if (!product) return;

        if (!isAuthenticated) {
            setShowLoginModal(true);
            return;
        }

        try {
            await cartService.addToCart({
                productId: product.id,
                quantity: quantity
            });

            toast.success('Đã thêm sản phẩm vào giỏ hàng!');

            // Sau khi thêm, fetch lại giỏ hàng để cập nhật cartCount
            const cartData = await cartService.getCart();
            const items = cartData?.items || [];
            setCartCount(items.length); // cập nhật số lượng mặt hàng cho badge

        } catch (error: any) {
            console.error('❌ Lỗi khi thêm vào giỏ hàng:', error);
            toast.error(error.message || 'Thêm vào giỏ hàng thất bại');
        }
    };

    const handleBuyNow = () => {
        if (!product) return;
        console.log('💳 MUA NGAY:', {
            product: product.name,
            quantity: quantity,
            totalPrice: product.price * quantity
        });
    };

    // Thêm hàm parse ở đầu file (trước hoặc trong component)
function parseSpecsString(specsString: string): Array<{ key: string; value: string }> {
    if (!specsString) return [];
    const lines = specsString.split('\n').map(line => line.trim()).filter(Boolean);
    const result: Array<{ key: string; value: string }> = [];
    for (let i = 0; i < lines.length; i++) {
        // Nếu dòng này có dấu :, là key
        if (lines[i].includes(':')) {
            const key = lines[i].replace(':', '').trim();
            const value = lines[i + 1] ? lines[i + 1].trim() : '';
            if (key && value) {
                result.push({ key, value });
                i++; // bỏ qua dòng value tiếp theo
            }
        }
    }
    return result;
}

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
            {/* 🎯 MAIN PRODUCT SECTION - 2 COLUMNS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">

                {/* 🖼️ PRODUCT IMAGES - LEFT COLUMN - FIX */}
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
                                aspectRatio: '3/2',
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
                                                aspectRatio: '3/2',
                                            }}
                                        >
                                            {/* FIX: Sử dụng Next.js Image component thay vì img tag */}
                                            <div className="relative w-full h-full">
                                                <Image
                                                    src={image.url}
                                                    alt={image.alt}
                                                    fill
                                                    className="object-contain rounded"
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    priority={index === 0} // Ưu tiên load ảnh đầu tiên
                                                    onError={(e) => {
                                                        console.error('Error loading image:', image.url);
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = '/images/products/placeholder.jpg';
                                                    }}
                                                />
                                            </div>
                                            {image.isMain && (
                                                <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium z-10">
                                                    Ảnh chính
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>

                    {/* FIX: BỎ Image Counter */}
                    {/* <div className="mt-4 text-center text-sm text-gray-600">
                        <span>📸 {productImages.length} ảnh • 🔍 Click để phóng to</span>
                    </div> */}
                </div>

                {/* 📝 PRODUCT INFO - RIGHT COLUMN - SIMPLIFIED */}
                <div className="product-info w-full">
                    {/* Product Name */}
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                        {product.name}
                    </h1>

                    {/* Price Section */}
                    <div className="price-section mb-6">
                        <span className="text-3xl font-bold text-red-600">
                            {product.price.toLocaleString('vi-VN')} đ
                        </span>
                    </div>

                    {/* Product Description */}
                    <div className="description mb-8">
                        <h3 className="text-lg font-semibold mb-3 text-gray-900">Thông số kỹ thuật</h3>
                        <div className="w-full max-w-xl">
                            <table className="w-full text-sm">
                                <tbody>
                                    {parseSpecsString(product.description).map(({ key, value }) => (
                                        <tr key={key}>
                                            <td className="py-2 pr-4 font-medium text-gray-700 whitespace-nowrap">
                                                {key.endsWith(':') ? key : key + ':'}
                                            </td>
                                            <td className="py-2 text-gray-900">{value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Quantity and Actions */}
                    <div className="purchase-section">
                        {/* Actions Only - Bỏ Quantity Selector, chỉ giữ Thêm vào giỏ hàng */}
                        <div className="actions">
                            <button
                                onClick={handleAddToCart}
                                className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                                    product.stock > 0
                                        ? 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-600 hover:text-white'
                                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                }`}
                                disabled={product.stock === 0}
                            >
                                {product.stock > 0 ? (
                                    <>
                                        <i className="fas fa-shopping-cart"></i>
                                        Thêm vào giỏ hàng
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-times"></i>
                                        Hết hàng
                                    </>
                                )}
                            </button>
                        </div>

                        {/* FIX: BỎ Stock Info */}
                        {/* <div className="mt-4 text-center text-sm text-gray-600">
                            Còn lại: <span className="font-medium">{product.stock}</span> sản phẩm
                        </div> */}
                    </div>
                </div>
            </div>

            {/* 🎯 RELATED PRODUCTS SECTION - GIỐNG PRODUCTLIST */}
            <div className="related-products w-full flex justify-center py-8">
                <div className="w-[1160px] px-4">
                    {/* Header giống ProductList */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Sản phẩm liên quan</h2>
                        <p className="text-gray-600">Khám phá những sản phẩm tương tự</p>
                    </div>

                    {relatedProducts.length > 0 ? (
                        <>
                            {/* Grid 5 columns giống ProductList */}
                            <div className="grid grid-cols-5">
                                {relatedProducts.map((relatedProduct) => (
                                    <div key={relatedProduct.id} className="rounded-lg overflow-hidden transition-shadow group">
                                        <div 
                                            className="bg-white rounded-lg overflow-hidden custom-shadow-hover transition-all duration-300"
                                            style={{ 
                                                border: '1px solid rgba(234, 236, 240, 1)',
                                                margin: '5px 10px 5px 0',
                                                padding: '20px 10px 10px 10px',
                                                height: '563px'
                                            }}
                                        >
                                            <Link href={`/products/${relatedProduct.id}`}>
                                                <div className="flex justify-center mt-4">
                                                    <div 
                                                        className="relative bg-gray-100 overflow-hidden rounded-lg transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:-translate-y-2" 
                                                        style={{ 
                                                            width: '180px', 
                                                            height: '180px',
                                                        }}
                                                    >
                                                        {/* FIX: Xử lý image URL tốt hơn */}
                                                        <Image 
                                                            src={relatedProduct.imageUrl || relatedProduct.imageUrls?.[0] || '/images/products/placeholder.jpg'} 
                                                            alt={relatedProduct.name}
                                                            fill
                                                            className="object-cover"
                                                            sizes="180px"
                                                            onError={(e) => {
                                                                console.error('Error loading related product image:', relatedProduct.imageUrl);
                                                                const target = e.target as HTMLImageElement;
                                                                target.src = '/images/products/placeholder.jpg';
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <div className="p-4 mt-2">
                                                    {/* Category Badge */}
                                                    <span className="inline-block bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full mb-2">
                                                        {getCategoryName(relatedProduct.categoryId)}
                                                    </span>
                                                    
                                                    <h3 className="font-semibold text-lg">{relatedProduct.name}</h3>
                                                    <p className="text-gray-600 line-clamp-2">{relatedProduct.description}</p>
                                                    <p className="text-red-500 font-bold mt-2">{relatedProduct.price.toLocaleString('vi-VN')} đ</p>
                                                    
                                                    {/* Stock info */}
                                                    <div className="mt-2 flex justify-between items-center">
                                                        <p className="text-gray-500 text-xs">
                                                            {relatedProduct.stock > 0 ? `Còn lại: ${relatedProduct.stock}` : 'Hết hàng'}
                                                        </p>
                                                        <div className={`w-2 h-2 rounded-full ${relatedProduct.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Load More Button giống ProductList */}
                            <div className="flex justify-center mt-8">
                                <button 
                                    onClick={() => {
                                        // Navigate to products page
                                        window.location.href = '/products';
                                    }}
                                    className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
                                >
                                    Xem thêm sản phẩm
                                    <i className="fas fa-chevron-down ml-2"></i>
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-600">Không có sản phẩm liên quan</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;