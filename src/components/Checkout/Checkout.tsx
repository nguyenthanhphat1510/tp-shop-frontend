"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { orderService, CreateOrderData } from '@/services/OrderService/orderService';
import { paymentService } from '@/services/PaymentService/paymentService';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'react-toastify';

// Bỏ interface CartItem ở đây, vì ta sẽ dùng interface từ CartContext

interface ShippingInfo {
    fullName: string;
    phone: string;
    address: string;
}

interface PaymentMethod {
    id: string;
    name: string;
    description: string;
    icon: string;
}

const Checkout = () => {
    const router = useRouter();
    
    const { state, dispatch } = useCart();
    const { items } = state;
    console.log('🛒 Giỏ hàng hiện tại:', items);

    // 1. TẤT CẢ CÁC STATE (Giữ nguyên)
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [step, setStep] = useState(1);
    const [totalPrice, setTotalPrice] = useState(0);
    const [shippingFee, setShippingFee] = useState(30000);
    const [promoCode, setPromoCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cod');
    const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
        fullName: '',
        phone: '',
        address: ''
    });

    const paymentMethods: PaymentMethod[] = [
        { id: 'cod', name: 'Thanh toán khi nhận hàng', description: 'Thanh toán bằng tiền mặt khi nhận hàng', icon: 'fas fa-money-bill-wave' },
        { id: 'momo', name: 'Ví MoMo', description: 'Thanh toán qua ví điện tử MoMo', icon: 'fas fa-wallet' }
    ];

    // 2. TẤT CẢ CÁC useEffect (GOM LẠI MỘT CHỖ)
    useEffect(() => {
        const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        setTotalPrice(subtotal + shippingFee - discount);
    }, [items, shippingFee, discount]);

    useEffect(() => {
        if (items !== undefined) {
             setIsLoading(false);
        }
    }, [items]);

    useEffect(() => {
        // Dòng console.log để debug có thể đặt ở đây
        console.log('🔍 Kiểm tra giỏ hàng:', { 
            isLoading, 
            itemCount: items.length, 
            itemsData: items,
            willRedirect: !isLoading && items.length === 0 
        });
        
        if (!isLoading && items.length === 0) {
            console.log('⚠️ CHUẨN BỊ CHUYỂN TRANG - Giỏ hàng trống!');
            
            // THÊM DELAY ĐỂ CÓ THỜI GIAN NHÌN CONSOLE
            setTimeout(() => {
                toast.info("Giỏ hàng của bạn đang trống, đang chuyển về trang sản phẩm.");
                router.push('/products');
            }, 20000); // Đợi 2 giây
        } else if (!isLoading) {
            console.log('✅ Giỏ hàng có dữ liệu, ở lại trang checkout');
        }
    }, [isLoading, items, router]);

    // 3. RETURN CÓ ĐIỀU KIỆN (LUÔN ĐẶT SAU TẤT CẢ CÁC HOOK)
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>Đang tải thông tin đơn hàng...</p>
            </div>
        );
    }

    // Các hàm xử lý giao diện giữ nguyên...
    const handleShippingInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setShippingInfo(prev => ({ ...prev, [name]: value }));
    };
    const handlePaymentMethodChange = (methodId: string) => setSelectedPaymentMethod(methodId);
    const handleApplyPromoCode = () => {
        if (promoCode === 'WELCOME10') {
            const discountAmount = Math.floor(totalPrice * 0.1); // Giảm 10%
            setDiscount(discountAmount);
            alert('Đã áp dụng mã giảm giá: Giảm 10%');
        } else if (promoCode === 'FREESHIP') {
            setShippingFee(0);
            setDiscount(30000);
            alert('Đã áp dụng mã giảm giá: Miễn phí vận chuyển');
        } else {
            alert('Mã giảm giá không hợp lệ');
        }
    };
    const handleNextStep = () => {
        if (step === 1) {
            // Validate shipping info
            if (!shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.address) {
                alert('Vui lòng điền đầy đủ thông tin giao hàng');
                return;
            }
            setStep(2);
        } else if (step === 2) {
            // Validate payment method
            if (!selectedPaymentMethod) {
                alert('Vui lòng chọn phương thức thanh toán');
                return;
            }
            setStep(3);
        }
    };
    const handlePrevStep = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    // 5. TÁI CẤU TRÚC HÀM ĐẶT HÀNG `handlePlaceOrder`
    const handlePlaceOrder = async () => {
        console.log('🚀 Starting order placement process...');
        console.log('📦 Current cart items:', items);
        
        if (items.length === 0) {
            console.log('❌ Order failed: Empty cart');
            toast.error("Giỏ hàng trống, không thể đặt hàng!");
            return;
        }
        
        try {
            setIsProcessing(true);
            console.log('⏳ Processing order...');

            // ✅ VALIDATE dữ liệu cart items trước khi gửi
            const invalidItems = items.filter(item => 
                !item.productId || !item.variantId || !item.quantity || item.quantity <= 0
            );
            
            if (invalidItems.length > 0) {
                console.error('❌ Invalid items found in cart:', invalidItems);
                toast.error("Có sản phẩm trong giỏ hàng không hợp lệ!");
                return;
            }

            // ✅ VALIDATE shipping info
            if (!shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.address) {
                console.error('❌ Missing shipping info:', shippingInfo);
                toast.error("Vui lòng điền đầy đủ thông tin giao hàng!");
                return;
            }

            // ✅ TẠO PAYLOAD ĐÚNG FORMAT VỚI BACKEND
            const orderData: CreateOrderData = {
                shippingInfo: {
                    fullName: shippingInfo.fullName,
                    phone: shippingInfo.phone,
                    address: shippingInfo.address,
                    city: shippingInfo.address // ✅ Tạm thời dùng address làm city
                },
                paymentMethod: selectedPaymentMethod as 'cod' | 'momo',
                items: items.map(item => ({
                    productId: item.productId,
                    variantId: item.variantId, // ✅ QUAN TRỌNG: Gửi variantId
                    quantity: item.quantity
                })),
                note: '' // ✅ Thêm note nếu cần
            };

            console.log('📝 Final order payload:', orderData);
            console.log('📊 Order summary:', {
                itemsCount: orderData.items.length,
                totalQuantity: orderData.items.reduce((acc, item) => acc + item.quantity, 0),
                paymentMethod: orderData.paymentMethod,
                shippingInfo: orderData.shippingInfo
            });

            if (selectedPaymentMethod === 'momo') {
                console.log('💳 Processing MoMo payment...');
                
                const momoRes = await paymentService.createMomoPayment({
                    orderInfo: `Thanh toán đơn hàng TpShop`,
                    amount: totalPrice,
                    extraData: JSON.stringify(orderData)
                });

                if (momoRes.success && momoRes.data.payUrl) {
                    console.log('✅ MoMo payment URL created, redirecting...');
                    window.location.href = momoRes.data.payUrl;
                    return;
                } else {
                    throw new Error(momoRes.message || 'Không thể tạo thanh toán MoMo');
                }
            } else {
                console.log('💰 Processing COD payment...');
                
                // ✅ GỌI ORDER SERVICE VỚI PAYLOAD ĐÚNG
                const response = await orderService.createOrder(orderData);
                console.log('📤 Order service response:', response);

                if (response.success) {
                    console.log('✅ Order created successfully:', response.data);
                    toast.success("Đặt hàng thành công!");
                    
                    // ✅ DỌN DẸP GIỎ HÀNG SAU KHI ĐẶT HÀNG THÀNH CÔNG
                    console.log('🧹 Clearing cart after successful order...');
                    dispatch({ type: 'CLEAR_CART' });
                    
                    // ✅ REDIRECT với orderId từ response
                    const orderId = response.data._id || response.data.id || 'unknown';
                    console.log('🔄 Redirecting to success page with orderId:', orderId);
                    router.push(`/order-success?orderId=${orderId}`);
                } else {
                    throw new Error(response.message || 'Đặt hàng thất bại');
                }
            }
        } catch (error: any) {
            console.error('❌ Order placement error:', error);
            toast.error(error.message || 'Không thể đặt hàng. Vui lòng thử lại.');
        } finally {
            setIsProcessing(false);
            console.log('🏁 Order placement process finished');
        }
    };

    // Giao diện không cần trạng thái loading/error khi tải trang nữa
    // ...
    // Phần JSX của bạn giữ nguyên, chỉ cần đảm bảo nó dùng `items` thay vì `cartItems`
    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900">Thanh toán</h1>
            
            {/* Progress Steps */}
            <div className="mb-8">
                <div className="flex items-center justify-center">
                    <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${step >= 1 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-400'}`}>
                            1
                        </div>
                        <span className="ml-2 font-medium">Thông tin giao hàng</span>
                    </div>
                    <div className={`w-12 h-1 mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                    <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${step >= 2 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-400'}`}>
                            2
                        </div>
                        <span className="ml-2 font-medium">Phương thức thanh toán</span>
                    </div>
                    <div className={`w-12 h-1 mx-2 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                    <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${step >= 3 ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-400'}`}>
                            3
                        </div>
                        <span className="ml-2 font-medium">Xác nhận đơn hàng</span>
                    </div>
                </div>
            </div>
            
            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Checkout Steps */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        {/* Step 1: Shipping Information */}
                        {step === 1 && (
                            <div className="shipping-info">
                                <h2 className="text-xl font-semibold mb-4">Thông tin giao hàng</h2>
                                <div className="grid grid-cols-1 gap-4">
                                    {/* Full Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Họ và tên <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={shippingInfo.fullName}
                                            onChange={handleShippingInfoChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Nhập họ và tên người nhận"
                                            required
                                        />
                                    </div>
                                    {/* Phone */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Số điện thoại <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={shippingInfo.phone}
                                            onChange={handleShippingInfoChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Nhập số điện thoại"
                                            required
                                        />
                                    </div>
                                    {/* Address */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Địa chỉ <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            name="address"
                                            value={shippingInfo.address}
                                            onChange={handleShippingInfoChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Nhập địa chỉ chi tiết"
                                            rows={3}
                                            required
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Step 2: Payment Method */}
                        {step === 2 && (
                            <div className="payment-method">
                                <h2 className="text-xl font-semibold mb-4">Phương thức thanh toán</h2>
                                
                                <div className="space-y-4">
                                    {paymentMethods.map(method => (
                                        <div 
                                            key={method.id}
                                            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                                                selectedPaymentMethod === method.id 
                                                    ? 'border-blue-500 bg-blue-50' 
                                                    : 'border-gray-300 hover:border-blue-300'
                                            }`}
                                            onClick={() => handlePaymentMethodChange(method.id)}
                                        >
                                            <div className="flex items-center">
                                                <div className={`w-5 h-5 rounded-full border ${
                                                    selectedPaymentMethod === method.id 
                                                        ? 'border-blue-600' 
                                                        : 'border-gray-400'
                                                } flex items-center justify-center mr-3`}>
                                                    {selectedPaymentMethod === method.id && (
                                                        <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center">
                                                        <i className={`${method.icon} text-xl text-gray-700 mr-3`}></i>
                                                        <div>
                                                            <h3 className="font-medium">{method.name}</h3>
                                                            <p className="text-sm text-gray-600">{method.description}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Payment Details based on selected method */}
                                {selectedPaymentMethod === 'banking' && (
                                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <h3 className="font-medium mb-2">Thông tin chuyển khoản</h3>
                                        <ul className="text-sm space-y-2">
                                            <li><strong>Ngân hàng:</strong> Vietcombank</li>
                                            <li><strong>Số tài khoản:</strong> 1234567890</li>
                                            <li><strong>Chủ tài khoản:</strong> CÔNG TY TNHH TPSHOP</li>
                                            <li><strong>Nội dung:</strong> [Mã đơn hàng]</li>
                                        </ul>
                                        <p className="text-sm text-gray-600 mt-2">
                                            <i className="fas fa-info-circle mr-1"></i>
                                            Mã đơn hàng sẽ được cung cấp sau khi bạn xác nhận đặt hàng
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Step 3: Order Review */}
                        {step === 3 && (
                            <div className="order-review">
                                <h2 className="text-xl font-semibold mb-4">Xác nhận đơn hàng</h2>
                                
                                {/* Shipping Information Summary */}
                                <div className="mb-6">
                                    <h3 className="font-medium text-gray-800 mb-2">Thông tin giao hàng</h3>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="font-medium">{shippingInfo.fullName}</p>
                                        <p>Điện thoại: {shippingInfo.phone}</p>
                                        <p>
                                            Địa chỉ: {shippingInfo.address}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => setStep(1)}
                                        className="text-blue-600 hover:text-blue-800 text-sm mt-2 flex items-center"
                                    >
                                        <i className="fas fa-edit mr-1"></i> Chỉnh sửa
                                    </button>
                                </div>
                                
                                {/* Payment Method Summary */}
                                <div className="mb-6">
                                    <h3 className="font-medium text-gray-800 mb-2">Phương thức thanh toán</h3>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}
                                    </div>
                                    <button 
                                        onClick={() => setStep(2)}
                                        className="text-blue-600 hover:text-blue-800 text-sm mt-2 flex items-center"
                                    >
                                        <i className="fas fa-edit mr-1"></i> Chỉnh sửa
                                    </button>
                                </div>
                                
                                {/* Order Items */}
                                <div>
                                    <h3 className="font-medium text-gray-800 mb-2">Sản phẩm ({items.length})</h3>
                                    <div className="divide-y divide-gray-200">
                                        {items.map((item) => (
                                            <div key={item.variantId} className="py-4 flex"> {/* ✅ Fix: dùng variantId thay vì item.id */}
                                                <div className="w-16 h-16 bg-gray-200 rounded border overflow-hidden flex-shrink-0">
                                                    <Image
                                                        src={item.image || '/placeholder.jpg'} {/* ✅ Fix: dùng item.image thay vì item.imageUrl */}
                                                        alt={item.name}
                                                        width={64}
                                                        height={64}
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="ml-4 flex-1">
                                                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                                                    <div className="flex justify-between mt-1">
                                                        <span className="text-gray-600">SL: {item.quantity}</span>
                                                        <span className="font-medium">{item.price.toLocaleString('vi-VN')}đ</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8">
                            {step > 1 ? (
                                <button
                                    onClick={handlePrevStep}
                                    className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
                                >
                                    <i className="fas fa-arrow-left mr-2"></i>
                                    Quay lại
                                </button>
                            ) : (
                                <Link href="/cart">
                                    <button className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center">
                                        <i className="fas fa-arrow-left mr-2"></i>
                                        Quay lại giỏ hàng
                                    </button>
                                </Link>
                            )}
                            
                            {step < 3 ? (
                                <button
                                    onClick={handleNextStep}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                                >
                                    Tiếp tục
                                    <i className="fas fa-arrow-right ml-2"></i>
                                </button>
                            ) : (
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={isProcessing}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isProcessing ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            Đặt hàng
                                            <i className="fas fa-check-circle ml-2"></i>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Right Column - Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
                        <h2 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h2>
                        
                        {/* Order Summary */}
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Tạm tính ({items.reduce((acc, item) => acc + item.quantity, 0)} sản phẩm):</span>
                                <span className="font-medium">{items.reduce((acc, item) => acc + (item.price * item.quantity), 0).toLocaleString('vi-VN')}đ</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Phí vận chuyển:</span>
                                <span className="font-medium">{shippingFee === 0 ? 'Miễn phí' : shippingFee.toLocaleString('vi-VN') + 'đ'}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Giảm giá:</span>
                                    <span className="font-medium text-green-600">-{discount.toLocaleString('vi-VN')}đ</span>
                                </div>
                            )}
                            <hr className="border-gray-300" />
                            <div className="flex justify-between text-lg font-bold">
                                <span>Tổng cộng:</span>
                                <span className="text-red-600">{totalPrice.toLocaleString('vi-VN')}đ</span>
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
                                <button 
                                    onClick={handleApplyPromoCode}
                                    className="bg-gray-900 text-white px-4 py-2 rounded-lg sm:rounded-l-none text-sm hover:bg-gray-800 transition-colors"
                                >
                                    Áp dụng
                                </button>
                            </div>
                            <div className="mt-2 text-xs text-gray-600">
                                <p>* Mã giảm giá mẫu:</p>
                                <p>- WELCOME10: Giảm 10% tổng đơn hàng</p>
                                <p>- FREESHIP: Miễn phí vận chuyển</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;