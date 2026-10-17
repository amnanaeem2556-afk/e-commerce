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

  // Focal position tuned per category so the model/creations remain complete, uncropped, and centered on mobile
  const getFocalPosition = (id: string) => {
    switch (id) {
      case 'women':
        return 'object-[75%_30%] sm:object-[78%_center] md:object-[80%_center]';
      case 'men':
        return 'object-[72%_25%] sm:object-[75%_center] md:object-[78%_center]';
      case 'shoes':
        return 'object-[82%_70%] sm:object-[center_60%]';
      case 'bags':
        return 'object-[68%_55%] sm:object-[center_50%]';
      case 'accessories':
        return 'object-[50%_55%] sm:object-center';
      case 'watches':
        return 'object-[55%_50%] sm:object-center';
      case 'new_arrivals':
        return 'object-[70%_30%] sm:object-center';
      case 'sale':
        return 'object-[70%_30%] sm:object-[70%_center] md:object-[75%_center]';
      default:
        return 'object-[70%_35%] sm:object-center';
    }
  };

  return (
    <section
      id="collection-hero-banner"
      aria-label={`${hero.title} Hero Banner`}
      className="relative w-full overflow-hidden bg-[#140C08] border-b border-[#3A2419] mb-6 sm:mb-8 select-none"
    >
      <motion.div
        key={hero.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative min-h-[260px] xs:min-h-[285px] sm:min-h-[440px] md:min-h-[480px] lg:min-h-[520px] w-full flex flex-col justify-end sm:justify-center overflow-hidden"
      >
        {/* Background Canvas: 100% Crisp Image Composition with Luxury Scrim */}
        <div className="absolute inset-0 overflow-hidden bg-[#140C08]">
          <picture className="block w-full h-full">
            <source
              type="image/webp"
              media="(max-width: 767px)"
              srcSet={hero.imageMobileWebp}
            />
            <source
              type="image/webp"
              media="(min-width: 768px)"
              srcSet={hero.imageWebp}
            />
            <img
              src={hero.image}
              alt={hero.alt}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover ${getFocalPosition(hero.id)} transition-transform duration-1000 ease-out`}
            />
          </picture>

          {/* Desktop & Tablet Scrim: Left-to-right espresso veil keeping right 65% crystal clear */}
          <div
            className="hidden sm:block absolute inset-0 bg-gradient-to-r from-[#140C08]/95 via-[#140C08]/60 via-45% to-transparent pointer-events-none"
            aria-hidden="true"
          />

          {/* Mobile Scrim: Balanced bottom-to-top luxury espresso fade keeping image vivid while text remains legible */}
          <div
            className="sm:hidden absolute inset-0 bg-gradient-to-t from-[#140C08]/90 via-[#140C08]/40 via-55% to-transparent pointer-events-none"
            aria-hidden="true"
          />

          {/* Cinematic Vignette */}
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,transparent_60%,rgba(20,12,8,0.4)_100%)] pointer-events-none"
            aria-hidden="true"
          />
        </div>

        {/* Editorial Content Frame: Matches Home Page Typography, Spacing & Hierarchy Exactly */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 xs:py-5 sm:py-12 md:py-16 flex flex-col justify-end sm:justify-center">
          <div className="max-w-xl space-y-2 xs:space-y-2.5 sm:space-y-4 md:space-y-5">
            {/* Main Modern Luxury Headline: Matches Home Page Typography System Exactly */}
            <h1 className="font-heading text-xl xs:text-2xl sm:text-5xl md:text-6xl lg:text-[68px] xl:text-[76px] text-[#FAF6F0] tracking-[0.03em] leading-tight sm:leading-[0.96] max-w-2xl break-words drop-shadow-sm">
              {(() => {
                const parts = hero.title.split(' ');
                if (parts.length > 1) {
                  const firstPart = parts.slice(0, -1).join(' ');
                  const lastWord = parts[parts.length - 1];
                  return (
                    <>
                      <span>{firstPart}</span>{' '}
                      <span className="text-[#E5A97A]">{lastWord}</span>
                    </>
                  );
                }
                return hero.title;
              })()}
            </h1>

            {/* Editorial Description: Matches Home Page Narrative Body */}
            <p className="font-sans text-[11px] xs:text-xs sm:text-base text-[#FAF6F0]/90 font-normal leading-relaxed sm:leading-[1.7] tracking-[0.01em] max-w-xl drop-shadow-xs line-clamp-2 sm:line-clamp-none">
              {hero.description}
            </p>

            {/* Action CTA Button: Matches Home Page CTA Exactly */}
            <div className="pt-0.5 xs:pt-1 sm:pt-2">
              <button
                id={`cta-hero-${hero.id}`}
                onClick={handleCta}
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2.5 bg-[#FAF6F0] hover:bg-[#C48A5A] text-[#140C08] hover:text-[#FAF6F0] font-sans text-[10px] sm:text-xs font-bold tracking-[0.16em] uppercase py-2.5 px-5 sm:py-4 sm:px-8 transition-all duration-300 shadow-xl group cursor-pointer text-center"
              >
                <span>{hero.cta}</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#140C08] group-hover:text-[#FAF6F0] group-hover:translate-x-1.5 transition-transform shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
