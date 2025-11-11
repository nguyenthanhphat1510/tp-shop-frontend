"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Zoom } from 'swiper/modules';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import { useCart } from '@/contexts/CartContext';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/zoom';

import { Product, ProductVariant, productService } from '@/services/productService/productService';

interface ProductDetailProps {
    productId: string;
}

const ProductDetail = ({ productId }: ProductDetailProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [product, setProduct] = useState<Product | null>(null);
    const [allVariants, setAllVariants] = useState<ProductVariant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

    const isLoggedIn = typeof window !== 'undefined' && (!!localStorage.getItem('token') || !!localStorage.getItem('accessToken'));
    const { isAuthenticated, setShowLoginModal } = useAuth();
    const { dispatch } = useCart();

    // ✅ FETCH PRODUCT DATA WHEN COMPONENT MOUNTS
    useEffect(() => {
        fetchProductDetail();
        fetchRelatedProducts();
    }, [productId]);

    // ✅ HANDLE URL PARAMS (variantId hoặc color+storage)
    useEffect(() => {
        if (!product || allVariants.length === 0) return;

        const variantId = searchParams.get('variantId');
        const colorParam = searchParams.get('color');
        const storageParam = searchParams.get('storage');

        let targetVariant: ProductVariant | null = null;

        // ✅ OPTION 1: Tìm theo variantId (ưu tiên cao nhất)
        if (variantId) {
            targetVariant = allVariants.find(v => v.id === variantId) || null;
            console.log('🔍 Looking for variant by ID:', variantId, targetVariant ? '✅ Found' : '❌ Not found');
        }

        // ✅ OPTION 2: Tìm theo color + storage
        if (!targetVariant && colorParam && storageParam) {
            targetVariant = allVariants.find(v =>
                v.color.toLowerCase() === colorParam.toLowerCase() &&
                v.storage.toLowerCase() === storageParam.toLowerCase()
            ) || null;
            console.log('🔍 Looking for variant by color+storage:', colorParam, storageParam, targetVariant ? '✅ Found' : '❌ Not found');
        }

        // ✅ FALLBACK: Chọn variant rẻ nhất
        if (!targetVariant) {
            targetVariant = allVariants.reduce((min, variant) =>
                variant.finalPrice < min.finalPrice ? variant : min
            );
            console.log('🎯 Using cheapest variant as fallback:', targetVariant.color, targetVariant.storage);
        }

        if (targetVariant && (!selectedVariant || selectedVariant.id !== targetVariant.id)) {
            setSelectedVariant(targetVariant);
            console.log('✅ Variant selected:', {
                id: targetVariant.id,
                color: targetVariant.color,
                storage: targetVariant.storage,
                price: targetVariant.finalPrice,
                stock: targetVariant.stock
            });
        }
    }, [product, allVariants, searchParams, selectedVariant]);

    // ✅ FETCH PRODUCT + ALL VARIANTS
    const fetchProductDetail = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('🔄 Fetching product with ID:', productId);
            const response = await productService.getById(productId);
            console.log('📦 Product fetch response:', response);

            // ✅ XỬ LÝ RESPONSE
            if (response.success && response.data) {
                const { product: productData, variants: variantsData } = response.data;

                // Transform product
                const transformedProduct: Product = {
                    id: productData._id,
                    name: productData.name,
                    description: productData.description,
                    categoryId: productData.categoryId,
                    subcategoryId: productData.subcategoryId,
                    isActive: productData.isActive,
                    createdAt: productData.createdAt,
                    updatedAt: productData.updatedAt,
                    variants: [] // Will be populated from allVariants
                };

                // Transform variants
                const transformedVariants: ProductVariant[] = (variantsData || []).map((v: any) => {
                    const finalPrice = v.isOnSale && v.discountPercent > 0
                        ? Math.round(v.price * (1 - v.discountPercent / 100))
                        : v.price;

                    const savedAmount = v.price - finalPrice;

                    return {
                        id: v._id,
                        productId: v.productId,
                        sku: v.sku,
                        storage: v.storage,
                        color: v.color,
                        price: v.price,
                        stock: v.stock,
                        imageUrls: v.imageUrls || [],
                        imagePublicIds: v.imagePublicIds || [],
                        images: v.imageUrls || [],
                        isActive: v.isActive,
                        discountPercent: v.discountPercent || 0,
                        isOnSale: v.isOnSale || false,
                        finalPrice: finalPrice,
                        savedAmount: savedAmount,
                        sold: v.sold || 0,
                        createdAt: v.createdAt,
                        updatedAt: v.updatedAt
                    };
                });

                setProduct(transformedProduct);
                setAllVariants(transformedVariants);
                console.log('✅ Product loaded successfully:', transformedProduct.name);
                console.log('✅ Variants loaded:', transformedVariants.length);

            } else {
                throw new Error('Invalid response structure from API');
            }

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
            console.log('✅ Related products loaded:', shuffled.slice(0, 5).length);
        } catch (err) {
            console.error('❌ Error fetching related products:', err);
        }
    };

    // ✅ GET IMAGES FROM SELECTED VARIANT
    const getProductImages = () => {
        const images = [];

        if (selectedVariant?.imageUrls && Array.isArray(selectedVariant.imageUrls) && selectedVariant.imageUrls.length > 0) {
            selectedVariant.imageUrls.forEach((url: string, index: number) => {
                if (url && typeof url === 'string' && url.trim()) {
                    images.push({
                        url: url.trim(),
                        alt: `${product?.name} - ${selectedVariant.color} ${selectedVariant.storage} - Ảnh ${index + 1}`,
                        isMain: index === 0
                    });
                }
            });
        }

        // ✅ Fallback: Dùng local image
        if (images.length === 0) {
            images.push({
                url: '/images/placeholder.jpg',
                alt: product?.name || 'Sản phẩm',
                isMain: true
            });
        }

        console.log('🖼️ Product images:', images.length, 'images');
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

    // ✅ HANDLE VARIANT SELECTION WITH URL UPDATE
    const handleVariantSelect = (variant: ProductVariant) => {
        setSelectedVariant(variant);
        setQuantity(1); // Reset quantity

        // ✅ UPDATE URL (dùng variantId thay vì color+storage)
        const newSearchParams = new URLSearchParams();
        newSearchParams.set('variantId', variant.id);

        const newUrl = `/products/${productId}?${newSearchParams.toString()}`;
        router.push(newUrl, { scroll: false });

        console.log('🔄 Variant selected & URL updated:', {
            variantId: variant.id,
            color: variant.color,
            storage: variant.storage,
            price: variant.finalPrice,
            newUrl: newUrl
        });
    };

    // ✅ QUANTITY CHANGE WITH STOCK VALIDATION
    const handleQuantityChange = (newQuantity: number) => {
        const maxStock = selectedVariant?.stock || 0;
        if (newQuantity >= 1 && newQuantity <= maxStock) {
            setQuantity(newQuantity);
        }
    };

    // ✅ ADD TO CART
    const handleAddToCart = async () => {
        if (!product || !selectedVariant) {
            toast.error('Vui lòng chọn phiên bản sản phẩm');
            return;
        }

        if (!isAuthenticated) {
            setShowLoginModal(true);
            return;
        }

        try {
            dispatch({
                type: 'ADD_ITEM',
                payload: {
                    productId: product.id,
                    variantId: selectedVariant.id,
                    name: `${product.name} (${selectedVariant.storage} - ${selectedVariant.color})`,
                    price: selectedVariant.finalPrice,
                    image: selectedVariant.imageUrls?.[0] || '/images/placeholder.jpg',
                    quantity: quantity,
                },
            });

            toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`);
            console.log('✅ Added to cart:', {
                product: product.name,
                variant: `${selectedVariant.color} ${selectedVariant.storage}`,
                quantity: quantity,
                price: selectedVariant.finalPrice
            });

        } catch (error: any) {
            console.error('❌ Lỗi khi thêm vào giỏ hàng:', error);
            toast.error(error.message || 'Thêm vào giỏ hàng thất bại');
        }
    };

    // ✅ GET UNIQUE STORAGES
    const getUniqueStorages = () => {
        if (!allVariants || allVariants.length === 0) return [];
        const storages = [...new Set(allVariants.map(v => v.storage))];
        return storages.sort((a, b) => {
            const numA = parseInt(a.replace(/\D/g, ''));
            const numB = parseInt(b.replace(/\D/g, ''));
            return numA - numB;
        });
    };

    // ✅ GET UNIQUE COLORS
    const getUniqueColors = () => {
        if (!allVariants || allVariants.length === 0) return [];
        const colors = [...new Set(allVariants.map(v => v.color))];
        return colors;
    };

    // ✅ GET STORAGES FOR SELECTED COLOR
    const getStoragesForColor = (color: string) => {
        if (!allVariants || allVariants.length === 0) return [];
        return allVariants
            .filter(v => v.color === color)
            .map(v => ({
                storage: v.storage,
                price: v.finalPrice,
                originalPrice: v.price,
                stock: v.stock,
                id: v.id,
                isOnSale: v.isOnSale,
                discountPercent: v.discountPercent
            }));
    };

    // ✅ PARSE SPECS STRING - FIX MULTILINE VALUES
    const parseSpecsString = (specsString: string): Array<{ key: string; value: string }> => {
        if (!specsString) return [];
        
        const lines = specsString.split('\n').map(line => line.trim()).filter(Boolean);
        const result: Array<{ key: string; value: string }> = [];
        
        let currentKey = '';
        let currentValue = '';
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // ✅ Check if line contains ':' (is a key-value pair)
            if (line.includes(':')) {
                // ✅ Save previous key-value if exists
                if (currentKey && currentValue) {
                    result.push({
                        key: currentKey,
                        value: currentValue.trim()
                    });
                }
                
                // ✅ Split new key-value
                const colonIndex = line.indexOf(':');
                currentKey = line.substring(0, colonIndex).trim();
                currentValue = line.substring(colonIndex + 1).trim();
            } else {
                // ✅ Line không có ':' → append vào value của key trước đó
                if (currentKey) {
                    currentValue += (currentValue ? '\n' : '') + line;
                }
            }
        }
        
        // ✅ Push last key-value pair
        if (currentKey && currentValue) {
            result.push({
                key: currentKey,
                value: currentValue.trim()
            });
        }
        
        return result;
    };

    // ================================
    // RENDER
    // ================================

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
    const uniqueStorages = getUniqueStorages();
    const uniqueColors = getUniqueColors();

    return (
        <div className="product-detail-container max-w-7xl mx-auto p-4 bg-white">
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
                            key={selectedVariant?.id}
                        >
                            {productImages.map((image, index) => (
                                <SwiperSlide key={`${selectedVariant?.id}-${index}`}>
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
                                                    unoptimized={image.url.includes('cloudinary')}
                                                    onError={(e) => {
                                                        console.error('❌ Error loading image:', image.url);
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = '/images/products/chatbox.png';
                                                    }}
                                                />
                                            </div>
                                            {image.isMain && selectedVariant && (
                                                <div className="absolute top-2 left-2 bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium z-10 shadow-md">
                                                    {selectedVariant.color} - {selectedVariant.storage}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>

                    {/* ✅ THÔNG SỐ KỸ THUẬT - DƯỚI HÌNH ẢNH */}
                    <div className="description mt-8 w-full max-w-lg">
                        <h3 className="text-lg font-semibold mb-3 text-gray-900">Thông số kỹ thuật</h3>
                        <div className="w-full">
                            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                                <tbody>
                                    {parseSpecsString(product.description).map(({ key, value }, index) => (
                                        <tr key={`${key}-${index}`} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                            <td className="py-3 px-4 font-medium text-gray-700 align-top border-r border-gray-200" style={{ minWidth: '180px' }}>
                                                {key}
                                            </td>
                                            <td className="py-3 px-4 text-gray-900 whitespace-pre-line">
                                                {value}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* 📝 PRODUCT INFO - RIGHT COLUMN */}
                <div className="product-info w-full">
                    {/* Product Name */}
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                        {product.name}
                    </h1>

                    {/* ✅ VARIANT SELECTION - NEW STYLE */}
                    <div className="variant-selection mb-6">
                        {/* Storage Selection - Rounded Pills */}
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-900 mb-3">Dung lượng:</h3>
                            <div className="flex flex-wrap gap-2">
                                {uniqueStorages.map(storage => {
                                    const hasVariant = allVariants.some(v => v.storage === storage);
                                    const isSelected = selectedVariant?.storage === storage;

                                    return (
                                        <button
                                            key={storage}
                                            onClick={() => {
                                                const firstVariantOfStorage = allVariants.find(v => v.storage === storage);
                                                if (firstVariantOfStorage) {
                                                    handleVariantSelect(firstVariantOfStorage);
                                                }
                                            }}
                                            disabled={!hasVariant}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${isSelected
                                                ? 'bg-[#f1f8fe] text-[#2a83e9] border-[#bbddfd] shadow-md'
                                                : hasVariant
                                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                        >
                                            {storage}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Color Selection - Circle Buttons with Labels */}
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-900 mb-3">Màu sắc:</h3>
                            <div className="flex flex-wrap gap-3">
                                {uniqueColors.map(color => {
                                    const hasVariant = allVariants.some(v => v.color === color);
                                    const isSelected = selectedVariant?.color === color;

                                    const colorMap: { [key: string]: string } = {
                                        'Đen': '#000000',
                                        'Trắng': '#FFFFFF',
                                        'Xanh': '#0000FF',
                                        'Đỏ': '#FF0000',
                                        'Vàng': '#FFD700',
                                        'Xám': '#808080',
                                        'Hồng': '#FFC0CB',
                                        'Tím': '#800080',
                                        'Xanh lá': '#00FF00',
                                        'Cam': '#FFA500',
                                        'Titan Sa Mạc': '#D4AF91',
                                        'Titan Tự Nhiên': '#C0C0C0',
                                        'Titan Trắng': '#F5F5F5',
                                        'Titan Đen': '#2C2C2C',
                                    };

                                    const bgColor = colorMap[color] || '#808080';

                                    return (
                                        <button
                                            key={color}
                                            onClick={() => {
                                                const firstVariantOfColor = allVariants.find(v => v.color === color);
                                                if (firstVariantOfColor) {
                                                    handleVariantSelect(firstVariantOfColor);
                                                }
                                            }}
                                            disabled={!hasVariant}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${isSelected
                                                ? 'bg-[#f1f8fe] border-[#bbddfd]'
                                                : hasVariant
                                                    ? 'border-gray-300 hover:border-gray-400'
                                                    : 'border-gray-200 opacity-50 cursor-not-allowed'
                                                }`}
                                        >
                                            <div
                                                className={`w-5 h-5 rounded-full border-2 ${bgColor === '#FFFFFF' ? 'border-gray-300' : 'border-transparent'
                                                    }`}
                                                style={{ backgroundColor: bgColor }}
                                            ></div>
                                            <span className={`text-sm font-medium ${isSelected ? 'text-[#2a83e9]' : 'text-gray-700'}`}>{color}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* ✅ PRICE SECTION - NEW STYLE */}
                    {selectedVariant && (
                        <div className="price-section mb-6">
                            <div className="flex items-baseline gap-3 mb-2">
                                <span className="text-4xl font-bold text-red-600">
                                    {Number(selectedVariant.finalPrice).toLocaleString('vi-VN')} đ
                                </span>
                                {selectedVariant.isOnSale && selectedVariant.discountPercent > 0 && (
                                    <>
                                        <span className="text-lg text-gray-500 line-through">
                                            {Number(selectedVariant.price).toLocaleString('vi-VN')} đ
                                        </span>
                                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-bold">
                                            -{selectedVariant.discountPercent}%
                                        </span>
                                    </>
                                )}
                            </div>
                            <div className="text-sm text-gray-600">
                                {selectedVariant.color} • {selectedVariant.storage} •
                                <span className={selectedVariant.stock > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                    {' '}{selectedVariant.stock > 0 ? `Còn ${selectedVariant.stock} sản phẩm` : 'Hết hàng'}
                                </span>
                            </div>
                            {selectedVariant.isOnSale && selectedVariant.savedAmount > 0 && (
                                <div className="text-sm text-green-600 mt-1 font-medium">
                                    Tiết kiệm: {Number(selectedVariant.savedAmount).toLocaleString('vi-VN')} đ
                                </div>
                            )}
                        </div>
                    )}

                    {/* ✅ QUANTITY SELECTION */}
                    <div className="quantity-section mb-6">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Số lượng:</h3>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handleQuantityChange(quantity - 1)}
                                disabled={quantity <= 1}
                                className="w-10 h-10 border-2 border-gray-300 rounded-lg flex items-center justify-center font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                -
                            </button>
                            <span className="w-16 text-center font-bold text-lg">{quantity}</span>
                            <button
                                onClick={() => handleQuantityChange(quantity + 1)}
                                disabled={quantity >= (selectedVariant?.stock || 0)}
                                className="w-10 h-10 border-2 border-gray-300 rounded-lg flex items-center justify-center font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                +
                            </button>
                            <span className="text-sm text-gray-600 ml-2">
                                (Tối đa: {selectedVariant?.stock || 0})
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="purchase-section">
                        <div className="actions flex gap-4">
                            <button
                                onClick={handleAddToCart}
                                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${selectedVariant && selectedVariant.stock > 0
                                    ? 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-600 hover:text-white shadow-md hover:shadow-lg'
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed border-2 border-gray-300'
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

            {/* 🎯 RELATED PRODUCTS SECTION */}
            <div className="related-products w-full flex justify-center py-8">
                <div className="w-[1160px] px-4">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Sản phẩm liên quan</h2>
                        <p className="text-gray-600">Khám phá những sản phẩm tương tự</p>
                    </div>

                    {relatedProducts.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                {relatedProducts.map((relatedProduct) => {
                                    const defaultVariant = relatedProduct.defaultVariant;
                                    const firstImage = defaultVariant?.imageUrls?.[0] || '/images/placeholder.jpg';
                                    const price = defaultVariant?.finalPrice || 0;
                                    const totalStock = relatedProduct.totalStock || 0;

                                    return (
                                        <div key={relatedProduct.id} className="rounded-lg overflow-hidden transition-shadow group">
                                            <Link href={`/products/${relatedProduct.id}${defaultVariant ? `?variantId=${defaultVariant.id}` : ''}`}>
                                                <div
                                                    className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 p-4"
                                                >
                                                    <div className="flex justify-center mb-3">
                                                        <div className="relative w-40 h-40 bg-gray-100 rounded-lg overflow-hidden group-hover:scale-105 transition-transform">
                                                            <Image
                                                                src={firstImage}
                                                                alt={relatedProduct.name}
                                                                fill
                                                                className="object-cover"
                                                                sizes="180px"
                                                                unoptimized={firstImage.includes('cloudinary')}
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.src = '/images/placeholder.jpg';
                                                                }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <span className="inline-block bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full mb-2">
                                                            {getCategoryName(relatedProduct.categoryId)}
                                                        </span>

                                                        <h3 className="font-semibold text-base line-clamp-2 mb-2 h-12">
                                                            {relatedProduct.name}
                                                        </h3>

                                                        <p className="text-red-500 font-bold text-lg mb-2">
                                                            {price.toLocaleString('vi-VN')} đ
                                                        </p>

                                                        <div className="flex justify-between items-center text-xs">
                                                            <span className="text-gray-500">
                                                                {totalStock > 0 ? `Còn ${totalStock}` : 'Hết hàng'}
                                                            </span>
                                                            <div className={`w-2 h-2 rounded-full ${relatedProduct.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex justify-center mt-8">
                                <Link
                                    href="/products"
                                    className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium inline-flex items-center gap-2"
                                >
                                    Xem thêm sản phẩm
                                    <i className="fas fa-chevron-right"></i>
                                </Link>
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