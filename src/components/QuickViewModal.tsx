import React, { useState, useEffect } from 'react';
import { X, Star, Heart, Check, ShoppingBag, ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { formatPKR } from '../data/constants';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';

export const QuickViewModal: React.FC = () => {
  const { quickViewProduct, setQuickViewProduct, addToCart, toggleWishlist, isInWishlist, viewProduct } = useShop();
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (quickViewProduct) {
      setSelectedImage(quickViewProduct.images?.[0] || '');
      setSelectedColor(quickViewProduct.colors?.[0]?.name || '');
      setSelectedSize(quickViewProduct.sizes?.[0] || '');
      setQuantity(1);
    }
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, selectedColor, selectedSize, quantity);
    setQuickViewProduct(null);
  };

  const handleOpenFull = () => {
    setQuickViewProduct(null);
    viewProduct(product);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#2B1D17]/70 backdrop-blur-xs transition-opacity"
        onClick={() => setQuickViewProduct(null)}
      />

      {/* Modal Dialog */}
      <div className="relative bg-[#FAF6F0] w-full max-w-4xl shadow-2xl border border-[#E7D6C1] z-10 overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-4 right-4 z-20 p-2 text-[#2B1D17] hover:text-[#C48A5A] transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Gallery Preview */}
        <div className="md:w-1/2 p-4 md:p-6 flex flex-col bg-[#E7D6C1]/15">
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#FAF6F0] mb-3">
            <img
              src={getOptimizedImageUrl(selectedImage || product.images[0], 700, 82)}
              alt={product.name}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {product.images.slice(0, 4).map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`relative w-14 h-16 shrink-0 overflow-hidden border transition-all ${
                  selectedImage === img ? 'border-[#2B1D17] ring-1 ring-[#2B1D17]' : 'border-[#E7D6C1] opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={getOptimizedImageUrl(img, 140, 78)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info & Controls */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex text-[#C48A5A]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(product.rating) ? 'fill-[#C48A5A] text-[#C48A5A]' : 'text-[#E7D6C1]'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-[#6B4A3A]">
                {product.rating.toFixed(1)} ({product.reviewCount} reviews)
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[#C48A5A] font-semibold ml-auto">
                {product.collection}
              </span>
            </div>

            <h2 className="font-heading text-2xl sm:text-3xl text-[#2B1D17] tracking-[0.03em] leading-none">{product.name}</h2>
            <p className="text-xs text-[#6B4A3A] mt-1 mb-4">{product.subtitle}</p>

            <div className="flex items-baseline gap-3 pb-4 border-b border-[#E7D6C1]/60">
              <span className="text-xl font-bold text-[#2B1D17] tracking-tight">
                {formatPKR(product.price)}
              </span>
              {product.oldPrice && (
                <span className="text-sm text-[#6B4A3A]/60 line-through">
                  {formatPKR(product.oldPrice)}
                </span>
              )}
              {product.discountPercent && (
                <span className="text-xs bg-[#C48A5A]/15 text-[#6B4A3A] px-2 py-0.5 font-medium">
                  Save {product.discountPercent}%
                </span>
              )}
            </div>

            <p className="text-xs text-[#2B1D17]/80 line-clamp-3 mt-4 leading-relaxed font-light">
              {product.description}
            </p>

            {/* Colors */}
            <div className="mt-5">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="font-medium text-[#2B1D17]">Shade: <span className="text-[#6B4A3A]">{selectedColor}</span></span>
              </div>
              <div className="flex gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs border rounded-none transition-all ${
                      selectedColor === c.name
                        ? 'border-[#2B1D17] bg-[#FAF6F0] font-medium'
                        : 'border-[#E7D6C1] hover:border-[#6B4A3A]'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="mt-4">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="font-medium text-[#2B1D17]">Size: <span className="text-[#6B4A3A]">{selectedSize}</span></span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-3 py-1.5 text-xs border uppercase tracking-wider transition-all ${
                      selectedSize === s
                        ? 'border-[#2B1D17] bg-[#2B1D17] text-[#FAF6F0] font-medium'
                        : 'border-[#E7D6C1] text-[#2B1D17] hover:border-[#2B1D17]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mt-4 flex items-center gap-3">
              <span className="text-xs font-medium text-[#2B1D17]">Qty:</span>
              <div className="flex items-center border border-[#E7D6C1]">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-2.5 py-1 text-xs text-[#2B1D17] hover:bg-[#E7D6C1]/50"
                >
                  -
                </button>
                <span className="px-3 py-1 text-xs font-semibold text-[#2B1D17]">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-2.5 py-1 text-xs text-[#2B1D17] hover:bg-[#E7D6C1]/50"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-6 pt-4 border-t border-[#E7D6C1]/60 space-y-2">
            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-[#2B1D17] text-[#FAF6F0] hover:bg-[#6B4A3A] text-xs font-medium tracking-widest uppercase py-3 px-4 flex items-center justify-center gap-2 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Bag</span>
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                aria-label="Wishlist"
                className={`p-3 border transition-colors ${
                  inWishlist
                    ? 'border-[#2B1D17] bg-[#2B1D17] text-[#FAF6F0]'
                    : 'border-[#E7D6C1] text-[#2B1D17] hover:border-[#2B1D17]'
                }`}
              >
                <Heart className={`w-4 h-4 ${inWishlist ? 'fill-[#C48A5A] text-[#C48A5A]' : ''}`} />
              </button>
            </div>
            <button
              onClick={handleOpenFull}
              className="w-full text-center text-xs text-[#6B4A3A] hover:text-[#2B1D17] flex items-center justify-center gap-1 py-1 font-medium underline decoration-[#C48A5A]"
            >
              <span>View Full Editorial Details & Sizing</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
