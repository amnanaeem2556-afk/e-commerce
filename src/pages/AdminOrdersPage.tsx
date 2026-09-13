import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle2, Clock, Search, ArrowRight, RefreshCw, ShieldCheck, ExternalLink, Mail, Send, AlertTriangle } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { formatPKR } from '../data/constants';
import { Order } from '../types';

const STATUS_CONFIG: Record<string, { label: string; color: string; badge: string }> = {
  confirmed: { label: 'Confirmed', color: '#6B4A3A', badge: 'bg-[#E7D6C1]/50 text-[#2B1D17]' },
  processing: { label: 'Processing', color: '#C48A5A', badge: 'bg-[#C48A5A]/20 text-[#6B4A3A]' },
  packed: { label: 'Packed', color: '#B87333', badge: 'bg-[#B87333]/20 text-[#2B1D17]' },
  shipped: { label: 'Shipped', color: '#2B1D17', badge: 'bg-[#2B1D17] text-[#FAF6F0]' },
  in_transit: { label: 'In Transit', color: '#4A3B32', badge: 'bg-[#4A3B32] text-[#FAF6F0]' },
  out_for_delivery: { label: 'Out for Delivery', color: '#8C5835', badge: 'bg-[#8C5835] text-white' },
  delivered: { label: 'Delivered', color: '#2E5A36', badge: 'bg-[#2E5A36] text-white' },
};

export const AdminOrdersPage: React.FC = () => {
  const { setCurrentPage, updateOrderStatus, addToast } = useShop();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [emailSendingId, setEmailSendingId] = useState<string | null>(null);

  // Email System Audit state
  const [emailAudit, setEmailAudit] = useState<{
    configured: boolean;
    provider: string;
    senderEmail: string;
    details: string;
  } | null>(null);
  const [testEmailInput, setTestEmailInput] = useState('amna.naeem2556@gmail.com');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchEmailAudit = async () => {
    try {
      const res = await fetch('/api/email/status');
      if (res.ok) {
        const data = await res.json();
        setEmailAudit(data);
      }
    } catch (e) {
      console.warn('Failed to fetch email audit:', e);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error('Failed to fetch admin orders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchEmailAudit();

    const handleExternal = (e: any) => {
      const updated = e.detail;
      if (updated) {
        setOrders(prev => prev.map(o => (o.id === updated.id || o.orderNumber === updated.id ? updated : o)));
      }
    };
    window.addEventListener('lumora:order_updated', handleExternal as EventListener);
    return () => window.removeEventListener('lumora:order_updated', handleExternal as EventListener);
  }, []);

  const handleSendOrderEmail = async (order: Order) => {
    setEmailSendingId(order.id);
    try {
      const res = await fetch(`/api/orders/${order.id}/resend-email`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setOrders(prev =>
          prev.map(o => (o.id === order.id ? { ...o, emailSent: true, emailProvider: data.provider } : o))
        );
        addToast(
          'Email Dispatched',
          `Confirmation email delivered to ${order.email} via ${data.provider.toUpperCase()}.`,
          'success'
        );
      } else {
        setOrders(prev =>
          prev.map(o => (o.id === order.id ? { ...o, emailSent: false, emailError: data.error } : o))
        );
        addToast(
          'Email Delivery Failed',
          data.error || 'Provider rejected email dispatch.',
          'luxury'
        );
      }
    } catch (err: any) {
      addToast('Error', err.message || 'Connection error sending email.', 'luxury');
    } finally {
      setEmailSendingId(null);
    }
  };

  const handleTestEmailDispatch = async () => {
    if (!testEmailInput || !testEmailInput.includes('@')) {
      setTestResult({ success: false, message: 'Please enter a valid email address.' });
      return;
    }
    setIsSendingTest(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testEmailInput.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: `Confirmation email delivered to ${testEmailInput}! Provider: ${data.provider.toUpperCase()} (ID: ${data.messageId || 'OK'})`
        });
        addToast('Test Email Succeeded', `Delivered to ${testEmailInput}`, 'success');
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Provider rejected delivery. Please check API key / sender domain in Settings.'
        });
        addToast('Test Failed', data.error || 'Delivery refused', 'luxury');
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Network failure' });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await updateOrderStatus(orderId, newStatus);
      if (res.success && res.order) {
        setOrders(prev => prev.map(o => (o.id === orderId || o.orderNumber === orderId ? res.order! : o)));
        addToast('Status Synchronized', `Order #${orderId} updated to "${STATUS_CONFIG[newStatus]?.label || newStatus}". Live tracking reflects this change instantly.`, 'success');
      } else {
        addToast('Update Failed', res.error || 'Could not update status.', 'luxury');
      }
    } catch (err) {
      addToast('Error', 'Connection error updating status.', 'luxury');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter(o => {
    const term = searchTerm.toLowerCase();
    return (
      (o.id && o.id.toLowerCase().includes(term)) ||
      (o.customerName && o.customerName.toLowerCase().includes(term)) ||
      (o.email && o.email.toLowerCase().includes(term)) ||
      (o.phone && o.phone.toLowerCase().includes(term)) ||
      (o.status && o.status.toLowerCase().includes(term))
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7D6C1] pb-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#C48A5A] font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Atelier Administrative Console
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#2B1D17] font-normal mt-1">
            Order Fulfillment & Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-[#6B4A3A] font-light mt-1">
            Live database records. Status updates reflect instantly on customer tracking screens.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 bg-[#FAF6F0] border border-[#E7D6C1] hover:border-[#2B1D17] text-xs text-[#2B1D17] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Database</span>
          </button>
          <button
            onClick={() => setCurrentPage('order_tracking')}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#2B1D17] hover:bg-[#6B4A3A] text-xs text-[#FAF6F0] transition-colors cursor-pointer"
          >
            <span>Customer Tracking View</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Email Gateway Audit & Test Suite */}
      <div className="bg-[#FAF6F0] border border-[#E7D6C1] p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E7D6C1] pb-3">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#C48A5A]" />
            <h3 className="font-serif text-sm font-semibold text-[#2B1D17]">
              Transactional Email Gateway Audit
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#6B4A3A]">Service Status:</span>
            <span
              className={`px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider border ${
                emailAudit?.configured
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-rose-100 text-rose-800 border-rose-300'
              }`}
            >
              {emailAudit?.provider ? emailAudit.provider.toUpperCase() : 'CHECKING...'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-white p-3 border border-[#E7D6C1]">
            <span className="text-[10px] text-[#C48A5A] uppercase font-semibold block mb-1">Configuration & Sender</span>
            <p className="text-[#2B1D17] font-medium">{emailAudit?.details || 'Querying system...'}</p>
            <p className="text-[11px] text-[#6B4A3A] mt-1">Sender Domain: <code className="text-[#2B1D17] font-mono">{emailAudit?.senderEmail || 'Default'}</code></p>
          </div>

          <div className="bg-white p-3 border border-[#E7D6C1] space-y-2">
            <span className="text-[10px] text-[#C48A5A] uppercase font-semibold block">Send Real Test Email</span>
            <div className="flex gap-2">
              <input
                type="email"
                value={testEmailInput}
                onChange={(e) => setTestEmailInput(e.target.value)}
                placeholder="e.g. amna.naeem2556@gmail.com"
                className="flex-1 bg-[#FAF6F0] border border-[#E7D6C1] px-2.5 py-1 text-xs text-[#2B1D17] focus:outline-none focus:border-[#C48A5A]"
              />
              <button
                onClick={handleTestEmailDispatch}
                disabled={isSendingTest}
                className="px-3 py-1 bg-[#2B1D17] hover:bg-[#6B4A3A] disabled:opacity-50 text-[#FAF6F0] text-[11px] uppercase font-semibold cursor-pointer whitespace-nowrap flex items-center gap-1.5"
              >
                {isSendingTest ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3 text-[#C48A5A]" />}
                <span>Send Test</span>
              </button>
            </div>
            {testResult && (
              <p className={`text-[11px] ${testResult.success ? 'text-emerald-800' : 'text-rose-800'}`}>
                {testResult.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-[#FAF6F0] border border-[#E7D6C1] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B4A3A]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Order ID, name, email, or phone..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#E7D6C1] text-xs text-[#2B1D17] focus:outline-none focus:border-[#2B1D17]"
          />
        </div>
        <div className="text-xs text-[#6B4A3A]">
          Showing <strong>{filteredOrders.length}</strong> of <strong>{orders.length}</strong> orders
        </div>
      </div>

      {/* Orders Table / List */}
      {loading ? (
        <div className="text-center py-16 bg-[#FAF6F0] border border-[#E7D6C1]">
          <div className="w-6 h-6 border-2 border-[#C48A5A] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#6B4A3A]">Loading atelier orders from database...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-[#FAF6F0] border border-[#E7D6C1]">
          <Package className="w-8 h-8 text-[#C48A5A] mx-auto mb-2 opacity-60" />
          <p className="text-sm font-serif text-[#2B1D17]">No matching orders found</p>
          <p className="text-xs text-[#6B4A3A] mt-1">Try refining your search term or refreshing.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isUpdating = updatingId === order.id;
            const currentStatus = (order.status || 'confirmed').toLowerCase().replace(/[\s-]/g, '_');

            return (
              <div
                key={order.id}
                className="bg-[#FAF6F0] border border-[#E7D6C1] p-5 sm:p-6 space-y-4 transition-all hover:border-[#C48A5A]"
              >
                {/* Top Row: ID, Date, Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E7D6C1]/60 pb-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-serif text-lg font-bold text-[#2B1D17]">
                      #{order.id}
                    </span>
                    <span className={`px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-sm ${STATUS_CONFIG[currentStatus]?.badge || 'bg-gray-200 text-gray-800'}`}>
                      {STATUS_CONFIG[currentStatus]?.label || order.status}
                    </span>
                    <span className="text-xs text-[#6B4A3A]">
                      Courier: <strong>{order.courierName || 'TCS White-Glove VIP Express'}</strong>
                    </span>
                    <span className="text-xs text-[#6B4A3A]">
                      AWB: <strong>{order.trackingNumber || `AWB-${order.id.replace('LUM-', '')}-PK`}</strong>
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-sm inline-flex items-center gap-1 ${
                        order.emailSent
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <Mail className="w-3 h-3" />
                      {order.emailSent ? 'Email Dispatched' : 'Email Unsent / Failed'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-[#6B4A3A]">
                    <span>
                      Placed: {new Date(order.createdAt || Date.now()).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="font-serif font-bold text-[#2B1D17] text-sm">
                      {formatPKR(order.total)}
                    </span>
                  </div>
                </div>

                {/* Middle Row: Customer Info & Items */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-white/70 border border-[#E7D6C1] flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[#C48A5A] font-semibold block mb-1">
                        Customer Information
                      </span>
                      <p className="font-bold text-[#2B1D17]">{order.customerName}</p>
                      <p className="text-[#6B4A3A] mt-0.5">Email: {order.email}</p>
                      <p className="text-[#6B4A3A]">Phone: {order.phone}</p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-[#E7D6C1]/60">
                      <button
                        onClick={() => handleSendOrderEmail(order)}
                        disabled={emailSendingId === order.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#2B1D17] hover:bg-[#6B4A3A] disabled:opacity-50 text-[#FAF6F0] text-[10.5px] uppercase tracking-wider font-semibold cursor-pointer transition-colors"
                      >
                        {emailSendingId === order.id ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <Mail className="w-3 h-3 text-[#C48A5A]" />
                        )}
                        <span>{emailSendingId === order.id ? 'Sending...' : 'Send Confirmation Email'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-white/70 border border-[#E7D6C1]">
                    <span className="text-[10px] uppercase tracking-wider text-[#C48A5A] font-semibold block mb-1">
                      Shipping & Handover
                    </span>
                    <p className="text-[#2B1D17]">{order.shippingAddress}</p>
                    <p className="text-[#6B4A3A] mt-0.5">{order.city || 'Lahore'} {order.postalCode || '54000'}</p>
                    <p className="text-[#6B4A3A] mt-0.5">Est. Delivery: {order.estimatedDelivery}</p>
                  </div>

                  <div className="p-3 bg-white/70 border border-[#E7D6C1]">
                    <span className="text-[10px] uppercase tracking-wider text-[#C48A5A] font-semibold block mb-1">
                      Payment Telemetry
                    </span>
                    <p className="font-semibold text-[#2B1D17]">{order.paymentMethod}</p>
                    <p className="text-[#6B4A3A] mt-0.5">Status: <strong className="text-[#2B1D17]">{order.paymentStatus || 'Completed'}</strong></p>
                    <p className="text-[11px] text-[#6B4A3A] mt-1">
                      Last Updated: {new Date(order.updatedAt || order.createdAt || Date.now()).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </p>
                  </div>
                </div>

                {/* Status Update Button Bar: Confirmed, Processing, Packed, Shipped, In Transit, Out for Delivery, Delivered */}
                <div className="pt-3 border-t border-[#E7D6C1]/60">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-[11px] font-semibold text-[#2B1D17] uppercase tracking-wider">
                      Update Order Status:
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[
                        { key: 'confirmed', label: 'Confirmed' },
                        { key: 'processing', label: 'Processing' },
                        { key: 'packed', label: 'Packed' },
                        { key: 'shipped', label: 'Shipped' },
                        { key: 'in_transit', label: 'In Transit' },
                        { key: 'out_for_delivery', label: 'Out for Delivery' },
                        { key: 'delivered', label: 'Delivered' },
                      ].map((st) => {
                        const isActive = currentStatus === st.key;
                        return (
                          <button
                            key={st.key}
                            onClick={() => handleStatusChange(order.id, st.key)}
                            disabled={isUpdating}
                            className={`px-2.5 py-1 text-[11px] font-medium transition-all cursor-pointer ${
                              isActive
                                ? 'bg-[#2B1D17] text-[#FAF6F0] ring-2 ring-[#C48A5A] font-semibold'
                                : 'bg-white border border-[#E7D6C1] text-[#2B1D17] hover:bg-[#E7D6C1]/40'
                            } disabled:opacity-50`}
                          >
                            {isActive ? `✓ ${st.label}` : st.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
