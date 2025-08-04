import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, ScrollView } from 'react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface ConfirmEditEmailModalProps {
  visible: boolean;
  attendeeName: string;
  attendeeEmail: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmEditEmailModal({
  visible,
  attendeeName,
  attendeeEmail,
  onCancel,
  onConfirm
}: ConfirmEditEmailModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const [stage, setStage] = useState<'first' | 'second'>('first');

  const handleFirstConfirm = () => {
    setStage('second');
  };

  const handleSecondConfirm = () => {
    setStage('first');
    onConfirm();
  };

  const handleCancel = () => {
    setStage('first');
    onCancel();
  };

  return (
    <>
      {/* First Stage Modal */}
      <Modal
        visible={visible && stage === 'first'}
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
                Confirm Email Edit
              </ThemedText>

              <ThemedText style={styles.infoText}>
                Change {attendeeName}&apos;s email to &quot;{attendeeEmail}&quot;?
              </ThemedText>
              
              <ThemedText style={styles.message}>
                You are about to edit an attendee&apos;s email address.
              </ThemedText>
              <ThemedText style={styles.message}>
                This action will affect the attendee&apos;s ability to log in to the app.
              </ThemedText>
              <ThemedText style={styles.message}>
                Are you sure you want to proceed?
              </ThemedText>
              
              <ThemedView style={[
                styles.buttonContainer,
                { backgroundColor: Colors[colorScheme].secondaryBackgroundColor }
              ]}>
                <Pressable
                  style={[
                    styles.button,
                    styles.confirmButton,
                    { backgroundColor: Colors[colorScheme].adminButton }
                  ]}
                  onPress={handleFirstConfirm}
                >
                  <ThemedText style={[
                    styles.buttonText,
                    { color: Colors[colorScheme].adminButtonText }
                  ]}>
                    Yes, Continue
                  </ThemedText>
                </Pressable>
                
                <Pressable
                  style={[
                    styles.button,
                    styles.cancelButton,
                    { backgroundColor: Colors[colorScheme].tabIconDefault }
                  ]}
                  onPress={handleCancel}
                >
                  <ThemedText style={[
                    styles.buttonText,
                    { color: Colors[colorScheme].adminButtonText }
                  ]}>
                    Cancel
                  </ThemedText>
                </Pressable>
              </ThemedView>
            </ScrollView>
          </ThemedView>
        </ThemedView>
      </Modal>

      {/* Second Stage Modal */}
      <Modal
        visible={visible && stage === 'second'}
        animationType="fade"
        transparent={true}
        onRequestClose={onCancel}
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
                Final Confirmation
              </ThemedText>

              <ThemedText style={styles.infoText}>
                Change {attendeeName}&apos;s email to &quot;{attendeeEmail}&quot;?
              </ThemedText>
              
              <ThemedText style={styles.message}>
                This user&apos;s email address will be permanently updated in the system.
              </ThemedText>
              <ThemedText style={styles.message}>
                This action cannot be undone.
              </ThemedText>
              <ThemedText style={styles.message}>
                Do you want to proceed with the update?
              </ThemedText>
              
              <ThemedView style={[
                styles.buttonContainer,
                { backgroundColor: Colors[colorScheme].secondaryBackgroundColor }
              ]}>
                <Pressable
                  style={[
                    styles.button,
                    styles.confirmButton,
                    { backgroundColor: '#dc3545' } // Red color for final confirmation
                  ]}
                  onPress={handleSecondConfirm}
                >
                  <ThemedText style={[
                    styles.buttonText,
                    { color: Colors[colorScheme].adminButtonText }
                  ]}>
                    Yes, Update Email
                  </ThemedText>
                </Pressable>
                
                <Pressable
                  style={[
                    styles.button,
                    styles.cancelButton,
                    { backgroundColor: Colors[colorScheme].tabIconDefault }
                  ]}
                  onPress={handleCancel}
                >
                  <ThemedText style={[
                    styles.buttonText,
                    { color: Colors[colorScheme].adminButtonText }
                  ]}>
                    Cancel
                  </ThemedText>
                </Pressable>
              </ThemedView>
            </ScrollView>
          </ThemedView>
        </ThemedView>
      </Modal>
    </>
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
    maxHeight: '85%',
    minHeight: 200,
  },
  scrollView: {
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
  },
  infoText: {
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 25,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  message: {
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 10,
    width: '100%',
    marginTop: 10,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButton: {
    marginBottom: 5,
  },
  cancelButton: {
    marginTop: 5,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
});
