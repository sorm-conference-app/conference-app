import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import type { Attendee } from '@/services/attendees';
import React, { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import ThemedTextInput from './ThemedTextInput';
import { ThemedView } from './ThemedView';

interface ContactSharingModalProps {
  visible: boolean;
  attendee: Attendee | null;
  onDontShare: (additionalInfo: string) => void;
  onShare: (additionalInfo: string) => void;
  onClose: () => void;
}

/**
 * Modal component that asks attendees whether they want to share their contact information
 * in the Connect tab and allows them to add additional information to share.
 */
export default function ContactSharingModal({
  visible,
  attendee,
  onDontShare,
  onShare,
  onClose
}: ContactSharingModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const [step, setStep] = useState<'choice' | 'additional-info'>('choice');
  const [additionalInfo, setAdditionalInfo] = useState('');

  // Reset state when modal becomes visible
  useEffect(() => {
    if (visible && attendee) {
      setStep('choice');
      setAdditionalInfo(attendee.additional_info || '');
    }
  }, [visible, attendee]);

  const handleDontShareClick = () => {
    onDontShare(additionalInfo);
  };

  const handleShareClick = () => {
    setStep('additional-info');
  };

  const handleSaveWithAdditionalInfo = () => {
    onShare(additionalInfo);
  };

  const handleBackToChoice = () => {
    setStep('choice');
  };

  if (!attendee) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <ThemedView style={styles.overlay}>
        <ThemedView style={[
          styles.modalContent,
          { backgroundColor: Colors[colorScheme].secondaryBackgroundColor }
        ]}>
          {step === 'choice' ? (
            // Step 1: Choice between sharing or not
            <>
              <ThemedText type="title" style={styles.title}>
                {attendee.is_admin === true ? "We Share Your Contact Information" : "Share Your Contact Information?"}
              </ThemedText>
              
              <ThemedText style={styles.message}>
                {attendee.is_admin === true 
                ? "You are an organizer, so we share your contact information with other attendees in the Connect tab." 
                : "Would you like to share your contact information with other attendees in the Connect tab?"}
              </ThemedText>
              
              {/* Display current attendee information */}
              <ThemedView style={[
                styles.infoContainer,
                { backgroundColor: Colors[colorScheme].background }
              ]}>
                <ThemedText type="subtitle" style={styles.infoHeader}>
                  Your Information:
                </ThemedText>
                
                {attendee.name && (
                  <ThemedView style={styles.infoRow}>
                    <ThemedText style={styles.infoLabel}>Name:</ThemedText>
                    <ThemedText style={styles.infoValue}>{attendee.name}</ThemedText>
                  </ThemedView>
                )}
                
                <ThemedView style={styles.infoRow}>
                  <ThemedText style={styles.infoLabel}>Email:</ThemedText>
                  <ThemedText style={styles.infoValue}>{attendee.email}</ThemedText>
                </ThemedView>
                
                {attendee.organization && (
                  <ThemedView style={styles.infoRow}>
                    <ThemedText style={styles.infoLabel}>Organization:</ThemedText>
                    <ThemedText style={styles.infoValue}>{attendee.organization}</ThemedText>
                  </ThemedView>
                )}
                
                {attendee.title && (
                  <ThemedView style={styles.infoRow}>
                    <ThemedText style={styles.infoLabel}>Title:</ThemedText>
                    <ThemedText style={styles.infoValue}>{attendee.title}</ThemedText>
                  </ThemedView>
                )}
              </ThemedView>

              <ThemedText style={styles.changeText}>
                {attendee.is_admin === false 
                && "You can change this setting anytime later."}
              </ThemedText>

              {/* Action buttons */}
              <ThemedView style={styles.buttonContainer}>
                <Pressable
                  style={[
                    styles.button,
                    styles.primaryButton,
                    { backgroundColor: Colors[colorScheme].tint }
                  ]}
                  onPress={handleShareClick}
                >
                  <ThemedText style={[
                    styles.buttonText,
                    { color: Colors[colorScheme].background }
                  ]}>
                    {attendee.is_admin === true 
                    ? "OK" 
                    : "Share My Information"}
                  </ThemedText>
                </Pressable>
                
                {attendee.is_admin === false && 
                <Pressable
                  style={[
                    styles.button,
                    styles.secondaryButton,
                    { backgroundColor: Colors[colorScheme].tabIconDefault }
                  ]}
                  onPress={handleDontShareClick}
                >
                  <ThemedText style={[
                    styles.buttonText,
                    { color: Colors[colorScheme].background }
                  ]}>
                    Don&apos;t Share My Information
                  </ThemedText>
                </Pressable>
                }
              </ThemedView>
            </>
          ) : (
            // Step 2: Additional information input
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <ThemedText type="title" style={styles.title}>
                Additional Information
              </ThemedText>
              
              <ThemedText style={styles.message}>
                {attendee.is_admin === true 
                ? "Optionally, you can add more details below."
                : "Great! Your contact information will be shared. Optionally, you can add more details below."}
              </ThemedText>

              <ThemedView style={[
                styles.additionalInfoContainer,
                { backgroundColor: Colors[colorScheme].background }
              ]}>
                <ThemedText style={styles.additionalInfoLabel}>
                  Additional Information (Optional):
                </ThemedText>
                <ThemedText style={styles.additionalInfoDescription}>
                  Share anything else you&apos;d like other attendees to know (interests, projects, goals, etc.)
                </ThemedText>
                <ThemedTextInput
                  value={additionalInfo}
                  onChangeText={setAdditionalInfo}
                  placeholder="e.g., Interested in emergency management technology, looking to network with GIS professionals..."
                  multiline={true}
                  numberOfLines={4}
                  style={styles.textInput}
                  accessibilityLabel="Additional information input field"
                  accessibilityHint="Enter additional information you'd like to share with other attendees"
                />
              </ThemedView>

              {/* Action buttons */}
              <ThemedView style={styles.buttonContainer}>
                <Pressable
                  style={[
                    styles.button,
                    styles.primaryButton,
                    { backgroundColor: Colors[colorScheme].tint }
                  ]}
                  onPress={handleSaveWithAdditionalInfo}
                >
                  <ThemedText style={[
                    styles.buttonText,
                    { color: Colors[colorScheme].background }
                  ]}>
                    Save and Continue
                  </ThemedText>
                </Pressable>
                
                <Pressable
                  style={[
                    styles.button,
                    styles.secondaryButton,
                    { backgroundColor: Colors[colorScheme].tabIconDefault }
                  ]}
                  onPress={handleBackToChoice}
                >
                  <ThemedText style={[
                    styles.buttonText,
                    { color: Colors[colorScheme].background }
                  ]}>
                    Back
                  </ThemedText>
                </Pressable>
              </ThemedView>
            </ScrollView>
          )}
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
    maxHeight: '80%',
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
  scrollView: {
    maxHeight: '100%',
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
  infoContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoHeader: {
    marginBottom: 12,
    fontSize: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontWeight: '600',
    width: 100,
    fontSize: 14,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
  },
  changeText: {
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 14,
    opacity: 0.8,
    fontStyle: 'italic',
  },
  additionalInfoContainer: {
    marginBottom: 24,
    borderRadius: 12,
    padding: 16,
  },
  additionalInfoLabel: {
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 16,
  },
  additionalInfoDescription: {
    fontSize: 14,
    marginBottom: 12,
    opacity: 0.8,
    lineHeight: 18,
  },
  textInput: {
    minHeight: Platform.OS === 'ios' ? 80 : 70,
    textAlignVertical: 'top',
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
  primaryButton: {
    // Primary button styles already applied via backgroundColor
  },
  secondaryButton: {
    // Secondary button styles already applied via backgroundColor
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
}); 