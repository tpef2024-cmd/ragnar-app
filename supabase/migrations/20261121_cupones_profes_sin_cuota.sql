-- ============================================================================
-- Cupones Ragneros: los profes y profes dueños no pagan cuota, pero pueden
-- obtener y canjear cupones igual.
--
-- Un solo cambio en cuota_al_dia(): si el perfil es coach aprobado (con o sin
-- is_owner) se lo considera "al día". Esa función la usan las tres puntas:
--   · mi_cuota_al_dia()  → el front habilita el botón "Obtener cupón"
--   · claim_coupon()     → emisión
--   · redeem_coupon()    → canje en el comercio (si el profe deja de ser coach
--                          o se lo da de baja, el cupón deja de valer)
-- No hace falta tocar el front ni las otras funciones.
--
-- Rendimiento: el chequeo nuevo es una búsqueda por clave primaria en profiles
-- y va primero; para atletas sigue la búsqueda en payments, que usa el índice
-- único payments_unico_por_mes (athlete_id, period_month, period_year).
--
-- Reversión: 20261121_cupones_profes_sin_cuota_REVERTIR.sql
-- ============================================================================

create or replace function public.cuota_al_dia(p_athlete uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
           select 1 from profiles
           where id = p_athlete and role = 'coach' and status = 'approved'
         )
      or exists (
           select 1 from payments
           where athlete_id   = p_athlete
             and status       = 'paid'
             and period_month = extract(month from public.hoy_ar())::int
             and period_year  = extract(year  from public.hoy_ar())::int
         );
$$;
-- create or replace conserva los permisos, pero se reafirma por las dudas
revoke execute on function public.cuota_al_dia(uuid) from public, anon, authenticated;

-- Verificación (correr en el SQL Editor con un id de profe y uno de atleta):
--   select public.cuota_al_dia('<uuid de un profe>');   -- true
--   select public.cuota_al_dia('<uuid de atleta sin pago>'); -- false
