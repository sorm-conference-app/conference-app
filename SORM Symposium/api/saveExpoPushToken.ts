import { supabase } from "@/constants/supabase";

/**
 * Saves the Expo Push Token to the database.
 * @param tok An Expo Push Token. Should be the value returned from `Notifications.getExpoPushTokenAsync(...)`
 * @param deviceId The ID associated with the device.
 */
export default async function saveExpoPushToken(tok: string, deviceId: string) {
  // Check if the token exists first
  const { data: existingToken, error } = await supabase
    .from("test_profiles")
    .select("expo_push_token")
    .eq("id", deviceId)
    .single();

  // PGRST116 means that the row does not exist.
  if (error && error.code !== "PGRST116") {
    throw error;
  }

  if (!existingToken) {
    const { error: insertError } = await supabase.from("test_profiles").upsert({
      id: deviceId,
      expo_push_token: tok,
    });

    if (insertError) {
      throw insertError;
    }
  }
}
