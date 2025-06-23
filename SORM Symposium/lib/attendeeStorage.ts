import AsyncStorage from '@react-native-async-storage/async-storage';

const VERIFIED_EMAILS_KEY = 'verified_attendee_emails';

/**
 * Store a verified email in local storage
 * @param email - The email to mark as verified on this device
 */
export async function storeVerifiedEmail(email: string): Promise<void> {
  try {
    const verifiedEmails = await getVerifiedEmails();
    if (!verifiedEmails.includes(email.toLowerCase())) {
      verifiedEmails.push(email.toLowerCase());
      await AsyncStorage.setItem(VERIFIED_EMAILS_KEY, JSON.stringify(verifiedEmails));
    }
  } catch (error) {
    console.error('Error storing verified email:', error);
    throw error;
  }
}

/**
 * Get all verified emails from local storage
 * @returns Array of verified email addresses
 */
export async function getVerifiedEmails(): Promise<string[]> {
  try {
    const verifiedEmailsJson = await AsyncStorage.getItem(VERIFIED_EMAILS_KEY);
    return verifiedEmailsJson ? JSON.parse(verifiedEmailsJson) : [];
  } catch (error) {
    console.error('Error getting verified emails:', error);
    return [];
  }
}

/**
 * Check if an email is verified on this device
 * @param email - The email to check
 * @returns True if the email is verified on this device
 */
export async function isEmailVerifiedLocally(email: string): Promise<boolean> {
  try {
    const verifiedEmails = await getVerifiedEmails();
    return verifiedEmails.includes(email.toLowerCase());
  } catch (error) {
    console.error('Error checking local email verification:', error);
    return false;
  }
}

/**
 * Clear all verified emails from local storage
 */
export async function clearVerifiedEmails(): Promise<void> {
  try {
    await AsyncStorage.removeItem(VERIFIED_EMAILS_KEY);
  } catch (error) {
    console.error('Error clearing verified emails:', error);
    throw error;
  }
} 