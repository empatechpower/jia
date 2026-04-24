import { useState, useCallback, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import type { CartRoom, ProductConfig } from "@/types";
import { api } from "@/services/api";

// ─── Shared helpers ────────────────────────────────────────────────────────────

function BackIcon() {
  return (
    <svg
      className="w-5 h-5"
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
  );
}

function TrashIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  );
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-5 h-5 transition-transform ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        d="M19 9l-7 7-7-7"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  );
}

/** Format a product config object into readable key-value pairs */
function formatConfig(
  config: Record<string, unknown>,
): Array<{ label: string; value: string }> {
  const labelMap: Record<string, string> = {
    internal_color: "Internal color",
    laminate_color: "External color",
    width: "Width",
    door_type: "Door Type",
    casementDoorOpening: "Door Opens",
    led_light_text: "LED Light",
    side_panel_text: "Side Panel",
    drawer_lock_text: "Drawer Lock",
    numlock: "Number of Lock",
    handle_design: "Handle Design",
    handle_color: "Handle Color",
    aluminium_frame_color: "Aluminium Frame Color",
    door_finishing: "Door Finishing",
    blum_runner_upgrade_text: "Blum Runner",
    kitchenCasementDoorOpening: "Door Opens",
    remarks: "Remarks",
  };

  const sidePanelLabels: Record<string, string> = {
    "not-required": "Not required",
    "upgrade-40mm": "Upgrade to 40mm",
    "extra-18mm": "Add extra 18mm side panel: + $180",
    "extra-40mm": "Add extra 40mm side panel: + $250",
  };

  const skip = new Set([
    "casementAluminumFrame",
    "casementFinishing",
    "doorTypeOptional",
    "slidingFinishing",
    "numberOfLocks",
    "Created Date",
    "item",
    "type",
    "_id",
    "Created By",
    "user",
    "status",
    "blum_runner_upgrade",
    "pricing",
    "room",
    "project cart",
    "Modified Date",
    "handle_design_text",
    "external_color",
    "selected_aluminium_doorType",
  ]);

  return Object.entries(config)
    .filter(
      ([k, v]) => v !== null && v !== undefined && v !== "" && !skip.has(k),
    )
    .map(([k, v]) => {
      let displayValue = String(v);
      if (k === "side_panel_text")
        displayValue = sidePanelLabels[displayValue] ?? displayValue;
      if (k === "internalColor") displayValue = displayValue.toLowerCase();
      if (k === "drawer_lock_text" && config.numlock) displayValue = `Yes`;
      return { label: labelMap[k] ?? k, value: displayValue };
    })
    .filter(({ label }) => label !== "numlock");
}

// ─── Shopping Cart Page ────────────────────────────────────────────────────────

interface RoomSectionProps {
  room: CartRoom;
  onDeleteRoom: (roomId: string) => void;
  onDeleteProduct: (roomId: string, productId: string) => void;
}
export interface CartProduct {
  _id: string;
  name: string;
  price: number;
  image: string;
  config?: ProductConfig;
  cost?: number;
  code?: string;
  pricing?: string;
}
function ProductCard({
  product,
  // roomId,
  onDelete,
  sketch,
}: {
  product: CartProduct;
  roomId: string;
  sketch: string;
  onDelete: () => void;
}) {
  const config = (product ?? {}) as Record<string, any>;
  const configEntries = formatConfig(config);
  const widthMm = product?.pricing?.length ?? null;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* Product header row */}
      <div className="flex items-center gap-3 p-3">
        <div className="w-[72px] h-[90px] shrink-0 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
          <img
            alt={product?.name}
            className="w-full h-full object-contain"
            src={sketch}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-['Poppins'] font-semibold text-[#1C1B1F] text-base">
            Type {product?.code}
          </p>
          <p className="font-['Poppins'] font-bold text-[#1C1B1F] text-base mt-0.5">
            ${product?.cost?.toFixed(2)}
          </p>
        </div>
        <button
          aria-label={`Remove ${product?.name}`}
          className="shrink-0 p-2 text-red-400 hover:text-red-600 transition"
          onClick={onDelete}
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Config details */}
      {/* {configEntries.length > 0 && (
        <div className="px-3 pb-3 border-t border-gray-100 pt-2 grid grid-cols-1 gap-0.5">
          {configEntries.map(({ label, value }) => (
            <p key={label} className="font-['Poppins'] text-xs text-[#555]">
              <span className="capitalize">{label}</span>
              {"  "}
              {value}
            </p>
          ))}
          {config.numberOfLocks && (
            <p className="font-['Poppins'] text-xs text-[#555]">
              Number of Lock{"  "}
              {String(config.numberOfLocks)}
            </p>
          )}
          {widthMm && (
            <p className="font-['Poppins'] text-xs text-[#555]">
              Width{"  "}L{widthMm}
            </p>
          )}
        </div>
      )} */}

      {configEntries.length > 0 && (
        <div className="px-3 pb-3 border-t border-gray-100 pt-2 grid grid-cols-1 gap-0.5">
          {configEntries.map(({ label, value }) => (
            <p key={label} className="font-['Poppins'] text-xs text-[#555]">
              <span className="capitalize">{label}</span>:{"  "}
              {value}
            </p>
          ))}

          {widthMm && (
            <p className="font-['Poppins'] text-xs text-[#555]">
              Width : {"  "}
              {widthMm}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function RoomSection({
  room,
  onDeleteRoom,
  onDeleteProduct,
}: RoomSectionProps) {
  const [collapsed, setCollapsed] = useState(false);

  // const totalWidth = room.products.reduce((sum, p) => {
  //   const w = parseInt(
  //     String((p.config as Record<string, unknown>)?.width ?? "0"),
  //   );
  //   return sum + (isNaN(w) ? 0 : w);
  // }, 0);

  return (
    <section className="border-b border-gray-200 pb-6">
      {/* Room header */}
      <div className="flex items-center justify-between py-3">
        <h2 className="font-['Poppins'] font-semibold text-base text-[#1C1B1F]">
          {room?.name}
        </h2>
        <div className="flex items-center gap-2">
          <button
            aria-label={`Delete ${room.name}`}
            className="p-1.5 text-red-400 hover:text-red-600 transition"
            onClick={() => onDeleteRoom(room?._id)}
          >
            <TrashIcon className="w-5 h-5" />
          </button>
          <button
            aria-label={collapsed ? "Expand" : "Collapse"}
            className="p-1.5 text-[#555] hover:text-[#1C1B1F] transition"
            onClick={() => setCollapsed((c) => !c)}
          >
            <ChevronDown open={!collapsed} />
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="space-y-4">
          {/* Sketch images row */}
          {room?.sketchImages && room?.sketchImages.length > 0 && (
            <div>
              <p className="font-['Poppins'] text-sm text-[#555] mb-2">
                Sketch
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {room?.sketchImages.map((src, i) => (
                  <div
                    key={i}
                    className="shrink-0 w-[80px] h-[110px] rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
                  >
                    <img
                      alt={`Sketch ${i + 1}`}
                      className="w-full h-full object-contain"
                      src={src}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3D Render images row */}
          {room?.renderImages && room?.renderImages.length > 0 && (
            <div>
              <p className="font-['Poppins'] text-sm text-[#555] mb-2">
                3D Render
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {room?.renderImages.map((src, i) => (
                  <div
                    key={i}
                    className="shrink-0 w-[80px] h-[110px] rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
                  >
                    <img
                      alt={`Render ${i + 1}`}
                      className="w-full h-full object-contain"
                      src={src}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          <div>
            <p className="font-['Poppins'] text-sm text-[#555] mb-2">
              Products (Drag to rearrange):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {room?.products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  roomId={room?._id}
                  sketch={room?.sketchImages[0]}
                  onDelete={() => onDeleteProduct(room?._id, product?._id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function OrderHistoryTab() {
  return (
    <div className="text-center py-16">
      <p className="font-['Poppins'] text-base text-[#888]">
        No past orders yet.
      </p>
    </div>
  );
}

export function ShoppingCartPage() {
  const {
    cartItems,
    previousPage,
    setCurrentPage,
    navigateTo,
    handleDeleteProduct,
    currentProject,
  } = useApp();

  // const [room, setRoom] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"cart" | "history">("cart");
  const [cartItem, setCartItem] = useState<any | null>(null);
  const [cartRoom, setCartRoom] = useState<any | null>(null);
  const [, setLoading] = useState(true);
  const [aluminium, setAluminium] = useState<any[]>();
  const [type, setType] = useState<any[] | null>([]);
  const [product, setProduct] = useState<any[] | null>([]);
  const [handleDesign, setHandleDesign] = useState<any>();
  const [colors, setColors] = useState<any[] | null>([]);

  useEffect(() => {
    api.cart
      .list(currentProject?._id ?? "")

      .then((data) => {
        const project = data.response.results;
        setCartItem(project);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
    api.rooms
      .listByProject(currentProject?._id ?? "")
      .then((data) => {
        const project = data.response.results;
        setCartRoom(project);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    setLoading(true);

    Promise.all([
      api.portfolio.laminate_color(),
      api.products.get_handle_design(),
      api.products.get_aluminium_finishing(),
      api.series.list(),
      api.products.get_all_products(),
    ])
      .then(
        ([colorRes, handleDesignRes, aluminiumDesign, typeRes, productRes]) => {
          const colorsData = colorRes.response.results;

          const handleDesignData = handleDesignRes.response.results;
          const handleAluminiumDesignData = aluminiumDesign.response.results;
          const handleTypeData = typeRes.response.results;
          const handleProductData = productRes.response.results;

          setColors(colorsData);
          setProduct(handleProductData);
          setHandleDesign(handleDesignData);
          setAluminium(handleAluminiumDesignData);
          setType(handleTypeData);
        },
      )
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);
  const total = (cartItem ?? []).reduce(
    (sum: number, item: any) => sum + (Number(item.cost) || 0),
    0,
  );

  // Delete entire room (all products in it)
  const handleDeleteRoom = useCallback(
    (roomId: string) => {
      const room = cartItems.find((r) => r._id === roomId);
      if (!room) return;
      room.products.forEach((p) => handleDeleteProduct(roomId, p._id));
    },
    [cartItems, handleDeleteProduct],
  );

  // ✅ width groups (match your backend format)
  const isSmallWidth = ["L400mm", "L450mm", "L500mm"];
  // const isLargeWidth = ["L800mm", "L900mm", "L1000mm"];

  // ✅ build lookup maps
  const typeMap = Object.fromEntries((type ?? []).map((t: any) => [t._id, t]));
  const handleMap = Object.fromEntries(
    (handleDesign ?? []).map((h: any) => [h._id, h]),
  );
  const colorMap = Object.fromEntries(
    (colors ?? []).map((h: any) => [h._id, h]),
  );
  const doorFinishing = Object.fromEntries(
    (aluminium ?? []).map((h: any) => [h._id, h]),
  );
  const productMap = Object.fromEntries(
    (cartItem ?? []).map((p: any) => [p._id, p]),
  );

  const pricingMap = Object.fromEntries(
    (product ?? []).map((p: any) => [p._id, p]),
  );

  // ✅ helper: sketch image (length only)
  function getSketchImage(t: any, product: any) {
    const length = product?.pricing?.length;
    const isSmall = isSmallWidth.includes(length);

    return isSmall ? t.sketchSmall : t.sketchBig;
  }

  // ✅ helper: render image (length + color)
  function getRenderImage(t: any, product: any) {
    const length = product?.pricing?.length;
    const color = product?.internal_color;

    const isSmall = isSmallWidth.includes(length);

    if (color === "Light") {
      return isSmall ? t.photoLightSmall : t.photoLightBig;
    } else {
      return isSmall ? t.photoDarkSmall : t.photoDarkBig;
    }
  }

  // ✅ main transformation
  const roomsForUI = (cartRoom ?? []).map((room: any) => {
    // 🔹 attach products + pricing
    const products = (room.items || [])
      .map((id: string) => productMap[id])
      .filter(Boolean)
      .map((p: any) => ({
        ...p,
        pricing: pricingMap[p.item],
        code: typeMap[p.type]?.code || null, // ✅ ADD CODE HERE
        handle_design: handleMap[p.handle_design_text]?.name || null,
        laminate_color: colorMap[p.external_color]?.colorDisplayName || null,
        door_finishing:
          doorFinishing[p.selected_aluminium_doorType]?.name || null,
      }));

    // 🔹 get types used in this room
    const typesUsed = products.map((p: any) => typeMap[p.type]).filter(Boolean);

    // 🔹 remove duplicate types
    const uniqueTypes = Array.from(
      new Map(typesUsed.map((t: any) => [t._id, t])).values(),
    );

    return {
      _id: room._id,
      name: room.name,
      products,

      // ✅ sketch images (1 per type)
      sketchImages: uniqueTypes
        .map((t: any) => {
          const product = products.find((p: any) => p.type === t._id);
          return getSketchImage(t, product);
        })
        .filter(Boolean),

      // ✅ render images (1 per type)
      renderImages: uniqueTypes
        .map((t: any) => {
          const product = products.find((p: any) => p.type === t._id);
          return getRenderImage(t, product);
        })
        .filter(Boolean),
    };
  });

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
        <button
          className="flex items-center gap-1.5 text-[#1C1B1F] hover:opacity-70 transition"
          onClick={() => setCurrentPage(previousPage)}
        >
          <BackIcon />
        </button>
        <h1 className="font-['Poppins'] font-semibold text-base text-[#1C1B1F]">
          Shopping Cart
        </h1>
        <button
          className="px-4 py-1.5 bg-[#7b7267] hover:bg-[#675f56] transition rounded-lg font-['Poppins'] font-medium text-sm text-white"
          onClick={() => setCurrentPage("landing")}
        >
          Home
        </button>
      </header>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 md:px-8 flex gap-8">
          <button
            className={`py-3 font-['Poppins'] text-sm font-medium border-b-2 transition-colors ${
              activeTab === "cart"
                ? "border-[#1C1B1F] text-[#1C1B1F]"
                : "border-transparent text-[#888] hover:text-[#555]"
            }`}
            onClick={() => setActiveTab("cart")}
          >
            Current Cart
          </button>
          <button
            className={`py-3 font-['Poppins'] text-sm font-medium border-b-2 transition-colors ${
              activeTab === "history"
                ? "border-[#1C1B1F] text-[#1C1B1F]"
                : "border-transparent text-[#888] hover:text-[#555]"
            }`}
            onClick={() => setActiveTab("history")}
          >
            Order History
          </button>
        </div>
      </div>

      {/* Body */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-8 pb-28">
        {activeTab === "history" ? (
          <OrderHistoryTab />
        ) : cartItem?.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-['Poppins'] text-lg text-[#666] mb-6">
              Your cart is empty.
            </p>
            <button
              className="bg-[#7b7267] hover:bg-[#675f56] transition px-6 py-3 rounded-[12px] font-['Poppins'] font-medium text-base text-white"
              onClick={() => setCurrentPage("landing")}
            >
              Browse Services
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {roomsForUI.map((room: any) => (
              <RoomSection
                key={room._id}
                room={room}
                onDeleteRoom={handleDeleteRoom}
                onDeleteProduct={handleDeleteProduct}
              />
            ))}
          </div>
        )}
      </main>

      {/* Sticky footer */}
      {activeTab === "cart" && cartItem?.length > 0 && (
        <footer className="fixed bottom-0 left-0 right-0 bg-[#1C1B1F] px-4 md:px-8 py-4 z-20">
          <div className="max-w-4xl mx-auto">
            <button
              className="w-full font-['Poppins'] font-medium text-base text-white text-center hover:opacity-90 transition"
              onClick={() => navigateTo("checkout", true)}
            >
              Proceed to Payment(${total?.toFixed(2)})
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}

// ─── Checkout Page ─────────────────────────────────────────────────────────────

interface CheckoutFormState {
  fullName: string;
  email: string;
  phone: string;
  installationDate: string;
  siteVisitAcknowledged: boolean;
  deliverySameAsProperty: boolean;
  deliveryPostalCode: string;
  deliveryUnit: string;
  ownership: "own" | "rented";
  homeZipCode: string;
  homeUnit: string;
  keyDate: string;
  deliveryAddressDifferent: boolean;
  paymentMethod: "card" | "paynow";
  agreedToTerms: boolean;
}

function FormInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "Type here...",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block font-['Poppins'] font-medium text-sm text-[#1C1B1F] mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        className="w-full bg-[#f5f5f5] rounded-lg px-4 py-3 font-['Poppins'] text-sm text-[#1C1B1F] placeholder:text-[#bbb] outline-none focus:ring-2 focus:ring-[#1C1B1F]/20 transition"
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
        required={required}
      />
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <h2 className="font-['Poppins'] font-semibold text-base text-[#1C1B1F] mb-5">
        {title}
      </h2>
      {children}
    </div>
  );
}

export function CheckoutPage() {
  const {
    userEmail,
    cartItems,

    setCurrentPage,

    currentProject,
  } = useApp();
  const [cartItem, setCartItem] = useState<any | null>(null);
  const [cartRoom, setCartRoom] = useState<any | null>(null);
  const [, setLoading] = useState(true);

  const [type, setType] = useState<any[] | null>([]);
  const [product, setProduct] = useState<any[] | null>([]);

  const [form, setForm] = useState<CheckoutFormState>({
    fullName: "",
    email: "",
    phone: "",
    installationDate: "",
    siteVisitAcknowledged: false,
    deliverySameAsProperty: false,
    deliveryPostalCode: "",
    deliveryUnit: "",
    ownership: "rented",
    homeZipCode: "",
    homeUnit: "",
    keyDate: "",
    deliveryAddressDifferent: false,
    paymentMethod: "card",
    agreedToTerms: false,
  });

  useEffect(() => {
    if (!currentProject || !userEmail) return;

    setForm((prev) => ({
      ...prev,
      email: userEmail,
      ownership: currentProject.propertyOwner,
      homeZipCode: currentProject.postalCode ?? "",
      homeUnit: currentProject.unit ?? "",
      keyDate: currentProject.keyCollectionDate ?? "",
    }));
  }, [currentProject, userEmail]);

  useEffect(() => {
    api.cart
      .list(currentProject?._id ?? "")

      .then((data) => {
        const project = data.response.results;
        console.log("project", project);
        setCartItem(project);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
    api.rooms
      .listByProject(currentProject?._id ?? "")
      .then((data) => {
        const project = data.response.results;
        setCartRoom(project);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);
  const set = <K extends keyof CheckoutFormState>(
    key: K,
    value: CheckoutFormState[K],
  ) => setForm((f) => ({ ...f, [key]: value }));

  // Per-room total widths
  const roomWidths = cartItems.map((room) => {
    const totalMm = room.products.reduce((sum, p) => {
      const w = parseInt(
        String((p.config as Record<string, unknown>)?.width ?? "0"),
      );
      return sum + (isNaN(w) ? 0 : w);
    }, 0);
    return { name: room.name, totalMm };
  });

  const isValid =
    form.fullName.trim().length > 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    form.phone.trim().length >= 7 &&
    form.agreedToTerms &&
    (!form.deliveryAddressDifferent ||
      form.deliveryPostalCode.trim().length > 0) &&
    form.homeZipCode.trim().length > 0 &&
    form.homeUnit.trim().length > 0;
  const total = (cartItem ?? []).reduce(
    (sum: number, item: any) => sum + (Number(item.cost) || 0),
    0,
  );
  // const handlePayment = async () => {
  //   try {
  //     const res = await api.payment.create_payment(
  //       total,
  //       userEmail,
  //       `order_${Date.now()}`
  //     );

  //     // adjust based on your API response shape
  //     const url = res?.response.result;

  //     if (!url) {
  //       throw new Error("No payment URL returned");
  //     }

  //     window.location.href = url;
  //   } catch (error) {
  //     console.error("Payment error:", error);
  //     alert("Failed to start payment");
  //   }
  // };
  const handleCheckoutAndPayment = async () => {
    try {
      // 1. Submit checkout (save form + order)
      const checkoutRes = await api.projects.submitCheckout(
        currentProject?._id,
        form,
      );
      console.log("checkoutRes", checkoutRes);
      const orderId = checkoutRes?.response?.results._id;
      // 👈 adjust if your API returns differently

      if (!orderId) {
        throw new Error("No order_id returned from checkout");
      }

      // 2. Start payment using that orderId
      const paymentRes = await api.payment.create_payment(
        total,
        form.email,
        orderId,
      );

      const url = paymentRes?.response?.result;

      if (!url) {
        throw new Error("No payment URL returned");
      }

      // 3. Redirect to HitPay
      window.location.href = url;
    } catch (error) {
      console.error("Checkout/Payment error:", error);
      alert("Failed to proceed to payment");
    }
  };
  useEffect(() => {
    setLoading(true);

    Promise.all([api.series.list(), api.products.get_all_products()])
      .then(([typeRes, productRes]) => {
        const handleTypeData = typeRes.response.results;
        const handleProductData = productRes.response.results;

        setProduct(handleProductData);

        setType(handleTypeData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);
  const isSmallWidth = ["L400mm", "L450mm", "L500mm"];
  const typeMap = Object.fromEntries((type ?? []).map((t: any) => [t._id, t]));

  const productMap = Object.fromEntries(
    (cartItem ?? []).map((p: any) => [p._id, p]),
  );

  const pricingMap = Object.fromEntries(
    (product ?? []).map((p: any) => [p._id, p]),
  );

  // ✅ helper: sketch image (length only)
  function getSketchImage(t: any, product: any) {
    const length = product?.pricing?.length;
    const isSmall = isSmallWidth.includes(length);

    return isSmall ? t.sketchSmall : t.sketchBig;
  }

  // ✅ helper: render image (length + color)
  function getRenderImage(t: any, product: any) {
    const length = product?.pricing?.length;
    const color = product?.internal_color;

    const isSmall = isSmallWidth.includes(length);

    if (color === "Light") {
      return isSmall ? t.photoLightSmall : t.photoLightBig;
    } else {
      return isSmall ? t.photoDarkSmall : t.photoDarkBig;
    }
  }

  // ✅ main transformation
  const roomsForUI = (cartRoom ?? []).map((room: any) => {
    // 🔹 attach products + pricing

    const products = (room.items || [])
      .map((id: string) => productMap[id])
      .filter(Boolean)
      .map((p: any) => {
        const typeData = typeMap[p.type];
        const pricing = pricingMap[p.item];

        const productWithPricing = {
          ...p,
          pricing,
        };

        return {
          ...productWithPricing,
          code: typeData?.code || null,
          sketchImage: typeData
            ? getSketchImage(typeData, productWithPricing)
            : null, // ✅ attach here
        };
      });

    // 🔹 get types used in this room
    const typesUsed = products.map((p: any) => typeMap[p.type]).filter(Boolean);

    // 🔹 remove duplicate types
    const uniqueTypes = Array.from(
      new Map(typesUsed.map((t: any) => [t._id, t])).values(),
    );

    return {
      _id: room._id,
      name: room.name,
      products,

      // ✅ sketch images (1 per type)
      sketchImages: uniqueTypes
        .map((t: any) => {
          const product = products.find((p: any) => p.type === t._id);
          return getSketchImage(t, product);
        })
        .filter(Boolean),

      // ✅ render images (1 per type)
      renderImages: uniqueTypes
        .map((t: any) => {
          const product = products.find((p: any) => p.type === t._id);
          return getRenderImage(t, product);
        })
        .filter(Boolean),
    };
  });
  const formatDate = (value: number | string) => {
    if (!value) return "";

    const date = new Date(value);

    if (isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };
  return (
    <div className="min-h-screen bg-[#faf4e6]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
        <button
          className="flex items-center gap-1.5 text-[#1C1B1F] hover:opacity-70 transition"
          onClick={() => setCurrentPage("cart")}
        >
          <BackIcon />
        </button>
        <h1 className="font-['Poppins'] font-semibold text-base text-[#1C1B1F]">
          Checkout
        </h1>
        <button
          className="px-4 py-1.5 bg-[#7b7267] hover:bg-[#675f56] transition rounded-lg font-['Poppins'] font-medium text-sm text-white"
          onClick={() => setCurrentPage("landing")}
        >
          Home
        </button>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
          {/* ── LEFT COLUMN ── */}
          <div className="space-y-5">
            {/* Customer Information */}
            <SectionCard title="Customer Information">
              <div className="space-y-4">
                <FormInput
                  label="Full Name"
                  value={form.fullName}
                  onChange={(v) => set("fullName", v)}
                  required
                  placeholder="Type here..."
                />
                <FormInput
                  label="Email Address"
                  value={form.email}
                  onChange={(v) => set("email", v)}
                  type="email"
                  required
                  placeholder="Type here..."
                />
                <FormInput
                  label="Phone Number"
                  value={form.phone}
                  onChange={(v) => set("phone", v)}
                  type="tel"
                  required
                  placeholder="Type here..."
                />
              </div>
            </SectionCard>

            {/* Installation Details */}
            <SectionCard title="Installation Details">
              <div className="space-y-4">
                <div>
                  <label className="block font-['Poppins'] font-medium text-sm text-[#1C1B1F] mb-1.5">
                    Installation and Delivery Date
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888]">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                    </span>
                    <input
                      className="w-full bg-[#f5f5f5] rounded-lg pl-10 pr-4 py-3 font-['Poppins'] text-sm text-[#1C1B1F] placeholder:text-[#bbb] outline-none focus:ring-2 focus:ring-[#1C1B1F]/20 transition"
                      onChange={(e) => set("installationDate", e.target.value)}
                      placeholder="Pick a date"
                      type="date"
                      value={form.installationDate}
                    />
                  </div>
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    checked={form.siteVisitAcknowledged}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-[#1C1B1F]"
                    onChange={(e) =>
                      set("siteVisitAcknowledged", e.target.checked)
                    }
                    type="checkbox"
                  />
                  <span className="font-['Poppins'] text-sm text-[#1C1B1F]">
                    I understand that a site visit will be conducted three days
                    after confirmation
                  </span>
                </label>
              </div>
            </SectionCard>

            {/* Delivery Address */}
            <SectionCard title="Delivery Address">
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    checked={form.deliverySameAsProperty}
                    className="w-4 h-4 rounded border-gray-300 accent-[#1C1B1F]"
                    onChange={(e) =>
                      set("deliverySameAsProperty", e.target.checked)
                    }
                    type="checkbox"
                  />
                  <span className="font-['Poppins'] text-sm text-[#1C1B1F]">
                    Same as Property Address
                  </span>
                </label>

                {!form.deliverySameAsProperty && (
                  <>
                    <FormInput
                      label="Postal Code"
                      value={form.deliveryPostalCode}
                      onChange={(v) => set("deliveryPostalCode", v)}
                      placeholder="Type here..."
                    />
                    <FormInput
                      label="Unit (Optional)"
                      value={form.deliveryUnit}
                      onChange={(v) => set("deliveryUnit", v)}
                      placeholder="Type here..."
                    />
                  </>
                )}
              </div>
            </SectionCard>

            {/* Property Info */}
            <SectionCard title="Property Information">
              <div className="space-y-4">
                {/* Ownership toggle */}
                <div>
                  <label className="block font-['Poppins'] font-medium text-sm text-[#1C1B1F] mb-2">
                    Ownership
                  </label>
                  <div className="flex gap-2">
                    {(["own", "rented"] as const).map((opt) => (
                      <button
                        key={opt}
                        className={`px-5 py-2 rounded-full font-['Poppins'] font-medium text-sm transition ${
                          form.ownership === opt
                            ? "bg-[#1C1B1F] text-white"
                            : "bg-[#f0f0f0] text-[#555] hover:bg-[#e0e0e0]"
                        }`}
                        onClick={() => set("ownership", opt)}
                        type="button"
                      >
                        {opt === "own" ? "Own Property" : "Rented Property"}
                      </button>
                    ))}
                  </div>
                </div>

                <FormInput
                  label="Home Zip Code"
                  value={form.homeZipCode}
                  onChange={(v) => set("homeZipCode", v)}
                  placeholder="e.g. 45 Ubi Rd 1, Singapore 408696"
                />
                <FormInput
                  label="Home Unit"
                  value={form.homeUnit}
                  onChange={(v) => set("homeUnit", v)}
                  placeholder="e.g. 3456"
                />

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    checked={form.deliveryAddressDifferent}
                    className="w-4 h-4 rounded border-gray-300 accent-[#1C1B1F]"
                    onChange={(e) =>
                      set("deliveryAddressDifferent", e.target.checked)
                    }
                    type="checkbox"
                  />
                  <span className="font-['Poppins'] text-sm text-[#1C1B1F]">
                    The delivery address is different home address
                  </span>
                </label>

                <div>
                  <label className="block font-['Poppins'] font-medium text-sm text-[#1C1B1F] mb-1.5">
                    Key Collection Date{" "}
                    <span className="font-normal text-[#888]">(Optional)</span>
                  </label>
                  <input
                    className="w-full bg-[#f5f5f5] rounded-lg px-4 py-3 font-['Poppins'] text-sm text-[#1C1B1F] placeholder:text-[#bbb] outline-none focus:ring-2 focus:ring-[#1C1B1F]/20 transition"
                    onChange={(e) => set("keyDate", e.target.value)}
                    placeholder={new Date().toLocaleDateString("en-SG")}
                    type="date"
                    value={formatDate(form.keyDate)}
                  />
                </div>
              </div>
            </SectionCard>

            {/* Payment Method */}
            <SectionCard title="Payment Method">
              <p className="font-['Poppins'] text-xs text-[#888] mb-4">
                Secure payment powered by HitPay
              </p>
              <div className="space-y-3">
                {/* Credit / Debit Card */}
                <label
                  className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition ${
                    form.paymentMethod === "card"
                      ? "border-[#1C1B1F] bg-white"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      form.paymentMethod === "card"
                        ? "border-[#1C1B1F]"
                        : "border-gray-300"
                    }`}
                  >
                    {form.paymentMethod === "card" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#1C1B1F]" />
                    )}
                  </div>
                  <svg
                    className="w-6 h-6 text-[#555] shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                  <div className="flex-1">
                    <p className="font-['Poppins'] font-medium text-sm text-[#1C1B1F]">
                      Credit / Debit Card
                    </p>
                    <p className="font-['Poppins'] text-xs text-[#888]">
                      Visa, Mastercard, Amex
                    </p>
                  </div>
                  <input
                    checked={form.paymentMethod === "card"}
                    className="sr-only"
                    onChange={() => set("paymentMethod", "card")}
                    type="radio"
                  />
                </label>

                {/* PayNow QR */}
                <label
                  className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition ${
                    form.paymentMethod === "paynow"
                      ? "border-[#1C1B1F] bg-white"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      form.paymentMethod === "paynow"
                        ? "border-[#1C1B1F]"
                        : "border-gray-300"
                    }`}
                  >
                    {form.paymentMethod === "paynow" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#1C1B1F]" />
                    )}
                  </div>
                  <svg
                    className="w-6 h-6 text-[#555] shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                  <div className="flex-1">
                    <p className="font-['Poppins'] font-medium text-sm text-[#1C1B1F]">
                      PayNow QR
                    </p>
                    <p className="font-['Poppins'] text-xs text-[#888]">
                      Scan QR code with your banking app
                    </p>
                  </div>
                  <input
                    checked={form.paymentMethod === "paynow"}
                    className="sr-only"
                    onChange={() => set("paymentMethod", "paynow")}
                    type="radio"
                  />
                </label>

                {/* HitPay badge */}
                <div className="flex items-center justify-center gap-2 pt-2">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M5 13l4 4L19 7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                      />
                    </svg>
                  </div>
                  <p className="font-['Poppins'] text-sm text-[#555]">
                    Secured by{" "}
                    <span className="font-semibold text-[#1C1B1F]">HitPay</span>
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* ── RIGHT COLUMN — Order Summary (sticky) ── */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="font-['Poppins'] font-semibold text-base text-[#1C1B1F]">
                  Order Summary
                </h2>
              </div>

              <div className="p-6 space-y-5">
                {/* Room by room */}
                {roomsForUI?.map((room: any, ri: any) => {
                  const widthMm = roomWidths[ri]?.totalMm;
                  return (
                    <div key={room._id}>
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-['Poppins'] font-semibold text-sm text-[#1C1B1F]">
                          {room.name}
                        </p>
                        {widthMm > 0 && (
                          <p className="font-['Poppins'] font-semibold text-sm text-[#1C1B1F]">
                            Total Width: {widthMm}mm
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        {room?.products?.map((p: any) => (
                          <div key={p._id} className="flex items-center gap-3">
                            <div className="w-12 h-14 shrink-0 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden">
                              <img
                                alt={`Type ${p.code}`}
                                className="w-full h-full object-contain"
                                src={p.sketchImage}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-['Poppins'] text-sm text-[#1C1B1F] font-medium">
                                Type {p.code}
                              </p>
                              <p className="font-['Poppins'] text-sm text-[#1C1B1F]">
                                ${p?.cost?.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Divider */}
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between font-['Poppins'] text-sm text-[#555]">
                    <span>Subtotal</span>
                    <span className="font-medium text-[#1C1B1F]">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between font-['Poppins'] font-semibold text-base text-[#1C1B1F]">
                    <span>Total payment:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Terms checkbox */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    checked={form.agreedToTerms}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-[#1C1B1F]"
                    onChange={(e) => set("agreedToTerms", e.target.checked)}
                    type="checkbox"
                  />
                  <span className="font-['Poppins'] text-xs text-[#555]">
                    I agree to the{" "}
                    <button
                      className="underline text-[#1C1B1F] hover:opacity-70"
                      onClick={() => setCurrentPage("terms")}
                      type="button"
                    >
                      Terms & Conditions,
                    </button>{" "}
                    <button
                      className="underline text-[#1C1B1F] hover:opacity-70"
                      onClick={() => setCurrentPage("privacy")}
                      type="button"
                    >
                      Privacy Policy
                    </button>
                  </span>
                </label>

                {/* Pay button */}
                <button
                  className={`w-full py-4 rounded-xl font-['Poppins'] font-medium text-base text-white transition ${
                    isValid
                      ? "bg-[#1C1B1F] hover:bg-[#333] active:scale-[0.98]"
                      : "bg-[#999] cursor-not-allowed"
                  }`}
                  disabled={!isValid}
                  onClick={handleCheckoutAndPayment}
                >
                  Pay ${total.toFixed(2)} SGD
                </button>

                <p className="text-center font-['Poppins'] text-xs text-[#888]">
                  Your payment information is encrypted and secure
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────

export function ProfilePage() {
  const { userEmail, setCurrentPage, previousPage, handleLogout } = useApp();

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-[#332e28] px-4 md:px-8 lg:px-[76px] py-4 flex items-center justify-between">
        <button
          className="flex items-center gap-2 text-white hover:opacity-70 transition"
          onClick={() => setCurrentPage(previousPage)}
        >
          <BackIcon />
          <span className="font-['Poppins'] text-sm">Back</span>
        </button>
        <h1 className="font-['Poppins'] font-semibold text-white text-base">
          My Profile
        </h1>
        <button
          className="font-['Poppins'] text-sm text-white/70 hover:text-white transition"
          onClick={handleLogout}
        >
          Log Out
        </button>
      </header>

      <main className="max-w-xl mx-auto px-4 md:px-8 py-10">
        <div className="bg-[#faf4e6] rounded-2xl p-8 flex flex-col items-center gap-4 mb-8">
          <div className="w-20 h-20 rounded-full bg-[#332e28] flex items-center justify-center">
            <svg className="w-10 h-10" fill="white" viewBox="0 0 24 24">
              <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" />
            </svg>
          </div>
          <p className="font-['Poppins'] font-semibold text-[#1C1B1F] text-lg">
            {userEmail}
          </p>
        </div>

        <nav className="space-y-2">
          {[
            { label: "My Orders", icon: "📦" },
            { label: "My Projects", icon: "🏠" },
            { label: "Settings", icon: "⚙️" },
          ].map(({ label, icon }) => (
            <button
              className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-[#332e28] transition text-left"
              key={label}
            >
              <span className="text-xl">{icon}</span>
              <span className="font-['Poppins'] text-base text-[#1C1B1F]">
                {label}
              </span>
              <svg
                className="w-5 h-5 ml-auto text-gray-400"
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
          ))}
        </nav>
      </main>
    </div>
  );
}
