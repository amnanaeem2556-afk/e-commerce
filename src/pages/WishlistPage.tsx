import React from 'react';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';

export const WishlistPage: React.FC = () => {
  const { wishlist, addToCart, setCurrentPage, addToast } = useShop();

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
        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-[#2B1D17] tracking-[0.03em] leading-none">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="border-b border-[#E7D6C1] pb-4 sm:pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#C48A5A] font-semibold">
            Saved For Later
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-[#2B1D17] tracking-[0.03em] leading-none mt-1">
            My <span className="text-[#C48A5A]">Wishlist</span> ({wishlist.length})
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleAddAllToBag}
            className="bg-[#2B1D17] text-[#FAF6F0] hover:bg-[#6B4A3A] text-xs uppercase tracking-wider font-semibold py-3 px-5 transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add All to Bag</span>
          </button>
        </div>
      </div>

      {/* Grid of Wishlist Items */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 xl:gap-6">
        {wishlist.map((item) => {
          const product = item.product;
          if (!product) return null;
          return <ProductCard key={item.id} product={product} />;
        })}
      </div>
    </div>
  );
};
