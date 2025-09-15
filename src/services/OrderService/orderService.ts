import apiClient from '../utils/apiClient';
import { ApiResponse } from '../../types/auth';

// Types for Order
export interface OrderItem {
  productId: string;
  quantity: number;
}

export interface ShippingInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
}

export interface CreateOrderData {
  shippingInfo: ShippingInfo;
  paymentMethod: 'cod' | 'momo' | 'zalopay';
  note?: string;
  createFromCart?: boolean;
  items?: OrderItem[];
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
      // ✅ Không cần manual thêm token, interceptor tự động lo
      const response = await apiClient.post('/orders', orderData);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creating order:', error);
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