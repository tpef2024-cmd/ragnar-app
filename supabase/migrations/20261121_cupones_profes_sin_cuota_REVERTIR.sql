-- Revierte 20261121_cupones_profes_sin_cuota.sql: vuelve a exigir la cuota
-- del mes paga a todos (incluidos profes y dueños).
create or replace function public.cuota_al_dia(p_athlete uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from payments
    where athlete_id   = p_athlete
      and status       = 'paid'
      and period_month = extract(month from public.hoy_ar())::int
      and period_year  = extract(year  from public.hoy_ar())::int
  );
$$;
revoke execute on function public.cuota_al_dia(uuid) from public, anon, authenticated;
