import React, { useState } from 'react';
import { Heart, Eye, ShoppingBag, Star } from 'lucide-react';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';
import { formatPKR } from '../data/constants';
import { getOptimizedImageUrl, markImageCached } from '../utils/imageOptimizer';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, priority = false }) => {
  const { viewProduct, addToCart, toggleWishlist, isInWishlist, setQuickViewProduct } = useShop();
  const [isHovered, setIsHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0]?.name || '');
  const [isAdding, setIsAdding] = useState(false);

  if (!product) return null;

  const inWishlist = isInWishlist(product.id);
  const rawPrimary = product.images?.[0] || '';
  const rawSecondary = product.images?.[1] || product.images?.[0] || '';
  
  // Deliver optimized crisp 600px width images instead of 1200-2000px heavy images
  const primaryImg = getOptimizedImageUrl(rawPrimary, 600, 82);
  const secondaryImg = rawSecondary ? getOptimizedImageUrl(rawSecondary, 600, 82) : '';

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    addToCart(product, selectedColor, product.sizes?.[0] || 'Standard', 1);
    setTimeout(() => setIsAdding(false), 700);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuickViewProduct(product);
  };

  return (
    <div
      id={`product-card-${product.id}`}
      className="group relative flex flex-col bg-[#FAF6F0] border border-[#E7D6C1]/60 hover:border-[#C48A5A]/70 hover:shadow-xl transition-all duration-500 overflow-hidden cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => viewProduct(product)}
    >
      {/* Image Container with Luxury Aspect Ratio */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#E7D6C1]/25">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
          {product.isNew && (
            <span className="bg-[#2B1D17] text-[#FAF6F0] text-[9px] uppercase tracking-[0.22em] px-2.5 py-1 font-semibold shadow-xs">
              New Season
            </span>
          )}
          {product.discountPercent && product.discountPercent > 0 && (
            <span className="bg-[#C48A5A] text-[#2B1D17] text-[9px] uppercase tracking-[0.2em] px-2 py-1 font-bold shadow-xs">
              -{product.discountPercent}%
            </span>
          )}
        </div>

        {/* Wishlist Button with Luxury Micro-Interaction */}
        <button
          id={`wishlist-btn-${product.id}`}
          onClick={handleWishlist}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-xs ${
            inWishlist
              ? 'bg-[#2B1D17] text-[#C48A5A] scale-105'
              : 'bg-[#FAF6F0]/90 backdrop-blur-xs text-[#2B1D17] hover:bg-[#2B1D17] hover:text-[#FAF6F0]'
          }`}
        >
          <Heart className={`w-4 h-4 transition-transform active:scale-125 ${inWishlist ? 'fill-[#C48A5A] text-[#C48A5A]' : ''}`} />
        </button>

        {/* Product Images (Primary and Alternate view crossfade) */}
        <img
          src={primaryImg}
          alt={product.name}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={() => markImageCached(primaryImg)}
          referrerPolicy="no-referrer"
          className={`h-full w-full object-cover object-center transition-all duration-700 ease-out ${
            isHovered && secondaryImg ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
          }`}
        />
        {secondaryImg && (
          <img
            src={secondaryImg}
            alt={`${product.name} alternate view`}
            loading="lazy"
            decoding="async"
            onLoad={() => markImageCached(secondaryImg)}
            referrerPolicy="no-referrer"
            className={`absolute inset-0 h-full w-full object-cover object-center transition-all duration-700 ease-out ${
              isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
            }`}
          />
        )}

        {/* Floating Quick Action Bar on Hover */}
        <div
          className={`absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-[#2B1D17]/80 via-[#2B1D17]/40 to-transparent transition-all duration-300 flex items-center justify-center gap-2 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
          }`}
        >
          <button
            onClick={handleQuickView}
            className="flex-1 bg-[#FAF6F0] hover:bg-[#2B1D17] text-[#2B1D17] hover:text-[#FAF6F0] text-[10px] font-semibold tracking-[0.15em] uppercase py-2.5 px-3 flex items-center justify-center gap-1.5 transition-all duration-200 shadow-sm"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
          <button
            onClick={handleQuickAdd}
            disabled={!product.inStock}
            className="flex-1 bg-[#2B1D17] hover:bg-[#C48A5A] text-[#FAF6F0] hover:text-[#2B1D17] text-[10px] font-semibold tracking-[0.15em] uppercase py-2.5 px-3 flex items-center justify-center gap-1.5 transition-all duration-200 shadow-sm disabled:opacity-50"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isAdding ? 'Added!' : 'Add to Bag'}</span>
          </button>
        </div>
      </div>

      {/* Editorial Content */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-[#FAF6F0]">
        <div>
          {/* Eyebrow & Collection Tag */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[9.5px] uppercase tracking-[0.22em] text-[#C48A5A] font-semibold truncate">
              {product.collection || product.subCategory || 'Atelier Reserve'}
            </span>

            {/* Rating */}
            <div className="flex items-center gap-1 shrink-0">
              <Star className="w-3 h-3 fill-[#C48A5A] text-[#C48A5A]" />
              <span className="text-[10px] text-[#6B4A3A] font-medium">
                {product.rating.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-serif text-[17px] text-[#2B1D17] group-hover:text-[#6B4A3A] transition-colors line-clamp-1 font-normal leading-snug">
            {product.name}
          </h3>

          {/* Subtitle / Fabric Line */}
          <p className="text-[11.5px] text-[#6B4A3A]/85 line-clamp-1 mt-0.5 mb-3 font-light">
            {product.subtitle}
          </p>
        </div>

        {/* Swatches & Pricing */}
        <div className="pt-2.5 border-t border-[#E7D6C1]/50 flex items-center justify-between">
          {/* Swatches */}
          {product.colors && product.colors.length > 0 ? (
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              {product.colors.slice(0, 4).map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(c.name)}
                  title={c.name}
                  className={`w-3.5 h-3.5 rounded-full transition-all ${
                    selectedColor === c.name
                      ? 'ring-1.5 ring-offset-1 ring-[#2B1D17] scale-110'
                      : 'border border-[#2B1D17]/20 hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-[9.5px] text-[#6B4A3A]/70 ml-0.5">
                  +{product.colors.length - 4}
                </span>
              )}
            </div>
          ) : (
            <div />
          )}

          {/* Prices in PKR */}
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-base font-semibold text-[#2B1D17] tracking-tight">
              {formatPKR(product.price)}
            </span>
            {product.oldPrice && (
              <span className="text-xs text-[#6B4A3A]/60 line-through">
                {formatPKR(product.oldPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
