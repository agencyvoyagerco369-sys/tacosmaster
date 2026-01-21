import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { CategoryTabs } from '@/components/CategoryTabs';
import { ProductCard } from '@/components/ProductCard';
import { ProductListSkeleton } from '@/components/ProductSkeleton';
import { CartSheet } from '@/components/CartSheet';
import { FloatingCartButton } from '@/components/FloatingCartButton';
import { products } from '@/data/products';
import { Category } from '@/types/menu';

const Index = () => {
  const [activeCategory, setActiveCategory] = useState<Category>('destacados');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading state for professional feel
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'destacados') {
      // Show featured items + popular picks
      return products.filter(p => 
        p.category === 'destacados' || 
        p.id === 'taco-pastor' || 
        p.id === 'taco-asada' ||
        p.id === 'horchata'
      );
    }
    return products.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      <HeroSection />
      <CategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      <main className="container px-4 py-4">
        {isLoading ? (
          <ProductListSkeleton />
        ) : (
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="grid gap-4"
          >
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))
            ) : (
              <div className="text-center py-12">
                <span className="text-4xl mb-4 block">🌮</span>
                <p className="text-muted-foreground">No hay productos en esta categoría</p>
              </div>
            )}
          </motion.div>
        )}
      </main>

      <FloatingCartButton />
      <CartSheet />
    </div>
  );
};

export default Index;
