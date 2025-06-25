// NOTE: This modal would be used to verify an email address
//       using a 6-digit code sent to the email address.
//       It is not currently used in the app.

import React, { useState } from 'react';
import { Modal, StyleSheet, Alert } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import ThemedTextInput from './ThemedTextInput';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { verifyAttendee } from '@/api/signinUser';

interface EmailVerificationModalProps {
  visible: boolean;
  email: string;
  onVerificationComplete: () => void;
  onCancel: () => void;
}

export default function EmailVerificationModal({
  visible,
  email,
  onVerificationComplete,
  onCancel
}: EmailVerificationModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    setIsVerifying(true);
    try {
      // For now, we'll use a simple verification approach
      // In a real implementation, you might want to send a verification code via email
      // and verify it against what the user enters
      
      // For demo purposes, we'll accept any 6-digit code
      if (verificationCode.length === 6 && /^\d+$/.test(verificationCode)) {
        await verifyAttendee(email);
        Alert.alert('Success', 'Email verified successfully!', [
          { text: 'OK', onPress: onVerificationComplete }
        ]);
      } else {
        Alert.alert('Error', 'Invalid verification code. Please enter a 6-digit code.');
      }
    } catch (error) {
      Alert.alert('Error', `Verification failed: ${(error as Error).message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCancel = () => {
    setVerificationCode('');
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
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
          
          <ThemedText style={styles.description}>
            Please verify your email address to continue as a Symposium Attendee.
          </ThemedText>
          
          <ThemedText style={styles.emailText}>
            Email: {email}
          </ThemedText>
          
          <ThemedText style={styles.instruction}>
            Enter the 6-digit verification code sent to your email:
          </ThemedText>
          
          <ThemedTextInput
            value={verificationCode}
            onChangeText={setVerificationCode}
            placeholder="Enter 6-digit code"
            keyboardType="numeric"
            maxLength={6}
            style={styles.input}
          />
          
          <ThemedView style={styles.buttonContainer}>
            <ThemedView
              style={[
                styles.button,
                styles.verifyButton,
                { backgroundColor: Colors[colorScheme].tint }
              ]}
              onTouchEnd={handleVerify}
            >
              <ThemedText style={[
                styles.buttonText,
                { color: Colors[colorScheme].background }
              ]}>
                {isVerifying ? 'Verifying...' : 'Verify Email'}
              </ThemedText>
            </ThemedView>
            
            <ThemedView
              style={[
                styles.button,
                styles.cancelButton,
                { backgroundColor: Colors[colorScheme].tabIconDefault }
              ]}
              onTouchEnd={handleCancel}
            >
              <ThemedText style={[
                styles.buttonText,
                { color: Colors[colorScheme].background }
              ]}>
                Cancel
              </ThemedText>
            </ThemedView>
          </ThemedView>
          
          <ThemedText style={styles.note}>
            Note: For demo purposes, any 6-digit code will be accepted.
          </ThemedText>
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
  },
  modalContent: {
    margin: 20,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 300,
  },
  title: {
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: 15,
  },
  emailText: {
    fontWeight: 'bold',
    marginBottom: 20,
  },
  instruction: {
    textAlign: 'center',
    marginBottom: 15,
  },
  input: {
    width: '100%',
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 18,
    letterSpacing: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  verifyButton: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
  },
  buttonText: {
    fontWeight: 'bold',
  },
  note: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
}); 