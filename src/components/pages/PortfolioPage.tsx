"use client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useApp } from "@/context/AppContext";
import { useState, useEffect } from "react";
import { api } from "@/services/api";
import type { PortfolioProject } from "@/services/api";
// ─── Data ────────────────────────────────────────────────────────────────────
// In a real app, fetch this from an API. Keep it co-located with the page until
// it warrants its own data layer (React Query, SWR, etc.).

interface Project {
  _id: string;
  title: string;
  location: string;
  category: string;
  imageUrl: string;
  year: string;
}

// const PROJECTS: Project[] = [
//   {
//     id: "1",
//     title: "Modern Minimalist Haven",
//     location: "Barker Road",
//     category: "Full Renovation",
//     year: "2024",
//     imageUrl:
//       "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
//   },
//   {
//     id: "2",
//     title: "Luxury Master Suite",
//     location: "Holland Village",
//     category: "Bedroom",
//     year: "2024",
//     imageUrl:
//       "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80",
//   },
//   {
//     id: "3",
//     title: "Contemporary Kitchen Design",
//     location: "Jalan Leban",
//     category: "Kitchen",
//     year: "2024",
//     imageUrl:
//       "https://images.unsplash.com/photo-1665507279458-b21dea52c447?w=800&q=80",
//   },
//   {
//     id: "4",
//     title: "Elegant Living Space",
//     location: "Faber Walk",
//     category: "Living Room",
//     year: "2023",
//     imageUrl:
//       "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800&q=80",
//   },
//   {
//     id: "5",
//     title: "Spa-Inspired Bathroom",
//     location: "Bukit Timah",
//     category: "Bathroom",
//     year: "2023",
//     imageUrl:
//       "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
//   },
//   {
//     id: "6",
//     title: "Custom Wardrobe Solution",
//     location: "Clementi",
//     category: "Carpentry",
//     year: "2023",
//     imageUrl:
//       "https://images.unsplash.com/photo-1630699144552-b2b60b277b75?w=800&q=80",
//   },
//   {
//     id: "7",
//     title: "Modern Dining Experience",
//     location: "Tanjong Pagar",
//     category: "Dining Room",
//     year: "2023",
//     imageUrl:
//       "https://images.unsplash.com/photo-1600489000300-e590b381ce48?w=800&q=80",
//   },
//   {
//     id: "8",
//     title: "Home Office Transformation",
//     location: "East Coast",
//     category: "Study Room",
//     year: "2023",
//     imageUrl:
//       "https://images.unsplash.com/photo-1462826303086-329426d1aef5?w=800&q=80",
//   },
//   {
//     id: "9",
//     title: "Cozy Study Corner",
//     location: "Serangoon",
//     category: "Study Room",
//     year: "2022",
//     imageUrl:
//       "https://images.unsplash.com/photo-1611817084000-13da78818a0f?w=800&q=80",
//   },
//   {
//     id: "10",
//     title: "Artisan Woodwork Showcase",
//     location: "Tiong Bahru",
//     category: "Carpentry",
//     year: "2022",
//     imageUrl:
//       "https://images.unsplash.com/photo-1487015307662-6ce6210680f1?w=800&q=80",
//   },
//   {
//     id: "11",
//     title: "Serene Bedroom Retreat",
//     location: "Novena",
//     category: "Bedroom",
//     year: "2022",
//     imageUrl:
//       "https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=800&q=80",
//   },
//   {
//     id: "12",
//     title: "Scandinavian Inspired Home",
//     location: "Ang Mo Kio",
//     category: "Full Renovation",
//     year: "2022",
//     imageUrl:
//       "https://images.unsplash.com/photo-1724582586413-6b69e1c94a17?w=800&q=80",
//   },
// ];

// ─── Project card ─────────────────────────────────────────────────────────────

function ProjectCard({
  project,
  onClick,
}: {
  project: PortfolioProject;
  onClick: () => void;
}) {
  return (
    <article>
      <button className="group text-left w-full" onClick={onClick}>
        <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden shadow-lg mb-4">
          <img
            alt={project.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
            src={`https:${project["featureImg"]}`}
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <span className="inline-block bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-['Poppins'] text-[#7b7267]">
              {project.category}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="font-['DM_Sans'] font-bold text-[#383838] text-lg md:text-xl group-hover:text-[#7b7267] transition">
            {project.Name}
          </h3>
          <div className="flex items-center justify-between">
            <p className="font-['DM_Sans'] text-[#666] text-sm md:text-base">
              {project.Location}
            </p>
            <span className="font-['Poppins'] text-xs text-[#999]">
              {project.year}
            </span>
          </div>
        </div>
      </button>
    </article>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PortfolioPage() {
  const {
    setCurrentPage,
    setSelectedProjectId,
    isLoggedIn,
    handleLogin: _,
  } = useApp();

  function handleProjectClick(id: string) {
    setSelectedProjectId(id);
    setCurrentPage("workDetails");
  }

  function handleGetStarted() {
    setCurrentPage(isLoggedIn ? "newProject" : "login");
  }
  const [works, setWorks] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.portfolio
      .list()
      .then((data) => {
        setWorks(data.response.results);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero header */}
      <div
        className={`${
          isLoggedIn
            ? "bg-white pt-[148px] md:pt-[168px] text-[#383838]"
            : "bg-[#332e28] pt-[128px] md:pt-[148px] text-white"
        } pb-12 md:pb-16 px-4 md:px-8 lg:px-[76px]`}
      >
        <div className="max-w-[1280px] mx-auto">
          <h1 className="capitalize font-['Poppins'] font-bold text-3xl md:text-4xl lg:text-[48px] mb-4">
            Our Portfolio
          </h1>
          <p
            className={`font-['DM_Sans'] text-base md:text-lg lg:text-xl max-w-2xl ${
              isLoggedIn ? "text-[#666]" : "text-white/80"
            }`}
          >
            Explore our collection of completed projects showcasing exceptional
            craftsmanship and innovative design solutions.
          </p>
        </div>
      </div>

      {/* Grid */}
      <section
        aria-label="Project gallery"
        className="py-12 md:py-16 lg:py-20 px-4 md:px-8 lg:px-[76px]"
      >
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
          {works
            .filter((work) => work.Special === "No")
            .map((p) => (
              <ProjectCard
                key={p._id}
                onClick={() => handleProjectClick(p._id)}
                project={p}
              />
            ))}
        </div>
      </section>

      {/* CTA strip */}
      <section className="bg-[#fffdf1] py-12 md:py-16 lg:py-20 px-4 md:px-8 lg:px-[76px]">
        <div className="max-w-[1280px] mx-auto text-center">
          <h2 className="font-['Poppins'] font-bold text-2xl md:text-3xl lg:text-4xl text-[#383838] mb-4">
            Ready to Start Your Project?
          </h2>
          <p className="font-['DM_Sans'] text-base md:text-lg text-[#666] mb-8 max-w-2xl mx-auto">
            Let's bring your vision to life. Our team is ready to create
            something extraordinary for your space.
          </p>
          <button
            className="bg-[#7b7267] hover:bg-[#675f56] active:scale-95 transition px-8 py-3 rounded-[12px] capitalize font-['Poppins'] font-medium text-base md:text-lg text-white"
            onClick={handleGetStarted}
          >
            Get Started
          </button>
        </div>
      </section>

      <Footer
        onPrivacyClick={() => setCurrentPage("privacy")}
        onTermsClick={() => setCurrentPage("terms")}
      />
    </div>
  );
}
