import { Handshake, Package, ShoppingBag, Store, Footprints, ShoppingCart } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface MarketplaceBrand {
  id: string;
  name: string;
  icon: LucideIcon;
  /** Tailwind gradient classes, e.g. "from-yellow-500 to-amber-500" */
  gradient: string;
  /** Tailwind badge/chip classes for lighter UI contexts */
  badge: string;
}

/**
 * Single source of truth for marketplace icons, names, and colors.
 * Import this everywhere instead of defining local icon maps.
 */
export const MARKETPLACE_BRANDS: MarketplaceBrand[] = [
  {
    id: "mercado-livre",
    name: "Mercado Livre",
    icon: Handshake,
    gradient: "from-yellow-500 to-amber-500",
    badge: "bg-yellow-500/10 text-yellow-700 border-yellow-500/30",
  },
  {
    id: "amazon",
    name: "Amazon",
    icon: Package,
    gradient: "from-orange-500 to-amber-600",
    badge: "bg-orange-500/10 text-orange-600 border-orange-500/30",
  },
  {
    id: "shopee",
    name: "Shopee",
    icon: ShoppingBag,
    gradient: "from-orange-600 to-red-500",
    badge: "bg-orange-500/10 text-orange-600 border-orange-500/30",
  },
  {
    id: "magalu",
    name: "Magazine Luiza",
    icon: Store,
    gradient: "from-blue-600 to-indigo-500",
    badge: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  },
  {
    id: "netshoes",
    name: "Netshoes",
    icon: Footprints,
    gradient: "from-purple-600 to-violet-500",
    badge: "bg-purple-500/10 text-purple-700 border-purple-500/30",
  },
  {
    id: "dafiti",
    name: "Dafiti",
    icon: ShoppingCart,
    gradient: "from-gray-500 to-gray-600",
    badge: "bg-gray-100 text-gray-900 border-gray-300 dark:bg-gray-800/50 dark:text-gray-100 dark:border-gray-600",
  },
];

/** Lookup by marketplace id */
export const getMarketplaceBrand = (id: string): MarketplaceBrand | undefined =>
  MARKETPLACE_BRANDS.find((m) => m.id === id);

/** Map from seller shortcodes to marketplace ids */
export const SELLER_TO_MP_ID: Record<string, string> = {
  ml: "mercado-livre",
  amz: "amazon",
  shopee: "shopee",
  magalu: "magalu",
  netshoes: "netshoes",
  dafiti: "dafiti",
};

/** Map from marketplace ids to seller shortcodes */
export const MP_TO_SELLER_ID: Record<string, string> = {
  "mercado-livre": "ml",
  amazon: "amz",
  shopee: "shopee",
  magalu: "magalu",
  netshoes: "netshoes",
  dafiti: "dafiti",
};
