import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, WishlistItem, Order, PageType, AdminUser } from '../types';
import { PRODUCTS } from '../data/products';
import { MOCK_PAST_ORDERS, PROMO_CODES } from '../data/constants';
import { getOptimizedImageUrl, preloadImages } from '../utils/imageOptimizer';
import { getApiUrl } from '../config/api';

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
  updateOrderStatus: (orderId: string, status: string, courierName?: string, trackingNumber?: string, paymentStatus?: string) => Promise<{
    success: boolean;
    order?: Order;
    error?: string;
    statusEmailSent?: boolean;
    statusEmailProvider?: string;
    statusEmailMessageId?: string;
    statusEmailError?: string;
  }>;
  refreshOrders: () => Promise<void>;

  // Admin Authentication & Governance
  adminUser: AdminUser | null;
  adminToken: string | null;
  isAdminAuthenticated: boolean;
  adminAuthLoading: boolean;
  ownerStatus: {
    hasOwner: boolean;
    isVerified: boolean;
    ownerEmailMasked?: string;
    ownerName?: string;
  } | null;
  checkAdminAuthStatus: () => Promise<{ hasOwner: boolean; isVerified: boolean; ownerEmailMasked?: string; ownerName?: string }>;
  loginAdmin: (email: string, password: string, rememberMe?: boolean) => Promise<{
    success: boolean;
    error?: string;
    requiresVerification?: boolean;
    email?: string;
  }>;
  signupAdmin: (data: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => Promise<{
    success: boolean;
    error?: string;
    email?: string;
    previewCode?: string;
  }>;
  verifyAdminEmail: (email: string, code: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  resendAdminCode: (email: string) => Promise<{
    success: boolean;
    error?: string;
    previewCode?: string;
  }>;
  forgotAdminPassword: (email: string) => Promise<{
    success: boolean;
    error?: string;
    previewToken?: string;
  }>;
  resetAdminPassword: (data: {
    email: string;
    token: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<{
    success: boolean;
    error?: string;
  }>;
  logoutAdmin: () => Promise<void>;

  // Toast
  toasts: ToastMessage[];
  addToast: (title: string, message: string, type?: 'success' | 'info' | 'luxury') => void;
  removeToast: (id: string) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getInitialPage = (): PageType => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname.toLowerCase();
      if (pathname.includes('/admin') || pathname.includes('/dashboard')) {
        return 'admin';
      }
      const params = new URLSearchParams(window.location.search);
      const pageParam = params.get('page');
      if (pageParam === 'order_tracking' || pageParam === 'track' || pageParam === 'tracking') {
        return 'order_tracking';
      }
      if (params.get('orderId') || params.get('orderNumber')) {
        return 'order_tracking';
      }
      if (
        pageParam &&
        [
          'home',
          'shop',
          'women',
          'men',
          'watches',
          'shoes',
          'accessories',
          'new_arrivals',
          'sale',
          'cart',
          'wishlist',
          'checkout',
          'order_success',
          'order_tracking',
          'admin',
          'admin_auth',
          'admin_login',
          'admin_signup',
          'admin_verify',
          'admin_forgot_password',
          'admin_reset_password',
          'reviews',
          'about',
          'help_support'
        ].includes(pageParam)
      ) {
        return pageParam as PageType;
      }
      if (window.location.hash.includes('order_tracking') || window.location.hash.includes('track')) {
        return 'order_tracking';
      }
      if (window.location.hash.includes('admin') || window.location.hash.includes('dashboard')) {
        return 'admin';
      }
    }
    return 'home';
  };

  const [currentPage, setCurrentPageRaw] = useState<PageType>(getInitialPage);

  const setCurrentPage = (page: PageType) => {
    setCurrentPageRaw(page);
    try {
      const url = new URL(window.location.href);
      if (page === 'home') {
        url.searchParams.delete('page');
      } else {
        url.searchParams.set('page', page);
      }
      window.history.pushState({}, '', url.toString());
    } catch {}
  };

  useEffect(() => {
    const handlePopState = () => {
      const freshPage = getInitialPage();
      setCurrentPageRaw(freshPage);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product>(PRODUCTS[0]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
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
      const res = await fetch(getApiUrl('/api/admin/orders'));
      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (data && Array.isArray(data.orders) && data.orders.length > 0) {
            setOrders(data.orders);
            if (!latestOrder) {
              setLatestOrder(data.orders[0]);
            }
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
      const res = await fetch(getApiUrl('/api/orders'), {
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

  // Admin Authentication State
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lumora_admin_token') || sessionStorage.getItem('lumora_admin_token');
    }
    return null;
  });

  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('lumora_admin_user') || sessionStorage.getItem('lumora_admin_user');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {}
      }
    }
    return null;
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(Boolean(adminToken && adminUser));
  const [adminAuthLoading, setAdminAuthLoading] = useState<boolean>(true);
  const [ownerStatus, setOwnerStatus] = useState<{
    hasOwner: boolean;
    isVerified: boolean;
    ownerEmailMasked?: string;
    ownerName?: string;
  } | null>(null);

  const checkAdminAuthStatus = async () => {
    try {
      const res = await fetch(getApiUrl('/api/admin/auth/status'));
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        setOwnerStatus(data);
        return data;
      }
    } catch (err) {
      console.warn('Failed to fetch admin owner status:', err);
    }
    return { hasOwner: false, isVerified: false };
  };

  // Synchronize and validate admin authentication on initial mount
  useEffect(() => {
    const initAuth = async () => {
      setAdminAuthLoading(true);
      await checkAdminAuthStatus();

      const activeToken = localStorage.getItem('lumora_admin_token') || sessionStorage.getItem('lumora_admin_token');
      if (activeToken) {
        try {
          const res = await fetch(getApiUrl('/api/admin/auth/me'), {
            headers: { Authorization: `Bearer ${activeToken}` }
          });
          const contentType = res.headers.get('content-type') || '';
          if (res.ok && contentType.includes('application/json')) {
            const data = await res.json();
            if (data.authenticated && data.user) {
              setAdminUser(data.user);
              setAdminToken(activeToken);
              setIsAdminAuthenticated(true);
              setAdminAuthLoading(false);
              return;
            }
          }
        } catch (err) {
          console.warn('Admin token validation exception:', err);
        }
      }

      // If token missing or validation failed
      setAdminUser(null);
      setAdminToken(null);
      setIsAdminAuthenticated(false);
      localStorage.removeItem('lumora_admin_token');
      localStorage.removeItem('lumora_admin_user');
      sessionStorage.removeItem('lumora_admin_token');
      sessionStorage.removeItem('lumora_admin_user');
      setAdminAuthLoading(false);
    };

    initAuth();
  }, []);

  const loginAdmin = async (email: string, password: string, rememberMe = false) => {
    try {
      const res = await fetch(getApiUrl('/api/admin/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe })
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        return {
          success: false,
          error: 'Backend API returned an HTML document instead of JSON. Ensure your Express server is active and accessible.'
        };
      }

      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          error: data.error || 'Failed to authenticate.',
          requiresVerification: data.requiresVerification,
          email: data.email
        };
      }

      setAdminToken(data.token);
      setAdminUser(data.user);
      setIsAdminAuthenticated(true);

      if (rememberMe) {
        localStorage.setItem('lumora_admin_token', data.token);
        localStorage.setItem('lumora_admin_user', JSON.stringify(data.user));
      } else {
        sessionStorage.setItem('lumora_admin_token', data.token);
        sessionStorage.setItem('lumora_admin_user', JSON.stringify(data.user));
      }

      await checkAdminAuthStatus();
      addToast('Maison Access Granted', `Welcome, ${data.user.firstName || 'Store Owner'}.`, 'success');
      setCurrentPage('admin');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during login.' };
    }
  };

  const signupAdmin = async (formData: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    try {
      const res = await fetch(getApiUrl('/api/admin/auth/signup'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        return { success: false, error: 'Backend API returned an HTML document instead of JSON.' };
      }

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Sign up failed.' };
      }

      await checkAdminAuthStatus();
      addToast(
        'Owner Credentials Registered',
        'Authorization passcode dispatched to your email for verification.',
        'success'
      );

      return {
        success: true,
        email: data.email,
        previewCode: data.verificationCodePreview
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during registration.' };
    }
  };

  const verifyAdminEmail = async (email: string, code: string) => {
    try {
      const res = await fetch(getApiUrl('/api/admin/auth/verify'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        return { success: false, error: 'Backend API returned an HTML document instead of JSON.' };
      }

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Verification failed.' };
      }

      setAdminToken(data.token);
      setAdminUser(data.user);
      setIsAdminAuthenticated(true);

      localStorage.setItem('lumora_admin_token', data.token);
      localStorage.setItem('lumora_admin_user', JSON.stringify(data.user));

      await checkAdminAuthStatus();
      addToast('Owner Credentials Verified', 'Access granted to Atelier Administrative Console.', 'success');
      setCurrentPage('admin');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during verification.' };
    }
  };

  const resendAdminCode = async (email: string) => {
    try {
      const res = await fetch(getApiUrl('/api/admin/auth/resend-code'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        return { success: false, error: 'Backend API returned an HTML document instead of JSON.' };
      }

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to resend code.' };
      }

      addToast('Passcode Dispatched', 'A fresh 6-digit authorization passcode has been sent to your email.', 'info');
      return {
        success: true,
        previewCode: data.verificationCodePreview
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error resending passcode.' };
    }
  };

  const forgotAdminPassword = async (email: string) => {
    try {
      const res = await fetch(getApiUrl('/api/admin/auth/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        return { success: false, error: 'Backend API returned an HTML document instead of JSON.' };
      }

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to send recovery instructions.' };
      }

      addToast('Recovery Email Sent', 'Please check your inbox for the password reset instructions.', 'info');
      return {
        success: true,
        previewToken: data.resetTokenPreview
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error sending recovery instructions.' };
    }
  };

  const resetAdminPassword = async (formData: {
    email: string;
    token: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    try {
      const res = await fetch(getApiUrl('/api/admin/auth/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        return { success: false, error: 'Backend API returned an HTML document instead of JSON.' };
      }

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to reset password.' };
      }

      addToast('Password Updated', 'Administrative password updated successfully. Please log in.', 'success');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error resetting password.' };
    }
  };

  const logoutAdmin = async () => {
    try {
      await fetch(getApiUrl('/api/admin/auth/logout'), { method: 'POST' });
    } catch {}

    setAdminToken(null);
    setAdminUser(null);
    setIsAdminAuthenticated(false);
    localStorage.removeItem('lumora_admin_token');
    localStorage.removeItem('lumora_admin_user');
    sessionStorage.removeItem('lumora_admin_token');
    sessionStorage.removeItem('lumora_admin_user');

    addToast('Signed Out', 'Administrative session closed securely.', 'info');
    setCurrentPage('home');
  };

  const updateOrderStatus = async (
    orderId: string,
    status: string,
    courierName?: string,
    trackingNumber?: string,
    paymentStatus?: string
  ): Promise<{
    success: boolean;
    order?: Order;
    error?: string;
    statusEmailSent?: boolean;
    statusEmailProvider?: string;
    statusEmailMessageId?: string;
    statusEmailError?: string;
  }> => {
    try {
      const res = await fetch(getApiUrl(`/api/admin/orders/${encodeURIComponent(orderId)}/status`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {})
        },
        body: JSON.stringify({ status, courierName, trackingNumber, paymentStatus })
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        return { success: false, error: 'Backend API returned an HTML document instead of JSON.' };
      }

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          logoutAdmin();
        }
        return { success: false, error: data.error || 'Failed to update order status.' };
      }

      if (data.order) {
        const updated = data.order;
        const targetId = updated.orderNumber || updated.id;
        setOrders(prev => prev.map(o => (o.id === targetId || o.id === orderId ? updated : o)));
        setLatestOrder(prev => (prev && (prev.id === targetId || prev.id === orderId) ? updated : prev));
        window.dispatchEvent(new CustomEvent('lumora:order_updated', { detail: updated }));
        return {
          success: true,
          order: updated,
          statusEmailSent: data.statusEmailSent,
          statusEmailProvider: data.statusEmailProvider,
          statusEmailMessageId: data.statusEmailMessageId,
          statusEmailError: data.statusEmailError
        };
      }
      return {
        success: true,
        statusEmailSent: data.statusEmailSent,
        statusEmailProvider: data.statusEmailProvider,
        statusEmailMessageId: data.statusEmailMessageId,
        statusEmailError: data.statusEmailError
      };
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
        adminUser,
        adminToken,
        isAdminAuthenticated,
        adminAuthLoading,
        ownerStatus,
        checkAdminAuthStatus,
        loginAdmin,
        signupAdmin,
        verifyAdminEmail,
        resendAdminCode,
        forgotAdminPassword,
        resetAdminPassword,
        logoutAdmin,
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
