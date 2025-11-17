class PaymentService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  /**
   * 💳 TẠO THANH TOÁN MOMO CHO ĐƠN HÀNG ĐÃ TỒN TẠI
   * 
   * @param data - Object chứa orderId, amount, orderInfo
   * @returns Response từ backend với payUrl để redirect
   */
  async createMomoPayment(data: {
    orderId: string;
    amount: number;
    orderInfo: string;
  }) {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      
      console.log('💳 PaymentService - Creating MoMo payment');
      console.log('📤 Request data:', data);

      const response = await fetch(`${this.baseUrl}/api/payment/momo/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(data) // ✅ Gửi trực tiếp data, không wrap thêm
      });

      const result = await response.json();
      
      console.log('✅ MoMo payment response:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Không thể tạo thanh toán MoMo');
      }

      return result;

    } catch (error: any) {
      console.error('❌ PaymentService error:', error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();