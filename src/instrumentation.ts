import { pingSupabase } from "@/lib/supabase";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const res = await pingSupabase().catch(() => ({ ok: false, status: 0 }));
    console.log(`[keepalive:startup] Supabase ping ok=${res.ok} status=${res.status}`);
  }
}
