// ── HOOK: AUTENTICACIÓN ────────────────────────────────────────────────────────
// Maneja sesión de Supabase, perfil del usuario, login, registro y logout.
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

export function useAuth() {
  const [pantalla, setPantalla] = useState("login"); // "login" | "athlete" | "coach"
  const [usuario, setUsuario] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Cargar perfil del usuario y redirigir según rol
  const cargarUsuario = useCallback(async (u) => {
    setUsuario(u);
    const { data: prof } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", u.id)
      .single();
    setPerfil(prof);
    setPantalla(prof?.role === "coach" ? "coach" : "athlete");
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
    return error ? "Email o contraseña incorrectos" : null;
  }, []);

  // Registrar nuevo atleta (el registro siempre crea atletas — los coaches
  // se crean manualmente en Supabase)
  const registrar = useCallback(async (email, password, nombreCompleto) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: nombreCompleto } },
    });
    if (error) return error.message;

    if (data.user) {
      await supabase
        .from("profiles")
        .upsert(
          { id: data.user.id, full_name: nombreCompleto, role: "athlete" },
          { onConflict: "id" },
        );
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();
      setPerfil(prof);
    }
    return null;
  }, []);

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
