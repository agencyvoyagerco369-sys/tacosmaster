import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, Phone, User, Truck, Store, ChefHat } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { OrderWithItems, OrderStatus, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types/orders';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface OrderCardProps {
  order: OrderWithItems;
  onStatusChange: (orderId: string, status: OrderStatus) => Promise<boolean>;
}

const statusFlow: OrderStatus[] = ['pending', 'preparing', 'ready', 'delivered'];

export const OrderCard = ({ order, onStatusChange }: OrderCardProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const currentStatusIndex = statusFlow.indexOf(order.status);
  const nextStatus = currentStatusIndex < statusFlow.length - 1 
    ? statusFlow[currentStatusIndex + 1] 
    : null;

  const handleAdvanceStatus = async () => {
    if (!nextStatus) return;
    
    setIsUpdating(true);
    await onStatusChange(order.id, nextStatus);
    setIsUpdating(false);
  };

  const handleCancel = async () => {
    setIsUpdating(true);
    await onStatusChange(order.id, 'cancelled');
    setIsUpdating(false);
  };

  const timeAgo = formatDistanceToNow(new Date(order.created_at), {
    addSuffix: true,
    locale: es,
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'bg-card rounded-2xl shadow-card overflow-hidden border border-border',
        order.status === 'cancelled' && 'opacity-50'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={cn('text-white text-xs', ORDER_STATUS_COLORS[order.status])}>
                {ORDER_STATUS_LABELS[order.status]}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {order.order_mode === 'delivery' ? (
                <Truck className="w-4 h-4 text-primary" />
              ) : (
                <Store className="w-4 h-4 text-green-600" />
              )}
              <span className="font-semibold text-foreground text-sm">
                {order.order_mode === 'delivery' ? 'Domicilio' : 'Recoger'}
                {order.pickup_time && ` - ${order.pickup_time}`}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-primary text-lg">${order.total.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="px-4 py-3 bg-secondary/30 space-y-1.5">
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground">{order.customer_name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Phone className="w-4 h-4 text-muted-foreground" />
          <a href={`tel:${order.customer_phone}`} className="text-primary hover:underline">
            {order.customer_phone}
          </a>
        </div>
        {order.order_mode === 'delivery' && order.street && (
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div className="text-foreground">
              <p>{order.street} #{order.house_number}</p>
              <p className="text-muted-foreground">{order.neighborhood}</p>
              {order.delivery_references && (
                <p className="text-xs text-muted-foreground italic">{order.delivery_references}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="p-4 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
          <ChefHat className="w-3 h-3" />
          Productos
        </p>
        <ul className="space-y-1.5">
          {order.order_items.map((item) => (
            <li key={item.id} className="flex items-center justify-between text-sm">
              <span className="text-foreground">
                <span className="font-semibold text-primary">{item.quantity}x</span>{' '}
                {item.product_name}
              </span>
              <span className="text-muted-foreground">${item.subtotal.toFixed(2)}</span>
            </li>
          ))}
        </ul>
        {order.kitchen_notes && (
          <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-200 mb-0.5">
              📝 Notas de cocina:
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">{order.kitchen_notes}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      {order.status !== 'delivered' && order.status !== 'cancelled' && (
        <div className="p-4 border-t border-border flex gap-2">
          {nextStatus && (
            <Button
              onClick={handleAdvanceStatus}
              disabled={isUpdating}
              className="flex-1"
            >
              {isUpdating ? 'Actualizando...' : `Marcar como ${ORDER_STATUS_LABELS[nextStatus]}`}
            </Button>
          )}
          <Button
            onClick={handleCancel}
            disabled={isUpdating}
            variant="destructive"
            size="icon"
            title="Cancelar pedido"
          >
            ✕
          </Button>
        </div>
      )}
    </motion.div>
  );
};
