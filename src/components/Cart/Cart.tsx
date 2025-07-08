"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

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

// Mock data với placeholder
const mockCartData: Cart = {
    items: [
        {
            id: '1',
            productId: '674a1234567890abcdef1111',
            name: 'MacBook Air 13 inch M2 16GB/256GB',
            price: 23490000,
            quantity: 1,
            imageUrl: '',
            stock: 10,
            isSelected: true
        },
        {
            id: '2',
            productId: '674a1234567890abcdef2222',
            name: 'iPhone 15 Pro Max 256GB',
            price: 30000000,
            quantity: 2,
            imageUrl: '',
            stock: 5,
            isSelected: true
        },
        {
            id: '3',
            productId: '674a1234567890abcdef3333',
            name: 'Samsung Galaxy S24 Ultra 512GB',
            price: 28000000,
            quantity: 1,
            imageUrl: '',
            stock: 8,
            isSelected: false
        }
    ],
    totalItems: 4,
    totalPrice: 81490000,
    selectedItems: 3,
    selectedPrice: 53490000
};

const Cart = () => {
    const [cart, setCart] = useState<Cart>(mockCartData);
    const [promoCode, setPromoCode] = useState('');

    // Tính toán lại tổng tiền khi có thay đổi
    useEffect(() => {
        const selectedItems = cart.items.filter(item => item.isSelected);
        const selectedPrice = selectedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
        const selectedCount = selectedItems.reduce((total, item) => total + item.quantity, 0);
        const totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        const totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);

        setCart(prev => ({
            ...prev,
            selectedItems: selectedCount,
            selectedPrice: selectedPrice,
            totalItems: totalItems,
            totalPrice: totalPrice
        }));
    }, [cart.items]);

    // Xử lý thay đổi số lượng
    const handleQuantityChange = (itemId: string, newQuantity: number) => {
        if (newQuantity < 1) return;
        
        setCart(prev => ({
            ...prev,
            items: prev.items.map(item => {
                if (item.id === itemId) {
                    if (newQuantity > item.stock) {
                        alert(`Chỉ còn ${item.stock} sản phẩm trong kho`);
                        return item;
                    }
                    return { ...item, quantity: newQuantity };
                }
                return item;
            })
        }));
    };

    // Xử lý xóa sản phẩm
    const handleRemoveItem = (itemId: string) => {
        if (window.confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')) {
            setCart(prev => ({
                ...prev,
                items: prev.items.filter(item => item.id !== itemId)
            }));
        }
    };

    // Xử lý thanh toán
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
        
        alert(`Thanh toán thành công! Tổng tiền: ${cart.totalPrice.toLocaleString('vi-VN')}đ`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900">Giỏ hàng</h1>
                
                {cart.items.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="mb-8">
                            <i className="fas fa-shopping-cart text-6xl text-gray-300 mb-4"></i>
                            <h2 className="text-xl sm:text-2xl font-semibold text-gray-600 mb-2">Giỏ hàng trống</h2>
                            <p className="text-gray-500">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
                        </div>
                        <Link href="/products">
                            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                                <i className="fas fa-arrow-left mr-2"></i>
                                Tiếp tục mua sắm
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                        {/* Items List - Desktop: 3 columns, Mobile: 1 column */}
                        <div className="xl:col-span-3">
                            {/* Desktop Table View */}
                            <div className="hidden lg:block bg-white rounded-lg shadow-sm border overflow-hidden">
                                {/* Table Header */}
                                <div className="bg-gray-100 border-b">
                                    <div className="grid grid-cols-12 gap-4 p-4 text-sm font-medium text-gray-700">
                                        <div className="col-span-1">Items</div>
                                        <div className="col-span-5">Title</div>
                                        <div className="col-span-2 text-center">Price</div>
                                        <div className="col-span-2 text-center">Quantity</div>
                                        <div className="col-span-1 text-center">Total</div>
                                        <div className="col-span-1 text-center">Remove</div>
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
                                                        src={item.imageUrl}
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
                                                    src={item.imageUrl}
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
                                    <i className="fas fa-credit-card mr-2"></i>
                                    Thanh toán ({cart.totalItems})
                                </button>

                                {/* Continue Shopping */}
                                <Link href="/products">
                                    <button className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                                        <i className="fas fa-arrow-left mr-2"></i>
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