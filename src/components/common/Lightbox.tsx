import { useEffect, useCallback } from "react";

interface LightboxImage {
  url: string;
  alt: string;
  id?: string; // the color/item _id — used to set selection on close
}

interface LightboxProps {
  images: LightboxImage[]; // full list (all colors, or gallery images)
  index: number; // which one is currently open
  onIndexChange: (i: number) => void;
  onClose: () => void;
  /** Called with the id of the image that was last viewed, so you can auto-select it */
  onSelect?: (id: string) => void;
}

export function Lightbox({
  images,
  index,
  onIndexChange,
  onClose,
  onSelect,
}: LightboxProps) {
  const current = images[index];
  const hasPrev = index > 0;
  const hasNext = index < images.length - 1;

  const goPrev = useCallback(() => {
    if (hasPrev) onIndexChange(index - 1);
  }, [hasPrev, index, onIndexChange]);

  const goNext = useCallback(() => {
    if (hasNext) onIndexChange(index + 1);
  }, [hasNext, index, onIndexChange]);

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        handleClose();
      }
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  // When the lightbox closes, auto-select the last-viewed image
  function handleClose() {
    if (onSelect && current?.id) {
      onSelect(current.id);
    }
    onClose();
  }

  if (!current) return null;

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
      role="dialog"
      onClick={handleClose}
    >
      {/* Card */}
      <div
        className="relative bg-white rounded-2xl overflow-hidden max-w-lg w-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          aria-label="Close"
          className="absolute top-3 right-3 z-10 p-1.5 bg-black/10 hover:bg-black/20 rounded-full transition text-[#242424]"
          onClick={handleClose}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M6 18L18 6M6 6l12 12"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        </button>

        {/* Image */}
        <div className="relative bg-[#f5f5f5] flex items-center justify-center min-h-[300px] max-h-[60vh]">
          <img
            alt={current.alt}
            className="max-w-full max-h-[60vh] object-contain"
            src={current.url}
          />

          {/* Prev arrow */}
          {hasPrev && (
            <button
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-md transition"
              onClick={goPrev}
            >
              <svg
                className="w-5 h-5 text-[#242424]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M15 19l-7-7 7-7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </button>
          )}

          {/* Next arrow */}
          {hasNext && (
            <button
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-md transition"
              onClick={goNext}
            >
              <svg
                className="w-5 h-5 text-[#242424]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 18l6-6-6-6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </button>
          )}
        </div>

        {/* Caption + counter + select button */}
        <div className="px-5 py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-['Poppins'] font-semibold text-sm text-[#242424] truncate">
              {current.alt}
            </p>
            <p className="font-['Poppins'] text-xs text-[#999] mt-0.5">
              {index + 1} / {images.length}
            </p>
          </div>

          {/* Select this colour button */}
          {onSelect && current.id && (
            <button
              className="shrink-0 px-4 py-2 bg-[#414042] hover:bg-[#242424] active:scale-95 transition rounded-lg font-['Poppins'] font-semibold text-sm text-white"
              onClick={() => {
                onSelect(current.id!);
                onClose();
              }}
            >
              Select
            </button>
          )}
        </div>

        {/* Dot indicators */}
        {images.length > 1 && (
          <div className="flex justify-center gap-1.5 pb-4">
            {images.map((_, i) => (
              <button
                aria-label={`Go to image ${i + 1}`}
                className={`rounded-full transition-all ${
                  i === index
                    ? "w-5 h-2 bg-[#414042]"
                    : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
                }`}
                key={i}
                onClick={() => onIndexChange(i)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
