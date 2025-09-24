import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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
    storage?: string;     // "128GB", "256GB"
    color: string;        // "Đen", "Trắng"
    price: number;        // Giá variant
    stock: number;        // Stock variant
    images: string[];     // Array ảnh variant
    isActive: boolean;
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
    defaultVariant?: ProductVariant;  // Variant mặc định (rẻ nhất)
    minPrice?: number;                // Giá thấp nhất
    maxPrice?: number;                // Giá cao nhất
    defaultImage?: string;            // Ảnh mặc định
    totalStock?: number;              // Tổng stock
    availableColors?: string[];       // Danh sách màu
}

// Helper function to transform product data
const transformProduct = (item: any): Product => {
    const productData = item.data || item;

    // Transform variants
    const variants: ProductVariant[] = (productData.variants || []).map((variant: any) => ({
        _id: variant._id,
        storage: variant.storage,
        color: variant.color,
        price: variant.price,
        stock: variant.stock,
        images: variant.images || [],
        isActive: variant.isActive
    }));

    // ✅ TÍNH TOÁN THÔNG TIN MẶC ĐỊNH theo style TheGioiDiDong
    const defaultVariant = variants.length > 0
        ? variants.reduce((min, variant) => variant.price < min.price ? variant : min)
        : undefined;

    const minPrice = variants.length > 0
        ? Math.min(...variants.map(v => v.price))
        : 0;

    const maxPrice = variants.length > 0
        ? Math.max(...variants.map(v => v.price))
        : 0;

    const defaultImage = defaultVariant?.images[0] || '/placeholder.jpg';

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

    // 🎯 THÊM: Get product by ID
    getById: async (id: string): Promise<Product> => {
        try {
            // Validate ID
            if (!id || id.trim().length === 0) {
                throw new Error('Product ID is required');
            }

            const response = await apiClient.get(`/products/${id}`);

            console.log('📦 GetById Response:', response.data);

            // ✅ Handle wrapped response for getById too
            let productData: any = null;
            
            if (response.data && response.data.success && response.data.data) {
                // Backend trả về: { success: true, data: {...} }
                productData = response.data.data;
            } else if (response.data && !response.data.success) {
                // Direct object response
                productData = response.data;
            } else {
                console.error('❌ Unexpected getById response structure:', response.data);
                throw new Error('Invalid response structure for getById');
            }

            const product: Product = transformProduct(productData);
            return product;

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