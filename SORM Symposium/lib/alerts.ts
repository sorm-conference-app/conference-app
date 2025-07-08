import { Alert, Platform } from 'react-native';

/**
 * Shows a success message using platform-specific methods
 * @param message - The success message to display
 */
export function showSuccessMessage(message: string) {
  if (Platform.OS === 'web') {
    // For web, use a simple window.alert
    window.alert(message);
  } else {
    // For mobile, use the native Alert component
    Alert.alert("Success", message);
  }
}

/**
 * Shows an error message using platform-specific methods
 * @param message - The error message to display
 */
export function showErrorMessage(message: string) {
  if (Platform.OS === 'web') {
    // For web, use a simple window.alert
    window.alert(message);
  } else {
    // For mobile, use the native Alert component
    Alert.alert("Error", message);
  }
}

/**
 * Shows a general message using platform-specific methods
 * @param message - The message to display
 */
export function showMessage(message: string) {
  if (Platform.OS === 'web') {
    // For web, use a simple window.alert
    window.alert(message);
  } else {
    // For mobile, use the native Alert component
    Alert.alert("Message", message);
  }
}

/**
 * Shows a confirmation dialog with custom buttons
 * @param title - The title of the dialog
 * @param message - The message to display
 * @param buttons - Array of button configurations
 * @param options - Additional options for the alert
 */
export function showConfirmation(
  title: string,
  message: string,
  buttons: Array<{
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>,
  options?: {
    cancelable?: boolean;
  }
) {
  if (Platform.OS === 'web') {
    // For web, use a simple confirm dialog
    const result = window.confirm(`${title}\n\n${message}`);
    if (result) {
      // Find the first non-cancel button and call its onPress
      const confirmButton = buttons.find(btn => btn.style !== 'cancel');
      confirmButton?.onPress?.();
    } else {
      // Find the cancel button and call its onPress
      const cancelButton = buttons.find(btn => btn.style === 'cancel');
      cancelButton?.onPress?.();
    }
  } else {
    // For mobile, use the native Alert component
    Alert.alert(title, message, buttons, options);
  }
} 