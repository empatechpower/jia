import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
  useEffect,
} from "react";
import type {
  Page,
  CartRoom,
  Room,
  KitchenInfo,
  PropertyInfo,
  ProductConfig,
} from "@/types";
import { calculateProductPrice } from "@/utils";
import { api, setLogoutHandler } from "@/services/api";
import { CartProduct } from "@/components/pages/TransactionalPages";

// ─── Shape ───────────────────────────────────────────────────────────────────
const TOKEN_KEY = "jia_token";
const USER_ID_KEY = "jia_user_id";
interface AppState {
  // Navigation
  currentPage: Page;
  previousPage: Page;
  setCurrentPage: (page: Page) => void;
  navigateTo: (page: Page, savePrevious?: boolean) => void;

  // Auth
  isLoggedIn: boolean;
  userEmail: string;
  userRole: string | null;
  handleLogin: (email: string) => void;
  handleLogout: () => void;

  currentProject: any | null;
  setCurrentProject: (project: any | null) => void;

  // Product flow
  selectedArea: string;
  selectedSeries: string;
  selectedSeriesId: string;
  selectedProductName: string;
  selectedProductId: string;
  selectedProductConfig: ProductConfig | undefined;
  selectedRoom: string;
  selectedRoomId: string;
  setSelectedArea: (area: string) => void;
  setSelectedSeries: (name: string) => void;
  setSelectedSeriesId: (id: string) => void;
  setSelectedProductName: (name: string) => void;
  setSelectedProductId: (id: string) => void;
  setSelectedProductConfig: (config: ProductConfig | undefined) => void;
  setSelectedRoom: (room: string) => void;
  setSelectedRoomId: (id: string) => void;

  // Project config
  numberOfRooms: number;
  propertyInfo: PropertyInfo;
  rooms: Room[];
  kitchenInfo: KitchenInfo | undefined;
  selectedProjectId: string;
  showSuccessMessage: boolean;
  setNumberOfRooms: (n: number) => void;
  setPropertyInfo: (info: PropertyInfo) => void;
  setRooms: (rooms: Room[]) => void;
  setKitchenInfo: (info: KitchenInfo | undefined) => void;
  setSelectedProjectId: (id: string) => void;
  setShowSuccessMessage: (v: boolean) => void;

  // Cart
  cartItems: CartRoom[];
  cartItemCount: number;
  handleAddProductToCart: (
    productName: string,
    roomId: string,
    roomName: string,
    productImage: string,
    config?: ProductConfig,
  ) => void;
  handleDeleteProduct: (roomId: string, productId: string) => void;
  handleUpdateRoomName: (roomId: string, newName: string) => void;
  handlePaymentSuccess: () => void;
  clearCart: () => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AppContext = createContext<AppState | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

const DEFAULT_PROPERTY: PropertyInfo = {
  propertyType: "BTO",
  isOwnProperty: "",
  zipCode: "612512",
  unit: "#04-10",
  keyDate: "15th September 2025",
};

export function AppProvider({ children }: { children: ReactNode }) {
  // Navigation
  const [currentPage, setCurrentPage] = useState<Page>("landing");
  const [previousPage, setPreviousPage] = useState<Page>("landing");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("page") === "paymentSuccess") {
      setCurrentPage("paymentSuccess");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);
  const navigateTo = useCallback((page: Page, savePrevious = false) => {
    if (savePrevious) setPreviousPage((prev) => prev);
    setCurrentPage((prev) => {
      if (savePrevious) setPreviousPage(prev);
      return page;
    });
  }, []);

  // Auth
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("user@example.com");
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("jia_token");
    const email = localStorage.getItem("jia_email");
    const role = localStorage.getItem("jia_role");

    if (token && email) {
      setIsLoggedIn(true);
      setUserEmail(email);
      if (role) setUserRole(role);
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    api.user
      .me()
      .then((data: any) => {
        const role: string | undefined =
          data?.response?.user?.Role ?? data?.response?.user?.Role;
        if (role) {
          setUserRole(role);
          localStorage.setItem("jia_role", role);
        }
      })
      .catch(() => {});
  }, [isLoggedIn]);
  const handleLogin = useCallback((email: string) => {
    setIsLoggedIn(true);
    setUserEmail(email);
    setCurrentPage("landing");
  }, []);

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setUserRole(null);
    setCurrentPage("landing");
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem("jia_email");
    localStorage.removeItem("jia_role");
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    api.projects
      .get_user_project()
      .then((data) => {
        const project = data?.response?.results;

        if (project?._id) {
          setCurrentProject(project); // ✅ store full object
        }
      })
      .catch(console.error);
  }, [isLoggedIn]);

  // Product flow
  const [currentProject, setCurrentProject] = useState<any | null>(null);
  const [selectedArea, setSelectedArea] = useState("wardrobe");
  const [selectedSeries, setSelectedSeries] = useState("Hanging and Drawers");
  const [selectedSeriesId, setSelectedSeriesId] = useState("");
  const [selectedProductName, setSelectedProductName] = useState("Type A-D-D");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedProductConfig, setSelectedProductConfig] = useState<
    ProductConfig | undefined
  >(undefined);
  const [selectedRoom, setSelectedRoom] = useState("Master Bedroom");
  const [selectedRoomId, setSelectedRoomId] = useState("room-1");

  // Project config
  const [numberOfRooms, setNumberOfRooms] = useState(1);
  const [propertyInfo, setPropertyInfo] =
    useState<PropertyInfo>(DEFAULT_PROPERTY);
  const [rooms, setRooms] = useState<Room[]>([
    { _id: "room-1", name: "Room 1" },
  ]);
  const [kitchenInfo, setKitchenInfo] = useState<KitchenInfo | undefined>(
    undefined,
  );
  const [selectedProjectId, setSelectedProjectId] = useState("1");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Cart
  const [cartItems, setCartItems] = useState<CartRoom[]>([]);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setCartCount(currentProject?.items?.length ?? 0);
  }, [currentProject?._id]);

  useEffect(() => {
    setLogoutHandler(handleLogout);
  }, [handleLogout]);

  const handleAddProductToCart = useCallback(
    (
      productName: string,
      roomId: string,
      roomName: string,
      productImage: string,
      config?: ProductConfig,
    ) => {
      const price = calculateProductPrice(
        selectedArea,
        selectedProductId,
        config,
      );

      const newProduct: CartProduct = {
        _id: `product-${Date.now()}`,
        name: productName,
        price,
        image: productImage,
        config,
      };

      setCartItems((prev) => {
        const existingIdx = prev.findIndex((r) => r._id === roomId);
        if (existingIdx >= 0) {
          return prev.map((r, i) =>
            i === existingIdx
              ? { ...r, products: [...r.products, newProduct] }
              : r,
          );
        }
        return [
          ...prev,
          {
            _id: roomId,
            name: roomName,
            sketchImages: [productImage],
            products: [newProduct],
          },
        ];
      });
      setCartCount((n) => n + 1);
    },
    [selectedArea, selectedProductId],
  );

  const handleDeleteProduct = useCallback(
    (roomId: string, productId: string) => {
      setCartItems((prev) =>
        prev
          .map((room) =>
            room._id === roomId
              ? {
                  ...room,
                  products: room.products.filter((p) => p._id !== productId),
                }
              : room,
          )
          .filter((room) => room.products.length > 0),
      );
      setCartCount((n) => Math.max(0, n - 1));
    },
    [],
  );

  const handleUpdateRoomName = useCallback(
    (roomId: string, newName: string) => {
      setCartItems((prev) =>
        prev.map((r) => (r._id === roomId ? { ...r, name: newName } : r)),
      );
    },
    [],
  );

  const clearCart = useCallback(() => {
    setCartItems([]);
    setCartCount(0);
  }, []);

  const handlePaymentSuccess = useCallback(() => {
    clearCart();
    setCurrentPage("profile");
  }, [clearCart]);

  const value: AppState = {
    currentPage,
    previousPage,
    setCurrentPage,
    navigateTo,
    isLoggedIn,
    userEmail,
    userRole,
    handleLogin,
    handleLogout,
    selectedArea,
    selectedSeries,
    selectedSeriesId,
    selectedProductName,
    selectedProductId,
    selectedProductConfig,
    selectedRoom,
    selectedRoomId,
    setSelectedArea,
    setSelectedSeries,
    setSelectedSeriesId,
    setSelectedProductName,
    setSelectedProductId,
    setSelectedProductConfig,
    setSelectedRoom,
    setSelectedRoomId,
    numberOfRooms,
    propertyInfo,
    rooms,
    kitchenInfo,
    selectedProjectId,
    showSuccessMessage,
    setNumberOfRooms,
    setPropertyInfo,
    setRooms,
    setKitchenInfo,
    setSelectedProjectId,
    setShowSuccessMessage,
    cartItems,
    cartItemCount: cartCount,
    handleAddProductToCart,
    handleDeleteProduct,
    handleUpdateRoomName,
    handlePaymentSuccess,
    clearCart,
    currentProject,
    setCurrentProject,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
