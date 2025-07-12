"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cartService } from '@/services';

interface CartItem {
    id: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
    stock: number;
    isSelected: boolean;
}

interface Cart {
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
    selectedItems: number;
    selectedPrice: number;
}

const Cart = () => {
    const [cart, setCart] = useState<Cart>({
        items: [],
        totalItems: 0,
        totalPrice: 0,
        selectedItems: 0,
        selectedPrice: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [promoCode, setPromoCode] = useState('');

    useEffect(() => {
        fetchCartData();
    }, []);

    const fetchCartData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('🔍 Fetching cart data...');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/cart`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Nếu có auth: 'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Không thể tải giỏ hàng');
            }
            
            const cartData = await response.json();
            console.log('🛒 Cart API Response:', cartData);
            
            if (!cartData.success) {
                throw new Error(cartData.message || 'Lỗi tải giỏ hàng');
            }
            
            // Chuẩn hóa dữ liệu từ API
            const items = cartData.data.cartItems || [];
            const transformedItems = items.map(item => ({
                id: item._id || item.id,
                productId: item.productId,
                name: item.product?.name || 'Sản phẩm không xác định',
                price: item.product?.price || 0,
                quantity: item.quantity || 0,
                imageUrl: item.product?.imageUrl || '/placeholder.jpg',
                stock: item.product?.stock || 0,
                isSelected: true
            }));
            
            // Tính toán tổng
            const totalItems = transformedItems.reduce((total, item) => total + item.quantity, 0);
            const totalPrice = transformedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
            
            setCart({
                items: transformedItems,
                totalItems,
                totalPrice,
                selectedItems: totalItems,
                selectedPrice: totalPrice
            });
            
        } catch (err: any) {
            console.error('❌ Error fetching cart:', err);
            setError(err.message || 'Không thể tải giỏ hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = async (itemId: string, newQuantity: number) => {
        if (newQuantity < 1) return;
        
        try {
            // ✅ THÊM debug để kiểm tra itemId
            console.log('🔍 Debug itemId:', {
                itemId,
                type: typeof itemId,
                length: itemId?.length,
                isValidObjectId: /^[0-9a-fA-F]{24}$/.test(itemId)
            });

            const item = cart.items.find(item => item.id === itemId);
            if (!item) {
                console.error('❌ Item not found:', itemId);
                return;
            }
            
            if (newQuantity > item.stock) {
                alert(`Chỉ còn ${item.stock} sản phẩm trong kho`);
                return;
            }
            
            let response;
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
            
            if (newQuantity > item.quantity) {
                console.log('🔍 Calling increase API:', `${baseUrl}/api/cart/increase/${itemId}`);
                response = await fetch(`${baseUrl}/api/cart/increase/${itemId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
            } else {
                console.log('🔍 Calling decrease API:', `${baseUrl}/api/cart/decrease/${itemId}`);
                response = await fetch(`${baseUrl}/api/cart/decrease/${itemId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
            }
            
            const result = await response.json();
            console.log('🔍 API Response:', result);
            
            if (!result.success) {
                throw new Error(result.message || 'Lỗi cập nhật số lượng');
            }
            
            // ✅ SỬA: Reload cart thay vì update local state
            await fetchCartData();
            
        } catch (err: any) {
            console.error('❌ Error updating quantity:', err);
            alert(err.message || 'Không thể cập nhật số lượng');
        }
    };

    const handleRemoveItem = async (itemId: string) => {
        if (window.confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) {
            try {
                console.log('🔍 Removing item:', itemId);
                
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/cart/remove/${itemId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                
                const result = await response.json();
                console.log('🔍 Remove API Response:', result);
                
                if (!result.success) {
                    throw new Error(result.message || 'Lỗi xóa sản phẩm');
                }
                
                // ✅ SỬA: Reload cart thay vì update local state
                await fetchCartData();
                
            } catch (err: any) {
                console.error('❌ Error removing item:', err);
                alert(err.message || 'Không thể xóa sản phẩm');
            }
        }
    };

    const handleCheckout = () => {
        if (cart.items.length === 0) {
            alert('Giỏ hàng trống');
            return;
        }
        
        console.log('🛒 Thanh toán:', {
            items: cart.items,
            totalPrice: cart.totalPrice,
            promoCode: promoCode
        });
        
        // Chuyển đến trang checkout
        window.location.href = '/checkout';
    };

    // Phần UI giữ nguyên

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900">Giỏ hàng</h1>
                
                {loading ? (
                    <div className="text-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Đang tải giỏ hàng...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-16">
                        <div className="text-red-600 text-5xl mb-4">⚠️</div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Không thể tải giỏ hàng</h2>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button 
                            onClick={fetchCartData}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Thử lại
                        </button>
                    </div>
                ) : cart.items.length === 0 ? (
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
                ) : (
                    // Giữ nguyên nội dung hiển thị giỏ hàng
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                        {/* Các phần UI khác giữ nguyên */}
                        <div className="xl:col-span-3">
                            {/* Desktop Table View */}
                            <div className="hidden lg:block bg-white rounded-lg shadow-sm border overflow-hidden">
                                {/* Table Header */}
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

                                {/* Table Items */}
                                <div className="divide-y divide-gray-200">
                                    {cart.items.map((item) => (
                                        <div key={item.id} className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors">
                                            {/* Image */}
                                            <div className="col-span-1">
                                                <div className="w-16 h-16 bg-gray-200 rounded border overflow-hidden">
                                                    <Image
                                                        src={item.imageUrl || '/placeholder.jpg'}
                                                        alt={item.name}
                                                        width={64}
                                                        height={64}
                                                        className="object-cover"
                                                    />
                                                </div>
                                            </div>

                                            {/* Title */}
                                            <div className="col-span-5 flex items-center">
                                                <Link href={`/products/${item.productId}`}>
                                                    <h3 className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer line-clamp-2">
                                                        {item.name}
                                                    </h3>
                                                </Link>
                                            </div>

                                            {/* Price */}
                                            <div className="col-span-2 flex items-center justify-center">
                                                <span className="text-gray-900 font-medium">
                                                    {item.price.toLocaleString('vi-VN')}đ
                                                </span>
                                            </div>

                                            {/* Quantity */}
                                            <div className="col-span-2 flex items-center justify-center">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                        disabled={item.quantity <= 1}
                                                        className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <span className="text-sm">-</span>
                                                    </button>
                                                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                    <button
                                                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                        disabled={item.quantity >= item.stock}
                                                        className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <span className="text-sm">+</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Total */}
                                            <div className="col-span-1 flex items-center justify-center">
                                                <span className="font-bold text-red-600">
                                                    {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                                                </span>
                                            </div>

                                            {/* Remove */}
                                            <div className="col-span-1 flex items-center justify-center">
                                                <button
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    className="text-red-600 hover:text-red-700 text-xl font-bold"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Mobile Card View */}
                            <div className="lg:hidden space-y-4">
                                {cart.items.map((item) => (
                                    <div key={item.id} className="bg-white rounded-lg shadow-sm border p-4">
                                        <div className="flex items-start space-x-4">
                                            {/* Image */}
                                            <div className="w-20 h-20 bg-gray-200 rounded border overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={item.imageUrl || '/placeholder.jpg'}
                                                    alt={item.name}
                                                    width={80}
                                                    height={80}
                                                    className="object-cover"
                                                />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <Link href={`/products/${item.productId}`}>
                                                    <h3 className="font-medium text-gray-900 hover:text-blue-600 mb-2 line-clamp-2">
                                                        {item.name}
                                                    </h3>
                                                </Link>
                                                
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="text-lg font-bold text-red-600">
                                                        {item.price.toLocaleString('vi-VN')}đ
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveItem(item.id)}
                                                        className="text-red-600 hover:text-red-700 text-sm"
                                                    >
                                                        <i className="fas fa-trash mr-1"></i>
                                                        Xóa
                                                    </button>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                            disabled={item.quantity <= 1}
                                                            className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                                                        >
                                                            <span className="text-sm">-</span>
                                                        </button>
                                                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                        <button
                                                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                            disabled={item.quantity >= item.stock}
                                                            className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                                                        >
                                                            <span className="text-sm">+</span>
                                                        </button>
                                                    </div>
                                                    <div className="text-lg font-bold text-gray-900">
                                                        Tổng: {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Cart Summary - Desktop: 1 column, Mobile: full width */}
                        <div className="xl:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
                                <h3 className="text-lg font-semibold mb-4 text-gray-900">Tổng giỏ hàng</h3>
                                
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Tạm tính:</span>
                                        <span className="font-medium">{cart.totalPrice.toLocaleString('vi-VN')}đ</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Phí vận chuyển:</span>
                                        <span className="font-medium text-green-600">Miễn phí</span>
                                    </div>
                                    <hr className="border-gray-300" />
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Tổng cộng:</span>
                                        <span className="text-red-600">{cart.totalPrice.toLocaleString('vi-VN')}đ</span>
                                    </div>
                                </div>

                                {/* Promo Code */}
                                <div className="mb-4">
                                    <div className="flex flex-col sm:flex-row">
                                        <input
                                            type="text"
                                            placeholder="Nhập mã giảm giá"
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg sm:rounded-r-none text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 sm:mb-0"
                                        />
                                        <button className="bg-gray-900 text-white px-4 py-2 rounded-lg sm:rounded-l-none text-sm hover:bg-gray-800 transition-colors">
                                            Áp dụng
                                        </button>
                                    </div>
                                </div>

                                {/* Checkout Button */}
                                <button
                                    onClick={handleCheckout}
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors mb-3"
                                >
                                    Thanh toán ({cart.totalItems})
                                </button>

                                {/* Continue Shopping */}
                                <Link href="/products">
                                    <button className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                                        Tiếp tục mua sắm
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;