import React, { useState, useEffect } from 'react';
import { Truck, RotateCcw, ShieldCheck, ChevronRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const AnnouncementBar: React.FC = () => {
  const { setCurrentPage } = useShop();
  const announcements = [
    { text: 'Free Shipping on Domestic Orders Over PKR 15,000', icon: Truck, linkText: 'Details', page: 'help_support' as const },
    { text: 'Easy 30-Day In-Home Returns & Exchanges', icon: RotateCcw, linkText: 'Learn More', page: 'help_support' as const },
    { text: 'Secure & Safe Payments via Easypaisa, JazzCash & Bank Transfer', icon: ShieldCheck, linkText: 'Learn More', page: 'help_support' as const },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [announcements.length]);

  const active = announcements[currentIndex];
  const IconComponent = active.icon;

  return (
    <aside aria-label="Announcement" className="bg-[#2B1D17] text-[#FAF6F0] text-xs py-2 px-4 transition-colors duration-300 border-b border-[#6B4A3A]/40 relative z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="hidden md:flex items-center space-x-6 text-[11px] text-[#E7D6C1]/80 tracking-wider">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C48A5A]" />
            Pakistan-Wide Delivery
          </span>
        </div>

        {/* Rotating Announcement */}
        <div className="flex-1 flex items-center justify-center">
          <button
            onClick={() => setCurrentPage(active.page)}
            className="flex items-center gap-2 tracking-wide font-medium hover:text-[#C48A5A] transition-colors focus:outline-none group cursor-pointer"
          >
            <IconComponent className="w-3.5 h-3.5 text-[#C48A5A] shrink-0" />
            <span className="text-[11.5px] sm:text-xs">{active.text}</span>
            <span className="text-[10px] text-[#E7D6C1] underline decoration-[#C48A5A]/50 group-hover:decoration-[#C48A5A] hidden sm:inline-flex items-center">
              {active.linkText} <ChevronRight className="w-2.5 h-2.5 ml-0.5" />
            </span>
          </button>
        </div>

        <div className="hidden md:flex items-center space-x-4 text-[11px] text-[#E7D6C1]">
          <button
            onClick={() => setCurrentPage('order_tracking')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Track Order
          </button>
          <span>|</span>
          <button
            onClick={() => setCurrentPage('help_support')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Atelier Concierge
          </button>
        </div>
      </div>
    </aside>
  );
};
