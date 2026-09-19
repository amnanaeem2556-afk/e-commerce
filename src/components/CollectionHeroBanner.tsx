import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { CollectionHeroData } from '../data/collectionHeroes';

interface CollectionHeroBannerProps {
  hero: CollectionHeroData;
  onCtaClick?: () => void;
}

export const CollectionHeroBanner: React.FC<CollectionHeroBannerProps> = ({
  hero,
  onCtaClick,
}) => {
  const handleCta = () => {
    if (onCtaClick) {
      onCtaClick();
    } else {
      const el = document.getElementById('collection-catalog');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section
      id="collection-hero-banner"
      aria-label={`${hero.title} Hero Banner`}
      className="relative w-full overflow-hidden border-y border-[#E7D6C1]/80 bg-[#FAF6F0] mb-8 select-none"
    >
      <motion.div
        key={hero.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="group relative w-full min-h-[380px] sm:min-h-[420px] lg:min-h-[460px] xl:min-h-[490px] flex items-center"
      >
        {/* Full-bleed Panoramic Background Image (Razor Sharp 16:9, Uncropped Head & Subject with Luxury Zoom) */}
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#2B1D17]">
          <img
            src={hero.image}
            alt={hero.alt}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-[85%_top] sm:object-[80%_top] lg:object-[right_top] group-hover:scale-108 transition-transform duration-1000 ease-out"
          />

          {/* Targeted Left Gradient: provides absolute high-contrast protection for typography while keeping the subject crisp */}
          <div
            className="absolute inset-y-0 left-0 w-full sm:w-[70%] lg:w-[56%] bg-gradient-to-r from-[#FAF6F0] via-[#FAF6F0]/95 sm:via-[#FAF6F0]/90 to-transparent pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#FAF6F0] via-[#FAF6F0]/70 to-transparent sm:hidden pointer-events-none"
            aria-hidden="true"
          />
        </div>

        {/* Editorial Content positioned gracefully over the warm stone background on the left */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-10 sm:py-14">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: 'easeOut' }}
            className="max-w-md sm:max-w-lg lg:max-w-xl"
          >
            {/* Small Uppercase Collection Label */}
            <div className="mb-3.5 sm:mb-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#2B1D17] text-[#FAF6F0] text-[10.5px] sm:text-[11px] font-bold uppercase tracking-[0.24em] shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E5A97A]" />
                <span>{hero.label}</span>
              </span>
            </div>

            {/* Modern Premium Luxury Heading */}
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-[#1F140E] tracking-[0.03em] leading-none break-words">
              {(() => {
                const parts = hero.title.split(' ');
                if (parts.length > 1) {
                  const firstPart = parts.slice(0, -1).join(' ');
                  const lastWord = parts[parts.length - 1];
                  return (
                    <>
                      {firstPart} <span className="text-[#A66838]">{lastWord}</span>
                    </>
                  );
                }
                return hero.title;
              })()}
            </h1>

            {/* Premium Editorial Description */}
            <p className="font-sans text-xs sm:text-[13.5px] lg:text-sm text-[#382319] font-normal leading-relaxed max-w-md mt-3 sm:mt-4">
              {hero.description}
            </p>

            {/* Luxury Action Button */}
            <div className="mt-6 sm:mt-8">
              <button
                id={`cta-hero-${hero.id}`}
                onClick={handleCta}
                className="group inline-flex items-center gap-3 px-6 sm:px-7 py-3 sm:py-3.5 bg-[#2B1D17] hover:bg-[#805436] active:bg-[#1F140E] text-[#FAF6F0] text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.2em] transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
              >
                <span>{hero.cta}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};
