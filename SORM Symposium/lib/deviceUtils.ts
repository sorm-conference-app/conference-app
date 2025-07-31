import { Platform } from "react-native";
import { getDeviceId } from "./user";

/**
 * Get device ID only on mobile platforms (iOS/Android)
 * Returns undefined on web
 */
export async function getMobileDeviceId(): Promise<string | undefined> {
  if (Platform.OS === 'web') {
    return undefined;
  }
  
  return await getDeviceId();
} 