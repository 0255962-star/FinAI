-- Supabase schema for FinAI
-- Ejecuta este script en el editor SQL de tu proyecto https://zujjknqoipkltkxgrmgy.supabase.co

-- ====================
-- TABLE: accounts
-- ====================
create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  name text not null,
  bank text,
  type text not null,                 -- 'debito' | 'credito' | 'ahorro' | 'efectivo' | 'otro'
  currency text not null default 'MXN',
  credit_limit numeric,
  initial_balance numeric not null default 0,
  is_active boolean not null default true,
  color text,
  created_at timestamptz not null default now()
);

-- ====================
-- TABLE: categories
-- ====================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  name text not null,
  type text not null,                 -- 'gasto' | 'ingreso' | 'mixto'
  created_at timestamptz not null default now()
);

-- ====================
-- TABLE: transactions
-- ====================
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  account_id uuid not null references public.accounts(id),
  date date not null,
  description text,
  amount numeric not null,            -- siempre positivo
  type text not null,                 -- 'gasto' | 'ingreso' | 'traspaso_salida' | 'traspaso_entrada'
  category_id uuid references public.categories(id),
  related_account_id uuid references public.accounts(id),
  created_at timestamptz not null default now()
);

-- ====================
-- Row Level Security
-- ====================
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;

-- Accounts policies
create policy "select_own" on public.accounts
  for select using (user_id = auth.uid());

create policy "insert_own" on public.accounts
  for insert with check (user_id = auth.uid());

create policy "update_own" on public.accounts
  for update using (user_id = auth.uid());

-- Categories policies
create policy "select_own" on public.categories
  for select using (user_id = auth.uid());

create policy "insert_own" on public.categories
  for insert with check (user_id = auth.uid());

create policy "update_own" on public.categories
  for update using (user_id = auth.uid());

-- Transactions policies
create policy "select_own" on public.transactions
  for select using (user_id = auth.uid());

create policy "insert_own" on public.transactions
  for insert with check (user_id = auth.uid());

create policy "update_own" on public.transactions
  for update using (user_id = auth.uid());
