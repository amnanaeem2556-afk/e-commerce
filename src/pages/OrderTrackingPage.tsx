import React, { useState, useEffect } from 'react';
import { Search, Package, Truck, CheckCircle2, Clock, MapPin, AlertCircle, Phone, ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { formatPKR } from '../data/constants';
import { Order } from '../types';

export const OrderTrackingPage: React.FC = () => {
  const { currentOrder, setCurrentPage, updateOrderStatus } = useShop();

  const [searchOrderId, setSearchOrderId] = useState(currentOrder ? currentOrder.id : 'LUM-948201');
  const [searchEmail, setSearchEmail] = useState(currentOrder ? currentOrder.email : '');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  // Fetch recent orders from backend database for quick selector
  const fetchRecentOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.orders)) {
          setRecentOrders(data.orders);
        }
      }
    } catch (err) {
      console.warn('Failed to load recent orders for selector');
    }
  };

  // Perform backend tracking query using Order ID (and optional email/phone)
  const executeTrack = async (orderId: string, identifier?: string) => {
    const cleanId = orderId.trim();
    const cleanIdentifier = identifier ? identifier.trim() : '';

    // Validate Order ID
    if (!cleanId) {
      setError('Please enter your Lumora Order ID (e.g. LUM-948201).');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Fetch matching order from backend database
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: cleanId,
          identifier: cleanIdentifier
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Order not found. Please verify your Order ID.');
        setTrackedOrder(null);
      } else {
        setTrackedOrder(data);
        setError('');
      }
    } catch (err) {
      setError('An error occurred while communicating with the atelier tracking database.');
      setTrackedOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load: fetch recent orders, parse URL params, and automatically track
  useEffect(() => {
    fetchRecentOrders();

    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const urlOrderId = searchParams.get('orderId') || searchParams.get('orderNumber') || searchParams.get('track');
      const urlEmail = searchParams.get('email') || searchParams.get('identifier');

      if (urlOrderId) {
        setSearchOrderId(urlOrderId);
        if (urlEmail) {
          setSearchEmail(urlEmail);
        }
        executeTrack(urlOrderId, urlEmail || '');
        return;
      }
    }

    const initId = currentOrder ? currentOrder.id : 'LUM-948201';
    const initIdentifier = currentOrder ? currentOrder.email : '';
    executeTrack(initId, initIdentifier);
  }, [currentOrder?.id]);

  // Update timeline automatically whenever the admin changes the order status
  useEffect(() => {
    if (!trackedOrder || !searchOrderId || !searchEmail) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/orders/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: searchOrderId.trim(),
            identifier: searchEmail.trim()
          })
        });
        if (res.ok) {
          const fresh = await res.json();
          setTrackedOrder((prev) => {
            if (!prev) return fresh;
            if (prev.status !== fresh.status || prev.updatedAt !== fresh.updatedAt) {
              return fresh;
            }
            return prev;
          });
        }
      } catch (err) {
        // Silent polling
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [trackedOrder?.id, searchOrderId, searchEmail]);

  // Listen to window event for instant same-tab updates
  useEffect(() => {
    const handleOrderUpdate = (e: any) => {
      const updated = e.detail;
      if (updated && (updated.id === trackedOrder?.id || updated.orderNumber === trackedOrder?.id)) {
        setTrackedOrder(updated);
      }
    };
    window.addEventListener('lumora:order_updated', handleOrderUpdate as EventListener);
    return () => window.removeEventListener('lumora:order_updated', handleOrderUpdate as EventListener);
  }, [trackedOrder?.id]);

  // Track button submit handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeTrack(searchOrderId, searchEmail);
  };

  // Map database status to 4 key stages: Processing, Shipped, Out for Delivery, Delivered
  const getStepIndex = (status: string) => {
    const s = (status || '').toLowerCase().replace(/[\s-]/g, '_');
    switch (s) {
      case 'confirmed':
        return 1;
      case 'processing':
      case 'packed':
        return 2;
      case 'shipped':
      case 'in_transit':
        return 3;
      case 'out_for_delivery':
        return 4;
      case 'delivered':
        return 5;
      default:
        return 2;
    }
  };

  const getStatusDisplay = (status: string) => {
    const s = (status || '').toLowerCase().replace(/[\s-]/g, '_');
    switch (s) {
      case 'confirmed':
        return { label: 'Order Confirmed', pill: 'Processing', color: 'bg-amber-50 text-amber-800 border-amber-300' };
      case 'processing':
      case 'packed':
        return { label: 'Processing at Atelier', pill: 'Processing', color: 'bg-amber-50 text-amber-800 border-amber-300' };
      case 'shipped':
      case 'in_transit':
        return { label: 'Shipped & In Transit', pill: 'Shipped', color: 'bg-blue-50 text-blue-800 border-blue-300' };
      case 'out_for_delivery':
        return { label: 'Out for Delivery', pill: 'Out for Delivery', color: 'bg-purple-50 text-purple-800 border-purple-300' };
      case 'delivered':
        return { label: 'Delivered', pill: 'Delivered', color: 'bg-emerald-50 text-emerald-800 border-emerald-300' };
      default:
        return { label: 'Processing', pill: 'Processing', color: 'bg-amber-50 text-amber-800 border-amber-300' };
    }
  };

  const activeStep = trackedOrder ? getStepIndex(trackedOrder.status) : 2;
  const statusDisplay = trackedOrder ? getStatusDisplay(trackedOrder.status) : { label: 'Processing', pill: 'Processing', color: 'bg-amber-50 text-amber-800 border-amber-300' };

  const isDevMode =
    typeof window !== 'undefined' &&
    (new URLSearchParams(window.location.search).get('dev') === 'true' ||
      new URLSearchParams(window.location.search).get('staff') === 'true' ||
      new URLSearchParams(window.location.search).get('debug') === 'true');

  const trackingSteps = [
    { num: 1, label: 'Order Confirmed', desc: 'Secure payment registered' },
    {
      num: 2,
      label: 'Processing',
      desc: trackedOrder?.status === 'packed' ? 'Packed & wax sealed' : 'Atelier inspection & boxing',
    },
    {
      num: 3,
      label: 'Shipped',
      desc: trackedOrder?.status === 'in_transit' ? 'En route in transit' : 'Handed to TCS VIP Express',
    },
    { num: 4, label: 'Out for Delivery', desc: 'Courier carrying parcel' },
    { num: 5, label: 'Delivered', desc: 'Handover complete' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 space-y-8 sm:space-y-10">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#C48A5A] font-semibold">
          Live White-Glove Telemetry
        </span>
        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-[#2B1D17] tracking-[0.03em] leading-none">
          Track Your <span className="text-[#C48A5A]">Order</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#4A3528] font-normal leading-relaxed">
          Monitor your shipment from our private Lahore cutting room to your doorstep anywhere in Pakistan.
        </p>
      </div>

      {/* Search Bar Form */}
      <div className="bg-[#FAF6F0] border border-[#E7D6C1] p-5 sm:p-7 lg:p-8">
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          <div className="sm:col-span-5">
            <label className="text-xs font-medium text-[#2B1D17] block mb-1">
              Order ID
            </label>
            <input
              type="text"
              value={searchOrderId}
              onChange={(e) => setSearchOrderId(e.target.value)}
              placeholder="e.g. LUM-948201"
              className="w-full p-2.5 bg-white border border-[#E7D6C1] text-xs uppercase tracking-wider text-[#2B1D17] focus:outline-none focus:border-[#2B1D17]"
            />
          </div>

          <div className="sm:col-span-5">
            <label className="text-xs font-medium text-[#2B1D17] block mb-1">
              Email or Mobile Number <span className="text-[#8C6A58] font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="patron@domain.com or leave blank to search by ID"
              className="w-full p-2.5 bg-white border border-[#E7D6C1] text-xs text-[#2B1D17] focus:outline-none focus:border-[#2B1D17]"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2B1D17] hover:bg-[#6B4A3A] disabled:opacity-60 text-[#FAF6F0] text-xs uppercase tracking-wider font-semibold py-2.5 px-4 transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
                  <span>Tracking...</span>
                </>
              ) : (
                'Track'
              )}
            </button>
          </div>
        </form>

        {error && (
          <p className="text-xs text-red-600 font-medium mt-3 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        )}

        {/* Quick Sample Order IDs (Only in Development Mode) */}
        {isDevMode && recentOrders.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#E7D6C1]/60 flex flex-wrap items-center gap-2 text-[11px] text-[#6B4A3A]">
            <span>Recent orders (Dev):</span>
            {recentOrders.slice(0, 5).map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  setSearchOrderId(o.id);
                  setSearchEmail(o.email);
                  setError('');
                  executeTrack(o.id, o.email);
                }}
                className="underline hover:text-[#2B1D17] cursor-pointer"
              >
                {o.id}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TRACKING DETAILS CARD */}
      {trackedOrder && (
        <div className="space-y-8 animate-fadeIn">
          {/* Main Status & Courier Header */}
          <div className="bg-[#FAF6F0] border border-[#E7D6C1] p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7D6C1] pb-5">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#C48A5A] font-semibold">
                  Shipment #{trackedOrder.id}
                </span>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <h2 className="font-heading text-2xl sm:text-3xl text-[#2B1D17] tracking-[0.03em] leading-none">
                    Status:{' '}
                    <span className="capitalize text-[#2B1D17]">
                      {statusDisplay.label}
                    </span>
                  </h2>
                  <span className={`px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider border ${statusDisplay.color}`}>
                    {statusDisplay.pill}
                  </span>
                </div>
                <p className="text-xs text-[#6B4A3A] mt-1">
                  Recipient: <strong>{trackedOrder.customerName}</strong> &bull; {trackedOrder.shippingAddress}
                  {trackedOrder.city ? `, ${trackedOrder.city}` : ''}
                </p>
                <p className="text-[11px] text-[#6B4A3A] mt-0.5">
                  Contact: {trackedOrder.email} &bull; {trackedOrder.phone}
                </p>
              </div>

              <div className="text-left sm:text-right bg-[#E7D6C1]/30 p-3 sm:p-4 border border-[#E7D6C1]">
                <span className="text-[10px] uppercase tracking-wider text-[#6B4A3A] block">
                  Estimated Handover
                </span>
                <span className="font-sans text-base font-bold text-[#2B1D17]">
                  {trackedOrder.estimatedDelivery}
                </span>
                <span className="text-[10px] text-[#6B4A3A] block mt-1">
                  Updated: {new Date(trackedOrder.updatedAt || trackedOrder.createdAt || Date.now()).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Stepper Bar */}
            <div className="relative py-2">
              <div className="hidden sm:block absolute top-6 left-10 right-10 h-0.5 bg-[#E7D6C1]" />
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-2 relative z-10">
                {trackingSteps.map((st) => {
                  const isDone = st.num <= activeStep;
                  const isCurrent = st.num === activeStep;

                  return (
                    <div
                      key={st.num}
                      className="flex sm:flex-col items-center gap-3 sm:gap-2 text-left sm:text-center"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                          isCurrent
                            ? 'bg-[#C48A5A] text-[#2B1D17] ring-4 ring-[#C48A5A]/30 animate-pulse'
                            : isDone
                            ? 'bg-[#2B1D17] text-[#FAF6F0]'
                            : 'bg-[#E7D6C1] text-[#6B4A3A]'
                        }`}
                      >
                        {isDone && !isCurrent ? '✓' : st.num}
                      </div>
                      <div>
                        <h4 className="font-sans text-xs font-semibold text-[#2B1D17]">
                          {st.label}
                        </h4>
                        <p className="text-[10px] text-[#6B4A3A] leading-tight mt-0.5">
                          {st.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Courier Carrier Dispatch Details */}
            <div className="pt-4 border-t border-[#E7D6C1] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-white/60 border border-[#E7D6C1]">
                <span className="text-[10px] uppercase tracking-wider text-[#6B4A3A] block mb-0.5">
                  Courier Partner
                </span>
                <p className="font-semibold text-[#2B1D17]">{trackedOrder.courierName || 'TCS White-Glove VIP Express'}</p>
                <p className="text-[#6B4A3A] text-[11px]">
                  Tracking Number: #{trackedOrder.trackingNumber || `AWB-${trackedOrder.id.replace('LUM-', '')}-PK`}
                </p>
              </div>

              <div className="p-3 bg-white/60 border border-[#E7D6C1]">
                <span className="text-[10px] uppercase tracking-wider text-[#6B4A3A] block mb-0.5">
                  Payment Status
                </span>
                <p className="font-semibold text-[#2B1D17] capitalize">{trackedOrder.paymentStatus || 'Completed'}</p>
                <p className="text-[#6B4A3A] text-[11px] truncate">{trackedOrder.paymentMethod}</p>
              </div>

              <div className="p-3 bg-white/60 border border-[#E7D6C1]">
                <span className="text-[10px] uppercase tracking-wider text-[#6B4A3A] block mb-0.5">
                  Packaging & Telemetry
                </span>
                <p className="font-semibold text-[#2B1D17]">Archival Gift Boxed & Sealed</p>
                <p className="text-[#6B4A3A] text-[11px]">
                  Last Updated: {new Date(trackedOrder.updatedAt || trackedOrder.createdAt || Date.now()).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Admin Quick Status Controls (Only in Development Mode) */}
          {isDevMode && (
            <div className="bg-[#FAF6F0] border border-[#E7D6C1] p-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#C48A5A] block">
                    Atelier Staff Status Controls (Dev Mode)
                  </span>
                  <span className="text-[11px] text-[#6B4A3A]">
                    Update #{trackedOrder.id} status in live database to test timeline reaction:
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { key: 'confirmed', label: 'Confirmed' },
                    { key: 'processing', label: 'Processing' },
                    { key: 'packed', label: 'Packed' },
                    { key: 'shipped', label: 'Shipped' },
                    { key: 'in_transit', label: 'In Transit' },
                    { key: 'out_for_delivery', label: 'Out for Delivery' },
                    { key: 'delivered', label: 'Delivered' }
                  ].map((st) => (
                    <button
                      key={st.key}
                      type="button"
                      onClick={async () => {
                        const res = await updateOrderStatus(trackedOrder.id, st.key);
                        if (res.success && res.order) {
                          setTrackedOrder(res.order);
                        }
                      }}
                      className={`px-2 py-1 text-[10px] uppercase font-semibold transition-all cursor-pointer ${
                        trackedOrder.status === st.key
                          ? 'bg-[#2B1D17] text-[#FAF6F0] ring-2 ring-[#C48A5A]'
                          : 'bg-white border border-[#E7D6C1] text-[#2B1D17] hover:bg-[#E7D6C1]/50'
                      }`}
                    >
                      {trackedOrder.status === st.key ? `✓ ${st.label}` : st.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Items In Parcel */}
          <div className="bg-[#FAF6F0] border border-[#E7D6C1] p-6 sm:p-8 space-y-4">
            <h3 className="font-heading text-2xl sm:text-3xl text-[#2B1D17] border-b border-[#E7D6C1] pb-3 tracking-[0.03em] leading-none">
              Items in Shipment ({trackedOrder.items.length})
            </h3>

            <div className="space-y-3 divide-y divide-[#E7D6C1]/60">
              {trackedOrder.items.map((item, idx) => (
                <div key={item.id || idx} className="pt-3 first:pt-0 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product?.images?.[0] || ''}
                      alt={item.product?.name || ''}
                      referrerPolicy="no-referrer"
                      className="w-12 h-16 object-cover border border-[#E7D6C1]"
                    />
                    <div>
                      <h4 className="font-sans text-sm font-semibold text-[#2B1D17]">
                        {item.product?.name || 'Lumora Creation'}
                      </h4>
                      <p className="text-[#6B4A3A]">
                        {item.selectedColor} &bull; Size {item.selectedSize?.toUpperCase()}
                      </p>
                      <p className="text-[#6B4A3A]">Qty: {item.quantity}</p>
                    </div>
                  </div>

                  <span className="font-sans text-sm font-semibold text-[#2B1D17]">
                    {formatPKR((item.product?.price || item.price || 0) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#E7D6C1] flex justify-between items-baseline text-xs">
              <span className="font-sans text-base font-bold text-[#2B1D17]">Total Parcel Value</span>
              <span className="font-sans text-xl font-bold text-[#2B1D17]">
                {formatPKR(trackedOrder.total)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
