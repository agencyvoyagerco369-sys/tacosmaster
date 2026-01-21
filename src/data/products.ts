import { Product } from '@/types/menu';

// Import product images
import heroImage from '@/assets/hero-tacos.jpg';
import tacoAsadaImg from '@/assets/taco-asada.jpg';
import gringaImg from '@/assets/gringa.jpg';
import cocaColaImg from '@/assets/coca-cola.jpg';
import horchataImg from '@/assets/horchata.jpg';
import guacamoleImg from '@/assets/guacamole.jpg';
import salsaHabaneroImg from '@/assets/salsa-habanero.jpg';

export const products: Product[] = [
  {
    id: 'taco-asada',
    name: 'Tacos de Carne Asada',
    description: 'Diezmillo premium marinado, asado al carbón, servido con guacamole y salsa martajada.',
    price: 45,
    image: tacoAsadaImg,
    category: 'tacos',
  },
  {
    id: 'taco-pastor',
    name: 'Tacos al Pastor',
    description: 'Cerdo en adobo tradicional, piña asada, cilantro y cebolla picada.',
    price: 35,
    image: heroImage,
    category: 'tacos',
  },
  {
    id: 'gringa-pastor',
    name: 'Gringa de Pastor',
    description: 'Tortilla de harina gigante, queso fundido y carne al pastor.',
    price: 65,
    image: gringaImg,
    category: 'destacados',
  },
  {
    id: 'coca-cola',
    name: 'Coca-Cola de Vidrio',
    description: 'La clásica, bien fría.',
    price: 30,
    image: cocaColaImg,
    category: 'bebidas',
  },
  {
    id: 'horchata',
    name: 'Agua de Horchata',
    description: 'Receta de la casa, cremosa y con canela.',
    price: 25,
    image: horchataImg,
    category: 'bebidas',
    isVegetarian: true,
  },
  {
    id: 'guacamole-extra',
    name: 'Guacamole Extra',
    description: 'Aguacate fresco machacado con cilantro, cebolla y limón.',
    price: 20,
    image: guacamoleImg,
    category: 'extras',
    isVegetarian: true,
  },
  {
    id: 'salsa-habanero',
    name: 'Salsa de Habanero',
    description: 'Para los valientes. Picante extremo con notas cítricas.',
    price: 15,
    image: salsaHabaneroImg,
    category: 'extras',
    isVegetarian: true,
  },
];

export const categories = [
  { id: 'destacados', label: 'Destacados', emoji: '⭐' },
  { id: 'tacos', label: 'Tacos', emoji: '🌮' },
  { id: 'bebidas', label: 'Bebidas', emoji: '🥤' },
  { id: 'extras', label: 'Extras', emoji: '🥑' },
] as const;

export const pickupTimes = [
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '1:00 PM',
  '1:30 PM',
  '2:00 PM',
  '2:30 PM',
  '3:00 PM',
  '3:30 PM',
  '4:00 PM',
  '4:30 PM',
  '5:00 PM',
  '5:30 PM',
  '6:00 PM',
  '6:30 PM',
  '7:00 PM',
  '7:30 PM',
  '8:00 PM',
  '8:30 PM',
  '9:00 PM',
];
