import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Star, Compass, Award, Feather } from 'lucide-react';
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
  const { setCurrentPage, setSelectedCategoryFilter } = useShop();

  // Hero Slider State & Progress
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideProgress, setSlideProgress] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({});
  const [activeMaterial, setActiveMaterial] = useState<'cashmere' | 'silk' | 'leather' | 'horology'>('cashmere');

  const heroSlides = [
    {
      id: 'slide-0',
      subtitle: 'AUTUMN SOLSTICE 2026',
      title: 'THE ARCHITECTURE OF SILHOUETTE',
      italicWord: 'Architecture',
      description: 'Sculpted double-faced Mongolian cashmere and Italian virgin wool melton. Designed to be remembered, engineered for decades.',
      cta: 'EXPLORE COLLECTION',
      secondaryCta: 'VIEW LOOKBOOK',
      linkPage: 'shop' as const,
      category: null,
      image: heroEditorialPortrait,
      badge: 'Campaign Vol. IV • Florence Atelier',
      tabLabel: 'Autumn Solstice',
    },
    {
      id: 'slide-1',
      subtitle: 'ATELIER PHILOSOPHY',
      title: 'QUIET LUXURY & RESTRAINT',
      italicWord: 'Restraint',
      description: 'True elegance needs no logos. Pure unblended fibers, hand-stitched pick lapels, and bespoke tailoring tailored in Northern Italy.',
      cta: 'THE MEN’S SARTORIAL',
      secondaryCta: 'OUR MANIFESTO',
      linkPage: 'men' as const,
      category: 'men',
      image: heroFullbodyTailoring,
      badge: 'Bespoke Italian Wool Melton',
      tabLabel: 'Quiet Luxury',
    },
    {
      id: 'slide-2',
      subtitle: 'HAUTE COUTURE',
      title: 'SENSUAL DRAPE & LIQUID SILK',
      italicWord: 'Sensual',
      description: 'Bias-cut 22-momme pure Como mulberry silk and cocoon cashmere coats tailored to caress natural contours with graceful ease.',
      cta: 'DISCOVER WOMEN',
      secondaryCta: 'SHOP COATS',
      linkPage: 'women' as const,
      category: 'women',
      image: heroLifestyleScene,
      badge: 'Como Silk & Grade-A Cashmere',
      tabLabel: 'Women’s Atelier',
    },
    {
      id: 'slide-3',
      subtitle: 'HAUTE HOROLOGY & LEATHER',
      title: 'PRECISION FOR GENERATIONS',
      italicWord: 'Precision',
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
      <section className="relative h-[86vh] min-h-[620px] max-h-[920px] w-full overflow-hidden bg-[#2B1D17]">
        {heroSlides.map((slide, idx) => {
          const isActive = currentSlide === idx;
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
              <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
                <div className="max-w-2xl space-y-5 sm:space-y-6">
                  {/* Floating Salon Tag */}
                  <div className="inline-flex items-center gap-2.5 bg-[#FAF6F0]/10 backdrop-blur-md border border-[#E7D6C1]/30 px-3.5 py-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-[#C48A5A] animate-pulse" />
                    <span className="text-[10px] sm:text-[11px] tracking-[0.25em] text-[#E7D6C1] uppercase font-semibold">
                      {slide.subtitle}
                    </span>
                    <span className="text-[#E7D6C1]/40 text-xs">•</span>
                    <span className="text-[10px] text-[#C48A5A] font-medium tracking-wider hidden sm:inline">
                      {slide.badge}
                    </span>
                  </div>

                  {/* Main Editorial Headline with brand accent color */}
                  <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#FAF6F0] font-normal tracking-wide leading-[1.12]">
                    {slide.title.replace(slide.italicWord, '')}
                    <span className="italic font-light text-[#C48A5A] font-serif">
                      {slide.italicWord}
                    </span>
                  </h1>

                  {/* Narrative Body */}
                  <p className="text-sm sm:text-base text-[#FAF6F0]/85 font-light leading-relaxed max-w-lg">
                    {slide.description}
                  </p>

                  {/* Dual Action Buttons */}
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <button
                      onClick={() => handleHeroCTA(slide)}
                      className="inline-flex items-center gap-3 bg-[#C48A5A] hover:bg-[#FAF6F0] text-[#2B1D17] text-xs font-semibold tracking-[0.2em] uppercase py-4 px-8 transition-all duration-300 shadow-xl group cursor-pointer"
                    >
                      <span>{slide.cta}</span>
                      <ArrowRight className="w-4 h-4 text-[#2B1D17] group-hover:translate-x-1.5 transition-transform" />
                    </button>

                    <button
                      onClick={() => {
                        setSelectedCategoryFilter(null);
                        setCurrentPage('shop');
                      }}
                      className="inline-flex items-center gap-2 border border-[#FAF6F0]/40 hover:border-[#FAF6F0] bg-[#2B1D17]/30 backdrop-blur-xs text-[#FAF6F0] text-xs font-medium tracking-[0.2em] uppercase py-4 px-7 transition-all duration-300 hover:bg-[#FAF6F0] hover:text-[#2B1D17] cursor-pointer"
                    >
                      <span>{slide.secondaryCta}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Editorial Bottom Navigation & Progress Indicator */}
        <div className="absolute bottom-6 left-0 right-0 z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-[#FAF6F0]/20 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Slide Pill Tabs without numbering */}
            <div className="flex items-center gap-2 sm:gap-6 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {heroSlides.map((slide, idx) => {
                const isActive = currentSlide === idx;
                return (
                  <button
                    key={slide.id}
                    onClick={() => {
                      setCurrentSlide(idx);
                      setSlideProgress(0);
                    }}
                    className={`text-left group cursor-pointer transition-all flex items-center gap-2 shrink-0 ${
                      isActive ? 'opacity-100' : 'opacity-40 hover:opacity-80'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full transition-colors ${isActive ? 'bg-[#C48A5A]' : 'bg-[#FAF6F0]/40'}`} />
                    <span className="text-[11px] uppercase tracking-wider text-[#FAF6F0] font-medium">
                      {slide.tabLabel}
                    </span>
                    {isActive && (
                      <div className="w-10 sm:w-16 h-0.5 bg-[#FAF6F0]/30 relative overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-[#C48A5A] transition-all"
                          style={{ width: `${slideProgress}%` }}
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Prev / Next Arrows */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                onClick={() => {
                  setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
                  setSlideProgress(0);
                }}
                aria-label="Previous Slide"
                className="w-9 h-9 rounded-full border border-[#FAF6F0]/40 text-[#FAF6F0] hover:bg-[#FAF6F0] hover:text-[#2B1D17] flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
                  setSlideProgress(0);
                }}
                aria-label="Next Slide"
                className="w-9 h-9 rounded-full border border-[#FAF6F0]/40 text-[#FAF6F0] hover:bg-[#FAF6F0] hover:text-[#2B1D17] flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE CURATED MAISONS (EDITORIAL ASYMMETRIC GRID) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 border-b border-[#E7D6C1] pb-5">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#2B1D17] font-normal">
              The Curated <span className="italic font-light text-[#C48A5A]">Maisons</span>
            </h2>
          </div>
          <button
            onClick={() => {
              setSelectedCategoryFilter(null);
              setCurrentPage('shop');
            }}
            className="text-xs uppercase tracking-[0.2em] text-[#2B1D17] hover:text-[#C48A5A] flex items-center gap-2 font-semibold group cursor-pointer"
          >
            <span>Explore Entire Archive</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>

        {/* Asymmetric Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6">
          {/* Main Large Maison: Women's Atelier */}
          <div
            onClick={() => handleCategoryClick('women')}
            className="md:col-span-6 lg:col-span-5 relative group overflow-hidden bg-[#2B1D17] border border-[#E7D6C1]/80 hover:border-[#C48A5A] transition-all duration-500 cursor-pointer min-h-[460px] flex flex-col justify-end p-8"
          >
            <img
              src={getOptimizedImageUrl('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85', 800, 82)}
              alt="The Women’s Atelier"
              loading="eager"
              decoding="async"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-1000 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2B1D17] via-[#2B1D17]/40 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

            <div className="relative z-10 space-y-2 text-[#FAF6F0]">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#C48A5A] font-semibold block">
                Maison Vol. I • Atelier Reserve
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-medium">The Women’s Atelier</h3>
              <p className="text-xs text-[#E7D6C1]/85 font-light leading-relaxed max-w-sm line-clamp-2">
                Double-faced cocoon cashmere outerwear, liquid Como silk slip dresses, and architectural tailoring.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs uppercase tracking-widest text-[#C48A5A] font-semibold group-hover:translate-x-1 transition-transform">
                <span>Explore Maison (24+ Pieces)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* 4 Companion Maisons: 2x2 Grid */}
          <div className="md:col-span-6 lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {[
              {
                id: 'men',
                title: 'The Sartorial Men',
                tag: 'Virgin Wool Melton',
                count: '18+ Items',
                image: getOptimizedImageUrl('https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=85', 600, 82),
              },
              {
                id: 'watches',
                title: 'High Horology',
                tag: 'Swiss Mechanical Calibres',
                count: '12+ Items',
                image: getOptimizedImageUrl('https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=85', 600, 82),
              },
              {
                id: 'shoes',
                title: 'Artisanal Footwear',
                tag: 'Blake-Stitched Calfskin',
                count: '16+ Items',
                image: getOptimizedImageUrl('https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=900&q=85', 600, 82),
              },
              {
                id: 'accessories',
                title: 'Leather & Silk Objets',
                tag: 'Tuscan Full-Grain Vachetta',
                count: '20+ Items',
                image: getOptimizedImageUrl('https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=85', 600, 82),
              },
            ].map((cat) => (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className="relative group overflow-hidden bg-[#2B1D17] border border-[#E7D6C1]/80 hover:border-[#C48A5A] transition-all duration-500 cursor-pointer aspect-[4/5] sm:aspect-auto sm:min-h-[220px] flex flex-col justify-end p-5"
              >
                <img
                  src={cat.image}
                  alt={cat.title}
                  loading="eager"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-1000 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2B1D17] via-[#2B1D17]/45 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                <div className="relative z-10 text-[#FAF6F0]">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-[#C48A5A] font-semibold block">
                    {cat.tag}
                  </span>
                  <h4 className="font-serif text-xl font-medium mt-0.5">{cat.title}</h4>
                  <span className="text-[10px] text-[#E7D6C1]/80 block mt-1">{cat.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4 border-b border-[#E7D6C1] pb-5">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#2B1D17] font-normal">
              The <span className="italic font-light text-[#C48A5A]">New</span> Arrivals
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
            <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 flex flex-col justify-center space-y-6 z-10">
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-wide text-[#FAF6F0] leading-[1.15]">
                THE SEASON’S <span className="italic font-light text-[#C48A5A]">EDIT</span>
              </h2>

              <p className="font-serif italic text-base sm:text-lg text-[#E7D6C1] border-l-2 border-[#C48A5A] pl-4">
                &ldquo;True luxury does not clamor for attention, it commands it through proportion, weight, and touch.&rdquo;
              </p>

              <p className="text-xs sm:text-sm text-[#E7D6C1]/85 leading-relaxed font-light max-w-lg">
                Discover refined essentials engineered for modern wardrobes. From double-faced virgin wool coats to bias-cut mulberry silk shirting, each garment represents an enduring dialogue between architectural structure and effortless ease.
              </p>

              {/* Material Spec Pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-[10px] uppercase tracking-wider bg-[#FAF6F0]/10 border border-[#E7D6C1]/30 text-[#FAF6F0] px-3 py-1 font-medium">
                  Grade-A Mongolian Fleece
                </span>
                <span className="text-[10px] uppercase tracking-wider bg-[#FAF6F0]/10 border border-[#E7D6C1]/30 text-[#FAF6F0] px-3 py-1 font-medium">
                  22-Momme Como Silk
                </span>
                <span className="text-[10px] uppercase tracking-wider bg-[#FAF6F0]/10 border border-[#E7D6C1]/30 text-[#FAF6F0] px-3 py-1 font-medium">
                  Tuscan Calfskin
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => {
                    setSelectedCategoryFilter(null);
                    setCurrentPage('shop');
                  }}
                  className="bg-[#C48A5A] hover:bg-[#FAF6F0] text-[#2B1D17] text-xs font-semibold tracking-[0.2em] uppercase py-4 px-8 transition-colors cursor-pointer shadow-lg"
                >
                  Explore The Edit
                </button>
                <button
                  onClick={() => setCurrentPage('sale')}
                  className="border border-[#E7D6C1]/60 text-[#FAF6F0] hover:bg-[#FAF6F0] hover:text-[#2B1D17] text-xs font-medium tracking-[0.2em] uppercase py-4 px-7 transition-colors cursor-pointer"
                >
                  Privilege Archive
                </button>
              </div>
            </div>

            {/* Right Photography Spread with Floating Badge and smooth luxury zoom */}
            <div className="lg:col-span-5 relative min-h-[360px] lg:min-h-full overflow-hidden group">
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
              <div className="absolute bottom-6 right-6 bg-[#2B1D17]/85 backdrop-blur-md border border-[#C48A5A] p-4 text-center max-w-[170px] shadow-xl">
                <span className="text-[9px] uppercase tracking-[0.25em] text-[#C48A5A] font-bold block mb-1">
                  Private Salon
                </span>
                <p className="text-[11px] text-[#FAF6F0] font-serif leading-tight">
                  Hand-finished in micro-batches under 150 pieces
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE CRAFTSMANSHIP & MATERIAL ARCHIVE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF6F0] border border-[#E7D6C1] p-8 sm:p-12 space-y-8 shadow-xs">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="font-serif text-3xl sm:text-4xl text-[#2B1D17] font-normal">
              The Material <span className="italic font-light text-[#C48A5A]">Lineage</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#6B4A3A] font-light">
              We forge our garments from unblended natural fibers harvested with mindful respect for land, artisan, and patron.
            </p>
          </div>

          {/* Interactive Material Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 border-b border-[#E7D6C1]/80 pb-4">
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
                    ? 'bg-[#2B1D17] text-[#FAF6F0] shadow-sm'
                    : 'bg-white/60 text-[#6B4A3A] hover:text-[#2B1D17] border border-[#E7D6C1]/60'
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
                <Award className="w-4 h-4 text-[#C48A5A]" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#6B4A3A] font-semibold">
                  Origin: {currentMaterial.origin}
                </span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl text-[#2B1D17] font-medium">
                {currentMaterial.title}
              </h3>

              <p className="text-xs sm:text-sm text-[#2B1D17]/80 leading-relaxed font-light">
                {currentMaterial.description}
              </p>

              {/* Technical Specifications Matrix */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 bg-white/70 border border-[#E7D6C1]">
                  <span className="text-[9.5px] uppercase tracking-wider text-[#6B4A3A] block">
                    Finest Specification
                  </span>
                  <span className="font-serif text-sm font-semibold text-[#2B1D17]">
                    {currentMaterial.micron}
                  </span>
                </div>
                <div className="p-3.5 bg-white/70 border border-[#E7D6C1]">
                  <span className="text-[9.5px] uppercase tracking-wider text-[#6B4A3A] block">
                    Weight & Structure
                  </span>
                  <span className="font-serif text-sm font-semibold text-[#2B1D17]">
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
                  className="text-xs uppercase tracking-[0.2em] text-[#2B1D17] hover:text-[#C48A5A] font-semibold inline-flex items-center gap-2 underline decoration-[#C48A5A] cursor-pointer"
                >
                  <span>Explore Garments In This Fiber</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] overflow-hidden border border-[#E7D6C1] group">
              <img
                src={currentMaterial.image}
                alt={currentMaterial.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              />
              <div className="absolute top-3 right-3 bg-[#2B1D17]/80 backdrop-blur-xs text-[#FAF6F0] text-[9.5px] uppercase tracking-[0.2em] px-2.5 py-1 border border-[#C48A5A]/50">
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
            <h2 className="font-serif text-3xl sm:text-4xl text-[#2B1D17] font-normal">
              The <span className="italic font-light text-[#C48A5A]">Iconic</span> Best Sellers
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
          <h2 className="font-serif text-3xl sm:text-4xl text-[#2B1D17] font-normal">
            Echoes from <span className="italic font-light text-[#C48A5A]">Discerning</span> Patrons
          </h2>
          <p className="text-xs text-[#6B4A3A]">
            Verified experiences from patrons across Lahore, Karachi, Islamabad, and international salons.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {INITIAL_REVIEWS.slice(0, 3).map((review) => (
            <div
              key={review.id}
              className="bg-[#FAF6F0] border border-[#E7D6C1] p-7 flex flex-col justify-between shadow-xs hover:border-[#C48A5A]/80 transition-all duration-300"
            >
              <div>
                <div className="flex items-center gap-1 text-[#C48A5A] mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#C48A5A] text-[#C48A5A]" />
                  ))}
                </div>
                <h4 className="font-serif text-lg font-semibold text-[#2B1D17] mb-2 leading-snug">
                  &ldquo;{review.title}&rdquo;
                </h4>
                <p className="text-xs text-[#6B4A3A] leading-relaxed font-light">
                  {review.comment}
                </p>
              </div>

              <div className="pt-4 mt-6 border-t border-[#E7D6C1]/60 flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-xs text-[#2B1D17]">{review.author}</h5>
                  <p className="text-[10px] text-[#6B4A3A]/80">{review.city}</p>
                </div>
                {review.verified && (
                  <span className="text-[9.5px] uppercase tracking-wider bg-[#E7D6C1]/50 text-[#2B1D17] px-2.5 py-1 font-semibold border border-[#E7D6C1]">
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
          <h2 className="font-serif text-2xl sm:text-3xl text-[#2B1D17] font-normal">
            As Worn By The <span className="italic font-light text-[#C48A5A]">Circle</span>
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
