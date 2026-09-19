import React, { useState } from 'react';
import { Trash2, ShoppingBag, ArrowRight, Gift, Tag, Check, AlertCircle, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { formatPKR } from '../data/constants';

export const CartPage: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    subtotal,
    discountAmount,
    shippingFee,
    total,
    freeShippingThreshold,
    setCurrentPage,
    viewProduct,
  } = useShop();

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [isGiftWrap, setIsGiftWrap] = useState(false);
  const [giftNote, setGiftNote] = useState('');

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');

    const res = applyPromoCode(promoInput);
    if (res.success) {
      setPromoSuccess(res.message);
      setPromoInput('');
    } else {
      setPromoError(res.message);
    }
  };

  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-[#E7D6C1]/30 flex items-center justify-center text-[#2B1D17]">
          <ShoppingBag className="w-9 h-9 text-[#6B4A3A]" />
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl text-[#2B1D17] tracking-[0.03em] leading-none">
          Shopping Bag Empty
        </h1>
        <p className="text-xs sm:text-sm text-[#6B4A3A] max-w-md mx-auto leading-relaxed">
          Your personal wardrobe curation awaits. Explore our latest sartorial releases or classic double-faced cashmere staples.
        </p>
        <div className="pt-4 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => setCurrentPage('new_arrivals')}
            className="bg-[#2B1D17] hover:bg-[#6B4A3A] text-[#FAF6F0] text-xs font-semibold tracking-widest uppercase py-3.5 px-7 transition-colors cursor-pointer"
          >
            Explore New Arrivals
          </button>
          <button
            onClick={() => setCurrentPage('shop')}
            className="border border-[#6B4A3A] text-[#2B1D17] hover:bg-[#2B1D17] hover:text-[#FAF6F0] text-xs font-semibold tracking-widest uppercase py-3.5 px-7 transition-colors cursor-pointer"
          >
            Browse Full Catalogue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="border-b border-[#E7D6C1] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#C48A5A] font-semibold">
            Atelier Order Draft
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl text-[#2B1D17] tracking-[0.03em] leading-none mt-1">
            Shopping Bag ({cart.reduce((a, c) => a + c.quantity, 0)})
          </h1>
        </div>

        <button
          onClick={() => setCurrentPage('shop')}
          className="text-xs text-[#6B4A3A] hover:text-[#2B1D17] flex items-center gap-1.5 font-medium cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Continue Exploring</span>
        </button>
      </div>

      {/* Free Shipping Progress Indicator */}
      <div className="bg-white border border-[#E2D4C3] p-5 shadow-[0_2px_14px_rgba(43,29,23,0.04)]">
        <div className="flex justify-between items-center text-xs mb-2.5">
          <span className="text-[#1F140E] font-medium">
            {amountNeededForFreeShipping === 0 ? (
              <span className="text-emerald-800 font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                You have qualified for Complimentary White-Glove Shipping!
              </span>
            ) : (
              <>
                Add <strong className="text-[#1F140E] font-semibold">{formatPKR(amountNeededForFreeShipping)}</strong> more to enjoy Free White-Glove Shipping
              </>
            )}
          </span>
          <span className="text-[#A66838] font-bold">{freeShippingProgress}%</span>
        </div>
        <div className="w-full h-2.5 bg-[#EFE5D8] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#C48A5A] rounded-full transition-all duration-500"
            style={{ width: `${freeShippingProgress}%` }}
          />
        </div>
      </div>

      {/* Cart Grid: Items on Left, Order Summary on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Cart Item List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="divide-y divide-[#EFE5D8] border-t border-b border-[#EFE5D8]">
            {cart.map((item) => (
              <div key={item.id} className="py-6 flex flex-col sm:flex-row gap-5 items-start">
                {/* Thumbnail */}
                <div
                  onClick={() => viewProduct(item.product)}
                  className="w-24 sm:w-28 aspect-[3/4] overflow-hidden bg-[#FAF6F0] shrink-0 cursor-pointer border border-[#E2D4C3] shadow-xs"
                >
                  <img
                    src={item.product?.images?.[0] || ''}
                    alt={item.product?.name || ''}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-[#A66838] font-semibold">
                        {item.product.collection}
                      </span>
                      <h3
                        onClick={() => viewProduct(item.product)}
                        className="font-sans text-base text-[#1F140E] hover:text-[#A66838] cursor-pointer font-semibold tracking-tight"
                      >
                        {item.product.name}
                      </h3>
                      <p className="text-xs text-[#523B2F]">{item.product.subtitle}</p>
                    </div>

                    <div className="text-right">
                      <span className="font-sans text-base font-bold text-[#1F140E]">
                        {formatPKR(item.product.price * item.quantity)}
                      </span>
                      {item.quantity > 1 && (
                        <p className="text-[10.5px] text-[#7A6253]">
                          {formatPKR(item.product.price)} each
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Attributes */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#523B2F] pt-1">
                    <span>Shade: <strong className="text-[#1F140E] font-medium">{item.selectedColor}</strong></span>
                    <span>&bull;</span>
                    <span>Size: <strong className="text-[#1F140E] uppercase font-medium">{item.selectedSize}</strong></span>
                  </div>

                  {/* Controls */}
                  <div className="flex justify-between items-center pt-3">
                    <div className="flex items-center border border-[#D5C2AF] bg-white">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1.5 text-xs text-[#1F140E] hover:bg-[#FAF6F0] cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="px-3.5 py-1.5 text-xs font-semibold text-[#1F140E]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1.5 text-xs text-[#1F140E] hover:bg-[#FAF6F0] cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-xs text-[#7A6253] hover:text-red-600 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Complimentary Gift Box Option */}
          <div className="bg-white border border-[#E2D4C3] p-5 sm:p-6 space-y-3.5 shadow-[0_2px_14px_rgba(43,29,23,0.04)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Gift className="w-4 h-4 text-[#A66838]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#1F140E]">
                  Complimentary Signature Gift Presentation
                </span>
              </div>
              <input
                type="checkbox"
                checked={isGiftWrap}
                onChange={(e) => setIsGiftWrap(e.target.checked)}
                className="accent-[#1F140E] w-4 h-4 cursor-pointer"
              />
            </div>
            <p className="text-xs text-[#523B2F]">
              Include an embossed Lumora gift box, hand-tied satin ribbon, and calligraphed personal card.
            </p>

            {isGiftWrap && (
              <div className="pt-2">
                <label className="text-[11px] font-semibold text-[#1F140E] block mb-1">
                  Personalized Inscription Note:
                </label>
                <textarea
                  rows={2}
                  value={giftNote}
                  onChange={(e) => setGiftNote(e.target.value)}
                  placeholder="Enter the words to be hand-written on the heavy cotton card..."
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#D5C2AF] text-xs text-[#1F140E] focus:bg-white focus:outline-none focus:border-[#1F140E]"
                />
              </div>
            )}
          </div>
        </div>

        {/* ORDER SUMMARY SIDEBAR */}
        <div className="lg:col-span-4 bg-white border border-[#E2D4C3] p-6 sm:p-7 space-y-6 sticky top-28 shadow-[0_4px_24px_rgba(43,29,23,0.06)]">
          <h2 className="font-heading text-2xl sm:text-3xl text-[#1F140E] pb-4 border-b border-[#EFE5D8] tracking-[0.03em] leading-none">
            Order Summary
          </h2>

          {/* Promo Code Input */}
          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-widest text-[#523B2F] font-semibold flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#A66838]" />
              <span>Privilege Voucher Code</span>
            </label>

            {appliedPromo ? (
              <div className="flex items-center justify-between bg-[#FAF6F0] border border-[#A66838] p-3 text-xs">
                <div>
                  <span className="font-semibold text-[#1F140E]">{appliedPromo.code}</span>
                  <span className="text-[#523B2F] ml-2">({appliedPromo.discountPercent}% Off applied)</span>
                </div>
                <button
                  onClick={removePromoCode}
                  className="text-xs text-red-600 hover:underline font-semibold cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => {
                    setPromoInput(e.target.value);
                    if (promoError) setPromoError('');
                  }}
                  placeholder="e.g. LUMORA10 / ELEGANCE20"
                  className="flex-1 p-2.5 bg-[#FAF6F0] border border-[#D5C2AF] text-xs text-[#1F140E] uppercase tracking-wider focus:bg-white focus:outline-none focus:border-[#1F140E]"
                />
                <button
                  type="submit"
                  className="bg-[#1F140E] text-[#FAF6F0] hover:bg-[#A66838] px-4 py-2.5 text-xs uppercase tracking-wider font-semibold transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </form>
            )}

            {promoSuccess && (
              <p className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                {promoSuccess}
              </p>
            )}
            {promoError && (
              <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {promoError}
              </p>
            )}

            <div className="pt-1 text-[11px] text-[#7A6253]">
              Privilege codes: <strong className="text-[#1F140E]">LUMORA10</strong> (10% off) or <strong className="text-[#1F140E]">ELEGANCE20</strong> (20% off)
            </div>
          </div>

          {/* Math Breakdown */}
          <div className="space-y-3.5 pt-4 border-t border-[#EFE5D8] text-xs">
            <div className="flex justify-between text-[#1F140E]">
              <span>Garment Subtotal</span>
              <span className="font-semibold">{formatPKR(subtotal)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-800 font-medium">
                <span>Voucher Privilege Savings</span>
                <span>-{formatPKR(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-[#1F140E]">
              <span>White-Glove Courier Dispatch</span>
              <span>{shippingFee === 0 ? <strong className="text-emerald-800 uppercase font-semibold">Complimentary</strong> : formatPKR(shippingFee)}</span>
            </div>

            <div className="flex justify-between text-[#7A6253] text-[11px]">
              <span>GST / Atelier Luxury Duties</span>
              <span>Included</span>
            </div>

            <div className="pt-4 border-t border-[#EFE5D8] flex justify-between items-baseline">
              <span className="font-sans text-base font-bold text-[#1F140E]">Estimated Total</span>
              <span className="font-sans text-2xl font-bold text-[#1F140E]">
                {formatPKR(total)}
              </span>
            </div>
          </div>

          {/* Checkout CTA */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() => setCurrentPage('checkout')}
              className="w-full bg-[#1F140E] hover:bg-[#A66838] text-[#FAF6F0] text-xs font-semibold tracking-[0.2em] uppercase py-4 px-6 flex items-center justify-center gap-2 transition-colors shadow-md cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 text-[#C48A5A]" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-[#7A6253] pt-1">
              <ShieldCheck className="w-4 h-4 text-[#A66838]" />
              <span>30-Day In-Home Trial Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
