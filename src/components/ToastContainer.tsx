import React from 'react';
import { useShop } from '../context/ShopContext';
import { Check, Info, Sparkles, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useShop();

  if (toasts.length === 0) return null;

  return (
    <aside aria-label="Notifications" className="fixed bottom-20 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-[#2B1D17] text-[#FAF6F0] p-4 shadow-2xl border border-[#C48A5A]/50 flex items-start gap-3 animate-slideInRight"
        >
          <div className="shrink-0 mt-0.5">
            {toast.type === 'info' ? (
              <Info className="w-4 h-4 text-[#E7D6C1]" />
            ) : toast.type === 'success' ? (
              <Check className="w-4 h-4 text-[#C48A5A]" />
            ) : (
              <Sparkles className="w-4 h-4 text-[#C48A5A]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-serif text-sm font-semibold tracking-wide text-[#FAF6F0]">
              {toast.title}
            </h4>
            <p className="text-xs text-[#E7D6C1]/90 mt-0.5 leading-snug">
              {toast.message}
            </p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-[#E7D6C1]/60 hover:text-[#FAF6F0] p-0.5 shrink-0"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </aside>
  );
};
