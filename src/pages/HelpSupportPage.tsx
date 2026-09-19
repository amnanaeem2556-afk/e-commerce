import React, { useState } from 'react';
import {
  HelpCircle,
  Truck,
  RotateCcw,
  CreditCard,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  Search,
  MessageSquare,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight
} from 'lucide-react';
import { FAQS } from '../data/constants';
import { useShop } from '../context/ShopContext';

export const HelpSupportPage: React.FC = () => {
  const { setCurrentPage, addToast } = useShop();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<string | null>('faq-1');

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    orderId: '',
    subject: 'Order Inquiries',
    message: ''
  });
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const categories = [
    { id: 'all', label: 'All Inquiries' },
    { id: 'shipping', label: 'Shipping & Couriers' },
    { id: 'returns', label: 'Returns & Trials' },
    { id: 'payment', label: 'Payment & Currency' },
    { id: 'product', label: 'Sizing & Fabrics' },
  ];

  const filteredFaqs = FAQS.filter((faq) => {
    if (activeCategory !== 'all' && faq.category !== activeCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q);
    }
    return true;
  });

  const validateContact = () => {
    const errs: Record<string, string> = {};
    if (!contactForm.name.trim() || !/^[A-Za-z\s]+$/.test(contactForm.name)) {
      errs.name = 'Full name is required (letters and spaces only).';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!contactForm.email.trim() || !emailRegex.test(contactForm.email)) {
      errs.email = 'Valid email address is required.';
    }
    if (!contactForm.message.trim() || contactForm.message.length < 15) {
      errs.message = 'Please provide at least 15 characters so we can thoroughly address your request.';
    }
    setContactErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateContact()) return;

    setContactSubmitted(true);
    addToast('Concierge Notified', 'An atelier client advisor will contact you within 2 business hours.', 'luxury');
    setTimeout(() => {
      setContactSubmitted(false);
      setContactForm({
        name: '',
        email: '',
        phone: '',
        orderId: '',
        subject: 'Order Inquiries',
        message: ''
      });
    }, 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-[10.5px] uppercase tracking-[0.25em] text-[#C48A5A] font-semibold">
          Client Care & Concierge
        </span>
        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-[#2B1D17] tracking-[0.03em] leading-none">
          Help & Support
        </h1>
        <p className="text-xs sm:text-sm text-[#6B4A3A] font-light leading-relaxed">
          From nationwide white-glove deliveries to 30-day in-home returns, our Lahore salon concierge is at your service.
        </p>

        {/* Quick Search in FAQs */}
        <div className="max-w-md mx-auto pt-4 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search FAQs, returns, delivery timelines..."
            className="w-full bg-[#FAF6F0] border border-[#E7D6C1] py-3 pl-10 pr-4 text-xs text-[#2B1D17] focus:outline-none focus:border-[#2B1D17]"
          />
          <Search className="w-4 h-4 text-[#6B4A3A] absolute left-3.5 top-3.5" />
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveCategory('shipping')}
          className="bg-[#FAF6F0] border border-[#E7D6C1] p-5 text-center space-y-2 hover:border-[#6B4A3A] transition-colors cursor-pointer"
        >
          <Truck className="w-6 h-6 text-[#C48A5A] mx-auto" />
          <h4 className="font-sans text-sm font-semibold text-[#2B1D17]">Shipping Help</h4>
          <p className="text-[11px] text-[#6B4A3A]">White-Glove TCS express details</p>
        </div>

        <div
          onClick={() => setActiveCategory('returns')}
          className="bg-[#FAF6F0] border border-[#E7D6C1] p-5 text-center space-y-2 hover:border-[#6B4A3A] transition-colors cursor-pointer"
        >
          <RotateCcw className="w-6 h-6 text-[#C48A5A] mx-auto" />
          <h4 className="font-sans text-sm font-semibold text-[#2B1D17]">30-Day Returns</h4>
          <p className="text-[11px] text-[#6B4A3A]">Complimentary home pickup</p>
        </div>

        <div
          onClick={() => setActiveCategory('payment')}
          className="bg-[#FAF6F0] border border-[#E7D6C1] p-5 text-center space-y-2 hover:border-[#6B4A3A] transition-colors cursor-pointer"
        >
          <CreditCard className="w-6 h-6 text-[#C48A5A] mx-auto" />
          <h4 className="font-sans text-sm font-semibold text-[#2B1D17]">Payment Guides</h4>
          <p className="text-[11px] text-[#6B4A3A]">Easypaisa, JazzCash & 1Link</p>
        </div>

        <div
          onClick={() => setCurrentPage('order_tracking')}
          className="bg-[#FAF6F0] border border-[#E7D6C1] p-5 text-center space-y-2 hover:border-[#6B4A3A] transition-colors cursor-pointer"
        >
          <Clock className="w-6 h-6 text-[#C48A5A] mx-auto" />
          <h4 className="font-sans text-sm font-semibold text-[#2B1D17]">Live Order Tracking</h4>
          <p className="text-[11px] text-[#6B4A3A]">Check consignment by ID</p>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E7D6C1] pb-4">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#C48A5A] font-semibold">
              Frequently Addressed Questions
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl text-[#2B1D17] tracking-[0.03em] leading-none">Answers & Protocols</h2>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`px-3 py-1.5 border transition-colors cursor-pointer ${
                  activeCategory === c.id
                    ? 'border-[#2B1D17] bg-[#2B1D17] text-[#FAF6F0]'
                    : 'border-[#E7D6C1] text-[#2B1D17] hover:border-[#6B4A3A]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {filteredFaqs.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#6B4A3A]">
            No answers match your inquiry query. Try another term or contact our concierge below.
          </div>
        ) : (
          <div className="divide-y divide-[#E7D6C1] border border-[#E7D6C1] bg-[#FAF6F0]">
            {filteredFaqs.map((faq) => (
              <div key={faq.id} className="p-4 sm:p-5">
                <button
                  onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                  className="w-full flex justify-between items-center text-left text-xs sm:text-sm font-sans font-bold text-[#2B1D17] hover:text-[#6B4A3A] transition-colors cursor-pointer"
                >
                  <span>{faq.question}</span>
                  {openFaq === faq.id ? (
                    <ChevronUp className="w-4 h-4 text-[#C48A5A] shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#6B4A3A] shrink-0 ml-2" />
                  )}
                </button>
                {openFaq === faq.id && (
                  <div className="pt-3 text-xs text-[#2B1D17]/90 leading-relaxed font-normal animate-fadeIn">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Two-Column: Contact Concierge Form & Salon Location */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start border-t border-[#E7D6C1] pt-14">
        {/* Contact Form */}
        <div className="lg:col-span-7 bg-[#FAF6F0] border border-[#E7D6C1] p-6 sm:p-8 space-y-6">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#C48A5A] font-semibold">
              Direct Dialogue
            </span>
            <h3 className="font-heading text-2xl sm:text-3xl text-[#2B1D17] tracking-[0.03em] leading-none">
              Contact Concierge
            </h3>
            <p className="text-xs text-[#6B4A3A] mt-1">
              Have a tailored question regarding garment sizing or a custom order? Our advisors respond promptly.
            </p>
          </div>

          {contactSubmitted ? (
            <div className="py-10 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-[#C48A5A] mx-auto" />
              <h4 className="font-sans text-lg sm:text-xl font-semibold text-[#2B1D17]">Message Received</h4>
              <p className="text-xs text-[#6B4A3A] max-w-sm mx-auto">
                A private client stylist has received your dispatch and will respond via email and telephone.
              </p>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-medium text-[#2B1D17] block mb-1">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="e.g. Bilal Tareen"
                    className={`w-full p-2.5 bg-white border text-xs text-[#2B1D17] focus:outline-none focus:border-[#2B1D17] ${
                      contactErrors.name ? 'border-red-500' : 'border-[#E7D6C1]'
                    }`}
                  />
                  {contactErrors.name && <p className="text-[11px] text-red-500 mt-1">{contactErrors.name}</p>}
                </div>

                <div>
                  <label className="font-medium text-[#2B1D17] block mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="bilal@example.com"
                    className={`w-full p-2.5 bg-white border text-xs text-[#2B1D17] focus:outline-none focus:border-[#2B1D17] ${
                      contactErrors.email ? 'border-red-500' : 'border-[#E7D6C1]'
                    }`}
                  />
                  {contactErrors.email && <p className="text-[11px] text-red-500 mt-1">{contactErrors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-medium text-[#2B1D17] block mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    placeholder="0300 0000000"
                    className="w-full p-2.5 bg-white border border-[#E7D6C1] text-xs text-[#2B1D17] focus:outline-none focus:border-[#2B1D17]"
                  />
                </div>

                <div>
                  <label className="font-medium text-[#2B1D17] block mb-1">
                    Order Reference ID (If applicable)
                  </label>
                  <input
                    type="text"
                    value={contactForm.orderId}
                    onChange={(e) => setContactForm({ ...contactForm, orderId: e.target.value })}
                    placeholder="e.g. LUM-948201"
                    className="w-full p-2.5 bg-white border border-[#E7D6C1] text-xs text-[#2B1D17] focus:outline-none focus:border-[#2B1D17]"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-[#2B1D17] block mb-1">
                  Topic of Consultation
                </label>
                <select
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#E7D6C1] text-xs text-[#2B1D17] focus:outline-none focus:border-[#2B1D17] cursor-pointer"
                >
                  <option value="Order Inquiries">Order Status & Tracking</option>
                  <option value="Size Consultation">Bespoke Sizing & Fit Guidance</option>
                  <option value="Returns & Exchange">30-Day In-Home Return Pickup</option>
                  <option value="Salon Appointment">Galleria Mall Private Salon Appointment</option>
                  <option value="Corporate & VIP">Corporate Gifting & VIP Privileges</option>
                </select>
              </div>

              <div>
                <label className="font-medium text-[#2B1D17] block mb-1">
                  Message / Details <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="How may our atelier tailors and advisors assist you today?"
                  className={`w-full p-2.5 bg-white border text-xs text-[#2B1D17] focus:outline-none focus:border-[#2B1D17] ${
                    contactErrors.message ? 'border-red-500' : 'border-[#E7D6C1]'
                  }`}
                />
                {contactErrors.message && <p className="text-[11px] text-red-500 mt-1">{contactErrors.message}</p>}
              </div>

              <button
                type="submit"
                className="bg-[#2B1D17] hover:bg-[#6B4A3A] text-[#FAF6F0] text-xs uppercase tracking-widest font-semibold py-3.5 px-6 transition-colors cursor-pointer"
              >
                Send Message to Concierge
              </button>
            </form>
          )}
        </div>

        {/* Salon Contact Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#FAF6F0] border border-[#E7D6C1] p-6 space-y-4">
            <h4 className="font-sans text-base sm:text-lg font-semibold text-[#2B1D17]">
              Lahore Flagship Salon
            </h4>
            <div className="space-y-2.5 text-xs text-[#2B1D17]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C48A5A] shrink-0 mt-0.5" />
                <span className="text-[#6B4A3A]">
                  Galleria Mall, Level 1, Main Boulevard, Gulberg III, Lahore, Pakistan
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#C48A5A] shrink-0 mt-0.5" />
                <span className="text-[#6B4A3A]">
                  Direct: <strong>+92 (042) 3578-9000</strong>
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#C48A5A] shrink-0 mt-0.5" />
                <span className="text-[#6B4A3A]">
                  Email: <strong>concierge@lumora.luxury</strong>
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#C48A5A] shrink-0 mt-0.5" />
                <span className="text-[#6B4A3A]">
                  Hours: Mon–Sun 11:00 AM – 10:00 PM PKT
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#2B1D17] text-[#FAF6F0] p-6 space-y-3 border border-[#6B4A3A]">
            <span className="text-[9.5px] uppercase tracking-widest text-[#C48A5A] font-semibold block">
              Direct Stylist On WhatsApp
            </span>
            <h4 className="font-sans text-sm sm:text-base font-semibold text-[#FAF6F0]">
              Instant WhatsApp Concierge
            </h4>
            <p className="text-xs text-[#E7D6C1]/80 leading-relaxed font-light">
              Connect with our live salon stylist for instant fabric swatches, high-resolution video consultations, and order updates.
            </p>
            <a
              href="https://wa.me/923001234567"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#C48A5A] hover:bg-[#FAF6F0] text-[#2B1D17] text-xs uppercase tracking-widest font-semibold px-4 py-2.5 transition-colors mt-2"
            >
              <span>Message on WhatsApp</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
