import { StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import AttendeeContactList from "@/components/Networking/AttendeeContactList";

export default function Connect() {

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Connect",
          headerShown: true,
        }}
      />
      <ThemedView style={styles.container}>
        <AttendeeContactList />
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
