import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import {
  getEmailStatus,
  updateEmailConfig,
  sendTestEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
  sendAdminVerificationEmail,
  sendPasswordResetEmail,
} from './email.js';

// On Vercel Serverless environment, SQLite files must be writable in /tmp
if (process.env.VERCEL && (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('file:'))) {
  const tmpDbPath = '/tmp/dev.db';
  const originalDbPath = path.resolve(process.cwd(), 'prisma/dev.db');
  if (!fs.existsSync(tmpDbPath) && fs.existsSync(originalDbPath)) {
    try {
      fs.copyFileSync(originalDbPath, tmpDbPath);
    } catch (e) {
      console.warn('Failed to copy SQLite database to /tmp:', e);
    }
  }
  process.env.DATABASE_URL = `file:${tmpDbPath}`;
}

const prisma = new PrismaClient();
const app = express();

const JWT_SECRET = process.env.JWT_SECRET || 'lumora_secret_jwt_atelier_signature_key_2026';

// Bootstrap initial verified admin account automatically on start
async function bootstrapAdminAccount() {
  try {
    const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // 1. Ensure default admin@lumora.luxury has a valid hash and is verified
    const luxuryAdmin = await prisma.user.findUnique({
      where: { email: 'admin@lumora.luxury' },
    });
    if (!luxuryAdmin) {
      await prisma.user.create({
        data: {
          email: 'admin@lumora.luxury',
          password: hashedPassword,
          firstName: 'Lumora',
          lastName: 'Admin',
          role: 'ADMIN',
          isVerified: true,
        },
      });
    } else if (luxuryAdmin.password.includes('Placeholder') || luxuryAdmin.password.includes('Epz1VlC./t2Xk.QZk/Q/a')) {
      await prisma.user.update({
        where: { id: luxuryAdmin.id },
        data: {
          password: hashedPassword,
          role: 'ADMIN',
          isVerified: true,
        },
      });
    }

    // 2. Ensure owner email from environment (e.g. amna.butt2556@gmail.com) exists and is verified
    const ownerEmail = (process.env.ADMIN_EMAIL || process.env.STORE_ADMIN_EMAIL || '').trim().toLowerCase();
    if (ownerEmail && ownerEmail !== 'admin@lumora.luxury') {
      const existingOwner = await prisma.user.findUnique({
        where: { email: ownerEmail },
      });
      if (!existingOwner) {
        await prisma.user.create({
          data: {
            email: ownerEmail,
            password: hashedPassword,
            firstName: 'Amna',
            lastName: 'Butt',
            role: 'ADMIN',
            isVerified: true,
          },
        });
        console.log(`[Lumora Auth] Verified owner account provisioned: ${ownerEmail}`);
      } else if (!existingOwner.isVerified || existingOwner.password.includes('Placeholder') || existingOwner.password.includes('Epz1VlC./t2Xk.QZk/Q/a')) {
        await prisma.user.update({
          where: { id: existingOwner.id },
          data: {
            password: hashedPassword,
            role: 'ADMIN',
            isVerified: true,
          },
        });
      }
    }
  } catch (err) {
    console.warn('[Lumora Auth] Bootstrap check notice:', err);
  }
}

bootstrapAdminAccount();

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

// Helper: Format DB order into frontend Order interface
function formatOrderResponse(dbOrder: any) {
  let parsedItems = [];
  try {
    if (dbOrder.itemsData) {
      parsedItems = JSON.parse(dbOrder.itemsData);
    } else if (dbOrder.items && Array.isArray(dbOrder.items)) {
      parsedItems = dbOrder.items.map((it: any) => ({
        id: it.id,
        product: it.product || {
          id: it.productId,
          name: 'Lumora Item',
          price: it.price,
          images: [],
        },
        selectedColor: it.selectedColor,
        selectedSize: it.selectedSize,
        quantity: it.quantity,
        price: it.price,
      }));
    }
  } catch (e) {
    console.warn('Error parsing itemsData for order:', dbOrder.id, e);
  }

  return {
    id: dbOrder.orderNumber || dbOrder.id,
    orderNumber: dbOrder.orderNumber || dbOrder.id,
    customerName: dbOrder.customerName,
    email: dbOrder.email,
    phone: dbOrder.phone,
    shippingAddress: dbOrder.shippingAddress,
    city: dbOrder.city || 'Lahore',
    postalCode: dbOrder.postalCode || '54000',
    status: dbOrder.status || 'placed',
    paymentMethod: dbOrder.paymentMethod,
    paymentStatus: dbOrder.paymentStatus || 'Completed',
    courierName: dbOrder.courierName || 'TCS White-Glove VIP Express',
    trackingNumber: dbOrder.trackingNumber || `AWB-${dbOrder.orderNumber || dbOrder.id}-PK`,
    subtotal: dbOrder.subtotal,
    discount: dbOrder.discount || 0,
    shipping: dbOrder.shippingFee || 0,
    shippingFee: dbOrder.shippingFee || 0,
    total: dbOrder.total,
    estimatedDelivery: dbOrder.estimatedDelivery,
    items: parsedItems,
    emailSent: dbOrder.emailSent ?? false,
    emailProvider: dbOrder.emailProvider,
    emailMessageId: dbOrder.emailMessageId,
    emailError: dbOrder.emailError,
    createdAt: dbOrder.createdAt ? new Date(dbOrder.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: dbOrder.updatedAt ? new Date(dbOrder.updatedAt).toISOString() : new Date().toISOString(),
  };
}

// Authentication middleware for admin routes
function authenticateAdminToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Administrative token required.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET) as any;
    req.admin = verified;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired administrative token.' });
  }
}

// ==========================================
// EMAIL AUDIT & CONFIGURATION ROUTES
// ==========================================

app.get('/api/email/status', (req, res) => {
  const status = getEmailStatus();
  res.json(status);
});

app.post('/api/email/test', async (req, res) => {
  try {
    const { to } = req.body;
    if (!to || typeof to !== 'string' || !to.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid recipient email required.' });
    }

    const result = await sendTestEmail(to);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Internal test dispatch failure.' });
  }
});

app.post('/api/admin/email/config', (req, res) => {
  try {
    const { resendApiKey, brevoApiKey, sendgridApiKey, emailFrom, adminEmail } = req.body;
    updateEmailConfig({ resendApiKey, brevoApiKey, sendgridApiKey, emailFrom, adminEmail });
    const status = getEmailStatus();
    res.json({ success: true, status });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to update config.' });
  }
});

// ==========================================
// ORDERS & TRACKING ROUTES
// ==========================================

app.get('/api/admin/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });
    res.json({ orders: orders.map(formatOrderResponse) });
  } catch (err: any) {
    console.error('Failed to query orders:', err);
    res.status(500).json({ error: 'Database query failed for orders.', orders: [] });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const data = req.body;
    const count = await prisma.order.count();
    const orderNumber = `LUM-${(948200 + count + 1).toString()}`;

    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        customerName: data.customerName || 'Esteemed Patron',
        email: data.email,
        phone: data.phone || '',
        shippingAddress: data.shippingAddress || '',
        city: data.city || 'Lahore',
        postalCode: data.postalCode || '54000',
        paymentMethod: data.paymentMethod || 'cash_on_delivery',
        paymentStatus: data.paymentMethod === 'cod' ? 'Pending' : 'Completed',
        courierName: 'TCS White-Glove VIP Express',
        trackingNumber: `AWB-${orderNumber}-PK`,
        subtotal: Number(data.subtotal) || 0,
        discount: Number(data.discount) || 0,
        shippingFee: Number(data.shippingFee) || 0,
        total: Number(data.total) || 0,
        estimatedDelivery: data.estimatedDelivery || '3-5 Business Days',
        itemsData: JSON.stringify(data.items || []),
        status: 'placed',
      },
    });

    // Attempt real email dispatch to customer
    let emailResult = { success: false, provider: 'none', messageId: '', error: '' };
    try {
      emailResult = await sendOrderConfirmationEmail({
        ...newOrder,
        items: data.items || [],
      }) as any;

      await prisma.order.update({
        where: { id: newOrder.id },
        data: {
          emailSent: emailResult.success,
          emailProvider: emailResult.provider,
          emailMessageId: emailResult.messageId || null,
          emailError: emailResult.error || null,
        },
      });
    } catch (mailErr: any) {
      console.warn('Order confirmation email failed:', mailErr);
    }

    const responseOrder = formatOrderResponse({
      ...newOrder,
      emailSent: emailResult.success,
      emailProvider: emailResult.provider,
      emailMessageId: emailResult.messageId,
      emailError: emailResult.error,
    });

    res.json(responseOrder);
  } catch (err: any) {
    console.error('Order creation failed:', err);
    res.status(500).json({ error: err.message || 'Failed to place order in database.' });
  }
});

app.post('/api/orders/:id/resend-email', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    let items = [];
    try {
      items = JSON.parse(order.itemsData || '[]');
    } catch {}

    const result = await sendOrderConfirmationEmail({
      ...order,
      items,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        emailSent: result.success,
        emailProvider: result.provider,
        emailMessageId: result.messageId || null,
        emailError: result.error || null,
      },
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to resend confirmation email.' });
  }
});

app.post('/api/orders/track', async (req, res) => {
  try {
    const { orderId, identifier } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required.' });
    }

    const cleanId = orderId.trim();
    const cleanIdent = identifier ? identifier.trim().toLowerCase() : '';

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: cleanId },
          { id: cleanId },
          { trackingNumber: cleanId },
        ],
      },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found. Please verify your Order ID.' });
    }

    if (cleanIdent && !order.email.toLowerCase().includes(cleanIdent) && !order.phone.includes(cleanIdent)) {
      // Optional loose match check
    }

    res.json(formatOrderResponse(order));
  } catch (err: any) {
    console.error('Order track error:', err);
    res.status(500).json({ error: 'Tracking service error.' });
  }
});

app.patch('/api/admin/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, courierName, trackingNumber, paymentStatus } = req.body;

    const existing = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    const updated = await prisma.order.update({
      where: { id: existing.id },
      data: {
        ...(status ? { status } : {}),
        ...(courierName ? { courierName } : {}),
        ...(trackingNumber ? { trackingNumber } : {}),
        ...(paymentStatus ? { paymentStatus } : {}),
      },
      include: { items: true },
    });

    // Notify customer when status progresses
    let statusEmailSent = false;
    let statusEmailProvider = 'none';
    let statusEmailMessageId = '';

    if (status && (status === 'shipped' || status === 'delivered' || status === 'confirmed')) {
      try {
        const mailRes = await sendOrderStatusEmail(
          updated,
          status,
          courierName || updated.courierName,
          trackingNumber || updated.trackingNumber || undefined
        );
        statusEmailSent = mailRes.success;
        statusEmailProvider = mailRes.provider;
        statusEmailMessageId = mailRes.messageId || '';
      } catch (e) {
        console.warn('Status notification dispatch error:', e);
      }
    }

    res.json({
      success: true,
      order: formatOrderResponse(updated),
      statusEmailSent,
      statusEmailProvider,
      statusEmailMessageId,
    });
  } catch (err: any) {
    console.error('Update order status error:', err);
    res.status(500).json({ success: false, error: err.message || 'Status update failed.' });
  }
});

// ==========================================
// ADMIN AUTHENTICATION ROUTES
// ==========================================

app.get('/api/admin/auth/status', async (req, res) => {
  try {
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (!admin) {
      return res.json({
        hasOwner: false,
        isVerified: false,
      });
    }

    // Masked email for security
    const parts = admin.email.split('@');
    const masked = parts[0].slice(0, 2) + '***@' + parts[1];

    res.json({
      hasOwner: true,
      isVerified: admin.isVerified,
      ownerEmailMasked: masked,
      ownerName: `${admin.firstName} ${admin.lastName}`.trim(),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Auth status query failure.' });
  }
});

app.get('/api/admin/auth/me', authenticateAdminToken, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.admin.id },
    });

    if (!user) {
      return res.status(404).json({ error: 'Admin account not found.' });
    }

    res.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Account retrieval error.' });
  }
});

app.post('/api/admin/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findFirst({
      where: { email: cleanEmail, role: 'ADMIN' },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials or unregistered owner email.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials. Password mismatch.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        error: 'Owner credentials require verification.',
        requiresVerification: true,
        email: user.email,
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Authentication error.' });
  }
});

app.post('/api/admin/auth/signup', async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'All fields are mandatory.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    const hashedPassword = await bcrypt.hash(password, 10);
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || 'Store';
    const lastName = nameParts.slice(1).join(' ') || 'Owner';

    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          firstName,
          lastName,
          password: hashedPassword,
          role: 'ADMIN',
          isVerified: false,
          verificationCode,
          verificationExpires,
        },
      });
    } else {
      await prisma.user.create({
        data: {
          email: cleanEmail,
          password: hashedPassword,
          firstName,
          lastName,
          role: 'ADMIN',
          isVerified: false,
          verificationCode,
          verificationExpires,
        },
      });
    }

    // Dispatch verification code via email
    try {
      await sendAdminVerificationEmail(cleanEmail, verificationCode);
    } catch (e) {
      console.warn('Failed to send verification email:', e);
    }

    res.json({
      success: true,
      email: cleanEmail,
      verificationCodePreview: verificationCode,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Registration failure.' });
  }
});

app.post('/api/admin/auth/verify', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and verification passcode required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findFirst({
      where: { email: cleanEmail, role: 'ADMIN' },
    });

    if (!user) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    if (user.verificationCode !== code.trim()) {
      return res.status(400).json({ error: 'Invalid verification passcode.' });
    }

    if (user.verificationExpires && user.verificationExpires < new Date()) {
      return res.status(400).json({ error: 'Passcode expired. Please request a fresh code.' });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationCode: null,
        verificationExpires: null,
      },
    });

    const token = jwt.sign(
      { id: updated.id, email: updated.email, role: updated.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: updated.id,
        email: updated.email,
        firstName: updated.firstName,
        lastName: updated.lastName,
        role: updated.role,
        isVerified: true,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Verification failure.' });
  }
});

app.post('/api/admin/auth/resend-code', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findFirst({
      where: { email: cleanEmail, role: 'ADMIN' },
    });

    if (!user) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode,
        verificationExpires,
      },
    });

    await sendAdminVerificationEmail(cleanEmail, verificationCode);

    res.json({
      success: true,
      verificationCodePreview: verificationCode,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to dispatch passcode.' });
  }
});

app.post('/api/admin/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findFirst({
      where: { email: cleanEmail, role: 'ADMIN' },
    });

    if (!user) {
      return res.status(404).json({ error: 'No administrative account found for this email.' });
    }

    const resetToken = Math.random().toString(36).substring(2, 10).toUpperCase();
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpires,
      },
    });

    await sendPasswordResetEmail(cleanEmail, resetToken);

    res.json({
      success: true,
      resetTokenPreview: resetToken,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate reset link.' });
  }
});

app.post('/api/admin/auth/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword, confirmPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findFirst({
      where: { email: cleanEmail, role: 'ADMIN' },
    });

    if (!user) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    if (user.resetToken !== token.trim()) {
      return res.status(400).json({ error: 'Invalid reset token.' });
    }

    if (user.resetTokenExpires && user.resetTokenExpires < new Date()) {
      return res.status(400).json({ error: 'Reset token has expired.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Password reset failure.' });
  }
});

app.post('/api/admin/auth/logout', (req, res) => {
  res.json({ success: true });
});

// ==========================================
// PRODUCTION STATIC FILE SERVING & SPA ROUTING
// ==========================================
const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // SPA Catch-all: Route all non-API GET requests to index.html
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

export { app };

const isViteDev = process.argv.some(arg => arg.includes('vite'));
if (!isViteDev && !process.env.VERCEL) {
  const PORT = Number(process.env.PORT) || Number(process.env.API_PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Lumora Server] Production server listening on http://0.0.0.0:${PORT}`);
  });
}

export default app;
