import apiClient from '../utils/apiClient';
import axios from 'axios';

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

// ✅ Cart Service với endpoints thống nhất
export const cartService = {
    // Thêm sản phẩm vào giỏ hàng
    addToCart: async (data: AddToCartRequest): Promise<CartItem> => {
        try {
            console.log('🛒 Adding to cart:', data);
            
            // ✅ Bỏ /api prefix vì apiClient đã có baseURL = '/api'
            const response = await apiClient.post('/cart/add', data);
            
            if (response.data.success && response.data.data) {
                return transformCartItem(response.data.data.cartItem);
            }
            
            throw new Error(response.data.message || 'Failed to add to cart');
        } catch (error: any) {
            console.error('❌ Error adding to cart:', error);
            throw new Error(error.response?.data?.message || 'Lỗi khi thêm vào giỏ hàng');
        }
    },
    
    // Lấy giỏ hàng
    getCart: async (): Promise<Cart> => {
        try {
            console.log('🔍 Calling Get Cart API: /cart');
            
            // ✅ Đơn giản hóa endpoint
            const response = await apiClient.get('/cart');
            
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
            console.log('🔍 Calling Increase Quantity API: /cart/increase/' + cartItemId);
            
            // ✅ Endpoint đơn giản
            const response = await apiClient.put(`/cart/increase/${cartItemId}`);
            
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
            console.log('🔍 Calling Decrease Quantity API: /cart/decrease/' + cartItemId);
            
            const response = await apiClient.put(`/cart/decrease/${cartItemId}`);
            
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
            console.log('🔍 Calling Remove From Cart API: /cart/remove/' + cartItemId);
            
            const response = await apiClient.delete(`/cart/remove/${cartItemId}`);
            
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
            console.log('🔍 Calling Clear Cart API: /cart/clear');
            
            const response = await apiClient.delete('/cart/clear');
            
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
            console.log('🔍 Calling Validate Cart API: /cart/validate');
            
            const response = await apiClient.get('/cart/validate');
            
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
            console.log('🔍 Calling Get Cart Count API: /cart/count');
            
            const response = await apiClient.get('/cart/count');
            
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
            console.log('🔍 Calling Check Product In Cart API: /cart/check/' + productId);
            
            const response = await apiClient.get(`/cart/check/${productId}`);
            
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