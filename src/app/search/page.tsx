"use client";
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';

interface SearchResult {
    variant: {
        _id: string;
        sku: string;
        storage: string;
        color: string;
        price: number;
        discountPercent: number;
        finalPrice: number;
        imageUrls: string[];
        isOnSale: boolean;
        stock: number;
    };
    product: {
        _id: string;
        name: string;
        description: string;
    };
    similarity: number;
}

function SearchContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalFound, setTotalFound] = useState(0);

    useEffect(() => {
        if (query.length >= 2) {
            fetchResults();
        } else {
            setLoading(false);
        }
    }, [query]);

    const fetchResults = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost:3000/api/products/search-vector?q=${encodeURIComponent(query)}`
            );
            const data = await response.json();
            
            if (data.success) {
                setResults(data.data.variants || []);
                setTotalFound(data.data.totalFound || 0);
            }
        } catch (error) {
            console.error('❌ Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    // ✅ GET PRODUCT URL WITH VARIANTID
    const getProductUrl = (result: SearchResult) => {
        return `/products/${result.product._id}?variantId=${result.variant._id}`;
    };

    // ✅ LOADING STATE
    if (loading) {
        return (
            <div className="w-full flex justify-center py-8">
                <div className="w-[1160px] px-4">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">
                            🔍 Kết quả tìm kiếm cho "{query}"
                        </h2>
                        <p className="text-gray-600">Đang tìm kiếm...</p>
                    </div>
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                </div>
            </div>
        );
    }

    // ✅ NO QUERY
    if (!query || query.trim().length < 2) {
        return (
            <div className="w-full flex justify-center py-8">
                <div className="w-[1160px] px-4">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">
                            🔍 Tìm kiếm sản phẩm
                        </h2>
                        <p className="text-gray-600">Vui lòng nhập ít nhất 2 ký tự để tìm kiếm</p>
                    </div>
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <i className="fas fa-search text-6xl text-gray-300 mb-4"></i>
                            <p className="text-gray-500">Nhập từ khóa vào thanh tìm kiếm phía trên</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ✅ NO RESULTS
    if (results.length === 0) {
        return (
            <div className="w-full flex justify-center py-8">
                <div className="w-[1160px] px-4">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">
                            🔍 Kết quả tìm kiếm cho "{query}"
                        </h2>
                        <p className="text-gray-600">Không tìm thấy sản phẩm nào</p>
                    </div>
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <i className="fas fa-box-open text-6xl text-gray-300 mb-4"></i>
                            <p className="text-gray-600 mb-6">
                                Thử tìm kiếm với từ khóa khác hoặc tổng quát hơn
                            </p>
                            <Link href="/">
                                <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                                    <i className="fas fa-home mr-2"></i>
                                    Về trang chủ
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ✅ HAS RESULTS - GIỐNG SALEVARIANTSLIST
    return (
        <div className="w-full flex justify-center py-8">
            <div className="w-[1160px] px-4">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">
                            🔍 Kết quả tìm kiếm cho "{query}"
                        </h2>
                        <p className="text-gray-600">
                            Tìm thấy <strong>{totalFound}</strong> sản phẩm phù hợp
                        </p>
                    </div>
                    <button
                        onClick={() => router.back()}
                        className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
                    >
                        <i className="fas fa-arrow-left"></i>
                        <span>Quay lại</span>
                    </button>
                </div>

                {/* Products Grid - GIỐNG SALEVARIANTSLIST */}
                <div className="grid grid-cols-5 gap-4">
                    {results.map((result) => (
                        <Link 
                            key={result.variant._id} 
                            href={getProductUrl(result)}
                            className="block"
                        >
                            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden cursor-pointer group">
                                {/* Image + Badges */}
                                <div className="relative">
                                    <img
                                        src={result.variant.imageUrls[0] || '/images/placeholder.jpg'}
                                        alt={result.product.name}
                                        className="w-full h-48 object-cover transform transition-transform duration-300 group-hover:scale-105"
                                    />
                                    
                                    {/* Sale Badge (nếu có giảm giá) */}
                                    {result.variant.isOnSale && (
                                        <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-sm font-bold shadow-md">
                                            -{result.variant.discountPercent}%
                                        </div>
                                    )}

                                    {/* Similarity Badge */}
                                    <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold shadow-md flex items-center gap-1">
                                        <i className="fas fa-star text-yellow-300 text-xs"></i>
                                        {(result.similarity * 100).toFixed(0)}%
                                    </div>

                                    {/* Out of Stock Badge */}
                                    {result.variant.stock === 0 && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <span className="text-white font-bold text-lg">HẾT HÀNG</span>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    {/* Product Name */}
                                    <h3 className="font-medium text-gray-800 mb-2 line-clamp-2 min-h-[3rem]">
                                        {result.product.name}
                                    </h3>
                                    
                                    {/* Variant Info */}
                                    <div className="text-sm text-gray-600 mb-2">
                                        {result.variant.storage && (
                                            <span className="font-medium">{result.variant.storage}</span>
                                        )}
                                        {result.variant.storage && result.variant.color && <span> - </span>}
                                        <span>{result.variant.color}</span>
                                    </div>

                                    {/* Price */}
                                    <div className="mb-3">
                                        {result.variant.isOnSale ? (
                                            <>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-red-600 font-bold text-lg">
                                                        {Number(result.variant.finalPrice).toLocaleString('vi-VN')}₫
                                                    </span>
                                                    <span className="text-gray-500 line-through text-sm">
                                                        {Number(result.variant.price).toLocaleString('vi-VN')}₫
                                                    </span>
                                                </div>
                                                <div className="text-green-600 text-sm font-medium">
                                                    Tiết kiệm: {(result.variant.price - result.variant.finalPrice).toLocaleString('vi-VN')}₫
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-gray-900 font-bold text-lg">
                                                {Number(result.variant.price).toLocaleString('vi-VN')}₫
                                            </div>
                                        )}
                                    </div>

                                    {/* Stock */}
                                    <div className="text-sm text-gray-600 mb-3">
                                        <span className={result.variant.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                                            {result.variant.stock > 0 ? `Còn ${result.variant.stock} sản phẩm` : 'Hết hàng'}
                                        </span>
                                    </div>

                                    {/* Action Button */}
                                    <button 
                                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                                        disabled={result.variant.stock === 0}
                                    >
                                        {result.variant.stock > 0 ? 'Xem chi tiết' : 'Hết hàng'}
                                    </button>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="w-full flex justify-center py-8">
                <div className="w-[1160px] px-4">
                    <div className="flex justify-center items-center h-64">
                        <i className="fas fa-spinner fa-spin text-5xl text-blue-500"></i>
                    </div>
                </div>
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}