-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN: los profes cargan marcas de Híbrido de los atletas
-- Fecha: 2026-10-30
--
-- Hasta ahora solo el propio atleta podía insertar en hybrid_records
-- (auth.uid() = athlete_id). Esta política se SUMA a esa: cualquier coach
-- aprobado (dueño o profe) puede cargar una marca para cualquier atleta,
-- con la fecha en que se hizo el testeo (recorded_at la manda la app).
--
-- Correr en el SQL Editor DESPUÉS de 20261029_hibrido.sql.
-- ═══════════════════════════════════════════════════════════════════════════

drop policy if exists "coach carga marcas hibrido" on public.hybrid_records;
create policy "coach carga marcas hibrido"
  on public.hybrid_records for insert
  with check (public.is_approved_coach());

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICACIÓN:
--   select policyname, cmd from pg_policies where tablename = 'hybrid_records';
--   → tienen que aparecer 2 políticas de INSERT (atleta y coach).
-- ═══════════════════════════════════════════════════════════════════════════
