interface Props {
  onClose: () => void;
  onGetQuote: () => void;
}

/**
 * Renovation Brochure Modal
 * Lazy-loaded on demand — lives in its own file so the bundle cost
 * is only paid when the user opens it.
 */
export default function RenovationBrochureModal({ onClose, onGetQuote }: Props) {
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      role="dialog"
      aria-label="Renovation Package Brochure"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="bg-[#332e28] p-6 rounded-t-2xl flex items-start justify-between">
          <div>
            <span className="inline-block bg-[#e74c3c] text-white text-xs font-['Poppins'] font-bold px-3 py-1 rounded-full mb-2">
              🔥 Limited Promo
            </span>
            <h2 className="font-['Poppins'] font-bold text-2xl text-white">
              Renovation Package
            </h2>
            <p className="font-['DM_Sans'] text-white/80 text-base mt-1">
              Up to 30% off on complete renovation packages
            </p>
          </div>
          <button
            aria-label="Close"
            className="text-white/60 hover:text-white transition ml-4 shrink-0"
            onClick={onClose}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="font-['Poppins'] text-[#404040] text-base leading-relaxed">
            Our renovation packages are designed to give you a complete, stress-free
            transformation of your home — from concept to completion.
          </p>

          {[
            { emoji: "🏠", title: "Full Home Renovation", desc: "Complete overhaul of all rooms with consistent design language." },
            { emoji: "🍳", title: "Kitchen + Bathroom Bundle", desc: "High-impact renovation of the two most-used spaces in your home." },
            { emoji: "🛏️", title: "Bedroom Package", desc: "Custom wardrobe, feature wall, and lighting solution." },
          ].map(({ emoji, title, desc }) => (
            <div className="flex gap-4" key={title}>
              <span className="text-3xl shrink-0">{emoji}</span>
              <div>
                <p className="font-['Poppins'] font-semibold text-[#1C1B1F]">{title}</p>
                <p className="font-['DM_Sans'] text-[#666] text-sm mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex flex-col sm:flex-row gap-3">
          <button
            className="flex-1 bg-[#332e28] hover:bg-[#2a2622] active:scale-95 transition py-3 rounded-[12px] font-['Poppins'] font-medium text-base text-white"
            onClick={onGetQuote}
          >
            Get a Free Quote
          </button>
          <button
            className="flex-1 border border-gray-300 hover:border-[#332e28] active:scale-95 transition py-3 rounded-[12px] font-['Poppins'] font-medium text-base text-[#332e28]"
            onClick={onClose}
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
