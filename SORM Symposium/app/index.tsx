import signinAdmin, { requestOTP } from "@/api/signinUser";
import SixDigitVerificationModal from "@/components/6DigitVerificationModal";
import ConfirmationModal from "@/components/ConfirmationModal";
import ContactSharingModal from "@/components/Networking/ContactSharingModal";
import SormImageWrapper from "@/components/SormImageWrapper";
import { ThemedText } from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { supabase } from "@/constants/supabase";
import { useContactSharingModal } from "@/hooks/useContactSharingModal";
import useSupabaseAuth from "@/hooks/useSupabaseAuth";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, useColorScheme } from "react-native";
import PhoneInput, { ICountry, isValidPhoneNumber } from "react-native-international-phone-number";

type UserType = "attendee" | "organizer";
type ContactMethod = "email" | "phone";

/**
 * Clean phone number by removing all non-digit characters
 * @param phoneNumber - Phone number with potential formatting
 * @returns Clean phone number with only digits
 */
const cleanPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, '');
  return cleaned;
};

export default function Login() {
  const colorScheme = useColorScheme() || "light";
  const session = useSupabaseAuth();
  const [userType, setUserType] = useState<UserType | null>(null);
  const [contactMethod, setContactMethod] = useState<ContactMethod>("email");
  const [contact, setContact] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null);
  const [password, setPassword] = useState<string>("");
  const [err, setErr] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
  const [showVerificationModal, setShowVerificationModal] = useState<boolean>(false);
  
  // Contact sharing modal hook
  const {
    isVisible: isContactSharingVisible,
    attendee: contactSharingAttendee,
    showModal: showContactSharingModal,
    hideModal: hideContactSharingModal,
    savePreferences: saveContactSharingPreferences,
  } = useContactSharingModal();
  
  // Validation functions
  const validEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/.test(contact);
  const validPhone = contactMethod === "phone" && selectedCountry 
    ? isValidPhoneNumber(phoneNumber, selectedCountry)
    : false;
  const validContact = contactMethod === "email" ? validEmail : validPhone;
  const validPassword = password.length > 0;

  useEffect(() => {
    supabase.auth.signOut();
  }, []);

  // Check if user is already authenticated and redirect
  useEffect(() => {
    if (session?.user) {
      router.push("/(tabs)/home");
    }
  }, [session]);

  const handleSignIn = async () => {
    if (!validContact) {
      setErr(`Please enter a valid ${contactMethod} address`);
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
        // For phone numbers, use the cleaned number with country code
        const contactToSend = contactMethod === "phone" && selectedCountry
          ? `${selectedCountry.idd.root}${cleanPhoneNumber(phoneNumber)}`
          : contact;
        
        // Request OTP for attendee
        const result = await requestOTP(contactToSend);
        setShowVerificationModal(true);
      } else if (userType === "organizer") {
        // Admin password login
        await signinAdmin(contact, password);
        router.push("/(tabs)/home");
      }
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerificationComplete = async (result: any) => {
    setShowVerificationModal(false);
    
    try {
      // Use cleaned formatted phone number for contact sharing
      const contactForSharing = contactMethod === "phone" && selectedCountry
        ? `${selectedCountry.idd.root}${cleanPhoneNumber(phoneNumber)}`
        : contact;
      
      // Check if we should show the contact sharing modal
      const modalShown = await showContactSharingModal(contactForSharing);
      // Only navigate to home if the modal isn't shown
      if (!modalShown) {
        router.push("/(tabs)/home");
      }
    } catch (error) {
      console.error('Error showing contact sharing modal:', error);
      router.push("/(tabs)/home");
    }
  };

  const handleVerificationCancel = () => {
    setShowVerificationModal(false);
    setErr("");
  };

  const handleVerificationResend = async () => {
    try {
      const contactToSend = contactMethod === "phone" && selectedCountry
        ? `${selectedCountry.idd.root}${cleanPhoneNumber(phoneNumber)}`
        : contact;
      await requestOTP(contactToSend);
    } catch (error) {
      setErr(`Failed to resend code: ${(error as Error).message}`);
    }
  };

  const handleProceedAsAttendee = () => {
    setShowConfirmationModal(false);
    // This logic would be triggered from the confirmation modal
    // which handles dual registration scenarios
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

  const selectUserType = (type: UserType) => {
    setUserType(type);
    setContact("");
    setPhoneNumber("");
    setSelectedCountry(null);
    setPassword("");
    setErr("");
    setContactMethod("email"); // Reset to email by default
    supabase.auth.signOut();
  };

  const goBack = () => {
    setUserType(null);
    setContact("");
    setPhoneNumber("");
    setSelectedCountry(null);
    setPassword("");
    setErr("");
    setContactMethod("email");
  };

  const handlePhoneNumberChange = (phoneNum: string) => {
    setPhoneNumber(phoneNum);
  };

  const handleCountryChange = (country: ICountry) => {
    setSelectedCountry(country);
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
        return `Please enter the ${contactMethod} you used to register for the Symposium:`;
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
        return "Send Verification Code";
      case "organizer":
        return "Sign In";
      default:
        return "";
    }
  };

  const isButtonDisabled = () => {
    if (isProcessing) return true;
    if (!validContact) return true;
    if (userType === "organizer" && !validPassword) return true;
    return false;
  };

  // Initial screen - user type selection
  if (!userType) {
    return (
      <SormImageWrapper>
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
            <ThemedText
              style={[
                styles.buttonText,
                { color: Colors[colorScheme].adminButtonText },
              ]}
            >
              Symposium Attendee
            </ThemedText>
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
            <ThemedText
              style={[
                styles.buttonText,
                { color: Colors[colorScheme].adminButtonText },
              ]}
            >
              Symposium Organizer
            </ThemedText>
          </Pressable>
        </ThemedView>
      </SormImageWrapper>
    );
  }

  // Login screen for selected user type
  return (
    <>
      <SormImageWrapper>
        <ThemedView style={styles.container}>
          <ThemedText type="title" style={{ marginBottom: 10 }}>
            {getTitle()}
          </ThemedText>
          <ThemedText>{getDescription()}</ThemedText>

          {userType === "attendee" && (
            <ThemedView style={styles.contactMethodContainer}>
              <ThemedText>Contact Method</ThemedText>
              <ThemedView style={styles.segmentedControl}>
                <Pressable
                  onPress={() => {
                    setContactMethod("email");
                    setContact("");
                    setPhoneNumber("");
                    setSelectedCountry(null);
                  }}
                  style={[
                    styles.segmentButton,
                    {
                      backgroundColor: contactMethod === "email" 
                        ? Colors[colorScheme].adminButton 
                        : Colors[colorScheme].background,
                      borderColor: Colors[colorScheme].text
                    }
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.segmentText,
                      { color: contactMethod === "email" 
                          ? Colors[colorScheme].adminButtonText 
                          : Colors[colorScheme].text 
                      }
                    ]}
                  >
                    Email
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setContactMethod("phone");
                    setContact("");
                    setPhoneNumber("");
                    setSelectedCountry(null);
                  }}
                  style={[
                    styles.segmentButton,
                    {
                      backgroundColor: contactMethod === "phone" 
                        ? Colors[colorScheme].adminButton 
                        : Colors[colorScheme].background,
                      borderColor: Colors[colorScheme].text
                    }
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.segmentText,
                      { color: contactMethod === "phone" 
                          ? Colors[colorScheme].adminButtonText 
                          : Colors[colorScheme].text 
                      }
                    ]}
                  >
                    Phone
                  </ThemedText>
                </Pressable>
              </ThemedView>
            </ThemedView>
          )}

          <ThemedView style={styles.inputContainer}>
            <ThemedText>{contactMethod === "email" ? "Email" : "Phone Number"}</ThemedText>
            
            {contactMethod === "email" ? (
              <ThemedTextInput
                value={contact}
                textContentType="emailAddress"
                keyboardType="email-address"
                onChangeText={setContact}
                placeholder="Enter your email"
                accessibilityLabel="Email input field"
                accessibilityHint="Enter your email"
                accessibilityRole="text"
              />
            ) : (
              <PhoneInput
                value={phoneNumber}
                onChangePhoneNumber={handlePhoneNumberChange}
                selectedCountry={selectedCountry}
                onChangeSelectedCountry={handleCountryChange}
                defaultCountry="US"
                placeholder="Enter your phone number"
                theme={colorScheme === 'dark' ? 'dark' : 'light'}
                phoneInputStyles={{
                  container: [
                    styles.phoneContainer,
                    {
                      backgroundColor: Colors[colorScheme].background,
                      borderColor: Colors[colorScheme].text,
                    }
                  ],
                  input: [
                    styles.phoneTextInput,
                    {
                      color: Colors[colorScheme].text,
                    }
                  ],
                  callingCode: [
                    styles.phoneCodeText,
                    {
                      color: Colors[colorScheme].text,
                    }
                  ],
                }}
              />
            )}
            
            {((contactMethod === "email" && contact.length > 0 && !validEmail) ||
              (contactMethod === "phone" && phoneNumber.length > 0 && !validPhone)) && (
              <ThemedText style={styles.invalid}>
                Not a valid {contactMethod} {contactMethod === "phone" ? "number" : ""}.
              </ThemedText>
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
            <ThemedText
              style={[
                styles.buttonText,
                { color: Colors[colorScheme].adminButtonText },
              ]}
            >
              {getButtonText()}
            </ThemedText>
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
            <ThemedText
              style={[
                styles.buttonText,
                { color: Colors[colorScheme].adminButtonText },
              ]}
            >
              Back
            </ThemedText>
          </Pressable>
          
          <ThemedText style={styles.invalid}>{err}</ThemedText>
        </ThemedView>
      </SormImageWrapper>

      <ConfirmationModal
        visible={showConfirmationModal}
        onProceedAsAttendee={handleProceedAsAttendee}
        onGoToAdminLogin={handleGoToAdminLogin}
      />

      <SixDigitVerificationModal
        visible={showVerificationModal}
        contact={contactMethod === "phone" && selectedCountry
          ? `${selectedCountry.idd.root}${cleanPhoneNumber(phoneNumber)}`
          : contact}
        mode="otp_verification"
        onVerificationComplete={handleVerificationComplete}
        onCancel={handleVerificationCancel}
        onResendCode={handleVerificationResend}
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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  contactMethodContainer: {
    width: "100%",
    marginBottom: 20,
  },
  segmentedControl: {
    flexDirection: "row",
    borderRadius: 8,
    marginTop: 10,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center",
  },
  segmentText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 15,
  },
  button: {
    width: "100%",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  invalid: {
    color: "red",
    fontSize: 14,
    marginTop: 5,
  },
  phoneContainer: {
    borderWidth: 1,
    borderRadius: 8,
    width: "100%",
  },
  phoneTextInput: {
    fontSize: 16,
    height: 50,
  },
  phoneCodeText: {
    fontSize: 16,
  },
});
