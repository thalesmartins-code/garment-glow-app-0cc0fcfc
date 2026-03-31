import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { Store, ShoppingCart, Package, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useSeller } from "@/contexts/SellerContext";

export interface MarketplaceDefinition {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string; // tailwind gradient classes
  connected: boolean;
}

// Maps SellerContext marketplace ids → MarketplaceContext ids
const SELLER_TO_MP: Record<string, string> = {
  "ml":     "mercado-livre",
  "amz":    "amazon",
  "shopee": "shopee",
  "magalu": "magalu",
};

// Maps MarketplaceContext ids → SellerContext ids
const MP_TO_SELLER: Record<string, string> = {
  "mercado-livre": "ml",
  "amazon":        "amz",
  "shopee":        "shopee",
  "magalu":        "magalu",
};

const allMarketplaces: MarketplaceDefinition[] = [
  {
    id: "mercado-livre",
    name: "Mercado Livre",
    icon: Store,
    color: "from-yellow-500 to-amber-500",
    connected: true,
  },
  {
    id: "amazon",
    name: "Amazon",
    icon: ShoppingCart,
    color: "from-orange-500 to-amber-600",
    connected: true,
  },
  {
    id: "shopee",
    name: "Shopee",
    icon: Package,
    color: "from-orange-600 to-red-500",
    connected: true,
  },
  {
    id: "magalu",
    name: "Magazine Luiza",
    icon: Truck,
    color: "from-blue-600 to-indigo-500",
    connected: true,
  },
];

interface MarketplaceState {
  marketplaces: MarketplaceDefinition[];
  selectedMarketplace: string; // "all" | marketplace id | "ml-store:USER_ID"
  setSelectedMarketplace: (id: string) => void;
  activeMarketplace: MarketplaceDefinition | null;
  connectedMarketplaces: MarketplaceDefinition[];
}

const MarketplaceContext = createContext<MarketplaceState | null>(null);

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const {
    selectedMarketplace: sellerMkt,
    setSelectedMarketplace: setSellerMkt,
    availableMarketplaces: sellerMps,
  } = useSeller();

  // Track ml sub-store selection locally (e.g. "ml-store:USER_ID")
  const [mlSubStoreKey, setMlSubStoreKey] = useState<string | null>(null);

  // Clear ml sub-store when seller switches away from ml
  useEffect(() => {
    if (sellerMkt !== "ml") setMlSubStoreKey(null);
  }, [sellerMkt]);

  // Derive the MarketplaceContext-style id from SellerContext + optional sub-store
  const selectedMarketplace =
    mlSubStoreKey ??
    (sellerMkt === "all" ? "all" : (SELLER_TO_MP[sellerMkt] ?? "all"));

  const setSelectedMarketplace = useCallback(
    (id: string) => {
      if (id.startsWith("ml-store:")) {
        setMlSubStoreKey(id);
        setSellerMkt("ml");
      } else {
        setMlSubStoreKey(null);
        const sellerId = MP_TO_SELLER[id] ?? (id === "all" ? "all" : id);
        setSellerMkt(sellerId);
      }
    },
    [setSellerMkt]
  );

  // Build marketplace list, marking ones the seller doesn't have as not connected
  const sellerMpIds = new Set(sellerMps.map((m) => SELLER_TO_MP[m.id] ?? m.id));
  const marketplaces: MarketplaceDefinition[] = allMarketplaces.map((m) => ({
    ...m,
    connected: sellerMps.length === 0 ? m.connected : sellerMpIds.has(m.id),
  }));

  const connectedMarketplaces = marketplaces.filter((m) => m.connected);

  // For ml-store selection, activeMarketplace is the ML definition
  const activeMarketplace =
    selectedMarketplace === "all"
      ? null
      : selectedMarketplace.startsWith("ml-store:")
      ? (allMarketplaces.find((m) => m.id === "mercado-livre") ?? null)
      : (marketplaces.find((m) => m.id === selectedMarketplace) ?? null);

  return (
    <MarketplaceContext.Provider
      value={{
        marketplaces,
        selectedMarketplace,
        setSelectedMarketplace,
        activeMarketplace,
        connectedMarketplaces,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplace() {
  const ctx = useContext(MarketplaceContext);
  if (!ctx) throw new Error("useMarketplace must be used within MarketplaceProvider");
  return ctx;
}
