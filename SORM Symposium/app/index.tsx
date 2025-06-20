import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Alert, Button, Pressable, StyleSheet, useColorScheme } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import ThemedTextInput from "@/components/ThemedTextInput";
import signinUser from "@/api/signinUser";
import { Colors } from "@/constants/Colors";

export default function Login() {
  const colorScheme = useColorScheme() || "light";
  const [showLoginScreen, setShowLoginScreen] = useState<boolean>(false);
  const [login, setLogin] = useState<{
    email: string;
    password: string;
  }>({
    email: "",
    password: "",
  });
  const [err, setErr] = useState<string>("");
  const validEmail = /^[A-Za-z0-9]+@[A-Za-z0-9-]+\.[A-Za-z]{2,}$/.test(
    login.email,
  );

  const updateLoginDetails = (field: "email" | "password", value: string) => {
    setLogin((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogin = async () => {
    const { email, password } = login;
    setErr("");
    try {
      await signinUser(email, password);
      router.push("/(tabs)/home");
    } catch (e) {
      setErr("Failed to login: " + (e as Error).message);
    }
  };

  const navigate = (type: "attendee" | "organizer") => {
    if (type === "attendee") {
      router.navigate("/(tabs)/home");
    } else {
      setShowLoginScreen(true);
    }
  };

  const initialJSX = (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Welcome!</ThemedText>
      <ThemedText>
        We&apos;re excited you&apos;re here. To continue, please identify who
        you are:
      </ThemedText>

      <ThemedText style={{ marginTop: 5 }}>I am a...</ThemedText>
      <Pressable
        onPress={() => navigate("attendee")}
        style={[
          styles.button,
          { backgroundColor: Colors[colorScheme].adminButton },
          { borderColor: Colors[colorScheme].adminButtonText },
          { borderWidth: 1 },
        ]}
      >
        <ThemedText style={[styles.buttonText, { color: Colors[colorScheme].adminButtonText }]}
        >Symposium Attendee</ThemedText>
      </Pressable>
      <Pressable
        onPress={() => navigate("organizer")}
        style={[
          styles.button,
          { backgroundColor: Colors[colorScheme].adminButton },
          { borderColor: Colors[colorScheme].adminButtonText },
          { borderWidth: 1 },
        ]}
      >
        <ThemedText style={[styles.buttonText, { color: Colors[colorScheme].adminButtonText }]}
        >Symposium Organizer</ThemedText>
      </Pressable>
    </ThemedView>
  );

  if (!showLoginScreen) {
    return initialJSX;
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Welcome!</ThemedText>
      <ThemedText>Sign in to continue.</ThemedText>

      <ThemedView style={styles.inputContainer}>
        <ThemedText>Email</ThemedText>
        <ThemedTextInput
          value={login.email}
          textContentType="emailAddress"
          onChangeText={(txt) => updateLoginDetails("email", txt)}
        />
        {login.email.length > 0 && !validEmail && (
          <ThemedText style={styles.invalid}>Not a valid email.</ThemedText>
        )}
      </ThemedView>

      <ThemedView style={styles.inputContainer}>
        <ThemedText>Password</ThemedText>
        <ThemedTextInput
          value={login.password}
          textContentType="password"
          secureTextEntry
          onChangeText={(txt) => updateLoginDetails("password", txt)}
        />
      </ThemedView>

      <Pressable
        onPress={handleLogin}
        disabled={!validEmail || login.password.length === 0}
        style={[
          styles.button,
          !validEmail || login.password.length === 0 
            ? { backgroundColor: Colors[colorScheme].tabIconDefault } 
            : { backgroundColor: Colors[colorScheme].adminButton },
          { borderColor: Colors[colorScheme].adminButtonText },
          { borderWidth: 1 },
        ]}
      >
        <ThemedText style={[styles.buttonText, { color: Colors[colorScheme].adminButtonText }]}>Sign In</ThemedText>
      </Pressable>
      <Pressable
        onPress={() => setShowLoginScreen(false)}
        style={[
          styles.button,
          { backgroundColor: Colors[colorScheme].adminButton },
          { borderColor: Colors[colorScheme].adminButtonText },
          { borderWidth: 1 },
        ]}
      >
        <ThemedText style={[styles.buttonText, { color: Colors[colorScheme].adminButtonText }]}>Back</ThemedText>
      </Pressable>
      <ThemedText style={styles.invalid}>{err}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 25,
    height: "100%",
  },
  inputContainer: {
    marginTop: 5,
    marginBottom: 5,
  },
  invalid: {
    color: "red",
  },
  button: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
});
