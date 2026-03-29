import { useState } from "react";

// ─── Image URL constants (replace with real assets or env vars) ───────────────
const IMG = {
  modularCarpentry: "/images/services/modular-carpentry.jpg",
  renovationPackage: "/images/services/renovation-package.jpg",
  renovationService: "/images/services/renovation-service.jpg",
  products: "/images/services/products.jpg",
  modernKitchen: "/images/works/modern-kitchen.jpg",
  modernLivingRoom: "/images/works/modern-living-room.jpg",
  bathroomRenovation: "/images/works/bathroom-renovation.jpg",
  ctaBg: "/images/cta-background.jpg",
};

// ─── Services ────────────────────────────────────────────────────────────────

interface ServiceItem {
  img: string;
  title: string;
  description: string;
  badge?: { label: string; color: string };
  discountBadge?: string;
  onClick?: () => void;
}

interface ServiceCardProps extends ServiceItem {}

function ServiceCard({
  img,
  title,
  description,
  badge,
  discountBadge,
  onClick,
}: ServiceCardProps) {
  const isClickable = !!onClick;
  return (
    <button
      className={`flex flex-col gap-4 text-left w-full ${isClickable ? "cursor-pointer group" : "cursor-default"}`}
      disabled={!isClickable}
      onClick={onClick}
    >
      <div className="relative w-full aspect-square rounded-bl-[24px] rounded-tr-[24px] shadow-[0px_0px_17px_2px_rgba(0,0,0,0.25)] overflow-hidden">
        <img
          alt={title}
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-300 ${isClickable ? "group-hover:scale-105" : ""}`}
          loading="lazy"
          src={img}
        />
        {discountBadge && (
          <div className="absolute top-3 left-3">
            <span className="bg-[#e74c3c] text-white font-['Poppins'] font-bold text-[10px] px-2.5 py-1 rounded-full shadow">
              {discountBadge}
            </span>
          </div>
        )}
        {badge && (
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            <span className="bg-[#e74c3c] text-white font-['Poppins'] font-bold text-[10px] px-2.5 py-1 rounded-full shadow">
              🔥 Promo
            </span>
            <span className="bg-[#332e28] text-white font-['Poppins'] text-[10px] font-semibold px-2.5 py-1 rounded-full shadow">
              {badge.label}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <p className="capitalize font-['DM_Sans'] font-bold text-[#383838] text-xl md:text-2xl">
          {title}
        </p>
        <p className="font-['DM_Sans'] text-[#383838] text-sm md:text-base">
          {description}
        </p>
      </div>
    </button>
  );
}

interface ServicesSectionProps {
  onShopNow: () => void;
  onBrochureOpen: () => void;
}

export function ServicesSection({ onShopNow, onBrochureOpen }: ServicesSectionProps) {
  const services: ServiceItem[] = [
    {
      img: IMG.modularCarpentry,
      title: "Modular Carpentry",
      description: "Modern regrades and redesigns",
      discountBadge: "🏷️ 20% Off",
      onClick: onShopNow,
    },
    {
      img: IMG.renovationPackage,
      title: "Renovation Package",
      description: "Contemporary updates and fresh designs",
      badge: { label: "Up to 30% off", color: "#e74c3c" },
      onClick: onBrochureOpen,
    },
    {
      img: IMG.renovationService,
      title: "Renovation Service",
      description: "Individual modern & fresh designs",
    },
    {
      img: IMG.products,
      title: "Products",
      description: "Pieces of your homes, fresh out of the workshop",
    },
  ];

  return (
    <section
      aria-label="Our Services"
      className="bg-[#faf4e6] py-12 md:py-16 lg:py-[42px] px-4 md:px-8 lg:px-[76px]"
      id="services"
    >
      <div className="max-w-[1280px] mx-auto">
        <header className="mb-6 md:mb-10">
          <h2 className="capitalize font-['Poppins'] font-bold text-2xl md:text-3xl lg:text-[28px] text-[#383838] mb-3">
            Our Services
          </h2>
          <p className="font-['DM_Sans'] text-[#383838] text-sm md:text-base max-w-3xl">
            From custom carpentry to complete renovations, we bring your vision
            to life with expert craftsmanship and attention to detail.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {services.map((service) => (
            <ServiceCard key={service.title} {...service} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Featured Works ───────────────────────────────────────────────────────────

interface Work {
  img: string;
  title: string;
  location: string;
}

interface FeaturedWorksSectionProps {
  onViewAll: () => void;
}

const FEATURED_WORKS: Work[] = [
  { img: IMG.modernKitchen, title: "Modern Kitchen", location: "Barker Rd" },
  { img: IMG.modernLivingRoom, title: "Modern Living Room", location: "Jalan Leban" },
  { img: IMG.bathroomRenovation, title: "Bathroom Renovation", location: "Faber Walk" },
];

export function FeaturedWorksSection({ onViewAll }: FeaturedWorksSectionProps) {
  return (
    <section
      aria-label="Featured Works"
      className="bg-[#fffdf1] py-12 md:py-16 lg:py-[42px] px-4 md:px-8 lg:px-[76px]"
      id="portfolio"
    >
      <div className="max-w-[1280px] mx-auto">
        <header className="mb-6 md:mb-10">
          <div className="flex items-start justify-between mb-3">
            <h2 className="capitalize font-['Poppins'] font-bold text-2xl md:text-3xl lg:text-[28px] text-[#383838]">
              Our Featured Works
            </h2>
            <button
              className="capitalize font-['Poppins'] text-sm md:text-base text-[#7b7267] hover:text-[#675f56] transition underline whitespace-nowrap"
              onClick={onViewAll}
            >
              View All
            </button>
          </div>
          <p className="font-['DM_Sans'] text-[#383838] text-sm md:text-base max-w-3xl">
            Discover our portfolio of beautifully crafted spaces that showcase
            our commitment to quality and design excellence.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-[48px]">
          {FEATURED_WORKS.map((work) => (
            <div className="flex flex-col gap-4" key={work.title}>
              <div className="relative w-full aspect-square rounded-bl-[24px] rounded-tr-[24px] shadow-[0px_0px_17px_2px_rgba(0,0,0,0.25)] overflow-hidden">
                <img
                  alt={work.title}
                  className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  src={work.img}
                />
              </div>
              <div className="flex flex-col gap-1">
                <p className="capitalize font-['DM_Sans'] font-bold text-[#383838] text-lg md:text-[22px]">
                  {work.title}
                </p>
                <p className="font-['DM_Sans'] text-[#383838] text-sm md:text-base">
                  {work.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ─────────────────────────────────────────────────────────────────────

interface CTASectionProps {
  onStartProject: () => void;
}

export function CTASection({ onStartProject }: CTASectionProps) {
  return (
    <section
      aria-label="Call to action"
      className="py-12 md:py-16 lg:py-[42px] px-4 md:px-8 lg:px-[76px]"
    >
      <div className="max-w-[1280px] mx-auto">
        <div className="relative h-[250px] md:h-[310px] overflow-hidden rounded-lg">
          <img
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            src={IMG.ctaBg}
          />
          <div className="absolute inset-0 bg-[rgba(78,63,44,0.5)]" />
          <div className="relative flex flex-col items-center justify-center h-full gap-4 md:gap-6 text-center px-4">
            <p className="font-['DM_Sans'] text-white text-lg md:text-xl max-w-2xl">
              Ready to transform your space?
              <br />
              Let's get your project up and running today.
            </p>
            <button
              className="bg-[#332e28] hover:bg-[#2a2622] active:scale-95 transition px-6 py-3 rounded-[12px] capitalize font-['Poppins'] font-medium text-base md:text-lg text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              onClick={onStartProject}
            >
              Start Your Project
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: "What services do you offer?",
    a: "We offer complete design and renovation services including carpentry, electrical work, painting, plumbing, tiling, and demolition.",
  },
  {
    q: "How long does a typical project take?",
    a: "Project timelines vary depending on the scope of work. A typical renovation can take anywhere from 4–12 weeks.",
  },
  {
    q: "Do you provide warranties?",
    a: "Yes, we provide comprehensive warranties on all our work to ensure your peace of mind.",
  },
  {
    q: "Can I customise my design?",
    a: "Absolutely! We work closely with you to create a design that matches your vision and requirements.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      aria-label="FAQ"
      className="py-12 md:py-16 lg:py-20 px-4 md:px-8 lg:px-[76px] max-w-[1280px] mx-auto"
    >
      <h2 className="uppercase font-['Poppins'] font-bold text-2xl md:text-3xl lg:text-[40px] text-[#1d1d1d] mb-8 md:mb-12">
        FAQ
      </h2>
      <dl className="space-y-0">
        {FAQ_ITEMS.map((faq, i) => (
          <div className="border-b border-gray-200" key={faq.q}>
            <dt>
              <button
                aria-controls={`faq-answer-${i}`}
                aria-expanded={openIndex === i}
                className="w-full flex justify-between items-center py-4 text-left hover:opacity-70 transition"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span className="font-['Poppins'] font-medium text-base md:text-lg text-[#1d1d1d]">
                  {faq.q}
                </span>
                <svg
                  aria-hidden="true"
                  className={`w-6 h-6 shrink-0 ml-4 transition-transform duration-200 ${openIndex === i ? "rotate-180" : ""}`}
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
              </button>
            </dt>
            {openIndex === i && (
              <dd
                className="pb-4 font-['Poppins'] text-sm md:text-base text-gray-600"
                id={`faq-answer-${i}`}
              >
                {faq.a}
              </dd>
            )}
          </div>
        ))}
      </dl>
    </section>
  );
}
