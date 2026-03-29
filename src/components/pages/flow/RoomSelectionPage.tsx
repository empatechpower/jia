/**
 * RoomSelectionPage stub
 * Wire up original JSX here; replace prop callbacks with useApp() calls.
 */
import { useApp } from "@/context/AppContext";
import { CartIconWithBadge } from "@/assets/icons";

export default function RoomSelectionPage() {
  const {
    rooms,
    setRooms,
    cartItemCount,
    setCurrentPage,
    setSelectedRoom,
    setSelectedRoomId,
    navigateTo,
    showSuccessMessage,
    setShowSuccessMessage,
    cartItems,
    handleUpdateRoomName,
    selectedArea,
  } = useApp();

  function handleSelectRoom(roomId: string, roomName: string) {
    setSelectedRoomId(roomId);
    setSelectedRoom(roomName);
    setCurrentPage("seriesSelection");
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-[#332e28] px-4 md:px-8 lg:px-[76px] py-4 flex items-center justify-between">
        <button
          className="flex items-center gap-2 text-white hover:opacity-70 transition"
          onClick={() => setCurrentPage("areaSelection")}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
          <span className="font-['Poppins'] text-sm">Back</span>
        </button>
        <h1 className="font-['Poppins'] font-semibold text-white text-base">Select Room</h1>
        <button
          aria-label={`Cart, ${cartItemCount} items`}
          className="p-2 hover:opacity-80 transition"
          onClick={() => navigateTo("cart", true)}
        >
          <CartIconWithBadge color="#FFFFFF" count={cartItemCount} />
        </button>
      </header>

      {showSuccessMessage && (
        <div
          className="bg-green-50 border border-green-200 text-green-800 font-['Poppins'] text-sm px-4 py-3 mx-4 mt-4 rounded-lg flex items-center justify-between"
          role="status"
        >
          <span>✓ Product added to your cart!</span>
          <button onClick={() => setShowSuccessMessage(false)}>✕</button>
        </div>
      )}

      <main className="max-w-2xl mx-auto px-4 md:px-8 py-10">
        <h2 className="font-['Poppins'] font-bold text-2xl text-[#1C1B1F] mb-2">
          Select a Room
        </h2>
        <p className="font-['DM_Sans'] text-[#666] text-base mb-8">
          Choose which room you're configuring for{" "}
          <span className="capitalize font-medium text-[#332e28]">{selectedArea}</span>.
        </p>

        <ul className="space-y-3">
          {rooms.map((room) => {
            const cartRoom = cartItems.find((r) => r.id === room.id);
            return (
              <li key={room.id}>
                <button
                  className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-[#332e28] transition text-left group"
                  onClick={() => handleSelectRoom(room.id, room.name)}
                >
                  <div className="flex-1">
                    <p className="font-['Poppins'] font-medium text-[#1C1B1F] group-hover:text-[#332e28]">
                      {room.name}
                    </p>
                    {cartRoom && (
                      <p className="font-['Poppins'] text-xs text-[#7b7267] mt-0.5">
                        {cartRoom.products.length} product(s) added
                      </p>
                    )}
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-[#332e28]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
