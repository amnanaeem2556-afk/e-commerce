import React from 'react';
import { Award, Compass, Shield, Sparkles, MapPin, Clock, Phone, ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const AboutPage: React.FC = () => {
  const { setCurrentPage } = useShop();

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Header */}
      <section className="relative h-[65vh] min-h-[460px] max-h-[620px] bg-[#2B1D17] text-[#FAF6F0] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1800&q=85"
            alt="Lumora Atelier"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="w-full h-full object-cover opacity-35 animate-hero-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2B1D17] via-transparent to-[#2B1D17]/70" />
        </div>

        <div className="relative z-10 text-center max-w-2xl mx-auto px-4 space-y-4">
          <span className="text-[10.5px] uppercase tracking-[0.3em] text-[#C48A5A] font-semibold">
            The Maison & Heritage
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl tracking-[0.03em] leading-none text-[#FAF6F0]">
            Quiet Luxury Architecture
          </h1>
          <p className="text-xs sm:text-sm text-[#E7D6C1]/85 font-light leading-relaxed max-w-xl mx-auto">
            Lumora was founded in Lahore to challenge the fleeting ephemerality of fast-fashion. We build timeless silhouettes engineered from natural fibers of peerless lineage.
          </p>
        </div>
      </section>

      {/* 1. Our Story & Manifesto */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#C48A5A] font-semibold">
              Origin & Lineage
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-[#2B1D17] tracking-[0.03em] leading-none">
              Modern Heirlooms
            </h2>
            <p className="text-xs sm:text-sm text-[#2B1D17]/80 font-light leading-relaxed">
              In a world crowded with loud logos and seasonal turnover, Lumora stands for restraint. We believe that true luxury does not shout; it is whispered through the clean angle of an unlined lapel, the tactile density of pure Mongolian cashmere, and the deliberate weight of Swiss-automatic watch handiwork.
            </p>
            <p className="text-xs sm:text-sm text-[#2B1D17]/80 font-light leading-relaxed">
              Every garment in our catalog is engineered to be worn for decades, softening gracefully with age. We manufacture in limited micro-batches of no more than 150 pieces per silhouette, preserving artisanal intimacy.
            </p>
          </div>

          <div className="aspect-[4/5] overflow-hidden border border-[#E7D6C1] relative group">
            <img
              src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=85"
              alt="Atelier Cutting Table"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
            />
          </div>
        </div>
      </section>

      {/* 2. Pillars of Craftsmanship & Raw Materials */}
      <section className="bg-[#FAF6F0] border-y border-[#E7D6C1] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#C48A5A] font-semibold">
              The Materials
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-[#2B1D17] mt-1 tracking-[0.03em] leading-none">
              Material Integrity
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
            <div className="bg-white/60 p-6 border border-[#E7D6C1] space-y-3">
              <span className="font-sans text-2xl font-bold text-[#C48A5A]">01</span>
              <h3 className="font-sans text-base sm:text-lg font-semibold text-[#2B1D17]">
                Grade-A Mongolian Cashmere
              </h3>
              <p className="text-[#6B4A3A] leading-relaxed">
                Comb-harvested from Inner Mongolian Capra hircus goats during the spring moult. We use fibers with a micron count below 15.5μm for featherlight thermal warmth without bulk.
              </p>
            </div>

            <div className="bg-white/60 p-6 border border-[#E7D6C1] space-y-3">
              <span className="font-sans text-2xl font-bold text-[#C48A5A]">02</span>
              <h3 className="font-sans text-base sm:text-lg font-semibold text-[#2B1D17]">
                Mulberry Silk from Lake Como
              </h3>
              <p className="text-[#6B4A3A] leading-relaxed">
                Woven in historic mills in Northern Italy with a heavyweight 22-momme density. It falls with liquid drape, breathing comfortably in Pakistan's varied seasonal climate.
              </p>
            </div>

            <div className="bg-white/60 p-6 border border-[#E7D6C1] space-y-3">
              <span className="font-sans text-2xl font-bold text-[#C48A5A]">03</span>
              <h3 className="font-sans text-base sm:text-lg font-semibold text-[#2B1D17]">
                Vegetable-Tanned Tuscan Calfskin
              </h3>
              <p className="text-[#6B4A3A] leading-relaxed">
                Cured with organic chestnut and mimosa tannins in Florence. Zero toxic heavy-metal chemicals, developing a rich caramel patina unique to its bearer over years of use.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Creative Directorate & Master Tailors */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#C48A5A] font-semibold">
            Human Hands
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-[#2B1D17] mt-1 tracking-[0.03em] leading-none">
            Creative Directorate
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            {
              name: 'Sarah Montgomery',
              role: 'Creative Director & Co-Founder',
              bio: 'Trained at Central Saint Martins, Sarah guides Lumora’s architectural lines and neutral tonal harmony.',
              img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=85',
            },
            {
              name: 'Hamza Khan',
              role: 'Head of Bespoke Tailoring',
              bio: 'With 22 years of Savile Row and Lahore atelier mastery, Hamza supervises every canvas cut and hand-sewn buttonhole.',
              img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=85',
            },
            {
              name: 'Elena Rossi',
              role: 'Director of Italian Material Sourcing',
              bio: 'Stationed in Biella and Tuscany, Elena inspects every batch of unblended virgin wool, leather hides, and horology cases.',
              img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=700&q=85',
            },
          ].map((member) => (
            <div key={member.name} className="group border border-[#E7D6C1] bg-[#FAF6F0] p-4 text-center space-y-3">
              <div className="aspect-square overflow-hidden bg-[#E7D6C1]/40 mb-3">
                <img
                  src={member.img}
                  alt={member.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
                />
              </div>
              <h4 className="font-sans text-base sm:text-lg font-semibold text-[#2B1D17]">{member.name}</h4>
              <p className="text-[11px] uppercase tracking-wider text-[#C48A5A] font-semibold">
                {member.role}
              </p>
              <p className="text-xs text-[#6B4A3A] font-light leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Flagship Salon (Galleria Mall, Lahore) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#2B1D17] text-[#FAF6F0] p-8 sm:p-14 border border-[#6B4A3A] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#C48A5A] font-semibold">
              The Flagship Salon
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-[#FAF6F0] tracking-[0.03em] leading-none">
              Galleria Mall Salon
            </h2>
            <p className="text-xs sm:text-sm text-[#E7D6C1]/85 font-light leading-relaxed">
              Step inside our private sanctuary of quiet luxury. Patrons may schedule bespoke fittings with master tailors, inspect full bolt fabrics, and relax in our private salon lounge with single-origin teas.
            </p>

            <div className="space-y-2 text-xs text-[#E7D6C1] pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C48A5A]" />
                <span>Suite 12-14, First Level, Galleria Mall, Main Boulevard, Gulberg III, Lahore</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C48A5A]" />
                <span>Monday – Sunday: 11:00 AM – 10:00 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C48A5A]" />
                <span>Private Salon Concierge: +92 (042) 3578-9000</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setCurrentPage('shop')}
                className="bg-[#C48A5A] hover:bg-[#FAF6F0] text-[#2B1D17] text-xs uppercase tracking-widest font-semibold py-3 px-6 transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Explore Salon Creations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 aspect-[4/3] overflow-hidden border border-[#6B4A3A] group">
            <img
              src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=85"
              alt="Galleria Mall Lahore Salon"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
