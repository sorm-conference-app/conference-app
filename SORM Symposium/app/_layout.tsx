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
import { Platform } from "react-native";
import { ExpoPushTokenProvider } from "@/components/ExpoPushTokenProvider";
import { AuthSessionProvider } from "@/components/AuthSessionProvider";
import { ActiveUsersProvider } from "@/components/ActiveUsersProvider";

// Enable screens for better performance
enableScreens();

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? "light";
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const { top: topInset } = useSafeAreaInsets();

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
              <Stack
                screenOptions={{
                  contentStyle: {
                    paddingTop: topInset,
                  },
                }}
              >
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
              <StatusBar style="auto" />
            </ActiveUsersProvider>
          </AuthSessionProvider>
        </ExpoPushTokenProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
