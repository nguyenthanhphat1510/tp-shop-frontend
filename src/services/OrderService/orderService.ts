import apiClient from '../utils/apiClient';
import { ApiResponse } from '../../types/auth';

// Types for Order
export interface OrderItem {
  productId: string;
  variantId: string;  // ✅ THÊM variantId
  quantity: number;
}

export interface ShippingInfo {
  fullName: string;
  phone: string;
  address: string;
  city?: string;  // ✅ Optional vì backend có thể tự extract
}

export interface CreateOrderData {
  shippingInfo: ShippingInfo;
  paymentMethod: 'cod' | 'momo';  // ✅ Bỏ zalopay nếu chưa support
  note?: string;
  items: OrderItem[];  // ✅ Required, bỏ createFromCart
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod: 'cod' | 'momo' | 'zalopay';
  shippingInfo: ShippingInfo;
  orderItems: {
    id: string;
    productId: string;
    productName: string;
    productImageUrl: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
    status: 'active' | 'cancelled' | 'returned';
  }[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  note?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

class OrderService {
  // 📦 Tạo đơn hàng mới
  async createOrder(orderData: CreateOrderData): Promise<ApiResponse<Order>> {
    try {
      console.log('🚀 OrderService: Creating order with data:', orderData);
      
      // ✅ VALIDATE payload trước khi gửi
      if (!orderData.items || orderData.items.length === 0) {
        throw new Error('Không có sản phẩm nào để đặt hàng');
      }

      // ✅ VALIDATE từng item
      const invalidItems = orderData.items.filter(item => 
        !item.productId || !item.variantId || !item.quantity || item.quantity <= 0
      );

      if (invalidItems.length > 0) {
        console.error('❌ Invalid items found:', invalidItems);
        throw new Error('Có sản phẩm trong đơn hàng không hợp lệ');
      }

      console.log('📤 Sending request to /api/orders with payload:', {
        itemsCount: orderData.items.length,
        paymentMethod: orderData.paymentMethod,
        shippingInfo: orderData.shippingInfo,
        items: orderData.items
      });

      const response = await apiClient.post('/orders', orderData);
      
      console.log('✅ OrderService: Response received:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ OrderService: Error creating order:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      
      throw new Error(error.response?.data?.message || 'Không thể tạo đơn hàng');
    }
  }

  // 📋 Lấy danh sách đơn hàng
  async getOrders(): Promise<ApiResponse<Order[]>> {
    try {
      const response = await apiClient.get('/orders/admin/all');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching orders:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy danh sách đơn hàng');
    }
  }

  // 🔍 Lấy chi tiết đơn hàng
  async getOrderById(orderId: string): Promise<ApiResponse<Order>> {
    try {
      const response = await apiClient.get(`/orders/${orderId}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching order:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy thông tin đơn hàng');
    }
  }

  // ❌ Hủy đơn hàng
  async cancelOrder(orderId: string, reason?: string): Promise<ApiResponse<Order>> {
    try {
      const response = await apiClient.patch(`/orders/${orderId}/cancel`, { reason });
      return response.data;
    } catch (error: any) {
      console.error('❌ Error cancelling order:', error);
      throw new Error(error.response?.data?.message || 'Không thể hủy đơn hàng');
    }
  }
}

export const orderService = new OrderService();