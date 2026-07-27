// ── CONEXIÓN A SUPABASE ───────────────────────────────────────────────────────
// Cliente único de Supabase, usado en toda la app (auth, lectura y escritura de datos).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://vpachxutgcwtdikdatrf.supabase.co";
const SUPABASE_KEY = "sb_publishable_TS6cGjRNS5fm1q5S1zgE5g_jxGdIfqP";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
