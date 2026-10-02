-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN: Rol dueño vs profe + disciplina Hybrid + Kids/Teens
-- Fecha: 2026-10-02
--
-- Modelo de permisos:
--   · Dueños  → role = 'coach' + is_owner = true. Ven y manejan todo:
--               pagos de todas las disciplinas, precios de cuotas, tienda,
--               promos, solicitudes, grupos/disciplinas de los atletas.
--   · Profes  → role = 'coach' + is_owner = false. Ven atletas, RMs y grupos,
--               y solo cobran / revierten cuotas de atletas Kids o Teens.
--   · Atletas → sin cambios.
--
-- Hybrid es complementaria (convive con la disciplina principal), por eso
-- es una marca aparte (is_hybrid) y no un valor más de `discipline`.
--
-- Correr en el SQL Editor DESPUÉS de 20261002_pagos_unico_por_mes.sql.
-- Todo va en una transacción: si algo falla, no se aplica nada.
-- ═══════════════════════════════════════════════════════════════════════════

begin;

-- ── 1) Columnas nuevas en profiles ───────────────────────────────────────────
alter table profiles add column if not exists is_owner  boolean not null default false;
alter table profiles add column if not exists is_hybrid boolean not null default false;

-- "Niños" pasa a llamarse "Kids" (y se suma "Teens" desde la app)
update profiles set discipline = 'Kids' where discipline = 'Niños';

-- ── 2) Funciones auxiliares (SECURITY DEFINER para no caer en recursión RLS) ─
create or replace function public.is_approved_owner()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'coach' and status = 'approved' and is_owner
  );
$$;

-- ¿El atleta es de Kids o Teens? (lo que un profe tiene permitido cobrar)
create or replace function public.es_kids_teens(atleta uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles
    where id = atleta and discipline in ('Kids', 'Teens')
  );
$$;

-- Puede manejar el pago de este atleta: dueño, o profe si es Kids/Teens
create or replace function public.puede_manejar_pago(atleta uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.is_approved_owner()
      or (public.is_approved_coach() and public.es_kids_teens(atleta));
$$;

-- ── 3) PROFILES: solo dueños modifican perfiles de otros ─────────────────────
-- (aprobar / rechazar / revocar / reactivar, grupo, disciplina, Hybrid)
drop policy if exists "coach aprueba o revoca atletas" on profiles;
drop policy if exists "dueno actualiza perfiles" on profiles;
create policy "dueno actualiza perfiles"
  on profiles for update
  using (public.is_approved_owner())
  with check (public.is_approved_owner());

-- Candado extra: aunque exista otra política que deje a un usuario editar su
-- propio perfil, nadie que no sea dueño puede cambiar estos campos (evita,
-- por ejemplo, que un profe se marque como dueño o un atleta como coach).
-- Desde el SQL Editor (sin usuario logueado) sí se puede.
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
  or new.group_id   is distinct from old.group_id then
    raise exception 'Solo un dueño puede modificar rol, estado, grupo o disciplina';
  end if;
  return new;
end;
$$;

drop trigger if exists proteger_campos_perfil on profiles;
create trigger proteger_campos_perfil
  before update on profiles
  for each row execute function public.proteger_campos_perfil();

-- ── 4) Borrar las políticas viejas de las tablas de dinero y tienda ──────────
-- Se borran TODAS (con el nombre que tengan) y se recrean abajo, así no queda
-- ninguna política anterior más permisiva dando acceso por otro lado.
do $$
declare r record;
begin
  for r in
    select policyname, tablename from pg_policies
    where schemaname = 'public'
      and tablename in ('payments', 'payment_plans', 'products', 'promotions')
  loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

alter table payments      enable row level security;
alter table payment_plans enable row level security;
alter table products      enable row level security;
alter table promotions    enable row level security;

-- ── 5) PAYMENTS: dueños todo, profes solo Kids/Teens ─────────────────────────
create policy "ver pagos"       on payments for select using (public.puede_manejar_pago(athlete_id));
create policy "registrar pagos" on payments for insert with check (public.puede_manejar_pago(athlete_id));
create policy "editar pagos"    on payments for update using (public.puede_manejar_pago(athlete_id))
                                                     with check (public.puede_manejar_pago(athlete_id));
create policy "revertir pagos"  on payments for delete using (public.puede_manejar_pago(athlete_id));

-- ── 6) PAYMENT_PLANS: los profes leen precios (para cobrar), solo dueños editan
create policy "coaches leen planes"  on payment_plans for select using (public.is_approved_coach());
create policy "dueno crea planes"    on payment_plans for insert with check (public.is_approved_owner());
create policy "dueno edita planes"   on payment_plans for update using (public.is_approved_owner())
                                                              with check (public.is_approved_owner());
create policy "dueno borra planes"   on payment_plans for delete using (public.is_approved_owner());

-- ── 7) PRODUCTS y PROMOTIONS: públicos si están activos, el resto solo dueños ─
create policy "ver productos"        on products for select using (active or public.is_approved_owner());
create policy "dueno crea productos" on products for insert with check (public.is_approved_owner());
create policy "dueno edita productos" on products for update using (public.is_approved_owner())
                                                              with check (public.is_approved_owner());
create policy "dueno borra productos" on products for delete using (public.is_approved_owner());

create policy "ver promos"           on promotions for select using (active or public.is_approved_owner());
create policy "dueno crea promos"    on promotions for insert with check (public.is_approved_owner());
create policy "dueno edita promos"   on promotions for update using (public.is_approved_owner())
                                                              with check (public.is_approved_owner());
create policy "dueno borra promos"   on promotions for delete using (public.is_approved_owner());

commit;


-- ═══════════════════════════════════════════════════════════════════════════
-- PARTE 2 (correr aparte, después de la parte 1): imágenes de la tienda
-- Restringe la subida / reemplazo / borrado de fotos del bucket
-- "product-images" a dueños. La lectura no cambia (el bucket es público).
-- Va separado porque toca el esquema `storage`: si diera error de permisos,
-- la parte 1 ya queda aplicada igual y esto se puede hacer desde
-- Storage → Policies en el Dashboard.
-- ═══════════════════════════════════════════════════════════════════════════

begin;

do $$
declare r record;
begin
  for r in
    select policyname from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and cmd in ('INSERT', 'UPDATE', 'DELETE')
      and (coalesce(qual, '') || coalesce(with_check, '')) like '%product-images%'
  loop
    execute format('drop policy %I on storage.objects', r.policyname);
  end loop;
end $$;

create policy "dueno sube imagenes tienda" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_approved_owner());
create policy "dueno reemplaza imagenes tienda" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_approved_owner())
  with check (bucket_id = 'product-images' and public.is_approved_owner());
create policy "dueno borra imagenes tienda" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_approved_owner());

commit;


-- ═══════════════════════════════════════════════════════════════════════════
-- DESPUÉS: marcar a los dueños (cuando ya se hayan registrado)
--
-- update profiles set role = 'coach', status = 'approved', is_owner = true
-- where id in (select id from auth.users where email in ('dueno1@...', 'dueno2@...'));
--
-- update profiles set role = 'coach', status = 'approved', is_owner = false
-- where id in (select id from auth.users where email in ('profe1@...', 'profe2@...'));
--
-- Verificar:
-- select u.email, p.full_name, p.role, p.is_owner, p.status
-- from profiles p join auth.users u on u.id = p.id
-- where p.role = 'coach';
-- ═══════════════════════════════════════════════════════════════════════════
