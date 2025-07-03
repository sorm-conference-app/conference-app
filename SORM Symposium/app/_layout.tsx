import { useEffect, useRef } from "react";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "@/hooks/useColorScheme";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { enableScreens } from "react-native-screens";
import { ExpoPushTokenProvider } from "@/components/ExpoPushTokenProvider";
import { AuthSessionProvider } from "@/components/AuthSessionProvider";
import { sendLogMessage } from "@/services/logging";
import { ActiveUsersProvider } from "@/components/ActiveUsersProvider";
import { openDatabaseSync, SQLiteProvider } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "@/drizzle/migrations";
import * as schema from "@/db/schema";

// Enable screens for better performance
enableScreens();

const DATABASE_NAME = "cache.db";

// Open the SQLite database synchronously
const expo = openDatabaseSync(DATABASE_NAME);
const db = drizzle<typeof schema>(expo);

export default function RootLayout() {
  const initialLoad = useRef<boolean>(false);
  const colorScheme = useColorScheme() ?? "light";
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const { top: topInset } = useSafeAreaInsets();
  const { success, error } = useMigrations(db, migrations);

  // Send a log message on initial load to signal that a user has opened the app.
  useEffect(() => {
    async function logInitialLoad() {
      if (initialLoad.current) {
        // If the app has already been opened, do not log again.
        return;
      }
      try {
        await sendLogMessage("app-open");
        initialLoad.current = true;
      } catch (error) {
        console.error("Failed to log app open:", error);
      }
    }

    logInitialLoad();
  }, []);

  useEffect(() => {
    if (success) {
      console.log("Database migrations completed successfully.");
    } else if (error) {
      console.error("Database migrations failed:", error);
    }
  }, [success, error]);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <ExpoPushTokenProvider>
          <AuthSessionProvider>
            <ActiveUsersProvider>
              <SQLiteProvider databaseName={DATABASE_NAME} useSuspense>
                <Stack
                  screenOptions={{
                    contentStyle: {
                      paddingTop: topInset,
                    },
                  }}
                >
                  <Stack.Screen
                    name="index"
                    options={{ headerShown: false, title: "Login" }}
                  />
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false, title: "SORM Symposium" }}
                  />
                  <Stack.Screen name="+not-found" />
                </Stack>
                <StatusBar style="auto" />
              </SQLiteProvider>
            </ActiveUsersProvider>
          </AuthSessionProvider>
        </ExpoPushTokenProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
