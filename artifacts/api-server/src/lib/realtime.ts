const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export type RealtimeEntity = "wallet" | "transaction" | "goal" | "profile";

export async function broadcastChange(supabaseId: string, entity: RealtimeEntity): Promise<void> {
  try {
    await fetch(`${supabaseUrl}/realtime/v1/api/broadcast`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseServiceKey}`,
        "apikey": supabaseServiceKey,
      },
      body: JSON.stringify({
        messages: [
          {
            topic: `user-${supabaseId}`,
            event: "data-changed",
            payload: { entity },
          },
        ],
      }),
    });
  } catch {
    // fire-and-forget — realtime is best-effort
  }
}
