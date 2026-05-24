-- THRIFTR clean Supabase schema
-- Use this instead of 001_initial_schema.sql.
-- It intentionally creates NO mock stores/listings.
-- If your Supabase project is fresh or contains only failed THRIFTR setup attempts,
-- run the whole file in Supabase SQL Editor.

create extension if not exists "pgcrypto";

drop trigger if exists on_auth_user_created on auth.users;
drop schema if exists private cascade;

drop table if exists public.messages cascade;
drop table if exists public.conversations cascade;
drop table if exists public.events cascade;
drop table if exists public.disputes cascade;
drop table if exists public.payments cascade;
drop table if exists public.orders cascade;
drop table if exists public.saved_listings cascade;
drop table if exists public.store_followers cascade;
drop table if exists public.listings cascade;
drop table if exists public.stores cascade;
drop table if exists public.applications cascade;
drop table if exists public.profiles cascade;

drop type if exists public.user_role cascade;
drop type if exists public.store_status cascade;
drop type if exists public.listing_grade cascade;
drop type if exists public.listing_status cascade;
drop type if exists public.order_status cascade;
drop type if exists public.dispute_status cascade;

create schema private;

create type public.user_role as enum ('buyer', 'owner', 'admin');
create type public.store_status as enum ('pending_review', 'verified', 'rejected', 'suspended');
create type public.listing_grade as enum ('A', 'B', 'C');
create type public.listing_status as enum ('available', 'reserved', 'sold', 'hidden');
create type public.order_status as enum ('pending', 'paid', 'ready', 'delivered', 'completed', 'disputed', 'cancelled', 'expired');
create type public.dispute_status as enum ('open', 'under_review', 'resolved', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text not null default 'Resident',
  role public.user_role not null default 'buyer',
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  store_name text not null check (char_length(store_name) between 2 and 120),
  description text,
  email text,
  instagram text,
  phone text,
  location text,
  specialty text,
  status text not null default 'pending' check (status in ('pending', 'reviewing', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) <= 120),
  slug text not null unique check (char_length(slug) <= 140),
  description text,
  location text,
  contact_phone text,
  whatsapp_phone text,
  instagram text,
  rating numeric(3, 2) not null default 0 check (rating >= 0 and rating <= 5),
  sales_count integer not null default 0,
  is_verified boolean not null default false,
  status public.store_status not null default 'pending_review',
  banner_image text,
  logo_image text,
  follower_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  store_name text not null,
  name text not null check (char_length(name) <= 200),
  price integer not null check (price > 0),
  original_price integer check (original_price is null or original_price >= price),
  category text not null check (category in ('Tops', 'Bottoms', 'Dresses', 'Shoes', 'Accessories', 'Outerwear', 'Premium Finds', 'Kids', 'Bags')),
  size text,
  grade public.listing_grade not null,
  brand text,
  description text,
  condition_notes text,
  images text[] not null default '{}',
  status public.listing_status not null default 'available',
  tray text not null default 'New Arrivals',
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete restrict,
  listing_name text not null,
  listing_image text,
  buyer_id uuid not null references public.profiles(id) on delete restrict,
  store_id uuid not null references public.stores(id) on delete restrict,
  store_name text not null,
  total_amount integer not null check (total_amount > 0),
  delivery_method text not null default 'pickup' check (delivery_method in ('pickup', 'buyer_courier', 'thriftr_delivery', 'uber')),
  phone_number text,
  status public.order_status not null default 'pending',
  daraja_checkout_request_id text,
  daraja_merchant_request_id text,
  uber_tracking_url text,
  dispute_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null default 'mpesa',
  provider_reference text,
  amount integer not null check (amount > 0),
  status text not null default 'initiated',
  raw_payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table public.disputes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  opened_by uuid not null references public.profiles(id) on delete restrict,
  status public.dispute_status not null default 'open',
  reason text not null,
  resolution text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.store_followers (
  store_id uuid not null references public.stores(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (store_id, user_id)
);

create table public.saved_listings (
  listing_id uuid not null references public.listings(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (listing_id, user_id)
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (buyer_id, store_id, listing_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  store_id uuid references public.stores(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete cascade,
  event_type text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index idx_profiles_role on public.profiles(role);
create index idx_applications_user_id on public.applications(user_id);
create index idx_applications_status on public.applications(status);
create index idx_stores_owner_id on public.stores(owner_id);
create index idx_stores_slug on public.stores(slug);
create index idx_stores_verified on public.stores(is_verified);
create index idx_listings_store_id on public.listings(store_id);
create index idx_listings_status on public.listings(status);
create index idx_listings_category on public.listings(category);
create index idx_listings_grade on public.listings(grade);
create index idx_listings_created_at on public.listings(created_at desc);
create index idx_orders_buyer_id on public.orders(buyer_id);
create index idx_orders_store_id on public.orders(store_id);
create index idx_orders_status on public.orders(status);
create index idx_conversations_buyer_id on public.conversations(buyer_id);
create index idx_conversations_store_id on public.conversations(store_id);
create index idx_messages_conversation_created on public.messages(conversation_id, created_at);
create index idx_events_store_created on public.events(store_id, created_at);
create index idx_events_type_created on public.events(event_type, created_at);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles for each row execute function private.set_updated_at();
create trigger applications_updated_at before update on public.applications for each row execute function private.set_updated_at();
create trigger stores_updated_at before update on public.stores for each row execute function private.set_updated_at();
create trigger listings_updated_at before update on public.listings for each row execute function private.set_updated_at();
create trigger orders_updated_at before update on public.orders for each row execute function private.set_updated_at();
create trigger disputes_updated_at before update on public.disputes for each row execute function private.set_updated_at();
create trigger conversations_updated_at before update on public.conversations for each row execute function private.set_updated_at();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'Resident'),
    'buyer',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

create or replace function private.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
    and role = 'admin'
  );
$$;

create or replace function private.owns_store(check_store_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.stores
    where id = check_store_id
    and owner_id = (select auth.uid())
  );
$$;

alter table public.profiles enable row level security;
alter table public.applications enable row level security;
alter table public.stores enable row level security;
alter table public.listings enable row level security;
alter table public.orders enable row level security;
alter table public.payments enable row level security;
alter table public.disputes enable row level security;
alter table public.store_followers enable row level security;
alter table public.saved_listings enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.events enable row level security;

create policy "profiles_read_own_or_admin"
on public.profiles for select
to authenticated
using (id = (select auth.uid()) or (select private.is_admin()));

create policy "profiles_admin_update"
on public.profiles for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "applications_insert_own"
on public.applications for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy "applications_read_own_or_admin"
on public.applications for select
to authenticated
using (user_id = (select auth.uid()) or (select private.is_admin()));

create policy "applications_admin_update"
on public.applications for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "stores_public_read_verified"
on public.stores for select
to anon, authenticated
using (is_verified = true and status = 'verified');

create policy "stores_owner_or_admin_read"
on public.stores for select
to authenticated
using (owner_id = (select auth.uid()) or (select private.is_admin()));

create policy "stores_admin_insert"
on public.stores for insert
to authenticated
with check ((select private.is_admin()));

create policy "stores_owner_or_admin_update"
on public.stores for update
to authenticated
using (owner_id = (select auth.uid()) or (select private.is_admin()))
with check (owner_id = (select auth.uid()) or (select private.is_admin()));

create policy "listings_public_read_available_verified_store"
on public.listings for select
to anon, authenticated
using (
  status = 'available'
  and exists (
    select 1
    from public.stores
    where stores.id = listings.store_id
    and stores.is_verified = true
    and stores.status = 'verified'
  )
);

create policy "listings_owner_or_admin_read"
on public.listings for select
to authenticated
using ((select private.owns_store(store_id)) or (select private.is_admin()));

create policy "listings_owner_or_admin_insert"
on public.listings for insert
to authenticated
with check ((select private.owns_store(store_id)) or (select private.is_admin()));

create policy "listings_owner_or_admin_update"
on public.listings for update
to authenticated
using ((select private.owns_store(store_id)) or (select private.is_admin()))
with check ((select private.owns_store(store_id)) or (select private.is_admin()));

create policy "listings_owner_or_admin_delete"
on public.listings for delete
to authenticated
using ((select private.owns_store(store_id)) or (select private.is_admin()));

create policy "orders_buyer_or_store_or_admin_read"
on public.orders for select
to authenticated
using (
  buyer_id = (select auth.uid())
  or (select private.owns_store(store_id))
  or (select private.is_admin())
);

create policy "orders_buyer_insert"
on public.orders for insert
to authenticated
with check (buyer_id = (select auth.uid()));

create policy "orders_buyer_store_or_admin_update"
on public.orders for update
to authenticated
using (
  buyer_id = (select auth.uid())
  or (select private.owns_store(store_id))
  or (select private.is_admin())
)
with check (
  buyer_id = (select auth.uid())
  or (select private.owns_store(store_id))
  or (select private.is_admin())
);

create policy "payments_admin_read"
on public.payments for select
to authenticated
using ((select private.is_admin()));

create policy "disputes_participant_or_admin_read"
on public.disputes for select
to authenticated
using (
  opened_by = (select auth.uid())
  or exists (
    select 1 from public.orders
    where orders.id = disputes.order_id
    and (orders.buyer_id = (select auth.uid()) or (select private.owns_store(orders.store_id)))
  )
  or (select private.is_admin())
);

create policy "disputes_buyer_insert"
on public.disputes for insert
to authenticated
with check (opened_by = (select auth.uid()));

create policy "disputes_admin_update"
on public.disputes for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "store_followers_manage_own"
on public.store_followers for all
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "saved_listings_manage_own"
on public.saved_listings for all
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy "conversations_participant_read"
on public.conversations for select
to authenticated
using (buyer_id = (select auth.uid()) or (select private.owns_store(store_id)) or (select private.is_admin()));

create policy "conversations_buyer_insert"
on public.conversations for insert
to authenticated
with check (buyer_id = (select auth.uid()));

create policy "messages_participant_read"
on public.messages for select
to authenticated
using (
  exists (
    select 1
    from public.conversations
    where conversations.id = messages.conversation_id
    and (
      conversations.buyer_id = (select auth.uid())
      or (select private.owns_store(conversations.store_id))
      or (select private.is_admin())
    )
  )
);

create policy "messages_participant_insert"
on public.messages for insert
to authenticated
with check (
  sender_id = (select auth.uid())
  and exists (
    select 1
    from public.conversations
    where conversations.id = messages.conversation_id
    and (
      conversations.buyer_id = (select auth.uid())
      or (select private.owns_store(conversations.store_id))
      or (select private.is_admin())
    )
  )
);

create policy "events_anon_insert"
on public.events for insert
to anon
with check (user_id is null);

create policy "events_auth_insert"
on public.events for insert
to authenticated
with check (user_id is null or user_id = (select auth.uid()));

create policy "events_admin_read"
on public.events for select
to authenticated
using ((select private.is_admin()));

grant usage on schema public to anon, authenticated;
grant select on public.stores, public.listings to anon;
grant insert on public.events to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;

grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.owns_store(uuid) to authenticated;
