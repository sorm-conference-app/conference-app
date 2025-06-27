import signinAdmin, { signinAttendee } from "@/api/signinUser";
import ConfirmationModal from "@/components/ConfirmationModal";
import ContactSharingModal from "@/components/ContactSharingModal";
import { ThemedText } from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { supabase } from "@/constants/supabase";
import { useContactSharingModal } from "@/hooks/useContactSharingModal";
import { clearVerifiedEmails, getVerifiedEmails } from "@/lib/attendeeStorage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, useColorScheme } from "react-native";

type UserType = "attendee" | "organizer";

export default function Login() {
  const colorScheme = useColorScheme() || "light";
  const [userType, setUserType] = useState<UserType | null>(null);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [err, setErr] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
  
  // Contact sharing modal hook
  const {
    isVisible: isContactSharingVisible,
    attendee: contactSharingAttendee,
    showModal: showContactSharingModal,
    hideModal: hideContactSharingModal,
    savePreferences: saveContactSharingPreferences,
  } = useContactSharingModal();
  
  const validEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/.test(email);
  const validPassword = password.length > 0;

  useEffect(() => {
    supabase.auth.signOut();
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
          // Check if we should show the contact sharing modal
          const modalShown = await showContactSharingModal(email);
          // Only navigate to home if the modal isn't shown
          // If modal is shown, navigation will happen after it closes
          if (!modalShown) {
            router.push("/(tabs)/home");
          }
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
        // Check if we should show the contact sharing modal
        const modalShown = await showContactSharingModal(email);
        // Only navigate to home if the modal isn't shown
        // If modal is shown, navigation will happen after it closes
        if (!modalShown) {
          router.push("/(tabs)/home");
        }
      }
    } catch (e) {
      setErr("Failed to sign in: " + (e as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContactSharingDontShare = async () => {
    hideContactSharingModal();
    try {
      await saveContactSharingPreferences(false, '');
    } catch (error) {
      console.error('Error saving contact sharing preferences:', error);
    }
    router.push("/(tabs)/home");
  };

  const handleContactSharingShare = async (additionalInfo: string) => {
    hideContactSharingModal();
    try {
      await saveContactSharingPreferences(true, additionalInfo);
    } catch (error) {
      console.error('Error saving contact sharing preferences:', error);
    }
    router.push("/(tabs)/home");
  };

  const handleContactSharingClose = () => {
    hideContactSharingModal();
    router.push("/(tabs)/home");
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
        <ThemedText type="title" style={{ marginBottom: 10 }}>{getTitle()}</ThemedText>
        <ThemedText>{getDescription()}</ThemedText>

        <ThemedText style={{ marginTop: 5 }}>I am a...</ThemedText>
        <Pressable
          onPress={() => selectUserType("attendee")}
          style={[
            styles.button,
            { backgroundColor: Colors[colorScheme].adminButton },
            { borderColor: Colors[colorScheme].text },
            { borderWidth: 1 },
          ]}
        >
          <ThemedText style={[styles.buttonText, { color: Colors[colorScheme].adminButtonText }]}
          >Symposium Attendee</ThemedText>
        </Pressable>
        <Pressable
          onPress={() => selectUserType("organizer")}
          style={[
            styles.button,
            { backgroundColor: Colors[colorScheme].adminButton },
            { borderColor: Colors[colorScheme].text },
            { borderWidth: 1 },
          ]}
        >
          <ThemedText style={[styles.buttonText, { color: Colors[colorScheme].adminButtonText }]}
          >Symposium Organizer</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  // Login screen for selected user type
  return (
    <>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={{ marginBottom: 10 }}>{getTitle()}</ThemedText>
        <ThemedText>{getDescription()}</ThemedText>

        <ThemedView style={styles.inputContainer}>
          <ThemedText>Email</ThemedText>
          <ThemedTextInput
            value={email}
            textContentType="emailAddress"
            onChangeText={setEmail}
            placeholder="Enter your email"
            accessibilityLabel="Email input field"
            accessibilityHint="Enter your email"
            accessibilityRole="text"
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
              accessibilityLabel="Password input field"
              accessibilityHint="Enter your password"
              accessibilityRole="text"
            />
          </ThemedView>
        )}

        <Pressable
          onPress={handleSignIn}
          disabled={isButtonDisabled()}
          style={[
            styles.button,
            isButtonDisabled()
              ? { backgroundColor: Colors[colorScheme].tabIconDefault } 
              : { backgroundColor: Colors[colorScheme].adminButton },
            { borderColor: Colors[colorScheme].text },
            { borderWidth: 1 },
          ]}
        >
          <ThemedText style={[styles.buttonText, { color: Colors[colorScheme].adminButtonText }]}>{getButtonText()}</ThemedText>
        </Pressable>
        <Pressable
          onPress={goBack}
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

      <ConfirmationModal
        visible={showConfirmationModal}
        onProceedAsAttendee={handleProceedAsAttendee}
        onGoToAdminLogin={handleGoToAdminLogin}
      />

      <ContactSharingModal
        visible={isContactSharingVisible}
        attendee={contactSharingAttendee}
        onDontShare={handleContactSharingDontShare}
        onShare={handleContactSharingShare}
        onClose={handleContactSharingClose}
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
