import { useApp } from "@/context/AppContext";
import { CartIconWithBadge } from "@/assets/icons";
import { useEffect, useState } from "react";
import { api } from "@/services/api";

export default function RoomSelectionPage() {
  const {
    // rooms,
    propertyInfo,
    cartItemCount,
    setCurrentPage,
    setSelectedRoom,
    setSelectedRoomId,
    navigateTo,
    showSuccessMessage,
    setShowSuccessMessage,
    cartItems,
    numberOfRooms,
    selectedArea,
  } = useApp();
  const [room, setRoom] = useState<any | null>(null);
  const [, setLoading] = useState(true);

  function handleSelectRoom(roomId: string, roomName: string) {
    setSelectedRoomId(roomId);
    setSelectedRoom(roomName);
    setCurrentPage("seriesSelection");
  }
  useEffect(() => {
    if (!propertyInfo?.projectId || !numberOfRooms) return;

    let isMounted = true;

    const syncRooms = async () => {
      setLoading(true);

      try {
        const res = await api.rooms.listByProject(propertyInfo.projectId ?? "");
        const rooms = res?.response?.results || [];

        if (!isMounted) return;

        setRoom(rooms);

        const missingCount = Number(numberOfRooms) - rooms.length;

        // ✅ If more rooms needed → create them
        if (missingCount > 0) {
          const createPromises = Array.from({ length: missingCount }).map((_) =>
            api.rooms.create({
              project: propertyInfo.projectId ?? "",
              area: selectedArea, // auto naming
            }),
          );

          await Promise.all(createPromises);

          // ✅ Refetch updated rooms
          const updated = await api.rooms.listByProject(
            propertyInfo.projectId ?? "",
          );

          if (!isMounted) return;

          setRoom(updated?.response?.results || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    syncRooms();

    return () => {
      isMounted = false;
    };
  }, [propertyInfo?.projectId, numberOfRooms]);

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-100 px-5 py-3.5 flex items-center justify-between relative">
        <button
          onClick={() => setCurrentPage("areaSelection")}
          className="text-gray-900 hover:opacity-60 transition"
        >
          <svg
            className="w-6 h-6"
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

        <span className="absolute left-1/2 -translate-x-1/2 font-semibold text-[15px] text-gray-900">
          New Project
        </span>

        <div className="flex items-center gap-2.5">
          <span
            onClick={() => navigateTo("landing", true)}
            className="bg-[#7b7267] cursor-pointer text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg"
          >
            Home
          </span>
          <button
            aria-label={`Cart, ${cartItemCount} items`}
            className="p-2 hover:opacity-80 transition"
            onClick={() => navigateTo("cart", true)}
          >
            <CartIconWithBadge color="#000000" count={cartItemCount} />
          </button>
        </div>
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
        <p className="text-xs text-gray-400 mb-2.5">
          New Project &gt;{" "}
          <span className="text-gray-600 font-medium">{selectedArea}</span>
          &gt; <span className="text-gray-600 font-medium">Room</span>
        </p>
        <h2 className="font-['Poppins'] font-bold text-2xl text-[#1C1B1F] mb-2">
          Select a room for your cabinetry
        </h2>

        <ul className="space-y-3">
          {room?.map((room: any) => {
            const cartRoom = cartItems.find((r) => r._id === room._id);
            return (
              <li key={room._id}>
                <button
                  className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-[#332e28] transition text-left group"
                  onClick={() => handleSelectRoom(room._id, room.name)}
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
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-[#332e28]"
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
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
