import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "@/services/api";
import { uploadFile, validateFile } from "@/services/cloudinary";
import InvoicePage from "@/components/pages/InvoicePage";

type Role = "admin" | "salesperson" | "vendor";

interface BubbleOrder {
  _id: string;
  orderNo: string;
  invoiceNumber: string;
  fullName: string;
  email: string;
  phone: string;
  paidStatus?: string;
  paidAmount: number;
  status: string;
  payment_status: string;
  "Created Date": number;
  installationDate?: number;
  homeZipCode?: string;
  homeUnit?: string;
  paid?: boolean;
  items?: string[];
  project?: string;
  assignedTo?: string;
  assignedToName?: string;
  assignedToList?: string[];
  assignedToNames?: string[];
  doNumber?: string;
  imageLibrary?: string[];
}

interface BubbleUser {
  _id: string;
  email: string;
  FirstName?: string;
  LastName?: string;
  phone?: string;
  ContactNumber?: string;
  role?: string;
  userRole?: string;
  authentication: { email: { email: string } };
  "Created Date": number;
}

interface BubbleSalesperson {
  _id: string;
  email: string;
  FirstName?: string;
  LastName?: string;
  role?: string;
}

interface BubbleMessage {
  _id: string;
  from_user: string;
  to_user: string;
  body: string;
  sender_role: string;
  read: boolean;
  "Created Date": number;
  from_user_email?: string;
  to_user_email?: string;
  from_user_name?: string;
  to_user_name?: string;
}

interface Conversation {
  userId: string;
  userName: string;
  userEmail: string;
  lastMessage: string;
  lastTime: number;
  unread: number;
  messages: BubbleMessage[];
}

function statusColor(s: string) {
  const m: Record<string, string> = {
    confirmed: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    Confirmed: "bg-emerald-100 text-emerald-700",
    Pending: "bg-amber-100 text-amber-700",
    in_progress: "bg-blue-100 text-blue-700",
    completed: "bg-gray-100 text-gray-600",
    cancelled: "bg-red-100 text-red-700",
  };
  return m[s] ?? "bg-gray-100 text-gray-600";
}

function statusLabel(s: string) {
  return s.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function formatDate(ts?: number | string): string {
  if (!ts) return "—";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return String(ts);
  return d.toLocaleDateString("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000),
    h = Math.floor(diff / 3600000),
    d = Math.floor(diff / 86400000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor(status)}`}
    >
      {statusLabel(status)}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon,
  sub,
}: {
  label: string;
  value: string;
  icon: string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-[#f5f0e8] flex items-center justify-center text-lg shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-[#1C1B1F] font-['Poppins']">
          {value}
        </p>
        <p className="text-sm text-[#888] font-['Poppins']">{label}</p>
        {sub && (
          <p className="text-xs text-emerald-600 font-['Poppins'] mt-0.5">
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-2 border-[#1C1B1F] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function Sidebar({
  title,
  subtitle,
  color,
  tabs,
  activeTab,
  onTabChange,
  onSignOut,
}: {
  title: string;
  subtitle: string;
  color: string;
  tabs: { id: string; label: string; icon: string }[];
  activeTab: string;
  onTabChange: (id: string) => void;
  onSignOut: () => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavContent = () => (
    <>
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-black/20 border border-white/20 flex items-center justify-center">
              <span className="text-white text-xs font-bold font-['Poppins']">
                JIA
              </span>
            </div>
            <div>
              <p className="text-white font-['Poppins'] font-semibold text-sm">
                {title}
              </p>
              <p className="text-white/50 font-['Poppins'] text-[10px]">
                {subtitle}
              </p>
            </div>
          </div>
          <button
            className="md:hidden p-1 text-white/60 hover:text-white transition"
            onClick={() => setMobileOpen(false)}
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
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition ${activeTab === tab.id ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"}`}
            onClick={() => {
              onTabChange(tab.id);
              setMobileOpen(false);
            }}
          >
            <span>{tab.icon}</span>
            <span className="font-['Poppins'] text-sm">{tab.label}</span>
          </button>
        ))}
      </nav>
      <div className="px-3 pb-4">
        <button
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition"
          onClick={onSignOut}
        >
          <span>↩</span>
          <span className="font-['Poppins'] text-sm">Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3.5"
        style={{ backgroundColor: color }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-black/20 border border-white/20 flex items-center justify-center">
            <span className="text-white text-[10px] font-bold font-['Poppins']">
              JIA
            </span>
          </div>
          <p className="text-white font-['Poppins'] font-semibold text-sm">
            {title}
          </p>
        </div>
        <button
          className="p-1.5 text-white/80 hover:text-white transition"
          onClick={() => setMobileOpen(true)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M4 6h16M4 12h16M4 18h16"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        </button>
      </div>
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={`md:hidden fixed top-0 left-0 h-full w-64 z-50 flex flex-col transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ backgroundColor: color }}
      >
        <NavContent />
      </aside>
      <aside
        className="hidden md:flex fixed top-0 left-0 h-screen w-56 flex-col z-30"
        style={{ backgroundColor: color }}
      >
        <NavContent />
      </aside>
      <div className="hidden md:block w-56 shrink-0" />
    </>
  );
}

// ── helpers ───────────────────────────────────────────────────────────────────
const SMALL_WIDTHS = ["L400mm", "L450mm", "L500mm"];

function getSketchImg(t: any, p: any) {
  const isSmall = SMALL_WIDTHS.includes(p?.pricing?.length);
  return isSmall ? t.sketchSmall : t.sketchBig;
}
function getRenderImg(t: any, p: any) {
  const isSmall = SMALL_WIDTHS.includes(p?.pricing?.length);
  const color = p?.internal_color;
  if (color === "Light") return isSmall ? t.photoLightSmall : t.photoLightBig;
  return isSmall ? t.photoDarkSmall : t.photoDarkBig;
}
function fmtConfig(
  p: Record<string, unknown>,
): Array<{ label: string; value: string }> {
  const labelMap: Record<string, string> = {
    internal_color: "Internal Color",
    laminate_color: "External Color",
    led_light_text: "LED Light",
    door_type: "Door Type",
    side_panel_text: "Side Panel",
    drawer_lock_text: "Drawer Lock",
    handle_design: "Handle Design",
    door_finishing: "Door Finishing",
    blum_runner_upgrade_text: "Blum Runner",
  };
  const skip = new Set([
    "_id",
    "Created Date",
    "Modified Date",
    "item",
    "type",
    "room",
    "project cart",
    "user",
    "status",
    "pricing",
    "blum_runner_upgrade",
    "external_color",
    "handle_design_text",
    "selected_aluminium_doorType",
    "cost",
    "code",
    "sketchImage",
    "renderImage",
    "laminate_color",
    "handle_design",
    "door_finishing",
  ]);
  return Object.entries(p)
    .filter(
      ([k, v]) =>
        labelMap[k] &&
        v !== null &&
        v !== undefined &&
        typeof v !== "object" &&
        v !== "" &&
        !skip.has(k),
    )
    .map(([k, v]) => ({ label: labelMap[k], value: String(v) }));
}

// ── Shared product resolution hook ────────────────────────────────────────────
function useOrderItems(order: BubbleOrder) {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartRooms, setCartRooms] = useState<any[]>([]);
  const [typeList, setTypeList] = useState<any[]>([]);
  const [productList, setProductList] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [handles, setHandles] = useState<any[]>([]);
  const [aluminium, setAluminium] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!order.project && !order._id) return;
    setLoading(true);
    const projectId = order.project ?? order._id;
    Promise.all([
      api.cart.list(projectId),
      api.rooms.listByProject(projectId),
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
          setHandles(handleRes.response.results ?? []);
          setAluminium(alumRes.response.results ?? []);
          setTypeList(typeRes.response.results ?? []);
          setProductList(productRes.response.results ?? []);
        },
      )
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [order._id]);

  const typeMap = Object.fromEntries(typeList.map((t: any) => [t._id, t]));
  const colorMap = Object.fromEntries(colors.map((c: any) => [c._id, c]));
  const handleMap = Object.fromEntries(handles.map((h: any) => [h._id, h]));
  const finishMap = Object.fromEntries(aluminium.map((a: any) => [a._id, a]));
  const productMap = Object.fromEntries(cartItems.map((p: any) => [p._id, p]));
  const pricingMap = Object.fromEntries(
    productList.map((p: any) => [p._id, p]),
  );
  const cartItemIdSet = new Set(cartItems.map((p: any) => p._id));

  const roomsForUI = cartRooms
    .map((room: any) => {
      const resolvedIds = (room.items ?? []).filter((id: string) =>
        cartItemIdSet.has(id),
      );
      const products = resolvedIds
        .map((id: string) => productMap[id])
        .filter(Boolean)
        .map((p: any) => {
          const pricing = pricingMap[p.item];
          const typeData = typeMap[p.type];
          const withPricing = { ...p, pricing };
          return {
            ...withPricing,
            code: typeData?.code ?? null,
            laminate_color:
              colorMap[p.external_color]?.colorDisplayName ?? null,
            handle_design: handleMap[p.handle_design_text]?.name ?? null,
            door_finishing:
              finishMap[p.selected_aluminium_doorType]?.name ?? null,
            sketchImage: typeData ? getSketchImg(typeData, withPricing) : null,
            renderImage: typeData ? getRenderImg(typeData, withPricing) : null,
          };
        });
      return {
        id: room._id,
        name: room.name,
        products,
        sketchImages: products.map((p: any) => p.sketchImage).filter(Boolean),
      };
    })
    .filter((r: any) => r.products.length > 0);

  return { roomsForUI, loading };
}

// ── Product items display ─────────────────────────────────────────────────────
function OrderItems({ order }: { order: BubbleOrder }) {
  const { roomsForUI, loading } = useOrderItems(order);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="font-['Poppins'] font-semibold text-sm text-[#1C1B1F]">
          Order Items
        </h3>
      </div>
      {loading && (
        <div className="flex items-center justify-center gap-3 py-8">
          <div className="w-5 h-5 border-2 border-[#1C1B1F] border-t-transparent rounded-full animate-spin" />
          <span className="font-['Poppins'] text-sm text-[#888]">
            Loading items…
          </span>
        </div>
      )}
      {!loading &&
        roomsForUI.map((room: any) => (
          <div key={room.id} className="border-b border-gray-100 last:border-0">
            <div className="px-5 py-2.5 bg-gray-50 border-b border-gray-100">
              <p className="font-['Poppins'] font-semibold text-sm text-[#1C1B1F]">
                {room.name}
              </p>
            </div>
            {room.sketchImages.length > 0 && (
              <div className="px-5 py-3 flex gap-3 overflow-x-auto border-b border-gray-50">
                {room.products.map((p: any) => (
                  <div key={p._id} className="shrink-0 flex gap-2">
                    {p.sketchImage && (
                      <div className="w-[70px] h-[90px] border border-gray-200 rounded-lg bg-[#f5f5f5] overflow-hidden">
                        <img
                          alt="sketch"
                          className="w-full h-full object-contain"
                          src={
                            p.sketchImage.startsWith("http")
                              ? p.sketchImage
                              : `https:${p.sketchImage}`
                          }
                        />
                      </div>
                    )}
                    {p.renderImage && (
                      <div className="w-[70px] h-[90px] border border-gray-200 rounded-lg bg-[#f5f5f5] overflow-hidden">
                        <img
                          alt="render"
                          className="w-full h-full object-contain"
                          src={
                            p.renderImage.startsWith("http")
                              ? p.renderImage
                              : `https:${p.renderImage}`
                          }
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {room.products.map((p: any) => {
                const configEntries = fmtConfig(p);
                const src = p.sketchImage ?? room.sketchImages[0];
                return (
                  <div
                    key={p._id}
                    className="border border-gray-200 rounded-xl overflow-hidden bg-white flex gap-3 p-3"
                  >
                    <div className="w-[60px] h-[75px] shrink-0 rounded-lg bg-[#f5f5f5] border border-gray-100 overflow-hidden">
                      {src ? (
                        <img
                          alt={`Type ${p.code}`}
                          className="w-full h-full object-contain"
                          src={src.startsWith("http") ? src : `https:${src}`}
                        />
                      ) : (
                        <div className="w-full h-full bg-[#ebebeb]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-['Poppins'] font-semibold text-sm text-[#1C1B1F]">
                        Type {p.code}
                      </p>
                      <p className="font-['Poppins'] font-bold text-sm text-[#1C1B1F] mb-1.5">
                        ${(p.cost ?? 0).toFixed(2)}
                      </p>
                      <div className="space-y-0.5">
                        {configEntries.map(({ label, value }) => (
                          <p
                            key={label}
                            className="font-['Poppins'] text-[10px] text-[#555]"
                          >
                            {label}:{" "}
                            <span className="text-[#888]">{value}</span>
                          </p>
                        ))}
                        {p.laminate_color && (
                          <p className="font-['Poppins'] text-[10px] text-[#555]">
                            External Color:{" "}
                            <span className="text-[#888]">
                              {p.laminate_color}
                            </span>
                          </p>
                        )}
                        {p.handle_design && (
                          <p className="font-['Poppins'] text-[10px] text-[#555]">
                            Handle:{" "}
                            <span className="text-[#888]">
                              {p.handle_design}
                            </span>
                          </p>
                        )}
                        {p.door_finishing && (
                          <p className="font-['Poppins'] text-[10px] text-[#555]">
                            Finishing:{" "}
                            <span className="text-[#888]">
                              {p.door_finishing}
                            </span>
                          </p>
                        )}
                        {p.pricing?.length && (
                          <p className="font-['Poppins'] text-[10px] text-[#555]">
                            Width:{" "}
                            <span className="text-[#888]">
                              {p.pricing.length}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      {!loading && roomsForUI.length === 0 && (
        <div className="px-5 py-8 text-center">
          <p className="font-['Poppins'] text-sm text-[#bbb]">
            No items found for this order.
          </p>
        </div>
      )}
      <div className="px-5 py-4 border-t border-gray-100 flex justify-end">
        <div className="min-w-[200px]">
          <div className="flex justify-between font-['Poppins'] font-bold text-base text-[#1C1B1F] pt-1.5">
            <span>Total Paid</span>
            <span>
              $
              {(order.paidAmount ?? 0).toLocaleString("en-SG", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Confirm status modal ──────────────────────────────────────────────────────
function ConfirmStatusModal({
  currentStatus,
  newStatus,
  onConfirm,
  onCancel,
}: {
  currentStatus: string;
  newStatus: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
          <svg
            className="w-6 h-6 text-amber-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        </div>
        <div className="text-center">
          <h3 className="font-['Poppins'] font-bold text-lg text-[#1C1B1F]">
            Update Order Status?
          </h3>
          <p className="font-['Poppins'] text-sm text-[#666] mt-1">
            Change from{" "}
            <span className="font-semibold text-[#1C1B1F]">
              {currentStatus}
            </span>{" "}
            to <span className="font-semibold text-[#1C1B1F]">{newStatus}</span>
            ?
          </p>
        </div>
        <div className="flex flex-col gap-2 pt-1">
          <button
            className="w-full bg-[#1C1B1F] hover:bg-[#333] active:scale-95 transition py-3 rounded-xl font-['Poppins'] font-semibold text-base text-white"
            onClick={onConfirm}
          >
            Yes, Update Status
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

// ── Image library modal (admin only) ─────────────────────────────────────────
function ImageLibraryModal({
  orderId,
  images,
  onClose,
}: {
  orderId: string;
  images: string[];
  onClose: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [localImages, setLocalImages] = useState<string[]>(images);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        const validationError = validateFile(file);
        if (validationError) {
          console.error(validationError);
          continue;
        }
        const result = await uploadFile(file);
        if (result.secure_url) uploaded.push(result.secure_url);
      }
      const newImages = [...localImages, ...uploaded];
      setLocalImages(newImages);
      await (api.admin as any).updateOrderImages?.(orderId, newImages);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(url: string) {
    if (!window.confirm("Delete this image? This cannot be undone.")) return;
    setDeletingUrl(url);
    const newImages = localImages.filter((img) => img !== url);
    setLocalImages(newImages);
    if (lightboxIdx !== null && localImages[lightboxIdx] === url) {
      setLightboxIdx(null);
    }
    try {
      await (api.admin as any).updateOrderImages?.(orderId, newImages);
    } catch (err) {
      console.error(err);
      setLocalImages(localImages);
    } finally {
      setDeletingUrl(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-['Poppins'] font-bold text-base text-[#1C1B1F]">
            Image Library
          </h3>
          <div className="flex items-center gap-3">
            <label
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-['Poppins'] text-sm font-medium cursor-pointer transition ${uploading ? "bg-gray-100 text-gray-400" : "bg-[#1C1B1F] text-white hover:bg-[#333]"}`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              {uploading ? "Uploading…" : "Upload Images"}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
            <button
              className="p-1.5 text-[#555] hover:text-[#1C1B1F] transition"
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
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {localImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-3xl">
                🖼
              </div>
              <p className="font-['Poppins'] text-sm text-[#bbb]">
                No images yet — upload some above
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {localImages.map((src, i) => (
                <div key={i} className="relative group aspect-square">
                  <button
                    className="w-full h-full rounded-xl overflow-hidden border border-gray-200 hover:border-gray-400 transition"
                    onClick={() => setLightboxIdx(i)}
                  >
                    <img
                      alt={`Order image ${i + 1}`}
                      className="w-full h-full object-cover"
                      src={src.startsWith("//") ? `https:${src}` : src}
                    />
                  </button>
                  <button
                    className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition disabled:opacity-50"
                    disabled={deletingUrl === src}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(src);
                    }}
                    title="Delete image"
                  >
                    {deletingUrl === src ? (
                      <svg
                        className="w-3.5 h-3.5 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-3.5 h-3.5"
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
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxIdx(null)}
        >
          <img
            alt="Preview"
            className="max-w-full max-h-[90vh] object-contain rounded-xl"
            src={
              localImages[lightboxIdx].startsWith("//")
                ? `https:${localImages[lightboxIdx]}`
                : localImages[lightboxIdx]
            }
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition"
            onClick={() => setLightboxIdx(null)}
          >
            <svg
              className="w-5 h-5 text-white"
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
          {lightboxIdx > 0 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/30 rounded-full transition"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIdx(lightboxIdx - 1);
              }}
            >
              <svg
                className="w-5 h-5 text-white"
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
          )}
          {lightboxIdx < localImages.length - 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/30 rounded-full transition"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIdx(lightboxIdx + 1);
              }}
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 5l7 7-7 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Order detail panel (admin + salesperson) ──────────────────────────────────
function OrderDetailPanel({
  order,
  onBack,
  onStatusChange,
  salespersons = [],
  isAdmin = false,
}: {
  order: BubbleOrder;
  onBack: () => void;
  onStatusChange: (id: string, status: string) => Promise<void>;
  salespersons?: BubbleSalesperson[];
  isAdmin?: boolean;
}) {
  const [updating, setUpdating] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [assignedList, setAssignedList] = useState<string[]>(
    order.assignedToList ?? (order.assignedTo ? [order.assignedTo] : []),
  );
  const [assignedNames, setAssignedNames] = useState<string[]>(
    order.assignedToNames ??
      (order.assignedToName ? [order.assignedToName] : []),
  );
  const [loadingAssigned, setLoadingAssigned] = useState(isAdmin);
  const [selectedSalesperson, setSelectedSalesperson] = useState("");
  const [doNumber, setDoNumber] = useState(order.doNumber ?? "");
  const [savingAssign, setSavingAssign] = useState(false);
  const [unassigning, setUnassigning] = useState<string | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceRooms, setInvoiceRooms] = useState<any[]>([]);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  async function handleShowInvoice() {
    setShowInvoice(true);
    if (invoiceRooms.length > 0) return;
    setLoadingInvoice(true);
    try {
      const [cartRes, roomRes, colorRes, handleRes, alumRes, typeRes, productRes] =
        await Promise.all([
          api.cart.list(order._id),
          api.rooms.listByProject(order._id),
          api.portfolio.laminate_color(),
          api.products.get_handle_design(),
          api.products.get_aluminium_finishing(),
          api.series.list(),
          api.products.get_all_products(),
        ]);

      const cartItems: any[] = cartRes.response.results ?? [];
      const cartRooms: any[] = roomRes.response.results ?? [];
      const colors: any[] = colorRes.response.results ?? [];
      const handleDesigns: any[] = handleRes.response.results ?? [];
      const aluminium: any[] = alumRes.response.results ?? [];
      const typeList: any[] = typeRes.response.results ?? [];
      const productList: any[] = productRes.response.results ?? [];

      const cartItemIdSet = new Set(cartItems.map((p: any) => p._id));
      const typeMap = Object.fromEntries(typeList.map((t: any) => [t._id, t]));
      const colorMap = Object.fromEntries(colors.map((c: any) => [c._id, c]));
      const handleMap = Object.fromEntries(handleDesigns.map((h: any) => [h._id, h]));
      const finishMap = Object.fromEntries(aluminium.map((a: any) => [a._id, a]));
      const productMap = Object.fromEntries(cartItems.map((p: any) => [p._id, p]));
      const pricingMap = Object.fromEntries(productList.map((p: any) => [p._id, p]));
      const smallWidths = ["L400mm", "L450mm", "L500mm"];

      const resolved = cartRooms
        .map((room: any) => {
          const products = (room.items ?? [])
            .filter((id: string) => cartItemIdSet.has(id))
            .map((id: string) => productMap[id])
            .filter(Boolean)
            .map((p: any) => {
              const pricing = pricingMap[p.item];
              const typeData = typeMap[p.type];
              const isSmall = smallWidths.includes(pricing?.length);
              const sketchImage = typeData
                ? isSmall
                  ? typeData.sketchSmall
                  : typeData.sketchBig
                : null;
              return {
                _id: p._id,
                code: typeData?.code ?? null,
                cost: p.cost ?? 0,
                sketchImage,
                internal_color: p.internal_color ?? null,
                laminate_color: colorMap[p.external_color]?.colorDisplayName ?? null,
                led_light_text: p.led_light_text ?? null,
                width: pricing?.length ?? null,
                door_type: p.door_type ?? null,
                side_panel_text: p.side_panel_text ?? null,
                handle_design: handleMap[p.handle_design_text]?.name ?? null,
                door_finishing: finishMap[p.selected_aluminium_doorType]?.name ?? null,
              };
            });
          return {
            id: room._id,
            name: room.name,
            products,
            sketchImages: products.map((p: any) => p.sketchImage).filter(Boolean),
          };
        })
        .filter((r: any) => r.products.length > 0);

      setInvoiceRooms(resolved);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingInvoice(false);
    }
  }

  useEffect(() => {
    if (!isAdmin) return;
    (api.admin as any)
      .getOrderSalespersons?.(order._id)
      .then((res: any) => {
        const results: any[] = res?.response?.results ?? [];
        setAssignedList(results.map((s: any) => s._id));
        setAssignedNames(
          results.map((s: any) =>
            s.FirstName ? `${s.FirstName} ${s.LastName ?? ""}`.trim() : s.email,
          ),
        );
      })
      .catch(() => {
        /* keep fallback state from order fields */
      })
      .finally(() => setLoadingAssigned(false));
  }, [order._id, isAdmin]);
  const [savingDO, setSavingDO] = useState(false);
  const [resending, setResending] = useState(false);
  const [showImageLib, setShowImageLib] = useState(false);

  async function handle(status: string) {
    setUpdating(true);
    await onStatusChange(order._id, status);
    setUpdating(false);
    setPendingStatus(null);
  }

  async function handleAssign() {
    if (!selectedSalesperson || assignedList.includes(selectedSalesperson))
      return;
    setSavingAssign(true);
    try {
      await (api.admin as any).assignOrder?.(order._id, selectedSalesperson);
      const sp = salespersons.find((s) => s._id === selectedSalesperson);
      const name = sp
        ? sp.FirstName
          ? `${sp.FirstName} ${sp.LastName || ""}`.trim()
          : sp.email
        : selectedSalesperson;
      setAssignedList((prev) => [...prev, selectedSalesperson]);
      setAssignedNames((prev) => [...prev, name]);
      setSelectedSalesperson("");
    } catch (e) {
      console.error(e);
    } finally {
      setSavingAssign(false);
    }
  }

  async function handleUnassign(salespersonId: string) {
    setUnassigning(salespersonId);
    try {
      await (api.admin as any).unassignOrder?.(order._id, salespersonId);
      setAssignedList((prev) => prev.filter((id) => id !== salespersonId));
      setAssignedNames((prev) => {
        const idx = assignedList.indexOf(salespersonId);
        return prev.filter((_, i) => i !== idx);
      });
    } catch (e) {
      console.error(e);
    } finally {
      setUnassigning(null);
    }
  }

  async function handleSaveDO() {
    if (!doNumber.trim()) return;
    setSavingDO(true);
    try {
      await (api.admin as any).updateDONumber?.(order._id, doNumber.trim());
    } catch (e) {
      console.error(e);
    } finally {
      setSavingDO(false);
    }
  }

  async function handleResendInvoice() {
    setResending(true);
    try {
      await (api.admin as any).resendInvoice?.(order._id, order.email);
    } catch (e) {
      console.error(e);
    } finally {
      setResending(false);
    }
  }

  const statuses = [
    "Confirmed",
    "Site Visit",
    "Fabricating",
    "Delivering",
    "Installation",
    "Completed",
  ];

  if (showInvoice) {
    if (loadingInvoice) {
      return (
        <div className="min-h-screen bg-[#faf4e6] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#1C1B1F] border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }
    return (
      <InvoicePage
        order={{ ...order, rooms: invoiceRooms }}
        onBack={() => setShowInvoice(false)}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <button
            className="flex items-center gap-2 text-[#555] hover:text-[#1C1B1F] transition font-['Poppins'] text-sm"
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
            Back to Orders
          </button>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg font-['Poppins'] text-xs text-[#555] hover:border-gray-400 transition"
              onClick={handleShowInvoice}
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
                <path
                  d="M13 3v6h6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              View Invoice
            </button>
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg font-['Poppins'] text-xs text-[#555] hover:border-gray-400 transition"
              onClick={handleResendInvoice}
              disabled={resending}
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              {resending ? "Sending…" : "Resend Invoice"}
            </button>
            {isAdmin && (
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg font-['Poppins'] text-xs text-[#555] hover:border-gray-400 transition"
                onClick={() => setShowImageLib(true)}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                Image Library{" "}
                {(order.imageLibrary ?? []).length > 0 &&
                  `(${order.imageLibrary!.length})`}
              </button>
            )}
            <StatusBadge status={(order.paidStatus as string) || ""} />
          </div>
        </div>

        {/* Meta grid */}
        <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Order No", value: order.orderNo },
            { label: "Invoice", value: order.invoiceNumber },
            { label: "Customer", value: order.fullName },
            { label: "Email", value: order.email },
            { label: "Phone", value: order.phone || "—" },
            { label: "Date", value: formatDate(order["Created Date"]) },
            {
              label: "Installation",
              value: formatDate(order.installationDate),
            },
            {
              label: "Address",
              value: order.homeUnit
                ? `${order.homeUnit}, ${order.homeZipCode}`
                : order.homeZipCode || "—",
            },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3">
              <p className="font-['Poppins'] text-[10px] text-[#888] mb-1 uppercase tracking-wider">
                {label}
              </p>
              <p className="font-['Poppins'] font-semibold text-sm text-[#1C1B1F] break-all">
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Payment */}
        <div className="mx-5 mb-5 bg-[#faf4e6] rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="font-['Poppins'] text-xs text-[#888]">Total Amount</p>
            <p className="font-['Poppins'] font-bold text-xl text-[#1C1B1F]">
              $
              {order.paidAmount?.toLocaleString("en-SG", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="font-['Poppins'] text-xs text-[#888]">Payment</p>
            <p
              className={`font-['Poppins'] font-semibold text-sm mt-0.5 ${order.paid === true ? "text-emerald-600" : "text-amber-600"}`}
            >
              {order.paid === true ? "✓ Paid" : "Awaiting Payment"}
            </p>
          </div>
        </div>
      </div>

      {/* Assign + DO — admin only */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="font-['Poppins'] font-semibold text-sm text-[#1C1B1F] mb-3">
              Assign to Salesperson
            </p>
            <div className="flex gap-2">
              <select
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 font-['Poppins'] text-sm text-[#1C1B1F] outline-none"
                value={selectedSalesperson}
                onChange={(e) => setSelectedSalesperson(e.target.value)}
              >
                <option value="">— Select salesperson —</option>
                {salespersons
                  .filter((s) => !assignedList.includes(s._id))
                  .map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.FirstName
                        ? `${s.FirstName} ${s.LastName || ""}`.trim()
                        : s.email}
                    </option>
                  ))}
              </select>
              <button
                className="px-4 py-2.5 bg-[#1C1B1F] text-white rounded-lg font-['Poppins'] text-sm hover:bg-[#333] transition disabled:opacity-50"
                disabled={!selectedSalesperson || savingAssign}
                onClick={handleAssign}
              >
                {savingAssign ? "Saving…" : "Assign"}
              </button>
            </div>
            {loadingAssigned ? (
              <p className="font-['Poppins'] text-xs text-[#888] mt-3">
                Loading…
              </p>
            ) : assignedList.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-3">
                {assignedList.map((id, idx) => (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full font-['Poppins'] text-xs text-[#1C1B1F]"
                  >
                    {assignedNames[idx] ?? id}
                    <button
                      className="text-[#888] hover:text-red-500 transition disabled:opacity-40"
                      disabled={unassigning === id}
                      onClick={() => handleUnassign(id)}
                      title="Unassign"
                    >
                      {unassigning === id ? "…" : "×"}
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="font-['Poppins'] text-xs text-[#888] mt-3">
                No salesperson assigned
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="font-['Poppins'] font-semibold text-sm text-[#1C1B1F] mb-3">
              Delivery Order (DO) Number
            </p>
            <div className="flex gap-2">
              <input
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 font-['Poppins'] text-sm text-[#1C1B1F] outline-none"
                placeholder="e.g. DO-2026-001"
                value={doNumber}
                onChange={(e) => setDoNumber(e.target.value)}
              />
              <button
                className="px-4 py-2.5 bg-[#1C1B1F] text-white rounded-lg font-['Poppins'] text-sm hover:bg-[#333] transition disabled:opacity-50"
                disabled={!doNumber.trim() || savingDO}
                onClick={handleSaveDO}
              >
                {savingDO ? "Saving…" : "Save"}
              </button>
            </div>
            {order.doNumber && (
              <p className="font-['Poppins'] text-xs text-[#888] mt-2">
                Current:{" "}
                <span className="font-semibold text-[#1C1B1F]">
                  {order.doNumber}
                </span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Product items */}
      <OrderItems order={order} />

      {/* Status update */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <p className="font-['Poppins'] font-semibold text-sm text-[#1C1B1F] mb-3">
          Update Order Status
        </p>
        <div className="flex gap-2 flex-wrap">
          {statuses.map((s) => {
            const val = s.toLowerCase().replace(" ", "_");
            const cur =
              order.paidStatus?.toLowerCase() === val ||
              order.paidStatus?.toLowerCase() === s.toLowerCase();
            return (
              <button
                key={s}
                disabled={cur || updating}
                className={`px-4 py-2 rounded-lg font-['Poppins'] text-sm transition border ${cur ? "bg-[#1C1B1F] text-white border-[#1C1B1F]" : "border-gray-200 text-[#555] hover:border-gray-400 disabled:opacity-50"}`}
                onClick={() => setPendingStatus(s)}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {pendingStatus && (
        <ConfirmStatusModal
          currentStatus={order.paidStatus as string}
          newStatus={pendingStatus}
          onConfirm={() => handle(pendingStatus)}
          onCancel={() => setPendingStatus(null)}
        />
      )}

      {showImageLib && isAdmin && (
        <ImageLibraryModal
          orderId={order._id}
          images={order.imageLibrary ?? []}
          onClose={() => setShowImageLib(false)}
        />
      )}
    </div>
  );
}

// ── Chat panel ────────────────────────────────────────────────────────────────
function ChatPanel({
  currentUserRole,
  accentColor = "#1C1B1F",
}: {
  currentUserRole: string;
  accentColor?: string;
}) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await api.admin.listConversations();
      const msgs: BubbleMessage[] = res?.response?.results ?? [];
      const convMap = new Map<string, Conversation>();
      msgs.forEach((msg) => {
        const isFromCustomer = msg.sender_role === "customer";
        const customerId = isFromCustomer ? msg.from_user : msg.to_user;
        const customerName = isFromCustomer
          ? msg.from_user_name || msg.from_user_email || customerId
          : msg.to_user_name || msg.to_user_email || msg.to_user;
        const customerEmail = isFromCustomer
          ? msg.from_user_email || ""
          : msg.to_user_email || "";
        if (!convMap.has(customerId)) {
          convMap.set(customerId, {
            userId: customerId,
            userName: customerName,
            userEmail: customerEmail,
            lastMessage: msg.body,
            lastTime: msg["Created Date"],
            unread: 0,
            messages: [],
          });
        }
        const conv = convMap.get(customerId)!;
        conv.messages.push(msg);
        if (msg["Created Date"] > conv.lastTime) {
          conv.lastMessage = msg.body;
          conv.lastTime = msg["Created Date"];
        }
        if (isFromCustomer && !msg.read) conv.unread += 1;
      });
      convMap.forEach((c) => {
        c.messages.sort((a, b) => a["Created Date"] - b["Created Date"]);
      });
      const list = Array.from(convMap.values()).sort(
        (a, b) => b.lastTime - a.lastTime,
      );
      setConversations(list);
      if (activeConv) {
        const u = list.find((c) => c.userId === activeConv.userId);
        if (u) setActiveConv(u);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeConv?.userId]);

  useEffect(() => {
    fetchMessages();
    const i = setInterval(fetchMessages, 10000);
    return () => clearInterval(i);
  }, []);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages.length]);

  async function handleSend() {
    if (!message.trim() || !activeConv || sending) return;
    setSending(true);
    try {
      await api.admin.sendMessage(
        activeConv.userId,
        message.trim(),
        currentUserRole,
      );
      setMessage("");
      await fetchMessages();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 h-[72vh]">
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
        <div className="px-4 py-3.5 border-b border-gray-100">
          <h2 className="font-['Poppins'] font-semibold text-sm text-[#1C1B1F]">
            Customer Chats
          </h2>
        </div>
        {loading ? (
          <Spinner />
        ) : (
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {conversations.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <p className="font-['Poppins'] text-sm text-[#bbb]">
                  No conversations yet
                </p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.userId}
                  className={`w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-gray-50 transition ${activeConv?.userId === conv.userId ? "bg-gray-50" : ""}`}
                  onClick={() => setActiveConv(conv)}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 relative text-white text-xs font-bold"
                    style={{ backgroundColor: accentColor }}
                  >
                    {(conv.userName[0] ?? "?").toUpperCase()}
                    {conv.unread > 0 && (
                      <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={`font-['Poppins'] text-sm truncate ${conv.unread > 0 ? "font-semibold text-[#1C1B1F]" : "font-medium text-[#555]"}`}
                      >
                        {conv.userName}
                      </p>
                      <p className="font-['Poppins'] text-[10px] text-[#bbb] shrink-0">
                        {timeAgo(conv.lastTime)}
                      </p>
                    </div>
                    <p className="font-['Poppins'] text-xs text-[#888] truncate">
                      {conv.lastMessage}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
        {activeConv ? (
          <>
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: accentColor }}
                >
                  {(activeConv.userName[0] ?? "?").toUpperCase()}
                </div>
                <div>
                  <p className="font-['Poppins'] font-semibold text-sm text-[#1C1B1F]">
                    {activeConv.userName}
                  </p>
                  <p className="font-['Poppins'] text-xs text-[#888]">
                    {activeConv.userEmail}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#888] font-['Poppins']">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                Active
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {activeConv.messages.map((msg) => {
                const isAdmin = msg.sender_role !== "customer";
                return (
                  <div
                    key={msg._id}
                    className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[72%] px-4 py-2.5 rounded-2xl ${isAdmin ? "rounded-br-sm text-white" : "rounded-bl-sm bg-gray-100 text-[#1C1B1F]"}`}
                      style={isAdmin ? { backgroundColor: accentColor } : {}}
                    >
                      <p className="font-['Poppins'] text-sm leading-relaxed">
                        {msg.body}
                      </p>
                      <p
                        className={`font-['Poppins'] text-[10px] mt-1 ${isAdmin ? "text-white/60" : "text-[#bbb]"}`}
                      >
                        {timeAgo(msg["Created Date"])}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            <div className="px-4 py-3 border-t border-gray-100 flex gap-3">
              <textarea
                className="flex-1 bg-gray-50 rounded-xl px-4 py-2.5 font-['Poppins'] text-sm text-[#1C1B1F] outline-none resize-none max-h-24"
                placeholder="Type a message… (Enter to send)"
                rows={1}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button
                className="px-4 py-2.5 rounded-xl text-white font-['Poppins'] text-sm font-medium transition hover:opacity-80 disabled:opacity-50 shrink-0"
                disabled={!message.trim() || sending}
                style={{ backgroundColor: accentColor }}
                onClick={handleSend}
              >
                {sending ? "…" : "Send"}
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl">
              💬
            </div>
            <p className="font-['Poppins'] text-sm text-[#bbb]">
              Select a conversation to start
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Role selection ────────────────────────────────────────────────────────────
function RoleSelectionPage({ onSelect }: { onSelect: (role: Role) => void }) {
  const [selected, setSelected] = useState<Role | null>(null);
  const roles = [
    {
      id: "admin" as Role,
      title: "Admin",
      icon: "☆",
      desc: "Full access to all sections including user management, orders, and chats.",
      features: [
        "Chats",
        "Orders (all stages)",
        "User management",
        "Update order status",
      ],
      login: "admin@jiaideas.com",
      password: "test1234",
    },
    {
      id: "salesperson" as Role,
      title: "Salesperson",
      icon: "👥",
      desc: "Access to customer chats and all order stages. Cannot manage users.",
      features: [
        "Chats",
        "Orders (all stages)",
        "Send invoices & confirm orders",
      ],
      login: "sales@jiaideas.com",
      password: "test1234",
    },
    {
      id: "vendor" as Role,
      title: "Vendor",
      icon: "🗂",
      desc: "View-only access to fabrication and installation orders.",
      features: [
        "Fabrication, Installation & completion stages",
        "Read-only view",
      ],
      login: "vendor@jiaideas.com",
      password: "test1234",
    },
  ];
  return (
    <div className="min-h-screen bg-[#faf4e6] flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-6 opacity-30">
        <svg viewBox="0 0 64 64" fill="none" className="w-14 h-14 mx-auto">
          <rect
            x="4"
            y="20"
            width="56"
            height="36"
            rx="3"
            stroke="#1C1B1F"
            strokeWidth="2"
          />
          <rect
            x="20"
            y="4"
            width="24"
            height="20"
            rx="2"
            stroke="#1C1B1F"
            strokeWidth="2"
          />
          <line
            x1="32"
            y1="20"
            x2="32"
            y2="56"
            stroke="#1C1B1F"
            strokeWidth="1.5"
          />
          <line
            x1="4"
            y1="38"
            x2="60"
            y2="38"
            stroke="#1C1B1F"
            strokeWidth="1.5"
          />
        </svg>
      </div>
      <h1 className="font-['Poppins'] font-bold text-3xl text-[#1C1B1F] mb-2">
        Admin Portal
      </h1>
      <p className="font-['Poppins'] text-[#888] text-base mb-10">
        Select your role to continue
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-4xl mb-8">
        {roles.map((role) => (
          <button
            key={role.id}
            className={`text-left bg-white rounded-2xl p-6 border-2 transition-all relative ${selected === role.id ? "border-[#1C1B1F] shadow-lg" : "border-gray-200 hover:border-gray-300"}`}
            onClick={() => setSelected(role.id)}
          >
            {selected === role.id && (
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#1C1B1F] flex items-center justify-center">
                <svg
                  className="w-3.5 h-3.5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M5 13l4 4L19 7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                  />
                </svg>
              </div>
            )}
            <div className="text-2xl mb-4">{role.icon}</div>
            <h2 className="font-['Poppins'] font-bold text-lg text-[#1C1B1F] mb-2">
              {role.title}
            </h2>
            <p className="font-['Poppins'] text-sm text-[#888] mb-4 leading-relaxed">
              {role.desc}
            </p>
            <ul className="space-y-1.5 mb-5">
              {role.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <svg
                    className="w-4 h-4 text-[#1C1B1F] mt-0.5 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M5 13l4 4L19 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                  <span className="font-['Poppins'] text-xs text-[#555]">
                    {f}
                  </span>
                </li>
              ))}
            </ul>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="font-['Poppins'] text-[10px] text-[#888] mb-1">
                Test login
              </p>
              <p className="font-['Poppins'] text-xs text-[#1C1B1F] font-medium">
                {role.login}
              </p>
              <p className="font-['Poppins'] text-xs text-[#888]">
                password: {role.password}
              </p>
            </div>
          </button>
        ))}
      </div>
      <button
        className={`px-10 py-3.5 rounded-xl font-['Poppins'] font-semibold text-base transition ${selected ? "bg-[#1C1B1F] text-white hover:bg-[#333] active:scale-95" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
        disabled={!selected}
        onClick={() => selected && onSelect(selected)}
      >
        {selected
          ? `Sign in as ${roles.find((r) => r.id === selected)?.title}`
          : "Select a role"}
      </button>
      <p className="font-['Poppins'] text-xs text-[#bbb] mt-4">
        For testing purposes only
      </p>
    </div>
  );
}

// ── Admin dashboard ───────────────────────────────────────────────────────────
function AdminDashboard({ onSignOut }: { onSignOut: () => void }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [orders, setOrders] = useState<BubbleOrder[]>([]);
  const [users, setUsers] = useState<BubbleUser[]>([]);
  const [salespersons, setSalespersons] = useState<BubbleSalesperson[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<BubbleOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [assigningRole, setAssigningRole] = useState<string | null>(null);
  const [roleValue, setRoleValue] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");

  useEffect(() => {
    setLoading(true);
    Promise.all([api.admin.listOrders(), api.admin.listUsers()])
      .then(([o, u]) => {
        const allUsers = u?.response?.results ?? [];
        setOrders(o?.response?.results ?? []);
        setUsers(allUsers);
        setSalespersons(
          allUsers.filter(
            (u: any) => u.userRole === "salesperson" || u.userRole === "admin",
          ),
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleStatusChange(id: string, status: string) {
    await api.admin.updateOrderStatus(id, status);
    setOrders((p) =>
      p.map((o) => (o._id === id ? { ...o, paidStatus: status } : o)),
    );
    setSelectedOrder((p) => (p ? { ...p, paidStatus: status } : null));
  }

  async function handleAssignRole(userId: string, role: string) {
    try {
      await (api.admin as any).assignUserRole?.(userId, role);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, userRole: role } : u)),
      );
      const updated = users.find((u) => u._id === userId);
      if (updated) {
        const withRole = { ...updated, userRole: role };
        if (role === "salesperson" || role === "admin") {
          setSalespersons((prev) =>
            prev.find((s) => s._id === userId)
              ? prev.map((s) => (s._id === userId ? withRole : s))
              : [...prev, withRole],
          );
        } else {
          setSalespersons((prev) => prev.filter((s) => s._id !== userId));
        }
      }
    } catch (e) {
      console.error(e);
    }
    setAssigningRole(null);
    setRoleValue("");
  }

  const totalRevenue = orders.reduce((s, o) => s + (o.paidAmount ?? 0), 0);
  const confirmed = orders.filter((o) => o.paid === true).length;
  const pending = orders.filter((o) => o.paid !== true).length;

  const filteredOrders = orders.filter((o) => {
    const q = searchTerm.toLowerCase();
    const ms =
      !searchTerm ||
      o.orderNo?.toLowerCase().includes(q) ||
      o.fullName?.toLowerCase().includes(q) ||
      o.email?.toLowerCase().includes(q);
    const mf =
      filterStatus === "all" ||
      o.paidStatus?.toLowerCase() === filterStatus.toLowerCase();
    return ms && mf;
  });

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex">
      <Sidebar
        title="Admin Portal"
        subtitle="Administrator"
        color="#1C1B1F"
        activeTab={activeTab}
        onSignOut={onSignOut}
        onTabChange={(t) => {
          setActiveTab(t);
          setSelectedOrder(null);
        }}
        tabs={[
          { id: "overview", label: "Overview", icon: "⊞" },
          { id: "orders", label: "Orders", icon: "📦" },
          { id: "users", label: "Users", icon: "👥" },
          { id: "chats", label: "Chats", icon: "💬" },
        ]}
      />
      <main className="flex-1 overflow-auto pt-14 md:pt-0">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <h1 className="font-['Poppins'] font-bold text-lg text-[#1C1B1F] capitalize">
            {selectedOrder
              ? "Order Details"
              : activeTab === "overview"
                ? "Dashboard Overview"
                : activeTab}
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1C1B1F] flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <span className="font-['Poppins'] text-sm text-[#555]">
              admin@jiaideas.com
            </span>
          </div>
        </header>
        <div className="p-6">
          {loading && activeTab !== "chats" ? (
            <Spinner />
          ) : (
            <>
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                      label="Total Revenue"
                      value={`$${totalRevenue.toLocaleString("en-SG", { minimumFractionDigits: 2 })}`}
                      icon="💰"
                    />
                    <StatCard
                      label="Total Orders"
                      value={String(orders.length)}
                      icon="📦"
                    />
                    <StatCard
                      label="Confirmed"
                      value={String(confirmed)}
                      icon="✅"
                    />
                    <StatCard
                      label="Pending"
                      value={String(pending)}
                      icon="⏳"
                    />
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                      <h2 className="font-['Poppins'] font-semibold text-base text-[#1C1B1F]">
                        Recent Orders
                      </h2>
                      <button
                        className="font-['Poppins'] text-sm text-[#888] hover:text-[#1C1B1F]"
                        onClick={() => setActiveTab("orders")}
                      >
                        View all →
                      </button>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {orders.slice(0, 5).map((order) => (
                        <div
                          key={order._id}
                          className="px-5 py-3.5 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-['Poppins'] font-medium text-sm text-[#1C1B1F]">
                              {order.orderNo}
                            </p>
                            <p className="font-['Poppins'] text-xs text-[#888]">
                              {order.fullName}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <StatusBadge
                              status={order.paidStatus || order.status}
                            />
                            <p className="font-['Poppins'] font-semibold text-sm text-[#1C1B1F]">
                              $
                              {order.paidAmount?.toLocaleString("en-SG", {
                                minimumFractionDigits: 2,
                              })}
                            </p>
                            <button
                              className="px-3 py-1.5 bg-[#1C1B1F] text-white rounded-lg font-['Poppins'] text-xs hover:bg-[#333] transition"
                              onClick={() => {
                                setSelectedOrder(order);
                                setActiveTab("orders");
                              }}
                            >
                              View
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "orders" &&
                (selectedOrder ? (
                  <OrderDetailPanel
                    order={selectedOrder}
                    onBack={() => setSelectedOrder(null)}
                    onStatusChange={handleStatusChange}
                    salespersons={salespersons}
                    isAdmin={true}
                  />
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
                      <input
                        className="bg-gray-50 rounded-lg px-4 py-2 font-['Poppins'] text-sm text-[#1C1B1F] outline-none flex-1 min-w-[200px]"
                        placeholder="Search by order no, name or email…"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <select
                        className="bg-gray-50 rounded-lg px-3 py-2 font-['Poppins'] text-sm text-[#1C1B1F] outline-none"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <option value="all">All statuses</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Site Visit">Site Visit</option>
                        <option value="Fabricating">Fabricating</option>
                        <option value="Delivering">Delivering</option>
                        <option value="Installation">Installation</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100">
                            {[
                              "Order No",
                              "Customer",
                              "Email",
                              "Amount",
                              "Date",
                              "Status",
                              "",
                            ].map((h) => (
                              <th
                                key={h}
                                className="px-5 py-3 text-left font-['Poppins'] text-xs font-semibold text-[#888] uppercase tracking-wider whitespace-nowrap"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {filteredOrders.map((order) => (
                            <tr
                              key={order._id}
                              className="hover:bg-gray-50 transition"
                            >
                              <td className="px-5 py-3.5 font-['Poppins'] font-medium text-sm text-[#1C1B1F] whitespace-nowrap">
                                {order.orderNo}
                              </td>
                              <td className="px-5 py-3.5 font-['Poppins'] text-sm text-[#555]">
                                {order.fullName}
                              </td>
                              <td className="px-5 py-3.5 font-['Poppins'] text-sm text-[#888]">
                                {order.email}
                              </td>
                              <td className="px-5 py-3.5 font-['Poppins'] font-semibold text-sm text-[#1C1B1F] whitespace-nowrap">
                                $
                                {order.paidAmount?.toLocaleString("en-SG", {
                                  minimumFractionDigits: 2,
                                })}
                              </td>
                              <td className="px-5 py-3.5 font-['Poppins'] text-sm text-[#888] whitespace-nowrap">
                                {formatDate(order["Created Date"])}
                              </td>
                              <td className="px-5 py-3.5">
                                <StatusBadge
                                  status={(order.paidStatus as string) || ""}
                                />
                              </td>
                              <td className="px-5 py-3.5">
                                <button
                                  className="px-3 py-1.5 bg-[#1C1B1F] text-white rounded-lg font-['Poppins'] text-xs hover:bg-[#333] transition"
                                  onClick={() => setSelectedOrder(order)}
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {filteredOrders.length === 0 && (
                        <div className="py-12 text-center">
                          <p className="font-['Poppins'] text-sm text-[#bbb]">
                            No orders found
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

              {activeTab === "users" && (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
                    <h2 className="font-['Poppins'] font-semibold text-base text-[#1C1B1F]">
                      Registered Users{" "}
                      <span className="text-[#888] font-normal">
                        ({userRoleFilter === "all" ? users.length : users.filter((u) => (u.userRole || "customer") === userRoleFilter).length})
                      </span>
                    </h2>
                    <div className="flex items-center gap-3">
                      <select
                        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 font-['Poppins'] text-xs text-[#1C1B1F] outline-none focus:ring-2 focus:ring-[#1C1B1F]"
                        value={userRoleFilter}
                        onChange={(e) => setUserRoleFilter(e.target.value)}
                      >
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="salesperson">Salesperson</option>
                        <option value="vendor">Vendor</option>
                        <option value="customer">Customer</option>
                      </select>
                      <p className="font-['Poppins'] text-xs text-[#888]">
                        Assign roles to grant portal access
                      </p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          {[
                            "Name",
                            "Email",
                            "Phone",
                            "Joined",
                            "Role",
                            "Actions",
                          ].map((h) => (
                            <th
                              key={h}
                              className="px-5 py-3 text-left font-['Poppins'] text-xs font-semibold text-[#888] uppercase tracking-wider whitespace-nowrap"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {users.filter((u) => userRoleFilter === "all" || (u.userRole || "customer") === userRoleFilter).map((user) => {
                          const name = user.FirstName
                            ? `${user.FirstName} ${user.LastName || ""}`.trim()
                            : "—";
                          const email =
                            user.authentication?.email?.email ||
                            user.email ||
                            "—";
                          const isAssigning = assigningRole === user._id;
                          return (
                            <tr
                              key={user._id}
                              className="hover:bg-gray-50 transition"
                            >
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-[#1C1B1F] flex items-center justify-center shrink-0">
                                    <span className="text-white text-xs font-bold">
                                      {name[0]?.toUpperCase() ||
                                        email[0]?.toUpperCase() ||
                                        "?"}
                                    </span>
                                  </div>
                                  <span className="font-['Poppins'] font-medium text-sm text-[#1C1B1F]">
                                    {name}
                                  </span>
                                </div>
                              </td>
                              <td className="px-5 py-3.5 font-['Poppins'] text-sm text-[#888]">
                                {email}
                              </td>
                              <td className="px-5 py-3.5 font-['Poppins'] text-sm text-[#888]">
                                {user.ContactNumber || user.phone || "—"}
                              </td>
                              <td className="px-5 py-3.5 font-['Poppins'] text-sm text-[#888] whitespace-nowrap">
                                {formatDate(user["Created Date"])}
                              </td>
                              <td className="px-5 py-3.5">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                                    user.userRole === "admin"
                                      ? "bg-purple-100 text-purple-700"
                                      : user.userRole === "salesperson"
                                        ? "bg-blue-100 text-blue-700"
                                        : user.userRole === "vendor"
                                          ? "bg-amber-100 text-amber-700"
                                          : "bg-gray-100 text-gray-500"
                                  }`}
                                >
                                  {user.userRole || "Customer"}
                                </span>
                              </td>
                              <td className="px-5 py-3.5">
                                {isAssigning ? (
                                  <div className="flex items-center gap-2">
                                    <select
                                      className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 font-['Poppins'] text-xs text-[#1C1B1F] outline-none"
                                      value={roleValue}
                                      onChange={(e) =>
                                        setRoleValue(e.target.value)
                                      }
                                    >
                                      <option value="">Select role</option>
                                      <option value="admin">Admin</option>
                                      <option value="salesperson">
                                        Salesperson
                                      </option>
                                      <option value="vendor">Vendor</option>
                                      <option value="customer">Customer</option>
                                    </select>
                                    <button
                                      className="px-2.5 py-1.5 bg-[#1C1B1F] text-white rounded-lg font-['Poppins'] text-xs hover:bg-[#333] transition disabled:opacity-50"
                                      disabled={!roleValue}
                                      onClick={() =>
                                        handleAssignRole(user._id, roleValue)
                                      }
                                    >
                                      Save
                                    </button>
                                    <button
                                      className="px-2.5 py-1.5 border border-gray-200 rounded-lg font-['Poppins'] text-xs hover:bg-gray-50 transition"
                                      onClick={() => {
                                        setAssigningRole(null);
                                        setRoleValue("");
                                      }}
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    className="px-3 py-1.5 border border-gray-200 text-[#555] rounded-lg font-['Poppins'] text-xs hover:border-gray-400 transition"
                                    onClick={() => {
                                      setAssigningRole(user._id);
                                      setRoleValue(user.role ?? "");
                                    }}
                                  >
                                    Change Role
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {users.filter((u) => userRoleFilter === "all" || (u.userRole || "customer") === userRoleFilter).length === 0 && (
                      <div className="py-12 text-center">
                        <p className="font-['Poppins'] text-sm text-[#bbb]">
                          No users found
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "chats" && (
                <ChatPanel currentUserRole="admin" accentColor="#1C1B1F" />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// ── Salesperson dashboard ─────────────────────────────────────────────────────
function SalespersonDashboard({ onSignOut }: { onSignOut: () => void }) {
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState<BubbleOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<BubbleOrder | null>(null);

  useEffect(() => {
    api.admin
      .listAssignedOrders()
      .then((r) => setOrders(r?.response?.results ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleStatusChange(id: string, status: string) {
    await api.admin.updateOrderStatus(id, status);
    setOrders((p) =>
      p.map((o) => (o._id === id ? { ...o, paidStatus: status } : o)),
    );
    setSelectedOrder((p) => (p ? { ...p, paidStatus: status } : null));
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex">
      <Sidebar
        title="Sales Portal"
        subtitle="Salesperson"
        color="#332e28"
        activeTab={activeTab}
        onSignOut={onSignOut}
        onTabChange={(t) => {
          setActiveTab(t);
          setSelectedOrder(null);
        }}
        tabs={[
          { id: "orders", label: "Orders", icon: "📦" },
          { id: "chats", label: "Chats", icon: "💬" },
        ]}
      />
      <main className="flex-1 overflow-auto pt-14 md:pt-0">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <h1 className="font-['Poppins'] font-bold text-lg text-[#1C1B1F] capitalize">
            {selectedOrder ? "Order Details" : activeTab}
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#332e28] flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="font-['Poppins'] text-sm text-[#555]">
              sales@jiaideas.com
            </span>
          </div>
        </header>
        <div className="p-6">
          {loading && activeTab !== "chats" ? (
            <Spinner />
          ) : (
            <>
              {activeTab === "orders" &&
                (selectedOrder ? (
                  <OrderDetailPanel
                    order={selectedOrder}
                    onBack={() => setSelectedOrder(null)}
                    onStatusChange={handleStatusChange}
                    isAdmin={false}
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <StatCard
                        label="Total Orders"
                        value={String(orders.length)}
                        icon="📦"
                      />
                      <StatCard
                        label="Pending"
                        value={String(
                          orders.filter(
                            (o) => o.status?.toLowerCase() === "pending",
                          ).length,
                        )}
                        icon="⏳"
                      />
                      <StatCard
                        label="Confirmed"
                        value={String(
                          orders.filter(
                            (o) => o.status?.toLowerCase() === "confirmed",
                          ).length,
                        )}
                        icon="✅"
                      />
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                      <div className="divide-y divide-gray-50">
                        {orders.map((order) => (
                          <div
                            key={order._id}
                            className="px-5 py-4 flex items-center justify-between gap-4"
                          >
                            <div className="min-w-0">
                              <p className="font-['Poppins'] font-semibold text-sm text-[#1C1B1F]">
                                {order.orderNo}
                              </p>
                              <p className="font-['Poppins'] text-xs text-[#888]">
                                {order.fullName} ·{" "}
                                {formatDate(order["Created Date"])}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <StatusBadge
                                status={order.paidStatus || order.status}
                              />
                              <p className="font-['Poppins'] font-bold text-sm text-[#1C1B1F]">
                                $
                                {order.paidAmount?.toLocaleString("en-SG", {
                                  minimumFractionDigits: 2,
                                })}
                              </p>
                              <button
                                className="px-3 py-1.5 bg-[#332e28] text-white rounded-lg font-['Poppins'] text-xs hover:opacity-80 transition"
                                onClick={() => setSelectedOrder(order)}
                              >
                                View
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              {activeTab === "chats" && (
                <ChatPanel
                  currentUserRole="salesperson"
                  accentColor="#332e28"
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// ── Vendor dashboard ──────────────────────────────────────────────────────────
function VendorDashboard({ onSignOut }: { onSignOut: () => void }) {
  const [orders, setOrders] = useState<BubbleOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<BubbleOrder | null>(null);

  useEffect(() => {
    api.admin
      .listFabricationOrders()
      .then((r) => setOrders(r?.response?.results ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function getStage(s: string) {
    const l = s?.toLowerCase();
    if (l === "confirmed") return "Fabrication";
    if (l === "in_progress") return "Installation";
    if (l === "completed") return "Completion";
    return "Fabrication";
  }
  function getProgress(s: string) {
    const l = s?.toLowerCase();
    if (l === "confirmed") return 25;
    if (l === "in_progress") return 65;
    if (l === "completed") return 100;
    return 10;
  }
  function stageColor(s: string) {
    return (
      {
        Fabrication: "bg-violet-100 text-violet-700",
        Installation: "bg-blue-100 text-blue-700",
        Completion: "bg-emerald-100 text-emerald-700",
      }[s] ?? "bg-gray-100 text-gray-600"
    );
  }

  const filtered = orders.filter(
    (o) => filter === "all" || getStage(o.status) === filter,
  );

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex">
      <Sidebar
        title="Vendor Portal"
        subtitle="Read-only access"
        color="#7b7267"
        activeTab="orders"
        onTabChange={() => {}}
        onSignOut={onSignOut}
        tabs={[{ id: "orders", label: "Assigned Orders", icon: "🗂" }]}
      />
      <main className="flex-1 overflow-auto pt-14 md:pt-0">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <h1 className="font-['Poppins'] font-bold text-lg text-[#1C1B1F]">
            {selectedOrder ? "Order Details" : "Assigned Orders"}
          </h1>
          <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full font-['Poppins'] text-xs font-semibold">
            Read-only
          </span>
        </header>
        <div className="p-6 space-y-5">
          {loading ? (
            <Spinner />
          ) : selectedOrder ? (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <button
                    className="flex items-center gap-2 text-[#555] hover:text-[#1C1B1F] transition font-['Poppins'] text-sm"
                    onClick={() => setSelectedOrder(null)}
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
                    Back to Orders
                  </button>
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      status={selectedOrder.paidStatus || selectedOrder.status}
                    />
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full font-['Poppins'] text-xs font-semibold">
                      Read-only
                    </span>
                  </div>
                </div>
                <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Order No", value: selectedOrder.orderNo },
                    { label: "Customer", value: selectedOrder.fullName },
                    {
                      label: "Installation",
                      value: formatDate(selectedOrder.installationDate),
                    },
                    {
                      label: "Amount",
                      value: `$${selectedOrder.paidAmount?.toLocaleString("en-SG", { minimumFractionDigits: 2 })}`,
                    },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-3">
                      <p className="font-['Poppins'] text-[10px] text-[#888] mb-1 uppercase tracking-wider">
                        {label}
                      </p>
                      <p className="font-['Poppins'] font-semibold text-sm text-[#1C1B1F]">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <OrderItems order={selectedOrder} />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4">
                <StatCard
                  label="Total Assigned"
                  value={String(orders.length)}
                  icon="🗂"
                />
                <StatCard
                  label="In Fabrication"
                  value={String(
                    orders.filter((o) => getStage(o.status) === "Fabrication")
                      .length,
                  )}
                  icon="🔧"
                />
                <StatCard
                  label="Completed"
                  value={String(
                    orders.filter((o) => getStage(o.status) === "Completion")
                      .length,
                  )}
                  icon="🏁"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {["all", "Fabrication", "Installation", "Completion"].map(
                  (f) => (
                    <button
                      key={f}
                      className={`px-4 py-2 rounded-full font-['Poppins'] text-sm font-medium transition ${filter === f ? "bg-[#1C1B1F] text-white" : "bg-white border border-gray-200 text-[#555] hover:border-gray-300"}`}
                      onClick={() => setFilter(f)}
                    >
                      {f === "all" ? "All Stages" : f}
                    </button>
                  ),
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((order) => {
                  const stage = getStage(order.status),
                    progress = getProgress(order.status);
                  return (
                    <div
                      key={order._id}
                      className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-300 transition cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-['Poppins'] font-bold text-sm text-[#1C1B1F]">
                            {order.orderNo}
                          </p>
                          <p className="font-['Poppins'] text-xs text-[#888]">
                            {order.fullName}
                          </p>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-['Poppins'] font-semibold ${stageColor(stage)}`}
                        >
                          {stage}
                        </span>
                      </div>
                      <p className="font-['Poppins'] text-xs text-[#888] mb-3">
                        Installation: {formatDate(order.installationDate)}
                      </p>
                      <div className="mb-2">
                        <div className="flex justify-between mb-1">
                          <span className="font-['Poppins'] text-xs text-[#888]">
                            Progress
                          </span>
                          <span className="font-['Poppins'] text-xs font-semibold text-[#1C1B1F]">
                            {progress}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#1C1B1F] rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <p className="font-['Poppins'] text-xs text-[#888]">
                          $
                          {order.paidAmount?.toLocaleString("en-SG", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-['Poppins'] text-xs font-semibold ${progress >= 90 ? "text-emerald-600" : progress >= 50 ? "text-blue-600" : "text-amber-600"}`}
                          >
                            {progress >= 90
                              ? "Almost done"
                              : progress >= 50
                                ? "On track"
                                : "In progress"}
                          </span>
                          <span className="font-['Poppins'] text-xs text-[#7b7267]">
                            Tap to view →
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="col-span-2 py-12 text-center">
                    <p className="font-['Poppins'] text-sm text-[#bbb]">
                      No orders in this stage
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function AdminPortal() {
  const [role, setRole] = useState<Role | null>(null);
  if (!role) return <RoleSelectionPage onSelect={setRole} />;
  if (role === "admin")
    return <AdminDashboard onSignOut={() => setRole(null)} />;
  if (role === "salesperson")
    return <SalespersonDashboard onSignOut={() => setRole(null)} />;
  if (role === "vendor")
    return <VendorDashboard onSignOut={() => setRole(null)} />;
  return null;
}
