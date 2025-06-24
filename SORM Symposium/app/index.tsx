import signinAdmin, { signinAttendee } from "@/api/signinUser";
import ConfirmationModal from "@/components/ConfirmationModal";
import { ThemedText } from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import { ThemedView } from "@/components/ThemedView";
import { supabase } from "@/constants/supabase";
import { clearVerifiedEmails, getVerifiedEmails, storeVerifiedEmail } from "@/lib/attendeeStorage";
import { isAttendeeEmail } from "@/services/attendees";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Button, StyleSheet } from "react-native";

type UserType = "attendee" | "organizer";

export default function Login() {
  const [userType, setUserType] = useState<UserType | null>(null);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [err, setErr] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
  
  const validEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/.test(email);
  const validPassword = password.length > 0;

  useEffect(() => {
    supabase.auth.signOut();
  }, []);

  // Check for verified attendees on component mount and redirect automatically
  useEffect(() => {
    const checkVerifiedAttendees = async () => {
      try {
        const verifiedEmails = await getVerifiedEmails();
        if (verifiedEmails.length > 0) {
          // Validate each stored email against the database
          const validEmails: string[] = [];
          
          for (const email of verifiedEmails) {
            try {
              const isValid = await isAttendeeEmail(email);
              if (isValid) {
                validEmails.push(email);
              }
            } catch (error) {
              console.error(`Error validating email ${email}:`, error);
              // Remove invalid email from consideration but don't throw
            }
          }

          // Update local storage to only contain valid emails
          if (validEmails.length !== verifiedEmails.length) {
            await clearVerifiedEmails();
            for (const validEmail of validEmails) {
              await storeVerifiedEmail(validEmail);
            }
          }

          // Redirect only if we have at least one valid attendee email
          if (validEmails.length > 0) {
            router.push("/(tabs)/home");
          }
        }
      } catch (error) {
        console.error('Error checking verified emails:', error);
      }
    };

    checkVerifiedAttendees();
  }, []);

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
        const result = await signinAttendee(email, () => {
          setShowConfirmationModal(true);
        });
        if (result.verified) {
          router.push("/(tabs)/home");
        }
      } else if (userType === "organizer") {
        await signinAdmin(email, password);
        await clearVerifiedEmails();
        router.push("/(tabs)/home");
      }
    } catch (e) {
      setErr("Failed to sign in: " + (e as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProceedAsAttendee = async () => {
    setShowConfirmationModal(false);
    setIsProcessing(true);
    setErr("");
    
    try {
      const result = await signinAttendee(email);
      if (result.verified) {
        router.push("/(tabs)/home");
      }
    } catch (e) {
      setErr("Failed to sign in: " + (e as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoToAdminLogin = () => {
    setShowConfirmationModal(false);
    setUserType("organizer");
    setPassword("");
    setErr("");
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
    <>
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

      <ConfirmationModal
        visible={showConfirmationModal}
        onProceedAsAttendee={handleProceedAsAttendee}
        onGoToAdminLogin={handleGoToAdminLogin}
      />
    </>
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
