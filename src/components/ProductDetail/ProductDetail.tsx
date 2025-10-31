"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Zoom } from 'swiper/modules';
import Image from 'next/image';
import Link from 'next/link';
import { cartService } from '../../services';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import { useCart } from '@/contexts/CartContext'; // 1. Import hook useCart

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/zoom';

import { Product, productService } from '@/services/productService/productService';

interface ProductDetailProps {  
    productId: string;
}

// ✅ ĐỊNH NGHĨA VARIANT INTERFACE
interface Variant {
    _id: string;
    storage: string;
    color: string;
    price: number;
    stock: number;
    images: string[];
    isActive: boolean;
}

const ProductDetail = ({ productId }: ProductDetailProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [quantity, setQuantity] = useState(1);

    // ✅ THÊM STATE CHO VARIANT SELECTION
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

    // ✅ SỬA LỖI: Đổi từ getToken thành getItem
    const isLoggedIn = typeof window !== 'undefined' && (!!localStorage.getItem('token') || !!localStorage.getItem('accessToken'));
    const { isAuthenticated, setShowLoginModal, setCartCount } = useAuth();
    const { dispatch } = useCart(); // 2. Lấy hàm dispatch từ context

    useEffect(() => {
        fetchProductDetail();
        fetchRelatedProducts();
    }, [productId]);

    // ✅ THÊM: Xử lý URL params khi có variant
    useEffect(() => {
        if (product && product.variants && product.variants.length > 0) {
            const colorParam = searchParams.get('color');
            const storageParam = searchParams.get('storage');
                
            let targetVariant: Variant | null = null;
            
            if (colorParam && storageParam) {
                // Tìm variant theo URL params
                targetVariant = product.variants.find(v => 
                    v.color.toLowerCase() === colorParam.toLowerCase() && 
                    v.storage.toLowerCase() === storageParam.toLowerCase()
                );
                console.log('🔍 Looking for variant by URL params:', colorParam, storageParam);
            }
            
            if (!targetVariant) {
                // Fallback: variant rẻ nhất
                targetVariant = product.variants.reduce((min: Variant, variant: Variant) => 
                    variant.price < min.price ? variant : min
                );
                console.log('🎯 Using cheapest variant as fallback');
            }
            
            if (targetVariant && (!selectedVariant || selectedVariant._id !== targetVariant._id)) {
                setSelectedVariant(targetVariant);
                console.log('✅ Variant selected from URL:', targetVariant.color, targetVariant.storage);
            }
        }
    }, [product, searchParams, selectedVariant]);

    const fetchProductDetail = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('🔄 Fetching product with ID:', productId);
            const response = await productService.getById(productId);
            console.log('✅ Product fetch response:', response);
            
            // ✅ XỬ LÝ RESPONSE TỪ BACKEND (có variants)
            let productData: Product;
            
            if (response.product && response.variants) {
                // Response từ findOne: { product: Product, variants: Variant[] }
                productData = {
                    ...response.product,
                    id: response.product._id,
                    variants: response.variants.map((v: any) => ({
                        _id: v._id,
                        storage: v.storage,
                        color: v.color,
                        price: v.price,
                        stock: v.stock,
                        images: v.imageUrls || [], // Map imageUrls thành images
                        isActive: v.isActive
                    }))
                };
            } else {
                // Response trực tiếp là Product (từ findAll)
                productData = response;
            }

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
            const allProducts = await productService.getAll();
            const filtered = allProducts.filter(p => p.id !== productId);
            const shuffled = filtered.sort(() => 0.5 - Math.random());
            setRelatedProducts(shuffled.slice(0, 5));
        } catch (err) {
            console.error('❌ Error fetching related products:', err);
        }
    };

    // ✅ CẬP NHẬT: Lấy ảnh từ variant đã chọn
    const getProductImages = () => {
        const images = [];
        
        // Lấy ảnh từ selected variant
        if (selectedVariant?.images && Array.isArray(selectedVariant.images) && selectedVariant.images.length > 0) {
            selectedVariant.images.forEach((url: string, index: number) => {
                if (url && typeof url === 'string' && url.trim()) {
                    images.push({
                        url: url.trim(),
                        alt: `${product?.name} - ${selectedVariant.color} - Ảnh ${index + 1}`,
                        isMain: index === 0
                    });
                }
            });
        }
        
        // Fallback nếu không có ảnh
        if (images.length === 0) {
            images.push({
                url: '/images/products/placeholder.jpg',
                alt: product?.name || 'Sản phẩm',
                isMain: true
            });
        }

        return images;
    };

    // Helper function to get category name
    const getCategoryName = (categoryId: string) => {
        const categoryMap: { [key: string]: string } = {
            '685cbd213f7b05b5d70b860f': 'Điện thoại',
            '6890040ea32b9f9c88809b74': 'Điện thoại',
        };
        return categoryMap[categoryId] || 'Sản phẩm';
    };

    // ✅ CẬP NHẬT: XỬ LÝ CHỌN VARIANT VỚI URL UPDATE
    const handleVariantSelect = (variant: Variant) => {
        setSelectedVariant(variant);
        setQuantity(1); // Reset quantity khi đổi variant
        
        // ✅ UPDATE URL với variant parameters
        const newSearchParams = new URLSearchParams();
        newSearchParams.set('color', variant.color);
        newSearchParams.set('storage', variant.storage);
        
        const newUrl = `/products/${productId}?${newSearchParams.toString()}`;
        
        // Update URL mà không reload page
        router.push(newUrl, { scroll: false });
        
        console.log('🔄 Variant selected & URL updated:', {
            color: variant.color,
            storage: variant.storage,
            price: variant.price,
            newUrl: newUrl
        });
    };

    // ✅ CẬP NHẬT: Quantity với stock của variant
    const handleQuantityChange = (newQuantity: number) => {
        const maxStock = selectedVariant?.stock || 0;
        if (newQuantity >= 1 && newQuantity <= maxStock) {
            setQuantity(newQuantity);
        }
    };

    // 3. TẠO HÀM XỬ LÝ VIỆC THÊM VÀO GIỎ HÀNG
    const handleAddToCart = async () => {
        if (!product || !selectedVariant) return;

        if (!isAuthenticated) {
            setShowLoginModal(true);
            return;
        }

        try {
            // Gửi "mệnh lệnh" ADD_ITEM đến reducer
            dispatch({
                type: 'ADD_ITEM',
                payload: {
                    productId: product._id,
                    variantId: selectedVariant._id,
                    name: `${product.name} (${selectedVariant.storage} - ${selectedVariant.color})`,
                    price: selectedVariant.price,
                    image: selectedVariant.images?.[0] || '/placeholder.jpg', // Lấy ảnh đầu tiên của variant
                    quantity: quantity,
                },
            });

            toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`);

        } catch (error: any) {
            console.error('❌ Lỗi khi thêm vào giỏ hàng:', error);
            toast.error(error.message || 'Thêm vào giỏ hàng thất bại');
        }
    };

    const handleBuyNow = () => {
        if (!product || !selectedVariant) return;
        console.log('💳 MUA NGAY:', {
            product: product.name,
            variant: `${selectedVariant.color} - ${selectedVariant.storage}`,
            quantity: quantity,
            totalPrice: selectedVariant.price * quantity
        });
    };

    // ✅ HELPER: Get unique colors và storages
    const getUniqueColors = () => {
        if (!product?.variants) return [];
        const colors = [...new Set(product.variants.map(v => v.color))];
        return colors;
    };

    const getStoragesForColor = (color: string) => {
        if (!product?.variants) return [];
        return product.variants
            .filter(v => v.color === color)
            .map(v => ({ storage: v.storage, price: v.price, stock: v.stock, _id: v._id }));
    };

    const parseSpecsString = (specsString: string): Array<{ key: string; value: string }> => {
        if (!specsString) return [];
        const lines = specsString.split('\n').map(line => line.trim()).filter(Boolean);
        const result: Array<{ key: string; value: string }> = [];
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes(':')) {
                const key = lines[i].replace(':', '').trim();
                const value = lines[i + 1] ? lines[i + 1].trim() : '';
                if (key && value) {
                    result.push({ key, value });
                    i++;
                }
            }
        }
        return result;
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
    const uniqueColors = getUniqueColors();

    return (
        <div className="product-detail-container max-w-7xl mx-auto p-4">
            {/* 🎯 MAIN PRODUCT SECTION - 2 COLUMNS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">

                {/* 🖼️ PRODUCT IMAGES - LEFT COLUMN */}
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
                            key={selectedVariant?._id} // ✅ Re-render khi đổi variant
                        >
                            {productImages.map((image, index) => (
                                <SwiperSlide key={`${selectedVariant?._id}-${index}`}>
                                    <div className="swiper-zoom-container">
                                        <div 
                                            className="w-full h-full flex items-center justify-center relative bg-white"
                                            style={{ aspectRatio: '3/2' }}
                                        >
                                            <div className="relative w-full h-full">
                                                <Image
                                                    src={image.url}
                                                    alt={image.alt}
                                                    fill
                                                    className="object-contain rounded"
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    priority={index === 0}
                                                    onError={(e) => {
                                                        console.error('Error loading image:', image.url);
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = '/images/products/placeholder.jpg';
                                                    }}
                                                />
                                            </div>
                                            {image.isMain && (
                                                <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium z-10">
                                                    {selectedVariant?.color} - {selectedVariant?.storage}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </div>

                {/* 📝 PRODUCT INFO - RIGHT COLUMN */}
                <div className="product-info w-full">
                    {/* Product Name */}
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                        {product.name}
                    </h1>

                    {/* ✅ VARIANT SELECTION */}
                    <div className="variant-selection mb-6">
                        {/* Color Selection */}
                        <div className="mb-4">
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Màu sắc:</h3>
                            <div className="flex flex-wrap gap-2">
                                {uniqueColors.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => {
                                            const firstVariantOfColor = product.variants?.find(v => v.color === color);
                                            if (firstVariantOfColor) {
                                                handleVariantSelect(firstVariantOfColor);
                                            }
                                        }}
                                        className={`px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                                            selectedVariant?.color === color
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-300 text-gray-700 hover:border-gray-400'
                                        }`}
                                    >
                                        {color}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Storage Selection */}
                        {selectedVariant && (
                            <div className="mb-4">
                                <h3 className="text-sm font-medium text-gray-900 mb-2">Dung lượng:</h3>
                                <div className="flex flex-wrap gap-2">
                                    {getStoragesForColor(selectedVariant.color).map((storageOption, index) => (
                                        <button
                                            key={`${selectedVariant.color}-${storageOption.storage}`}
                                            onClick={() => {
                                                const variant = product.variants?.find(v => 
                                                    v.color === selectedVariant.color && v.storage === storageOption.storage
                                                );
                                                if (variant) {
                                                    handleVariantSelect(variant);
                                                }
                                            }}
                                            className={`px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                                                selectedVariant?.storage === storageOption.storage
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                                            }`}
                                        >
                                            {storageOption.storage}
                                            <div className="text-xs text-red-600 font-normal">
                                                {storageOption.price.toLocaleString('vi-VN')}đ
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ✅ PRICE SECTION - Từ selected variant */}
                    <div className="price-section mb-6">
                        <span className="text-3xl font-bold text-red-600">
                            {selectedVariant?.price?.toLocaleString('vi-VN') || '0'} đ
                        </span>
                        {selectedVariant && (
                            <div className="text-sm text-gray-600 mt-1">
                                {selectedVariant.color} - {selectedVariant.storage} • Còn {selectedVariant.stock} sản phẩm
                            </div>
                        )}
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

                    {/* ✅ QUANTITY SELECTION */}
                    <div className="quantity-section mb-6">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Số lượng:</h3>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handleQuantityChange(quantity - 1)}
                                disabled={quantity <= 1}
                                className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center disabled:opacity-50"
                            >
                                -
                            </button>
                            <span className="w-12 text-center font-medium">{quantity}</span>
                            <button
                                onClick={() => handleQuantityChange(quantity + 1)}
                                disabled={quantity >= (selectedVariant?.stock || 0)}
                                className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center disabled:opacity-50"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="purchase-section">
                        <div className="actions">
                            <button
                                onClick={handleAddToCart}
                                className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                                    selectedVariant && selectedVariant.stock > 0
                                        ? 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-600 hover:text-white'
                                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                }`}
                                disabled={!selectedVariant || selectedVariant.stock === 0}
                            >
                                {selectedVariant && selectedVariant.stock > 0 ? (
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
                    </div>
                </div>
            </div>

            {/* 🎯 RELATED PRODUCTS SECTION - CẬP NHẬT CHO VARIANTS */}
            <div className="related-products w-full flex justify-center py-8">
                <div className="w-[1160px] px-4">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Sản phẩm liên quan</h2>
                        <p className="text-gray-600">Khám phá những sản phẩm tương tự</p>
                    </div>

                    {relatedProducts.length > 0 ? (
                        <>
                            <div className="grid grid-cols-5">
                                {relatedProducts.map((relatedProduct) => {
                                    // ✅ Get default variant for related product
                                    const defaultVariant = relatedProduct.variants?.length > 0 
                                        ? relatedProduct.variants.reduce((min, variant) => variant.price < min.price ? variant : min)
                                        : null;
                                    
                                    const firstImage = defaultVariant?.images?.[0] || '/images/products/placeholder.jpg';
                                    const price = defaultVariant?.price || 0;
                                    const totalStock = relatedProduct.variants?.reduce((total, variant) => total + (variant.stock || 0), 0) || 0;

                                    return (
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
                                                            <Image 
                                                                src={firstImage}
                                                                alt={relatedProduct.name}
                                                                fill
                                                                className="object-cover"
                                                                sizes="180px"
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.src = '/images/products/placeholder.jpg';
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="p-4 mt-2">
                                                        <span className="inline-block bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full mb-2">
                                                            {getCategoryName(relatedProduct.categoryId)}
                                                        </span>
                                                        
                                                        <h3 className="font-semibold text-lg">{relatedProduct.name}</h3>
                                                        <p className="text-gray-600 line-clamp-2">{relatedProduct.description}</p>
                                                        <p className="text-red-500 font-bold mt-2">{price.toLocaleString('vi-VN')} đ</p>
                                                        
                                                        <div className="mt-2 flex justify-between items-center">
                                                            <p className="text-gray-500 text-xs">
                                                                {totalStock > 0 ? `Còn lại: ${totalStock}` : 'Hết hàng'}
                                                            </p>
                                                            <div className={`w-2 h-2 rounded-full ${relatedProduct.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex justify-center mt-8">
                                <button 
                                    onClick={() => {
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