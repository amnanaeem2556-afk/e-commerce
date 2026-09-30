import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, ArrowUpRight, Star, Compass, Award, Feather, Heart, Check } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { PRODUCTS, CATEGORIES_META } from '../data/products';
import { INITIAL_REVIEWS } from '../data/reviews';
import { formatPKR } from '../data/constants';
import { ProductCard } from '../components/ProductCard';
import { getOptimizedImageUrl, getResponsiveSrcSet } from '../utils/imageOptimizer';

import heroEditorialPortrait from '../assets/images/hero_editorial_portrait_1789122773345.jpg';
import heroEditorialPortraitWebp from '../assets/images/hero_editorial_portrait_1789122773345.webp';
import heroEditorialPortraitMobileWebp from '../assets/images/hero_editorial_portrait_1789122773345_mobile.webp';

import heroFullbodyTailoring from '../assets/images/hero_fullbody_tailoring_1789122795297.jpg';
import heroFullbodyTailoringWebp from '../assets/images/hero_fullbody_tailoring_1789122795297.webp';
import heroFullbodyTailoringMobileWebp from '../assets/images/hero_fullbody_tailoring_1789122795297_mobile.webp';

import heroLifestyleScene from '../assets/images/hero_lifestyle_scene_1789122837997.jpg';
import heroLifestyleSceneWebp from '../assets/images/hero_lifestyle_scene_1789122837997.webp';
import heroLifestyleSceneMobileWebp from '../assets/images/hero_lifestyle_scene_1789122837997_mobile.webp';

import heroHorologyCloseup from '../assets/images/hero_horology_closeup_1789122819384.jpg';
import heroHorologyCloseupWebp from '../assets/images/hero_horology_closeup_1789122819384.webp';
import heroHorologyCloseupMobileWebp from '../assets/images/hero_horology_closeup_1789122819384_mobile.webp';

// Collection Cards Exact Editorial Images
import womenEditorialImg from '../assets/images/women_hero_editorial_1789200049432.jpg';
import menEditorialImg from '../assets/images/men_hero_editorial_1789200067222.jpg';
import watchEditorialImg from '../assets/images/hero_horology_closeup_1789122819384.jpg';
import shoesEditorialImg from '../assets/images/shoes_hero_editorial_1789200083177.jpg';
import bagsEditorialImg from '../assets/images/bags_hero_editorial_1789200097933.jpg';
import comoMulberrySilkImg from '../assets/images/como_mulberry_silk_1789829323225.jpg';
import seasonalEditRackImg from '../assets/images/seasonal_edit_rack_1789829548509.jpg';

// Preload strictly the above-the-fold hero image (Slide 0) for instant immediate display
if (typeof window !== 'undefined') {
  const isMobile = window.innerWidth < 768;
  const aboveTheFoldHero = new Image();
  aboveTheFoldHero.src = isMobile ? heroEditorialPortraitMobileWebp : heroEditorialPortraitWebp;
}

export const HomePage: React.FC = () => {
  const { setCurrentPage, setSelectedCategoryFilter, toggleWishlist, isInWishlist, viewProduct } = useShop();

  // Hero Slider State & Progress
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideProgress, setSlideProgress] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});
  const [activeMaterial, setActiveMaterial] = useState<'cashmere' | 'silk' | 'leather' | 'horology'>('silk');

  // Preload strictly the above-the-fold hero image (Slide 0) via DOM link element with high fetchpriority
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const heroSrc = isMobile ? heroEditorialPortraitMobileWebp : heroEditorialPortraitWebp;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.type = 'image/webp';
    link.href = heroSrc;
    link.imageSrcset = `${heroEditorialPortraitMobileWebp} 720w, ${heroEditorialPortraitWebp} 1376w`;
    link.imageSizes = '100vw';
    link.setAttribute('fetchpriority', 'high');
    document.head.appendChild(link);
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

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
      imageWebp: heroEditorialPortraitWebp,
      imageMobileWebp: heroEditorialPortraitMobileWebp,
      badge: 'Florence Atelier',
      tabLabel: 'Autumn Edit',
      focalPosition: 'object-center',
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
      imageWebp: heroFullbodyTailoringWebp,
      imageMobileWebp: heroFullbodyTailoringMobileWebp,
      badge: 'Italian Wool Melton',
      tabLabel: 'Men’s Sartorial',
      focalPosition: 'object-center',
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
      imageWebp: heroLifestyleSceneWebp,
      imageMobileWebp: heroLifestyleSceneMobileWebp,
      badge: 'Como Silk & Cashmere',
      tabLabel: 'Women’s Atelier',
      focalPosition: 'object-center',
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
      imageWebp: heroHorologyCloseupWebp,
      imageMobileWebp: heroHorologyCloseupMobileWebp,
      badge: 'Swiss Mechanical Automatic',
      tabLabel: 'Fine Horology',
      focalPosition: 'object-center',
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

  // Pre-fetch next slide right before transition so slides appear immediately when shown
  useEffect(() => {
    const nextIdx = (currentSlide + 1) % heroSlides.length;
    const nextSlide = heroSlides[nextIdx];
    const isMobile = window.innerWidth < 768;
    const prefetchImg = new Image();
    prefetchImg.src = isMobile ? nextSlide.imageMobileWebp : nextSlide.imageWebp;
  }, [currentSlide, heroSlides]);

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
      image: comoMulberrySilkImg,
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
    <div className="space-y-14 sm:space-y-20 lg:space-y-24 pb-16 sm:pb-20">
      {/* 1. EDITORIAL LUXURY HERO SLIDER */}
      <section className="relative h-[70vh] xs:h-[74vh] sm:h-[85vh] lg:h-[88vh] min-h-[430px] sm:min-h-[560px] md:min-h-[640px] lg:min-h-[700px] max-h-[920px] w-full overflow-hidden bg-[#2B1D17]">
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
                <picture className="w-full h-full">
                  <source
                    type="image/webp"
                    media="(max-width: 767px)"
                    srcSet={slide.imageMobileWebp}
                  />
                  <source
                    type="image/webp"
                    media="(min-width: 768px)"
                    srcSet={slide.imageWebp}
                  />
                  <img
                    src={slide.image}
                    alt={slide.title}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    decoding={idx === 0 ? 'sync' : 'async'}
                    fetchPriority={idx === 0 ? 'high' : 'low'}
                    onLoad={() => setImagesLoaded((prev) => ({ ...prev, [slide.id]: true }))}
                    referrerPolicy="no-referrer"
                    className={`w-full h-full object-cover ${slide.focalPosition} transition-opacity duration-700 ease-in-out ${
                      isActive ? 'animate-hero-zoom opacity-100' : 'scale-100 opacity-90'
                    } ${imagesLoaded[slide.id] ? 'opacity-100' : 'opacity-95'}`}
                  />
                </picture>
                {/* Luxury Editorial Scrim - Preserves rich photography while providing crisp text contrast */}
                {/* Desktop: gentle left-to-right espresso gradient */}
                <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-[#140C08]/92 via-[#140C08]/45 to-transparent/10 pointer-events-none" />
                {/* Mobile: bottom-to-top subtle gradient leaving top 55% model face/silhouette crystal clear */}
                <div className="sm:hidden absolute inset-0 bg-gradient-to-t from-[#140C08] via-[#140C08]/55 via-45% to-transparent pointer-events-none" />
                {/* Cinematic Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,transparent_60%,rgba(26,17,13,0.4)_100%)] pointer-events-none" />
              </div>

              {/* Editorial Content Frame */}
              <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end sm:justify-center pt-4 sm:pt-8 md:pt-12 pb-24 sm:pb-24 md:pb-24 lg:pb-20">
                <div className="max-w-2xl space-y-3.5 sm:space-y-4 md:space-y-5">
                  {/* Main Modern Luxury Headline */}
                  <h1 className="font-heading text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-[68px] xl:text-[76px] text-[#FAF6F0] tracking-[0.03em] leading-[1.05] sm:leading-[0.96] max-w-2xl break-words">
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
                  <div className="flex flex-row flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 pt-1 sm:pt-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleHeroCTA(slide)}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 sm:gap-2.5 bg-[#C48A5A] hover:bg-[#FAF6F0] text-[#2B1D17] font-sans text-[11px] sm:text-xs font-bold tracking-[0.16em] sm:tracking-[0.18em] uppercase py-3.5 sm:py-4 px-5 sm:px-8 transition-all duration-300 shadow-xl group cursor-pointer text-center whitespace-nowrap"
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header: Reverted back to original Explore Our Collections heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 lg:mb-10 gap-3 sm:gap-4 border-b border-[#E7D6C1] pb-4 sm:pb-5">
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

        {/* Clean Modern Premium Collection Cards (Exact Reference Design) */}
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
              styles: '6 STYLES',
              title: "Women’s Atelier",
              description: 'Cashmere coats & silk slips',
              image: womenEditorialImg,
              crop: 'object-[center_20%]',
            },
            {
              id: 'men' as const,
              styles: '6 STYLES',
              title: "Men’s Sartorial",
              description: 'Wool overcoats & blazers',
              image: menEditorialImg,
              crop: 'object-[center_18%]',
            },
            {
              id: 'watches' as const,
              styles: '5 STYLES',
              title: 'Fine Horology',
              description: 'Swiss automatic calibres',
              image: watchEditorialImg,
              crop: 'object-center',
            },
            {
              id: 'shoes' as const,
              styles: '5 STYLES',
              title: 'Artisanal Shoes',
              description: 'Blake-stitched calfskin',
              image: shoesEditorialImg,
              crop: 'object-center',
            },
            {
              id: 'accessories' as const,
              styles: '5 STYLES',
              title: 'Leather & Silk',
              description: 'Tuscan bags & silk scarves',
              image: bagsEditorialImg,
              crop: 'object-center',
            },
          ];

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 xl:gap-4.5 items-stretch">
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
                    className="group bg-[#FAF6F0] rounded-xl sm:rounded-2xl border border-[#EBDDCF] shadow-[0_2px_12px_rgba(43,29,23,0.04)] hover:shadow-[0_8px_24px_rgba(43,29,23,0.08)] hover:border-[#C48A5A]/60 transition-all duration-300 overflow-hidden flex flex-col h-full cursor-pointer"
                  >
                    {/* Top Image Section: Compact, Balanced Aspect Ratio */}
                    <div className="relative w-full aspect-[1.25/1] overflow-hidden bg-[#EFE8DF]">
                      <img
                        src={col.image}
                        alt={col.title}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className={`w-full h-full object-cover ${col.crop} group-hover:scale-104 transition-transform duration-700 ease-out`}
                      />

                      {/* Wishlist Heart Icon Button */}
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
                        className={`absolute top-2 sm:top-2.5 right-2 sm:right-2.5 z-10 w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full flex items-center justify-center transition-all duration-300 shadow-xs hover:scale-110 active:scale-95 cursor-pointer ${
                          isWishlisted
                            ? 'bg-white text-[#C48A5A] border border-[#C48A5A] shadow-[0_2px_8px_rgba(196,138,90,0.25)]'
                            : 'bg-white/95 hover:bg-white text-[#2B1D17] hover:text-[#C48A5A] border border-[#E7D6C1]/70'
                        }`}
                      >
                        <Heart
                          className={`w-3 sm:w-3.5 h-3 sm:h-3.5 transition-transform duration-300 ease-out ${
                            isWishlisted ? 'fill-[#C48A5A] text-[#C48A5A]' : 'text-[#2B1D17] stroke-[1.6]'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Bottom Content Area: Refined & Lightweight */}
                    <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between bg-[#FAF6F0]">
                      <div>
                        {/* Upper Style Count Kicker */}
                        <div className="text-[9px] sm:text-[9.5px] font-medium uppercase tracking-[0.18em] text-[#9E7A5A] mb-1">
                          {col.styles}
                        </div>

                        {/* Classical Serif Title */}
                        <h3 className="font-serif text-[15px] sm:text-[16px] lg:text-[16.5px] font-normal text-[#2B1D17] tracking-[0.015em] mb-1.5 leading-snug group-hover:text-[#9E7A5A] transition-colors duration-300 break-words">
                          {col.title}
                        </h3>

                        {/* Fully Written Elegant Description */}
                        <p className="font-sans text-[12px] sm:text-[12.5px] text-[#523B2F] font-normal leading-relaxed mb-3 break-words">
                          {col.description}
                        </p>
                      </div>

                      {/* Pill BROWSE Outline Button */}
                      <button
                        type="button"
                        id={`browse-collection-${col.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCategoryClick(col.id);
                        }}
                        className="w-full py-2 px-3 rounded-full border border-[#CBB49E] group-hover:border-[#2B1D17] hover:bg-[#2B1D17] hover:text-[#FAF6F0] text-[#2B1D17] text-[10px] uppercase tracking-[0.18em] font-medium transition-all duration-300 text-center cursor-pointer bg-[#FAF6F0] mt-auto shadow-2xs"
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

      {/* 3. NEW ARRIVALS (Exact Reference Match: Serif Title, Badges, Wishlist & Fully Responsive Cards) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header: Matching the standard heading style across the website */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 lg:mb-10 gap-3 sm:gap-4 border-b border-[#E7D6C1] pb-4 sm:pb-5">
          <div>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-[#2B1D17] tracking-[0.03em] leading-none">
              New <span className="text-[#C48A5A]">Arrivals</span>
            </h2>
          </div>
          <button
            id="new-arrivals-view-all-btn"
            onClick={() => setCurrentPage('new_arrivals')}
            className="text-xs uppercase tracking-[0.2em] text-[#2B1D17] hover:text-[#C48A5A] flex items-center gap-2 font-semibold group cursor-pointer"
          >
            <span>View All New Pieces</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>

        {/* 4 Premier New Arrival Cards matching exact image reference */}
        {(() => {
          const premierArrivals = [
            {
              id: 'lmr-w-01',
              product: PRODUCTS.find((p) => p.id === 'lmr-w-01'),
              kicker: 'QUIET LUXURY',
              rating: 4.9,
              title: 'Sienna Cashmere Coat',
              subtitle: 'Grade-A Mongolian cashmere',
              discount: '-14%',
              price: 68500,
              oldPrice: 79900,
              image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=85',
              crop: 'object-[center_20%]',
              colors: [
                { name: 'Espresso', hex: '#2B1D17' },
                { name: 'Mocha', hex: '#6B4A3A' },
                { name: 'Cream', hex: '#FAF6F0' },
              ],
            },
            {
              id: 'lmr-w-02',
              product: PRODUCTS.find((p) => p.id === 'lmr-w-02'),
              kicker: 'ATELIER RESERVE',
              rating: 4.8,
              title: 'Aurelia Silk Slip',
              subtitle: '22-momme pure Como silk',
              discount: '-12%',
              price: 38900,
              oldPrice: 44500,
              image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85',
              crop: 'object-[center_20%]',
              colors: [
                { name: 'Cream', hex: '#FAF6F0' },
                { name: 'Mocha', hex: '#6B4A3A' },
                { name: 'Espresso', hex: '#2B1D17' },
              ],
            },
            {
              id: 'lmr-m-01',
              product: PRODUCTS.find((p) => p.id === 'lmr-m-01'),
              kicker: 'QUIET LUXURY',
              rating: 4.9,
              title: 'Milano Wool Trench',
              subtitle: 'Virgin wool & cashmere melton',
              discount: '-15%',
              price: 74900,
              oldPrice: 88000,
              image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=85',
              crop: 'object-[center_18%]',
              colors: [
                { name: 'Navy', hex: '#1D263B' },
                { name: 'Slate', hex: '#7D8491' },
                { name: 'Caramel', hex: '#C48A5A' },
              ],
            },
            {
              id: 'lmr-wt-01',
              product: PRODUCTS.find((p) => p.id === 'lmr-wt-01'),
              kicker: 'ATELIER RESERVE',
              rating: 5.0,
              title: 'Nocturne Automatic 39mm',
              subtitle: '28,800 vph Swiss calibre',
              discount: '-11%',
              price: 114500,
              oldPrice: 128000,
              image: watchEditorialImg,
              crop: 'object-center',
              colors: [
                { name: 'Espresso', hex: '#2B1D17' },
                { name: 'Mocha', hex: '#6B4A3A' },
                { name: 'Caramel', hex: '#C48A5A' },
              ],
            },
          ];

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 xl:gap-5 items-stretch">
              {premierArrivals.map((item) => {
                const prod = item.product;
                const isWishlisted = prod ? isInWishlist(prod.id) : false;

                return (
                  <div
                    key={item.id}
                    id={`new-arrival-card-${item.id}`}
                    role="button"
                    tabIndex={0}
                    aria-label={`View ${item.title}`}
                    onClick={() => {
                      if (prod) viewProduct(prod);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (prod) viewProduct(prod);
                      }
                    }}
                    className="group bg-[#FAF6F0] rounded-xl sm:rounded-2xl border border-[#EBDDCF] shadow-[0_2px_12px_rgba(43,29,23,0.04)] hover:shadow-[0_8px_24px_rgba(43,29,23,0.08)] hover:border-[#C48A5A]/60 transition-all duration-300 overflow-hidden flex flex-col h-full cursor-pointer"
                  >
                    {/* Top Image Section: Compact & Balanced */}
                    <div className="relative w-full aspect-[1.25/1] overflow-hidden bg-[#EFE8DF]">
                      <img
                        src={getOptimizedImageUrl(item.image, 600, 80)}
                        srcSet={getResponsiveSrcSet(item.image, [360, 480, 600, 800])}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        alt={item.title}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className={`w-full h-full object-cover ${item.crop} group-hover:scale-104 transition-transform duration-700 ease-out`}
                      />

                      {/* Stacked Badges in Top Left */}
                      <div className="absolute top-2 sm:top-2.5 left-2 sm:left-2.5 z-10 flex flex-col items-start gap-0.5 pointer-events-none">
                        <span className="bg-[#9E6D42] text-white text-[8.5px] sm:text-[9px] font-semibold tracking-[0.14em] px-2 py-0.5 rounded-[2px] uppercase shadow-xs">
                          NEW SEASON
                        </span>
                        <span className="bg-white text-[#2B1D17] text-[9px] sm:text-[9.5px] font-bold tracking-[0.04em] px-1.5 py-0.5 rounded-[2px] shadow-xs">
                          {item.discount}
                        </span>
                      </div>

                      {/* Wishlist Heart Icon Button */}
                      <button
                        type="button"
                        id={`wishlist-new-arrival-${item.id}`}
                        aria-label={isWishlisted ? `Remove ${item.title} from wishlist` : `Add ${item.title} to wishlist`}
                        title={isWishlisted ? "Saved in your wishlist" : "Save to wishlist"}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (prod) {
                            toggleWishlist(prod);
                          }
                        }}
                        className={`absolute top-2 sm:top-2.5 right-2 sm:right-2.5 z-10 w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full flex items-center justify-center transition-all duration-300 shadow-xs hover:scale-110 active:scale-95 cursor-pointer ${
                          isWishlisted
                            ? 'bg-white text-[#C48A5A] border border-[#C48A5A] shadow-[0_2px_8px_rgba(196,138,90,0.25)]'
                            : 'bg-white/95 hover:bg-white text-[#2B1D17] hover:text-[#C48A5A] border border-[#E7D6C1]/70'
                        }`}
                      >
                        <Heart
                          className={`w-3 sm:w-3.5 h-3 sm:h-3.5 transition-transform duration-300 ease-out ${
                            isWishlisted ? 'fill-[#C48A5A] text-[#C48A5A]' : 'text-[#2B1D17] stroke-[1.6]'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Bottom Content Area: Refined & Compact */}
                    <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between bg-[#FAF6F0] min-w-0">
                      <div className="min-w-0">
                        {/* Kicker & Rating Row */}
                        <div className="flex items-center justify-between gap-1.5 mb-1.5 min-w-0">
                          <span className="font-sans text-[9px] sm:text-[9.5px] uppercase tracking-[0.16em] sm:tracking-[0.18em] text-[#A6805B] font-medium">
                            {item.kicker}
                          </span>
                          <div className="flex items-center gap-1 shrink-0 text-[10.5px] sm:text-[11px] text-[#A6805B] font-medium">
                            <Star className="w-3 h-3 fill-[#C48A5A] text-[#C48A5A]" />
                            <span className="text-[#2B1D17] font-semibold">{item.rating.toFixed(1)}</span>
                          </div>
                        </div>

                        {/* Classical Serif Title */}
                        <h3 className="font-serif text-[15px] sm:text-[16px] lg:text-[16.5px] font-normal text-[#221610] tracking-[0.015em] mb-1.5 leading-snug group-hover:text-[#9E7A5A] transition-colors duration-300 break-words">
                          {item.title}
                        </h3>

                        {/* Fully Written Subtitle & Description */}
                        <p className="font-sans text-[12px] sm:text-[12.5px] text-[#523B2F] font-normal leading-relaxed tracking-[0.01em] mb-2.5 break-words">
                          {item.subtitle}
                        </p>

                        {/* Color Swatches */}
                        <div className="flex items-center gap-1.5 mb-2">
                          {item.colors.map((c, idx) => (
                            <span
                              key={idx}
                              className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full border border-black/10 shadow-2xs inline-block"
                              style={{ backgroundColor: c.hex }}
                              title={c.name}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Price & Interactive Arrow Navigation */}
                      <div className="flex items-center justify-between pt-2 sm:pt-2.5 border-t border-[#EBDDCF]/70 mt-auto min-w-0">
                        <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
                          <span className="font-sans text-[13px] sm:text-[14.5px] font-semibold text-[#221610] tracking-normal whitespace-nowrap">
                            {formatPKR(item.price)}
                          </span>
                          {item.oldPrice && (
                            <span className="text-[10px] sm:text-[11.5px] text-[#9E8B7E] line-through whitespace-nowrap">
                              {formatPKR(item.oldPrice)}
                            </span>
                          )}
                        </div>

                        <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[#8C6D53] group-hover:text-[#221610] group-hover:translate-x-0.5 transition-all duration-300 shrink-0 ml-1">
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </section>

      {/* 5. PROMOTIONAL EDITORIAL CAMPAIGN SPREAD: "THE SEASON'S EDIT" */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF6F0] rounded-[22px] sm:rounded-[26px] border border-[#E7DACD] p-5 sm:p-8 lg:p-12 shadow-[0_4px_24px_rgba(43,29,23,0.04)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">
            {/* Left Narrative Spread */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                {/* Heading matching uploaded image: Bebas Neue single-line SEASONAL EDIT */}
                <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-[#1F140E] tracking-[0.03em] leading-none mb-5 sm:mb-6">
                  SEASONAL <span className="text-[#C48A5A]">EDIT</span>
                </h2>

                {/* Quote with left caramel border */}
                <div className="border-l-2 border-[#A07049] pl-4 sm:pl-5 mb-4 sm:mb-6">
                  <p className="font-serif text-[16px] sm:text-[18px] lg:text-[19px] text-[#1F140E] font-normal leading-relaxed">
                    &ldquo;True luxury does not clamor for attention, it commands it through proportion, weight, and touch.&rdquo;
                  </p>
                </div>

                {/* Description Narrative */}
                <p className="font-sans text-[13px] sm:text-[14px] text-[#523B2F] font-light leading-relaxed max-w-lg mb-5 sm:mb-8">
                  Discover refined essentials engineered for modern wardrobes. From double-faced virgin wool coats to bias-cut mulberry silk shirting, each garment represents an enduring dialogue between architectural structure and effortless ease.
                </p>

                {/* Material Spec Badges */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-6 sm:mb-8">
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.16em] bg-transparent border border-[#D5C2AF] text-[#523B2F] px-3 sm:px-4 py-1.5 sm:py-2 font-medium">
                    GRADE-A MONGOLIAN FLEECE
                  </span>
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.16em] bg-[#A07049] border border-[#A07049] text-white px-3 sm:px-4 py-1.5 sm:py-2 font-medium shadow-2xs">
                    22-MOMME COMO SILK
                  </span>
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.16em] bg-transparent border border-[#D5C2AF] text-[#523B2F] px-3 sm:px-4 py-1.5 sm:py-2 font-medium">
                    TUSCAN CALFSKIN
                  </span>
                </div>

                {/* Buttons Row */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <button
                    onClick={() => {
                      setSelectedCategoryFilter(null);
                      setCurrentPage('shop');
                    }}
                    className="inline-flex items-center justify-center gap-2 bg-[#A07049] hover:bg-[#8C5E3A] text-white text-[11px] sm:text-xs font-medium tracking-[0.18em] uppercase py-3.5 sm:py-4 px-6 sm:px-8 transition-colors cursor-pointer shadow-sm text-center whitespace-nowrap group"
                  >
                    <span>EXPLORE THE EDIT</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => setCurrentPage('sale')}
                    className="inline-flex items-center justify-center border border-[#D5C2AF] text-[#523B2F] hover:border-[#1F140E] hover:text-[#1F140E] text-[11px] sm:text-xs font-medium tracking-[0.18em] uppercase py-3.5 sm:py-4 px-6 sm:px-8 transition-colors cursor-pointer text-center whitespace-nowrap bg-transparent"
                  >
                    PRIVILEGE ARCHIVE
                  </button>
                </div>
              </div>

              {/* Bottom Kicker & Horizontal Rule */}
              <div className="flex items-center gap-3 sm:gap-4 pt-2">
                <span className="font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.18em] sm:tracking-[0.22em] text-[#9E6D42] font-semibold break-words sm:whitespace-nowrap">
                  CURATED FOR A MORE REFINED WARDROBE
                </span>
                <div className="flex-1 h-[1px] bg-[#E5D8CA] min-w-[20px]" />
              </div>
            </div>

            {/* Right Photography Column with Floating Badge - Fully responsive across all devices without cutting the clothes rack */}
            <div className="lg:col-span-5 relative w-full aspect-[4/3] sm:aspect-[4/3] md:aspect-[16/11] lg:aspect-auto lg:h-full lg:min-h-[460px] rounded-[18px] sm:rounded-[22px] overflow-hidden border border-[#E7DACD] bg-[#EAE2D7] shadow-xs group">
              <img
                src={seasonalEditRackImg}
                alt="Curated refined garments on wooden hangers"
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-700 ease-out"
              />

              {/* Floating Atelier Seal - Proportionally scaled so it leaves the clothes visible on mobile */}
              <div className="absolute bottom-2.5 right-2.5 sm:bottom-5 sm:right-5 bg-[#1F140E]/90 backdrop-blur-md border border-[#4A382C] px-3 py-2 sm:p-4 rounded-[6px] max-w-[150px] sm:max-w-[200px] shadow-lg pointer-events-none">
                <span className="text-[8.5px] sm:text-[9.5px] uppercase tracking-[0.2em] text-[#D5A070] font-semibold block mb-0.5 sm:mb-1">
                  PRIVATE SALON
                </span>
                <p className="text-[10px] sm:text-[11.5px] text-[#E7DACD] font-light leading-snug">
                  Hand-finished in micro-batches under 150 pieces
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE CRAFTSMANSHIP & MATERIAL ARCHIVE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading remains intact and unchanged as requested */}
        <div className="text-center max-w-xl mx-auto space-y-2 mb-8 sm:mb-10">
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-[#1F140E] tracking-[0.03em] leading-none">
            Craft & <span className="text-[#A66838]">Materials</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#523B2F] font-light">
            We forge our garments from unblended natural fibers harvested with mindful respect for land, artisan, and patron.
          </p>
        </div>

        {/* Interactive Material Selector Pills matching reference */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 mb-8 sm:mb-10">
          {(
            [
              { key: 'cashmere', label: 'MONGOLIAN CASHMERE' },
              { key: 'silk', label: 'COMO MULBERRY SILK' },
              { key: 'leather', label: 'TUSCAN VACHETTA' },
              { key: 'horology', label: 'SWISS MECHANICAL' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveMaterial(tab.key)}
              className={`text-[11px] sm:text-[12px] uppercase tracking-[0.16em] sm:tracking-[0.18em] py-2 sm:py-2.5 px-5 sm:px-6 rounded-full transition-all duration-300 font-medium cursor-pointer ${
                activeMaterial === tab.key
                  ? 'bg-[#A07049] text-white border border-[#A07049] shadow-xs'
                  : 'bg-transparent text-[#523B2F] hover:text-[#1F140E] border border-[#D5C2AF]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Full-width Divider Line */}
        <div className="w-full h-[1px] bg-[#E5D8CA] mb-8 sm:mb-10" />

        {/* Active Material Showcase Card with Rounded Corners & Soft Tone */}
        <div className="bg-[#FAF6F0] rounded-[22px] sm:rounded-[26px] border border-[#E7DACD] p-6 sm:p-8 lg:p-10 shadow-[0_4px_24px_rgba(43,29,23,0.04)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <span className="font-sans text-[11px] sm:text-[11.5px] uppercase tracking-[0.2em] sm:tracking-[0.22em] text-[#9E6D42] font-semibold mb-2 block">
                  ORIGIN: {currentMaterial.origin.toUpperCase()}
                </span>

                <h3 className="font-serif text-3xl sm:text-4xl lg:text-[44px] text-[#1F140E] font-normal leading-[1.1] mb-4 tracking-normal">
                  {currentMaterial.title}
                </h3>

                <p className="font-sans text-[14px] sm:text-[15px] text-[#3D2B22] font-normal leading-relaxed mb-6 sm:mb-8 max-w-xl">
                  {currentMaterial.description}
                </p>

                {/* Subtle Divider */}
                <div className="w-full h-[1px] bg-[#E7DACD] mb-6 sm:mb-8" />

                {/* Technical Specifications Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
                  <div>
                    <span className="block font-sans text-[10.5px] sm:text-[11px] uppercase tracking-[0.18em] text-[#9E6D42] font-semibold mb-1.5">
                      FINEST SPECIFICATION
                    </span>
                    <span className="font-serif text-[16px] sm:text-[18px] text-[#1F140E] font-normal block">
                      {currentMaterial.micron}
                    </span>
                  </div>
                  <div>
                    <span className="block font-sans text-[10.5px] sm:text-[11px] uppercase tracking-[0.18em] text-[#9E6D42] font-semibold mb-1.5">
                      WEIGHT & STRUCTURE
                    </span>
                    <span className="font-serif text-[16px] sm:text-[18px] text-[#1F140E] font-normal block">
                      {currentMaterial.weight}
                    </span>
                  </div>
                </div>
              </div>

              {/* Explore Link */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    setSelectedCategoryFilter(currentMaterial.linkCategory);
                    setCurrentPage('shop');
                  }}
                  className="font-sans text-[11px] sm:text-[12px] uppercase tracking-[0.2em] text-[#8C6445] hover:text-[#1F140E] font-semibold underline decoration-[#C48A5A] underline-offset-4 inline-flex items-center gap-2 cursor-pointer transition-colors group"
                >
                  <span>EXPLORE GARMENTS IN THIS FIBER</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* Right Photography Column */}
            <div className="lg:col-span-5 relative aspect-[4/3] sm:aspect-[16/11] lg:aspect-[1.15/1] rounded-[18px] sm:rounded-[22px] overflow-hidden border border-[#E7DACD] shadow-sm group">
              <img
                src={currentMaterial.image}
                alt={currentMaterial.title}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 6. BEST SELLERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 lg:mb-10 gap-3 sm:gap-4 border-b border-[#E7D6C1] pb-4 sm:pb-5">
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

        {/* 4 Premier Best Seller Cards matching exact image reference */}
        {(() => {
          const premierBestSellers = [
            {
              id: 'lmr-w-01',
              product: PRODUCTS.find((p) => p.id === 'lmr-w-01'),
              kicker: 'QUIET LUXURY',
              rating: 4.9,
              title: 'Sienna Cashmere Coat',
              subtitle: 'Grade-A Mongolian cashmere',
              discount: '-14%',
              price: 68500,
              oldPrice: 79900,
              image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1200&q=85',
              crop: 'object-[center_20%]',
              colors: [
                { name: 'Espresso', hex: '#3E2723' },
                { name: 'Mocha', hex: '#6B4A3A' },
                { name: 'Cream', hex: '#FAF6F0' },
              ],
            },
            {
              id: 'lmr-m-01',
              product: PRODUCTS.find((p) => p.id === 'lmr-m-01'),
              kicker: 'QUIET LUXURY',
              rating: 4.9,
              title: 'Milano Wool Trench',
              subtitle: 'Virgin wool & cashmere melton',
              discount: '-15%',
              price: 74900,
              oldPrice: 88000,
              image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=85',
              crop: 'object-[center_18%]',
              colors: [
                { name: 'Navy', hex: '#1D263B' },
                { name: 'Slate', hex: '#7D8491' },
                { name: 'Caramel', hex: '#C48A5A' },
              ],
            },
            {
              id: 'lmr-m-02',
              product: PRODUCTS.find((p) => p.id === 'lmr-m-02'),
              kicker: 'ESSENTIALS',
              rating: 4.7,
              title: 'Verona Suede Jacket',
              subtitle: 'Tuscan split suede',
              discount: '-15%',
              price: 59900,
              oldPrice: 69900,
              image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=1200&q=85',
              crop: 'object-[center_20%]',
              colors: [
                { name: 'Espresso', hex: '#3E2723' },
                { name: 'Caramel', hex: '#C48A5A' },
                { name: 'Black', hex: '#1A1A1A' },
              ],
            },
            {
              id: 'lmr-w-03',
              product: PRODUCTS.find((p) => p.id === 'lmr-w-03'),
              kicker: 'ESSENTIALS',
              rating: 4.8,
              title: 'Palermo Cashmere Knit',
              subtitle: '4-ply combed cashmere',
              discount: '-10%',
              price: 32500,
              oldPrice: 36000,
              image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=1200&q=85',
              crop: 'object-[center_28%]',
              colors: [
                { name: 'Cream', hex: '#FAF6F0' },
                { name: 'Tan', hex: '#D2B48C' },
                { name: 'Charcoal', hex: '#4A4A4A' },
                { name: 'Navy', hex: '#1A237E' },
              ],
            },
          ];

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 xl:gap-5 items-stretch">
              {premierBestSellers.map((item) => {
                const prod = item.product;
                const isWishlisted = prod ? isInWishlist(prod.id) : false;

                return (
                  <div
                    key={item.id}
                    id={`best-seller-card-${item.id}`}
                    role="button"
                    tabIndex={0}
                    aria-label={`View ${item.title}`}
                    onClick={() => {
                      if (prod) viewProduct(prod);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (prod) viewProduct(prod);
                      }
                    }}
                    className="group bg-[#FAF6F0] rounded-xl sm:rounded-2xl border border-[#EBDDCF] shadow-[0_2px_12px_rgba(43,29,23,0.04)] hover:shadow-[0_8px_24px_rgba(43,29,23,0.08)] hover:border-[#C48A5A]/60 transition-all duration-300 overflow-hidden flex flex-col h-full cursor-pointer"
                  >
                    {/* Top Image Section: Compact & Balanced */}
                    <div className="relative w-full aspect-[1.25/1] overflow-hidden bg-[#EFE8DF]">
                      <img
                        src={getOptimizedImageUrl(item.image, 600, 80)}
                        srcSet={getResponsiveSrcSet(item.image, [360, 480, 600, 800])}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        alt={item.title}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className={`w-full h-full object-cover ${item.crop} group-hover:scale-104 transition-transform duration-700 ease-out`}
                      />

                      {/* Stacked Badges in Top Left */}
                      <div className="absolute top-2 sm:top-2.5 left-2 sm:left-2.5 z-10 flex flex-col items-start gap-0.5 pointer-events-none">
                        <span className="bg-[#9E6D42] text-white text-[8.5px] sm:text-[9px] font-semibold tracking-[0.14em] px-2 py-0.5 rounded-[2px] uppercase shadow-xs">
                          NEW SEASON
                        </span>
                        <span className="bg-white text-[#2B1D17] text-[9px] sm:text-[9.5px] font-bold tracking-[0.04em] px-1.5 py-0.5 rounded-[2px] shadow-xs">
                          {item.discount}
                        </span>
                      </div>

                      {/* Wishlist Heart Icon Button */}
                      <button
                        type="button"
                        id={`wishlist-best-seller-${item.id}`}
                        aria-label={isWishlisted ? `Remove ${item.title} from wishlist` : `Add ${item.title} to wishlist`}
                        title={isWishlisted ? 'Saved in your wishlist' : 'Save to wishlist'}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (prod) {
                            toggleWishlist(prod);
                          }
                        }}
                        className={`absolute top-2 sm:top-2.5 right-2 sm:right-2.5 z-10 w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full flex items-center justify-center transition-all duration-300 shadow-xs hover:scale-110 active:scale-95 cursor-pointer ${
                          isWishlisted
                            ? 'bg-white text-[#C48A5A] border border-[#C48A5A] shadow-[0_2px_8px_rgba(196,138,90,0.25)]'
                            : 'bg-white/95 hover:bg-white text-[#2B1D17] hover:text-[#C48A5A] border border-[#E7D6C1]/70'
                        }`}
                      >
                        <Heart
                          className={`w-3 sm:w-3.5 h-3 sm:h-3.5 transition-transform duration-300 ease-out ${
                            isWishlisted ? 'fill-[#C48A5A] text-[#C48A5A]' : 'text-[#2B1D17] stroke-[1.6]'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Bottom Content Area: Refined & Compact */}
                    <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between bg-[#FAF6F0] min-w-0">
                      <div className="min-w-0">
                        {/* Kicker & Rating Row */}
                        <div className="flex items-center justify-between gap-1.5 mb-1.5 min-w-0">
                          <span className="font-sans text-[9px] sm:text-[9.5px] uppercase tracking-[0.16em] sm:tracking-[0.18em] text-[#A6805B] font-medium">
                            {item.kicker}
                          </span>
                          <div className="flex items-center gap-1 shrink-0 text-[10.5px] sm:text-[11px] text-[#A6805B] font-medium">
                            <Star className="w-3 h-3 fill-[#C48A5A] text-[#C48A5A]" />
                            <span className="text-[#2B1D17] font-semibold">{item.rating.toFixed(1)}</span>
                          </div>
                        </div>

                        {/* Classical Serif Title */}
                        <h3 className="font-serif text-[15px] sm:text-[16px] lg:text-[16.5px] font-normal text-[#221610] tracking-[0.015em] mb-1.5 leading-snug group-hover:text-[#9E7A5A] transition-colors duration-300 break-words">
                          {item.title}
                        </h3>

                        {/* Fully Written Subtitle & Description */}
                        <p className="font-sans text-[12px] sm:text-[12.5px] text-[#523B2F] font-normal leading-relaxed tracking-[0.01em] mb-2.5 break-words">
                          {item.subtitle}
                        </p>

                        {/* Color Swatches */}
                        <div className="flex items-center gap-1.5 mb-2">
                          {item.colors.map((c, idx) => (
                            <span
                              key={idx}
                              className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full border border-black/10 shadow-2xs inline-block"
                              style={{ backgroundColor: c.hex }}
                              title={c.name}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Price & Interactive Arrow Navigation */}
                      <div className="flex items-center justify-between pt-2 sm:pt-2.5 border-t border-[#EBDDCF]/70 mt-auto min-w-0">
                        <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
                          <span className="font-sans text-[13px] sm:text-[14.5px] font-semibold text-[#221610] tracking-normal whitespace-nowrap">
                            {formatPKR(item.price)}
                          </span>
                          {item.oldPrice && (
                            <span className="text-[10px] sm:text-[11.5px] text-[#9E8B7E] line-through whitespace-nowrap">
                              {formatPKR(item.oldPrice)}
                            </span>
                          )}
                        </div>

                        <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[#8C6D53] group-hover:text-[#221610] group-hover:translate-x-0.5 transition-all duration-300 shrink-0 ml-1">
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </section>

      {/* 7. VERIFIED REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10 lg:mb-12 space-y-2">
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-[#1F140E] tracking-[0.03em] leading-none">
            Client <span className="text-[#A66838]">Reviews</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#523B2F] leading-relaxed">
            Authentic experiences from clients across Lahore, Karachi, Islamabad, and international salons.
          </p>
        </div>

        {/* Client Reviews Cards Grid - Matching Image Reference */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 items-stretch">
          {INITIAL_REVIEWS.slice(0, 3).map((review) => {
            const avatarMap: Record<string, string> = {
              'rev-01': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
              'rev-02': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
              'rev-03': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
            };
            const avatarSrc = avatarMap[review.id] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

            return (
              <div
                key={review.id}
                className="bg-[#FAF6F0] rounded-[20px] sm:rounded-[22px] border border-[#EBDDCF] p-5 sm:p-6 lg:p-7 flex flex-col justify-between shadow-[0_4px_22px_rgba(43,29,23,0.04)] hover:shadow-[0_12px_32px_rgba(43,29,23,0.08)] hover:border-[#C48A5A]/50 transition-all duration-300 min-w-0"
              >
                <div>
                  {/* Top Row: Stars + Classical Quotation Mark */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1.5 text-[#C48A5A]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 sm:w-4 h-3.5 sm:h-4 fill-[#C48A5A] text-[#C48A5A]" />
                      ))}
                    </div>
                    <span className="font-serif text-3xl sm:text-4xl text-[#D8C7B5] leading-none select-none font-normal" aria-hidden="true">
                      &rdquo;
                    </span>
                  </div>

                  {/* Classical Serif Title */}
                  <h4 className="font-serif text-[19px] sm:text-[21px] lg:text-[22px] font-normal text-[#1F140E] mb-2.5 leading-snug tracking-normal">
                    &ldquo;{review.title}&rdquo;
                  </h4>

                  {/* Review Excerpt */}
                  <p className="font-sans text-[13.5px] sm:text-[14px] text-[#3D2B22] font-normal leading-relaxed mb-6 break-words">
                    {review.comment}
                  </p>
                </div>

                {/* Bottom Row with Client Avatar, Details, and Pill Badge */}
                <div className="pt-4 sm:pt-5 mt-auto border-t border-[#EBDDCF] flex items-center justify-between gap-2.5 sm:gap-3 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={avatarSrc}
                      alt={review.author}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                      className="w-10 sm:w-11 h-10 sm:h-11 rounded-full object-cover border border-[#E2D4C3] shrink-0 shadow-2xs"
                    />
                    <div className="min-w-0">
                      <h5 className="font-sans font-medium text-[13.5px] sm:text-[14px] text-[#1F140E] leading-tight">
                        {review.author}
                      </h5>
                      <p className="font-sans text-[11px] sm:text-[11.5px] text-[#8C7667] mt-1 leading-tight">
                        {review.city}
                      </p>
                    </div>
                  </div>

                  {review.verified && (
                    <span className="inline-flex items-center gap-1.5 text-[9.5px] sm:text-[10px] uppercase tracking-[0.14em] font-semibold text-[#9E6D42] border border-[#C8A98E] rounded-full px-3 py-1 bg-transparent shrink-0 whitespace-nowrap shadow-2xs">
                      <Check className="w-3 h-3 text-[#9E6D42] stroke-[2.2]" />
                      <span>VERIFIED</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Read All Reviews Bottom Link with Flanking Lines */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 mt-10 sm:mt-12">
          <div className="hidden sm:block flex-1 max-w-[120px] h-[1px] bg-[#E2D2BF]"></div>
          <button
            onClick={() => setCurrentPage('reviews')}
            className="text-xs uppercase tracking-[0.2em] text-[#9E6D42] hover:text-[#1F140E] font-semibold underline decoration-[#C48A5A] underline-offset-4 flex items-center gap-2 transition-colors cursor-pointer group"
          >
            <span>READ ALL CLIENT REVIEWS ({INITIAL_REVIEWS.length}+ TESTIMONIALS)</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
          </button>
          <div className="hidden sm:block flex-1 max-w-[120px] h-[1px] bg-[#E2D2BF]"></div>
        </div>
      </section>

      {/* 8. THE ATELIER DIARY / LOOKBOOK GALLERY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-8 lg:mb-10 space-y-1.5">
          <h2 className="font-heading text-3xl sm:text-4xl text-[#2B1D17] tracking-[0.03em] leading-none">
            Client <span className="text-[#C48A5A]">Lookbook</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#6B4A3A]">
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
