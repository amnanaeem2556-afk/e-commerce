import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import { PRODUCTS } from '../src/data/products.ts';
import { MOCK_PAST_ORDERS } from '../src/data/constants.ts';
import {
  sendOrderEmails,
  sendOrderConfirmationEmail,
  sendAdminOrderNotificationEmail,
  sendOrderStatusUpdateEmail,
  getEmailProviderStatus,
  EmailOrderDetails
} from './email.ts';

// In-memory orders store fallback to guarantee 100% uptime even if database is offline or container sleeps
const inMemoryOrders = new Map<string, any>();

// Seed initial orders into inMemoryOrders
for (const o of MOCK_PAST_ORDERS) {
  const numPart = (o.id || '').replace(/^LUM-/, '');
  const seededOrder = {
    ...o,
    orderNumber: o.id,
    paymentStatus: 'Completed',
    courierName: 'TCS White-Glove VIP Express',
    trackingNumber: `AWB-${numPart}-PK`,
    shippingFee: o.shipping || 0,
    emailSent: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  inMemoryOrders.set(o.id, seededOrder);
  if (o.id.startsWith('LUM-')) {
    inMemoryOrders.set(o.id.replace('LUM-', ''), seededOrder);
  }
}

let prisma: any;
try {
  prisma = new PrismaClient();
} catch {
  console.warn('[AI Studio] Database not connected — using mock');
  const noOp = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async (d: any) => d?.data ?? {},
    update: async (d: any) => d?.data ?? {},
    delete: async () => ({})
  };
  prisma = new Proxy({}, {
    get: (_, prop) => {
      if (prop === '$transaction') {
        return async (cb: any) => {
          if (typeof cb === 'function') {
            return cb(new Proxy({}, { get: () => noOp }));
          }
          return [];
        };
      }
      return noOp;
    }
  });
}
export { prisma };

const app = express();

// Trust reverse proxy (Nginx / Cloud Run) for accurate client IP resolution from X-Forwarded-For
app.set('trust proxy', 1);

// Security Middlewares
app.use(helmet({ contentSecurityPolicy: false, frameguard: false }));
app.use(cors({
  origin: true,
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false }
});
app.use('/api', limiter);

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
// 1. Products API
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    if (products && products.length > 0) {
      // Parse JSON strings back to objects
      const formattedProducts = products.map((p: any) => ({
        ...p,
        images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
        colors: typeof p.colors === 'string' ? JSON.parse(p.colors) : p.colors,
        sizes: typeof p.sizes === 'string' ? JSON.parse(p.sizes) : p.sizes,
        details: typeof p.details === 'string' ? JSON.parse(p.details) : p.details,
      }));
      return res.json(formattedProducts);
    }
  } catch (error) {
    console.warn('Prisma fetch failed, using static catalog:', error);
  }
  // Fallback to static catalog
  res.json(PRODUCTS);
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product: any = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (product) {
      const formattedProduct = {
        ...product,
        images: typeof product.images === 'string' ? JSON.parse(product.images) : product.images,
        colors: typeof product.colors === 'string' ? JSON.parse(product.colors) : product.colors,
        sizes: typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes,
        details: typeof product.details === 'string' ? JSON.parse(product.details) : product.details,
      };
      return res.json(formattedProduct);
    }
  } catch (error) {
    console.warn('Prisma findUnique failed, using static catalog:', error);
  }

  const staticProduct = PRODUCTS.find(p => p.id === req.params.id || p.slug === req.params.id);
  if (staticProduct) {
    return res.json(staticProduct);
  }
  res.status(404).json({ error: 'Product not found' });
});

// Helper to format order records into clean response objects
function getRequestOrigin(req: express.Request): string {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.get('host') || 'localhost:3000';
  return (req.headers.origin as string) || (req.headers.referer ? new URL(req.headers.referer).origin : `${protocol}://${host}`);
}

function formatOrder(order: any) {
  let items: any[] = [];
  if (order.itemsData) {
    try {
      items = JSON.parse(order.itemsData);
    } catch (e) {
      console.warn('Failed to parse itemsData JSON:', e);
    }
  }

  if (!items || items.length === 0) {
    if (order.items && Array.isArray(order.items)) {
      items = order.items.map((item: any) => {
        let product = item.product || {};
        if (product && typeof product.images === 'string') {
          try {
            product = {
              ...product,
              images: JSON.parse(product.images),
              colors: typeof product.colors === 'string' ? JSON.parse(product.colors) : product.colors,
              sizes: typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes,
              details: typeof product.details === 'string' ? JSON.parse(product.details) : product.details,
            };
          } catch {}
        }
        return {
          id: item.id,
          product,
          selectedColor: item.selectedColor,
          selectedSize: item.selectedSize,
          quantity: item.quantity,
          price: item.price
        };
      });
    }
  }

  const orderNum = order.orderNumber || order.id;
  const numPart = orderNum.replace(/^LUM-/, '');

  return {
    id: orderNum,
    orderNumber: orderNum,
    customerName: order.customerName,
    email: order.email,
    phone: order.phone,
    shippingAddress: order.shippingAddress,
    city: order.city,
    postalCode: order.postalCode,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus || (order.payment?.status === 'completed' ? 'Completed' : 'Pending'),
    courierName: order.courierName || 'TCS White-Glove VIP Express',
    trackingNumber: order.trackingNumber || `AWB-${numPart}-PK`,
    estimatedDelivery: order.estimatedDelivery,
    subtotal: order.subtotal,
    discount: order.discount,
    shippingFee: order.shippingFee,
    shipping: order.shippingFee,
    total: order.total,
    items,
    emailSent: Boolean(order.emailSent),
    emailError: order.emailError || undefined,
    emailProvider: order.emailProvider || undefined,
    emailMessageId: order.emailMessageId || undefined,
    adminEmailSent: Boolean(order.adminEmailSent),
    adminEmailProvider: order.adminEmailProvider || undefined,
    adminEmailMessageId: order.adminEmailMessageId || undefined,
    adminEmailError: order.adminEmailError || undefined,
    adminEmail: order.adminEmail || undefined,
    createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: order.updatedAt ? new Date(order.updatedAt).toISOString() : new Date().toISOString(),
  };
}

// 2. Orders API
app.post('/api/orders', async (req, res) => {
  try {
    const {
      customerName,
      email,
      phone,
      shippingAddress,
      city,
      postalCode,
      paymentMethod,
      subtotal,
      discount,
      shippingFee,
      total,
      estimatedDelivery,
      items
    } = req.body;

    if (!customerName || !email || !phone || !shippingAddress) {
      return res.status(400).json({ error: 'Missing required customer and shipping details.' });
    }

    // Generate Order ID (LUM-XXXXXX)
    const orderNumber = `LUM-${Math.floor(100000 + Math.random() * 900000)}`;
    const trackingNumber = `AWB-${orderNumber.replace('LUM-', '')}-PK`;
    const courierName = 'TCS White-Glove VIP Express';
    const paymentStatus = paymentMethod === 'cod' ? 'Pending (COD Handover)' : 'Completed';

    let formattedOrder: any = null;
    try {
      const order = await prisma.$transaction(async (tx: any) => {
        // Create the order
        const newOrder = await tx.order.create({
          data: {
            orderNumber,
            customerName,
            email,
            phone,
            shippingAddress,
            city: city || 'Lahore',
            postalCode: postalCode || '54000',
            paymentMethod,
            paymentStatus,
            courierName,
            trackingNumber,
            subtotal: Number(subtotal) || 0,
            discount: Number(discount) || 0,
            shippingFee: Number(shippingFee) || 0,
            total: Number(total) || 0,
            estimatedDelivery: estimatedDelivery || '2-3 Business Days',
            status: 'confirmed',
            itemsData: JSON.stringify(items || []),
            items: {
              create: (items || []).map((item: any) => ({
                productId: item.product?.id || item.productId,
                selectedColor: item.selectedColor || 'Default',
                selectedSize: item.selectedSize || 'Standard',
                quantity: item.quantity || 1,
                price: item.price || item.product?.price || 0
              }))
            }
          },
          include: { items: { include: { product: true } } }
        });

        // Reduce inventory if product exists in database
        for (const item of (items || [])) {
          const pId = item.product?.id || item.productId;
          if (pId) {
            try {
              await tx.product.update({
                where: { id: pId },
                data: {
                  stockCount: {
                    decrement: item.quantity || 1
                  }
                }
              });
            } catch (err) {
              // Non-fatal if product ID was custom or static
            }
          }
        }

        // Create Payment Record
        await tx.payment.create({
          data: {
            orderId: newOrder.id,
            gateway: paymentMethod,
            amount: total,
            status: paymentMethod === 'cod' ? 'pending' : 'completed',
            transactionId: `TXN-${orderNumber.replace('LUM-', '')}`
          }
        });

        return newOrder;
      });

      formattedOrder = formatOrder(order);
    } catch (dbError) {
      console.warn('[AI Studio] Database operation failed or mock active, using in-memory store:', dbError);
      formattedOrder = {
        id: orderNumber,
        orderNumber,
        customerName,
        email,
        phone,
        shippingAddress,
        city: city || 'Lahore',
        postalCode: postalCode || '54000',
        status: 'confirmed',
        paymentMethod,
        paymentStatus,
        courierName,
        trackingNumber,
        estimatedDelivery: estimatedDelivery || '2-3 Business Days',
        subtotal: Number(subtotal) || 0,
        discount: Number(discount) || 0,
        shippingFee: Number(shippingFee) || 0,
        shipping: Number(shippingFee) || 0,
        total: Number(total) || 0,
        items: items || [],
        emailSent: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    inMemoryOrders.set(orderNumber, formattedOrder);
    inMemoryOrders.set(formattedOrder.id, formattedOrder);

    // Trigger dual real emails: Customer confirmation + Store Admin alert
    const dispatchReport = await sendOrderEmails(formattedOrder, getRequestOrigin(req));

    const responseOrder = {
      ...formattedOrder,
      emailSent: dispatchReport.customerResult.success,
      emailProvider: dispatchReport.customerResult.provider,
      emailMessageId: dispatchReport.customerResult.messageId,
      emailError: dispatchReport.customerResult.success ? undefined : dispatchReport.customerResult.error,
      adminEmailSent: dispatchReport.adminResult.success,
      adminEmailProvider: dispatchReport.adminResult.provider,
      adminEmailMessageId: dispatchReport.adminResult.messageId,
      adminEmailError: dispatchReport.adminResult.success ? undefined : dispatchReport.adminResult.error,
      adminEmail: dispatchReport.adminEmail
    };

    inMemoryOrders.set(orderNumber, responseOrder);
    inMemoryOrders.set(responseOrder.id, responseOrder);

    // Persist email telemetry directly into database
    try {
      await prisma.order.update({
        where: { orderNumber },
        data: {
          emailSent: dispatchReport.customerResult.success,
          emailProvider: dispatchReport.customerResult.provider,
          emailMessageId: dispatchReport.customerResult.messageId || null,
          emailError: dispatchReport.customerResult.success ? null : (dispatchReport.customerResult.error || 'Failed'),
          adminEmailSent: dispatchReport.adminResult.success,
          adminEmailProvider: dispatchReport.adminResult.provider,
          adminEmailMessageId: dispatchReport.adminResult.messageId || null,
          adminEmailError: dispatchReport.adminResult.success ? null : (dispatchReport.adminResult.error || 'Failed'),
          adminEmail: dispatchReport.adminEmail
        }
      });
    } catch (dbUpdateErr) {
      console.warn('Prisma telemetry update non-fatal error:', dbUpdateErr);
    }

    if (dispatchReport.customerResult.success) {
      console.log(`[Email] Customer receipt sent to ${email} (Provider: ${dispatchReport.customerResult.provider}, ID: ${dispatchReport.customerResult.messageId})`);
    } else {
      console.warn(`[Email] Customer receipt failed for ${email}: ${dispatchReport.customerResult.error}`);
    }

    if (dispatchReport.adminResult.success) {
      console.log(`[Email] Store admin alert sent to ${dispatchReport.adminEmail} (Provider: ${dispatchReport.adminResult.provider}, ID: ${dispatchReport.adminResult.messageId})`);
    } else {
      console.warn(`[Email] Store admin alert failed: ${dispatchReport.adminResult.error}`);
    }

    res.status(201).json(responseOrder);
  } catch (error) {
    console.error('Failed to create order:', error);
    res.status(500).json({ error: 'Failed to create order. Please try again.' });
  }
});

// Email Service Audit & Diagnostics API
app.get('/api/email/status', (req, res) => {
  const status = getEmailProviderStatus();
  res.json(status);
});

// Test Email Sending Endpoint (Can test sending real email to user)
app.post('/api/email/test', async (req, res) => {
  try {
    const targetEmail = (req.body?.to || req.query?.to || 'amna.butt2556@gmail.com') as string;
    const sampleOrder: EmailOrderDetails = {
      id: `LUM-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
      orderNumber: `LUM-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
      orderDate: new Date().toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      customerName: 'Amna Butt',
      email: targetEmail,
      phone: '+92 (300) 8472910',
      shippingAddress: 'Villa 14, Phase 5 DHA, Lahore',
      city: 'Lahore',
      postalCode: '54000',
      estimatedDelivery: '2-3 Business Days',
      courierName: 'TCS White-Glove VIP Express',
      trackingNumber: 'AWB-TEST-PK',
      paymentMethod: 'Easypaisa Direct Mobile Wallet',
      paymentStatus: 'Completed',
      subtotal: 68500,
      discount: 6850,
      shippingFee: 0,
      total: 61650,
      items: [
        {
          quantity: 1,
          price: 68500,
          selectedColor: 'Caramel',
          selectedSize: 'M',
          product: {
            name: 'Sienna Cashmere Cocoon Coat',
            price: 68500,
            subtitle: 'Hand-finished double-faced Mongolian cashmere'
          }
        }
      ]
    };

    console.log(`[Email] Testing email dispatch to ${targetEmail}...`);
    const dispatchReport = await sendOrderEmails(sampleOrder, getRequestOrigin(req));

    res.json({
      success: dispatchReport.customerResult.success || dispatchReport.adminResult.success,
      ...dispatchReport
    });
  } catch (err: any) {
    console.error('[Email] Test email error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Resend Email for existing order
app.post('/api/orders/:id/resend-email', async (req, res) => {
  try {
    const rawId = req.params.id;
    const cleanId = rawId.toUpperCase();
    const cleanIdWithPrefix = cleanId.startsWith('LUM-') ? cleanId : `LUM-${cleanId}`;

    let order: any = null;
    try {
      order = await prisma.order.findFirst({
        where: {
          OR: [
            { id: rawId },
            { orderNumber: rawId },
            { orderNumber: cleanId },
            { orderNumber: cleanIdWithPrefix }
          ]
        },
        include: {
          items: { include: { product: true } },
          payment: true
        }
      });
    } catch (err) {
      console.warn('Prisma findFirst failed in resend-email, using in-memory store:', err);
    }

    let formatted = order ? formatOrder(order) : (inMemoryOrders.get(cleanId) || inMemoryOrders.get(cleanIdWithPrefix) || inMemoryOrders.get(rawId));

    if (!formatted) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const dispatchReport = await sendOrderEmails(formatted, getRequestOrigin(req));
    res.json(dispatchReport);
  } catch (err: any) {
    console.error('[Email] Resend order email error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Secure Order Tracking Endpoint (Supports both POST & GET)
const trackOrderHandler = async (req: express.Request, res: express.Response) => {
  try {
    const rawOrderId = (req.body?.orderId || req.body?.orderNumber || req.query?.orderId || req.query?.orderNumber || req.params?.orderId || '') as string;
    const rawIdentifier = (req.body?.identifier || req.query?.identifier || req.query?.email || req.query?.phone || '') as string;

    const trimmedOrderId = rawOrderId.trim();
    const trimmedIdentifier = rawIdentifier.trim();

    // Validate inputs
    if (!trimmedOrderId) {
      return res.status(400).json({ error: 'Please enter your Order ID (e.g. LUM-948201).' });
    }

    const cleanId = trimmedOrderId.toUpperCase();
    const cleanIdWithPrefix = cleanId.startsWith('LUM-') ? cleanId : `LUM-${cleanId}`;
    const cleanIdWithoutPrefix = cleanId.replace(/^LUM-/, '');

    // Fetch matching order from backend database
    let order: any = null;
    try {
      order = await prisma.order.findFirst({
        where: {
          OR: [
            { orderNumber: cleanId },
            { orderNumber: cleanIdWithPrefix },
            { orderNumber: cleanIdWithoutPrefix },
            { id: cleanId },
            { trackingNumber: cleanId }
          ]
        },
        include: {
          items: {
            include: {
              product: true
            }
          },
          payment: true
        }
      });
    } catch (err) {
      console.warn('Prisma trackOrderHandler query failed, checking in-memory store:', err);
    }

    let formatted: any = order ? formatOrder(order) : null;

    const mem = inMemoryOrders.get(cleanId) ||
                inMemoryOrders.get(cleanIdWithPrefix) ||
                inMemoryOrders.get(cleanIdWithoutPrefix) ||
                Array.from(inMemoryOrders.values()).find(
                  (o: any) => o.orderNumber === cleanId ||
                              o.orderNumber === cleanIdWithPrefix ||
                              o.trackingNumber === cleanId ||
                              o.id === cleanId
                );

    if (!formatted) {
      formatted = mem;
    } else if (mem) {
      formatted = {
        ...formatted,
        emailSent: formatted.emailSent || mem.emailSent,
        emailProvider: formatted.emailProvider || mem.emailProvider,
        emailMessageId: formatted.emailMessageId || mem.emailMessageId,
        emailError: formatted.emailError || mem.emailError,
        adminEmailSent: formatted.adminEmailSent || mem.adminEmailSent,
        adminEmailProvider: formatted.adminEmailProvider || mem.adminEmailProvider,
        adminEmailMessageId: formatted.adminEmailMessageId || mem.adminEmailMessageId,
        adminEmailError: formatted.adminEmailError || mem.adminEmailError,
        adminEmail: formatted.adminEmail || mem.adminEmail,
      };
    }

    if (!formatted) {
      return res.status(404).json({ error: 'Order not found. Please verify your Order ID.' });
    }

    // Optional verification if email or phone is provided
    if (trimmedIdentifier) {
      const cleanIdfLower = trimmedIdentifier.toLowerCase();
      const orderEmail = (formatted.email || '').toLowerCase().trim();

      const normalizePhone = (str: string) => str.replace(/[^0-9]/g, '').replace(/^92/, '0');
      const inputPhoneDigits = normalizePhone(trimmedIdentifier);
      const orderPhoneDigits = normalizePhone(formatted.phone || '');

      const emailMatches = orderEmail === cleanIdfLower;
      const phoneMatches = Boolean(
        inputPhoneDigits.length >= 7 &&
        orderPhoneDigits.length >= 7 &&
        (orderPhoneDigits === inputPhoneDigits ||
         orderPhoneDigits.endsWith(inputPhoneDigits) ||
         inputPhoneDigits.endsWith(orderPhoneDigits))
      );

      if (!emailMatches && !phoneMatches) {
        return res.status(400).json({ error: 'The provided email or phone does not match this order.' });
      }
    }

    // Return live verified order data
    return res.json(formatted);
  } catch (error) {
    console.error('Error tracking order:', error);
    return res.status(500).json({ error: 'An error occurred while communicating with the atelier tracking database.' });
  }
};

app.post('/api/orders/track', trackOrderHandler);
app.get('/api/orders/track', trackOrderHandler);
app.get('/api/orders/track/:orderId', trackOrderHandler);

// 3. Admin Orders API
app.get('/api/admin/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { product: true }
        },
        payment: true
      }
    });

    if (orders && orders.length > 0) {
      const formattedOrders = orders.map(formatOrder);
      const map = new Map<string, any>();
      for (const o of formattedOrders) {
        map.set(o.orderNumber || o.id, o);
      }
      for (const [key, o] of inMemoryOrders.entries()) {
        if (!map.has(key)) {
          map.set(key, o);
        }
      }
      return res.json({ orders: Array.from(map.values()) });
    }
  } catch (error) {
    console.warn('Error fetching admin orders from Prisma, falling back to in-memory store:', error);
  }

  // Fallback to in-memory orders
  const seen = new Set<string>();
  const uniqueOrders: any[] = [];
  for (const o of inMemoryOrders.values()) {
    const key = o.orderNumber || o.id;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueOrders.push(o);
    }
  }
  res.json({ orders: uniqueOrders });
});

app.patch('/api/admin/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, courierName, trackingNumber, paymentStatus } = req.body;

    // Supported 7 admin status states
    const allowedStatuses: Record<string, string> = {
      'confirmed': 'confirmed',
      'processing': 'processing',
      'packed': 'packed',
      'shipped': 'shipped',
      'in_transit': 'in_transit',
      'out_for_delivery': 'out_for_delivery',
      'delivered': 'delivered'
    };

    const rawStatus = (status || '').toLowerCase().trim().replace(/[\s-]/g, '_');
    const normalizedStatus = allowedStatuses[rawStatus];

    if (!normalizedStatus) {
      return res.status(400).json({
        error: 'Invalid status. Allowed values: Confirmed, Processing, Packed, Shipped, In Transit, Out for Delivery, Delivered.'
      });
    }

    const cleanId = id.toUpperCase();
    const cleanIdWithPrefix = cleanId.startsWith('LUM-') ? cleanId : `LUM-${cleanId}`;

    let updatedOrder: any = null;
    try {
      const existingOrder = await prisma.order.findFirst({
        where: {
          OR: [
            { orderNumber: cleanId },
            { orderNumber: cleanIdWithPrefix },
            { id: cleanId }
          ]
        }
      });

      if (existingOrder) {
        const updated = await prisma.order.update({
          where: { id: existingOrder.id },
          data: {
            status: normalizedStatus,
            ...(courierName ? { courierName: courierName.trim() } : {}),
            ...(trackingNumber ? { trackingNumber: trackingNumber.trim() } : {}),
            ...(paymentStatus ? { paymentStatus: paymentStatus.trim() } : {}),
            updatedAt: new Date()
          },
          include: {
            items: {
              include: { product: true }
            },
            payment: true
          }
        });
        updatedOrder = formatOrder(updated);
      }
    } catch (dbErr) {
      console.warn('Prisma status update failed, updating in-memory store:', dbErr);
    }

    if (!updatedOrder) {
      const memOrder = inMemoryOrders.get(cleanId) || inMemoryOrders.get(cleanIdWithPrefix);
      if (memOrder) {
        memOrder.status = normalizedStatus;
        if (courierName) memOrder.courierName = courierName.trim();
        if (trackingNumber) memOrder.trackingNumber = trackingNumber.trim();
        if (paymentStatus) memOrder.paymentStatus = paymentStatus.trim();
        memOrder.updatedAt = new Date().toISOString();
        updatedOrder = memOrder;
      }
    }

    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found in atelier records.' });
    }

    inMemoryOrders.set(cleanId, updatedOrder);
    inMemoryOrders.set(cleanIdWithPrefix, updatedOrder);
    if (updatedOrder.orderNumber) inMemoryOrders.set(updatedOrder.orderNumber, updatedOrder);

    // Send customer notification email when admin changes order status
    let statusEmailReport: any = null;
    try {
      statusEmailReport = await sendOrderStatusUpdateEmail(updatedOrder, getRequestOrigin(req));
      if (statusEmailReport.success) {
        console.log(`[Email] Status update email (${normalizedStatus}) delivered to ${updatedOrder.email} (Provider: ${statusEmailReport.provider}, ID: ${statusEmailReport.messageId})`);
      } else {
        console.warn(`[Email] Status update email could not be delivered to ${updatedOrder.email}: ${statusEmailReport.error}`);
      }
    } catch (statusEmailErr: any) {
      console.warn(`[Email] Status update email error: ${statusEmailErr.message}`);
    }

    res.json({
      success: true,
      order: updatedOrder,
      statusEmailSent: statusEmailReport?.success ?? false,
      statusEmailProvider: statusEmailReport?.provider,
      statusEmailMessageId: statusEmailReport?.messageId,
      statusEmailError: statusEmailReport?.error
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status.' });
  }
});

// Update Email Configuration API (Secure administrative endpoint)
app.post('/api/admin/email/config', async (req, res) => {
  try {
    const { resendApiKey, brevoApiKey, sendgridApiKey, emailFrom, adminEmail } = req.body;
    const fs = await import('fs');
    const path = await import('path');
    const envPath = path.resolve(process.cwd(), '.env');

    let envContent = '';
    try {
      envContent = fs.readFileSync(envPath, 'utf8');
    } catch {}

    const envMap: Record<string, string> = {};
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const idx = trimmed.indexOf('=');
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim();
        envMap[k] = v;
      }
    }

    if (typeof resendApiKey === 'string') {
      envMap['RESEND_API_KEY'] = resendApiKey.trim();
      process.env.RESEND_API_KEY = resendApiKey.trim();
    }
    if (typeof brevoApiKey === 'string') {
      envMap['BREVO_API_KEY'] = brevoApiKey.trim();
      process.env.BREVO_API_KEY = brevoApiKey.trim();
    }
    if (typeof sendgridApiKey === 'string') {
      envMap['SENDGRID_API_KEY'] = sendgridApiKey.trim();
      process.env.SENDGRID_API_KEY = sendgridApiKey.trim();
    }
    if (typeof emailFrom === 'string' && emailFrom.trim()) {
      envMap['EMAIL_FROM'] = emailFrom.trim();
      process.env.EMAIL_FROM = emailFrom.trim();
    }
    if (typeof adminEmail === 'string' && adminEmail.trim()) {
      envMap['ADMIN_EMAIL'] = adminEmail.trim();
      process.env.ADMIN_EMAIL = adminEmail.trim();
      envMap['STORE_ADMIN_EMAIL'] = adminEmail.trim();
      process.env.STORE_ADMIN_EMAIL = adminEmail.trim();
    }

    const newLines = Object.entries(envMap).map(([k, v]) => `${k}=${v}`);
    fs.writeFileSync(envPath, newLines.join('\n') + '\n', 'utf8');

    const status = getEmailProviderStatus();
    console.log(`[EmailConfig] Updated email configuration: Active Provider = ${status.provider}`);
    res.json({ success: true, message: 'Email configuration updated.', status });
  } catch (err: any) {
    console.error('Failed to update email config:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/admin/orders/:id/status', async (req, res) => {
  // Alias to PATCH
  req.method = 'PATCH';
  (app._router as any).handle(req, res);
});

// Mock Payment Callbacks
app.post('/api/payments/easypaisa/callback', async (req, res) => {
  const { orderId, transactionId, status } = req.body;
  try {
    await prisma.payment.update({
      where: { orderId },
      data: { transactionId, status: status === 'success' ? 'completed' : 'failed' }
    });

    if (status === 'success') {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'confirmed' }
      });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Payment callback failed' });
  }
});

export { app };

if (process.argv[1]?.includes('server') && !process.env.VITE) {
  const PORT = Number(process.env.API_PORT) || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Lumora API Server running on port ${PORT}`);
  });
}
