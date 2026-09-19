import React, { useState } from 'react';
import { Star, CheckCircle2, ThumbsUp, Filter, MessageSquare, ArrowRight } from 'lucide-react';
import { INITIAL_REVIEWS } from '../data/reviews';
import { PRODUCTS } from '../data/products';
import { Review } from '../types';
import { useShop } from '../context/ShopContext';

export const ReviewsPage: React.FC = () => {
  const { addToast } = useShop();
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState({
    author: '',
    email: '',
    city: 'Lahore',
    rating: 5,
    title: '',
    comment: '',
    productId: PRODUCTS[0].id,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleHelpful = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          if (r.userVoted) return r;
          return { ...r, helpfulCount: r.helpfulCount + 1, userVoted: true };
        }
        return r;
      })
    );
    addToast('Marked Helpful', 'Thank you for your feedback.', 'info');
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.author.trim() || !/^[A-Za-z\s]+$/.test(form.author)) {
      errs.author = 'Please enter a valid full name.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim() || !emailRegex.test(form.email)) {
      errs.email = 'Valid email is required.';
    }
    if (!form.title.trim()) {
      errs.title = 'Review headline is required.';
    }
    if (!form.comment.trim() || form.comment.length < 15) {
      errs.comment = 'Please provide at least 15 characters of detailed feedback.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      productId: form.productId,
      author: form.author,
      city: form.city,
      rating: form.rating,
      title: form.title,
      comment: form.comment,
      date: 'Just now',
      verified: true,
      helpfulCount: 0,
      userVoted: false,
    };

    setReviews([newRev, ...reviews]);
    setSubmitted(true);
    addToast('Appraisal Published', 'Thank you for sharing your experience.', 'luxury');
    setTimeout(() => {
      setIsFormOpen(false);
      setSubmitted(false);
      setForm({
        author: '',
        email: '',
        city: 'Lahore',
        rating: 5,
        title: '',
        comment: '',
        productId: PRODUCTS[0].id,
      });
    }, 2000);
  };

  const filteredReviews = ratingFilter ? reviews.filter((r) => r.rating === ratingFilter) : reviews;

  const totalReviews = reviews.length;
  const avg = reviews.reduce((a, b) => a + b.rating, 0) / totalReviews;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#C48A5A] font-semibold">
          Client Echoes
        </span>
        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-[#2B1D17] tracking-[0.03em] leading-none">
          Client Reviews
        </h1>
        <p className="text-xs sm:text-sm text-[#6B4A3A] font-light">
          Real reflections on drape, texture, unboxing, and durability from patrons across Pakistan.
        </p>
      </div>

      {/* Overview Score & Breakdown */}
      <div className="bg-white border border-[#E2D4C3] p-6 sm:p-8 shadow-[0_4px_24px_rgba(43,29,23,0.06)] grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-4 text-center md:text-left border-b md:border-b-0 md:border-r border-[#EFE5D8] pb-6 md:pb-0 md:pr-8">
          <div className="font-sans text-5xl font-bold text-[#1F140E] tracking-tight">
            {avg.toFixed(1)} <span className="text-xl text-[#523B2F] font-normal">/ 5</span>
          </div>
          <div className="flex items-center justify-center md:justify-start text-[#C48A5A] gap-1 my-2.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${i < Math.floor(avg) ? 'fill-[#C48A5A] text-[#C48A5A]' : 'text-[#E2D4C3]'}`}
              />
            ))}
          </div>
          <p className="text-xs text-[#523B2F]">
            Based on {totalReviews} client evaluations
          </p>
        </div>

        <div className="md:col-span-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="w-full sm:w-auto flex-1 space-y-2 text-xs">
            {[5, 4, 3, 2, 1].map((st) => {
              const count = reviews.filter((r) => r.rating === st).length;
              const pct = (count / totalReviews) * 100;
              return (
                <div key={st} className="flex items-center gap-3">
                  <span className="w-14 text-[#1F140E] font-medium">{st} Stars</span>
                  <div className="flex-1 h-2.5 bg-[#EFE5D8] rounded-full overflow-hidden">
                    <div className="h-full bg-[#C48A5A] rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-right text-[11px] text-[#7A6253] font-semibold">{count}</span>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="w-full sm:w-auto bg-[#1F140E] text-[#FAF6F0] hover:bg-[#A66838] text-xs uppercase tracking-widest font-semibold py-3.5 px-6 transition-colors shrink-0 cursor-pointer shadow-sm"
          >
            {isFormOpen ? 'Close Form' : 'Write an Appraisal'}
          </button>
        </div>
      </div>

      {/* Review Form Modal/Inline */}
      {isFormOpen && (
        <div className="bg-[#FAF6F0] border-2 border-[#2B1D17] p-6 sm:p-8 animate-fadeIn">
          <h3 className="font-heading text-2xl sm:text-3xl text-[#2B1D17] tracking-[0.03em] leading-none mb-1">
            Write a Review
          </h3>
          <p className="text-xs text-[#6B4A3A] mb-6">
            Describe garment quality, sizing accuracy, and door-to-door courier experience.
          </p>

          {submitted ? (
            <div className="text-center py-6">
              <CheckCircle2 className="w-10 h-10 text-[#C48A5A] mx-auto mb-2" />
              <p className="font-sans text-lg font-semibold text-[#2B1D17]">Thank you for your submission.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-medium text-[#2B1D17] block mb-1">Garment Creation</label>
                  <select
                    value={form.productId}
                    onChange={(e) => setForm({ ...form, productId: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#E7D6C1] text-xs text-[#2B1D17] focus:outline-none"
                  >
                    {PRODUCTS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-medium text-[#2B1D17] block mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    placeholder="e.g. Asad Qureshi"
                    className="w-full p-2.5 bg-white border border-[#E7D6C1] text-xs text-[#2B1D17]"
                  />
                  {errors.author && <p className="text-red-500 mt-1">{errors.author}</p>}
                </div>

                <div>
                  <label className="font-medium text-[#2B1D17] block mb-1">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="e.g. Islamabad"
                    className="w-full p-2.5 bg-white border border-[#E7D6C1] text-xs text-[#2B1D17]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-medium text-[#2B1D17] block mb-1">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="asad@example.com"
                    className="w-full p-2.5 bg-white border border-[#E7D6C1] text-xs text-[#2B1D17]"
                  />
                  {errors.email && <p className="text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="font-medium text-[#2B1D17] block mb-1">Overall Rating</label>
                  <div className="flex gap-1 pt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setForm({ ...form, rating: s })}
                        className="text-[#C48A5A]"
                      >
                        <Star
                          className={`w-6 h-6 ${s <= form.rating ? 'fill-[#C48A5A] text-[#C48A5A]' : 'text-[#E7D6C1]'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="font-medium text-[#2B1D17] block mb-1">Review Headline *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. The finest double-faced cashmere in Pakistan"
                  className="w-full p-2.5 bg-white border border-[#E7D6C1] text-xs text-[#2B1D17]"
                />
                {errors.title && <p className="text-red-500 mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="font-medium text-[#2B1D17] block mb-1">Detailed Remarks *</label>
                <textarea
                  rows={4}
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  placeholder="Elaborate on tailoring, lining softness, and packaging..."
                  className="w-full p-2.5 bg-white border border-[#E7D6C1] text-xs text-[#2B1D17]"
                />
                {errors.comment && <p className="text-red-500 mt-1">{errors.comment}</p>}
              </div>

              <button
                type="submit"
                className="bg-[#2B1D17] text-[#FAF6F0] hover:bg-[#6B4A3A] px-6 py-3 uppercase tracking-widest font-semibold text-xs"
              >
                Submit Appraisal
              </button>
            </form>
          )}
        </div>
      )}

      {/* Filter Buttons by Stars */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
        <span className="text-[#523B2F] font-semibold mr-2">Filter Rating:</span>
        <button
          onClick={() => setRatingFilter(null)}
          className={`px-3.5 py-1.5 border transition-colors cursor-pointer ${
            ratingFilter === null ? 'bg-[#1F140E] text-[#FAF6F0] border-[#1F140E] font-semibold' : 'bg-white border-[#E2D4C3] text-[#1F140E] hover:border-[#1F140E]'
          }`}
        >
          All Appraisals ({reviews.length})
        </button>
        {[5, 4, 3].map((star) => (
          <button
            key={star}
            onClick={() => setRatingFilter(star)}
            className={`px-3.5 py-1.5 border transition-colors flex items-center gap-1 cursor-pointer ${
              ratingFilter === star ? 'bg-[#1F140E] text-[#FAF6F0] border-[#1F140E] font-semibold' : 'bg-white border-[#E2D4C3] text-[#1F140E] hover:border-[#1F140E]'
            }`}
          >
            <span>{star} Stars</span>
            <Star className="w-3 h-3 fill-[#C48A5A] text-[#C48A5A]" />
          </button>
        ))}
      </div>

      {/* Reviews Grid */}
      <div className="space-y-6">
        {filteredReviews.map((rev) => {
          const prod = PRODUCTS.find((p) => p.id === rev.productId);

          return (
            <div
              key={rev.id}
              className="bg-white border border-[#E2D4C3] p-6 sm:p-7 space-y-3.5 shadow-[0_2px_14px_rgba(43,29,23,0.04)] hover:shadow-[0_10px_26px_rgba(43,29,23,0.08)] hover:border-[#B87A45] transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EFE5D8] pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex text-[#C48A5A]">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-[#C48A5A] text-[#C48A5A]' : 'text-[#E2D4C3]'}`}
                      />
                    ))}
                  </div>
                  <h3 className="font-sans text-sm sm:text-base font-semibold text-[#1F140E]">
                    {rev.title}
                  </h3>
                </div>
                <span className="text-xs text-[#7A6253] font-medium">{rev.date}</span>
              </div>

              {prod && (
                <div className="text-[11px] text-[#A66838] uppercase tracking-wider font-semibold">
                  Verified Item: {prod.name}
                </div>
              )}

              <p className="text-xs text-[#523B2F] font-light leading-relaxed">
                {rev.comment}
              </p>

              <div className="flex items-center justify-between pt-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#1F140E]">{rev.author}</span>
                  <span className="text-[#7A6253]">&bull; {rev.city}</span>
                  {rev.verified && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified Purchase
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleHelpful(rev.id)}
                  disabled={rev.userVoted}
                  className="flex items-center gap-1.5 text-xs text-[#523B2F] hover:text-[#1F140E] transition-colors disabled:opacity-60 cursor-pointer"
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${rev.userVoted ? 'fill-[#C48A5A] text-[#C48A5A]' : ''}`} />
                  <span>Helpful ({rev.helpfulCount})</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
