import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Create axios instance with config
const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

export interface ProductVariant {
    _id: string;
    productId: string;
    sku: string;
    storage?: string;
    color: string;
    price: number;
    discountPercent: number;  // ✅ Thêm field giảm giá
    isOnSale: boolean;        // ✅ Thêm field sale
    finalPrice: number;       // ✅ Giá sau giảm (computed từ getter)
    savedAmount: number;      // ✅ Số tiền tiết kiệm (computed từ getter)
    stock: number;
    imageUrls: string[];
    imagePublicIds: string[];
    isActive: boolean;
    sold: number;
    createdAt: string;
    updatedAt: string;
}

// ✅ Interface cho Sale Variant Response
export interface SaleVariant extends ProductVariant {
    productName?: string;  // Có thể có tên sản phẩm
}

export interface Product {
    id: string;
    name: string;
    description: string;
    categoryId: string;
    subcategoryId: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    variants: ProductVariant[];

    // ✅ COMPUTED FIELDS cho UI
    defaultVariant?: ProductVariant;
    minPrice?: number;
    maxPrice?: number;
    defaultImage?: string;
    totalStock?: number;
    availableColors?: string[];
}

// ✅ Interface cho Sale Products Response
export interface SaleProduct {
    product: Product;
    variants: ProductVariant[];
}

// ✅ HELPER: Tính toán finalPrice và savedAmount (tương tự getter trong entity)
const calculatePriceFields = (variant: any) => {
    const originalPrice = variant.price || 0;
    const discountPercent = variant.discountPercent || 0;
    const isOnSale = variant.isOnSale || false;

    let finalPrice = originalPrice;
    let savedAmount = 0;

    if (isOnSale && discountPercent > 0) {
        finalPrice = Math.round(originalPrice * (1 - discountPercent / 100));
        savedAmount = originalPrice - finalPrice;
    }

    return { finalPrice, savedAmount };
};

// Helper function to transform product data
const transformProduct = (item: any): Product => {
    const productData = item.data || item;

    // Transform variants
    const variants: ProductVariant[] = (productData.variants || []).map((variant: any) => {
        // ✅ Tính toán giá theo logic entity
        const { finalPrice, savedAmount } = calculatePriceFields(variant);

        return {
            _id: variant._id,
            productId: variant.productId,
            sku: variant.sku,
            storage: variant.storage,
            color: variant.color,   
            price: variant.price,
            discountPercent: variant.discountPercent || 0,
            isOnSale: variant.isOnSale || false,
            finalPrice: finalPrice, // ✅ Computed từ logic getter
            savedAmount: savedAmount, // ✅ Computed từ logic getter
            stock: variant.stock,
            imageUrls: variant.imageUrls || [],
            imagePublicIds: variant.imagePublicIds || [],
            isActive: variant.isActive,
            sold: variant.sold || 0,
            createdAt: variant.createdAt,
            updatedAt: variant.updatedAt
        };
    });

    // ✅ TÍNH TOÁN THÔNG TIN MẶC ĐỊNH theo style TheGioiDiDong
    const defaultVariant = variants.length > 0
        ? variants.reduce((min, variant) => variant.finalPrice < min.finalPrice ? variant : min)
        : undefined;

    const minPrice = variants.length > 0
        ? Math.min(...variants.map(v => v.finalPrice)) // ✅ Dùng finalPrice thay vì price
        : 0;

    const maxPrice = variants.length > 0
        ? Math.max(...variants.map(v => v.finalPrice)) // ✅ Dùng finalPrice thay vì price
        : 0;

    const defaultImage = defaultVariant?.imageUrls?.[0] || '/placeholder.jpg'; // ✅ Fix field name

    const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

    const availableColors = [...new Set(variants.map(v => v.color))];

    return {
        id: productData._id || productData.id,
        name: productData.name,
        description: productData.description,
        categoryId: productData.categoryId,
        subcategoryId: productData.subcategoryId,
        isActive: productData.isActive,
        createdAt: productData.createdAt,
        updatedAt: productData.updatedAt,
        variants,

        // ✅ COMPUTED FIELDS
        defaultVariant,
        minPrice,
        maxPrice,
        defaultImage,
        totalStock,
        availableColors
    };
};

// Product Service
export const productService = {
    // Get all products from your NestJS backend
    getAll: async (): Promise<Product[]> => {
        try {
            console.log('🔍 Calling API:', `${API_URL}/products`);
            const response = await apiClient.get('/products');

            console.log('📦 Raw API Response:', response.data);

            // ✅ XỬ LÝ RESPONSE STRUCTURE ĐÚNG
            let productsData: any[] = [];
            
            if (response.data && response.data.success && Array.isArray(response.data.data)) {
                // Backend trả về: { success: true, data: [...] }
                productsData = response.data.data;
                console.log('✅ Found products in response.data.data:', productsData.length);
            } else if (Array.isArray(response.data)) {
                // Direct array response
                productsData = response.data;
                console.log('✅ Found direct array response:', productsData.length);
            } else {
                console.error('❌ Unexpected response structure:', response.data);
                throw new Error('Invalid response structure from API');
            }

            // ✅ Transform products
            const products: Product[] = productsData.map((item, index) => {
                try {
                    console.log(`🔄 Transforming product ${index + 1}:`, item.name);
                    return transformProduct(item);
                } catch (error) {
                    console.error(`❌ Error transforming product ${index + 1}:`, item, error);
                    throw error;
                }
            });

            console.log('✅ Successfully transformed products:', products.length);
            return products;

        } catch (error) {
            console.error('❌ Error fetching products:', error);
            if (axios.isAxiosError(error) && error.response) {
                console.error('❌ Response error:', error.response.data);
                console.error('❌ Response status:', error.response.status);
            }
            throw new Error('Failed to fetch products');
        }
    },

    // 🔧 Fix getById - Đơn giản hóa
    getById: async (id: string): Promise<any> => {
        try {
            // Validate ID
            if (!id || id.trim().length === 0) {
                throw new Error('Product ID is required');
            }

            console.log('🔄 Calling getById API:', `${API_URL}/products/${id}`);
            const response = await apiClient.get(`/products/${id}`);

            console.log('📦 GetById Raw Response:', response.data);

            // ✅ TRẢ VỀ TRỰC TIẾP response.data - để ProductDetail tự xử lý
            return response.data;

        } catch (error) {
            console.error('❌ Error fetching product by ID:', error);

            if (axios.isAxiosError(error)) {
                if (error.response) {
                    console.error('❌ Response error:', error.response.data);
                    console.error('❌ Response status:', error.response.status);

                    // Handle specific error status codes
                    switch (error.response.status) {
                        case 400:
                            throw new Error('ID sản phẩm không hợp lệ');
                        case 404:
                            throw new Error('Không tìm thấy sản phẩm');
                        case 500:
                            throw new Error('Lỗi server, vui lòng thử lại sau');
                        default:
                            throw new Error(`Lỗi ${error.response.status}: ${error.response.data.message || 'Unknown error'}`);
                    }
                } else if (error.request) {
                    throw new Error('Không thể kết nối đến server');
                } else {
                    throw new Error('Lỗi không xác định');
                }
            }

            throw new Error(`Failed to fetch product: ${error}`);
        }
    },

    // ✅ LẤY DANH SÁCH VARIANTS ĐANG GIẢM GIÁ
    getSaleVariants: async (): Promise<SaleVariant[]> => {
        try {
            console.log('🔍 Calling Sale Variants API:', `${API_URL}/products/sale/variants`);
            const response = await apiClient.get('/products/sale/variants');

            console.log('📦 Sale Variants Raw Response:', response.data);

            // ✅ XỬ LÝ RESPONSE STRUCTURE
            let variantsData: any[] = [];
            
            if (response.data && response.data.success && Array.isArray(response.data.data)) {
                // Backend trả về: { success: true, data: [...] }
                variantsData = response.data.data;
                console.log('✅ Found sale variants in response.data.data:', variantsData.length);
            } else if (Array.isArray(response.data)) {
                // Direct array response
                variantsData = response.data;
                console.log('✅ Found direct array response:', variantsData.length);
            } else {
                console.error('❌ Unexpected response structure:', response.data);
                throw new Error('Invalid response structure from API');
            }

            // ✅ Transform variants
            const saleVariants: SaleVariant[] = variantsData.map((variant, index) => {
                try {
                    console.log(`🔄 Transforming sale variant ${index + 1}:`, variant.sku);
                    
                    // ✅ Tính toán giá theo logic entity
                    const { finalPrice, savedAmount } = calculatePriceFields(variant);

                    return {
                        _id: variant._id,
                        productId: variant.productId,
                        sku: variant.sku,
                        storage: variant.storage,
                        color: variant.color,
                        price: variant.price,
                        discountPercent: variant.discountPercent || 0,
                        isOnSale: variant.isOnSale || false,
                        finalPrice: finalPrice, // ✅ Computed từ logic getter
                        savedAmount: savedAmount, // ✅ Computed từ logic getter
                        stock: variant.stock,
                        imageUrls: variant.imageUrls || [],
                        imagePublicIds: variant.imagePublicIds || [],
                        isActive: variant.isActive,
                        sold: variant.sold || 0,
                        createdAt: variant.createdAt,
                        updatedAt: variant.updatedAt,
                        productName: variant.productName // Nếu backend trả về
                    };
                } catch (error) {
                    console.error(`❌ Error transforming sale variant ${index + 1}:`, variant, error);
                    throw error;
                }
            });

            console.log('✅ Successfully transformed sale variants:', saleVariants.length);
            return saleVariants;

        } catch (error) {
            console.error('❌ Error fetching sale variants:', error);
            if (axios.isAxiosError(error) && error.response) {
                console.error('❌ Response error:', error.response.data);
                console.error('❌ Response status:', error.response.status);
            }
            throw new Error('Failed to fetch sale variants');
        }
    },

    // ✅ LẤY DANH SÁCH SẢN PHẨM ĐANG GIẢM GIÁ
    getSaleProducts: async (): Promise<SaleProduct[]> => {
        try {
            console.log('🔍 Calling Sale Products API:', `${API_URL}/products/sale/products`);
            const response = await apiClient.get('/products/sale/products');

            console.log('📦 Sale Products Raw Response:', response.data);

            // ✅ XỬ LÝ RESPONSE STRUCTURE
            let productsData: any[] = [];
            
            if (response.data && response.data.success && Array.isArray(response.data.data)) {
                productsData = response.data.data;
                console.log('✅ Found sale products in response.data.data:', productsData.length);
            } else if (Array.isArray(response.data)) {
                productsData = response.data;
                console.log('✅ Found direct array response:', productsData.length);
            } else {
                console.error('❌ Unexpected response structure:', response.data);
                throw new Error('Invalid response structure from API');
            }

            // ✅ Transform sale products
            const saleProducts: SaleProduct[] = productsData.map((item, index) => {
                try {
                    console.log(`🔄 Transforming sale product ${index + 1}:`, item.product?.name);
                    return {
                        product: transformProduct(item.product),
                        variants: item.variants || []
                    };
                } catch (error) {
                    console.error(`❌ Error transforming sale product ${index + 1}:`, item, error);
                    throw error;
                }
            });

            console.log('✅ Successfully transformed sale products:', saleProducts.length);
            return saleProducts;

        } catch (error) {
            console.error('❌ Error fetching sale products:', error);
            if (axios.isAxiosError(error) && error.response) {
                console.error('❌ Response error:', error.response.data);
                console.error('❌ Response status:', error.response.status);
            }
            throw new Error('Failed to fetch sale products');
        }
    }
};

// Legacy function for backward compatibility
export const getProducts = async (): Promise<Product[]> => {
    try {
        return await productService.getAll();
    } catch (error: unknown) {
        console.error('Error fetching products:', error);
        return [];
    }
};

// 🎯 THÊM: Legacy function for getById
export const getProductById = async (id: string): Promise<Product | null> => {
    try {
        return await productService.getById(id);
    } catch (error: unknown) {
        console.error('Error fetching product by ID:', error);
        return null;
    }
};

// ✅ Legacy functions for sale data
export const getSaleVariants = async (): Promise<SaleVariant[]> => {
    try {
        return await productService.getSaleVariants();
    } catch (error: unknown) {
        console.error('Error fetching sale variants:', error);
        return [];
    }
};

export const getSaleProducts = async (): Promise<SaleProduct[]> => {
    try {
        return await productService.getSaleProducts();
    } catch (error: unknown) {
        console.error('Error fetching sale products:', error);
        return [];
    }
};