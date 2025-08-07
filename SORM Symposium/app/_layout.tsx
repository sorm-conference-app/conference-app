import { useEffect, useRef } from "react";

import { ActiveUsersProvider } from "@/components/ActiveUsersProvider";
import { AuthSessionProvider } from "@/components/AuthSessionProvider";
import { ExpoPushTokenProvider } from "@/components/ExpoPushTokenProvider";
import { LoginFlowProvider } from "@/components/LoginFlowProvider";
import getCacheDatabase from "@/db";
import * as schema from "@/db/schema";
import migrations from "@/drizzle/migrations";
import { useColorScheme } from "@/hooks/useColorScheme";
import { sendLogMessage } from "@/services/logging";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { asc, desc } from "drizzle-orm";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";

// Custom hook to handle migrations with platform-specific logic
function usePlatformMigrations(db: any, migrations: any) {
  if (Platform.OS === "web") {
    return { success: true, error: null };
  }
  return useMigrations(db, migrations);
}
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { KeyboardAvoidingView, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { enableScreens } from "react-native-screens";

// Enable screens for better performance
enableScreens();

// Open the SQLite database synchronously
const { db, databaseName, SQLiteProvider } = getCacheDatabase();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const PREFETCH_QUERIES: Parameters<typeof queryClient.prefetchQuery>[number][] =
  [
    {
      queryKey: ["contacts"],
      queryFn: async function () {
        if (!db) {
          return [];
        }

        const data = await db
          .select()
          .from(schema.contact_info)
          .orderBy(asc(schema.contact_info.last_name));

        return data.map((row) => ({
          name: `${row.first_name} ${row.last_name}`,
          phone: row.phone_number,
          email: row.email,
        }));
      },
    },
    {
      queryKey: ["announcements"],
      queryFn: async function () {
        if (!db) {
          return [];
        }

        const data = await db
          .select()
          .from(schema.announcements)
          .orderBy(desc(schema.announcements.created_at));

        return data;
      },
    },
    {
      queryKey: ["announcements", 3], // Limit to 3 announcements
      queryFn: async function () {
        if (!db) {
          return [];
        }

        const data = await db
          .select()
          .from(schema.announcements)
          .orderBy(desc(schema.announcements.created_at))
          .limit(3);

        return data;
      },
    },
  ];

export default function RootLayout() {
  const initialLoad = useRef<boolean>(false);
  const colorScheme = useColorScheme() ?? "light";
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const { top: topInset, bottom: bottomInset, left: leftInset, right: rightInset} = useSafeAreaInsets();
  // @ts-ignore
  const { success, error } = usePlatformMigrations(db, migrations);

  useEffect(() => {
    // Send a log message on initial load to signal that a user has opened the app.
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

    // Prefetch cache from SQLite (if on native platforms)
    // so that it's shown immediately before useQuery is called.
    // If on web, the prefetch queries will be ignored.
    async function prefetchCache() {
      if (Platform.OS === "web") {
        return;
      }
      try {
        await Promise.all(
          PREFETCH_QUERIES.map((query) => queryClient.prefetchQuery(query)),
        );
      } catch (error) {
        console.error("Failed to prefetch cache:", error);
      }
    }

    prefetchCache();
    logInitialLoad();
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") {
      return;
    }
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

  const Screens = (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Stack
        screenOptions={{
          contentStyle: {
            paddingTop: topInset,
            paddingBottom: bottomInset,
            paddingLeft: leftInset,
            paddingRight: rightInset,
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
    </KeyboardAvoidingView>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <ExpoPushTokenProvider>
            <LoginFlowProvider>
              <AuthSessionProvider>
                <ActiveUsersProvider>
                  {SQLiteProvider ? (
                    <SQLiteProvider databaseName={databaseName} useSuspense>
                      {Screens}
                    </SQLiteProvider>
                  ) : (
                    Screens
                  )}
                </ActiveUsersProvider>
              </AuthSessionProvider>
            </LoginFlowProvider>
          </ExpoPushTokenProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
