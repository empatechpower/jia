/**
 * SeriesSelectionPage
 * Wire original JSX here; swap prop callbacks for useApp().
 */
import { useApp } from "@/context/AppContext";
import { resolveSeriesName } from "@/utils";
import { CartIconWithBadge } from "@/assets/icons";

// Series data lives here or in a data file — move to /data/series.ts when it grows.
const WARDROBE_SERIES = [
  { id: "hanging-drawers", label: "Hanging and Drawers" },
  { id: "shelvings-drawers", label: "Shelvings and Drawers" },
  { id: "long-hanging", label: "Long Hanging" },
  { id: "2-tier-hanging", label: "2 Tier Hanging" },
  { id: "shelvings-only", label: "Shelvings Only" },
  { id: "hanging-drawers-open", label: "Hanging & Drawers / Open Combine" },
  { id: "l-shape", label: "L-Shape" },
];

const KITCHEN_SERIES = [
  { id: "bottom-cabinet", label: "Bottom Cabinet" },
  { id: "tall-cabinet", label: "Tall Cabinet" },
  { id: "wardrobe", label: "Wardrobe" },
  { id: "top-hung-cabinet", label: "Top Hung Cabinet" },
  { id: "tall-storage-module", label: "Tall Storage Module" },
];

export default function SeriesSelectionPage() {
  const {
    selectedArea,
    setSelectedSeries,
    setSelectedSeriesId,
    setCurrentPage,
    navigateTo,
    cartItemCount,
  } = useApp();

  const series = selectedArea === "kitchen" ? KITCHEN_SERIES : WARDROBE_SERIES;

  function handleSelect(id: string) {
    setSelectedSeriesId(id);
    setSelectedSeries(resolveSeriesName(id));
    setCurrentPage("productSelection");
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-[#332e28] px-4 md:px-8 lg:px-[76px] py-4 flex items-center justify-between">
        <button
          className="flex items-center gap-2 text-white hover:opacity-70 transition"
          onClick={() => setCurrentPage("roomSelection")}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
          <span className="font-['Poppins'] text-sm">Back</span>
        </button>
        <h1 className="font-['Poppins'] font-semibold text-white text-base capitalize">
          {selectedArea} Series
        </h1>
        <button aria-label={`Cart, ${cartItemCount} items`} className="p-2" onClick={() => navigateTo("cart", true)}>
          <CartIconWithBadge color="#FFFFFF" count={cartItemCount} />
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-8 py-10">
        <h2 className="font-['Poppins'] font-bold text-2xl text-[#1C1B1F] mb-8">
          Choose a Series
        </h2>
        <ul className="space-y-3">
          {series.map(({ id, label }) => (
            <li key={id}>
              <button
                className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-[#332e28] transition group text-left"
                onClick={() => handleSelect(id)}
              >
                <span className="font-['Poppins'] font-medium text-[#1C1B1F] group-hover:text-[#332e28]">
                  {label}
                </span>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-[#332e28]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
