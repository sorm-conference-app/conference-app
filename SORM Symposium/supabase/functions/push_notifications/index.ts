// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js";

console.log("Hello from Functions!");

// https://supabase.com/docs/guides/functions/examples/push-notifications?queryGroups=platform&platform=expo

type Notification = {
  id: string;
  user_id: string;
  title: string;
  body: string;
};

type WebhookPayload = {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: Notification;
  schema: "public";
  old_record?: Notification;
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  const payload: WebhookPayload = await req.json();
  const { data } = await supabase
    .from("test_profiles")
    .select("expo_push_token")
    .eq("id", payload.record.user_id)
    .single();

  const res = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("EXPO_PUSH_NOTIFICATIONS_ACCESS_TOKEN")}`,
    },
    body: JSON.stringify({
      to: data.expo_push_token,
      sound: "default",
      body: payload.record.body,
    }),
  }).then((res) => res.json());

  return new Response(JSON.stringify(res), {
    headers: { "Content-Type": "application/json" },
  });
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/push_notifications' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
