import { verifyOTP } from '@/api/signinUser';
import { Colors } from '@/constants/Colors';
import { checkCode } from '@/hooks/use6DigitVerification';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import ThemedTextInput from './ThemedTextInput';
import { ThemedView } from './ThemedView';

interface SixDigitVerificationModalProps {
  visible: boolean;
  contact: string;
  onVerificationComplete: (result?: any) => void;
  onCancel: () => void;
  onResendCode: () => void;
  mode?: 'email_verification' | 'otp_verification'; // New prop to distinguish between modes
  attendeeEmail?: string; // The registered email for attendee identification in OTP mode
}

/**
 * Modal component for 6-digit verification code input
 * Supports both email verification codes and OTP verification
 */
export default function SixDigitVerificationModal({
  visible,
  contact,
  onVerificationComplete,
  onCancel,
  onResendCode,
  mode = 'email_verification',
  attendeeEmail
}: SixDigitVerificationModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(30);
  const cooldownRef = useRef<number | null>(null);
  // Track the last code we have already attempted to verify to avoid
  // sending multiple identical verification requests due to re-renders
  // (e.g. those caused by state updates or React 18 StrictMode double mounting)
  const lastAttemptedCodeRef = useRef<string | null>(null);

  // Determine if this is an email or phone contact
  const isEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/.test(contact);
  const contactMethod = isEmail ? 'email' : 'phone';

  // Reset state when modal becomes visible
  useEffect(() => {
    if (visible) {
      setVerificationCode('');
      setError('');
      setIsVerifying(false);
      setIsResending(false);
      setCooldown(0);
    }
    // Clean up timer on unmount
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [visible]);

  useEffect(() => {
    if (cooldown > 0) {
      cooldownRef.current = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            if (cooldownRef.current) clearInterval(cooldownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        if (cooldownRef.current) clearInterval(cooldownRef.current);
      };
    }
  }, [cooldown]);

  // Check for valid 6-digit code on input change
  useEffect(() => {
    const verifyCode = async () => {
      if (
        verificationCode.length !== 6 ||
        !/^\d{6}$/.test(verificationCode) ||
        verificationCode === lastAttemptedCodeRef.current
      ) {
        return;
      } else {
        // Remember that we've now attempted this code
        lastAttemptedCodeRef.current = verificationCode;
        setIsVerifying(true);
        setError('');

        try {
          let isValid = false;
          let result = null;

          if (mode === 'email_verification') {
            // Use the existing 6-digit verification for email verification codes
            isValid = await checkCode(contact, verificationCode);
          } else {
            // Use OTP verification for login
            result = await verifyOTP(contact, verificationCode, attendeeEmail);
            isValid = result.verified;
          }
        
          if (isValid) {
            // Code is valid, complete verification
            onVerificationComplete(result);
          } else {
            setError('Invalid or expired verification code. Please try again or resend a new code.');
            setVerificationCode('');
          }
        } catch (error) {
          console.error('Verification error:', error);
          setError('Failed to verify code. Please try again.');
          setVerificationCode('');
        } finally {
          setIsVerifying(false);
        }
      }
    };
    verifyCode();
  }, [verificationCode, mode, contact, onVerificationComplete, attendeeEmail]);

  const handleResendCode = async () => {
    setIsResending(true);
    setError('');

    try {
      await onResendCode();
      setError(''); // Clear any previous errors
      setCooldown(30); // Start 30s cooldown for resend
    } catch (error) {
      console.error('Resend error:', error);
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleCancel = () => {
    setVerificationCode('');
    setError('');
    onCancel();
  };

  const getContactDisplay = () => {
    if (contactMethod === 'email') {
      return contact;
    } else {
      // Mask phone number for privacy
      const visiblePart = contact.slice(-4);
      const maskedPart = '*'.repeat(Math.max(0, contact.length - 4));
      return maskedPart + visiblePart;
    }
  };

  const getTitle = () => {
    if (mode === 'email_verification') {
      return 'Email Verification Required';
    } else {
      return 'Enter Verification Code';
    }
  };

  const getMessage = () => {
    if (mode === 'email_verification') {
      return "We&apos;ve sent a verification code to your email address to ensure your account security.";
    } else {
      return `We sent a verification code to your ${contactMethod}:`;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleCancel}
    >
      <ThemedView style={styles.overlay}>
        <ThemedView style={[
          styles.modalContent,
          { backgroundColor: Colors[colorScheme].secondaryBackgroundColor }
        ]}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
          <ThemedText type="title" style={styles.title}>
            {getTitle()}
          </ThemedText>
          
          <ThemedText style={styles.message}>
            {getMessage()}
          </ThemedText>

          <ThemedView style={[
            styles.emailContainer,
            { backgroundColor: Colors[colorScheme].background }
          ]}>
            <ThemedText type="subtitle" style={styles.emailHeader}>
              {mode === 'email_verification' ? 'Verification Email Sent To:' : `Code sent to your ${contactMethod}:`}
            </ThemedText>
            <ThemedText style={styles.emailAddress}>{getContactDisplay()}</ThemedText>
            {mode === 'email_verification' && (
              <ThemedText style={styles.emailSource}>
                From: sorm.symposium@gmail.com
              </ThemedText>
            )}
          </ThemedView>

          {mode === 'email_verification' && (
            <ThemedText style={styles.message}>
              Check your spam folder if you don&apos;t see it in your inbox.
            </ThemedText>
          )}

          <ThemedView style={[
            styles.codeContainer,
            { backgroundColor: Colors[colorScheme].background }
          ]}>
            <ThemedText style={styles.codeLabel}>
              Enter the 6-digit verification code:
            </ThemedText>
            <ThemedTextInput
              value={verificationCode}
              onChangeText={(text) => {
                // Only allow digits and limit to 6 characters
                setVerificationCode((text.replace(/[^0-9]/g, '')).slice(0, 6));
              }}
              placeholder="000000"
              keyboardType="numeric"
              maxLength={6}
              style={styles.codeInput}
              accessibilityLabel="Verification code input field"
              accessibilityHint="Enter the 6-digit verification code sent to your contact"
              autoFocus={true}
            />
            {isVerifying && (
              <ThemedText style={styles.verifyingText}>
                Verifying...
              </ThemedText>
            )}
          </ThemedView>

          {(error !== '') && (
            <ThemedView style={[
              styles.errorContainer,
              { backgroundColor: Colors[colorScheme].background }
            ]}>
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </ThemedView>
          )}

          <ThemedText style={styles.instructionText}>
            The code will automatically verify when you enter all 6 digits.
          </ThemedText>

          <ThemedView style={styles.buttonContainer}>
            <Pressable
              style={[
                styles.button,
                styles.secondaryButton,
                { backgroundColor: cooldown > 0 ? Colors[colorScheme].tabIconDefault : Colors[colorScheme].adminButton }
              ]}
              onPress={handleResendCode}
              disabled={isResending || cooldown > 0}
            >
              <ThemedText style={[
                styles.buttonText,
                { color: Colors[colorScheme].adminButtonText }
              ]}>
                {isResending 
                ? 'Resending...' 
                : cooldown > 0 
                  ? `Resend Code (${cooldown}s)` 
                  : 'Resend Code'}
              </ThemedText>
            </Pressable>

            <Pressable
              style={[
                styles.button,
                styles.secondaryButton,
                { backgroundColor: Colors[colorScheme].tabIconDefault }
              ]}
              onPress={handleCancel}
            >
              <ThemedText style={[
                styles.buttonText,
                { color: Colors[colorScheme].background }
              ]}>
                Cancel
              </ThemedText>
            </Pressable>
          </ThemedView>
          </ScrollView>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  scrollView: {
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  emailContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  emailHeader: {
    marginBottom: 8,
    fontSize: 16,
  },
  emailAddress: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  emailSource: {
    fontSize: 14,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  codeContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  codeLabel: {
    fontWeight: '600',
    marginBottom: 12,
    fontSize: 16,
  },
  codeInput: {
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 4,
    fontWeight: '600',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  verifyingText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  errorContainer: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    fontWeight: '500',
  },
  instructionText: {
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 14,
    opacity: 0.8,
    fontStyle: 'italic',
  },
  buttonContainer: {
    gap: 12,
    backgroundColor: 'transparent',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    // Secondary button styles already applied via backgroundColor
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
});
