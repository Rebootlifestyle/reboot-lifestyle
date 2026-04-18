-- Semáforo Reboot — Schema inicial Fase A (captación silenciosa de datos)
-- Correr UNA vez en el SQL editor de Supabase después de crear el proyecto.
-- Fase B agregará: sistema de usuarios, moderación, índices geoespaciales, vistas.

-- ==========================================
-- Tabla principal: un registro por análisis
-- ==========================================
create table if not exists public.menu_analyses (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Análisis del modelo
  analysis_json jsonb not null,         -- respuesta completa del modelo (summary + items + notes)
  model text not null default 'claude-sonnet-4-6',
  prompt_version text not null default 'v1',

  -- Imagen
  image_hash text,                       -- sha256 del base64 (dedupe y detección de menús repetidos)
  image_storage_path text,               -- ruta en Supabase Storage (null si no se guardó)
  image_bytes integer,

  -- Atribución del restaurante (todo opcional, user-provided)
  restaurant_name text,
  restaurant_lat double precision,
  restaurant_lng double precision,
  location_accuracy_m double precision,  -- precisión del GPS en metros
  country_code text,                     -- detectado por reverse geocode en Fase B
  city text,

  -- Tracking básico
  user_agent text,
  ip_hash text,                          -- hasheado con salt para privacidad

  -- Moderación (para Fase B, default 'auto' por ahora)
  status text not null default 'auto' check (status in ('auto', 'approved', 'rejected', 'pending_review')),

  -- Flags útiles
  is_menu boolean not null default true, -- false si el modelo devolvió no_menu_detected
  num_items integer                      -- cantidad de platos detectados (para analytics rápidos)
);

-- ==========================================
-- Índices
-- ==========================================
create index if not exists idx_menu_analyses_created on public.menu_analyses (created_at desc);
create index if not exists idx_menu_analyses_restaurant_name on public.menu_analyses (restaurant_name) where restaurant_name is not null;
create index if not exists idx_menu_analyses_location on public.menu_analyses (restaurant_lat, restaurant_lng) where restaurant_lat is not null;
create index if not exists idx_menu_analyses_image_hash on public.menu_analyses (image_hash) where image_hash is not null;
create index if not exists idx_menu_analyses_status on public.menu_analyses (status);

-- ==========================================
-- Trigger: updated_at automático
-- ==========================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_menu_analyses_updated_at on public.menu_analyses;
create trigger trg_menu_analyses_updated_at
  before update on public.menu_analyses
  for each row execute function public.set_updated_at();

-- ==========================================
-- Row Level Security
-- ==========================================
alter table public.menu_analyses enable row level security;

-- El service_role (usado por nuestro backend) ignora RLS. Correcto.
-- Para la Fase A, NO permitimos select público desde el cliente.
-- En Fase B crearemos una vista pública para búsqueda por restaurante.

-- Policy explícita: nadie lee vía API pública (el cliente usa anon key)
drop policy if exists "no public read" on public.menu_analyses;
create policy "no public read" on public.menu_analyses
  for select to anon using (false);

-- ==========================================
-- Storage bucket para las imágenes
-- ==========================================
-- Correr en el SQL editor con permisos de superusuario (o crearlo vía dashboard):
-- Storage → New bucket → name: menu-images → Public: OFF

insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', false)
on conflict (id) do nothing;
