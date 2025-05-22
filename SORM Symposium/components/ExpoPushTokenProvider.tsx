import { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

const ExpoPushTokenContext = createContext<string | null>(null);

type ExpoPushTokenProviderProps = {
  children: ReactNode;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowAlert: true,
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

      const token = (await Notifications.getExpoPushTokenAsync({ projectId }))
        .data;

      setToken(token);
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
