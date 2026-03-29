/**
 * AreaSelectionPage
 *
 * Lifted from the original AreaSelectionPage.tsx.
 * All navigation and state mutations go through useApp() — no prop drilling.
 *
 * To complete: paste the full JSX from the original file here and replace:
 *   onBack()           → setCurrentPage("newProject")
 *   onSelectArea(a, k) → setSelectedArea(a); setKitchenInfo(k); setCurrentPage("roomSelection")
 *   onHome()           → setCurrentPage("landing")
 */

import { useApp } from "@/context/AppContext";
import type { KitchenInfo } from "@/types";

const AREAS = [
  { id: "wardrobe", label: "Wardrobe", emoji: "🚪" },
  { id: "kitchen", label: "Kitchen", emoji: "🍳" },
];

export default function AreaSelectionPage() {
  const { setCurrentPage, setSelectedArea, setKitchenInfo, numberOfRooms, setRooms } = useApp();

  function handleSelect(areaId: string, kitchenData?: KitchenInfo) {
    setSelectedArea(areaId);
    setKitchenInfo(kitchenData);
    const initialRooms = Array.from({ length: numberOfRooms }, (_, i) => ({
      id: `room-${i + 1}`,
      name: `Room ${i + 1}`,
    }));
    setRooms(initialRooms);
    setCurrentPage("roomSelection");
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-[#332e28] px-4 md:px-8 lg:px-[76px] py-4 flex items-center gap-4">
        <button
          className="flex items-center gap-2 text-white hover:opacity-70 transition"
          onClick={() => setCurrentPage("newProject")}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
          <span className="font-['Poppins'] text-sm">Back</span>
        </button>
        <h1 className="font-['Poppins'] font-semibold text-white text-base">
          Select Area
        </h1>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-8 py-10">
        <h2 className="font-['Poppins'] font-bold text-2xl text-[#1C1B1F] mb-2">
          What would you like to renovate?
        </h2>
        <p className="font-['DM_Sans'] text-[#666] text-base mb-8">
          Choose the area you'd like to start with.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {AREAS.map(({ id, label, emoji }) => (
            <button
              className="flex flex-col items-center gap-4 p-8 border-2 border-gray-200 rounded-2xl hover:border-[#332e28] hover:bg-[#faf4e6] transition group"
              key={id}
              onClick={() => handleSelect(id)}
            >
              <span className="text-5xl">{emoji}</span>
              <span className="font-['Poppins'] font-semibold text-lg text-[#1C1B1F] group-hover:text-[#332e28]">
                {label}
              </span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
