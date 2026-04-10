

## Plan: Fix store/seller filter reactivity on Sales page

### Root Cause

The reset effect (line 751-763) only triggers on `selectedSeller?.id` changes, **not** on `selectedStore` changes. When the user switches stores via the header selector:

1. The store-change effect (line 819) tries to reload data, but it uses stale callback closures due to `eslint-disable-line react-hooks/exhaustive-deps`
2. There is no loading state shown (`setLoading(true)` is never called for store changes)
3. The duplicate effect at line 840 also fires (since `loadFromCache` reference changes), creating race conditions with `loadDailyReqRef`

Additionally, the main init effect (line 765) has `selectedStore` in deps but is blocked by `cacheLoadedRef.current = true`, while the store-change effect (line 819) runs in parallel with potentially conflicting results.

### Changes to `src/pages/MercadoLivre.tsx`

1. **Add `selectedStore` to the reset effect** (line 763): Change deps from `[selectedSeller?.id]` to `[selectedSeller?.id, selectedStore]`. This ensures that switching stores fully resets local state and `cacheLoadedRef`, allowing the init effect (line 765) to re-run cleanly with the correct store context.

2. **Remove the redundant store-change effect** (lines 818-837): Since the reset effect now triggers on `selectedStore` changes and the init effect re-runs (because `cacheLoadedRef` is reset), this separate effect is no longer needed and was the source of stale closure issues.

### Files to modify
- `src/pages/MercadoLivre.tsx` -- 2 edits (add dep + remove effect)

