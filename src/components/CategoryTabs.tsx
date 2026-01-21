import { Category } from '@/types/menu';
import { categories } from '@/data/products';
import { cn } from '@/lib/utils';

interface CategoryTabsProps {
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
}

export const CategoryTabs = ({ activeCategory, onCategoryChange }: CategoryTabsProps) => {
  return (
    <div className="sticky top-14 z-40 bg-background border-b border-border">
      <div className="flex overflow-x-auto scrollbar-hide px-4 py-3 gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id as Category)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 text-sm font-medium',
              activeCategory === category.id
                ? 'bg-primary text-primary-foreground shadow-card'
                : 'bg-secondary text-secondary-foreground hover:bg-accent'
            )}
          >
            <span>{category.emoji}</span>
            <span>{category.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
