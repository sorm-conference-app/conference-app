import { StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import AttendeeContactList from "@/components/Networking/AttendeeContactList";
import { useState } from "react";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function Connect() {
  const colorScheme = useColorScheme() ?? "light";
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const handleReload = () => {
    setReloadTrigger((prev) => prev + 1);
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Connect",
          headerShown: true,
        }}
      />
      <ThemedView style={styles.container}>
        <AttendeeContactList reloadTrigger={reloadTrigger} />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexGrow: 1,
  },
});
