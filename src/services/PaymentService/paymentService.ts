class PaymentService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  // Tạo thanh toán MoMo từ thông tin giỏ hàng
  async createMomoPaymentFromCart(cartData: {
    cartItems: any[];
    shippingInfo: any;
    amount: number;
    orderInfo?: string;
  }) {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    
    const response = await fetch(`${this.baseUrl}/api/payment/momo/create-from-cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(cartData)
    });

    return response.json();
  }

  // API cũ vẫn giữ cho COD
  async createMomoPayment(orderId: string, amount: number, orderInfo?: string) {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    
    const response = await fetch(`${this.baseUrl}/api/payment/momo/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        orderId,
        amount,
        orderInfo
      })
    });

    return response.json();
  }
}

export const paymentService = new PaymentService();