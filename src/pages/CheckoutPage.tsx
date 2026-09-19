import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Truck,
  CheckCircle2,
  CreditCard,
  Building2,
  Smartphone,
  Banknote,
  ArrowRight,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { PAKISTAN_CITIES, formatPKR } from '../data/constants';
import { CheckoutFormData, Order } from '../types';

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    subtotal,
    discountAmount,
    shippingFee,
    total,
    appliedPromo,
    placeOrder,
    setCurrentPage,
  } = useShop();

  // Current Step: 1 = Shipping Info, 2 = Shipping Method, 3 = Payment & Review
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    apartment: '',
    city: 'Lahore',
    postalCode: '54000',
    saveAddress: true,
    shippingMethod: 'standard',
    paymentMethod: 'easypaisa',
    easypaisaPhone: '',
    jazzcashPhone: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate dynamic shipping based on chosen method
  const shippingMethodCosts: Record<string, number> = {
    standard: subtotal >= 15000 ? 0 : 850,
    express: 1800,
    sameday: 3500,
  };

  const currentShippingCost = shippingMethodCosts[formData.shippingMethod];
  const finalTotal = subtotal - discountAmount + currentShippingCost;

  // Validation
  const validateStep1 = () => {
    const errs: Record<string, string> = {};

    if (!formData.firstName.trim()) errs.firstName = 'First name is required.';
    else if (!/^[A-Za-z\s]+$/.test(formData.firstName)) errs.firstName = 'Letters only.';

    if (!formData.lastName.trim()) errs.lastName = 'Last name is required.';
    else if (!/^[A-Za-z\s]+$/.test(formData.lastName)) errs.lastName = 'Letters only.';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) errs.email = 'Email address is required.';
    else if (!emailRegex.test(formData.email)) errs.email = 'Please enter a valid email.';

    const pkPhoneRegex = /^(\+92|0)?3\d{9}$/;
    if (!formData.phone.trim()) errs.phone = 'Mobile number is required.';
    else if (!pkPhoneRegex.test(formData.phone.replace(/[\s-]/g, ''))) {
      errs.phone = 'Provide valid Pakistani mobile (e.g. 0300 1234567 or +923001234567).';
    }

    if (!formData.address.trim()) errs.address = 'Street delivery address is required.';
    if (!formData.city.trim()) errs.city = 'City selection is required.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = () => {
    const errs: Record<string, string> = {};

    if (formData.paymentMethod === 'easypaisa') {
      const epPhone = formData.easypaisaPhone || formData.phone;
      if (!epPhone.trim()) errs.easypaisaPhone = 'Easypaisa account mobile number is required.';
    } else if (formData.paymentMethod === 'jazzcash') {
      const jcPhone = formData.jazzcashPhone || formData.phone;
      if (!jcPhone.trim()) errs.jazzcashPhone = 'JazzCash registered mobile number is required.';
    } else if (formData.paymentMethod === 'card') {
      if (!formData.cardNumber.trim() || formData.cardNumber.replace(/\s/g, '').length < 15) {
        errs.cardNumber = 'Valid 16-digit card number required.';
      }
      if (!formData.cardExpiry.trim()) {
        errs.cardExpiry = 'MM/YY required.';
      }
      if (!formData.cardCvv.trim() || formData.cardCvv.length < 3) {
        errs.cardCvv = '3-digit CVV required.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (validateStep1()) setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateStep3()) return;

    setIsProcessing(true);

    try {
      const newOrder: Order = {
        id: `LUM-${Math.floor(100000 + Math.random() * 900000)}`,
        items: [...cart],
        subtotal,
        discount: discountAmount,
        shipping: currentShippingCost,
        total: finalTotal,
        customerName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        shippingAddress: `${formData.address}, ${formData.apartment ? formData.apartment + ', ' : ''}${formData.city}`,
        paymentMethod:
          formData.paymentMethod === 'easypaisa'
            ? 'Easypaisa Direct Mobile Wallet'
            : formData.paymentMethod === 'jazzcash'
            ? 'JazzCash Instant Wallet'
            : formData.paymentMethod === 'bank_transfer'
            ? '1Link Direct Bank Wire'
            : formData.paymentMethod === 'card'
            ? 'Credit/Debit Card (Visa/Mastercard)'
            : 'Cash on Doorstep Delivery (COD)',
        orderDate: new Date().toLocaleDateString('en-PK', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        status: 'confirmed',
        estimatedDelivery:
          formData.shippingMethod === 'sameday'
            ? 'Today before 9:00 PM'
            : formData.shippingMethod === 'express'
            ? 'Tomorrow by 2:00 PM'
            : '2-3 Business Days',
      };

      await placeOrder(newOrder);
      setCurrentPage('order_success');
    } catch (err) {
      console.error('Order creation error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="font-heading text-2xl sm:text-3xl text-[#2B1D17] tracking-[0.03em] leading-none">Empty Bag</h2>
        <p className="text-xs text-[#6B4A3A]">Please add bespoke pieces to your bag before checking out.</p>
        <button
          onClick={() => setCurrentPage('shop')}
          className="bg-[#2B1D17] text-[#FAF6F0] px-6 py-3 text-xs uppercase tracking-widest font-semibold cursor-pointer"
        >
          Return to Catalogue
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Checkout Progress Stepper */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="flex items-center justify-between text-xs font-semibold">
          {[
            { step: 1, label: '1. Shipping Atelier' },
            { step: 2, label: '2. Courier Method' },
            { step: 3, label: '3. Payment & Complete' },
          ].map((s) => (
            <div
              key={s.step}
              onClick={() => {
                if (s.step < currentStep) setCurrentStep(s.step as any);
              }}
              className={`flex items-center gap-2 cursor-pointer ${
                currentStep === s.step
                  ? 'text-[#2B1D17]'
                  : currentStep > s.step
                  ? 'text-[#C48A5A]'
                  : 'text-[#6B4A3A]/50'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  currentStep === s.step
                    ? 'bg-[#2B1D17] text-[#FAF6F0]'
                    : currentStep > s.step
                    ? 'bg-[#C48A5A] text-[#FAF6F0]'
                    : 'bg-[#E7D6C1] text-[#6B4A3A]'
                }`}
              >
                {currentStep > s.step ? '✓' : s.step}
              </span>
              <span className="hidden sm:inline uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>
        <div className="w-full bg-[#E7D6C1]/50 h-1 mt-4 relative">
          <div
            className="bg-[#2B1D17] h-full transition-all duration-300"
            style={{
              width: currentStep === 1 ? '33%' : currentStep === 2 ? '66%' : '100%',
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* LEFT COLUMN: FORM STEPS */}
        <div className="lg:col-span-7 space-y-8">
          {/* STEP 1: SHIPPING INFORMATION */}
          {currentStep === 1 && (
            <div className="bg-white border border-[#E2D4C3] p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgba(43,29,23,0.06)] animate-fadeIn">
              <div className="border-b border-[#EFE5D8] pb-4">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#A66838] font-semibold">
                  Step 1 of 3
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl text-[#1F140E] tracking-[0.03em] leading-none">
                  Shipping Address
                </h2>
                <p className="text-xs text-[#523B2F] mt-0.5">
                  Enter your domestic Pakistan residence or office address.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#1F140E] block mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => {
                      setFormData({ ...formData, firstName: e.target.value });
                      if (errors.firstName) setErrors({ ...errors, firstName: '' });
                    }}
                    placeholder="e.g. Zain"
                    className={`w-full p-2.5 bg-[#FAF6F0] border text-xs text-[#1F140E] focus:bg-white focus:outline-none focus:border-[#1F140E] ${
                      errors.firstName ? 'border-red-500' : 'border-[#D5C2AF]'
                    }`}
                  />
                  {errors.firstName && <p className="text-[11px] text-red-500 mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1F140E] block mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => {
                      setFormData({ ...formData, lastName: e.target.value });
                      if (errors.lastName) setErrors({ ...errors, lastName: '' });
                    }}
                    placeholder="e.g. Malik"
                    className={`w-full p-2.5 bg-[#FAF6F0] border text-xs text-[#1F140E] focus:bg-white focus:outline-none focus:border-[#1F140E] ${
                      errors.lastName ? 'border-red-500' : 'border-[#D5C2AF]'
                    }`}
                  />
                  {errors.lastName && <p className="text-[11px] text-red-500 mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#1F140E] block mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    placeholder="zain@domain.com"
                    className={`w-full p-2.5 bg-[#FAF6F0] border text-xs text-[#1F140E] focus:bg-white focus:outline-none focus:border-[#1F140E] ${
                      errors.email ? 'border-red-500' : 'border-[#D5C2AF]'
                    }`}
                  />
                  {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1F140E] block mb-1">
                    Mobile Number (Pakistan) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (errors.phone) setErrors({ ...errors, phone: '' });
                    }}
                    placeholder="0300 1234567"
                    className={`w-full p-2.5 bg-[#FAF6F0] border text-xs text-[#1F140E] focus:bg-white focus:outline-none focus:border-[#1F140E] ${
                      errors.phone ? 'border-red-500' : 'border-[#D5C2AF]'
                    }`}
                  />
                  {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1F140E] block mb-1">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value });
                    if (errors.address) setErrors({ ...errors, address: '' });
                  }}
                  placeholder="House / Villa No., Street, Sector or Block"
                  className={`w-full p-2.5 bg-[#FAF6F0] border text-xs text-[#1F140E] focus:bg-white focus:outline-none focus:border-[#1F140E] ${
                    errors.address ? 'border-red-500' : 'border-[#D5C2AF]'
                  }`}
                />
                {errors.address && <p className="text-[11px] text-red-500 mt-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#1F140E] block mb-1">
                    Apartment / Suite (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.apartment}
                    onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                    placeholder="Penthouse 4B"
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#D5C2AF] text-xs text-[#1F140E] focus:bg-white focus:outline-none focus:border-[#1F140E]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1F140E] block mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#D5C2AF] text-xs text-[#1F140E] focus:bg-white focus:outline-none focus:border-[#1F140E] cursor-pointer"
                  >
                    {PAKISTAN_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1F140E] block mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    placeholder="54000"
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#D5C2AF] text-xs text-[#1F140E] focus:bg-white focus:outline-none focus:border-[#1F140E]"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-[#1F140E] cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={formData.saveAddress}
                  onChange={(e) => setFormData({ ...formData, saveAddress: e.target.checked })}
                  className="accent-[#1F140E]"
                />
                <span>Save this bespoke address for future Lumora orders</span>
              </label>

              <button
                type="button"
                onClick={handleNextStep}
                className="w-full bg-[#1F140E] hover:bg-[#A66838] text-[#FAF6F0] text-xs uppercase tracking-widest font-semibold py-4 px-6 flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
              >
                <span>Continue to Delivery Tier</span>
                <ArrowRight className="w-4 h-4 text-[#C48A5A]" />
              </button>
            </div>
          )}

          {/* STEP 2: SHIPPING METHOD */}
          {currentStep === 2 && (
            <div className="bg-white border border-[#E2D4C3] p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgba(43,29,23,0.06)] animate-fadeIn">
              <div className="border-b border-[#EFE5D8] pb-4">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#A66838] font-semibold">
                  Step 2 of 3
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl text-[#1F140E] tracking-[0.03em] leading-none">
                  Delivery Method
                </h2>
                <p className="text-xs text-[#523B2F] mt-0.5">
                  Hand-inspected, wrapped in tissue paper and secured in archival gift boxes.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: 'standard',
                    title: 'White-Glove Standard Dispatch',
                    desc: '2 to 4 business days across Pakistan via insured luxury courier.',
                    cost: subtotal >= 15000 ? 0 : 850,
                  },
                  {
                    id: 'express',
                    title: 'Express Atelier Courier',
                    desc: 'Priority air courier. Next-day arrival in major metro hubs.',
                    cost: 1800,
                  },
                  {
                    id: 'sameday',
                    title: 'Same-Day Chauffeur Handover (Lahore & Karachi)',
                    desc: 'Dispatched directly from salon via uniformed white-glove driver.',
                    cost: 3500,
                  },
                ].map((tier) => (
                  <div
                    key={tier.id}
                    onClick={() => setFormData({ ...formData, shippingMethod: tier.id as any })}
                    className={`p-4 border transition-all cursor-pointer flex items-center justify-between ${
                      formData.shippingMethod === tier.id
                        ? 'border-[#1F140E] bg-[#FAF6F0] ring-1 ring-[#1F140E] shadow-xs'
                        : 'border-[#E2D4C3] hover:border-[#A66838] bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="pt-0.5">
                        <input
                          type="radio"
                          name="shippingTier"
                          checked={formData.shippingMethod === tier.id}
                          onChange={() => setFormData({ ...formData, shippingMethod: tier.id as any })}
                          className="accent-[#1F140E]"
                        />
                      </div>
                      <div>
                        <h4 className="font-sans text-sm font-semibold text-[#1F140E]">
                          {tier.title}
                        </h4>
                        <p className="text-xs text-[#523B2F] mt-0.5 leading-relaxed">{tier.desc}</p>
                      </div>
                    </div>

                    <div className="text-right font-sans text-sm font-bold text-[#1F140E] shrink-0 pl-4">
                      {tier.cost === 0 ? (
                        <span className="text-emerald-800 uppercase font-sans text-xs font-semibold">Free</span>
                      ) : (
                        formatPKR(tier.cost)
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="w-1/3 border border-[#D5C2AF] text-[#1F140E] text-xs uppercase tracking-widest font-semibold py-4 flex items-center justify-center gap-1.5 hover:bg-[#FAF6F0] cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-2/3 bg-[#1F140E] hover:bg-[#A66838] text-[#FAF6F0] text-xs uppercase tracking-widest font-semibold py-4 flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight className="w-4 h-4 text-[#C48A5A]" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT METHOD & SUBMISSION */}
          {currentStep === 3 && (
            <div className="bg-white border border-[#E2D4C3] p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgba(43,29,23,0.06)] animate-fadeIn">
              <div className="border-b border-[#EFE5D8] pb-4">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#A66838] font-semibold">
                  Step 3 of 3
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl text-[#1F140E] tracking-[0.03em] leading-none">
                  Payment Method
                </h2>
                <p className="text-xs text-[#523B2F] mt-0.5">
                  Compliant with State Bank of Pakistan standards and 256-bit TLS encryption.
                </p>
              </div>

              {/* Payment Methods Selection Accordion */}
              <div className="space-y-3">
                {/* 1. Easypaisa */}
                <div
                  className={`border transition-all ${
                    formData.paymentMethod === 'easypaisa'
                      ? 'border-[#2B1D17] bg-white ring-1 ring-[#2B1D17]'
                      : 'border-[#E7D6C1]'
                  }`}
                >
                  <div
                    onClick={() => setFormData({ ...formData, paymentMethod: 'easypaisa' })}
                    className="p-4 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="pay"
                        checked={formData.paymentMethod === 'easypaisa'}
                        onChange={() => setFormData({ ...formData, paymentMethod: 'easypaisa' })}
                        className="accent-[#2B1D17]"
                      />
                      <span className="font-sans text-sm font-bold text-[#2B1D17]">
                        Easypaisa Mobile Wallet
                      </span>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                      Instant Push
                    </span>
                  </div>

                  {formData.paymentMethod === 'easypaisa' && (
                    <div className="p-4 border-t border-[#E7D6C1] bg-[#FAF6F0]/60 space-y-3 text-xs">
                      <p className="text-[#6B4A3A]">
                        A biometric confirmation prompt will appear on your Easypaisa app for approval of <strong>{formatPKR(finalTotal)}</strong>.
                      </p>
                      <div>
                        <label className="text-xs font-medium text-[#2B1D17] block mb-1">
                          Easypaisa Account Number:
                        </label>
                        <input
                          type="tel"
                          value={formData.easypaisaPhone || formData.phone}
                          onChange={(e) => setFormData({ ...formData, easypaisaPhone: e.target.value })}
                          placeholder="03XXXXXXXXX"
                          className="w-full p-2.5 bg-white border border-[#E7D6C1] text-xs text-[#2B1D17] focus:outline-none focus:border-[#2B1D17]"
                        />
                        {errors.easypaisaPhone && <p className="text-[11px] text-red-500 mt-1">{errors.easypaisaPhone}</p>}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. JazzCash */}
                <div
                  className={`border transition-all ${
                    formData.paymentMethod === 'jazzcash'
                      ? 'border-[#2B1D17] bg-white ring-1 ring-[#2B1D17]'
                      : 'border-[#E7D6C1]'
                  }`}
                >
                  <div
                    onClick={() => setFormData({ ...formData, paymentMethod: 'jazzcash' })}
                    className="p-4 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="pay"
                        checked={formData.paymentMethod === 'jazzcash'}
                        onChange={() => setFormData({ ...formData, paymentMethod: 'jazzcash' })}
                        className="accent-[#2B1D17]"
                      />
                      <span className="font-sans text-sm font-bold text-[#2B1D17]">
                        JazzCash Mobile Account
                      </span>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-red-800 bg-red-50 px-2 py-0.5 border border-red-200">
                      MPIN Verification
                    </span>
                  </div>

                  {formData.paymentMethod === 'jazzcash' && (
                    <div className="p-4 border-t border-[#E7D6C1] bg-[#FAF6F0]/60 space-y-3 text-xs">
                      <p className="text-[#6B4A3A]">
                        Enter your JazzCash registered number to receive an instant MPIN confirmation request.
                      </p>
                      <div>
                        <label className="text-xs font-medium text-[#2B1D17] block mb-1">
                          JazzCash Mobile Number:
                        </label>
                        <input
                          type="tel"
                          value={formData.jazzcashPhone || formData.phone}
                          onChange={(e) => setFormData({ ...formData, jazzcashPhone: e.target.value })}
                          placeholder="03XXXXXXXXX"
                          className="w-full p-2.5 bg-white border border-[#E7D6C1] text-xs text-[#2B1D17] focus:outline-none focus:border-[#2B1D17]"
                        />
                        {errors.jazzcashPhone && <p className="text-[11px] text-red-500 mt-1">{errors.jazzcashPhone}</p>}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. 1Link Direct Bank Transfer */}
                <div
                  className={`border transition-all ${
                    formData.paymentMethod === 'bank_transfer'
                      ? 'border-[#2B1D17] bg-white ring-1 ring-[#2B1D17]'
                      : 'border-[#E7D6C1]'
                  }`}
                >
                  <div
                    onClick={() => setFormData({ ...formData, paymentMethod: 'bank_transfer' })}
                    className="p-4 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="pay"
                        checked={formData.paymentMethod === 'bank_transfer'}
                        onChange={() => setFormData({ ...formData, paymentMethod: 'bank_transfer' })}
                        className="accent-[#2B1D17]"
                      />
                      <span className="font-sans text-sm font-bold text-[#2B1D17]">
                        Direct 1Link Bank Transfer (Meezan / HBL / SCB)
                      </span>
                    </div>
                    <Building2 className="w-4 h-4 text-[#6B4A3A]" />
                  </div>

                  {formData.paymentMethod === 'bank_transfer' && (
                    <div className="p-4 border-t border-[#E7D6C1] bg-[#FAF6F0]/60 space-y-2 text-xs">
                      <div className="p-3 bg-white border border-[#E7D6C1] space-y-1">
                        <p><strong>Bank:</strong> Meezan Bank Limited (Premier Corporate Branch)</p>
                        <p><strong>Account Title:</strong> LUMORA HAUTE COUTURE (PVT) LTD</p>
                        <p><strong>IBAN:</strong> PK64 MEZN 0001 0203 0405 0607</p>
                      </div>
                      <p className="text-[11px] text-[#6B4A3A]">
                        Use your order number as deposit reference. Our concierge validates wire transfers within 20 minutes.
                      </p>
                    </div>
                  )}
                </div>

                {/* 4. Credit / Debit Card */}
                <div
                  className={`border transition-all ${
                    formData.paymentMethod === 'card'
                      ? 'border-[#2B1D17] bg-white ring-1 ring-[#2B1D17]'
                      : 'border-[#E7D6C1]'
                  }`}
                >
                  <div
                    onClick={() => setFormData({ ...formData, paymentMethod: 'card' })}
                    className="p-4 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="pay"
                        checked={formData.paymentMethod === 'card'}
                        onChange={() => setFormData({ ...formData, paymentMethod: 'card' })}
                        className="accent-[#2B1D17]"
                      />
                      <span className="font-sans text-sm font-bold text-[#2B1D17]">
                        Credit or Debit Card (Visa, Mastercard, PayPak)
                      </span>
                    </div>
                    <CreditCard className="w-4 h-4 text-[#6B4A3A]" />
                  </div>

                  {formData.paymentMethod === 'card' && (
                    <div className="p-4 border-t border-[#E7D6C1] bg-[#FAF6F0]/60 space-y-3 text-xs">
                      <div>
                        <label className="text-xs font-medium text-[#2B1D17] block mb-1">
                          Card Number:
                        </label>
                        <input
                          type="text"
                          value={formData.cardNumber}
                          onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                          placeholder="4000 1234 5678 9010"
                          maxLength={19}
                          className="w-full p-2.5 bg-white border border-[#E7D6C1] text-xs text-[#2B1D17] focus:outline-none focus:border-[#2B1D17]"
                        />
                        {errors.cardNumber && <p className="text-[11px] text-red-500 mt-1">{errors.cardNumber}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-[#2B1D17] block mb-1">
                            Expiry (MM/YY):
                          </label>
                          <input
                            type="text"
                            value={formData.cardExpiry}
                            onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
                            placeholder="08/28"
                            maxLength={5}
                            className="w-full p-2.5 bg-white border border-[#E7D6C1] text-xs text-[#2B1D17] focus:outline-none focus:border-[#2B1D17]"
                          />
                          {errors.cardExpiry && <p className="text-[11px] text-red-500 mt-1">{errors.cardExpiry}</p>}
                        </div>

                        <div>
                          <label className="text-xs font-medium text-[#2B1D17] block mb-1">
                            CVV Code:
                          </label>
                          <input
                            type="password"
                            value={formData.cardCvv}
                            onChange={(e) => setFormData({ ...formData, cardCvv: e.target.value })}
                            placeholder="123"
                            maxLength={4}
                            className="w-full p-2.5 bg-white border border-[#E7D6C1] text-xs text-[#2B1D17] focus:outline-none focus:border-[#2B1D17]"
                          />
                          {errors.cardCvv && <p className="text-[11px] text-red-500 mt-1">{errors.cardCvv}</p>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. Cash on Delivery */}
                <div
                  className={`border transition-all ${
                    formData.paymentMethod === 'cod'
                      ? 'border-[#2B1D17] bg-white ring-1 ring-[#2B1D17]'
                      : 'border-[#E7D6C1]'
                  }`}
                >
                  <div
                    onClick={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                    className="p-4 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="pay"
                        checked={formData.paymentMethod === 'cod'}
                        onChange={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                        className="accent-[#2B1D17]"
                      />
                      <span className="font-sans text-sm font-bold text-[#2B1D17]">
                        Cash on Doorstep Delivery (COD)
                      </span>
                    </div>
                    <Banknote className="w-4 h-4 text-[#6B4A3A]" />
                  </div>

                  {formData.paymentMethod === 'cod' && (
                    <div className="p-4 border-t border-[#E7D6C1] bg-[#FAF6F0]/60 text-xs text-[#6B4A3A]">
                      Pay in cash or credit card upon private delivery handover at your doorstep. Exact amount is appreciated.
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Instructions Note */}
              <div className="pt-2">
                <label className="text-xs font-medium text-[#2B1D17] block mb-1">
                  Atelier Courier Notes & Gate Clearance (Optional):
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Ring gate bell, deliver to front parlor, call prior to dispatch..."
                  className="w-full p-2.5 bg-white/70 border border-[#E7D6C1] text-xs text-[#2B1D17] focus:outline-none focus:border-[#2B1D17]"
                />
              </div>

              {/* Back & Submit Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="w-1/3 border border-[#6B4A3A] text-[#2B1D17] text-xs uppercase tracking-widest font-semibold py-4 flex items-center justify-center gap-1.5 hover:bg-[#E7D6C1]/30 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="w-2/3 bg-[#2B1D17] hover:bg-[#6B4A3A] text-[#FAF6F0] text-xs uppercase tracking-[0.2em] font-semibold py-4 flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-70 shadow-xl"
                >
                  {isProcessing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Authorizing Order...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-[#C48A5A]" />
                      <span>Authorize & Place Order</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[#6B4A3A] pt-2">
                <ShieldCheck className="w-4 h-4 text-[#C48A5A]" />
                <span>Protected by 256-Bit SSL Atelier Encryption & 30-Day Guarantees</span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: ORDER REVIEW SUMMARY */}
        <div className="lg:col-span-5 bg-white border border-[#E2D4C3] p-6 sm:p-7 space-y-6 sticky top-28 shadow-[0_4px_24px_rgba(43,29,23,0.06)]">
          <div className="flex items-center justify-between border-b border-[#EFE5D8] pb-4">
            <h3 className="font-heading text-2xl sm:text-3xl text-[#1F140E] tracking-[0.03em] leading-none">
              Order Summary
            </h3>
            <span className="text-xs text-[#7A6253] font-semibold">
              {cart.reduce((a, c) => a + c.quantity, 0)} Items
            </span>
          </div>

          {/* Mini Items List */}
          <div className="space-y-4 max-h-72 overflow-y-auto pr-1 divide-y divide-[#EFE5D8]">
            {cart.map((item) => (
              <div key={item.id} className="pt-3 first:pt-0 flex items-center gap-3">
                <img
                  src={item.product?.images?.[0] || ''}
                  alt={item.product?.name || ''}
                  referrerPolicy="no-referrer"
                  className="w-12 h-16 object-cover border border-[#E2D4C3] shrink-0"
                />
                <div className="flex-1 min-w-0 text-xs">
                  <h5 className="font-sans font-semibold text-[#1F140E] truncate">
                    {item.product.name}
                  </h5>
                  <p className="text-[#523B2F]">
                    {item.selectedColor} &bull; Size {item.selectedSize}
                  </p>
                  <p className="text-[#7A6253]">Qty: {item.quantity}</p>
                </div>
                <div className="text-right text-xs font-semibold text-[#1F140E] shrink-0">
                  {formatPKR(item.product.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          {/* Calculation */}
          <div className="space-y-3 pt-4 border-t border-[#EFE5D8] text-xs">
            <div className="flex justify-between text-[#1F140E]">
              <span>Subtotal</span>
              <span className="font-semibold">{formatPKR(subtotal)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-800 font-medium">
                <span>Voucher Privilege</span>
                <span>-{formatPKR(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-[#1F140E]">
              <span>Courier Delivery</span>
              <span>{currentShippingCost === 0 ? <strong className="text-emerald-800 uppercase font-semibold">Complimentary</strong> : formatPKR(currentShippingCost)}</span>
            </div>

            <div className="flex justify-between text-[#7A6253] text-[11px]">
              <span>Applicable Luxury Duties</span>
              <span>Included</span>
            </div>

            <div className="pt-4 border-t border-[#EFE5D8] flex justify-between items-baseline">
              <span className="font-sans text-base font-bold text-[#1F140E]">Total Payable</span>
              <span className="font-sans text-2xl font-bold text-[#1F140E]">
                {formatPKR(finalTotal)}
              </span>
            </div>
          </div>

          {/* Delivery destination preview when step > 1 */}
          {currentStep > 1 && formData.address && (
            <div className="pt-4 border-t border-[#EFE5D8] text-xs space-y-1 text-[#523B2F]">
              <span className="font-semibold text-[#1F140E] block">Dispatching To:</span>
              <p>{formData.firstName} {formData.lastName}</p>
              <p>{formData.address}, {formData.city}</p>
              <p>{formData.phone}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
