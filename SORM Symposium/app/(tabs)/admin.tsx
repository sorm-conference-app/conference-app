import { useState } from "react";
import { View, TextInput, Text, Button } from "react-native";

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
      <View>
        <Text>Welcome to the admin panel!</Text>
        <Button onPress={resetPin} title="Go back" />
      </View>
    );
  }

  return (
    <View>
      <TextInput
        value={pin}
        onChangeText={handlePinChange}
        placeholder="Enter PIN"
      />
    </View>
  );
}
