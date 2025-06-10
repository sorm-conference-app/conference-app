import AnnouncementForm from "@/components/AnnouncementForm";
import { ThemedText } from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import { ThemedView } from "@/components/ThemedView";
import useSupabaseAuth from "@/hooks/useSupabaseAuth";
import { useState } from "react";
import { Button, SafeAreaView } from "react-native";
import { Redirect } from "expo-router";

const TEMPORARY_PIN = "1234";

export default function Admin() {
  const [pin, setPin] = useState<string>("");
  const user = useSupabaseAuth();

  function handlePinChange(text: string) {
    setPin(text);
  }

  function resetPin() {
    setPin("");
  }

  if (!user) {
    return <Redirect href="/(tabs)/agenda" />;
  }

  if (pin === TEMPORARY_PIN) {
    return (
      <SafeAreaView>
        <ThemedView>
          <ThemedText>Welcome to the admin panel!</ThemedText>
          <AnnouncementForm />
          <Button onPress={resetPin} title="Go back" />
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView>
      <ThemedView>
        <ThemedTextInput
          value={pin}
          onChangeText={handlePinChange}
          placeholder="Enter PIN"
        />
      </ThemedView>
    </SafeAreaView>
  );
}
