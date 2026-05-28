import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { api } from "@/services/api";
import InvoicePage from "@/components/pages/InvoicePage";
const Logo = "/images/Jia_Logo.png";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderProduct {
  _id: string;
  code: string;
  cost: number;
  internal_color: string;
  laminate_color: string;
  led_light_text: string;
  width: string;
  aluminium_tempered_glass: string;
  with_door: string;
  sketchImage?: string;
}

interface OrderRoom {
  name: string;
  products: OrderProduct[];
}

interface Order {
  _id: string;
  invoiceNumber: string;
  orderNo: string;
  paidAmount: number;
  total?: number;
  status: string;
  paidOn?: string | number;
  confirmedOn?: string | number;
  installationDate?: string | number;
  rooms: OrderRoom[];
  roomNames?: string; // e.g. "Master Bedroom, Kitchen, Living Room"
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(value?: string | number): string {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-SG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(value?: string | number): string {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(2);
  return `${dd}/${mm}/${yy}`;
}

// ─── Back icon ────────────────────────────────────────────────────────────────

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

// ─── Chevron ─────────────────────────────────────────────────────────────────

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-5 h-5 text-[#555] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
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

// ─── JIA Logo ─────────────────────────────────────────────────────────────────

// ─── Expanded order detail ────────────────────────────────────────────────────

function OrderDetail({
  order,
  roomsForUI,
  loading,
  onShowInvoice,
}: {
  order: Order;
  roomsForUI: any[];
  loading: boolean;
  onShowInvoice: () => void;
}) {
  return (
    <div className="border-t border-gray-100 bg-white">
      {/* Header row */}
      <div className="flex items-start gap-3 px-4 py-4 border-b border-gray-100">
        {/* <JIALogo /> */}
        <img src={Logo} alt="JIA Logo" className="w-10 h-10" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="font-['Poppins'] text-sm text-[#555]">
                Invoice no:{" "}
                <span className="font-semibold text-[#1C1B1F]">
                  {order.invoiceNumber}
                </span>
              </p>
              <p className="font-['Poppins'] text-sm text-[#555]">
                Order no:{" "}
                <span className="font-semibold text-[#1C1B1F]">
                  {order.orderNo}
                </span>
              </p>
            </div>
            <button
              onClick={onShowInvoice}
              className="shrink-0 px-3 py-1.5 border border-gray-300 rounded-lg font-['Poppins'] text-xs text-[#1C1B1F] hover:bg-gray-50 transition"
            >
              View Invoice
            </button>
          </div>
          {order.installationDate && (
            <p className="font-['Poppins'] text-xs text-[#888] mt-1">
              Delivery Date and Installation Date:{" "}
              <span className="font-medium text-[#1C1B1F]">
                {formatDate(order.installationDate)}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Rooms + products */}
      {!loading &&
        roomsForUI.map((room: any) => (
          <div key={room.id} className="border-b border-gray-100">
            {/* Room name */}
            <p className="font-['Poppins'] font-semibold text-sm text-[#1C1B1F] px-4 py-2.5 bg-gray-50">
              {room.name}
            </p>

            {/* Products */}
            <div className="px-4 py-3 space-y-3">
              {room.products.map((p: any) => (
                <div key={p._id} className="flex gap-3">
                  {/* Sketch thumbnail */}
                  <div className="w-12 h-14 shrink-0 border border-gray-200 rounded-lg bg-[#f5f5f5] overflow-hidden">
                    {p.sketchImage ? (
                      <img
                        alt={`Type ${p.code}`}
                        className="w-full h-full object-contain"
                        src={
                          p.sketchImage.startsWith("http")
                            ? p.sketchImage
                            : `https:${p.sketchImage}`
                        }
                      />
                    ) : (
                      <div className="w-full h-full bg-[#ebebeb]" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-['Poppins'] font-semibold text-sm text-[#1C1B1F]">
                      Type {p.code}
                    </p>
                    <p className="font-['Poppins'] font-semibold text-sm text-[#1C1B1F] mb-1">
                      ${p.cost.toFixed(2)}
                    </p>
                    <div className="space-y-0.5">
                      {[
                        ["Internal Color", p.internal_color],
                        ["External Color", p.laminate_color],
                        ["Led Light", p.led_light_text],
                        ["Width", p.width],
                        [
                          "Aluminium Tempered Glass",
                          p.aluminium_tempered_glass,
                        ],
                        ["With Door", p.with_door],
                      ]
                        .filter(([, v]) => v && v !== "undefined")
                        .map(([label, value]) => (
                          <p
                            key={label}
                            className="font-['Poppins'] text-[11px] text-[#555]"
                          >
                            {label}:{" "}
                            <span className="text-[#888]">{value}</span>
                          </p>
                        ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

      {/* Pricing summary */}
      <div className="px-4 py-4 space-y-1.5 border-b border-gray-100">
        <div className="flex justify-between font-['Poppins'] font-semibold text-base text-[#1C1B1F] pt-1 border-t border-gray-100 mt-1">
          <span>Total payment:</span>
          <span>${order.paidAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Status rows */}
      <div className="divide-y divide-gray-100">
        {[
          { label: "Paid on:", value: formatShortDate(order.paidOn) },
          { label: "Confirmed on:", value: formatShortDate(order.confirmedOn) },
          {
            label: "Delivery Date and Installation Date:",
            value: formatDate(order.installationDate),
          },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="flex items-center justify-between px-4 py-3"
          >
            <span className="font-['Poppins'] text-sm text-[#555]">
              {label}
            </span>
            <span className="font-['Poppins'] font-bold text-sm text-[#1C1B1F]">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Order card ───────────────────────────────────────────────────────────────

function OrderCard({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  // ── Same resolution pipeline as ShoppingCartPage ──────────────────────────
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartRooms, setCartRooms] = useState<any[]>([]);
  const [typeList, setTypeList] = useState<any[]>([]);
  const [productList, setProductList] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [handleDesigns, setHandleDesigns] = useState<any[]>([]);
  const [aluminium, setAluminium] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!open || cartRooms.length > 0) return; // only fetch once
    setLoading(true);
    Promise.all([
      api.cart.list(order._id ?? order._id),
      api.rooms.listByProject(order._id ?? order._id),
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
  }, [open]);

  // ── Same lookup maps ───────────────────────────────────────────────────────
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
  const cartItemIdSet = new Set(cartItems.map((p: any) => p._id));
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
            pricing,
            code: typeData?.code ?? null,
            laminate_color:
              colorMap[p.external_color]?.colorDisplayName ?? null,
            handle_design: handleMap[p.handle_design_text]?.name ?? null,
            door_finishing:
              finishMap[p.selected_aluminium_doorType]?.name ?? null,
            sketchImage: typeData
              ? getSketchImage(typeData, withPricing)
              : null,
            renderImage: typeData
              ? getRenderImage(typeData, withPricing)
              : null,
          };
        });
      return {
        id: room._id,
        name: room.name,
        products,
        sketchImages: products.map((p: any) => p.sketchImage).filter(Boolean),
        renderImages: products.map((p: any) => p.renderImage).filter(Boolean),
      };
    })
    .filter((room: any) => room.products.length > 0);

  // ── Invoice view ───────────────────────────────────────────────────────────
  if (showInvoice) {
    return (
      <InvoicePage
        order={{
          ...order,
          rooms: roomsForUI.map((r) => ({
            id: r.id,
            name: r.name,
            products: r.products,
            sketchImages: r.sketchImages,
          })),
        }}
        onBack={() => setShowInvoice(false)}
      />
    );
  }
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Collapsed row — always visible */}
      <button
        className="w-full flex items-start justify-between px-4 py-4 hover:bg-gray-50 transition text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="min-w-0">
          <p className="font-['Poppins'] text-sm text-[#1C1B1F]">
            <span className="font-semibold">Invoice:</span>{" "}
            {order.invoiceNumber}
          </p>
          <p className="font-['Poppins'] text-sm text-[#555] mt-0.5">
            Order: {order.orderNo}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <div className="text-right">
            {order.roomNames && (
              <p className="font-['Poppins'] text-xs text-[#888] mb-0.5">
                {order.roomNames}
              </p>
            )}
            <p className="font-['Poppins'] font-bold text-sm text-[#1C1B1F]">
              $
              {order?.total?.toLocaleString("en-SG", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          <Chevron open={open} />
        </div>
      </button>

      {/* Expanded detail */}
      {open && (
        <OrderDetail
          order={order}
          roomsForUI={roomsForUI} // ← pass resolved rooms down
          loading={loading}
          onShowInvoice={() => setShowInvoice(true)}
        />
      )}
    </div>
  );
}

// ─── Change password modal ────────────────────────────────────────────────────

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!current || !next || !confirm) {
      setError("All fields are required.");
      return;
    }
    if (next !== confirm) {
      setError("New passwords do not match.");
      return;
    }
    if (next.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await api.auth.changePassword?.({
        currentPassword: current,
        newPassword: next,
      });
      onClose();
    } catch (e: any) {
      setError(e?.message ?? "Failed to change password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-['Poppins'] font-bold text-lg text-[#1C1B1F]">
          Change Password
        </h3>
        {[
          {
            label: "Current Password",
            value: current,
            set: setCurrent,
            ac: "current-password",
          },
          {
            label: "New Password",
            value: next,
            set: setNext,
            ac: "new-password",
          },
          {
            label: "Confirm Password",
            value: confirm,
            set: setConfirm,
            ac: "new-password",
          },
        ].map(({ label, value, set, ac }) => (
          <div key={label}>
            <label className="font-['Poppins'] text-xs text-[#666] block mb-1">
              {label}
            </label>
            <input
              autoComplete={ac}
              className="w-full bg-[#f5f5f5] rounded-lg px-4 py-3 font-['Poppins'] text-sm text-[#1C1B1F] outline-none focus:ring-2 focus:ring-[#1C1B1F]/20"
              onChange={(e) => {
                set(e.target.value);
                setError("");
              }}
              type="password"
              value={value}
            />
          </div>
        ))}
        {error && (
          <p className="font-['Poppins'] text-xs text-red-500">{error}</p>
        )}
        <div className="flex flex-col gap-2 pt-1">
          <button
            className="w-full bg-[#1C1B1F] hover:bg-[#333] active:scale-95 transition py-3 rounded-xl font-['Poppins'] font-semibold text-base text-white disabled:opacity-60"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? "Saving…" : "Save Password"}
          </button>
          <button
            className="w-full border border-gray-200 hover:bg-gray-50 transition py-3 rounded-xl font-['Poppins'] text-base text-[#414042]"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { userEmail, previousPage, setCurrentPage, handleLogout } = useApp();

  const [orders, setOrders] = useState<Order[]>([]);
  const [phone, setPhone] = useState("—");
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [showChangePw, setShowChangePw] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    // Fetch paid orders
    api.projects
      .get_paid_project?.()
      .then((res: any) => {
        const results = res?.response?.results ?? [];
        setOrders(results);
      })
      .catch(console.error)
      .finally(() => setLoadingOrders(false));

    // Fetch user profile for phone
    api.user
      ?.me?.()
      .then((res: any) => {
        const user = res?.response;
        if (user?.phone) setPhone(user.phone);
        if (user?.phone) setPhoneInput(user.phone);
      })
      .catch(console.error);
  }, []);

  async function handleSavePhone() {
    try {
      await api.user?.update?.({ phone: phoneInput });
      setPhone(phoneInput);
      setEditingPhone(false);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="min-h-screen bg-[#faf4e6]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between sticky top-0 z-20">
        <button
          className="flex items-center gap-1.5 text-[#1C1B1F] hover:opacity-70 transition"
          onClick={() => setCurrentPage(previousPage)}
        >
          <BackIcon />
        </button>
        <h1 className="font-['Poppins'] font-semibold text-base text-[#1C1B1F]">
          My Profile
        </h1>
        <button
          className="font-['Poppins'] text-sm text-[#878787] hover:text-[#1C1B1F] transition"
          onClick={handleLogout}
        >
          Log Out
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* ── Personal Information ── */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-['Poppins'] font-semibold text-base text-[#1C1B1F] mb-5">
            Personal Information
          </h2>

          {/* Email */}
          <div className="mb-4">
            <p className="font-['Poppins'] text-xs text-[#888] mb-1">Email</p>
            <p className="font-['Poppins'] text-sm text-[#1C1B1F] bg-[#f5f5f5] rounded-lg px-4 py-3">
              {userEmail}
            </p>
          </div>

          {/* Contact Number */}
          <div className="mb-5">
            <p className="font-['Poppins'] text-xs text-[#888] mb-1">
              Contact Number
            </p>
            {editingPhone ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  className="flex-1 bg-[#f5f5f5] rounded-lg px-4 py-3 font-['Poppins'] text-sm text-[#1C1B1F] outline-none focus:ring-2 focus:ring-[#1C1B1F]/20"
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="+65 9123 4567"
                  type="tel"
                  value={phoneInput}
                />
                <button
                  className="px-4 py-2 bg-[#1C1B1F] text-white text-sm font-['Poppins'] rounded-lg hover:bg-[#333] transition"
                  onClick={handleSavePhone}
                >
                  Save
                </button>
                <button
                  className="px-4 py-2 border border-gray-200 text-sm font-['Poppins'] rounded-lg hover:bg-gray-50 transition"
                  onClick={() => setEditingPhone(false)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-[#f5f5f5] rounded-lg px-4 py-3">
                <p className="font-['Poppins'] text-sm text-[#1C1B1F]">
                  {phone}
                </p>
                <button
                  className="font-['Poppins'] text-sm text-[#1C1B1F] hover:opacity-60 transition"
                  onClick={() => setEditingPhone(true)}
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Change Password */}
          <button
            className="px-5 py-2 border border-gray-300 rounded-lg font-['Poppins'] text-sm text-[#1C1B1F] hover:bg-gray-50 transition"
            onClick={() => setShowChangePw(true)}
          >
            Change Password
          </button>
        </section>

        {/* ── Order History ── */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-['Poppins'] font-semibold text-base text-[#1C1B1F] mb-4">
            Order History
          </h2>

          {loadingOrders ? (
            <div className="space-y-3">
              {[1, 2]?.map((i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-100 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : orders?.length === 0 ? (
            <p className="font-['Poppins'] text-sm text-[#888] text-center py-8">
              No orders yet.
            </p>
          ) : (
            <div className="space-y-3">
              {orders?.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>
          )}
        </section>

        {/* ── Customer Support ── */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-['Poppins'] font-semibold text-base text-[#1C1B1F] mb-1">
            Customer Support
          </h2>
          <p className="font-['Poppins'] text-sm text-[#888] mb-4">
            Have questions? Chat with our customer support team.
          </p>
          <button className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg font-['Poppins'] text-sm text-[#1C1B1F] hover:bg-gray-50 transition">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M8 12h.01M12 12h.01M16 12h.01M21 3H3v13h5l4 4 4-4h5V3z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            Start Chat
          </button>
        </section>

        {/* ── Any Questions banner ── */}
        <section className="bg-[#e8f4fd] rounded-2xl border border-blue-100 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <svg
              className="w-7 h-7 text-[#5bb8f5]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
            </svg>
          </div>
          <div>
            <p className="font-['Poppins'] font-semibold text-sm text-[#1C1B1F]">
              Any Questions? Contact us here
            </p>
            <p className="font-['Poppins'] text-xs text-[#555] mt-0.5">
              Our customer service team is here to help you with any inquiries
              about your orders or products.
            </p>
          </div>
        </section>
      </main>

      {showChangePw && (
        <ChangePasswordModal onClose={() => setShowChangePw(false)} />
      )}
    </div>
  );
}
