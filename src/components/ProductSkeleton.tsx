import { motion } from 'framer-motion';

export const ProductSkeleton = () => {
  return (
    <div className="bg-card rounded-2xl shadow-soft overflow-hidden">
      <div className="flex gap-3 p-3">
        <div className="w-24 h-24 flex-shrink-0 bg-muted rounded-xl animate-pulse-soft" />
        
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="h-4 bg-muted rounded w-3/4 animate-pulse-soft" />
            <div className="h-3 bg-muted rounded w-full mt-2 animate-pulse-soft" />
            <div className="h-3 bg-muted rounded w-2/3 mt-1 animate-pulse-soft" />
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <div className="h-5 bg-muted rounded w-16 animate-pulse-soft" />
            <div className="h-8 bg-muted rounded-full w-20 animate-pulse-soft" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProductListSkeleton = () => {
  return (
    <div className="grid gap-4 p-4">
      {[1, 2, 3, 4].map((i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
};
