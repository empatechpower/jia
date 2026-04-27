import { useApp } from "@/context/AppContext";
import { CartIconWithBadge } from "@/assets/icons";
import { useEffect, useState, useRef } from "react";
import { api } from "@/services/api";

// ─── Icons ────────────────────────────────────────────────────────────────────

function DoorIcon() {
  return (
    <svg
      className="w-5 h-5 text-[#7b7267] shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        d="M3 21h18M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16M9 10h.01"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
    </svg>
  );
}

// function TrashIcon() {
//   return (
//     <svg
//       className="w-4 h-4"
//       fill="none"
//       stroke="currentColor"
//       viewBox="0 0 24 24"
//     >
//       <path
//         d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         strokeWidth={1.8}
//       />
//     </svg>
//   );
// }

function PlusIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        d="M12 4v16m-8-8h16"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  );
}

// ─── Inline edit input ────────────────────────────────────────────────────────

function RenameInput({
  initialValue,
  onSave,
  onCancel,
}: {
  initialValue: string;
  onSave: (name: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") onSave(value.trim() || initialValue);
    if (e.key === "Escape") onCancel();
  }

  return (
    <input
      ref={inputRef}
      className="flex-1 min-w-0 bg-transparent font-['Poppins'] font-medium text-sm text-[#1C1B1F] outline-none border-b border-[#1C1B1F] pb-0.5"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => onSave(value.trim() || initialValue)}
      onKeyDown={handleKey}
    />
  );
}

// ─── Room card ────────────────────────────────────────────────────────────────

function RoomCard({
  room,
  onSelect,
  onRename,
  // onDelete,
  productCount,
}: {
  room: any;
  onSelect: () => void;
  onRename: (newName: string) => void;
  // onDelete: () => void;
  productCount: number;
}) {
  const [editing, setEditing] = useState(false);

  function handleSave(name: string) {
    setEditing(false);
    if (name !== room.name) onRename(name);
  }

  return (
    <div className="border border-gray-200 rounded-2xl bg-white flex items-center gap-3 px-4 py-3.5 hover:border-[#7b7267] transition group min-w-0">
      {/* Door icon */}
      <DoorIcon />

      {/* Name / edit input */}
      <div className="flex-1 min-w-0" onClick={!editing ? onSelect : undefined}>
        {editing ? (
          <RenameInput
            initialValue={room.name}
            onSave={handleSave}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <div className="cursor-pointer">
            <p className="font-['Poppins'] font-medium text-sm text-[#1C1B1F] truncate group-hover:text-[#332e28] leading-snug">
              {room.name}
            </p>
            {productCount > 0 && (
              <p className="font-['Poppins'] text-[10px] text-[#7b7267] mt-0.5">
                {productCount} product{productCount !== 1 ? "s" : ""} added
              </p>
            )}
          </div>
        )}
      </div>

      {/* Action buttons — always visible */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          aria-label={`Rename ${room.name}`}
          className="p-1.5 text-gray-400 hover:text-[#1C1B1F] transition rounded-lg hover:bg-gray-100"
          onClick={(e) => {
            e.stopPropagation();
            setEditing(true);
          }}
          type="button"
        >
          <PencilIcon />
        </button>
        {/* <button
          aria-label={`Delete ${room.name}`}
          className="p-1.5 text-gray-400 hover:text-red-500 transition rounded-lg hover:bg-red-50"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          type="button"
        >
          <TrashIcon />
        </button> */}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RoomSelectionPage() {
  const {
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

  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  // ── Initial sync: fetch rooms, create missing ones ──────────────────────────
  useEffect(() => {
    if (!propertyInfo?.projectId || !numberOfRooms) return;

    let isMounted = true;
    setLoading(true);

    const syncRooms = async () => {
      try {
        const res = await api.rooms.listByProject(propertyInfo.projectId ?? "");
        const existing = res?.response?.results ?? [];

        if (!isMounted) return;

        const missingCount = Number(numberOfRooms) - existing.length;

        if (missingCount > 0) {
          await Promise.all(
            Array.from({ length: missingCount }).map(() =>
              api.rooms.create({
                project: propertyInfo.projectId ?? "",
                area: selectedArea,
              }),
            ),
          );
          const updated = await api.rooms.listByProject(
            propertyInfo.projectId ?? "",
          );
          if (!isMounted) return;
          setRooms(updated?.response?.results ?? []);
        } else {
          setRooms(existing);
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

  // ── Select room → go to series ──────────────────────────────────────────────
  function handleSelectRoom(roomId: string, roomName: string) {
    setSelectedRoomId(roomId);
    setSelectedRoom(roomName);
    setCurrentPage("seriesSelection");
  }

  // ── Add room ────────────────────────────────────────────────────────────────
  // Calls api.rooms.create — you will wire this endpoint
  async function handleAddRoom() {
    if (adding) return;
    setAdding(true);
    try {
      await api.rooms.create({
        project: propertyInfo?.projectId ?? "",
        area: selectedArea,
      });
      const updated = await api.rooms.listByProject(
        propertyInfo?.projectId ?? "",
      );
      setRooms(updated?.response?.results ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  }

  // ── Rename room ─────────────────────────────────────────────────────────────
  // Calls api.rooms.rename — you will wire this endpoint
  async function handleRenameRoom(roomId: string, newName: string) {
    try {
      await api.rooms.rename(roomId, newName);
      setRooms((prev) =>
        prev.map((r) => (r._id === roomId ? { ...r, name: newName } : r)),
      );
    } catch (err) {
      console.error(err);
      // Optimistic: still update locally so UX is instant
      setRooms((prev) =>
        prev.map((r) => (r._id === roomId ? { ...r, name: newName } : r)),
      );
    }
  }

  // ── Delete room ─────────────────────────────────────────────────────────────
  // Calls api.rooms.delete — you will wire this endpoint
  // async function handleDeleteRoom(roomId?: string) {
  //   try {
  //     await api.rooms.delete(roomId);
  //     setRooms((prev) => prev.filter((r) => r._id !== roomId));
  //   } catch (err) {
  //     console.error(err);
  //     // Optimistic: still remove locally
  //     setRooms((prev) => prev.filter((r) => r._id !== roomId));
  //   }
  // }

  // ── Derive cart counts per room ─────────────────────────────────────────────
  function getProductCount(roomId: string) {
    return cartItems.find((r) => r._id === roomId)?.products?.length ?? 0;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-100 px-5 py-3.5 flex items-center justify-between relative">
        <button
          className="text-gray-900 hover:opacity-60 transition"
          onClick={() => setCurrentPage("areaSelection")}
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
            className="bg-[#7b7267] cursor-pointer text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg"
            onClick={() => navigateTo("landing", true)}
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

      {/* ── Success toast ── */}
      {showSuccessMessage && (
        <div
          className="bg-green-50 border border-green-200 text-green-800 font-['Poppins'] text-sm px-4 py-3 mx-4 mt-4 rounded-lg flex items-center justify-between"
          role="status"
        >
          <span>✓ Product added to your cart!</span>
          <button onClick={() => setShowSuccessMessage(false)}>✕</button>
        </div>
      )}

      {/* ── Body ── */}
      <main className="max-w-2xl mx-auto px-5 py-8">
        {/* Breadcrumb */}
        <p className="text-xs text-gray-400 mb-2.5">
          New Project &gt;{" "}
          <span className="text-gray-600 font-medium capitalize">
            {selectedArea}
          </span>{" "}
          &gt; <span className="text-gray-900 font-semibold">Room</span>
        </p>

        <h2 className="font-['Poppins'] font-bold text-2xl text-[#1C1B1F] mb-5">
          Select a room for your cabinetry
        </h2>

        {/* Info banner */}
        {!loading && rooms.length > 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-6 flex items-start gap-2">
            <svg
              className="w-4 h-4 text-blue-500 mt-0.5 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <p className="font-['Poppins'] text-sm text-blue-700">
              <span className="font-bold">
                {rooms.length} room{rooms.length !== 1 ? "s" : ""}
              </span>{" "}
              created based on your project details. You can rename them or add
              more rooms as needed.
            </p>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="border border-gray-100 rounded-2xl px-4 py-3.5 animate-pulse"
              >
                <div className="h-4 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {/* Room grid — 2 columns matching Figma */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {rooms.map((room: any) => (
              <RoomCard
                key={room._id}
                room={room}
                productCount={getProductCount(room._id)}
                onSelect={() => handleSelectRoom(room._id, room.name)}
                onRename={(name) => handleRenameRoom(room._id, name)}
                // onDelete={() => handleDeleteRoom(room._id)}
              />
            ))}
          </div>
        )}

        {/* Add Room button */}
        {!loading && (
          <button
            className="w-full flex items-center justify-center gap-2 border border-dashed border-gray-300 rounded-2xl py-3.5 text-gray-500 hover:border-[#7b7267] hover:text-[#7b7267] hover:bg-[#faf4e6] transition font-['Poppins'] font-medium text-sm disabled:opacity-50"
            disabled={adding}
            onClick={handleAddRoom}
            type="button"
          >
            <PlusIcon />
            {adding ? "Adding…" : "Add Room"}
          </button>
        )}

        {/* Empty state */}
        {!loading && rooms.length === 0 && (
          <div className="text-center py-10">
            <p className="font-['Poppins'] text-sm text-gray-400 mb-4">
              No rooms yet. Add one to get started.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
