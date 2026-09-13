import React from 'react';
import { Heart, ShoppingBag, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { formatPKR } from '../data/constants';
import { Product } from '../types';

export const WishlistPage: React.FC = () => {
  const { wishlist, removeFromWishlist, addToCart, setCurrentPage, viewProduct, addToast } = useShop();

  const handleMoveToBag = (product: Product) => {
    addToCart(product, product.colors?.[0]?.name || 'Standard', product.sizes?.[0] || 'M', 1);
    removeFromWishlist(product.id);
  };

  const handleAddAllToBag = () => {
    wishlist.forEach((item) => {
      const p = item.product;
      if (p) {
        addToCart(p, p.colors?.[0]?.name || 'Standard', p.sizes?.[0] || 'M', 1);
      }
    });
    addToast('All Pieces Moved', 'All saved garments have been added to your shopping bag.', 'luxury');
    setCurrentPage('cart');
  };

  if (wishlist.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-[#E7D6C1]/30 flex items-center justify-center text-[#2B1D17]">
          <Heart className="w-9 h-9 text-[#6B4A3A]" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#2B1D17] font-normal">
          Your Wishlist is Empty
        </h1>
        <p className="text-xs sm:text-sm text-[#6B4A3A] max-w-md mx-auto leading-relaxed">
          Save garments, bespoke timepieces, and Italian leather accessories as you explore our curated edits.
        </p>
        <div className="pt-4 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => setCurrentPage('shop')}
            className="bg-[#2B1D17] hover:bg-[#6B4A3A] text-[#FAF6F0] text-xs font-semibold tracking-widest uppercase py-3.5 px-7 transition-colors cursor-pointer"
          >
            Explore Catalogue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-[#E7D6C1] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#C48A5A] font-semibold">
            Saved For Later
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#2B1D17] font-normal mt-1">
            My Wishlist ({wishlist.length} Pieces)
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleAddAllToBag}
            className="bg-[#2B1D17] text-[#FAF6F0] hover:bg-[#6B4A3A] text-xs uppercase tracking-wider font-semibold py-3 px-5 transition-colors cursor-pointer flex items-center gap-2"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add All to Bag</span>
          </button>
        </div>
      </div>

      {/* Grid of Wishlist Items */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {wishlist.map((item) => {
          const product = item.product;
          if (!product) return null;

          return (
            <div
              key={item.id}
              className="bg-[#FAF6F0] border border-[#E7D6C1] flex flex-col justify-between group overflow-hidden shadow-xs hover:border-[#6B4A3A] transition-colors"
            >
              <div
                onClick={() => viewProduct(product)}
                className="relative aspect-[3/4] overflow-hidden bg-[#E7D6C1]/20 cursor-pointer"
              >
                <img
                  src={product.images?.[0] || ''}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromWishlist(product.id);
                  }}
                  className="absolute top-2.5 right-2.5 p-2 bg-[#FAF6F0]/90 text-[#2B1D17] hover:text-red-600 rounded-full shadow-xs transition-colors"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[9.5px] uppercase tracking-wider text-[#C48A5A] font-semibold">
                    {product.collection}
                  </span>
                  <h3
                    onClick={() => viewProduct(product)}
                    className="font-serif text-base font-medium text-[#2B1D17] hover:text-[#6B4A3A] cursor-pointer truncate"
                  >
                    {product.name}
                  </h3>
                  <p className="text-xs text-[#6B4A3A] truncate">{product.subtitle}</p>
                  <p className="font-serif text-sm font-bold text-[#2B1D17] mt-1">
                    {formatPKR(product.price)}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E7D6C1]/60">
                  <button
                    onClick={() => handleMoveToBag(product)}
                    className="w-full bg-[#2B1D17] hover:bg-[#6B4A3A] text-[#FAF6F0] text-[11px] uppercase tracking-widest font-semibold py-2.5 px-3 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Move to Bag</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
