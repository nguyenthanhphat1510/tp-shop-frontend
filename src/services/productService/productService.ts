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
    imagePublicId: string;
    categoryId: string;
    subcategoryId: string;
    stock: number;
    isActive: boolean;  // Will convert from string
    createdAt: string;
    updatedAt: string;
}

// Product Service - Only GET method
export const productService = {
    // Get all products from your NestJS backend
    getAll: async (): Promise<Product[]> => {
        try {
            console.log('🔍 Calling API:', `${API_URL}/products`);
            const response = await apiClient.get('/products');
            
            console.log('📦 Raw API Response:', response.data);
            
            // Transform response to proper types
            const products: Product[] = response.data.map((item: any) => ({
                id: item.id,
                name: item.name,
                description: item.description,
                price: parseInt(item.price) || 0,  // Convert string to number
                imageUrl: item.imageUrl,
                imagePublicId: item.imagePublicId,
                categoryId: item.categoryId,
                subcategoryId: item.subcategoryId,
                stock: item.stock || 0,
                isActive: item.isActive === 'true' || item.isActive === true,  // Convert string to boolean
                createdAt: item.createdAt,
                updatedAt: item.updatedAt
            }));
            
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