/**
 * SeriesSelectionPage
 * Wire original JSX here; swap prop callbacks for useApp().
 */
import { useApp } from "@/context/AppContext";

import { CartIconWithBadge } from "@/assets/icons";
import { useEffect, useState } from "react";
import { api } from "@/services/api";

// Series data lives here or in a data file — move to /data/series.ts when it grows.

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
  const [categories, setCategories] = useState<any | null>(null);

  const series = selectedArea === "kitchen" ? KITCHEN_SERIES : categories;
  const [, setLoading] = useState(true);

  useEffect(() => {
    api.series
      .get_category()
      .then((data) => {
        const project = data.response.results;
        setCategories(project);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function handleSelect(id: string) {
    setSelectedSeriesId(id);

    setCurrentPage("productSelection");
  }
  function handleSelectName(name: string) {
    setSelectedSeries(name);
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-100 px-5 py-3.5 flex items-center justify-between relative">
        <button
          onClick={() => setCurrentPage("roomSelection")}
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
          <span className="text-gray-600 font-medium">{selectedArea}</span>
          &gt; <span className="text-gray-600 font-medium">Series</span>
        </p>
        <h2 className="font-['Poppins'] font-bold text-2xl text-[#1C1B1F] mb-8">
          Select from our series of cabinetries
        </h2>
        <ul className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4">
          {series?.map(
            ({
              _id,
              name,
              photo,
            }: {
              _id: string;
              name: string;
              photo?: string;
            }) => (
              <li key={_id}>
                <button
                  className="w-full flex flex-col border-2 border-gray-200 rounded-xl hover:border-[#332e28] transition group text-left overflow-hidden"
                  onClick={() => {
                    handleSelect(_id);
                    handleSelectName(name);
                  }}
                >
                  {/* Image area */}
                  <div className="w-full aspect-square bg-gray-100 overflow-hidden p-2">
                    {photo ? (
                      <img
                        src={`https:${photo}`}
                        alt={name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100" />
                    )}
                  </div>

                  {/* Label */}
                  <div className="p-3">
                    <span className="font-['Poppins'] font-medium text-[#1C1B1F] text-sm group-hover:text-[#332e28]">
                      {name}
                    </span>
                  </div>
                </button>
              </li>
            ),
          )}
        </ul>
      </main>
    </div>
  );
}
