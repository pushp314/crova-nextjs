
import { PrismaClient, UserRole } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

interface ProductSeedData {
  name: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  categoryName: string;
  sizes: string[];
  colors: string[];
  featured: boolean;
}

const productData: ProductSeedData[] = [
  {
    name: 'Embroidered Silk Blouse',
    description: 'Elegant and versatile, this silk blouse features intricate floral embroidery. A timeless piece for any wardrobe.',
    price: 120.0,
    images: [
      'https://images.unsplash.com/photo-1756376748082-e3184c057d9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxzaWxrJTIwYmxvdXNlfGVufDB8fHx8MTc1OTU2MDQzOHww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8d29tYW4lMjBmYXNoaW9ufGVufDB8fHx8MTc1OTUyNjA1N3ww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1758328537049-aae2d077f1dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxlbWJyb2lkZXJ5JTIwZGV0YWlsfGVufDB8fHx8MTc1OTU0MTc3OHww&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    stock: 50,
    categoryName: 'Women',
    sizes: ['S', 'M', 'L'],
    colors: ['Ivory', 'Black'],
    featured: true,
  },
  {
    name: 'Tailored Wool Trousers',
    description: 'Crafted from premium Italian wool, these trousers offer a modern, slim fit. Perfect for business or casual looks.',
    price: 180.0,
    images: [
      'https://images.unsplash.com/photo-1648879441041-830c67c3c517?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHx3b29sJTIwdHJvdXNlcnN8ZW58MHx8fHwxNzU5NTI3MDc5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1542327534-59a1fe8daf73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxtYW4lMjBmYXNoaW9ufGVufDB8fHx8MTc1OTU0NjI5NXww&ixlib=rb-4.1.0&q=80&w=1080'
    ],
    stock: 30,
    categoryName: 'Men',
    sizes: ['30', '32', '34', '36'],
    colors: ['Charcoal', 'Navy'],
    featured: true,
  },
  {
    name: 'Minimalist Leather Tote',
    description: 'A beautifully simple tote made from full-grain leather that gets better with age. Features a single, spacious compartment.',
    price: 250.0,
    images: ['https://images.unsplash.com/photo-1758328537049-aae2d077f1dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxsZWF0aGVyJTIwdG90ZXxlbnwwfHx8fDE3NTk1MTEwNTZ8MA&ixlib=rb-4.1.0&q=80&w=1080'],
    stock: 20,
    categoryName: 'Women',
    sizes: ['One Size'],
    colors: ['Tan', 'Black'],
    featured: false,
  },
  {
    name: 'Organic Cotton T-Shirt',
    description: 'The perfect crewneck t-shirt, made from soft, breathable 100% organic cotton. A staple for any wardrobe.',
    price: 45.0,
    images: ['https://images.unsplash.com/photo-1745179294252-40178292e3b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxjb3R0b24lMjB0LXNoaXJ0fGVufDB8fHx8MTc1OTUxNzE0OHww&ixlib=rb-4.1.0&q=80&w=1080'],
    stock: 100,
    categoryName: 'Men',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Black', 'Heather Grey'],
    featured: false,
  },
  {
    name: 'Floral Print Midi Dress',
    description: 'A light and airy midi dress with a delicate floral pattern. Features a comfortable elastic waist and a flowing skirt.',
    price: 150.0,
    images: [
      'https://images.unsplash.com/photo-1721917594615-d69a446e9aca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHx3b21hbiUyMGZsb3JhbHxlbnwwfHx8fDE3NTk2MTEzOTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1720982018744-0be735374ad9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxmbG9yYWwlMjBmYWJyaWN8ZW58MHx8fHwxNzU5NjExMzkzfDA&ixlib=rb-4.1.0&q=80&w=1080'
    ],
    stock: 40,
    categoryName: 'Women',
    sizes: ['S', 'M', 'L'],
    colors: ['Pastel Blue'],
    featured: true,
  },
  {
    name: 'Classic Denim Jacket',
    description: 'A wardrobe essential. This classic denim jacket is made from sturdy, non-stretch denim that will break in perfectly over time.',
    price: 165.0,
    images: ['https://images.unsplash.com/photo-1614697688184-66a55d41e298?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxkZW5pbSUyMGphY2tldHxlbnwwfHx8fDE3NTk1ODg1ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080'],
    stock: 60,
    categoryName: 'Men',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Vintage Wash'],
    featured: true,
  },
  {
    name: 'Cashmere Knit Sweater',
    description: 'Incredibly soft and luxurious, this 100% cashmere sweater is a piece to treasure. Features a classic crew neck and ribbed cuffs.',
    price: 280.0,
    images: ['https://images.unsplash.com/photo-1667586680656-6b8e381cddb5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxjYXNobWVyZSUyMHN3ZWF0ZXJ8ZW58MHx8fHwxNzU5NjExMzkzfDA&ixlib=rb-4.1.0&q=80&w=1080'],
    stock: 25,
    categoryName: 'Women',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Oatmeal', 'Grey'],
    featured: false,
  },
  {
    name: 'Linen Summer Shorts',
    description: 'Stay cool and comfortable in these breathable linen shorts. Designed with a relaxed fit and a drawstring waist.',
    price: 75.0,
    images: ['https://images.unsplash.com/photo-1592467674817-23092d6d3f3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8bGluZW4lMjBzaG9ydHN8ZW58MHx8fHwxNzU5NTg5NDMyfDA&ixlib=rb-4.1.0&q=80&w=1080'],
    stock: 80,
    categoryName: 'Men',
    sizes: ['S', 'M', 'L'],
    colors: ['Khaki', 'White', 'Navy'],
    featured: false,
  },
];

async function main() {
  console.log(`Start seeding ...`);

  // Clear existing data in correct order (respecting foreign keys)
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.wishlist.deleteMany({});
  await prisma.rating.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.product.deleteMany({});
  console.log('Deleted existing products');
  await prisma.category.deleteMany({});
  console.log('Deleted existing categories');
  await prisma.address.deleteMany({});
  await prisma.passwordResetToken.deleteMany({});
  await prisma.verificationToken.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('Deleted existing users');
  await prisma.promotionBanner.deleteMany({});
  console.log('Deleted existing promotion banners');

  // Create an admin user
  const hashedPassword = await hash('admin123', 10);
  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@crova.in',
      password: hashedPassword,
      role: UserRole.ADMIN,
      emailVerified: new Date(),
    }
  });
  console.log('Created admin user');

  // Create a delivery user
  const deliveryPassword = await hash('delivery123', 10);
  await prisma.user.create({
    data: {
      name: 'Delivery Person',
      email: 'delivery@crova.in',
      password: deliveryPassword,
      role: UserRole.DELIVERY,
      emailVerified: new Date(),
    }
  });
  console.log('Created delivery user');

  // Create categories and store their IDs
  const womenCategory = await prisma.category.create({
    data: { name: 'Women', description: 'Apparel and accessories for women' },
  });
  const menCategory = await prisma.category.create({
    data: { name: 'Men', description: 'Apparel and accessories for men' },
  });
  console.log('Created Men and Women categories');

  // Create a map for quick lookup
  const categoryMap: Record<string, string> = {
    'Women': womenCategory.id,
    'Men': menCategory.id,
  };

  // Create products with categoryId
  for (const p of productData) {
    const categoryId = categoryMap[p.categoryName];
    if (!categoryId) {
      console.error(`Category not found for: ${p.categoryName}`);
      continue;
    }

    const product = await prisma.product.create({
      data: {
        name: p.name,
        description: p.description,
        price: p.price,
        images: p.images,
        stock: p.stock,
        categoryId: categoryId,
        sizes: p.sizes,
        colors: p.colors,
        featured: p.featured,
      },
    });
    console.log(`Created product with id: ${product.id}`);
  }

  // Create a promotion banner
  await prisma.promotionBanner.create({
    data: {
      title: 'Free Shipping',
      text: 'on all orders over ₹500',
      active: true,
      priority: 1,
      backgroundColor: '#000000',
      textColor: '#FFFFFF',
    }
  });
  console.log('Created a promotion banner');


  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
