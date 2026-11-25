-- ============================================================================
-- Planificación: PDFs de entrenamiento para atletas que no pueden venir
-- (vacaciones, viaje, lesión, etc.).
--
--   · Un profe (o dueño) habilita la pestaña Planificación a un atleta HASTA una
--     fecha. Pasada esa fecha, la pestaña vuelve a quedar gris sola.
--   · El profe sube PDFs individuales para ese atleta (desde su ficha).
--   · El atleta ve y descarga SUS PDFs solo mientras está habilitado.
--
-- Por qué una tabla aparte y no una columna en profiles: los profes no pueden
-- editar perfiles (solo los dueños, ver 20261002b). Con una tabla propia
-- cualquier profe aprobado habilita sin abrirle permisos sobre el perfil.
--
-- Requiere hoy_ar() (20261105_ragneros_beneficios.sql) e is_approved_coach().
-- Reversión: 20261124_planificacion_REVERTIR.sql
-- ============================================================================

begin;

-- ── 1) Habilitación: una fila por atleta con la fecha hasta la que ve la tab ─
create table if not exists public.plan_habilitaciones (
  athlete_id  uuid primary key references public.profiles(id) on delete cascade,
  hasta       date not null,
  updated_by  uuid references public.profiles(id) on delete set null,
  updated_at  timestamptz not null default now()
);

-- ── 2) PDFs de planificación ────────────────────────────────────────────────
create table if not exists public.training_plans (
  id          uuid primary key default gen_random_uuid(),
  athlete_id  uuid not null references public.profiles(id) on delete cascade,
  title       text not null check (length(trim(title)) between 1 and 120),
  file_path   text not null unique,         -- planificaciones/<athlete_id>/<uuid>.pdf
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index if not exists training_plans_athlete_idx
  on public.training_plans (athlete_id, created_at desc);

-- ¿El atleta tiene la Planificación habilitada hoy? (fecha de Buenos Aires)
create or replace function public.plan_habilitado(p_athlete uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from plan_habilitaciones
    where athlete_id = p_athlete and hasta >= public.hoy_ar()
  );
$$;
revoke execute on function public.plan_habilitado(uuid) from public, anon;
grant  execute on function public.plan_habilitado(uuid) to authenticated;

-- ── 3) RLS ──────────────────────────────────────────────────────────────────
alter table public.plan_habilitaciones enable row level security;
alter table public.training_plans      enable row level security;

drop policy if exists "ver habilitacion plan"      on public.plan_habilitaciones;
drop policy if exists "profes habilitan plan"      on public.plan_habilitaciones;
drop policy if exists "profes cambian habilitacion" on public.plan_habilitaciones;
drop policy if exists "profes quitan habilitacion" on public.plan_habilitaciones;
create policy "ver habilitacion plan" on public.plan_habilitaciones for select
  using (athlete_id = auth.uid() or public.is_approved_coach());
create policy "profes habilitan plan" on public.plan_habilitaciones for insert
  with check (public.is_approved_coach());
create policy "profes cambian habilitacion" on public.plan_habilitaciones for update
  using (public.is_approved_coach()) with check (public.is_approved_coach());
create policy "profes quitan habilitacion" on public.plan_habilitaciones for delete
  using (public.is_approved_coach());

drop policy if exists "ver planificaciones"    on public.training_plans;
drop policy if exists "profes suben planes"    on public.training_plans;
drop policy if exists "profes borran planes"   on public.training_plans;
create policy "ver planificaciones" on public.training_plans for select
  using (
    public.is_approved_coach()
    or (athlete_id = auth.uid() and public.plan_habilitado(auth.uid()))
  );
create policy "profes suben planes" on public.training_plans for insert
  with check (public.is_approved_coach() and uploaded_by = auth.uid());
create policy "profes borran planes" on public.training_plans for delete
  using (public.is_approved_coach());

-- ── 4) Storage: bucket PRIVADO, solo PDF, hasta 10 MB ───────────────────────
-- El atleta descarga con URL firmada (vence en 1 hora), y solo de su carpeta
-- mientras está habilitado.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('planificaciones', 'planificaciones', false, 10485760, array['application/pdf'])
on conflict (id) do nothing;

drop policy if exists "planificaciones: profes suben" on storage.objects;
drop policy if exists "planificaciones: profes borran" on storage.objects;
drop policy if exists "planificaciones: leer" on storage.objects;
create policy "planificaciones: profes suben" on storage.objects for insert to authenticated
  with check (bucket_id = 'planificaciones' and public.is_approved_coach());
create policy "planificaciones: profes borran" on storage.objects for delete to authenticated
  using (bucket_id = 'planificaciones' and public.is_approved_coach());
create policy "planificaciones: leer" on storage.objects for select to authenticated
  using (
    bucket_id = 'planificaciones'
    and (
      public.is_approved_coach()
      or ((storage.foldername(name))[1] = auth.uid()::text and public.plan_habilitado(auth.uid()))
    )
  );

commit;

-- Verificación:
--   select tablename, policyname from pg_policies
--    where tablename in ('plan_habilitaciones','training_plans')
--       or policyname like 'planificaciones:%';          -- 9 filas
--   select id, public, file_size_limit from storage.buckets where id = 'planificaciones';
