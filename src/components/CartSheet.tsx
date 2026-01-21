import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, Truck, Store, Coffee } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { products } from '@/data/products';
import { CheckoutForm } from './CheckoutForm';
import { cn } from '@/lib/utils';

export const CartSheet = () => {
  const { items, isOpen, closeCart, updateQuantity, removeItem, getSubtotal, hasBeverages, addItem } = useCartStore();
  const [showCheckout, setShowCheckout] = useState(false);
  const subtotal = getSubtotal();
  const hasDrinks = hasBeverages();

  // Get a suggested beverage
  const suggestedBeverage = products.find(p => p.category === 'bebidas');

  const handleAddBeverage = () => {
    if (suggestedBeverage) {
      addItem(suggestedBeverage);
    }
  };

  const handleClose = () => {
    closeCart();
    setShowCheckout(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50"
          />
          
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-background rounded-t-3xl z-50 max-h-[90vh] flex flex-col md:right-auto md:left-auto md:bottom-auto md:top-0 md:max-w-md md:w-full md:h-full md:rounded-none md:rounded-l-3xl md:ml-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-bold text-lg text-foreground">
                {showCheckout ? 'Finalizar Pedido' : 'Tu Pedido'}
              </h2>
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {showCheckout ? (
                <CheckoutForm onBack={() => setShowCheckout(false)} onClose={handleClose} />
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                  <span className="text-5xl mb-4">🌮</span>
                  <h3 className="font-semibold text-foreground text-lg">Tu carrito está vacío</h3>
                  <p className="text-muted-foreground text-sm mt-2">
                    ¡Agrega unos tacos deliciosos!
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {items.map((item) => (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center gap-3 bg-secondary/50 rounded-xl p-3"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground text-sm truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-primary font-semibold text-sm">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1.5 rounded-full bg-background hover:bg-accent transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5 text-foreground" />
                        </button>
                        <span className="font-semibold text-foreground text-sm min-w-[1.25rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1.5 rounded-full bg-background hover:bg-accent transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5 text-foreground" />
                        </button>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="p-1.5 rounded-full bg-destructive/10 hover:bg-destructive/20 transition-colors ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </button>
                      </div>
                    </motion.div>
                  ))}

                  {/* Upselling for beverages */}
                  {!hasDrinks && suggestedBeverage && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-accent/50 rounded-xl p-4 border border-accent"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Coffee className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">
                          ¿Te traigo un refresco para acompañar?
                        </span>
                      </div>
                      <button
                        onClick={handleAddBeverage}
                        className="flex items-center gap-2 text-primary text-sm font-semibold hover:underline"
                      >
                        <Plus className="w-4 h-4" />
                        Agregar {suggestedBeverage.name} - ${suggestedBeverage.price.toFixed(2)}
                      </button>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && !showCheckout && (
              <div className="p-4 border-t border-border bg-background">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-bold text-foreground text-lg">${subtotal.toFixed(2)}</span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCheckout(true)}
                  className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold text-base hover:bg-primary/90 transition-colors shadow-card"
                >
                  Proceder al Pago
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
