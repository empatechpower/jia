import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import {
  getPrice,
  getAvailableWidths,
  getDoorType,
} from "@/config/kitchenPricing";
import {
  Accordion,
  Pill,
  SwatchRow,
  ColorSwatch,
  ImageSwatch,
} from "./configurator/ConfiguratorComponents";
import {
  LAMINATE_COLORS,
  SIDE_PANEL_OPTIONS,
  HANDLE_DESIGNS,
  ALUMINIUM_FINISHINGS,
  DOOR_FINISHINGS,
  PRODUCT_GALLERY_IMAGES,
  EMPTY_CONFIG,
  type ProductConfig,
} from "./configurator/productConfigData";
import { CartIconWithBadge } from "@/assets/icons";
import { kitchenProductPricing } from "@/config/kitchenPricing";
import { api } from "@/services/api";

const DRAWER_COUNT: Record<string, number> = {
  "bottom-w-2-drawer": 2,
  "bottom-w-3-drawer": 3,
  "tall-w-door-drawer": 1,
  "tsm-w-2-drawer": 2,
  "tsm-w-3-drawer": 3,
};

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
  }).format(n);
}

function Lightbox({
  url,
  alt,
  onClose,
}: {
  url: string;
  alt: string;
  onClose: () => void;
}) {
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      role="dialog"
      onClick={onClose}
    >
      <button
        aria-label="Close"
        className="absolute top-4 right-4 text-white"
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
      <img
        alt={alt}
        className="max-w-full max-h-[90vh] object-contain rounded-xl"
        src={url}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

function AddToCartModal({
  roomName,
  onConfirm,
  onChangeRoom,
  onClose,
}: {
  roomName: string;
  onConfirm: () => void;
  onChangeRoom: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4">
        <h3 className="font-['Poppins'] font-bold text-lg text-[#242424]">
          Add to Room
        </h3>
        <p className="font-['DM_Sans'] text-[#666] text-base">
          Add this product to <strong>{roomName}</strong>?
        </p>
        <div className="flex flex-col gap-3">
          <button
            className="w-full bg-[#414042] hover:bg-[#242424] transition py-3 rounded-xl font-['Poppins'] font-bold text-base text-white"
            onClick={onConfirm}
          >
            Add to {roomName}
          </button>
          <button
            className="w-full border border-[#e0e0e0] hover:bg-gray-50 transition py-3 rounded-xl font-['Poppins'] text-base text-[#414042]"
            onClick={onChangeRoom}
          >
            Change Room
          </button>
          <button
            className="font-['Poppins'] text-sm text-[#999] hover:text-[#666] transition"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailsPage() {
  const {
    selectedProductName,
    selectedProductId: productId,
    selectedRoom,
    selectedRoomId,
    selectedArea,
    selectedSeriesId,
    selectedProductConfig: initialConfig,
    setSelectedProductConfig,
    previousPage,
    setCurrentPage,
    navigateTo,
    cartItemCount,
    handleAddProductToCart,
    setShowSuccessMessage,
  } = useApp();

  const isKitchenProduct =
    selectedArea === "kitchen" && !!kitchenProductPricing[productId];
  const isTopHungSeries = selectedSeriesId === "top-hung-cabinet";
  const isLShapeProduct = productId === "w22" || productId === "w23";
  const drawerCount = DRAWER_COUNT[productId] ?? 0;
  const isDrawerProduct = drawerCount > 0;
  const [colors, setColors] = useState<any[] | null>([]);
  const [loading, setLoading] = useState(true);
  const [works, setWorks] = useState<any>();
  const widthOptions: string[] = isKitchenProduct
    ? getAvailableWidths(productId)
    : isLShapeProduct
    ? ["400mm", "450mm", "500mm"]
    : ["400mm", "450mm", "500mm", "800mm", "900mm", "1000mm"];

  const [cfg, setCfg] = useState<ProductConfig>({
    ...EMPTY_CONFIG,
    ...((initialConfig as Partial<ProductConfig>) ?? {}),
  });
  const set =
    <K extends keyof ProductConfig>(key: K) =>
    (val: ProductConfig[K]) =>
      setCfg((prev) => ({ ...prev, [key]: val }));

  const isSmallWidth =
    !!cfg.width && ["400mm", "450mm", "500mm"].includes(cfg.width);
  const isLargeWidth =
    !!cfg.width && ["800mm", "900mm", "1000mm"].includes(cfg.width);
  const currentDoorType =
    isKitchenProduct && cfg.width
      ? getDoorType(productId, cfg.width)
      : undefined;
  const isKitchenSingleDoor = currentDoorType === "single";

  useEffect(() => {
    api.portfolio
      .laminate_color()
      .then((data) => {
        const project = data.response.results;
        setColors(project);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    api.portfolio
      .sample_products()
      .then((data) => {
        setWorks(data.response.results[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (cfg.doorOption === "No Door") {
      setCfg((p) => ({ ...p, handleDesign: null, handleColor: null }));
    }
  }, [cfg.doorOption]);

  const sidePanelCost =
    SIDE_PANEL_OPTIONS.find((o) => o.id === cfg.sidePanel)?.cost ?? 0;
  const blumCost =
    isKitchenProduct &&
    !isTopHungSeries &&
    isDrawerProduct &&
    cfg.blumRunnerUpgrade === "Yes"
      ? 50 * drawerCount
      : 0;
  const basePrice =
    isKitchenProduct && cfg.width ? getPrice(productId, cfg.width) : 100;
  const totalBeforeDiscount = basePrice + sidePanelCost + blumCost;
  const discounted = totalBeforeDiscount * 0.8;

  const [openSection, setOpenSection] = useState<string | null>(
    "internal-color"
  );
  const toggle = (id: string) => setOpenSection((s) => (s === id ? null : id));

  const complete: Record<string, boolean> = {
    "internal-color": !!cfg.internalColor,
    "external-color": !!cfg.externalColor,
    width: !!cfg.width,
    door: isLShapeProduct || !!cfg.doorOption,
    "side-panel": isLShapeProduct || isTopHungSeries || !!cfg.sidePanel,
    "drawer-lock":
      isLShapeProduct ||
      isTopHungSeries ||
      (!!cfg.addLock && (cfg.addLock === "No" || !!cfg.numberOfLocks)),
    "led-strip": isTopHungSeries || !!cfg.ledStrip,
    "kitchen-casement":
      !isKitchenSingleDoor || !!cfg.kitchenCasementDoorOpening,
    "kitchen-blum":
      !isDrawerProduct || isTopHungSeries || !!cfg.blumRunnerUpgrade,
  };
  const isFormValid = Object.values(complete).every(Boolean);

  const [showCartModal, setShowCartModal] = useState(false);
  const [zoomImg, setZoomImg] = useState<{ url: string; alt: string } | null>(
    null
  );
  const [showMoreInfo, setShowMoreInfo] = useState(false);

  function handleConfirmAdd() {
    const productImage = PRODUCT_GALLERY_IMAGES[0];
    handleAddProductToCart(
      selectedProductName,
      selectedRoomId,
      selectedRoom,
      productImage,
      cfg as any
    );
    setSelectedProductConfig(undefined);
    setShowSuccessMessage(true);
    setShowCartModal(false);
    setCurrentPage("roomSelection");
  }

  function handleBack() {
    setSelectedProductConfig(undefined);
    setCurrentPage(previousPage === "cart" ? "cart" : "productSelection");
  }

  const selectedLaminateName = LAMINATE_COLORS.find(
    (c) => c.id === cfg.externalColor
  )?.name;

  function renderDoorOptions() {
    let options: string[];
    if (!cfg.width) options = ["Timber Door", "No Door"];
    else if (isSmallWidth)
      options = [
        "Single Timber Door",
        "No Door",
        "With aluminium single door with full height handle",
        "With Door",
      ];
    else if (isLargeWidth)
      options = [
        "Double Timber Door",
        "No Door",
        "With aluminium double door with full height handle",
        "With Door",
      ];
    else options = ["Timber Door", "No Door"];
    return (
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <Pill
            key={opt}
            label={opt}
            selected={cfg.doorOption === opt}
            onClick={() => set("doorOption")(opt)}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background:
          "linear-gradient(rgb(255,255,255) 18%, rgba(104,85,71,0) 100%), linear-gradient(90deg,rgb(245,245,245) 0%,rgb(245,245,245) 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-white px-4 py-3 md:px-6 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center justify-between">
            <button
              aria-label="Back"
              className="p-1 hover:opacity-70 transition"
              onClick={handleBack}
            >
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="#1C1B1F"
                viewBox="0 0 24 24"
              >
                <path
                  d="M15 19l-7-7 7-7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                />
              </svg>
            </button>
            <h1 className="font-['Poppins'] font-bold text-lg text-[#242424]">
              New Project
            </h1>
            <div className="flex items-center gap-3">
              <button
                className="px-4 py-1.5 bg-[#7b7267] hover:bg-[#675f56] transition rounded-lg font-['Poppins'] font-medium text-sm text-white"
                onClick={() => setCurrentPage("landing")}
              >
                Home
              </button>
              <button
                aria-label={`Cart, ${cartItemCount} items`}
                className="relative p-1"
                onClick={() => navigateTo("cart", true)}
              >
                <CartIconWithBadge
                  count={cartItemCount}
                  color="#1C1B1F"
                  size={28}
                />
              </button>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="bg-white/90 rounded-lg p-4 md:p-6 lg:p-8 shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
              {/* LEFT */}
              <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
                <div className="flex gap-3 overflow-hidden">
                  {[0, 1].map((i) => (
                    <button
                      key={i}
                      className="shrink-0 rounded-lg overflow-hidden shadow-md border border-gray-100 hover:opacity-90 transition"
                      style={{ width: 145, height: 380 }}
                      onClick={() =>
                        setZoomImg({
                          url: PRODUCT_GALLERY_IMAGES[i],
                          alt:
                            i === 0 ? selectedProductName : "Technical drawing",
                        })
                      }
                    >
                      <img
                        alt={i === 0 ? "3D view" : "Technical drawing"}
                        className="w-full h-full object-cover"
                        src={PRODUCT_GALLERY_IMAGES[i]}
                      />
                    </button>
                  ))}
                </div>

                {/* Price */}
                <div className="rounded-lg border border-gray-100 shadow-sm p-4 bg-white">
                  <p className="font-['Poppins'] font-bold text-xl text-[#242424] mb-2">
                    {selectedProductName}
                  </p>
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="font-['Poppins'] font-bold text-3xl text-[#414042]">
                      {formatPrice(discounted)}
                    </span>
                    <span className="font-['Poppins'] text-base text-[#999] line-through">
                      {formatPrice(totalBeforeDiscount)}
                    </span>
                    <span className="px-3 py-0.5 bg-red-100 text-red-700 font-['Poppins'] font-bold text-xs rounded-full">
                      20% OFF
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="rounded-lg border border-gray-100 shadow-sm p-4 bg-white text-sm font-['Poppins'] text-[#242424]">
                  Full height 2400mm wardrobe with casement door in colour
                  polyester for internal finishes and laminate for external
                  finishes. Cloth Hanging Rod x 1set, H130mm Drawer x1 no,
                  H355mm Drawer x 2 nos
                  {!showMoreInfo ? (
                    <button
                      className="block mt-2 font-bold text-right w-full hover:opacity-70 transition"
                      onClick={() => setShowMoreInfo(true)}
                    >
                      More Info
                    </button>
                  ) : (
                    <>
                      <div className="mt-3 space-y-1 text-xs">
                        <p>- Cabinet with 18mm low-Formaldehyde Plywood</p>
                        <p>- Backing with 9mm E0 low-Formaldehyde Plywood</p>
                        <p>
                          - Laminate &amp; Internal Color Polyester in Green
                          label E0
                        </p>
                        <p>- Cabinet height H2400mm x D600mm</p>
                        <p>
                          - Blums Hinges, In-house soft-closing Drawer Runner
                        </p>
                        <p>- Warranty 1 year (Excluding Man-made damage)</p>
                        <p>- Free Delivery &amp; Installation</p>
                      </div>
                      <button
                        className="block mt-2 font-bold text-right w-full hover:opacity-70 transition"
                        onClick={() => setShowMoreInfo(false)}
                      >
                        Less Info
                      </button>
                    </>
                  )}
                </div>

                {/* Gallery */}
                <div>
                  <p className="font-['Poppins'] font-bold text-base text-[#242424] mb-3">
                    Product Gallery
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {works?.ListOfImg?.map((url: string, i: number) => {
                      const imageUrl = url?.startsWith("http")
                        ? url
                        : `https:${url}`;
                      console.log("works", works);
                      return (
                        <button
                          key={i}
                          className="aspect-square rounded-lg overflow-hidden border border-gray-100 hover:opacity-80 transition"
                          onClick={() =>
                            setZoomImg({
                              url: imageUrl, // ✅ correct key-value
                              alt: `Gallery ${i + 1}`,
                            })
                          }
                        >
                          <img
                            alt={`Gallery ${i + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            src={imageUrl}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex flex-col">
                <h2 className="font-['Poppins'] font-bold text-2xl text-[#242424] mb-5">
                  Configure Your Product
                </h2>
                <div className="flex flex-col gap-3">
                  {/* Interior Color */}
                  <Accordion
                    id="internal-color"
                    title="Interior Color"
                    subtitle={cfg.internalColor ?? undefined}
                    isOpen={openSection === "internal-color"}
                    isComplete={complete["internal-color"]}
                    onToggle={() => toggle("internal-color")}
                  >
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      {["Light", "Dark"].map((c) => (
                        <Pill
                          key={c}
                          label={c}
                          selected={cfg.internalColor === c}
                          onClick={() => set("internalColor")(c)}
                        />
                      ))}
                    </div>
                  </Accordion>

                  {/* External Laminate Color */}
                  <Accordion
                    id="external-color"
                    title="External Laminate Color"
                    subtitle={selectedLaminateName}
                    isOpen={openSection === "external-color"}
                    isComplete={complete["external-color"]}
                    onToggle={() => toggle("external-color")}
                  >
                    <SwatchRow>
                      {colors?.map((c) => (
                        <ColorSwatch
                          key={c._id}
                          name={c.colorDisplayName}
                          code={c.productCode}
                          hex={c.hex}
                          imageUrl={`https:${c.sample}`}
                          selected={cfg.externalColor === c._id}
                          onSelect={() => set("externalColor")(c._id)}
                          onViewImage={() =>
                            setZoomImg({
                              url: `https:${c.sample}`,
                              alt: c.colorDisplayName,
                            })
                          }
                        />
                      ))}
                    </SwatchRow>
                  </Accordion>

                  {/* Width */}
                  <Accordion
                    id="width"
                    title="Width"
                    subtitle={cfg.width ?? undefined}
                    isOpen={openSection === "width"}
                    isComplete={complete["width"]}
                    onToggle={() => toggle("width")}
                  >
                    <div className="flex flex-wrap gap-2 pt-1">
                      {widthOptions.map((w) => (
                        <Pill
                          key={w}
                          label={w}
                          selected={cfg.width === w}
                          onClick={() =>
                            setCfg((p) => ({
                              ...p,
                              width: w,
                              doorOption: null,
                              kitchenCasementDoorOpening: null,
                            }))
                          }
                        />
                      ))}
                    </div>
                  </Accordion>

                  {/* Kitchen: Casement Door Opening */}
                  {isKitchenProduct && isKitchenSingleDoor && (
                    <Accordion
                      id="kitchen-casement"
                      title="Casement Door Opening"
                      subtitle={
                        cfg.kitchenCasementDoorOpening ?? "(single door only)"
                      }
                      isOpen={openSection === "kitchen-casement"}
                      isComplete={complete["kitchen-casement"]}
                      onToggle={() => toggle("kitchen-casement")}
                    >
                      <p className="font-['Poppins'] text-xs text-[#666] mb-3">
                        Choose which side the single door opens from.
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {["Left", "Right"].map((side) => (
                          <Pill
                            key={side}
                            label={side}
                            selected={cfg.kitchenCasementDoorOpening === side}
                            onClick={() =>
                              set("kitchenCasementDoorOpening")(side)
                            }
                          />
                        ))}
                      </div>
                    </Accordion>
                  )}

                  {/* Kitchen: Blum Runner */}
                  {isKitchenProduct && isDrawerProduct && !isTopHungSeries && (
                    <Accordion
                      id="kitchen-blum"
                      title="Blum Runner Upgrade"
                      subtitle={
                        cfg.blumRunnerUpgrade
                          ? `${cfg.blumRunnerUpgrade}${
                              cfg.blumRunnerUpgrade === "Yes"
                                ? ` — +${formatPrice(50 * drawerCount)}`
                                : ""
                            }`
                          : "(drawer cabinet only)"
                      }
                      isOpen={openSection === "kitchen-blum"}
                      isComplete={complete["kitchen-blum"]}
                      onToggle={() => toggle("kitchen-blum")}
                    >
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                        <p className="font-['Poppins'] text-xs text-amber-800">
                          <strong>{formatPrice(50)} per drawer</strong> —{" "}
                          {drawerCount} drawer{drawerCount > 1 ? "s" : ""}.
                          Upgrade:{" "}
                          <strong>+{formatPrice(50 * drawerCount)}</strong>
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Pill
                          label={`Yes (+${formatPrice(50 * drawerCount)})`}
                          selected={cfg.blumRunnerUpgrade === "Yes"}
                          onClick={() => set("blumRunnerUpgrade")("Yes")}
                        />
                        <Pill
                          label="No"
                          selected={cfg.blumRunnerUpgrade === "No"}
                          onClick={() => set("blumRunnerUpgrade")("No")}
                        />
                      </div>
                    </Accordion>
                  )}

                  {/* Wardrobe: Select Door */}
                  {!isKitchenProduct && !isLShapeProduct && (
                    <Accordion
                      id="door"
                      title="Select Door"
                      subtitle={cfg.doorOption ?? undefined}
                      isOpen={openSection === "door"}
                      isComplete={complete["door"]}
                      onToggle={() => toggle("door")}
                    >
                      <div className="space-y-4">
                        {renderDoorOptions()}

                        {(cfg.doorOption === "Single Timber Door" ||
                          (cfg.doorOption === "Timber Door" &&
                            isSmallWidth)) && (
                          <div>
                            <p className="font-['Poppins'] font-bold text-sm text-[#242424] mb-2">
                              Casement Door Opening
                            </p>
                            <div className="flex gap-2">
                              {["Left", "Right"].map((s) => (
                                <Pill
                                  key={s}
                                  label={s}
                                  selected={cfg.casementDoorOpening === s}
                                  onClick={() => set("casementDoorOpening")(s)}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {isSmallWidth && cfg.doorOption === "With Door" && (
                          <>
                            <div>
                              <p className="font-['Poppins'] font-bold text-sm text-[#242424] mb-2">
                                Casement Door Opening
                              </p>
                              <div className="flex gap-2">
                                {["Left", "Right"].map((s) => (
                                  <Pill
                                    key={s}
                                    label={s}
                                    selected={cfg.casementDoorOpening === s}
                                    onClick={() =>
                                      set("casementDoorOpening")(s)
                                    }
                                  />
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="font-['Poppins'] font-bold text-sm text-[#242424] mb-2">
                                Casement Door Aluminum Frame Tempered Glass
                                (Optional)
                              </p>
                              <div className="flex gap-2">
                                {["Yes", "No"].map((v) => (
                                  <Pill
                                    key={v}
                                    label={v}
                                    selected={cfg.casementAluminumFrame === v}
                                    onClick={() =>
                                      set("casementAluminumFrame")(v)
                                    }
                                  />
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="font-['Poppins'] font-bold text-sm text-[#242424] mb-2">
                                Casement Door Finishing
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {DOOR_FINISHINGS.map((f) => (
                                  <Pill
                                    key={f}
                                    label={f}
                                    selected={cfg.casementFinishing === f}
                                    onClick={() => set("casementFinishing")(f)}
                                  />
                                ))}
                              </div>
                            </div>
                          </>
                        )}

                        {isLargeWidth && cfg.doorOption === "With Door" && (
                          <>
                            <div>
                              <p className="font-['Poppins'] font-bold text-sm text-[#242424] mb-2">
                                Casement Door in Aluminum Frame (Optional)
                              </p>
                              <div className="flex gap-2">
                                {["Casement Door", "No Thanks"].map((v) => (
                                  <Pill
                                    key={v}
                                    label={v}
                                    selected={cfg.doorTypeOptional === v}
                                    onClick={() => set("doorTypeOptional")(v)}
                                  />
                                ))}
                              </div>
                            </div>
                            {cfg.doorTypeOptional === "Casement Door" && (
                              <div>
                                <p className="font-['Poppins'] font-bold text-sm text-[#242424] mb-2">
                                  Casement Door Finishing
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {DOOR_FINISHINGS.map((f) => (
                                    <Pill
                                      key={f}
                                      label={f}
                                      selected={cfg.slidingFinishing === f}
                                      onClick={() => set("slidingFinishing")(f)}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {(cfg.doorOption ===
                          "With aluminium single door with full height handle" ||
                          cfg.doorOption ===
                            "With aluminium double door with full height handle") && (
                          <>
                            <div>
                              <p className="font-['Poppins'] font-bold text-sm text-[#242424] mb-2">
                                Aluminium Door Frame Color
                              </p>
                              <div className="flex gap-2">
                                {["Black", "White"].map((c) => (
                                  <Pill
                                    key={c}
                                    label={c}
                                    selected={cfg.aluminiumFrameColor === c}
                                    onClick={() =>
                                      set("aluminiumFrameColor")(c)
                                    }
                                  />
                                ))}
                              </div>
                            </div>
                            {cfg.aluminiumFrameColor && (
                              <div>
                                <p className="font-['Poppins'] font-bold text-sm text-[#242424] mb-2">
                                  Aluminium Door Finishing
                                </p>
                                <SwatchRow>
                                  {ALUMINIUM_FINISHINGS.map((f) => (
                                    <ImageSwatch
                                      key={f.id}
                                      name={f.name}
                                      imageUrl={f.imageUrl}
                                      selected={
                                        cfg.aluminiumDoorFinishing === f.id
                                      }
                                      onSelect={() =>
                                        set("aluminiumDoorFinishing")(f.id)
                                      }
                                      onZoom={() =>
                                        setZoomImg({
                                          url: f.imageUrl,
                                          alt: f.name,
                                        })
                                      }
                                    />
                                  ))}
                                </SwatchRow>
                              </div>
                            )}
                          </>
                        )}

                        {cfg.doorOption && cfg.doorOption !== "No Door" && (
                          <div>
                            <p className="font-['Poppins'] font-bold text-sm text-[#242424] mb-2">
                              Handle Design
                            </p>
                            <SwatchRow>
                              {HANDLE_DESIGNS.map((h) => (
                                <ImageSwatch
                                  key={h.id}
                                  name={h.name}
                                  imageUrl={h.imageUrl}
                                  selected={cfg.handleDesign === h.id}
                                  onSelect={() => {
                                    set("handleDesign")(h.id);
                                    set("handleColor")(null);
                                  }}
                                  onZoom={() =>
                                    setZoomImg({ url: h.imageUrl, alt: h.name })
                                  }
                                />
                              ))}
                            </SwatchRow>
                          </div>
                        )}

                        {cfg.handleDesign && (
                          <div>
                            <p className="font-['Poppins'] font-bold text-sm text-[#242424] mb-2">
                              Handle Design Color
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {(
                                HANDLE_DESIGNS.find(
                                  (h) => h.id === cfg.handleDesign
                                )?.colorOptions ?? []
                              ).map((col) => (
                                <Pill
                                  key={col}
                                  label={col}
                                  selected={cfg.handleColor === col}
                                  onClick={() => set("handleColor")(col)}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </Accordion>
                  )}

                  {/* Side Panel */}
                  {!isKitchenProduct &&
                    !isTopHungSeries &&
                    !isLShapeProduct && (
                      <Accordion
                        id="side-panel"
                        title="Side Panel"
                        subtitle={
                          SIDE_PANEL_OPTIONS.find((o) => o.id === cfg.sidePanel)
                            ?.label
                        }
                        isOpen={openSection === "side-panel"}
                        isComplete={complete["side-panel"]}
                        onToggle={() => toggle("side-panel")}
                      >
                        <p className="font-['Poppins'] text-xs text-[#666] mb-3">
                          (Wardrobe already includes 1 piece of 18mm side panel)
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                          {SIDE_PANEL_OPTIONS.map((o) => (
                            <Pill
                              key={o.id}
                              label={o.label}
                              selected={cfg.sidePanel === o.id}
                              onClick={() => set("sidePanel")(o.id)}
                              className="text-left"
                            />
                          ))}
                        </div>
                      </Accordion>
                    )}

                  {/* Drawer Lock */}
                  {!isKitchenProduct &&
                    !isTopHungSeries &&
                    !isLShapeProduct && (
                      <Accordion
                        id="drawer-lock"
                        title="Add Drawer Lock"
                        subtitle={
                          cfg.addLock
                            ? `${cfg.addLock}${
                                cfg.addLock === "Yes" && cfg.numberOfLocks
                                  ? ` (${cfg.numberOfLocks})`
                                  : ""
                              }`
                            : undefined
                        }
                        isOpen={openSection === "drawer-lock"}
                        isComplete={complete["drawer-lock"]}
                        onToggle={() => toggle("drawer-lock")}
                      >
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <Pill
                            label="Yes"
                            selected={cfg.addLock === "Yes"}
                            onClick={() => set("addLock")("Yes")}
                          />
                          <Pill
                            label="No"
                            selected={cfg.addLock === "No"}
                            onClick={() => {
                              set("addLock")("No");
                              set("numberOfLocks")(null);
                            }}
                          />
                        </div>
                        {cfg.addLock === "Yes" && (
                          <>
                            <p className="font-['Poppins'] font-bold text-sm text-[#242424] mb-2">
                              Number of Locks
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {["1", "2", "3"].map((n) => (
                                <Pill
                                  key={n}
                                  label={n}
                                  selected={cfg.numberOfLocks === n}
                                  onClick={() => set("numberOfLocks")(n)}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </Accordion>
                    )}

                  {/* LED Strip */}
                  {!isTopHungSeries && (
                    <Accordion
                      id="led-strip"
                      title="LED Strip"
                      subtitle={cfg.ledStrip ?? undefined}
                      isOpen={openSection === "led-strip"}
                      isComplete={complete["led-strip"]}
                      onToggle={() => toggle("led-strip")}
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <Pill
                          label="Yes"
                          selected={cfg.ledStrip === "Yes"}
                          onClick={() => set("ledStrip")("Yes")}
                        />
                        <Pill
                          label="No"
                          selected={cfg.ledStrip === "No"}
                          onClick={() => set("ledStrip")("No")}
                        />
                      </div>
                    </Accordion>
                  )}

                  {/* Remarks */}
                  <div>
                    <p className="font-['Poppins'] font-bold text-base text-[#242424] mb-2">
                      Remarks
                    </p>
                    <textarea
                      className="w-full bg-[#f5f5f5] rounded-xl px-4 py-3 font-['Poppins'] text-sm text-[#242424] placeholder:text-[#aaa] outline-none focus:ring-2 focus:ring-[#414042] resize-none"
                      placeholder="Enter if any"
                      rows={3}
                      value={cfg.remarks}
                      onChange={(e) => set("remarks")(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Sticky bottom bar */}
        <footer className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 md:px-6 z-10">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="font-['Poppins'] text-xs text-[#666]">
                Total Price
              </p>
              <div className="flex items-baseline gap-2">
                <span className="font-['Poppins'] font-bold text-2xl text-[#414042]">
                  {formatPrice(discounted)}
                </span>
                <span className="font-['Poppins'] text-sm text-[#999] line-through">
                  {formatPrice(totalBeforeDiscount)}
                </span>
                <span className="px-2 py-0.5 bg-red-100 text-red-700 font-['Poppins'] font-bold text-xs rounded-full">
                  20% OFF
                </span>
              </div>
            </div>
            <button
              className={`px-8 py-3 rounded-xl font-['Poppins'] font-bold text-base text-white transition ${
                isFormValid
                  ? "bg-[#7b7267] hover:bg-[#675f56] active:scale-95"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
              disabled={!isFormValid}
              onClick={() => setShowCartModal(true)}
            >
              Add to cart
            </button>
          </div>
        </footer>
      </div>

      {zoomImg && (
        <Lightbox
          url={zoomImg.url}
          alt={zoomImg.alt}
          onClose={() => setZoomImg(null)}
        />
      )}
      {showCartModal && (
        <AddToCartModal
          roomName={selectedRoom}
          onConfirm={handleConfirmAdd}
          onChangeRoom={() => {
            setShowCartModal(false);
            setCurrentPage("roomSelection");
          }}
          onClose={() => setShowCartModal(false)}
        />
      )}
    </div>
  );
}
