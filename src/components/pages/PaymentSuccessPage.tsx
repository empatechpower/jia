import { useEffect } from "react";
import { useApp } from "@/context/AppContext";

export default function PaymentSuccessPage() {
  const { setCurrentPage, clearCart } = useApp();

  // Clear cart on mount since payment is confirmed
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-[#faf4e6] flex flex-col items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full flex flex-col items-center text-center">
        {/* Animated checkmark */}
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <svg
            className="w-10 h-10 text-green-500"
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

        {/* Heading */}
        <h1 className="font-['Poppins'] font-bold text-2xl text-[#1C1B1F] mb-2">
          Payment Successful!
        </h1>

        {/* Subtext */}
        <p className="font-['DM_Sans'] text-[#666] text-base mb-2">
          Thank you for your order. We've received your payment and your order
          is now confirmed.
        </p>
        <p className="font-['DM_Sans'] text-[#888] text-sm mb-8">
          Our team will reach out within 24 hours to schedule your site visit
          and confirm your installation date.
        </p>

        {/* Divider */}
        <div className="w-full border-t border-gray-100 mb-8" />

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full">
          <button
            className="w-full bg-[#332e28] hover:bg-[#2a2622] active:scale-95 transition py-3.5 rounded-xl font-['Poppins'] font-semibold text-base text-white"
            onClick={() => setCurrentPage("landing")}
          >
            Take me to Home
          </button>
          <button
            className="w-full border border-gray-200 hover:bg-gray-50 transition py-3.5 rounded-xl font-['Poppins'] font-medium text-base text-[#1C1B1F]"
            onClick={() => setCurrentPage("profile")}
          >
            View My Orders
          </button>
        </div>
      </div>

      {/* Bottom note */}
      <p className="font-['Poppins'] text-xs text-[#999] mt-6 text-center max-w-sm">
        A confirmation email has been sent to your registered email address. For
        any questions, please contact our customer support.
      </p>
    </div>
  );
}
