import React, { useState } from 'react';
import { MessageSquare, Star, X, CheckCircle2 } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const FloatingFeedback: React.FC = () => {
  const { isFeedbackOpen, setIsFeedbackOpen, addToast } = useShop();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [category, setCategory] = useState<string>('Overall Experience');
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) {
      setError('Please provide a short description of your experience or suggestion.');
      return;
    }
    if (feedbackText.trim().length < 10) {
      setError('Kindly share at least 10 characters so our atelier team can take action.');
      return;
    }

    setError('');
    setIsSubmitted(true);
    addToast('Feedback Received', 'Thank you for helping refine the Lumora experience.', 'luxury');

    setTimeout(() => {
      setIsSubmitted(false);
      setFeedbackText('');
      setRating(5);
      setIsFeedbackOpen(false);
    }, 2800);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        id="floating-feedback-trigger"
        onClick={() => setIsFeedbackOpen(true)}
        className="fixed bottom-6 right-6 z-30 bg-[#2B1D17] text-[#FAF6F0] px-4 py-3 shadow-xl hover:bg-[#6B4A3A] transition-all duration-300 flex items-center gap-2.5 border border-[#C48A5A]/30 group cursor-pointer"
        aria-label="Atelier Feedback"
      >
        <MessageSquare className="w-4 h-4 text-[#C48A5A] group-hover:scale-110 transition-transform" />
        <span className="text-xs font-medium tracking-wider uppercase">Feedback</span>
      </button>

      {/* Modal Dialog */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#2B1D17]/70 backdrop-blur-xs transition-opacity"
            onClick={() => setIsFeedbackOpen(false)}
          />

          <div className="relative bg-[#FAF6F0] w-full max-w-md border border-[#E7D6C1] shadow-2xl z-10 p-6 sm:p-8">
            <button
              onClick={() => setIsFeedbackOpen(false)}
              className="absolute top-4 right-4 text-[#2B1D17] hover:text-[#C48A5A]"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {isSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-[#E7D6C1]/40 flex items-center justify-center text-[#2B1D17]">
                  <CheckCircle2 className="w-8 h-8 text-[#C48A5A]" />
                </div>
                <h3 className="font-serif text-2xl text-[#2B1D17] font-semibold">Thank You Kindly</h3>
                <p className="text-xs text-[#6B4A3A] leading-relaxed max-w-xs mx-auto">
                  Your remarks have been forwarded directly to our Creative Direction & Atelier team.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#C48A5A] font-semibold">
                    Client Dialogue
                  </span>
                  <h3 className="font-serif text-2xl text-[#2B1D17] font-semibold">
                    How was your experience?
                  </h3>
                  <p className="text-xs text-[#6B4A3A] mt-1">
                    Every detail of Lumora is crafted for elevated serenity. Tell us how we may refine your journey.
                  </p>
                </div>

                {/* Rating Stars */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#2B1D17] block">Experience Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 text-[#C48A5A] transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                        aria-label={`Rate ${star} star`}
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= (hoverRating || rating)
                              ? 'fill-[#C48A5A] text-[#C48A5A]'
                              : 'text-[#E7D6C1]'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs text-[#6B4A3A] font-semibold ml-2">
                      {rating === 5 ? 'Exceptional' : rating === 4 ? 'Very Good' : rating === 3 ? 'Pleasant' : 'Needs Polish'}
                    </span>
                  </div>
                </div>

                {/* Topic Pill */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#2B1D17] block">Aspect</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {['Overall Experience', 'Fabric & Craft', 'Speed & Delivery', 'Website Navigation'].map((item) => (
                      <button
                        type="button"
                        key={item}
                        onClick={() => setCategory(item)}
                        className={`p-2 border text-left transition-colors cursor-pointer ${
                          category === item
                            ? 'border-[#2B1D17] bg-[#2B1D17] text-[#FAF6F0]'
                            : 'border-[#E7D6C1] text-[#2B1D17] hover:border-[#6B4A3A]'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Textarea */}
                <div className="space-y-1.5">
                  <label htmlFor="feedback-text" className="text-xs font-medium text-[#2B1D17] block">
                    What can we improve?
                  </label>
                  <textarea
                    id="feedback-text"
                    rows={4}
                    value={feedbackText}
                    onChange={(e) => {
                      setFeedbackText(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Share any thoughts regarding garment cuts, Pakistani courier timing, or catalogue desires..."
                    className={`w-full p-3 bg-white/50 border text-xs text-[#2B1D17] focus:outline-none focus:border-[#2B1D17] transition-colors resize-none ${
                      error ? 'border-red-500' : 'border-[#E7D6C1]'
                    }`}
                  />
                  {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}
                </div>

                {/* Submit */}
                <button
                  id="submit-feedback-btn"
                  type="submit"
                  className="w-full bg-[#2B1D17] text-[#FAF6F0] hover:bg-[#6B4A3A] text-xs font-medium tracking-widest uppercase py-3.5 px-4 transition-colors cursor-pointer shadow-md"
                >
                  Submit Feedback
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};
