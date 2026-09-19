import React, { useState, useEffect } from 'react';
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown, ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { PageType } from '../types';
import { COLLECTION_HEROES } from '../data/collectionHeroes';
import { preloadImage } from '../utils/imageOptimizer';

export const Navbar: React.FC = () => {
  const {
    currentPage,
    setCurrentPage,
    setSelectedCategoryFilter,
    cartCount,
    wishlist,
    setIsSearchOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen
  } = useShop();

  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (page: PageType, categoryFilter?: string) => {
    if (categoryFilter) {
      setSelectedCategoryFilter(categoryFilter);
    } else {
      setSelectedCategoryFilter(null);
    }
    setCurrentPage(page);
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  };

  const isItemActive = (itemPage: PageType) => {
    if (itemPage === 'home') return currentPage === 'home';
    if (itemPage === 'shop') {
      return ['shop', 'women', 'men', 'watches', 'shoes', 'accessories'].includes(currentPage);
    }
    return currentPage === itemPage;
  };

  const navItems = [
    {
      label: 'Home',
      page: 'home' as PageType,
      hasDropdown: false
    },
    {
      label: 'Shop',
      page: 'shop' as PageType,
      hasDropdown: true,
      categories: [
        { label: 'All Catalog', page: 'shop' as PageType, filter: null },
        { label: 'Women’s Atelier', page: 'women' as PageType, filter: 'women' },
        { label: 'Men’s Sartorial', page: 'men' as PageType, filter: 'men' },
        { label: 'Horology & Watches', page: 'watches' as PageType, filter: 'watches' },
        { label: 'Artisanal Footwear', page: 'shoes' as PageType, filter: 'shoes' },
        { label: 'Bags & Accessories', page: 'accessories' as PageType, filter: 'accessories' },
      ]
    },
    {
      label: 'New Arrivals',
      page: 'new_arrivals' as PageType,
      hasDropdown: false
    },
    {
      label: 'Deals',
      page: 'sale' as PageType,
      hasDropdown: false,
      badge: 'Up to 25% Off'
    },
    {
      label: 'About',
      page: 'about' as PageType,
      hasDropdown: false
    }
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-30 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#FAF6F0]/95 backdrop-blur-md shadow-xs border-b border-[#E7D6C1]/60 py-1.5 sm:py-2 lg:py-1'
            : 'bg-[#FAF6F0] border-b border-[#E7D6C1]/30 py-2 sm:py-2.5 lg:py-1.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Left Zone: Mobile Menu Button + Brand Logo */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {/* Mobile Menu Button */}
              <button
                id="mobile-menu-trigger"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-1.5 -ml-1 text-[#2B1D17] hover:text-[#C48A5A] transition-colors focus:outline-none cursor-pointer flex items-center justify-center rounded-sm"
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>

              {/* Brand Logo */}
              <button
                onClick={() => handleNavClick('home')}
                className="group inline-flex flex-col items-start focus:outline-none cursor-pointer select-none py-0.5"
              >
                <span className="font-heading text-2xl sm:text-3xl lg:text-[28px] tracking-[0.22em] text-[#C48A5A] transition-transform duration-300 group-hover:scale-[1.01] leading-none">
                  LUMORA
                </span>
                <span className="text-[6.5px] sm:text-[7px] tracking-[0.28em] sm:tracking-[0.3em] text-[#6B4A3A] uppercase font-semibold -mt-0.5">
                  HAUTE COUTURE
                </span>
              </button>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative group py-0.5"
                  onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.label)}
                  onMouseLeave={() => item.hasDropdown && setActiveDropdown(null)}
                >
                  <button
                    onClick={() => handleNavClick(item.page)}
                    className={`flex items-center text-[12.5px] xl:text-[13px] tracking-[0.08em] uppercase font-semibold transition-colors cursor-pointer py-0.5 ${
                      isItemActive(item.page)
                        ? 'text-[#2B1D17] border-b-2 border-[#C48A5A] pb-0.5 font-bold'
                        : 'text-[#6B4A3A] hover:text-[#2B1D17]'
                    }`}
                  >
                    {item.label}
                    {item.badge && (
                      <span className="ml-1.5 px-1.5 py-0.2 bg-[#C48A5A]/15 text-[#6B4A3A] text-[9px] tracking-normal font-semibold rounded-full">
                        {item.badge}
                      </span>
                    )}
                    {item.hasDropdown && (
                      <ChevronDown className="w-3.5 h-3.5 ml-1 text-[#C48A5A] opacity-70 group-hover:opacity-100 transition-transform group-hover:rotate-180" />
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {item.hasDropdown && activeDropdown === item.label && (
                    <div className="absolute left-0 top-full mt-1 w-60 bg-[#FAF6F0] border border-[#E7D6C1] shadow-xl p-3 animate-fadeIn z-50">
                      <div className="text-[10px] tracking-[0.2em] uppercase text-[#6B4A3A] px-3 py-1 font-semibold border-b border-[#E7D6C1]/50 mb-1">
                        Curated Selections
                      </div>
                      {item.categories?.map((cat) => (
                        <button
                          key={cat.label}
                          onClick={() => handleNavClick(cat.page, cat.filter || undefined)}
                          className="w-full text-left px-3 py-2 text-xs text-[#2B1D17] hover:bg-[#E7D6C1]/40 hover:text-[#C48A5A] transition-colors flex items-center justify-between group/link cursor-pointer"
                        >
                          <span>{cat.label}</span>
                          <ArrowRight className="w-3 h-3 text-[#C48A5A] opacity-0 group-hover/link:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Right Action Icons */}
            <div className="flex items-center gap-0.5 sm:gap-2 md:gap-3 shrink-0">
              {/* Search Trigger */}
              <button
                id="search-trigger"
                onClick={() => setIsSearchOpen(true)}
                className="p-1 sm:p-1.5 lg:p-1.5 text-[#2B1D17] hover:text-[#C48A5A] transition-colors focus:outline-none cursor-pointer rounded-full hover:bg-[#E7D6C1]/20"
                title="Search Lumora"
                aria-label="Search"
              >
                <Search className="w-5 h-5 stroke-[1.5]" />
              </button>

              {/* Wishlist Button with Live Count */}
              <button
                id="wishlist-trigger"
                onClick={() => setCurrentPage('wishlist')}
                className="p-1 sm:p-1.5 lg:p-1.5 text-[#2B1D17] hover:text-[#C48A5A] transition-colors focus:outline-none cursor-pointer rounded-full hover:bg-[#E7D6C1]/20"
                title="Saved Pieces"
                aria-label="Wishlist"
              >
                <div className="relative flex items-center justify-center">
                  <Heart className="w-5 h-5 stroke-[1.5]" />
                  {wishlist.length > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 bg-[#C48A5A] text-[#FAF6F0] text-[9.5px] font-bold rounded-full flex items-center justify-center border border-[#FAF6F0] shadow-xs">
                      {wishlist.length}
                    </span>
                  )}
                </div>
              </button>

              {/* Account Trigger */}
              <div className="relative">
                <button
                  id="account-trigger"
                  onClick={() => setIsAccountModalOpen(!isAccountModalOpen)}
                  className="p-1 sm:p-1.5 lg:p-1.5 text-[#2B1D17] hover:text-[#C48A5A] transition-colors focus:outline-none cursor-pointer rounded-full hover:bg-[#E7D6C1]/20"
                  title="Account & Orders"
                  aria-label="Account"
                >
                  <User className="w-5 h-5 stroke-[1.5]" />
                </button>

                {isAccountModalOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-1.5rem)] bg-[#FAF6F0] border border-[#E7D6C1] shadow-xl p-4 z-50 text-left">
                    <div className="pb-3 border-b border-[#E7D6C1]/60">
                      <p className="text-[10px] tracking-widest text-[#6B4A3A] uppercase">Lumora Concierge</p>
                      <h4 className="font-sans text-sm sm:text-base font-semibold text-[#2B1D17]">Privileged Member</h4>
                      <p className="text-xs text-[#6B4A3A]/80 mt-0.5">Signed in as amna.butt2556@gmail.com</p>
                    </div>
                    <div className="py-2 space-y-1">
                      <button
                        onClick={() => {
                          setIsAccountModalOpen(false);
                          setCurrentPage('order_tracking');
                        }}
                        className="w-full text-left py-1.5 text-xs text-[#2B1D17] hover:text-[#C48A5A] flex items-center justify-between cursor-pointer"
                      >
                        <span>Track Ongoing Orders</span>
                        <ArrowRight className="w-3 h-3 text-[#C48A5A]" />
                      </button>
                      <button
                        onClick={() => {
                          setIsAccountModalOpen(false);
                          setCurrentPage('reviews');
                        }}
                        className="w-full text-left py-1.5 text-xs text-[#2B1D17] hover:text-[#C48A5A] flex items-center justify-between cursor-pointer"
                      >
                        <span>Atelier Reviews & Testimonials</span>
                        <ArrowRight className="w-3 h-3 text-[#C48A5A]" />
                      </button>
                      <button
                        onClick={() => {
                          setIsAccountModalOpen(false);
                          setCurrentPage('help_support');
                        }}
                        className="w-full text-left py-1.5 text-xs text-[#2B1D17] hover:text-[#C48A5A] flex items-center justify-between cursor-pointer"
                      >
                        <span>Customer Support & FAQ</span>
                        <ArrowRight className="w-3 h-3 text-[#C48A5A]" />
                      </button>
                      <button
                        onClick={() => {
                          setIsAccountModalOpen(false);
                          setCurrentPage('admin');
                        }}
                        className="w-full text-left py-1.5 text-xs text-[#C48A5A] hover:text-[#2B1D17] font-medium flex items-center justify-between cursor-pointer pt-1 border-t border-[#E7D6C1]/40"
                      >
                        <span>Atelier Admin Dashboard</span>
                        <ArrowRight className="w-3 h-3 text-[#C48A5A]" />
                      </button>
                    </div>
                    <div className="pt-2 border-t border-[#E7D6C1]/60">
                      <p className="text-[10px] text-[#6B4A3A]">
                        Atelier Careline: <strong>+92 (042) 3578-9000</strong>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Cart Button with Live Count */}
              <button
                id="cart-trigger"
                onClick={() => setCurrentPage('cart')}
                className="p-1 sm:p-1.5 lg:p-1.5 text-[#2B1D17] hover:text-[#C48A5A] transition-colors relative focus:outline-none flex items-center cursor-pointer rounded-full hover:bg-[#E7D6C1]/20"
                title="Atelier Bag"
                aria-label="Shopping Bag"
              >
                <div className="relative flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 bg-[#2B1D17] text-[#FAF6F0] text-[9.5px] font-bold rounded-full flex items-center justify-center border border-[#FAF6F0] shadow-xs">
                      {cartCount}
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Out Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-[#2B1D17]/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-[#FAF6F0] shadow-2xl flex flex-col justify-between z-50 p-6 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#E7D6C1]">
                <div>
                  <span className="font-sans text-2xl tracking-[0.2em] text-[#C48A5A] font-bold">
                    LUMORA
                  </span>
                  <p className="text-[8px] tracking-[0.3em] text-[#6B4A3A] uppercase font-semibold">HAUTE COUTURE</p>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-[#2B1D17] hover:text-[#C48A5A]"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Account Quick Info */}
              <div className="mt-4 p-3 bg-[#E7D6C1]/25 border border-[#E7D6C1]/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#C48A5A]/20 flex items-center justify-center text-[#6B4A3A] shrink-0">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] uppercase tracking-wider text-[#6B4A3A] font-semibold">Atelier Member</p>
                    <p className="text-[11px] font-medium text-[#2B1D17] truncate max-w-[130px]">amna.butt2556@gmail.com</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setCurrentPage('order_tracking');
                  }}
                  className="text-[10px] text-[#C48A5A] font-medium hover:underline shrink-0"
                >
                  Orders →
                </button>
              </div>

              {/* Mobile Navigation List */}
              <div className="py-6 space-y-3">
                <div className="text-[10px] uppercase tracking-widest text-[#6B4A3A] font-bold">Navigation</div>
                <button
                  onClick={() => handleNavClick('home')}
                  className="w-full text-left py-2 text-[15px] font-sans font-semibold text-[#2B1D17] hover:text-[#C48A5A]"
                >
                  Home
                </button>
                <button
                  onClick={() => handleNavClick('shop')}
                  className="w-full text-left py-2 text-[15px] font-sans font-semibold text-[#2B1D17] hover:text-[#C48A5A]"
                >
                  Shop
                </button>
                <button
                  onClick={() => handleNavClick('women', 'women')}
                  className="w-full text-left py-1.5 text-sm font-medium text-[#6B4A3A] hover:text-[#2B1D17] pl-3"
                >
                  Women Collection
                </button>
                <button
                  onClick={() => handleNavClick('men', 'men')}
                  className="w-full text-left py-1.5 text-sm font-medium text-[#6B4A3A] hover:text-[#2B1D17] pl-3"
                >
                  Men Collection
                </button>
                <button
                  onClick={() => handleNavClick('watches', 'watches')}
                  className="w-full text-left py-1.5 text-sm font-medium text-[#6B4A3A] hover:text-[#2B1D17] pl-3"
                >
                  Watches & Horology
                </button>
                <button
                  onClick={() => handleNavClick('shoes', 'shoes')}
                  className="w-full text-left py-1.5 text-sm font-medium text-[#6B4A3A] hover:text-[#2B1D17] pl-3"
                >
                  Shoes & Loafers
                </button>
                <button
                  onClick={() => handleNavClick('accessories', 'accessories')}
                  className="w-full text-left py-1.5 text-sm font-medium text-[#6B4A3A] hover:text-[#2B1D17] pl-3"
                >
                  Bags & Accessories
                </button>
                <button
                  onClick={() => handleNavClick('new_arrivals')}
                  className="w-full text-left py-2 text-[15px] font-sans font-semibold text-[#2B1D17] hover:text-[#C48A5A]"
                >
                  New Arrivals
                </button>
                <button
                  onClick={() => handleNavClick('sale')}
                  className="w-full text-left py-2 text-[15px] font-sans font-semibold text-[#C48A5A] hover:text-[#2B1D17]"
                >
                  Special Atelier Deals
                </button>
                <button
                  onClick={() => handleNavClick('about')}
                  className="w-full text-left py-2 text-[15px] font-sans font-semibold text-[#2B1D17] hover:text-[#C48A5A]"
                >
                  About Lumora
                </button>
                <button
                  onClick={() => handleNavClick('reviews')}
                  className="w-full text-left py-2 text-[15px] font-sans font-semibold text-[#2B1D17] hover:text-[#C48A5A]"
                >
                  Customer Reviews
                </button>
                <button
                  onClick={() => handleNavClick('order_tracking')}
                  className="w-full text-left py-2 text-[15px] font-sans font-semibold text-[#2B1D17] hover:text-[#C48A5A]"
                >
                  Track Order
                </button>
                <button
                  onClick={() => handleNavClick('help_support')}
                  className="w-full text-left py-2 text-[15px] font-sans font-semibold text-[#2B1D17] hover:text-[#C48A5A]"
                >
                  Help & Support
                </button>
              </div>
            </div>

            {/* Mobile Footer Area */}
            <div className="pt-6 border-t border-[#E7D6C1] space-y-3">
              <div className="flex items-center justify-between text-xs text-[#6B4A3A]">
                <span>Currency</span>
                <span className="font-semibold text-[#2B1D17]">PKR (Rs.)</span>
              </div>
              <div className="text-[11px] text-[#6B4A3A]/80">
                Pakistan Domestic Hotline: <br />
                <a href="tel:+924235789000" className="font-medium text-[#2B1D17] hover:underline">
                  +92 (042) 3578-9000
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
