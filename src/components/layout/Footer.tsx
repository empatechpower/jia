import Logo from "@/components/common/Logo";
import { BRAND } from "@/constants";

interface FooterProps {
  onTermsClick?: () => void;
  onPrivacyClick?: () => void;
  onAdminClick?: () => void;
}

export default function Footer({
  onTermsClick,
  onPrivacyClick,
  onAdminClick,
}: FooterProps) {
  return (
    <footer className="bg-[#332e28] text-white py-12 md:py-16 px-4 md:px-8 lg:px-[76px]">
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          <Logo variant="light" className="w-[80px] h-[80px]" />
          <p className="mt-4 font-['Poppins'] text-sm">{BRAND.tagline}.</p>
        </div>

        {/* Quick links */}
        <nav aria-label="Footer navigation">
          <h3 className="font-['Poppins'] font-bold text-lg mb-4">
            Quick Links
          </h3>
          <ul className="flex flex-col gap-2">
            {[
              { href: "#services", label: "Services" },
              { href: "#portfolio", label: "Our Works" },
              { href: "#about", label: "About Us" },
            ].map(({ href, label }) => (
              <li key={label}>
                <a
                  className="font-['Poppins'] text-sm hover:opacity-70 transition"
                  href={href}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact */}
        <div>
          <h3 className="font-['Poppins'] font-bold text-lg mb-4">Contact</h3>
          <address className="not-italic font-['Poppins'] text-sm leading-relaxed">
            <a
              className="hover:opacity-70 transition block"
              href={`mailto:${BRAND.email}`}
            >
              {BRAND.email}
            </a>
            <a
              className="hover:opacity-70 transition block mt-1"
              href={`tel:${BRAND.phone.replace(/\s/g, "")}`}
            >
              {BRAND.phone}
            </a>
          </address>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-[1280px] mx-auto mt-8 pt-8 border-t border-white/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-['Poppins'] text-sm">
            © {BRAND.year} {BRAND.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {onTermsClick && (
              <button
                className="font-['Poppins'] text-sm hover:opacity-70 transition underline"
                onClick={onTermsClick}
              >
                Terms & Conditions
              </button>
            )}
            {onPrivacyClick && (
              <button
                className="font-['Poppins'] text-sm hover:opacity-70 transition underline"
                onClick={onPrivacyClick}
              >
                Privacy Policy
              </button>
            )}
            {onAdminClick && (
              <button
                className="font-['Poppins'] text-xs text-white/30 hover:text-white/60 transition"
                onClick={onAdminClick}
              >
                Admin
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
