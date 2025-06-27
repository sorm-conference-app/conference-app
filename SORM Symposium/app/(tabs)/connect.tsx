import { StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedView } from "@/components/ThemedView";
import AttendeeContactList from "@/components/Networking/AttendeeContactList";
import { useState } from "react";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors }  from "@/constants/Colors";

export default function Connect() {
  const colorScheme = useColorScheme() ?? 'light';
  const [reloadTrigger, setReloadTrigger] = useState(0);

  const handleReload = () => {
    setReloadTrigger(prev => prev + 1);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <Stack.Screen
          options={{
          title: "Connect",
          headerShown: true,
          }}
      />
      <ThemedView style={styles.container}>
        <AttendeeContactList reloadTrigger={reloadTrigger} />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  refreshButton: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
  },
});