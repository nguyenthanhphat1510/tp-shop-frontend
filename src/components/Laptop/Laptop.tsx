"use client";
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ProductItem from '@/components/ProductItem/ProductItem';

interface Product {
    _id: string;
    id?: string;
    name: string;
    price: number;
    description?: string;
    images?: string[];
    categoryId: string;
    createdAt: string;
}

interface FilterOptions {
    brand: string[];
    priceRange: string;
    storage: string[];
    sortBy: string;
}

const Laptop = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<FilterOptions>({
        brand: [],
        priceRange: '',
        storage: [],
        sortBy: 'newest'
    });

    const LAPTOP_CATEGORY_ID = '689004f51a42cb388f6acef6';

    // Thêm mảng brands cho laptop
    const brands = [
        { id: 'msi', name: 'Msi', icon: '/images/brands/msi.png' },
        { id: 'macbook', name: 'MacBook', icon: '/images/brands/macbook.png' },
        { id: 'acer', name: 'Acer', icon: '/images/brands/acer.png' },
        { id: 'asus', name: 'ASUS', icon: '/images/brands/asus.png' }
    ];

    // Mapping hãng với subcategoryId cho laptop
    const brandSubcategoryMap: Record<string, string> = {
        'msi': '6890090c1a42cb388f6aceff',
        'macbook': '689ba696a2f7b784721e9cd8',
        'acer': '689ba67fa2f7b784721e9cd7',
        'asus': '689ba6a7a2f7b784721e9cd9'
    };

    // Khoảng giá cho laptop
    const priceRanges = [
        { id: 'under-10m', label: 'Dưới 10 triệu', min: 0, max: 10000000 },
        { id: '10m-20m', label: '10 - 20 triệu', min: 10000000, max: 20000000 },
        { id: '20m-30m', label: '20 - 30 triệu', min: 20000000, max: 30000000 },
        { id: '30m-50m', label: '30 - 50 triệu', min: 30000000, max: 50000000 },
        { id: 'above-50m', label: 'Trên 50 triệu', min: 50000000, max: Infinity }
    ];

    // Sắp xếp
    const sortOptions = [
        { id: 'newest', label: 'Mới nhất' },
        { id: 'price-asc', label: 'Giá thấp đến cao' },
        { id: 'price-desc', label: 'Giá cao đến thấp' },
        { id: 'name-asc', label: 'Tên A-Z' },
        { id: 'popular', label: 'Phổ biến' }
    ];

    const fetchLaptopProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`http://localhost:3000/api/products/category/${LAPTOP_CATEGORY_ID}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            const productList = data.map((item: Product) => ({
                ...item,
                id: item.id || item._id
            }));
            setProducts(productList);
            setFilteredProducts(productList);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Không thể tải danh sách laptop');
        } finally {
            setLoading(false);
        }
    };

    // Hàm áp dụng bộ lọc frontend (chỉ sắp xếp)
    const applyClientSideFilters = (products: Product[]) => {
        let filtered = [...products];

        // Sắp xếp (frontend)
        switch (filters.sortBy) {
            case 'price-asc':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'name-asc':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'newest':
                filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
            case 'popular':
                // Logic cho sắp xếp theo độ phổ biến
                break;
        }

        return filtered;
    };

    // Hàm lọc theo khoảng giá
    const handlePriceRangeChange = async (rangeId: string) => {
        try {
            setLoading(true);
            
            let baseProducts: Product[];
            
            if (rangeId) {
                // Gọi API lọc theo giá
                const response = await fetch(`http://localhost:3000/api/products/filter-price?priceRangeId=${rangeId}`);
                if (!response.ok) throw new Error('Không thể lọc theo giá');
                const data = await response.json();
                baseProducts = data.map((item: Product) => ({
                    ...item,
                    id: item.id || item._id
                }));
            } else {
                // Nếu bỏ chọn khoảng giá, dùng tất cả sản phẩm
                baseProducts = products;
            }

            // Áp dụng các bộ lọc frontend (sắp xếp)
            const finalProducts = applyClientSideFilters(baseProducts);
            setFilteredProducts(finalProducts);

            setFilters(prev => ({
                ...prev,
                priceRange: prev.priceRange === rangeId ? '' : rangeId
            }));
        } catch (err) {
            setError('Không thể lọc theo giá');
        } finally {
            setLoading(false);
        }
    };

    // Hàm lọc theo hãng
    const handleBrandChange = async (brandId: string) => {
        try {
            setLoading(true);
            const subcategoryId = brandSubcategoryMap[brandId];
            
            let baseProducts: Product[];

            if (subcategoryId) {
                const response = await fetch(`http://localhost:3000/api/subcategories/${subcategoryId}/products`);
                if (!response.ok) throw new Error('Không thể tải sản phẩm theo hãng');
                const data = await response.json();
                baseProducts = data.map((item: Product) => ({
                    ...item,
                    id: item.id || item._id
                }));
            } else {
                baseProducts = products;
            }

            // Áp dụng các bộ lọc frontend
            const finalProducts = applyClientSideFilters(baseProducts);
            setFilteredProducts(finalProducts);

            setFilters(prev => ({
                ...prev,
                brand: prev.brand.includes(brandId)
                    ? prev.brand.filter(b => b !== brandId)
                    : [...prev.brand, brandId]
            }));
        } catch (err) {
            setError('Không thể lọc theo hãng');
        } finally {
            setLoading(false);
        }
    };

    // Hàm sắp xếp
    const handleSortChange = (sortId: string) => {
        const newFilters = { ...filters, sortBy: sortId };
        setFilters(newFilters);
        
        // Áp dụng lại bộ lọc với dữ liệu hiện tại
        const finalProducts = applyClientSideFilters(filteredProducts);
        setFilteredProducts(finalProducts);
    };

    // Xóa tất cả filter
    const clearAllFilters = () => {
        setFilters({
            brand: [],
            priceRange: '',
            storage: [],
            sortBy: 'newest'
        });
    };

    // Đóng filter khi click outside
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            setShowFilters(false);
        }
    };

    useEffect(() => {
        fetchLaptopProducts();
    }, []);

    // Khóa scroll khi hiện filter overlay
    useEffect(() => {
        if (showFilters) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // Cleanup khi unmount
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showFilters]);

    // Thêm state để check mounted
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (loading) {
        return (
            <div className="w-full flex justify-center py-8">
                <div className="w-[1160px] px-4">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">💻</span>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800">Laptop</h2>
                        </div>
                        <p className="text-gray-600">Đang tải danh sách laptop...</p>
                    </div>
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full flex justify-center py-8">
                <div className="w-[1160px] px-4">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">💻</span>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800">Laptop</h2>
                        </div>
                        <p className="text-red-600">{error}</p>
                    </div>
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <div className="text-6xl text-gray-300 mb-4">⚠️</div>
                            <p className="text-gray-600 mb-4">Không thể tải danh sách laptop</p>
                            <button
                                onClick={fetchLaptopProducts}
                                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                Thử lại
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="w-full flex justify-center py-8">
                <div className="w-[1160px] px-4 relative">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl">💻</span>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800">Laptop</h2>
                        </div>
                        <p className="text-gray-600">
                            Khám phá những chiếc laptop hiệu suất cao, phù hợp mọi nhu cầu
                        </p>
                    </div>

                    {/* Brand Filter Bar - Always Visible */}
                    <div className="mb-6">
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="flex items-center gap-4 overflow-x-auto">
                                {/* Filter Toggle Button */}
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${showFilters
                                        ? 'bg-purple-600 text-white border-purple-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <i className="fas fa-filter"></i>
                                    <span>Lọc nâng cao</span>
                                </button>

                                {/* Brand Buttons - Horizontal Scroll */}
                                <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                    {brands.map((brand) => (
                                        <button
                                            key={brand.id}
                                            onClick={() => handleBrandChange(brand.id)}
                                            className={`flex-shrink-0 flex items-center gap-3 px-6 py-3 rounded-xl border-2 text-center transition-all duration-200 min-w-[140px] ${filters.brand.includes(brand.id)
                                                    ? 'bg-purple-50 text-purple-700 border-purple-200 shadow-md'
                                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm'
                                                }`}
                                        >
                                            <div className="flex items-center justify-center w-8 h-8 bg-white rounded-lg shadow-sm">
                                                <img
                                                    src={brand.icon}
                                                    alt={brand.name}
                                                    className="w-6 h-6 object-contain"
                                                />
                                            </div>
                                            <span className="text-sm font-semibold whitespace-nowrap">{brand.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bộ lọc nâng cao nằm ngay dưới lưới bộ lọc */}
                    {showFilters && (
                        <div className="absolute left-0 top-0 w-full z-30 flex justify-center">
                            <div className="bg-white rounded-xl shadow-xl border border-gray-200 mt-[200px] w-[1130px] p-6">
                                {/* Filter Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-800">Bộ lọc nâng cao</h3>
                                    <button
                                        onClick={() => setShowFilters(false)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <i className="fas fa-times text-gray-600"></i>
                                    </button>
                                </div>

                                {/* Khoảng giá */}
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Khoảng giá</h4>
                                    <div className="grid grid-cols-5 gap-3">
                                        {priceRanges.map((range) => (
                                            <button
                                                key={range.id}
                                                onClick={() => handlePriceRangeChange(range.id)}
                                                className={`p-3 rounded-lg border text-center transition-colors ${filters.priceRange === range.id
                                                    ? 'bg-purple-600 text-white border-purple-600'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className="text-sm font-medium">{range.label}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Sắp xếp */}
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Sắp xếp theo</h4>
                                    <div className="grid grid-cols-5 gap-3">
                                        {sortOptions.map((sort) => (
                                            <button
                                                key={sort.id}
                                                onClick={() => handleSortChange(sort.id)}
                                                className={`p-3 rounded-lg border text-center transition-colors ${filters.sortBy === sort.id
                                                    ? 'bg-purple-600 text-white border-purple-600'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className="text-sm font-medium">{sort.label}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Filter Actions */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    <button
                                        onClick={clearAllFilters}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                    >
                                        Xóa tất cả bộ lọc
                                    </button>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowFilters(false)}
                                            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            onClick={() => setShowFilters(false)}
                                            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                        >
                                            Áp dụng ({filteredProducts.length} sản phẩm)
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Results Info */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Tìm thấy</span>
                            <span className="text-sm font-medium text-purple-600">{filteredProducts.length}</span>
                            <span className="text-sm text-gray-500">sản phẩm</span>
                            {filteredProducts.length !== products.length && (
                                <span className="text-sm text-gray-500">
                                    (từ {products.length} sản phẩm)
                                </span>
                            )}
                        </div>

                        {/* Active Filters */}
                        {(filters.brand.length > 0 || filters.priceRange) && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Đang lọc:</span>
                                {filters.brand.map(brandId => {
                                    const brand = brands.find(b => b.id === brandId);
                                    return brand ? (
                                        <span key={brandId} className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                                            {brand.name}
                                            <button onClick={() => handleBrandChange(brandId)} className="hover:text-purple-600">
                                                <i className="fas fa-times text-xs"></i>
                                            </button>
                                        </span>
                                    ) : null;
                                })}
                                {filters.priceRange && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                        {priceRanges.find(r => r.id === filters.priceRange)?.label}
                                        <button onClick={() => handlePriceRangeChange(filters.priceRange)} className="hover:text-green-600">
                                            <i className="fas fa-times text-xs"></i>
                                        </button>
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Products Grid */}
                    {filteredProducts.length === 0 ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="text-center">
                                <div className="text-6xl text-gray-300 mb-4">🔍</div>
                                <p className="text-gray-600 mb-4">Không tìm thấy sản phẩm nào phù hợp với bộ lọc</p>
                                <button
                                    onClick={clearAllFilters}
                                    className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    Xóa bộ lọc
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-5 gap-4">
                            {filteredProducts.map((product) => (
                                <ProductItem
                                    key={product.id}
                                    product={product}
                                />
                            ))}
                        </div>
                    )}

                    {/* Load More Button */}
                    {filteredProducts.length > 0 && (
                        <div className="flex justify-center mt-8">
                            <button className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium">
                                Xem thêm laptop
                                <i className="fas fa-chevron-down ml-2"></i>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Laptop;