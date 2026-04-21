-- Semáforo Reboot — Fase Auth (migración aditiva)
-- Correr UNA vez en el SQL editor de Supabase.
-- Aditivo: no borra nada; solo agrega tablas/columnas.

-- ============================================================
-- 1. Perfiles de usuario de la app (atados a auth.users)
-- ============================================================
-- Valid cities (mega-cities, closed list). Editable con ALTER TABLE.
create table if not exists public.app_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  city text not null check (city in (
    'panama_city', 'david',
    'bogota', 'medellin', 'cartagena',
    'cdmx', 'guadalajara', 'monterrey',
    'miami', 'new_york',
    'buenos_aires', 'lima', 'santiago_cl', 'quito', 'san_jose_cr',
    'madrid', 'barcelona'
  )),
  referral_code text not null unique,
  referred_by uuid references public.app_users(id),
  bonus_uses integer not null default 0,
  total_uses integer not null default 0,
  is_admin boolean not null default false,
  synced_to_fluentcrm boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_app_users_city on public.app_users(city);
create index if not exists idx_app_users_referral_code on public.app_users(referral_code);
create index if not exists idx_app_users_referred_by on public.app_users(referred_by);

-- Trigger: updated_at automatic
drop trigger if exists trg_app_users_updated_at on public.app_users;
create trigger trg_app_users_updated_at
  before update on public.app_users
  for each row execute function public.set_updated_at();

-- RLS: a user can only read their own row
alter table public.app_users enable row level security;

drop policy if exists "users read own" on public.app_users;
create policy "users read own" on public.app_users
  for select to authenticated using (auth.uid() = id);

-- No public read (anon blocked)
drop policy if exists "no public read app_users" on public.app_users;
create policy "no public read app_users" on public.app_users
  for select to anon using (false);

-- ============================================================
-- 2. Helper: generate a unique referral code
-- ============================================================
create or replace function public.generate_referral_code(email_input text)
returns text as $$
declare
  base_slug text;
  candidate text;
  attempts integer := 0;
begin
  base_slug := lower(regexp_replace(split_part(email_input, '@', 1), '[^a-z0-9]', '', 'g'));
  base_slug := substring(base_slug, 1, 8);
  if length(base_slug) < 2 then
    base_slug := 'user';
  end if;
  loop
    candidate := base_slug || '-' || substring(md5(random()::text || clock_timestamp()::text), 1, 6);
    exit when not exists (select 1 from public.app_users where referral_code = candidate);
    attempts := attempts + 1;
    if attempts > 10 then
      candidate := 'user-' || substring(md5(random()::text || clock_timestamp()::text), 1, 10);
      exit;
    end if;
  end loop;
  return candidate;
end;
$$ language plpgsql security definer;

-- ============================================================
-- 3. Extend menu_analyses with user_id + city_code (nullable to preserve old data)
-- ============================================================
alter table public.menu_analyses
  add column if not exists user_id uuid references public.app_users(id) on delete set null;

alter table public.menu_analyses
  add column if not exists city_code text check (city_code in (
    'panama_city', 'david',
    'bogota', 'medellin', 'cartagena',
    'cdmx', 'guadalajara', 'monterrey',
    'miami', 'new_york',
    'buenos_aires', 'lima', 'santiago_cl', 'quito', 'san_jose_cr',
    'madrid', 'barcelona'
  ));

create index if not exists idx_menu_analyses_user_id on public.menu_analyses(user_id);
create index if not exists idx_menu_analyses_city_code on public.menu_analyses(city_code);

-- ============================================================
-- 4. Helper view: user stats for /api/me + dashboards
-- ============================================================
create or replace view public.user_stats as
  select
    u.id,
    u.email,
    u.city,
    u.referral_code,
    u.referred_by,
    u.bonus_uses,
    u.total_uses,
    u.is_admin,
    u.created_at,
    (3 + u.bonus_uses - u.total_uses) as uses_remaining,
    (select count(*) from public.app_users r where r.referred_by = u.id) as referrals_count
  from public.app_users u;

-- ============================================================
-- 5. Seed: mark specific admin users (idempotent)
-- To run manually once we know Arie's auth.users row:
--   update public.app_users set is_admin = true where email = 'arie@thefudlab.com';
