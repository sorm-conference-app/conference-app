import useSupabaseAuth from '@/hooks/useSupabaseAuth';
import {
  getAttendeeByContact,
  shouldShowContactSharingPopup,
  updateContactSharingPreferences,
  type Attendee
} from '@/services/attendees';
import { useCallback, useState } from 'react';

interface UseContactSharingModalReturn {
  isVisible: boolean;
  attendee: Attendee | null;
  showModal: (contact?: string) => Promise<boolean>;
  showModalForce: (contact?: string) => Promise<void>;
  hideModal: () => void;
  savePreferences: (shareInfo: boolean, additionalInfo: string, name?: string, organization?: string, title?: string) => Promise<void>;
}

/**
 * Custom hook for managing the contact sharing modal
 * @returns Object containing modal state and control functions
 */
export function useContactSharingModal(): UseContactSharingModalReturn {
  const [isVisible, setIsVisible] = useState(false);
  const [attendee, setAttendee] = useState<Attendee | null>(null);
  const session = useSupabaseAuth();

  /**
   * Get the current user's contact info (email or phone)
   */
  const getCurrentUserContact = useCallback((): string | null => {
    if (session?.user?.email) {
      return session.user.email;
    } else if (session?.user?.phone) {
      return session.user.phone;
    }
    return null;
  }, [session]);

  /**
   * Check if modal should be shown for the given contact and show it if needed
   * @param contact - The attendee's email or phone (optional, uses authenticated user if not provided)
   * @returns True if modal was shown, false otherwise
   */
  const showModal = useCallback(async (contact?: string): Promise<boolean> => {
    try {
      const userContact = contact || getCurrentUserContact();
      if (!userContact) {
        console.warn('No contact available for showing contact sharing modal');
        return false;
      }

      // Check if popup should be shown for both email and phone users
      const shouldShow = await shouldShowContactSharingPopup(userContact);
      
      if (shouldShow) {
        const attendeeData = await getAttendeeByContact(userContact);
        if (attendeeData) {
          setAttendee(attendeeData);
          setIsVisible(true);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking if contact sharing modal should be shown:', error);
      return false;
    }
  }, [getCurrentUserContact]);

  /**
   * Force show the modal for the given contact (even if they've seen it before)
   * Useful for settings or manual triggers
   * @param contact - The attendee's email or phone (optional, uses authenticated user if not provided)
   */
  const showModalForce = useCallback(async (contact?: string): Promise<void> => {
    try {
      const userContact = contact || getCurrentUserContact();
      if (!userContact) {
        throw new Error('No contact available for showing contact sharing modal');
      }

      const attendeeData = await getAttendeeByContact(userContact);
      if (attendeeData) {
        setAttendee(attendeeData);
        setIsVisible(true);
      }
    } catch (error) {
      console.error('Error forcing contact sharing modal to show:', error);
      throw error;
    }
  }, [getCurrentUserContact]);

  /**
   * Hide the modal and reset state
   */
  const hideModal = useCallback(() => {
    setIsVisible(false);
    setAttendee(null);
  }, []);

  /**
   * Save the attendee's contact sharing preferences
   * @param shareInfo - Whether they want to share their info
   * @param additionalInfo - Additional information they want to share
   * @param name - Updated name value
   * @param organization - Updated organization value
   * @param title - Updated title value
   */
  const savePreferences = useCallback(async (shareInfo: boolean, additionalInfo: string, name?: string, organization?: string, title?: string) => {
    const userContact = getCurrentUserContact();
    if (!userContact) {
      throw new Error('No user contact available for saving preferences');
    }

    try {
      await updateContactSharingPreferences(userContact, shareInfo, additionalInfo, name, organization, title);
    } catch (error) {
      console.error('Error saving contact sharing preferences:', error);
      throw error;
    }
  }, [getCurrentUserContact]);

  return {
    isVisible,
    attendee,
    showModal,
    showModalForce,
    hideModal,
    savePreferences,
  };
}

/**
 * Convenience function to show the contact sharing modal for any contact
 * This can be used by other team members working on different features
 * @param contact - The attendee's email or phone
 * @returns Promise that resolves when the modal operations are complete
 */
export async function triggerContactSharingModal(contact: string): Promise<void> {
  try {
    const attendeeData = await getAttendeeByContact(contact);
    if (!attendeeData) {
      throw new Error('Attendee not found');
    }
    
    // This would need to be integrated with a global modal system
    // For now, this is just a helper that other developers can use
    // console.log('Contact sharing modal should be triggered for:', contact);
    
    // The actual implementation would depend on how the other team member
    // wants to integrate this into their feature
  } catch (error) {
    console.error('Error triggering contact sharing modal:', error);
    throw error;
  }
} 