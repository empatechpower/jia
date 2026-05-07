// ─── Page Navigation ────────────────────────────────────────────────────────

import { CartProduct } from "@/components/pages/TransactionalPages";

export type Page =
  | "landing"
  | "login"
  | "newProject"
  | "areaSelection"
  | "roomSelection"
  | "seriesSelection"
  | "productSelection"
  | "productDetails"
  | "aboutUs"
  | "portfolio"
  | "workDetails"
  | "cart"
  | "checkout"
  | "terms"
  | "privacy"
  | "profile"
  | "admin"
  | "forgotPassword";

// ─── Domain Models ───────────────────────────────────────────────────────────

export interface Room {
  _id: string;
  name: string;
}

export interface CartRoom {
  _id: string;
  name: string;
  sketchImages: string[];
  renderImages?: string[];
  products: CartProduct[];
}

export interface ProductConfig {
  width?: string;
  sidePanel?: "none" | "extra-18mm" | "extra-40mm";
  [key: string]: unknown;
}

export interface PropertyInfo {
  propertyType: string;
  isOwnProperty: string;
  zipCode: string;
  unit: string;
  keyDate: string;
  projectId?: string;
}

export interface KitchenInfo {
  layout?: string;
  gasType?: string;
  [key: string]: unknown;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  email: string;
  isLoggedIn: boolean;
}
