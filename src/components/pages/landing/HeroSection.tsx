const HERO_BG_URL = "/images/hero_jia.png";

interface HeroSectionProps {
  onShopNow: () => void;
}

export default function HeroSection({ onShopNow }: HeroSectionProps) {
  return (
    <section
      aria-label="Hero"
      className="relative w-full h-[500px] md:h-[650px] lg:h-[758px]"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          alt=""
          className="absolute w-full h-full object-cover"
          loading="eager"
          src={HERO_BG_URL}
        />
        <div className="absolute inset-0 bg-[rgba(51,46,40,0.5)]" />
      </div>

      {/* Content */}
      <div className="relative flex flex-col items-start justify-center h-full px-4 md:px-8 lg:px-[76px] max-w-[1280px] mx-auto">
        <div className="flex flex-col gap-4 md:gap-6 lg:gap-[35px] text-white max-w-full md:max-w-2xl">
          <h1 className="capitalize font-['Poppins'] font-bold text-3xl md:text-5xl lg:text-[64px] leading-tight drop-shadow-lg">
            Start Your Dream Space
          </h1>
          <p className="font-['DM_Sans'] text-base md:text-xl lg:text-[24px]">
            Complete design &amp; renovation services
          </p>
          <button
            className="bg-[#7b7267] hover:bg-[#675f56] active:bg-[#5a5249] transition px-6 py-3 rounded-[12px] capitalize font-['Poppins'] font-medium text-base md:text-lg text-white w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            onClick={onShopNow}
          >
            Shop Now For Modular Carpentry
          </button>
        </div>
      </div>
    </section>
  );
}
