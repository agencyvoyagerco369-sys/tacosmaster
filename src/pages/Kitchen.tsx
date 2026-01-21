import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, ChefHat, Bell, Filter } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { OrderCard } from '@/components/kitchen/OrderCard';
import { OrderStatus, ORDER_STATUS_LABELS } from '@/types/orders';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const statusFilters: (OrderStatus | 'all')[] = ['all', 'pending', 'preparing', 'ready', 'delivered', 'cancelled'];

const Kitchen = () => {
  const { orders, loading, error, updateOrderStatus, refetch } = useOrders();
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [lastOrderCount, setLastOrderCount] = useState(0);

  const filteredOrders = orders.filter((order) => 
    filter === 'all' ? true : order.status === filter
  );

  const activeOrders = orders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled'
  );

  // Notification for new orders
  useEffect(() => {
    if (orders.length > lastOrderCount && lastOrderCount > 0) {
      const newOrdersCount = orders.length - lastOrderCount;
      toast.success(`🔔 ${newOrdersCount} nuevo(s) pedido(s)!`, {
        description: 'Revisa la lista de pedidos pendientes.',
        duration: 5000,
      });
      
      // Play notification sound (optional)
      try {
        const audio = new Audio('/notification.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {}); // Ignore errors if audio can't play
      } catch {}
    }
    setLastOrderCount(orders.length);
  }, [orders.length]);

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    const success = await updateOrderStatus(orderId, status);
    if (success) {
      toast.success(`Pedido marcado como ${ORDER_STATUS_LABELS[status]}`);
    } else {
      toast.error('Error al actualizar el pedido');
    }
    return success;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <ChefHat className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="font-display font-bold text-xl text-foreground">
                  Panel de Cocina
                </h1>
                <p className="text-xs text-muted-foreground">
                  {activeOrders.length} pedido{activeOrders.length !== 1 ? 's' : ''} activo{activeOrders.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <Button
              onClick={refetch}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </Button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 -mb-2 scrollbar-hide">
            {statusFilters.map((status) => {
              const count = status === 'all' 
                ? orders.length 
                : orders.filter((o) => o.status === status).length;
              
              return (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                    filter === status
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                  )}
                >
                  {status === 'all' ? 'Todos' : ORDER_STATUS_LABELS[status]}
                  <Badge
                    variant="secondary"
                    className={cn(
                      'px-1.5 py-0 text-xs h-5',
                      filter === status && 'bg-primary-foreground/20 text-primary-foreground'
                    )}
                  >
                    {count}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-2xl p-4 space-y-3">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">Error: {error}</p>
            <Button onClick={refetch}>Reintentar</Button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              No hay pedidos
            </h2>
            <p className="text-muted-foreground">
              {filter === 'all'
                ? 'Los nuevos pedidos aparecerán aquí en tiempo real.'
                : `No hay pedidos con estado "${ORDER_STATUS_LABELS[filter]}".`}
            </p>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Kitchen;
