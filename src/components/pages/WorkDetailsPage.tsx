import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { api } from "@/services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
}

interface ProjectDetails {
  id: string;
  title: string;
  location: string;
  category: string;
  year: string;
  client: string;
  duration: string;
  size: string;
  description: string;
  challenges: string[];
  solutions: string[];
  features: string[];
  coverImage: string;
  galleryImages: GalleryImage[];
}

// ─── Static data ──────────────────────────────────────────────────────────────
// In production, replace with an API call: useQuery(['project', id], fetchProject)

const PROJECT_DB: Record<string, ProjectDetails> = {
  "1": {
    id: "1",
    title: "Modern Minimalist Haven",
    location: "Barker Road, Singapore",
    category: "Full Renovation",
    year: "2024",
    client: "Private Residence",
    duration: "4 months",
    size: "1,200 sq ft",
    description:
      "A complete transformation of a dated 3-bedroom HDB flat into a sleek, modern living space. The design emphasises clean lines, natural light, and smart storage solutions throughout.",
    challenges: [
      "Limited natural light in living areas",
      "Awkward layout with small, disconnected rooms",
      "Outdated plumbing and electrical systems",
      "Need for extensive storage without compromising space",
    ],
    solutions: [
      "Knocked down non-structural walls for an open-concept layout",
      "Installed large glass panels and light-coloured finishes",
      "Completely rewired and re-plumbed the unit",
      "Designed custom built-in storage in every room",
    ],
    features: [
      "Open-concept living and dining area",
      "Custom kitchen with quartz countertops",
      "Master bedroom with walk-in wardrobe",
      "Smart home automation system",
      "Herringbone parquet flooring",
      "Concealed air-conditioning",
    ],
    coverImage:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80",
    galleryImages: [
      {
        id: "g1",
        url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
        caption: "Open-concept living room",
      },
      {
        id: "g2",
        url: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800&q=80",
        caption: "Dining area",
      },
      {
        id: "g3",
        url: "https://images.unsplash.com/photo-1665507279458-b21dea52c447?w=800&q=80",
        caption: "Contemporary kitchen",
      },
      {
        id: "g4",
        url: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80",
        caption: "Master bedroom",
      },
      {
        id: "g5",
        url: "https://images.unsplash.com/photo-1630699144552-b2b60b277b75?w=800&q=80",
        caption: "Walk-in wardrobe",
      },
      {
        id: "g6",
        url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
        caption: "Spa bathroom",
      },
    ],
  },
};

function getProjectDetails(id: string): ProjectDetails {
  return (
    PROJECT_DB[id] ?? {
      ...PROJECT_DB["1"],
      id,
      title: `Project #${id}`,
    }
  );
}

// ─── Image lightbox ───────────────────────────────────────────────────────────

function Lightbox({
  images,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  images: string[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const img = images[index];
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      role="dialog"
    >
      <button
        aria-label="Close"
        className="absolute top-4 right-4 text-white hover:opacity-70 transition"
        onClick={onClose}
      >
        <svg
          className="w-8 h-8"
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

      <button
        aria-label="Previous"
        className="absolute left-4 text-white hover:opacity-70 transition disabled:opacity-30"
        disabled={index === 0}
        onClick={onPrev}
      >
        <svg
          className="w-8 h-8"
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

      <div className="max-w-4xl w-full">
        <img
          alt={img ?? ""}
          className="w-full max-h-[80vh] object-contain rounded-lg"
          src={img}
        />
        {/* {img.caption && (
          <p className="text-center text-white/70 font-['Poppins'] text-sm mt-4">
            {img.caption}
          </p>
        )} */}
      </div>

      <button
        aria-label="Next"
        className="absolute right-4 text-white hover:opacity-70 transition disabled:opacity-30"
        disabled={index === images.length - 1}
        onClick={onNext}
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M9 5l7 7-7 7"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WorkDetailsPage() {
  const { selectedProjectId, setCurrentPage } = useApp();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const project = getProjectDetails(selectedProjectId);
  const [workDetails, setWorkDetails] = useState<any | null>(null);
  const [, setLoading] = useState(true);

  useEffect(() => {
    api.portfolio
      .single(selectedProjectId)
      .then((data) => {
        const project = data.response.results;
        setWorkDetails(project);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Back bar */}
      <nav className="bg-[#332e28] px-4 md:px-8 lg:px-[76px] py-4">
        <button
          className="flex items-center gap-2 text-white hover:opacity-70 transition"
          onClick={() => setCurrentPage("portfolio")}
        >
          <svg
            className="w-5 h-5"
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
          <span className="font-['Poppins'] text-sm">Back to Portfolio</span>
        </button>
      </nav>

      {/* Cover image */}
      <div className="relative h-[300px] md:h-[500px] w-full overflow-hidden">
        <img
          alt={project.title}
          className="absolute inset-0 w-full h-full object-cover"
          src={`https:${workDetails?.featureImg}`}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative max-w-[1280px] mx-auto px-4 md:px-8 lg:px-[76px] h-full flex flex-col justify-end pb-8 md:pb-12">
          <span className="inline-block bg-white/90 text-[#7b7267] text-xs font-['Poppins'] px-3 py-1 rounded-full mb-3 w-fit">
            {project.category}
          </span>
          <h1 className="font-['Poppins'] font-bold text-3xl md:text-4xl lg:text-5xl text-white mb-2">
            {workDetails?.name}
          </h1>
          <p className="font-['DM_Sans'] text-white/80 text-base md:text-lg">
            {project.location}
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-[76px] py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: description */}
          <div className="lg:col-span-2 space-y-10">
            <section>
              <h2 className="font-['Poppins'] font-bold text-2xl text-[#1C1B1F] mb-4">
                Project Overview
              </h2>
              <p className="font-['DM_Sans'] text-[#666] text-base leading-relaxed">
                {project.description}
              </p>
            </section>

            {(
              [
                { heading: "Challenges", items: project.challenges },
                { heading: "Our Solutions", items: project.solutions },
                { heading: "Key Features", items: project.features },
              ] as const
            ).map(({ heading, items }) => (
              <section key={heading}>
                <h2 className="font-['Poppins'] font-bold text-2xl text-[#1C1B1F] mb-4">
                  {heading}
                </h2>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li
                      className="flex items-start gap-2 font-['DM_Sans'] text-[#666] text-base"
                      key={item}
                    >
                      <span className="text-[#7b7267] mt-1 shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          {/* Right: meta */}
          <aside className="bg-[#faf4e6] rounded-2xl p-6 h-fit space-y-4">
            <h2 className="font-['Poppins'] font-bold text-lg text-[#1C1B1F]">
              Project Details
            </h2>
            {[
              { label: "Location", value: project.location },
              { label: "Category", value: project.category },
              { label: "Year", value: project.year },
              { label: "Client", value: project.client },
              { label: "Duration", value: project.duration },
              { label: "Size", value: project.size },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="font-['Poppins'] text-xs text-[#999] uppercase tracking-wider mb-0.5">
                  {label}
                </p>
                <p className="font-['DM_Sans'] text-[#383838] text-base font-medium">
                  {value}
                </p>
              </div>
            ))}
          </aside>
        </div>

        {/* Gallery */}
        <section className="mt-12 md:mt-16">
          <h2 className="font-['Poppins'] font-bold text-2xl text-[#1C1B1F] mb-6">
            Project Gallery
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {workDetails?.ListOfImg?.map((img: any, i: number) => (
              <button
                className="relative aspect-square rounded-lg overflow-hidden group"
                key={img.id}
                onClick={() => setLightboxIndex(i)}
              >
                <img
                  alt={img ?? ""}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  src={`https:${img}`}
                />
                {/* {img.caption && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <p className="text-white text-xs font-['Poppins']">
                      {img.caption}
                    </p>
                  </div>
                )} */}
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={workDetails?.ListOfImg}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNext={() =>
            setLightboxIndex((i) =>
              Math.min((i ?? 0) + 1, workDetails?.ListOfImg.length - 1),
            )
          }
          onPrev={() => setLightboxIndex((i) => Math.max((i ?? 0) - 1, 0))}
        />
      )}
    </div>
  );
}
