import { supabase } from "@/constants/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Saves the Expo Push Token to the database.
 * @param tok An Expo Push Token. Should be the value returned from `Notifications.getExpoPushTokenAsync(...)`
 * @param deviceId The ID associated with the device.
 */
export default async function saveExpoPushToken(tok: string, deviceId: string) {
  try {
    const createdToken = await AsyncStorage.getItem("created-expo-token");

    if (createdToken === "true") {
      // No need to create another request.
      return;
    }
  } catch (_) {
    console.error("Couldn't verify if expo token was created before...");
  }

  const { error: insertError } = await supabase.from("test_profiles").upsert({
    id: deviceId,
    expo_push_token: tok,
  });

  if (insertError) {
    throw insertError;
  }
}
