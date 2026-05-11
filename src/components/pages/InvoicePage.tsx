import { useRef } from "react";
const Logo_White = "/images/JIA_Logo_White.png";
// ─── Types ────────────────────────────────────────────────────────────────────

interface InvoiceProduct {
  _id: string;
  code: string;
  cost: number;
  sketchImage?: string;
  internal_color?: string;
  laminate_color?: string;
  led_light_text?: string;
  width?: string;
  door_type?: string;
  side_panel_text?: string;
}

interface InvoiceRoom {
  id: string;
  name: string;
  products: InvoiceProduct[];
  sketchImages: string[];
}

interface InvoiceOrder {
  _id: string;
  invoiceNumber: string;
  orderNo: string;
  paidAmount: number;
  subtotal?: number;
  discount?: number;
  status: string;
  installationDate?: string | number;
  paidOn?: string | number;
  confirmedOn?: string | number;
  fullName?: string;
  email?: string;
  phone?: string;
  homeZipCode?: string;
  homeUnit?: string;
  rooms: InvoiceRoom[];
}

interface InvoicePageProps {
  order: InvoiceOrder;
  onBack: () => void;
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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
  }).format(amount);
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const styles: Record<string, string> = {
    confirmed: "bg-green-100 text-green-700",
    pending: "bg-gray-100 text-gray-600",
    in_progress: "bg-orange-100 text-orange-700",
    completed: "bg-blue-100 text-blue-700",
    cancelled: "bg-red-100 text-red-700",
  };
  const labels: Record<string, string> = {
    confirmed: "Confirmed",
    pending: "Pending Payment",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-['Poppins'] font-semibold ${styles[s] ?? "bg-gray-100 text-gray-600"}`}
    >
      {labels[s] ?? status}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InvoicePage({ order, onBack }: InvoicePageProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const total = order.paidAmount ?? 0;
  const subtotal = order.subtotal ?? total / 0.8;
  const discount = order.discount ?? subtotal - total;
  const gst = total * 0.09;

  function handlePrint() {
    window.print();
  }

  return (
    <div className="min-h-screen bg-[#faf4e6]">
      {/* ── Toolbar — hidden on print ── */}
      <header className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex items-center justify-between print:hidden sticky top-0 z-20">
        <button
          className="flex items-center gap-1.5 text-[#1C1B1F] hover:opacity-70 transition font-['Poppins'] text-sm font-medium"
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
          Invoice
        </h1>

        <button
          className="flex items-center gap-2 px-4 py-2 bg-[#1C1B1F] hover:bg-[#333] transition rounded-lg font-['Poppins'] font-medium text-sm text-white"
          onClick={handlePrint}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
          Print / Save PDF
        </button>
      </header>

      {/* ── Invoice document ── */}
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
        <div
          ref={printRef}
          className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm print:shadow-none print:rounded-none print:border-0"
        >
          {/* Header band */}
          <div className="bg-[#332e28] px-8 py-6 flex items-start justify-between">
            {/* Logo */}
            <div>
              <img src={Logo_White} alt="JIA Logo" className="w-12 h-12" />

              <p className="font-['Poppins'] font-bold text-white text-lg">
                JIA Ideas
              </p>
              <p className="font-['Poppins'] text-white/70 text-xs mt-0.5">
                Complete design &amp; renovation services
              </p>
            </div>

            {/* Invoice title + status */}
            <div className="text-right">
              <p className="font-['Poppins'] font-bold text-white text-2xl mb-1">
                INVOICE
              </p>
              <p className="font-['Poppins'] text-white/80 text-sm">
                {order.invoiceNumber}
              </p>
              <div className="mt-2">
                <StatusBadge status={order.status} />
              </div>
            </div>
          </div>

          {/* Order meta */}
          <div className="px-8 py-6 border-b border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="font-['Poppins'] text-xs text-[#888] uppercase tracking-wider mb-1">
                  Order No
                </p>
                <p className="font-['Poppins'] font-semibold text-sm text-[#1C1B1F]">
                  {order.orderNo}
                </p>
              </div>
              <div>
                <p className="font-['Poppins'] text-xs text-[#888] uppercase tracking-wider mb-1">
                  Invoice No
                </p>
                <p className="font-['Poppins'] font-semibold text-sm text-[#1C1B1F]">
                  {order.invoiceNumber}
                </p>
              </div>
              <div>
                <p className="font-['Poppins'] text-xs text-[#888] uppercase tracking-wider mb-1">
                  Payment Date
                </p>
                <p className="font-['Poppins'] font-semibold text-sm text-[#1C1B1F]">
                  {formatDate(order.paidOn)}
                </p>
              </div>
              <div>
                <p className="font-['Poppins'] text-xs text-[#888] uppercase tracking-wider mb-1">
                  Installation Date
                </p>
                <p className="font-['Poppins'] font-semibold text-sm text-[#1C1B1F]">
                  {formatDate(order.installationDate)}
                </p>
              </div>
              <div>
                <p className="font-['Poppins'] text-xs text-[#888] uppercase tracking-wider mb-1">
                  Confirmed On
                </p>
                <p className="font-['Poppins'] font-semibold text-sm text-[#1C1B1F]">
                  {formatDate(order.confirmedOn)}
                </p>
              </div>
            </div>
          </div>

          {/* Bill to */}
          {(order.fullName || order.email) && (
            <div className="px-8 py-5 border-b border-gray-100 bg-gray-50">
              <p className="font-['Poppins'] text-xs text-[#888] uppercase tracking-wider mb-3">
                Bill To
              </p>
              <div className="grid grid-cols-2 gap-4">
                {order.fullName && (
                  <div>
                    <p className="font-['Poppins'] text-xs text-[#888] mb-0.5">
                      Name
                    </p>
                    <p className="font-['Poppins'] font-medium text-sm text-[#1C1B1F]">
                      {order.fullName}
                    </p>
                  </div>
                )}
                {order.email && (
                  <div>
                    <p className="font-['Poppins'] text-xs text-[#888] mb-0.5">
                      Email
                    </p>
                    <p className="font-['Poppins'] font-medium text-sm text-[#1C1B1F]">
                      {order.email}
                    </p>
                  </div>
                )}
                {order.phone && (
                  <div>
                    <p className="font-['Poppins'] text-xs text-[#888] mb-0.5">
                      Phone
                    </p>
                    <p className="font-['Poppins'] font-medium text-sm text-[#1C1B1F]">
                      {order.phone}
                    </p>
                  </div>
                )}
                {order.homeZipCode && (
                  <div>
                    <p className="font-['Poppins'] text-xs text-[#888] mb-0.5">
                      Address
                    </p>
                    <p className="font-['Poppins'] font-medium text-sm text-[#1C1B1F]">
                      {order.homeUnit ? `${order.homeUnit}, ` : ""}
                      {order.homeZipCode}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Line items */}
          <div className="px-8 py-5">
            <p className="font-['Poppins'] text-xs text-[#888] uppercase tracking-wider mb-4">
              Order Items
            </p>

            {/* Table header */}
            <div className="grid grid-cols-[1fr_80px_80px] gap-4 pb-2 border-b border-gray-200 mb-2">
              <p className="font-['Poppins'] text-xs font-semibold text-[#888]">
                Description
              </p>
              <p className="font-['Poppins'] text-xs font-semibold text-[#888] text-right">
                Qty
              </p>
              <p className="font-['Poppins'] text-xs font-semibold text-[#888] text-right">
                Amount
              </p>
            </div>

            {/* Rooms + products */}
            {order.rooms.map((room) => (
              <div key={room.id} className="mb-4">
                {/* Room header */}
                <p className="font-['Poppins'] font-semibold text-sm text-[#1C1B1F] py-2 border-b border-gray-100">
                  {room.name}
                </p>

                {/* Products */}
                {room.products.map((p) => (
                  <div
                    key={p._id}
                    className="grid grid-cols-[1fr_80px_80px] gap-4 py-3 border-b border-gray-50 items-start"
                  >
                    <div className="flex items-start gap-3">
                      {/* Sketch thumbnail */}
                      <div className="w-10 h-12 shrink-0 border border-gray-200 rounded-lg bg-[#f5f5f5] overflow-hidden">
                        {(p.sketchImage ?? room.sketchImages[0]) ? (
                          <img
                            alt={`Type ${p.code}`}
                            className="w-full h-full object-contain"
                            src={
                              (
                                p.sketchImage ?? room.sketchImages[0]
                              )?.startsWith("http")
                                ? (p.sketchImage ?? room.sketchImages[0])
                                : `https:${p.sketchImage ?? room.sketchImages[0]}`
                            }
                          />
                        ) : (
                          <div className="w-full h-full bg-[#ebebeb]" />
                        )}
                      </div>
                      <div>
                        <p className="font-['Poppins'] font-medium text-sm text-[#1C1B1F]">
                          Type {p.code}
                        </p>
                        {/* Config summary */}
                        <div className="mt-0.5 space-y-0.5">
                          {[
                            ["Color", p.internal_color],
                            ["Laminate", p.laminate_color],
                            ["Width", p.width],
                            ["Door", p.door_type],
                          ]
                            .filter(([, v]) => v && typeof v === "string")
                            .map(([label, value]) => (
                              <p
                                key={label}
                                className="font-['Poppins'] text-[10px] text-[#888]"
                              >
                                {label}: {value}
                              </p>
                            ))}
                        </div>
                      </div>
                    </div>
                    <p className="font-['Poppins'] text-sm text-[#555] text-right">
                      1
                    </p>
                    <p className="font-['Poppins'] font-medium text-sm text-[#1C1B1F] text-right">
                      {formatCurrency(p.cost)}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="px-8 pb-6">
            <div className="ml-auto max-w-xs space-y-2 border-t border-gray-200 pt-4">
              <div className="flex justify-between font-['Poppins'] text-sm text-[#555]">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between font-['Poppins'] text-sm text-[#555]">
                <span>20% Discount</span>
                <span>−{formatCurrency(discount)}</span>
              </div>
              <div className="flex justify-between font-['Poppins'] text-sm text-[#555]">
                <span>GST (9%)</span>
                <span>{formatCurrency(gst)}</span>
              </div>
              <div className="flex justify-between font-['Poppins'] font-bold text-base text-[#1C1B1F] border-t border-gray-200 pt-3 mt-2">
                <span>Total Paid</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-100 px-8 py-5 text-center">
            <p className="font-['Poppins'] text-xs text-[#888]">
              Thank you for choosing JIA Ideas. For enquiries, contact us at{" "}
              <span className="text-[#1C1B1F] font-medium">
                info@jiaideas.com
              </span>
            </p>
            <p className="font-['Poppins'] text-xs text-[#bbb] mt-1">
              This is a computer-generated invoice and does not require a
              signature.
            </p>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:rounded-none { border-radius: 0 !important; }
          .print\\:border-0 { border: 0 !important; }
        }
      `}</style>
    </div>
  );
}
