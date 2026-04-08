/**
 * api.ts — Centralised API service for the JIA Ideas frontend.
 *
 * All Bubble backend calls go through this file.
 * Swap the BASE_URL env var and this file is your only change point.
 *
 * Usage:
 *   import { api } from "@/services/api";
 *   const products = await api.products.list({ series: "hanging-drawers" });
 */

// ─── Config ───────────────────────────────────────────────────────────────────

const BASE = "https://jiaideas.com/version-test/api/1.1";
// const VERSION =  "live"; // "live" | "test"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  status: "success" | "error";
  data: T;
  message?: string;
}

export interface BubbleList<T> {
  results: T[];
  count: number;
  remaining: number;
  cursor?: number;
}

// ── Auth
export interface LoginPayload {
  email: string;
  password: string;
}
export interface SignupPayload {
  email: string;
  password: string;
  phone: string;
}
export interface AuthResponse {
  token: string;
  user_id: string;
  email: string;
  name: string;
}

// ── User / Profile
export interface UserProfile {
  _id: string;
  email: string;
  name: string;
  phone: string;
  Property_Type_Text: string;
  isThisYourProperty: string;
  zipCode: string;
  AmountOfRooms: number;
  addressUnit: string;
  created_at: string;
}

// ── Products
export interface Product {
  _id: string;
  name: string; // e.g. "Type A-D-D"
  product_id: string; // slug e.g. "type-a-d-d"
  series_id: string; // e.g. "hanging-drawers"
  area: "wardrobe" | "kitchen";
  description: string;
  images: string[]; // CDN URLs
  sketch_image: string; // CAD/sketch image URL
  is_active: boolean;
  pricing?: KitchenPriceTable;
}

export interface KitchenPriceTable {
  product_id: string;
  options: Array<{
    width: string;
    price: number;
    available: boolean;
    door_type?: "single" | "double";
  }>;
}

// ── Series
export interface Series {
  _id: string;
  series_id: string; // e.g. "hanging-drawers"
  name: string;
  area: "wardrobe" | "kitchen";
  image: string;
  is_active: boolean;
}

// ── Projects / Rooms
export interface Project {
  _id: string;
  user_id: string;
  property_type: string;
  is_own_property: boolean;
  zip_code: string;
  unit: string;
  key_date: string;
  number_of_rooms: number;
  created_at: string;
  status: "draft" | "submitted" | "in_progress" | "completed";
}

export interface Room {
  _id: string;
  project_id: string;
  name: string;
  area: "wardrobe" | "kitchen";
}

// ── Cart
export interface CartItem {
  _id: string;
  user_id: string;
  room_id: string;
  room_name: string;
  product_id: string;
  product_name: string;
  product_image: string;
  base_price: number;
  final_price: number;
  discount_rate: number;
  config: ProductConfiguration;
  created_at: string;
}

export interface ProductConfiguration {
  internal_color?: string;
  external_color?: string;
  width?: string;
  door_option?: string;
  handle_design?: string;
  handle_color?: string;
  aluminium_frame_color?: string;
  aluminium_door_finishing?: string;
  casement_door_opening?: string;
  casement_aluminum_frame?: string;
  casement_finishing?: string;
  door_type_optional?: string;
  sliding_finishing?: string;
  side_panel?: string;
  add_lock?: string;
  number_of_locks?: string;
  led_strip?: string;
  kitchen_casement_door_opening?: string;
  blum_runner_upgrade?: string;
  remarks?: string;
}

// ── Orders
export interface Order {
  _id: string;
  user_id: string;
  project_id: string;
  items: CartItem[];
  subtotal: number;
  discount_total: number;
  total: number;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  payment_status: "unpaid" | "paid" | "refunded";
  property_info: Project;
  created_at: string;
}

// ── Portfolio
export interface PortfolioProject {
  _id: string;
  title: string;
  Location: string;
  category: string;
  year: string;
  cover_image: string;
  gallery_images: string[];
  description: string;
  challenges: string[];
  solutions: string[];
  features: string[];
  client: string;
  featureImg: string;
  Special: string;
  duration: string;
  Name: string;
  size: string;
  featured: string;
}

// ─── HTTP helper ──────────────────────────────────────────────────────────────

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

async function request<T>(
  method: Method,
  path: string,
  body?: unknown,
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Bubble uses Bearer token from Bubble auth
  const storedToken = token ?? localStorage.getItem("jia_token");
  if (storedToken) headers["Authorization"] = `Bearer ${storedToken}`;

  const res = await fetch(`${BASE}/wf${path}`, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// Helper for Bubble's Data API (GET list/single)
async function dataGet<T>(
  path: string,
  params?: Record<string, string>
): Promise<T> {
  const url = new URL(`${BASE}/wf${path}`);
  if (params)
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const token = localStorage.getItem("jia_token");
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url.toString(), { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

// ─── API namespaces ───────────────────────────────────────────────────────────

export const api = {
  // ── Auth ─────────────────────────────────────────────────────────────────

  auth: {
    /** POST /wf/login → { token, user_id, email } */
    login: (payload: LoginPayload) =>
      request<AuthResponse>("POST", "/login", payload),

    /** POST /wf/signup */
    signup: (payload: SignupPayload) =>
      request<AuthResponse>("POST", "/signup", payload),

    /** POST /wf/logout */
    logout: () => request<void>("POST", "/logout"),

    /** POST /wf/forgot-password */
    forgotPassword: (email: string) =>
      request<void>("POST", "/forgot-password", { email }),
  },

  // ── User ─────────────────────────────────────────────────────────────────

  user: {
    /** GET /obj/user/:id */
    me: (userId: string) =>
      dataGet<{ response: any }>(`/get_current_user?id=${userId}`),

    /** PATCH /wf/update-profile */
    update: (payload: Partial<any>) =>
      request<any>("POST", "/update-profile", payload),
  },

  // ── Products ─────────────────────────────────────────────────────────────

  products: {
    /**
     * GET /obj/product
     * Bubble constraint format: constraints=[{"key":"series_id","constraint_type":"equals","value":"hanging-drawers"}]
     */
    list: (filters?: {
      series?: string;
      area?: "wardrobe" | "kitchen";
      is_active?: boolean;
    }) => {
      const constraints: Array<Record<string, string>> = [];
      if (filters?.series)
        constraints.push({
          key: "series_id",
          constraint_type: "equals",
          value: filters.series,
        });
      if (filters?.area)
        constraints.push({
          key: "area",
          constraint_type: "equals",
          value: filters.area,
        });
      if (filters?.is_active !== undefined)
        constraints.push({
          key: "is_active",
          constraint_type: "equals",
          value: String(filters.is_active),
        });
      return dataGet<{ response: BubbleList<Product> }>("/product", {
        ...(constraints.length
          ? { constraints: JSON.stringify(constraints) }
          : {}),
      });
    },

    /** GET /obj/product/:id */
    get_products: (id: string) =>
      dataGet<{ response: any }>(`/get_a_carpentry_prroduct?type=${id}`),
    get_handle_design: () => dataGet<{ response: any }>(`/get_handle_design`),
    get_aluminium_finishing: () =>
      dataGet<{ response: any }>(`/get_aluminium_door_finishing`),

    /** GET /obj/kitchen_pricing?constraints=[{"key":"product_id"...}] */
    pricing: (productId: string) =>
      dataGet<{ response: BubbleList<KitchenPriceTable> }>("/kitchen_pricing", {
        constraints: JSON.stringify([
          { key: "product_id", constraint_type: "equals", value: productId },
        ]),
      }),
  },

  // ── Series ────────────────────────────────────────────────────────────────

  series: {
    list: (area?: "wardrobe" | "kitchen") => {
      const constraints = area
        ? JSON.stringify([
            { key: "area", constraint_type: "equals", value: area },
          ])
        : undefined;
      return dataGet<{ response: BubbleList<Series> }>(
        "/series",
        constraints ? { constraints } : undefined
      );
    },
    get_category: () => {
      return dataGet<{ response: BubbleList<PortfolioProject> }>(
        "/get_carpentry_category"
      );
    },
    get_type: (category: string) => {
      return dataGet<{ response: BubbleList<PortfolioProject> }>(
        `/get_carpentry_type?category=${category}`
      );
    },
    get_a_type: (category: string) => {
      return dataGet<{ response: BubbleList<PortfolioProject> }>(
        `/get_type_by_id?id=${category}`
      );
    },
  },

  // ── Projects ──────────────────────────────────────────────────────────────

  projects: {
    /** POST /wf/create-project */
    create: (
      payload: Omit<Project, "_id" | "user_id" | "created_at" | "status">
    ) => request<{ project_id: string }>("POST", "/create-project", payload),

    /** GET /obj/project?constraints=[...] — list for current user */
    list: () => dataGet<{ response: BubbleList<Project> }>("/project"),

    /** GET /obj/project/:id */
    get: (id: string) => dataGet<{ response: Project }>(`/project/${id}`),
  },

  // ── Rooms ─────────────────────────────────────────────────────────────────

  rooms: {
    /** POST /wf/create-room */
    create: (payload: {
      project_id: string;
      name: string;
      area: "wardrobe" | "kitchen";
    }) => request<{ room_id: string }>("POST", "/create-room", payload),

    /** PATCH /wf/rename-room */
    rename: (roomId: string, name: string) =>
      request<void>("POST", "/rename-room", { room_id: roomId, name }),

    /** GET /obj/room?constraints=[{"key":"project_id"...}] */
    listByProject: (projectId: string) =>
      dataGet<{ response: BubbleList<Room> }>("/room", {
        constraints: JSON.stringify([
          { key: "project_id", constraint_type: "equals", value: projectId },
        ]),
      }),
  },

  // ── Cart ──────────────────────────────────────────────────────────────────

  cart: {
    /** POST /wf/add-to-cart */
    add: (payload: {
      room_id: string;
      room_name: string;
      product_id: string;
      product_name: string;
      product_image: string;
      base_price: number;
      final_price: number;
      discount_rate: number;
      config: ProductConfiguration;
    }) => request<{ cart_item_id: string }>("POST", "/add-to-cart", payload),

    /** GET /obj/cart_item?constraints=[...] */
    list: () => dataGet<{ response: BubbleList<CartItem> }>("/cart_item"),

    /** DELETE via POST /wf/remove-from-cart */
    remove: (cartItemId: string) =>
      request<void>("POST", "/remove-from-cart", { cart_item_id: cartItemId }),

    /** POST /wf/clear-cart */
    clear: () => request<void>("POST", "/clear-cart"),
  },

  // ── Orders ────────────────────────────────────────────────────────────────

  orders: {
    /** POST /wf/create-order */
    create: (payload: { project_id: string; property_info: object }) =>
      request<{ order_id: string }>("POST", "/create-order", payload),

    /** GET /obj/order?constraints=[...] */
    list: () => dataGet<{ response: BubbleList<Order> }>("/order"),

    /** GET /obj/order/:id */
    get: (id: string) => dataGet<{ response: Order }>(`/order/${id}`),
  },

  // ── Portfolio ─────────────────────────────────────────────────────────────

  portfolio: {
    list: () => {
      return dataGet<{ response: BubbleList<PortfolioProject> }>(
        "/get_portfolio"
      );
    },
    laminate_color: () => {
      return dataGet<{ response: BubbleList<PortfolioProject> }>(
        "/get_carpentry_external_colors"
      );
    },
    sample_products: () => {
      return dataGet<{ response: BubbleList<PortfolioProject> }>(
        "/get_sample_products"
      );
    },
    single: (id: string) => {
      return dataGet<{ response: BubbleList<PortfolioProject> }>(
        `/get_a_portfolio?id=${id}`
      );
    },
  },
};
