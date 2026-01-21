import { useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, Store, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import emailjs from '@emailjs/browser';
import { useCartStore } from '@/store/cartStore';
import { pickupTimes } from '@/data/products';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

interface CheckoutFormProps {
  onBack: () => void;
  onClose: () => void;
}

interface FormData {
  name: string;
  phone: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  references?: string;
  pickupTime?: string;
  notes?: string;
  paymentMethod: 'cash' | 'card' | 'transfer';
}

const DELIVERY_FEE = 25;

const paymentMethods = [
  { value: 'cash', label: 'Efectivo', icon: '💵' },
  { value: 'card', label: 'Tarjeta', icon: '💳' },
  { value: 'transfer', label: 'Transferencia', icon: '📲' },
] as const;

export const CheckoutForm = ({ onBack, onClose }: CheckoutFormProps) => {
  const [mode, setMode] = useState<'delivery' | 'pickup'>('delivery');
  const [selectedPayment, setSelectedPayment] = useState<'cash' | 'card' | 'transfer'>('cash');
  const { getSubtotal, clearCart, items } = useCartStore();
  const subtotal = getSubtotal();
  const deliveryFee = mode === 'delivery' ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ defaultValues: { paymentMethod: 'cash' } });

  const sendEmailNotification = async (data: FormData) => {
    try {
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      if (!serviceId || !templateId || !publicKey) {
        console.warn('EmailJS credentials not configured');
        return;
      }

      // Build address string
      const address = mode === 'delivery'
        ? `${data.street} #${data.number}, ${data.neighborhood}`
        : 'Recoger en local';

      // Build order summary
      const orderSummary = items
        .map((item) => `${item.quantity}x ${item.product.name} - $${(item.product.price * item.quantity).toFixed(2)}`)
        .join('\n');

      const paymentLabels = { cash: 'Efectivo', card: 'Tarjeta', transfer: 'Transferencia' };
      
      const templateParams = {
        customer_name: data.name,
        address,
        reference: mode === 'delivery' ? (data.references || 'Sin referencias') : `Hora: ${data.pickupTime || 'No especificada'}`,
        order_summary: orderSummary,
        total_amount: total.toFixed(2),
        payment_method: paymentLabels[data.paymentMethod],
      };

      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      console.log('Email notification sent successfully');
    } catch (error) {
      console.error('Error sending email notification:', error);
      // Don't throw - email failure shouldn't block the order
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      // Create the order in Supabase
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: data.name,
          customer_phone: data.phone,
          order_mode: mode,
          street: mode === 'delivery' ? data.street : null,
          house_number: mode === 'delivery' ? data.number : null,
          neighborhood: mode === 'delivery' ? data.neighborhood : null,
          delivery_references: mode === 'delivery' ? data.references : null,
          pickup_time: mode === 'pickup' ? data.pickupTime : null,
          kitchen_notes: data.notes,
          subtotal,
          delivery_fee: deliveryFee,
          total,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_name: item.product.name,
        product_price: item.product.price,
        quantity: item.quantity,
        subtotal: item.product.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Send email notification (non-blocking)
      sendEmailNotification(data);

      clearCart();
      onClose();

      toast.success('¡Pedido enviado a cocina! 🎉', {
        description: mode === 'delivery'
          ? 'Te notificaremos cuando tu pedido esté en camino.'
          : 'Tu pedido estará listo pronto. ¡Gracias!',
        duration: 5000,
      });
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast.error('Error al enviar el pedido', {
        description: 'Por favor intenta de nuevo.',
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al carrito
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Mode Toggle */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode('delivery')}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                mode === 'delivery'
                  ? 'border-primary bg-accent'
                  : 'border-border hover:border-muted-foreground'
              )}
            >
              <Truck className={cn('w-6 h-6', mode === 'delivery' ? 'text-primary' : 'text-muted-foreground')} />
              <span className={cn('font-semibold text-sm', mode === 'delivery' ? 'text-primary' : 'text-foreground')}>
                A Domicilio
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMode('pickup')}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                mode === 'pickup'
                  ? 'border-primary bg-accent'
                  : 'border-border hover:border-muted-foreground'
              )}
            >
              <Store className={cn('w-6 h-6', mode === 'pickup' ? 'text-primary' : 'text-muted-foreground')} />
              <span className={cn('font-semibold text-sm', mode === 'pickup' ? 'text-primary' : 'text-foreground')}>
                Pasar a Recoger
              </span>
            </button>
          </div>

          {/* Common Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-foreground">Nombre</Label>
              <Input
                id="name"
                placeholder="Tu nombre"
                className="mt-1.5"
                {...register('name', { required: 'El nombre es requerido' })}
              />
              {errors.name && (
                <p className="text-destructive text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone" className="text-foreground">Teléfono</Label>
              <Input
                id="phone"
                placeholder="10 dígitos"
                inputMode="numeric"
                className="mt-1.5"
                {...register('phone', {
                  required: 'El teléfono es requerido',
                  pattern: {
                    value: /^\d{10}$/,
                    message: 'Ingresa 10 dígitos',
                  },
                })}
              />
              {errors.phone && (
                <p className="text-destructive text-xs mt-1">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Delivery Fields */}
          {mode === 'delivery' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Label htmlFor="street" className="text-foreground">Calle</Label>
                  <Input
                    id="street"
                    placeholder="Calle"
                    className="mt-1.5"
                    {...register('street', { required: mode === 'delivery' ? 'Requerido' : false })}
                  />
                  {errors.street && (
                    <p className="text-destructive text-xs mt-1">{errors.street.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="number" className="text-foreground">Número</Label>
                  <Input
                    id="number"
                    placeholder="#"
                    className="mt-1.5"
                    {...register('number', { required: mode === 'delivery' ? 'Requerido' : false })}
                  />
                  {errors.number && (
                    <p className="text-destructive text-xs mt-1">{errors.number.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="neighborhood" className="text-foreground">Colonia</Label>
                <Input
                  id="neighborhood"
                  placeholder="Colonia"
                  className="mt-1.5"
                  {...register('neighborhood', { required: mode === 'delivery' ? 'Requerido' : false })}
                />
                {errors.neighborhood && (
                  <p className="text-destructive text-xs mt-1">{errors.neighborhood.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="references" className="text-foreground">Referencias</Label>
                <Textarea
                  id="references"
                  placeholder="Ej: Casa blanca, portón negro..."
                  className="mt-1.5 resize-none"
                  rows={2}
                  {...register('references')}
                />
              </div>
            </motion.div>
          )}

          {/* Pickup Fields */}
          {mode === 'pickup' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Label className="text-foreground">Hora estimada de recolección</Label>
              <Select onValueChange={(value) => setValue('pickupTime', value)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Selecciona una hora" />
                </SelectTrigger>
                <SelectContent>
                  {pickupTimes.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>
          )}

          {/* Payment Method */}
          <div>
            <Label className="text-foreground mb-3 block">Método de pago</Label>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => {
                    setSelectedPayment(method.value);
                    setValue('paymentMethod', method.value);
                  }}
                  className={cn(
                    'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all',
                    selectedPayment === method.value
                      ? 'border-primary bg-accent'
                      : 'border-border hover:border-muted-foreground'
                  )}
                >
                  <span className="text-xl">{method.icon}</span>
                  <span className={cn(
                    'text-xs font-medium',
                    selectedPayment === method.value ? 'text-primary' : 'text-foreground'
                  )}>
                    {method.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-foreground">Notas para la cocina (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Ej: Sin cebolla, extra salsa..."
              className="mt-1.5 resize-none"
              rows={2}
              {...register('notes')}
            />
          </div>

          {/* Order Summary */}
          <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">${subtotal.toFixed(2)}</span>
            </div>
            {mode === 'delivery' && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Envío</span>
                <span className="text-foreground">${deliveryFee.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-border pt-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">Total</span>
                <span className="font-bold text-primary text-xl">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="p-4 border-t border-border bg-background sticky bottom-0">
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'w-full py-4 rounded-xl font-bold text-base shadow-card transition-all',
              isSubmitting
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                />
                Enviando...
              </span>
            ) : (
              '🔥 Enviar Pedido a Cocina'
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
};
