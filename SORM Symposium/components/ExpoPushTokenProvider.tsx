import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import * as Application from "expo-application";
import Constants from "expo-constants";
import { Platform } from "react-native";
import saveExpoPushToken from "@/api/saveExpoPushToken";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ExpoPushTokenContext = createContext<string | null>(null);

type ExpoPushTokenProviderProps = {
  children: ReactNode;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function ExpoPushTokenProvider({ children }: ExpoPushTokenProviderProps) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // See
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#add-a-minimal-working-example
    async function registerForPushNotificationsAsync() {
      if (Platform.OS === "web") {
        console.warn("Push notifications are not supported on web.");
        return;
      }
      if (!Device.isDevice) {
        throw new Error("Not a real device.");
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        throw new Error("Push notification permissions not granted.");
      }

      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        Constants.easConfig?.projectId;

      if (!projectId) {
        throw new Error("Project ID not found.");
      }

      let deviceId: string;
      if (Platform.OS === "android") {
        deviceId = Application.getAndroidId();
      } else if (Platform.OS === "ios") {
        const id = await Application.getIosIdForVendorAsync();
        if (!id) {
          // Properly handle this better in the future...
          // Perhaps show a modal or something
          throw new Error("iOS ID for vendor not found.");
        }
        deviceId = id;
      } else {
        throw new Error("Cannot retrieve device ID: Unsupported platform.");
      }

      const token = (await Notifications.getExpoPushTokenAsync({ projectId }))
        .data;

      setToken(token);

      await saveExpoPushToken(token, deviceId);

      try {
        await AsyncStorage.setItem("created-expo-token", "true");
      } catch (e) {
        console.error("Failed to set `created-expo-token` in storage...");
      }
    }

    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
      },
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response received:", response);
      });

    registerForPushNotificationsAsync();

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  return (
    <ExpoPushTokenContext.Provider value={token}>
      {children}
    </ExpoPushTokenContext.Provider>
  );
}

export { ExpoPushTokenContext, ExpoPushTokenProvider };
