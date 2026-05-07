import { useState } from "react";
import Logo from "@/components/common/Logo";
import {
  CartIconWithBadge,
  ChevronDown,
  HamburgerIcon,
  HomeNavIcon,
  LogoutIcon,
  MessageIcon,
  UserIcon,
} from "@/assets/icons";

interface HeaderAuthProps {
  userEmail: string;
  cartItemCount: number;
  onHomeClick: () => void;
  onPortfolioClick: () => void;
  onAboutClick: () => void;
  onCartClick: () => void;
  onProfileClick: () => void;
  onLogout: () => void;
}

const NAV_BTN_CLASS =
  "capitalize font-['Poppins'] font-medium text-base text-white hover:opacity-80 transition";

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function MenuItem({ icon, label, onClick }: MenuItemProps) {
  return (
    <button
      className="w-full px-4 py-3 text-left hover:bg-gray-100 transition flex items-center gap-3"
      onClick={onClick}
    >
      {icon}
      <span className="font-['Poppins'] text-sm text-[#1C1B1F]">{label}</span>
    </button>
  );
}

export default function HeaderAuth({
  userEmail,
  cartItemCount,
  onHomeClick,
  onPortfolioClick,
  onAboutClick,
  onCartClick,
  onProfileClick,
  onLogout,
}: HeaderAuthProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  function closeAll() {
    setUserMenuOpen(false);
    setMobileOpen(false);
  }

  const dropdownItems: MenuItemProps[] = [
    { icon: <UserIcon />, label: "View Profile", onClick: onProfileClick },
    { icon: <HomeNavIcon />, label: "Home", onClick: onHomeClick },
    { icon: <MessageIcon />, label: "Messages", onClick: () => {} },
    { icon: <LogoutIcon />, label: "Log out", onClick: onLogout },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-gradient-to-b from-black/100 to-black/0">
      <div className="relative h-[80px] md:h-[120px]">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

        <div className="relative flex items-center justify-between h-full px-4 md:px-8 lg:px-[76px] max-w-[1280px] mx-auto">
          <button
            aria-label="Go home"
            className="hover:opacity-80 transition"
            onClick={onHomeClick}
          >
            <Logo variant="light" className="w-[80px] h-[80px]" />
          </button>

          {/* Desktop nav */}
          <nav
            className="hidden md:flex items-center gap-8 lg:gap-[66px]"
            aria-label="Main navigation"
          >
            <button className={NAV_BTN_CLASS} onClick={onHomeClick}>
              Home
            </button>
            <button className={NAV_BTN_CLASS} onClick={onPortfolioClick}>
              Our Portfolio
            </button>
            <button className={NAV_BTN_CLASS} onClick={onAboutClick}>
              About Us
            </button>

            <button
              aria-label={`Shopping cart, ${cartItemCount} items`}
              className="p-2 hover:opacity-80 transition"
              onClick={onCartClick}
            >
              <CartIconWithBadge count={cartItemCount} color="#FFFFFF" />
            </button>

            {/* User dropdown */}
            <div className="relative">
              <button
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
                className="bg-[#70685e] hover:bg-white/40 transition px-6 py-2 rounded-[20px] font-['Poppins'] font-medium text-base text-white flex items-center gap-2"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <span className="max-w-[160px] truncate">{userEmail}</span>
                <ChevronDown
                  className={`transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 py-2"
                  role="menu"
                >
                  {dropdownItems.map((item) => (
                    <MenuItem
                      key={item.label}
                      {...item}
                      onClick={() => {
                        item.onClick();
                        setUserMenuOpen(false);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Mobile controls */}
          <div className="md:hidden flex items-center gap-3">
            <button
              aria-label={`Cart, ${cartItemCount} items`}
              className="p-2 hover:opacity-80 transition"
              onClick={onCartClick}
            >
              <CartIconWithBadge count={cartItemCount} color="#FFFFFF" />
            </button>
            <button
              aria-expanded={mobileOpen}
              aria-label="Toggle navigation"
              className="p-2 text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <HamburgerIcon isOpen={mobileOpen} />
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <nav
            aria-label="Mobile navigation"
            className="md:hidden absolute top-full left-0 w-full bg-[#332e28] shadow-lg"
          >
            <div className="px-4 py-3 border-b border-white/20">
              <p className="font-['Poppins'] text-sm text-white font-medium truncate">
                {userEmail}
              </p>
            </div>
            <ul className="flex flex-col p-4 gap-2">
              {[
                { label: "Home", action: onHomeClick },
                { label: "Our Portfolio", action: onPortfolioClick },
                { label: "About Us", action: onAboutClick },
                { label: "View Profile", action: onProfileClick },
                { label: "Log out", action: onLogout },
              ].map(({ label, action }) => (
                <li key={label}>
                  <button
                    className="w-full text-left py-2 capitalize font-['Poppins'] font-medium text-base text-white hover:opacity-80 transition"
                    onClick={() => {
                      action();
                      closeAll();
                    }}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
