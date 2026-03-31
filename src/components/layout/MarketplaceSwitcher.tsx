import { Check, ChevronDown, Layers, Store } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMarketplace, type MarketplaceDefinition } from "@/contexts/MarketplaceContext";
import { useMLStore } from "@/contexts/MLStoreContext";
import { useSeller } from "@/contexts/SellerContext";
import { ALL_MARKETPLACES } from "@/types/seller";

// Map seller store marketplace ids to MarketplaceContext definitions
const SELLER_TO_MP_ID: Record<string, string> = {
  ml: "mercado-livre",
  amz: "amazon",
  shopee: "shopee",
  magalu: "magalu",
};

export function MarketplaceSwitcher() {
  const { marketplaces, selectedMarketplace, setSelectedMarketplace, connectedMarketplaces } =
    useMarketplace();
  const { stores: mlStores, selectedStore, setSelectedStore } = useMLStore();
  const { selectedSeller } = useSeller();

  const sellerStores = selectedSeller?.stores.filter((s) => s.is_active) ?? [];

  // Find marketplace definition for a seller store
  const getMpDef = (storeMarketplace: string): MarketplaceDefinition | undefined => {
    const mpId = SELLER_TO_MP_ID[storeMarketplace] ?? storeMarketplace;
    return marketplaces.find((m) => m.id === mpId);
  };

  const getStoreLogo = (storeMarketplace: string): string => {
    return ALL_MARKETPLACES.find((m) => m.id === storeMarketplace)?.logo ?? "🏪";
  };

  // Build selected label/icon from store selection
  const isStoreSelected = selectedMarketplace !== "all" && sellerStores.some((s) => s.id === selectedMarketplace);
  const selectedStoreObj = isStoreSelected ? sellerStores.find((s) => s.id === selectedMarketplace) : null;
  const selectedMpDef = selectedStoreObj ? getMpDef(selectedStoreObj.marketplace) : null;

  // Fallback: check if it's a legacy marketplace-level or ml-store selection
  const isMLSubStore = selectedMarketplace.startsWith("ml-store:");
  const selectedMLStoreId = isMLSubStore ? selectedMarketplace.replace("ml-store:", "") : null;
  const selectedMLStore = selectedMLStoreId
    ? mlStores.find((s) => s.ml_user_id === selectedMLStoreId)
    : null;

  const legacySelected =
    !isStoreSelected && !isMLSubStore && selectedMarketplace !== "all"
      ? marketplaces.find((m) => m.id === selectedMarketplace)
      : null;

  const mlMarketplace = marketplaces.find((m) => m.id === "mercado-livre");

  const label = selectedStoreObj
    ? selectedStoreObj.store_name
    : selectedMLStore
      ? `ML - ${selectedMLStore.displayName}`
      : legacySelected
        ? legacySelected.name
        : "Todos";

  const Icon = selectedStoreObj
    ? selectedMpDef?.icon
    : selectedMLStore
      ? mlMarketplace?.icon
      : legacySelected?.icon;

  const gradientClass = selectedStoreObj
    ? selectedMpDef?.color ?? ""
    : selectedMLStore
      ? mlMarketplace?.color ?? ""
      : legacySelected?.color ?? "";

  const handleSelectStore = (storeId: string) => {
    setSelectedMarketplace(storeId);
  };

  const handleSelectAll = () => {
    setSelectedMarketplace("all");
    setSelectedStore("all");
  };

  const allDotsExpanded = (
    <div className="flex items-center gap-1">
      {sellerStores.map((store) => {
        const mpDef = getMpDef(store.marketplace);
        if (!mpDef) return null;
        const MpIcon = mpDef.icon;
        return (
          <div
            key={store.id}
            className={`flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br ${mpDef.color}`}
          >
            <MpIcon className="h-[7px] w-[7px] text-white" />
          </div>
        );
      })}
    </div>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto gap-2.5 rounded-xl border border-border/50 bg-secondary/40 px-3 py-2 hover:bg-secondary/60"
        >
          <AnimatePresence mode="wait">
            {(selectedStoreObj || selectedMLStore || legacySelected) ? (
              <motion.div
                key={selectedStoreObj?.id ?? selectedMLStore?.ml_user_id ?? legacySelected?.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br shadow-sm ${gradientClass}`}
              >
                {Icon && <Icon className="h-3 w-3 text-white" />}
              </motion.div>
            ) : (
              <motion.div
                key="all"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {allDotsExpanded}
              </motion.div>
            )}
          </AnimatePresence>
          <div className="hidden text-left sm:block overflow-hidden">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium leading-tight">
              Loja
            </p>
            <AnimatePresence mode="wait">
              <motion.p
                key={label}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="text-xs font-semibold text-foreground leading-tight truncate max-w-[120px]"
              >
                {label}
              </motion.p>
            </AnimatePresence>
          </div>
          <ChevronDown className="ml-0.5 h-3.5 w-3.5 text-muted-foreground mx-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5">
        <DropdownMenuLabel className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground">
          <Store className="h-3.5 w-3.5" />
          Lojas
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* "All" option */}
        <DropdownMenuItem
          onClick={handleSelectAll}
          className={`cursor-pointer gap-2.5 rounded-lg px-2 py-2 ${
            selectedMarketplace === "all" ? "bg-accent/10" : ""
          }`}
        >
          <div
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
              selectedMarketplace === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            <Layers className="h-4 w-4" />
          </div>
          <span
            className={`flex-1 text-sm ${
              selectedMarketplace === "all" ? "font-semibold" : "font-medium"
            }`}
          >
            Todas
          </span>
          {selectedMarketplace === "all" && (
            <Check className="h-4 w-4 shrink-0 text-accent" />
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Individual stores */}
        {sellerStores.map((store) => {
          const mpDef = getMpDef(store.marketplace);
          const MpIcon = mpDef?.icon ?? Store;
          const color = mpDef?.color ?? "from-gray-500 to-gray-600";
          const isActive = selectedMarketplace === store.id;

          return (
            <DropdownMenuItem
              key={store.id}
              onClick={() => handleSelectStore(store.id)}
              className={`cursor-pointer gap-2.5 rounded-lg px-2 py-2 ${
                isActive ? "bg-accent/10" : ""
              }`}
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${color} text-white`}
              >
                <MpIcon className="h-4 w-4" />
              </div>
              <span
                className={`flex-1 text-sm truncate ${isActive ? "font-semibold" : "font-medium"}`}
              >
                {store.store_name}
              </span>
              {isActive && <Check className="h-4 w-4 shrink-0 text-accent" />}
            </DropdownMenuItem>
          );
        })}

        {sellerStores.length === 0 && (
          <DropdownMenuItem disabled className="text-xs text-muted-foreground">
            Nenhuma loja cadastrada
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
