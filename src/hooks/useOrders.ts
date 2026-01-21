import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem, OrderWithItems, OrderStatus } from '@/types/orders';

export const useOrders = () => {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch all order items
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*');

      if (itemsError) throw itemsError;

      // Combine orders with their items
      const ordersWithItems: OrderWithItems[] = (ordersData as Order[]).map((order) => ({
        ...order,
        order_items: (itemsData as OrderItem[]).filter((item) => item.order_id === order.id),
      }));

      setOrders(ordersWithItems);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status } : order
        )
      );

      return true;
    } catch (err: any) {
      console.error('Error updating order status:', err);
      return false;
    }
  };

  // Set up realtime subscription
  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          console.log('Realtime order update:', payload);
          
          if (payload.eventType === 'INSERT') {
            // Fetch the new order with its items
            fetchOrders();
          } else if (payload.eventType === 'UPDATE') {
            const updatedOrder = payload.new as Order;
            setOrders((prev) =>
              prev.map((order) =>
                order.id === updatedOrder.id
                  ? { ...order, ...updatedOrder }
                  : order
              )
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedOrder = payload.old as Order;
            setOrders((prev) => prev.filter((order) => order.id !== deletedOrder.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    orders,
    loading,
    error,
    updateOrderStatus,
    refetch: fetchOrders,
  };
};
