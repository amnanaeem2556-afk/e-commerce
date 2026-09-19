import React, { useEffect } from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { QuickViewModal } from './components/QuickViewModal';
import { SearchModal } from './components/SearchModal';
import { SizeGuideModal } from './components/SizeGuideModal';
import { FloatingFeedback } from './components/FloatingFeedback';
import { FloatingSupport } from './components/FloatingSupport';
import { ToastContainer } from './components/ToastContainer';

// Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { WishlistPage } from './pages/WishlistPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { AdminOrdersPage } from './pages/AdminOrdersPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { AboutPage } from './pages/AboutPage';
import { HelpSupportPage } from './pages/HelpSupportPage';

const AppContent: React.FC = () => {
  const { currentPage } = useShop();

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;

      case 'shop':
        return <ShopPage key="shop" />;

      case 'women':
        return (
          <ShopPage
            key="women"
            initialCategory="women"
            pageTitle="Women’s Atelier"
            pageSubtitle="Cocoon double-faced cashmere coats, bias-cut Como silk slips, and architectural wool flannel trousers."
          />
        );

      case 'men':
        return (
          <ShopPage
            key="men"
            initialCategory="men"
            pageTitle="Men’s Sartorial"
            pageSubtitle="Deconstructed virgin wool tailoring, hand-finished horn buttons, and breathable Italian linen shirting."
          />
        );

      case 'watches':
        return (
          <ShopPage
            key="watches"
            initialCategory="watches"
            pageTitle="Horology & Timepieces"
            pageSubtitle="Swiss-automatic calibers, sapphire crystals with anti-reflective coating, and exhibition casebacks."
          />
        );

      case 'shoes':
        return (
          <ShopPage
            key="shoes"
            initialCategory="shoes"
            pageTitle="Artisanal Footwear"
            pageSubtitle="Blake-stitched French calfskin penny loafers, Belgian slippers, and hand-burnished Chelsea boots."
          />
        );

      case 'accessories':
        return (
          <ShopPage
            key="accessories"
            initialCategory="accessories"
            pageTitle="Leather Goods & Accessories"
            pageSubtitle="Full-grain vegetable-tanned Tuscan leather, custom palladium hardware, and cashmere fringe scarves."
          />
        );

      case 'new_arrivals':
        return (
          <ShopPage
            key="new_arrivals"
            filterOnlyNew={true}
            pageTitle="New Season Releases"
            pageSubtitle="The latest limited-run creations crafted in our Northern Italy and Lahore cutting rooms."
          />
        );

      case 'sale':
        return (
          <ShopPage
            key="sale"
            filterOnlySale={true}
            pageTitle="Privileged Archive Deals"
            pageSubtitle="Limited archival inventory offered with courtesy seasonal savings for esteemed patrons."
          />
        );

      case 'product_details':
        return <ProductDetailPage />;

      case 'cart':
        return <CartPage />;

      case 'wishlist':
        return <WishlistPage />;

      case 'checkout':
        return <CheckoutPage />;

      case 'order_success':
        return <OrderSuccessPage />;

      case 'order_tracking':
        return <OrderTrackingPage />;

      case 'admin':
        return <AdminOrdersPage />;

      case 'reviews':
        return <ReviewsPage />;

      case 'about':
        return <AboutPage />;

      case 'help_support':
        return <HelpSupportPage />;

      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6F0] text-[#2B1D17] font-sans antialiased selection:bg-[#C48A5A]/30 selection:text-[#2B1D17] overflow-x-hidden max-w-[100vw]">
      {/* Top Announcement Bar */}
      <AnnouncementBar />

      {/* Sticky Navigation Header */}
      <Navbar />

      {/* Main Page Render */}
      <main className="flex-1 overflow-x-hidden max-w-[100vw] w-full">
        {renderCurrentPage()}
      </main>

      {/* Luxury Footer with Trust Badges & Newsletter */}
      <Footer />

      {/* Global Interactive Modals & Floating Buttons */}
      <QuickViewModal />
      <SearchModal />
      <SizeGuideModal />
      <FloatingFeedback />
      <FloatingSupport />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ShopProvider>
      <AppContent />
    </ShopProvider>
  );
}
