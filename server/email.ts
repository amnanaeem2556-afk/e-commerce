import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import * as dotenv from 'dotenv';

dotenv.config();

// Configuration state (in-memory with fallback to process.env)
export interface EmailConfigState {
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUser?: string;
  smtpPass?: string;
  resendApiKey?: string;
  brevoApiKey?: string;
  sendgridApiKey?: string;
  emailFrom?: string;
  adminEmail?: string;
}

const configState: EmailConfigState = {
  smtpHost: process.env.SMTP_HOST?.replace(/"/g, ''),
  smtpPort: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined,
  smtpSecure: process.env.SMTP_SECURE === 'true',
  smtpUser: process.env.SMTP_USER?.replace(/"/g, ''),
  smtpPass: process.env.SMTP_PASS?.replace(/"/g, ''),
  resendApiKey: process.env.RESEND_API_KEY?.replace(/"/g, ''),
  brevoApiKey: process.env.BREVO_API_KEY?.replace(/"/g, ''),
  sendgridApiKey: process.env.SENDGRID_API_KEY?.replace(/"/g, ''),
  emailFrom: process.env.EMAIL_FROM?.replace(/"/g, '') || 'Lumora Maison <orders@lumora.luxury>',
  adminEmail: process.env.ADMIN_EMAIL?.replace(/"/g, '') || process.env.STORE_ADMIN_EMAIL?.replace(/"/g, '') || 'admin@lumora.luxury',
};

export function updateEmailConfig(updates: Partial<EmailConfigState>) {
  if (updates.resendApiKey !== undefined) configState.resendApiKey = updates.resendApiKey;
  if (updates.brevoApiKey !== undefined) configState.brevoApiKey = updates.brevoApiKey;
  if (updates.sendgridApiKey !== undefined) configState.sendgridApiKey = updates.sendgridApiKey;
  if (updates.emailFrom !== undefined) configState.emailFrom = updates.emailFrom;
  if (updates.adminEmail !== undefined) configState.adminEmail = updates.adminEmail;
}

export function getEmailStatus() {
  let provider = 'none';
  let configured = false;

  if (configState.smtpHost && configState.smtpUser && configState.smtpPass) {
    provider = 'smtp';
    configured = true;
  } else if (configState.resendApiKey) {
    provider = 'resend';
    configured = true;
  } else if (configState.brevoApiKey) {
    provider = 'brevo';
    configured = true;
  } else if (configState.sendgridApiKey) {
    provider = 'sendgrid';
    configured = true;
  }

  return {
    configured,
    provider,
    from: configState.emailFrom || 'orders@lumora.luxury',
    adminEmail: configState.adminEmail || 'admin@lumora.luxury',
  };
}

function getFromAddress(): string {
  let from = configState.emailFrom || 'orders@lumora.luxury';
  if (configState.smtpUser && !from.includes('@')) {
    return `"${from}" <${configState.smtpUser}>`;
  }
  return from;
}

// Low-level send dispatcher supporting SMTP and Resend
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ success: boolean; provider: string; messageId?: string; error?: string }> {
  const status = getEmailStatus();

  if (!status.configured) {
    console.log(`[Email Mock/Unconfigured] To: ${to} | Subject: ${subject}`);
    return {
      success: true,
      provider: 'mock',
      messageId: `mock_${Date.now()}`,
    };
  }

  // 1. SMTP (e.g. Gmail SMTP)
  if (status.provider === 'smtp') {
    try {
      const transporter = nodemailer.createTransport({
        host: configState.smtpHost,
        port: configState.smtpPort || 465,
        secure: configState.smtpSecure !== false,
        auth: {
          user: configState.smtpUser,
          pass: configState.smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: getFromAddress(),
        to,
        subject,
        text: text || html.replace(/<[^>]+>/g, ' '),
        html,
      });

      return {
        success: true,
        provider: 'smtp',
        messageId: info.messageId,
      };
    } catch (err: any) {
      console.error('[Email SMTP Error]', err);
      return {
        success: false,
        provider: 'smtp',
        error: err.message || 'SMTP delivery failed',
      };
    }
  }

  // 2. Resend API
  if (status.provider === 'resend' && configState.resendApiKey) {
    try {
      const resend = new Resend(configState.resendApiKey);
      const res = await resend.emails.send({
        from: configState.emailFrom || 'Lumora <onboarding@resend.dev>',
        to: [to],
        subject,
        html,
        text: text || html.replace(/<[^>]+>/g, ' '),
      });

      if (res.error) {
        return {
          success: false,
          provider: 'resend',
          error: res.error.message,
        };
      }

      return {
        success: true,
        provider: 'resend',
        messageId: res.data?.id,
      };
    } catch (err: any) {
      console.error('[Email Resend Error]', err);
      return {
        success: false,
        provider: 'resend',
        error: err.message || 'Resend delivery failed',
      };
    }
  }

  return {
    success: false,
    provider: status.provider,
    error: `Unsupported provider: ${status.provider}`,
  };
}

// Test Email
export async function sendTestEmail(to: string) {
  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #FAF6F0; border: 1px solid #EBDDCF; border-radius: 12px; color: #2B1D17;">
      <div style="text-align: center; border-bottom: 1px solid #EBDDCF; padding-bottom: 20px; margin-bottom: 25px;">
        <h1 style="letter-spacing: 0.15em; font-size: 24px; margin: 0; text-transform: uppercase;">LUMORA</h1>
        <p style="font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #C48A5A; margin: 4px 0 0 0;">Haute Horlogerie & Couture Atelier</p>
      </div>
      <h2 style="font-size: 18px; margin-top: 0; color: #2B1D17;">Email Gateway Verification</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #6B4A3A;">
        This email confirms that your email delivery gateway is fully operational and authenticated.
      </p>
      <div style="background-color: #ffffff; padding: 16px; border-radius: 8px; border: 1px solid #EBDDCF; margin: 20px 0; font-size: 13px;">
        <p style="margin: 0 0 8px 0;"><strong>Active Provider:</strong> ${getEmailStatus().provider.toUpperCase()}</p>
        <p style="margin: 0 0 8px 0;"><strong>Recipient:</strong> ${to}</p>
        <p style="margin: 0;"><strong>Timestamp:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' })} PKT</p>
      </div>
      <p style="font-size: 12px; color: #8A6D5E; margin-top: 30px; text-align: center;">
        Lumora Flagship Atelier Â· Lahore, Pakistan
      </p>
    </div>
  `;

  return await sendEmail({
    to,
    subject: 'LUMORA Â· Email Gateway Verification',
    html,
  });
}

// Order Confirmation Email
export async function sendOrderConfirmationEmail(order: any) {
  const items = Array.isArray(order.items) ? order.items : [];
  const itemsHtml = items
    .map((item: any) => {
      const p = item.product || {};
      const img = p.images?.[0] ? `<img src="${p.images[0]}" width="60" height="75" style="border-radius: 6px; object-fit: cover; margin-right: 12px;" />` : '';
      return `
        <tr style="border-bottom: 1px solid #EBDDCF;">
          <td style="padding: 12px 0;">
            <div style="display: flex; align-items: center;">
              ${img}
              <div>
                <div style="font-weight: bold; color: #2B1D17;">${p.name || 'Artisanal Piece'}</div>
                <div style="font-size: 12px; color: #8A6D5E;">Size: ${item.selectedSize || 'N/A'} | Color: ${item.selectedColor || 'N/A'}</div>
                <div style="font-size: 12px; color: #8A6D5E;">Qty: ${item.quantity || 1}</div>
              </div>
            </div>
          </td>
          <td style="text-align: right; padding: 12px 0; font-weight: bold; color: #2B1D17;">
            ₨${((item.price || p.price || 0) * (item.quantity || 1)).toLocaleString()}
          </td>
        </tr>
      `;
    })
    .join('');

  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #FAF6F0; border: 1px solid #EBDDCF; border-radius: 12px; color: #2B1D17;">
      <div style="text-align: center; border-bottom: 1px solid #EBDDCF; padding-bottom: 20px; margin-bottom: 25px;">
        <h1 style="letter-spacing: 0.15em; font-size: 26px; margin: 0; text-transform: uppercase;">LUMORA</h1>
        <p style="font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #C48A5A; margin: 4px 0 0 0;">Haute Horlogerie & Couture Atelier</p>
      </div>
      
      <p style="font-size: 15px; line-height: 1.6; color: #6B4A3A;">
        Dear <strong>${order.customerName || 'Esteemed Patron'}</strong>,
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #6B4A3A;">
        We have received your bespoke order with heartfelt gratitude. Our master craftsmen and white-glove atelier curators are preparing your acquisition with precision.
      </p>

      <div style="background-color: #ffffff; padding: 16px; border-radius: 8px; border: 1px solid #EBDDCF; margin: 20px 0; font-size: 13px;">
        <p style="margin: 0 0 6px 0;"><strong>Order Reference:</strong> <span style="color: #C48A5A; font-weight: bold;">${order.orderNumber || order.id}</span></p>
        <p style="margin: 0 0 6px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        <p style="margin: 0 0 6px 0;"><strong>Delivery Method:</strong> ${order.courierName || 'TCS White-Glove VIP Express'}</p>
        <p style="margin: 0;"><strong>Shipping Destination:</strong> ${order.shippingAddress || ''}, ${order.city || ''}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin: 25px 0;">
        <thead>
          <tr style="border-bottom: 2px solid #EBDDCF; font-size: 12px; text-transform: uppercase; color: #8A6D5E; letter-spacing: 0.05em;">
            <th style="text-align: left; padding-bottom: 8px;">Acquisition</th>
            <th style="text-align: right; padding-bottom: 8px;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="border-top: 1px solid #EBDDCF; padding-top: 15px; margin-top: 10px; font-size: 13px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span style="color: #6B4A3A;">Subtotal:</span>
          <span>₨${(order.subtotal || 0).toLocaleString()}</span>
        </div>
        ${order.discount ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #166534;">
          <span>Privilege Courtesy:</span>
          <span>-₨${order.discount.toLocaleString()}</span>
        </div>` : ''}
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span style="color: #6B4A3A;">White-Glove Courier:</span>
          <span>${order.shippingFee ? `₨${order.shippingFee.toLocaleString()}` : 'Complimentary'}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 10px; padding-top: 10px; border-top: 1px solid #EBDDCF; font-size: 16px; font-weight: bold; color: #2B1D17;">
          <span>Total Invoiced:</span>
          <span style="color: #C48A5A;">₨${(order.total || 0).toLocaleString()}</span>
        </div>
      </div>

      <p style="font-size: 12px; line-height: 1.5; color: #8A6D5E; margin-top: 30px; text-align: center;">
        For bespoke assistance, please consult concierge@lumora.luxury or visit our salon at Lahore, Pakistan.
      </p>
    </div>
  `;

  return await sendEmail({
    to: order.email,
    subject: `LUMORA Acquisition Confirmation · Order ${order.orderNumber || order.id}`,
    html,
  });
}

// Order Status Update Email (e.g. Shipped / Delivered)
export async function sendOrderStatusEmail(
  order: any,
  newStatus: string,
  courierName?: string,
  trackingNumber?: string
) {
  const statusDisplay = newStatus.replace(/_/g, ' ').toUpperCase();
  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #FAF6F0; border: 1px solid #EBDDCF; border-radius: 12px; color: #2B1D17;">
      <div style="text-align: center; border-bottom: 1px solid #EBDDCF; padding-bottom: 20px; margin-bottom: 25px;">
        <h1 style="letter-spacing: 0.15em; font-size: 24px; margin: 0; text-transform: uppercase;">LUMORA</h1>
        <p style="font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #C48A5A; margin: 4px 0 0 0;">Shipment Consignment Notice</p>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #6B4A3A;">
        Dear <strong>${order.customerName || 'Esteemed Patron'}</strong>,
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #6B4A3A;">
        Your order status has been updated to: <strong><span style="color: #C48A5A;">${statusDisplay}</span></strong>.
      </p>

      <div style="background-color: #ffffff; padding: 16px; border-radius: 8px; border: 1px solid #EBDDCF; margin: 20px 0; font-size: 13px;">
        <p style="margin: 0 0 6px 0;"><strong>Order Reference:</strong> ${order.orderNumber || order.id}</p>
        <p style="margin: 0 0 6px 0;"><strong>Courier Service:</strong> ${courierName || order.courierName || 'TCS White-Glove VIP Express'}</p>
        <p style="margin: 0 0 6px 0;"><strong>Airway Bill / Tracking:</strong> <strong style="color: #C48A5A;">${trackingNumber || order.trackingNumber || 'Tracking Allocated'}</strong></p>
        <p style="margin: 0;"><strong>Destination:</strong> ${order.shippingAddress || ''}, ${order.city || ''}</p>
      </div>

      <p style="font-size: 13px; line-height: 1.5; color: #6B4A3A;">
        You may track your consignment in real-time through our dedicated Order Tracking portal.
      </p>
      <div style="text-align: center; margin: 25px 0;">
        <a href="https://lumora.luxury/track?orderId=${encodeURIComponent(order.orderNumber || order.id)}" style="display: inline-block; background-color: #2B1D17; color: #FAF6F0; padding: 12px 24px; text-decoration: none; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; font-weight: bold; border-radius: 4px;">
          Track Consignment Live
        </a>
      </div>
    </div>
  `;

  return await sendEmail({
    to: order.email,
    subject: `LUMORA Dispatch Notice · Order ${order.orderNumber || order.id} is ${statusDisplay}`,
    html,
  });
}

// 6-digit OTP verification code for Admin / Store Owner signup
export async function sendAdminVerificationEmail(email: string, code: string) {
  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #FAF6F0; border: 1px solid #EBDDCF; border-radius: 12px; color: #2B1D17;">
      <div style="text-align: center; border-bottom: 1px solid #EBDDCF; padding-bottom: 20px; margin-bottom: 25px;">
        <h1 style="letter-spacing: 0.15em; font-size: 24px; margin: 0; text-transform: uppercase;">LUMORA</h1>
        <p style="font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #C48A5A; margin: 4px 0 0 0;">Atelier Executive Authentication</p>
      </div>

      <h2 style="font-size: 18px; margin-top: 0; color: #2B1D17;">Store Owner Authorization Code</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #6B4A3A;">
        An authorization request was initiated for administrative access to the Lumora Atelier Console. Please enter the following one-time authentication code:
      </p>

      <div style="background-color: #ffffff; padding: 20px; text-align: center; border-radius: 8px; border: 1px dashed #C48A5A; margin: 25px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 0.3em; color: #2B1D17; font-family: monospace;">
          ${code}
        </span>
      </div>

      <p style="font-size: 12px; line-height: 1.5; color: #8A6D5E; text-align: center;">
        This code expires in 15 minutes. If you did not request this authorization, please disregard this transmission immediately.
      </p>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: `LUMORA Atelier Verification Code: ${code}`,
    html,
  });
}

// Password Reset Email for Admin
export async function sendPasswordResetEmail(email: string, token: string) {
  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #FAF6F0; border: 1px solid #EBDDCF; border-radius: 12px; color: #2B1D17;">
      <div style="text-align: center; border-bottom: 1px solid #EBDDCF; padding-bottom: 20px; margin-bottom: 25px;">
        <h1 style="letter-spacing: 0.15em; font-size: 24px; margin: 0; text-transform: uppercase;">LUMORA</h1>
        <p style="font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #C48A5A; margin: 4px 0 0 0;">Security Credential Reset</p>
      </div>

      <h2 style="font-size: 18px; margin-top: 0; color: #2B1D17;">Administrative Password Recovery</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #6B4A3A;">
        A request has been received to reset the master administrative credentials for <strong>${email}</strong>.
      </p>

      <div style="background-color: #ffffff; padding: 16px; border-radius: 8px; border: 1px solid #EBDDCF; margin: 20px 0; font-size: 13px;">
        <p style="margin: 0 0 6px 0;"><strong>Reset Authorization Token:</strong></p>
        <p style="margin: 0; font-family: monospace; font-size: 16px; color: #C48A5A; word-break: break-all;"><strong>${token}</strong></p>
      </div>

      <p style="font-size: 12px; color: #8A6D5E; text-align: center; margin-top: 25px;">
        This security token will expire in 1 hour.
      </p>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: 'LUMORA · Security Credential Reset Instructions',
    html,
  });
}
