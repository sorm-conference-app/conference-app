import React, { useState } from "react";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Alert, Button, StyleSheet } from "react-native";
import { router } from "expo-router";
import ThemedTextInput from "@/components/ThemedTextInput";
import signinUser, { signinAttendee } from "@/api/signinUser";
import { supabase } from "@/constants/supabase";
import { getVerifiedEmails, clearVerifiedEmails } from "@/lib/attendeeStorage";

type UserType = "attendee" | "organizer";

export default function Login() {
  const [userType, setUserType] = useState<UserType | null>(null);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [err, setErr] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  const validEmail = /^[A-Za-z0-9]+@[A-Za-z0-9-]+\.[A-Za-z]{2,}$/.test(email);
  const validPassword = password.length > 0;

  const handleSignIn = async () => {
    if (!validEmail) {
      setErr("Please enter a valid email address");
      return;
    }

    if (userType === "organizer" && !validPassword) {
      setErr("Please enter your password");
      return;
    }

    setIsProcessing(true);
    setErr("");
    
    try {
      if (userType === "attendee") {
        const result = await signinAttendee(email);
        if (result.verified) {
          router.push("/(tabs)/home");
        }
      } else if (userType === "organizer") {
        await signinUser(email, password);
        await clearVerifiedEmails();
        router.push("/(tabs)/home");
      }
    } catch (e) {
      setErr("Failed to sign in: " + (e as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const selectUserType = async (type: UserType) => {
    setUserType(type);
    setEmail("");
    setPassword("");
    setErr("");
    supabase.auth.signOut();
    if (type === "attendee") {
      // Check for any locally verified emails
      const verifiedEmails = await getVerifiedEmails();
      if (verifiedEmails.length > 0) {
        router.push("/(tabs)/home");
      }
    }
  };

  const goBack = () => {
    setUserType(null);
    setEmail("");
    setPassword("");
    setErr("");
  };

  const getTitle = () => {
    switch (userType) {
      case "attendee":
        return "Symposium Attendee";
      case "organizer":
        return "Symposium Organizer";
      default:
        return "Welcome!";
    }
  };

  const getDescription = () => {
    switch (userType) {
      case "attendee":
        return "Please enter the email address you used to register for the Symposium:";
      case "organizer":
        return "Sign in to continue.";
      default:
        return "We're excited you're here. To continue, please identify who you are:";
    }
  };

  const getButtonText = () => {
    if (isProcessing) return "Processing...";
    switch (userType) {
      case "attendee":
        return "Continue";
      case "organizer":
        return "Sign In";
      default:
        return "";
    }
  };

  const isButtonDisabled = () => {
    if (isProcessing) return true;
    if (!validEmail) return true;
    if (userType === "organizer" && !validPassword) return true;
    return false;
  };

  // Initial screen - user type selection
  if (!userType) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">{getTitle()}</ThemedText>
        <ThemedText>{getDescription()}</ThemedText>

        <ThemedText>I am a...</ThemedText>
        <Button 
          title="Symposium Attendee" 
          onPress={() => selectUserType("attendee")} 
        />
        <Button
          title="Symposium Organizer"
          onPress={() => selectUserType("organizer")}
        />
      </ThemedView>
    );
  }

  // Login screen for selected user type
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">{getTitle()}</ThemedText>
      <ThemedText>{getDescription()}</ThemedText>

      <ThemedView style={styles.inputContainer}>
        <ThemedText>Email</ThemedText>
        <ThemedTextInput
          value={email}
          textContentType="emailAddress"
          onChangeText={setEmail}
          placeholder="Enter your email"
        />
        {email.length > 0 && !validEmail && (
          <ThemedText style={styles.invalid}>Not a valid email.</ThemedText>
        )}
      </ThemedView>

      {userType === "organizer" && (
        <ThemedView style={styles.inputContainer}>
          <ThemedText>Password</ThemedText>
          <ThemedTextInput
            value={password}
            textContentType="password"
            secureTextEntry
            onChangeText={setPassword}
            placeholder="Enter your password"
          />
        </ThemedView>
      )}

      <Button
        title={getButtonText()}
        onPress={handleSignIn}
        disabled={isButtonDisabled()}
      />
      <Button title="Back" onPress={goBack} />
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
});
