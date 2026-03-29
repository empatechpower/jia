import { useState } from "react";
import Logo from "@/components/common/Logo";
import { HamburgerIcon } from "@/assets/icons";

interface HeaderPublicProps {
  onLoginClick: () => void;
  onHomeClick: () => void;
  onPortfolioClick: () => void;
  onAboutClick: () => void;
}

const NAV_LINK_CLASS =
  "capitalize font-['Poppins'] font-medium text-base text-white hover:opacity-80 transition";

export default function HeaderPublic({
  onLoginClick,
  onHomeClick,
  onPortfolioClick,
  onAboutClick,
}: HeaderPublicProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  function closeMenu() {
    setMobileOpen(false);
  }

  return (
    <header className="absolute top-0 left-0 w-full z-50">
      <div className="relative h-[80px] md:h-[120px]">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

        <div className="relative flex items-center justify-between h-full px-4 md:px-8 lg:px-[76px] max-w-[1280px] mx-auto">
          <button
            aria-label="Go home"
            className="hover:opacity-80 transition"
            onClick={onHomeClick}
          >
            <Logo variant="light" />
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-[66px]" aria-label="Main navigation">
            <button className={NAV_LINK_CLASS} onClick={onHomeClick}>
              Home
            </button>
            <button className={NAV_LINK_CLASS} onClick={onPortfolioClick}>
              Our Portfolio
            </button>
            <button className={NAV_LINK_CLASS} onClick={onAboutClick}>
              About Us
            </button>
            <button
              className="bg-white/30 hover:bg-white/40 transition px-6 py-2 rounded-[20px] capitalize font-['Poppins'] font-medium text-base text-white"
              onClick={onLoginClick}
            >
              Log In / Sign Up
            </button>
          </nav>

          {/* Mobile menu toggle */}
          <button
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <HamburgerIcon isOpen={mobileOpen} />
          </button>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <nav
            aria-label="Mobile navigation"
            className="md:hidden absolute top-full left-0 w-full bg-[#332e28] shadow-lg"
          >
            <ul className="flex flex-col p-4 gap-2">
              {[
                { label: "Home", action: onHomeClick },
                { label: "Our Portfolio", action: onPortfolioClick },
                { label: "About Us", action: onAboutClick },
              ].map(({ label, action }) => (
                <li key={label}>
                  <button
                    className="w-full text-left py-2 capitalize font-['Poppins'] font-medium text-base text-white hover:opacity-80 transition"
                    onClick={() => {
                      action();
                      closeMenu();
                    }}
                  >
                    {label}
                  </button>
                </li>
              ))}
              <li>
                <button
                  className="w-full bg-white/30 hover:bg-white/40 transition px-6 py-2 rounded-[20px] capitalize font-['Poppins'] font-medium text-base text-white mt-2"
                  onClick={() => {
                    onLoginClick();
                    closeMenu();
                  }}
                >
                  Log In / Sign Up
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
