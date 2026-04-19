import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@surprizo.com' },
    update: {},
    create: {
      email: 'admin@surprizo.com',
      password: adminPassword,
      name: 'Admin',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create demo customer
  const userPassword = await bcrypt.hash('user123', 12);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@surprizo.com' },
    update: {},
    create: {
      email: 'demo@surprizo.com',
      password: userPassword,
      name: 'Demo User',
      phone: '+94771234567',
      address: '123 Main St, Colombo',
      role: 'USER',
    },
  });
  console.log('✅ Demo user created:', demoUser.email);

  // Create Mystery Boxes
  const boxes = [
    {
      name: 'Tech Starter Box',
      category: 'TECH',
      price: 1000,
      description: 'Discover exciting tech gadgets and accessories! From USB hubs to LED lights, every box is packed with useful tech goodies worth more than what you pay.',
      possibleItems: JSON.stringify(['Wireless Earbuds', 'USB Hub', 'LED Strip Lights', 'Phone Stand', 'Cable Organizer', 'Mini Speaker']),
      guaranteedValue: 1500,
      premiumChance: 15,
      featured: true,
      image: '/images/tech-box.svg',
    },
    {
      name: 'Tech Premium Box',
      category: 'TECH',
      price: 5000,
      description: 'Premium tech mystery box loaded with high-end gadgets. Could contain smart watches, premium earbuds, or even a tablet! Guaranteed value exceeds your investment.',
      possibleItems: JSON.stringify(['Smart Watch', 'Bluetooth Speaker', 'Mechanical Keyboard', 'Gaming Mouse', 'Webcam', 'Portable SSD']),
      guaranteedValue: 7500,
      premiumChance: 25,
      featured: true,
      image: '/images/tech-premium-box.svg',
    },
    {
      name: 'Beauty Essentials Box',
      category: 'BEAUTY',
      price: 1000,
      description: 'Pamper yourself with surprise beauty products! Skincare, makeup, and beauty tools — all from trusted brands. Your beauty routine will never be the same.',
      possibleItems: JSON.stringify(['Face Mask Set', 'Lip Gloss Collection', 'Makeup Brush Set', 'Face Serum', 'Sheet Masks', 'Beauty Blender']),
      guaranteedValue: 1500,
      premiumChance: 20,
      image: '/images/beauty-box.svg',
    },
    {
      name: 'Beauty Luxe Box',
      category: 'BEAUTY',
      price: 2500,
      description: 'Luxury beauty products hand-picked for you. Premium skincare, designer fragrances, and professional-grade makeup. Feel like royalty every day.',
      possibleItems: JSON.stringify(['Designer Perfume Sample Set', 'Premium Face Cream', 'Eyeshadow Palette', 'Hair Care Set', 'Beauty Tool Kit']),
      guaranteedValue: 3500,
      premiumChance: 30,
      featured: true,
      image: '/images/beauty-luxe-box.svg',
    },
    {
      name: 'Snack Attack Box',
      category: 'SNACKS',
      price: 1000,
      description: 'A delicious mystery assortment of snacks from around the world! Sweet, savory, spicy — your taste buds will thank you. New flavors every time.',
      possibleItems: JSON.stringify(['Japanese Kit Kats', 'Korean Ramen Pack', 'Gummy Bears Collection', 'Exotic Chips', 'Chocolate Assortment', 'Dried Fruit Mix']),
      guaranteedValue: 1500,
      premiumChance: 20,
      image: '/images/snacks-box.svg',
    },
    {
      name: 'Snack Premium Box',
      category: 'SNACKS',
      price: 2500,
      description: 'Premium international snack collection! Gourmet treats, artisan chocolates, and rare finds from across the globe. Perfect for adventurous foodies.',
      possibleItems: JSON.stringify(['Gourmet Chocolate Box', 'Premium Tea Collection', 'Artisan Cookies', 'International Candy Assortment', 'Spice Set']),
      guaranteedValue: 3500,
      premiumChance: 25,
      image: '/images/snacks-premium-box.svg',
    },
    {
      name: 'Gaming Gear Box',
      category: 'GAMING',
      price: 2500,
      description: 'Level up your gaming setup! From controllers to gaming accessories, each box brings you closer to the ultimate gaming experience. Rare items included!',
      possibleItems: JSON.stringify(['Gaming Mousepad XL', 'Controller Grips', 'Gaming LED Lights', 'Keycap Set', 'Cable Management Kit', 'Gaming Stickers']),
      guaranteedValue: 3500,
      premiumChance: 20,
      image: '/images/gaming-box.svg',
    },
    {
      name: 'Gaming Elite Box',
      category: 'GAMING',
      price: 5000,
      description: 'The ultimate gaming mystery box. High-end peripherals, collectible figures, and premium gaming accessories. Every gamer\'s dream come true!',
      possibleItems: JSON.stringify(['Gaming Headset', 'RGB Keyboard', 'Gaming Mouse', 'Collectible Figure', 'Game Gift Card', 'Stream Deck Mini']),
      guaranteedValue: 7500,
      premiumChance: 30,
      featured: true,
      image: '/images/gaming-elite-box.svg',
    },
    {
      name: 'Random Mystery Box',
      category: 'RANDOM',
      price: 1000,
      description: 'The most thrilling box of all! Absolutely anything could be inside. Tech, beauty, gaming, snacks, or something you\'d never expect. Embrace the surprise!',
      possibleItems: JSON.stringify(['Anything from any category!', 'Surprise Gadgets', 'Random Collectibles', 'Mystery Accessories', 'Unexpected Treasures']),
      guaranteedValue: 1500,
      premiumChance: 25,
      featured: true,
      image: '/images/random-box.svg',
    },
    {
      name: 'Random Premium Box',
      category: 'RANDOM',
      price: 5000,
      description: 'The wildcard premium box — could contain ANYTHING of high value. Past boxes have included gaming consoles, premium headphones, and designer items!',
      possibleItems: JSON.stringify(['Premium Electronics', 'Designer Accessories', 'High-End Collectibles', 'Luxury Items', 'Rare Finds']),
      guaranteedValue: 7500,
      premiumChance: 35,
      image: '/images/random-premium-box.svg',
    },
  ];

  for (const box of boxes) {
    await prisma.mysteryBox.create({ data: box });
  }
  console.log(`✅ Created ${boxes.length} mystery boxes`);

  // Create some items
  const items = [
    { name: 'Wireless Earbuds', value: 1200, category: 'TECH', tier: 'STANDARD', stock: 50, description: 'Bluetooth 5.0 wireless earbuds with charging case' },
    { name: 'USB-C Hub 7-in-1', value: 800, category: 'TECH', tier: 'STANDARD', stock: 30, description: 'Multi-port USB-C adapter' },
    { name: 'Smart Watch Band', value: 2500, category: 'TECH', tier: 'PREMIUM', stock: 20, description: 'Premium fitness smart watch' },
    { name: 'Mechanical Keyboard', value: 4500, category: 'TECH', tier: 'PREMIUM', stock: 15, description: 'RGB mechanical gaming keyboard' },
    { name: 'Face Mask Set (10pc)', value: 800, category: 'BEAUTY', tier: 'STANDARD', stock: 100, description: 'Korean skincare face masks' },
    { name: 'Makeup Brush Set', value: 1500, category: 'BEAUTY', tier: 'STANDARD', stock: 40, description: '12-piece professional brush set' },
    { name: 'Premium Serum', value: 3000, category: 'BEAUTY', tier: 'PREMIUM', stock: 25, description: 'Vitamin C brightening serum' },
    { name: 'Japanese Snack Pack', value: 900, category: 'SNACKS', tier: 'STANDARD', stock: 60, description: 'Assorted Japanese snacks' },
    { name: 'Gourmet Chocolate Box', value: 2000, category: 'SNACKS', tier: 'PREMIUM', stock: 30, description: 'Artisan Belgian chocolates' },
    { name: 'Gaming Mouse', value: 3500, category: 'GAMING', tier: 'PREMIUM', stock: 20, description: 'RGB gaming mouse 16000 DPI' },
    { name: 'Gaming Mousepad XL', value: 1200, category: 'GAMING', tier: 'STANDARD', stock: 40, description: 'Extended RGB mousepad' },
    { name: 'LED Strip Lights', value: 600, category: 'TECH', tier: 'STANDARD', stock: 80, description: '5m RGB LED strip with remote' },
    { name: 'Portable Speaker', value: 2000, category: 'TECH', tier: 'STANDARD', stock: 35, description: 'Waterproof bluetooth speaker' },
    { name: 'Eyeshadow Palette', value: 2500, category: 'BEAUTY', tier: 'PREMIUM', stock: 20, description: '18-shade professional palette' },
    { name: 'Gaming Headset', value: 5000, category: 'GAMING', tier: 'PREMIUM', stock: 15, description: '7.1 surround sound gaming headset' },
  ];

  for (const item of items) {
    await prisma.item.create({ data: item });
  }
  console.log(`✅ Created ${items.length} inventory items`);

  console.log('\n🎉 Database seeded successfully!');
  console.log('📧 Admin login: admin@surprizo.com / admin123');
  console.log('📧 Demo login: demo@surprizo.com / user123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
