import { StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";

export default function Connect() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
          options={{
          title: "Connect",
          headerShown: true,
          }}
      />
      <ThemedView style={styles.container}>
        <ThemedText>Example Text</ThemedText>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexGrow: 1,
  },
});