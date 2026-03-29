// Kitchen Cabinet Pricing Configuration

export interface PriceOption {
  width: string;
  price: number;
  available: boolean;
  doorType?: "single" | "double";
}

export interface ProductPricing {
  id: string;
  name: string;
  priceOptions: PriceOption[];
}

export const kitchenProductPricing: Record<string, ProductPricing> = {
  "bottom-w-door": {
    id: "bottom-w-door",
    name: "Bottom w/ Door",
    priceOptions: [
      { width: "400mm", price: 183.82, available: true, doorType: "single" },
      { width: "450mm", price: 206.88, available: true, doorType: "single" },
      { width: "500mm", price: 257.35, available: true, doorType: "single" },
      { width: "600mm", price: 272.06, available: true, doorType: "single" },
      { width: "800mm", price: 323.53, available: true, doorType: "double" },
      { width: "900mm", price: 367.65, available: true, doorType: "double" },
      { width: "1000mm", price: 470.59, available: true, doorType: "double" },
    ],
  },
  "bottom-w-2-drawer": {
    id: "bottom-w-2-drawer",
    name: "Bottom w/ 2 Drawer",
    priceOptions: [
      { width: "300mm", price: 0, available: false },
      { width: "350mm", price: 0, available: false },
      { width: "400mm", price: 0, available: false },
      { width: "450mm", price: 0, available: false },
      { width: "500mm", price: 0, available: false },
      { width: "600mm", price: 368.82, available: true },
      { width: "800mm", price: 382.35, available: true },
      { width: "900mm", price: 367.06, available: true },
      { width: "1000mm", price: 500.0, available: true },
    ],
  },
  "bottom-w-3-drawer": {
    id: "bottom-w-3-drawer",
    name: "Bottom w/ 3 Drawer",
    priceOptions: [
      { width: "300mm", price: 0, available: false },
      { width: "350mm", price: 0, available: false },
      { width: "400mm", price: 0, available: false },
      { width: "450mm", price: 0, available: false },
      { width: "500mm", price: 0, available: false },
      { width: "600mm", price: 338.24, available: true },
      { width: "800mm", price: 426.47, available: true },
      { width: "900mm", price: 470.59, available: true },
      { width: "1000mm", price: 573.53, available: true },
    ],
  },
  "sauce-rack": {
    id: "sauce-rack",
    name: "Sauce Rack",
    priceOptions: [
      { width: "300mm", price: 370.59, available: true },
      { width: "350mm", price: 385.29, available: true },
      { width: "400mm", price: 0, available: false },
      { width: "450mm", price: 0, available: false },
      { width: "500mm", price: 0, available: false },
      { width: "600mm", price: 0, available: false },
      { width: "800mm", price: 0, available: false },
      { width: "900mm", price: 0, available: false },
      { width: "1000mm", price: 0, available: false },
    ],
  },
  "tall-w-door": {
    id: "tall-w-door",
    name: "Tall w/ Door",
    priceOptions: [
      { width: "300mm", price: 0, available: false },
      { width: "350mm", price: 0, available: false },
      { width: "400mm", price: 345.59, available: true, doorType: "single" },
      { width: "450mm", price: 389.71, available: true, doorType: "single" },
      { width: "500mm", price: 492.65, available: true, doorType: "single" },
      { width: "600mm", price: 522.0, available: true, doorType: "single" },
      { width: "800mm", price: 617.65, available: true, doorType: "double" },
      { width: "900mm", price: 705.88, available: true, doorType: "double" },
      { width: "1000mm", price: 911.76, available: true, doorType: "double" },
    ],
  },
  "tall-w-door-drawer": {
    id: "tall-w-door-drawer",
    name: "Tall w/ Door (Drawer)",
    priceOptions: [
      { width: "300mm", price: 0, available: false },
      { width: "350mm", price: 0, available: false },
      { width: "400mm", price: 411.76, available: true, doorType: "single" },
      { width: "450mm", price: 455.88, available: true, doorType: "single" },
      { width: "500mm", price: 558.82, available: true, doorType: "single" },
      { width: "600mm", price: 617.65, available: true, doorType: "single" },
      { width: "800mm", price: 823.53, available: true, doorType: "double" },
      { width: "900mm", price: 911.76, available: true, doorType: "double" },
      { width: "1000mm", price: 1117.65, available: true, doorType: "double" },
    ],
  },
  "tall-oven-cabinet": {
    id: "tall-oven-cabinet",
    name: "Tall Oven Cabinet",
    priceOptions: [
      { width: "300mm", price: 0, available: false },
      { width: "350mm", price: 0, available: false },
      { width: "400mm", price: 0, available: false },
      { width: "450mm", price: 0, available: false },
      { width: "500mm", price: 0, available: false },
      { width: "600mm", price: 500.0, available: true },
      { width: "800mm", price: 0, available: false },
      { width: "900mm", price: 0, available: false },
      { width: "1000mm", price: 0, available: false },
    ],
  },
  "tall-oven-microwave-cabinet": {
    id: "tall-oven-microwave-cabinet",
    name: "Tall Oven & Microwave Cabinet",
    priceOptions: [
      { width: "300mm", price: 0, available: false },
      { width: "350mm", price: 0, available: false },
      { width: "400mm", price: 0, available: false },
      { width: "450mm", price: 0, available: false },
      { width: "500mm", price: 0, available: false },
      { width: "600mm", price: 500.0, available: true },
      { width: "800mm", price: 0, available: false },
      { width: "900mm", price: 0, available: false },
      { width: "1000mm", price: 0, available: false },
    ],
  },
  "fridge-cabinet-side-panel": {
    id: "fridge-cabinet-side-panel",
    name: "Fridge Cabinet & Side Panel",
    priceOptions: [
      { width: "300mm", price: 0, available: false },
      { width: "350mm", price: 0, available: false },
      { width: "400mm", price: 0, available: false },
      { width: "450mm", price: 0, available: false },
      { width: "500mm", price: 0, available: false },
      { width: "600mm", price: 0, available: false },
      { width: "800mm", price: 647.06, available: true },
      { width: "900mm", price: 735.29, available: true },
      { width: "1000mm", price: 641.18, available: true },
    ],
  },
  "bottom-l-shape": {
    id: "bottom-l-shape",
    name: "Bottom L-Shape",
    priceOptions: [
      { width: "300mm", price: 0, available: false },
      { width: "350mm", price: 0, available: false },
      { width: "400mm", price: 1088.24, available: true, doorType: "single" },
      { width: "450mm", price: 1161.76, available: true, doorType: "single" },
      { width: "500mm", price: 1235.29, available: true, doorType: "single" },
      { width: "600mm", price: 0, available: false },
      { width: "800mm", price: 0, available: false },
      { width: "900mm", price: 0, available: false },
      { width: "1000mm", price: 0, available: false },
    ],
  },
  "top-hung-w-door": {
    id: "top-hung-w-door",
    name: "Top Hung w/ Door",
    priceOptions: [
      { width: "200mm", price: 183.82, available: true, doorType: "single" },
      { width: "300mm", price: 183.82, available: true, doorType: "single" },
      { width: "400mm", price: 183.82, available: true, doorType: "single" },
      { width: "450mm", price: 206.88, available: true, doorType: "single" },
      { width: "500mm", price: 257.35, available: true, doorType: "single" },
      { width: "600mm", price: 250.0, available: true, doorType: "single" },
      { width: "800mm", price: 323.53, available: true, doorType: "double" },
      { width: "900mm", price: 367.65, available: true, doorType: "double" },
      { width: "1000mm", price: 470.59, available: true, doorType: "double" },
    ],
  },
  "top-hung-w-door-hl": {
    id: "top-hung-w-door-hl",
    name: "Top Hung w/ Door - HL",
    priceOptions: [
      { width: "200mm", price: 0, available: false },
      { width: "300mm", price: 0, available: false },
      { width: "400mm", price: 0, available: false },
      { width: "450mm", price: 0, available: false },
      { width: "500mm", price: 0, available: false },
      { width: "600mm", price: 580.88, available: true },
      { width: "800mm", price: 555.59, available: true },
      { width: "900mm", price: 636.71, available: true },
      { width: "1000mm", price: 742.65, available: true },
    ],
  },
  "top-hung-w-door-hl-dish": {
    id: "top-hung-w-door-hl-dish",
    name: "Top Hung w/ Door - HL DISH",
    priceOptions: [
      { width: "200mm", price: 0, available: false },
      { width: "300mm", price: 0, available: false },
      { width: "400mm", price: 0, available: false },
      { width: "450mm", price: 0, available: false },
      { width: "500mm", price: 0, available: false },
      { width: "600mm", price: 647.06, available: true },
      { width: "800mm", price: 673.53, available: true },
      { width: "900mm", price: 720.59, available: true },
      { width: "1000mm", price: 742.65, available: true },
    ],
  },
  "top-hung-w-door-2hk": {
    id: "top-hung-w-door-2hk",
    name: "Top Hung w/ Door - 2HK",
    priceOptions: [
      { width: "200mm", price: 0, available: false },
      { width: "300mm", price: 0, available: false },
      { width: "400mm", price: 0, available: false },
      { width: "450mm", price: 0, available: false },
      { width: "500mm", price: 0, available: false },
      { width: "600mm", price: 661.76, available: true },
      { width: "800mm", price: 676.47, available: true },
      { width: "900mm", price: 720.59, available: true },
      { width: "1000mm", price: 823.53, available: true },
    ],
  },
  "top-hung-w-door-2hk-dish": {
    id: "top-hung-w-door-2hk-dish",
    name: "Top Hung w/ Door - 2HK DISH",
    priceOptions: [
      { width: "200mm", price: 0, available: false },
      { width: "300mm", price: 0, available: false },
      { width: "400mm", price: 0, available: false },
      { width: "450mm", price: 0, available: false },
      { width: "500mm", price: 0, available: false },
      { width: "600mm", price: 727.94, available: true },
      { width: "800mm", price: 754.41, available: true },
      { width: "900mm", price: 801.47, available: true },
      { width: "1000mm", price: 911.76, available: true },
    ],
  },
  "top-hung-hood": {
    id: "top-hung-hood",
    name: "Top Hung Hood",
    priceOptions: [
      { width: "200mm", price: 0, available: false },
      { width: "300mm", price: 0, available: false },
      { width: "400mm", price: 0, available: false },
      { width: "450mm", price: 0, available: false },
      { width: "500mm", price: 0, available: false },
      { width: "600mm", price: 0, available: false },
      { width: "800mm", price: 0, available: false },
      { width: "900mm", price: 441.18, available: true },
      { width: "1000mm", price: 0, available: false },
    ],
  },
  "tsm-w-door": {
    id: "tsm-w-door",
    name: "Tall Storage w/ Door",
    priceOptions: [
      { width: "400mm", price: 358.82, available: true, doorType: "single" },
      { width: "450mm", price: 402.94, available: true, doorType: "single" },
      { width: "500mm", price: 505.88, available: true, doorType: "single" },
      { width: "600mm", price: 535.29, available: true, doorType: "single" },
      { width: "800mm", price: 632.35, available: true, doorType: "double" },
      { width: "900mm", price: 720.59, available: true, doorType: "double" },
      { width: "1000mm", price: 926.47, available: true, doorType: "double" },
    ],
  },
  "tsm-w-2-drawer": {
    id: "tsm-w-2-drawer",
    name: "Tall Storage w/ 2 Drawer",
    priceOptions: [
      { width: "400mm", price: 0, available: false },
      { width: "450mm", price: 0, available: false },
      { width: "500mm", price: 0, available: false },
      { width: "600mm", price: 382.35, available: true },
      { width: "800mm", price: 397.06, available: true },
      { width: "900mm", price: 441.18, available: true },
      { width: "1000mm", price: 514.71, available: true },
    ],
  },
  "tsm-w-3-drawer": {
    id: "tsm-w-3-drawer",
    name: "Tall Storage w/ 3 Drawer",
    priceOptions: [
      { width: "400mm", price: 0, available: false },
      { width: "450mm", price: 0, available: false },
      { width: "500mm", price: 0, available: false },
      { width: "600mm", price: 441.18, available: true },
      { width: "800mm", price: 529.41, available: true },
      { width: "900mm", price: 573.53, available: true },
      { width: "1000mm", price: 676.47, available: true },
    ],
  },
  "tsm-open": {
    id: "tsm-open",
    name: "Tall Storage Open",
    priceOptions: [
      { width: "400mm", price: 294.12, available: true },
      { width: "450mm", price: 338.24, available: true },
      { width: "500mm", price: 426.47, available: true },
      { width: "600mm", price: 455.88, available: true },
      { width: "800mm", price: 544.12, available: true },
      { width: "900mm", price: 617.65, available: true },
      { width: "1000mm", price: 764.71, available: true },
    ],
  },
  "gas-cylinder-cabinet": {
    id: "gas-cylinder-cabinet",
    name: "Gas Cylinder Cabinet",
    priceOptions: [
      { width: "400mm", price: 220.59, available: true, doorType: "single" },
      { width: "450mm", price: 247.06, available: true, doorType: "single" },
      { width: "500mm", price: 294.12, available: true, doorType: "single" },
      { width: "600mm", price: 323.53, available: true, doorType: "single" },
    ],
  },
};

export function getAvailableWidths(productId: string): string[] {
  const product = kitchenProductPricing[productId];
  if (!product) return [];
  return product.priceOptions
    .filter((o) => o.available)
    .map((o) => o.width);
}

export function getPrice(productId: string, width: string): number {
  const product = kitchenProductPricing[productId];
  if (!product) return 0;
  const opt = product.priceOptions.find(
    (o) => o.width === width && o.available
  );
  return opt ? opt.price : 0;
}

export function getDoorType(
  productId: string,
  width: string
): "single" | "double" | undefined {
  const product = kitchenProductPricing[productId];
  if (!product) return undefined;
  return product.priceOptions.find(
    (o) => o.width === width && o.available
  )?.doorType;
}
