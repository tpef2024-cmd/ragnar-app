-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN: un solo pago "paid" por atleta y por mes
-- Fecha: 2026-10-02
-- Motivo: el control de pagos duplicados estaba solo en la app. Si el coach
-- tocaba "Confirmar cobro" dos veces seguidas, o cobraba desde dos
-- dispositivos a la vez, se podía guardar el mismo pago dos veces (y el
-- total de "Ingresos del mes" quedaba inflado).
-- ═══════════════════════════════════════════════════════════════════════════

-- PASO 1 — Revisar si ya hay duplicados (correr esto solo y mirar el resultado).
-- Si devuelve filas, borrar los pagos repetidos desde Table Editor → payments
-- antes del PASO 2, porque si no el índice falla al crearse.
--
-- select athlete_id, period_month, period_year, count(*)
-- from payments
-- where status = 'paid'
-- group by 1, 2, 3
-- having count(*) > 1;

-- PASO 2 — Crear el índice único
create unique index if not exists payments_unico_por_mes
  on payments (athlete_id, period_month, period_year)
  where status = 'paid';
