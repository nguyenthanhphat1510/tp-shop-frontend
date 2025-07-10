import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_PATH = '/api/cart';

// Create axios instance with config
const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add token interceptor
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface CartItem {
    id: string;
    productId: string;
    userId: string;
    quantity: number;
    addedAt?: string;
    updatedAt?: string;
    product?: any;
    
    // UI specific properties
    name?: string;
    price?: number;
    imageUrl?: string;
    stock?: number;
    isSelected?: boolean;
}

export interface Cart {
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
    selectedItems: number;
    selectedPrice: number;
}

export interface AddToCartRequest {
    productId: string;
    quantity: number;
}

// Transform API response to match UI needs
const transformCartItem = (item: any): CartItem => {
    return {
        id: item._id || item.id,
        productId: item.productId?._id || item.productId,
        userId: item.userId,
        quantity: item.quantity || 0,
        addedAt: item.addedAt,
        updatedAt: item.updatedAt,
        product: item.product,
        name: item.product?.name || 'Sản phẩm không xác định',
        price: item.product?.price || 0,
        imageUrl: item.product?.imageUrl || '/placeholder.jpg',
        stock: item.product?.stock || 0,
        isSelected: true
    };
};

// Cart Service
export const cartService = {
    // Thêm sản phẩm vào giỏ hàng
    addToCart: async (data: AddToCartRequest): Promise<CartItem> => {
        try {
            console.log('🔍 Calling Add to Cart API:', `${API_URL}${API_PATH}/add`);
            
            if (!data.productId) {
                throw new Error('Product ID is required');
            }
            
            if (!data.quantity || data.quantity < 1) {
                data.quantity = 1;
            }

            const response = await apiClient.post(`${API_PATH}/add`, data);
            
            console.log('📦 Raw API Response:', response.data);
            
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to add to cart');
            }
            
            return transformCartItem(response.data.data.cartItem);
            
        } catch (error: unknown) {
            console.error('❌ Error adding to cart:', error);
            
            if (axios.isAxiosError(error) && error.response) {
                console.error('❌ Response error:', error.response.data);
                throw new Error(error.response.data.message || 'Failed to add to cart');
            }
            
            throw error;
        }
    },
    
    // Lấy giỏ hàng
    getCart: async (): Promise<Cart> => {
        try {
            console.log('🔍 Calling Get Cart API:', `${API_URL}${API_PATH}`);
            
            const response = await apiClient.get(API_PATH);
            
            console.log('📦 Raw API Response:', response.data);
            
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to get cart');
            }
            
            const cartData = response.data.data;
            const items = (cartData.cartItems || []).map(transformCartItem);
            
            // Tính toán tổng
            const totalItems = items.reduce((total: number, item: CartItem) => total + item.quantity, 0);
            const totalPrice = items.reduce((total: number, item: CartItem) => total + ((item.price || 0) * item.quantity), 0);
            
            return {
                items,
                totalItems,
                totalPrice,
                selectedItems: totalItems,
                selectedPrice: totalPrice
            };
            
        } catch (error: unknown) {
            console.error('❌ Error getting cart:', error);
            
            if (axios.isAxiosError(error) && error.response) {
                console.error('❌ Response error:', error.response.data);
                throw new Error(error.response.data.message || 'Failed to get cart');
            }
            
            throw error;
        }
    },
    
    // Tăng số lượng sản phẩm
    increaseQuantity: async (cartItemId: string): Promise<CartItem> => {
        try {
            console.log('🔍 Calling Increase Quantity API:', `${API_URL}${API_PATH}/increase/${cartItemId}`);
            
            const response = await apiClient.put(`${API_PATH}/increase/${cartItemId}`);
            
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to increase quantity');
            }
            
            return transformCartItem(response.data.data.cartItem);
            
        } catch (error: unknown) {
            console.error('❌ Error increasing quantity:', error);
            
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(error.response.data.message || 'Failed to increase quantity');
            }
            
            throw error;
        }
    },
    
    // Giảm số lượng sản phẩm
    decreaseQuantity: async (cartItemId: string): Promise<CartItem | {removed: boolean, cartItemId: string}> => {
        try {
            console.log('🔍 Calling Decrease Quantity API:', `${API_URL}${API_PATH}/decrease/${cartItemId}`);
            
            const response = await apiClient.put(`${API_PATH}/decrease/${cartItemId}`);
            
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to decrease quantity');
            }
            
            // Check if item was removed due to quantity = 0
            if (response.data.data.removed) {
                return response.data.data;
            }
            
            return transformCartItem(response.data.data.cartItem);
            
        } catch (error: unknown) {
            console.error('❌ Error decreasing quantity:', error);
            
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(error.response.data.message || 'Failed to decrease quantity');
            }
            
            throw error;
        }
    },
    
    // Xóa sản phẩm khỏi giỏ hàng
    removeFromCart: async (cartItemId: string): Promise<{removed: boolean, cartItemId: string}> => {
        try {
            console.log('🔍 Calling Remove From Cart API:', `${API_URL}${API_PATH}/remove/${cartItemId}`);
            
            const response = await apiClient.delete(`${API_PATH}/remove/${cartItemId}`);
            
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to remove item from cart');
            }
            
            return response.data.data;
            
        } catch (error: unknown) {
            console.error('❌ Error removing item from cart:', error);
            
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(error.response.data.message || 'Failed to remove item from cart');
            }
            
            throw error;
        }
    },
    
    // Xóa toàn bộ giỏ hàng
    clearCart: async (): Promise<{deletedCount: number}> => {
        try {
            console.log('🔍 Calling Clear Cart API:', `${API_URL}${API_PATH}/clear`);
            
            const response = await apiClient.delete(`${API_PATH}/clear`);
            
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to clear cart');
            }
            
            return response.data.data;
            
        } catch (error: unknown) {
            console.error('❌ Error clearing cart:', error);
            
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(error.response.data.message || 'Failed to clear cart');
            }
            
            throw error;
        }
    },
    
    // Validate giỏ hàng trước khi thanh toán
    validateCart: async (): Promise<{cartItems: CartItem[], totalItems: number, isValid: boolean}> => {
        try {
            console.log('🔍 Calling Validate Cart API:', `${API_URL}${API_PATH}/validate`);
            
            const response = await apiClient.get(`${API_PATH}/validate`);
            
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to validate cart');
            }
            
            const result = response.data.data;
            const cartItems = (result.cartItems || []).map(transformCartItem);
            
            return {
                cartItems,
                totalItems: result.totalItems,
                isValid: result.isValid
            };
            
        } catch (error: unknown) {
            console.error('❌ Error validating cart:', error);
            
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(error.response.data.message || 'Failed to validate cart');
            }
            
            throw error;
        }
    },
    
    // Lấy số lượng item trong giỏ
    getCartCount: async (): Promise<number> => {
        try {
            console.log('🔍 Calling Get Cart Count API:', `${API_URL}${API_PATH}/count`);
            
            const response = await apiClient.get(`${API_PATH}/count`);
            
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to get cart count');
            }
            
            return response.data.data.count;
            
        } catch (error: unknown) {
            console.error('❌ Error getting cart count:', error);
            
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(error.response.data.message || 'Failed to get cart count');
            }
            
            throw error;
        }
    },
    
    // Kiểm tra sản phẩm đã có trong giỏ chưa
    isProductInCart: async (productId: string): Promise<boolean> => {
        try {
            console.log('🔍 Calling Check Product In Cart API:', `${API_URL}${API_PATH}/check/${productId}`);
            
            const response = await apiClient.get(`${API_PATH}/check/${productId}`);
            
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to check product in cart');
            }
            
            return response.data.data.inCart;
            
        } catch (error: unknown) {
            console.error('❌ Error checking product in cart:', error);
            
            if (axios.isAxiosError(error) && error.response) {
                throw new Error(error.response.data.message || 'Failed to check product in cart');
            }
            
            throw error;
        }
    }
};

// Legacy function exports for backward compatibility
export const addToCart = cartService.addToCart;
export const getCart = cartService.getCart;
export const removeFromCart = cartService.removeFromCart;