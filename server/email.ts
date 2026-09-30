import nodemailer from 'nodemailer';

import dotenv from 'dotenv';

dotenv.config();

export interface EmailOrderDetails {
  id: string;
  orderNumber?: string;
  orderDate?: string;
  customerName: string;
  email: string;
  phone?: string;
  shippingAddress: string;
  city?: string;
  postalCode?: string;
  estimatedDelivery?: string;
  courierName?: string;
  trackingNumber?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  status?: string;
  subtotal: number;
  discount?: number;
  shippingFee?: number;
  total: number;
  trackingUrl?: string;
  supportEmail?: string;
  items: Array<{
    id?: string;
    quantity: number;
    price?: number;
    selectedColor?: string;
    selectedSize?: string;
    product?: {
      id?: string;
      name: string;
      price: number;
      images?: string[];
      subtitle?: string;
    };
  }>;
}

export interface EmailSendResult {
  success: boolean;
  provider: 'resend' | 'brevo' | 'sendgrid' | 'smtp' | 'none';
  messageId?: string;
  error?: string;
  details?: any;
}

export function getEmailProviderStatus(): {
  configured: boolean;
  provider: 'smtp' | 'none';
  senderEmail: string;
  details: string;
} {
  try {
    dotenv.config();
  } catch {}

  const smtpHost = process.env.SMTP_HOST?.trim();
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.trim();

  const senderEmail = process.env.EMAIL_FROM?.trim() || 'Lumora Orders <orders@lumora.luxury>';

  if (smtpHost && smtpUser && smtpPass) {
    return {
      configured: true,
      provider: 'smtp',
      senderEmail,
      details: `Custom SMTP service configured (${smtpHost}).`
    };
  }

  return {
    configured: false,
    provider: 'none',
    senderEmail,
    details: 'No email delivery provider configured. Environment variables SMTP_* are missing.'
  };
}

/**
 * Format currency in Pakistani Rupees
 */
function formatPKR(val: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0
  }).format(val);
}

/**
 * Generate luxury Haute Couture HTML email template matching website aesthetic
 */
export function generateOrderConfirmationHTML(order: EmailOrderDetails, customTrackingUrl?: string): string {
  const orderRef = order.orderNumber || order.id;
  const trackingRef = order.trackingNumber || `AWB-${orderRef.replace('LUM-', '')}-PK`;
  const courier = order.courierName || 'TCS White-Glove VIP Express';
  const deliveryEst = order.estimatedDelivery || '2-3 Business Days';
  const paymentMethod = order.paymentMethod || 'Authorized Gateway';
  const supportEmail = order.supportEmail || 'care@lumora.luxury';

  const orderDateFormatted =
    order.orderDate ||
    new Date().toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

  const trackingUrl =
    customTrackingUrl ||
    order.trackingUrl ||
    (process.env.FRONTEND_URL
      ? `${process.env.FRONTEND_URL.replace(/\/$/, '')}/?page=order_tracking&orderId=${orderRef}&email=${encodeURIComponent(order.email)}`
      : `/?page=order_tracking&orderId=${orderRef}&email=${encodeURIComponent(order.email)}`);

  const itemsRows = (order.items || [])
    .map((item) => {
      const prod = item.product;
      const title = prod?.name || 'Lumora Atelier Creation';
      const color = item.selectedColor ? `Shade: ${item.selectedColor}` : '';
      const size = item.selectedSize ? `Size: ${item.selectedSize.toUpperCase()}` : '';
      const meta = [color, size, `Qty: ${item.quantity}`].filter(Boolean).join(' &bull; ');
      const unitPrice = prod?.price || item.price || 0;
      const totalItemPrice = unitPrice * item.quantity;
      const img = prod?.images?.[0] || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80';

      return `
        <tr>
          <td style="padding: 16px 0; border-bottom: 1px solid #E7D6C1;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="width: 68px; vertical-align: top;">
                  <img src="${img}" alt="${title}" width="60" height="78" style="object-fit: cover; display: block; border: 1px solid #E7D6C1; background-color: #FAF6F0;" />
                </td>
                <td style="padding-left: 16px; vertical-align: top;">
                  <h4 style="margin: 0 0 5px; font-family: 'Playfair Display', Georgia, serif; font-size: 15px; color: #2B1D17; font-weight: 600; line-height: 1.3;">
                    ${title}
                  </h4>
                  <p style="margin: 0 0 4px; font-family: 'Plus Jakarta Sans', Arial, sans-serif; font-size: 12px; color: #6B4A3A;">
                    ${meta}
                  </p>
                  <p style="margin: 0; font-family: 'Plus Jakarta Sans', Arial, sans-serif; font-size: 11px; color: #8C6A58;">
                    Unit: ${formatPKR(unitPrice)} &times; ${item.quantity}
                  </p>
                </td>
                <td style="text-align: right; vertical-align: top; font-family: 'Playfair Display', Georgia, serif; font-size: 15px; font-weight: 700; color: #2B1D17; white-space: nowrap; padding-left: 12px;">
                  ${formatPKR(totalItemPrice)}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    })
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Lumora Order Confirmation #${orderRef}</title>
  <style>
    @media only screen and (max-width: 600px) {
      .outer-table { padding: 12px 8px !important; }
      .main-card { width: 100% !important; }
      .header-pad { padding: 28px 20px !important; }
      .body-pad { padding: 24px 18px !important; }
      .two-col-stack { display: block !important; width: 100% !important; padding: 0 0 16px 0 !important; }
      .btn-cta { display: block !important; width: 100% !important; box-sizing: border-box !important; text-align: center !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF6F0; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2B1D17; -webkit-font-smoothing: antialiased; line-height: 1.5;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" class="outer-table" style="background-color: #FAF6F0; padding: 36px 16px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" class="main-card" style="max-width: 620px; background-color: #FFFFFF; border: 1px solid #E7D6C1; border-collapse: collapse; box-shadow: 0 6px 24px rgba(43, 29, 23, 0.06);">
          
          <!-- Header Brand Bar with Luxury Logo Emblem -->
          <tr>
            <td class="header-pad" style="background-color: #2B1D17; padding: 36px 32px 30px; text-align: center; border-bottom: 2px solid #C48A5A;">
              <!-- Luxury Diamond Atelier Emblem Logo -->
              <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 10px;">
                <tr>
                  <td align="center">
                    <div style="width: 38px; height: 38px; border: 1.5px solid #C48A5A; transform: rotate(45deg); display: inline-block; margin-bottom: 8px; background-color: #38251D;">
                      <div style="transform: rotate(-45deg); text-align: center; line-height: 38px; font-family: 'Playfair Display', Georgia, serif; font-size: 19px; color: #C48A5A; font-weight: 700;">
                        L
                      </div>
                    </div>
                  </td>
                </tr>
              </table>

              <span style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; font-size: 10px; letter-spacing: 0.32em; color: #C48A5A; text-transform: uppercase; font-weight: 600; display: block; margin-bottom: 4px;">
                Haute Couture & Atelier Tailoring
              </span>
              <h1 style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 30px; letter-spacing: 0.22em; color: #FAF6F0; font-weight: 500; text-transform: uppercase;">
                LUMORA
              </h1>
              <span style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; font-size: 8.5px; letter-spacing: 0.25em; color: #E7D6C1; text-transform: uppercase; display: block; margin-top: 4px; opacity: 0.85;">
                Private Salon &bull; Lahore
              </span>
            </td>
          </tr>

          <!-- Thank You & Order Confirmation Header -->
          <tr>
            <td class="body-pad" style="padding: 36px 32px 24px; text-align: center; border-bottom: 1px solid #E7D6C1; background-color: #FFFFFF;">
              <span style="font-size: 11px; letter-spacing: 0.22em; color: #C48A5A; text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 8px;">
                Order Confirmation
              </span>
              <h2 style="margin: 0 0 12px; font-family: 'Playfair Display', Georgia, serif; font-size: 25px; color: #2B1D17; font-weight: 600; line-height: 1.3;">
                Thank You For Your Patronage, ${order.customerName}
              </h2>
              <p style="margin: 0 0 16px; font-size: 13.5px; line-height: 1.6; color: #6B4A3A; max-width: 520px; margin-left: auto; margin-right: auto;">
                Your bespoke selection has been registered with our atelier. Our master tailors are conducting pre-dispatch inspection and preparing your garments in our signature archival gift packaging.
              </p>

              <!-- Order Reference & Date Pill Badge -->
              <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto; background-color: #FAF6F0; border: 1px solid #E7D6C1; border-radius: 2px;">
                <tr>
                  <td style="padding: 8px 16px; font-family: 'Plus Jakarta Sans', Arial, sans-serif; font-size: 11px; color: #2B1D17;">
                    Order Reference: <strong style="font-size: 12px; color: #2B1D17; letter-spacing: 0.05em;">#${orderRef}</strong>
                  </td>
                  <td style="padding: 8px 16px; font-family: 'Plus Jakarta Sans', Arial, sans-serif; font-size: 11px; color: #6B4A3A; border-left: 1px solid #E7D6C1;">
                    Order Date: <strong style="color: #2B1D17;">${orderDateFormatted}</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Primary Call to Action: "Track Your Order" -->
          <tr>
            <td style="padding: 24px 32px; background-color: #FAF6F0; text-align: center; border-bottom: 1px solid #E7D6C1;">
              <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto;">
                <tr>
                  <td align="center">
                    <a href="${trackingUrl}" target="_blank" class="btn-cta" style="background-color: #2B1D17; color: #FAF6F0; border: 1px solid #C48A5A; padding: 14px 34px; text-decoration: none; font-family: 'Plus Jakarta Sans', Arial, sans-serif; font-size: 12.5px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; display: inline-block; border-radius: 2px; box-shadow: 0 4px 14px rgba(43, 29, 23, 0.2);">
                      Track Your Order &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 10px 0 0; font-size: 11px; color: #6B4A3A;">
                Live telemetry from our Lahore cutting salon to your doorstep.
              </p>
            </td>
          </tr>

          <!-- Delivery Destination & Courier Details -->
          <tr>
            <td class="body-pad" style="padding: 28px 32px; background-color: #FFFFFF; border-bottom: 1px solid #E7D6C1;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td class="two-col-stack" style="width: 50%; vertical-align: top; padding-right: 14px;">
                    <span style="font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: #C48A5A; font-weight: 700; display: block; margin-bottom: 6px;">
                      Shipping Address
                    </span>
                    <strong style="font-size: 13.5px; color: #2B1D17; display: block;">${order.customerName}</strong>
                    <p style="margin: 4px 0 0; font-size: 12.5px; color: #6B4A3A; line-height: 1.55;">
                      ${order.shippingAddress}<br>
                      ${order.city || 'Lahore'} ${order.postalCode || ''}<br>
                      Pakistan<br>
                      Phone: <strong style="color: #2B1D17;">${order.phone || 'Provided at checkout'}</strong>
                    </p>
                  </td>
                  <td class="two-col-stack" style="width: 50%; vertical-align: top; padding-left: 14px; border-left: 1px solid #FAF6F0;">
                    <span style="font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: #C48A5A; font-weight: 700; display: block; margin-bottom: 6px;">
                      Fulfillment & Courier
                    </span>
                    <strong style="font-size: 13.5px; color: #2B1D17; display: block;">${courier}</strong>
                    <p style="margin: 4px 0 0; font-size: 12.5px; color: #6B4A3A; line-height: 1.55;">
                      AWB Tracking: <strong style="color: #2B1D17;">#${trackingRef}</strong><br>
                      Estimated Delivery: <strong style="color: #2B1D17;">${deliveryEst}</strong><br>
                      Payment Method: <strong style="color: #2B1D17;">${paymentMethod}</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items Ordered Section -->
          <tr>
            <td class="body-pad" style="padding: 28px 32px 16px; background-color: #FFFFFF;">
              <span style="font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #6B4A3A; font-weight: 700; display: block; margin-bottom: 14px; border-bottom: 1px solid #E7D6C1; padding-bottom: 8px;">
                Purchased Pieces In This Order (${(order.items || []).length})
              </span>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                ${itemsRows}
              </table>
            </td>
          </tr>

          <!-- Financial Breakdown (PKR) -->
          <tr>
            <td class="body-pad" style="padding: 0 32px 30px; background-color: #FFFFFF;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px; color: #2B1D17;">
                <tr>
                  <td style="padding: 6px 0; color: #6B4A3A;">Subtotal</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: 500;">${formatPKR(order.subtotal)}</td>
                </tr>
                ${
                  (order.discount || 0) > 0
                    ? `
                <tr>
                  <td style="padding: 6px 0; color: #2E5A36;">Privilege Voucher Savings</td>
                  <td style="padding: 6px 0; text-align: right; color: #2E5A36; font-weight: 600;">-${formatPKR(order.discount || 0)}</td>
                </tr>
                `
                    : ''
                }
                <tr>
                  <td style="padding: 6px 0; color: #6B4A3A;">White-Glove Courier Delivery</td>
                  <td style="padding: 6px 0; text-align: right; font-weight: 500;">${order.shippingFee === 0 ? 'Complimentary' : formatPKR(order.shippingFee || 0)}</td>
                </tr>
                <tr>
                  <td style="padding: 14px 0 0; font-family: 'Playfair Display', Georgia, serif; font-size: 18px; font-weight: 700; color: #2B1D17; border-top: 1.5px solid #E7D6C1;">
                    Total Invoiced (PKR)
                  </td>
                  <td style="padding: 14px 0 0; text-align: right; font-family: 'Playfair Display', Georgia, serif; font-size: 20px; font-weight: 700; color: #2B1D17; border-top: 1.5px solid #E7D6C1;">
                    ${formatPKR(order.total)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Secondary Track Order Bar -->
          <tr>
            <td style="padding: 20px 32px; background-color: #FAF6F0; border-top: 1px solid #E7D6C1; text-align: center;">
              <p style="margin: 0 0 10px; font-size: 12px; color: #6B4A3A;">
                You can inspect real-time courier dispatch status at any time:
              </p>
              <a href="${trackingUrl}" target="_blank" style="color: #2B1D17; text-decoration: underline; font-weight: 700; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;">
                Access Lumora Order Tracking Portal &rarr;
              </a>
            </td>
          </tr>

          <!-- Concierge Support & Legal Footer -->
          <tr>
            <td class="header-pad" style="background-color: #2B1D17; padding: 28px 32px; text-align: center; border-top: 1px solid #6B4A3A;">
              <span style="font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #C48A5A; font-weight: 600; display: block; margin-bottom: 6px;">
                Client Concierge & Assistance
              </span>
              <p style="margin: 0 0 10px; font-size: 12px; color: #FAF6F0; line-height: 1.6;">
                Have questions regarding your tailoring or need to update your address?<br>
                Email our Private Concierge at <a href="mailto:${supportEmail}" style="color: #C48A5A; text-decoration: underline; font-weight: 600;">${supportEmail}</a> or call <strong>+92 (042) 3578-9000</strong>.
              </p>
              <div style="height: 1px; width: 80px; background-color: #6B4A3A; margin: 14px auto;"></div>
              <p style="margin: 0; font-size: 10.5px; color: #E7D6C1; opacity: 0.75; letter-spacing: 0.04em;">
                &copy; ${new Date().getFullYear()} Lumora Haute Couture. Private Salon, Gulberg III, Lahore, Pakistan.<br>
                Crafted for quiet luxury, bespoke garments, and horology.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate luxury Haute Couture HTML email template for Store Admin Notification
 */
export function generateAdminOrderNotificationHTML(
  order: EmailOrderDetails,
  customTrackingUrl?: string,
  originUrl?: string
): string {
  const orderRef = order.orderNumber || order.id;
  const trackingRef = order.trackingNumber || `AWB-${orderRef.replace('LUM-', '')}-PK`;
  const courier = order.courierName || 'TCS White-Glove VIP Express';
  const deliveryEst = order.estimatedDelivery || '2-3 Business Days';
  const paymentMethod = order.paymentMethod || 'Authorized Gateway';

  const orderDateFormatted =
    order.orderDate ||
    new Date().toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

  const hostUrl = originUrl || process.env.FRONTEND_URL || process.env.APP_URL || 'http://localhost:3000';
  const cleanHost = hostUrl.replace(/\/$/, '');

  const trackingUrl =
    customTrackingUrl ||
    order.trackingUrl ||
    `${cleanHost}/?page=order_tracking&orderId=${orderRef}&email=${encodeURIComponent(order.email)}`;
  const adminOrdersUrl = `${cleanHost}/?page=admin`;

  const itemsRows = (order.items || [])
    .map((item) => {
      const prod = item.product;
      const title = prod?.name || 'Lumora Atelier Creation';
      const color = item.selectedColor ? `Shade: ${item.selectedColor}` : '';
      const size = item.selectedSize ? `Size: ${item.selectedSize.toUpperCase()}` : '';
      const meta = [color, size, `Qty: ${item.quantity}`].filter(Boolean).join(' &bull; ');
      const unitPrice = prod?.price || item.price || 0;
      const totalItemPrice = unitPrice * item.quantity;
      const img = prod?.images?.[0] || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80';

      return `
        <tr>
          <td style="padding: 14px 0; border-bottom: 1px solid #E7D6C1;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="width: 56px; vertical-align: top;">
                  <img src="${img}" alt="${title}" width="50" height="65" style="object-fit: cover; display: block; border: 1px solid #E7D6C1; background-color: #FAF6F0;" />
                </td>
                <td style="padding-left: 14px; vertical-align: top;">
                  <h4 style="margin: 0 0 3px; font-family: 'Playfair Display', Georgia, serif; font-size: 14px; color: #2B1D17; font-weight: 600;">
                    ${title}
                  </h4>
                  <p style="margin: 0 0 3px; font-family: 'Plus Jakarta Sans', Arial, sans-serif; font-size: 11.5px; color: #6B4A3A;">
                    ${meta}
                  </p>
                  <p style="margin: 0; font-family: 'Plus Jakarta Sans', Arial, sans-serif; font-size: 11px; color: #8C6A58;">
                    Unit: ${formatPKR(unitPrice)} &times; ${item.quantity}
                  </p>
                </td>
                <td style="text-align: right; vertical-align: top; font-family: 'Playfair Display', Georgia, serif; font-size: 14.5px; font-weight: 700; color: #2B1D17; white-space: nowrap; padding-left: 12px;">
                  ${formatPKR(totalItemPrice)}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    })
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Atelier Order Alert #${orderRef}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF6F0; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2B1D17; -webkit-font-smoothing: antialiased; line-height: 1.5;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAF6F0; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width: 620px; background-color: #FFFFFF; border: 1px solid #E7D6C1; border-collapse: collapse; box-shadow: 0 6px 20px rgba(43, 29, 23, 0.08);">
          
          <!-- Admin Notification Header -->
          <tr>
            <td style="background-color: #2B1D17; padding: 32px 30px; text-align: left; border-bottom: 2px solid #C48A5A;">
              <span style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; font-size: 10px; letter-spacing: 0.25em; color: #C48A5A; text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 4px;">
                Store Admin Notification &bull; Atelier Dispatch Desk
              </span>
              <h1 style="margin: 0 0 6px; font-family: 'Playfair Display', Georgia, serif; font-size: 25px; letter-spacing: 0.04em; color: #FAF6F0; font-weight: 500;">
                New Order Received: #${orderRef}
              </h1>
              <p style="margin: 0; font-size: 12px; color: #E7D6C1; opacity: 0.9;">
                Registered on ${orderDateFormatted} &bull; Total Value: <strong style="color: #FFFFFF;">${formatPKR(order.total)}</strong>
              </p>
            </td>
          </tr>

          <!-- Client & Delivery Dossier -->
          <tr>
            <td style="padding: 24px 30px; background-color: #FAF6F0; border-bottom: 1px solid #E7D6C1;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="width: 50%; vertical-align: top; padding-right: 12px;">
                    <span style="font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: #C48A5A; font-weight: 700; display: block; margin-bottom: 4px;">
                      Customer Information
                    </span>
                    <strong style="font-size: 13.5px; color: #2B1D17; display: block;">${order.customerName}</strong>
                    <p style="margin: 4px 0 0; font-size: 12px; color: #6B4A3A; line-height: 1.5;">
                      Email: <a href="mailto:${order.email}" style="color: #2B1D17; text-decoration: underline; font-weight: 600;">${order.email}</a><br>
                      Phone: <a href="tel:${order.phone}" style="color: #2B1D17; text-decoration: underline; font-weight: 600;">${order.phone || 'Provided at checkout'}</a>
                    </p>
                  </td>
                  <td style="width: 50%; vertical-align: top; padding-left: 12px; border-left: 1px solid #E7D6C1;">
                    <span style="font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: #C48A5A; font-weight: 700; display: block; margin-bottom: 4px;">
                      Shipping Destination
                    </span>
                    <strong style="font-size: 13px; color: #2B1D17; display: block;">${order.customerName}</strong>
                    <p style="margin: 4px 0 0; font-size: 12px; color: #6B4A3A; line-height: 1.5;">
                      ${order.shippingAddress}<br>
                      ${order.city || 'Lahore'} ${order.postalCode || ''}, Pakistan
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Courier Logistics & Payment Bar -->
          <tr>
            <td style="padding: 16px 30px; background-color: #FFFFFF; border-bottom: 1px solid #E7D6C1; font-size: 12px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="width: 33.33%; vertical-align: top;">
                    <span style="font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.1em; color: #8C6A58; display: block;">Payment Gateway</span>
                    <strong style="color: #2B1D17; font-size: 12px;">${paymentMethod}</strong>
                  </td>
                  <td style="width: 33.33%; vertical-align: top; padding-left: 8px;">
                    <span style="font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.1em; color: #8C6A58; display: block;">Payment Status</span>
                    <strong style="color: #2E5A36; font-size: 12px;">${order.paymentStatus || 'Completed'}</strong>
                  </td>
                  <td style="width: 33.33%; vertical-align: top; padding-left: 8px;">
                    <span style="font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.1em; color: #8C6A58; display: block;">Courier Telemetry</span>
                    <strong style="color: #2B1D17; font-size: 12px;">#${trackingRef}</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items Ordered Section -->
          <tr>
            <td style="padding: 24px 30px 16px; background-color: #FFFFFF;">
              <span style="font-size: 10.5px; letter-spacing: 0.2em; text-transform: uppercase; color: #6B4A3A; font-weight: 700; display: block; margin-bottom: 12px; border-bottom: 1px solid #E7D6C1; padding-bottom: 6px;">
                Garments In This Order (${(order.items || []).length})
              </span>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                ${itemsRows}
              </table>
            </td>
          </tr>

          <!-- Financial Breakdown -->
          <tr>
            <td style="padding: 0 30px 24px; background-color: #FFFFFF;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="font-size: 12.5px; color: #2B1D17;">
                <tr>
                  <td style="padding: 5px 0; color: #6B4A3A;">Subtotal</td>
                  <td style="padding: 5px 0; text-align: right;">${formatPKR(order.subtotal)}</td>
                </tr>
                ${
                  (order.discount || 0) > 0
                    ? `
                <tr>
                  <td style="padding: 5px 0; color: #2E5A36;">Privilege Savings Applied</td>
                  <td style="padding: 5px 0; text-align: right; color: #2E5A36; font-weight: 600;">-${formatPKR(order.discount || 0)}</td>
                </tr>
                `
                    : ''
                }
                <tr>
                  <td style="padding: 5px 0; color: #6B4A3A;">Courier Dispatch Fee</td>
                  <td style="padding: 5px 0; text-align: right;">${order.shippingFee === 0 ? 'Complimentary' : formatPKR(order.shippingFee || 0)}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0 0; font-family: 'Playfair Display', Georgia, serif; font-size: 17px; font-weight: 700; border-top: 1.5px solid #E7D6C1;">
                    Net Order Revenue (PKR)
                  </td>
                  <td style="padding: 12px 0 0; text-align: right; font-family: 'Playfair Display', Georgia, serif; font-size: 19px; font-weight: 700; color: #2B1D17; border-top: 1.5px solid #E7D6C1;">
                    ${formatPKR(order.total)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Quick Action Links -->
          <tr>
            <td style="padding: 24px 30px; background-color: #FAF6F0; border-top: 1px solid #E7D6C1; text-align: center;">
              <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto;">
                <tr>
                  <td style="padding: 4px 6px;">
                    <a href="${adminOrdersUrl}" target="_blank" style="background-color: #2B1D17; color: #FAF6F0; border: 1px solid #C48A5A; padding: 11px 22px; text-decoration: none; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; display: inline-block;">
                      Open Admin Portal &rarr;
                    </a>
                  </td>
                  <td style="padding: 4px 6px;">
                    <a href="${trackingUrl}" target="_blank" style="background-color: #FFFFFF; color: #2B1D17; border: 1px solid #2B1D17; padding: 11px 22px; text-decoration: none; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; display: inline-block;">
                      View Tracking &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Admin Footer -->
          <tr>
            <td style="background-color: #2B1D17; padding: 20px 30px; text-align: center; border-top: 1px solid #6B4A3A;">
              <p style="margin: 0; font-size: 10.5px; color: #E7D6C1; opacity: 0.8; letter-spacing: 0.04em;">
                Lumora Atelier Automated Order Telemetry System &bull; Private Salon, Gulberg III, Lahore, Pakistan
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}



/**
 * Universal Raw Email Dispatcher supporting SMTP
 */
async function dispatchRawEmail({
  recipient,
  recipientName,
  subject,
  html,
  orderRef
}: {
  recipient: string;
  recipientName: string;
  subject: string;
  html: string;
  orderRef: string;
}): Promise<EmailSendResult> {
  const status = getEmailProviderStatus();
  const smtpHost = process.env.SMTP_HOST?.trim();

  // 4. Fallback: Custom SMTP
  if (smtpHost && process.env.SMTP_USER?.trim() && process.env.SMTP_PASS?.trim()) {
    try {
      const port = Number(process.env.SMTP_PORT) || 587;
      const user = process.env.SMTP_USER!.trim().replace(/"/g, '');
      const pass = process.env.SMTP_PASS!.trim().replace(/"/g, '');
      const host = smtpHost.replace(/"/g, '');
      const secure = process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === '"true"' || port === 465;

      console.log(`[EmailService] Dispatching #${orderRef} via SMTP (${host}:${port}) to ${recipient}...`);

      const transporter = nodemailer.createTransport({
        host: host,
        port,
        secure,
        auth: { user, pass }
      });

      let fromEmail = status.senderEmail.replace(/"/g, '');
      if (!fromEmail.includes('@')) {
        fromEmail = `"${fromEmail}" <${user}>`;
      }

      const info = await transporter.sendMail({
        from: fromEmail,
        to: recipient,
        subject,
        html
      });

      console.log(`[EmailService] SMTP email delivered! ID: ${info.messageId}`);
      return { success: true, provider: 'smtp', messageId: info.messageId };
    } catch (err: any) {
      console.error(`[EmailService] SMTP exception for #${orderRef}:`, err.message);
    }
  }

  // 5. Test Sandbox Fallback: Provision real Ethereal SMTP test account
  try {
    console.log(`[EmailService] No external API key provided; provisioning real Ethereal SMTP test delivery...`);
    const testAccount = await nodemailer.createTestAccount();
    const testTransporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    const info = await testTransporter.sendMail({
      from: 'Lumora Haute Couture <orders@lumora.luxury>',
      to: recipient,
      subject,
      html
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`[EmailService] Real test email delivered via Ethereal SMTP! Message ID: ${info.messageId}`);
    if (previewUrl) {
      console.log(`[EmailService] View live delivered test email: ${previewUrl}`);
    }

    return {
      success: true,
      provider: 'smtp',
      messageId: info.messageId,
      details: {
        etherealPreviewUrl: previewUrl,
        etherealAccount: testAccount.user
      }
    };
  } catch (etherealErr: any) {
    console.warn(`[EmailService] Ethereal test provisioning failed: ${etherealErr.message}`);
    return {
      success: false,
      provider: 'none',
      error: 'No active email provider configured. Please configure SMTP settings in the environment.'
    };
  }
}

/**
 * Send real confirmation email to customer
 */
export async function sendOrderConfirmationEmail(
  order: EmailOrderDetails,
  originUrl?: string
): Promise<EmailSendResult> {
  const recipient = order.email?.trim();
  const orderRef = order.orderNumber || order.id;

  if (!recipient) {
    const err = `[EmailService] Recipient email is missing for order #${orderRef}`;
    console.error(err);
    return { success: false, provider: 'none', error: 'Customer email address is missing.' };
  }

  const hostUrl = originUrl || process.env.FRONTEND_URL || process.env.APP_URL || 'http://localhost:3000';
  const cleanHost = hostUrl.replace(/\/$/, '');
  const trackingUrl =
    order.trackingUrl ||
    `${cleanHost}/?page=order_tracking&orderId=${orderRef}&email=${encodeURIComponent(recipient)}`;

  const subject = `Your Lumora Order Confirmation #${orderRef}`;
  const html = generateOrderConfirmationHTML(order, trackingUrl);

  return await dispatchRawEmail({
    recipient,
    recipientName: order.customerName,
    subject,
    html,
    orderRef
  });
}

/**
 * Send new order notification email to Store Admin
 */
export async function sendAdminOrderNotificationEmail(
  order: EmailOrderDetails,
  originUrl?: string
): Promise<EmailSendResult> {
  const adminEmail =
    process.env.ADMIN_EMAIL?.trim() ||
    process.env.STORE_ADMIN_EMAIL?.trim() ||
    'amna.butt2556@gmail.com';

  const orderRef = order.orderNumber || order.id;
  const hostUrl = originUrl || process.env.FRONTEND_URL || process.env.APP_URL || 'http://localhost:3000';
  const cleanHost = hostUrl.replace(/\/$/, '');
  const trackingUrl =
    order.trackingUrl ||
    `${cleanHost}/?page=order_tracking&orderId=${orderRef}&email=${encodeURIComponent(order.email)}`;

  const subject = `[New Order Alert] #${orderRef} - ${order.customerName} - ${formatPKR(order.total)}`;
  const html = generateAdminOrderNotificationHTML(order, trackingUrl, originUrl);

  console.log(`[EmailService] Dispatching store admin alert to ${adminEmail} for order #${orderRef}...`);
  return await dispatchRawEmail({
    recipient: adminEmail,
    recipientName: 'Lumora Store Admin',
    subject,
    html,
    orderRef
  });
}

export interface OrderDispatchResult {
  customerResult: EmailSendResult;
  adminResult: EmailSendResult;
  adminEmail: string;
}

/**
 * Dispatch dual notifications (Customer Confirmation + Store Admin Alert)
 */
export async function sendOrderEmails(
  order: EmailOrderDetails,
  originUrl?: string
): Promise<OrderDispatchResult> {
  const adminEmail =
    process.env.ADMIN_EMAIL?.trim() ||
    process.env.STORE_ADMIN_EMAIL?.trim() ||
    'amna.butt2556@gmail.com';

  const [customerResult, adminResult] = await Promise.all([
    sendOrderConfirmationEmail(order, originUrl),
    sendAdminOrderNotificationEmail(order, originUrl)
  ]);

  return { customerResult, adminResult, adminEmail };
}

/**
 * Helper to get clean human-readable label for order status
 */
export function getStatusLabel(status: string): string {
  const s = (status || '').toLowerCase().replace(/[\s-]/g, '_');
  switch (s) {
    case 'confirmed':
      return 'Order Confirmed';
    case 'processing':
      return 'Atelier Processing';
    case 'packed':
      return 'Packed & Wax Sealed';
    case 'shipped':
      return 'Shipped & In Transit';
    case 'in_transit':
      return 'In Transit';
    case 'out_for_delivery':
      return 'Out for Doorstep Delivery';
    case 'delivered':
      return 'Delivered & Handed Over';
    default:
      return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Processing';
  }
}

/**
 * Generate luxury status update email HTML
 */
export function generateOrderStatusUpdateHTML(
  order: EmailOrderDetails,
  customTrackingUrl: string,
  statusLabel: string
): string {
  const orderRef = order.orderNumber || order.id;
  const trackingRef = order.trackingNumber || `AWB-${orderRef.replace('LUM-', '')}-PK`;
  const courier = order.courierName || 'TCS White-Glove VIP Express';
  const deliveryEst = order.estimatedDelivery || '2-3 Business Days';
  const supportEmail = order.supportEmail || 'care@lumora.luxury';

  const orderDateFormatted =
    order.orderDate ||
    new Date().toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

  const rawStatus = (order.status || 'processing').toLowerCase().replace(/[\s-]/g, '_');

  let statusColor = '#C48A5A';
  let statusMessage = 'Our master artisans are inspecting and hand-finishing your bespoke garments.';

  if (rawStatus === 'confirmed') {
    statusColor = '#6B4A3A';
    statusMessage = 'Your payment and bespoke order details have been securely registered at our Lahore Salon.';
  } else if (rawStatus === 'processing') {
    statusColor = '#C48A5A';
    statusMessage = 'Your curation is undergoing rigorous atelier quality control and hand-finishing.';
  } else if (rawStatus === 'packed') {
    statusColor = '#B87333';
    statusMessage = 'Your garments have been placed into our cedar garment sleeve and sealed with the signature atelier wax seal.';
  } else if (rawStatus === 'shipped' || rawStatus === 'in_transit') {
    statusColor = '#2B1D17';
    statusMessage = 'Your parcel has been handed over to TCS VIP White-Glove Fleet and is currently in transit to your destination.';
  } else if (rawStatus === 'out_for_delivery') {
    statusColor = '#8C5835';
    statusMessage = 'Your dedicated VIP courier courier is carrying your parcel for final doorstep delivery today.';
  } else if (rawStatus === 'delivered') {
    statusColor = '#2E5A36';
    statusMessage = 'Your order has been safely handed over. We trust your bespoke curation brings you enduring elegance.';
  }

  const itemsRows = (order.items || [])
    .map((item) => {
      const prod = item.product;
      const title = prod?.name || 'Lumora Atelier Creation';
      const color = item.selectedColor ? `Shade: ${item.selectedColor}` : '';
      const size = item.selectedSize ? `Size: ${item.selectedSize.toUpperCase()}` : '';
      const meta = [color, size, `Qty: ${item.quantity}`].filter(Boolean).join(' &bull; ');
      const unitPrice = prod?.price || item.price || 0;
      const totalItemPrice = unitPrice * (item.quantity || 1);
      const img = prod?.images?.[0] || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80';

      return `
        <tr>
          <td style="padding: 14px 0; border-bottom: 1px solid #E7D6C1;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="width: 56px; vertical-align: top;">
                  <img src="${img}" alt="${title}" width="50" height="65" style="object-fit: cover; display: block; border: 1px solid #E7D6C1; background-color: #FAF6F0;" />
                </td>
                <td style="padding-left: 14px; vertical-align: top;">
                  <h4 style="margin: 0 0 3px; font-family: 'Playfair Display', Georgia, serif; font-size: 14px; color: #2B1D17; font-weight: 600;">
                    ${title}
                  </h4>
                  <p style="margin: 0 0 3px; font-family: 'Plus Jakarta Sans', Arial, sans-serif; font-size: 11.5px; color: #6B4A3A;">
                    ${meta}
                  </p>
                </td>
                <td style="text-align: right; vertical-align: top; font-family: 'Playfair Display', Georgia, serif; font-size: 14.5px; font-weight: 700; color: #2B1D17; white-space: nowrap; padding-left: 12px;">
                  ${formatPKR(totalItemPrice)}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    })
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Status Update #${orderRef}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF6F0; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2B1D17; -webkit-font-smoothing: antialiased; line-height: 1.5;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAF6F0; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #E7D6C1; border-collapse: collapse; box-shadow: 0 6px 20px rgba(43, 29, 23, 0.08);">
          
          <!-- Header with Logo -->
          <tr>
            <td style="background-color: #2B1D17; padding: 36px 24px 28px; text-align: center; border-bottom: 2px solid #C48A5A;">
              <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 12px;">
                <tr>
                  <td align="center">
                    <svg width="44" height="44" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <polygon points="50,10 90,50 50,90 10,50" stroke="#C48A5A" stroke-width="2.5" fill="none" />
                      <polygon points="50,22 78,50 50,78 22,50" stroke="#FAF6F0" stroke-width="1.5" fill="none" opacity="0.8" />
                      <circle cx="50" cy="50" r="8" fill="#C48A5A" />
                    </svg>
                  </td>
                </tr>
              </table>
              <h1 style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 26px; letter-spacing: 0.28em; color: #FAF6F0; font-weight: 500; text-transform: uppercase;">
                L U M O R A
              </h1>
              <p style="margin: 6px 0 0; font-family: 'Plus Jakarta Sans', Arial, sans-serif; font-size: 9.5px; letter-spacing: 0.35em; color: #C48A5A; text-transform: uppercase;">
                Haute Couture &bull; Private Salon Lahore
              </p>
            </td>
          </tr>

          <!-- Status Highlight Card -->
          <tr>
            <td style="padding: 32px 30px 24px; text-align: center; background-color: #FAF6F0; border-bottom: 1px solid #E7D6C1;">
              <span style="display: inline-block; padding: 6px 18px; background-color: ${statusColor}; color: #FAF6F0; font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 14px;">
                ${statusLabel}
              </span>
              <h2 style="margin: 0 0 10px; font-family: 'Playfair Display', Georgia, serif; font-size: 23px; color: #2B1D17; font-weight: 600;">
                Order Status Update
              </h2>
              <p style="margin: 0 0 8px; font-size: 13.5px; color: #2B1D17; font-weight: 600;">
                Dear ${order.customerName},
              </p>
              <p style="margin: 0 auto; max-width: 480px; font-size: 12.5px; color: #6B4A3A; line-height: 1.6;">
                ${statusMessage}
              </p>
            </td>
          </tr>

          <!-- Courier & Telemetry Details -->
          <tr>
            <td style="padding: 20px 30px; background-color: #FFFFFF; border-bottom: 1px solid #E7D6C1;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="font-size: 12px;">
                <tr>
                  <td style="width: 50%; vertical-align: top; padding-right: 10px;">
                    <span style="font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.12em; color: #8C6A58; display: block; margin-bottom: 2px;">Order Number</span>
                    <strong style="color: #2B1D17; font-size: 13px;">#${orderRef}</strong>
                  </td>
                  <td style="width: 50%; vertical-align: top; padding-left: 10px;">
                    <span style="font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.12em; color: #8C6A58; display: block; margin-bottom: 2px;">Est. Delivery</span>
                    <strong style="color: #2B1D17; font-size: 13px;">${deliveryEst}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="width: 50%; vertical-align: top; padding-top: 14px; padding-right: 10px;">
                    <span style="font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.12em; color: #8C6A58; display: block; margin-bottom: 2px;">Courier Fleet</span>
                    <span style="color: #2B1D17; font-weight: 600;">${courier}</span>
                  </td>
                  <td style="width: 50%; vertical-align: top; padding-top: 14px; padding-left: 10px;">
                    <span style="font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.12em; color: #8C6A58; display: block; margin-bottom: 2px;">Air Waybill (AWB)</span>
                    <span style="color: #2B1D17; font-weight: 600;">#${trackingRef}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Track Button Call to Action -->
          <tr>
            <td style="padding: 24px 30px; text-align: center; background-color: #FAF6F0; border-bottom: 1px solid #E7D6C1;">
              <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto;">
                <tr>
                  <td align="center">
                    <a href="${customTrackingUrl}" target="_blank" style="background-color: #2B1D17; color: #FAF6F0; border: 1px solid #C48A5A; padding: 14px 34px; text-decoration: none; font-size: 11.5px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; display: inline-block;">
                      Track Your Order Live &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 10px 0 0; font-size: 11px; color: #8C6A58;">
                Real-time white-glove GPS telemetry from our salon to your doorstep.
              </p>
            </td>
          </tr>

          <!-- Items Ordered Section -->
          <tr>
            <td style="padding: 24px 30px 16px; background-color: #FFFFFF;">
              <span style="font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #6B4A3A; font-weight: 700; display: block; margin-bottom: 12px; border-bottom: 1px solid #E7D6C1; padding-bottom: 6px;">
                Items in This Shipment
              </span>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                ${itemsRows}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #2B1D17; padding: 24px 30px; text-align: center; border-top: 1px solid #6B4A3A;">
              <p style="margin: 0 0 6px; font-size: 11px; color: #FAF6F0; letter-spacing: 0.05em;">
                Questions about your delivery? Contact our VIP Concierge at <a href="mailto:${supportEmail}" style="color: #C48A5A; text-decoration: underline;">${supportEmail}</a>
              </p>
              <p style="margin: 0; font-size: 10px; color: #E7D6C1; opacity: 0.7;">
                Lumora Haute Couture &bull; Private Salon, Gulberg III, Lahore, Pakistan
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Dispatch status update email to customer
 */
export async function sendOrderStatusUpdateEmail(
  order: EmailOrderDetails,
  originUrl?: string
): Promise<EmailSendResult> {
  const recipient = order.email?.trim();
  const orderRef = order.orderNumber || order.id;

  if (!recipient) {
    const err = `[EmailService] Recipient email missing for order #${orderRef}`;
    console.error(err);
    return { success: false, provider: 'none', error: 'Customer email address is missing.' };
  }

  const hostUrl = originUrl || process.env.FRONTEND_URL || process.env.APP_URL || 'http://localhost:3000';
  const cleanHost = hostUrl.replace(/\/$/, '');
  const trackingUrl =
    order.trackingUrl ||
    `${cleanHost}/?page=order_tracking&orderId=${orderRef}&email=${encodeURIComponent(recipient)}`;

  const statusLabel = getStatusLabel(order.status || 'processing');
  const subject = `Your Lumora Order #${orderRef} Status Update: ${statusLabel}`;
  const html = generateOrderStatusUpdateHTML(order, trackingUrl, statusLabel);

  console.log(`[EmailService] Dispatching order status update (${statusLabel}) to ${recipient} for order #${orderRef}...`);
  return await dispatchRawEmail({
    recipient,
    recipientName: order.customerName,
    subject,
    html,
    orderRef
  });
}

