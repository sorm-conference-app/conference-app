import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Stack } from "expo-router";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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