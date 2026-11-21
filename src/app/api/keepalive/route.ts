import { pingSupabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const result = await pingSupabase();
  const source = request.headers.get("user-agent")?.includes("vercel-cron") ? "vercel-cron" : "manual";
  console.log(`[keepalive:cron] source=${source} ok=${result.ok} status=${result.status}`);
  return Response.json(
    { ...result, source, timestamp: new Date().toISOString() },
    { status: result.ok ? 200 : 502 },
  );
}
