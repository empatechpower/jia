import { lazy, Suspense } from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import LandingPage from "@/components/pages/landing/LandingPage";
import LoginPage from "@/components/pages/LoginPage";

// ─── Lazy-loaded pages (code-split by route) ──────────────────────────────────
const AboutUsPage = lazy(() => import("@/components/pages/AboutUsPage"));
const PortfolioPage = lazy(() => import("@/components/pages/PortfolioPage"));
const WorkDetailsPage = lazy(
  () => import("@/components/pages/WorkDetailsPage"),
);
const NewProjectPage = lazy(() => import("@/components/pages/NewProjectPage"));

// Product-selection flow (authenticated users only)
const AreaSelectionPage = lazy(
  () => import("@/components/pages/flow/AreaSelectionPage"),
);
const RoomSelectionPage = lazy(
  () => import("@/components/pages/flow/RoomSelectionPage"),
);
const SeriesSelectionPage = lazy(
  () => import("@/components/pages/flow/SeriesSelectionPage"),
);
const ProductSelectionPage = lazy(
  () => import("@/components/pages/flow/ProductSelectionPage"),
);
const ProductDetailsPage = lazy(
  () => import("@/components/pages/flow/ProductDetailsPage"),
);

// AdminPage with graceful fallback when the file isn't yet present
const AdminPage = () => (
  <div className="min-h-screen flex items-center justify-center font-['Poppins'] text-[#666]">
    Admin page coming soon.
  </div>
);

// ─── Loading indicator ────────────────────────────────────────────────────────

function PageLoader() {
  return (
    <div
      aria-label="Loading"
      className="min-h-screen flex items-center justify-center"
      role="status"
    >
      <div className="w-8 h-8 border-2 border-[#332e28] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// ─── Helper: lazy-load a named export from a module ──────────────────────────

function lazyNamed<T extends object>(loader: () => Promise<T>, key: keyof T) {
  return lazy(() =>
    loader().then((mod) => ({ default: mod[key] as React.ComponentType })),
  );
}

const ShoppingCartPage = lazyNamed(
  () => import("@/components/pages/TransactionalPages"),
  "ShoppingCartPage",
);
const CheckoutPage = lazyNamed(
  () => import("@/components/pages/TransactionalPages"),
  "CheckoutPage",
);
const ProfilePage = lazyNamed(
  () => import("@/components/pages/TransactionalPages"),
  "ProfilePage",
);
const TermsAndConditionsPage = lazyNamed(
  () => import("@/components/pages/LegalPages"),
  "TermsAndConditionsPage",
);
const PrivacyPolicyPage = lazyNamed(
  () => import("@/components/pages/LegalPages"),
  "PrivacyPolicyPage",
);

// ─── Router ───────────────────────────────────────────────────────────────────

function Router() {
  const { currentPage } = useApp();

  const routes: Partial<Record<typeof currentPage, React.ReactNode>> = {
    landing: <LandingPage />,
    login: <LoginPage />,
    aboutUs: <AboutUsPage />,
    portfolio: <PortfolioPage />,
    workDetails: <WorkDetailsPage />,
    newProject: <NewProjectPage />,
    areaSelection: <AreaSelectionPage />,
    roomSelection: <RoomSelectionPage />,
    seriesSelection: <SeriesSelectionPage />,
    productSelection: <ProductSelectionPage />,
    productDetails: <ProductDetailsPage />,
    cart: <ShoppingCartPage />,
    checkout: <CheckoutPage />,
    profile: <ProfilePage />,
    terms: <TermsAndConditionsPage />,
    privacy: <PrivacyPolicyPage />,
    admin: <AdminPage />,
  };

  return (
    <Suspense fallback={<PageLoader />}>
      {routes[currentPage] ?? <LandingPage />}
    </Suspense>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}
