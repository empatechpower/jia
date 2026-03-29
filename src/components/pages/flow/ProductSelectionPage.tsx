/**
 * ProductSelectionPage
 * Wire original JSX here; swap prop callbacks for useApp().
 */
import { useApp } from "@/context/AppContext";
import { resolveProductName } from "@/utils";
import { CartIconWithBadge } from "@/assets/icons";
import { KITCHEN_PRODUCT_NAMES, WARDROBE_PRODUCT_NAMES } from "@/constants";

const WARDROBE_PRODUCTS: Record<string, string[]> = {
  "hanging-drawers":      ["type-a-d-d", "type-b-b-b-b"],
  "shelvings-drawers":    ["type-c-c-c", "type-a-a-c-c"],
  "long-hanging":         ["type-o-c-c"],
  "2-tier-hanging":       ["w22", "w23"],
  "shelvings-only":       ["type-c-c-c"],
  "hanging-drawers-open": ["type-a-d-d", "type-o-c-c"],
  "l-shape":              ["w22"],
};

const KITCHEN_PRODUCTS: Record<string, string[]> = {
  "bottom-cabinet":      ["bottom-w-door", "bottom-w-2-drawer", "bottom-w-3-drawer", "sauce-rack", "bottom-l-shape"],
  "tall-cabinet":        ["tall-w-door", "tall-w-door-drawer", "tall-oven-cabinet", "tall-oven-microwave-cabinet", "fridge-cabinet-side-panel"],
  "top-hung-cabinet":    ["top-hung-w-door", "top-hung-w-door-hl", "top-hung-w-door-hl-dish", "top-hung-w-door-2hk", "top-hung-w-door-2hk-dish", "top-hung-hood"],
  "tall-storage-module": ["tsm-w-door", "tsm-w-2-drawer", "tsm-w-3-drawer", "tsm-open"],
  "wardrobe":            ["type-a-d-d", "type-b-b-b-b"],
};

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

  const productIds =
    selectedArea === "kitchen"
      ? (KITCHEN_PRODUCTS[selectedSeriesId] ?? [])
      : (WARDROBE_PRODUCTS[selectedSeriesId] ?? []);

  function handleSelect(id: string) {
    setSelectedProductId(id);
    setSelectedProductName(resolveProductName(id));
    setCurrentPage("productDetails");
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-[#332e28] px-4 md:px-8 lg:px-[76px] py-4 flex items-center justify-between">
        <button
          className="flex items-center gap-2 text-white hover:opacity-70 transition"
          onClick={() => setCurrentPage("seriesSelection")}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
          <span className="font-['Poppins'] text-sm">Back</span>
        </button>
        <h1 className="font-['Poppins'] font-semibold text-white text-base">
          {selectedSeries}
        </h1>
        <button
          aria-label={`Cart, ${cartItemCount} items`}
          className="p-2"
          onClick={() => navigateTo("cart", true)}
        >
          <CartIconWithBadge color="#FFFFFF" count={cartItemCount} />
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-8 py-10">
        <h2 className="font-['Poppins'] font-bold text-2xl text-[#1C1B1F] mb-8">
          Select a Product
        </h2>

        {productIds.length === 0 ? (
          <p className="font-['DM_Sans'] text-[#666]">
            No products available for this series yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {productIds.map((id) => (
              <li key={id}>
                <button
                  className="w-full flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-[#332e28] transition group text-left"
                  onClick={() => handleSelect(id)}
                >
                  <span className="font-['Poppins'] font-medium text-[#1C1B1F] group-hover:text-[#332e28]">
                    {resolveProductName(id)}
                  </span>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-[#332e28]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M9 18l6-6-6-6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
