import { Platform } from "react-native";
import { getAndroidId, getIosIdForVendorAsync } from "expo-application";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { randomUUID } from "expo-crypto";

/**
 * Get the current device ID. For web, this returns a UUID, since web does not necessarily
 * have an ID. For android, this returns a hexadecimal string. For IOS, this returns an "IDFV" string.
 * However, it should be known that when the application is uninstalled on IOS, the IDFV is reset.
 * Therefore, this method of getting the IOS ID may need to be rethought. For more info, see the Expo
 * documentation for more information.
 * @returns A string representing the current device's ID.
 * @see https://docs.expo.dev/versions/latest/sdk/application/#applicationgetiosidforvendorasync
 * @see https://docs.expo.dev/versions/latest/sdk/application/#applicationgetandroidid
 */
export async function getDeviceId() {
  switch (Platform.OS) {
    case "web": {
      // Web does not necessarily have an 'uuid' to identify the device.
      // So, we'll have to rely on generating an ID ourselves.
      // I don't like this approach, but it's a 'for now' solution.

      try {
        const id = await AsyncStorage.getItem("sorm-web-uuid");
        if (!id) {
          const genId = randomUUID();
          await AsyncStorage.setItem("sorm-web-uuid", genId);
          return genId;
        }

        return id;
      } catch (e) {
        console.error("Couldn't retrieve the web Id.");
      }
    }

    case "android":
      return getAndroidId();

    case "ios": {
      const id = await getIosIdForVendorAsync();
      if (!id) {
        throw new Error("IOS ID does not exist.");
      }

      return id;
    }

    default:
      throw new Error("Not a supported platform.");
  }
}