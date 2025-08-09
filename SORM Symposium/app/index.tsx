import signinAdmin, { requestOTP } from "@/api/signinUser";
import SixDigitVerificationModal from "@/components/6DigitVerificationModal";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useLoginFlow } from "@/components/LoginFlowProvider";
import ContactSharingModal from "@/components/Networking/ContactSharingModal";
import SormImageWrapper from "@/components/SormImageWrapper";
import SponsorLogo from "@/components/SponsorLogo";
import { ThemedText } from "@/components/ThemedText";
import ThemedTextInput from "@/components/ThemedTextInput";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { supabase } from "@/constants/supabase";
 
import { useContactSharingModal } from "@/hooks/useContactSharingModal";
import useSupabaseAuth from "@/hooks/useSupabaseAuth";
import { getAllSponsors } from "@/lib/sponsors";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, useColorScheme } from "react-native";
import PhoneInput, { ICountry, isValidPhoneNumber } from "react-native-international-phone-number";

type UserType = "attendee" | "organizer";
type ContactMethod = "email" | "phone";
type AttendeeStep = "collectEmail" | "collectContact";

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
  const { setLoginFlow, clearLoginFlow } = useLoginFlow();
  const [userType, setUserType] = useState<UserType | null>(null);
  const [attendeeStep, setAttendeeStep] = useState<AttendeeStep>("collectEmail");
  const [attendeeEmail, setAttendeeEmail] = useState<string>("");
  const [contactMethod, setContactMethod] = useState<ContactMethod>("phone"); // Default to phone
  const [contact, setContact] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null);
  const [password, setPassword] = useState<string>("");
  const [err, setErr] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
  const [showVerificationModal, setShowVerificationModal] = useState<boolean>(false);
  const [proceedingAsAttendee, setProceedingAsAttendee] = useState<boolean>(false);
  const sponsors = useMemo(() => getAllSponsors(), []);

  // Contact sharing modal hook
  const {
    isVisible: isContactSharingVisible,
    attendee: contactSharingAttendee,
    showModal: showContactSharingModal,
    hideModal: hideContactSharingModal,
    savePreferences: saveContactSharingPreferences,
  } = useContactSharingModal();
  
  // Validation functions
  const validAttendeeEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/.test(attendeeEmail);
  const validEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/.test(contact);
  const validPhone = contactMethod === "phone" && selectedCountry 
    ? isValidPhoneNumber(phoneNumber, selectedCountry)
    : false;
  const validContact = contactMethod === "email" ? validEmail : validPhone;
  const validPassword = password.length > 0;

  useEffect(() => {
    // Wait for session to resolve from provider before doing anything
    if (session === undefined) {
      return;
    }
    // If unauthenticated, clear any lingering login flow state and old session
    if (!session?.user) {
      const clearAuth = async () => {
        await clearLoginFlow();
        await supabase.auth.signOut();
      };
      clearAuth();
    }
  }, [clearLoginFlow, session]);

  // Check if user is already authenticated and redirect
  useEffect(() => {
    if (session?.user) {
      router.replace("/(tabs)/home");
    }
  }, [session]);

  const handleEmailSubmit = () => {
    if (!validAttendeeEmail) {
      setErr("Please enter a valid email address");
      return;
    }

    setErr("");
    setAttendeeStep("collectContact");
    // Pre-fill email contact if they choose email verification
    if (contactMethod === "email") {
      setContact(attendeeEmail);
    }
  };

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
        
        // Request OTP for attendee with their registered email for identification
        await requestOTP(contactToSend, attendeeEmail);
        setShowVerificationModal(true);
      } else if (userType === "organizer") {
        // Admin password login - set login flow to 'organizer' on success
        await signinAdmin(contact, password, () => {
          setLoginFlow('organizer');
        });
        router.replace("/(tabs)/home");
      }
    } catch (e) {
      const errorMessage = (e as Error).message;
      // Check if this is the specific error for organizer trying to login as attendee
      if (userType === "attendee" && errorMessage.includes("registered as an organizer")) {
        setShowConfirmationModal(true);
      } else {
        setErr(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerificationComplete = async (result: any) => {
    setShowVerificationModal(false);
    setProceedingAsAttendee(false);
    
    try {
      // Set login flow to 'attendee' for OTP verification and show modal keyed by email to avoid phone collisions
      await setLoginFlow('attendee');

      // Always try to show by the attendee's registration email which we already collected
      const identifierForModal = attendeeEmail || (contactMethod === "email" ? contact : undefined) || undefined;

      const modalShown = await showContactSharingModal(identifierForModal);
      // Only navigate to home if the modal isn't shown
      if (!modalShown) {
        router.replace("/(tabs)/home");
      }
    } catch (error) {
      console.error('Error showing contact sharing modal:', error);
      router.replace("/(tabs)/home");
    }
  };

  const handleVerificationCancel = () => {
    setShowVerificationModal(false);
    setProceedingAsAttendee(false);
    setErr("");
  };

  const handleVerificationResend = async () => {
    const contactToSend = contactMethod === "phone" && selectedCountry
      ? `${selectedCountry.idd.root}${cleanPhoneNumber(phoneNumber)}`
      : contact;
    
    if (proceedingAsAttendee) {
      // Use requestOTP with bypassAdminCheck when proceeding as attendendee
      await requestOTP(contactToSend, attendeeEmail, true);
    } else {
      await requestOTP(contactToSend, userType === "attendee" ? attendeeEmail : undefined);
    }
    // Don't catch errors here - let the modal handle them
  };

  const handleProceedAsAttendee = async () => {
    setShowConfirmationModal(false);
    setProceedingAsAttendee(true);
    setIsProcessing(true);
    setErr("");
    
    try {
      // Proceed with attendee login, bypassing the admin check
      const contactToSend = contactMethod === "phone" && selectedCountry
        ? `${selectedCountry.idd.root}${cleanPhoneNumber(phoneNumber)}`
        : contact;
      
      // Use requestOTP with bypassAdminCheck set to true
      await requestOTP(contactToSend, attendeeEmail, true);
      setShowVerificationModal(true);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContactSharingDontShare = async (
    additionalInfo: string,
    name?: string,
    organization?: string,
    title?: string
  ) => {
    hideContactSharingModal();
    try {
      await saveContactSharingPreferences(
        false,
        additionalInfo,
        name,
        organization,
        title
      );
    } catch (error) {
      console.error('Error saving contact sharing preferences:', error);
    }
    router.replace("/(tabs)/home");
  };

  const handleContactSharingShare = async (
    additionalInfo: string,
    name?: string,
    organization?: string,
    title?: string
  ) => {
    hideContactSharingModal();
    try {
      await saveContactSharingPreferences(
        true,
        additionalInfo,
        name,
        organization,
        title
      );
    } catch (error) {
      console.error('Error saving contact sharing preferences:', error);
    }
    router.replace("/(tabs)/home");
  };

  const handleContactSharingClose = () => {
    hideContactSharingModal();
    router.replace("/(tabs)/home");
  };

  const handleGoToAdminLogin = () => {
    setShowConfirmationModal(false);
    setProceedingAsAttendee(false);
    setUserType("organizer");
    setPassword("");
    setErr("");
  };

  const selectUserType = async (type: UserType) => {
    setUserType(type);
    setAttendeeStep("collectEmail");
    setAttendeeEmail("");
    setContact("");
    setPhoneNumber("");
    setSelectedCountry(null);
    setPassword("");
    setErr("");
    setProceedingAsAttendee(false);
    setContactMethod(type === "attendee" ? "phone" : "email"); // Default phone for attendees
    //await clearLoginFlow();
  };

  const goBack = () => {
    if (userType === "attendee" && attendeeStep === "collectContact") {
      // Go back to email collection step
      setAttendeeStep("collectEmail");
      setContact("");
      setPhoneNumber("");
      setSelectedCountry(null);
      setProceedingAsAttendee(false);
      setErr("");
    } else {
      // Go back to user type selection
      setUserType(null);
      setAttendeeStep("collectEmail");
      setAttendeeEmail("");
      setContact("");
      setPhoneNumber("");
      setSelectedCountry(null);
      setPassword("");
      setProceedingAsAttendee(false);
      setErr("");
      setContactMethod("email");
    }
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
        return attendeeStep === "collectEmail" 
          ? "Symposium Attendee - Registration Email" 
          : "Symposium Attendee - Verification";
      case "organizer":
        return "Symposium Organizer";
      default:
        return "Welcome!";
    }
  };

  const getDescription = () => {
    switch (userType) {
      case "attendee":
        return attendeeStep === "collectEmail"
          ? "Please enter the email address you used to register for the Symposium. This helps us identify your account."
          : `Now we'll send you a verification code to confirm your identity. Choose your preferred method:`;
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
        return attendeeStep === "collectEmail" ? "Continue" : "Send Verification Code";
      case "organizer":
        return "Sign In";
      default:
        return "";
    }
  };

  const isButtonDisabled = () => {
    if (isProcessing) return true;
    if (userType === "attendee") {
      if (attendeeStep === "collectEmail") {
        return !validAttendeeEmail;
      } else {
        return !validContact;
      }
    }
    if (userType === "organizer") {
      return !validEmail || !validPassword;
    }
    return false;
  };

  // Handle contact method change for attendees in verification step
  const handleContactMethodChange = (method: ContactMethod) => {
    setContactMethod(method);
    if (method === "email") {
      setContact(attendeeEmail); // Pre-fill with registered email
      setPhoneNumber("");
      setSelectedCountry(null);
    } else {
      setContact("");
    }
    setErr("");
  };

  const footerLogos = (
    <>
      <ThemedView
        style={{ flexDirection: "column", alignItems: "center", marginTop: 5 }}
      >
        <ThemedText
          type="subtitle"
          style={{ marginBottom: 5, textAlign: "center", fontStyle: "italic" }}
        >
          Thank you to our sponsors for making this event possible
        </ThemedText>
        {sponsors.map((sponsor) => (
          <SponsorLogo {...sponsor} hyperlink key={sponsor.id} style={{ marginVertical: 8, marginHorizontal: 16 }} />
        ))}
      </ThemedView>
    </>
  );

  // Initial screen - user type selection
  if (!userType) {
    return (
      <SormImageWrapper>
        <ThemedView style={styles.container}>
          <ThemedText type="title" style={{ marginBottom: 10 }}>{getTitle()}</ThemedText>
          <ThemedText>{getDescription()}</ThemedText>

          <ThemedText style={{ marginVertical: 5 }}>I am a...</ThemedText>
          <Pressable
            onPress={() => selectUserType("attendee")}
            style={[
              styles.button,
              { backgroundColor: Colors[colorScheme].adminButton },
              // Use explicit color values to ensure borders show on static export first load
              // when theme hooks might not be fully initialized
              { 
                borderColor: colorScheme === 'dark' ? '#fff' : '#11181C', 
                borderWidth: 1, 
                borderStyle: "solid" 
              },
            ]}
          >
            <ThemedText
              type="subtitle"
              style={[
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
              { 
                borderColor: colorScheme === 'dark' ? '#fff' : '#11181C', 
                borderWidth: 1, 
                borderStyle: "solid" 
              },
            ]}
          >
            <ThemedText
              type="subtitle"
              style={[
                { color: Colors[colorScheme].adminButtonText },
              ]}
            >
              Symposium Organizer
            </ThemedText>
          </Pressable>
          {footerLogos}
        </ThemedView>
      </SormImageWrapper>
    );
  }

  // Attendee email collection step
  if (userType === "attendee" && attendeeStep === "collectEmail") {
    return (
      <SormImageWrapper>
        <ThemedView style={styles.container}>
          <ThemedText type="title" style={{ marginBottom: 10 }}>
            {getTitle()}
          </ThemedText>
          <ThemedText style={{ marginBottom: 20 }}>{getDescription()}</ThemedText>
          
          <ThemedView style={styles.emailHintContainer}>
            <ThemedText style={styles.emailHint}>
              💡 This email is only used to identify your registration. You can verify with a different contact method on the next step.
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.inputContainer}>
            <ThemedText>Registration Email</ThemedText>
            <ThemedTextInput
              value={attendeeEmail}
              textContentType="emailAddress"
              keyboardType="email-address"
              onChangeText={setAttendeeEmail}
              placeholder="Enter your registration email"
              accessibilityLabel="Registration email input field"
              accessibilityRole="text"
            />
            {attendeeEmail.length > 0 && !validAttendeeEmail && (
              <ThemedText style={styles.invalid}>
                Please enter a valid email address.
              </ThemedText>
            )}
          </ThemedView>

          <Pressable
            onPress={handleEmailSubmit}
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
              type="subtitle"
              style={[
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
              type="subtitle"
              style={[
                { color: Colors[colorScheme].adminButtonText },
              ]}
            >
              Back
            </ThemedText>
          </Pressable>
          
          <ThemedText style={styles.invalid}>{err}</ThemedText>
          {footerLogos}
        </ThemedView>
      </SormImageWrapper>
    );
  }

  // Login screen for selected user type (organizer or attendee verification step)
  return (
    <>
      <SormImageWrapper>
        <ThemedView style={styles.container}>
          <ThemedText type="title" style={{ marginBottom: 10 }}>
            {getTitle()}
          </ThemedText>
          <ThemedText>{getDescription()}</ThemedText>

          {userType === "attendee" && (
            <>
              <ThemedView style={styles.registeredEmailContainer}>
                <ThemedText style={styles.registeredEmailLabel}>Registered Email:</ThemedText>
                <ThemedText type="defaultSemiBold">{attendeeEmail}</ThemedText>
              </ThemedView>

              <ThemedView style={styles.contactMethodContainer}>
                <ThemedText>Verification Method</ThemedText>
                <ThemedView style={styles.segmentedControl}>
                  <Pressable
                    onPress={() => handleContactMethodChange("phone")}
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
                      type="subtitle"
                      style={[
                        { color: contactMethod === "phone" 
                            ? Colors[colorScheme].adminButtonText 
                            : Colors[colorScheme].text 
                        }
                      ]}
                    >
                      Phone
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={() => handleContactMethodChange("email")}
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
                      type="subtitle"
                      style={[
                        { color: contactMethod === "email" 
                            ? Colors[colorScheme].adminButtonText 
                            : Colors[colorScheme].text 
                        }
                      ]}
                    >
                      Email
                    </ThemedText>
                  </Pressable>
                </ThemedView>
              </ThemedView>
            </>
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
                accessibilityRole="text"
                editable={userType === "organizer"} // Only editable for organizers
                style={userType === "attendee" ? styles.readOnlyInput : undefined}
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
              type="subtitle"
              style={[
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
              type="subtitle"
              style={[
                { color: Colors[colorScheme].adminButtonText },
              ]}
            >
              Back
            </ThemedText>
          </Pressable>
          
          <ThemedText style={styles.invalid}>{err}</ThemedText>
          {footerLogos}
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
        attendeeEmail={userType === "attendee" ? attendeeEmail : undefined}
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
  emailHintContainer: {
    width: "100%",
    marginBottom: 20,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  emailHint: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  registeredEmailContainer: {
    width: "100%",
    marginBottom: 20,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#22c55e',
  },
  registeredEmailLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
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
  inputContainer: {
    width: "100%",
    marginBottom: 15,
  },
  readOnlyInput: {
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    opacity: 0.8,
  },
  button: {
    width: "100%",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
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
