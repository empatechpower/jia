/**
 * Placeholder pages — these mirror the original Figma components but wired
 * to AppContext instead of prop drilling. The detailed UI of each is preserved
 * from the original files; only the wiring and file organisation have changed.
 *
 * Replace each export with the full implementation by lifting the JSX from
 * the original file and swapping `props.onXxx()` calls for `useApp().xxx()`.
 */

import { useApp } from "@/context/AppContext";

// ─── Shopping Cart ────────────────────────────────────────────────────────────

export function ShoppingCartPage() {
  const {
    cartItems,
    previousPage,
    setCurrentPage,
    navigateTo,
    handleDeleteProduct,
    handleUpdateRoomName,
    setSelectedProductName,
    setSelectedProductConfig,
    setSelectedRoom,
    setSelectedRoomId,
  } = useApp();

  const total = cartItems.reduce(
    (sum, room) => sum + room.products.reduce((s, p) => s + p.price, 0),
    0
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Back bar */}
      <header className="bg-[#332e28] px-4 md:px-8 lg:px-[76px] py-4 flex items-center gap-4">
        <button
          className="flex items-center gap-2 text-white hover:opacity-70 transition"
          onClick={() => setCurrentPage(previousPage)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
          <span className="font-['Poppins'] text-sm">Back</span>
        </button>
        <h1 className="font-['Poppins'] font-semibold text-white text-base">
          Shopping Cart
        </h1>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-10">
        {cartItems.length === 0 ? (
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
          <div className="space-y-8">
            {cartItems.map((room) => (
              <section className="border border-gray-200 rounded-xl p-6" key={room.id}>
                <h2 className="font-['Poppins'] font-semibold text-lg text-[#1C1B1F] mb-4">
                  {room.name}
                </h2>
                <ul className="space-y-4">
                  {room.products.map((product) => (
                    <li
                      className="flex items-center gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                      key={product.id}
                    >
                      <img
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg shrink-0"
                        src={product.image}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-['Poppins'] font-medium text-[#1C1B1F] truncate">
                          {product.name}
                        </p>
                        <p className="font-['Poppins'] text-sm text-[#7b7267] mt-0.5">
                          SGD {product.price.toFixed(2)}
                        </p>
                      </div>
                      <button
                        aria-label={`Remove ${product.name}`}
                        className="shrink-0 p-2 text-gray-400 hover:text-red-500 transition"
                        onClick={() => handleDeleteProduct(room.id, product.id)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            {/* Total + CTA */}
            <div className="bg-[#faf4e6] rounded-xl p-6 flex items-center justify-between">
              <div>
                <p className="font-['Poppins'] text-sm text-[#666]">Total</p>
                <p className="font-['Poppins'] font-bold text-2xl text-[#1C1B1F]">
                  SGD {total.toFixed(2)}
                </p>
                <p className="font-['Poppins'] text-xs text-[#7b7267] mt-0.5">
                  20% discount applied
                </p>
              </div>
              <button
                className="bg-[#332e28] hover:bg-[#2a2622] active:scale-95 transition px-8 py-3 rounded-[12px] font-['Poppins'] font-medium text-base text-white"
                onClick={() => navigateTo("checkout", true)}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Checkout ─────────────────────────────────────────────────────────────────

export function CheckoutPage() {
  const { cartItems, propertyInfo, setCurrentPage, handlePaymentSuccess } = useApp();

  const total = cartItems.reduce(
    (sum, room) => sum + room.products.reduce((s, p) => s + p.price, 0),
    0
  );

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-[#332e28] px-4 md:px-8 lg:px-[76px] py-4 flex items-center gap-4">
        <button
          className="flex items-center gap-2 text-white hover:opacity-70 transition"
          onClick={() => setCurrentPage("cart")}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
          <span className="font-['Poppins'] text-sm">Back to Cart</span>
        </button>
        <h1 className="font-['Poppins'] font-semibold text-white text-base">
          Checkout
        </h1>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-8 py-10 space-y-6">
        {/* Property summary */}
        <section className="bg-[#faf4e6] rounded-xl p-6">
          <h2 className="font-['Poppins'] font-semibold text-lg text-[#1C1B1F] mb-4">
            Delivery Property
          </h2>
          <dl className="grid grid-cols-2 gap-y-2 font-['Poppins'] text-sm">
            {[
              ["Type", propertyInfo.propertyType],
              ["Postal Code", propertyInfo.zipCode],
              ["Unit", propertyInfo.unit],
              ["Key Date", propertyInfo.keyDate],
            ].map(([label, value]) => (
              <>
                <dt className="text-[#999]" key={`dt-${label}`}>{label}</dt>
                <dd className="text-[#1C1B1F] font-medium" key={`dd-${label}`}>{value}</dd>
              </>
            ))}
          </dl>
        </section>

        {/* Order summary */}
        <section className="border border-gray-200 rounded-xl p-6">
          <h2 className="font-['Poppins'] font-semibold text-lg text-[#1C1B1F] mb-4">
            Order Summary
          </h2>
          {cartItems.map((room) => (
            <div className="mb-4 last:mb-0" key={room.id}>
              <p className="font-['Poppins'] text-sm text-[#666] mb-2">{room.name}</p>
              {room.products.map((p) => (
                <div className="flex justify-between font-['Poppins'] text-sm text-[#1C1B1F] mb-1" key={p.id}>
                  <span>{p.name}</span>
                  <span>SGD {p.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          ))}
          <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between font-['Poppins'] font-bold text-base text-[#1C1B1F]">
            <span>Total</span>
            <span>SGD {total.toFixed(2)}</span>
          </div>
        </section>

        {/* Legal links */}
        <p className="font-['Poppins'] text-xs text-[#999] text-center">
          By confirming, you agree to our{" "}
          <button
            className="underline hover:text-[#7b7267]"
            onClick={() => setCurrentPage("terms")}
          >
            Terms & Conditions
          </button>{" "}
          and{" "}
          <button
            className="underline hover:text-[#7b7267]"
            onClick={() => setCurrentPage("privacy")}
          >
            Privacy Policy
          </button>
          .
        </p>

        <button
          className="w-full bg-[#332e28] hover:bg-[#2a2622] active:scale-95 transition py-4 rounded-[12px] font-['Poppins'] font-medium text-base text-white"
          onClick={handlePaymentSuccess}
        >
          Confirm &amp; Pay — SGD {total.toFixed(2)}
        </button>
      </main>
    </div>
  );
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export function ProfilePage() {
  const { userEmail, setCurrentPage, previousPage, handleLogout } = useApp();

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-[#332e28] px-4 md:px-8 lg:px-[76px] py-4 flex items-center justify-between">
        <button
          className="flex items-center gap-2 text-white hover:opacity-70 transition"
          onClick={() => setCurrentPage(previousPage)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
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
              <svg className="w-5 h-5 ml-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              </svg>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
}
