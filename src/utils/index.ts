import { getPrice } from "@/config/kitchenPricing";
import type { ProductConfig } from "@/types";
import {
  KITCHEN_PRODUCT_NAMES,
  WARDROBE_PRODUCT_NAMES,
  SERIES_NAMES,
  DISCOUNT_RATE,
  SIDE_PANEL_COSTS,
  DEFAULT_WARDROBE_PRICE,
} from "@/constants";
import { CartProduct } from "@/components/pages/TransactionalPages";

/**
 * Resolve a human-readable product name from its ID.
 */
export function resolveProductName(productId: string): string {
  return (
    KITCHEN_PRODUCT_NAMES[productId] ||
    WARDROBE_PRODUCT_NAMES[productId] ||
    productId
  );
}

/**
 * Resolve a human-readable series name from its ID.
 */
export function resolveSeriesName(seriesId: string): string {
  return SERIES_NAMES[seriesId] || seriesId;
}

/**
 * Calculate the final price of a cart product, including discounts.
 */
export function calculateProductPrice(
  area: string,
  productId: string,
  config?: ProductConfig,
): number {
  let base = DEFAULT_WARDROBE_PRICE;

  if (area === "kitchen" && productId && config?.width) {
    const kitchenPrice = getPrice(productId, config.width as string);
    if (kitchenPrice > 0) base = kitchenPrice;
  }

  const sidePanel = config?.sidePanel as string | undefined;
  const extra = sidePanel ? (SIDE_PANEL_COSTS[sidePanel] ?? 0) : 0;

  return (base + extra) * (1 - DISCOUNT_RATE);
}

/**
 * Sum the total number of products across all cart rooms.
 */
export function countCartItems(
  cartItems: Array<{ products: CartProduct[] }>,
): number {
  return cartItems.reduce((sum, room) => sum + room.products.length, 0);
}

/**
 * Format a price as a locale currency string (SGD).
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
  }).format(amount);
}
