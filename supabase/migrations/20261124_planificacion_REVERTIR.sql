-- Revierte 20261124_planificacion.sql.
-- OJO: borra las habilitaciones y el registro de PDFs. Los archivos del bucket
-- 'planificaciones' hay que vaciarlos antes desde Storage en el Dashboard
-- (Supabase no deja borrar un bucket con archivos).
begin;

drop policy if exists "planificaciones: profes suben" on storage.objects;
drop policy if exists "planificaciones: profes borran" on storage.objects;
drop policy if exists "planificaciones: leer" on storage.objects;
delete from storage.buckets where id = 'planificaciones';

drop table if exists public.training_plans;
drop function if exists public.plan_habilitado(uuid);
drop table if exists public.plan_habilitaciones;

commit;
