-- Sellers: business entities per user
create table public.sellers (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  initials   text,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  unique(user_id, name)
);

alter table public.sellers enable row level security;
create policy "sellers: own rows" on public.sellers for all using (auth.uid() = user_id);

-- Seller stores: one row per marketplace account/channel
create table public.seller_stores (
  id           uuid primary key default gen_random_uuid(),
  seller_id    uuid not null references public.sellers(id) on delete cascade,
  marketplace  text not null,
  store_name   text not null,
  external_id  text,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

alter table public.seller_stores enable row level security;
create policy "seller_stores: own rows" on public.seller_stores for all
  using (exists (
    select 1 from public.sellers
    where id = seller_id and user_id = auth.uid()
  ));

-- Index for fast lookup by seller
create index seller_stores_seller_id_idx on public.seller_stores(seller_id);
