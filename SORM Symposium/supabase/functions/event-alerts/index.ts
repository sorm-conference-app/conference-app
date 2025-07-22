// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js";
console.log("Hello from Functions!");
const supabase = createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
);
Deno.serve(async (req) => {
  // JOIN across the `profiles`, `event_attendees`, and `events` tables
  // to get the expo tokens of users who RSVPed for events that are happening within 15 minutes.
  const { data, error } = await supabase.rpc("events_within_n_minutes", {
    n: 15,
  });
  if (error) {
    console.error("Error fetching data:", error);
    return new Response("Error fetching data", {
      status: 500,
    });
  }
  if (data.length === 0) {
    console.log("No upcoming users to notify.");
    return new Response("No upcoming users to notify.", {
      status: 404,
    });
  }
  const expoTokens = data.map((e) => e.expo_push_token);
  const res = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: expoTokens,
      title: "Upcoming Event Alert",
      body: "You have an event starting soon!",
    }),
  });
  // Set the users who received the notification marked as "notified"
  const notifiedAttendees = data.map((e) => ({
    id: e.attendee_entry_id,
    notified: true,
    event_id: e.event_id,
  }));
  const { error: updateError } = await supabase
    .from("event_attendees")
    .upsert(notifiedAttendees, { onConflict: ["id"] });

  if (updateError) {
    console.error("Error updating notified attendees:", updateError);
    return new Response("Error updating notified attendees", {
      status: 500,
    });
  }
  return new Response(
    JSON.stringify({
      message: "Push notifications sent successfully",
      expoResponse: await res.json(),
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
}); /* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/event-alerts' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
