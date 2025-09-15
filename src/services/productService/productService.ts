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

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;  // Will convert from string
    imageUrl: string;
    imageUrls: string[]; // FIX: Thêm imageUrls array
    imagePublicId: string;
    categoryId: string;
    subcategoryId: string;
    stock: number;
    isActive: boolean;  // Will convert from string
    createdAt: string;
    updatedAt: string;
}

// Helper function to transform product data
const transformProduct = (item: any): Product => {
    // FIX: Xử lý response có nested data
    const productData = item.data || item; // Nếu có nested data thì lấy data, không thì lấy item
    
    return {
        id: productData._id || productData.id, // 🎯 Backend trả về _id, frontend cần id
        name: productData.name,
        description: productData.description,
        price: typeof productData.price === 'string' ? parseInt(productData.price) : productData.price || 0,
        imageUrl: productData.imageUrl || (productData.imageUrls && productData.imageUrls[0]) || '',
        imageUrls: productData.imageUrls || [], // FIX: Thêm imageUrls
        imagePublicId: productData.imagePublicId || '',
        categoryId: productData.categoryId,
        subcategoryId: productData.subcategoryId,
        stock: productData.stock || 0,
        isActive: productData.isActive === 'true' || productData.isActive === true,
        createdAt: productData.createdAt,
        updatedAt: productData.updatedAt
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
            
            // Transform response to proper types
            const products: Product[] = response.data.map(transformProduct);
            
            console.log('✅ Transformed products:', products);
            return products;
            
            
        } catch (error: unknown) {
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
            console.log('🔍 Calling API:', `${API_URL}/products/${id}`);
            
            // Validate ID trước khi gọi API
            if (!id || id.trim().length === 0) {
                throw new Error('Product ID is required');
            }

            const response = await apiClient.get(`/products/${id}`);
            
            console.log('📦 Raw API Response for product:', response.data);
            
            // FIX: Xử lý response có nested structure
            const product: Product = transformProduct(response.data);
            
            console.log('✅ Transformed product:', product);
            return product;
            
        } catch (error: unknown) {
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