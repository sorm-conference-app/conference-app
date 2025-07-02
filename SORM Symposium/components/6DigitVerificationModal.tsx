import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import ThemedTextInput from './ThemedTextInput';
import { ThemedView } from './ThemedView';
import { checkCode } from '@/hooks/use6DigitVerification';

interface SixDigitVerificationModalProps {
  visible: boolean;
  email: string;
  onVerificationComplete: () => void;
  onCancel: () => void;
  onResendCode: () => void;
}

/**
 * Modal component for 6-digit email verification code input
 */
export default function SixDigitVerificationModal({
  visible,
  email,
  onVerificationComplete,
  onCancel,
  onResendCode
}: SixDigitVerificationModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);

  // Reset state when modal becomes visible
  useEffect(() => {
    if (visible) {
      setVerificationCode('');
      setError('');
      setIsVerifying(false);
      setIsResending(false);
    }
  }, [visible]);

  // Check for valid 6-digit code on input change
  useEffect(() => {
    if (verificationCode.length === 6 && /^\d{6}$/.test(verificationCode)) {
      handleVerifyCode();
    }
  }, [verificationCode]);

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6 || !/^\d{6}$/.test(verificationCode)) {
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const isValid = await checkCode(email, verificationCode);
      
      if (isValid) {
        // Code is valid, complete verification
        onVerificationComplete();
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
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError('');

    try {
      await onResendCode();
      setError(''); // Clear any previous errors
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
          <ThemedText type="title" style={styles.title}>
            Email Verification Required
          </ThemedText>
          
          <ThemedText style={styles.message}>
            We've sent a verification code to your email address to ensure your account security.
          </ThemedText>

          <ThemedView style={[
            styles.emailContainer,
            { backgroundColor: Colors[colorScheme].background }
          ]}>
            <ThemedText type="subtitle" style={styles.emailHeader}>
              Verification Email Sent To:
            </ThemedText>
            <ThemedText style={styles.emailAddress}>{email}</ThemedText>
            <ThemedText style={styles.emailSource}>
              From: sorm.symposium@gmail.com
            </ThemedText>
          </ThemedView>

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
                const digitsOnly = text.replace(/[^0-9]/g, '');
                setVerificationCode(digitsOnly.slice(0, 6));
              }}
              placeholder="000000"
              keyboardType="numeric"
              maxLength={6}
              style={styles.codeInput}
              accessibilityLabel="Verification code input field"
              accessibilityHint="Enter the 6-digit verification code sent to your email"
              autoFocus={true}
            />
            {isVerifying && (
              <ThemedText style={styles.verifyingText}>
                Verifying...
              </ThemedText>
            )}
          </ThemedView>

          {error && (
            <ThemedView style={[
              styles.errorContainer,
              { backgroundColor: Colors[colorScheme].background }
            ]}>
              <ThemedText style={styles.errorText}>
                {error}
              </ThemedText>
            </ThemedView>
          )}

          <ThemedText style={styles.instructionText}>
            The code will automatically verify when you enter all 6 digits.
          </ThemedText>

          {/* Action buttons */}
          <ThemedView style={styles.buttonContainer}>
            <Pressable
              style={[
                styles.button,
                styles.secondaryButton,
                { backgroundColor: Colors[colorScheme].tabIconDefault }
              ]}
              onPress={handleResendCode}
              disabled={isResending}
            >
              <ThemedText style={[
                styles.buttonText,
                { color: Colors[colorScheme].background }
              ]}>
                {isResending ? 'Resending...' : 'Resend Code'}
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
