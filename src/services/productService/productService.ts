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
    id: string;
    productId: string;
    sku: string;
    storage: string;
    color: string;
    price: number;
    stock: number;
    imageUrls: string[];
    imagePublicIds: string[];
    images?: string[];
    isActive: boolean;
    discountPercent: number;
    isOnSale: boolean;
    finalPrice: number;
    savedAmount: number;
    sold: number;
    createdAt: string;
    updatedAt: string;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    categoryId: string;
    subcategoryId: string;
    variants: ProductVariant[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// ✅ Interface cho Sale Variant Response
export interface SaleVariant extends ProductVariant {
    productName?: string;
}

// ✅ Interface cho Sale Products Response
export interface SaleProduct {
    product: Product;
    variants: ProductVariant[];
}

// ✅ HELPER: Tính toán finalPrice và savedAmount
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
        const { finalPrice, savedAmount } = calculatePriceFields(variant);

        return {
            id: variant._id,
            productId: variant.productId,
            sku: variant.sku,
            storage: variant.storage,
            color: variant.color,
            price: variant.price,
            stock: variant.stock,
            imageUrls: variant.imageUrls || [],
            imagePublicIds: variant.imagePublicIds || [],
            images: variant.images || [],
            isActive: variant.isActive,
            discountPercent: variant.discountPercent || 0,
            isOnSale: variant.isOnSale || false,
            finalPrice: finalPrice,
            savedAmount: savedAmount,
            sold: variant.sold || 0,
            createdAt: variant.createdAt,
            updatedAt: variant.updatedAt
        };
    });

    const defaultVariant = variants.length > 0
        ? variants.reduce((min, variant) => variant.finalPrice < min.finalPrice ? variant : min)
        : undefined;

    const minPrice = variants.length > 0
        ? Math.min(...variants.map(v => v.finalPrice))
        : 0;

    const maxPrice = variants.length > 0
        ? Math.max(...variants.map(v => v.finalPrice))
        : 0;

    const defaultImage = defaultVariant?.imageUrls?.[0] || '/placeholder.jpg';
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
    // ✅ LẤY TẤT CẢ SẢN PHẨM
    getAll: async (): Promise<Product[]> => {
        try {
            console.log('🔍 Calling API:', `${API_URL}/products`);
            const response = await apiClient.get('/products');

            console.log('📦 Raw API Response:', response.data);

            let productsData: any[] = [];

            if (response.data && response.data.success && Array.isArray(response.data.data)) {
                productsData = response.data.data;
                console.log('✅ Found products in response.data.data:', productsData.length);
            } else if (Array.isArray(response.data)) {
                productsData = response.data;
                console.log('✅ Found direct array response:', productsData.length);
            } else {
                console.error('❌ Unexpected response structure:', response.data);
                throw new Error('Invalid response structure from API');
            }

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

    // ✅ LẤY SẢN PHẨM THEO ID
    getById: async (id: string): Promise<any> => {
        try {
            if (!id || id.trim().length === 0) {
                throw new Error('Product ID is required');
            }

            console.log('🔄 Calling getById API:', `${API_URL}/products/${id}`);
            const response = await apiClient.get(`/products/${id}`);

            console.log('📦 GetById Raw Response:', response.data);
            return response.data;

        } catch (error) {
            console.error('❌ Error fetching product by ID:', error);

            if (axios.isAxiosError(error)) {
                if (error.response) {
                    console.error('❌ Response error:', error.response.data);
                    console.error('❌ Response status:', error.response.status);

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

    // ✅ ✨ MỚI: LẤY CHI TIẾT VARIANT + PRODUCT
    getVariantDetail: async (variantId: string): Promise<{
        variant: ProductVariant;
        product: Product;
    }> => {
        try {
            if (!variantId || variantId.trim().length === 0) {
                throw new Error('Variant ID is required');
            }

            console.log('🔄 Calling getVariantDetail API:', `${API_URL}/products/variants/${variantId}`);
            const response = await apiClient.get(`/products/variants/${variantId}`);

            console.log('📦 GetVariantDetail Raw Response:', response.data);

            if (!response.data || !response.data.success) {
                throw new Error('Invalid response structure from API');
            }

            const { variant: rawVariant, product: rawProduct } = response.data.data;

            // ✅ Transform variant data
            const { finalPrice, savedAmount } = calculatePriceFields(rawVariant);

            const variant: ProductVariant = {
                id: rawVariant._id,
                productId: rawVariant.productId,
                sku: rawVariant.sku,
                storage: rawVariant.storage,
                color: rawVariant.color,
                price: rawVariant.price,
                stock: rawVariant.stock,
                imageUrls: rawVariant.imageUrls || [],
                imagePublicIds: rawVariant.imagePublicIds || [],
                images: rawVariant.imageUrls || [], // Alias
                isActive: rawVariant.isActive,
                discountPercent: rawVariant.discountPercent || 0,
                isOnSale: rawVariant.isOnSale || false,
                finalPrice: finalPrice,
                savedAmount: savedAmount,
                sold: rawVariant.sold || 0,
                createdAt: rawVariant.createdAt,
                updatedAt: rawVariant.updatedAt
            };

            // ✅ Transform product data (basic info, không có variants)
            const product: Product = {
                id: rawProduct._id,
                name: rawProduct.name,
                description: rawProduct.description,
                categoryId: rawProduct.categoryId,
                subcategoryId: rawProduct.subcategoryId,
                isActive: rawProduct.isActive,
                createdAt: rawProduct.createdAt,
                updatedAt: rawProduct.updatedAt,
                variants: [] // Sẽ được thêm sau nếu cần
            };

            console.log('✅ Successfully transformed variant & product');
            console.log('🎯 Variant:', `${variant.color} - ${variant.storage}`);
            console.log('📦 Product:', product.name);

            return { variant, product };

        } catch (error) {
            console.error('❌ Error fetching variant detail:', error);

            if (axios.isAxiosError(error)) {
                if (error.response) {
                    console.error('❌ Response error:', error.response.data);
                    console.error('❌ Response status:', error.response.status);

                    switch (error.response.status) {
                        case 400:
                            throw new Error('ID variant không hợp lệ');
                        case 404:
                            throw new Error('Không tìm thấy variant');
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

            throw new Error(`Failed to fetch variant detail: ${error}`);
        }
    },

    // ✅ LẤY DANH SÁCH VARIANTS ĐANG GIẢM GIÁ
    getSaleVariants: async (): Promise<SaleVariant[]> => {
        try {
            console.log('🔍 Calling Sale Variants API:', `${API_URL}/products/sale/variants`);
            const response = await apiClient.get('/products/sale/variants');

            console.log('📦 Sale Variants Raw Response:', response.data);

            let variantsData: any[] = [];

            if (response.data && response.data.success && Array.isArray(response.data.data)) {
                variantsData = response.data.data;
                console.log('✅ Found sale variants in response.data.data:', variantsData.length);
            } else if (Array.isArray(response.data)) {
                variantsData = response.data;
                console.log('✅ Found direct array response:', variantsData.length);
            } else {
                console.error('❌ Unexpected response structure:', response.data);
                throw new Error('Invalid response structure from API');
            }

            const saleVariants: SaleVariant[] = variantsData.map((variant, index) => {
                try {
                    console.log(`🔄 Transforming sale variant ${index + 1}:`, variant.sku);

                    const { finalPrice, savedAmount } = calculatePriceFields(variant);

                    return {
                        id: variant._id,
                        productId: variant.productId,
                        sku: variant.sku,
                        storage: variant.storage,
                        color: variant.color,
                        price: variant.price,
                        discountPercent: variant.discountPercent || 0,
                        isOnSale: variant.isOnSale || false,
                        finalPrice: finalPrice,
                        savedAmount: savedAmount,
                        stock: variant.stock,
                        imageUrls: variant.imageUrls || [],
                        imagePublicIds: variant.imagePublicIds || [],
                        isActive: variant.isActive,
                        sold: variant.sold || 0,
                        createdAt: variant.createdAt,
                        updatedAt: variant.updatedAt,
                        productName: variant.productName
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
    },

    // ✅ ✨ MỚI: LẤY DANH SÁCH SẢN PHẨM KHÔNG GIẢM GIÁ
    getNotOnSaleProducts: async (): Promise<Product[]> => {
        try {
            console.log('🔍 Calling Not On Sale Products API:', `${API_URL}/products/not-on-sale`);
            const response = await apiClient.get('/products/not-on-sale');

            console.log('📦 Not On Sale Products Raw Response:', response.data);

            // ✅ XỬ LÝ RESPONSE STRUCTURE
            let productsData: any[] = [];

            if (response.data && response.data.success && Array.isArray(response.data.data)) {
                productsData = response.data.data;
                console.log('✅ Found not-on-sale products in response.data.data:', productsData.length);
            } else if (Array.isArray(response.data)) {
                productsData = response.data;
                console.log('✅ Found direct array response:', productsData.length);
            } else {
                console.error('❌ Unexpected response structure:', response.data);
                throw new Error('Invalid response structure from API');
            }

            // ✅ Transform products
            const notOnSaleProducts: Product[] = productsData.map((item, index) => {
                try {
                    console.log(`🔄 Transforming not-on-sale product ${index + 1}:`, item.name);
                    return transformProduct(item);
                } catch (error) {
                    console.error(`❌ Error transforming not-on-sale product ${index + 1}:`, item, error);
                    throw error;
                }
            });

            console.log('✅ Successfully transformed not-on-sale products:', notOnSaleProducts.length);
            return notOnSaleProducts;

        } catch (error) {
            console.error('❌ Error fetching not-on-sale products:', error);
            if (axios.isAxiosError(error) && error.response) {
                console.error('❌ Response error:', error.response.data);
                console.error('❌ Response status:', error.response.status);
            }
            throw new Error('Failed to fetch not-on-sale products');
        }
    }
};

// Legacy functions for backward compatibility
export const getProducts = async (): Promise<Product[]> => {
    try {
        return await productService.getAll();
    } catch (error: unknown) {
        console.error('Error fetching products:', error);
        return [];
    }
};

export const getProductById = async (id: string): Promise<Product | null> => {
    try {
        return await productService.getById(id);
    } catch (error: unknown) {
        console.error('Error fetching product by ID:', error);
        return null;
    }
};

// ✅ ✨ MỚI: Legacy function cho getVariantDetail
export const getVariantDetail = async (variantId: string): Promise<{
    variant: ProductVariant;
    product: Product;
} | null> => {
    try {
        return await productService.getVariantDetail(variantId);
    } catch (error: unknown) {
        console.error('Error fetching variant detail:', error);
        return null;
    }
};

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

// ✅ ✨ MỚI: Legacy function cho not-on-sale products
export const getNotOnSaleProducts = async (): Promise<Product[]> => {
    try {
        return await productService.getNotOnSaleProducts();
    } catch (error: unknown) {
        console.error('Error fetching not-on-sale products:', error);
        return [];
    }
};