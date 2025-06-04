import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import ThemedTextInput from "@/components/ThemedTextInput";

export default function Login() {
  const [showLoginScreen, setShowLoginScreen] = useState<boolean>(false);
  const [login, setLogin] = useState<{
    email: string;
    password: string;
  }>({
    email: "",
    password: "",
  });

  const updateLoginDetails = (field: "email" | "password", value: string) => {
    setLogin((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const navigate = (type: "attendee" | "organizer") => {
    if (type === "attendee") {
      router.navigate("/");
    } else {
      setShowLoginScreen(true);
    }
  };

  const initialJSX = (
    <ThemedView>
      <ThemedText type="title">Welcome!</ThemedText>
      <ThemedText>
        We&apos;re excited you&apos;re here. To continue, please identify who
        you are:
      </ThemedText>

      <ThemedText>I am a...</ThemedText>
      <Button title="Symposium Attendee" onPress={() => navigate("attendee")} />
      <Button
        title="Symposium Organizer"
        onPress={() => navigate("organizer")}
      />
    </ThemedView>
  );

  if (!showLoginScreen) {
    return initialJSX;
  }

  return (
    <ThemedView>
      <ThemedText type="title">Welcome!</ThemedText>
      <ThemedText>Sign in to continue.</ThemedText>

      <ThemedText>Email</ThemedText>
      <ThemedTextInput
        value={login.email}
        textContentType="emailAddress"
        onChangeText={(txt) => updateLoginDetails("email", txt)}
      />

      <ThemedText>Password</ThemedText>
      <ThemedTextInput
        value={login.password}
        textContentType="password"
        secureTextEntry
        onChangeText={(txt) => updateLoginDetails("password", txt)}
      />

      <Button title="Sign In" />
      <Button title="Back" onPress={() => setShowLoginScreen(false)} />
    </ThemedView>
  );
}
