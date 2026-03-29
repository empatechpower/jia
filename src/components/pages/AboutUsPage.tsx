import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useApp } from "@/context/AppContext";

const CONTENT_PARAGRAPHS = [
  "Established in 2025, JIA Ideas was founded with a clear purpose: to modernise the renovation and interior solutions industry through precision, structure, and thoughtful execution. Built by professionals with deep industry experience, JIA Ideas was created to bridge the gap between design intent and real-world construction outcomes.",
  "From its inception, JIA Ideas has focused on delivering consistent quality, operational clarity, and dependable results. By combining contemporary design thinking with disciplined project management, the company offers clients a more transparent, reliable, and efficient renovation experience.",
  "JIA Ideas adopts a system-driven approach—standardising processes, materials, and workflows—while maintaining the flexibility required to meet each client's unique needs. This balance allows the team to deliver projects that are both refined in design and robust in execution.",
  "Driven by collaboration, JIA Ideas brings together designers, technical specialists, and project managers who work closely to ensure alignment at every stage of the project lifecycle. This integrated approach minimises uncertainty, reduces inefficiencies, and delivers outcomes that meet exacting standards.",
  "Today, JIA Ideas continues to grow with a forward-looking mindset, embracing innovation, sustainable practices, and digital tools to redefine how renovation projects are planned, managed, and delivered—while remaining grounded in its core values of integrity, accountability, and client-centric service.",
];

export default function AboutUsPage() {
  const { setCurrentPage } = useApp();

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <div className="relative h-[300px] md:h-[400px] lg:h-[480px] w-full overflow-hidden">
        <img
          alt="About JIA Ideas — interior craftsmanship"
          className="absolute inset-0 w-full h-full object-cover"
          src="/images/about-hero.jpg"
        />
        <div className="absolute inset-0 bg-[#332e28]/80" />
        <div className="relative max-w-[1280px] mx-auto px-4 md:px-8 lg:px-[76px] h-full flex flex-col justify-end pb-12 md:pb-16">
          <h1 className="capitalize font-['Poppins'] font-bold text-3xl md:text-4xl lg:text-[48px] text-white mb-4">
            About Us
          </h1>
          <p className="font-['DM_Sans'] text-base md:text-lg lg:text-xl max-w-2xl text-white/90">
            Discover our story of craftsmanship excellence and innovative design
            solutions for modern living spaces.
          </p>
        </div>
      </div>

      {/* Body */}
      <article className="max-w-[900px] mx-auto px-4 md:px-8 py-12 md:py-16 lg:py-20">
        <p className="font-['Poppins'] text-base md:text-lg text-[#404040] leading-relaxed mb-12">
          Our dedication to superior quality and groundbreaking innovation is
          paramount for the homeowner with exacting standards, the accomplished
          main contractor, and the visionary design professional. Discover how
          we are redefining the landscape of renovation excellence.
        </p>

        <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl lg:text-5xl text-[#242424] font-normal mb-8">
          Company Background
        </h2>

        <div className="space-y-6">
          {CONTENT_PARAGRAPHS.map((p, i) => (
            <p
              className="font-['Poppins'] text-base text-[#404040] leading-relaxed"
              key={i}
            >
              {p}
            </p>
          ))}
        </div>
      </article>

      <Footer
        onPrivacyClick={() => setCurrentPage("privacy")}
        onTermsClick={() => setCurrentPage("terms")}
      />
    </div>
  );
}
