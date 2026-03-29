// ─── Brand ───────────────────────────────────────────────────────────────────

export const BRAND = {
  name: "JIA Ideas",
  tagline: "Complete design & renovation services",
  email: "info@jiaideas.com",
  phone: "+65 1234 5678",
  year: new Date().getFullYear(),
} as const;

// ─── Colors ──────────────────────────────────────────────────────────────────

export const COLORS = {
  primary: "#7b7267",
  primaryDark: "#675f56",
  dark: "#332e28",
  darkAlt: "#383838",
  cream: "#faf4e6",
  creamLight: "#fffdf1",
  promo: "#e74c3c",
} as const;

// ─── Series Name Map ─────────────────────────────────────────────────────────

export const SERIES_NAMES: Record<string, string> = {
  // Wardrobe series
  "hanging-drawers": "Hanging and Drawers",
  "shelvings-drawers": "Shelvings and Drawers",
  "long-hanging": "Long Hanging",
  "2-tier-hanging": "2 Tier Hanging",
  "shelvings-only": "Shelvings Only",
  "hanging-drawers-open": "Hanging & Drawers/ Open combine",
  "l-shape": "L-Shape",
  // Kitchen series
  "bottom-cabinet": "Bottom Cabinet",
  "tall-cabinet": "Tall Cabinet",
  wardrobe: "Wardrobe",
  "top-hung-cabinet": "Top Hung Cabinet",
  "tall-storage-module": "Tall Storage Module",
};

// ─── Product Name Map ─────────────────────────────────────────────────────────

export const KITCHEN_PRODUCT_NAMES: Record<string, string> = {
  "bottom-w-door": "Bottom w/ Door",
  "bottom-w-2-drawer": "Bottom w/ 2 Drawer",
  "bottom-w-3-drawer": "Bottom w/ 3 Drawer",
  "sauce-rack": "Sauce Rack",
  "tall-w-door": "Tall w/ Door",
  "tall-w-door-drawer": "Tall w/ Door (Drawer)",
  "tall-oven-cabinet": "Tall Oven Cabinet",
  "tall-oven-microwave-cabinet": "Tall Oven & Microwave Cabinet",
  "fridge-cabinet-side-panel": "Fridge Cabinet & Side Panel",
  "bottom-l-shape": "Bottom L-Shape",
  "top-hung-w-door": "Top Hung w/ Door",
  "top-hung-w-door-hl": "Top Hung w/ Door - HL",
  "top-hung-w-door-hl-dish": "Top Hung w/ Door - HL DISH",
  "top-hung-w-door-2hk": "Top Hung w/ Door - 2HK",
  "top-hung-w-door-2hk-dish": "Top Hung w/ Door - 2HK DISH",
  "top-hung-hood": "Top Hung Hood",
  "tsm-w-door": "Tall Storage w/ Door",
  "tsm-w-2-drawer": "Tall Storage w/ 2 Drawer",
  "tsm-w-3-drawer": "Tall Storage w/ 3 Drawer",
  "tsm-open": "Tall Storage Open",
};

export const WARDROBE_PRODUCT_NAMES: Record<string, string> = {
  "type-a-d-d": "Type A-D-D",
  "type-b-b-b-b": "Type B-B-B-B",
  "type-c-c-c": "Type C-C-C",
  "type-a-a-c-c": "Type A-A-C-C",
  "type-o-c-c": "Type O-C-C",
  w22: "W22",
  w23: "W23",
};

// ─── Discount ────────────────────────────────────────────────────────────────

export const DISCOUNT_RATE = 0.2; // 20% off

// ─── Side Panel Costs ─────────────────────────────────────────────────────────

export const SIDE_PANEL_COSTS: Record<string, number> = {
  "extra-18mm": 180,
  "extra-40mm": 250,
};

export const DEFAULT_WARDROBE_PRICE = 100;
