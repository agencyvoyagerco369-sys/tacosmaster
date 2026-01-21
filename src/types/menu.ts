export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: Category;
  isVegetarian?: boolean;
}

export type Category = 'destacados' | 'tacos' | 'bebidas' | 'extras';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderDetails {
  mode: 'delivery' | 'pickup';
  name: string;
  phone: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  references?: string;
  pickupTime?: string;
  notes?: string;
}
