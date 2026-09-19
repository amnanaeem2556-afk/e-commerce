import nodemailer from 'nodemailer';
import { Resend } from 'resend';

export interface EmailOrderDetails {
  id: string;
  orderNumber?: string;
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
  subtotal: number;
  discount?: number;
  shippingFee?: number;
  total: number;
  items: Array<{
    quantity: number;
    price?: number;
    selectedColor?: string;
    selectedSize?: string;
    product?: {
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

/**
 * Audit and report the active email service provider
 */
export function getEmailProviderStatus(): {
  configured: boolean;
  provider: 'resend' | 'brevo' | 'sendgrid' | 'smtp' | 'none';
  senderEmail: string;
  details: string;
} {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  const brevoKey = process.env.BREVO_API_KEY?.trim();
  const sendgridKey = process.env.SENDGRID_API_KEY?.trim();
  const smtpHost = process.env.SMTP_HOST?.trim();
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.trim();

  const senderEmail =
    process.env.EMAIL_FROM?.trim() ||
    (resendKey ? 'Lumora Haute Couture <onboarding@resend.dev>' : 'Lumora Orders <orders@lumora.luxury>');

  if (resendKey) {
    return {
      configured: true,
      provider: 'resend',
      senderEmail,
      details: 'Resend API service configured with RESEND_API_KEY.'
    };
  }

  if (brevoKey) {
    return {
      configured: true,
      provider: 'brevo',
      senderEmail,
      details: 'Brevo / Sendinblue SMTP API configured with BREVO_API_KEY.'
    };
  }

  if (sendgridKey) {
    return {
      configured: true,
      provider: 'sendgrid',
      senderEmail,
      details: 'SendGrid v3 Mail API configured with SENDGRID_API_KEY.'
    };
  }

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
    details: 'No email delivery provider configured. Environment variables RESEND_API_KEY, BREVO_API_KEY, SENDGRID_API_KEY, or SMTP_* are missing.'
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
 * Generate luxury Haute Couture HTML email template
 */
export function generateOrderConfirmationHTML(order: EmailOrderDetails): string {
  const orderRef = order.orderNumber || order.id;
  const trackingRef = order.trackingNumber || `AWB-${orderRef.replace('LUM-', '')}-PK`;
  const courier = order.courierName || 'TCS White-Glove VIP Express';
  const deliveryEst = order.estimatedDelivery || '2-4 Business Days';
  const paymentMethod = order.paymentMethod || 'Authorized Gateway';

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
                <td style="width: 64px; vertical-align: top;">
                  <img src="${img}" alt="${title}" width="56" height="72" style="object-fit: cover; display: block; border: 1px solid #E7D6C1;" />
                </td>
                <td style="padding-left: 16px; vertical-align: top;">
                  <h4 style="margin: 0 0 4px; font-family: 'Playfair Display', Georgia, serif; font-size: 15px; color: #2B1D17; font-weight: 600;">${title}</h4>
                  <p style="margin: 0; font-family: 'Plus Jakarta Sans', Arial, sans-serif; font-size: 12px; color: #6B4A3A;">${meta}</p>
                </td>
                <td style="text-align: right; vertical-align: top; font-family: 'Playfair Display', Georgia, serif; font-size: 15px; font-weight: 600; color: #2B1D17; white-space: nowrap;">
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
</head>
<body style="margin: 0; padding: 0; background-color: #FAF6F0; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2B1D17; -webkit-font-smoothing: antialiased;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAF6F0; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #E7D6C1; border-collapse: collapse;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #2B1D17; padding: 36px 32px; text-align: center;">
              <span style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; font-size: 10px; letter-spacing: 0.35em; color: #C48A5A; text-transform: uppercase; font-weight: 600; display: block; margin-bottom: 6px;">
                Haute Couture & Atelier Tailoring
              </span>
              <h1 style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 28px; letter-spacing: 0.2em; color: #FAF6F0; font-weight: 400; text-transform: uppercase;">
                LUMORA
              </h1>
            </td>
          </tr>

          <!-- Confirmation Hero -->
          <tr>
            <td style="padding: 36px 32px 24px; text-align: center; border-bottom: 1px solid #E7D6C1;">
              <span style="font-size: 11px; letter-spacing: 0.25em; color: #C48A5A; text-transform: uppercase; font-weight: 600; display: block; margin-bottom: 8px;">
                Order Confirmed &bull; Reference #${orderRef}
              </span>
              <h2 style="margin: 0 0 12px; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; color: #2B1D17; font-weight: 500;">
                Thank You For Your Patronage, ${order.customerName}
              </h2>
              <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #6B4A3A;">
                Your bespoke garment selection has been registered with our Lahore atelier salon. Our master tailors are currently performing pre-dispatch inspection and silk-wrapped packaging.
              </p>
            </td>
          </tr>

          <!-- Telemetry & Shipping Summary -->
          <tr>
            <td style="padding: 28px 32px; background-color: #FAF6F0; border-bottom: 1px solid #E7D6C1;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="width: 50%; vertical-align: top; padding-right: 12px;">
                    <span style="font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: #6B4A3A; font-weight: 600; display: block; margin-bottom: 4px;">
                      Delivery Destination
                    </span>
                    <strong style="font-size: 13px; color: #2B1D17; display: block;">${order.customerName}</strong>
                    <p style="margin: 4px 0 0; font-size: 12px; color: #6B4A3A; line-height: 1.5;">
                      ${order.shippingAddress}<br>
                      ${order.city || 'Lahore'} ${order.postalCode || ''}<br>
                      Phone: ${order.phone || 'Provided'}
                    </p>
                  </td>
                  <td style="width: 50%; vertical-align: top; padding-left: 12px;">
                    <span style="font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: #6B4A3A; font-weight: 600; display: block; margin-bottom: 4px;">
                      Courier Dispatch Telemetry
                    </span>
                    <strong style="font-size: 13px; color: #2B1D17; display: block;">${courier}</strong>
                    <p style="margin: 4px 0 0; font-size: 12px; color: #6B4A3A; line-height: 1.5;">
                      Tracking No: <strong>#${trackingRef}</strong><br>
                      Estimated Handover: <strong>${deliveryEst}</strong><br>
                      Payment: <strong>${paymentMethod}</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items Ordered -->
          <tr>
            <td style="padding: 28px 32px 16px;">
              <span style="font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #6B4A3A; font-weight: 600; display: block; margin-bottom: 16px; border-bottom: 1px solid #E7D6C1; padding-bottom: 8px;">
                Garments In This Shipment (${(order.items || []).length})
              </span>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                ${itemsRows}
              </table>
            </td>
          </tr>

          <!-- Math Breakdown -->
          <tr>
            <td style="padding: 0 32px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px; color: #2B1D17;">
                <tr>
                  <td style="padding: 6px 0; color: #6B4A3A;">Subtotal</td>
                  <td style="padding: 6px 0; text-align: right;">${formatPKR(order.subtotal)}</td>
                </tr>
                ${
                  (order.discount || 0) > 0
                    ? `
                <tr>
                  <td style="padding: 6px 0; color: #2E5A36;">Privilege Voucher Savings</td>
                  <td style="padding: 6px 0; text-align: right; color: #2E5A36;">-${formatPKR(order.discount || 0)}</td>
                </tr>
                `
                    : ''
                }
                <tr>
                  <td style="padding: 6px 0; color: #6B4A3A;">White-Glove Courier Dispatch</td>
                  <td style="padding: 6px 0; text-align: right;">${order.shippingFee === 0 ? 'Complimentary' : formatPKR(order.shippingFee || 0)}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0 0; font-family: 'Playfair Display', Georgia, serif; font-size: 17px; font-weight: 600; border-top: 1px solid #E7D6C1;">
                    Total Invoiced (PKR)
                  </td>
                  <td style="padding: 12px 0 0; text-align: right; font-family: 'Playfair Display', Georgia, serif; font-size: 19px; font-weight: 700; color: #2B1D17; border-top: 1px solid #E7D6C1;">
                    ${formatPKR(order.total)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer Notes -->
          <tr>
            <td style="background-color: #FAF6F0; padding: 24px 32px; text-align: center; border-top: 1px solid #E7D6C1;">
              <p style="margin: 0 0 8px; font-size: 11px; color: #6B4A3A; line-height: 1.5;">
                Need styling advice or changes to your delivery address?<br>
                Contact our Private Atelier Concierge at <strong>care@lumora.luxury</strong> or call <strong>+92 (042) 3578-9000</strong>.
              </p>
              <p style="margin: 0; font-size: 10px; color: #6B4A3A; opacity: 0.7; letter-spacing: 0.05em;">
                &copy; ${new Date().getFullYear()} Lumora Haute Couture. Private Salon, Gulberg III, Lahore, Pakistan. All rights reserved.
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
 * Send real confirmation email using configured provider
 */
export async function sendOrderConfirmationEmail(order: EmailOrderDetails): Promise<EmailSendResult> {
  const status = getEmailProviderStatus();
  const recipient = order.email?.trim();
  const orderRef = order.orderNumber || order.id;

  if (!recipient) {
    const err = `[EmailService] Recipient email is missing for order #${orderRef}`;
    console.error(err);
    return { success: false, provider: status.provider, error: 'Recipient email address is missing.' };
  }

  // 1. Check if any real service is configured
  if (!status.configured) {
    const errorMsg = 'No real email service is configured. Please configure RESEND_API_KEY, BREVO_API_KEY, SENDGRID_API_KEY, or SMTP credentials in Settings.';
    console.error(`[EmailService] Order #${orderRef}: Delivery failed - ${errorMsg}`);
    return {
      success: false,
      provider: 'none',
      error: errorMsg,
      details: status.details
    };
  }

  const subject = `Your Lumora Atelier Order Confirmation #${orderRef}`;
  const html = generateOrderConfirmationHTML(order);

  // 2. Provider: Resend
  if (status.provider === 'resend') {
    try {
      const apiKey = process.env.RESEND_API_KEY!.trim();
      const resend = new Resend(apiKey);
      const sender = status.senderEmail;

      console.log(`[EmailService] Dispatching order #${orderRef} via Resend to ${recipient} (From: ${sender})...`);
      const { data, error } = await resend.emails.send({
        from: sender,
        to: recipient,
        subject,
        html
      });

      if (error) {
        console.error(`[EmailService] Resend API error for order #${orderRef}:`, error);
        return {
          success: false,
          provider: 'resend',
          error: error.message || 'Resend delivery failed.',
          details: error
        };
      }

      console.log(`[EmailService] Resend email successfully delivered! ID: ${data?.id}`);
      return {
        success: true,
        provider: 'resend',
        messageId: data?.id
      };
    } catch (err: any) {
      console.error(`[EmailService] Resend exception for order #${orderRef}:`, err);
      return {
        success: false,
        provider: 'resend',
        error: err.message || 'Unexpected error while delivering email via Resend.',
        details: err
      };
    }
  }

  // 3. Provider: Brevo (Sendinblue)
  if (status.provider === 'brevo') {
    try {
      const apiKey = process.env.BREVO_API_KEY!.trim();
      console.log(`[EmailService] Dispatching order #${orderRef} via Brevo to ${recipient}...`);

      const senderParts = status.senderEmail.match(/^(.*?)\s*<(.+)>$/);
      const senderName = senderParts ? senderParts[1].replace(/['"]/g, '').trim() : 'Lumora Haute Couture';
      const senderAddr = senderParts ? senderParts[2].trim() : status.senderEmail;

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderAddr },
          to: [{ email: recipient, name: order.customerName }],
          subject,
          htmlContent: html
        })
      });

      const data = await response.json();
      if (!response.ok) {
        const errMsg = data.message || `Brevo returned HTTP ${response.status}`;
        console.error(`[EmailService] Brevo delivery failed for order #${orderRef}:`, data);
        return { success: false, provider: 'brevo', error: errMsg, details: data };
      }

      console.log(`[EmailService] Brevo email delivered! Message ID: ${data.messageId}`);
      return { success: true, provider: 'brevo', messageId: data.messageId };
    } catch (err: any) {
      console.error(`[EmailService] Brevo exception for order #${orderRef}:`, err);
      return { success: false, provider: 'brevo', error: err.message, details: err };
    }
  }

  // 4. Provider: SendGrid
  if (status.provider === 'sendgrid') {
    try {
      const apiKey = process.env.SENDGRID_API_KEY!.trim();
      console.log(`[EmailService] Dispatching order #${orderRef} via SendGrid to ${recipient}...`);

      const senderParts = status.senderEmail.match(/^(.*?)\s*<(.+)>$/);
      const senderName = senderParts ? senderParts[1].replace(/['"]/g, '').trim() : 'Lumora Haute Couture';
      const senderAddr = senderParts ? senderParts[2].trim() : status.senderEmail;

      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: recipient, name: order.customerName }],
              subject
            }
          ],
          from: { email: senderAddr, name: senderName },
          content: [
            {
              type: 'text/html',
              value: html
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[EmailService] SendGrid delivery failed for order #${orderRef}:`, errorText);
        return { success: false, provider: 'sendgrid', error: errorText };
      }

      console.log(`[EmailService] SendGrid email successfully dispatched for order #${orderRef}`);
      return { success: true, provider: 'sendgrid' };
    } catch (err: any) {
      console.error(`[EmailService] SendGrid exception for order #${orderRef}:`, err);
      return { success: false, provider: 'sendgrid', error: err.message };
    }
  }

  // 5. Provider: SMTP
  if (status.provider === 'smtp') {
    try {
      const host = process.env.SMTP_HOST!.trim();
      const port = Number(process.env.SMTP_PORT) || 587;
      const user = process.env.SMTP_USER!.trim();
      const pass = process.env.SMTP_PASS!.trim();
      const secure = process.env.SMTP_SECURE === 'true' || port === 465;

      console.log(`[EmailService] Dispatching order #${orderRef} via SMTP (${host}:${port}) to ${recipient}...`);

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass }
      });

      const info = await transporter.sendMail({
        from: status.senderEmail,
        to: recipient,
        subject,
        html
      });

      console.log(`[EmailService] SMTP email delivered! ID: ${info.messageId}`);
      return { success: true, provider: 'smtp', messageId: info.messageId };
    } catch (err: any) {
      console.error(`[EmailService] SMTP exception for order #${orderRef}:`, err);
      return { success: false, provider: 'smtp', error: err.message, details: err };
    }
  }

  return {
    success: false,
    provider: 'none',
    error: 'Unrecognized email provider configuration.'
  };
}
