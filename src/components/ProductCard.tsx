import { motion } from 'framer-motion';
import { Plus, Minus, Leaf } from 'lucide-react';
import { Product } from '@/types/menu';
import { useCartStore } from '@/store/cartStore';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  index: number;
}

export const ProductCard = ({ product, index }: ProductCardProps) => {
  const { addItem, updateQuantity, getItemQuantity } = useCartStore();
  const quantity = getItemQuantity(product.id);

  const handleAdd = () => {
    addItem(product);
  };

  const handleIncrease = () => {
    updateQuantity(product.id, quantity + 1);
  };

  const handleDecrease = () => {
    updateQuantity(product.id, quantity - 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-card rounded-2xl shadow-soft hover:shadow-card transition-shadow duration-300 overflow-hidden"
    >
      <div className="flex gap-3 p-3">
        <div className="relative w-24 h-24 flex-shrink-0">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover rounded-xl"
          />
          {product.isVegetarian && (
            <span className="absolute top-1 left-1 bg-success text-success-foreground p-1 rounded-full">
              <Leaf className="w-3 h-3" />
            </span>
          )}
        </div>
        
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <h3 className="font-semibold text-foreground text-sm leading-tight truncate">
              {product.name}
            </h3>
            <p className="text-muted-foreground text-xs mt-1 line-clamp-2">
              {product.description}
            </p>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <span className="font-bold text-primary text-base">
              ${product.price.toFixed(2)}
            </span>
            
            {quantity === 0 ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAdd}
                className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-primary/90 transition-colors"
              >
                Agregar
              </motion.button>
            ) : (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-2 bg-secondary rounded-full"
              >
                <button
                  onClick={handleDecrease}
                  className="p-1.5 rounded-full hover:bg-accent transition-colors"
                >
                  <Minus className="w-4 h-4 text-foreground" />
                </button>
                <span className="font-semibold text-foreground min-w-[1.5rem] text-center text-sm">
                  {quantity}
                </span>
                <button
                  onClick={handleIncrease}
                  className="p-1.5 rounded-full hover:bg-accent transition-colors"
                >
                  <Plus className="w-4 h-4 text-foreground" />
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
