import AnnouncementForm from "@/components/AnnouncementForm";
import ContactEditForm from "@/components/ContactEditForm";
import { ThemedText } from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import { ThemedView } from "@/components/ThemedView";
import { useState } from "react";
import { Button, SafeAreaView } from "react-native";

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
      <SafeAreaView>
        <ThemedView>
          <ThemedText>Welcome to the admin panel!</ThemedText>
          <AnnouncementForm />
          <ThemedText style={{ marginTop: 24, marginBottom: 8, fontWeight: "bold", fontSize: 18 }}>
            Edit Event Organizer Contact Information
          </ThemedText>
          <ContactEditForm />
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
