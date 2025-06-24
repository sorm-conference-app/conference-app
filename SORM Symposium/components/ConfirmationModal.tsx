import React from 'react';
import { Modal, Pressable, StyleSheet } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ConfirmationModalProps {
  visible: boolean;
  onProceedAsAttendee: () => void;
  onGoToAdminLogin: () => void;
}

export default function ConfirmationModal({
  visible,
  onProceedAsAttendee,
  onGoToAdminLogin
}: ConfirmationModalProps) {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onGoToAdminLogin}
    >
      <ThemedView style={styles.overlay}>
        <ThemedView style={[
          styles.modalContent,
          { backgroundColor: Colors[colorScheme].secondaryBackgroundColor }
        ]}>
          <ThemedText type="title" style={styles.title}>
            You Have Organizer Access
          </ThemedText>
          
          <ThemedText style={styles.message}>
            This email is registered as both an attendee and an organizer. <br />
            Logging in as an attendee will prevent you from accessing administration tools. <br />
            Are you sure you want to sign in as an attendee?
          </ThemedText>
          
          <ThemedView style={[
          styles.buttonContainer,
          { backgroundColor: Colors[colorScheme].secondaryBackgroundColor }
        ]}>
            <Pressable
              style={[
                styles.button,
                styles.attendeeButton,
                { backgroundColor: Colors[colorScheme].adminButton }
              ]}
              onPress={onProceedAsAttendee}
            >
              <ThemedText style={[
                styles.buttonText,
                { color: Colors[colorScheme].adminButtonText }
              ]}>
                Proceed as Attendee
              </ThemedText>
            </Pressable>
            
            <Pressable
              style={[
                styles.button,
                styles.adminButton,
                { backgroundColor: Colors[colorScheme].tabIconDefault }
              ]}
              onPress={onGoToAdminLogin}
            >
              <ThemedText style={[
                styles.buttonText,
                { color: Colors[colorScheme].adminButtonText }
              ]}>
                Go to Admin Login
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
    marginBottom: 15,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 10,
    width: '100%',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  attendeeButton: {
    marginBottom: 5,
  },
  adminButton: {
    marginTop: 5,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
}); 