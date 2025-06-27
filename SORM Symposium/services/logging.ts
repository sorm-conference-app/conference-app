import { supabase } from "@/constants/supabase";
import { Platform } from "react-native";

/**
 * A function to log an event to the database.
 * @param event The event type. Signifys the event that just occurred.
 * @param message An optional descriptive message about the event.
 */
export async function sendLogMessage(
  event: string,
  message?: string,
): Promise<void> {
  await supabase.from("dev_event_logs").insert({
    event_type: event,
    OS: Platform.OS,
    message: message ?? null,
  });
}
