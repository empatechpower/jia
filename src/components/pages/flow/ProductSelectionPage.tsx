import { useApp } from "@/context/AppContext";
import { CartIconWithBadge } from "@/assets/icons";
import { useEffect, useState } from "react";
import { api } from "@/services/api";

export default function ProductSelectionPage() {
  const {
    selectedArea,
    selectedSeriesId,
    selectedSeries,
    setSelectedProductId,
    setSelectedProductName,
    setCurrentPage,
    navigateTo,
    cartItemCount,
  } = useApp();

  const [type, setType] = useState<any | null>(null);

  const [, setLoading] = useState(true);
  function handleSelect(id: string) {
    setSelectedProductId(id);

    setCurrentPage("productDetails");
  }
  function handleSelectName(name: string) {
    setSelectedProductName(name);
  }

  useEffect(() => {
    api.series
      .get_type(selectedSeriesId)
      .then((data) => {
        const project = data.response.results;
        setType(project);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedSeriesId]);

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-100 px-5 py-3.5 flex items-center justify-between relative">
        <button
          onClick={() => setCurrentPage("seriesSelection")}
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
          &gt;{" "}
          <span className="text-gray-600 font-medium">{selectedSeries}</span>
        </p>
        <h2 className="font-['Poppins'] font-bold text-2xl text-[#1C1B1F] mb-8">
          Select a Product
        </h2>

        {type && type.length === 0 ? (
          <p className="font-['DM_Sans'] text-[#666]">
            No products available for this series yet.
          </p>
        ) : (
          <ul className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4">
            {type?.map(
              ({
                _id,
                code,
                photoLightSmall,
                sketchSmall,
              }: {
                _id: string;
                code: string;
                photoLightSmall?: string;
                sketchSmall?: string;
              }) => (
                <li key={_id}>
                  <button
                    className="w-full flex flex-col border-2 border-gray-200 rounded-xl hover:border-[#332e28] transition group text-left overflow-hidden"
                    onClick={() => {
                      handleSelect(_id);
                      handleSelectName(code);
                    }}
                  >
                    {/* Image area */}
                    <div className="w-full aspect-square  overflow-hidden p-2">
                      <div className="flex h-full gap-2">
                        {photoLightSmall && (
                          <img
                            src={`https:${photoLightSmall}`}
                            alt={`${name} photo`}
                            className="w-1/2 h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                        )}

                        {sketchSmall && (
                          <img
                            src={`https:${sketchSmall}`}
                            alt={`${name} sketch`}
                            className="w-1/2 h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                      </div>
                    </div>

                    {/* Label */}
                    <div className="p-3 border-t border-gray-200">
                      <span className="font-['Poppins'] font-medium text-[#1C1B1F] text-sm group-hover:text-[#332e28]">
                        Type {code}
                      </span>
                    </div>
                  </button>
                </li>
              ),
            )}
          </ul>
        )}
      </main>
    </div>
  );
}
