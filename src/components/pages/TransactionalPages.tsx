import { useState, useCallback, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import type { CartRoom, ProductConfig } from "@/types";
import { api } from "@/services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type PaymentStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "Confirmed" // Bubble capitalises these
  | "Pending";

interface OrderProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  config?: Record<string, unknown>;
}

interface OrderRoom {
  id: string;
  name: string;
  products: OrderProduct[];
}

interface Order {
  _id: string;
  orderNo: string;
  total: number;
  subtotal?: number;
  discount?: number;
  status: PaymentStatus;
  paidOn?: string;
  confirmedOn?: string;
  installationDate?: string | number;
  rooms: OrderRoom[];
  category?: string;
  // raw Bubble fields
  items?: string[];
  paidAmount?: number;
  email?: string;
  fullName?: string;
  phone?: string;
  postalCode?: string;
  unit?: string;
  homeZipCode?: string;
  homeUnit?: string;
  keyCollectionDate?: string | number;
  propertyOwner?: string;
  deliverySameAsProperty?: boolean;
  invoiceNumber?: string;
  "Created Date"?: number;
}

export interface CartProduct {
  _id: string;
  name: string;
  price: number;
  image: string;
  sketchImage?: any;
  config?: ProductConfig;
  cost?: number;
  code?: string;
  pricing?: string;
}

// ─── Shared helpers ────────────────────────────────────────────────────────────

const isSmallWidth = ["L400mm", "L450mm", "L500mm"];

function getSketchImage(t: any, product: any) {
  const length = product?.pricing?.length;
  const isSmall = isSmallWidth.includes(length);
  return isSmall ? t.sketchSmall : t.sketchBig;
}

function getRenderImage(t: any, product: any) {
  const length = product?.pricing?.length;
  const color = product?.internal_color;
  const isSmall = isSmallWidth.includes(length);
  if (color === "Light") return isSmall ? t.photoLightSmall : t.photoLightBig;
  return isSmall ? t.photoDarkSmall : t.photoDarkBig;
}

const formatDate = (value: number | string | undefined) => {
  if (!value) return "";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

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
      if (k === "drawer_lock_text" && config.numlock) displayValue = "Yes";
      return { label: labelMap[k] ?? k, value: displayValue };
    })
    .filter(({ label }) => label !== "numlock");
}

// ─── Image Modal ──────────────────────────────────────────────────────────────

function ImageModal({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl w-full max-w-[70vw] max-h-[90vh] flex items-center justify-center p-6 md:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          aria-label="Close"
          className="absolute top-3 right-3 p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition"
          onClick={onClose}
        >
          <svg
            className="w-5 h-5"
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

        {/* Image */}
        <img
          alt={alt}
          className="max-w-full max-h-[75vh] object-contain"
          src={src}
        />
      </div>
    </div>
  );
}

// ─── Shared icons ─────────────────────────────────────────────────────────────

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

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: PaymentStatus }) {
  const normalised = String(status).toLowerCase();
  const styles: Record<string, string> = {
    pending: "bg-[#e8e8e8] text-[#555]",
    confirmed: "bg-[#4caf50] text-white",
    in_progress: "bg-[#ff9800] text-white",
    completed: "bg-[#2196f3] text-white",
    cancelled: "bg-[#f44336] text-white",
  };
  const labels: Record<string, string> = {
    pending: "Pending Payment Confirm",
    confirmed: "Confirmed",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  const key = normalised.replace(" ", "_");
  return (
    <span
      className={`px-3 py-1.5 rounded font-['Poppins'] font-medium text-xs whitespace-nowrap ${styles[key] ?? "bg-[#e8e8e8] text-[#555]"}`}
    >
      {labels[key] ?? status}
    </span>
  );
}

// ─── JIA Logo ─────────────────────────────────────────────────────────────────

function JIALogo() {
  return (
    <div className="w-[68px] h-[68px] border-2 border-[#1C1B1F] rounded-xl flex items-center justify-center bg-white">
      <svg viewBox="0 0 60 60" className="w-12 h-12" fill="none">
        <rect
          x="3"
          y="3"
          width="54"
          height="54"
          rx="8"
          stroke="#1C1B1F"
          strokeWidth="3"
          fill="white"
        />
        <rect
          x="10"
          y="10"
          width="40"
          height="40"
          rx="5"
          stroke="#1C1B1F"
          strokeWidth="1.5"
          fill="white"
        />
        <text
          x="30"
          y="35"
          textAnchor="middle"
          fontSize="14"
          fontWeight="700"
          fill="#1C1B1F"
          fontFamily="Poppins, sans-serif"
        >
          JIA
        </text>
      </svg>
    </div>
  );
}

// ─── ORDER DETAILS PAGE ───────────────────────────────────────────────────────
// Uses the exact same data-resolution pipeline as the cart page:
//   order.items (cart item IDs) → cartItem records → typeMap/pricingMap → roomsForUI

function OrderDetailsPage({
  order,
  onBack,
}: {
  order: Order;
  onBack: () => void;
}) {
  // Same lookup tables as cart/checkout
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartRooms, setCartRooms] = useState<any[]>([]);
  const [typeList, setTypeList] = useState<any[]>([]);
  const [productList, setProductList] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [handleDesigns, setHandleDesigns] = useState<any[]>([]);
  const [aluminium, setAluminium] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    // We need to find the project this order belongs to so we can query its rooms.
    // The order has order._id — use it to fetch room list the same way as checkout.
    // The items array holds cart item IDs directly on the order.
    Promise.all([
      // 1. fetch every cart item whose _id is in order.items
      //    Reuse api.cart.list but scoped to order — or fetch by order id if your API supports it.
      //    Fallback: fetch all cart items for the project associated with this order.
      api.cart.list
        ? api.cart.list(order._id)
        : Promise.resolve({ response: { results: [] } }),

      // 2. fetch rooms that belong to this order's project
      api.rooms.listByProject
        ? api.rooms.listByProject(order._id ?? "")
        : Promise.resolve({ response: { results: [] } }),

      // 3. same reference data as cart/checkout
      api.portfolio.laminate_color(),
      api.products.get_handle_design(),
      api.products.get_aluminium_finishing(),
      api.series.list(),
      api.products.get_all_products(),
    ])
      .then(
        ([
          cartRes,
          roomRes,
          colorRes,
          handleRes,
          alumRes,
          typeRes,
          productRes,
        ]) => {
          setCartItems(cartRes.response.results ?? []);
          setCartRooms(roomRes.response.results ?? []);
          setColors(colorRes.response.results ?? []);
          setHandleDesigns(handleRes.response.results ?? []);
          setAluminium(alumRes.response.results ?? []);
          setTypeList(typeRes.response.results ?? []);
          setProductList(productRes.response.results ?? []);
        },
      )
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [order._id]);

  // ── Same lookup maps as cart page ──────────────────────────────────────────
  const typeMap = Object.fromEntries(typeList.map((t: any) => [t._id, t]));
  const colorMap = Object.fromEntries(colors.map((c: any) => [c._id, c]));
  const handleMap = Object.fromEntries(
    handleDesigns.map((h: any) => [h._id, h]),
  );
  const finishMap = Object.fromEntries(aluminium.map((a: any) => [a._id, a]));
  const productMap = Object.fromEntries(cartItems.map((p: any) => [p._id, p]));
  const pricingMap = Object.fromEntries(
    productList.map((p: any) => [p._id, p]),
  );

  // ── Same room-building logic as cart page ──────────────────────────────────
  const roomsForUI = cartRooms
    .map((room: any) => {
      const products = (room.items ?? [])
        .map((id: string) => productMap[id])
        .filter(Boolean)
        .map((p: any) => ({
          ...p,
          pricing: pricingMap[p.item],
          code: typeMap[p.type]?.code ?? null,
          laminate_color: colorMap[p.external_color]?.colorDisplayName ?? null,
          handle_design: handleMap[p.handle_design_text]?.name ?? null,
          door_finishing:
            finishMap[p.selected_aluminium_doorType]?.name ?? null,
        }));

      // const typesUsed = Array.from(
      //   new Map(
      //     products
      //       .map((p: any) => [p.type, typeMap[p.type]])
      //       .filter(([, v]: any) => !!v),
      //   ).values(),
      // );

      return {
        id: room._id,
        name: room.name,
        products,
        sketchImages: products
          .map((t: any) =>
            getSketchImage(
              t,
              products.find((p: any) => p.type === t._id),
            ),
          )
          .filter(Boolean),
        renderImages: products
          .map((t: any) =>
            getRenderImage(
              t,
              products.find((p: any) => p.type === t._id),
            ),
          )
          .filter(Boolean),
      };
    })
    .filter((room: any) => room.products.length > 0);

  // ── Pricing totals ─────────────────────────────────────────────────────────
  const total = order.paidAmount ?? 0;
  const subtotal = order.subtotal ?? total / 0.8; // derive if not stored
  const discount = order.discount ?? subtotal - total;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#faf4e6]">
      {/* Header */}
      <header className="bg-white px-4 md:px-8 py-4 flex items-center justify-between border-b border-gray-100">
        <button
          className="flex items-center gap-1 text-[#1C1B1F] hover:opacity-70 transition font-['Poppins'] text-sm font-medium"
          onClick={onBack}
        >
          <svg
            className="w-4 h-4"
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
          Back
        </button>
        <h1 className="font-['Poppins'] font-semibold text-base text-[#1C1B1F]">
          Product Order Details
        </h1>
        <div className="w-16" />
      </header>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 space-y-4">
        {/* Status */}
        <div className="flex justify-end">
          <StatusBadge status={order.status} />
        </div>

        {/* Invoice card */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Logo + meta */}
          <div className="p-6 border-b border-gray-100">
            <JIALogo />
            <div className="mt-5 space-y-1.5">
              <div className="flex gap-3 items-baseline">
                <span className="font-['Poppins'] text-sm text-[#888]">
                  Order no:
                </span>
                <span className="font-['Poppins'] font-semibold text-sm text-[#1C1B1F]">
                  {order.orderNo}
                </span>
              </div>
              {order.invoiceNumber && (
                <div className="flex gap-3 items-baseline">
                  <span className="font-['Poppins'] text-sm text-[#888]">
                    Invoice:
                  </span>
                  <span className="font-['Poppins'] font-semibold text-sm text-[#1C1B1F]">
                    {order.invoiceNumber}
                  </span>
                </div>
              )}
              {formatDate(order.installationDate) && (
                <div className="flex gap-3 items-baseline">
                  <span className="font-['Poppins'] text-sm text-[#888]">
                    Delivery Date and Installation Date:
                  </span>
                  <span className="font-['Poppins'] font-semibold text-sm text-[#1C1B1F]">
                    {formatDate(order.installationDate)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="p-8 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-[#1C1B1F] border-t-transparent rounded-full animate-spin" />
              <span className="ml-3 font-['Poppins'] text-sm text-[#888]">
                Loading order items…
              </span>
            </div>
          )}

          {/* Rooms + products — same card grid as order history Figma */}
          {!loading &&
            roomsForUI.map((room) => (
              <div key={room.id} className="border-b border-gray-100">
                {/* Room name bar */}
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
                  <p className="font-['Poppins'] font-semibold text-sm text-[#1C1B1F]">
                    {room.name}
                  </p>
                </div>

                {/* Product card grid */}
                <div className="px-6 py-5">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {room.products.map((p: any) => {
                      const configEntries = formatConfig(p);
                      return (
                        <div
                          key={p._id}
                          className="border border-gray-200 rounded-lg overflow-hidden"
                        >
                          {/* Sketch image */}
                          <div className="bg-[#f5f5f5] h-[100px] flex items-center justify-center">
                            {(p.sketchImage ?? room.sketchImages[0]) ? (
                              <img
                                alt={`Type ${p.code}`}
                                className="w-full h-full object-contain"
                                src={p.sketchImage ?? room.sketchImages[0]}
                              />
                            ) : (
                              <div className="w-full h-full bg-[#ebebeb]" />
                            )}
                          </div>

                          {/* Name + price */}
                          <div className="p-2 border-b border-gray-100 text-center">
                            <p className="font-['Poppins'] font-semibold text-sm text-[#1C1B1F]">
                              Type {p.code}
                            </p>
                            <p className="font-['Poppins'] font-semibold text-sm text-[#1C1B1F]">
                              ${(p.cost ?? p.price ?? 0).toFixed(2)}
                            </p>
                          </div>

                          {/* Config details */}
                          {configEntries.length > 0 && (
                            <div className="p-2 space-y-0.5">
                              {configEntries.map(({ label, value }) => (
                                <p
                                  key={label}
                                  className="font-['Poppins'] text-[10px] text-[#555]"
                                >
                                  {label}:{"  "}
                                  <span className="text-[#888]">{value}</span>
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}

          {/* Empty state — no rooms resolved yet (e.g. api.rooms.listByOrder missing) */}
          {!loading && roomsForUI.length === 0 && (
            <div className="px-6 py-8 text-center">
              <p className="font-['Poppins'] text-sm text-[#888]">
                Order items will appear here once room data is available.
              </p>
            </div>
          )}

          {/* Pricing lines */}
          <div className="px-6 py-5 space-y-2 border-b border-gray-100">
            <div className="flex justify-end gap-6">
              <span className="font-['Poppins'] text-sm text-[#555]">
                Subtotal:
              </span>
              <span className="font-['Poppins'] font-semibold text-sm text-[#1C1B1F] min-w-[100px] text-right">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-end gap-6">
              <span className="font-['Poppins'] text-sm text-[#555]">
                - 20% Discount:
              </span>
              <span className="font-['Poppins'] font-semibold text-sm text-[#1C1B1F] min-w-[100px] text-right">
                ${discount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Total */}
          <div className="px-6 py-4 flex justify-end gap-6">
            <span className="font-['Poppins'] font-semibold text-base text-[#1C1B1F]">
              Total payment:
            </span>
            <span className="font-['Poppins'] font-bold text-base text-[#1C1B1F] min-w-[100px] text-right">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Status rows */}
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {[
            {
              label: "Paid on:",
              value: formatDate(order["Created Date"]) || "—",
            },
            {
              label: "Confirmed on:",
              value:
                String(order.status).toLowerCase() === "confirmed"
                  ? formatDate(order["Created Date"] ?? "") || "—"
                  : "Pending",
            },
            {
              label: "Delivery Date and Installation Date:",
              value: formatDate(order.installationDate) || "—",
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between px-6 py-4"
            >
              <span className="font-['Poppins'] text-sm text-[#555]">
                {label}
              </span>
              <span
                className={`font-['Poppins'] font-bold text-sm ${
                  value === "Pending" ? "text-[#888]" : "text-[#1C1B1F]"
                }`}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Contact card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="shrink-0 w-[160px] h-[110px] rounded-xl bg-[#e8f4fd] flex items-center justify-center overflow-hidden">
              <svg viewBox="0 0 120 90" className="w-full h-full" fill="none">
                <ellipse cx="65" cy="38" rx="28" ry="18" fill="#c5e3fa" />
                <ellipse cx="48" cy="44" rx="20" ry="14" fill="#c5e3fa" />
                <ellipse cx="80" cy="46" rx="16" ry="12" fill="#c5e3fa" />
                <rect
                  x="42"
                  y="26"
                  width="38"
                  height="24"
                  rx="6"
                  fill="#5bb8f5"
                />
                <polygon points="48,50 42,56 54,50" fill="#5bb8f5" />
                <rect x="48" y="31" width="5" height="4" rx="1" fill="white" />
                <rect x="56" y="31" width="5" height="4" rx="1" fill="white" />
                <rect x="64" y="31" width="5" height="4" rx="1" fill="white" />
                <rect
                  x="48"
                  y="38"
                  width="18"
                  height="3"
                  rx="1.5"
                  fill="white"
                  opacity=".7"
                />
                <circle cx="30" cy="52" r="10" fill="#f9c97c" />
                <rect
                  x="20"
                  y="62"
                  width="20"
                  height="24"
                  rx="5"
                  fill="#3a7bd5"
                />
                <circle cx="30" cy="50" r="6" fill="#f5b660" />
                <path
                  d="M24 50 Q24 40 36 40 Q42 40 42 50"
                  stroke="#555"
                  strokeWidth="2"
                  fill="none"
                />
                <rect x="22" y="48" width="4" height="6" rx="2" fill="#555" />
                <rect x="34" y="48" width="4" height="6" rx="2" fill="#555" />
              </svg>
            </div>
            <div className="flex flex-col items-center md:items-start gap-3">
              <p className="font-['Poppins'] font-medium text-sm text-[#1C1B1F]">
                Any Questions? Contact us here
              </p>
              <button className="px-6 py-2.5 bg-[#1C1B1F] hover:bg-[#333] transition rounded-lg font-['Poppins'] font-medium text-sm text-white">
                Customer Service
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SHOPPING CART PAGE ───────────────────────────────────────────────────────
const CONFIG_ORDER = [
  "Internal color",
  "External color",
  "Width",
  "Door Type",
  "Door Opens",
  "Side Panel",
  "Drawer Lock",
  "Number of Lock",
  "Handle Design",
  "Handle Color",
  "Aluminium Frame Color",
  "Door Finishing",
  "LED Light",
  "Blum Runner",
  "Remarks",
];

interface RoomSectionProps {
  room: CartRoom;
  onDeleteRoom: (roomId: string) => void;
  onDeleteProduct: (roomId: string, productId: string) => void;
}
function DeleteItemModal({
  productName,
  onConfirm,
  onCancel,
}: {
  productName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onCancel}
      role="dialog"
    >
      <div
        className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
          <svg
            className="w-6 h-6 text-red-500"
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
        </div>

        <div className="text-center">
          <h3 className="font-['Poppins'] font-bold text-lg text-[#1C1B1F]">
            Remove Product?
          </h3>
          <p className="font-['Poppins'] text-sm text-[#666] mt-1">
            Are you sure you want to remove{" "}
            <span className="font-semibold text-[#1C1B1F]">
              Type {productName}
            </span>{" "}
            from your cart?
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <button
            className="w-full bg-red-500 hover:bg-red-600 active:scale-95 transition py-3 rounded-xl font-['Poppins'] font-semibold text-base text-white"
            onClick={onConfirm}
          >
            Yes, Remove
          </button>
          <button
            className="w-full border border-gray-200 hover:bg-gray-50 transition py-3 rounded-xl font-['Poppins'] text-base text-[#414042]"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
function ProductCard({
  product,
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const sortedEntries = [...configEntries].sort((a, b) => {
    const ai = CONFIG_ORDER.indexOf(a.label);
    const bi = CONFIG_ORDER.indexOf(b.label);
    // Unknown labels go to the end
    const aPos = ai === -1 ? CONFIG_ORDER.length : ai;
    const bPos = bi === -1 ? CONFIG_ORDER.length : bi;
    return aPos - bPos;
  });
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
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
          onClick={() => setShowDeleteModal(true)}
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>

      {configEntries.length > 0 && (
        <div className="px-3 pb-3 border-t border-gray-100 pt-2 grid grid-cols-1 gap-0.5">
          {sortedEntries.map(({ label, value }) => (
            <p key={label} className="font-['Poppins'] text-xs text-[#555]">
              <span className="capitalize">{label}</span>:{"  "}
              {value}
            </p>
          ))}
          {widthMm && (
            <p className="font-['Poppins'] text-xs text-[#555]">
              Width :{"  "}
              {widthMm}
            </p>
          )}
        </div>
      )}
      {showDeleteModal && (
        <DeleteItemModal
          productName={product?.code ?? product?.name}
          onConfirm={() => {
            setShowDeleteModal(false);
            onDelete();
          }}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}
function DeleteRoomModal({
  roomName,
  onConfirm,
  onCancel,
}: {
  roomName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
          <svg
            className="w-6 h-6 text-red-500"
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
        </div>

        <div className="text-center">
          <h3 className="font-['Poppins'] font-bold text-lg text-[#1C1B1F]">
            Delete Room?
          </h3>
          <p className="font-['Poppins'] text-sm text-[#666] mt-1">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-[#1C1B1F]">{roomName}</span> and
            all its products? This cannot be undone.
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <button
            className="w-full bg-red-500 hover:bg-red-600 active:scale-95 transition py-3 rounded-xl font-['Poppins'] font-semibold text-base text-white"
            onClick={onConfirm}
          >
            Yes, Delete Room
          </button>
          <button
            className="w-full border border-gray-200 hover:bg-gray-50 transition py-3 rounded-xl font-['Poppins'] text-base text-[#414042]"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
function RoomSection({
  room,
  onDeleteRoom,
  onDeleteProduct,
}: RoomSectionProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [modalImage, setModalImage] = useState<{
    src: string;
    alt: string;
  } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [products, setProducts] = useState(room.products); // ← local order state
  const [dragOver, setDragOver] = useState<number | null>(null);
  const dragIndex = useRef<number | null>(null);
  useEffect(() => {
    setProducts(room.products);
  }, [room._id]);

  function handleDragStart(index: number) {
    dragIndex.current = index;
  }
  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault(); // allow drop
    if (dragIndex.current === null || dragIndex.current === index) return;

    // Reorder locally while dragging
    setProducts((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex.current!, 1);
      next.splice(index, 0, moved);
      dragIndex.current = index; // update so continuous drag works
      return next;
    });
  }
  function handleDrop() {
    if (dragIndex.current === null) return;

    if (dragOver !== null && dragIndex.current !== dragOver) {
      setProducts((prev) => {
        const next = [...prev];
        const [moved] = next.splice(dragIndex.current!, 1);
        next.splice(dragOver, 0, moved);

        // Persist to Bubble
        // const newIds = next.map((p) => p._id);
        // api.rooms.reorderProducts(room._id, newIds).catch(console.error);

        return next;
      });
    }

    dragIndex.current = null;
    setDragOver(null);
  }

  function handleDragEnd() {
    dragIndex.current = null;
    setDragOver(null);
  }
  return (
    <section className="border-b border-gray-200 pb-6">
      <div className="flex items-center justify-between py-3">
        <h2 className="font-['Poppins'] font-semibold text-base text-[#1C1B1F]">
          {room?.name}
        </h2>
        <div className="flex items-center gap-2">
          <button
            aria-label={`Delete ${room.name}`}
            className="p-1.5 text-red-400 hover:text-red-600 transition"
            onClick={() => setShowDeleteModal(true)}
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
          {room?.sketchImages && room?.sketchImages.length > 0 && (
            <div>
              <p className="font-['Poppins'] text-sm text-[#555] mb-2">
                Sketch
              </p>
              <div className="flex  overflow-x-auto pb-1">
                {room?.sketchImages.map((src, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      setModalImage({ src, alt: `Sketch ${i + 1}` })
                    }
                    className="shrink-0  h-[110px] rounded-lg overflow-hidden "
                  >
                    <img
                      alt={`Sketch ${i + 1}`}
                      className="w-full h-full object-contain"
                      src={src}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
          {room?.renderImages && room?.renderImages.length > 0 && (
            <div>
              <p className="font-['Poppins'] text-sm text-[#555] mb-2">
                3D Render
              </p>
              <div className="flex overflow-x-auto pb-1">
                {room?.renderImages.map((src, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      setModalImage({ src, alt: `3D Render ${i + 1}` })
                    }
                    className="shrink-0  h-[110px] overflow-hidden "
                  >
                    <img
                      alt={`Render ${i + 1}`}
                      className="w-full h-full object-contain"
                      src={src}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="font-['Poppins'] text-sm text-[#555] mb-2">
              Products (Drag to rearrange):
            </p>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {products.map((product, index) => (
                <div
                  key={product._id}
                  className="shrink-0 w-[280px] cursor-grab active:cursor-grabbing"
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={() => handleDrop()}
                  onDragEnd={handleDragEnd}
                >
                  <ProductCard
                    product={product}
                    roomId={room?._id}
                    sketch={product.sketchImage ?? room.sketchImages[0]}
                    onDelete={() => onDeleteProduct(room?._id, product?._id)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Image zoom modal — rendered per RoomSection so only one is ever open */}
      {modalImage && (
        <ImageModal
          src={modalImage.src}
          alt={modalImage.alt}
          onClose={() => setModalImage(null)}
        />
      )}
      {showDeleteModal && (
        <DeleteRoomModal
          roomName={room.name}
          onConfirm={() => {
            setShowDeleteModal(false);
            onDeleteRoom(room._id);
          }}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </section>
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

  const [activeTab, setActiveTab] = useState<"cart" | "history">("cart");
  const [cartItem, setCartItem] = useState<any[]>([]);
  const [cartRoom, setCartRoom] = useState<any[]>([]);
  const [, setLoading] = useState(true);
  const [aluminium, setAluminium] = useState<any[]>([]);
  const [type, setType] = useState<any[]>([]);
  const [product, setProduct] = useState<any[]>([]);
  const [handleDesign, setHandleDesign] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [paidProject, setPaidProject] = useState<any[]>([]);

  useEffect(() => {
    if (!currentProject?._id) return;
    let isMounted = true;
    setLoading(true);
    Promise.all([
      api.cart.list(currentProject._id),
      api.rooms.listByProject(currentProject._id),
    ])
      .then(([cartRes, roomRes]) => {
        if (!isMounted) return;
        setCartItem(cartRes.response.results ?? []);
        setCartRoom(roomRes.response.results ?? []);
      })
      .catch(console.error)
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [currentProject?._id]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.portfolio.laminate_color(),
      api.products.get_handle_design(),
      api.products.get_aluminium_finishing(),
      api.series.list(),
      api.products.get_all_products(),
      api.projects.get_paid_project(),
    ])
      .then(
        ([
          colorRes,
          handleDesignRes,
          aluminiumDesign,
          typeRes,
          productRes,
          paidProjectRes,
        ]) => {
          setColors(colorRes.response.results ?? []);
          setProduct(productRes.response.results ?? []);
          setHandleDesign(handleDesignRes.response.results ?? []);
          setAluminium(aluminiumDesign.response.results ?? []);
          setType(typeRes.response.results ?? []);
          setPaidProject(paidProjectRes.response.results ?? []);
        },
      )
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const total = cartItem.reduce(
    (sum: number, item: any) => sum + (Number(item.cost) || 0),
    0,
  );

  const handleDeleteRoom = useCallback(
    async (roomId: string) => {
      try {
        // 1. Delete every cart item in this room from Bubble
        const room = cartItems.find((r) => r._id === roomId);
        if (room) {
          await Promise.all(room.products.map((p) => api.cart.remove(p._id)));
        }

        // 2. Delete the room record itself from Bubble
        await api.rooms.delete(roomId);

        // 3. Update local state — remove all products then the room
        room?.products.forEach((p) => handleDeleteProduct(roomId, p._id));

        // 4. Remove the room from cartRoom local state
        setCartRoom((prev: any[]) => prev.filter((r: any) => r._id !== roomId));
      } catch (err) {
        console.error("Failed to delete room:", err);
      }
    },
    [cartItems, handleDeleteProduct],
  );

  const typeMap = Object.fromEntries(type.map((t: any) => [t._id, t]));
  const handleMap = Object.fromEntries(
    handleDesign.map((h: any) => [h._id, h]),
  );
  const colorMap = Object.fromEntries(colors.map((h: any) => [h._id, h]));
  const finishMap = Object.fromEntries(aluminium.map((h: any) => [h._id, h]));
  const productMap = Object.fromEntries(cartItem.map((p: any) => [p._id, p]));
  const pricingMap = Object.fromEntries(product.map((p: any) => [p._id, p]));

  const roomsForUI = cartRoom
    .map((room: any) => {
      const products = (room.items ?? [])
        .map((id: string) => productMap[id])
        .filter(Boolean)
        .map((p: any) => {
          const pricing = pricingMap[p.item];
          const typeData = typeMap[p.type];
          const withPricing = { ...p, pricing };
          console.log("pricing object:", pricing);
          console.log("pricing.length:", pricing?.length);
          console.log("typeData:", typeData?.code);
          return {
            ...withPricing,
            pricing,
            code: typeData?.code ?? null,
            handle_design: handleMap[p.handle_design_text]?.name ?? null,
            laminate_color:
              colorMap[p.external_color]?.colorDisplayName ?? null,
            door_finishing:
              finishMap[p.selected_aluminium_doorType]?.name ?? null,
            // ✅ per-product image using its own pricing/color
            sketchImage: typeData
              ? getSketchImage(typeData, withPricing)
              : null,
            renderImage: typeData
              ? getRenderImage(typeData, withPricing)
              : null,
          };
        });

      return {
        _id: room._id,
        name: room.name,
        products,
        // ✅ build image arrays from per-product images
        sketchImages: products.map((p: any) => p.sketchImage).filter(Boolean),
        renderImages: products.map((p: any) => p.renderImage).filter(Boolean),
      };
    })
    .filter((room: any) => room.products.length > 0);

  // ── Order History inner component (scoped here to share paidProject state) ──

  function OrderHistoryTab() {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    if (selectedOrder) {
      return (
        <OrderDetailsPage
          order={selectedOrder}
          onBack={() => setSelectedOrder(null)}
        />
      );
    }

    return (
      <div className="py-5 space-y-6">
        <div className="mb-4">
          <span className="inline-block bg-[#1C1B1F] text-white font-['Poppins'] font-semibold text-sm px-5 py-2 rounded-full">
            Modular Carpentry
          </span>
        </div>

        <div className="space-y-3">
          {paidProject.map((order: any) => (
            <div
              key={order._id}
              className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm pt-2"
            >
              <div className="flex items-start justify-between px-5 pt-5 pb-3 gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-['Poppins'] font-bold text-sm text-[#1C1B1F]">
                    Order No : {order?.orderNo}
                  </p>
                  <p className="font-['Poppins'] text-sm text-[#888] mt-2">
                    Total Price
                  </p>
                  <p className="font-['Poppins'] font-bold text-lg text-[#1C1B1F]">
                    $
                    {order?.paidAmount?.toLocaleString("en-SG", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <div className="border-t border-gray-100 px-5 py-3 flex justify-end">
                <button
                  className="font-['Poppins'] text-sm text-[#1C1B1F] hover:opacity-60 transition"
                  onClick={() => setSelectedOrder(order)}
                >
                  View Order details
                </button>
              </div>
            </div>
          ))}
        </div>

        {paidProject.length === 0 && (
          <div className="text-center py-16">
            <p className="font-['Poppins'] text-base text-[#888]">
              No past orders yet.
            </p>
          </div>
        )}
      </div>
    );
  }

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
          {(["cart", "history"] as const).map((tab) => (
            <button
              key={tab}
              className={`py-3 font-['Poppins'] text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-[#1C1B1F] text-[#1C1B1F]"
                  : "border-transparent text-[#888] hover:text-[#555]"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "cart" ? "Current Cart" : "Order History"}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-8 pb-28">
        {activeTab === "history" ? (
          <OrderHistoryTab />
        ) : roomsForUI?.length === 0 ? (
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

// ─── CHECKOUT PAGE ────────────────────────────────────────────────────────────

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
  const { userEmail, cartItems, setCurrentPage, currentProject } = useApp();

  const [cartItem, setCartItem] = useState<any[]>([]);
  const [cartRoom, setCartRoom] = useState<any[]>([]);
  const [, setLoading] = useState(true);
  const [type, setType] = useState<any[]>([]);
  const [product, setProduct] = useState<any[]>([]);

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
      .then((data) => setCartItem(data.response.results ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
    api.rooms
      .listByProject(currentProject?._id ?? "")
      .then((data) => setCartRoom(data.response.results ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.series.list(), api.products.get_all_products()])
      .then(([typeRes, productRes]) => {
        setType(typeRes.response.results ?? []);
        setProduct(productRes.response.results ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof CheckoutFormState>(
    key: K,
    value: CheckoutFormState[K],
  ) => setForm((f) => ({ ...f, [key]: value }));

  const total = cartItem.reduce(
    (sum: number, item: any) => sum + (Number(item.cost) || 0),
    0,
  );

  const roomWidths = cartItems.map((room) => ({
    name: room.name,
    totalMm: room.products.reduce((sum, p) => {
      const w = parseInt(
        String((p.config as Record<string, unknown>)?.width ?? "0"),
      );
      return sum + (isNaN(w) ? 0 : w);
    }, 0),
  }));

  const isValid =
    form.fullName.trim().length > 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    form.phone.trim().length >= 7 &&
    form.agreedToTerms &&
    form.siteVisitAcknowledged &&
    form.installationDate &&
    (!form.deliverySameAsProperty ||
      form.deliveryPostalCode.trim().length > 0) &&
    form.homeZipCode.trim().length > 0 &&
    form.homeUnit.trim().length > 0;

  const typeMap = Object.fromEntries(type.map((t: any) => [t._id, t]));
  const productMap = Object.fromEntries(cartItem.map((p: any) => [p._id, p]));
  const pricingMap = Object.fromEntries(product.map((p: any) => [p._id, p]));

  function getSketchImageLocal(t: any, p: any) {
    const length = p?.pricing?.length;
    return isSmallWidth.includes(length) ? t.sketchSmall : t.sketchBig;
  }

  const roomsForUI = cartRoom
    .map((room: any) => {
      const products = (room.items ?? [])
        .map((id: string) => productMap[id])
        .filter(Boolean)
        .map((p: any) => {
          const typeData = typeMap[p.type];
          const pricing = pricingMap[p.item];
          const withPricing = { ...p, pricing };
          return {
            ...withPricing,
            code: typeData?.code ?? null,
            sketchImage: typeData
              ? getSketchImageLocal(typeData, withPricing)
              : null,
          };
        });

      const uniqueTypes = Array.from(
        new Map(
          products
            .map((p: any) => [p.type, typeMap[p.type]])
            .filter(([, v]: any) => !!v),
        ).values(),
      );

      return {
        _id: room._id,
        name: room.name,
        products,
        sketchImages: uniqueTypes
          .map((t: any) =>
            getSketchImage(
              t,
              products.find((p: any) => p.type === t._id),
            ),
          )
          .filter(Boolean),
        renderImages: uniqueTypes
          .map((t: any) =>
            getRenderImage(
              t,
              products.find((p: any) => p.type === t._id),
            ),
          )
          .filter(Boolean),
      };
    })
    .filter((room: any) => room.products.length > 0);

  const formatDateLocal = (value: number | string) => {
    if (!value) return "";
    const date = new Date(value);
    if (isNaN(date.getTime())) return "";
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const handleCheckoutAndPayment = async () => {
    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        installationDate: form.installationDate,
        siteVisitAcknowledged: form.siteVisitAcknowledged,
        deliverySameAsProperty: form.deliverySameAsProperty,
        deliveryPostalCode: form.deliveryPostalCode,
        ownership: form.ownership,
        homeZipCode: form.homeZipCode,
        homeUnit: form.homeUnit,
        paymentMethod: form.paymentMethod,

        // Optional — only included when they have a value
        ...(form.deliveryUnit?.trim()
          ? { deliveryUnit: form.deliveryUnit }
          : {}),
        ...(form.keyDate?.trim() ? { keyDate: form.keyDate } : {}),
      };

      const checkoutRes = await api.projects.submitCheckout(
        currentProject?._id,
        payload,
      );
      const orderId = checkoutRes?.response?.results._id;
      if (!orderId) throw new Error("No order_id returned from checkout");
      const paymentRes = await api.payment.create_payment(
        total,
        form.email,
        orderId,
        `${window.location.origin}?page=paymentSuccess`,
      );
      const url = paymentRes?.response?.result;
      if (!url) throw new Error("No payment URL returned");
      window.location.href = url;
    } catch (error) {
      console.error("Checkout/Payment error:", error);
      alert("Failed to proceed to payment");
    }
  };
  const minInstallationDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0]; // "YYYY-MM-DD"
  })();
  return (
    <div className="min-h-screen bg-[#faf4e6]">
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
          {/* Left column */}
          <div className="space-y-5">
            <SectionCard title="Customer Information">
              <div className="space-y-4">
                <FormInput
                  label="Full Name"
                  value={form.fullName}
                  onChange={(v) => set("fullName", v)}
                  required
                />
                <FormInput
                  label="Email Address"
                  value={form.email}
                  onChange={(v) => set("email", v)}
                  type="email"
                  required
                />
                <FormInput
                  label="Phone Number"
                  value={form.phone}
                  onChange={(v) => set("phone", v)}
                  type="tel"
                  required
                />
              </div>
            </SectionCard>

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
                      min={minInstallationDate}
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

            <SectionCard title="Property Information">
              <div className="space-y-4">
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
                    value={formatDateLocal(form.keyDate)}
                  />
                </div>
              </div>
            </SectionCard>

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
                    />
                    <FormInput
                      label="Unit (Optional)"
                      value={form.deliveryUnit}
                      onChange={(v) => set("deliveryUnit", v)}
                    />
                  </>
                )}
              </div>
            </SectionCard>
            <SectionCard title="Payment Method">
              <p className="font-['Poppins'] text-xs text-[#888] mb-4">
                Secure payment powered by HitPay
              </p>
              <div className="space-y-3">
                {[
                  {
                    value: "card" as const,
                    label: "Credit / Debit Card",
                    sub: "Visa, Mastercard, Amex",
                    icon: (
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
                    ),
                  },
                  {
                    value: "paynow" as const,
                    label: "PayNow QR",
                    sub: "Scan QR code with your banking app",
                    icon: (
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
                    ),
                  },
                ].map(({ value, label, sub, icon }) => (
                  <label
                    key={value}
                    className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition ${
                      form.paymentMethod === value
                        ? "border-[#1C1B1F] bg-white"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        form.paymentMethod === value
                          ? "border-[#1C1B1F]"
                          : "border-gray-300"
                      }`}
                    >
                      {form.paymentMethod === value && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#1C1B1F]" />
                      )}
                    </div>
                    {icon}
                    <div className="flex-1">
                      <p className="font-['Poppins'] font-medium text-sm text-[#1C1B1F]">
                        {label}
                      </p>
                      <p className="font-['Poppins'] text-xs text-[#888]">
                        {sub}
                      </p>
                    </div>
                    <input
                      checked={form.paymentMethod === value}
                      className="sr-only"
                      onChange={() => set("paymentMethod", value)}
                      type="radio"
                    />
                  </label>
                ))}
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

          {/* Right — sticky summary */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="font-['Poppins'] font-semibold text-base text-[#1C1B1F]">
                  Order Summary
                </h2>
              </div>
              <div className="p-6 space-y-5">
                {roomsForUI?.map((room: any, ri: number) => {
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
