import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import { useState } from "react";
import { Button } from "react-native";

const TEMPORARY_PIN = "1234";

export default function Admin() {
  const [pin, setPin] = useState<string>("");

  function handlePinChange(text: string) {
    setPin(text);
  }

  function resetPin() {
    setPin("");
  }

  if (pin === TEMPORARY_PIN) {
    return (
      <ThemedView>
        <ThemedText>Welcome to the admin panel!</ThemedText>
        <Button onPress={resetPin} title="Go back" />
      </ThemedView>
    );
  }

  return (
    <ThemedView>
      <ThemedTextInput
        value={pin}
        onChangeText={handlePinChange}
        placeholder="Enter PIN"
      />
    </ThemedView>
  );
}
