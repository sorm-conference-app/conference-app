import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { checkMultipleFields } from '@/lib/wordFilter';
import type { Attendee } from '@/services/attendees';
import React, { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText } from '../ThemedText';
import ThemedTextInput from '../ThemedTextInput';
import { ThemedView } from '../ThemedView';

interface ContactSharingModalProps {
  visible: boolean;
  attendee: Attendee | null;
  onDontShare: (additionalInfo: string, name?: string, organization?: string, title?: string) => void;
  onShare: (additionalInfo: string, name?: string, organization?: string, title?: string) => void;
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
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [title, setTitle] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [filterError, setFilterError] = useState('');

  // Reset state when modal becomes visible
  useEffect(() => {
    if (visible && attendee) {
      setStep('choice');
      setName(attendee.name || '');
      setOrganization(attendee.organization || '');
      setTitle(attendee.title || '');
      setAdditionalInfo(attendee.additional_info || '');
      setFilterError('');
    }
  }, [visible, attendee]);

  /**
   * Check all fields for inappropriate content
   * @returns True if content is appropriate, false if filtered content found
   */
  const validateContent = (): boolean => {
    const fields = {
      name: name,
      organization: organization,
      title: title,
      'additional information': additionalInfo,
    };

    const result = checkMultipleFields(fields);
    
    if (result.isFiltered) {
      const fieldNames = result.fieldsWithIssues.join(', ');
      setFilterError(`Please remove inappropriate content from: ${fieldNames}`);
      return false;
    }
    
    setFilterError('');
    return true;
  };

  const handleDontShareClick = () => {
    if (!validateContent()) {
      return;
    }
    onDontShare(additionalInfo, name, organization, title);
  };

  const handleShareClick = () => {
    if (!validateContent()) {
      return;
    }
    setStep('additional-info');
  };

  const handleSaveWithAdditionalInfo = () => {
    if (!validateContent()) {
      return;
    }
    onShare(additionalInfo, name, organization, title);
  };

  const handleBackToChoice = () => {
    setStep('choice');
    setFilterError(''); // Clear error when going back
  };

  if (!attendee) return null;

  return (
    <View>
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
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
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
                <ThemedView style={[styles.infoRow, { flexWrap: 'wrap' }]}>
                  <ThemedText type="subtitle" style={styles.infoHeader}>Your Information:  </ThemedText>
                  <ThemedText type="default" style={[{ textAlign: 'center', minWidth: 200, marginBottom: 10 }]}>{attendee.email}</ThemedText>
                </ThemedView>

                <ThemedView style={styles.infoRow}>
                  <ThemedText style={styles.infoLabel}>Name:</ThemedText>
                  <ThemedTextInput 
                    style={styles.infoInput}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your name"
                    accessibilityLabel="Name"
                  />
                </ThemedView>
                
                <ThemedView style={styles.infoRow}>
                  <ThemedText style={styles.infoLabel}>Organization:</ThemedText>
                  <ThemedTextInput 
                    style={styles.infoInput}
                    value={organization}
                    onChangeText={setOrganization}
                    placeholder="Enter your organization"
                    accessibilityLabel="Organization"
                  />
                </ThemedView>
                
                <ThemedView style={styles.infoRow}>
                  <ThemedText style={styles.infoLabel}>Title:</ThemedText>
                  <ThemedTextInput 
                    style={styles.infoInput}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Enter your title"
                    accessibilityLabel="Title"
                  />
                </ThemedView>
              </ThemedView>

              <ThemedText style={styles.changeText}>
                {attendee.is_admin === false 
                && "You can change this setting later."}
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
                  <ThemedText type="defaultSemiBold" style={[
                    { color: Colors[colorScheme].background }
                  ]}>
                    {attendee.is_admin === true 
                    ? "OK" 
                    : "Share My Information"}
                  </ThemedText>
                </Pressable>
                
                {attendee.is_admin === false ? (
                <Pressable
                  style={[
                    styles.button,
                    styles.secondaryButton,
                    { backgroundColor: Colors[colorScheme].tabIconDefault }
                  ]}
                  onPress={handleDontShareClick}
                >
                  <ThemedText type="defaultSemiBold" style={[
                    { color: Colors[colorScheme].background }
                  ]}>
                    Don&apos;t Share My Information
                  </ThemedText>
                </Pressable>
                ) : null}
              </ThemedView>

              {/* Filter error message */}
              {filterError ? (
                <ThemedText style={styles.filterError}>{filterError}</ThemedText>
              ) : null}
            </ScrollView>
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
                  <ThemedText type="defaultSemiBold" style={[
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
                  <ThemedText type="defaultSemiBold" style={[
                    { color: Colors[colorScheme].background }
                  ]}>
                    Back
                  </ThemedText>
                </Pressable>
              </ThemedView>

              {/* Filter error message */}
              {filterError ? (
                <ThemedText style={styles.filterError}>{filterError}</ThemedText>
              ) : null}
            </ScrollView>
          )}
        </ThemedView>
      </ThemedView>
    </Modal>
    </View>
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
    maxHeight: '85%',
    minHeight: 200,
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
  infoInput: {
    flex: 1,
    fontSize: 14,
    padding: 5,
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
  filterError: {
    color: 'red',
    textAlign: 'center',
    marginTop: 12,
    fontSize: 14,
  },
}); 