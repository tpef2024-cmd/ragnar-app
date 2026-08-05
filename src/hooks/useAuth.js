// ── HOOK: AUTENTICACIÓN ────────────────────────────────────────────────────────
// Maneja sesión de Supabase, perfil del usuario, login, registro y logout.
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

export function useAuth() {
  // "login" | "athlete" | "coach" | "pendiente" | "revocado"
  const [pantalla, setPantalla] = useState("login");
  const [usuario, setUsuario] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Cargar perfil del usuario y redirigir según rol y estado de aprobación.
  // Un atleta con status "pending" o "revoked" no entra al panel: se lo manda
  // a una pantalla de espera/bloqueo (ver "pendiente" / "revocado" en App.jsx).
  const cargarUsuario = useCallback(async (u) => {
    setUsuario(u);
    const { data: prof } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", u.id)
      .single();
    setPerfil(prof);

    if (prof?.status === "pending") {
      setPantalla("pendiente");
    } else if (prof?.status === "revoked") {
      setPantalla("revocado");
    } else {
      setPantalla(prof?.role === "coach" ? "coach" : "athlete");
    }
    setCargando(false);
  }, []);

  // Verificar sesión activa al cargar la app y escuchar cambios de sesión
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) cargarUsuario(session.user);
      else setCargando(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, session) => {
      if (session?.user) cargarUsuario(session.user);
      else {
        setUsuario(null);
        setPerfil(null);
        setPantalla("login");
        setCargando(false);
      }
    });
    return () => subscription.unsubscribe();
  }, [cargarUsuario]);

  // Iniciar sesión
  // NOTA (fix): estas 3 funciones se envuelven en useCallback con [] para que
  // mantengan siempre la misma identidad entre renders. Sin esto, cualquier
  // componente que las reciba como prop (como el hook de auto-logout) las ve
  // como "nuevas" en cada render y reinicia su lógica interna sin necesidad
  // — fue la causa del bug donde el aviso de inactividad se reseteaba solo.
  const login = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!error) return null;
    if (error.message?.toLowerCase().includes("email not confirmed")) {
      return "Todavía no confirmaste tu email. Revisá tu bandeja de entrada.";
    }
    return "Email o contraseña incorrectos";
  }, []);

  // Registrar nuevo atleta (el registro siempre crea atletas — los coaches
  // se crean manualmente en Supabase).
  // El perfil en `profiles` (status: "pending", role: "athlete") lo crea
  // automáticamente un trigger en la base de datos al crearse el usuario en
  // auth.users — ver supabase/migrations/20260804_registro_aprobacion.sql.
  // No hacemos upsert manual acá porque, con "Confirm email" activo, todavía
  // no hay sesión iniciada en este punto (no existe auth.uid() del lado del
  // cliente hasta que el usuario confirma el link del mail).
  //
  // Devuelve { error } si algo falló, o { mensaje } con el aviso de "revisá
  // tu email" para que LoginScreen lo muestre en vez de loguear directo.
  const registrar = useCallback(
    async (email, password, nombreCompleto) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: nombreCompleto },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) return { error: error.message };

      // Si el proyecto tiene "Confirm email" desactivado, Supabase devuelve
      // sesión activa igual — en ese caso cargamos el usuario normalmente y
      // cargarUsuario() ya se encarga de mandarlo a "pendiente" según status.
      if (data.session) {
        await cargarUsuario(data.session.user);
        return { error: null };
      }

      return {
        error: null,
        mensaje:
          "Te enviamos un email de confirmación. Revisá tu bandeja de entrada (y spam) y confirmá tu cuenta para poder ingresar.",
      };
    },
    [cargarUsuario],
  );

  // Cerrar sesión
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return {
    pantalla,
    setPantalla,
    usuario,
    perfil,
    setPerfil,
    cargando,
    login,
    registrar,
    logout,
  };
}
