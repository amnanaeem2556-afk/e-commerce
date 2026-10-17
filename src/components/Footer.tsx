import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, Truck, RotateCcw, Award, CheckCircle2 } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { PageType } from '../types';

export const Footer: React.FC = () => {
  const { setCurrentPage, setSelectedCategoryFilter, addToast } = useShop();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [emailError, setEmailError] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newsletterEmail || !emailRegex.test(newsletterEmail)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailError('');
    setIsSubscribed(true);
    addToast(
      'Welcome to Lumora Circle',
      'You have been enrolled in our seasonal previews and bespoke invitations.',
      'luxury'
    );
  };

  const handleNav = (page: PageType, category?: string) => {
    if (category) {
      setSelectedCategoryFilter(category);
    } else {
      setSelectedCategoryFilter(null);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#2B1D17] text-[#FAF6F0] border-t border-[#6B4A3A]/40 pt-12 sm:pt-14 lg:pt-16 pb-8 sm:pb-10 lg:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 1. Trust Badges Strip: Balanced 4-Column Grid with Refined Spacing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6 lg:gap-8 pb-10 sm:pb-12 border-b border-[#6B4A3A]/40">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-11 h-11 rounded-[2px] border border-[#C48A5A]/40 flex items-center justify-center shrink-0 text-[#C48A5A] bg-[#6B4A3A]/20">
              <Award className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div className="min-w-0">
              <h4 className="font-sans text-xs sm:text-[13px] font-semibold tracking-wider uppercase text-[#FAF6F0] truncate">
                Master Craftsmanship
              </h4>
              <p className="text-[11px] sm:text-xs text-[#E7D6C1]/75 leading-relaxed mt-0.5">
                Double-faced cashmere & Italian leathers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-11 h-11 rounded-[2px] border border-[#C48A5A]/40 flex items-center justify-center shrink-0 text-[#C48A5A] bg-[#6B4A3A]/20">
              <Truck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div className="min-w-0">
              <h4 className="font-sans text-xs sm:text-[13px] font-semibold tracking-wider uppercase text-[#FAF6F0] truncate">
                White Glove Delivery
              </h4>
              <p className="text-[11px] sm:text-xs text-[#E7D6C1]/75 leading-relaxed mt-0.5">
                Complimentary over PKR 15,000
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-11 h-11 rounded-[2px] border border-[#C48A5A]/40 flex items-center justify-center shrink-0 text-[#C48A5A] bg-[#6B4A3A]/20">
              <RotateCcw className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div className="min-w-0">
              <h4 className="font-sans text-xs sm:text-[13px] font-semibold tracking-wider uppercase text-[#FAF6F0] truncate">
                30-Day In-Home Trial
              </h4>
              <p className="text-[11px] sm:text-xs text-[#E7D6C1]/75 leading-relaxed mt-0.5">
                Effortless domestic home pickup
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="w-11 h-11 rounded-[2px] border border-[#C48A5A]/40 flex items-center justify-center shrink-0 text-[#C48A5A] bg-[#6B4A3A]/20">
              <ShieldCheck className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div className="min-w-0">
              <h4 className="font-sans text-xs sm:text-[13px] font-semibold tracking-wider uppercase text-[#FAF6F0] truncate">
                Secured Checkout
              </h4>
              <p className="text-[11px] sm:text-xs text-[#E7D6C1]/75 leading-relaxed mt-0.5">
                Easypaisa, JazzCash & Bank Wire
              </p>
            </div>
          </div>
        </div>

        {/* 2. Newsletter Section: "Join the Lumora Circle" */}
        <div className="py-10 sm:py-12 lg:py-14 border-b border-[#6B4A3A]/40 max-w-2xl mx-auto text-center px-2">
          <span className="text-[10px] sm:text-[10.5px] uppercase tracking-[0.25em] text-[#C48A5A] font-semibold inline-block">
            Private Atelier Invitations
          </span>
          <h3 className="font-heading text-2xl sm:text-3xl lg:text-4xl tracking-[0.03em] leading-tight mt-1.5 mb-2.5 text-[#FAF6F0]">
            Join the Lumora Circle
          </h3>
          <p className="text-xs sm:text-[13px] text-[#E7D6C1]/80 leading-relaxed sm:leading-[1.7] max-w-lg mx-auto mb-6 sm:mb-7 font-light">
            Receive private trunk-show access, seasonal couture releases, and curated styling notes directly from our Milan & Florence ateliers.
          </p>

          {isSubscribed ? (
            <div className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#6B4A3A]/30 border border-[#C48A5A]/50 text-xs text-[#FAF6F0] leading-relaxed">
              <CheckCircle2 className="w-4 h-4 text-[#C48A5A] shrink-0" />
              <span>You are now enrolled in the Lumora Circle privileges.</span>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 max-w-md mx-auto w-full items-stretch">
              <div className="flex-1 relative">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => {
                    setNewsletterEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  placeholder="Enter your email address..."
                  className={`w-full bg-[#FAF6F0]/10 border ${
                    emailError ? 'border-red-400' : 'border-[#6B4A3A]/70'
                  } px-4 py-3 sm:py-3.5 text-xs text-[#FAF6F0] placeholder:text-[#E7D6C1]/50 focus:outline-none focus:border-[#C48A5A] transition-colors tracking-wide`}
                />
              </div>
              <button
                type="submit"
                className="bg-[#C48A5A] hover:bg-[#C48A5A]/90 text-[#2B1D17] text-xs font-bold tracking-[0.16em] uppercase px-6 sm:px-7 py-3 sm:py-3.5 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-sm active:scale-[0.98]"
              >
                <span>Subscribe</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#2B1D17]" />
              </button>
            </form>
          )}
          {emailError && <p className="text-[11px] text-red-400 mt-2">{emailError}</p>}
        </div>

        {/* 3. Main Footer Links Columns: Clean Symmetrical Layout Across Mobile, Tablet & Desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 sm:gap-10 lg:gap-8 xl:gap-10 py-10 sm:py-12 lg:py-14 border-b border-[#6B4A3A]/40 text-xs">
          {/* Brand Column: Spans 2 cols on mobile/tablet and desktop for balanced presence */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2 space-y-4">
            <button
              onClick={() => handleNav('home')}
              className="text-left focus:outline-none cursor-pointer group"
            >
              <span className="font-heading text-3xl sm:text-4xl tracking-[0.22em] text-[#FAF6F0] leading-none group-hover:text-[#C48A5A] transition-colors">
                LUMORA
              </span>
              <p className="text-[8.5px] sm:text-[9px] tracking-[0.32em] text-[#C48A5A] uppercase font-semibold mt-1">
                HAUTE COUTURE
              </p>
            </button>
            <p className="text-xs text-[#E7D6C1]/85 leading-relaxed font-normal max-w-sm">
              Lumora creates modern heirlooms engineered with quiet elegance. We source Grade-A Mongolian cashmere, French calfskin, and Como silk for discerning patrons across Pakistan and beyond.
            </p>
            <div className="pt-1 text-[11px] sm:text-xs text-[#E7D6C1]/80 space-y-1.5 leading-relaxed">
              <p>
                <span className="text-[#C48A5A] font-medium">Flagship Salon:</span>{' '}
                <span className="font-medium text-[#FAF6F0]">Galleria Mall, Main Gulberg, Lahore</span>
              </p>
              <p>
                <span className="text-[#C48A5A] font-medium">Concierge Line:</span>{' '}
                <span className="font-medium text-[#FAF6F0]">+92 (042) 3578-9000</span>
              </p>
              <p>
                <span className="text-[#C48A5A] font-medium">Direct Inquiries:</span>{' '}
                <span className="font-medium text-[#FAF6F0]">atelier@lumora.luxury</span>
              </p>
            </div>
          </div>

          {/* Collections Column */}
          <div className="col-span-1 space-y-3 sm:space-y-3.5">
            <h5 className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#C48A5A]">
              Collections
            </h5>
            <ul className="space-y-2 sm:space-y-2.5 text-[#E7D6C1]/80">
              <li>
                <button
                  onClick={() => handleNav('women', 'women')}
                  className="hover:text-white transition-colors cursor-pointer text-left leading-normal"
                >
                  Women’s Atelier
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('men', 'men')}
                  className="hover:text-white transition-colors cursor-pointer text-left leading-normal"
                >
                  Men’s Sartorial
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('watches', 'watches')}
                  className="hover:text-white transition-colors cursor-pointer text-left leading-normal"
                >
                  Horology & Watches
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('shoes', 'shoes')}
                  className="hover:text-white transition-colors cursor-pointer text-left leading-normal"
                >
                  Artisanal Footwear
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('accessories', 'accessories')}
                  className="hover:text-white transition-colors cursor-pointer text-left leading-normal"
                >
                  Tuscan Leather Bags
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('new_arrivals')}
                  className="hover:text-white transition-colors cursor-pointer text-left leading-normal"
                >
                  New Arrivals
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('sale')}
                  className="hover:text-white transition-colors cursor-pointer text-[#C48A5A] font-medium text-left leading-normal"
                >
                  Special Archive Deals
                </button>
              </li>
            </ul>
          </div>

          {/* Client Care Column */}
          <div className="col-span-1 space-y-3 sm:space-y-3.5">
            <h5 className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#C48A5A]">
              Client Care
            </h5>
            <ul className="space-y-2 sm:space-y-2.5 text-[#E7D6C1]/80">
              <li>
                <button
                  onClick={() => handleNav('order_tracking')}
                  className="hover:text-white transition-colors cursor-pointer text-left leading-normal"
                >
                  Track Order Status
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('help_support')}
                  className="hover:text-white transition-colors cursor-pointer text-left leading-normal"
                >
                  White Glove Shipping Help
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('help_support')}
                  className="hover:text-white transition-colors cursor-pointer text-left leading-normal"
                >
                  30-Day Returns & Exchanges
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('help_support')}
                  className="hover:text-white transition-colors cursor-pointer text-left leading-normal"
                >
                  Payment Guides (PKR)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('reviews')}
                  className="hover:text-white transition-colors cursor-pointer text-left leading-normal"
                >
                  Client Reviews & Ratings
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('help_support')}
                  className="hover:text-white transition-colors cursor-pointer text-left leading-normal"
                >
                  Contact Atelier Concierge
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('admin')}
                  className="hover:text-white transition-colors cursor-pointer text-[#C48A5A] font-medium text-left leading-normal"
                >
                  Atelier Admin Portal
                </button>
              </li>
            </ul>
          </div>

          {/* The Maison Column */}
          <div className="col-span-1 space-y-3 sm:space-y-3.5">
            <h5 className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#C48A5A]">
              The Maison
            </h5>
            <ul className="space-y-2 sm:space-y-2.5 text-[#E7D6C1]/80">
              <li>
                <button
                  onClick={() => handleNav('about')}
                  className="hover:text-white transition-colors cursor-pointer text-left leading-normal"
                >
                  The Lumora Atelier
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('about')}
                  className="hover:text-white transition-colors cursor-pointer text-left leading-normal"
                >
                  Philosophy of Quiet Luxury
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('about')}
                  className="hover:text-white transition-colors cursor-pointer text-left leading-normal"
                >
                  Ethical Sourcing & Fabrics
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('shop')}
                  className="hover:text-white transition-colors cursor-pointer text-left leading-normal"
                >
                  Full Catalogue Search
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('wishlist')}
                  className="hover:text-white transition-colors cursor-pointer text-left leading-normal"
                >
                  Saved Pieces
                </button>
              </li>
            </ul>
          </div>

          {/* Policies Column */}
          <div className="col-span-1 space-y-3 sm:space-y-3.5">
            <h5 className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#C48A5A]">
              Policies
            </h5>
            <ul className="space-y-2 sm:space-y-2.5 text-[#E7D6C1]/80">
              <li>
                <button
                  onClick={() => handleNav('help_support')}
                  className="hover:text-white transition-colors cursor-pointer text-left leading-normal"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('help_support')}
                  className="hover:text-white transition-colors cursor-pointer text-left leading-normal"
                >
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('help_support')}
                  className="hover:text-white transition-colors cursor-pointer text-left leading-normal"
                >
                  Return & Refund Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('help_support')}
                  className="hover:text-white transition-colors cursor-pointer text-left leading-normal"
                >
                  Shipping Policy
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* 4. Bottom Bar: Symmetrical Copyright & Atelier Markers */}
        <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#E7D6C1]/65 text-center sm:text-left">
          <div>
            &copy; 2026 LUMORA Haute Couture. All Rights Reserved. Exclusively priced in Pakistani Rupee (PKR).
          </div>
          <div className="flex items-center gap-3 text-[11px] text-[#E7D6C1]/70">
            <span>Crafted for Discerning Clients</span>
            <span className="w-1 h-1 rounded-full bg-[#C48A5A]" />
            <span>Lahore • Karachi • Islamabad</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
