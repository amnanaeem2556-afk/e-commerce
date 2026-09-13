import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, WishlistItem, Order, PageType } from '../types';
import { PRODUCTS } from '../data/products';
import { MOCK_PAST_ORDERS, PROMO_CODES } from '../data/constants';
import { getOptimizedImageUrl, preloadImages } from '../utils/imageOptimizer';

interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type?: 'success' | 'info' | 'luxury';
}

interface ShopContextType {
  // Navigation
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
  selectedCategoryFilter: string | null;
  setSelectedCategoryFilter: (cat: string | null) => void;
  selectedProduct: Product;
  viewProduct: (product: Product) => void;
  
  // Modals & Overlays
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  isFeedbackOpen: boolean;
  setIsFeedbackOpen: (open: boolean) => void;
  isSizeGuideOpen: boolean;
  setIsSizeGuideOpen: (open: boolean) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  
  // Cart
  cart: CartItem[];
  addToCart: (product: Product, color?: string, size?: string, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, newQty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  freeShippingThreshold: number;
  appliedPromo: string | null;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  
  // Wishlist
  wishlist: WishlistItem[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  removeFromWishlist: (productId: string) => void;
  moveWishlistToCart: (product: Product) => void;
  
  // Orders
  orders: Order[];
  latestOrder: Order | null;
  currentOrder: Order | null;
  setLatestOrder: (order: Order | null) => void;
  createOrder: (newOrder: Order) => Promise<Order>;
  placeOrder: (newOrder: Order) => Promise<Order>;
  findOrder: (orderNumber: string, email?: string) => Order | undefined;
  updateOrderStatus: (orderId: string, status: string, courierName?: string, trackingNumber?: string, paymentStatus?: string) => Promise<{ success: boolean; order?: Order; error?: string }>;
  refreshOrders: () => Promise<void>;

  // Toast
  toasts: ToastMessage[];
  addToast: (title: string, message: string, type?: 'success' | 'info' | 'luxury') => void;
  removeToast: (id: string) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product>(PRODUCTS[0]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [appliedPromo, setAppliedPromo] = useState<string | null>('LUMORA10');

  const freeShippingThreshold = 15000;

  // Cart State (Persisted)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('lumora_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed
            .map((item: any) => {
              if (!item) return null;
              if (item.product && Array.isArray(item.product.images)) {
                return item as CartItem;
              }
              const matchedProduct = PRODUCTS.find((p) => p.id === (item.productId || item.id));
              if (matchedProduct) {
                return {
                  id: item.id || `${matchedProduct.id}-${item.selectedColor || 'def'}-${item.selectedSize || 'std'}`,
                  product: matchedProduct,
                  selectedColor: item.selectedColor || matchedProduct.colors?.[0]?.name || 'Standard',
                  selectedSize: item.selectedSize || matchedProduct.sizes?.[0] || 'Standard',
                  quantity: typeof item.quantity === 'number' ? item.quantity : 1
                };
              }
              return null;
            })
            .filter((item): item is CartItem => item !== null && !!item.product && Array.isArray(item.product.images));
        }
      }
      return [
        {
          id: 'lmr-w-01-Caramel-M',
          product: PRODUCTS[0],
          selectedColor: 'Caramel',
          selectedSize: 'M',
          quantity: 1
        }
      ];
    } catch {
      return [];
    }
  });

  // Wishlist State (Persisted)
  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    try {
      const saved = localStorage.getItem('lumora_wishlist');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed
            .map((item: any) => {
              if (!item) return null;
              if (item.product && Array.isArray(item.product.images)) {
                return item as WishlistItem;
              }
              if (item.images && item.name) {
                return {
                  id: item.id,
                  product: item as Product,
                  addedAt: 'Recent'
                };
              }
              const matchedProduct = PRODUCTS.find((p) => p.id === (item.id || item.productId));
              if (matchedProduct) {
                return {
                  id: matchedProduct.id,
                  product: matchedProduct,
                  addedAt: 'Recent'
                };
              }
              return null;
            })
            .filter((item): item is WishlistItem => item !== null && !!item.product && Array.isArray(item.product.images));
        }
      }
      return [
        {
          id: PRODUCTS[1].id,
          product: PRODUCTS[1],
          addedAt: 'Recent'
        }
      ];
    } catch {
      return [];
    }
  });

  // Orders State (Persisted)
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('lumora_orders');
      const rawOrders: Order[] = saved ? JSON.parse(saved) : MOCK_PAST_ORDERS;
      if (Array.isArray(rawOrders)) {
        const seen = new Set<string>();
        return rawOrders.filter((order) => {
          if (!order || !order.id || seen.has(order.id)) return false;
          seen.add(order.id);
          return true;
        });
      }
      return MOCK_PAST_ORDERS;
    } catch {
      return MOCK_PAST_ORDERS;
    }
  });

  const [latestOrder, setLatestOrder] = useState<Order | null>(orders[0] || null);

  const refreshOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.orders) && data.orders.length > 0) {
          setOrders(data.orders);
          if (!latestOrder) {
            setLatestOrder(data.orders[0]);
          }
        }
      }
    } catch (e) {
      console.warn('Backend orders fetch failed, falling back to cached state.');
    }
  };

  useEffect(() => {
    refreshOrders();

    const handleExternalOrderUpdate = (e: any) => {
      const updated = e.detail;
      if (updated && (updated.id || updated.orderNumber)) {
        const targetId = updated.orderNumber || updated.id;
        setOrders(prev => prev.map(o => (o.id === targetId || o.orderNumber === targetId ? updated : o)));
        setLatestOrder(prev => (prev && (prev.id === targetId || prev.orderNumber === targetId) ? updated : prev));
      }
    };

    window.addEventListener('lumora:order_updated', handleExternalOrderUpdate as EventListener);
    return () => {
      window.removeEventListener('lumora:order_updated', handleExternalOrderUpdate as EventListener);
    };
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem('lumora_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('lumora_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem('lumora_orders', JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  // Proactive background pre-warming: preloads primary product images into browser cache on idle
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const warmCache = () => {
      // Gather primary optimized URLs for all catalog items
      const primaryUrls = PRODUCTS.map((p) =>
        getOptimizedImageUrl(p.images?.[0] || '', 600, 82)
      ).filter(Boolean);

      // Preload first 16 pieces immediately, then remaining in idle chunks
      const immediateBatch = primaryUrls.slice(0, 16);
      const remainingBatch = primaryUrls.slice(16);

      preloadImages(immediateBatch, 6);

      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          preloadImages(remainingBatch, 4);
        });
      } else {
        setTimeout(() => {
          preloadImages(remainingBatch, 4);
        }, 1200);
      }
    };

    // Trigger after initial render completes
    const timer = setTimeout(warmCache, 200);
    return () => clearTimeout(timer);
  }, []);

  const addToast = (title: string, message: string, type: 'success' | 'info' | 'luxury' = 'luxury') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const viewProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage('product_details');
  };

  const addToCart = (product: Product, color?: string, size?: string, quantity = 1) => {
    const chosenColor = color || product.colors[0]?.name || 'Default';
    const chosenSize = size || product.sizes[0] || 'Standard';
    const cartItemId = `${product.id}-${chosenColor}-${chosenSize}`;

    setCart(prev => {
      const existing = prev.find(item => item.id === cartItemId);
      if (existing) {
        return prev.map(item =>
          item.id === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prev, { id: cartItemId, product, selectedColor: chosenColor, selectedSize: chosenSize, quantity }];
      }
    });

    addToast('Added to Bag', `${product.name} has been placed in your shopping bag.`, 'luxury');
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
    addToast('Item Removed', 'Selected garment was removed from your bag.', 'info');
  };

  const updateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prev => prev.map(item => item.id === cartItemId ? { ...item, quantity: newQty } : item));
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (product: Product) => {
    if (!product) return;
    const exists = wishlist.some(item => item.product?.id === product.id);
    if (exists) {
      setWishlist(prev => prev.filter(item => item.product?.id !== product.id));
      addToast('Removed from Wishlist', `${product.name} removed from your saved pieces.`, 'info');
    } else {
      setWishlist(prev => [...prev, { id: product.id, product, addedAt: 'Just now' }]);
      addToast('Saved to Wishlist', `${product.name} added to your personal curation.`, 'luxury');
    }
  };

  const isInWishlist = (productId: string) => {
    if (!productId) return false;
    return wishlist.some(item => item.product?.id === productId || item.id === productId);
  };

  const removeFromWishlist = (productId: string) => {
    if (!productId) return;
    setWishlist(prev => prev.filter(item => item.product?.id !== productId && item.id !== productId));
  };

  const moveWishlistToCart = (product: Product) => {
    if (!product) return;
    addToCart(product, product.colors?.[0]?.name, product.sizes?.[0] || 'Standard', 1);
    removeFromWishlist(product.id);
  };

  // Math calculations
  const cartSubtotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const subtotal = cartSubtotal;

  let discountAmount = 0;
  if (appliedPromo && PROMO_CODES[appliedPromo]) {
    const promo = PROMO_CODES[appliedPromo];
    if (promo.type === 'percent') {
      discountAmount = Math.round((subtotal * promo.value) / 100);
    } else {
      discountAmount = Math.min(subtotal, promo.value);
    }
  }

  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 850;
  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  const applyPromoCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (PROMO_CODES[clean]) {
      setAppliedPromo(clean);
      addToast('Privilege Code Applied', `${PROMO_CODES[clean].description}`, 'luxury');
      return { success: true, message: `Promo code "${clean}" successfully applied!` };
    }
    return { success: false, message: 'Invalid or expired privilege voucher code.' };
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    addToast('Promo Removed', 'Privilege voucher code was removed.', 'info');
  };

  const createOrder = async (newOrder: Order): Promise<Order> => {
    setOrders(prev => [newOrder, ...prev.filter(o => o.id !== newOrder.id)]);
    setLatestOrder(newOrder);
    clearCart();

    // Persist to backend database and trigger real email delivery
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: newOrder.customerName,
          email: newOrder.email,
          phone: newOrder.phone,
          shippingAddress: newOrder.shippingAddress,
          city: newOrder.city || newOrder.customer?.city || 'Lahore',
          postalCode: newOrder.postalCode || newOrder.customer?.postalCode || '54000',
          paymentMethod: newOrder.paymentMethod,
          subtotal: newOrder.subtotal,
          discount: newOrder.discount,
          shippingFee: newOrder.shipping,
          total: newOrder.total,
          estimatedDelivery: newOrder.estimatedDelivery,
          items: newOrder.items
        })
      });

      const saved = await res.json();
      if (saved && (saved.id || saved.orderNumber)) {
        const freshId = saved.orderNumber || saved.id;
        const merged: Order = { ...newOrder, ...saved, id: freshId };
        setOrders(prev => prev.map(o => (o.id === newOrder.id ? merged : o)));
        setLatestOrder(merged);
        window.dispatchEvent(new CustomEvent('lumora:order_updated', { detail: merged }));
        return merged;
      }
    } catch (err) {
      console.warn('Backend order persistence error:', err);
    }
    return newOrder;
  };

  const placeOrder = async (newOrder: Order): Promise<Order> => {
    return await createOrder(newOrder);
  };

  const updateOrderStatus = async (
    orderId: string,
    status: string,
    courierName?: string,
    trackingNumber?: string,
    paymentStatus?: string
  ): Promise<{ success: boolean; order?: Order; error?: string }> => {
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, courierName, trackingNumber, paymentStatus })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to update order status.' };
      }

      if (data.order) {
        const updated = data.order;
        const targetId = updated.orderNumber || updated.id;
        setOrders(prev => prev.map(o => (o.id === targetId || o.id === orderId ? updated : o)));
        setLatestOrder(prev => (prev && (prev.id === targetId || prev.id === orderId) ? updated : prev));
        window.dispatchEvent(new CustomEvent('lumora:order_updated', { detail: updated }));
        return { success: true, order: updated };
      }
      return { success: true };
    } catch (err: any) {
      console.error('Error in updateOrderStatus:', err);
      return { success: false, error: err.message || 'Network error updating order status.' };
    }
  };

  const findOrder = (orderNumber: string, email?: string): Order | undefined => {
    const trimmedNum = orderNumber.trim().toUpperCase();
    return orders.find(o => {
      const matchesNum =
        o.id.toUpperCase() === trimmedNum ||
        (o.orderNumber && o.orderNumber.toUpperCase() === trimmedNum) ||
        (o.trackingNumber && o.trackingNumber.toUpperCase() === trimmedNum);
      if (email) {
        return matchesNum && o.email.toLowerCase().trim() === email.toLowerCase().trim();
      }
      return matchesNum;
    });
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <ShopContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        selectedCategoryFilter,
        setSelectedCategoryFilter,
        selectedProduct,
        viewProduct,
        isSearchOpen,
        setIsSearchOpen,
        quickViewProduct,
        setQuickViewProduct,
        isFeedbackOpen,
        setIsFeedbackOpen,
        isSizeGuideOpen,
        setIsSizeGuideOpen,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        subtotal,
        discountAmount,
        shippingFee,
        total,
        freeShippingThreshold,
        appliedPromo,
        applyPromoCode,
        removePromoCode,
        wishlist,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        moveWishlistToCart,
        orders,
        latestOrder,
        currentOrder: latestOrder,
        setLatestOrder,
        createOrder,
        placeOrder,
        findOrder,
        updateOrderStatus,
        refreshOrders,
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
