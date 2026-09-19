import React, { useState } from 'react';
import {
  Star,
  Heart,
  ShoppingBag,
  Ruler,
  Truck,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Maximize2,
  X,
  CheckCircle2,
  ThumbsUp,
  ArrowRight,
  Share2
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Product, Review, PageType } from '../types';
import { INITIAL_REVIEWS } from '../data/reviews';
import { PRODUCTS } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { formatPKR } from '../data/constants';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';

export const ProductDetailPage: React.FC = () => {
  const {
    selectedProduct,
    addToCart,
    toggleWishlist,
    isInWishlist,
    setCurrentPage,
    setSelectedCategoryFilter,
    setIsSizeGuideOpen,
    addToast
  } = useShop();

  const product = selectedProduct;
  const inWishlist = isInWishlist(product.id);

  // Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });

  // Customization state
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0]?.name || '');
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || '');
  const [quantity, setQuantity] = useState(1);

  // Accordion state
  const [openAccordion, setOpenAccordion] = useState<string | null>('details');

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>(() => {
    return INITIAL_REVIEWS.filter((r) => r.productId === product.id).concat(
      INITIAL_REVIEWS.filter((r) => r.productId !== product.id).slice(0, 2)
    );
  });

  const [isWritingReview, setIsWritingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    author: '',
    email: '',
    city: 'Lahore',
    rating: 5,
    title: '',
    comment: ''
  });
  const [reviewErrors, setReviewErrors] = useState<Record<string, string>>({});
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Zoom handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const handleAddToCart = () => {
    addToCart(product, selectedColor, selectedSize, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedColor, selectedSize, quantity);
    setCurrentPage('checkout');
  };

  const handleHelpfulVote = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          if (r.userVoted) return r;
          return { ...r, helpfulCount: r.helpfulCount + 1, userVoted: true };
        }
        return r;
      })
    );
    addToast('Marked Helpful', 'Thank you for your feedback.', 'info');
  };

  const validateReviewForm = () => {
    const errs: Record<string, string> = {};
    if (!reviewForm.author.trim() || !/^[A-Za-z\s]+$/.test(reviewForm.author)) {
      errs.author = 'Please enter a valid name (letters and spaces only).';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!reviewForm.email.trim() || !emailRegex.test(reviewForm.email)) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!reviewForm.title.trim()) {
      errs.title = 'Please provide a short headline for your review.';
    }
    if (!reviewForm.comment.trim() || reviewForm.comment.length < 15) {
      errs.comment = 'Kindly write at least 15 characters describing the fit, feel, or quality.';
    }
    setReviewErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateReviewForm()) return;

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      productId: product.id,
      author: reviewForm.author,
      city: reviewForm.city,
      rating: reviewForm.rating,
      title: reviewForm.title,
      comment: reviewForm.comment,
      date: 'Today',
      verified: true,
      helpfulCount: 1,
      userVoted: false
    };

    setReviews([newRev, ...reviews]);
    setReviewSubmitted(true);
    addToast('Review Published', 'Thank you for sharing your bespoke experience.', 'luxury');
    setTimeout(() => {
      setIsWritingReview(false);
      setReviewSubmitted(false);
      setReviewForm({
        author: '',
        email: '',
        city: 'Lahore',
        rating: 5,
        title: '',
        comment: ''
      });
    }, 2000);
  };

  // Related products (strictly same category to prevent mixing)
  const related = PRODUCTS.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);

  // Star breakdown math
  const ratingsCount = reviews.length;
  const avgRating = ratingsCount > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / ratingsCount : 4.8;
  const starCounts = [5, 4, 3, 2, 1].map((s) => ({
    star: s,
    count: reviews.filter((r) => r.rating === s).length,
    percentage: ratingsCount > 0 ? (reviews.filter((r) => r.rating === s).length / ratingsCount) * 100 : 0
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Breadcrumbs */}
      <nav className="text-[11px] text-[#6B4A3A] flex items-center gap-2 uppercase tracking-widest">
        <button onClick={() => setCurrentPage('home')} className="hover:text-[#2B1D17]">
          Home
        </button>
        <span>/</span>
        <button
          onClick={() => {
            setSelectedCategoryFilter(product.category);
            setCurrentPage(product.category as PageType);
          }}
          className="hover:text-[#2B1D17]"
        >
          {product.category}
        </button>
        <span>/</span>
        <span className="text-[#2B1D17] font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Two-Column Atelier Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* LEFT: IMAGE GALLERY (6-8 images, thumbnails, zoom, lightbox) */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4 items-start">
          {/* Thumbnails (vertical on desktop, horizontal on mobile) */}
          <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto w-full md:w-20 shrink-0 pb-2 md:pb-0 max-h-[640px]">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative aspect-[3/4] w-16 md:w-full overflow-hidden border transition-all cursor-pointer ${
                  activeImageIndex === idx
                    ? 'border-[#2B1D17] ring-1 ring-[#2B1D17]'
                    : 'border-[#E7D6C1] opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={getOptimizedImageUrl(img, 160, 80)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />
              </button>
            ))}
          </div>

          {/* Main Large Image Stage with Hover Zoom */}
          <div className="flex-1 w-full relative">
            <div
              className="relative aspect-[3/4] w-full overflow-hidden bg-[#E7D6C1]/20 border border-[#E7D6C1]/60 cursor-crosshair group"
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
              onMouseMove={handleMouseMove}
              onClick={() => setIsLightboxOpen(true)}
            >
              <img
                src={getOptimizedImageUrl(product.images[activeImageIndex], 1000, 85)}
                alt={product.name}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover object-center transition-transform duration-300 ${
                  isZooming ? 'scale-150' : 'scale-100'
                }`}
                style={
                  isZooming
                    ? {
                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`
                      }
                    : undefined
                }
              />

              {/* Fullscreen icon button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLightboxOpen(true);
                }}
                className="absolute bottom-4 right-4 p-2 bg-[#FAF6F0]/90 backdrop-blur-xs text-[#2B1D17] hover:bg-[#2B1D17] hover:text-[#FAF6F0] transition-colors shadow-md"
                aria-label="Fullscreen Gallery"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Hint badge */}
              <div className="absolute top-4 left-4 bg-[#2B1D17]/80 text-[#FAF6F0] text-[9.5px] uppercase tracking-widest px-2.5 py-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                Hover to Zoom &bull; Click for Fullscreen
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: EDITORIAL DETAILS & CONTROLS */}
        <div className="lg:col-span-5 flex flex-col justify-start space-y-6">
          {/* Header & Badges */}
          <div className="space-y-2 border-b border-[#E7D6C1]/60 pb-5">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] uppercase tracking-[0.25em] text-[#C48A5A] font-semibold">
                {product.collection} &bull; {product.subCategory}
              </span>
              <button
                onClick={() => toggleWishlist(product)}
                className="flex items-center gap-1.5 text-xs text-[#6B4A3A] hover:text-[#2B1D17] transition-colors cursor-pointer"
              >
                <Heart className={`w-4 h-4 ${inWishlist ? 'fill-[#C48A5A] text-[#C48A5A]' : ''}`} />
                <span>{inWishlist ? 'Saved' : 'Wishlist'}</span>
              </button>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-[#2B1D17] tracking-[0.03em] leading-[1.05] break-words">
              {product.name}
            </h1>

            {/* Rating Stars & Count */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex text-[#C48A5A]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating) ? 'fill-[#C48A5A] text-[#C48A5A]' : 'text-[#E7D6C1]'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-[#2B1D17]">
                {product.rating.toFixed(1)}
              </span>
              <a href="#customer-reviews" className="text-xs text-[#6B4A3A] underline decoration-[#C48A5A]/60">
                ({product.reviewCount} Client Reviews)
              </a>
            </div>

            {/* Price Display */}
            <div className="flex items-baseline gap-3 pt-3">
              <span className="font-sans text-2xl sm:text-3xl font-bold text-[#2B1D17] tracking-tight">
                {formatPKR(product.price)}
              </span>
              {product.oldPrice && (
                <span className="text-sm sm:text-base text-[#6B4A3A]/60 line-through">
                  {formatPKR(product.oldPrice)}
                </span>
              )}
              {product.discountPercent && (
                <span className="text-xs bg-[#C48A5A]/15 text-[#6B4A3A] px-2.5 py-0.5 font-semibold">
                  Save {product.discountPercent}%
                </span>
              )}
            </div>

            <p className="text-xs text-[#6B4A3A] font-light">
              Taxes included. Hand-delivered in signature archival gift box.
            </p>
          </div>

          {/* Short Luxury Description */}
          <p className="text-xs sm:text-sm text-[#2B1D17]/85 font-light leading-relaxed">
            {product.description}
          </p>

          {/* Color Selection */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#2B1D17] font-medium">
                Atelier Palette: <strong className="font-semibold">{selectedColor}</strong>
              </span>
            </div>
            <div className="flex gap-2.5">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(c.name)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs border transition-all cursor-pointer ${
                    selectedColor === c.name
                      ? 'border-[#2B1D17] bg-[#FAF6F0] ring-1 ring-[#2B1D17] font-semibold'
                      : 'border-[#E7D6C1] hover:border-[#6B4A3A]'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection & Size Guide */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#2B1D17] font-medium">
                Select Sizing: <strong className="font-semibold">{selectedSize}</strong>
              </span>
              <button
                onClick={() => setIsSizeGuideOpen(true)}
                className="text-xs text-[#C48A5A] hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Size Guide</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`px-4 py-2 text-xs uppercase tracking-wider border transition-all cursor-pointer ${
                    selectedSize === s
                      ? 'border-[#2B1D17] bg-[#2B1D17] text-[#FAF6F0] font-semibold'
                      : 'border-[#E7D6C1] text-[#2B1D17] hover:border-[#2B1D17] bg-[#FAF6F0]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Stock Indicator */}
          <div className="flex items-center gap-6 pt-2">
            <div className="space-y-1">
              <span className="text-xs font-medium text-[#2B1D17] block">Quantity:</span>
              <div className="flex items-center border border-[#E7D6C1] bg-[#FAF6F0]">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-xs text-[#2B1D17] hover:bg-[#E7D6C1]/50 cursor-pointer"
                >
                  -
                </button>
                <span className="px-4 py-2 text-xs font-semibold text-[#2B1D17]">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-2 text-xs text-[#2B1D17] hover:bg-[#E7D6C1]/50 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="text-xs text-[#6B4A3A]">
              <span className="inline-flex items-center gap-1.5 text-emerald-800 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                Available In Atelier Stock
              </span>
              <p className="text-[11px] text-[#6B4A3A]/80 mt-0.5">Ready for immediate dispatch from Lahore salon</p>
            </div>
          </div>

          {/* Action Buttons: ADD TO CART, BUY NOW, WISHLIST */}
          <div className="space-y-3 pt-4 border-t border-[#E7D6C1]/60">
            <button
              onClick={handleAddToCart}
              className="w-full bg-[#2B1D17] hover:bg-[#6B4A3A] text-[#FAF6F0] text-xs font-semibold tracking-[0.2em] uppercase py-4 px-6 flex items-center justify-center gap-2.5 transition-colors shadow-lg cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart &bull; {formatPKR(product.price * quantity)}</span>
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <button
                onClick={handleBuyNow}
                className="w-full bg-[#C48A5A] hover:bg-[#C48A5A]/90 text-[#2B1D17] text-xs font-semibold tracking-[0.16em] uppercase py-3.5 px-4 transition-colors cursor-pointer text-center"
              >
                Buy Now (Fast Checkout)
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`w-full border text-xs font-semibold tracking-[0.16em] uppercase py-3.5 px-4 flex items-center justify-center gap-2 transition-colors cursor-pointer text-center ${
                  inWishlist
                    ? 'border-[#2B1D17] bg-[#2B1D17] text-[#FAF6F0]'
                    : 'border-[#6B4A3A] text-[#2B1D17] hover:border-[#2B1D17]'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${inWishlist ? 'fill-[#C48A5A] text-[#C48A5A]' : ''}`} />
                <span>{inWishlist ? 'In Wishlist' : 'Add to Wishlist'}</span>
              </button>
            </div>
          </div>

          {/* Information Sections (Accordions) */}
          <div className="divide-y divide-[#E7D6C1] border-t border-b border-[#E7D6C1] pt-1">
            {[
              {
                id: 'details',
                title: 'Product Details & Silhouette',
                content: (
                  <div className="space-y-2 text-xs text-[#2B1D17]/85 leading-relaxed font-light">
                    <p>{product.description}</p>
                    <p><strong>Atelier Cut:</strong> Regular refined drape designed to layer smoothly.</p>
                    <p><strong>Finished:</strong> Hand-inspected with serial numbering tag.</p>
                  </div>
                )
              },
              {
                id: 'material',
                title: 'Material & Craftsmanship Origin',
                content: (
                  <div className="space-y-2 text-xs text-[#2B1D17]/85 leading-relaxed font-light">
                    <p><strong>Primary Composition:</strong> {product.details.material}</p>
                    <p><strong>Origin:</strong> {product.details.origin}</p>
                    <p>Harvested and woven following strict European OEKO-TEX® standards.</p>
                  </div>
                )
              },
              {
                id: 'care',
                title: 'Care Instructions',
                content: (
                  <div className="text-xs text-[#2B1D17]/85 leading-relaxed font-light">
                    <p>{product.details.care}</p>
                  </div>
                )
              },
              {
                id: 'shipping',
                title: 'Delivery & White-Glove Shipping',
                content: (
                  <div className="space-y-2 text-xs text-[#2B1D17]/85 leading-relaxed font-light">
                    <p>{product.details.delivery}</p>
                    <p><strong>Domestic Timeline:</strong> 2-3 business days across Karachi, Lahore, Islamabad, Faisalabad, and Rawalpindi. Tracked at every transit checkpoint.</p>
                  </div>
                )
              },
              {
                id: 'returns',
                title: 'Returns & Exchanges Policy',
                content: (
                  <div className="text-xs text-[#2B1D17]/85 leading-relaxed font-light">
                    <p>{product.details.returns}</p>
                  </div>
                )
              }
            ].map((section) => (
              <div key={section.id} className="py-3">
                <button
                  onClick={() => setOpenAccordion(openAccordion === section.id ? null : section.id)}
                  className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#2B1D17] hover:text-[#C48A5A] transition-colors py-1 cursor-pointer"
                >
                  <span>{section.title}</span>
                  {openAccordion === section.id ? (
                    <ChevronUp className="w-4 h-4 text-[#C48A5A]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#6B4A3A]" />
                  )}
                </button>
                {openAccordion === section.id && (
                  <div className="pt-2 pb-1 animate-fadeIn">
                    {section.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-[#2B1D17]/95 flex flex-col justify-between p-4 sm:p-8">
          <div className="flex justify-between items-center text-[#FAF6F0]">
            <span className="text-xs uppercase tracking-widest font-sans font-semibold">
              {product.name} &bull; Image {activeImageIndex + 1} of {product.images.length}
            </span>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 text-[#FAF6F0] hover:text-[#C48A5A]"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center p-4">
            <img
              src={product.images[activeImageIndex]}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="max-h-[82vh] max-w-full object-contain"
            />
          </div>

          <div className="flex justify-center gap-3 overflow-x-auto py-2">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImageIndex(i)}
                className={`w-14 h-18 border overflow-hidden shrink-0 ${
                  activeImageIndex === i ? 'border-[#C48A5A]' : 'border-transparent opacity-60'
                }`}
              >
                <img src={img} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* REVIEWS SECTION: Breakdown & Review Form */}
      <section id="customer-reviews" className="border-t border-[#E7D6C1] pt-14 space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#C48A5A] font-semibold">
              Client Authenticity
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl text-[#2B1D17] mt-1 tracking-[0.03em] leading-none">
              Customer Reviews
            </h2>
          </div>

          <button
            onClick={() => setIsWritingReview(!isWritingReview)}
            className="bg-[#2B1D17] hover:bg-[#6B4A3A] text-[#FAF6F0] text-xs uppercase tracking-widest font-semibold py-3 px-6 transition-colors cursor-pointer"
          >
            {isWritingReview ? 'Close Review Form' : 'Write a Review'}
          </button>
        </div>

        {/* Overall Rating & Star Breakdown */}
        <div className="bg-white border border-[#E2D4C3] p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center shadow-[0_4px_24px_rgba(43,29,23,0.06)]">
          {/* Rating Score */}
          <div className="md:col-span-4 text-center md:text-left border-b md:border-b-0 md:border-r border-[#EFE5D8] pb-6 md:pb-0 md:pr-8">
            <div className="font-sans text-5xl font-bold text-[#1F140E] tracking-tight">
              {avgRating.toFixed(1)} <span className="text-xl text-[#7A6253] font-normal">/ 5</span>
            </div>
            <div className="flex items-center justify-center md:justify-start text-[#A66838] gap-1 my-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < Math.floor(avgRating) ? 'fill-[#A66838] text-[#A66838]' : 'text-[#E2D4C3]'}`}
                />
              ))}
            </div>
            <p className="text-xs text-[#523B2F]">
              Based on {ratingsCount} verified patron appraisals
            </p>
          </div>

          {/* Star Breakdown Bars */}
          <div className="md:col-span-8 space-y-2 text-xs">
            {starCounts.map((item) => (
              <div key={item.star} className="flex items-center gap-3">
                <span className="w-12 text-[#1F140E] font-semibold">{item.star} stars</span>
                <div className="flex-1 h-2 bg-[#FAF6F0] border border-[#E2D4C3] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#A66838] transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right text-[#7A6253] text-[11px] font-medium">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WRITE A REVIEW FORM (With Strict Validation) */}
        {isWritingReview && (
          <div className="bg-white border border-[#1F140E] p-6 sm:p-8 animate-fadeIn shadow-[0_4px_24px_rgba(43,29,23,0.08)]">
            <div className="mb-6">
              <h3 className="font-heading text-2xl sm:text-3xl text-[#1F140E] tracking-[0.03em] leading-none">Write a Review</h3>
              <p className="text-xs text-[#523B2F] mt-1">
                Your appraisal helps uphold Lumora's uncompromising standards of sartorial excellence.
              </p>
            </div>

            {reviewSubmitted ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-[#A66838] mx-auto" />
                <h4 className="font-sans text-lg font-semibold text-[#1F140E]">Thank you for your appraisal</h4>
                <p className="text-xs text-[#523B2F]">Your review has been cataloged under verified purchases.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#1F140E] block mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={reviewForm.author}
                      onChange={(e) => setReviewForm({ ...reviewForm, author: e.target.value })}
                      placeholder="e.g. Fatima Ali"
                      className={`w-full p-2.5 bg-[#FAF6F0] border text-xs text-[#1F140E] focus:bg-white focus:outline-none focus:border-[#1F140E] ${
                        reviewErrors.author ? 'border-red-500' : 'border-[#D5C2AF]'
                      }`}
                    />
                    {reviewErrors.author && <p className="text-[11px] text-red-500 mt-1">{reviewErrors.author}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#1F140E] block mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={reviewForm.email}
                      onChange={(e) => setReviewForm({ ...reviewForm, email: e.target.value })}
                      placeholder="e.g. fatima@example.com"
                      className={`w-full p-2.5 bg-[#FAF6F0] border text-xs text-[#1F140E] focus:bg-white focus:outline-none focus:border-[#1F140E] ${
                        reviewErrors.email ? 'border-red-500' : 'border-[#D5C2AF]'
                      }`}
                    />
                    {reviewErrors.email && <p className="text-[11px] text-red-500 mt-1">{reviewErrors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-[#1F140E] block mb-1">City</label>
                    <input
                      type="text"
                      value={reviewForm.city}
                      onChange={(e) => setReviewForm({ ...reviewForm, city: e.target.value })}
                      placeholder="e.g. Karachi / Islamabad"
                      className="w-full p-2.5 bg-[#FAF6F0] border border-[#D5C2AF] text-xs text-[#1F140E] focus:bg-white focus:outline-none focus:border-[#1F140E]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#1F140E] block mb-1">Rating</label>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          type="button"
                          key={s}
                          onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                          className="p-1 text-[#A66838] cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 transition-colors ${
                              s <= reviewForm.rating ? 'fill-[#A66838] text-[#A66838]' : 'text-[#E2D4C3] hover:text-[#A66838]'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1F140E] block mb-1">
                    Review Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                    placeholder="e.g. Sublime drape and incredible hand-feel"
                    className={`w-full p-2.5 bg-[#FAF6F0] border text-xs text-[#1F140E] focus:bg-white focus:outline-none focus:border-[#1F140E] ${
                      reviewErrors.title ? 'border-red-500' : 'border-[#D5C2AF]'
                    }`}
                  />
                  {reviewErrors.title && <p className="text-[11px] text-red-500 mt-1">{reviewErrors.title}</p>}
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1F140E] block mb-1">
                    Your Experience & Comments <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    placeholder="Share how the fabric feels, fit accuracy, and overall unboxing..."
                    className={`w-full p-2.5 bg-[#FAF6F0] border text-xs text-[#1F140E] focus:bg-white focus:outline-none focus:border-[#1F140E] ${
                      reviewErrors.comment ? 'border-red-500' : 'border-[#D5C2AF]'
                    }`}
                  />
                  {reviewErrors.comment && <p className="text-[11px] text-red-500 mt-1">{reviewErrors.comment}</p>}
                </div>

                <button
                  type="submit"
                  className="bg-[#1F140E] hover:bg-[#A66838] text-[#FAF6F0] text-xs font-semibold uppercase tracking-widest py-3 px-6 transition-colors cursor-pointer shadow-sm"
                >
                  Submit Appraisal
                </button>
              </form>
            )}
          </div>
        )}

        {/* List of Verified Reviews */}
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div key={rev.id} className="bg-white border border-[#E2D4C3] p-6 space-y-3 shadow-xs hover:border-[#A66838] transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex text-[#A66838]">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? 'fill-[#A66838] text-[#A66838]' : 'text-[#E2D4C3]'
                        }`}
                      />
                    ))}
                  </div>
                  <h4 className="font-sans text-sm sm:text-base font-semibold text-[#1F140E] leading-snug">
                    {rev.title}
                  </h4>
                </div>
                <span className="text-[11px] text-[#7A6253] font-medium">{rev.date}</span>
              </div>

              <p className="text-xs text-[#3D2B22] leading-relaxed font-light">
                {rev.comment}
              </p>

              <div className="flex items-center justify-between pt-2 text-xs border-t border-[#EFE5D8]">
                <div className="flex items-center gap-2 text-[#523B2F]">
                  <span className="font-semibold text-[#1F140E]">{rev.author}</span>
                  <span>&bull;</span>
                  <span>{rev.city}</span>
                  {rev.verified && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-200 font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified Purchase
                    </span>
                  )}
                </div>

                {/* Helpful Button */}
                <button
                  onClick={() => handleHelpfulVote(rev.id)}
                  disabled={rev.userVoted}
                  className="flex items-center gap-1.5 text-xs text-[#523B2F] hover:text-[#1F140E] transition-colors disabled:opacity-60 cursor-pointer"
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${rev.userVoted ? 'text-[#A66838] fill-[#A66838]' : ''}`} />
                  <span>Helpful ({rev.helpfulCount})</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* YOU MAY ALSO ADMIRE (Related Products) */}
      <section className="border-t border-[#E7D6C1] pt-14 space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#C48A5A] font-semibold">
              Curated Accompaniments
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl text-[#2B1D17] tracking-[0.03em] leading-none mt-1">
              Related <span className="text-[#C48A5A]">Products</span>
            </h2>
          </div>
          <button
            onClick={() => setCurrentPage('shop')}
            className="text-xs uppercase tracking-widest text-[#2B1D17] hover:text-[#C48A5A] flex items-center gap-1 font-semibold"
          >
            <span>View Full Edit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
};
