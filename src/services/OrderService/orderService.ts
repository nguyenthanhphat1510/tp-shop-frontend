import axios from 'axios';
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
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken') || localStorage.getItem('token');
    }
    return null;
  }

  // 📦 Tạo đơn hàng mới
  async createOrder(orderData: CreateOrderData): Promise<ApiResponse<Order>> {
    try {
      const token = this.getAuthToken();
      if (!token) throw new Error('Vui lòng đăng nhập để đặt hàng');

      const response = await axios.post(`${this.baseUrl}/orders`, orderData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // <-- BẮT BUỘC PHẢI CÓ DÒNG NÀY
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('❌ Error creating order:', error);
      throw new Error(error.response?.data?.message || 'Không thể tạo đơn hàng');
    }
  }

  // 📋 Lấy danh sách đơn hàng
  async getOrders(): Promise<ApiResponse<Order[]>> {
    try {
      // const token = this.getAuthToken();
      // if (!token) throw new Error('Vui lòng đăng nhập để xem đơn hàng');

      const response = await axios.get(`${this.baseUrl}/orders`, {
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching orders:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy danh sách đơn hàng');
    }
  }

  // 🔍 Lấy chi tiết đơn hàng
  async getOrderById(orderId: string): Promise<ApiResponse<Order>> {
    try {
      // const token = this.getAuthToken();
      // if (!token) throw new Error('Vui lòng đăng nhập để xem đơn hàng');

      const response = await axios.get(`${this.baseUrl}/orders/${orderId}`, {
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching order:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy thông tin đơn hàng');
    }
  }

  // ❌ Hủy đơn hàng
  async cancelOrder(orderId: string, reason?: string): Promise<ApiResponse<Order>> {
    try {
      // const token = this.getAuthToken();
      // if (!token) throw new Error('Vui lòng đăng nhập để hủy đơn hàng');

      const response = await axios.patch(`${this.baseUrl}/orders/${orderId}/cancel`, { reason }, {
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('❌ Error cancelling order:', error);
      throw new Error(error.response?.data?.message || 'Không thể hủy đơn hàng');
    }
  }
}

export const orderService = new OrderService();