import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, ArrowUpRight, Star, Compass, Award, Feather, Heart } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { PRODUCTS, CATEGORIES_META } from '../data/products';
import { INITIAL_REVIEWS } from '../data/reviews';
import { ProductCard } from '../components/ProductCard';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';

import heroEditorialPortrait from '../assets/images/hero_editorial_portrait_1789122773345.jpg';
import heroFullbodyTailoring from '../assets/images/hero_fullbody_tailoring_1789122795297.jpg';
import heroLifestyleScene from '../assets/images/hero_lifestyle_scene_1789122837997.jpg';
import heroHorologyCloseup from '../assets/images/hero_horology_closeup_1789122819384.jpg';

// Pre-cache all high-resolution hero banner images into memory immediately for instant smooth display
const HERO_BANNER_SOURCES = [
  heroEditorialPortrait,
  heroFullbodyTailoring,
  heroLifestyleScene,
  heroHorologyCloseup,
];

if (typeof window !== 'undefined') {
  HERO_BANNER_SOURCES.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}

export const HomePage: React.FC = () => {
  const { setCurrentPage, setSelectedCategoryFilter, toggleWishlist, isInWishlist } = useShop();

  // Hero Slider State & Progress
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideProgress, setSlideProgress] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});
  const [activeMaterial, setActiveMaterial] = useState<'cashmere' | 'silk' | 'leather' | 'horology'>('cashmere');

  const heroSlides = [
    {
      id: 'slide-0',
      subtitle: 'AUTUMN 2026',
      title: 'Modern Tailoring',
      italicWord: 'Tailoring',
      description: 'Sculpted double-faced Mongolian cashmere and Italian virgin wool melton. Designed to be remembered, engineered for decades.',
      cta: 'EXPLORE COLLECTION',
      secondaryCta: 'VIEW LOOKBOOK',
      linkPage: 'shop' as const,
      category: null,
      image: heroEditorialPortrait,
      badge: 'Florence Atelier',
      tabLabel: 'Autumn Edit',
    },
    {
      id: 'slide-1',
      subtitle: 'MEN’S SARTORIAL',
      title: 'Italian Tailoring',
      italicWord: 'Tailoring',
      description: 'Pure unblended fibers, hand-stitched pick lapels, and bespoke tailoring tailored in Northern Italy.',
      cta: 'THE MEN’S SARTORIAL',
      secondaryCta: 'OUR MANIFESTO',
      linkPage: 'men' as const,
      category: 'men',
      image: heroFullbodyTailoring,
      badge: 'Italian Wool Melton',
      tabLabel: 'Men’s Sartorial',
    },
    {
      id: 'slide-2',
      subtitle: 'WOMEN’S ATELIER',
      title: 'Silk & Cashmere',
      italicWord: 'Cashmere',
      description: 'Bias-cut 22-momme pure Como mulberry silk and cocoon cashmere coats tailored to caress natural contours with graceful ease.',
      cta: 'DISCOVER WOMEN',
      secondaryCta: 'SHOP COATS',
      linkPage: 'women' as const,
      category: 'women',
      image: heroLifestyleScene,
      badge: 'Como Silk & Cashmere',
      tabLabel: 'Women’s Atelier',
    },
    {
      id: 'slide-3',
      subtitle: 'FINE HOROLOGY',
      title: 'Swiss Timepieces',
      italicWord: 'Timepieces',
      description: 'Swiss-calibre 28,800 vph chronographs and Blake-stitched French calfskin loafers built to outlive fleeting trends.',
      cta: 'DISCOVER HOROLOGY',
      secondaryCta: 'EXPLORE SHOES',
      linkPage: 'watches' as const,
      category: 'watches',
      image: heroHorologyCloseup,
      badge: 'Swiss Mechanical Automatic',
      tabLabel: 'Fine Horology',
    }
  ];

  // Auto slide rotation with progress bar
  useEffect(() => {
    setSlideProgress(0);
    const progressInterval = setInterval(() => {
      setSlideProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + (100 / (6000 / 50));
      });
    }, 50);

    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      setSlideProgress(0);
    }, 6000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(slideTimer);
    };
  }, [currentSlide, heroSlides.length]);

  const handleHeroCTA = (slide: typeof heroSlides[0]) => {
    if (slide.category) {
      setSelectedCategoryFilter(slide.category);
    } else {
      setSelectedCategoryFilter(null);
    }
    setCurrentPage(slide.linkPage);
  };

  const handleCategoryClick = (catId: string) => {
    setSelectedCategoryFilter(catId);
    setCurrentPage('shop');
  };

  const newArrivals = PRODUCTS.filter((p) => p.isNew).slice(0, 4);
  const bestSellers = PRODUCTS.filter((p) => p.isBestSeller).slice(0, 4);

  // Material Lineage Data
  const materials = {
    cashmere: {
      title: 'Grade-A Mongolian Cashmere',
      micron: '15.5 Microns',
      weight: '480 gsm Double-Faced',
      origin: 'Steppes of Outer Mongolia & Florence Finishing',
      description: 'Comb-harvested exclusively in early spring when cashmere fleece is at its supreme softness. Spun into ultra-dense yarns with an airy loft that retains heat without weight.',
      image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=1200&q=85',
      tag: 'Mongolian Fleece',
      linkCategory: 'women',
    },
    silk: {
      title: 'Como Mulberry Silk',
      micron: 'Grade 6A Raw Filament',
      weight: '22-Momme Heavyweight Charmeuse',
      origin: 'Lake Como, Northern Italy',
      description: 'Woven on heritage water-jet looms in century-old Como mills. Features an opalescent liquid drape and a buttery hand that breathes effortlessly against bare skin.',
      image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1200&q=85',
      tag: 'Como Heritage',
      linkCategory: 'women',
    },
    leather: {
      title: 'Full-Grain Tuscan Vachetta',
      micron: 'Vegetable-Tanned Barrel Dye',
      weight: '1.8mm Supple Calfskin',
      origin: 'Santa Croce sull’Arno, Tuscany',
      description: 'Steeped in chestnut and mimosa tannins for over 40 days. The hide breathes naturally and burnishes over time, developing a deep, golden amber patina unique to its bearer.',
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85',
      tag: 'Tuscan Tannery',
      linkCategory: 'accessories',
    },
    horology: {
      title: 'Swiss-Calibre Horology',
      micron: '28,800 Vibrations / Hour',
      weight: 'Sapphire Crystal & 316L Marine Steel',
      origin: 'Le Locle, Switzerland',
      description: 'Crafted with 26 synthetic ruby bearings, Côtes de Genève rotor finishing, and a 42-hour power reserve. Built for patrons who honor time as the ultimate luxury.',
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=85',
      tag: 'Le Locle Movement',
      linkCategory: 'watches',
    },
  };

  const currentMaterial = materials[activeMaterial];

  return (
    <div className="space-y-24 sm:space-y-32 pb-20">
      {/* 1. EDITORIAL LUXURY HERO SLIDER */}
      <section className="relative h-[84vh] sm:h-[86vh] lg:h-[88vh] min-h-[560px] sm:min-h-[600px] md:min-h-[640px] lg:min-h-[700px] max-h-[920px] w-full overflow-hidden bg-[#2B1D17]">
        {heroSlides.map((slide, idx) => {
          const isActive = currentSlide === idx;
          const prefix = slide.title.replace(slide.italicWord, '').trimEnd();
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Background Image with warm luxury tonal grade & cinematic Ken Burns zoom */}
              <div className="absolute inset-0 overflow-hidden bg-[#2B1D17]">
                <img
                  src={slide.image}
                  alt={slide.title}
                  loading="eager"
                  decoding="async"
                  fetchPriority={idx === 0 ? 'high' : 'auto'}
                  onLoad={() => setImagesLoaded((prev) => ({ ...prev, [slide.id]: true }))}
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover object-center transition-opacity duration-700 ease-in-out ${
                    isActive ? 'animate-hero-zoom opacity-100' : 'scale-100 opacity-90'
                  } ${imagesLoaded[slide.id] ? 'opacity-100' : 'opacity-95'}`}
                />
                {/* Espresso & Mocha Duotone luxury gradients */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#2B1D17]/90 via-[#2B1D17]/60 to-[#2B1D17]/20" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2B1D17] via-transparent to-[#2B1D17]/40" />
              </div>

              {/* Editorial Content Frame */}
              <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center pt-4 sm:pt-8 md:pt-12 pb-24 sm:pb-28 md:pb-24 lg:pb-20">
                <div className="max-w-2xl space-y-3.5 sm:space-y-5 md:space-y-6">
                  {/* Floating Salon Tag */}
                  <div className="inline-flex items-center gap-2 sm:gap-2.5 bg-[#FAF6F0]/10 backdrop-blur-md border border-[#E7D6C1]/30 px-3 sm:px-3.5 py-1.5 shadow-xs max-w-full">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#C48A5A] animate-pulse shrink-0" />
                    <span className="font-sans text-[10px] sm:text-[11px] tracking-[0.18em] sm:tracking-[0.2em] text-[#E7D6C1] uppercase font-semibold whitespace-nowrap">
                      {slide.subtitle}
                    </span>
                    <span className="text-[#E7D6C1]/40 text-xs hidden xs:inline select-none">•</span>
                    <span className="font-sans text-[10px] sm:text-[11px] text-[#C48A5A] font-medium tracking-[0.1em] hidden xs:inline whitespace-nowrap">
                      {slide.badge}
                    </span>
                  </div>

                  {/* Main Modern Luxury Headline */}
                  <h1 className="font-heading text-4xl xs:text-5xl sm:text-6xl md:text-6xl lg:text-[68px] xl:text-[76px] text-[#FAF6F0] tracking-[0.03em] leading-[0.96] max-w-2xl break-words">
                    {prefix}{' '}
                    <span className="text-[#E5A97A]">
                      {slide.italicWord}
                    </span>
                  </h1>

                  {/* Narrative Body */}
                  <p className="font-sans text-xs xs:text-sm sm:text-base text-[#FAF6F0]/90 font-normal leading-relaxed sm:leading-[1.7] tracking-[0.01em] max-w-xl">
                    {slide.description}
                  </p>

                  {/* Dual Action Buttons */}
                  <div className="flex flex-row flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 pt-1.5 sm:pt-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleHeroCTA(slide)}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2.5 sm:gap-3 bg-[#C48A5A] hover:bg-[#FAF6F0] text-[#2B1D17] font-sans text-[11px] sm:text-xs font-bold tracking-[0.16em] sm:tracking-[0.18em] uppercase py-3.5 sm:py-4 px-5 sm:px-8 transition-all duration-300 shadow-xl group cursor-pointer text-center whitespace-nowrap"
                    >
                      <span>{slide.cta}</span>
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2B1D17] group-hover:translate-x-1.5 transition-transform shrink-0" />
                    </button>

                    <button
                      onClick={() => {
                        setSelectedCategoryFilter(null);
                        setCurrentPage('shop');
                      }}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 border border-[#FAF6F0]/40 hover:border-[#FAF6F0] bg-[#2B1D17]/40 backdrop-blur-xs text-[#FAF6F0] font-sans text-[11px] sm:text-xs font-semibold tracking-[0.16em] sm:tracking-[0.18em] uppercase py-3.5 sm:py-4 px-4 sm:px-7 transition-all duration-300 hover:bg-[#FAF6F0] hover:text-[#2B1D17] cursor-pointer text-center whitespace-nowrap"
                    >
                      <span>{slide.secondaryCta}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Editorial Bottom Navigation & Progress Indicator - Displays ONLY the Current Active Slide */}
        <div className="absolute bottom-3 sm:bottom-6 left-0 right-0 z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pointer-events-none">
          <div className="border-t border-[#FAF6F0]/25 pt-2.5 sm:pt-4 flex flex-row items-center justify-between gap-3 sm:gap-6 pointer-events-auto w-full">
            {/* Mobile: Single Active Slide Display */}
            <div className="flex md:hidden items-center gap-2 sm:gap-3 flex-1 min-w-0 pr-2">
              <div className="flex items-center gap-2 shrink-0">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#E5A97A] shrink-0 animate-pulse" />
                <span
                  key={heroSlides[currentSlide].id}
                  className="font-sans text-xs sm:text-sm tracking-[0.1em] sm:tracking-[0.14em] uppercase font-bold text-[#FAF6F0] whitespace-nowrap drop-shadow-sm transition-all duration-300"
                >
                  {heroSlides[currentSlide].tabLabel}
                </span>
              </div>

              {/* Live Slide Progress Bar for the Active Slide on Mobile */}
              <div className="flex-1 max-w-[80px] sm:max-w-[120px] min-w-[28px] h-0.5 bg-[#FAF6F0]/25 rounded-full relative overflow-hidden shrink ml-1 sm:ml-2">
                <div
                  className="absolute inset-y-0 left-0 bg-[#E5A97A] transition-all duration-100 ease-linear rounded-full"
                  style={{ width: `${slideProgress}%` }}
                />
              </div>
            </div>

            {/* Large Screen: All Slide Tabs Displayed - Fully visible without text cut-off */}
            <div className="hidden md:flex flex-1 min-w-0 items-center justify-start gap-3 md:gap-4 lg:gap-6 xl:gap-8 py-1 pr-2">
              {heroSlides.map((slide, idx) => {
                const isActive = currentSlide === idx;
                return (
                  <button
                    key={slide.id}
                    onClick={() => {
                      setCurrentSlide(idx);
                      setSlideProgress(0);
                    }}
                    className={`text-left group cursor-pointer transition-all flex items-center gap-2 shrink-0 py-1 focus:outline-none ${
                      isActive ? 'opacity-100' : 'opacity-50 hover:opacity-85'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full transition-colors shrink-0 ${
                        isActive ? 'bg-[#E5A97A]' : 'bg-[#FAF6F0]/40'
                      }`}
                    />
                    <span className="font-sans text-[11px] lg:text-xs tracking-[0.08em] lg:tracking-[0.12em] uppercase font-bold text-[#FAF6F0] whitespace-nowrap">
                      {slide.tabLabel}
                    </span>
                    {isActive && (
                      <div className="w-8 md:w-9 lg:w-12 h-0.5 bg-[#FAF6F0]/30 rounded-full relative overflow-hidden shrink-0">
                        <div
                          className="absolute inset-y-0 left-0 bg-[#E5A97A] transition-all duration-100 ease-linear rounded-full"
                          style={{ width: `${slideProgress}%` }}
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Prev / Next Arrows */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 pl-2">
              <button
                onClick={() => {
                  setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
                  setSlideProgress(0);
                }}
                aria-label="Previous Slide"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[#FAF6F0]/40 text-[#FAF6F0] hover:bg-[#FAF6F0] hover:text-[#2B1D17] flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
                  setSlideProgress(0);
                }}
                aria-label="Next Slide"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[#FAF6F0]/40 text-[#FAF6F0] hover:bg-[#FAF6F0] hover:text-[#2B1D17] flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE CURATED COLLECTIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
        {/* Section Header matching New Arrivals style */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4 border-b border-[#E7D6C1] pb-5">
          <div>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-[#2B1D17] tracking-[0.03em] leading-none">
              Explore Our <span className="text-[#C48A5A]">Collections</span>
            </h2>
          </div>
          <button
            id="collections-view-all-btn"
            onClick={() => {
              setSelectedCategoryFilter(null);
              setCurrentPage('shop');
            }}
            className="text-xs uppercase tracking-[0.2em] text-[#2B1D17] hover:text-[#C48A5A] flex items-center gap-2 font-semibold group cursor-pointer"
          >
            <span>View All Collections</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>

        {/* Clean Modern Premium Collection Cards (Equal Height Grid) */}
        {(() => {
          const featuredProducts = {
            women: PRODUCTS.find((p) => p.category === 'women'),
            men: PRODUCTS.find((p) => p.category === 'men'),
            watches: PRODUCTS.find((p) => p.category === 'watches'),
            shoes: PRODUCTS.find((p) => p.category === 'shoes'),
            accessories: PRODUCTS.find((p) => p.category === 'accessories'),
          };

          const collectionCards = [
            {
              id: 'women' as const,
              styles: '6 Styles',
              title: "Women's Collection",
              description: 'Cashmere coats and pure silk slips.',
              image: getOptimizedImageUrl('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85', 600, 85),
              crop: 'object-[center_20%]',
            },
            {
              id: 'men' as const,
              styles: '6 Styles',
              title: "Men's Tailoring",
              description: 'Tailored blazers and wool overcoats.',
              image: getOptimizedImageUrl('https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=85', 600, 85),
              crop: 'object-[center_20%]',
            },
            {
              id: 'watches' as const,
              styles: '5 Styles',
              title: 'Fine Watches',
              description: 'Swiss movements and sapphire crystals.',
              image: getOptimizedImageUrl('https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=85', 600, 85),
              crop: 'object-center',
            },
            {
              id: 'shoes' as const,
              styles: '5 Styles',
              title: 'Leather Shoes',
              description: 'Blake-stitched calfskin loafers and boots.',
              image: getOptimizedImageUrl('https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=900&q=85', 600, 85),
              crop: 'object-center',
            },
            {
              id: 'accessories' as const,
              styles: '5 Styles',
              title: 'Bags & Accessories',
              description: 'Full-grain Tuscan leather and silk scarves.',
              image: getOptimizedImageUrl('https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=85', 600, 85),
              crop: 'object-center',
            },
          ];

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 sm:gap-6 lg:gap-4 xl:gap-5 items-stretch">
              {collectionCards.map((col) => {
                const representativeProduct = featuredProducts[col.id];
                const isWishlisted = representativeProduct ? isInWishlist(representativeProduct.id) : false;

                return (
                  <div
                    key={col.id}
                    id={`collection-card-${col.id}`}
                    role="button"
                    tabIndex={0}
                    aria-label={`Explore ${col.title}`}
                    onClick={() => handleCategoryClick(col.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCategoryClick(col.id);
                      }
                    }}
                    className="group bg-white rounded-2xl border border-[#E7D6C1]/80 hover:border-[#C48A5A]/70 shadow-[0_2px_12px_rgba(43,29,23,0.04)] hover:shadow-[0_12px_28px_rgba(43,29,23,0.08)] transition-all duration-400 overflow-hidden flex flex-col h-full cursor-pointer"
                  >
                    {/* Top Section: Large Edge-to-Edge Image with No Heavy Overlays */}
                    <div className="relative w-full aspect-[4/3] sm:aspect-[4/3] overflow-hidden bg-[#FAF6F0]">
                      <img
                        src={col.image}
                        alt={col.title}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className={`w-full h-full object-cover ${col.crop} group-hover:scale-105 transition-transform duration-700 ease-out`}
                      />

                      {/* Wishlist Heart Icon Button (Refined Floating Circular Badge) */}
                      <button
                        type="button"
                        id={`wishlist-collection-${col.id}`}
                        aria-label={isWishlisted ? `Remove ${col.title} from wishlist` : `Add ${col.title} to wishlist`}
                        title={isWishlisted ? "Saved in your wishlist" : "Save to wishlist"}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (representativeProduct) {
                            toggleWishlist(representativeProduct);
                          }
                        }}
                        className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm hover:scale-110 active:scale-95 cursor-pointer ${
                          isWishlisted
                            ? 'bg-white text-[#C48A5A] border border-[#C48A5A] shadow-[0_2px_8px_rgba(196,138,90,0.25)]'
                            : 'bg-white/90 hover:bg-white text-[#2B1D17] hover:text-[#C48A5A] backdrop-blur-xs border border-[#E7D6C1]/90'
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 transition-transform duration-300 ease-out ${
                            isWishlisted ? 'fill-[#C48A5A] text-[#C48A5A]' : 'text-current stroke-[1.8]'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Bottom Section: Balanced Padding, Light Weight Typography & Minimal Outline Button */}
                    <div className="p-5 sm:p-5 lg:p-4 xl:p-5 flex flex-col flex-1 justify-between bg-white">
                      <div>
                        {/* Upper Style Count Kicker */}
                        <div className="text-[10px] sm:text-[10.5px] font-medium uppercase tracking-[0.2em] text-[#C48A5A] mb-1.5">
                          {col.styles}
                        </div>

                        {/* Title with Lighter Weight */}
                        <h3 className="font-heading text-lg sm:text-xl lg:text-lg xl:text-[21px] font-normal text-[#2B1D17] tracking-[0.01em] mb-2 leading-tight group-hover:text-[#C48A5A] transition-colors duration-300">
                          {col.title}
                        </h3>

                        {/* Short Concise Description with no truncation */}
                        <p className="font-sans text-xs sm:text-[12px] lg:text-[11px] xl:text-xs text-[#6B4A3A] font-light leading-relaxed mb-5 sm:mb-6">
                          {col.description}
                        </p>
                      </div>

                      {/* Minimal Outline Button Inspired by Reference */}
                      <button
                        type="button"
                        id={`browse-collection-${col.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCategoryClick(col.id);
                        }}
                        className="w-full py-2.5 px-4 rounded-full border border-[#2B1D17]/30 group-hover:border-[#2B1D17] hover:bg-[#2B1D17] hover:text-[#FAF6F0] text-[#2B1D17] text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300 text-center cursor-pointer bg-white mt-auto shadow-2xs"
                      >
                        Browse
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </section>
      {/* 3. NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4 border-b border-[#E7D6C1] pb-5">
          <div>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-[#2B1D17] tracking-[0.03em] leading-none">
              New <span className="text-[#C48A5A]">Arrivals</span>
            </h2>
          </div>
          <button
            onClick={() => setCurrentPage('new_arrivals')}
            className="text-xs uppercase tracking-[0.2em] text-[#2B1D17] hover:text-[#C48A5A] flex items-center gap-2 font-semibold group cursor-pointer"
          >
            <span>View All New Pieces</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {newArrivals.map((product, idx) => (
            <ProductCard key={product.id} product={product} priority={idx < 4} />
          ))}
        </div>
      </section>

      {/* 5. PROMOTIONAL EDITORIAL CAMPAIGN SPREAD: "THE SEASON'S EDIT" */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-[#2B1D17] text-[#FAF6F0] overflow-hidden border border-[#6B4A3A] shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
            {/* Left Narrative Spread */}
            <div className="lg:col-span-7 p-6 sm:p-10 lg:p-16 flex flex-col justify-center space-y-6 z-10">
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl tracking-[0.03em] text-[#FAF6F0] leading-none">
                Seasonal <span className="text-[#C48A5A]">Edit</span>
              </h2>

              <p className="text-base sm:text-lg text-[#E7D6C1] border-l-2 border-[#C48A5A] pl-4 font-normal leading-relaxed">
                &ldquo;True luxury does not clamor for attention, it commands it through proportion, weight, and touch.&rdquo;
              </p>

              <p className="text-xs sm:text-sm text-[#E7D6C1]/90 leading-relaxed font-normal max-w-lg">
                Discover refined essentials engineered for modern wardrobes. From double-faced virgin wool coats to bias-cut mulberry silk shirting, each garment represents an enduring dialogue between architectural structure and effortless ease.
              </p>

              {/* Material Spec Pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-[10px] uppercase tracking-wider bg-[#FAF6F0]/10 border border-[#E7D6C1]/30 text-[#FAF6F0] px-3 py-1 font-semibold">
                  Grade-A Mongolian Fleece
                </span>
                <span className="text-[10px] uppercase tracking-wider bg-[#FAF6F0]/10 border border-[#E7D6C1]/30 text-[#FAF6F0] px-3 py-1 font-semibold">
                  22-Momme Como Silk
                </span>
                <span className="text-[10px] uppercase tracking-wider bg-[#FAF6F0]/10 border border-[#E7D6C1]/30 text-[#FAF6F0] px-3 py-1 font-semibold">
                  Tuscan Calfskin
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pt-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setSelectedCategoryFilter(null);
                    setCurrentPage('shop');
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center bg-[#C48A5A] hover:bg-[#FAF6F0] text-[#2B1D17] text-xs font-bold tracking-[0.18em] uppercase py-3.5 sm:py-4 px-7 sm:px-8 transition-colors cursor-pointer shadow-lg text-center whitespace-nowrap"
                >
                  Explore The Edit
                </button>
                <button
                  onClick={() => setCurrentPage('sale')}
                  className="w-full sm:w-auto inline-flex items-center justify-center border border-[#E7D6C1]/60 text-[#FAF6F0] hover:bg-[#FAF6F0] hover:text-[#2B1D17] text-xs font-semibold tracking-[0.18em] uppercase py-3.5 sm:py-4 px-6 sm:px-7 transition-colors cursor-pointer text-center whitespace-nowrap"
                >
                  Privilege Archive
                </button>
              </div>
            </div>

            {/* Right Photography Spread with Floating Badge and smooth luxury zoom */}
            <div className="lg:col-span-5 relative min-h-[300px] sm:min-h-[360px] lg:min-h-full overflow-hidden group">
              <img
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85"
                alt="The Season's Edit"
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-1000 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#2B1D17] via-transparent to-transparent lg:block hidden" />
              
              {/* Floating Atelier Seal */}
              <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 bg-[#180E09]/92 backdrop-blur-md border border-[#E5A97A]/80 p-3 sm:p-4 text-center max-w-[180px] shadow-2xl">
                <span className="text-[9.5px] uppercase tracking-[0.25em] text-[#F5C79E] font-bold block mb-1">
                  Private Salon
                </span>
                <p className="text-[11px] text-white font-sans font-medium leading-tight">
                  Hand-finished in micro-batches under 150 pieces
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE CRAFTSMANSHIP & MATERIAL ARCHIVE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-[#E2D4C3] p-8 sm:p-12 space-y-8 shadow-[0_4px_24px_rgba(43,29,23,0.06)]">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-[#1F140E] tracking-[0.03em] leading-none">
              Craft & <span className="text-[#A66838]">Materials</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#523B2F] font-light">
              We forge our garments from unblended natural fibers harvested with mindful respect for land, artisan, and patron.
            </p>
          </div>

          {/* Interactive Material Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 border-b border-[#EFE5D8] pb-4">
            {(
              [
                { key: 'cashmere', label: 'Mongolian Cashmere' },
                { key: 'silk', label: 'Como Mulberry Silk' },
                { key: 'leather', label: 'Tuscan Vachetta' },
                { key: 'horology', label: 'Swiss Mechanical' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveMaterial(tab.key)}
                className={`text-xs uppercase tracking-[0.18em] py-2 px-4 transition-all duration-300 font-medium cursor-pointer ${
                  activeMaterial === tab.key
                    ? 'bg-[#1F140E] text-[#FAF6F0] shadow-sm'
                    : 'bg-[#FAF6F0] text-[#523B2F] hover:text-[#1F140E] border border-[#E2D4C3]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Active Material Showcase Spread */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2">
                <Award className="w-4 h-4 text-[#A66838]" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#523B2F] font-semibold">
                  Origin: {currentMaterial.origin}
                </span>
              </div>

              <h3 className="font-heading text-2xl sm:text-3xl text-[#1F140E] tracking-[0.03em] leading-none">
                {currentMaterial.title}
              </h3>

              <p className="text-xs sm:text-sm text-[#523B2F] leading-relaxed font-light">
                {currentMaterial.description}
              </p>

              {/* Technical Specifications Matrix */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-[#FAF6F0] border border-[#E2D4C3]">
                  <span className="text-[10px] uppercase tracking-wider text-[#523B2F] font-semibold block">
                    Finest Specification
                  </span>
                  <span className="font-sans text-sm font-bold text-[#1F140E]">
                    {currentMaterial.micron}
                  </span>
                </div>
                <div className="p-4 bg-[#FAF6F0] border border-[#E2D4C3]">
                  <span className="text-[10px] uppercase tracking-wider text-[#523B2F] font-semibold block">
                    Weight & Structure
                  </span>
                  <span className="font-sans text-sm font-bold text-[#1F140E]">
                    {currentMaterial.weight}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setSelectedCategoryFilter(currentMaterial.linkCategory);
                    setCurrentPage('shop');
                  }}
                  className="text-xs uppercase tracking-[0.2em] text-[#1F140E] hover:text-[#A66838] font-semibold inline-flex items-center gap-2 underline decoration-[#A66838] cursor-pointer"
                >
                  <span>Explore Garments In This Fiber</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] overflow-hidden border border-[#E2D4C3] shadow-md group">
              <img
                src={currentMaterial.image}
                alt={currentMaterial.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />
              <div className="absolute top-3 right-3 bg-[#1F140E]/85 backdrop-blur-xs text-[#FAF6F0] text-[9.5px] uppercase tracking-[0.2em] px-2.5 py-1 border border-[#A66838]/60">
                {currentMaterial.tag}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BEST SELLERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4 border-b border-[#E7D6C1] pb-5">
          <div>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-[#2B1D17] tracking-[0.03em] leading-none">
              Best <span className="text-[#C48A5A]">Sellers</span>
            </h2>
          </div>
          <button
            onClick={() => setCurrentPage('shop')}
            className="text-xs uppercase tracking-[0.2em] text-[#2B1D17] hover:text-[#C48A5A] flex items-center gap-2 font-semibold group cursor-pointer"
          >
            <span>View Entire Collection</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestSellers.map((product, idx) => (
            <ProductCard key={product.id} product={product} priority={idx < 4} />
          ))}
        </div>
      </section>

      {/* 7. DISCERNING PATRONS & VERIFIED REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-[#1F140E] tracking-[0.03em] leading-none">
            Client <span className="text-[#A66838]">Reviews</span>
          </h2>
          <p className="text-xs text-[#523B2F]">
            Verified experiences from patrons across Lahore, Karachi, Islamabad, and international salons.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {INITIAL_REVIEWS.slice(0, 3).map((review) => (
            <div
              key={review.id}
              className="bg-white border border-[#E2D4C3] p-7 flex flex-col justify-between shadow-[0_2px_14px_rgba(43,29,23,0.04)] hover:shadow-[0_12px_32px_rgba(43,29,23,0.08)] hover:border-[#B87A45] transition-all duration-300"
            >
              <div>
                <div className="flex items-center gap-1 text-[#C48A5A] mb-3.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#C48A5A] text-[#C48A5A]" />
                  ))}
                </div>
                <h4 className="font-sans text-base sm:text-lg font-normal text-[#1F140E] mb-2 leading-snug">
                  &ldquo;{review.title}&rdquo;
                </h4>
                <p className="text-xs text-[#523B2F] leading-relaxed font-light">
                  {review.comment}
                </p>
              </div>

              <div className="pt-4 mt-6 border-t border-[#EFE5D8] flex items-center justify-between">
                <div>
                  <h5 className="font-semibold text-xs text-[#1F140E]">{review.author}</h5>
                  <p className="text-[10.5px] text-[#7A6253] mt-0.5">{review.city}</p>
                </div>
                {review.verified && (
                  <span className="text-[9.5px] uppercase tracking-wider bg-[#FAF6F0] text-[#1F140E] px-2.5 py-1 font-semibold border border-[#D5C2AF]">
                    Verified Patron
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <button
            onClick={() => setCurrentPage('reviews')}
            className="text-xs uppercase tracking-[0.2em] text-[#2B1D17] hover:text-[#C48A5A] font-semibold underline decoration-[#C48A5A] cursor-pointer"
          >
            Read All Patron Reviews ({INITIAL_REVIEWS.length}+ Testimonials)
          </button>
        </div>
      </section>

      {/* 8. THE ATELIER DIARY / LOOKBOOK GALLERY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 space-y-1">
          <h2 className="font-heading text-3xl sm:text-4xl text-[#2B1D17] tracking-[0.03em] leading-none">
            Client <span className="text-[#C48A5A]">Lookbook</span>
          </h2>
          <p className="text-xs text-[#6B4A3A]">
            Tag your styling moments to be featured in the private atelier lookbook.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {[
            { img: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=700&q=85', tag: 'Aurelia Silk Slip' },
            { img: 'https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=700&q=85', tag: 'Milano Wool Trench' },
            { img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=85', tag: 'Nocturne Horology' },
            { img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=700&q=85', tag: 'Venezia Tote Bag' },
          ].map((item, index) => (
            <div
              key={index}
              onClick={() => setCurrentPage('shop')}
              className="relative aspect-square overflow-hidden group cursor-pointer border border-[#E7D6C1]/60"
            >
              <img
                src={item.img}
                alt={item.tag}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-[#2B1D17]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-3">
                <span className="text-[11px] text-[#FAF6F0] font-medium tracking-widest uppercase bg-[#2B1D17]/90 px-3.5 py-2 border border-[#C48A5A]">
                  {item.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
