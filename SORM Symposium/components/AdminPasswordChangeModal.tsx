import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { 
  evaluatePasswordStrength, 
  getPasswordStrengthColor, 
  validatePasswordsMatch, 
  validatePasswordDifferent,
  type PasswordStrengthResult 
} from '@/lib/passwordValidation';
import React, { useState, useEffect } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText } from './ThemedText';
import ThemedTextInput from './ThemedTextInput';
import { ThemedView } from './ThemedView';

interface AdminPasswordChangeModalProps {
  visible: boolean;
  onPasswordChanged: (oldPassword: string, newPassword: string) => Promise<void>;
  isChangingPassword: boolean;
  error: string;
}

/**
 * Modal component that forces admins to change their default password
 * Cannot be dismissed until password is successfully changed
 */
export default function AdminPasswordChangeModal({
  visible,
  onPasswordChanged,
  isChangingPassword,
  error
}: AdminPasswordChangeModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrengthResult | null>(null);
  const [showPasswords, setShowPasswords] = useState(false);

  // Reset state when modal becomes visible
  useEffect(() => {
    if (visible) {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordStrength(null);
      setShowPasswords(false);
    }
  }, [visible]);

  // Evaluate password strength when new password changes
  useEffect(() => {
    if (newPassword.length > 0) {
      setPasswordStrength(evaluatePasswordStrength(newPassword));
    } else {
      setPasswordStrength(null);
    }
  }, [newPassword]);

  const handleChangePassword = async () => {
    if (!canSubmit) return;
    
    try {
      await onPasswordChanged(oldPassword, newPassword);
    } catch (error) {
      // Error handling is managed by parent component
      console.error('Password change error:', error);
    }
  };

  // Validation checks
  const passwordsMatch = validatePasswordsMatch(newPassword, confirmPassword);
  const passwordDifferent = validatePasswordDifferent(oldPassword, newPassword);
  const passwordValid = passwordStrength?.isValid ?? false;
  const allFieldsFilled = oldPassword.length > 0 && newPassword.length > 0 && confirmPassword.length > 0;
  
  const canSubmit = allFieldsFilled && passwordsMatch && passwordDifferent && passwordValid && !isChangingPassword;

  // Get validation messages
  const getValidationMessage = (): string => {
    if (!allFieldsFilled) return '';
    if (!passwordDifferent) return 'New password must be different from current password';
    if (!passwordsMatch && confirmPassword.length > 0) return 'Passwords do not match';
    if (!passwordValid) return 'New password does not meet requirements';
    return '';
  };

  const validationMessage = getValidationMessage();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={() => {}} // Prevent closing
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
              Set New Password
            </ThemedText>
            
            <ThemedText style={styles.message}>
              You must set a new password before proceeding.
            </ThemedText>

            {/* Current Password Field */}
            <ThemedView style={[
              styles.inputContainer,
              { backgroundColor: Colors[colorScheme].background }
            ]}>
              <ThemedText style={styles.inputLabel}>Current Password</ThemedText>
              <ThemedTextInput
                value={oldPassword}
                onChangeText={setOldPassword}
                placeholder="Enter your current password"
                secureTextEntry={!showPasswords}
                style={styles.textInput}
                accessibilityLabel="Current password input field"
                autoComplete="current-password"
              />
            </ThemedView>

            {/* New Password Field */}
            <ThemedView style={[
              styles.inputContainer,
              { backgroundColor: Colors[colorScheme].background }
            ]}>
              <ThemedText style={styles.inputLabel}>New Password</ThemedText>
              <ThemedTextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter your new password"
                secureTextEntry={!showPasswords}
                style={styles.textInput}
                accessibilityLabel="New password input field"
                autoComplete="new-password"
              />
              
              {/* Password Strength Indicator */}
              {passwordStrength && (
                <ThemedView style={styles.strengthContainer}>
                  <ThemedView style={styles.strengthHeader}>
                    <ThemedText style={styles.strengthLabel}>
                      Password Strength: 
                    </ThemedText>
                    <ThemedText style={[
                      styles.strengthValue,
                      { color: getPasswordStrengthColor(passwordStrength.score) }
                    ]}>
                      {passwordStrength.label}
                    </ThemedText>
                  </ThemedView>
                  
                  {/* Strength Bar */}
                  <ThemedView style={styles.strengthBar}>
                    <ThemedView 
                      style={[
                        styles.strengthFill,
                        { 
                          width: `${(passwordStrength.score / 5) * 100}%`,
                          backgroundColor: getPasswordStrengthColor(passwordStrength.score)
                        }
                      ]}
                    />
                  </ThemedView>
                  
                  {/* Requirements Checklist */}
                  <ThemedView style={styles.requirementsContainer}>
                    {passwordStrength.requirements.map((req) => (
                      <ThemedView key={req.id} style={styles.requirementRow}>
                        <ThemedText style={[
                          styles.requirementIcon,
                          { color: req.met ? '#22c55e' : '#ef4444' }
                        ]}>
                          {req.met ? '✓' : '✗'}
                        </ThemedText>
                        <ThemedText style={[
                          styles.requirementText,
                          { opacity: req.met ? 1 : 0.6 }
                        ]}>
                          {req.label}
                        </ThemedText>
                      </ThemedView>
                    ))}
                  </ThemedView>
                </ThemedView>
              )}
            </ThemedView>

            {/* Confirm Password Field */}
            <ThemedView style={[
              styles.inputContainer,
              { backgroundColor: Colors[colorScheme].background }
            ]}>
              <ThemedText style={styles.inputLabel}>Confirm New Password</ThemedText>
              <ThemedTextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your new password"
                secureTextEntry={!showPasswords}
                style={styles.textInput}
                accessibilityLabel="Confirm password input field"
                autoComplete="new-password"
              />
            </ThemedView>

            {/* Validation Error */}
            {validationMessage ? (
              <ThemedText style={styles.validationError}>{validationMessage}</ThemedText>
            ) : null}

            {/* Show/Hide Passwords Toggle */}
            <Pressable
              style={styles.toggleContainer}
              onPress={() => setShowPasswords(!showPasswords)}
            >
              <ThemedText style={styles.toggleText}>
                {showPasswords ? 'Hide' : 'Show'} passwords
              </ThemedText>
            </Pressable>

            {/* API Error */}
            {error ? (
              <ThemedText style={styles.apiError}>{error}</ThemedText>
            ) : null}

            {/* Submit Button */}
            <ThemedView style={styles.buttonContainer}>
              <Pressable
                style={[
                  styles.button,
                  { 
                    backgroundColor: canSubmit 
                      ? Colors[colorScheme].adminButton 
                      : Colors[colorScheme].tabIconDefault,
                    borderColor: Colors[colorScheme].tint,
                    opacity: canSubmit ? 1 : 0.6
                  }
                ]}
                onPress={handleChangePassword}
                disabled={!canSubmit}
              >
                <ThemedText type="defaultSemiBold" style={[
                  { color: Colors[colorScheme].adminButtonText }
                ]}>
                  {isChangingPassword ? 'Changing Password...' : 'Change Password'}
                </ThemedText>
              </Pressable>
            </ThemedView>

            <ThemedText style={styles.securityNote}>
              This action is required for security. You will not be able to access admin features until you set a new password.
            </ThemedText>
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
    maxHeight: '90%',
    minHeight: 400,
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
    marginBottom: 24,
    lineHeight: 22,
  },
  inputContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  inputLabel: {
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 14,
  },
  textInput: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  strengthContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  strengthHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  strengthLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  strengthValue: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  strengthBar: {
    height: 6,
    backgroundColor: '#e5e5e5',
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 3,
  },
  requirementsContainer: {
    gap: 4,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requirementIcon: {
    fontSize: 14,
    fontWeight: 'bold',
    width: 20,
  },
  requirementText: {
    fontSize: 12,
    flex: 1,
  },
  toggleContainer: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  toggleText: {
    fontSize: 14,
    color: '#0066cc',
    textDecorationLine: 'underline',
    marginLeft: 10,
  },
  validationError: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  apiError: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  securityNote: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
    fontStyle: 'italic',
  },
});
