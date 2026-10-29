-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN: Módulo Híbrido (testeos cargados por coaches + marcas de atletas)
-- Fecha: 2026-10-29
-- ═══════════════════════════════════════════════════════════════════════════
-- hybrid_tests   → catálogo de testeos (lo administran los coaches)
-- hybrid_records → marcas de cada atleta, en SEGUNDOS (la app las muestra
--                  como HH:MM:SS). Se guarda el historial completo; la
--                  "mejor marca" es el menor tiempo.
--
-- RLS se activa en ambas tablas ANTES de usarlas (Supabase las crea sin RLS).
-- Ninguna política consulta su propia tabla: se usan funciones
-- SECURITY DEFINER (is_approved_coach / is_approved_user) para evitar
-- recursión, igual que en 20260804c_fix_recursion_profiles.sql.
-- ═══════════════════════════════════════════════════════════════════════════

-- 0) Helper: usuario logueado con status 'approved' (atleta o coach)
create or replace function public.is_approved_user()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and status = 'approved'
  );
$$;

-- 1) Catálogo de testeos
create table if not exists public.hybrid_tests (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  sort_order  int  not null default 0,
  active      boolean not null default true,   -- se desactiva en vez de borrar,
                                                -- para no perder marcas viejas
  created_by  uuid references public.profiles(id),
  created_at  timestamptz not null default now()
);

-- 2) Marcas de los atletas
create table if not exists public.hybrid_records (
  id            uuid primary key default gen_random_uuid(),
  athlete_id    uuid not null references public.profiles(id) on delete cascade,
  test_id       uuid not null references public.hybrid_tests(id) on delete cascade,
  time_seconds  int  not null check (time_seconds > 0),
  recorded_at   timestamptz not null default now()
);

create index if not exists hybrid_records_athlete_test_idx
  on public.hybrid_records (athlete_id, test_id);
create index if not exists hybrid_records_test_idx
  on public.hybrid_records (test_id);

-- 3) RLS
alter table public.hybrid_tests   enable row level security;
alter table public.hybrid_records enable row level security;

-- hybrid_tests: lectura para cualquier usuario aprobado; escritura solo coach
drop policy if exists "aprobados leen testeos hibrido" on public.hybrid_tests;
create policy "aprobados leen testeos hibrido"
  on public.hybrid_tests for select
  using (public.is_approved_user());

drop policy if exists "coach administra testeos hibrido" on public.hybrid_tests;
create policy "coach administra testeos hibrido"
  on public.hybrid_tests for all
  using (public.is_approved_coach())
  with check (public.is_approved_coach());

-- hybrid_records: el atleta ve/carga/borra lo suyo; el coach ve y borra todo
drop policy if exists "atleta o coach leen marcas hibrido" on public.hybrid_records;
create policy "atleta o coach leen marcas hibrido"
  on public.hybrid_records for select
  using (auth.uid() = athlete_id or public.is_approved_coach());

drop policy if exists "atleta aprobado carga sus marcas hibrido" on public.hybrid_records;
create policy "atleta aprobado carga sus marcas hibrido"
  on public.hybrid_records for insert
  with check (auth.uid() = athlete_id and public.is_approved_user());

drop policy if exists "atleta o coach borran marcas hibrido" on public.hybrid_records;
create policy "atleta o coach borran marcas hibrido"
  on public.hybrid_records for delete
  using (auth.uid() = athlete_id or public.is_approved_coach());

-- 4) Testeos iniciales
insert into public.hybrid_tests (name, sort_order) values
  ('1km Run',          1),
  ('2km Run',          2),
  ('100 Wall Ball',    3),
  ('Circuito Híbrido', 4),
  ('500mts Ski',       5),
  ('500mts Row',       6)
on conflict (name) do nothing;

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICACIÓN:
--   select tablename, rowsecurity from pg_tables where schemaname='public';
--   → ahora son 10 tablas, todas con rowsecurity = true.
--   select * from hybrid_tests order by sort_order;   → 6 filas
-- ═══════════════════════════════════════════════════════════════════════════
