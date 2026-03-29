import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "./HeroSection";
import {
  ServicesSection,
  FeaturedWorksSection,
  CTASection,
  FAQSection,
} from "./LandingSections";
import { useApp } from "@/context/AppContext";

// Lazy-load the brochure modal so it doesn't bloat the initial bundle
import { lazy, Suspense } from "react";
const RenovationBrochureModal = lazy(
  () => import("@/components/pages/RenovationBrochureModal")
);

export default function LandingPage() {
  const { setCurrentPage, navigateTo, isLoggedIn } = useApp();
  const [showBrochure, setShowBrochure] = useState(false);

  function handleShopNow() {
    if (isLoggedIn) {
      setCurrentPage("newProject");
    } else {
      setCurrentPage("login");
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection onShopNow={handleShopNow} />
        <ServicesSection
          onShopNow={handleShopNow}
          onBrochureOpen={() => setShowBrochure(true)}
        />
        <FeaturedWorksSection onViewAll={() => setCurrentPage("portfolio")} />
        <CTASection onStartProject={handleShopNow} />
        <FAQSection />
      </main>
      <Footer
        onAdminClick={() => navigateTo("admin", true)}
        onPrivacyClick={() => setCurrentPage("privacy")}
        onTermsClick={() => setCurrentPage("terms")}
      />

      {showBrochure && (
        <Suspense fallback={null}>
          <RenovationBrochureModal
            onClose={() => setShowBrochure(false)}
            onGetQuote={() => {
              setShowBrochure(false);
              handleShopNow();
            }}
          />
        </Suspense>
      )}
    </div>
  );
}
