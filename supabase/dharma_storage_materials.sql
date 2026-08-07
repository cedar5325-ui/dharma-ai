create extension if not exists pgcrypto;

insert into storage.buckets (id, name, public)
values ('dharma-original-files','dharma-original-files',false)
on conflict (id) do update set public=false;

create table if not exists public.dharma_materials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject text default '분류 대기',
  unit text default '단원 미분류',
  keywords text[] default '{}',
  file_type text default '파일',
  file_name text not null,
  mime_type text,
  size_bytes bigint,
  storage_bucket text not null default 'dharma-original-files',
  storage_path text not null,
  price integer not null default 20000,
  price_label text not null default '20,000원',
  description text,
  download_policy text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists dharma_materials_storage_unique
on public.dharma_materials (storage_bucket, storage_path);

create table if not exists public.dharma_purchases (
  id uuid primary key default gen_random_uuid(),
  material_id uuid references public.dharma_materials(id) on delete set null,
  material_title text,
  amount integer not null default 20000,
  status text not null default 'pending',
  purchase_token text not null unique,
  customer_name text,
  customer_phone text,
  customer_email text,
  downloaded_at timestamptz,
  download_count integer not null default 0,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists dharma_purchases_material_id_idx on public.dharma_purchases(material_id);
create index if not exists dharma_purchases_token_idx on public.dharma_purchases(purchase_token);

alter table public.dharma_materials enable row level security;
alter table public.dharma_purchases enable row level security;
