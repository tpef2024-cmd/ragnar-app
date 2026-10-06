-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN: profes como atletas, horarios nuevos, alta de atletas por el
-- profe, datos personales, información/notas y asistencia para el profe.
-- Fecha: 2026-10-05
--
-- Correr en el SQL Editor DESPUÉS de 20261002b_rol_dueno_hybrid.sql.
-- Todo va en una transacción: si algo falla, no se aplica nada.
-- ═══════════════════════════════════════════════════════════════════════════

begin;

-- ── 1) Datos personales en profiles ──────────────────────────────────────────
alter table profiles add column if not exists phone             text;
alter table profiles add column if not exists birth_date        date;
alter table profiles add column if not exists emergency_contact text;
-- true = lo dio de alta un profe y no usa la app (ej. Kids sin celular)
alter table profiles add column if not exists sin_app boolean not null default false;

-- ── 2) Función auxiliar: usuario logueado y aprobado (atleta o coach) ────────
create or replace function public.is_approved_user()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and status = 'approved'
  );
$$;

-- ── 3) PROFILES: cada usuario puede editar SUS datos personales ──────────────
-- El trigger proteger_campos_perfil (abajo) impide que con esto cambie rol,
-- estado, grupo, disciplina, etc. Solo nombre, teléfono, nacimiento y
-- contacto de emergencia.
drop policy if exists "usuario edita su propio perfil" on profiles;
create policy "usuario edita su propio perfil"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Se recrea el candado sumando sin_app a los campos protegidos
create or replace function public.proteger_campos_perfil()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.is_approved_owner() then
    return new;
  end if;
  if new.role       is distinct from old.role
  or new.is_owner   is distinct from old.is_owner
  or new.status     is distinct from old.status
  or new.discipline is distinct from old.discipline
  or new.is_hybrid  is distinct from old.is_hybrid
  or new.group_id   is distinct from old.group_id
  or new.sin_app    is distinct from old.sin_app then
    raise exception 'Solo un dueño puede modificar rol, estado, grupo o disciplina';
  end if;
  return new;
end;
$$;

-- ── 4) Horarios nuevos: 11 horarios × 5 frecuencias = 55 grupos ──────────────
-- Mantiene el formato de nombre que ya usa la app ("8AM — 3x semana"). Solo
-- inserta los que no existen, así los grupos actuales (y sus atletas) quedan
-- intactos. Si la tabla tiene columna "schedule", se completa con la frecuencia.
do $$
declare
  h text;
  f text;
  tiene_schedule boolean;
begin
  select exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'groups' and column_name = 'schedule'
  ) into tiene_schedule;

  foreach h in array array['6AM','7AM','8AM','9AM','10AM','11AM','2PM','3PM','6PM','7PM','8PM'] loop
    foreach f in array array['2x semana','3x semana','4x semana','5x semana','6x semana'] loop
      if not exists (select 1 from groups where name = h || ' — ' || f) then
        if tiene_schedule then
          execute 'insert into groups (name, schedule) values ($1, $2)' using h || ' — ' || f, f;
        else
          execute 'insert into groups (name) values ($1)' using h || ' — ' || f;
        end if;
      end if;
    end loop;
  end loop;
end $$;

-- ── 5) INFORMACIÓN / NOTAS ───────────────────────────────────────────────────
--   kind = 'athlete' → la carga el atleta; la ven él y los profes
--   kind = 'coach'   → la carga un profe; la ven SOLO los profes
create table if not exists athlete_notes (
  id         uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references profiles(id) on delete cascade,
  author_id  uuid not null references profiles(id) on delete cascade default auth.uid(),
  kind       text not null check (kind in ('athlete', 'coach')),
  content    text not null check (length(trim(content)) > 0),
  created_at timestamptz not null default now()
);
create index if not exists athlete_notes_atleta on athlete_notes (athlete_id, created_at desc);

alter table athlete_notes enable row level security;

drop policy if exists "ver notas" on athlete_notes;
create policy "ver notas" on athlete_notes for select using (
  public.is_approved_coach()
  or (kind = 'athlete' and athlete_id = auth.uid() and public.is_approved_user())
);

drop policy if exists "cargar notas" on athlete_notes;
create policy "cargar notas" on athlete_notes for insert with check (
  author_id = auth.uid()
  and (
    (kind = 'coach' and public.is_approved_coach())
    or (kind = 'athlete' and athlete_id = auth.uid() and public.is_approved_user())
  )
);

drop policy if exists "borrar notas" on athlete_notes;
create policy "borrar notas" on athlete_notes for delete using (
  author_id = auth.uid() or public.is_approved_owner()
);

-- ── 6) ASISTENCIA: los profes la ven y pueden marcar presente ────────────────
-- (para Kids o Adultos Mayores que no escanean el QR)
drop policy if exists "coach ve asistencia" on attendance;
create policy "coach ve asistencia" on attendance for select using (public.is_approved_coach());

drop policy if exists "coach marca asistencia" on attendance;
create policy "coach marca asistencia" on attendance for insert with check (public.is_approved_coach());

drop policy if exists "coach borra asistencia" on attendance;
create policy "coach borra asistencia" on attendance for delete using (public.is_approved_coach());

-- ── 7) Los profes también son atletas: sus propias marcas ────────────────────
-- Estas políticas se suman a las que ya existan. Garantizan que cualquier
-- usuario aprobado (atleta o coach) pueda leer y cargar SUS registros.
drop policy if exists "usuario lee sus RMs" on rm_records;
create policy "usuario lee sus RMs" on rm_records for select
  using (athlete_id = auth.uid() and public.is_approved_user());
drop policy if exists "usuario carga sus RMs" on rm_records;
create policy "usuario carga sus RMs" on rm_records for insert
  with check (athlete_id = auth.uid() and public.is_approved_user());

drop policy if exists "usuario lee sus for time" on for_time_records;
create policy "usuario lee sus for time" on for_time_records for select
  using (athlete_id = auth.uid() and public.is_approved_user());
drop policy if exists "usuario carga sus for time" on for_time_records;
create policy "usuario carga sus for time" on for_time_records for insert
  with check (athlete_id = auth.uid() and public.is_approved_user());

drop policy if exists "usuario lee sus reps" on amrap_records;
create policy "usuario lee sus reps" on amrap_records for select
  using (athlete_id = auth.uid() and public.is_approved_user());
drop policy if exists "usuario carga sus reps" on amrap_records;
create policy "usuario carga sus reps" on amrap_records for insert
  with check (athlete_id = auth.uid() and public.is_approved_user());

drop policy if exists "usuario lee su asistencia" on attendance;
create policy "usuario lee su asistencia" on attendance for select
  using (athlete_id = auth.uid() and public.is_approved_user());
drop policy if exists "usuario marca su asistencia" on attendance;
create policy "usuario marca su asistencia" on attendance for insert
  with check (athlete_id = auth.uid() and public.is_approved_user());

commit;

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICACIÓN
--   select count(*) from groups;                       -- 55 o más
--   select tablename, rowsecurity from pg_tables
--   where schemaname = 'public' and tablename = 'athlete_notes';  -- true
-- ═══════════════════════════════════════════════════════════════════════════
