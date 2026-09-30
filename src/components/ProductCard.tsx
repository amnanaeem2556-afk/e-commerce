import React, { useState } from 'react';
import { Heart, ShoppingBag, Star, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';
import { formatPKR } from '../data/constants';
import { getOptimizedImageUrl, getResponsiveSrcSet, markImageCached } from '../utils/imageOptimizer';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, priority = false }) => {
  const { viewProduct, addToCart, toggleWishlist, isInWishlist } = useShop();
  const [isHovered, setIsHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0]?.name || '');
  const [isAdding, setIsAdding] = useState(false);

  if (!product) return null;

  const inWishlist = isInWishlist(product.id);
  const rawPrimary = product.images?.[0] || '';
  const rawSecondary = product.images?.[1] || product.images?.[0] || '';

  // Deliver optimized crisp width images with modern format compression
  const primaryImg = getOptimizedImageUrl(rawPrimary, 600, 80);
  const secondaryImg = rawSecondary ? getOptimizedImageUrl(rawSecondary, 600, 80) : '';

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

  return (
    <div
      id={`product-card-${product.id}`}
      role="button"
      tabIndex={0}
      aria-label={`View ${product.name}`}
      onClick={() => viewProduct(product)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          viewProduct(product);
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-[#FAF6F0] rounded-xl sm:rounded-2xl border border-[#EBDDCF] shadow-[0_2px_12px_rgba(43,29,23,0.04)] hover:shadow-[0_8px_24px_rgba(43,29,23,0.08)] hover:border-[#C48A5A]/60 transition-all duration-300 overflow-hidden flex flex-col h-full cursor-pointer select-none"
    >
      {/* Top Image Section: Balanced, Lightweight Aspect Ratio */}
      <div className="relative w-full aspect-[1.25/1] overflow-hidden bg-[#EFE8DF]">
        {/* Primary and Hover Image */}
        <img
          src={primaryImg}
          srcSet={getResponsiveSrcSet(rawPrimary, [320, 480, 600, 800])}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          alt={product.name}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={() => markImageCached(primaryImg)}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover object-center group-hover:scale-104 transition-all duration-700 ease-out ${
            isHovered && secondaryImg ? 'opacity-0' : 'opacity-100'
          }`}
        />
        {secondaryImg && (
          <img
            src={secondaryImg}
            srcSet={getResponsiveSrcSet(rawSecondary, [320, 480, 600, 800])}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            alt={`${product.name} alternate view`}
            loading="lazy"
            decoding="async"
            onLoad={() => markImageCached(secondaryImg)}
            referrerPolicy="no-referrer"
            className={`absolute inset-0 h-full w-full object-cover object-center group-hover:scale-104 transition-all duration-700 ease-out ${
              isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          />
        )}

        {/* Stacked Badges in Top Left: Brown 'NEW SEASON' + White '-XX%' */}
        <div className="absolute top-2 sm:top-2.5 left-2 sm:left-2.5 z-10 flex flex-col items-start gap-0.5 pointer-events-none">
          {product.isNew && (
            <span className="bg-[#9E6D42] text-white text-[8.5px] sm:text-[9px] font-semibold tracking-[0.14em] px-2 py-0.5 rounded-[2px] uppercase shadow-xs">
              NEW SEASON
            </span>
          )}
          {product.discountPercent && product.discountPercent > 0 && (
            <span className="bg-white text-[#2B1D17] text-[9px] sm:text-[9.5px] font-bold tracking-[0.04em] px-1.5 py-0.5 rounded-[2px] shadow-xs">
              -{product.discountPercent}%
            </span>
          )}
        </div>

        {/* Wishlist Heart Icon Button (Circular White Button in Top Right) */}
        <button
          type="button"
          id={`wishlist-btn-${product.id}`}
          aria-label={inWishlist ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          title={inWishlist ? 'Saved in your wishlist' : 'Save to wishlist'}
          onClick={handleWishlist}
          className={`absolute top-2 sm:top-2.5 right-2 sm:right-2.5 z-10 w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full flex items-center justify-center transition-all duration-300 shadow-xs hover:scale-110 active:scale-95 cursor-pointer ${
            inWishlist
              ? 'bg-white text-[#C48A5A] border border-[#C48A5A] shadow-[0_2px_8px_rgba(196,138,90,0.25)]'
              : 'bg-white/95 hover:bg-white text-[#2B1D17] hover:text-[#C48A5A] border border-[#E7D6C1]/70'
          }`}
        >
          <Heart
            className={`w-3 sm:w-3.5 h-3 sm:h-3.5 transition-transform duration-300 ease-out ${
              inWishlist ? 'fill-[#C48A5A] text-[#C48A5A]' : 'text-[#2B1D17] stroke-[1.6]'
            }`}
          />
        </button>
      </div>

      {/* Bottom Content Area: Refined, Lightweight, Compact */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between bg-[#FAF6F0] min-w-0">
        <div className="min-w-0">
          {/* Kicker & Rating Row */}
          <div className="flex items-center justify-between gap-1.5 mb-1.5 min-w-0">
            <span className="font-sans text-[9px] sm:text-[9.5px] uppercase tracking-[0.16em] sm:tracking-[0.18em] text-[#A6805B] font-medium">
              {product.collection || product.subCategory || 'Atelier Reserve'}
            </span>
            <div className="flex items-center gap-1 shrink-0 text-[10.5px] sm:text-[11px] text-[#A6805B] font-medium">
              <Star className="w-3 h-3 fill-[#C48A5A] text-[#C48A5A]" />
              <span className="text-[#2B1D17] font-semibold">{product.rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Classical Serif Title */}
          <h3 className="font-serif text-[15px] sm:text-[16px] lg:text-[16.5px] font-normal text-[#221610] tracking-[0.015em] mb-1.5 leading-snug group-hover:text-[#9E7A5A] transition-colors duration-300 break-words">
            {product.name}
          </h3>

          {/* Fully Written Subtitle & Description */}
          <p className="font-sans text-[12px] sm:text-[12.5px] text-[#523B2F] font-normal leading-relaxed tracking-[0.01em] mb-2.5 break-words">
            {product.subtitle}
          </p>

          {/* Color Swatches */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1.5 mb-2" onClick={(e) => e.stopPropagation()}>
              {product.colors.slice(0, 4).map((c, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedColor(c.name)}
                  className={`w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full border border-black/10 shadow-2xs inline-block transition-transform cursor-pointer ${
                    selectedColor === c.name ? 'scale-125 ring-1.5 ring-[#C48A5A]' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-[9px] text-[#A6805B] font-medium">
                  +{product.colors.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Price & Interactive Action */}
        <div className="flex items-center justify-between pt-2 sm:pt-2.5 border-t border-[#EBDDCF]/70 mt-auto min-w-0">
          <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
            <span className="font-sans text-[13px] sm:text-[14.5px] font-semibold text-[#221610] tracking-normal whitespace-nowrap">
              {formatPKR(product.price)}
            </span>
            {product.oldPrice && (
              <span className="text-[10px] sm:text-[11.5px] text-[#9E8B7E] line-through whitespace-nowrap">
                {formatPKR(product.oldPrice)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-1">
            <button
              type="button"
              aria-label={`Add ${product.name} to cart`}
              onClick={handleQuickAdd}
              disabled={!product.inStock}
              className="w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-full bg-[#FAF6F0] hover:bg-[#C48A5A] text-[#221610] hover:text-white border border-[#EBDDCF] flex items-center justify-center transition-all duration-200 cursor-pointer shadow-2xs"
              title={isAdding ? 'Added to bag' : 'Quick add to bag'}
            >
              <ShoppingBag className="w-3 h-3" />
            </button>
            <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[#8C6D53] group-hover:text-[#221610] group-hover:translate-x-0.5 transition-all duration-300">
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
