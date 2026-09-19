import { PrismaClient } from '@prisma/client';
import { PRODUCTS } from '../src/data/products';
import { MOCK_PAST_ORDERS } from '../src/data/constants';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create products
  for (const product of PRODUCTS) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        subtitle: product.subtitle,
        description: product.description,
        category: product.category,
        subCategory: product.subCategory,
        collection: product.collection,
        price: product.price,
        stockCount: product.stockCount,
        inStock: product.inStock,
        isNew: product.isNew || false,
        isSale: product.isSale || false,
        isFeatured: product.isFeatured || false,
        isBestSeller: product.isBestSeller || false,
        images: JSON.stringify(product.images),
        colors: JSON.stringify(product.colors),
        sizes: JSON.stringify(product.sizes),
        details: JSON.stringify(product.details),
      },
    });
  }

  console.log('Products seeded.');

  // Create an admin user
  const adminEmail = 'admin@lumora.luxury';
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      // "admin123" hashed using bcrypt
      password: '$2b$10$Epz1VlC./t2Xk.QZk/Q/a.x164/eK50iM7YVb02P8/Qh/QhZk/Q/a', // Placeholder hash
      firstName: 'Lumora',
      lastName: 'Admin',
      role: 'ADMIN',
    },
  });

  console.log('Admin user seeded.');

  // Seed live orders
  const sampleOrders = [
    {
      orderNumber: 'LUM-948201',
      customerName: 'Fatima Malik',
      email: 'fatima.malik@example.com',
      phone: '0300 8472910',
      shippingAddress: 'Villa 14, Phase 5 DHA',
      city: 'Lahore',
      postalCode: '54000',
      status: 'shipped',
      paymentMethod: 'Easypaisa Mobile Wallet',
      paymentStatus: 'Completed',
      courierName: 'TCS White-Glove VIP Express',
      trackingNumber: 'AWB-948201-PK',
      subtotal: 104800,
      discount: 10480,
      shippingFee: 0,
      total: 94320,
      estimatedDelivery: 'September 13, 2026',
      items: [
        {
          productId: PRODUCTS[0].id,
          selectedColor: 'Caramel',
          selectedSize: 'M',
          quantity: 1,
          price: PRODUCTS[0].price,
        },
        {
          productId: PRODUCTS[3].id,
          selectedColor: 'Mocha',
          selectedSize: 'S',
          quantity: 1,
          price: PRODUCTS[3].price,
        },
      ],
      itemsData: JSON.stringify([
        {
          id: 'cart-1',
          product: PRODUCTS[0],
          selectedColor: 'Caramel',
          selectedSize: 'M',
          quantity: 1,
        },
        {
          id: 'cart-2',
          product: PRODUCTS[3],
          selectedColor: 'Mocha',
          selectedSize: 'S',
          quantity: 1,
        },
      ]),
    },
    {
      orderNumber: 'LUM-839102',
      customerName: 'Hamza Tariq',
      email: 'hamza.t@example.com',
      phone: '0321 4455667',
      shippingAddress: 'Apartment 7B, Creek Marina, DHA Phase 8',
      city: 'Karachi',
      postalCode: '75500',
      status: 'out_for_delivery',
      paymentMethod: '1Link Bank Transfer',
      paymentStatus: 'Completed',
      courierName: 'Leopard Gold Express VIP',
      trackingNumber: 'AWB-839102-PK',
      subtotal: 129000,
      discount: 0,
      shippingFee: 0,
      total: 129000,
      estimatedDelivery: 'September 12, 2026',
      items: [
        {
          productId: PRODUCTS[6].id,
          selectedColor: 'Espresso',
          selectedSize: '41mm',
          quantity: 1,
          price: PRODUCTS[6].price,
        },
      ],
      itemsData: JSON.stringify([
        {
          id: 'cart-3',
          product: PRODUCTS[6],
          selectedColor: 'Espresso',
          selectedSize: '41mm',
          quantity: 1,
        },
      ]),
    },
    {
      orderNumber: 'LUM-729143',
      customerName: 'Ayesha Khan',
      email: 'ayesha.k@example.com',
      phone: '0333 5512345',
      shippingAddress: 'House 22, Street 4, F-7/2',
      city: 'Islamabad',
      postalCode: '44000',
      status: 'processing',
      paymentMethod: 'Credit/Debit Card (Visa/Mastercard)',
      paymentStatus: 'Completed',
      courierName: 'TCS White-Glove VIP Express',
      trackingNumber: 'AWB-729143-PK',
      subtotal: 185000,
      discount: 18500,
      shippingFee: 0,
      total: 166500,
      estimatedDelivery: 'September 15, 2026',
      items: [
        {
          productId: PRODUCTS[1].id,
          selectedColor: 'Onyx',
          selectedSize: 'L',
          quantity: 1,
          price: PRODUCTS[1].price,
        },
      ],
      itemsData: JSON.stringify([
        {
          id: 'cart-4',
          product: PRODUCTS[1],
          selectedColor: 'Onyx',
          selectedSize: 'L',
          quantity: 1,
        },
      ]),
    },
    {
      orderNumber: 'LUM-610294',
      customerName: 'Bilal Ahmed',
      email: 'bilal.a@example.com',
      phone: '0302 9988776',
      shippingAddress: 'Bungalow 45, Sector B, Bahria Town',
      city: 'Lahore',
      postalCode: '53720',
      status: 'delivered',
      paymentMethod: 'Cash on Doorstep Delivery (COD)',
      paymentStatus: 'Paid Upon Handover',
      courierName: 'TCS White-Glove VIP Express',
      trackingNumber: 'AWB-610294-PK',
      subtotal: 78000,
      discount: 0,
      shippingFee: 0,
      total: 78000,
      estimatedDelivery: 'September 11, 2026',
      items: [
        {
          productId: PRODUCTS[4].id,
          selectedColor: 'Tan',
          selectedSize: '42',
          quantity: 1,
          price: PRODUCTS[4].price,
        },
      ],
      itemsData: JSON.stringify([
        {
          id: 'cart-5',
          product: PRODUCTS[4],
          selectedColor: 'Tan',
          selectedSize: '42',
          quantity: 1,
        },
      ]),
    },
    {
      orderNumber: 'LUM-551029',
      customerName: 'Zoya Qureshi',
      email: 'zoya.q@example.com',
      phone: '0345 1239876',
      shippingAddress: 'Penthouse 12, Ocean Towers, Clifton Block 9',
      city: 'Karachi',
      postalCode: '75600',
      status: 'in_transit',
      paymentMethod: 'JazzCash Instant Wallet',
      paymentStatus: 'Completed',
      courierName: 'TCS White-Glove VIP Express',
      trackingNumber: 'AWB-551029-PK',
      subtotal: 92000,
      discount: 9200,
      shippingFee: 0,
      total: 82800,
      estimatedDelivery: 'September 14, 2026',
      items: [
        {
          productId: PRODUCTS[2].id,
          selectedColor: 'Cream',
          selectedSize: 'M',
          quantity: 1,
          price: PRODUCTS[2].price,
        },
      ],
      itemsData: JSON.stringify([
        {
          id: 'cart-6',
          product: PRODUCTS[2],
          selectedColor: 'Cream',
          selectedSize: 'M',
          quantity: 1,
        },
      ]),
    }
  ];

  for (const o of sampleOrders) {
    const existing = await prisma.order.findUnique({ where: { orderNumber: o.orderNumber } });
    if (!existing) {
      const created = await prisma.order.create({
        data: {
          orderNumber: o.orderNumber,
          customerName: o.customerName,
          email: o.email,
          phone: o.phone,
          shippingAddress: o.shippingAddress,
          city: o.city,
          postalCode: o.postalCode,
          status: o.status,
          paymentMethod: o.paymentMethod,
          paymentStatus: o.paymentStatus,
          courierName: o.courierName,
          trackingNumber: o.trackingNumber,
          subtotal: o.subtotal,
          discount: o.discount,
          shippingFee: o.shippingFee,
          total: o.total,
          estimatedDelivery: o.estimatedDelivery,
          itemsData: o.itemsData,
          items: {
            create: o.items
          },
          payment: {
            create: {
              gateway: o.paymentMethod,
              amount: o.total,
              status: 'completed',
              transactionId: `TXN-${o.orderNumber.replace('LUM-', '')}`
            }
          }
        }
      });
      console.log(`Seeded order ${created.orderNumber}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
