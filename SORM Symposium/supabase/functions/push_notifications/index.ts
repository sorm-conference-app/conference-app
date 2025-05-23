// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js";

console.log("Hello from Functions!");

// https://supabase.com/docs/guides/functions/examples/push-notifications?queryGroups=platform&platform=expo

type Announcement = {
  id: number;
  created_at: Date;
  body: string;
  title: string | null;
};

type WebhookPayload = {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: Announcement;
  schema: "public";
  old_record?: Announcement;
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  const payload: WebhookPayload = await req.json();

  let currentOffset = 0;
  let shouldContinue = true;
  const EXPO_LIMIT = 100;
  const responses = [];

  // Perform a paginated query to send push notifications
  // to all expo_push_tokens
  while (shouldContinue) {
    const { data, error } = await supabase
      .from("test_profiles")
      .select("expo_push_token")
      .range(currentOffset, currentOffset + EXPO_LIMIT - 1);

    if (error) {
      console.error("Error fetching expo_push_tokens:", error);
      return new Response("Error fetching expo_push_tokens", { status: 500 });
    }

    if (!data) {
      console.error("No expo_push_tokens found");
      return new Response("No expo_push_tokens found", { status: 404 });
    }

    // Send push notifications to the expo_push_tokens
    const tokens = data.map(
      (item: { expo_push_token: string }) => item.expo_push_token,
    );

    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("EXPO_PUSH_NOTIFICATIONS_ACCESS_TOKEN")}`,
      },
      body: JSON.stringify({
        to: tokens,
        title: payload.record.title,
        body: payload.record.body,
        sound: "default",
      }),
    }).then((res) => res.json());

    responses.push(res);

    if (data.length < EXPO_LIMIT) {
      // Likely that this is the last page of results.
      // We can stop paginating.
      shouldContinue = false;
    } else {
      currentOffset += EXPO_LIMIT;
    }
  }

  return new Response(JSON.stringify({ code: 200, responses }), {
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
