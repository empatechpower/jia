import { CartIconWithBadge } from "@/assets/icons";
import { useApp } from "@/context/AppContext";
import type { KitchenInfo } from "@/types";

const AREAS = [
  {
    id: "wardrobe",
    label: "Wardrobe",
    emoji: "🚪",
    image: "/images/wardrobe.png",
  },
  {
    id: "kitchen",
    label: "Kitchen",
    emoji: "🍳",
    image: "/images/kitchen.png",
  },
];

export default function AreaSelectionPage() {
  const {
    cartItemCount,
    navigateTo,
    setCurrentPage,
    setSelectedArea,
    setKitchenInfo,
    numberOfRooms,
    setRooms,
  } = useApp();

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
      <header className="bg-white border-b border-gray-100 px-5 py-3.5 flex items-center justify-between relative">
        <button
          onClick={() => setCurrentPage("newProject")}
          className="text-gray-900 hover:opacity-60 transition"
        >
          <svg
            className="w-6 h-6"
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

        <span className="absolute left-1/2 -translate-x-1/2 font-semibold text-[15px] text-gray-900">
          New Project
        </span>

        <div className="flex items-center gap-2.5">
          <span
            onClick={() => navigateTo("landing", true)}
            className="bg-[#7b7267] cursor-pointer text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg"
          >
            Home
          </span>
          <button
            aria-label={`Cart, ${cartItemCount} items`}
            className="p-2 hover:opacity-80 transition"
            onClick={() => navigateTo("cart", true)}
          >
            <CartIconWithBadge color="#000000" count={cartItemCount} />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-8 py-10">
        <p className="text-xs text-gray-400 mb-2.5">
          New Project &gt;{" "}
          <span className="text-gray-600 font-medium">Area</span>
        </p>
        <h2 className="font-['Poppins'] font-bold text-2xl text-[#1C1B1F] mb-2">
          Select an area
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {AREAS.map(({ id, label, image }) => (
            <button
              className="flex flex-col   border-2 border-gray-200 rounded-2xl hover:border-[#332e28] hover:bg-[#faf4e6] transition group"
              key={id}
              onClick={() => handleSelect(id)}
            >
              <img
                src={image}
                alt={label}
                className="w-full h-[200px] lg:h-[280px] object-contain rounded-t-2xl"
              />
              <div className="flex flex-col py-4 px-6">
                <span className="font-['Poppins'] text-left font-semibold text-lg text-[#1C1B1F] group-hover:text-[#332e28]">
                  {label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
