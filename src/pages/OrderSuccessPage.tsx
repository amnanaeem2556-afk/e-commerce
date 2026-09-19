import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Package,
  Truck,
  Download,
  ArrowRight,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Printer,
  AlertTriangle,
  RefreshCw,
  Send,
  ExternalLink,
  ShieldCheck,
  Info
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { formatPKR } from '../data/constants';

interface EmailAuditStatus {
  configured: boolean;
  provider: 'resend' | 'brevo' | 'sendgrid' | 'smtp' | 'none';
  senderEmail: string;
  details: string;
}

export const OrderSuccessPage: React.FC = () => {
  const { currentOrder, setCurrentPage } = useShop();

  // Local state for tracking email delivery status accurately
  const [emailStatus, setEmailStatus] = useState<'checking' | 'sent' | 'failed' | 'unconfigured'>('checking');
  const [emailError, setEmailError] = useState<string>('');
  const [emailProvider, setEmailProvider] = useState<string>('');
  const [emailMessageId, setEmailMessageId] = useState<string>('');
  const [isRetrying, setIsRetrying] = useState(false);

  // Email diagnostics and real test dispatch state
  const [providerAudit, setProviderAudit] = useState<EmailAuditStatus | null>(null);
  const [testEmail, setTestEmail] = useState('amna.naeem2556@gmail.com');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{
    attempted: boolean;
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  // Audit provider and sync email status
  useEffect(() => {
    // 1. Fetch system email provider status
    fetch('/api/email/status')
      .then((res) => res.json())
      .then((data: EmailAuditStatus) => {
        setProviderAudit(data);

        // 2. Evaluate current order email status
        if (currentOrder) {
          if (currentOrder.emailSent === true) {
            setEmailStatus('sent');
            setEmailProvider(currentOrder.emailProvider || data.provider);
            setEmailMessageId(currentOrder.emailMessageId || '');
            setEmailError('');
          } else if (currentOrder.emailSent === false) {
            setEmailStatus(data.configured ? 'failed' : 'unconfigured');
            setEmailProvider(currentOrder.emailProvider || data.provider);
            setEmailError(
              currentOrder.emailError ||
                (data.configured
                  ? 'Delivery failed at the email gateway.'
                  : 'No real email service (Resend, Brevo, SendGrid, or SMTP) is currently configured.')
            );
          } else {
            // If email status is undefined (e.g. mock/stale session), query status or attempt dispatch
            if (!data.configured) {
              setEmailStatus('unconfigured');
              setEmailError('No real email service is currently configured in environment variables.');
            } else {
              // Attempt automated background dispatch for this order
              fetch(`/api/orders/${currentOrder.id}/resend-email`, { method: 'POST' })
                .then((r) => r.json())
                .then((res) => {
                  if (res.success) {
                    setEmailStatus('sent');
                    setEmailProvider(res.provider);
                    setEmailMessageId(res.messageId || '');
                    setEmailError('');
                  } else {
                    setEmailStatus('failed');
                    setEmailProvider(res.provider || data.provider);
                    setEmailError(res.error || 'Email dispatch failed.');
                  }
                })
                .catch((err) => {
                  setEmailStatus('failed');
                  setEmailError('Network communication failure with email gateway.');
                });
            }
          }
        }
      })
      .catch((err) => {
        console.error('[EmailAudit] Failed to load provider status:', err);
        setEmailStatus('failed');
        setEmailError('Could not verify email service connectivity.');
      });
  }, [currentOrder?.id, currentOrder?.emailSent]);

  if (!currentOrder) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="font-heading text-2xl sm:text-3xl text-[#2B1D17] tracking-[0.03em] leading-none">No Order Found</h2>
        <p className="text-xs text-[#6B4A3A]">Please explore our collection to place a bespoke order.</p>
        <button
          onClick={() => setCurrentPage('shop')}
          className="bg-[#2B1D17] text-[#FAF6F0] px-6 py-3 text-xs uppercase tracking-widest font-semibold cursor-pointer"
        >
          Return to Catalogue
        </button>
      </div>
    );
  }

  const order = currentOrder;

  const handlePrint = () => {
    window.print();
  };

  // Re-trigger confirmation email for this order
  const handleRetryEmail = async () => {
    setIsRetrying(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/resend-email`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setEmailStatus('sent');
        setEmailProvider(data.provider);
        setEmailMessageId(data.messageId || '');
        setEmailError('');
      } else {
        setEmailStatus(data.provider === 'none' ? 'unconfigured' : 'failed');
        setEmailProvider(data.provider);
        setEmailError(data.error || 'Email delivery failed.');
      }
    } catch (err: any) {
      setEmailStatus('failed');
      setEmailError(err.message || 'Network error attempting to send confirmation email.');
    } finally {
      setIsRetrying(false);
    }
  };

  // Test send directly to user email
  const handleSendTestEmail = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      setTestResult({
        attempted: true,
        success: false,
        message: 'Please provide a valid destination email address.'
      });
      return;
    }

    setIsSendingTest(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testEmail.trim() })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setTestResult({
          attempted: true,
          success: true,
          message: `Live confirmation email successfully delivered to ${testEmail}! Provider: ${data.provider.toUpperCase()}${
            data.messageId ? ` (ID: ${data.messageId})` : ''
          }`,
          details: data
        });
        // If the test succeeded, also retry the order email
        handleRetryEmail();
      } else {
        setTestResult({
          attempted: true,
          success: false,
          message:
            data.error ||
            'Email delivery was refused by the email gateway. Please ensure your provider API key and verified sender domain are valid.',
          details: data
        });
      }
    } catch (err: any) {
      setTestResult({
        attempted: true,
        success: false,
        message: `Network failure connecting to email endpoint: ${err.message}`
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Success Hero Card */}
      <div className="bg-[#FAF6F0] border border-[#E7D6C1] p-8 sm:p-12 text-center space-y-4 relative overflow-hidden">
        <div className="w-16 h-16 rounded-full bg-[#E7D6C1]/40 mx-auto flex items-center justify-center text-[#2B1D17] mb-2">
          <CheckCircle2 className="w-9 h-9 text-[#C48A5A]" />
        </div>

        <span className="text-[10.5px] uppercase tracking-[0.25em] text-[#C48A5A] font-semibold block">
          Order Confirmed &bull; Reference #{order.id}
        </span>

        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-[#2B1D17] tracking-[0.03em] leading-none">
          Order Confirmed
        </h1>

        <p className="text-xs sm:text-sm text-[#6B4A3A] max-w-lg mx-auto font-light leading-relaxed">
          Thank you for your patronage, {order.customerName}. Your bespoke curation has been registered at our Lahore Salon.
        </p>

        {/* EMAIL STATUS ACCURACY SECTION */}
        {emailStatus === 'checking' && (
          <div className="inline-flex items-center gap-2 bg-[#E7D6C1]/20 border border-[#E7D6C1] px-4 py-2 text-xs text-[#6B4A3A] mt-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#C48A5A]" />
            <span>Verifying email delivery gateway status for <strong>{order.email}</strong>...</span>
          </div>
        )}

        {/* ONLY DISPLAY SUCCESS IF PROVIDER RETURNED SUCCESS */}
        {emailStatus === 'sent' && (
          <div className="inline-flex items-center gap-2 bg-[#2E5A36]/10 border border-[#2E5A36]/40 px-4 py-2 text-xs text-[#2E5A36] mt-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-[#2E5A36] shrink-0" />
            <span>
              Confirmation receipt and tracking credentials dispatched to <strong>{order.email}</strong> via {emailProvider.toUpperCase()}
              {emailMessageId ? ` (ID: ${emailMessageId.slice(0, 14)}...)` : ''}
            </span>
          </div>
        )}

        {/* STRICTLY SHOW ERROR IF EMAIL FAILED OR UNCONFIGURED - NEVER CLAIM SENT */}
        {(emailStatus === 'failed' || emailStatus === 'unconfigured') && (
          <div className="max-w-xl mx-auto mt-4 text-left bg-amber-50 border border-amber-300 p-4 space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1 text-amber-900">
                <p className="font-semibold text-amber-950">
                  {emailStatus === 'unconfigured'
                    ? 'Confirmation Email Not Dispatched (Email Service Unconfigured)'
                    : 'Confirmation Email Delivery Failed'}
                </p>
                <p className="text-[11.5px] leading-relaxed text-amber-800">
                  {emailError || 'The email provider returned a delivery error or credentials have not been configured.'}
                </p>
                <p className="text-[11px] text-amber-700">
                  Target Recipient: <strong>{order.email}</strong>
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-amber-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <button
                onClick={handleRetryEmail}
                disabled={isRetrying}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2B1D17] hover:bg-[#6B4A3A] disabled:opacity-50 text-[#FAF6F0] text-[11px] uppercase tracking-wider font-semibold cursor-pointer transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
                <span>{isRetrying ? 'Retrying Dispatch...' : 'Retry Sending Email'}</span>
              </button>

              <span className="text-[10.5px] text-amber-800">
                Supported Providers: <strong>Resend, Brevo, SendGrid, or SMTP</strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* REAL-TIME AUDIT & TEST EMAIL TOOLKIT */}
      <div className="bg-[#FAF6F0] border border-[#E7D6C1] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7D6C1] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C48A5A]" />
              <span className="text-[10px] uppercase tracking-widest text-[#C48A5A] font-semibold">
                System Diagnostics & Verification
              </span>
            </div>
            <h3 className="font-heading text-2xl sm:text-3xl text-[#2B1D17] tracking-[0.03em] leading-none">
              Live Email Gateway Audit & Delivery Tester
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6B4A3A]">Active Provider:</span>
            <span
              className={`px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider border ${
                providerAudit?.configured
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-rose-50 text-rose-800 border-rose-300'
              }`}
            >
              {providerAudit?.provider ? providerAudit.provider.toUpperCase() : 'AUDITING...'}
            </span>
          </div>
        </div>

        {/* Audit Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-white border border-[#E7D6C1] space-y-1.5">
            <span className="text-[10px] uppercase tracking-wider text-[#6B4A3A] font-semibold block">
              Sender Configuration
            </span>
            <p className="font-mono text-[#2B1D17] text-[11px] break-all">
              {providerAudit?.senderEmail || 'Lumora Orders <orders@lumora.luxury>'}
            </p>
            <p className="text-[11px] text-[#6B4A3A]">
              Domain / address configured for transactional receipts.
            </p>
          </div>

          <div className="p-3.5 bg-white border border-[#E7D6C1] space-y-1.5">
            <span className="text-[10px] uppercase tracking-wider text-[#6B4A3A] font-semibold block">
              Provider Integration Status
            </span>
            <p className="text-[11.5px] text-[#2B1D17] font-medium">
              {providerAudit?.details || 'Inspecting environment configuration...'}
            </p>
            <p className="text-[10.5px] text-[#6B4A3A]">
              Variables: <code className="bg-[#FAF6F0] px-1 py-0.5 border border-[#E7D6C1]">RESEND_API_KEY</code>,{' '}
              <code className="bg-[#FAF6F0] px-1 py-0.5 border border-[#E7D6C1]">BREVO_API_KEY</code>,{' '}
              <code className="bg-[#FAF6F0] px-1 py-0.5 border border-[#E7D6C1]">SENDGRID_API_KEY</code>, or{' '}
              <code className="bg-[#FAF6F0] px-1 py-0.5 border border-[#E7D6C1]">SMTP_*</code>
            </p>
          </div>
        </div>

        {/* Real Test Email Dispatch Box */}
        <div className="bg-white border border-[#E7D6C1] p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#C48A5A]" />
              <h4 className="font-sans text-sm font-semibold text-[#2B1D17]">
                Send Test Receipt Email
              </h4>
            </div>
            <span className="text-[10.5px] text-[#6B4A3A]">
              Dispatches full bespoke HTML receipt
            </span>
          </div>

          <p className="text-xs text-[#6B4A3A] leading-relaxed">
            Test actual delivery to verify that emails arrive in your real inbox. Enter your email address below to test the connection.
          </p>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="e.g. amna.naeem2556@gmail.com"
              className="flex-1 bg-[#FAF6F0] border border-[#E7D6C1] px-3.5 py-2 text-xs text-[#2B1D17] focus:outline-none focus:border-[#C48A5A]"
            />
            <button
              onClick={handleSendTestEmail}
              disabled={isSendingTest}
              className="inline-flex items-center justify-center gap-2 bg-[#2B1D17] hover:bg-[#6B4A3A] disabled:opacity-50 text-[#FAF6F0] text-xs uppercase tracking-wider font-semibold px-5 py-2 cursor-pointer transition-colors whitespace-nowrap"
            >
              {isSendingTest ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Dispatching...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-[#C48A5A]" />
                  <span>Send Real Test Email</span>
                </>
              )}
            </button>
          </div>

          {/* Test Feedback */}
          {testResult && (
            <div
              className={`p-3 text-xs border ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                  : 'bg-rose-50 text-rose-900 border-rose-300'
              }`}
            >
              <div className="flex items-start gap-2">
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <p className="font-semibold">{testResult.success ? 'Delivery Succeeded' : 'Delivery Refused / Failed'}</p>
                  <p className="text-[11.5px] leading-relaxed">{testResult.message}</p>
                  {!testResult.success && !providerAudit?.configured && (
                    <p className="text-[11px] text-rose-700 mt-1">
                      Tip: Add your Resend, Brevo, SendGrid, or SMTP credentials in the AI Studio Settings menu. The backend will automatically detect and route emails through your provider.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Real-time Order Tracking Timeline */}
      <div className="bg-[#FAF6F0] border border-[#E7D6C1] p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[#E7D6C1] pb-4">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#C48A5A] font-semibold">
              Live Fulfillment Status
            </span>
            <h3 className="font-heading text-2xl sm:text-3xl text-[#2B1D17] tracking-[0.03em] leading-none">
              Order Journey
            </h3>
          </div>
          <span className="text-xs text-[#6B4A3A] font-medium">
            Est. Arrival: <strong>{order.estimatedDelivery}</strong>
          </span>
        </div>

        {/* 5-Step Visual Timeline */}
        <div className="relative">
          <div className="hidden sm:block absolute top-5 left-8 right-8 h-0.5 bg-[#E7D6C1]" />
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-2 relative z-10">
            {[
              { step: 1, label: 'Order Placed', desc: order.orderDate, completed: true, active: false },
              { step: 2, label: 'Atelier Inspection', desc: 'Silk ribboning & boxing', completed: false, active: true },
              { step: 3, label: 'Courier Dispatch', desc: 'White-Glove Fleet', completed: false, active: false },
              { step: 4, label: 'Out for Handover', desc: 'Driver en route', completed: false, active: false },
              { step: 5, label: 'Delivered', desc: 'Signature received', completed: false, active: false },
            ].map((st) => (
              <div key={st.step} className="flex sm:flex-col items-center gap-3 sm:gap-2 text-left sm:text-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                    st.completed
                      ? 'bg-[#2B1D17] text-[#FAF6F0]'
                      : st.active
                      ? 'bg-[#C48A5A] text-[#2B1D17] ring-4 ring-[#C48A5A]/30 animate-pulse'
                      : 'bg-[#E7D6C1] text-[#6B4A3A]'
                  }`}
                >
                  {st.completed ? '✓' : st.step}
                </div>
                <div>
                  <h5 className="font-sans text-xs font-semibold text-[#2B1D17]">{st.label}</h5>
                  <p className="text-[10px] text-[#6B4A3A]">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Details & Summary Card */}
      <div className="bg-[#FAF6F0] border border-[#E7D6C1] p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-6 border-b border-[#E7D6C1] text-xs">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#6B4A3A] font-medium block mb-1">
              Destination
            </span>
            <p className="font-semibold text-[#2B1D17]">{order.customerName}</p>
            <p className="text-[#6B4A3A]">{order.shippingAddress}</p>
            <p className="text-[#6B4A3A]">{order.phone}</p>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#6B4A3A] font-medium block mb-1">
              Payment Method
            </span>
            <p className="font-semibold text-[#2B1D17]">{order.paymentMethod}</p>
            <p className="text-[#6B4A3A]">Status: Authorized & Encrypted</p>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#6B4A3A] font-medium block mb-1">
              Courier Timing
            </span>
            <p className="font-semibold text-[#2B1D17]">{order.estimatedDelivery}</p>
            <p className="text-[#6B4A3A]">Direct Salon Carrier</p>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-4 divide-y divide-[#E7D6C1]/60">
          {order.items.map((item) => (
            <div key={item.id} className="pt-4 first:pt-0 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-4">
                <img
                  src={item.product?.images?.[0] || ''}
                  alt={item.product?.name || ''}
                  referrerPolicy="no-referrer"
                  className="w-14 h-18 object-cover border border-[#E7D6C1] shrink-0"
                />
                <div>
                  <h4 className="font-sans text-sm font-semibold text-[#2B1D17]">
                    {item.product.name}
                  </h4>
                  <p className="text-[#6B4A3A] text-[11px]">
                    Shade: {item.selectedColor} &bull; Size: {item.selectedSize.toUpperCase()}
                  </p>
                  <p className="text-[#6B4A3A] text-[11px]">Qty: {item.quantity}</p>
                </div>
              </div>

              <div className="text-right font-sans text-sm font-bold text-[#2B1D17]">
                {formatPKR(item.product.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        {/* Final Math */}
        <div className="pt-6 border-t border-[#E7D6C1] space-y-2 text-xs">
          <div className="flex justify-between text-[#2B1D17]">
            <span>Subtotal</span>
            <span>{formatPKR(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-800">
              <span>Privilege Voucher Savings</span>
              <span>-{formatPKR(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-[#2B1D17]">
            <span>Courier Dispatch</span>
            <span>{order.shipping === 0 ? 'Complimentary' : formatPKR(order.shipping)}</span>
          </div>
          <div className="flex justify-between font-sans text-base font-bold text-[#2B1D17] pt-2 border-t border-[#E7D6C1]">
            <span>Total Paid (PKR)</span>
            <span>{formatPKR(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Action CTA Buttons */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <button
          onClick={handlePrint}
          className="border border-[#6B4A3A] text-[#2B1D17] hover:bg-[#E7D6C1]/30 text-xs uppercase tracking-widest font-semibold py-3.5 px-6 flex items-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4 text-[#6B4A3A]" />
          <span>Print Official Receipt</span>
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => setCurrentPage('order_tracking')}
            className="border border-[#2B1D17] bg-[#FAF6F0] hover:bg-[#E7D6C1]/30 text-[#2B1D17] text-xs uppercase tracking-widest font-semibold py-3.5 px-6 flex items-center gap-2 cursor-pointer"
          >
            <Truck className="w-4 h-4 text-[#C48A5A]" />
            <span>Track Order</span>
          </button>

          <button
            onClick={() => setCurrentPage('shop')}
            className="bg-[#2B1D17] hover:bg-[#6B4A3A] text-[#FAF6F0] text-xs uppercase tracking-widest font-semibold py-3.5 px-6 flex items-center gap-2 cursor-pointer shadow-md"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4 text-[#C48A5A]" />
          </button>
        </div>
      </div>
    </div>
  );
};
