-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN: Comercios Ragneros + cupones de descuento con QR
-- Fecha: 2026-11-05
--
-- Correr en el SQL Editor DESPUÉS de 20261030_hibrido_carga_coach.sql.
-- Para deshacerla: 20261105_ragneros_beneficios_REVERTIR.sql
--
-- Reglas de negocio:
--   • Cada atleta obtiene UN cupón por descuento POR MES, de UN SOLO USO
--     (unique(discount_id, athlete_id, period) + status issued → redeemed).
--     Con varios comercios/descuentos distintos, uno de cada uno.
--   • El cupón vence el último día del mes en que se obtuvo (o antes, si el
--     descuento termina antes). Si el descuento sigue vigente el mes
--     siguiente, el atleta obtiene un cupón nuevo y lo puede volver a usar.
--   • Solo usuarios aprobados y con la cuota del mes paga obtienen cupones
--     (los profes también, porque también entrenan). Al canjear se vuelve a
--     verificar la cuota.
--   • Un comercio se registra desde "Quiero ser comercio Ragnero" (cuenta
--     nueva, role = 'merchant') o lo pide un atleta ya registrado desde la
--     tab Beneficios (sigue siendo atleta y además tiene comercio).
--   • Los comercios quedan 'pending' hasta que un DUEÑO los aprueba.
--   • Los descuentos (% + info + vigencia) los cargan SOLO los DUEÑOS.
--   • Emitir y canjear cupones es exclusivamente por RPC. La tabla coupons
--     no tiene políticas de insert/update a propósito: nadie puede crear ni
--     marcar cupones desde la API.
--
-- No modifica handle_new_user (lo usa también la función crear-atleta): el
-- alta de comercios es un trigger aparte que solo actúa con
-- account_type = 'merchant'.
--
-- PARTE 1 va en una transacción: si algo falla, no se aplica nada.
-- PARTE 2 (Storage) va aparte, como en 20261002b_rol_dueno_hybrid.sql.
-- ═══════════════════════════════════════════════════════════════════════════

begin;

-- ── 1) Nuevo rol 'merchant' en profiles ─────────────────────────────────────
-- La restricción de valores de `role` (si existe) se creó desde el Dashboard,
-- así que no sabemos su nombre exacto. Se buscan todas las restricciones
-- CHECK de profiles que mencionan `role`, se guardan en una tabla de
-- respaldo (para que el script de reversión las deje como estaban) y se
-- reemplazan por una que además acepta 'merchant'.
create table if not exists ragneros_respaldo_restricciones (
  conname    text primary key,
  definicion text not null,
  guardado   timestamptz not null default now()
);
alter table ragneros_respaldo_restricciones enable row level security;  -- sin políticas: nadie la lee desde la API

do $$
declare r record;
begin
  for r in
    select conname, pg_get_constraintdef(oid) as def
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ~ '\mrole\M'
      and conname <> 'profiles_role_check_ragneros'
  loop
    insert into ragneros_respaldo_restricciones (conname, definicion)
    values (r.conname, r.def)
    on conflict (conname) do nothing;
    execute format('alter table public.profiles drop constraint %I', r.conname);
  end loop;
end $$;

alter table profiles drop constraint if exists profiles_role_check_ragneros;
alter table profiles add constraint profiles_role_check_ragneros
  check (role in ('athlete', 'coach', 'merchant'));


-- ── 2) Tablas ───────────────────────────────────────────────────────────────

create table if not exists businesses (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null unique references profiles(id) on delete cascade,
  name        text not null check (char_length(name) between 2 and 80),
  category    text check (char_length(category) <= 40),
  description text check (char_length(description) <= 600),
  address     text check (char_length(address) <= 120),
  phone       text check (char_length(phone) <= 40),
  instagram   text check (char_length(instagram) <= 60),
  website     text check (char_length(website) <= 120),
  logo_url    text,
  cover_url   text,
  status      text not null default 'pending'
              check (status in ('pending', 'approved', 'suspended', 'rejected')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists discounts (
  id          uuid primary key default gen_random_uuid(),
  -- restrict: un comercio con descuentos no se borra, se suspende
  business_id uuid not null references businesses(id) on delete restrict,
  percentage  int  not null check (percentage between 1 and 100),
  title       text not null check (char_length(title) between 3 and 80),
  conditions  text check (char_length(conditions) <= 400),
  valid_from  date not null default current_date,
  valid_until date not null,
  active      boolean not null default true,
  created_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  check (valid_until >= valid_from)
);
create index if not exists discounts_business_idx on discounts(business_id);

create table if not exists coupons (
  id          uuid primary key default gen_random_uuid(),
  -- restrict: un descuento con cupones emitidos no se borra, se desactiva
  discount_id uuid not null references discounts(id) on delete restrict,
  athlete_id  uuid not null references profiles(id) on delete cascade,
  token       text not null unique,        -- va dentro del QR (secreto, no adivinable)
  short_code  text not null unique,        -- "RGN-7K4Q9X", para cargar a mano
  status      text not null default 'issued'
              check (status in ('issued', 'redeemed', 'cancelled')),
  issued_at   timestamptz not null default now(),
  redeemed_at timestamptz,
  redeemed_by uuid references profiles(id) on delete set null,
  -- Mes del cupón (siempre el día 1, ej. 2026-11-01). Lo fija claim_coupon.
  period      date not null check (extract(day from period) = 1),
  unique (discount_id, athlete_id, period)  -- ← un cupón por atleta, por descuento, por mes
);
create index if not exists coupons_athlete_idx on coupons(athlete_id);


-- ── 3) Funciones auxiliares (SECURITY DEFINER para no generar recursión RLS) ─
-- is_approved_user(), is_approved_coach() e is_approved_owner() ya existen
-- (20261005 / 20260804c / 20261002b) y se usan tal cual.

create or replace function public.hoy_ar()
returns date language sql stable as $$
  select (now() at time zone 'America/Argentina/Buenos_Aires')::date;
$$;

-- Primer día del mes en curso (Argentina): identifica el "período" del cupón
create or replace function public.mes_ar()
returns date language sql stable as $$
  select date_trunc('month', public.hoy_ar())::date;
$$;

-- Último día en que se puede usar un cupón: fin de su mes o fin del
-- descuento, lo que ocurra primero
create or replace function public.vence_cupon(p_period date, p_valid_until date)
returns date language sql immutable as $$
  select least((p_period + interval '1 month' - interval '1 day')::date, p_valid_until);
$$;

create or replace function public.is_business_owner(p_business uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from businesses where id = p_business and owner_id = auth.uid());
$$;

-- Para las políticas de Storage: la carpeta del archivo es el id del comercio
create or replace function public.is_business_owner_folder(p_folder text)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from businesses where id::text = p_folder and owner_id = auth.uid());
$$;

create or replace function public.has_coupon_for(p_discount uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (select 1 from coupons where discount_id = p_discount and athlete_id = auth.uid());
$$;

-- ¿El atleta tiene pagado el mes en curso? (uso interno — no se expone)
-- Las cuotas adelantadas cuentan: son filas 'paid' con el mes futuro.
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

-- Versión expuesta: el usuario solo puede consultar SU propia cuota
create or replace function public.mi_cuota_al_dia()
returns boolean language sql security definer set search_path = public stable as $$
  select public.cuota_al_dia(auth.uid());
$$;


-- ── 4) RLS ──────────────────────────────────────────────────────────────────
alter table businesses enable row level security;
alter table discounts  enable row level security;
alter table coupons    enable row level security;

-- BUSINESSES
drop policy if exists "ver comercios" on businesses;
create policy "ver comercios" on businesses for select using (
  (status = 'approved' and public.is_approved_user())
  or owner_id = auth.uid()
  or public.is_approved_owner()
);

drop policy if exists "dueño del comercio o de ragnar editan" on businesses;
create policy "dueño del comercio o de ragnar editan" on businesses for update
  using (owner_id = auth.uid() or public.is_approved_owner())
  with check (owner_id = auth.uid() or public.is_approved_owner());

-- Altas: solo dueños de Ragnar directo; el resto entra por solicitar_comercio()
-- o por el trigger de registro
drop policy if exists "dueno crea comercios" on businesses;
create policy "dueno crea comercios" on businesses for insert
  with check (public.is_approved_owner());

drop policy if exists "dueno borra comercios" on businesses;
create policy "dueno borra comercios" on businesses for delete
  using (public.is_approved_owner());

-- El comerciante edita su info, pero NO su propio estado ni el owner
create or replace function public.businesses_proteger_columnas()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_approved_owner() then
    if new.status is distinct from old.status then
      raise exception 'Solo Ragnar puede cambiar el estado del comercio';
    end if;
    if new.owner_id is distinct from old.owner_id then
      raise exception 'No se puede cambiar el dueño del comercio';
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;
drop trigger if exists businesses_proteger on businesses;
create trigger businesses_proteger before update on businesses
  for each row execute function public.businesses_proteger_columnas();

-- DISCOUNTS
drop policy if exists "ver descuentos" on discounts;
create policy "ver descuentos" on discounts for select using (
  public.is_approved_owner()
  or public.is_business_owner(business_id)
  or (active and public.is_approved_user())
  or public.has_coupon_for(id)          -- historial de cupones ya obtenidos
);

drop policy if exists "dueno gestiona descuentos" on discounts;
create policy "dueno gestiona descuentos" on discounts for all
  using (public.is_approved_owner())
  with check (public.is_approved_owner());

-- COUPONS: solo lectura. Emitir y canjear es exclusivamente por RPC.
drop policy if exists "usuario ve sus cupones, dueno ve todos" on coupons;
create policy "usuario ve sus cupones, dueno ve todos" on coupons for select using (
  athlete_id = auth.uid() or public.is_approved_owner()
);


-- ── 5) Alta de comercios al registrarse ─────────────────────────────────────
-- Trigger APARTE de on_auth_user_created (handle_new_user no se toca).
-- Solo actúa si signUp() manda account_type = 'merchant': deja el perfil con
-- role 'merchant' y crea su comercio en 'pending'. Funciona corra antes o
-- después que handle_new_user (aquel hace "on conflict do nothing").
-- La metadata la controla el usuario, pero el peor caso es pedir ser
-- comercio: nunca puede auto-asignarse coach ni quedar aprobado.
create or replace function public.crear_comercio_al_registrarse()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_nombre text;
begin
  if coalesce(new.raw_user_meta_data ->> 'account_type', '') <> 'merchant' then
    return new;
  end if;

  insert into public.profiles (id, full_name, role, status)
  values (new.id, new.raw_user_meta_data ->> 'full_name', 'merchant', 'pending')
  on conflict (id) do update set role = 'merchant', status = 'pending';

  v_nombre := left(trim(coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'business_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    'Mi comercio')), 80);
  if char_length(v_nombre) < 2 then v_nombre := 'Mi comercio'; end if;

  insert into public.businesses (owner_id, name, category, phone, status)
  values (
    new.id,
    v_nombre,
    left(nullif(trim(new.raw_user_meta_data ->> 'business_category'), ''), 40),
    left(nullif(trim(new.raw_user_meta_data ->> 'business_phone'), ''), 40),
    'pending'
  )
  on conflict (owner_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_comercio on auth.users;
create trigger on_auth_user_created_comercio
  after insert on auth.users
  for each row execute function public.crear_comercio_al_registrarse();


-- ── 6) RPC: un usuario ya registrado (atleta o profe) suma su comercio ──────
create or replace function public.solicitar_comercio(
  p_nombre text, p_rubro text default null, p_descripcion text default null,
  p_direccion text default null, p_telefono text default null, p_instagram text default null
) returns json
language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if auth.uid() is null then
    return json_build_object('ok', false, 'motivo', 'Tenés que iniciar sesión');
  end if;
  if not public.is_approved_user() then
    return json_build_object('ok', false, 'motivo', 'Tu cuenta todavía no está aprobada');
  end if;
  if exists (select 1 from businesses where owner_id = auth.uid()) then
    return json_build_object('ok', false, 'motivo', 'Ya tenés un comercio registrado');
  end if;
  if char_length(trim(coalesce(p_nombre, ''))) < 2 then
    return json_build_object('ok', false, 'motivo', 'Ingresá el nombre del comercio');
  end if;

  insert into businesses (owner_id, name, category, description, address, phone, instagram, status)
  values (auth.uid(), left(trim(p_nombre), 80), left(nullif(trim(p_rubro), ''), 40),
          left(nullif(trim(p_descripcion), ''), 600), left(nullif(trim(p_direccion), ''), 120),
          left(nullif(trim(p_telefono), ''), 40), left(nullif(trim(p_instagram), ''), 60), 'pending')
  returning id into v_id;

  return json_build_object('ok', true, 'id', v_id);
end;
$$;


-- ── 7) RPC: un dueño aprueba / suspende / rechaza un comercio ───────────────
-- Si el titular es solo comercio (role 'merchant'), su acceso a la app sigue
-- al comercio. Si es atleta o profe, su cuenta no se toca.
create or replace function public.set_business_status(p_business uuid, p_status text)
returns json
language plpgsql security definer set search_path = public as $$
declare v_owner uuid; v_role text;
begin
  if not public.is_approved_owner() then
    return json_build_object('ok', false, 'motivo', 'Solo los dueños de Ragnar');
  end if;
  if p_status not in ('pending', 'approved', 'suspended', 'rejected') then
    return json_build_object('ok', false, 'motivo', 'Estado inválido');
  end if;

  update businesses set status = p_status where id = p_business
  returning owner_id into v_owner;
  if v_owner is null then
    return json_build_object('ok', false, 'motivo', 'Comercio inexistente');
  end if;

  select role into v_role from profiles where id = v_owner;
  if v_role = 'merchant' then
    update profiles
       set status = case p_status when 'approved' then 'approved'
                                  when 'pending'  then 'pending'
                                  else 'revoked' end
     where id = v_owner;
  end if;

  return json_build_object('ok', true);
end;
$$;


-- ── 8) RPC: el atleta (o profe) obtiene su cupón del mes ────────────────────
create or replace function public.claim_coupon(p_discount uuid)
returns json
language plpgsql security definer set search_path = public as $$
declare
  v_uid  uuid := auth.uid();
  v_prof record;
  v_d    record;
  v_cup  coupons%rowtype;
  v_code text;
  v_alfabeto constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';  -- sin 0/O/1/I
begin
  select role, status into v_prof from profiles where id = v_uid;
  if not found or v_prof.role not in ('athlete', 'coach') then
    return json_build_object('ok', false, 'motivo', 'Solo los atletas pueden obtener cupones');
  end if;
  if v_prof.status <> 'approved' then
    return json_build_object('ok', false, 'motivo', 'Tu cuenta no está habilitada');
  end if;

  -- ¿Ya lo tiene ESTE MES? Se devuelve el mismo (sirve para volver a descargarlo)
  select * into v_cup from coupons
   where discount_id = p_discount and athlete_id = v_uid and period = public.mes_ar();
  if found then
    return json_build_object('ok', true, 'ya_existia', true, 'cupon', row_to_json(v_cup));
  end if;

  if not public.cuota_al_dia(v_uid) then
    return json_build_object('ok', false, 'codigo', 'cuota',
      'motivo', 'Tenés la cuota del mes pendiente. El cupón se habilita cuando se registre tu pago.');
  end if;

  select d.*, b.status as b_status, b.owner_id as b_owner
    into v_d
  from discounts d join businesses b on b.id = d.business_id
  where d.id = p_discount;

  if not found or not v_d.active or v_d.b_status <> 'approved' then
    return json_build_object('ok', false, 'motivo', 'Este descuento ya no está disponible');
  end if;
  if public.hoy_ar() < v_d.valid_from or public.hoy_ar() > v_d.valid_until then
    return json_build_object('ok', false, 'motivo', 'Este descuento está fuera de vigencia');
  end if;
  if v_d.b_owner = v_uid then
    return json_build_object('ok', false, 'motivo', 'No podés obtener cupones de tu propio comercio');
  end if;

  loop
    select 'RGN-' || string_agg(substr(v_alfabeto, 1 + floor(random() * length(v_alfabeto))::int, 1), '')
      into v_code from generate_series(1, 6);
    exit when not exists (select 1 from coupons where short_code = v_code);
  end loop;

  insert into coupons (discount_id, athlete_id, token, short_code, period)
  values (p_discount, v_uid,
          replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''),
          v_code, public.mes_ar())
  on conflict (discount_id, athlete_id, period) do nothing
  returning * into v_cup;

  if v_cup.id is null then   -- doble click simultáneo: ya lo creó la otra llamada
    select * into v_cup from coupons
     where discount_id = p_discount and athlete_id = v_uid and period = public.mes_ar();
  end if;

  return json_build_object('ok', true, 'ya_existia', false, 'cupon', row_to_json(v_cup));
end;
$$;


-- ── 9) RPC: el comercio escanea / valida / canjea ───────────────────────────
-- p_confirmar = false → solo valida y muestra los datos (no consume el cupón)
-- p_confirmar = true  → valida y marca como utilizado (de forma atómica)
-- p_codigo acepta el contenido del QR ("RAGNAR:<token>"), el token solo, o el
-- código corto ("RGN-XXXXXX", sin importar mayúsculas).
create or replace function public.redeem_coupon(p_codigo text, p_confirmar boolean default false)
returns json
language plpgsql security definer set search_path = public as $$
declare
  v_uid  uuid := auth.uid();
  v_cod  text := trim(coalesce(p_codigo, ''));
  c      record;
  v_info json;
  v_vence date;
begin
  if v_uid is null then
    return json_build_object('ok', false, 'motivo', 'Tenés que iniciar sesión');
  end if;
  if v_cod ilike 'RAGNAR:%' then v_cod := substr(v_cod, 8); end if;
  if v_cod = '' then
    return json_build_object('ok', false, 'motivo', 'Código vacío');
  end if;

  select cp.id, cp.status, cp.athlete_id, cp.redeemed_at, cp.short_code, cp.period,
         d.business_id, d.valid_from, d.valid_until, d.active, d.title, d.conditions, d.percentage,
         b.owner_id, b.status as b_status,
         p.full_name, p.status as athlete_status
    into c
  from coupons cp
  join discounts  d on d.id = cp.discount_id
  join businesses b on b.id = d.business_id
  join profiles   p on p.id = cp.athlete_id
  where cp.token = v_cod or cp.short_code = upper(v_cod);

  if not found then
    return json_build_object('ok', false, 'motivo', 'Cupón inexistente');
  end if;
  -- Del cupón de otro comercio no se revela nada
  if c.owner_id <> v_uid then
    return json_build_object('ok', false, 'motivo', 'Este cupón no corresponde a tu comercio');
  end if;
  if c.b_status <> 'approved' then
    return json_build_object('ok', false, 'motivo', 'Tu comercio no está habilitado');
  end if;

  v_vence := public.vence_cupon(c.period, c.valid_until);
  v_info := json_build_object(
    'atleta', c.full_name, 'descuento', c.percentage, 'titulo', c.title,
    'condiciones', c.conditions, 'valido_hasta', v_vence, 'codigo', c.short_code);

  if c.status = 'redeemed' then
    return json_build_object('ok', false, 'motivo', 'Cupón ya utilizado',
      'utilizado_el', c.redeemed_at, 'info', v_info);
  end if;
  if c.status <> 'issued' then
    return json_build_object('ok', false, 'motivo', 'Cupón anulado', 'info', v_info);
  end if;
  -- Cupón de un mes anterior (o del descuento ya terminado): vencido
  if public.hoy_ar() > v_vence then
    return json_build_object('ok', false,
      'motivo', 'Cupón vencido el ' || to_char(v_vence, 'DD/MM/YYYY'), 'info', v_info);
  end if;
  if not c.active or public.hoy_ar() < c.valid_from then
    return json_build_object('ok', false, 'motivo', 'Descuento inactivo', 'info', v_info);
  end if;
  if c.athlete_status <> 'approved' then
    return json_build_object('ok', false, 'motivo', 'El atleta no tiene acceso activo en Ragnar', 'info', v_info);
  end if;
  if not public.cuota_al_dia(c.athlete_id) then
    return json_build_object('ok', false, 'motivo', 'El atleta tiene la cuota del mes pendiente', 'info', v_info);
  end if;

  if not p_confirmar then
    return json_build_object('ok', true, 'canjeado', false, 'info', v_info);
  end if;

  -- Atómico: si dos dispositivos confirman a la vez, solo uno gana
  update coupons
     set status = 'redeemed', redeemed_at = now(), redeemed_by = v_uid
   where id = c.id and status = 'issued';
  if not found then
    return json_build_object('ok', false, 'motivo', 'Cupón ya utilizado', 'info', v_info);
  end if;

  return json_build_object('ok', true, 'canjeado', true, 'info', v_info);
end;
$$;


-- ── 10) RPC: historial de canjes del comercio ───────────────────────────────
-- Por RPC porque el comercio no tiene permiso de leer profiles de atletas;
-- así ve solo el nombre de quien canjeó en SU comercio y nada más.
create or replace function public.comercio_canjes()
returns json
language sql security definer set search_path = public stable as $$
  select coalesce(json_agg(x order by x.redeemed_at desc), '[]'::json)
  from (
    select cp.id, cp.short_code, cp.redeemed_at, p.full_name as atleta,
           d.title, d.percentage
    from coupons cp
    join discounts  d on d.id = cp.discount_id
    join businesses b on b.id = d.business_id
    join profiles   p on p.id = cp.athlete_id
    where b.owner_id = auth.uid() and cp.status = 'redeemed'
    order by cp.redeemed_at desc
    limit 300
  ) x;
$$;

-- Nadie anónimo ejecuta las RPCs (por defecto Postgres da EXECUTE a PUBLIC,
-- así que hay que sacarlo de PUBLIC y dárselo solo a usuarios logueados)
revoke execute on function public.solicitar_comercio(text,text,text,text,text,text) from public, anon;
grant  execute on function public.solicitar_comercio(text,text,text,text,text,text) to authenticated;
revoke execute on function public.set_business_status(uuid,text) from public, anon;
grant  execute on function public.set_business_status(uuid,text) to authenticated;
revoke execute on function public.claim_coupon(uuid) from public, anon;
grant  execute on function public.claim_coupon(uuid) to authenticated;
revoke execute on function public.redeem_coupon(text,boolean) from public, anon;
grant  execute on function public.redeem_coupon(text,boolean) to authenticated;
revoke execute on function public.comercio_canjes() from public, anon;
grant  execute on function public.comercio_canjes() to authenticated;
revoke execute on function public.mi_cuota_al_dia() from public, anon;
grant  execute on function public.mi_cuota_al_dia() to authenticated;

commit;


-- ═══════════════════════════════════════════════════════════════════════════
-- PARTE 2 (va en el mismo pegado; es una transacción aparte): Storage
-- Logos y portadas de comercios. Bucket público, máx 2 MB, solo imágenes.
-- Cada comercio solo escribe en  business-media/<business_id>/
-- Si diera error de permisos, la parte 1 ya quedó aplicada igual y esto se
-- puede hacer desde Storage → Policies en el Dashboard.
-- ═══════════════════════════════════════════════════════════════════════════

begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('business-media', 'business-media', true, 2097152,
        array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "ragneros suben imagenes" on storage.objects;
create policy "ragneros suben imagenes" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'business-media'
    and (public.is_business_owner_folder((storage.foldername(name))[1]) or public.is_approved_owner())
  );

drop policy if exists "ragneros borran imagenes" on storage.objects;
create policy "ragneros borran imagenes" on storage.objects for delete to authenticated
  using (
    bucket_id = 'business-media'
    and (public.is_business_owner_folder((storage.foldername(name))[1]) or public.is_approved_owner())
  );

commit;


-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICACIÓN:
--   select tablename, rowsecurity from pg_tables where schemaname = 'public'
--   and tablename in ('businesses', 'discounts', 'coupons', 'ragneros_respaldo_restricciones');
--   → 4 filas, todas con rowsecurity = true.
--
--   select conname, pg_get_constraintdef(oid) from pg_constraint
--   where conrelid = 'profiles'::regclass and conname like '%role%';
--   → profiles_role_check_ragneros  CHECK (role IN ('athlete','coach','merchant'))
-- ═══════════════════════════════════════════════════════════════════════════
