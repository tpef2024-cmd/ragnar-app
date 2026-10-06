// ═══════════════════════════════════════════════════════════════════════════
// EDGE FUNCTION: crear-atleta
// Permite que un profe (coach aprobado) dé de alta a un atleta desde la app,
// para Kids sin celular o Adultos Mayores a los que se les complica
// registrarse solos.
//
// Por qué es una Edge Function y no un insert desde la app: crear un usuario
// en auth.users requiere la service_role key, que NUNCA puede estar en el
// frontend. Acá vive del lado del servidor (Supabase la inyecta sola como
// variable de entorno).
//
// · Con email + contraseña → el atleta puede entrar a la app con esos datos.
// · Sin email → se crea una cuenta interna sin acceso (sin_app = true). El
//   profe carga y ve sus datos igual (asistencia, pagos, notas).
// El atleta queda aprobado directamente (no pasa por Solicitudes).
// ═══════════════════════════════════════════════════════════════════════════
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const responder = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

const DISCIPLINAS = ["Crossfit", "Funcional", "Adultos Mayores", "Kids", "Teens"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return responder({ error: "Método no permitido" }, 405);

  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  // 1) ¿Quién llama? Tiene que ser un coach aprobado (dueño o profe).
  const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  const { data: quien } = await admin.auth.getUser(jwt);
  if (!quien?.user) return responder({ error: "Sesión inválida" }, 401);
  const { data: perfilCoach } = await admin
    .from("profiles")
    .select("role, status")
    .eq("id", quien.user.id)
    .single();
  if (perfilCoach?.role !== "coach" || perfilCoach?.status !== "approved") {
    return responder({ error: "Solo un profe puede dar de alta atletas" }, 403);
  }

  // 2) Validar datos
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return responder({ error: "Datos inválidos" }, 400);
  }
  const nombre = String(body.nombre ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const telefono = String(body.telefono ?? "").trim() || null;
  const nacimiento = String(body.nacimiento ?? "").trim() || null;
  const disciplina = DISCIPLINAS.includes(String(body.disciplina)) ? String(body.disciplina) : null;
  const grupoId = body.grupoId ? String(body.grupoId) : null;
  const conApp = !!email;

  if (!nombre) return responder({ error: "Falta el nombre" }, 400);
  if (conApp && password.length < 6) {
    return responder({ error: "La contraseña debe tener al menos 6 caracteres" }, 400);
  }

  // 3) Crear la cuenta con la service_role key
  const emailFinal = conApp ? email : `sin-app-${crypto.randomUUID()}@ragnar.local`;
  const passwordFinal = conApp ? password : crypto.randomUUID() + crypto.randomUUID();

  const { data: creado, error: errCrear } = await admin.auth.admin.createUser({
    email: emailFinal,
    password: passwordFinal,
    email_confirm: true, // sin mail de confirmación: lo registra el profe en persona
    user_metadata: { full_name: nombre },
  });
  if (errCrear || !creado.user) {
    const msg = errCrear?.message?.toLowerCase() ?? "";
    if (msg.includes("already") || msg.includes("registered")) {
      return responder({ error: "Ya existe una cuenta con ese email" }, 409);
    }
    return responder({ error: errCrear?.message ?? "No se pudo crear la cuenta" }, 500);
  }

  // 4) El trigger handle_new_user ya creó el perfil (pending). Lo completamos
  //    y lo dejamos aprobado. upsert por si el trigger no corrió.
  const { error: errPerfil } = await admin.from("profiles").upsert({
    id: creado.user.id,
    full_name: nombre,
    role: "athlete",
    status: "approved",
    phone: telefono,
    birth_date: nacimiento,
    discipline: disciplina,
    group_id: grupoId,
    sin_app: !conApp,
  });
  if (errPerfil) {
    // No dejar una cuenta huérfana a medio crear
    await admin.auth.admin.deleteUser(creado.user.id);
    return responder({ error: errPerfil.message }, 500);
  }

  return responder({ ok: true, id: creado.user.id });
});
