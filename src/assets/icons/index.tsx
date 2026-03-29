// ─── Cart Icon ────────────────────────────────────────────────────────────────

const CART_PATH =
  "M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zM7.17 14.75l.03.12L8.1 17h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 20 8H5.21l-.94-2H1v2h2l3.6 7.59L5.25 17c-.16.28-.25.61-.25.96C5 19.1 5.9 20 7 20h13v-2H7.42c-.13 0-.25-.11-.25-.25z";

interface CartIconProps {
  color?: string;
  size?: number;
}

export function CartIcon({ color = "#1C1B1F", size = 24 }: CartIconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <path d={CART_PATH} fill={color} />
    </svg>
  );
}

// ─── Cart Icon With Badge ────────────────────────────────────────────────────

interface CartBadgeProps extends CartIconProps {
  count: number;
}

export function CartIconWithBadge({
  count,
  color = "#1C1B1F",
  size = 24,
}: CartBadgeProps) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <CartIcon color={color} size={size} />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-[#7b7267] text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1 leading-none">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </div>
  );
}

// ─── User Icon ────────────────────────────────────────────────────────────────

export function UserIcon({ size = 20 }: { size?: number }) {
  return (
    <div
      className="bg-[#E5E5E5] rounded-full flex items-center justify-center shrink-0"
      style={{ width: size + 12, height: size + 12 }}
    >
      <svg fill="#1C1B1F" height={size} viewBox="0 0 24 24" width={size}>
        <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" />
      </svg>
    </div>
  );
}

// ─── Chevron Down ─────────────────────────────────────────────────────────────

export function ChevronDown({
  className = "",
  size = 16,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      className={className}
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      width={size}
    >
      <path d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// ─── Hamburger / X ────────────────────────────────────────────────────────────

export function HamburgerIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      {isOpen ? (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      ) : (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      )}
    </svg>
  );
}

// ─── Nav Menu Icons ───────────────────────────────────────────────────────────

export function HomeNavIcon() {
  return (
    <svg className="w-5 h-5" fill="#8B7355" viewBox="0 0 24 24">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );
}

export function LogoutIcon() {
  return (
    <svg className="w-5 h-5" fill="#8B7355" viewBox="0 0 24 24">
      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
    </svg>
  );
}

export function MessageIcon() {
  return (
    <svg className="w-5 h-5" fill="#8B7355" viewBox="0 0 24 24">
      <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
    </svg>
  );
}
