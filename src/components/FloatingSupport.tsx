import React, { useState } from 'react';
import { HelpCircle, X, MessageCircle, Phone, FileText, ChevronRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const FloatingSupport: React.FC = () => {
  const { setCurrentPage } = useShop();
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (page: 'help_support' | 'order_tracking') => {
    setCurrentPage(page);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 left-6 z-30">
      {/* Floating Popover Menu */}
      {isOpen && (
        <div className="mb-3 w-72 bg-[#FAF6F0] border border-[#E7D6C1] shadow-2xl p-4 text-left animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-[#E7D6C1]/70">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-[#C48A5A] font-semibold">Concierge Support</p>
              <h4 className="font-sans text-xs sm:text-sm font-semibold text-[#2B1D17]">How may we assist?</h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-[#2B1D17] hover:text-[#C48A5A]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="py-2 space-y-1.5 text-xs">
            <button
              onClick={() => handleAction('help_support')}
              className="w-full text-left p-2 hover:bg-[#E7D6C1]/40 transition-colors flex items-center justify-between group cursor-pointer text-[#2B1D17]"
            >
              <span className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-[#C48A5A]" />
                <span>Frequently Asked Questions</span>
              </span>
              <ChevronRight className="w-3 h-3 text-[#6B4A3A] group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => handleAction('order_tracking')}
              className="w-full text-left p-2 hover:bg-[#E7D6C1]/40 transition-colors flex items-center justify-between group cursor-pointer text-[#2B1D17]"
            >
              <span className="flex items-center gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-[#C48A5A]" />
                <span>Live Order Tracking</span>
              </span>
              <ChevronRight className="w-3 h-3 text-[#6B4A3A] group-hover:translate-x-0.5 transition-transform" />
            </button>

            <a
              href="https://wa.me/923001234567"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-left p-2 hover:bg-[#E7D6C1]/40 transition-colors flex items-center justify-between group cursor-pointer text-[#2B1D17]"
            >
              <span className="flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-[#C48A5A]" />
                <span>WhatsApp Private Stylist</span>
              </span>
              <ChevronRight className="w-3 h-3 text-[#6B4A3A] group-hover:translate-x-0.5 transition-transform" />
            </a>

            <div className="pt-2 border-t border-[#E7D6C1]/60 text-[11px] text-[#6B4A3A] flex items-center gap-2">
              <Phone className="w-3 h-3 text-[#C48A5A]" />
              <span>Direct: <strong>+92 (042) 3578-9000</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Trigger */}
      <button
        id="need-help-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#FAF6F0] text-[#2B1D17] hover:bg-[#FAF6F0] px-4 py-2.5 shadow-xl transition-all duration-300 flex items-center gap-2 border border-[#E7D6C1] group cursor-pointer"
        aria-label="Need Help Concierge"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
        <span className="text-xs font-sans font-bold tracking-wider text-[#2B1D17]">Need Help?</span>
      </button>
    </div>
  );
};
