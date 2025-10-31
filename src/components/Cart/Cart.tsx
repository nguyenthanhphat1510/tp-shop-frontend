"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext'; // 1. Import hook giỏ hàng
import { useAuth } from '@/contexts/AuthContext'; // Giữ lại để cập nhật số lượng trên Navbar
import { toast } from 'react-toastify';

const Cart = () => {
    // 2. LẤY DỮ LIỆU TRỰC TIẾP TỪ CONTEXT
    const { state, dispatch } = useCart();
    const { items } = state;

    // ✅ THÊM CONSOLE.LOG ĐỂ DEBUG STATE
    console.log('🛒 Cart Component - Full State:', state);
    console.log('📦 Cart Items:', items);
    console.log('📊 Cart Info:', {
        itemCount: items.length,
        totalQuantity: items.reduce((acc, item) => acc + item.quantity, 0),
        totalValue: items.reduce((acc, item) => acc + (item.price * item.quantity), 0),
        itemsData: items.map(item => ({
            variantId: item.variantId,
            name: item.name,
            quantity: item.quantity,
            price: item.price
        }))
    });

    // State cho mã giảm giá vẫn giữ nguyên
    const [promoCode, setPromoCode] = useState('');
    const { setCartCount } = useAuth();

    // 3. CẬP NHẬT SỐ LƯỢNG TRÊN NAVBAR
    useEffect(() => {
        console.log('🔄 Updating cart count on navbar:', items.length);
        setCartCount(items.length);
    }, [items, setCartCount]);

    // ✅ THÊM useEffect ĐỂ THEO DÕI THAY ĐỔI STATE
    useEffect(() => {
        console.log('📈 Cart state changed:', {
            timestamp: new Date().toLocaleTimeString(),
            itemCount: items.length,
            items: items
        });
    }, [items]);

    // 4. TÁI CẤU TRÚC CÁC HÀM XỬ LÝ
    const handleQuantityChange = (variantId: string, newQuantity: number) => {
        console.log('🔢 Quantity change requested:', { variantId, newQuantity });
        
        const item = items.find(i => i.variantId === variantId);
        console.log('📦 Found item:', item);
        
        dispatch({ type: 'UPDATE_QUANTITY', payload: { variantId, quantity: newQuantity } });
        
        console.log('✅ Dispatched UPDATE_QUANTITY action');
    };

    const handleRemoveItem = (variantId: string) => {
        console.log('🗑️ Remove item requested:', variantId);
        
        if (window.confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) {
            dispatch({ type: 'REMOVE_ITEM', payload: { variantId } });
            toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
            
            console.log('✅ Dispatched REMOVE_ITEM action');
        } else {
            console.log('❌ Remove item cancelled');
        }
    };

    const handleCheckout = () => {
        console.log('💳 Checkout requested with items:', items);
        
        if (items.length === 0) {
            console.log('❌ Checkout failed - empty cart');
            toast.error('Giỏ hàng của bạn đang trống!');
            return;
        }
        
        console.log('✅ Redirecting to checkout page');
        window.location.href = '/checkout';
    };

    // 5. TÍNH TOÁN TỔNG TIỀN TỪ DỮ LIỆU CONTEXT
    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
    
    // ✅ LOG TÍNH TOÁN
    console.log('💰 Calculations:', {
        subtotal,
        totalItems,
        itemsBreakdown: items.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            total: item.price * item.quantity
        }))
    });

    // 6. KIỂM TRA GIỎ HÀNG RỖNG
    if (items.length === 0) {
        console.log('🛒 Cart is empty - showing empty state');
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center py-16">
                    <div className="mb-8">
                        <span className="text-6xl">🛒</span>
                        <h2 className="text-xl sm:text-2xl font-semibold text-gray-600 mb-2 mt-4">Giỏ hàng trống</h2>
                        <p className="text-gray-500">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
                    </div>
                    <Link href="/products">
                        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                            Tiếp tục mua sắm
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    console.log('🎨 Rendering cart with items:', items.length);
    
    // Giao diện khi có sản phẩm, sử dụng `items` từ context
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900">Giỏ hàng</h1>
                
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                    <div className="xl:col-span-3">
                        {/* Desktop Table View */}
                        <div className="hidden lg:block bg-white rounded-lg shadow-sm border overflow-hidden">
                            <div className="bg-gray-100 border-b">
                                <div className="grid grid-cols-12 gap-4 p-4 text-sm font-medium text-gray-700">
                                    <div className="col-span-1">Ảnh</div>
                                    <div className="col-span-5">Tên sản phẩm</div>
                                    <div className="col-span-2 text-center">Đơn giá</div>
                                    <div className="col-span-2 text-center">Số lượng</div>
                                    <div className="col-span-1 text-center">Thành tiền</div>
                                    <div className="col-span-1 text-center">Xóa</div>
                                </div>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {items.map((item) => (
                                    <div key={item.variantId} className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors">
                                        <div className="col-span-1">
                                            <Image src={item.image} alt={item.name} width={64} height={64} className="object-cover rounded border" />
                                        </div>
                                        <div className="col-span-5 flex items-center">
                                            <Link href={`/products/${item.productId}`}>
                                                <h3 className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer line-clamp-2">{item.name}</h3>
                                            </Link>
                                        </div>
                                        <div className="col-span-2 flex items-center justify-center">
                                            <span className="text-gray-900 font-medium">{item.price.toLocaleString('vi-VN')}đ</span>
                                        </div>
                                        <div className="col-span-2 flex items-center justify-center">
                                            <div className="flex items-center space-x-2">
                                                <button onClick={() => handleQuantityChange(item.variantId, item.quantity - 1)} className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" >-</button>
                                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                <button onClick={() => handleQuantityChange(item.variantId, item.quantity + 1)} className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" >+</button>
                                            </div>
                                        </div>
                                        <div className="col-span-1 flex items-center justify-center">
                                            <span className="font-bold text-red-600">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                                        </div>
                                        <div className="col-span-1 flex items-center justify-center">
                                            <button onClick={() => handleRemoveItem(item.variantId)} className="text-red-600 hover:text-red-700 text-xl font-bold">×</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Cart Summary */}
                        <div className="xl:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
                                <h3 className="text-lg font-semibold mb-4 text-gray-900">Tổng giỏ hàng</h3>
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Tạm tính:</span>
                                        <span className="font-medium">{subtotal.toLocaleString('vi-VN')}đ</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Tổng cộng:</span>
                                        <span className="text-red-600">{subtotal.toLocaleString('vi-VN')}đ</span>
                                    </div>
                                </div>
                                <button onClick={handleCheckout} className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors mb-3">Thanh toán ({totalItems})</button>
                                <Link href="/products">
                                    <button className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors">Tiếp tục mua sắm</button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;