import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/** Browser Supabase client (Realtime Broadcast + Presence only; no tables used). */
export function getSupabase(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { realtime: { params: { eventsPerSecond: 20 } } },
    );
  }
  return client;
}

export async function pingSupabase(): Promise<{ ok: boolean; status: number }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return { ok: false, status: 0 };

  const headers = { apikey: key };
  const [restRes, authRes] = await Promise.all([
    fetch(`${url}/rest/v1/_keepalive?select=id&limit=1`, { headers, cache: "no-store" }),
    fetch(`${url}/auth/v1/settings`, { headers, cache: "no-store" }),
  ]);
  const ok = (restRes.ok || restRes.status === 404) && authRes.ok;
  return { ok, status: ok ? 200 : restRes.status };
}
