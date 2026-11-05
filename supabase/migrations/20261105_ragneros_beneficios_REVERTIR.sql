-- ═══════════════════════════════════════════════════════════════════════════
-- REVERSIÓN de 20261105_ragneros_beneficios.sql
-- Fecha: 2026-11-05
--
-- Deja la base como estaba antes de la migración de Comercios Ragneros.
-- Correr ANTES de volver la app a la versión anterior (o enseguida después):
-- la app nueva necesita estas tablas para la tab Beneficios y Ragneros.
--
-- ⚠ BORRA los datos de comercios, descuentos y cupones (no se pueden
--   recuperar). Si querés conservarlos, exportá antes las tablas
--   businesses, discounts y coupons desde Table Editor → Export to CSV.
--
-- Los usuarios que se registraron como comercio (role 'merchant') NO se
-- borran: pasan a role 'athlete' con acceso revocado, así la restricción de
-- roles original vuelve a aplicarse. Aparecen en Solicitudes → Revocados.
--
-- PARTE 1 va en una transacción: si algo falla, no se aplica nada.
-- ═══════════════════════════════════════════════════════════════════════════

begin;

-- ── 1) Alta de comercios al registrarse ─────────────────────────────────────
drop trigger if exists on_auth_user_created_comercio on auth.users;
drop function if exists public.crear_comercio_al_registrarse();

-- ── 2) Usuarios comercio → atletas revocados (no se borra ninguna cuenta) ───
update profiles set role = 'athlete', status = 'revoked' where role = 'merchant';

-- ── 3) Tablas (con sus políticas, índices y triggers) ───────────────────────
drop table if exists coupons;
drop table if exists discounts;
drop table if exists businesses;

-- ── 4) Funciones ────────────────────────────────────────────────────────────
drop function if exists public.comercio_canjes();
drop function if exists public.redeem_coupon(text, boolean);
drop function if exists public.claim_coupon(uuid);
drop function if exists public.set_business_status(uuid, text);
drop function if exists public.solicitar_comercio(text, text, text, text, text, text);
drop function if exists public.businesses_proteger_columnas();
drop function if exists public.mi_cuota_al_dia();
drop function if exists public.cuota_al_dia(uuid);
drop function if exists public.has_coupon_for(uuid);
drop function if exists public.is_business_owner(uuid);
drop function if exists public.vence_cupon(date, date);
drop function if exists public.mes_ar();
drop function if exists public.hoy_ar();
-- is_business_owner_folder la usan las políticas de Storage: se borra en la parte 2

-- ── 5) Restricción de roles: vuelve la original ─────────────────────────────
alter table profiles drop constraint if exists profiles_role_check_ragneros;

do $$
declare r record;
begin
  if to_regclass('public.ragneros_respaldo_restricciones') is not null then
    for r in select conname, definicion from ragneros_respaldo_restricciones loop
      execute format('alter table public.profiles add constraint %I %s', r.conname, r.definicion);
    end loop;
  end if;
end $$;

drop table if exists ragneros_respaldo_restricciones;

commit;


-- ═══════════════════════════════════════════════════════════════════════════
-- PARTE 2: Storage (transacción aparte)
-- Las políticas se borran siempre. El bucket solo se borra si está vacío:
-- si ya se subieron logos, vaciarlo y borrarlo desde Storage en el Dashboard
-- (Supabase no deja borrar archivos por SQL).
-- ═══════════════════════════════════════════════════════════════════════════

begin;

drop policy if exists "ragneros suben imagenes" on storage.objects;
drop policy if exists "ragneros borran imagenes" on storage.objects;
drop function if exists public.is_business_owner_folder(text);

do $$
begin
  if not exists (select 1 from storage.objects where bucket_id = 'business-media') then
    delete from storage.buckets where id = 'business-media';
  else
    raise notice 'El bucket business-media tiene archivos: vaciarlo y borrarlo desde Storage en el Dashboard.';
  end if;
exception when others then
  raise notice 'No se pudo borrar el bucket business-media por SQL (%). Borrarlo desde Storage en el Dashboard.', sqlerrm;
end $$;

commit;


-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICACIÓN:
--   select tablename from pg_tables where schemaname = 'public'
--   and tablename in ('businesses', 'discounts', 'coupons');        → 0 filas
--   select count(*) from profiles where role = 'merchant';           → 0
-- ═══════════════════════════════════════════════════════════════════════════
