import { ShoppingBag, ChefHat } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';

export const Header = () => {
  const { getTotalItems, openCart } = useCartStore();
  const totalItems = getTotalItems();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌮</span>
          <span className="font-bold text-lg text-foreground">TacoMaster</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Link
            to="/cocina"
            className="p-2 rounded-full hover:bg-secondary transition-colors"
            aria-label="Panel de cocina"
            title="Panel de Cocina"
          >
            <ChefHat className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
          </Link>
          
          <button
            onClick={openCart}
            className="relative p-2 rounded-full hover:bg-secondary transition-colors"
            aria-label="Abrir carrito"
          >
            <ShoppingBag className="w-6 h-6 text-foreground" />
            <AnimatePresence>
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                >
                  {totalItems > 9 ? '9+' : totalItems}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </header>
  );
};
