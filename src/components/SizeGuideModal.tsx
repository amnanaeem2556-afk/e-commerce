import React, { useState } from 'react';
import { X, Ruler } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const SizeGuideModal: React.FC = () => {
  const { isSizeGuideOpen, setIsSizeGuideOpen } = useShop();
  const [activeTab, setActiveTab] = useState<'apparel' | 'shoes' | 'watches'>('apparel');
  const [unit, setUnit] = useState<'cm' | 'in'>('cm');

  if (!isSizeGuideOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-[#2B1D17]/70 backdrop-blur-xs transition-opacity"
        onClick={() => setIsSizeGuideOpen(false)}
      />

      <div className="relative bg-[#FAF6F0] w-full max-w-2xl border border-[#E7D6C1] shadow-2xl z-10 p-6 sm:p-8">
        <button
          onClick={() => setIsSizeGuideOpen(false)}
          className="absolute top-4 right-4 text-[#2B1D17] hover:text-[#C48A5A]"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <Ruler className="w-5 h-5 text-[#C48A5A]" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#C48A5A] font-semibold">
            Atelier Measurements
          </span>
        </div>
        <h3 className="font-heading text-2xl sm:text-3xl text-[#2B1D17] tracking-[0.03em] leading-none">Size Guide</h3>
        <p className="text-xs text-[#6B4A3A] mt-1 mb-6">
          Our garments are cut with intentional ease to honor timeless drape. Choose your regular luxury size.
        </p>

        {/* Tab Selection */}
        <div className="flex items-center justify-between border-b border-[#E7D6C1] pb-3 mb-6">
          <div className="flex gap-4">
            {[
              { id: 'apparel', label: 'Apparel & Outerwear' },
              { id: 'shoes', label: 'Footwear & Loafers' },
              { id: 'watches', label: 'Horology Case Diameters' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`text-xs pb-1 font-medium transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-b-2 border-[#2B1D17] text-[#2B1D17]'
                    : 'text-[#6B4A3A] hover:text-[#2B1D17]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab !== 'watches' && (
            <div className="flex items-center text-xs border border-[#E7D6C1] p-0.5">
              <button
                onClick={() => setUnit('cm')}
                className={`px-2 py-0.5 ${unit === 'cm' ? 'bg-[#2B1D17] text-[#FAF6F0]' : 'text-[#6B4A3A]'}`}
              >
                CM
              </button>
              <button
                onClick={() => setUnit('in')}
                className={`px-2 py-0.5 ${unit === 'in' ? 'bg-[#2B1D17] text-[#FAF6F0]' : 'text-[#6B4A3A]'}`}
              >
                IN
              </button>
            </div>
          )}
        </div>

        {/* Tables */}
        {activeTab === 'apparel' && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E7D6C1] text-[#6B4A3A] text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Size</th>
                  <th className="py-2.5 px-3">Bust / Chest</th>
                  <th className="py-2.5 px-3">Waist</th>
                  <th className="py-2.5 px-3">Hips</th>
                  <th className="py-2.5 px-3">Shoulder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7D6C1]/50 text-[#2B1D17]">
                {[
                  { size: 'XS (34)', bust: unit === 'cm' ? '82 - 86' : '32 - 34', waist: unit === 'cm' ? '64 - 68' : '25 - 27', hips: unit === 'cm' ? '90 - 94' : '35 - 37', sh: unit === 'cm' ? '40' : '15.7' },
                  { size: 'S (36)', bust: unit === 'cm' ? '86 - 90' : '34 - 35.5', waist: unit === 'cm' ? '68 - 72' : '27 - 28.5', hips: unit === 'cm' ? '94 - 98' : '37 - 38.5', sh: unit === 'cm' ? '41.5' : '16.3' },
                  { size: 'M (38)', bust: unit === 'cm' ? '90 - 96' : '35.5 - 38', waist: unit === 'cm' ? '72 - 78' : '28.5 - 30.5', hips: unit === 'cm' ? '98 - 104' : '38.5 - 41', sh: unit === 'cm' ? '43' : '17' },
                  { size: 'L (40)', bust: unit === 'cm' ? '96 - 102' : '38 - 40', waist: unit === 'cm' ? '78 - 84' : '30.5 - 33', hips: unit === 'cm' ? '104 - 110' : '41 - 43.5', sh: unit === 'cm' ? '44.5' : '17.5' },
                  { size: 'XL (42)', bust: unit === 'cm' ? '102 - 110' : '40 - 43', waist: unit === 'cm' ? '84 - 92' : '33 - 36', hips: unit === 'cm' ? '110 - 118' : '43.5 - 46.5', sh: unit === 'cm' ? '46' : '18.1' },
                ].map((row) => (
                  <tr key={row.size} className="hover:bg-[#E7D6C1]/20">
                    <td className="py-2.5 px-3 font-semibold">{row.size}</td>
                    <td className="py-2.5 px-3">{row.bust} {unit}</td>
                    <td className="py-2.5 px-3">{row.waist} {unit}</td>
                    <td className="py-2.5 px-3">{row.hips} {unit}</td>
                    <td className="py-2.5 px-3">{row.sh} {unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'shoes' && (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E7D6C1] text-[#6B4A3A] text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3">EU Size</th>
                  <th className="py-2.5 px-3">UK / PK</th>
                  <th className="py-2.5 px-3">US Men</th>
                  <th className="py-2.5 px-3">Foot Length</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7D6C1]/50 text-[#2B1D17]">
                {[
                  { eu: '39', uk: '5.5', us: '6.5', len: unit === 'cm' ? '24.8 cm' : '9.8 in' },
                  { eu: '40', uk: '6.5', us: '7.5', len: unit === 'cm' ? '25.4 cm' : '10.0 in' },
                  { eu: '41', uk: '7.0', us: '8.0', len: unit === 'cm' ? '26.0 cm' : '10.2 in' },
                  { eu: '42', uk: '8.0', us: '9.0', len: unit === 'cm' ? '26.7 cm' : '10.5 in' },
                  { eu: '43', uk: '9.0', us: '10.0', len: unit === 'cm' ? '27.3 cm' : '10.8 in' },
                  { eu: '44', uk: '9.5', us: '10.5', len: unit === 'cm' ? '27.9 cm' : '11.0 in' },
                  { eu: '45', uk: '10.5', us: '11.5', len: unit === 'cm' ? '28.6 cm' : '11.3 in' },
                ].map((row) => (
                  <tr key={row.eu} className="hover:bg-[#E7D6C1]/20">
                    <td className="py-2.5 px-3 font-semibold">EU {row.eu}</td>
                    <td className="py-2.5 px-3">{row.uk}</td>
                    <td className="py-2.5 px-3">{row.us}</td>
                    <td className="py-2.5 px-3">{row.len}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'watches' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border border-[#E7D6C1] bg-white/40">
                <h5 className="font-sans text-sm sm:text-base font-semibold text-[#2B1D17]">39mm Case (Classic Dress)</h5>
                <p className="text-[#6B4A3A] mt-1 leading-relaxed">
                  Ideal for wrist circumferences between 15.5cm to 18.5cm. Slides discreetly beneath French double cuffs.
                </p>
              </div>
              <div className="p-4 border border-[#E7D6C1] bg-white/40">
                <h5 className="font-sans text-sm sm:text-base font-semibold text-[#2B1D17]">41mm Case (Chronograph Presence)</h5>
                <p className="text-[#6B4A3A] mt-1 leading-relaxed">
                  Engineered for wrist circumferences from 17.0cm to 20.5cm. Delivers commanding yet elegant wrist presence.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-[#E7D6C1] flex items-center justify-between text-xs text-[#6B4A3A]">
          <span>Unsure of your fit? Our stylists offer bespoke guidance.</span>
          <button
            onClick={() => setIsSizeGuideOpen(false)}
            className="bg-[#2B1D17] text-[#FAF6F0] px-4 py-2 text-xs uppercase tracking-wider font-medium hover:bg-[#6B4A3A]"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
