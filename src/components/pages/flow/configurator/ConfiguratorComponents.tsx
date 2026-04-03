import type { ReactNode } from "react";

// Check icon (green, shown when section is complete)
function CheckIcon() {
  return (
    <svg
      className="w-4 h-4 text-green-500 shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        d="M5 13l4 4L19 7"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
      />
    </svg>
  );
}

// Chevron icon
function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-5 h-5 text-[#414042] shrink-0 transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        d="M19 9l-7 7-7-7"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  );
}

// ─── Pill button ─────────────────────────────────────────────────────────────

interface PillProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  className?: string;
}

export function Pill({ label, selected, onClick, className = "" }: PillProps) {
  return (
    <button
      className={`px-4 py-3 rounded-2xl font-['Poppins'] font-bold text-sm text-left transition-all ${
        selected
          ? "bg-[#414042] text-white shadow-md"
          : "bg-[#ebebeb] text-[#414042] hover:bg-[#d0d0d0]"
      } ${className}`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

// ─── Accordion ───────────────────────────────────────────────────────────────

interface AccordionProps {
  id: string;
  title: string;
  subtitle?: string;
  isOpen: boolean;
  isComplete?: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export function Accordion({
  id,
  title,
  subtitle,
  isOpen,
  isComplete,
  onToggle,
  children,
}: AccordionProps) {
  return (
    <div className="border border-[#e0e0e0] rounded-lg bg-white overflow-hidden shadow-sm">
      {/* Header button */}
      <button
        aria-controls={`accordion-body-${id}`}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition text-left"
        onClick={onToggle}
        type="button"
      >
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="font-['Poppins'] font-bold text-sm text-[#242424]">
            {title}
          </span>
          {subtitle && (
            <span className="font-['Poppins'] text-xs text-[#666] truncate">
              {subtitle}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {isComplete && <CheckIcon />}
          <ChevronIcon open={isOpen} />
        </div>
      </button>

      {/* Body */}
      {isOpen && (
        <div className="px-4 pb-4 pt-1" id={`accordion-body-${id}`}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Horizontal scroll container (for colour/handle swatches) ────────────────

export function SwatchRow({ children }: { children: ReactNode }) {
  return (
    <div
      className="overflow-x-auto pb-2 -mx-1 px-1"
      style={{ scrollbarWidth: "thin" }}
    >
      <div className="flex gap-3 w-max">{children}</div>
    </div>
  );
}

// ─── Colour swatch card ───────────────────────────────────────────────────────

interface ColorSwatchProps {
  name: string;
  code: string;
  hex: string;
  imageUrl?: string;
  selected?: boolean;
  onSelect: () => void;
  onViewImage: () => void;
}

export function ColorSwatch({
  name,
  code,
  hex,
  imageUrl,
  selected = false,
  onSelect,
  onViewImage,
}: ColorSwatchProps) {
  return (
    <div
      className={`flex-shrink-0 flex flex-col items-center rounded-lg border-2 overflow-hidden transition cursor-pointer ${
        selected
          ? "border-[#414042]"
          : "border-[#e0e0e0] hover:border-[#b0b0b0]"
      }`}
      style={{ width: 160 }}
      onClick={onSelect}
    >
      {/* Color / Image block */}
      <div
        className="w-full bg-center bg-cover"
        style={{
          height: 130,
          backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
          backgroundColor: !imageUrl ? hex : undefined,
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      />

      {/* Label */}
      <div className="px-2 py-2 w-full text-center">
        <p className="font-['Poppins'] font-bold text-xs text-[#242424] leading-tight">
          {name}
        </p>
        <p className="font-['Poppins'] text-xs text-[#666]">({code})</p>
      </div>

      {/* View image button */}
      <button
        type="button"
        className="w-full bg-[#242424] hover:bg-[#414042] transition text-white font-['Poppins'] text-xs py-2"
        onClick={(e) => {
          e.stopPropagation();
          onViewImage();
        }}
      >
        View Image
      </button>
    </div>
  );
}

// ─── Image swatch card (handles, finishings) ──────────────────────────────────

interface ImageSwatchProps {
  name: string;
  imageUrl: string;
  selected: boolean;
  onSelect: () => void;
  onZoom?: () => void;
}

export function ImageSwatch({
  name,
  imageUrl,
  selected,
  onSelect,
  onZoom,
}: ImageSwatchProps) {
  return (
    <button
      className={`flex-shrink-0 flex flex-col items-center rounded-lg border-2 overflow-hidden transition ${
        selected
          ? "border-[#414042] bg-[#f5f5f5] shadow-md"
          : "border-[#e0e0e0] bg-white hover:border-[#b0b0b0]"
      }`}
      onClick={onSelect}
      style={{ width: 130 }}
      type="button"
    >
      <div
        className="w-full overflow-hidden"
        style={{ height: 100 }}
        onClick={(e) => {
          if (onZoom) {
            e.stopPropagation();
            onZoom();
          }
        }}
      >
        <img
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
          src={imageUrl}
        />
      </div>
      <p className="font-['Poppins'] font-bold text-xs text-[#242424] text-center px-2 py-2 leading-tight">
        {name}
      </p>
    </button>
  );
}
