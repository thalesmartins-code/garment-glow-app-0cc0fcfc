import { useMemo, useState } from "react";
import { Check, ChevronDown, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useSeller } from "@/contexts/SellerContext";
import { ALL_MARKETPLACES } from "@/types/seller";
import { cn } from "@/lib/utils";

const MP_MAP = Object.fromEntries(ALL_MARKETPLACES.map((m) => [m.id, m]));

interface Props {
  className?: string;
}

export function StoreGroupSelector({ className }: Props) {
  const { selectedSeller, selectedStoreIds, setSelectedStoreIds, toggleStoreId } = useSeller();
  const [open, setOpen] = useState(false);

  const activeStores = useMemo(
    () => (selectedSeller?.stores ?? []).filter((s) => s.is_active),
    [selectedSeller]
  );

  // Group stores by marketplace
  const groups = useMemo(() => {
    const map = new Map<string, typeof activeStores>();
    for (const store of activeStores) {
      if (!map.has(store.marketplace)) map.set(store.marketplace, []);
      map.get(store.marketplace)!.push(store);
    }
    return Array.from(map.entries()).map(([mpId, stores]) => ({
      mpId,
      mp: MP_MAP[mpId] ?? { id: mpId, name: mpId, logo: "🏪" },
      stores,
    }));
  }, [activeStores]);

  const allSelected = selectedStoreIds.length === 0;

  // Label shown on the trigger button
  const label = useMemo(() => {
    if (allSelected || activeStores.length === 0) {
      return activeStores.length > 0 ? `Todas (${activeStores.length})` : "Todas as lojas";
    }
    if (selectedStoreIds.length === 1) {
      const store = activeStores.find((s) => s.id === selectedStoreIds[0]);
      return store?.store_name ?? "1 loja";
    }
    if (selectedStoreIds.length <= 3) {
      return selectedStoreIds
        .map((id) => activeStores.find((s) => s.id === id)?.store_name ?? id)
        .join(" · ");
    }
    return `${selectedStoreIds.length} lojas`;
  }, [allSelected, activeStores, selectedStoreIds]);

  if (activeStores.length === 0) return null;

  const toggleAll = () => setSelectedStoreIds([]);

  const toggleMarketplace = (mpId: string) => {
    const mpStoreIds = groups.find((g) => g.mpId === mpId)?.stores.map((s) => s.id) ?? [];
    const allMpSelected = mpStoreIds.every((id) => selectedStoreIds.includes(id));
    if (allMpSelected) {
      // Deselect all stores of this marketplace
      const next = selectedStoreIds.filter((id) => !mpStoreIds.includes(id));
      setSelectedStoreIds(next);
    } else {
      // Select all stores of this marketplace (add any missing)
      const next = [...new Set([...selectedStoreIds, ...mpStoreIds])];
      setSelectedStoreIds(next);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 gap-1.5 px-3 text-sm font-medium border-border/70 bg-card hover:bg-accent/60",
            className
          )}
        >
          <Store className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="max-w-[200px] truncate">{label}</span>
          <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-64 p-2 rounded-xl shadow-lg">
        {/* All stores option */}
        <button
          onClick={toggleAll}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
            allSelected
              ? "bg-primary/10 text-primary font-medium"
              : "hover:bg-accent/60 text-foreground"
          )}
        >
          {allSelected ? (
            <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
          ) : (
            <span className="h-3.5 w-3.5 shrink-0" />
          )}
          <span>Todas as lojas</span>
          <span className="ml-auto text-xs text-muted-foreground">{activeStores.length}</span>
        </button>

        {groups.length > 0 && <Separator className="my-1.5" />}

        {/* Grouped store list */}
        {groups.map(({ mpId, mp, stores }) => {
          const mpStoreIds = stores.map((s) => s.id);
          const selectedInGroup = mpStoreIds.filter((id) => selectedStoreIds.includes(id));
          const allInGroupSelected =
            !allSelected && mpStoreIds.every((id) => selectedStoreIds.includes(id));
          const someInGroupSelected =
            !allSelected && selectedInGroup.length > 0 && !allInGroupSelected;

          return (
            <div key={mpId} className="mb-1 last:mb-0">
              {/* Marketplace header — click to toggle all in group */}
              <button
                onClick={() => toggleMarketplace(mpId)}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:bg-accent/40 transition-colors"
              >
                <span>{mp.logo}</span>
                <span>{mp.name}</span>
                {someInGroupSelected && (
                  <span className="ml-auto text-[10px] bg-primary/15 text-primary rounded-full px-1.5 py-0.5">
                    {selectedInGroup.length}/{stores.length}
                  </span>
                )}
                {allInGroupSelected && (
                  <Check className="ml-auto h-3 w-3 text-primary" />
                )}
              </button>

              {/* Individual stores */}
              {stores.map((store) => {
                const isChecked = !allSelected && selectedStoreIds.includes(store.id);
                return (
                  <button
                    key={store.id}
                    onClick={() => {
                      // If currently "all", start a specific selection with just this store
                      if (allSelected) {
                        setSelectedStoreIds([store.id]);
                      } else {
                        toggleStoreId(store.id);
                        // If deselecting last one, revert to "all"
                        if (selectedStoreIds.length === 1 && selectedStoreIds[0] === store.id) {
                          setSelectedStoreIds([]);
                        }
                      }
                    }}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg pl-7 pr-2.5 py-2 text-sm transition-colors",
                      isChecked
                        ? "bg-primary/8 text-primary font-medium"
                        : "hover:bg-accent/60 text-foreground"
                    )}
                  >
                    <Checkbox
                      checked={isChecked}
                      className="h-3.5 w-3.5 pointer-events-none"
                      tabIndex={-1}
                    />
                    <span className="flex-1 truncate text-left">{store.store_name}</span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
