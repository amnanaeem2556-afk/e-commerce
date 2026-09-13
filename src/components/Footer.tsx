import React, { useState } from 'react';
import { Mail, ArrowRight, ShieldCheck, Truck, RotateCcw, Award, CheckCircle2 } from 'lucide-react';
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
    addToast('Welcome to Lumora Circle', 'You have been enrolled in our seasonal previews and bespoke invitations.', 'luxury');
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
    <footer className="bg-[#2B1D17] text-[#FAF6F0] border-t border-[#6B4A3A]/40 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Badges Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-14 border-b border-[#6B4A3A]/50">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-none border border-[#C48A5A]/40 flex items-center justify-center shrink-0 text-[#C48A5A] bg-[#6B4A3A]/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold tracking-wide">Master Craftsmanship</h4>
              <p className="text-[11px] text-[#E7D6C1]/70">Double-faced cashmere & Italian leathers</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-none border border-[#C48A5A]/40 flex items-center justify-center shrink-0 text-[#C48A5A] bg-[#6B4A3A]/20">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold tracking-wide">White Glove Delivery</h4>
              <p className="text-[11px] text-[#E7D6C1]/70">Complimentary over PKR 15,000</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-none border border-[#C48A5A]/40 flex items-center justify-center shrink-0 text-[#C48A5A] bg-[#6B4A3A]/20">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold tracking-wide">30-Day In-Home Trial</h4>
              <p className="text-[11px] text-[#E7D6C1]/70">Effortless domestic home pickup</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-none border border-[#C48A5A]/40 flex items-center justify-center shrink-0 text-[#C48A5A] bg-[#6B4A3A]/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold tracking-wide">Secured Checkout</h4>
              <p className="text-[11px] text-[#E7D6C1]/70">Easypaisa, JazzCash & Bank Wire</p>
            </div>
          </div>
        </div>

        {/* Newsletter Section: "Join the Lumora Circle" */}
        <div className="py-12 border-b border-[#6B4A3A]/50 max-w-2xl mx-auto text-center">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#C48A5A] font-semibold">
            Private Atelier Invitations
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-normal tracking-wide mt-1 mb-2 text-[#FAF6F0]">
            Join the Lumora Circle
          </h3>
          <p className="text-xs text-[#E7D6C1]/80 leading-relaxed mb-6 font-light">
            Receive private trunk-show access, seasonal couture releases, and curated styling notes directly from our Milan & Florence ateliers.
          </p>

          {isSubscribed ? (
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#6B4A3A]/30 border border-[#C48A5A]/50 text-xs text-[#FAF6F0]">
              <CheckCircle2 className="w-4 h-4 text-[#C48A5A]" />
              <span>You are now enrolled in the Lumora Circle privileges.</span>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
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
                    emailError ? 'border-red-400' : 'border-[#6B4A3A]'
                  } px-4 py-3 text-xs text-[#FAF6F0] placeholder:text-[#E7D6C1]/50 focus:outline-none focus:border-[#C48A5A] transition-colors`}
                />
              </div>
              <button
                type="submit"
                className="bg-[#C48A5A] hover:bg-[#C48A5A]/90 text-[#2B1D17] text-xs font-semibold tracking-widest uppercase px-6 py-3 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>Subscribe</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
          {emailError && <p className="text-[11px] text-red-400 mt-2">{emailError}</p>}
        </div>

        {/* Main Footer Links Columns */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-10 py-12 border-b border-[#6B4A3A]/50 text-xs">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <button
              onClick={() => handleNav('home')}
              className="text-left focus:outline-none cursor-pointer"
            >
              <span className="font-serif text-3xl tracking-[0.25em] font-semibold text-[#FAF6F0]">
                LUMORA
              </span>
              <p className="text-[9px] tracking-[0.35em] text-[#C48A5A] uppercase font-medium mt-0.5">
                HAUTE COUTURE
              </p>
            </button>
            <p className="text-xs text-[#E7D6C1]/75 leading-relaxed font-light pr-6">
              Lumora creates modern heirlooms engineered with quiet elegance. We source Grade-A Mongolian cashmere, French calfskin, and Como silk for discerning patrons across Pakistan and beyond.
            </p>
            <div className="pt-2 text-[11px] text-[#E7D6C1]/90 space-y-1">
              <p>Flagship Salon: <strong>Galleria Mall, Main Gulberg, Lahore</strong></p>
              <p>Concierge Line: <strong>+92 (042) 3578-9000</strong></p>
              <p>Direct Inquiries: <strong>atelier@lumora.luxury</strong></p>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h5 className="font-serif text-sm font-semibold uppercase tracking-widest text-[#C48A5A]">
              Collections
            </h5>
            <ul className="space-y-2 text-[#E7D6C1]/80">
              <li>
                <button onClick={() => handleNav('women', 'women')} className="hover:text-white transition-colors cursor-pointer">
                  Women’s Atelier
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('men', 'men')} className="hover:text-white transition-colors cursor-pointer">
                  Men’s Sartorial
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('watches', 'watches')} className="hover:text-white transition-colors cursor-pointer">
                  Horology & Watches
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('shoes', 'shoes')} className="hover:text-white transition-colors cursor-pointer">
                  Artisanal Footwear
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('accessories', 'accessories')} className="hover:text-white transition-colors cursor-pointer">
                  Tuscan Leather Bags
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('new_arrivals')} className="hover:text-white transition-colors cursor-pointer">
                  New Arrivals
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('sale')} className="hover:text-white transition-colors cursor-pointer text-[#C48A5A]">
                  Special Archive Deals
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h5 className="font-serif text-sm font-semibold uppercase tracking-widest text-[#C48A5A]">
              Client Care
            </h5>
            <ul className="space-y-2 text-[#E7D6C1]/80">
              <li>
                <button onClick={() => handleNav('order_tracking')} className="hover:text-white transition-colors cursor-pointer">
                  Track Order Status
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('help_support')} className="hover:text-white transition-colors cursor-pointer">
                  White Glove Shipping Help
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('help_support')} className="hover:text-white transition-colors cursor-pointer">
                  30-Day Returns & Exchanges
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('help_support')} className="hover:text-white transition-colors cursor-pointer">
                  Payment Guides (PKR)
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('reviews')} className="hover:text-white transition-colors cursor-pointer">
                  Client Reviews & Ratings
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('help_support')} className="hover:text-white transition-colors cursor-pointer">
                  Contact Atelier Concierge
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('admin')} className="hover:text-white transition-colors cursor-pointer text-[#C48A5A]">
                  Atelier Admin Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Maison & Brand */}
          <div className="space-y-3">
            <h5 className="font-serif text-sm font-semibold uppercase tracking-widest text-[#C48A5A]">
              The Maison
            </h5>
            <ul className="space-y-2 text-[#E7D6C1]/80">
              <li>
                <button onClick={() => handleNav('about')} className="hover:text-white transition-colors cursor-pointer">
                  The Lumora Atelier
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('about')} className="hover:text-white transition-colors cursor-pointer">
                  Philosophy of Quiet Luxury
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('about')} className="hover:text-white transition-colors cursor-pointer">
                  Ethical Sourcing & Fabrics
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('shop')} className="hover:text-white transition-colors cursor-pointer">
                  Full Catalogue Search
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('wishlist')} className="hover:text-white transition-colors cursor-pointer">
                  Saved Pieces
                </button>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div className="space-y-3">
            <h5 className="font-serif text-sm font-semibold uppercase tracking-widest text-[#C48A5A]">
              Policies
            </h5>
            <ul className="space-y-2 text-[#E7D6C1]/80">
              <li>
                <button onClick={() => handleNav('help_support')} className="hover:text-white transition-colors cursor-pointer">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('help_support')} className="hover:text-white transition-colors cursor-pointer">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('help_support')} className="hover:text-white transition-colors cursor-pointer">
                  Return & Refund Policy
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('help_support')} className="hover:text-white transition-colors cursor-pointer">
                  Shipping Policy
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment Badges */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#E7D6C1]/60">
          <div>
            &copy; 2026 LUMORA Haute Couture. All Rights Reserved. Exclusively priced in Pakistani Rupee (PKR).
          </div>

        </div>
      </div>
    </footer>
  );
};
