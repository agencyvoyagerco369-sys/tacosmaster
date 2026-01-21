import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';

export const FloatingCartButton = () => {
  const { getTotalItems, getSubtotal, openCart } = useCartStore();
  const totalItems = getTotalItems();
  const subtotal = getSubtotal();

  if (totalItems === 0) return null;

  return (
    <AnimatePresence>
      <motion.button
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        whileTap={{ scale: 0.98 }}
        onClick={openCart}
        className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 bg-primary text-primary-foreground py-4 px-6 rounded-2xl shadow-elevated flex items-center justify-between z-40"
      >
        <div className="flex items-center gap-3">
          <span className="bg-primary-foreground/20 px-3 py-1 rounded-full text-sm font-bold">
            {totalItems}
          </span>
          <span className="font-semibold">Ver Pedido</span>
        </div>
        <span className="font-bold text-lg">${subtotal.toFixed(2)}</span>
      </motion.button>
    </AnimatePresence>
  );
};
