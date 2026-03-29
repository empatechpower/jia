# JIA Ideas — Production-Ready React App

Refactored from Figma-exported code into a clean, maintainable architecture.

---

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS** (utility-first styling)
- **Fonts:** Poppins · DM Sans · Playfair Display (via Google Fonts)

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev

# 3. Build for production
npm run build

# 4. Type-check without building
npm run typecheck
```

---

## Project Structure

```
src/
├── App.tsx                     ← Root + client-side router
├── main.tsx                    ← React DOM entry point
│
├── types/                      ← All shared TypeScript interfaces
│   └── index.ts
│
├── constants/                  ← Brand tokens, name maps, discount rates
│   └── index.ts
│
├── utils/                      ← Pure helper functions (pricing, formatting)
│   └── index.ts
│
├── config/
│   └── kitchenPricing.ts       ← Cabinet pricing data + helper fns
│
├── context/
│   └── AppContext.tsx           ← Single source of truth (React Context + useApp hook)
│
├── assets/
│   └── icons/index.tsx         ← All SVG icons as typed React components
│
├── styles/
│   └── index.css               ← Tailwind base + global resets
│
└── components/
    ├── common/
    │   └── Logo.tsx            ← Reusable logo (light / dark variant)
    │
    ├── layout/
    │   ├── Header.tsx          ← Smart header (picks auth vs public variant)
    │   ├── HeaderPublic.tsx    ← Unauthenticated navigation
    │   ├── HeaderAuth.tsx      ← Authenticated navigation (cart, user menu)
    │   └── Footer.tsx
    │
    └── pages/
        ├── landing/
        │   ├── LandingPage.tsx
        │   ├── HeroSection.tsx
        │   └── LandingSections.tsx  ← Services, Works, CTA, FAQ
        │
        ├── flow/                    ← Authenticated product-selection flow
        │   ├── AreaSelectionPage.tsx
        │   ├── RoomSelectionPage.tsx
        │   ├── SeriesSelectionPage.tsx
        │   ├── ProductSelectionPage.tsx
        │   └── ProductDetailsPage.tsx
        │
        ├── LoginPage.tsx
        ├── AboutUsPage.tsx
        ├── PortfolioPage.tsx
        ├── WorkDetailsPage.tsx
        ├── NewProjectPage.tsx
        ├── RenovationBrochureModal.tsx
        ├── LegalPages.tsx           ← TermsAndConditionsPage + PrivacyPolicyPage
        ├── TransactionalPages.tsx   ← ShoppingCartPage + CheckoutPage + ProfilePage
        └── AdminPage.tsx            ← (implement separately)
```

---

## Key Architecture Decisions

### 1. Single Context (`AppContext`)
All app state lives in one provider. Components call `useApp()` — zero prop drilling.

```tsx
const { cartItems, setCurrentPage, handleLogin } = useApp();
```

### 2. Client-side routing (no React Router)
`currentPage` in context drives which component renders. For a larger app, swap this for React Router with lazy-loaded routes — the page components are already lazy-loaded and will work as-is.

### 3. Route-level code splitting
Every page is `lazy()`-loaded. The initial bundle only contains the landing page and login. All other pages load on demand.

### 4. Typed constants — no magic strings
Product names, series names, discount rates, and brand info are all in `src/constants/index.ts`. One change propagates everywhere.

### 5. Pure utility functions
`calculateProductPrice`, `resolveProductName`, `formatPrice` etc. live in `src/utils/index.ts` and are easily unit-testable.

---

## Asset Migration

The original Figma export used `figma:asset/...` imports, which only work inside Figma's build tool. Replace these with:

```
/public/images/
  hero-background.jpg
  about-hero.jpg
  login-hero.jpg
  cta-background.jpg
  services/
    modular-carpentry.jpg
    renovation-package.jpg
    renovation-service.jpg
    products.jpg
  works/
    modern-kitchen.jpg
    modern-living-room.jpg
    bathroom-renovation.jpg
  product-placeholder.jpg
```

For production, host images on a CDN (Cloudflare Images, AWS S3 + CloudFront, etc.) and replace the `/images/...` paths with CDN URLs via an environment variable:

```ts
const CDN = import.meta.env.VITE_CDN_URL ?? "";
const HERO = `${CDN}/hero-background.jpg`;
```

---

## Authentication

`LoginPage.tsx` currently calls `handleLogin(email)` directly — a stub.
Replace with your real auth provider:

```ts
// Firebase example
import { signInWithEmailAndPassword } from "firebase/auth";

async function handleSubmit(e) {
  e.preventDefault();
  const cred = await signInWithEmailAndPassword(auth, email, password);
  handleLogin(cred.user.email!);
}
```

---

## To-do (next steps)

- [ ] Plug in real auth (Firebase / Supabase / Auth.js)
- [ ] Replace `/images/...` paths with CDN URLs
- [ ] Add React Query / SWR for API data fetching
- [ ] Implement `AdminPage.tsx`
- [ ] Add unit tests for `utils/index.ts` and `config/kitchenPricing.ts`
- [ ] Add E2E tests for the checkout flow (Playwright recommended)
- [ ] Set up CI/CD (GitHub Actions → Vercel / Netlify)
