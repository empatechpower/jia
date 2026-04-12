// ─── Laminate Colours ─────────────────────────────────────────────────────────

export interface LaminateColor {
  id: string;
  name: string;
  code: string;
  hex: string;
}

export const LAMINATE_COLORS: LaminateColor[] = [
  { id: "oat-linen", name: "OAT LINEN", code: "4001", hex: "#C8BEB0" },
  { id: "mocha-linen", name: "MOCHA LINEN", code: "4002", hex: "#5A4E46" },
  {
    id: "charcoal-linen",
    name: "CHARCOAL LINEN",
    code: "4003",
    hex: "#3A3A3A",
  },
  { id: "matt-white", name: "MATT WHITE", code: "JM-0001", hex: "#FFFFFF" },
  { id: "gloss-white", name: "GLOSS WHITE", code: "JM-0001A", hex: "#F5F5F5" },
  { id: "matt-black", name: "MATT BLACK", code: "JM-0002", hex: "#3D3D3D" },
  { id: "gloss-black", name: "GLOSS BLACK", code: "JM-0002A", hex: "#484848" },
  {
    id: "matt-dust-storm",
    name: "MATT DUST STORM",
    code: "JM-0005",
    hex: "#C4C1B0",
  },
  {
    id: "gloss-dust-storm",
    name: "GLOSS DUST STORM",
    code: "JM-0005A",
    hex: "#B9B6A0",
  },
];

// ─── Door Options ─────────────────────────────────────────────────────────────

export const DOOR_OPTIONS_SMALL = [
  "Single Timber Door",
  "No Door",
  "With aluminium single door with full height handle",
  "With Door",
];

export const DOOR_OPTIONS_LARGE = [
  "Double Timber Door",
  "No Door",
  "With aluminium double door with full height handle",
  "With Door",
];

export const DOOR_OPTIONS_DEFAULT = ["Timber Door", "No Door"];

// ─── Door Finishing ───────────────────────────────────────────────────────────

export const DOOR_FINISHINGS = [
  "Mirror Clear",
  "Mirror Black",
  "Mirror Bronze",
  "Glass Clear",
  "Glass Black",
  "Glass Bronze",
];

// ─── Side Panel Options ───────────────────────────────────────────────────────

export interface SidePanelOption {
  id: string;
  label: string;
  cost: number;
}

export const SIDE_PANEL_OPTIONS: SidePanelOption[] = [
  { id: "not-required", label: "Not Required", cost: 0 },
  { id: "upgrade-40mm", label: "Upgrade from 18mm to 40mm: + $70", cost: 70 },
  { id: "extra-18mm", label: "Add extra 18mm side panel: + $180", cost: 180 },
  { id: "extra-40mm", label: "Add extra 40mm side panel: + $250", cost: 250 },
];

// ─── Handle Design ────────────────────────────────────────────────────────────

export interface HandleDesign {
  id: string;
  name: string;
  imageUrl: string;
  colorOptions: string[];
}

export const HANDLE_DESIGNS: HandleDesign[] = [
  {
    id: "Handle 1",
    name: "Handle 1",
    imageUrl:
      "https://images.unsplash.com/photo-1738520420690-9680253bf40b?w=400&q=80",
    colorOptions: ["Red", "Blue", "Black"],
  },
  {
    id: "Handle 2",
    name: "Handle 2",
    imageUrl:
      "https://images.unsplash.com/photo-1755870190789-113202c5096c?w=400&q=80",
    colorOptions: ["Red", "Blue", "Black"],
  },
  {
    id: "Handle 3",
    name: "Handle 3",
    imageUrl:
      "https://images.unsplash.com/photo-1566550023687-585a9c11eed0?w=400&q=80",
    colorOptions: ["Chrome", "Gold", "Black"],
  },
];

// ─── Aluminium Finishings ─────────────────────────────────────────────────────

export interface AlumFinishing {
  id: string;
  name: string;
  imageUrl: string;
}

export const ALUMINIUM_FINISHINGS: AlumFinishing[] = [
  {
    id: "Mirror Clear",
    name: "Mirror Clear",
    imageUrl:
      "https://images.unsplash.com/photo-1758985142652-2e9c88d88bb4?w=400&q=80",
  },
  {
    id: "Mirror Black",
    name: "Mirror Black",
    imageUrl:
      "https://images.unsplash.com/photo-1682024608823-f604953a3cdb?w=400&q=80",
  },
  {
    id: "Mirror Bronze",
    name: "Mirror Bronze",
    imageUrl:
      "https://images.unsplash.com/photo-1676807882679-7cb547cc6c54?w=400&q=80",
  },
  {
    id: "Glass Clear",
    name: "Glass Clear",
    imageUrl:
      "https://images.unsplash.com/photo-1737256359088-9b915e3efc66?w=400&q=80",
  },
  {
    id: "Glass Black",
    name: "Glass Black",
    imageUrl:
      "https://images.unsplash.com/photo-1669049765987-c61ad9e364e8?w=400&q=80",
  },
  {
    id: "Glass Bronze",
    name: "Glass Bronze",
    imageUrl:
      "https://images.unsplash.com/photo-1557852101-b6af39607675?w=400&q=80",
  },
];

// ─── Gallery images (replace with your CDN/Bubble file URLs) ─────────────────

export const PRODUCT_GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1530411554903-7e745b9f1f6d?w=600&q=80",
  "https://images.unsplash.com/photo-1567113463300-102a7eb3cb26?w=600&q=80",
  "https://images.unsplash.com/photo-1672137233327-37b0c1049e77?w=600&q=80",
  "https://images.unsplash.com/photo-1687953413905-731f620177ae?w=600&q=80",
  "https://images.unsplash.com/photo-1563310791-ae647a16498b?w=600&q=80",
  "https://images.unsplash.com/photo-1631048499455-4f9e26f23b9f?w=600&q=80",
];

// ─── Full ProductConfig type ──────────────────────────────────────────────────

export interface ProductConfig {
  internalColor: string | null;
  externalColor: string | null;
  width: string | null;
  width_id: string | null;
  doorOption: string | null;
  sidePanel: string | null;
  addLock: string | null;
  numberOfLocks: string | null;
  ledStrip: string | null;
  handleDesign: string | null;
  handleColor: string | null;
  aluminiumFrameColor: string | null;
  aluminiumDoorFinishing: string | null;
  remarks: string;
  kitchenCasementDoorOpening: string | null;
  blumRunnerUpgrade: string | null;
}

export const EMPTY_CONFIG: ProductConfig = {
  internalColor: null,
  externalColor: null,
  width: null,
  width_id: null,
  doorOption: null,
  sidePanel: null,
  addLock: null,
  numberOfLocks: null,
  ledStrip: "No",
  handleDesign: null,
  handleColor: null,
  aluminiumFrameColor: null,
  aluminiumDoorFinishing: null,
  remarks: "",
  kitchenCasementDoorOpening: null,
  blumRunnerUpgrade: null,
};
