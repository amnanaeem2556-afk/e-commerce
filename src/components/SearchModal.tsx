import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { PRODUCTS } from '../data/products';
import { formatPKR } from '../data/constants';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, viewProduct, setCurrentPage, setSelectedCategoryFilter } = useShop();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const filtered = PRODUCTS.filter((p) => {
    const q = query.toLowerCase().trim();
    if (!q) return false;
    return (
      p.name.toLowerCase().includes(q) ||
      p.subtitle.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.subCategory.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const popularSearches = ['Cashmere Coat', 'Mulberry Silk', 'Automatic Watch', 'Penny Loafers', 'Leather Bag', 'Trousers'];

  const handleSelectProduct = (product: typeof PRODUCTS[0]) => {
    setIsSearchOpen(false);
    viewProduct(product);
  };

  const handleCategoryShortcut = (cat: string) => {
    setIsSearchOpen(false);
    setSelectedCategoryFilter(cat);
    setCurrentPage('shop');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-start justify-center pt-16 sm:pt-24 px-4 pb-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#2B1D17]/75 backdrop-blur-sm transition-opacity"
        onClick={() => setIsSearchOpen(false)}
      />

      {/* Search Container */}
      <div className="relative bg-[#FAF6F0] w-full max-w-2xl border border-[#E7D6C1] shadow-2xl z-10 overflow-hidden">
        {/* Input Bar */}
        <div className="p-4 sm:p-6 border-b border-[#E7D6C1] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#6B4A3A] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by garment, fabric, watch or shade..."
            className="flex-1 bg-transparent text-base sm:text-lg text-[#2B1D17] placeholder:text-[#6B4A3A]/50 focus:outline-none font-serif tracking-wide"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-[#6B4A3A] hover:text-[#2B1D17] uppercase tracking-wider px-2"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1.5 text-[#2B1D17] hover:text-[#C48A5A]"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 max-h-[65vh] overflow-y-auto">
          {/* Query Results */}
          {query.trim().length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-widest text-[#6B4A3A]">
                  Results ({filtered.length})
                </span>
                {filtered.length > 0 && (
                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      setCurrentPage('shop');
                    }}
                    className="text-xs text-[#C48A5A] hover:underline flex items-center gap-1 font-medium"
                  >
                    View All in Catalogue <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              {filtered.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="font-serif text-lg text-[#2B1D17]">No atelier creations found</p>
                  <p className="text-xs text-[#6B4A3A] mt-1 max-w-sm mx-auto">
                    Try searching for classic silhouettes like "cashmere", "wool", "silk", or "watch".
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectProduct(item)}
                      className="flex items-center gap-4 p-2.5 hover:bg-[#E7D6C1]/30 transition-colors cursor-pointer group"
                    >
                      <img
                        src={item.images?.[0] || ''}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-14 h-18 object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] uppercase tracking-widest text-[#C48A5A] font-medium">
                          {item.category}
                        </span>
                        <h4 className="font-serif text-base text-[#2B1D17] group-hover:text-[#6B4A3A] truncate font-medium">
                          {item.name}
                        </h4>
                        <p className="text-xs text-[#6B4A3A]/80 truncate">{item.subtitle}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-semibold text-[#2B1D17]">
                          {formatPKR(item.price)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Popular Searches & Category Shortcuts */
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#6B4A3A] font-semibold mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-[#C48A5A]" />
                  <span>Trending Inquiries</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="text-xs px-3 py-1.5 bg-[#E7D6C1]/30 hover:bg-[#E7D6C1] text-[#2B1D17] transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs uppercase tracking-widest text-[#6B4A3A] font-semibold mb-3">
                  Curated Collections
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { label: 'Women’s Atelier', cat: 'women' },
                    { label: 'Men’s Sartorial', cat: 'men' },
                    { label: 'Horology & Watches', cat: 'watches' },
                    { label: 'Artisanal Footwear', cat: 'shoes' },
                    { label: 'Tuscan Leather Bags', cat: 'accessories' },
                    { label: 'Quiet Luxury Edit', cat: 'shop' },
                  ].map((c) => (
                    <button
                      key={c.label}
                      onClick={() => handleCategoryShortcut(c.cat)}
                      className="text-left p-2.5 border border-[#E7D6C1] hover:border-[#6B4A3A] hover:bg-[#FAF6F0] text-xs font-medium text-[#2B1D17] transition-colors"
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
