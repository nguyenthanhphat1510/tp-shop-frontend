"use client";

import React, { createContext, useReducer, useContext, ReactNode, useEffect } from 'react';

// --- GIẢI THÍCH PHẦN 1: ĐỊNH NGHĨA CẤU TRÚC ---
// Đây là cấu trúc của một món hàng khi nằm trong giỏ.
// Chúng ta lưu đủ thông tin cần thiết để hiển thị và gửi đi.
export interface CartItem {
    productId: string;
    variantId: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
}

// Đây là cấu trúc của toàn bộ giỏ hàng: một danh sách các món hàng.
interface CartState {
    items: CartItem[];
}

// Đây là các "mệnh lệnh" mà chúng ta có thể ra cho giỏ hàng.
type CartAction =
    | { type: 'ADD_ITEM'; payload: CartItem }
    | { type: 'REMOVE_ITEM'; payload: { variantId: string } }
    | { type: 'UPDATE_QUANTITY'; payload: { variantId: string; quantity: number } }
    | { type: 'CLEAR_CART' }
    | { type: 'LOAD_FROM_STORAGE' }; // ✅ Action mới

// --- GIẢI THÍCH PHẦN 2: LOCALSTORAGE HELPERS ---
const CART_STORAGE_KEY = 'tpshop_cart';

// ✅ HÀM ĐỌC CART TỪ LOCALSTORAGE
const loadCartFromStorage = (): CartItem[] => {
    // Kiểm tra xem có phải đang chạy trên browser không (tránh lỗi SSR)
    if (typeof window === 'undefined') {
        console.log('🚫 SSR - không thể truy cập localStorage');
        return [];
    }
    
    try {
        const storedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (storedCart) {
            const parsedCart = JSON.parse(storedCart);
            console.log('📦 Loaded cart from localStorage:', parsedCart);
            return Array.isArray(parsedCart) ? parsedCart : [];
        }
    } catch (error) {
        console.error('❌ Error loading cart from localStorage:', error);
    }
    
    console.log('📦 No cart found in localStorage, starting fresh');
    return [];
};

// ✅ HÀM LƯU CART VÀO LOCALSTORAGE
const saveCartToStorage = (items: CartItem[]) => {
    // Kiểm tra xem có phải đang chạy trên browser không
    if (typeof window === 'undefined') {
        console.log('🚫 SSR - không thể lưu vào localStorage');
        return;
    }
    
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        console.log('💾 Saved cart to localStorage:', {
            itemCount: items.length,
            totalQuantity: items.reduce((acc, item) => acc + item.quantity, 0)
        });
    } catch (error) {
        console.error('❌ Error saving cart to localStorage:', error);
    }
};

// --- GIẢI THÍCH PHẦN 3: BỘ NÃO XỬ LÝ (REDUCER) CẬP NHẬT ---
// Hàm này nhận vào trạng thái hiện tại và một mệnh lệnh, sau đó trả về trạng thái mới.
const cartReducer = (state: CartState, action: CartAction): CartState => {
    let newState: CartState;
    
    switch (action.type) {
        // Khi nhận lệnh 'ADD_ITEM'
        case 'ADD_ITEM': {
            const existingItem = state.items.find(item => item.variantId === action.payload.variantId);
            
            if (existingItem) {
                // Cập nhật số lượng món hàng đã có
                newState = {
                    ...state,
                    items: state.items.map(item =>
                        item.variantId === action.payload.variantId
                            ? { ...item, quantity: item.quantity + action.payload.quantity }
                            : item
                    ),
                };
                console.log('📈 Updated existing item quantity:', {
                    variantId: action.payload.variantId,
                    oldQuantity: existingItem.quantity,
                    newQuantity: existingItem.quantity + action.payload.quantity
                });
            } else {
                // Thêm món hàng mới
                newState = { 
                    ...state, 
                    items: [...state.items, action.payload] 
                };
                console.log('✅ Added new item to cart:', action.payload.name);
            }
            break;
        }
        
        // Khi nhận lệnh 'REMOVE_ITEM'
        case 'REMOVE_ITEM':
            newState = {
                ...state,
                items: state.items.filter(item => item.variantId !== action.payload.variantId),
            };
            console.log('🗑️ Removed item from cart:', action.payload.variantId);
            break;
            
        // Khi nhận lệnh 'UPDATE_QUANTITY'
        case 'UPDATE_QUANTITY':
            newState = {
                ...state,
                items: state.items.map(item =>
                    item.variantId === action.payload.variantId
                        ? { ...item, quantity: action.payload.quantity }
                        : item
                ).filter(item => item.quantity > 0), // Tự động xóa nếu quantity = 0
            };
            console.log('🔢 Updated item quantity:', {
                variantId: action.payload.variantId,
                quantity: action.payload.quantity
            });
            break;
            
        // Khi nhận lệnh 'CLEAR_CART'
        case 'CLEAR_CART':
            newState = { items: [] };
            console.log('🧹 Cleared entire cart');
            break;
            
        // ✅ THÊM case mới để load từ localStorage
        case 'LOAD_FROM_STORAGE':
            const loadedItems = loadCartFromStorage();
            newState = { items: loadedItems };
            console.log('📂 Loaded cart from storage:', {
                itemCount: loadedItems.length,
                totalQuantity: loadedItems.reduce((acc, item) => acc + item.quantity, 0)
            });
            // ❌ KHÔNG save lại vào localStorage ở đây (tránh loop)
            return newState;
            
        default:
            throw new Error(`Unhandled action type: ${(action as any).type}`);
    }
    
    // ✅ TỰ ĐỘNG LƯU VÀO LOCALSTORAGE sau mỗi thay đổi (trừ LOAD_FROM_STORAGE)
    saveCartToStorage(newState.items);
    
    return newState;
};


// --- GIẢI THÍCH PHẦN 4: CARTPROVIDER CẬP NHẬT ---
// Tạo ra một "ngữ cảnh" (Context) để chia sẻ dữ liệu.
const CartContext = createContext<{
    state: CartState;
    dispatch: React.Dispatch<CartAction>;
} | undefined>(undefined);

// Tạo một Component đặc biệt gọi là Provider. Component này sẽ "ôm" ứng dụng của bạn,
// và cung cấp dữ liệu giỏ hàng cho tất cả các component con bên trong nó.
export const CartProvider = ({ children }: { children: ReactNode }) => {
    // Khởi tạo state với giỏ hàng trống
    const [state, dispatch] = useReducer(cartReducer, { items: [] });
    
    // ✅ KHI COMPONENT MOUNT, TỰ ĐỘNG LOAD TỪ LOCALSTORAGE
    useEffect(() => {
        console.log('🚀 CartProvider mounted - loading cart from localStorage');
        dispatch({ type: 'LOAD_FROM_STORAGE' });
    }, []); // Chỉ chạy 1 lần khi component mount
    
    // ✅ DEBUG: Log mỗi khi state thay đổi
    useEffect(() => {
        const itemCount = state.items.length;
        const totalQuantity = state.items.reduce((acc, item) => acc + item.quantity, 0);
        const totalValue = state.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        
        console.log('🛒 Cart state updated:', {
            itemCount,
            totalQuantity,
            totalValue: totalValue.toLocaleString('vi-VN') + 'đ',
            items: state.items.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price.toLocaleString('vi-VN') + 'đ'
            }))
        });
    }, [state.items]);
    
    return (
        <CartContext.Provider value={{ state, dispatch }}>
            {children}
        </CartContext.Provider>
    );
};

// --- GIẢI THÍCH PHẦN 5: CUSTOM HOOK ---
// Tạo một "lối tắt" (Custom Hook) để các component khác có thể truy cập giỏ hàng
// một cách dễ dàng và sạch sẽ, chỉ bằng cách gọi `useCart()`.
export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

// ✅ THÊM: Export helper functions để sử dụng bên ngoài (optional)
export const cartUtils = {
    // Tính tổng số lượng sản phẩm
    getTotalQuantity: (items: CartItem[]): number => {
        return items.reduce((acc, item) => acc + item.quantity, 0);
    },
    
    // Tính tổng giá trị giỏ hàng
    getTotalValue: (items: CartItem[]): number => {
        return items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    },
    
    // Kiểm tra xem sản phẩm đã có trong giỏ chưa
    hasItem: (items: CartItem[], variantId: string): boolean => {
        return items.some(item => item.variantId === variantId);
    },
    
    // Lấy thông tin item cụ thể
    getItem: (items: CartItem[], variantId: string): CartItem | undefined => {
        return items.find(item => item.variantId === variantId);
    }
};