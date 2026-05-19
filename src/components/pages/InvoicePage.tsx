import { useRef, useState } from "react";

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
  postalCode?: string;
  unit?: string;
  deliverySameAsProperty?: boolean;
  doNumber?: string;
  rooms: InvoiceRoom[];
}

interface InvoicePageProps {
  order: InvoiceOrder;
  onBack: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDocDate(value?: string | number): string {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InvoicePage({ order, onBack }: InvoicePageProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<"invoice" | "do">("invoice");

  // Flatten rooms/products into table rows
  const tableItems = order.rooms
    .flatMap((room) =>
      room.products.map((p) => {
        const config = [
          p.internal_color && `Internal Color: ${p.internal_color}`,
          p.laminate_color && `External Color: ${p.laminate_color}`,
          p.width && `Width: ${p.width}`,
          p.door_type && `Door Type: ${p.door_type}`,
          p.led_light_text && `LED Light: ${p.led_light_text}`,
          p.side_panel_text && `Side Panel: ${p.side_panel_text}`,
        ]
          .filter(Boolean)
          .join("\n");
        return {
          room: room.name,
          item: `Type ${p.code}`,
          description: config,
          qty: 1,
          amount: p.cost,
        };
      }),
    )
    .map((item, i) => ({ ...item, no: i + 1 }));

  const itemsSubtotal = tableItems.reduce((s, i) => s + i.amount, 0);
  const paidAmount = order.paidAmount ?? 0;
  const amountDue = Math.max(0, itemsSubtotal - paidAmount);

  const billingAddress =
    [order.homeUnit, order.homeZipCode ? `S${order.homeZipCode}` : ""]
      .filter(Boolean)
      .join(", ") || "-";
  const deliveryAddress = order.deliverySameAsProperty
    ? billingAddress
    : [order.unit, order.postalCode ? `S${order.postalCode}` : ""]
          .filter(Boolean)
          .join(", ") || billingAddress;

  const docDate = formatDocDate(order.paidOn);
  const deliveryNo =
    order.doNumber ||
    (order.invoiceNumber
      ? `DO-${order.invoiceNumber.replace(/^INV-/, "")}`
      : "-");

  return (
    <div className="min-h-screen bg-[#faf4e6]">
      {/* Toolbar */}
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

        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(["invoice", "do"] as const).map((v) => (
            <button
              key={v}
              className={`px-4 py-1.5 rounded-md font-['Poppins'] text-sm font-medium transition ${
                view === v
                  ? "bg-[#1C1B1F] text-white"
                  : "text-[#888] hover:text-[#555]"
              }`}
              onClick={() => setView(v)}
            >
              {v === "invoice" ? "Invoice" : "Delivery Order"}
            </button>
          ))}
        </div>

        <button
          className="flex items-center gap-2 px-4 py-2 bg-[#1C1B1F] hover:bg-[#333] transition rounded-lg font-['Poppins'] font-medium text-sm text-white"
          onClick={() => window.print()}
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

      {/* Document */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        <div
          ref={printRef}
          className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 font-['Poppins'] print:shadow-none print:rounded-none print:border-0"
        >
          {/* Company header */}
          <div className="flex justify-between items-start mb-8">
            <img
              src="/images/logo.png"
              alt="JIA Logo"
              className="w-[68px] h-[68px] object-contain"
            />
            <div className="flex items-stretch gap-3">
              <div className="w-[3px] bg-amber-700 rounded-sm" />
              <div className="text-xs text-right">
                <p className="font-bold text-sm text-[#1C1B1F]">
                  JIA IDEAS PTE. LTD.
                </p>
                <p className="mt-1 text-[#555]">456 BALESTIER ROAD</p>
                <p className="text-[#555]">#02-05, SINGAPORE 329832</p>
                <p className="mt-0.5 text-[#555]">+65 8858 3359</p>
                <p className="mt-0.5 text-[#555]">ENQUIRY@JIAIDEAS.COM</p>
              </div>
            </div>
          </div>

          {/* Document title */}
          <h2 className="text-2xl font-bold underline mb-6">
            {view === "invoice" ? "INVOICE" : "DELIVERY ORDER"}
          </h2>

          {/* Customer details + document meta */}
          <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
            <div className="text-sm space-y-0.5">
              <p className="font-bold mb-2">Customer Details:</p>
              <p>{order.fullName || "NAME"}</p>
              <p>{order.email || "EMAIL ADDRESS"}</p>
              <p>{order.phone || "PHONE NUMBER"}</p>
              {view === "invoice" ? (
                <>
                  <div className="mt-3">
                    <p className="underline font-medium">BILLING ADDRESS</p>
                    <p>{billingAddress}</p>
                  </div>
                  <div className="mt-3">
                    <p className="underline font-medium">DELIVERY ADDRESS</p>
                    <p>{deliveryAddress}</p>
                  </div>
                </>
              ) : (
                <div className="mt-3">
                  <p className="underline font-medium">DELIVERY ADDRESS</p>
                  <p>{deliveryAddress}</p>
                </div>
              )}
            </div>

            <div className="text-sm space-y-1.5">
              {(view === "invoice"
                ? [
                    ["Date", docDate],
                    ["Invoice No", order.invoiceNumber || "-"],
                    ["Order No", order.orderNo || "-"],
                    ["Quotation No", "-"],
                    ["Tracking No", "-"],
                    ["Sales Person", "Lucas Ong"],
                  ]
                : [
                    ["Date", docDate],
                    ["Delivery No", deliveryNo],
                    ["Invoice No", order.invoiceNumber || "-"],
                    ["Tracking No", "-"],
                    ["Sales Person", "Lucas Ong"],
                  ]
              ).map(([label, value]) => (
                <div key={label} className="flex gap-2">
                  <span className="text-[#555] w-28 shrink-0">{label}</span>
                  <span className="text-[#1C1B1F]">: {value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Items table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold bg-gray-50 w-10">
                    No.
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold bg-gray-50 w-24">
                    Item
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold bg-gray-50">
                    Description
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-center font-semibold bg-gray-50 w-12">
                    Qty
                  </th>
                  {view === "invoice" && (
                    <th className="border border-gray-300 px-3 py-2 text-right font-semibold bg-gray-50 w-28">
                      Amount
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {tableItems.map((item) => (
                  <tr key={item.no}>
                    <td className="border border-gray-300 px-3 py-4 align-top">
                      {item.no}
                    </td>
                    <td className="border border-gray-300 px-3 py-4 align-top font-medium">
                      {item.item}
                    </td>
                    <td className="border border-gray-300 px-3 py-4 align-top">
                      <span className="block text-xs font-medium text-[#1C1B1F] mb-1">
                        {item.room}
                      </span>
                      <span className="text-xs text-[#555] whitespace-pre-line">
                        {item.description}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-3 py-4 align-top text-center">
                      {item.qty}
                    </td>
                    {view === "invoice" && (
                      <td className="border border-gray-300 px-3 py-4 align-top text-right">
                        ${item.amount.toFixed(2)}
                      </td>
                    )}
                  </tr>
                ))}
                {tableItems.length === 0 && (
                  <tr>
                    <td
                      colSpan={view === "invoice" ? 5 : 4}
                      className="border border-gray-300 px-3 py-12 text-center text-[#888]"
                    >
                      No items found.
                    </td>
                  </tr>
                )}
                {view === "do" && (
                  <tr>
                    <td
                      colSpan={2}
                      className="border border-gray-300 px-3 py-4 align-top"
                    >
                      <p className="font-semibold text-sm">Remarks</p>
                    </td>
                    <td
                      colSpan={2}
                      className="border border-gray-300 px-3 py-4 align-top"
                    >
                      <p className="font-semibold text-sm mb-2">Notes :</p>
                      <p className="text-xs text-[#555]">
                        - Goods have been delivered and installed successfully in
                        good condition.
                      </p>
                      <p className="text-xs text-[#555] mt-1">
                        - All items are inspected and accepted by the customer
                        upon signing.
                      </p>
                      <p className="text-xs text-[#555] mt-1">
                        - 1-year warranty will commence from the date of customer
                        acknowledgment and signature.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Invoice totals */}
          {view === "invoice" && (
            <div className="flex justify-end">
              <table className="text-sm border-collapse">
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-6 py-2 text-right">
                      Subtotal
                    </td>
                    <td className="border border-gray-300 px-6 py-2 text-right w-32">
                      $ {itemsSubtotal > 0 ? itemsSubtotal.toFixed(2) : "-"}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-6 py-2 text-right">
                      Total Paid
                    </td>
                    <td className="border border-gray-300 px-6 py-2 text-right">
                      $ {paidAmount > 0 ? paidAmount.toFixed(2) : "-"}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-6 py-2 text-right font-bold">
                      Amount Due
                    </td>
                    <td className="border border-gray-300 px-6 py-2 text-right font-bold">
                      $ {amountDue > 0 ? amountDue.toFixed(2) : "-"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* DO signature lines */}
          {view === "do" && (
            <div className="flex justify-between mt-16 gap-4">
              {[
                "Authorised Signature",
                "Driver's Signature",
                "Receipient's Chop & Signature",
              ].map((label) => (
                <div key={label} className="flex-1 flex flex-col gap-2">
                  <div className="border-t border-[#1C1B1F]" />
                  <p className="text-xs text-[#555]">{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
