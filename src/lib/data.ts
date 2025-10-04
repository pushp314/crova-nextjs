import type { Product } from './types';
import { PlaceHolderImages } from './placeholder-images';

const getImage = (id: string) => PlaceHolderImages.find(p => p.id === id)?.imageUrl || '';

const products: Product[] = [
  {
    id: 'prod_1',
    name: 'Embroidered Silk Blouse',
    description: 'Exquisitely crafted from pure silk, this blouse features intricate floral embroidery along the sleeves and collar. Its lightweight fabric and relaxed fit make it perfect for both day and evening wear. A true statement piece that combines traditional artistry with modern style.',
    price: 189.99,
    images: [getImage('prod_1_1'), getImage('prod_1_2'), getImage('prod_1_3')],
    categoryId: 'women',
    stock: 25,
    featured: true,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Ivory', 'Black'],
  },
  {
    id: 'prod_2',
    name: 'Tailored Wool Trousers',
    description: 'These tailored trousers are cut from premium Italian wool, offering a sharp, contemporary silhouette. They feature a flat front, pressed creases, and a comfortable lining. Ideal for formal occasions or elevating your everyday office look.',
    price: 220.0,
    images: [getImage('prod_2_1'), getImage('prod_2_2')],
    categoryId: 'men',
    stock: 30,
    featured: true,
    sizes: ['30', '32', '34', '36'],
    colors: ['Charcoal', 'Navy'],
  },
  {
    id: 'prod_3',
    name: 'Minimalist Leather Tote',
    description: 'A timeless tote bag crafted from supple, full-grain leather. Its unstructured design provides ample space for all your essentials, making it a versatile companion for work, travel, or leisure. Features an internal pocket for organization.',
    price: 350.0,
    images: [getImage('prod_3_1')],
    categoryId: 'women',
    stock: 15,
    featured: true,
    sizes: ['One Size'],
    colors: ['Tan', 'Black'],
  },
  {
    id: 'prod_4',
    name: 'Organic Cotton T-Shirt',
    description: 'A classic crewneck t-shirt made from 100% organic cotton for a soft and breathable feel. This wardrobe staple is designed for a perfect fit and will only get better with age. Ethically produced and sustainably sourced.',
    price: 45.0,
    images: [getImage('prod_4_1')],
    categoryId: 'men',
    stock: 100,
    featured: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Heather Grey', 'Black'],
  },
    {
    id: 'prod_5',
    name: 'Floral Print Midi Dress',
    description: 'Embrace the season with this elegant floral midi dress. Made from a lightweight and flowing viscose fabric, it features a flattering V-neck, puff sleeves, and a cinched waist. Perfect for garden parties or a sunny day out.',
    price: 155.0,
    images: [getImage('prod_5_1'), getImage('prod_5_2')],
    categoryId: 'women',
    stock: 40,
    featured: false,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Blush Pink', 'Sky Blue'],
  },
  {
    id: 'prod_6',
    name: 'Classic Denim Jacket',
    description: 'The quintessential denim jacket, updated with a modern fit. Crafted from sturdy 12oz denim, it features branded hardware and a slightly worn-in wash for a vintage feel. A versatile layering piece for any season.',
    price: 120.0,
    images: [getImage('prod_6_1')],
    categoryId: 'men',
    stock: 50,
    featured: false,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Indigo Wash'],
  },
  {
    id: 'prod_7',
    name: 'Cashmere Knit Sweater',
    description: 'Indulge in the luxurious softness of our 100% Mongolian cashmere sweater. This timeless crewneck is lightweight yet incredibly warm, making it an essential piece for cooler weather. Responsibly sourced and crafted for a lifetime of wear.',
    price: 250.0,
    images: [getImage('prod_7_1')],
    categoryId: 'women',
    stock: 20,
    featured: false,
    sizes: ['S', 'M', 'L'],
    colors: ['Oatmeal', 'Grey'],
  },
    {
    id: 'prod_8',
    name: 'Linen Summer Shorts',
    description: 'Stay cool and stylish in our linen summer shorts. Made from breathable, high-quality linen, they feature a comfortable elastic waistband and a relaxed fit. Perfect for beach days or casual city strolls.',
    price: 75.0,
    images: [getImage('prod_8_1')],
    categoryId: 'men',
    stock: 60,
    featured: false,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Khaki', 'White'],
  },
];

// Functions below are now for seeding or fallback and are not used by the live app.

export async function getProducts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`);
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch products');
  }
  return res.json();
}

export async function getProductById(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`);
  if (!res.ok) {
    return undefined;
  }
  return res.json();
}

export async function getFeaturedProducts() {
    const allProducts = await getProducts();
    // In a real app, the API should have a dedicated endpoint for featured products
    return allProducts.slice(0, 4);
}

export async function getProductsByCategory(categoryId: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${categoryId}`);
    if (!res.ok) {
        throw new Error('Failed to fetch products for this category');
    }
    const category = await res.json();
    return category.products;
}
