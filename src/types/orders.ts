export type OrderMode = 'delivery' | 'pickup';
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  order_mode: OrderMode;
  street?: string;
  house_number?: string;
  neighborhood?: string;
  delivery_references?: string;
  pickup_time?: string;
  kitchen_notes?: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
  created_at: string;
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  preparing: 'Preparando',
  ready: 'Listo',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-500',
  preparing: 'bg-blue-500',
  ready: 'bg-green-500',
  delivered: 'bg-gray-500',
  cancelled: 'bg-red-500',
};
