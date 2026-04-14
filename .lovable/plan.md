

## Plan: Remove seller selector from Integrations page

The seller selector appearing on `/api/integracoes` is **not** from the global header — it's rendered directly inside the `Integrations.tsx` page component at line 751.

### Changes

**`src/pages/Integrations.tsx`**
- Remove line 751: `<SellerMarketplaceBar showStores={false} />`
- Remove the import of `SellerMarketplaceBar` (line 12) since it will no longer be used

The Sellers page (`Sellers.tsx`) does not have any seller selector embedded, so no changes needed there. The global header already correctly hides its seller switcher for both `/api/sellers` and `/api/integracoes` routes via the `HIDE_SELLER_SWITCHER_ROUTES` list.

